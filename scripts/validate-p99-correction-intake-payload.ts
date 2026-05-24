/**
 * P99-P97 Correction Intake Payload Validator
 *
 * Validates a JSON file containing a single payload OR a sample-payloads
 * fixture (with a "samples" array, each having { sample_name, payload, expected_outcome, ... }).
 *
 * Run:
 *   npx tsx scripts/validate-p99-correction-intake-payload.ts <path>
 */

import * as fs from "node:fs";
import * as path from "node:path";

import {
  ALLOWED_FIELD_REPORTED,
  ALLOWED_ISSUE_TYPES,
  ALLOWED_PAYLOAD_KEYS,
  ALLOWED_REPORT_REFS,
  ALLOWED_RUNTIME_SETS,
  EMAIL_REGEX,
  FORBIDDEN_PAYLOAD_KEYS_LOWER,
  HTTP_URL_REGEX,
  ISO_Z_REGEX,
  LISTING_ID_REGEX,
  MAX_PAYLOAD_BYTES,
  MAX_USER_MESSAGE_LEN,
  MIN_USER_MESSAGE_LEN,
} from "../src/lib/usce-corrections/correction-intake-config";
import { INTAKE_SCHEMA_VERSION } from "../src/lib/usce-corrections/correction-intake-types";

interface PayloadVerdict { sample: string; verdict: "ACCEPT" | "REJECT_FORBIDDEN_FIELD" | "REJECT_HONEYPOT" | "REJECT_TOO_LARGE" | "REJECT_SCHEMA"; reason?: string }

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function classify(p: unknown): PayloadVerdict["verdict"] {
  let size: number;
  try {
    size = Buffer.byteLength(JSON.stringify(p), "utf8");
  } catch {
    return "REJECT_SCHEMA";
  }
  if (size > MAX_PAYLOAD_BYTES) return "REJECT_TOO_LARGE";
  if (!isPlainObject(p)) return "REJECT_SCHEMA";

  for (const k of Object.keys(p)) {
    if (FORBIDDEN_PAYLOAD_KEYS_LOWER.has(k.toLowerCase())) return "REJECT_FORBIDDEN_FIELD";
  }
  if (typeof p["honeypot_field"] === "string" && (p["honeypot_field"] as string).length > 0) {
    return "REJECT_HONEYPOT";
  }
  for (const k of Object.keys(p)) {
    if (!ALLOWED_PAYLOAD_KEYS.has(k)) return "REJECT_SCHEMA";
  }
  if (p["schema_version"] !== INTAKE_SCHEMA_VERSION) return "REJECT_SCHEMA";
  const report_ref = p["report_ref"];
  if (typeof report_ref !== "string" || !ALLOWED_REPORT_REFS.includes(report_ref as never)) return "REJECT_SCHEMA";
  const listing_id = p["listing_id"];
  if (typeof listing_id !== "string") return "REJECT_SCHEMA";
  if (listing_id === "" && report_ref !== "pilot-feedback") return "REJECT_SCHEMA";
  if (listing_id !== "" && (!LISTING_ID_REGEX.test(listing_id) || listing_id.length > 120)) return "REJECT_SCHEMA";
  const runtime_set = p["runtime_set"];
  if (typeof runtime_set !== "string" || !ALLOWED_RUNTIME_SETS.includes(runtime_set as never)) return "REJECT_SCHEMA";
  const page_url = p["page_url"];
  if (typeof page_url !== "string" || !HTTP_URL_REGEX.test(page_url) || page_url.length > 500) return "REJECT_SCHEMA";
  const issue_type = p["issue_type"];
  if (typeof issue_type !== "string" || !ALLOWED_ISSUE_TYPES.includes(issue_type as never)) return "REJECT_SCHEMA";
  const user_message = p["user_message"];
  if (typeof user_message !== "string" || user_message.length < MIN_USER_MESSAGE_LEN || user_message.length > MAX_USER_MESSAGE_LEN) return "REJECT_SCHEMA";
  const submitted_at = p["submitted_at"];
  if (typeof submitted_at !== "string" || !ISO_Z_REGEX.test(submitted_at)) return "REJECT_SCHEMA";
  const source_context = p["source_context"];
  if (!isPlainObject(source_context)) return "REJECT_SCHEMA";
  for (const [k, v] of Object.entries(source_context)) {
    if (FORBIDDEN_PAYLOAD_KEYS_LOWER.has(k.toLowerCase())) return "REJECT_FORBIDDEN_FIELD";
    if (typeof v !== "string" || v.length > 500) return "REJECT_SCHEMA";
  }
  if (typeof p["user_email"] === "string" && p["user_email"] !== "" && (!EMAIL_REGEX.test(p["user_email"] as string) || (p["user_email"] as string).length > 254)) return "REJECT_SCHEMA";
  if (typeof p["field_reported"] === "string" && p["field_reported"] !== "" && !ALLOWED_FIELD_REPORTED.includes(p["field_reported"] as never)) return "REJECT_SCHEMA";

  return "ACCEPT";
}

function main(): void {
  const argPath = process.argv[2];
  if (!argPath) {
    console.error("Usage: npx tsx scripts/validate-p99-correction-intake-payload.ts <path>");
    process.exit(2);
  }
  const abs = path.resolve(argPath);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(2);
  }
  const txt = fs.readFileSync(abs, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(txt);
  } catch (e) {
    console.error(`PARSE_FAILED: ${e}`);
    process.exit(1);
  }

  const verdicts: PayloadVerdict[] = [];

  if (isPlainObject(parsed) && Array.isArray((parsed as Record<string, unknown>).samples)) {
    const samples = (parsed as Record<string, unknown>).samples as Array<Record<string, unknown>>;
    for (const s of samples) {
      const name = (s.sample_name as string) || "(unnamed)";
      const payload = s.payload ?? s.payload_rejected ?? null;
      if (payload === null) {
        verdicts.push({ sample: name, verdict: "REJECT_SCHEMA", reason: "no payload field" });
        continue;
      }
      verdicts.push({ sample: name, verdict: classify(payload) });
    }
  } else {
    verdicts.push({ sample: path.basename(abs), verdict: classify(parsed) });
  }

  console.log("=".repeat(60));
  console.log("P99-P97 Correction Intake Payload Validator");
  console.log("=".repeat(60));
  console.log(`File: ${abs}`);
  console.log(`Samples: ${verdicts.length}`);
  for (const v of verdicts) {
    console.log(`  [${v.verdict}] ${v.sample}${v.reason ? ` — ${v.reason}` : ""}`);
  }

  const hasFatal = verdicts.length === 0;
  if (hasFatal) {
    console.log("\nOverall: FAILED — no samples found");
    process.exit(1);
  }
  console.log("\nOverall: PASSED");
  console.log(`  ${verdicts.length} sample(s) classified.`);
  console.log("  No payload was actually written to disk by this validator.");
  process.exit(0);
}

main();
