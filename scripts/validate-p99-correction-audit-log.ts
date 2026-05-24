/**
 * P99-P97 Correction Audit Log Validator
 *
 * Validates one JSONL audit-log file OR all *.jsonl files under a directory tree.
 *
 * Run:
 *   npx tsx scripts/validate-p99-correction-audit-log.ts <path-to-jsonl-or-dir>
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { FORBIDDEN_PAYLOAD_KEYS_LOWER } from "../src/lib/usce-corrections/correction-intake-config";

const ALLOWED_STATUSES = new Set([
  "NONE",
  "RECEIVED", "TRIAGED", "SOURCE_RECHECK_PENDING", "SOURCE_RECHECK_COMPLETE",
  "NEEDS_COPY_UPDATE", "NEEDS_SOURCE_URL_UPDATE", "NEEDS_DELIST",
  "NO_CHANGE", "NEEDS_INSTITUTION_CONFIRMATION_LATER",
  "STAGED_CORRECTION", "VALIDATED_CORRECTION", "CLOSED",
]);
const ALLOWED_ACTIONS = new Set([
  "intake_received", "triaged", "source_recheck_started", "source_recheck_completed",
  "evidence_captured", "decision_made", "correction_staged", "validator_run",
  "qa_review_started", "qa_review_completed", "closed", "reopened_with_audit",
]);
const ALLOWED_DECISIONS = new Set([
  "no_decision_yet", "no_change", "copy_correction", "source_url_update",
  "eligibility_caveat_update", "delist_or_hide",
  "needs_institution_confirmation_later", "marked_spam",
  "rejected_forbidden_field",
]);
const REQUIRED_FIELDS = [
  "audit_event_id", "correction_id", "timestamp", "actor_role",
  "actor_id_or_placeholder", "action", "previous_status", "new_status",
  "evidence_checked", "source_urls_checked", "archive_urls_checked",
  "decision", "decision_reason", "changed_fields", "validator_results",
  "next_required_action",
];

interface Failure { rule: string; row: string; detail: string }

function gatherJsonl(p: string): string[] {
  const stat = fs.statSync(p);
  if (stat.isFile()) return p.endsWith(".jsonl") ? [p] : [];
  const out: string[] = [];
  function walk(dir: string): void {
    for (const e of fs.readdirSync(dir)) {
      const f = path.join(dir, e);
      const s = fs.statSync(f);
      if (s.isDirectory()) walk(f);
      else if (s.isFile() && f.endsWith(".jsonl") && !path.basename(f).startsWith(".")) out.push(f);
    }
  }
  walk(p);
  return out;
}

function validateLog(filePath: string): Failure[] {
  const failures: Failure[] = [];
  const id = path.basename(filePath);
  let lines: string[];
  try {
    lines = fs.readFileSync(filePath, "utf8").split("\n").filter((l) => l.trim() !== "");
  } catch (e) {
    failures.push({ rule: "READ_FAILED", row: id, detail: String(e) });
    return failures;
  }
  if (lines.length === 0) {
    failures.push({ rule: "EMPTY_LOG", row: id, detail: "audit log has zero events" });
    return failures;
  }

  const seenEventIds = new Set<string>();
  let prevTs = 0;
  for (let i = 0; i < lines.length; i++) {
    let ev: unknown;
    try { ev = JSON.parse(lines[i]); }
    catch (e) {
      failures.push({ rule: "EVENT_PARSE_FAILED", row: `${id}:${i + 1}`, detail: String(e) });
      continue;
    }
    if (!ev || typeof ev !== "object" || Array.isArray(ev)) {
      failures.push({ rule: "EVENT_NOT_OBJECT", row: `${id}:${i + 1}`, detail: "event must be a JSON object" });
      continue;
    }
    const r = ev as Record<string, unknown>;
    for (const f of REQUIRED_FIELDS) {
      if (!(f in r)) failures.push({ rule: "MISSING_REQUIRED_FIELD", row: `${id}:${i + 1}`, detail: `field '${f}' missing` });
    }
    // Forbidden-field defense: walk the whole event recursively.
    function deepScan(x: unknown, loc: string): void {
      if (x && typeof x === "object" && !Array.isArray(x)) {
        for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
          if (FORBIDDEN_PAYLOAD_KEYS_LOWER.has(k.toLowerCase())) {
            failures.push({ rule: "FORBIDDEN_FIELD_IN_AUDIT", row: `${id}:${i + 1}`, detail: `forbidden key '${k}' at ${loc}` });
          }
          deepScan(v, `${loc}.${k}`);
        }
      } else if (Array.isArray(x)) {
        for (let j = 0; j < x.length; j++) deepScan(x[j], `${loc}[${j}]`);
      }
    }
    deepScan(r, "(root)");

    if (typeof r["audit_event_id"] === "string") {
      if (!/^[0-9a-f]{32}$/.test(r["audit_event_id"] as string)) {
        failures.push({ rule: "BAD_EVENT_ID", row: `${id}:${i + 1}`, detail: `audit_event_id not 32 lowercase hex chars` });
      } else if (seenEventIds.has(r["audit_event_id"] as string)) {
        failures.push({ rule: "DUPLICATE_EVENT_ID", row: `${id}:${i + 1}`, detail: `audit_event_id appears more than once` });
      } else {
        seenEventIds.add(r["audit_event_id"] as string);
      }
    }
    if (typeof r["action"] === "string" && !ALLOWED_ACTIONS.has(r["action"] as string)) {
      failures.push({ rule: "INVALID_ACTION", row: `${id}:${i + 1}`, detail: `action '${r["action"]}' not in enum` });
    }
    if (typeof r["decision"] === "string" && !ALLOWED_DECISIONS.has(r["decision"] as string)) {
      failures.push({ rule: "INVALID_DECISION", row: `${id}:${i + 1}`, detail: `decision '${r["decision"]}' not in enum` });
    }
    for (const sf of ["previous_status", "new_status"]) {
      if (typeof r[sf] === "string" && !ALLOWED_STATUSES.has(r[sf] as string)) {
        failures.push({ rule: "INVALID_STATUS", row: `${id}:${i + 1}`, detail: `${sf} '${r[sf]}' not in enum` });
      }
    }
    // forbidden_field rejection MUST have changed_fields={}
    if (r["decision"] === "rejected_forbidden_field") {
      const cf = r["changed_fields"];
      if (!cf || typeof cf !== "object" || Object.keys(cf as object).length > 0) {
        failures.push({ rule: "REJECTED_FORBIDDEN_FIELD_MUST_HAVE_EMPTY_CHANGED_FIELDS", row: `${id}:${i + 1}`, detail: "changed_fields must be {} for rejected_forbidden_field events" });
      }
    }
    // Monotonic timestamp
    if (typeof r["timestamp"] === "string") {
      const ts = new Date(r["timestamp"] as string).getTime();
      if (Number.isFinite(ts)) {
        if (ts < prevTs - 60_000) {
          failures.push({ rule: "TIMESTAMP_REGRESSION", row: `${id}:${i + 1}`, detail: `timestamp decreases significantly` });
        }
        prevTs = Math.max(prevTs, ts);
      }
    }
  }

  return failures;
}

function main(): void {
  const argPath = process.argv[2];
  if (!argPath) {
    console.error("Usage: npx tsx scripts/validate-p99-correction-audit-log.ts <path>");
    process.exit(2);
  }
  const abs = path.resolve(argPath);
  if (!fs.existsSync(abs)) {
    console.error(`Path not found: ${abs}`);
    process.exit(2);
  }
  const files = gatherJsonl(abs);
  console.log("=".repeat(60));
  console.log("P99-P97 Correction Audit Log Validator");
  console.log("=".repeat(60));
  console.log(`Path: ${abs}`);
  console.log(`JSONL files: ${files.length}`);
  if (files.length === 0) {
    console.log("\nOverall: PASSED (no audit log files; OK for an empty audit dir).");
    process.exit(0);
  }
  let totalFails = 0;
  for (const f of files) {
    const fails = validateLog(f);
    if (fails.length === 0) {
      console.log(`  [PASS] ${path.relative(abs, f) || path.basename(f)}`);
    } else {
      totalFails += fails.length;
      console.log(`  [FAIL] ${path.relative(abs, f) || path.basename(f)} — ${fails.length} issue(s):`);
      for (const x of fails) console.log(`     [${x.rule}] ${x.detail}`);
    }
  }
  if (totalFails === 0) {
    console.log(`\nOverall: PASSED — ${files.length} log(s) clear.`);
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${totalFails} issue(s) across ${files.length} log(s).`);
  process.exit(1);
}

main();
