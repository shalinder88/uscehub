/**
 * P99-P97 Correction Queue Item Validator
 *
 * Validates a single queue item file OR all *.json files under a directory tree.
 *
 * Run:
 *   npx tsx scripts/validate-p99-correction-queue-item.ts <path-to-item-or-dir>
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { FORBIDDEN_PAYLOAD_KEYS_LOWER } from "../src/lib/usce-corrections/correction-intake-config";

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
const REQUIRED_FIELDS = [
  "correction_id", "schema_version", "status", "priority",
  "listing_id", "report_ref", "runtime_set", "issue_type",
  "submitted_at", "received_at", "received_channel",
  "user_message_redacted", "source_context", "evidence_join_key",
  "audit_log_path",
];

interface Failure { rule: string; row: string; detail: string }

function gatherJsonFiles(p: string): string[] {
  const stat = fs.statSync(p);
  if (stat.isFile()) return p.endsWith(".json") ? [p] : [];
  const out: string[] = [];
  function walk(dir: string): void {
    for (const e of fs.readdirSync(dir)) {
      const f = path.join(dir, e);
      const s = fs.statSync(f);
      if (s.isDirectory()) walk(f);
      else if (s.isFile() && f.endsWith(".json") && !path.basename(f).startsWith(".")) out.push(f);
    }
  }
  walk(p);
  return out;
}

function validateItem(filePath: string): Failure[] {
  const failures: Failure[] = [];
  const id = path.basename(filePath);
  let raw: unknown;
  try { raw = JSON.parse(fs.readFileSync(filePath, "utf8")); }
  catch (e) {
    failures.push({ rule: "PARSE_FAILED", row: id, detail: String(e) });
    return failures;
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    failures.push({ rule: "NOT_OBJECT", row: id, detail: "queue item must be a JSON object" });
    return failures;
  }
  const r = raw as Record<string, unknown>;
  for (const f of REQUIRED_FIELDS) {
    if (!(f in r)) failures.push({ rule: "MISSING_REQUIRED_FIELD", row: id, detail: `field '${f}' missing` });
  }
  // Forbidden field detection on every key (defense in depth).
  for (const k of Object.keys(r)) {
    if (FORBIDDEN_PAYLOAD_KEYS_LOWER.has(k.toLowerCase())) {
      failures.push({ rule: "FORBIDDEN_FIELD_PRESENT", row: id, detail: `forbidden key '${k}'` });
    }
  }
  if (typeof r["correction_id"] === "string" && !/^[0-9a-f]{32}$/.test(r["correction_id"] as string)) {
    failures.push({ rule: "BAD_CORRECTION_ID", row: id, detail: `correction_id '${r["correction_id"]}' not 32 lowercase hex chars` });
  }
  if (r["schema_version"] !== "v1") {
    failures.push({ rule: "BAD_SCHEMA_VERSION", row: id, detail: `schema_version must be 'v1'` });
  }
  if (typeof r["status"] === "string" && !ALLOWED_STATUSES.has(r["status"] as string)) {
    failures.push({ rule: "INVALID_STATUS", row: id, detail: `status '${r["status"]}' not in enum` });
  }
  if (typeof r["priority"] === "string" && !ALLOWED_PRIORITIES.has(r["priority"] as string)) {
    failures.push({ rule: "INVALID_PRIORITY", row: id, detail: `priority '${r["priority"]}' not in enum` });
  }
  if (typeof r["received_channel"] === "string") {
    const allowed = new Set(["web_form", "email_relay", "manual_curator_entry"]);
    if (!allowed.has(r["received_channel"] as string)) {
      failures.push({ rule: "INVALID_CHANNEL", row: id, detail: `received_channel '${r["received_channel"]}' not in enum` });
    }
  }
  // user_message_redacted must NOT contain SSN-shaped or credit-card-shaped digits.
  const um = r["user_message_redacted"];
  if (typeof um === "string") {
    if (/\b\d{3}-?\d{2}-?\d{4}\b/.test(um)) {
      failures.push({ rule: "REDACTION_LEAK_SSN_LIKE", row: id, detail: "user_message_redacted contains an SSN-shaped pattern" });
    }
    const ccDigitOnly = um.replace(/[ -]/g, "");
    if (/\b\d{13,19}\b/.test(ccDigitOnly)) {
      failures.push({ rule: "REDACTION_LEAK_CC_LIKE", row: id, detail: "user_message_redacted contains a credit-card-shaped pattern" });
    }
  }
  // received_at >= submitted_at
  const sa = r["submitted_at"];
  const ra = r["received_at"];
  if (typeof sa === "string" && typeof ra === "string") {
    try {
      if (new Date(ra).getTime() < new Date(sa).getTime() - 60_000) {
        failures.push({ rule: "RECEIVED_BEFORE_SUBMITTED", row: id, detail: `received_at ${ra} < submitted_at ${sa}` });
      }
    } catch { /* ignore */ }
  }
  return failures;
}

function main(): void {
  const argPath = process.argv[2];
  if (!argPath) {
    console.error("Usage: npx tsx scripts/validate-p99-correction-queue-item.ts <path-to-item-or-dir>");
    process.exit(2);
  }
  const abs = path.resolve(argPath);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(2);
  }
  const files = gatherJsonFiles(abs);
  console.log("=".repeat(60));
  console.log("P99-P97 Correction Queue Item Validator");
  console.log("=".repeat(60));
  console.log(`Path: ${abs}`);
  console.log(`Items found: ${files.length}`);
  if (files.length === 0) {
    console.log("\nOverall: PASSED (no queue items to validate; this is OK for an empty inbox).");
    process.exit(0);
  }
  let totalFails = 0;
  for (const f of files) {
    const fails = validateItem(f);
    if (fails.length === 0) {
      console.log(`  [PASS] ${path.relative(abs, f) || path.basename(f)}`);
    } else {
      totalFails += fails.length;
      console.log(`  [FAIL] ${path.relative(abs, f) || path.basename(f)} — ${fails.length} issue(s):`);
      for (const x of fails) console.log(`     [${x.rule}] ${x.detail}`);
    }
  }
  if (totalFails === 0) {
    console.log(`\nOverall: PASSED — ${files.length} queue item(s) clear.`);
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${totalFails} issue(s) across ${files.length} item(s).`);
  process.exit(1);
}

main();
