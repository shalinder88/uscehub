#!/usr/bin/env tsx
/**
 * P102-FIX in-place visibility re-classifier.
 *
 * Iterates an existing `13_model_claims_verified.json` ledger and re-runs
 * `classifyVisibility` over every claim, writing the updated visibility and
 * rationale back in place. Used after a classifier fix (e.g. P102-FIX Gap B
 * `deepSourceFamily` threading) to refresh existing ledgers without
 * re-calling the Claude CLI.
 *
 * No network. No Agent. No model calls. Pure deterministic re-run of the
 * library function.
 *
 * Usage:
 *   npx tsx scripts/p102-reclassify-ledger.ts --run-id p102-pc-1-msk
 *   npx tsx scripts/p102-reclassify-ledger.ts --all-existing-p102-runs
 *   npx tsx scripts/p102-reclassify-ledger.ts --run-id <id> --dry-run
 *
 * Writes:
 *   - 13_model_claims_verified.json (overwritten with new visibility + rationale)
 *   - reclassify_log.json (audit log: claimId, beforeVis, afterVis, deepSourceFamily)
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { classifyVisibility, type Visibility } from './p102-extraction-lib';

/**
 * Restrictiveness ordinal: 0 = most permissive, 5 = most restrictive.
 * The reclassifier never downgrades model strictness — when the model has
 * recorded a more restrictive visibility (e.g. HIDDEN_REJECTED with a
 * cross-campus mis-attribution rationale on Northwell), it had context the
 * deterministic re-classifier cannot see. Mirrors the asymmetric drift
 * logic in scripts/p102-quote-verify.ts.
 */
function restrictiveness(v: Visibility): number {
  switch (v) {
    case 'PUBLIC_SAFE_USCE': return 0;
    case 'PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY': return 1;
    case 'CAUTION_SAFE_INTERNAL_REVIEW': return 2;
    case 'FUTURE_LANE_ONLY': return 3;
    case 'HUMAN_REVIEW_REQUIRED': return 4;
    case 'HIDDEN_REJECTED': return 5;
    default: return 4;
  }
}

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');

interface VerifiedClaim {
  claimId: string;
  lane: string;
  sourceFamily: string;
  deepSourceFamily?: string | null;
  sourceScope: string;
  quote: string;
  visibility: Visibility;
  visibilityRationale: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  [k: string]: unknown;
}

interface Ledger {
  schemaVersion: string;
  count: number;
  claims: VerifiedClaim[];
  [k: string]: unknown;
}

function mapLane(lane: string): 'IMG_OBSERVERSHIP' | 'VISITING_MEDICAL_STUDENT' | 'RESEARCH_OPPORTUNITY' | 'NO_PUBLIC_OPPORTUNITY_FOUND' | 'CAREERS_PAGE' | 'RESIDENCY_PROGRAM_INFO' | 'FELLOWSHIP_PROGRAM_INFO' | 'PHYSICIAN_SERVICES' {
  switch (lane) {
    case 'IMG_OBSERVERSHIP': return 'IMG_OBSERVERSHIP';
    case 'OBSERVERSHIP': return 'IMG_OBSERVERSHIP';
    case 'PHYSICIAN_OBSERVERSHIP': return 'IMG_OBSERVERSHIP';
    case 'VISITING_MEDICAL_STUDENT': return 'VISITING_MEDICAL_STUDENT';
    case 'INTERNATIONAL_MEDICAL_STUDENT': return 'VISITING_MEDICAL_STUDENT';
    case 'CLINICAL_ELECTIVE': return 'VISITING_MEDICAL_STUDENT';
    case 'AWAY_ROTATION': return 'VISITING_MEDICAL_STUDENT';
    case 'SUB_INTERNSHIP': return 'VISITING_MEDICAL_STUDENT';
    case 'RESEARCH_OPPORTUNITY': return 'RESEARCH_OPPORTUNITY';
    case 'RESIDENCY_PROGRAM_INFO': return 'RESIDENCY_PROGRAM_INFO';
    case 'FELLOWSHIP_PROGRAM_INFO': return 'FELLOWSHIP_PROGRAM_INFO';
    case 'ADVANCED_FELLOWSHIP': return 'FELLOWSHIP_PROGRAM_INFO';
    case 'CAREERS_PAGE': return 'CAREERS_PAGE';
    case 'PHYSICIAN_SERVICES': return 'PHYSICIAN_SERVICES';
    case 'NO_PUBLIC_OPPORTUNITY_FOUND': return 'NO_PUBLIC_OPPORTUNITY_FOUND';
    default: return 'NO_PUBLIC_OPPORTUNITY_FOUND';
  }
}

function processRun(runId: string, dryRun: boolean): { changes: number; total: number; entries: Array<Record<string, unknown>> } {
  const ledgerPath = path.join(RUNS_DIR, runId, '13_model_claims_verified.json');
  if (!existsSync(ledgerPath)) {
    return { changes: 0, total: 0, entries: [] };
  }
  const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8')) as Ledger;
  let changes = 0;
  const entries: Array<Record<string, unknown>> = [];

  for (const c of ledger.claims) {
    const beforeVis = c.visibility;
    const reclass = classifyVisibility({
      sourceFamily: c.sourceFamily,
      deepSourceFamily: c.deepSourceFamily ?? null,
      sourceScope: c.sourceScope,
      matchedLane: mapLane(c.lane),
      campusApplicabilityProof: null,
      modelReaderConfidence: c.confidence,
      quoteIsNotStated: c.quote === 'NOT_STATED_ON_SOURCE',
    });
    // Never UN-HIDE a claim the model actively rejected. HIDDEN_REJECTED is
    // the model's active scope-mismatch / cross-campus / wrong-institution
    // signal (Northwell Cohen Children's pattern). The deterministic
    // re-classifier doesn't see the rationale and would otherwise wrongly
    // promote. Other "stricter" states (CAUTION_SAFE, HUMAN_REVIEW) are the
    // model's default conservative path — those can be safely upgraded by
    // the deterministic classifier when Gap B / Gap C / Gap A apply.
    const keepBecauseModelHidden = beforeVis === 'HIDDEN_REJECTED';
    if (reclass.visibility !== beforeVis && !keepBecauseModelHidden) {
      changes++;
      entries.push({
        claimId: c.claimId,
        lane: c.lane,
        sourceFamily: c.sourceFamily,
        deepSourceFamily: c.deepSourceFamily ?? null,
        sourceScope: c.sourceScope,
        confidence: c.confidence,
        beforeVisibility: beforeVis,
        afterVisibility: reclass.visibility,
        afterRationale: reclass.notPublicReason,
      });
      if (!dryRun) {
        c.visibility = reclass.visibility;
        c.visibilityRationale = reclass.notPublicReason;
      }
    }
  }

  if (!dryRun && changes > 0) {
    writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
    const logPath = path.join(RUNS_DIR, runId, 'reclassify_log.json');
    writeFileSync(
      logPath,
      JSON.stringify({ runId, ranAt: new Date().toISOString(), total: ledger.claims.length, changes, entries }, null, 2) + '\n',
    );
  }

  return { changes, total: ledger.claims.length, entries };
}

function main(): void {
  const argv = process.argv.slice(2);
  let runIds: string[] = [];
  let dryRun = false;
  let allRuns = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-id') runIds.push(argv[++i]);
    else if (a === '--all-existing-p102-runs') allRuns = true;
    else if (a === '--dry-run') dryRun = true;
  }

  if (allRuns) {
    runIds = readdirSync(RUNS_DIR).filter(n => /^p102-/.test(n));
  }

  if (runIds.length === 0) {
    console.error('usage: p102-reclassify-ledger.ts --run-id <id> [--dry-run] | --all-existing-p102-runs [--dry-run]');
    process.exit(2);
  }

  console.log('P102 in-place reclassifier');
  console.log(`  runs: ${runIds.length}${dryRun ? '  (DRY RUN)' : ''}`);

  let totalChanges = 0;
  let totalClaims = 0;
  const allEntries: Array<{ runId: string; entries: Array<Record<string, unknown>> }> = [];
  for (const runId of runIds) {
    const r = processRun(runId, dryRun);
    totalChanges += r.changes;
    totalClaims += r.total;
    if (r.entries.length > 0) allEntries.push({ runId, entries: r.entries });
    if (r.total > 0) {
      console.log(`  [${dryRun ? 'DRY' : 'OK '}] ${runId}: ${r.changes}/${r.total} claims reclassified`);
    }
  }
  console.log(`\nTotal: ${totalChanges} reclassifications across ${totalClaims} claims in ${runIds.length} runs.`);

  if (allEntries.length > 0 && dryRun) {
    console.log('\nDry-run details:');
    for (const { runId, entries } of allEntries) {
      console.log(`  ${runId}:`);
      for (const e of entries) {
        console.log(`    ${e.claimId}: ${e.beforeVisibility} → ${e.afterVisibility} [lane=${e.lane} deep=${e.deepSourceFamily ?? '-'}]`);
      }
    }
  }
}

main();
