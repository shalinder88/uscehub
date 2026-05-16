#!/usr/bin/env tsx
/**
 * P102 Phase K — Intelligent Opportunity Row Validator.
 *
 * Validates the outputs produced by Phase F (intelligent row builder).
 * Checks data integrity, internal consistency, and pipeline contracts.
 *
 * Exits 0 if all checks pass. Exits 1 on any failure.
 *
 * Usage:
 *   npx tsx scripts/p102-validate-intelligent-opportunity-rows.ts
 */

import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { type IntelligentRowsFile, type OpportunityRow } from './p102-build-intelligent-opportunity-rows.js';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');

const FILES = {
  public:   path.join(EXPORTS_DIR, 'intelligent_public_safe_rows.json'),
  hold:     path.join(EXPORTS_DIR, 'intelligent_hold_rows.json'),
  rejected: path.join(EXPORTS_DIR, 'intelligent_rejected_rows.json'),
  dupes:    path.join(EXPORTS_DIR, 'intelligent_duplicate_clusters.json'),
  queue:    path.join(EXPORTS_DIR, 'intelligent_review_queue.json'),
};

type CheckResult = { name: string; passed: boolean; detail: string };

function check(name: string, passed: boolean, detail: string): CheckResult {
  return { name, passed, detail };
}

function main(): void {
  const results: CheckResult[] = [];

  // ── 1. All output files exist ──────────────────────────────────────────

  for (const [label, p] of Object.entries(FILES)) {
    results.push(check(`file:${label} exists`, existsSync(p), p));
  }

  if (results.some(r => !r.passed)) {
    report(results);
    process.exit(1);
  }

  // ── Load all files ─────────────────────────────────────────────────────

  const publicFile   = JSON.parse(readFileSync(FILES.public,   'utf8'));
  const holdFile     = JSON.parse(readFileSync(FILES.hold,     'utf8'));
  const rejectedFile = JSON.parse(readFileSync(FILES.rejected, 'utf8'));
  const dupesFile    = JSON.parse(readFileSync(FILES.dupes,    'utf8'));
  const queueFile    = JSON.parse(readFileSync(FILES.queue,    'utf8'));

  const publicRows:   OpportunityRow[] = publicFile.rows ?? [];
  const holdRows:     OpportunityRow[] = holdFile.rows ?? [];
  const rejectedRows: OpportunityRow[] = rejectedFile.rows ?? [];
  const queueEntries: unknown[] = queueFile.entries ?? [];

  // ── 2. Row counts match declared totals ───────────────────────────────

  results.push(check(
    'public count matches',
    publicFile.totalRows === publicRows.length,
    `declared ${publicFile.totalRows}, actual ${publicRows.length}`,
  ));
  results.push(check(
    'hold count matches',
    holdFile.totalHolds === holdRows.length,
    `declared ${holdFile.totalHolds}, actual ${holdRows.length}`,
  ));
  results.push(check(
    'rejected count matches',
    rejectedFile.totalRejected === rejectedRows.length,
    `declared ${rejectedFile.totalRejected}, actual ${rejectedRows.length}`,
  ));

  // ── 3. Review queue = hold rows (HOLD_REVIEW route) ──────────────────

  results.push(check(
    'queue count equals hold count',
    queueFile.count === holdRows.length,
    `queue ${queueFile.count}, hold rows ${holdRows.length}`,
  ));
  results.push(check(
    'queue entry count matches declared',
    queueEntries.length === queueFile.count,
    `entries array ${queueEntries.length}, declared ${queueFile.count}`,
  ));

  // ── 4. No pharmacy/residency/careers in any output ────────────────────

  const BAD_AUDIENCE = new Set(['PHARMACY_ONLY', 'ALLIED_HEALTH_ONLY', 'RESIDENT_FELLOW_ONLY']);
  const allRows = [...publicRows, ...holdRows, ...rejectedRows];
  const badAudienceRows = allRows.filter(r => BAD_AUDIENCE.has(r.audienceClass));
  results.push(check(
    'no pharmacy/allied/residency rows in outputs',
    badAudienceRows.length === 0,
    badAudienceRows.length > 0
      ? `found: ${badAudienceRows.map(r => r.audienceClass + '@' + r.sourceUrl).join('; ')}`
      : 'none found',
  ));

  // ── 5. No duplicate rowIds across all outputs ──────────────────────────

  const allIds = allRows.map(r => r.rowId);
  const uniqueIds = new Set(allIds);
  results.push(check(
    'no duplicate rowIds',
    allIds.length === uniqueIds.size,
    `total ${allIds.length}, unique ${uniqueIds.size}`,
  ));

  // ── 6. No duplicate opportunitySignatures within public rows ──────────

  const pubSigs = publicRows.map(r => r.opportunitySignature);
  const uniquePubSigs = new Set(pubSigs);
  results.push(check(
    'public rows: no duplicate signatures',
    pubSigs.length === uniquePubSigs.size,
    `total ${pubSigs.length}, unique ${uniquePubSigs.size}`,
  ));

  // ── 7. All public rows have required fields ───────────────────────────

  const REQUIRED_FIELDS: (keyof OpportunityRow)[] = [
    'rowId', 'opportunitySignature', 'institutionId', 'institutionName',
    'sourceUrl', 'canonicalUrl', 'opportunityType', 'audienceClass',
    'topQuote', 'triageDecision', 'directLinkStatus', 'route',
  ];
  const missingField = publicRows.flatMap(r =>
    REQUIRED_FIELDS.filter(f => !r[f]).map(f => `${r.rowId}.${f}`),
  );
  results.push(check(
    'public rows: all required fields present',
    missingField.length === 0,
    missingField.length > 0 ? `missing: ${missingField.join(', ')}` : 'all present',
  ));

  // ── 8. All public rows have route AUTO_PROMOTE ────────────────────────

  const nonAutoPromote = publicRows.filter(r => r.route !== 'AUTO_PROMOTE');
  results.push(check(
    'public rows: all have route AUTO_PROMOTE',
    nonAutoPromote.length === 0,
    nonAutoPromote.length > 0
      ? `non-AUTO_PROMOTE in public file: ${nonAutoPromote.map(r => r.rowId).join(', ')}`
      : 'all AUTO_PROMOTE',
  ));

  // ── 9. All hold rows have at least one holdReason ────────────────────

  const holdNoReason = holdRows.filter(r => (r.holdReasons ?? []).length === 0);
  results.push(check(
    'hold rows: all have at least one holdReason',
    holdNoReason.length === 0,
    holdNoReason.length > 0 ? `rows missing holdReason: ${holdNoReason.map(r => r.rowId).join(', ')}` : 'all have reasons',
  ));

  // ── 10. No row appears in both public and hold ────────────────────────

  const pubIdSet = new Set(publicRows.map(r => r.rowId));
  const holdIdSet = new Set(holdRows.map(r => r.rowId));
  const overlap = [...pubIdSet].filter(id => holdIdSet.has(id));
  results.push(check(
    'no row in both public and hold',
    overlap.length === 0,
    overlap.length > 0 ? `overlap: ${overlap.join(', ')}` : 'disjoint',
  ));

  // ── 11. Pipeline size check: review queue < 50 per run ───────────────

  results.push(check(
    'review queue under 50 (per-run target)',
    queueEntries.length < 50,
    `${queueEntries.length} entries`,
  ));

  // ── 12. All valid audience classes ────────────────────────────────────

  const VALID_AUDIENCES = new Set([
    'US_MD_DO_VISITING_STUDENT', 'INTERNATIONAL_MEDICAL_STUDENT',
    'IMG_GRADUATE_OBSERVER', 'IMG_GRADUATE_EXTERNSHIP',
    'BOTH_STUDENT_AND_IMG_GRADUATE', 'US_MD_DO_ONLY', 'UNKNOWN_HOLD',
    'PHARMACY_ONLY', 'ALLIED_HEALTH_ONLY', 'RESIDENT_FELLOW_ONLY',
  ]);
  const invalidAud = allRows.filter(r => !VALID_AUDIENCES.has(r.audienceClass));
  results.push(check(
    'all audience classes valid',
    invalidAud.length === 0,
    invalidAud.length > 0 ? `invalid: ${invalidAud.map(r => r.audienceClass).join(', ')}` : 'all valid',
  ));

  // ── Report ─────────────────────────────────────────────────────────────

  report(results);

  const failures = results.filter(r => !r.passed);
  if (failures.length > 0) process.exit(1);
}

function report(results: CheckResult[]): void {
  const pass = results.filter(r => r.passed).length;
  const fail = results.filter(r => !r.passed).length;

  console.log('P102 intelligent row validator');
  console.log(`  ${pass} passed, ${fail} failed\n`);

  for (const r of results) {
    const icon = r.passed ? '  PASS' : '  FAIL';
    console.log(`${icon}  ${r.name}`);
    if (!r.passed) console.log(`        ${r.detail}`);
  }

  if (fail === 0) {
    console.log('\n  All checks passed.');
  } else {
    console.log(`\n  ${fail} check(s) FAILED.`);
  }
}

main();
