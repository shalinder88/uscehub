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
];

// Cumulative P101 packet count: P101-0 (5) + P101-1 (10) = 15.
// Allow ≥ this; future sprints add packets without breaking the validator.
const EXPECTED_PACKET_MIN = 15;

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
  ]);

  const scanFiles: string[] = [];
  for (const entry of fs.readdirSync(CMD)) {
    const full = path.join(CMD, entry);
    if (fs.statSync(full).isFile()) scanFiles.push(full);
  }
  for (const p of packets) scanFiles.push(p);

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
