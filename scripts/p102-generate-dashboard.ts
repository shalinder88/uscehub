#!/usr/bin/env tsx
/**
 * P102 cross-run dashboard generator — aggregates A3 verdicts, claim
 * counts, identity info, and key metrics across all runs into a single
 * dashboard at docs/.../p102/P102_DASHBOARD.md.
 *
 * Pure data transform. No network. No Agent.
 *
 * Usage:
 *   npx tsx scripts/p102-generate-dashboard.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const P102_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102');
const RUNS_ROOT = path.join(P102_ROOT, 'runs');

function safeJson<T = unknown>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return null; }
}

interface RunSummaryRow {
  runId: string;
  canonicalName: string;
  state: string;
  city: string;
  parentSystem: string;
  campusType: string;
  sourcesAccepted: number;
  claimsTotal: number;
  claimsVerified: number;
  publicSafeUsce: number;
  cautionSafe: number;
  futureLane: number;
  humanReview: number;
  negativeClaims: number;
  publicSafeNegative: number;
  scopeConflicts: number;
  jsonldClaims: number;
  jsonldDiscoveredUrls: number;
  a3Verdict: string;
  a3PublicSafe: boolean;
  a3FutureLaneValue: string;
  a3NetworkUsed: boolean;
  a3AgentUsed: boolean;
  a4Tasks: number;
  a5Status: string;
  searchCompletenessScore: number;
}

function collectRow(runFolder: string): RunSummaryRow {
  const runId = path.basename(runFolder);
  const canon = safeJson<{ canonicalName?: string; state?: string; city?: string; parentSystem?: string | null; campusType?: string }>(path.join(runFolder, '05_canonical_institution.json'));
  const sourceMap = safeJson<{ sources?: Array<{ acceptedForExtraction: boolean }> }>(path.join(runFolder, '01_source_map.json'));
  const claims = safeJson<{ claims?: Array<{ visibility: string; quoteVerified: boolean }> }>(path.join(runFolder, '13_source_claims.json'));
  const jsonldClaims = safeJson<{ claims?: unknown[] }>(path.join(runFolder, '13b_jsonld_claims.json'));
  const jsonldDiscovered = safeJson<{ discoveredUrls?: unknown[] }>(path.join(runFolder, '00_jsonld_discovered_urls.json'));
  const negClaims = safeJson<{ negativeClaims?: Array<{ publicSafeNegativeClaim: boolean }> }>(path.join(runFolder, 'RT_depth_negative_evidence.json'));
  const scopeConflicts = safeJson<{ conflicts?: unknown[] }>(path.join(runFolder, 'RT_depth_source_scope_conflicts.json'));
  const a3 = safeJson<{ verdict?: string; publicSafe?: boolean; futureLaneValue?: string; networkUsed?: boolean; agentUsed?: boolean }>(path.join(runFolder, 'A3_gate.json'));
  const a4 = safeJson<{ tasks?: unknown[] }>(path.join(runFolder, 'A4_focused_recovery_tasks.json'));
  const a5 = safeJson<{ overallStatus?: string }>(path.join(runFolder, 'A5_continue_decision.json'));
  const audit = safeJson<{ searchCompletenessScore?: number }>(path.join(runFolder, 'A1_5_source_completeness_audit.json'));

  const allClaims = claims?.claims ?? [];
  return {
    runId,
    canonicalName: canon?.canonicalName ?? '(unknown)',
    state: canon?.state ?? '?',
    city: canon?.city ?? '?',
    parentSystem: canon?.parentSystem ?? '—',
    campusType: canon?.campusType ?? '—',
    sourcesAccepted: (sourceMap?.sources ?? []).filter(s => s.acceptedForExtraction).length,
    claimsTotal: allClaims.length,
    claimsVerified: allClaims.filter(c => c.quoteVerified).length,
    publicSafeUsce: allClaims.filter(c => c.visibility === 'PUBLIC_SAFE_USCE').length,
    cautionSafe: allClaims.filter(c => c.visibility === 'CAUTION_SAFE_INTERNAL_REVIEW').length,
    futureLane: allClaims.filter(c => c.visibility === 'FUTURE_LANE_ONLY').length,
    humanReview: allClaims.filter(c => c.visibility === 'HUMAN_REVIEW_REQUIRED').length,
    negativeClaims: (negClaims?.negativeClaims ?? []).length,
    publicSafeNegative: (negClaims?.negativeClaims ?? []).filter(c => c.publicSafeNegativeClaim).length,
    scopeConflicts: (scopeConflicts?.conflicts ?? []).length,
    jsonldClaims: (jsonldClaims?.claims ?? []).length,
    jsonldDiscoveredUrls: (jsonldDiscovered?.discoveredUrls ?? []).length,
    a3Verdict: a3?.verdict ?? '?',
    a3PublicSafe: a3?.publicSafe ?? false,
    a3FutureLaneValue: a3?.futureLaneValue ?? '?',
    a3NetworkUsed: a3?.networkUsed ?? true,
    a3AgentUsed: a3?.agentUsed ?? true,
    a4Tasks: (a4?.tasks ?? []).length,
    a5Status: a5?.overallStatus ?? '?',
    searchCompletenessScore: audit?.searchCompletenessScore ?? 0,
  };
}

function generate(): string {
  const runIds = fs.existsSync(RUNS_ROOT)
    ? fs.readdirSync(RUNS_ROOT).filter(n => fs.statSync(path.join(RUNS_ROOT, n)).isDirectory()).sort()
    : [];
  const rows = runIds.map(id => collectRow(path.join(RUNS_ROOT, id)));

  const totals = {
    runs: rows.length,
    sources: rows.reduce((s, r) => s + r.sourcesAccepted, 0),
    claims: rows.reduce((s, r) => s + r.claimsTotal, 0),
    verified: rows.reduce((s, r) => s + r.claimsVerified, 0),
    publicSafe: rows.reduce((s, r) => s + r.publicSafeUsce, 0),
    futureLane: rows.reduce((s, r) => s + r.futureLane, 0),
    humanReview: rows.reduce((s, r) => s + r.humanReview, 0),
    neg: rows.reduce((s, r) => s + r.negativeClaims, 0),
    publicSafeNeg: rows.reduce((s, r) => s + r.publicSafeNegative, 0),
    scopeConflicts: rows.reduce((s, r) => s + r.scopeConflicts, 0),
    jsonld: rows.reduce((s, r) => s + r.jsonldClaims, 0),
    jsonldUrls: rows.reduce((s, r) => s + r.jsonldDiscoveredUrls, 0),
    a4Tasks: rows.reduce((s, r) => s + r.a4Tasks, 0),
    networkSafe: rows.filter(r => r.a3NetworkUsed === false && r.a3AgentUsed === false).length,
  };

  const verdictDist: Record<string, number> = {};
  for (const r of rows) verdictDist[r.a3Verdict] = (verdictDist[r.a3Verdict] ?? 0) + 1;

  const lines: string[] = [];
  lines.push(`# P102 Dashboard — All Runs`);
  lines.push('');
  lines.push(`_Generated: ${new Date().toISOString()} by \`scripts/p102-generate-dashboard.ts\`. Aggregates A3 verdicts + claim counts + metrics across all P102 runs. Pure data transform; no network, no Agent._`);
  lines.push('');

  lines.push(`## Overall totals`);
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|---|---:|`);
  lines.push(`| Total runs | ${totals.runs} |`);
  lines.push(`| Accepted sources (across all runs) | ${totals.sources} |`);
  lines.push(`| Claims emitted | ${totals.claims} |`);
  lines.push(`| Claims quote-verified | ${totals.verified} / ${totals.claims} |`);
  lines.push(`| **PUBLIC_SAFE_USCE** | **${totals.publicSafe}** |`);
  lines.push(`| FUTURE_LANE_ONLY | ${totals.futureLane} |`);
  lines.push(`| HUMAN_REVIEW_REQUIRED | ${totals.humanReview} |`);
  lines.push(`| Negative-evidence claims | ${totals.neg} (publicSafeNegative: ${totals.publicSafeNeg}) |`);
  lines.push(`| Scope conflicts surfaced | ${totals.scopeConflicts} |`);
  lines.push(`| JSON-LD claims | ${totals.jsonld} |`);
  lines.push(`| JSON-LD discovered URLs | ${totals.jsonldUrls} |`);
  lines.push(`| A4 tasks generated | ${totals.a4Tasks} |`);
  lines.push(`| Runs attesting networkUsed=false + agentUsed=false | ${totals.networkSafe} / ${totals.runs} |`);
  lines.push('');

  lines.push(`## A3 verdict distribution`);
  lines.push('');
  for (const [v, n] of Object.entries(verdictDist)) lines.push(`- **${v}**: ${n} run${n === 1 ? '' : 's'}`);
  lines.push('');

  lines.push(`## Per-run summary`);
  lines.push('');
  lines.push(`| Run | Institution | State | Parent | Sources | Claims (verified / total) | PUB_SAFE | FUT_LANE | HUM_REV | NEG | Scope conflicts | A3 verdict | publicSafe | network | agent | A4 tasks | A5 | searchCompleteness |`);
  lines.push(`|---|---|---|---|---:|---|---:|---:|---:|---:|---:|---|---|---|---|---:|---|---:|`);
  for (const r of rows) {
    lines.push(`| \`${r.runId}\` | ${r.canonicalName} | ${r.state} | ${r.parentSystem} | ${r.sourcesAccepted} | ${r.claimsVerified} / ${r.claimsTotal} | ${r.publicSafeUsce} | ${r.futureLane} | ${r.humanReview} | ${r.negativeClaims} | ${r.scopeConflicts} | ${r.a3Verdict} | ${r.a3PublicSafe} | ${r.a3NetworkUsed} | ${r.a3AgentUsed} | ${r.a4Tasks} | ${r.a5Status} | ${r.searchCompletenessScore}% |`);
  }
  lines.push('');

  lines.push(`## Discipline integrity`);
  lines.push('');
  const allNetworkSafe = rows.every(r => r.a3NetworkUsed === false && r.a3AgentUsed === false);
  const allClaimsVerified = totals.claims === totals.verified;
  lines.push(`- ${allNetworkSafe ? '✓' : '✗'} All A3 gates attest networkUsed=false and agentUsed=false`);
  lines.push(`- ${allClaimsVerified ? '✓' : '✗'} All claims are quote-verified (${totals.verified} / ${totals.claims})`);
  lines.push(`- ${totals.publicSafe === 0 ? '✓' : '⚠️'} ${totals.publicSafe} PUBLIC_SAFE_USCE claims (expected 0 under P102-0C deterministic baseline)`);
  lines.push(`- ${totals.publicSafeNeg === 0 ? '✓' : '⚠️'} ${totals.publicSafeNeg} PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY claims (expected 0 until institutions with explicit negative quotes are processed)`);
  lines.push('');

  lines.push(`## Next pending work`);
  lines.push('');
  lines.push(`See \`P102_OPERATING_RUNBOOK.md\` for full operational guidance. Pending sprints in order:`);
  lines.push('');
  lines.push(`1. **P102-0D** — model A1/A2 reader (blocking state/national). Reader prompt captured at \`specs/P102_A1_A2_READER_PROMPT.md\`.`);
  lines.push(`2. **Trial-2-deeper** — re-run existing institutions with the model reader to produce real PUBLIC_SAFE_USCE.`);
  lines.push(`3. **P102-GOLD-RUN** — execute the gold-set queue (queue ready at \`queues/p102_gold_set_queue.csv\`; status DO_NOT_RUN_UNTIL_P102_0D).`);
  lines.push(`4. **P102-STATE** — single-state slice.`);
  lines.push(`5. **P102-NATIONAL** — national run.`);

  return lines.join('\n') + '\n';
}

function main(): void {
  const content = generate();
  const out = path.join(P102_ROOT, 'P102_DASHBOARD.md');
  fs.writeFileSync(out, content);
  console.log(`[dashboard] → ${path.relative(REPO_ROOT, out)}`);
}

main();
