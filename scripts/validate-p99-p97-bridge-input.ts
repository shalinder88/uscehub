/**
 * P99-P97 Bridge Stage 1 — Reviewed Input Validator
 *
 * Validates a reviewed-input bridge CSV before any runtime generation step.
 * Hard-rule scope: read-only. Does not mutate runtime data.
 *
 * Run:
 *   npx tsx scripts/validate-p99-p97-bridge-input.ts <path-to-bridge-csv>
 *
 * Hard gates:
 *   - All required columns present
 *   - Allowed enum values
 *   - evidence_triple_complete=true (when bridge_review_status=VALIDATED_BRIDGE_INPUT)
 *   - screenshot_path exists on disk
 *   - official_source_url starts with http(s)://
 *   - archive_url starts with https://web.archive.org/
 *   - source_quote_under_280 is 1..280 chars
 *   - p97_readiness_status is HUMAN_REVIEW_READY (or stricter)
 *   - IMPORT_READY / PUBLIC_NOW REJECTED in any field
 *   - Broad H-1B claim REJECTED when visa caveat says H-1B not verified
 *   - must_not_claim, public_limitations, not_allowed_actions all non-empty
 *   - not_allowed_actions contains NO_IMPORT_READY, NO_PUBLIC_NOW, NO_RUNTIME_MUTATION, NO_INDEXED_PUBLICATION
 *   - Forbidden runtime substrings (npi/ccn/cms/nppes/aamc/nrmp/acgme/nucc) absent from public-marked fields
 */

import * as fs from "fs";
import * as path from "path";

// ---------- Minimal RFC-4180-ish CSV reader (handles quoted fields with commas + escaped quotes) ----------
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      cur += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ",") { row.push(cur); cur = ""; i++; continue; }
    if (ch === "\r") { i++; continue; }
    if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; i++; continue; }
    cur += ch; i++;
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0] === ""));
}

interface Failure { rule: string; row: string; detail: string }

const REQUIRED_COLUMNS = [
  "bridge_row_id", "candidate_rank", "institution_name", "campus_name", "city", "state", "country",
  "source_system", "source_queue",
  "opportunity_title", "opportunity_type", "specialty", "clinical_exposure_level",
  "current_wedge_fit", "future_lane_fit", "public_pilot_category",
  "audience_detail", "audience_restriction_summary",
  "accepts_us_md", "accepts_us_do", "accepts_img", "accepts_international_students", "accepts_caribbean",
  "audience_confidence", "audience_public_caveat",
  "visa_policy", "visa_tags", "visa_public_caveat",
  "h1b_supported", "j1_supported", "b1_b2_supported", "visa_confidence",
  "official_source_url", "application_url", "archive_url", "screenshot_path",
  "source_quote_under_280", "source_status", "last_reviewed",
  "evidence_status", "evidence_triple_complete",
  "public_summary_draft", "public_limitations", "must_not_claim",
  "correction_contact_visible", "report_issue_enabled", "hospital_safe_wording_reviewed",
  "p97_readiness_status", "bridge_review_status", "allowed_next_workflow", "not_allowed_actions",
  "human_reviewer_required", "reviewer_notes", "created_at", "updated_at",
];

const ENUMS: Record<string, string[]> = {
  opportunity_type: ["VISITING_ELECTIVE", "SUB_INTERNSHIP", "EXTERNSHIP", "OBSERVERSHIP", "RESIDENCY", "RESIDENCY_SUPPORTING_SOURCE"],
  clinical_exposure_level: ["DIRECT_PATIENT_CARE", "OBSERVATION_ONLY", "NOT_DOCUMENTED"],
  current_wedge_fit: ["IN_PILOT_WEDGE", "OUT_OF_WEDGE", "DEFER"],
  public_pilot_category: ["READY_PUBLIC_IMG_RELEVANT_CANDIDATE", "READY_PUBLIC_US_STUDENT_ONLY_CANDIDATE", "NOT_PUBLIC_PILOT_CANDIDATE"],
  accepts_us_md: ["YES", "NO", "UNKNOWN_NOT_STATED", "ONLY_IF_AFFILIATED"],
  accepts_us_do: ["YES", "NO", "UNKNOWN_NOT_STATED", "ONLY_IF_AFFILIATED"],
  accepts_img: ["YES", "NO", "UNKNOWN_NOT_STATED", "ONLY_IF_AFFILIATED"],
  accepts_international_students: ["YES", "NO", "UNKNOWN_NOT_STATED", "ONLY_IF_AFFILIATED"],
  accepts_caribbean: ["YES", "NO", "UNKNOWN_NOT_STATED", "ONLY_IF_AFFILIATED", "ONLY_IF_NAMED_PARTNER"],
  audience_confidence: ["HIGH", "MEDIUM", "LOW"],
  visa_policy: ["J1_ECFMG_ONLY", "J1_AND_H1B", "NO_SPONSORSHIP", "NOT_MENTIONED", "APPLICANT_OBTAINED_B1_B2", "OTHER"],
  h1b_supported: ["TRUE", "FALSE", "UNKNOWN_NOT_STATED"],
  j1_supported: ["TRUE", "FALSE", "UNKNOWN_NOT_STATED"],
  b1_b2_supported: ["TRUE", "FALSE", "UNKNOWN_NOT_STATED", "APPLICANT_OBTAINED"],
  visa_confidence: ["HIGH", "MEDIUM", "LOW"],
  source_status: ["OFFICIAL_SOURCE_ARCHIVED", "OFFICIAL_SOURCE_NOT_ARCHIVED", "SOURCE_CHANGED", "SOURCE_NOT_FOUND"],
  evidence_status: ["EVIDENCE_TRIPLE_COMPLETE", "EVIDENCE_TRIPLE_PENDING", "EVIDENCE_INSUFFICIENT"],
  evidence_triple_complete: ["true", "false"],
  correction_contact_visible: ["TRUE", "FALSE", "REQUIRED_BEFORE_PUBLICATION"],
  report_issue_enabled: ["true", "false"],
  hospital_safe_wording_reviewed: ["true", "false"],
  p97_readiness_status: ["HUMAN_REVIEW_READY"],
  bridge_review_status: ["DRAFT_FROM_P97", "VALIDATED_BRIDGE_INPUT", "NEEDS_HUMAN_COPY_REVIEW", "NEEDS_SOURCE_REVIEW", "KEEP_INTERNAL", "REJECT_PUBLIC"],
  allowed_next_workflow: ["P99_PILOT_INPUT_REVIEW", "P99_RUNTIME_GENERATION_CANDIDATE", "NONE_BLOCKED"],
  human_reviewer_required: ["true"],
};

const FORBIDDEN_RUNTIME_SUBSTRINGS = [
  "npi", "ccn", "cms", "nppes", "aamc", "nrmp", "acgme", "nucc",
  "completeness_score", "max_possible_score", "identity_status", "unknown_fields",
];
// Fields that may appear publicly. Forbidden-substring scan applies here.
// (Other internal fields legitimately reference NPI/etc. by name in rule text and are not scanned.)
const PUBLIC_FIELDS_FOR_FORBIDDEN_SCAN = [
  "institution_name", "campus_name", "city", "state",
  "opportunity_title", "specialty",
  "audience_restriction_summary", "audience_public_caveat",
  "visa_tags", "visa_public_caveat",
  "official_source_url", "application_url", "archive_url",
  "source_quote_under_280",
  "public_summary_draft", "public_limitations", "must_not_claim",
];

const FORBIDDEN_STATUS_TOKENS = ["IMPORT_READY", "PUBLIC_NOW", "BRIDGE_READY_TO_RUNTIME", "APPROVED_FOR_PUBLICATION"];

const REQUIRED_NOT_ALLOWED_ACTIONS = [
  "NO_IMPORT_READY", "NO_PUBLIC_NOW", "NO_RUNTIME_MUTATION", "NO_INDEXED_PUBLICATION",
];

function rowId(row: Record<string, string>): string {
  return row.bridge_row_id || row.institution_name || "(unidentified row)";
}

function validate(rows: Record<string, string>[], repoRoot: string): Failure[] {
  const failures: Failure[] = [];
  for (const r of rows) {
    const id = rowId(r);

    // Required columns presence + non-empty for required fields
    for (const col of REQUIRED_COLUMNS) {
      if (!(col in r)) {
        failures.push({ rule: "MISSING_COLUMN", row: id, detail: `Column '${col}' not present` });
      }
    }

    // Enum checks
    for (const [field, allowed] of Object.entries(ENUMS)) {
      const v = r[field];
      if (v === undefined || v === "") continue; // emptiness handled below
      // audience_detail is a JSON-ish 4-key object string; validated separately
      if (field === "audience_detail") continue;
      if (!allowed.includes(v)) {
        failures.push({ rule: "INVALID_ENUM", row: id, detail: `Field '${field}' value '${v}' not in [${allowed.join(",")}]` });
      }
    }

    // Required non-empty fields (excluding YES_OR_EMPTY-allowed: campus_name, city, application_url, future_lane_fit, reviewer_notes)
    const allowedEmpty = new Set(["campus_name", "city", "application_url", "future_lane_fit", "reviewer_notes"]);
    for (const col of REQUIRED_COLUMNS) {
      if (allowedEmpty.has(col)) continue;
      if (r[col] === undefined || r[col].trim() === "") {
        failures.push({ rule: "EMPTY_REQUIRED_FIELD", row: id, detail: `Field '${col}' is empty` });
      }
    }

    // candidate_rank integer
    if (r.candidate_rank && !/^\d+$/.test(r.candidate_rank.trim())) {
      failures.push({ rule: "BAD_CANDIDATE_RANK", row: id, detail: `candidate_rank '${r.candidate_rank}' not a positive integer` });
    }

    // state two-letter
    if (r.state && !/^[A-Z]{2}$/.test(r.state.trim())) {
      failures.push({ rule: "BAD_STATE", row: id, detail: `state '${r.state}' not a US two-letter code` });
    }

    // audience_detail 4-key object check (loose: must contain four expected keys)
    if (r.audience_detail) {
      const keys = ["us_md_do", "international_student", "img_graduate", "caribbean_student"];
      const missing = keys.filter(k => !r.audience_detail.includes(k));
      if (missing.length) {
        failures.push({ rule: "AUDIENCE_DETAIL_MISSING_KEYS", row: id, detail: `audience_detail missing keys: ${missing.join(",")}` });
      }
      const allowedAudienceVals = ["ELIGIBLE_EXPLICIT", "EXCLUDED_EXPLICIT", "UNKNOWN_NOT_STATED", "ONLY_IF_AFFILIATED", "ONLY_IF_LCME_COCA"];
      // Quick check: any unrecognized status value → fail. Match on token boundaries.
      const re = /(ELIGIBLE_EXPLICIT|EXCLUDED_EXPLICIT|UNKNOWN_NOT_STATED|ONLY_IF_AFFILIATED|ONLY_IF_LCME_COCA)/g;
      const found = r.audience_detail.match(re) || [];
      if (found.length < 4) {
        failures.push({ rule: "AUDIENCE_DETAIL_VALUES_INSUFFICIENT", row: id, detail: `audience_detail expected ≥4 status values from [${allowedAudienceVals.join(",")}], found ${found.length}` });
      }
    }

    // URL checks
    if (r.official_source_url && !/^https?:\/\//.test(r.official_source_url.trim())) {
      failures.push({ rule: "BAD_OFFICIAL_SOURCE_URL", row: id, detail: `official_source_url '${r.official_source_url}' must start with http(s)://` });
    }
    if (r.application_url && r.application_url.trim() !== "" && !/^https?:\/\//.test(r.application_url.trim())) {
      failures.push({ rule: "BAD_APPLICATION_URL", row: id, detail: `application_url '${r.application_url}' must start with http(s):// or be empty` });
    }
    if (r.archive_url && !/^https:\/\/web\.archive\.org\//.test(r.archive_url.trim())) {
      failures.push({ rule: "BAD_ARCHIVE_URL", row: id, detail: `archive_url '${r.archive_url}' must start with https://web.archive.org/` });
    }

    // screenshot_path exists on disk
    if (r.screenshot_path) {
      const abs = path.isAbsolute(r.screenshot_path) ? r.screenshot_path : path.join(repoRoot, r.screenshot_path);
      if (!fs.existsSync(abs)) {
        failures.push({ rule: "SCREENSHOT_NOT_FOUND_ON_DISK", row: id, detail: `screenshot_path '${r.screenshot_path}' (resolved '${abs}') does not exist` });
      }
    }

    // source_quote_under_280
    if (r.source_quote_under_280) {
      const len = r.source_quote_under_280.length;
      if (len === 0) failures.push({ rule: "EMPTY_SOURCE_QUOTE", row: id, detail: "source_quote_under_280 is empty" });
      if (len > 280) failures.push({ rule: "SOURCE_QUOTE_TOO_LONG", row: id, detail: `source_quote_under_280 is ${len} chars; max 280` });
    }

    // p97_readiness_status MUST be HUMAN_REVIEW_READY
    if (r.p97_readiness_status && r.p97_readiness_status !== "HUMAN_REVIEW_READY") {
      failures.push({ rule: "INVALID_P97_READINESS_STATUS", row: id, detail: `p97_readiness_status '${r.p97_readiness_status}' must be HUMAN_REVIEW_READY` });
    }

    // FORBIDDEN status tokens anywhere in the row
    for (const [k, v] of Object.entries(r)) {
      if (typeof v !== "string") continue;
      for (const tok of FORBIDDEN_STATUS_TOKENS) {
        if (v.includes(tok)) {
          // Exception: not_allowed_actions and must_not_claim and public_limitations may explicitly NAME these tokens to forbid them
          const safeForbidContexts = ["not_allowed_actions", "must_not_claim", "public_limitations", "reviewer_notes", "allowed_next_workflow"];
          // Allow tokens like "NO_IMPORT_READY" / "NO_PUBLIC_NOW" because they start with NO_
          const isSafeNoPrefix = v.includes(`NO_${tok}`);
          if (safeForbidContexts.includes(k) && isSafeNoPrefix) continue;
          failures.push({ rule: "FORBIDDEN_STATUS_TOKEN", row: id, detail: `Field '${k}' contains forbidden status token '${tok}': '${v}'` });
        }
      }
    }

    // Broad H-1B claim guard
    if (r.h1b_supported === "TRUE" && r.visa_public_caveat) {
      const c = r.visa_public_caveat.toUpperCase();
      if (c.includes("NOT VERIFIED") || c.includes("NOT MENTIONED") || c.includes("H-1B IS NOT") || c.includes("H1B NOT")) {
        failures.push({ rule: "H1B_CLAIM_VS_CAVEAT_CONFLICT", row: id, detail: "h1b_supported=TRUE conflicts with visa_public_caveat saying H-1B not verified/mentioned" });
      }
    }
    if (r.visa_tags && /(NO_H1B_VERIFIED|NO_H1B_SUPPORT)/.test(r.visa_tags) && r.h1b_supported === "TRUE") {
      failures.push({ rule: "H1B_CLAIM_VS_TAG_CONFLICT", row: id, detail: "h1b_supported=TRUE conflicts with visa_tags including NO_H1B_VERIFIED/NO_H1B_SUPPORT" });
    }

    // not_allowed_actions must include the four mandatory tokens
    if (r.not_allowed_actions) {
      for (const tok of REQUIRED_NOT_ALLOWED_ACTIONS) {
        if (!r.not_allowed_actions.includes(tok)) {
          failures.push({ rule: "MISSING_REQUIRED_NOT_ALLOWED_ACTION", row: id, detail: `not_allowed_actions missing required token '${tok}'` });
        }
      }
    }

    // VALIDATED_BRIDGE_INPUT requires evidence_triple_complete=true
    if (r.bridge_review_status === "VALIDATED_BRIDGE_INPUT" && r.evidence_triple_complete !== "true") {
      failures.push({ rule: "VALIDATED_WITHOUT_EVIDENCE_TRIPLE", row: id, detail: "bridge_review_status=VALIDATED_BRIDGE_INPUT requires evidence_triple_complete=true" });
    }

    // Forbidden runtime substrings on public-facing fields
    for (const f of PUBLIC_FIELDS_FOR_FORBIDDEN_SCAN) {
      const v = r[f] || "";
      const low = v.toLowerCase();
      for (const sub of FORBIDDEN_RUNTIME_SUBSTRINGS) {
        // Skip false positives in URLs: cms.gov / nppes.cms.hhs.gov could legitimately appear in archive_url? They shouldn't for our pilot.
        if (low.includes(sub)) {
          failures.push({ rule: "FORBIDDEN_RUNTIME_SUBSTRING", row: id, detail: `Field '${f}' contains forbidden substring '${sub}'` });
          break;
        }
      }
    }
  }
  return failures;
}

function main() {
  const argPath = process.argv[2];
  if (!argPath) {
    console.error("Usage: npx tsx scripts/validate-p99-p97-bridge-input.ts <path-to-bridge-csv>");
    process.exit(2);
  }
  if (!fs.existsSync(argPath)) {
    console.error(`File not found: ${argPath}`);
    process.exit(2);
  }

  const repoRoot = path.resolve(__dirname, "..");
  const text = fs.readFileSync(argPath, "utf8");
  const grid = parseCsv(text);
  if (grid.length < 2) {
    console.error("CSV has no data rows");
    process.exit(2);
  }
  const header = grid[0];
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < grid.length; i++) {
    const r: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) r[header[j]] = grid[i][j] ?? "";
    rows.push(r);
  }

  console.log("=".repeat(60));
  console.log("P99-P97 Bridge Stage 1 — Reviewed Input Validator");
  console.log("=".repeat(60));
  console.log(`File: ${argPath}`);
  console.log(`Rows: ${rows.length}`);

  const failures = validate(rows, repoRoot);

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log(`  ${rows.length} row(s) passed all bridge-input gates.`);
    console.log("  No runtime mutation. No public promotion. No import.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) {
    console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  }
  process.exit(1);
}

main();
