/**
 * P99-P97 Correction Intake — Smoke driver
 *
 * Reads the sample-payloads fixture, runs validation + (when configured) the
 * file-queue writer against a test-only queue root. NEVER writes to the real
 * queue root. Defaults to dry-run mode unless --commit is passed.
 *
 * Run:
 *   npx tsx scripts/correction-intake-smoke.ts \
 *     docs/platform-v2/local/usce-completeness/correction-intake-file-queue-implementation-1/correction_intake_file_queue_implementation_1_sample_payloads.json \
 *     --commit
 */

import * as fs from "node:fs";
import * as path from "node:path";

const args = process.argv.slice(2);
const commitFlag = args.includes("--commit");
const samplesPath = args.find((a) => !a.startsWith("--"));

if (!samplesPath) {
  console.error("Usage: npx tsx scripts/correction-intake-smoke.ts <samples.json> [--commit]");
  process.exit(2);
}

const REPO_ROOT = path.resolve(__dirname, "..");
const TEST_QUEUE_ROOT = path.resolve(
  REPO_ROOT,
  "docs/platform-v2/local/usce-completeness/correction-intake-file-queue-implementation-1/test-output"
);

// Set the test-only queue root + flag BEFORE importing the writer (which reads env at function-call time).
process.env.USCE_CORRECTION_INTAKE_ENABLED = commitFlag ? "true" : "false";
process.env.USCE_CORRECTION_QUEUE_ROOT = TEST_QUEUE_ROOT;

// Defense-in-depth: refuse if the queue root resolves outside the sprint folder.
const resolvedQueueRoot = path.resolve(process.env.USCE_CORRECTION_QUEUE_ROOT);
const sprintAbs = path.resolve(REPO_ROOT, "docs/platform-v2/local/usce-completeness/correction-intake-file-queue-implementation-1");
if (!resolvedQueueRoot.startsWith(sprintAbs + path.sep) && resolvedQueueRoot !== sprintAbs + "/test-output") {
  // Allow exactly the sprint test-output root.
  if (resolvedQueueRoot !== TEST_QUEUE_ROOT) {
    console.error(`Refusing to write outside the sprint test-output sandbox. Resolved: ${resolvedQueueRoot}`);
    process.exit(2);
  }
}

import { validateIntakePayload } from "../src/lib/usce-corrections/correction-intake-validate";
import { writeCorrectionToQueue } from "../src/lib/usce-corrections/correction-file-queue";

interface Sample { sample_name: string; expected_outcome: string; payload?: Record<string, unknown> }

const fixture = JSON.parse(fs.readFileSync(path.resolve(samplesPath), "utf8")) as { samples: Sample[] };
const samples = Array.isArray(fixture.samples) ? fixture.samples : [];

let pass = 0;
let fail = 0;

console.log("=".repeat(60));
console.log("P99-P97 Correction Intake Smoke Driver");
console.log("=".repeat(60));
console.log(`Samples: ${samples.length}`);
console.log(`Mode: ${commitFlag ? "COMMIT (writes to test-output)" : "DRY-RUN (no writes)"}`);
console.log(`Test queue root: ${TEST_QUEUE_ROOT}`);

for (const s of samples) {
  const v = validateIntakePayload(s.payload);
  const expected = s.expected_outcome;
  let actualLabel: string;
  if (v.ok) {
    actualLabel = "ACCEPT";
  } else {
    actualLabel = `REJECT_${v.rejected_reason.toUpperCase()}`;
  }
  // Map fixture's "REJECT_SCHEMA" / "REJECT_FORBIDDEN_FIELD" / "REJECT_HONEYPOT" / "ACCEPT" to validator output
  const expectedNorm = expected
    .replace("REJECT_SCHEMA", "REJECT_SCHEMA_VIOLATION")
    .replace("REJECT_FORBIDDEN_FIELD", "REJECT_FORBIDDEN_FIELD")
    .replace("REJECT_HONEYPOT", "REJECT_HONEYPOT_TRIPPED")
    .replace("REJECT_TOO_LARGE", "REJECT_TOO_LARGE");
  const actualNorm = v.ok ? "ACCEPT" : `REJECT_${v.rejected_reason.toUpperCase()}`;
  const ok = actualNorm === expectedNorm;
  if (ok) pass++;
  else fail++;
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${s.sample_name}: expected=${expected} actual=${actualNorm}`);

  if (ok && v.ok && commitFlag) {
    const w = writeCorrectionToQueue(v.payload);
    if (w.ok) {
      console.log(`     wrote queue=${w.queue_item_path_relative} audit=${w.audit_log_path_relative}`);
    } else {
      console.log(`     write skipped (${w.skipped_reason})`);
    }
  }
}

console.log(`\nResult: ${pass}/${samples.length} matches expected outcome.`);
if (fail > 0) {
  console.log(`FAIL: ${fail} mismatch(es).`);
  process.exit(1);
}
console.log("PASS.");
process.exit(0);
