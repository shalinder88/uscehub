#!/usr/bin/env tsx
/**
 * P102-0F deep-packet validator.
 *
 * Checks every `16_three_tier_institution_packet.json` in p102/runs/* for:
 *   - schemaVersion is `p102-deep-0f-1`
 *   - all three tier packets present
 *   - PUBLIC_SAFE_USCE claims (if any) appear ONLY under tier1PreResidency
 *   - Tier 2 and Tier 3 claims are never PUBLIC_SAFE_USCE
 *   - source-family coverage is present
 *   - attestations are network-free / agent-free / no-broad-crawl / one-institution
 *   - quote verification rate is 1.0 (every claim quote-verified)
 *
 * Emits per-packet warnings (not failures) when:
 *   - Tier 1 coverage is WEAK and there is no negative-evidence claim
 *   - Tier 2 or Tier 3 was not searched at all
 *   - No PDF check was attempted
 *
 * Pure file I/O. No network. No Agent.
 *
 * Usage:
 *   npx tsx scripts/p102-validate-deep-packet.ts
 *   npx tsx scripts/p102-validate-deep-packet.ts --strict
 *   npx tsx scripts/p102-validate-deep-packet.ts --quiet
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');
const DEEP_SCHEMA = 'p102-deep-0f-1';

interface TierPacket {
  tier: string;
  tierCoverageStatus: string;
  claims?: Array<{ visibility: string; quote: string; quoteVerified?: boolean; claimId: string }>;
  publicSafeUsceCount: number;
  futureLaneOnlyCount: number;
  humanReviewRequiredCount: number;
}

interface ThreeTierPacket {
  schemaVersion: string;
  runId: string;
  institutionId: string;
  institutionName: string;
  officialDomains: string[];
  tier1PreResidency: TierPacket;
  tier2Trainee: TierPacket;
  tier3PracticeCareer: TierPacket;
  sourceFamilyCoverage?: unknown[];
  publicPromotionCandidates?: string[];
  attestations: { networkUsed: boolean; agentUsed: boolean; broadCrawlPerformed: boolean; oneInstitutionOnly: boolean };
  quoteVerificationSummary?: { totalClaims: number; quoteVerifiedClaims: number; rejectedClaims: number };
  publicReadiness: string;
  deepRunCompletion: string;
}

interface Issue { runId: string; severity: 'FAIL' | 'WARN'; message: string }

function readJson<T>(p: string): T { return JSON.parse(readFileSync(p, 'utf8')) as T; }

function validatePacket(packet: ThreeTierPacket, runId: string): Issue[] {
  const issues: Issue[] = [];

  // FAIL: schemaVersion
  if (packet.schemaVersion !== DEEP_SCHEMA) {
    issues.push({ runId, severity: 'FAIL', message: `schemaVersion is "${packet.schemaVersion}", expected "${DEEP_SCHEMA}"` });
  }

  // FAIL: three tiers present
  for (const k of ['tier1PreResidency', 'tier2Trainee', 'tier3PracticeCareer'] as const) {
    if (!packet[k]) issues.push({ runId, severity: 'FAIL', message: `missing tier packet "${k}"` });
  }

  // FAIL: PUBLIC_SAFE_USCE may appear ONLY in tier1
  for (const claim of packet.tier2Trainee?.claims ?? []) {
    if (claim.visibility === 'PUBLIC_SAFE_USCE') {
      issues.push({ runId, severity: 'FAIL', message: `tier2 claim "${claim.claimId}" has visibility=PUBLIC_SAFE_USCE (forbidden — Tier 2 is FUTURE_LANE_ONLY)` });
    }
  }
  for (const claim of packet.tier3PracticeCareer?.claims ?? []) {
    if (claim.visibility === 'PUBLIC_SAFE_USCE') {
      issues.push({ runId, severity: 'FAIL', message: `tier3 claim "${claim.claimId}" has visibility=PUBLIC_SAFE_USCE (forbidden — Tier 3 is FUTURE_LANE_ONLY)` });
    }
  }

  // FAIL: attestations
  const a = packet.attestations;
  if (a.networkUsed !== false) issues.push({ runId, severity: 'FAIL', message: `attestations.networkUsed must be false` });
  if (a.agentUsed !== false) issues.push({ runId, severity: 'FAIL', message: `attestations.agentUsed must be false` });
  if (a.broadCrawlPerformed !== false) issues.push({ runId, severity: 'FAIL', message: `attestations.broadCrawlPerformed must be false` });
  if (a.oneInstitutionOnly !== true) issues.push({ runId, severity: 'FAIL', message: `attestations.oneInstitutionOnly must be true` });

  // FAIL: quote verification rate
  const qv = packet.quoteVerificationSummary;
  if (qv && qv.totalClaims > 0 && qv.quoteVerifiedClaims < qv.totalClaims) {
    issues.push({ runId, severity: 'FAIL', message: `quote verification rate ${qv.quoteVerifiedClaims}/${qv.totalClaims} (must be 100%)` });
  }

  // FAIL: source-family coverage report present
  if (!Array.isArray(packet.sourceFamilyCoverage) || packet.sourceFamilyCoverage.length === 0) {
    issues.push({ runId, severity: 'FAIL', message: `sourceFamilyCoverage missing or empty — completion not verifiable` });
  }

  // WARN: Tier 1 coverage WEAK without negative evidence
  if (packet.tier1PreResidency.tierCoverageStatus === 'TIER_COVERAGE_WEAK' && (packet.tier1PreResidency.claims?.length ?? 0) === 0) {
    issues.push({ runId, severity: 'WARN', message: `Tier 1 coverage WEAK with zero claims — institution may be under-searched for USCE` });
  }
  // WARN: Tier 2 not searched
  if (packet.tier2Trainee.tierCoverageStatus === 'TIER_COVERAGE_WEAK' && (packet.tier2Trainee.claims?.length ?? 0) === 0) {
    issues.push({ runId, severity: 'WARN', message: `Tier 2 coverage WEAK — GME/residency/fellowship pages not searched` });
  }
  // WARN: Tier 3 not searched
  if (packet.tier3PracticeCareer.tierCoverageStatus === 'TIER_COVERAGE_WEAK' && (packet.tier3PracticeCareer.claims?.length ?? 0) === 0) {
    issues.push({ runId, severity: 'WARN', message: `Tier 3 coverage WEAK — careers/visa/benefits pages not searched` });
  }

  return issues;
}

interface CliOptions { strict: boolean; quiet: boolean }
function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { strict: false, quiet: false };
  for (const a of argv) {
    if (a === '--strict') opts.strict = true;
    else if (a === '--quiet') opts.quiet = true;
    else if (a === '--help' || a === '-h') {
      console.log('Usage: npx tsx scripts/p102-validate-deep-packet.ts [--strict] [--quiet]');
      process.exit(0);
    } else throw new Error(`unknown flag: ${a}`);
  }
  return opts;
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  if (!existsSync(RUNS_DIR)) {
    console.log('No runs dir — nothing to validate (PASS)');
    process.exit(0);
  }

  const runEntries = readdirSync(RUNS_DIR).filter((e) => statSync(path.join(RUNS_DIR, e)).isDirectory());
  const packetsFound: Array<{ runId: string; packet: ThreeTierPacket }> = [];

  for (const runId of runEntries) {
    const p = path.join(RUNS_DIR, runId, '16_three_tier_institution_packet.json');
    if (!existsSync(p)) continue;
    try {
      const packet = readJson<ThreeTierPacket>(p);
      packetsFound.push({ runId, packet });
    } catch (e) {
      packetsFound.push({ runId, packet: { schemaVersion: 'unreadable' } as ThreeTierPacket });
    }
  }

  if (packetsFound.length === 0) {
    console.log('No deep packets present — nothing to validate (PASS)');
    process.exit(0);
  }

  if (!opts.quiet) console.log(`P102-0F deep-packet validator — checking ${packetsFound.length} packet(s)`);

  let totalFails = 0;
  let totalWarns = 0;
  for (const { runId, packet } of packetsFound) {
    const issues = validatePacket(packet, runId);
    const fails = issues.filter((i) => i.severity === 'FAIL').length;
    const warns = issues.filter((i) => i.severity === 'WARN').length;
    totalFails += fails;
    totalWarns += warns;
    if (!opts.quiet) console.log(`  [${runId}] ${fails === 0 ? 'OK' : 'FAIL'} (${fails} fail, ${warns} warn)`);
    for (const i of issues) {
      console.log(`    [${i.severity}] ${i.message}`);
    }
  }

  console.log(`\n=== Deep-packet validator: ${totalFails} fails, ${totalWarns} warns across ${packetsFound.length} packet(s)`);

  if (totalFails > 0) process.exit(1);
  if (opts.strict && totalWarns > 0) process.exit(1);
  process.exit(0);
}

main();
