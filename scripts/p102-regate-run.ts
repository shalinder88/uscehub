#!/usr/bin/env tsx
/**
 * P102 A3 re-gate — hostile gate that reads ONLY run-folder files,
 * recomputes A3_gate.json and 15_publish_gate.md after extraction.
 *
 * Invariants:
 *   - No network. No Agent. No subagents.
 *   - Reads only files in the run folder.
 *   - Self-attests networkUsed=false, agentUsed=false.
 *   - Recomputes: unsupportedClaims, quoteVerificationFailures,
 *     sourceScopeConflicts, missingCriticalFields, publicSafe, verdict.
 *
 * Usage:
 *   npx tsx scripts/p102-regate-run.ts --run-id p102-1-trial-2-run-1
 *   npx tsx scripts/p102-regate-run.ts --all-existing-p102-runs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const SCHEMA_VERSION = 'p102-0r-1';
const REPO_ROOT = path.resolve(__dirname, '..');
const REPO_P102_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102');
const RUNS_ROOT = path.join(REPO_P102_ROOT, 'runs');
const NOT_STATED = 'NOT_STATED_ON_SOURCE';

const FUTURE_LANE_SOURCE_FAMILIES = new Set(['GME_PAGE', 'RESIDENCY_PAGE', 'FELLOWSHIP_PAGE', 'CAREERS_PAGE', 'JOBS_PAGE']);
const SYSTEM_OR_SCHOOL_SCOPES = new Set(['HEALTH_SYSTEM_LEVEL', 'MEDICAL_SCHOOL_LEVEL']);

interface ClaimRecord {
  claimId: string;
  claimType: string;
  quote: string;
  sourceUrl: string;
  sourceHash: string;
  cleanedTextPath: string;
  quoteVerified: boolean;
  sourceScope: string;
  sourceFamily: string;
  confidence: string;
  visibility: string;
  lane: string;
  notPublicReason: string | null;
  campusApplicabilityProof: string | null;
}

interface NegativeClaim {
  claimId: string;
  negativeEvidenceType: string;
  quote: string;
  sourceUrl: string;
  quoteVerified: boolean;
  negativeEvidenceStrength: string;
  publicSafeNegativeClaim: boolean;
}

function readJson<T = unknown>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return null; }
}

function writeJson(p: string, data: unknown): void { fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n'); }
function writeText(p: string, s: string): void { fs.writeFileSync(p, s); }

function normalize(s: string): string { return s.replace(/\s+/g, ' ').trim().toLowerCase(); }

function verifyQuoteAgainstCleanedText(quote: string, cleanedTextPath: string): boolean {
  if (!quote || quote === NOT_STATED) return false;
  if (!fs.existsSync(cleanedTextPath)) return false;
  const cleaned = fs.readFileSync(cleanedTextPath, 'utf8');
  return normalize(cleaned).includes(normalize(quote));
}

interface RegateResult {
  runId: string;
  verdict: 'PASS' | 'PASS_WITH_CAVEATS' | 'FAIL_NEEDS_A4' | 'FAIL_FATAL';
  publicSafe: boolean;
  futureLaneValue: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  hallucinationRisks: string[];
  unsupportedClaims: string[];
  quoteVerificationFailures: string[];
  sourceScopeConflicts: string[];
  missingCriticalFields: string[];
  negativeEvidenceFindings: string[];
  requiredA4Tasks: string[];
}

function regate(runFolder: string): RegateResult {
  const runId = path.basename(runFolder);

  // A3 invariants: no network, no Agent. We are reading run-folder files only.
  let claimsDoc = readJson<{ claims: ClaimRecord[] }>(path.join(runFolder, '13_source_claims.json'));
  // P102-0E: if a model-claim ledger exists alongside the deterministic one,
  // merge it in for re-gate checks. The model ledger uses the same ClaimRecord
  // fields the regate inspects (claimId, quote, quoteVerified, visibility,
  // sourceFamily, sourceScope, cleanedTextPath, etc.) plus extras we ignore here.
  const modelClaimsDoc = readJson<{ claims: ClaimRecord[] }>(path.join(runFolder, '13_model_claims_verified.json'));
  if (modelClaimsDoc && Array.isArray(modelClaimsDoc.claims) && modelClaimsDoc.claims.length > 0) {
    if (!claimsDoc) {
      claimsDoc = { claims: [...modelClaimsDoc.claims] };
    } else {
      const existingIds = new Set(claimsDoc.claims.map((c) => c.claimId));
      for (const c of modelClaimsDoc.claims) {
        if (!existingIds.has(c.claimId)) claimsDoc.claims.push(c);
      }
    }
  }
  const opps = readJson<{ opportunities: Array<Record<string, unknown>> }>(path.join(runFolder, '03_opportunity_objects.json'));
  const negs = readJson<{ negativeClaims: NegativeClaim[] }>(path.join(runFolder, 'RT_depth_negative_evidence.json'));
  const scopeConflictsDoc = readJson<{ conflicts: Array<{ sourceUrl: string; sourceScope: string; reason: string }> }>(path.join(runFolder, 'RT_depth_source_scope_conflicts.json'));
  const auditDoc = readJson<{ robotsChecked?: boolean; sitemapChecked?: boolean; searchCompletenessScore?: number }>(path.join(runFolder, 'A1_5_source_completeness_audit.json'));

  const hallucinationRisks: string[] = [];
  const unsupportedClaims: string[] = [];
  const quoteVerificationFailures: string[] = [];
  const sourceScopeConflicts: string[] = [];
  const missingCriticalFields: string[] = [];
  const negativeEvidenceFindings: string[] = [];
  const requiredA4Tasks: string[] = [];

  // Check every claim
  if (claimsDoc && Array.isArray(claimsDoc.claims)) {
    for (const c of claimsDoc.claims) {
      // Structural
      if (!c.sourceUrl) unsupportedClaims.push(`${c.claimId}: missing sourceUrl`);
      if (!c.sourceHash) unsupportedClaims.push(`${c.claimId}: missing sourceHash`);
      if (!c.cleanedTextPath) unsupportedClaims.push(`${c.claimId}: missing cleanedTextPath`);
      // Quote verification (re-check)
      const isNotStated = c.quote === NOT_STATED;
      if (!isNotStated) {
        const actualVerified = verifyQuoteAgainstCleanedText(c.quote, c.cleanedTextPath);
        if (c.quoteVerified === true && !actualVerified) {
          quoteVerificationFailures.push(`${c.claimId}: quote not found in cleaned text`);
          hallucinationRisks.push(`claim ${c.claimId} declared quoteVerified=true but verification failed`);
        }
      }
      // Visibility rules
      if (c.visibility === 'PUBLIC_SAFE_USCE') {
        if (isNotStated) {
          quoteVerificationFailures.push(`${c.claimId}: PUBLIC_SAFE_USCE with NOT_STATED_ON_SOURCE`);
        }
        if (FUTURE_LANE_SOURCE_FAMILIES.has(c.sourceFamily)) {
          sourceScopeConflicts.push(`${c.claimId}: PUBLIC_SAFE_USCE from future-lane source family ${c.sourceFamily}`);
        }
        if (SYSTEM_OR_SCHOOL_SCOPES.has(c.sourceScope) && !c.campusApplicabilityProof) {
          sourceScopeConflicts.push(`${c.claimId}: PUBLIC_SAFE_USCE from ${c.sourceScope} without campusApplicabilityProof`);
        }
      }
    }
  }

  // Check opportunities for PUBLIC_SAFE backreferences
  if (opps && Array.isArray(opps.opportunities) && claimsDoc) {
    const claimById = new Map<string, ClaimRecord>();
    for (const c of claimsDoc.claims) claimById.set(c.claimId, c);
    for (const o of opps.opportunities) {
      if (o.visibilityLane !== 'PUBLIC_SAFE_USCE') continue;
      const refs = (o.sourceClaimIds as string[] | undefined) ?? [];
      if (refs.length === 0) { missingCriticalFields.push(`opportunity ${String(o.opportunityId)}: PUBLIC_SAFE_USCE without sourceClaimIds`); continue; }
      const verified = refs.filter(r => {
        const c = claimById.get(r);
        if (!c) return false;
        if (c.quote === NOT_STATED) return false;
        return c.quoteVerified === true && verifyQuoteAgainstCleanedText(c.quote, c.cleanedTextPath);
      });
      if (verified.length === 0) {
        missingCriticalFields.push(`opportunity ${String(o.opportunityId)}: no verified claim backing PUBLIC_SAFE_USCE`);
      }
    }
  }

  // Negative-evidence findings
  if (negs && Array.isArray(negs.negativeClaims)) {
    for (const n of negs.negativeClaims) {
      if (n.publicSafeNegativeClaim === true) {
        if (n.negativeEvidenceType !== 'EXPLICIT_NEGATIVE_QUOTE') {
          negativeEvidenceFindings.push(`${n.claimId}: publicSafeNegativeClaim=true but type is ${n.negativeEvidenceType}`);
        }
        if (n.negativeEvidenceStrength !== 'STRONG') {
          negativeEvidenceFindings.push(`${n.claimId}: publicSafeNegativeClaim=true but strength is ${n.negativeEvidenceStrength}`);
        }
      }
    }
    if (negs.negativeClaims.length === 0) {
      negativeEvidenceFindings.push('No explicit negative quotes captured; absence-only is not PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY');
    }
  }

  // Scope conflicts
  if (scopeConflictsDoc && Array.isArray(scopeConflictsDoc.conflicts)) {
    for (const sc of scopeConflictsDoc.conflicts) {
      sourceScopeConflicts.push(`${sc.sourceUrl}: ${sc.reason}`);
    }
  }

  // Critical field checks
  if (!auditDoc || !auditDoc.robotsChecked) missingCriticalFields.push('robots.txt was not reachable or not checked');
  // Empty sitemap is allowed (Hartford case); don't flag.
  if ((auditDoc?.searchCompletenessScore ?? 0) === 0) requiredA4Tasks.push('searchCompletenessScore=0 — investigate A0 capture');

  // Verdict
  const publicSafeCount = claimsDoc?.claims?.filter(c => c.visibility === 'PUBLIC_SAFE_USCE').length ?? 0;
  const cautionSafeCount = claimsDoc?.claims?.filter(c => c.visibility === 'CAUTION_SAFE_INTERNAL_REVIEW').length ?? 0;
  const futureLaneCount = claimsDoc?.claims?.filter(c => c.visibility === 'FUTURE_LANE_ONLY').length ?? 0;

  let verdict: RegateResult['verdict'] = 'PASS_WITH_CAVEATS';
  const fatalProblems = hallucinationRisks.length + quoteVerificationFailures.length;
  if (fatalProblems > 0) verdict = 'FAIL_FATAL';
  else if (missingCriticalFields.length > 0) verdict = 'FAIL_NEEDS_A4';
  else if (publicSafeCount === 0 && cautionSafeCount === 0 && futureLaneCount === 0) verdict = 'FAIL_NEEDS_A4';

  const publicSafe = publicSafeCount > 0 && missingCriticalFields.length === 0 && hallucinationRisks.length === 0;

  const futureLaneValue: RegateResult['futureLaneValue'] =
    futureLaneCount > 20 ? 'HIGH' :
    futureLaneCount > 5 ? 'MEDIUM' :
    futureLaneCount > 0 ? 'LOW' : 'NONE';

  const a3 = {
    schemaVersion: SCHEMA_VERSION,
    runId,
    institutionId: claimsDoc?.claims?.[0]?.claimId?.split('_')[2] ?? null, // best-effort
    verdict,
    networkUsed: false,
    agentUsed: false,
    publicSafe,
    futureLaneValue,
    publicSafeUsceClaims: publicSafeCount,
    cautionSafeClaims: cautionSafeCount,
    futureLaneClaims: futureLaneCount,
    hallucinationRisks,
    unsupportedClaims,
    quoteVerificationFailures,
    sourceScopeConflicts,
    missingCriticalFields,
    negativeEvidenceFindings,
    requiredA4Tasks,
    finalRecommendation: verdict === 'FAIL_FATAL'
      ? 'Re-run extraction; do not advance trial.'
      : verdict === 'FAIL_NEEDS_A4'
      ? 'A4 recovery required; investigate missing critical fields.'
      : publicSafeCount > 0
      ? 'Public-safe claims emitted; manual review before publish.'
      : 'Framework verdict; no public-safe claims (correct under P102-0C deterministic extraction; awaits P102-0D model reader).',
    a3RegatedAt: new Date().toISOString(),
    a3RegatedBy: 'p102-regate-run (network-free, agent-free, run-folder-only)',
  };

  writeJson(path.join(runFolder, 'A3_gate.json'), a3);
  writeText(
    path.join(runFolder, '15_publish_gate.md'),
    `# Publish Gate (A3) — ${runId}\n\nschemaVersion: ${SCHEMA_VERSION}\nregatedAt: ${a3.a3RegatedAt}\n\n` +
    `**A3 read only run-folder files. No network. No Agent.**\n\n` +
    `- Verdict: ${verdict}\n` +
    `- Public safe: ${publicSafe}\n` +
    `- Future lane value: ${futureLaneValue}\n` +
    `- PUBLIC_SAFE_USCE claims: ${publicSafeCount}\n` +
    `- CAUTION_SAFE_INTERNAL_REVIEW claims: ${cautionSafeCount}\n` +
    `- FUTURE_LANE_ONLY claims: ${futureLaneCount}\n` +
    `- networkUsed: false\n- agentUsed: false\n\n` +
    `## Hallucination risks\n${hallucinationRisks.length ? hallucinationRisks.map(s => `- ${s}`).join('\n') : '_(none)_'}\n\n` +
    `## Unsupported claims\n${unsupportedClaims.length ? unsupportedClaims.map(s => `- ${s}`).join('\n') : '_(none)_'}\n\n` +
    `## Quote verification failures\n${quoteVerificationFailures.length ? quoteVerificationFailures.map(s => `- ${s}`).join('\n') : '_(none)_'}\n\n` +
    `## Source scope conflicts\n${sourceScopeConflicts.length ? sourceScopeConflicts.map(s => `- ${s}`).join('\n') : '_(none)_'}\n\n` +
    `## Missing critical fields\n${missingCriticalFields.length ? missingCriticalFields.map(s => `- ${s}`).join('\n') : '_(none)_'}\n\n` +
    `## Negative evidence findings\n${negativeEvidenceFindings.length ? negativeEvidenceFindings.map(s => `- ${s}`).join('\n') : '_(none)_'}\n\n` +
    `## Required A4 tasks\n${requiredA4Tasks.length ? requiredA4Tasks.map(s => `- ${s}`).join('\n') : '_(none)_'}\n\n` +
    `## Final recommendation\n${a3.finalRecommendation}\n`
  );

  return {
    runId, verdict, publicSafe, futureLaneValue,
    hallucinationRisks, unsupportedClaims, quoteVerificationFailures,
    sourceScopeConflicts, missingCriticalFields, negativeEvidenceFindings, requiredA4Tasks,
  };
}

// CLI
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
  if (args.runIds.length === 0) { console.error('No runs specified. Use --run-id <id> or --all-existing-p102-runs'); process.exit(2); }
  console.log(`[regate] regating ${args.runIds.length} runs: ${args.runIds.join(', ')}`);
  for (const runId of args.runIds) {
    const runFolder = path.join(RUNS_ROOT, runId);
    if (!fs.existsSync(runFolder)) { console.error(`[regate] missing: ${runFolder}`); continue; }
    const r = regate(runFolder);
    console.log(`  ${r.runId}: verdict=${r.verdict} publicSafe=${r.publicSafe} futureLaneValue=${r.futureLaneValue} hallucinations=${r.hallucinationRisks.length} unsupported=${r.unsupportedClaims.length} quoteFail=${r.quoteVerificationFailures.length} scopeConflicts=${r.sourceScopeConflicts.length} missingFields=${r.missingCriticalFields.length}`);
  }
}

main();
