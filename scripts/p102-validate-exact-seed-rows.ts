#!/usr/bin/env tsx
/**
 * P102 Exact-Seed Validator — Phase F.
 *
 * Verifies the outputs of `p102-run-exact-usce-seed-links.ts` against
 * the spec in `P102_EXACT_LINK_SEED_EXTRACTION_SPEC.md` §5 + §6.
 *
 * Exits 0 if all checks pass. Exits 1 on any failure.
 *
 * Usage:
 *   npx tsx scripts/p102-validate-exact-seed-rows.ts
 */

import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');
const SEED_CSV = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/queues/p102_exact_usce_seed_links.csv');

const FILES = {
  public:   path.join(EXPORTS_DIR, 'exact_seed_public_safe_rows.json'),
  hold:     path.join(EXPORTS_DIR, 'exact_seed_hold_rows.json'),
  rejected: path.join(EXPORTS_DIR, 'exact_seed_rejected_rows.json'),
  dupes:    path.join(EXPORTS_DIR, 'exact_seed_duplicate_clusters.json'),
  report:   path.join(EXPORTS_DIR, 'exact_seed_run_report.json'),
};

type CheckResult = { name: string; passed: boolean; detail: string };
const check = (name: string, passed: boolean, detail: string): CheckResult => ({ name, passed, detail });

const VALID_AUDIENCE = new Set([
  'US_MD_DO_VISITING_STUDENT', 'INTERNATIONAL_MEDICAL_STUDENT',
  'IMG_GRADUATE_OBSERVER', 'IMG_GRADUATE_EXTERNSHIP',
  'BOTH_STUDENT_AND_IMG_GRADUATE', 'UNKNOWN_HOLD',
]);
const FORBIDDEN_AUDIENCE = new Set(['PHARMACY_ONLY', 'ALLIED_HEALTH_ONLY', 'RESIDENT_FELLOW_ONLY']);
const VALID_OPP_TYPE = new Set([
  'VISITING_MEDICAL_STUDENT_ELECTIVE', 'CLINICAL_ELECTIVE', 'OBSERVERSHIP',
  'EXTERNSHIP', 'SUB_INTERNSHIP', 'CLERKSHIP', 'INTERNATIONAL_VISITING_STUDENT',
  'IMG_OBSERVERSHIP', 'OTHER_USCE',
]);
const VALID_RUN_STATUS = new Set(['PENDING', 'FETCHED', 'EXTRACTED', 'FAILED_FETCH', 'FAILED_EXTRACT']);
const VALID_FINAL_STATUS = new Set(['PENDING', 'AUTO_PROMOTE', 'HOLD_REVIEW', 'REJECTED', 'FAILED']);

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') inQ = false; else cur += ch; }
    else { if (ch === ',') { cells.push(cur); cur = ''; } else if (ch === '"') inQ = true; else cur += ch; }
  }
  cells.push(cur);
  return cells;
}

function main(): void {
  const results: CheckResult[] = [];

  // 1. Seed CSV exists + parses
  results.push(check('seed CSV exists', existsSync(SEED_CSV), SEED_CSV));
  if (!existsSync(SEED_CSV)) return report(results, 1);

  const csvText = readFileSync(SEED_CSV, 'utf8');
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  results.push(check('seed CSV has at least 1 data row', lines.length >= 2, `lines=${lines.length}`));
  const header = splitCsvLine(lines[0]);
  const requiredCols = ['seedId', 'institutionId', 'institutionName', 'sourceUrl', 'expectedAudience', 'expectedOpportunityType', 'runStatus', 'finalStatus'];
  const missingCols = requiredCols.filter(c => !header.includes(c));
  results.push(check('seed CSV has all required columns', missingCols.length === 0, missingCols.join(',') || 'all present'));

  // 2. Every seed has sourceUrl + valid audience/type
  const idx: Record<string, number> = {};
  header.forEach((h, i) => { idx[h] = i; });
  let seedsWithUrl = 0, badAudienceSeeds = 0, badTypeSeeds = 0;
  for (let i = 1; i < lines.length; i++) {
    const c = splitCsvLine(lines[i]);
    if (c[idx.sourceUrl]?.startsWith('http')) seedsWithUrl++;
    if (!VALID_AUDIENCE.has(c[idx.expectedAudience])) badAudienceSeeds++;
    if (!VALID_OPP_TYPE.has(c[idx.expectedOpportunityType])) badTypeSeeds++;
  }
  const dataRows = lines.length - 1;
  results.push(check('every seed has https sourceUrl', seedsWithUrl === dataRows, `${seedsWithUrl}/${dataRows}`));
  results.push(check('every seed has valid expectedAudience', badAudienceSeeds === 0, `${badAudienceSeeds} invalid`));
  results.push(check('every seed has valid expectedOpportunityType', badTypeSeeds === 0, `${badTypeSeeds} invalid`));

  // 3. Output files exist (if runner has been executed)
  const allOutputsExist = Object.values(FILES).every(p => existsSync(p));
  results.push(check('all output files exist', allOutputsExist, allOutputsExist ? 'all present' : 'run the runner first'));
  if (!allOutputsExist) return report(results, 1);

  const publicFile   = JSON.parse(readFileSync(FILES.public, 'utf8'));
  const holdFile     = JSON.parse(readFileSync(FILES.hold, 'utf8'));
  const rejectedFile = JSON.parse(readFileSync(FILES.rejected, 'utf8'));
  const dupesFile    = JSON.parse(readFileSync(FILES.dupes, 'utf8'));
  const reportFile   = JSON.parse(readFileSync(FILES.report, 'utf8'));

  const publicRows   = publicFile.rows ?? [];
  const holdRows     = holdFile.rows ?? [];
  const rejectedRows = rejectedFile.rows ?? [];
  const allRows = [...publicRows, ...holdRows, ...rejectedRows];

  // 4. Count consistency
  results.push(check('public totalRows matches array', publicFile.totalRows === publicRows.length, `${publicFile.totalRows} vs ${publicRows.length}`));
  results.push(check('hold totalHolds matches array', holdFile.totalHolds === holdRows.length, `${holdFile.totalHolds} vs ${holdRows.length}`));
  results.push(check('rejected totalRejected matches array', rejectedFile.totalRejected === rejectedRows.length, `${rejectedFile.totalRejected} vs ${rejectedRows.length}`));

  // 5. Every public row has sourceQuote, sourceUrl, sourceHash
  const pubMissingEvidence = publicRows.filter((r: { topQuote?: string; sourceUrl?: string; sourceHash?: string }) =>
    !r.topQuote || r.topQuote.length < 10 || !r.sourceUrl || !r.sourceHash);
  results.push(check('public rows have quote+url+hash', pubMissingEvidence.length === 0, `${pubMissingEvidence.length} missing`));

  // 6. Every public row has directLinkStatus VALID_DIRECT_USCE_SOURCE
  const pubNonValidDl = publicRows.filter((r: { directLinkStatus?: string }) => r.directLinkStatus !== 'VALID_DIRECT_USCE_SOURCE');
  results.push(check('public rows are VALID_DIRECT_USCE_SOURCE only', pubNonValidDl.length === 0, `${pubNonValidDl.length} non-VALID`));

  // 7. No forbidden audiences anywhere
  const forbidden = allRows.filter((r: { audienceClass?: string }) => FORBIDDEN_AUDIENCE.has(r.audienceClass ?? ''));
  results.push(check('no pharmacy/allied/residency audience in outputs', forbidden.length === 0, `${forbidden.length} forbidden rows`));

  // 8. Audience class required on every row
  const noAud = allRows.filter((r: { audienceClass?: string }) => !r.audienceClass);
  results.push(check('every row has audienceClass', noAud.length === 0, `${noAud.length} missing`));

  // 9. No duplicate opportunitySignatures within public rows
  const pubSigs = publicRows.map((r: { opportunitySignature?: string }) => r.opportunitySignature);
  results.push(check('public rows: no duplicate signatures', new Set(pubSigs).size === pubSigs.length, `${pubSigs.length} rows / ${new Set(pubSigs).size} unique`));

  // 10. Hold rows have holdReasons
  const holdNoReason = holdRows.filter((r: { holdReasons?: unknown[] }) => !Array.isArray(r.holdReasons) || r.holdReasons.length === 0);
  results.push(check('hold rows have at least one holdReason', holdNoReason.length === 0, `${holdNoReason.length} missing`));

  // 11. Rejected rows have rejectionReason
  const rejNoReason = rejectedRows.filter((r: { rejectionReason?: string | null }) => !r.rejectionReason);
  results.push(check('rejected rows have rejectionReason', rejNoReason.length === 0, `${rejNoReason.length} missing`));

  // 12. Seed finalStatus values valid in report
  const seedResults = reportFile.seedResults ?? [];
  const badStatus = seedResults.filter((s: { finalStatus?: string; runStatus?: string }) =>
    !VALID_FINAL_STATUS.has(s.finalStatus ?? '') || !VALID_RUN_STATUS.has(s.runStatus ?? ''));
  results.push(check('seed run/final status values valid', badStatus.length === 0, `${badStatus.length} bad`));

  // 13. No row in both public and hold (by rowId)
  const pubIds = new Set(publicRows.map((r: { rowId?: string }) => r.rowId));
  const holdIds = new Set(holdRows.map((r: { rowId?: string }) => r.rowId));
  const overlap = [...pubIds].filter(id => holdIds.has(id));
  results.push(check('no row in both public and hold', overlap.length === 0, overlap.length > 0 ? overlap.join(',') : 'disjoint'));

  // 14. No private T7 path leaked anywhere
  const json = JSON.stringify({ publicFile, holdFile, rejectedFile });
  const t7 = /\/Volumes\/T7/.test(json);
  results.push(check('no /Volumes/T7 path in outputs', !t7, t7 ? 'leaked' : 'clean'));

  // 15. Duplicate clusters file is well-formed
  results.push(check('dupes clusters totalClusters matches', (dupesFile.clusters ?? []).length === (dupesFile.totalClusters ?? 0), `array=${(dupesFile.clusters ?? []).length} totalClusters=${dupesFile.totalClusters ?? 0}`));

  report(results, results.some(r => !r.passed) ? 1 : 0);
}

function report(results: CheckResult[], exitCode: number): void {
  const pass = results.filter(r => r.passed).length;
  const fail = results.length - pass;
  console.log('P102 exact-seed validator');
  console.log(`  ${pass} passed, ${fail} failed\n`);
  for (const r of results) {
    console.log(`${r.passed ? '  PASS' : '  FAIL'}  ${r.name}`);
    if (!r.passed) console.log(`        ${r.detail}`);
  }
  console.log(fail === 0 ? '\n  All checks passed.' : `\n  ${fail} check(s) FAILED.`);
  process.exit(exitCode);
}

main();
