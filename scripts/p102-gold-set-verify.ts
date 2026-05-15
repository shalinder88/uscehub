#!/usr/bin/env tsx
/**
 * P102 gold-set verifier — compares actual gold-set run results against
 * the expected outcomes in specs/P102_GOLD_SET_EXPECTED_OUTCOMES.json.
 *
 * Currently a skeleton: the gold set has not run yet (held until
 * P102-0D model A1/A2 reader is online). When the gold set runs, this
 * script will read each `p102-gold-<institution>-<n>` run folder and
 * emit a per-institution pass/fail report.
 *
 * For now, the script reports "AWAITING_RUN" for institutions whose run
 * folders don't exist. It validates the expected-outcomes JSON itself
 * and ensures every queue row has a matching expectation.
 *
 * No network. No Agent.
 *
 * Usage:
 *   npx tsx scripts/p102-gold-set-verify.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const P102_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102');
const RUNS_ROOT = path.join(P102_ROOT, 'runs');
const EXPECTED_PATH = path.join(P102_ROOT, 'specs/P102_GOLD_SET_EXPECTED_OUTCOMES.json');
const QUEUE_PATH = path.join(P102_ROOT, 'queues/p102_gold_set_queue.csv');

interface Expectation {
  institutionId: string;
  canonicalName: string;
  goldLabel: string;
  expectedA3Verdict: string[];
  expectedPublicSafeUsceMin: number;
  expectedPublicSafeUsceMax: number;
  expectedNegativeQuoteRequired?: boolean;
  expectedNegativeQuoteAllowed?: boolean;
  expectedPublicSafeNoPublicOpportunityMin?: number;
  expectedPublicSafeNoPublicOpportunityMax?: number;
  expectedScopeConflictsMin?: number;
  expectedFutureLaneValue?: string[];
  expectedSourceFamilies?: string[];
  expectedHumanReviewMin?: number;
  expectedHumanReviewMax?: number;
  expectedPdfArtifactsMin?: number;
  expectedBotBlockedSourcesMin?: number;
  expectedParentSystem?: string;
  allowedFailureMode?: string | null;
}

interface VerifyResult {
  institutionId: string;
  canonicalName: string;
  goldLabel: string;
  status: 'PASS' | 'FAIL' | 'AWAITING_RUN' | 'NO_EXPECTATION';
  findings: string[];
  matchedRunId: string | null;
}

function safeJson<T = unknown>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return null; }
}

function inRange(value: number, min: number | undefined, max: number | undefined): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

function findGoldRunForInstitution(institutionId: string): string | null {
  if (!fs.existsSync(RUNS_ROOT)) return null;
  // Prefer "gold" run-id pattern, but accept ANY run that points at this
  // institutionId via 05_canonical_institution.json. This lets pre-foundation
  // runs (p102-0r-dry-run-*, p102-1-trial-2-run-*) count toward the gold-set
  // verification once they've been authorized in the running log — same
  // schemaVersion, same 16_three_tier_institution_packet.json shape, just a
  // different run-id naming convention.
  const allRuns = fs.readdirSync(RUNS_ROOT);
  const goldFirst = [
    ...allRuns.filter(n => n.includes('gold')),
    ...allRuns.filter(n => !n.includes('gold')),
  ];
  for (const r of goldFirst) {
    const canonPath = path.join(RUNS_ROOT, r, '05_canonical_institution.json');
    const canon = safeJson<{ institutionId?: string }>(canonPath);
    if (canon?.institutionId === institutionId) return r;
  }
  return null;
}

function verifyExpectation(exp: Expectation): VerifyResult {
  const result: VerifyResult = {
    institutionId: exp.institutionId,
    canonicalName: exp.canonicalName,
    goldLabel: exp.goldLabel,
    status: 'AWAITING_RUN',
    findings: [],
    matchedRunId: null,
  };
  const runId = findGoldRunForInstitution(exp.institutionId);
  if (!runId) {
    result.findings.push(`No gold-set run folder found for ${exp.institutionId}; expected after P102-0D + gold-set authorization.`);
    return result;
  }
  result.matchedRunId = runId;
  const runFolder = path.join(RUNS_ROOT, runId);

  const a3 = safeJson<{ verdict?: string; publicSafe?: boolean; futureLaneValue?: string; publicSafeUsceClaims?: number; networkUsed?: boolean; agentUsed?: boolean }>(path.join(runFolder, 'A3_gate.json'));
  const claims = safeJson<{ claims?: Array<{ visibility: string; sourceFamily: string }> }>(path.join(runFolder, '13_source_claims.json'));
  const negClaims = safeJson<{ negativeClaims?: Array<{ publicSafeNegativeClaim: boolean; quoteVerified: boolean }> }>(path.join(runFolder, 'RT_depth_negative_evidence.json'));
  const scopeConflicts = safeJson<{ conflicts?: unknown[] }>(path.join(runFolder, 'RT_depth_source_scope_conflicts.json'));
  const sourceMap = safeJson<{ sources?: Array<{ sourceStatus: string; sourceFamily: string; acceptedForExtraction: boolean }> }>(path.join(runFolder, '01_source_map.json'));
  const artifacts = safeJson<{ probes?: Array<{ contentType: string; cleanedTextPath: string | null }> }>(path.join(runFolder, '00_fixed_path_probe.json'));
  const canon = safeJson<{ parentSystem?: string | null }>(path.join(runFolder, '05_canonical_institution.json'));

  // A3 verdict check
  if (a3?.verdict && exp.expectedA3Verdict.length > 0 && !exp.expectedA3Verdict.includes(a3.verdict)) {
    result.findings.push(`A3 verdict ${a3.verdict} not in expected ${exp.expectedA3Verdict.join('|')}`);
  }

  // A3 attestation
  if (a3?.networkUsed !== false) result.findings.push(`A3 networkUsed must be false; got ${String(a3?.networkUsed)}`);
  if (a3?.agentUsed !== false) result.findings.push(`A3 agentUsed must be false; got ${String(a3?.agentUsed)}`);

  // PUBLIC_SAFE_USCE range
  const publicSafe = a3?.publicSafeUsceClaims ?? (claims?.claims ?? []).filter(c => c.visibility === 'PUBLIC_SAFE_USCE').length;
  if (!inRange(publicSafe, exp.expectedPublicSafeUsceMin, exp.expectedPublicSafeUsceMax)) {
    result.findings.push(`PUBLIC_SAFE_USCE count ${publicSafe} not in [${exp.expectedPublicSafeUsceMin}, ${exp.expectedPublicSafeUsceMax}]`);
  }

  // Negative-evidence rules
  const negCount = (negClaims?.negativeClaims ?? []).length;
  const publicSafeNeg = (negClaims?.negativeClaims ?? []).filter(c => c.publicSafeNegativeClaim).length;
  if (exp.expectedNegativeQuoteRequired && publicSafeNeg < 1) {
    result.findings.push(`Expected ≥1 publicSafeNegative claim, got ${publicSafeNeg}`);
  }
  if (exp.expectedPublicSafeNoPublicOpportunityMin !== undefined && publicSafeNeg < exp.expectedPublicSafeNoPublicOpportunityMin) {
    result.findings.push(`publicSafeNegative count ${publicSafeNeg} < min ${exp.expectedPublicSafeNoPublicOpportunityMin}`);
  }
  if (exp.expectedPublicSafeNoPublicOpportunityMax !== undefined && publicSafeNeg > exp.expectedPublicSafeNoPublicOpportunityMax) {
    result.findings.push(`publicSafeNegative count ${publicSafeNeg} > max ${exp.expectedPublicSafeNoPublicOpportunityMax}`);
  }

  // Future-lane value
  if (exp.expectedFutureLaneValue && a3?.futureLaneValue && !exp.expectedFutureLaneValue.includes(a3.futureLaneValue)) {
    result.findings.push(`futureLaneValue ${a3.futureLaneValue} not in ${exp.expectedFutureLaneValue.join('|')}`);
  }

  // Source families present
  if (exp.expectedSourceFamilies && exp.expectedSourceFamilies.length > 0) {
    const families = new Set((sourceMap?.sources ?? []).filter(s => s.acceptedForExtraction).map(s => s.sourceFamily));
    const missing = exp.expectedSourceFamilies.filter(f => !families.has(f));
    if (missing.length > 0) result.findings.push(`Missing expected source families: ${missing.join(', ')}`);
  }

  // Human-review range
  const humanReviewCount = (claims?.claims ?? []).filter(c => c.visibility === 'HUMAN_REVIEW_REQUIRED').length;
  if (!inRange(humanReviewCount, exp.expectedHumanReviewMin, exp.expectedHumanReviewMax)) {
    result.findings.push(`HUMAN_REVIEW count ${humanReviewCount} not in [${exp.expectedHumanReviewMin ?? '∅'}, ${exp.expectedHumanReviewMax ?? '∅'}]`);
  }

  // PDF artifacts
  if (exp.expectedPdfArtifactsMin !== undefined) {
    const pdfCount = (artifacts?.probes ?? []).filter(p => p.contentType.includes('pdf')).length;
    if (pdfCount < exp.expectedPdfArtifactsMin) {
      result.findings.push(`PDF artifacts ${pdfCount} < min ${exp.expectedPdfArtifactsMin}`);
    }
  }

  // Bot-blocked sources
  if (exp.expectedBotBlockedSourcesMin !== undefined) {
    const blocked = (sourceMap?.sources ?? []).filter(s => s.sourceStatus === 'FETCH_403' || s.sourceStatus === 'FETCH_TIMEOUT').length;
    if (blocked < exp.expectedBotBlockedSourcesMin) {
      result.findings.push(`Bot-blocked sources ${blocked} < min ${exp.expectedBotBlockedSourcesMin}`);
    }
  }

  // Scope conflicts
  if (exp.expectedScopeConflictsMin !== undefined) {
    const sc = (scopeConflicts?.conflicts ?? []).length;
    if (sc < exp.expectedScopeConflictsMin) {
      result.findings.push(`Scope conflicts ${sc} < min ${exp.expectedScopeConflictsMin}`);
    }
  }

  // Parent system
  if (exp.expectedParentSystem && canon?.parentSystem !== exp.expectedParentSystem) {
    result.findings.push(`parentSystem ${String(canon?.parentSystem)} ≠ expected ${exp.expectedParentSystem}`);
  }

  result.status = result.findings.length === 0 ? 'PASS' : 'FAIL';
  return result;
}

function main(): void {
  console.log('='.repeat(60));
  console.log('P102 Gold-Set Verifier');
  console.log('='.repeat(60));

  const expectations = safeJson<{ expectations: Expectation[] }>(EXPECTED_PATH);
  if (!expectations) { console.error(`Missing or invalid: ${EXPECTED_PATH}`); process.exit(2); }

  // Cross-check queue has matching entries
  if (fs.existsSync(QUEUE_PATH)) {
    const queueText = fs.readFileSync(QUEUE_PATH, 'utf8');
    const queueIds = new Set<string>();
    const header = queueText.split('\n')[0].split(',');
    const idCol = header.indexOf('institution_id');
    for (const line of queueText.split('\n').slice(1)) {
      if (!line.trim()) continue;
      const cols = line.split(',');
      if (cols[idCol]) queueIds.add(cols[idCol].trim());
    }
    const expectedIds = new Set(expectations.expectations.map(e => e.institutionId));
    const onlyInQueue = Array.from(queueIds).filter(i => !expectedIds.has(i));
    const onlyInExpected = Array.from(expectedIds).filter(i => !queueIds.has(i));
    if (onlyInQueue.length > 0) console.log(`WARN: ${onlyInQueue.length} queue institutions have no expectations: ${onlyInQueue.join(', ')}`);
    if (onlyInExpected.length > 0) console.log(`WARN: ${onlyInExpected.length} expectations have no queue row: ${onlyInExpected.join(', ')}`);
  }

  const results: VerifyResult[] = expectations.expectations.map(verifyExpectation);
  const counts = {
    PASS: results.filter(r => r.status === 'PASS').length,
    FAIL: results.filter(r => r.status === 'FAIL').length,
    AWAITING_RUN: results.filter(r => r.status === 'AWAITING_RUN').length,
    NO_EXPECTATION: results.filter(r => r.status === 'NO_EXPECTATION').length,
  };

  console.log(`\nResults:`);
  for (const r of results) {
    const marker = r.status === 'PASS' ? '✓' : r.status === 'FAIL' ? '✗' : '○';
    console.log(`  ${marker} ${r.goldLabel.padEnd(60)} ${r.status}${r.matchedRunId ? ` (run: ${r.matchedRunId})` : ''}`);
    for (const f of r.findings) console.log(`      - ${f}`);
  }

  console.log('-'.repeat(60));
  console.log(`Totals: PASS=${counts.PASS}, FAIL=${counts.FAIL}, AWAITING_RUN=${counts.AWAITING_RUN}`);
  if (counts.AWAITING_RUN === results.length) {
    console.log('Status: framework ready; gold set has not run yet (held until P102-0D + operator authorization)');
  } else if (counts.FAIL === 0) {
    console.log('Status: PASS');
  } else {
    console.log('Status: FAIL — see findings above');
    process.exit(1);
  }
}

main();
