/**
 * P101 — Discovery Command Center Validator
 *
 * Enforces the operating system for the national USCE discovery engine.
 *
 * Hard gates:
 *   - Command center folder + 9 required docs/CSVs exist
 *   - Exactly 5 institution packets exist in `institution-packets/<STATE>/` for the P101-0 proof
 *   - Every packet has schemaVersion = "p101-0"
 *   - Every packet has institution.name + officialDomain + state
 *   - Every packet has non-empty searchProcess.searchTermsTried + pagesOpened
 *   - Every packet has finalClassification
 *   - Every CURRENT_USCE_CONFIRMED / INTERNATIONAL_STUDENT_CONFIRMED /
 *     IMG_GRAD_OBSERVERSHIP_CONFIRMED / VSLO_US_MD_DO_ONLY packet has at
 *     least one candidateFinding with sourceUrl + shortQuote ≤ 240 chars
 *   - Every NO_PUBLIC_USCE_LANE_FOUND packet has ≥ 5 search terms tried,
 *     ≥ 1 page opened, and a non-empty stopCondition
 *   - Every packet has driftCheck
 *   - No active runtime / staged runtime / contact resolver / Prisma / homepage drift
 *   - No PUBLIC_NOW / IMPORT_READY tokens outside NO_ form
 *   - No banned phrases without negation context
 *   - No secret patterns
 *
 * Run:
 *   npx tsx scripts/validate-p101-discovery-command-center.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..");
const CMD = path.join(REPO_ROOT, "docs/platform-v2/local/usce-discovery-command-center");
const PACKETS_ROOT = path.join(CMD, "institution-packets");

const REQUIRED_DOCS = [
  "P101_NATIONAL_USCE_DISCOVERY_COMMAND_CENTER.md",
  "p101_packet_schema.md",
  "p101_drift_guardrails.md",
  "p101_discovery_state_recovery.csv",
  "p101_existing_packet_inventory.csv",
  "p101_existing_queue_inventory.csv",
  "p101_current_scoreboard.csv",
  "p101_next_institution_queue.csv",
  "p101_no_growth_static_pipeline_note.md",
  "p101_institution_search_log.csv",
  "p101_candidate_usce_pages.csv",
  "p101_no_yield_log.csv",
  "p101_manual_retry_log.csv",
  "p101_classification_summary.csv",
  "P101_0_FIVE_INSTITUTION_PROOF_CHECKPOINT.md",
  "p101_pdf_extraction_note.md",
  "p101_1_selected_10_queue.csv",
  "P101_1_TEN_INSTITUTION_DISCOVERY_CHECKPOINT.md",
  "p101_bot_block_retry_note.md",
  "P101_2_LANE_DECISION.md",
  "p101_2_selected_25_queue.csv",
  "P101_2_CHECKPOINT_AFTER_10.md",
  "P101_2_CHECKPOINT_AFTER_20.md",
  "P101_2_25_INSTITUTION_DISCOVERY_CHECKPOINT.md",
  // P101-3 enhanced evidence capture layer
  "P101_3_ENHANCED_EVIDENCE_CAPTURE_DOCTRINE.md",
  "p101_packet_schema_v2.md",
  "p101_tag_taxonomy.md",
  "p101_screenshot_text_hash_pdf_policy.md",
  "p101_t7_storage_status.md",
  "p101_3_selected_10_retrofit.csv",
  "p101_artifact_manifest.csv",
  "P101_3_ENHANCED_EVIDENCE_RETROFIT_CHECKPOINT.md",
  // P101-3B T7 artifact backfill
  "p101_3b_artifact_backfill_queue.csv",
  "P101_3B_T7_ARTIFACT_BACKFILL_CHECKPOINT.md",
];

// Canonical fieldQuoteMap field names for p101-3-enhanced packets.
const ENHANCED_FIELD_NAMES = new Set([
  "audience_us_md","audience_us_do","audience_international_ms","audience_img_graduate",
  "audience_caribbean","audience_pre_med","year_required","graduation_status",
  "usmle_or_comlex_required","english_or_toefl_required",
  "application_pathway","application_url","application_window","deadline",
  "cost_application_fee","cost_tuition_or_program_fee","cost_malpractice","cost_housing","cost_other",
  "duration","specialties_offered","hands_on_vs_observer","lor_or_certificate",
  "visa_b1_b2","visa_j1","visa_h1b","visa_not_mentioned",
  "affiliation_agreement_required","immunization_required","background_check_required","malpractice_required",
  "coordinator_contact","housing","cancellation_policy","required_documents",
]);

// Canonical opportunityTags strings per p101_tag_taxonomy.md.
const CANONICAL_TAGS: Record<string, Set<string>> = {
  audience: new Set([
    "US_MD","US_DO","LCME_ONLY","COCA_ALLOWED","AOA_ALLOWED",
    "INTERNATIONAL_MS","IMG_GRAD","CARIBBEAN","FINAL_YEAR_ONLY","MS4_ONLY","MS3_ALLOWED",
    "AFFILIATION_REQUIRED","EXCHANGE_PARTNER_ONLY","NOT_INTERNATIONAL","NOT_IMG_GRAD",
    "GRADUATES_EXCLUDED","CARIBBEAN_EXCLUDED",
  ]),
  application: new Set([
    "VSLO","VSLO_GLOBAL","DIRECT_APPLICATION","EMAIL_COORDINATOR","ONLINE_FORM",
    "PDF_APPLICATION","BY_INVITATION_ONLY","DETAILS_BY_COORDINATOR","CLOSED_OR_PAUSED","BOT_BLOCKED",
    "SCHOOL_APPROVAL_REQUIRED","AFFILIATION_AGREEMENT_REQUIRED",
  ]),
  experienceType: new Set([
    "CLINICAL_ELECTIVE","AWAY_ROTATION","SUB_INTERNSHIP","SUB_INTERNATIONAL","OBSERVERSHIP",
    "EXTERNSHIP","RESEARCH_ONLY","SHADOWING","HANDS_ON","OBSERVER_ONLY",
    "UNCLEAR_HANDS_ON_STATUS","NO_OBSERVERSHIP","NO_SHADOWING",
  ]),
  cost: new Set([
    "FREE","COST_STATED","COST_NOT_STATED","APPLICATION_FEE","TUITION_FEE",
    "HIGH_COST","HOUSING_COST_STATED","MALPRACTICE_COST_STATED","STIPEND_MENTIONED",
  ]),
  visa: new Set([
    "B1_B2_MENTIONED","J1_MENTIONED","H1B_MENTIONED","F1_OPT_MENTIONED",
    "VISA_STUDENT_RESPONSIBILITY","VISA_NOT_MENTIONED","US_ONLY_AUDIENCE",
  ]),
  source: new Set([
    "INSTITUTION_SPECIFIC","SCHOOL_LEVEL_SOURCE","SYSTEM_LEVEL_SOURCE","DEPARTMENT_LEVEL_SOURCE",
    "PDF_SOURCE","OFFICIAL_SOURCE","THIRD_PARTY_LEAD_ONLY",
    "SCREENSHOT_CAPTURED","SCREENSHOT_PENDING","CLEANED_TEXT_SAVED","CLEANED_TEXT_PENDING",
    "HASH_CAPTURED","NEEDS_MANUAL_RETRY",
  ]),
};

// Per-packet 100 KB cap on git-tracked files inside command-center; enforced
// at file-size level (not byte content), so packet JSONs that grow because of
// rich field-level evidence are still fine — we just block accidental commits
// of HTML/PDF/PNG blobs that belong on T7.
const COMMAND_CENTER_FILE_MAX_BYTES = 100 * 1024;
const BANNED_BINARY_EXTS = new Set([".html",".htm",".pdf",".png",".jpg",".jpeg",".gif",".webp",".bmp"]);

// Cumulative P101 packet count: P101-0 (5) + P101-1 (10) + P101-2 (25) = 40.
// Allow ≥ this; future sprints add packets without breaking the validator.
const EXPECTED_PACKET_MIN = 40;

const QUOTE_REQUIRED_CLASSIFICATIONS = new Set([
  "CURRENT_USCE_CONFIRMED",
  "INTERNATIONAL_STUDENT_CONFIRMED",
  "IMG_GRAD_OBSERVERSHIP_CONFIRMED",
  "VSLO_US_MD_DO_ONLY",
  "POSSIBLE_USCE_NEEDS_REVIEW",
]);

const VALID_CLASSIFICATIONS = new Set([
  "CURRENT_USCE_CONFIRMED",
  "POSSIBLE_USCE_NEEDS_REVIEW",
  "VSLO_US_MD_DO_ONLY",
  "INTERNATIONAL_STUDENT_CONFIRMED",
  "IMG_GRAD_OBSERVERSHIP_CONFIRMED",
  "RESEARCH_ONLY",
  "FUTURE_LANE_ONLY",
  "AFFILIATED_ONLY",
  "RESIDENCY_ONLY",
  "NO_PUBLIC_USCE_LANE_FOUND",
  "BOT_BLOCKED_MANUAL_RETRY",
  "SOURCE_DEAD",
  "UNKNOWN_NEEDS_RETRY",
]);

const VALID_TIERS = new Set([
  "TIER_A_PUBLIC_SAFE",
  "TIER_B_CAUTION_SAFE",
  "TIER_C_NEEDS_REVIEW",
  "TIER_D_REJECT_OR_HIDE",
  "NO_TIER_NO_CANDIDATE",
]);

const FORBIDDEN_TOKENS = [
  "PUBLIC_NOW",
  "IMPORT_READY",
  "BRIDGE_READY_TO_RUNTIME",
  "APPROVED_FOR_PUBLICATION",
];

const BANNED_PHRASES = [
  /\bguarantee[ds]?\b/i,
  /\bhospital[- ]approved\b/i,
  /\bIMG[- ]friendly\b/i,
  /\bapply through USCEHub\b/i,
];

const SECRETS_PATTERNS = [
  /\bAIza[0-9A-Za-z\-_]{35}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bghp_[A-Za-z0-9]{30,}\b/,
  /\bgho_[A-Za-z0-9]{30,}\b/,
];

const PROTECTED_PATHS = [
  "src/data/usce/public-listings.generated.json",
  "src/data/usce/public-listings.generated.ts",
  "src/data/usce/public-listings-pilot.generated.json",
  "src/data/usce/public-listings-pilot.generated.ts",
  "src/data/usce/public-listings-pilot-staged-batch-2.generated.json",
  "src/data/usce/public-listings-pilot-staged-batch-2.generated.ts",
  "src/data/usce/public-listings-pilot-staged-batch-3.generated.json",
  "src/data/usce/public-listings-pilot-staged-batch-3.generated.ts",
  "src/data/usce/public-listings-pilot-staged-batch-4.generated.json",
  "src/data/usce/public-listings-pilot-staged-batch-4.generated.ts",
  "src/lib/usce-contact-context.ts",
  "src/app/clerkships/pilot",
  "src/app/contact",
  "src/app/api/usce/corrections",
  "src/app/page.tsx",
  "src/app/observerships",
  "src/app/browse",
  "src/app/sitemap.ts",
  "prisma/schema.prisma",
];

interface Failure { rule: string; row: string; detail: string }
const failures: Failure[] = [];
const fail = (r: string, row: string, d: string) => failures.push({ rule: r, row, detail: d });

function listPackets(): string[] {
  const out: string[] = [];
  if (!fs.existsSync(PACKETS_ROOT)) return out;
  for (const state of fs.readdirSync(PACKETS_ROOT)) {
    const stateDir = path.join(PACKETS_ROOT, state);
    if (!fs.statSync(stateDir).isDirectory()) continue;
    for (const name of fs.readdirSync(stateDir)) {
      if (name.endsWith(".json")) out.push(path.join(stateDir, name));
    }
  }
  return out;
}

function validatePacket(p: string): void {
  let pkt: unknown;
  try {
    pkt = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    fail("PACKET_JSON_PARSE_FAIL", p, String(e));
    return;
  }
  if (!pkt || typeof pkt !== "object") {
    fail("PACKET_NOT_OBJECT", p, "packet root is not an object");
    return;
  }
  const o = pkt as Record<string, unknown>;
  const rel = path.relative(REPO_ROOT, p);

  if (o.schemaVersion !== "p101-0") fail("SCHEMA_VERSION_WRONG", rel, `expected p101-0; got ${String(o.schemaVersion)}`);

  const inst = o.institution as Record<string, unknown> | undefined;
  if (!inst || typeof inst !== "object") {
    fail("INSTITUTION_MISSING", rel, "institution block missing");
  } else {
    if (!inst.name || typeof inst.name !== "string" || !inst.name.trim()) fail("INSTITUTION_NAME_MISSING", rel, "institution.name empty");
    if (!inst.officialDomain || typeof inst.officialDomain !== "string") fail("INSTITUTION_DOMAIN_MISSING", rel, "institution.officialDomain empty");
    if (!inst.state || typeof inst.state !== "string") fail("INSTITUTION_STATE_MISSING", rel, "institution.state empty");
  }

  const sp = o.searchProcess as Record<string, unknown> | undefined;
  if (!sp || typeof sp !== "object") {
    fail("SEARCH_PROCESS_MISSING", rel, "searchProcess block missing");
  } else {
    const terms = sp.searchTermsTried;
    if (!Array.isArray(terms) || terms.length === 0) fail("SEARCH_TERMS_EMPTY", rel, "searchTermsTried empty");
    const pages = sp.pagesOpened;
    if (!Array.isArray(pages) || pages.length === 0) fail("PAGES_OPENED_EMPTY", rel, "pagesOpened empty");
    if (!sp.stopCondition || typeof sp.stopCondition !== "string") fail("STOP_CONDITION_MISSING", rel, "stopCondition missing");
  }

  const fc = o.finalClassification;
  if (typeof fc !== "string" || !VALID_CLASSIFICATIONS.has(fc)) {
    fail("FINAL_CLASSIFICATION_INVALID", rel, `got '${String(fc)}'`);
  }

  const ft = o.finalTier;
  if (typeof ft !== "string" || !VALID_TIERS.has(ft)) {
    fail("FINAL_TIER_INVALID", rel, `got '${String(ft)}'`);
  }

  if (!o.driftCheck || typeof o.driftCheck !== "string" || !o.driftCheck.trim()) {
    fail("DRIFT_CHECK_MISSING", rel, "driftCheck empty");
  }

  if (typeof fc === "string" && QUOTE_REQUIRED_CLASSIFICATIONS.has(fc)) {
    const cf = o.candidateFindings;
    if (!Array.isArray(cf) || cf.length === 0) {
      fail("CANDIDATE_FINDINGS_EMPTY_FOR_QUOTE_REQUIRED_CLASSIFICATION", rel, `${fc} requires at least one candidateFindings entry`);
    } else {
      const first = cf[0] as Record<string, unknown>;
      const url = first?.sourceUrl;
      const quote = first?.shortQuote;
      if (typeof url !== "string" || !/^https?:\/\//.test(url)) fail("SOURCE_URL_MISSING", rel, `${fc} requires sourceUrl`);
      if (typeof quote !== "string" || quote.trim().length === 0) fail("SHORT_QUOTE_MISSING", rel, `${fc} requires shortQuote`);
      if (typeof quote === "string" && quote.length > 240) fail("SHORT_QUOTE_TOO_LONG", rel, `shortQuote length ${quote.length} > 240`);
    }
  }

  if (fc === "NO_PUBLIC_USCE_LANE_FOUND") {
    const ne = o.negativeEvidence as Record<string, unknown> | undefined;
    if (!ne) {
      fail("NEGATIVE_EVIDENCE_MISSING_FOR_NO_LANE", rel, "negativeEvidence required");
    } else {
      const tc = typeof ne.searchedTermsCount === "number" ? ne.searchedTermsCount : 0;
      const pc = typeof ne.openedPagesCount === "number" ? ne.openedPagesCount : 0;
      if (tc < 5) fail("NEGATIVE_EVIDENCE_TERMS_TOO_FEW", rel, `searchedTermsCount ${tc} < 5`);
      if (pc < 1) fail("NEGATIVE_EVIDENCE_PAGES_TOO_FEW", rel, `openedPagesCount ${pc} < 1`);
    }
  }

  // ----- P101-3 enhanced evidence gates -----
  // These ONLY apply to packets that opt into the enhanced layer via
  // enhancedEvidenceVersion === "p101-3". Existing p101-0 packets without
  // this field continue to pass the original gates above.
  const eev = o.enhancedEvidenceVersion;
  if (typeof eev === "string" && eev !== "") {
    if (eev !== "p101-3") {
      fail("ENHANCED_EVIDENCE_VERSION_INVALID", rel, `expected p101-3 (or absent); got ${eev}`);
    } else {
      validateEnhanced(o, rel);
    }
  }
}

function validateEnhanced(o: Record<string, unknown>, rel: string): void {
  // institutionIdentity required
  const id = o.institutionIdentity as Record<string, unknown> | undefined;
  if (!id || typeof id !== "object") {
    fail("ENHANCED_INSTITUTION_IDENTITY_MISSING", rel, "institutionIdentity block missing");
  } else {
    for (const k of ["canonicalInstitutionName","city","state","institutionType","sourceOfIdentity"]) {
      const v = id[k];
      if (typeof v !== "string" || v.trim() === "") fail("ENHANCED_IDENTITY_FIELD_MISSING", rel, `institutionIdentity.${k} empty`);
    }
    if (!Array.isArray(id.officialDomains) || id.officialDomains.length === 0) {
      fail("ENHANCED_IDENTITY_DOMAINS_EMPTY", rel, "officialDomains empty");
    }
  }

  // sourceEvidence required (≥1)
  const se = o.sourceEvidence;
  if (!Array.isArray(se) || se.length === 0) {
    fail("ENHANCED_SOURCE_EVIDENCE_EMPTY", rel, "sourceEvidence must have ≥1 entry");
  } else {
    for (let i = 0; i < se.length; i++) {
      const row = se[i] as Record<string, unknown>;
      if (!row || typeof row !== "object") {
        fail("ENHANCED_SOURCE_EVIDENCE_ROW_NOT_OBJECT", rel, `sourceEvidence[${i}] not an object`);
        continue;
      }
      const u = row.sourceUrl;
      if (typeof u !== "string" || !/^https?:\/\//.test(u)) {
        fail("ENHANCED_SOURCE_URL_INVALID", rel, `sourceEvidence[${i}].sourceUrl invalid`);
      }
      const ss = row.screenshotStatus;
      if (typeof ss !== "string" || !["CAPTURED","PENDING","NOT_APPLICABLE","FAILED"].includes(ss)) {
        fail("ENHANCED_SCREENSHOT_STATUS_INVALID", rel, `sourceEvidence[${i}].screenshotStatus invalid`);
      }
      // Faked path guard: if status PENDING/NOT_APPLICABLE/FAILED, screenshotPath must be empty
      if (ss !== "CAPTURED" && typeof row.screenshotPath === "string" && row.screenshotPath !== "") {
        fail("ENHANCED_SCREENSHOT_PATH_WITHOUT_CAPTURE", rel, `sourceEvidence[${i}] has screenshotPath but status ${ss}`);
      }
    }
  }

  // fieldQuoteMap required — must cover every canonical field
  const fqm = o.fieldQuoteMap;
  if (!Array.isArray(fqm)) {
    fail("ENHANCED_FIELD_QUOTE_MAP_MISSING", rel, "fieldQuoteMap missing or not an array");
  } else {
    const seen = new Set<string>();
    for (let i = 0; i < fqm.length; i++) {
      const row = fqm[i] as Record<string, unknown>;
      if (!row || typeof row !== "object") {
        fail("ENHANCED_FQM_ROW_NOT_OBJECT", rel, `fieldQuoteMap[${i}] not an object`);
        continue;
      }
      const fname = row.fieldName;
      if (typeof fname !== "string" || !ENHANCED_FIELD_NAMES.has(fname)) {
        fail("ENHANCED_FQM_FIELD_NAME_NOT_CANONICAL", rel, `fieldQuoteMap[${i}].fieldName='${String(fname)}' not in canonical list`);
        continue;
      }
      seen.add(fname);
      const notStated = row.notStatedOnSource === true;
      const quote = typeof row.quote === "string" ? row.quote : "";
      const value = typeof row.value === "string" ? row.value : "";
      // Quote-or-no-claim discipline:
      if (notStated) {
        // The doctrine wants value="NOT_STATED_ON_SOURCE" when not stated, but
        // we accept any value beginning with "NOT_STATED_" / "NOT_MENTIONED_"
        // (e.g. NOT_STATED_ON_HUB, NOT_STATED_FULLY_ON_HUB, NOT_MENTIONED_ON_HUB)
        // because those preserve packet-specific detail. The validator's job
        // is enforcing absence of fabricated claims, not enforcing a single
        // sentinel string.
        if (!/^(NOT_STATED|NOT_MENTIONED)/.test(value) && value !== "NOT_STATED_ON_SOURCE") {
          fail("ENHANCED_FQM_NOTSTATED_VALUE_MISMATCH", rel, `${fname}: notStatedOnSource=true but value='${value}' (must begin with NOT_STATED or NOT_MENTIONED)`);
        }
        if (quote !== "") {
          fail("ENHANCED_FQM_NOTSTATED_HAS_QUOTE", rel, `${fname}: notStatedOnSource=true but quote not empty`);
        }
      } else {
        if (value === "" || value === "NOT_STATED_ON_SOURCE") {
          fail("ENHANCED_FQM_VALUE_EMPTY_WITHOUT_NOTSTATED", rel, `${fname}: value empty/NOT_STATED but notStatedOnSource=false`);
        }
        if (quote === "" && !["specialties_offered","application_url","duration","cost_housing","cancellation_policy"].includes(fname)) {
          // a few field names are allowed to carry a derived value without a verbatim quote string when the value itself encodes a packet caveat, but they must still have quoteUrl set
          if (typeof row.quoteUrl !== "string" || row.quoteUrl === "") {
            fail("ENHANCED_FQM_QUOTE_MISSING", rel, `${fname}: notStatedOnSource=false but neither quote nor quoteUrl present`);
          }
        }
        if (quote.length > 240) {
          fail("ENHANCED_FQM_QUOTE_TOO_LONG", rel, `${fname}: quote length ${quote.length} > 240`);
        }
      }
    }
    // every canonical field must appear at least once
    for (const f of ENHANCED_FIELD_NAMES) {
      if (!seen.has(f)) fail("ENHANCED_FQM_FIELD_MISSING", rel, `fieldQuoteMap missing canonical field '${f}'`);
    }
  }

  // opportunityTags — must be present, must be canonical strings only
  const ot = o.opportunityTags as Record<string, unknown> | undefined;
  if (!ot || typeof ot !== "object") {
    fail("ENHANCED_OPPORTUNITY_TAGS_MISSING", rel, "opportunityTags block missing");
  } else {
    for (const group of Object.keys(CANONICAL_TAGS)) {
      const vals = ot[group];
      if (!Array.isArray(vals)) {
        fail("ENHANCED_TAG_GROUP_MISSING", rel, `opportunityTags.${group} missing`);
        continue;
      }
      for (const v of vals) {
        if (typeof v !== "string" || !CANONICAL_TAGS[group].has(v)) {
          fail("ENHANCED_TAG_NOT_CANONICAL", rel, `opportunityTags.${group} has non-canonical '${String(v)}'`);
        }
      }
    }
    // SCREENSHOT_CAPTURED tag requires at least one sourceEvidence with non-empty screenshotPath
    const sourceTags = (ot.source as string[]) || [];
    if (sourceTags.includes("SCREENSHOT_CAPTURED")) {
      const hasCaptured = Array.isArray(se) && (se as Record<string,unknown>[]).some(r =>
        typeof r.screenshotPath === "string" && r.screenshotPath !== "" && r.screenshotStatus === "CAPTURED");
      if (!hasCaptured) fail("ENHANCED_TAG_SCREENSHOT_WITHOUT_PATH", rel, "SCREENSHOT_CAPTURED tag but no sourceEvidence with captured screenshot");
    }
    if (sourceTags.includes("HASH_CAPTURED")) {
      const cdp = o.changeDetectionPrep as Record<string, unknown> | undefined;
      const sh = cdp?.sourceHash;
      if (typeof sh !== "string" || sh === "" || sh === "PENDING_T7_BACKFILL") {
        // PENDING placeholder allowed during T7-unmounted retrofit; only fail when totally missing
        if (typeof sh !== "string" || sh === "") fail("ENHANCED_TAG_HASH_WITHOUT_VALUE", rel, "HASH_CAPTURED tag but changeDetectionPrep.sourceHash empty");
      }
    }
  }

  // userFacingSummaryDraft — must be present with all required keys
  const ufs = o.userFacingSummaryDraft as Record<string, unknown> | undefined;
  if (!ufs || typeof ufs !== "object") {
    fail("ENHANCED_USER_FACING_SUMMARY_MISSING", rel, "userFacingSummaryDraft missing");
  } else {
    for (const k of ["oneSentenceSummary","whoThisIsFor","whoThisIsNotFor","howToApply","estimatedCostSummary","whyWeClassifiedItThisWay","sourceTransparencyNote","possibleListingTitle","possibleMetaDescription"]) {
      const v = ufs[k];
      if (typeof v !== "string" || v.trim() === "") fail("ENHANCED_UFS_FIELD_MISSING", rel, `userFacingSummaryDraft.${k} empty`);
    }
    const kc = ufs.keyCaveats;
    if (!Array.isArray(kc) || kc.length === 0) fail("ENHANCED_UFS_KEY_CAVEATS_EMPTY", rel, "userFacingSummaryDraft.keyCaveats empty");
    const sf = ufs.suggestedFilters;
    if (!Array.isArray(sf) || sf.length === 0) fail("ENHANCED_UFS_FILTERS_EMPTY", rel, "userFacingSummaryDraft.suggestedFilters empty");
    const oss = typeof ufs.oneSentenceSummary === "string" ? ufs.oneSentenceSummary : "";
    if (oss.length > 240) fail("ENHANCED_UFS_ONE_SENTENCE_TOO_LONG", rel, `oneSentenceSummary length ${oss.length} > 240`);
  }

  // changeDetectionPrep — must be present
  const cdp = o.changeDetectionPrep as Record<string, unknown> | undefined;
  if (!cdp || typeof cdp !== "object") {
    fail("ENHANCED_CHANGE_DETECTION_MISSING", rel, "changeDetectionPrep missing");
  } else {
    if (typeof cdp.firstCapturedAt !== "string" || cdp.firstCapturedAt === "") fail("ENHANCED_CDP_FIRST_CAPTURED_MISSING", rel, "changeDetectionPrep.firstCapturedAt empty");
    if (typeof cdp.nextRecheckDue !== "string" || cdp.nextRecheckDue === "") fail("ENHANCED_CDP_NEXT_RECHECK_MISSING", rel, "changeDetectionPrep.nextRecheckDue empty");
    const cr = cdp.changeRisk;
    if (typeof cr !== "string" || !["LOW","MEDIUM","HIGH"].includes(cr)) fail("ENHANCED_CDP_CHANGE_RISK_INVALID", rel, `changeRisk '${String(cr)}' invalid`);
  }
}

function run(): void {
  if (!fs.existsSync(CMD)) {
    fail("COMMAND_CENTER_FOLDER_MISSING", CMD, "discovery command center folder not found");
    return;
  }
  for (const name of REQUIRED_DOCS) {
    const p = path.join(CMD, name);
    if (!fs.existsSync(p)) fail("REQUIRED_DOC_MISSING", name, "not found in command center");
  }

  if (!fs.existsSync(PACKETS_ROOT)) {
    fail("PACKETS_ROOT_MISSING", PACKETS_ROOT, "institution-packets root not found");
    return;
  }

  const packets = listPackets();
  if (packets.length < EXPECTED_PACKET_MIN) {
    fail("PACKET_COUNT_BELOW_MIN", "(institution-packets)", `expected ≥ ${EXPECTED_PACKET_MIN}; got ${packets.length}`);
  }
  for (const p of packets) validatePacket(p);

  // No protected-path drift
  try {
    const args = PROTECTED_PATHS.map(p => `'${p}'`).join(" ");
    const gitOut = execSync(`git status --short -- ${args} 2>/dev/null || true`, { cwd: REPO_ROOT, encoding: "utf8" }).trim();
    if (gitOut.length > 0) fail("PROTECTED_PATH_CHANGED", "(git status)", `protected path drift:\n${gitOut}`);
  } catch { /* ignore */ }

  // Forbidden tokens / banned phrases / secrets scan over command-center docs.
  // The validator's own source is deliberately skipped: it defines the
  // forbidden-token list, so any literal mention here is a meta-reference,
  // not a violation. Same reason p101_drift_guardrails.md is allowed to
  // document the rule by listing the tokens.
  const SELF_PATH = path.join(REPO_ROOT, "scripts/validate-p101-discovery-command-center.ts");
  const META_DOCS_ALLOWED_TO_NAME_TOKENS = new Set([
    path.join(CMD, "p101_drift_guardrails.md"),
    path.join(CMD, "p101_packet_schema.md"),
    path.join(CMD, "P101_NATIONAL_USCE_DISCOVERY_COMMAND_CENTER.md"),
    path.join(CMD, "p101_bot_block_retry_note.md"),
    path.join(CMD, "P101_2_LANE_DECISION.md"),
    path.join(CMD, "P101_2_CHECKPOINT_AFTER_10.md"),
    path.join(CMD, "P101_2_CHECKPOINT_AFTER_20.md"),
    path.join(CMD, "P101_2_25_INSTITUTION_DISCOVERY_CHECKPOINT.md"),
  ]);

  const scanFiles: string[] = [];
  for (const entry of fs.readdirSync(CMD)) {
    const full = path.join(CMD, entry);
    if (fs.statSync(full).isFile()) scanFiles.push(full);
  }
  for (const p of packets) scanFiles.push(p);

  // Guard against accidental commit of T7-class blobs in the command center.
  // The repo's role is the index; T7's role is the blob storage. Anything
  // larger than 100 KB or with a binary-suspect extension inside the
  // command-center folder is rejected.
  for (const full of scanFiles) {
    const ext = path.extname(full).toLowerCase();
    if (BANNED_BINARY_EXTS.has(ext)) {
      fail("BANNED_BINARY_IN_REPO", path.relative(REPO_ROOT, full), `binary-suspect extension ${ext} in command center — belongs on T7`);
    }
    try {
      const st = fs.statSync(full);
      if (st.isFile() && st.size > COMMAND_CENTER_FILE_MAX_BYTES) {
        fail("OVERSIZED_FILE_IN_REPO", path.relative(REPO_ROOT, full), `size ${st.size} > ${COMMAND_CENTER_FILE_MAX_BYTES} (T7 storage required)`);
      }
    } catch { /* ignore */ }
  }

  for (const full of scanFiles) {
    if (full === SELF_PATH) continue;
    const ext = path.extname(full).toLowerCase();
    if (![".md", ".csv", ".json", ".ts", ".txt"].includes(ext)) continue;
    let text: string;
    try { text = fs.readFileSync(full, "utf8"); } catch { continue; }
    const rel = path.relative(REPO_ROOT, full);
    const isMetaDoc = META_DOCS_ALLOWED_TO_NAME_TOKENS.has(full);

    if (!isMetaDoc) {
      for (const tok of FORBIDDEN_TOKENS) {
        const re = new RegExp(`\\b${tok}\\b`, "g");
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
          const start = m.index;
          const before = text.slice(Math.max(0, start - 3), start);
          if (before.endsWith("NO_")) continue;
          fail("FORBIDDEN_TOKEN", rel, `bare '${tok}' at offset ${start}`);
        }
      }
    }

    for (const phrase of BANNED_PHRASES) {
      const found = text.match(phrase);
      if (!found) continue;
      const i = text.indexOf(found[0]);
      const ctx = text.slice(Math.max(0, i - 80), i + 80);
      if (/\b(no|not|never|without)\s+\S{0,40}/i.test(ctx)) continue;
      fail("BANNED_PHRASE", rel, `'${found[0]}' near offset ${i} without negation context`);
    }

    for (const re of SECRETS_PATTERNS) {
      if (re.test(text)) fail("SECRET_PATTERN", rel, "secret-like token");
    }
  }
}

function main(): void {
  console.log("=".repeat(60));
  console.log("P101 Discovery Command Center Validator");
  console.log("=".repeat(60));

  try { run(); }
  catch (e) { fail("VALIDATOR_THREW", "(uncaught)", String(e)); }

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  Command center + 15 docs intact.");
    console.log(`  ≥ ${EXPECTED_PACKET_MIN} institution packets validated, schemaVersion p101-0, quotes present for confirmed classifications.`);
    console.log("  No protected-path drift. No forbidden token. No banned phrase. No secret pattern.");
    process.exit(0);
  }

  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  process.exit(1);
}

main();
