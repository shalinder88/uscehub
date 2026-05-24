#!/usr/bin/env tsx
/**
 * P102 per-run report generator — reads all artifacts in a run folder
 * and emits a single readable markdown summary at
 * runs/<run_id>/RUN_REPORT.md.
 *
 * Pure data transform. No network. No new artifacts created beyond
 * the report file.
 *
 * Usage:
 *   npx tsx scripts/p102-generate-run-report.ts --run-id p102-1-trial-2-run-1
 *   npx tsx scripts/p102-generate-run-report.ts --all-existing-p102-runs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');

function safeJson<T = unknown>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return null; }
}

function safeRead(p: string): string | null {
  if (!fs.existsSync(p)) return null;
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function generateReport(runFolder: string): string {
  const runId = path.basename(runFolder);
  const summary = safeJson<{ canonicalName?: string; institutionId?: string; queueId?: string; status?: string; sourceFamilies?: string[]; scores?: Record<string, number>; verdict?: string; nextAction?: string; startedAt?: string; completedAt?: string }>(path.join(runFolder, '14_run_summary.json'));
  const canon = safeJson<{ canonicalName?: string; institutionId?: string; state?: string; city?: string; officialDomains?: string[]; parentSystem?: string | null; campusType?: string }>(path.join(runFolder, '05_canonical_institution.json'));
  const a0Robots = safeJson<{ fetched?: boolean; statusCode?: number; sitemapsAdvertised?: string[]; sitemap?: { fetched?: boolean; statusCode?: number; urlsFound?: number; candidatesKept?: string[] } }>(path.join(runFolder, '00_robots_sitemap_probe.json'));
  const a0Probes = safeJson<{ probes?: Array<{ sourceUrl: string; statusCode: number; sourceFamily: string; acceptedForExtraction: boolean }> }>(path.join(runFolder, '00_fixed_path_probe.json'));
  const a0Jsonld = safeJson<{ records?: Array<{ sourceUrl: string; itemCount: number }> }>(path.join(runFolder, '00_jsonld_extract.json'));
  const sourceMap = safeJson<{ sources?: Array<{ sourceUrl: string; sourceFamily: string; sourceScope: string; acceptedForExtraction: boolean; sourceStatus: string; sourceHash?: string }> }>(path.join(runFolder, '01_source_map.json'));
  const audit = safeJson<{ robotsChecked?: boolean; sitemapChecked?: boolean; fixedPathProbesCompleted?: boolean; jsonLdChecked?: boolean; sourceFamiliesChecked?: string[]; missingSourceFamilies?: string[]; searchCompletenessScore?: number; canProceedToA2?: boolean }>(path.join(runFolder, 'A1_5_source_completeness_audit.json'));
  const claims = safeJson<{ claims?: Array<{ claimId: string; lane: string; visibility: string; quote: string; sourceUrl: string; sourceFamily: string; quoteVerified: boolean }> }>(path.join(runFolder, '13_source_claims.json'));
  const jsonldClaims = safeJson<{ claims?: Array<{ claimId: string; lane: string; visibility: string; quote: string; jsonldType: string }> }>(path.join(runFolder, '13b_jsonld_claims.json'));
  const negClaims = safeJson<{ negativeClaims?: Array<{ claimId: string; quote: string; sourceUrl: string; negativeEvidenceStrength: string; publicSafeNegativeClaim: boolean }> }>(path.join(runFolder, 'RT_depth_negative_evidence.json'));
  const scopeConflicts = safeJson<{ conflicts?: Array<{ sourceUrl: string; reason: string }> }>(path.join(runFolder, 'RT_depth_source_scope_conflicts.json'));
  const semanticMiss = safeJson<{ flags?: Array<{ check: string; triggered: boolean; detail: string }> }>(path.join(runFolder, 'RT_semantic_miss_detector.json'));
  const a3 = safeJson<{ verdict?: string; publicSafe?: boolean; futureLaneValue?: string; networkUsed?: boolean; agentUsed?: boolean; missingCriticalFields?: string[]; quoteVerificationFailures?: string[]; hallucinationRisks?: string[]; requiredA4Tasks?: string[]; finalRecommendation?: string; publicSafeUsceClaims?: number; cautionSafeClaims?: number; futureLaneClaims?: number }>(path.join(runFolder, 'A3_gate.json'));
  const a4 = safeJson<{ tasks?: Array<{ taskId: string; taskType: string; status: string; blockedBy: string | null; rationale: string }> }>(path.join(runFolder, 'A4_focused_recovery_tasks.json'));
  const a5 = safeJson<{ overallStatus?: string; stuckAtStage?: string | null; recommendedAction?: string }>(path.join(runFolder, 'A5_continue_decision.json'));
  const v2Diag = safeJson<{ summary?: { totalV1Bytes: number; totalV2Bytes: number; v2BytesAsPercentOfV1: number; reclassificationsCount: number } }>(path.join(runFolder, 'diagnostic_cleaned_text_v2.json'));

  const accepted = (sourceMap?.sources ?? []).filter(s => s.acceptedForExtraction);
  const allClaims = claims?.claims ?? [];
  const allJsonldClaims = jsonldClaims?.claims ?? [];
  const allNegClaims = negClaims?.negativeClaims ?? [];

  const lines: string[] = [];
  lines.push(`# Run Report — ${canon?.canonicalName ?? '(unknown)'}`);
  lines.push('');
  lines.push(`**Run ID:** \`${runId}\``);
  lines.push(`**Institution ID:** \`${canon?.institutionId ?? '-'}\``);
  lines.push(`**Location:** ${canon?.city ?? '?'}, ${canon?.state ?? '?'}`);
  lines.push(`**Parent system:** ${canon?.parentSystem ?? 'standalone'}`);
  lines.push(`**Official domains:** ${(canon?.officialDomains ?? []).join(', ') || '-'}`);
  lines.push(`**Queue:** \`${summary?.queueId ?? '-'}\``);
  lines.push(`**Run window:** ${summary?.startedAt ?? '?'} → ${summary?.completedAt ?? '?'}`);
  lines.push('');

  lines.push(`## A0 deterministic probe`);
  lines.push('');
  lines.push(`- robots.txt: ${a0Robots?.fetched ? `fetched (${a0Robots.statusCode})` : 'not reachable'} · advertised sitemaps: ${a0Robots?.sitemapsAdvertised?.length ?? 0}`);
  lines.push(`- sitemap.xml: ${a0Robots?.sitemap?.fetched ? `fetched (${a0Robots.sitemap.statusCode})` : 'not reachable'} · URLs found: ${a0Robots?.sitemap?.urlsFound ?? 0} · candidates kept: ${a0Robots?.sitemap?.candidatesKept?.length ?? 0}`);
  const probes = a0Probes?.probes ?? [];
  const probesAccepted = probes.filter(p => p.acceptedForExtraction).length;
  lines.push(`- Fixed-path probes: ${probes.length} attempted, **${probesAccepted} accepted** (HTTP 200 with HTML body)`);
  lines.push(`- JSON-LD records: ${(a0Jsonld?.records ?? []).reduce((s, r) => s + r.itemCount, 0)}`);
  lines.push('');

  lines.push(`## A1 source map — ${accepted.length} accepted sources`);
  lines.push('');
  if (accepted.length === 0) {
    lines.push(`_(no accepted sources; framework verdict likely FAIL_NEEDS_A4)_`);
  } else {
    lines.push('| Source family | Scope | URL |');
    lines.push('|---|---|---|');
    for (const s of accepted) {
      lines.push(`| ${s.sourceFamily} | ${s.sourceScope} | ${s.sourceUrl} |`);
    }
  }
  lines.push('');

  lines.push(`## A1.5 source completeness`);
  lines.push('');
  if (audit) {
    lines.push(`- searchCompletenessScore: **${audit.searchCompletenessScore ?? 0}%**`);
    lines.push(`- robotsChecked: ${audit.robotsChecked} · sitemapChecked: ${audit.sitemapChecked} · jsonLdChecked: ${audit.jsonLdChecked}`);
    lines.push(`- source families seen: ${(audit.sourceFamiliesChecked ?? []).join(', ') || '(none)'}`);
    lines.push(`- missing USCE source families: ${(audit.missingSourceFamilies ?? []).join(', ') || '(none)'}`);
    lines.push(`- canProceedToA2: ${audit.canProceedToA2}`);
  }
  lines.push('');

  lines.push(`## Claims (P102-0C deterministic extractor)`);
  lines.push('');
  const byVisibility: Record<string, number> = {};
  for (const c of allClaims) byVisibility[c.visibility] = (byVisibility[c.visibility] ?? 0) + 1;
  lines.push(`- Total claims: **${allClaims.length}**, all quote-verified: ${allClaims.every(c => c.quoteVerified)}`);
  for (const [vis, n] of Object.entries(byVisibility)) lines.push(`  - ${vis}: ${n}`);
  if (allClaims.length > 0) {
    lines.push('');
    lines.push('| Visibility | Lane | Source | Quote (first 100 chars) |');
    lines.push('|---|---|---|---|');
    for (const c of allClaims.slice(0, 15)) {
      const truncQ = c.quote.length > 100 ? c.quote.slice(0, 100) + '…' : c.quote;
      lines.push(`| ${c.visibility} | ${c.lane} | ${c.sourceFamily} | ${truncQ.replace(/\|/g, '\\|')} |`);
    }
    if (allClaims.length > 15) lines.push(`| ... | ... | ... | (and ${allClaims.length - 15} more) |`);
  }
  lines.push('');

  lines.push(`## JSON-LD claims (P102-0K)`);
  lines.push('');
  lines.push(`- Total JSON-LD claims: ${allJsonldClaims.length}`);
  if (allJsonldClaims.length > 0) {
    for (const c of allJsonldClaims.slice(0, 10)) lines.push(`  - **${c.visibility}** ${c.lane} (${c.jsonldType}): ${c.quote.slice(0, 100)}…`);
  }
  lines.push('');

  lines.push(`## Negative evidence`);
  lines.push('');
  lines.push(`- Total negative claims: ${allNegClaims.length} (publicSafeNegative: ${allNegClaims.filter(c => c.publicSafeNegativeClaim).length})`);
  if (allNegClaims.length === 0) lines.push(`_(no explicit negative quotes found; absence-only outcomes are NO_PUBLIC_OPPORTUNITY_FOUND, not PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY)_`);
  lines.push('');

  lines.push(`## Scope conflicts`);
  lines.push('');
  const conflicts = scopeConflicts?.conflicts ?? [];
  lines.push(`- Total: ${conflicts.length}`);
  for (const c of conflicts.slice(0, 5)) lines.push(`  - ${c.sourceUrl}: ${c.reason}`);
  lines.push('');

  lines.push(`## A2.5 semantic-miss flags`);
  lines.push('');
  const flags = semanticMiss?.flags ?? [];
  for (const f of flags) lines.push(`- **${f.triggered ? 'TRIGGERED' : 'clean'}** ${f.check}: ${f.detail}`);
  lines.push('');

  lines.push(`## A3 hostile gate`);
  lines.push('');
  if (a3) {
    lines.push(`- **Verdict:** ${a3.verdict}`);
    lines.push(`- publicSafe: ${a3.publicSafe} · futureLaneValue: ${a3.futureLaneValue}`);
    lines.push(`- networkUsed: ${a3.networkUsed} · agentUsed: ${a3.agentUsed}`);
    lines.push(`- claims: PUBLIC_SAFE_USCE=${a3.publicSafeUsceClaims ?? 0}, CAUTION_SAFE=${a3.cautionSafeClaims ?? 0}, FUTURE_LANE_ONLY=${a3.futureLaneClaims ?? 0}`);
    lines.push(`- hallucinationRisks: ${(a3.hallucinationRisks ?? []).length}`);
    lines.push(`- quoteVerificationFailures: ${(a3.quoteVerificationFailures ?? []).length}`);
    lines.push(`- missingCriticalFields: ${(a3.missingCriticalFields ?? []).length}`);
    lines.push(`- requiredA4Tasks: ${(a3.requiredA4Tasks ?? []).length}`);
    if (a3.finalRecommendation) lines.push(`- **Recommendation:** ${a3.finalRecommendation}`);
  }
  lines.push('');

  lines.push(`## A4 focused-recovery tasks`);
  lines.push('');
  const tasks = a4?.tasks ?? [];
  lines.push(`- Total tasks: ${tasks.length}`);
  for (const t of tasks.slice(0, 10)) lines.push(`  - **${t.taskType}** (status: ${t.status}, blockedBy: ${t.blockedBy ?? 'none'}): ${t.rationale}`);
  lines.push('');

  lines.push(`## A5 continue-if-stuck decision`);
  lines.push('');
  if (a5) {
    lines.push(`- overallStatus: **${a5.overallStatus}**`);
    if (a5.stuckAtStage) lines.push(`- stuckAtStage: ${a5.stuckAtStage}`);
    lines.push(`- recommendedAction: ${a5.recommendedAction}`);
  }
  lines.push('');

  lines.push(`## Cleaned-text v2 diagnostic (P102-0F)`);
  lines.push('');
  if (v2Diag?.summary) {
    lines.push(`- v1 → v2 bytes: ${v2Diag.summary.totalV1Bytes} → ${v2Diag.summary.totalV2Bytes} (${v2Diag.summary.v2BytesAsPercentOfV1}% of v1)`);
    lines.push(`- reclassifications (URL-family → content-family): ${v2Diag.summary.reclassificationsCount}`);
  }
  lines.push('');

  lines.push(`## Scores`);
  lines.push('');
  if (summary?.scores) {
    for (const [k, v] of Object.entries(summary.scores)) lines.push(`- ${k}: ${v}`);
  }
  lines.push('');

  lines.push(`---`);
  lines.push(`_Report generated ${new Date().toISOString()} by \`scripts/p102-generate-run-report.ts\`. Pure data transform; no network, no Agent._`);

  return lines.join('\n') + '\n';
}

function parseArgs(argv: string[]): { runIds: string[] } {
  const args = { runIds: [] as string[] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-id') args.runIds.push(argv[++i]);
    else if (a === '--all-existing-p102-runs') {
      if (fs.existsSync(RUNS_ROOT)) {
        args.runIds = fs.readdirSync(RUNS_ROOT).filter(n => fs.statSync(path.join(RUNS_ROOT, n)).isDirectory());
      }
    }
  }
  return args;
}

function main(): void {
  const args = parseArgs(process.argv);
  if (args.runIds.length === 0) { console.error('No runs specified.'); process.exit(2); }
  console.log(`[report] generating ${args.runIds.length} per-run reports`);
  for (const runId of args.runIds) {
    const runFolder = path.join(RUNS_ROOT, runId);
    if (!fs.existsSync(runFolder)) { console.error(`[report] missing: ${runFolder}`); continue; }
    const reportPath = path.join(runFolder, 'RUN_REPORT.md');
    fs.writeFileSync(reportPath, generateReport(runFolder));
    console.log(`  ${runId}: → ${path.relative(REPO_ROOT, reportPath)}`);
  }
}

main();
