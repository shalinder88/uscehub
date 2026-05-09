/**
 * P99-P97 Correction Queue Cross-Join Validator
 *
 * Validates the full correction chain on a queue root:
 *   queue item ↔ audit log
 *   listing_id → active runtime OR staged runtime
 *   report_ref → listing-map mapping CSV
 *   evidence_join_key → evidence-join-map CSV
 *
 * Run:
 *   npx tsx scripts/validate-p99-correction-queue-cross-join.ts <queue-root>
 *
 * <queue-root> must contain:
 *   inbox/<...>/*.json   (queue items)
 *   audit/<...>/*.jsonl  (audit logs)
 *
 * The validator joins these against repo-canonical maps:
 *   src/data/usce/public-listings-pilot.generated.json  (active)
 *   src/data/usce/public-listings-pilot-staged-batch-2.generated.json  (staged)
 *   docs/platform-v2/local/usce-completeness/staged-runtime-report-issue-mapping-1/staged_runtime_report_issue_mapping_1_listing_map.csv
 *   docs/platform-v2/local/usce-completeness/staged-runtime-report-issue-mapping-1/staged_runtime_report_issue_mapping_1_evidence_join_map.csv
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { FORBIDDEN_PAYLOAD_KEYS_LOWER } from "../src/lib/usce-corrections/correction-intake-config";

const REPO_ROOT = path.resolve(__dirname, "..");

const ACTIVE_RUNTIME_PATH = path.join(REPO_ROOT, "src/data/usce/public-listings-pilot.generated.json");
const STAGED_RUNTIME_PATH = path.join(REPO_ROOT, "src/data/usce/public-listings-pilot-staged-batch-2.generated.json");
const LISTING_MAP_CSV = path.join(REPO_ROOT, "docs/platform-v2/local/usce-completeness/staged-runtime-report-issue-mapping-1/staged_runtime_report_issue_mapping_1_listing_map.csv");
const EVIDENCE_MAP_CSV = path.join(REPO_ROOT, "docs/platform-v2/local/usce-completeness/staged-runtime-report-issue-mapping-1/staged_runtime_report_issue_mapping_1_evidence_join_map.csv");

const ALLOWED_STATUSES = new Set([
  "RECEIVED", "TRIAGED", "SOURCE_RECHECK_PENDING", "SOURCE_RECHECK_COMPLETE",
  "NEEDS_COPY_UPDATE", "NEEDS_SOURCE_URL_UPDATE", "NEEDS_DELIST",
  "NO_CHANGE", "NEEDS_INSTITUTION_CONFIRMATION_LATER",
  "STAGED_CORRECTION", "VALIDATED_CORRECTION", "CLOSED",
]);
const ALLOWED_PRIORITIES = new Set([
  "P0_SAFETY_OR_LEGAL", "P1_MATERIAL_ELIGIBILITY_OR_APPLICATION",
  "P2_SOURCE_LINK_OR_FEE", "P3_COPY_OR_MINOR", "P4_SPAM_OR_UNACTIONABLE",
]);
const ALLOWED_ISSUE_TYPES = new Set([
  "source_link_broken", "eligibility_incorrect", "visa_information_incorrect",
  "cost_or_fee_incorrect", "application_process_incorrect", "program_closed",
  "duplicate_listing", "wrong_institution", "outdated_information",
  "source_does_not_support_claim", "other",
]);
const ALLOWED_RUNTIME_SETS = new Set(["active", "staged", "bridge_draft", "maine", "unknown"]);
const ALLOWED_REPORT_REFS = new Set([
  "pilot-listing", "pilot-feedback", "pilot-source-link-broken",
  "pilot-eligibility", "pilot-visa", "pilot-cost", "pilot-application",
  "pilot-program-closed", "pilot-duplicate", "pilot-other",
]);
const FORBIDDEN_TOKENS = ["PUBLIC_NOW", "IMPORT_READY", "BRIDGE_READY_TO_RUNTIME", "APPROVED_FOR_PUBLICATION"];
// IPv4 / IPv6 patterns for raw-IP leak detection
const IPV4_REGEX = /\b(?:25[0-5]|2[0-4]\d|[01]?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d)){3}\b/;
const IPV6_REGEX = /\b(?:[0-9a-fA-F]{1,4}:){7,}[0-9a-fA-F]{1,4}\b/;
// Internal evidence path patterns that must NOT appear in queue items
const FORBIDDEN_PATH_FRAGMENTS = [
  "/screenshots/",
  "manual-png-landing-1",
  "batch-3-evidence-landing",
];

interface Failure { rule: string; row: string; detail: string }
interface Warning { rule: string; row: string; detail: string }

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

function csvObjects(p: string): Record<string, string>[] {
  if (!fs.existsSync(p)) return [];
  const grid = parseCsv(fs.readFileSync(p, "utf8"));
  if (grid.length < 2) return [];
  const header = grid[0];
  const out: Record<string, string>[] = [];
  for (let i = 1; i < grid.length; i++) {
    const r: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) r[header[j]] = grid[i][j] ?? "";
    out.push(r);
  }
  return out;
}

function deepStringWalk(obj: unknown, cb: (s: string, loc: string) => void, loc = ""): void {
  if (typeof obj === "string") { cb(obj, loc); return; }
  if (Array.isArray(obj)) { obj.forEach((v, i) => deepStringWalk(v, cb, `${loc}[${i}]`)); return; }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) deepStringWalk(v, cb, loc ? `${loc}.${k}` : k);
  }
}

function gatherFiles(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  function walk(d: string): void {
    for (const e of fs.readdirSync(d)) {
      const full = path.join(d, e);
      const s = fs.statSync(full);
      if (s.isDirectory()) walk(full);
      else if (s.isFile() && full.endsWith(ext) && !path.basename(full).startsWith(".")) out.push(full);
    }
  }
  walk(dir);
  return out;
}

interface RowJoinSummary {
  correction_id: string;
  listing_id: string;
  report_ref: string;
  runtime_set: string;
  listing_resolution_status: string;
  report_ref_status: string;
  audit_log_status: string;
  evidence_join_status: string;
  forbidden_field_status: string;
  public_runtime_safety_status: string;
  validation_status: "PASS" | "FAIL";
  warnings: string;
  notes: string;
}

function loadRuntimeListingIds(p: string): Set<string> {
  if (!fs.existsSync(p)) return new Set();
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8")) as { cards?: Array<{ listing_id?: string }> };
    return new Set((j.cards ?? []).map(c => c.listing_id ?? "").filter(Boolean));
  } catch {
    return new Set();
  }
}

function main(): void {
  const queueRoot = process.argv[2];
  if (!queueRoot) {
    console.error("Usage: npx tsx scripts/validate-p99-correction-queue-cross-join.ts <queue-root>");
    process.exit(2);
  }
  const queueRootAbs = path.resolve(queueRoot);
  if (!fs.existsSync(queueRootAbs)) {
    console.error(`Queue root not found: ${queueRootAbs}`);
    process.exit(2);
  }

  const inboxDir = path.join(queueRootAbs, "inbox");
  const auditDir = path.join(queueRootAbs, "audit");

  const queueFiles = gatherFiles(inboxDir, ".json");
  const auditFiles = gatherFiles(auditDir, ".jsonl");

  const failures: Failure[] = [];
  const warnings: Warning[] = [];
  const summaries: RowJoinSummary[] = [];

  // Index audit logs by correction_id (filename stem).
  const auditByCorrectionId = new Map<string, string>();
  for (const f of auditFiles) {
    const stem = path.basename(f, ".jsonl");
    auditByCorrectionId.set(stem, f);
  }

  // Load runtime listing-id sets
  const activeIds = loadRuntimeListingIds(ACTIVE_RUNTIME_PATH);
  const stagedIds = loadRuntimeListingIds(STAGED_RUNTIME_PATH);
  if (activeIds.size === 0) failures.push({ rule: "ACTIVE_RUNTIME_MISSING_OR_EMPTY", row: ACTIVE_RUNTIME_PATH, detail: "active runtime JSON missing or has zero cards" });
  if (stagedIds.size === 0) warnings.push({ rule: "STAGED_RUNTIME_MISSING_OR_EMPTY", row: STAGED_RUNTIME_PATH, detail: "staged runtime JSON missing or has zero cards" });

  // Load mapping CSVs
  const listingMap = csvObjects(LISTING_MAP_CSV);
  const evidenceMap = csvObjects(EVIDENCE_MAP_CSV);
  const listingMapByListingId = new Map<string, Record<string, string>>();
  for (const r of listingMap) {
    if (r.listing_id && r.listing_id !== "n/a") listingMapByListingId.set(r.listing_id, r);
  }
  const evidenceListingIds = new Set<string>();
  for (const r of evidenceMap) {
    if (r.listing_id && r.listing_id !== "n/a") evidenceListingIds.add(r.listing_id);
  }
  if (listingMapByListingId.size === 0) failures.push({ rule: "LISTING_MAP_MISSING_OR_EMPTY", row: LISTING_MAP_CSV, detail: "listing map CSV missing or empty" });
  if (evidenceListingIds.size === 0) failures.push({ rule: "EVIDENCE_MAP_MISSING_OR_EMPTY", row: EVIDENCE_MAP_CSV, detail: "evidence join map CSV missing or empty" });

  // Per-queue-item joins
  const seenAuditMatches = new Set<string>();
  for (const qf of queueFiles) {
    const stem = path.basename(qf, ".json");
    const summary: RowJoinSummary = {
      correction_id: stem,
      listing_id: "",
      report_ref: "",
      runtime_set: "",
      listing_resolution_status: "?",
      report_ref_status: "?",
      audit_log_status: "?",
      evidence_join_status: "?",
      forbidden_field_status: "?",
      public_runtime_safety_status: "?",
      validation_status: "PASS",
      warnings: "",
      notes: "",
    };

    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(fs.readFileSync(qf, "utf8"));
    } catch (e) {
      failures.push({ rule: "QUEUE_ITEM_PARSE_FAILED", row: stem, detail: String(e) });
      summary.validation_status = "FAIL";
      summary.notes = "queue item JSON parse failed";
      summaries.push(summary);
      continue;
    }

    const id = (raw["correction_id"] as string) || stem;
    summary.correction_id = id;
    summary.listing_id = (raw["listing_id"] as string) || "";
    summary.report_ref = (raw["report_ref"] as string) || "";
    summary.runtime_set = (raw["runtime_set"] as string) || "";

    // Schema enums
    if (typeof raw["status"] === "string" && !ALLOWED_STATUSES.has(raw["status"] as string)) {
      failures.push({ rule: "INVALID_STATUS", row: id, detail: `status '${raw["status"]}' not in enum` });
      summary.validation_status = "FAIL";
    }
    if (typeof raw["priority"] === "string" && !ALLOWED_PRIORITIES.has(raw["priority"] as string)) {
      failures.push({ rule: "INVALID_PRIORITY", row: id, detail: `priority '${raw["priority"]}' not in enum` });
      summary.validation_status = "FAIL";
    }
    if (typeof raw["issue_type"] === "string" && !ALLOWED_ISSUE_TYPES.has(raw["issue_type"] as string)) {
      failures.push({ rule: "INVALID_ISSUE_TYPE", row: id, detail: `issue_type '${raw["issue_type"]}' not in enum` });
      summary.validation_status = "FAIL";
    }
    if (typeof raw["runtime_set"] === "string" && !ALLOWED_RUNTIME_SETS.has(raw["runtime_set"] as string)) {
      failures.push({ rule: "INVALID_RUNTIME_SET", row: id, detail: `runtime_set '${raw["runtime_set"]}' not in enum` });
      summary.validation_status = "FAIL";
    }
    if (typeof raw["report_ref"] === "string" && !ALLOWED_REPORT_REFS.has(raw["report_ref"] as string)) {
      failures.push({ rule: "INVALID_REPORT_REF", row: id, detail: `report_ref '${raw["report_ref"]}' not in enum` });
      summary.validation_status = "FAIL";
    }
    if (!("source_context" in raw) || typeof raw["source_context"] !== "object" || Array.isArray(raw["source_context"])) {
      failures.push({ rule: "MISSING_SOURCE_CONTEXT", row: id, detail: "source_context object missing" });
      summary.validation_status = "FAIL";
    }
    if (!("evidence_join_key" in raw) || typeof raw["evidence_join_key"] !== "string") {
      failures.push({ rule: "MISSING_EVIDENCE_JOIN_KEY", row: id, detail: "evidence_join_key missing" });
      summary.validation_status = "FAIL";
    }

    // Forbidden field deep scan
    let forbiddenSeen = false;
    deepStringWalk(raw, (s, loc) => {
      // Forbidden status tokens
      for (const tok of FORBIDDEN_TOKENS) {
        if (s.includes(tok) && !s.includes(`NO_${tok}`)) {
          failures.push({ rule: "FORBIDDEN_TOKEN_IN_QUEUE_ITEM", row: id, detail: `forbidden token '${tok}' at ${loc}` });
          forbiddenSeen = true;
          summary.validation_status = "FAIL";
        }
      }
      // Internal evidence path leak
      for (const frag of FORBIDDEN_PATH_FRAGMENTS) {
        if (s.includes(frag)) {
          failures.push({ rule: "INTERNAL_EVIDENCE_PATH_LEAK", row: id, detail: `forbidden internal path fragment '${frag}' at ${loc}` });
          forbiddenSeen = true;
          summary.validation_status = "FAIL";
        }
      }
      // Raw IP leak
      if (IPV4_REGEX.test(s) || IPV6_REGEX.test(s)) {
        failures.push({ rule: "RAW_IP_IN_QUEUE_ITEM", row: id, detail: `IP-shaped string at ${loc}` });
        forbiddenSeen = true;
        summary.validation_status = "FAIL";
      }
    });
    // Forbidden field key scan (top-level + recursive)
    function deepKeyScan(o: unknown, loc: string): void {
      if (o && typeof o === "object" && !Array.isArray(o)) {
        for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
          if (FORBIDDEN_PAYLOAD_KEYS_LOWER.has(k.toLowerCase())) {
            failures.push({ rule: "FORBIDDEN_FIELD_KEY_IN_QUEUE_ITEM", row: id, detail: `forbidden key '${k}' at ${loc}` });
            forbiddenSeen = true;
            summary.validation_status = "FAIL";
          }
          deepKeyScan(v, loc ? `${loc}.${k}` : k);
        }
      } else if (Array.isArray(o)) {
        for (let i = 0; i < o.length; i++) deepKeyScan(o[i], `${loc}[${i}]`);
      }
    }
    deepKeyScan(raw, "");
    summary.forbidden_field_status = forbiddenSeen ? "FAIL" : "CLEAN";

    // Listing resolution
    const lid = summary.listing_id;
    const rref = summary.report_ref;
    const rset = summary.runtime_set;
    if (rref === "pilot-feedback" && lid === "") {
      summary.listing_resolution_status = "GENERIC_FEEDBACK_NO_LISTING";
    } else if (lid === "") {
      failures.push({ rule: "LISTING_ID_MISSING", row: id, detail: "listing_id is empty but report_ref is not pilot-feedback" });
      summary.validation_status = "FAIL";
      summary.listing_resolution_status = "MISSING";
    } else {
      const inActive = activeIds.has(lid);
      const inStaged = stagedIds.has(lid);
      if (!inActive && !inStaged) {
        failures.push({ rule: "LISTING_ID_NOT_IN_ANY_RUNTIME", row: id, detail: `listing_id '${lid}' not in active or staged runtime` });
        summary.validation_status = "FAIL";
        summary.listing_resolution_status = "NOT_FOUND";
      } else {
        summary.listing_resolution_status = inActive ? (inStaged ? "ACTIVE_AND_STAGED" : "ACTIVE_ONLY") : "STAGED_ONLY";
        if (rset === "active" && !inActive) {
          failures.push({ rule: "RUNTIME_SET_MISMATCH", row: id, detail: `runtime_set='active' but listing_id only in staged` });
          summary.validation_status = "FAIL";
        }
        if (rset === "staged" && !inStaged) {
          failures.push({ rule: "RUNTIME_SET_MISMATCH", row: id, detail: `runtime_set='staged' but listing_id not in staged runtime` });
          summary.validation_status = "FAIL";
        }
        if (summary.listing_resolution_status === "STAGED_ONLY") {
          warnings.push({ rule: "ROW_MAPS_TO_STAGED_NOT_ACTIVE", row: id, detail: `listing_id '${lid}' is in staged runtime; not yet active/public` });
        }
      }

      // Report-ref / listing-map cross-check
      const lmRow = listingMapByListingId.get(lid);
      if (!lmRow) {
        failures.push({ rule: "LISTING_NOT_IN_LISTING_MAP", row: id, detail: `listing_id '${lid}' has no row in listing-map CSV` });
        summary.validation_status = "FAIL";
        summary.report_ref_status = "MAP_MISS";
      } else {
        const expectedRef = lmRow["report_ref"];
        if (rref && expectedRef && rref !== expectedRef) {
          failures.push({ rule: "REPORT_REF_MISMATCH", row: id, detail: `report_ref '${rref}' != listing-map expected '${expectedRef}' for listing_id '${lid}'` });
          summary.validation_status = "FAIL";
          summary.report_ref_status = "MISMATCH";
        } else {
          summary.report_ref_status = "OK";
        }
      }

      // Evidence join
      if (!evidenceListingIds.has(lid)) {
        failures.push({ rule: "LISTING_NOT_IN_EVIDENCE_MAP", row: id, detail: `listing_id '${lid}' has no row in evidence-join-map CSV` });
        summary.validation_status = "FAIL";
        summary.evidence_join_status = "MAP_MISS";
      } else {
        summary.evidence_join_status = "OK";
        // Active 5 are documented as T7-canonical
        if (summary.listing_resolution_status === "ACTIVE_ONLY") {
          warnings.push({ rule: "ACTIVE_5_EVIDENCE_T7_LANE", row: id, detail: `active card evidence files live on T7 lane (B-005)` });
        }
      }
    }

    // Audit log existence + first-event match
    const auditPath = auditByCorrectionId.get(id);
    if (!auditPath) {
      failures.push({ rule: "AUDIT_LOG_MISSING", row: id, detail: `no audit log JSONL found at expected path under audit/` });
      summary.validation_status = "FAIL";
      summary.audit_log_status = "MISSING";
    } else {
      seenAuditMatches.add(id);
      let auditFirstEvent: Record<string, unknown> | null = null;
      try {
        const lines = fs.readFileSync(auditPath, "utf8").split("\n").filter(l => l.trim() !== "");
        if (lines.length === 0) {
          failures.push({ rule: "AUDIT_LOG_EMPTY", row: id, detail: `${auditPath} has no events` });
          summary.validation_status = "FAIL";
          summary.audit_log_status = "EMPTY";
        } else {
          auditFirstEvent = JSON.parse(lines[0]);
        }
      } catch (e) {
        failures.push({ rule: "AUDIT_LOG_PARSE_FAILED", row: id, detail: String(e) });
        summary.validation_status = "FAIL";
        summary.audit_log_status = "PARSE_FAIL";
      }
      if (auditFirstEvent) {
        if (auditFirstEvent["correction_id"] !== id) {
          failures.push({ rule: "AUDIT_CORRECTION_ID_MISMATCH", row: id, detail: `audit first event correction_id='${auditFirstEvent["correction_id"]}' != queue id` });
          summary.validation_status = "FAIL";
          summary.audit_log_status = "ID_MISMATCH";
        }
        if (auditFirstEvent["action"] !== "intake_received") {
          failures.push({ rule: "AUDIT_FIRST_ACTION_NOT_INTAKE_RECEIVED", row: id, detail: `audit first event action='${auditFirstEvent["action"]}'` });
          summary.validation_status = "FAIL";
          summary.audit_log_status = "WRONG_FIRST_ACTION";
        }
        if (auditFirstEvent["previous_status"] !== "NONE" || auditFirstEvent["new_status"] !== "RECEIVED") {
          failures.push({ rule: "AUDIT_FIRST_STATUS_TRANSITION_INVALID", row: id, detail: `expected NONE → RECEIVED; got '${auditFirstEvent["previous_status"]}' → '${auditFirstEvent["new_status"]}'` });
          summary.validation_status = "FAIL";
          summary.audit_log_status = "WRONG_FIRST_TRANSITION";
        }
        if (summary.audit_log_status === "?") summary.audit_log_status = "OK";
      }
    }

    // Public runtime safety: active card → ok; staged card → must remain not-public
    if (summary.listing_resolution_status === "ACTIVE_ONLY" || summary.listing_resolution_status === "ACTIVE_AND_STAGED") {
      summary.public_runtime_safety_status = "ACTIVE_PUBLIC_OK";
    } else if (summary.listing_resolution_status === "STAGED_ONLY") {
      summary.public_runtime_safety_status = "STAGED_NOT_PUBLIC_OK";
    } else if (summary.listing_resolution_status === "GENERIC_FEEDBACK_NO_LISTING") {
      summary.public_runtime_safety_status = "GENERIC_OK";
    } else {
      summary.public_runtime_safety_status = "FAIL";
    }

    // Aggregate warnings text
    const myWarns = warnings.filter(w => w.row === id).map(w => w.rule);
    summary.warnings = myWarns.join("|");
    summaries.push(summary);
  }

  // Orphan audit logs (audit file with no matching queue item)
  for (const [stem, auditPath] of auditByCorrectionId) {
    if (!seenAuditMatches.has(stem)) {
      failures.push({ rule: "ORPHAN_AUDIT_LOG", row: stem, detail: `audit log ${auditPath} has no matching queue item under inbox/` });
    }
  }

  // Output
  console.log("=".repeat(60));
  console.log("P99-P97 Correction Queue Cross-Join Validator");
  console.log("=".repeat(60));
  console.log(`Queue root: ${queueRootAbs}`);
  console.log(`Queue items: ${queueFiles.length}`);
  console.log(`Audit logs: ${auditFiles.length}`);
  console.log(`Active runtime listing IDs: ${activeIds.size}`);
  console.log(`Staged runtime listing IDs: ${stagedIds.size}`);
  console.log(`Listing-map rows: ${listingMapByListingId.size}`);
  console.log(`Evidence-map rows: ${evidenceListingIds.size}`);

  for (const s of summaries) {
    console.log(`  [${s.validation_status}] ${s.correction_id}: listing=${s.listing_resolution_status}/ref=${s.report_ref_status}/audit=${s.audit_log_status}/evidence=${s.evidence_join_status}/forbidden=${s.forbidden_field_status}/public=${s.public_runtime_safety_status}`);
  }

  if (warnings.length > 0) {
    console.log(`\nWarnings: ${warnings.length}`);
    for (const w of warnings) console.log(`  [${w.rule}] row=${w.row}: ${w.detail}`);
  }

  if (failures.length === 0) {
    console.log(`\nOverall: PASSED — ${summaries.length} item(s) cross-joined cleanly.`);
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  process.exit(1);
}

main();
