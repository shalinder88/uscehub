#!/usr/bin/env tsx
/**
 * P102 standalone quote verifier.
 *
 * Re-runs deterministic quote verification + visibility re-classification on
 * an existing `13_model_claims_verified.json` ledger. Independent of the
 * CLI extractor so it can be re-invoked at any time (e.g. after cleaned
 * text has been re-extracted, or to verify a hand-edited claims file).
 *
 * No network. No Agent. Pure file I/O over the run folder.
 *
 * Usage:
 *   npx tsx scripts/p102-quote-verify.ts --run-id p102-1-trial-2-run-1
 *   npx tsx scripts/p102-quote-verify.ts --all-existing-p102-runs
 *   npx tsx scripts/p102-quote-verify.ts --run-id <id> --strict
 *
 * --strict: exit non-zero if any previously-verified claim now fails re-verification.
 *
 * Outputs per run:
 *   - quote_verify_report.json — re-check status per claim + counts.
 *   - quote_verify_report.md — human-readable summary.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';
import {
  isQuoteVerifiable,
  classifyVisibility,
  type Visibility,
} from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');
const CLEANED_TEXT_MAX_CHARS = 60_000;

interface VerifiedClaimOnDisk {
  claimId: string;
  claimType: string;
  lane: string;
  sourceUrl: string;
  sourceHash: string;
  cleanedTextPath: string;
  sourceScope: string;
  sourceFamily: string;
  /** P102-FIX: optional content-tagged family from deep model (A1/A2). */
  deepSourceFamily?: string | null;
  quote: string;
  normalizedField: string | null;
  claimText: string;
  visibility: Visibility;
  visibilityRationale: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  quoteVerified: boolean;
  limitations: string | null;
  phaseProducedBy?: string;
}

interface ClaimsLedger {
  schemaVersion: string;
  count: number;
  claims: VerifiedClaimOnDisk[];
}

interface VerifyCheck {
  claimId: string;
  status: 'OK' | 'QUOTE_NOT_IN_CLEANED_TEXT' | 'VISIBILITY_DRIFT' | 'VISIBILITY_DRIFT_MODEL_STRICTER' | 'CLEANED_TEXT_MISSING' | 'NOT_STATED_FIELD_OK';
  details: string;
  reclassifiedVisibility?: Visibility | null;
}

/**
 * Restrictiveness ordinal: 0 = most permissive, 5 = most restrictive.
 * Drift is only a FAIL when recorded < reclassified (model over-promoted).
 * When recorded >= reclassified, model is using additional context (scope
 * mismatch, off-campus content, etc.) to be stricter — the deterministic
 * re-classifier is a SHALL_NOT_PROMOTE ceiling, not a SHALL_PROMOTE floor.
 */
function visibilityRestrictiveness(v: Visibility): number {
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

interface CliOptions {
  runIds: string[];
  strict: boolean;
  quiet: boolean;
  allExistingRuns: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { runIds: [], strict: false, quiet: false, allExistingRuns: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-id') { opts.runIds.push(argv[++i]); continue; }
    if (a === '--all-existing-p102-runs') {
      opts.allExistingRuns = true;
      const entries = readdirSync(RUNS_DIR).filter((e) => {
        const p = path.join(RUNS_DIR, e);
        if (!statSync(p).isDirectory()) return false;
        return existsSync(path.join(p, '13_model_claims_verified.json'));
      });
      opts.runIds.push(...entries);
      continue;
    }
    if (a === '--strict') { opts.strict = true; continue; }
    if (a === '--quiet') { opts.quiet = true; continue; }
    if (a === '--help' || a === '-h') { printUsage(); process.exit(0); }
    throw new Error(`unknown flag: ${a}`);
  }
  if (opts.runIds.length === 0 && !opts.allExistingRuns) {
    throw new Error('must pass --run-id <id> or --all-existing-p102-runs');
  }
  return opts;
}

function printUsage(): void {
  console.log('Usage: npx tsx scripts/p102-quote-verify.ts [flags]');
  console.log('  --run-id <id>                  verify one run');
  console.log('  --all-existing-p102-runs       verify all existing runs');
  console.log('  --strict                       exit non-zero on any re-verification failure');
  console.log('  --quiet                        less stdout chatter');
}

function readJson<T>(p: string): T { return JSON.parse(readFileSync(p, 'utf8')) as T; }
function writeJson(p: string, data: unknown): void {
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
function writeText(p: string, s: string): void {
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, s, 'utf8');
}

function safeReadCleanedText(srcPath: string): string | null {
  if (!srcPath || !existsSync(srcPath)) return null;
  const txt = readFileSync(srcPath, 'utf8');
  return txt.length > CLEANED_TEXT_MAX_CHARS ? txt.slice(0, CLEANED_TEXT_MAX_CHARS) : txt;
}

function mapLane(lane: string): 'IMG_OBSERVERSHIP' | 'VISITING_MEDICAL_STUDENT' | 'RESEARCH_OPPORTUNITY' | 'NO_PUBLIC_OPPORTUNITY_FOUND' | 'CAREERS_PAGE' | 'RESIDENCY_PROGRAM_INFO' | 'FELLOWSHIP_PROGRAM_INFO' | 'PHYSICIAN_SERVICES' {
  switch (lane) {
    case 'IMG_OBSERVERSHIP': return 'IMG_OBSERVERSHIP';
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

function verifyClaim(claim: VerifiedClaimOnDisk, cleanedText: string | null): VerifyCheck {
  // NOT_STATED quotes are honest absence markers and acceptable for MISSING_FIELD claimType only.
  if (claim.quote === 'NOT_STATED_ON_SOURCE') {
    if (claim.claimType === 'MISSING_FIELD') {
      return { claimId: claim.claimId, status: 'NOT_STATED_FIELD_OK', details: 'NOT_STATED_ON_SOURCE accepted for MISSING_FIELD claimType' };
    }
    return { claimId: claim.claimId, status: 'QUOTE_NOT_IN_CLEANED_TEXT', details: `NOT_STATED_ON_SOURCE used for non-MISSING_FIELD claimType "${claim.claimType}"` };
  }

  if (cleanedText === null) {
    return { claimId: claim.claimId, status: 'CLEANED_TEXT_MISSING', details: `cleaned text file not readable at ${claim.cleanedTextPath}` };
  }

  if (!isQuoteVerifiable(claim.quote, cleanedText)) {
    return { claimId: claim.claimId, status: 'QUOTE_NOT_IN_CLEANED_TEXT', details: `quote (len=${claim.quote.length}) is not a whitespace-normalized substring of cleaned text (len=${cleanedText.length})` };
  }

  // Re-classify visibility. P102-FIX: pass deepSourceFamily so the
  // re-classifier reaches the same conclusion as the in-extractor classifier
  // for claims discovered via JSON_LD / FIXED_PATH / SITEMAP whose content
  // is a Tier 1 USCE family.
  const reclass = classifyVisibility({
    sourceFamily: claim.sourceFamily,
    deepSourceFamily: claim.deepSourceFamily ?? null,
    sourceScope: claim.sourceScope,
    matchedLane: mapLane(claim.lane),
    campusApplicabilityProof: null,
    modelReaderConfidence: claim.confidence,
    quoteIsNotStated: claim.quote === 'NOT_STATED_ON_SOURCE',
  });

  if (reclass.visibility !== claim.visibility) {
    const recordedRestrict = visibilityRestrictiveness(claim.visibility);
    const reclassRestrict = visibilityRestrictiveness(reclass.visibility);
    // Model stricter or equal: not a failure — model has scope/context the
    // deterministic re-classifier cannot see (e.g. campus-level mismatch).
    if (recordedRestrict >= reclassRestrict) {
      return {
        claimId: claim.claimId,
        status: 'VISIBILITY_DRIFT_MODEL_STRICTER',
        details: `recorded "${claim.visibility}" is equal-or-stricter than re-classifier "${reclass.visibility}" (model used additional context to hide; not a public-safety risk)`,
        reclassifiedVisibility: reclass.visibility,
      };
    }
    // Model over-promoted relative to the deterministic ceiling — real failure.
    return {
      claimId: claim.claimId,
      status: 'VISIBILITY_DRIFT',
      details: `recorded visibility "${claim.visibility}" but re-classifier returned more-restrictive "${reclass.visibility}" (${reclass.notPublicReason ?? 'no rationale'})`,
      reclassifiedVisibility: reclass.visibility,
    };
  }

  return { claimId: claim.claimId, status: 'OK', details: 'quote verified + visibility consistent' };
}

interface RunReport {
  runId: string;
  ok: boolean;
  total: number;
  countByStatus: Record<string, number>;
  failureCount: number;
  checks: VerifyCheck[];
}

function verifyOneRun(runId: string, opts: CliOptions): RunReport {
  const runDir = path.join(RUNS_DIR, runId);
  const ledgerPath = path.join(runDir, '13_model_claims_verified.json');

  if (!existsSync(ledgerPath)) {
    return {
      runId, ok: false, total: 0,
      countByStatus: {},
      failureCount: 0,
      checks: [{ claimId: '<none>', status: 'CLEANED_TEXT_MISSING', details: `${ledgerPath} missing` }],
    };
  }

  const ledger = readJson<ClaimsLedger>(ledgerPath);

  // Pre-load cleaned text for each unique sourceUrl/cleanedTextPath in the ledger.
  const cleanedTextByPath = new Map<string, string | null>();
  for (const c of ledger.claims) {
    if (c.cleanedTextPath && !cleanedTextByPath.has(c.cleanedTextPath)) {
      cleanedTextByPath.set(c.cleanedTextPath, safeReadCleanedText(c.cleanedTextPath));
    }
  }

  const checks: VerifyCheck[] = [];
  const countByStatus: Record<string, number> = {};
  for (const c of ledger.claims) {
    const txt = c.cleanedTextPath ? cleanedTextByPath.get(c.cleanedTextPath) ?? null : null;
    const v = verifyClaim(c, txt);
    checks.push(v);
    countByStatus[v.status] = (countByStatus[v.status] ?? 0) + 1;
  }

  const failureCount = (countByStatus['QUOTE_NOT_IN_CLEANED_TEXT'] ?? 0)
    + (countByStatus['CLEANED_TEXT_MISSING'] ?? 0)
    + (countByStatus['VISIBILITY_DRIFT'] ?? 0);

  const reportPath = path.join(runDir, 'quote_verify_report.json');
  writeJson(reportPath, {
    schemaVersion: 'p102-quote-verify-1',
    runId, total: ledger.claims.length,
    countByStatus, failureCount,
    checks,
  });

  const lines: string[] = [];
  lines.push(`# Quote verify report — ${runId}`);
  lines.push('');
  lines.push(`- total claims:       ${ledger.claims.length}`);
  lines.push(`- failures:           ${failureCount}`);
  for (const [k, v] of Object.entries(countByStatus)) lines.push(`- ${k}: ${v}`);
  lines.push('');
  if (failureCount > 0) {
    lines.push('## Failures');
    lines.push('');
    for (const c of checks.filter((c) => c.status !== 'OK' && c.status !== 'NOT_STATED_FIELD_OK' && c.status !== 'VISIBILITY_DRIFT_MODEL_STRICTER')) {
      lines.push(`- ${c.claimId} → ${c.status}: ${c.details}`);
    }
  }

  const stricterCount = countByStatus['VISIBILITY_DRIFT_MODEL_STRICTER'] ?? 0;
  if (stricterCount > 0) {
    lines.push('');
    lines.push('## Informational: model-stricter visibility drift');
    lines.push('');
    lines.push(`${stricterCount} claim(s) where the model recorded a visibility equal-or-stricter than the deterministic re-classifier would emit. This is not a public-safety failure — the model used additional context (e.g. campus-level scope mismatch on a parent-system page) to hide the claim.`);
    lines.push('');
    for (const c of checks.filter((c) => c.status === 'VISIBILITY_DRIFT_MODEL_STRICTER')) {
      lines.push(`- ${c.claimId} → ${c.details}`);
    }
  }
  writeText(path.join(runDir, 'quote_verify_report.md'), lines.join('\n'));

  if (!opts.quiet) {
    console.log(`[${runId}] total=${ledger.claims.length} failures=${failureCount} ${JSON.stringify(countByStatus)}`);
  }

  return { runId, ok: failureCount === 0, total: ledger.claims.length, countByStatus, failureCount, checks };
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.runIds.length === 0 && opts.allExistingRuns) {
    if (!opts.quiet) console.log('P102 quote verifier: no runs with 13_model_claims_verified.json — nothing to verify (PASS)');
    process.exit(0);
  }

  if (!opts.quiet) {
    console.log(`P102 quote verifier`);
    console.log(`  runs: ${opts.runIds.length}`);
    console.log(`  strict: ${opts.strict}`);
  }

  const reports = opts.runIds.map((id) => verifyOneRun(id, opts));

  console.log(`\n=== Quote-verify summary`);
  let totalFailures = 0;
  for (const r of reports) {
    console.log(`  [${r.ok ? 'OK' : 'FAIL'}] ${r.runId}  total=${r.total}  failures=${r.failureCount}`);
    totalFailures += r.failureCount;
  }

  if (opts.strict && totalFailures > 0) {
    console.error(`\nFAIL: ${totalFailures} re-verification failures across ${reports.length} runs (strict mode).`);
    process.exit(1);
  }
  process.exit(0);
}

main();
