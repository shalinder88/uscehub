#!/usr/bin/env tsx
/**
 * P102-0F deep source discovery — re-classifies an existing institution
 * run's sources into the deep-mode source-family taxonomy and computes
 * source-family + tier coverage.
 *
 * Default mode is "reclassify-only" — no new network fetches. The operator
 * has not authorized new live-web traffic in this sprint. The optional
 * `--fetch-additional` flag (HEAD-first, bounded) is captured for future
 * authorized sprints but skipped here.
 *
 * Reads:
 *   docs/.../p102/runs/<run_id>/01_source_map.json
 *   docs/.../p102/runs/<run_id>/05_canonical_institution.json
 *
 * Writes:
 *   docs/.../p102/runs/<run_id>/00_deep_source_discovery.json
 *   docs/.../p102/runs/<run_id>/01_deep_source_family_coverage.json
 *   docs/.../p102/runs/<run_id>/01_rejected_source_candidates.json
 *
 * No network. No Agent. Pure file I/O + URL/title classification.
 *
 * Usage:
 *   npx tsx scripts/p102-deep-source-discovery.ts --run-id <id>
 *   npx tsx scripts/p102-deep-source-discovery.ts --run-id <id> --reclassify-only  (default)
 *   npx tsx scripts/p102-deep-source-discovery.ts --all-existing-p102-runs
 *
 * Flags (captured for future authorized fetching; not active in this sprint):
 *   --fetch-additional               enables bounded HEAD-first probing
 *   --max-discovered-urls <n>        default 75
 *   --max-accepted-sources <n>       default 40
 *   --max-pdfs <n>                   default 10
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');
const SCHEMA_VERSION = 'p102-deep-0f-1';

// -------------------- Deep source family taxonomy --------------------

export type DeepSourceFamily =
  | 'HOSPITAL_HOME' | 'HEALTH_SYSTEM_HOME'
  | 'MEDICAL_EDUCATION' | 'UNDERGRADUATE_MEDICAL_EDUCATION'
  | 'VISITING_STUDENT' | 'OBSERVERSHIP' | 'EXTERNSHIP' | 'ELECTIVE' | 'SUB_INTERNSHIP'
  | 'RESEARCH_EDUCATION' | 'VOLUNTEER_SHADOW'
  | 'GME' | 'RESIDENCY' | 'FELLOWSHIP' | 'ADVANCED_FELLOWSHIP'
  | 'PHYSICIAN_CAREERS' | 'PROVIDER_CAREERS' | 'BENEFITS' | 'VISA_IMMIGRATION' | 'FACULTY_JOBS'
  | 'PHYSICIAN_SERVICES'
  | 'PDF_POLICY' | 'APPLICATION_PORTAL' | 'CONTACT_PAGE' | 'REJECTION_EVIDENCE'
  | 'UNKNOWN_RELEVANT';

export type Tier = 'TIER_1_PRE_RESIDENCY_USCE_MATCH' | 'TIER_2_TRAINEE_RESIDENCY_FELLOWSHIP' | 'TIER_3_POST_TRAINEE_PRACTICE_CAREER' | 'NOT_APPLICABLE';

export type FamilyCoverageStatus =
  | 'COVERED_AND_READ' | 'COVERED_REJECTED'
  | 'ABSENT_AFTER_SEARCH' | 'SKIPPED_BY_BUDGET' | 'NOT_APPLICABLE';

export type TierCoverageStatus =
  | 'TIER_COVERAGE_COMPLETE' | 'TIER_COVERAGE_PARTIAL' | 'TIER_COVERAGE_WEAK' | 'TIER_COVERAGE_NEGATIVE';

/**
 * Deep source family rules. Each rule maps URL substring patterns +
 * title patterns + content patterns to a family. Lower priority wins.
 */
interface DeepFamilyRule {
  family: DeepSourceFamily;
  tier: Tier;
  priority: number;
  urlPatterns: RegExp[];
  titlePatterns: RegExp[];
}

/**
 * Rule semantics: lower `priority` number wins. A rule matches if EITHER an
 * urlPattern OR a titlePattern matches, UNLESS `requireBoth` is true (used
 * for HOSPITAL_HOME / HEALTH_SYSTEM_HOME so they don't capture every page
 * whose title contains "hospital").
 *
 * The URL-based classifier is a baseline. A1/A2 may re-tier a claim based
 * on actual cleaned-text content — and the deterministic visibility
 * classifier has the final word on PUBLIC_SAFE_USCE.
 */
const DEEP_FAMILY_RULES: Array<DeepFamilyRule & { requireBoth?: boolean }> = [
  // Tier 1 — USCE / Match (most-specific patterns first)
  { family: 'OBSERVERSHIP', tier: 'TIER_1_PRE_RESIDENCY_USCE_MATCH', priority: 1,
    urlPatterns: [/\bobserver(ship|s)?\b/i, /\bimg[-/]observer/i, /clinical[-_]observer/i],
    titlePatterns: [/observership/i, /clinical observer/i, /international observer/i, /physician observer/i] },
  { family: 'EXTERNSHIP', tier: 'TIER_1_PRE_RESIDENCY_USCE_MATCH', priority: 2,
    urlPatterns: [/\bexternship\b/i, /clinical[-_]externship/i],
    titlePatterns: [/externship/i] },
  { family: 'VISITING_STUDENT', tier: 'TIER_1_PRE_RESIDENCY_USCE_MATCH', priority: 3,
    urlPatterns: [/\bvisiting[-_]?student/i, /\bvisiting[-_]?medical/i, /\bvslo\b/i, /\bvsas\b/i, /international[-_]?(medical[-_]?)?student/i, /special[-_]student/i, /student[-_]visitation/i, /student[-_]visit\b/i],
    titlePatterns: [/visiting (medical )?student/i, /VSLO/, /audition/i, /special student/i, /international medical student/i, /student visit/i] },
  { family: 'ELECTIVE', tier: 'TIER_1_PRE_RESIDENCY_USCE_MATCH', priority: 4,
    urlPatterns: [/\belective[s]?\b/i, /\baway[-_]rotation/i, /fourth[-_]year[-_]elective/i, /senior[-_]elective/i, /clinical[-_]rotation/i],
    titlePatterns: [/clinical elective/i, /away rotation/i, /fourth-?year elective/i] },
  { family: 'SUB_INTERNSHIP', tier: 'TIER_1_PRE_RESIDENCY_USCE_MATCH', priority: 5,
    urlPatterns: [/\bsub[-_]?intern/i, /\bsubintern/i, /\bacting[-_]intern/i, /\bsub[-_]?i\b/i],
    titlePatterns: [/sub-?internship/i, /acting internship/i] },
  { family: 'RESEARCH_EDUCATION', tier: 'TIER_1_PRE_RESIDENCY_USCE_MATCH', priority: 6,
    urlPatterns: [/\bstudent[-_]research\b/i, /\bsummer[-_]research/i, /\bresearch[-_]elective/i],
    titlePatterns: [/student research/i, /summer research/i, /research elective/i, /medical (student )?research/i] },
  // Tier 2 — Trainee — must come BEFORE generic MEDICAL_EDUCATION so GME wins on URL paths
  { family: 'GME', tier: 'TIER_2_TRAINEE_RESIDENCY_FELLOWSHIP', priority: 7,
    urlPatterns: [/\bgme\b/i, /graduate[-_]medical[-_]education/i, /\bacgme\b/i],
    titlePatterns: [/graduate medical education/i, /\bGME\b/, /ACGME-?accredited/i] },
  { family: 'RESIDENCY', tier: 'TIER_2_TRAINEE_RESIDENCY_FELLOWSHIP', priority: 8,
    urlPatterns: [/\bresidency\b/i, /\bresidents\b/i, /resident[-_]curriculum/i],
    titlePatterns: [/\bresidency\b/i, /\bresident\b/i] },
  { family: 'FELLOWSHIP', tier: 'TIER_2_TRAINEE_RESIDENCY_FELLOWSHIP', priority: 9,
    urlPatterns: [/\bfellowship\b/i, /fellows[-_]program/i],
    titlePatterns: [/\bfellowship\b/i] },
  { family: 'ADVANCED_FELLOWSHIP', tier: 'TIER_2_TRAINEE_RESIDENCY_FELLOWSHIP', priority: 10,
    urlPatterns: [/advanced[-_]fellowship/i, /subspecialty[-_]fellowship/i],
    titlePatterns: [/advanced fellowship/i] },
  // Tier 1 generic-education families (after specific Tier 2 GME so GME wins on "/gme/" paths)
  { family: 'VOLUNTEER_SHADOW', tier: 'TIER_1_PRE_RESIDENCY_USCE_MATCH', priority: 11,
    urlPatterns: [/\bvolunteer/i, /\bshadow(ing)?/i],
    titlePatterns: [/volunteer/i, /shadow/i] },
  { family: 'UNDERGRADUATE_MEDICAL_EDUCATION', tier: 'TIER_1_PRE_RESIDENCY_USCE_MATCH', priority: 12,
    urlPatterns: [/\bume\b/i, /undergraduate[-_]medical[-_]education/i, /medical[-_]student[-_]affairs/i, /\bstudent[-_]affairs/i],
    titlePatterns: [/undergraduate medical education/i, /medical student affairs/i] },
  { family: 'MEDICAL_EDUCATION', tier: 'TIER_1_PRE_RESIDENCY_USCE_MATCH', priority: 13,
    urlPatterns: [/medical[-_]education/i, /professional[-_]education/i],
    titlePatterns: [/medical education/i] },
  // Tier 3 — Practice & Career
  { family: 'PHYSICIAN_CAREERS', tier: 'TIER_3_POST_TRAINEE_PRACTICE_CAREER', priority: 21,
    urlPatterns: [/physician[-_]careers?/i, /physician[-_]jobs?/i, /\bdoctor[-_]jobs/i],
    titlePatterns: [/physician careers?/i, /physician jobs?/i] },
  { family: 'PROVIDER_CAREERS', tier: 'TIER_3_POST_TRAINEE_PRACTICE_CAREER', priority: 22,
    urlPatterns: [/provider[-_]careers?/i, /clinician[-_]careers?/i],
    titlePatterns: [/provider careers?/i, /clinician careers?/i] },
  { family: 'FACULTY_JOBS', tier: 'TIER_3_POST_TRAINEE_PRACTICE_CAREER', priority: 23,
    urlPatterns: [/faculty[-_]positions?/i, /faculty[-_]openings?/i, /faculty[-_]recruitment/i, /faculty[-_]jobs?/i, /\bhospitalist/i, /\battending\b/i],
    titlePatterns: [/faculty (position|opening|recruitment)/i, /hospitalist/i, /attending physician/i] },
  { family: 'BENEFITS', tier: 'TIER_3_POST_TRAINEE_PRACTICE_CAREER', priority: 24,
    urlPatterns: [/\bbenefits\b/i, /total[-_]compensation/i, /\bperks\b/i],
    titlePatterns: [/employee benefits/i, /total compensation/i] },
  { family: 'VISA_IMMIGRATION', tier: 'TIER_3_POST_TRAINEE_PRACTICE_CAREER', priority: 25,
    urlPatterns: [/\bvisa\b/i, /\bj-?1\b/i, /\bh-?1b\b/i, /immigration/i, /sponsorship/i],
    titlePatterns: [/visa sponsorship/i, /J-?1/i, /H-?1B/i, /immigration/i] },
  { family: 'PHYSICIAN_SERVICES', tier: 'TIER_3_POST_TRAINEE_PRACTICE_CAREER', priority: 26,
    urlPatterns: [/malpractice/i, /disability[-_]insurance/i, /life[-_]insurance/i, /physician[-_]mortgage/i, /locum/i, /loan[-_]repayment/i],
    titlePatterns: [/malpractice/i, /disability insurance/i, /life insurance/i, /locums?/i, /loan repayment/i] },
  // Generic careers/jobs catch-all → Tier 3 (after specific physician/provider/faculty rules)
  { family: 'FACULTY_JOBS', tier: 'TIER_3_POST_TRAINEE_PRACTICE_CAREER', priority: 27,
    urlPatterns: [/\bcareers?\b/i, /\bjobs?\b/i],
    titlePatterns: [/careers/i, /jobs/i] },
  // Generic / utility
  { family: 'APPLICATION_PORTAL', tier: 'NOT_APPLICABLE', priority: 31,
    urlPatterns: [/\bapply\b/i, /\bapplication\b/i, /\bportal\b/i],
    titlePatterns: [/apply now/i, /application portal/i] },
  { family: 'CONTACT_PAGE', tier: 'NOT_APPLICABLE', priority: 32,
    urlPatterns: [/\bcontact\b/i, /contact[-_]us/i],
    titlePatterns: [/contact us/i, /contact information/i] },
  { family: 'PDF_POLICY', tier: 'NOT_APPLICABLE', priority: 33,
    urlPatterns: [/\.pdf(\?|$)/i, /policy/i, /handbook/i],
    titlePatterns: [/handbook/i, /policy/i] },
  // Home rules — require BOTH URL is the root AND title says hospital/health-system
  { family: 'HEALTH_SYSTEM_HOME', tier: 'NOT_APPLICABLE', priority: 41, requireBoth: true,
    urlPatterns: [/^https?:\/\/(www\.)?[^/]+\/?$/i],
    titlePatterns: [/health system/i] },
  { family: 'HOSPITAL_HOME', tier: 'NOT_APPLICABLE', priority: 42, requireBoth: true,
    urlPatterns: [/^https?:\/\/(www\.)?[^/]+\/?$/i],
    titlePatterns: [/hospital/i, /medical center/i] },
];

/**
 * Required source families per tier for "TIER_COVERAGE_COMPLETE".
 * Any of the families in the OR-group counts.
 */
const TIER_1_REQUIRED_FAMILIES: DeepSourceFamily[] = ['OBSERVERSHIP', 'VISITING_STUDENT', 'ELECTIVE', 'SUB_INTERNSHIP', 'EXTERNSHIP', 'RESEARCH_EDUCATION'];
const TIER_2_REQUIRED_FAMILIES: DeepSourceFamily[] = ['GME', 'RESIDENCY', 'FELLOWSHIP'];
const TIER_3_REQUIRED_FAMILIES: DeepSourceFamily[] = ['PHYSICIAN_CAREERS', 'PROVIDER_CAREERS', 'FACULTY_JOBS', 'BENEFITS'];

export function classifyDeepFamily(sourceUrl: string, sourceTitle: string | null): { family: DeepSourceFamily; tier: Tier; matchedRule: DeepFamilyRule | null; matchedOn: 'url' | 'title' | 'fallback' } {
  let best: { rule: DeepFamilyRule; matchedOn: 'url' | 'title' } | null = null;
  for (const rule of DEEP_FAMILY_RULES) {
    const urlHit = rule.urlPatterns.some((re) => re.test(sourceUrl));
    const titleHit = rule.titlePatterns.some((re) => re.test(sourceTitle ?? ''));
    const hit = (rule as { requireBoth?: boolean }).requireBoth ? (urlHit && titleHit) : (urlHit || titleHit);
    if (hit) {
      if (best === null || rule.priority < best.rule.priority) {
        best = { rule, matchedOn: urlHit ? 'url' : 'title' };
      }
    }
  }
  if (best) return { family: best.rule.family, tier: best.rule.tier, matchedRule: best.rule, matchedOn: best.matchedOn };
  return { family: 'UNKNOWN_RELEVANT', tier: 'NOT_APPLICABLE', matchedRule: null, matchedOn: 'fallback' };
}

// -------------------- Source record from existing 01_source_map.json --------------------

interface ExistingSourceRecord {
  sourceId: string;
  sourceUrl: string;
  sourceTitle: string | null;
  sourceFamily: string;
  sourceScope: string;
  acceptedForExtraction: boolean;
  cleanedTextPath: string | null;
  sourceHash: string | null;
  pdfStatus?: string;
}

interface SourceMap {
  schemaVersion: string;
  runId: string;
  sources: ExistingSourceRecord[];
}

interface CanonicalInstitution {
  institutionId: string;
  canonicalName: string;
  officialDomains: string[];
}

// -------------------- Outputs --------------------

interface FamilyCoverageEntry {
  family: DeepSourceFamily;
  tier: Tier;
  status: FamilyCoverageStatus;
  searchAttempts: string[];
  acceptedSources: string[];
  rejectedReason: string | null;
}

interface DeepDiscoveryReport {
  schemaVersion: string;
  runId: string;
  institutionId: string;
  institutionName: string;
  officialDomains: string[];
  mode: 'reclassify-only' | 'fetch-additional';
  budgets: { maxDiscoveredUrls: number; maxAcceptedSources: number; maxPdfs: number };
  perSource: Array<{
    sourceId: string;
    sourceUrl: string;
    legacyFamily: string;
    deepFamily: DeepSourceFamily;
    tier: Tier;
    matchedRule: { priority: number; matchedOn: 'url' | 'title' | 'fallback' } | null;
    accepted: boolean;
    hasCleanedText: boolean;
  }>;
  attestations: { networkUsed: false; agentUsed: false; broadCrawlPerformed: false; oneInstitutionOnly: true };
  generatedAt: string;
}

interface FamilyCoverageReport {
  schemaVersion: string;
  runId: string;
  institutionId: string;
  perFamily: FamilyCoverageEntry[];
  tierStatuses: {
    tier1: TierCoverageStatus;
    tier2: TierCoverageStatus;
    tier3: TierCoverageStatus;
  };
  tierCounts: {
    tier1AcceptedSources: number;
    tier2AcceptedSources: number;
    tier3AcceptedSources: number;
  };
  generatedAt: string;
}

interface RejectedCandidatesReport {
  schemaVersion: string;
  runId: string;
  rejectedSources: Array<{ sourceId: string; sourceUrl: string; deepFamily: DeepSourceFamily; tier: Tier; rejectedReason: string }>;
  generatedAt: string;
}

// -------------------- Helpers --------------------

function readJson<T>(p: string): T { return JSON.parse(readFileSync(p, 'utf8')) as T; }
function writeJson(p: string, data: unknown): void {
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function tierStatusFor(required: DeepSourceFamily[], perFamily: FamilyCoverageEntry[]): TierCoverageStatus {
  const requiredEntries = perFamily.filter((e) => required.includes(e.family));
  const covered = requiredEntries.filter((e) => e.status === 'COVERED_AND_READ').length;
  const negativeCaptured = requiredEntries.some((e) => e.status === 'COVERED_AND_READ' && e.rejectedReason === 'explicit_negative_quote_captured');
  if (covered === required.length) return 'TIER_COVERAGE_COMPLETE';
  if (negativeCaptured) return 'TIER_COVERAGE_NEGATIVE';
  if (covered > 0) return 'TIER_COVERAGE_PARTIAL';
  return 'TIER_COVERAGE_WEAK';
}

// -------------------- Per-run runner --------------------

interface CliOptions {
  runIds: string[];
  mode: 'reclassify-only' | 'fetch-additional';
  maxDiscoveredUrls: number;
  maxAcceptedSources: number;
  maxPdfs: number;
  quiet: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    runIds: [],
    mode: 'reclassify-only',
    maxDiscoveredUrls: 75,
    maxAcceptedSources: 40,
    maxPdfs: 10,
    quiet: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-id') { opts.runIds.push(argv[++i]); continue; }
    if (a === '--all-existing-p102-runs') {
      const entries = readdirSync(RUNS_DIR).filter((e) => {
        const p = path.join(RUNS_DIR, e);
        return statSync(p).isDirectory() && existsSync(path.join(p, '01_source_map.json'));
      });
      opts.runIds.push(...entries);
      continue;
    }
    if (a === '--reclassify-only') { opts.mode = 'reclassify-only'; continue; }
    if (a === '--fetch-additional') { opts.mode = 'fetch-additional'; continue; }
    if (a === '--max-discovered-urls') { opts.maxDiscoveredUrls = parseInt(argv[++i], 10); continue; }
    if (a === '--max-accepted-sources') { opts.maxAcceptedSources = parseInt(argv[++i], 10); continue; }
    if (a === '--max-pdfs') { opts.maxPdfs = parseInt(argv[++i], 10); continue; }
    if (a === '--quiet') { opts.quiet = true; continue; }
    if (a === '--help' || a === '-h') {
      console.log('Usage: npx tsx scripts/p102-deep-source-discovery.ts --run-id <id> [--reclassify-only|--fetch-additional]');
      process.exit(0);
    }
    throw new Error(`unknown flag: ${a}`);
  }
  if (opts.runIds.length === 0) throw new Error('must pass --run-id <id> or --all-existing-p102-runs');
  return opts;
}

function classifyOneRun(runId: string, opts: CliOptions): { ok: boolean; summary: string } {
  const runDir = path.join(RUNS_DIR, runId);
  const sourceMapPath = path.join(runDir, '01_source_map.json');
  const canonicalPath = path.join(runDir, '05_canonical_institution.json');
  if (!existsSync(sourceMapPath) || !existsSync(canonicalPath)) {
    return { ok: false, summary: `${runId}: missing source map or canonical institution` };
  }
  const sourceMap = readJson<SourceMap>(sourceMapPath);
  const canonical = readJson<CanonicalInstitution>(canonicalPath);

  if (opts.mode === 'fetch-additional') {
    // Reserved for future authorized live-web fetching. Not implemented in
    // this sprint to keep the operator's "no new broad crawling" constraint.
    if (!opts.quiet) console.log(`[${runId}] --fetch-additional requested but disabled this sprint; reclassifying only`);
  }

  const perSource: DeepDiscoveryReport['perSource'] = [];
  for (const s of sourceMap.sources) {
    const classification = classifyDeepFamily(s.sourceUrl, s.sourceTitle);
    perSource.push({
      sourceId: s.sourceId,
      sourceUrl: s.sourceUrl,
      legacyFamily: s.sourceFamily,
      deepFamily: classification.family,
      tier: classification.tier,
      matchedRule: classification.matchedRule
        ? { priority: classification.matchedRule.priority, matchedOn: classification.matchedOn }
        : null,
      accepted: s.acceptedForExtraction === true && !!s.cleanedTextPath,
      hasCleanedText: !!s.cleanedTextPath,
    });
  }

  // Build family coverage report. For every deep family enum, compute its status.
  const allFamilies: DeepSourceFamily[] = [
    'HOSPITAL_HOME', 'HEALTH_SYSTEM_HOME',
    'MEDICAL_EDUCATION', 'UNDERGRADUATE_MEDICAL_EDUCATION',
    'VISITING_STUDENT', 'OBSERVERSHIP', 'EXTERNSHIP', 'ELECTIVE', 'SUB_INTERNSHIP',
    'RESEARCH_EDUCATION', 'VOLUNTEER_SHADOW',
    'GME', 'RESIDENCY', 'FELLOWSHIP', 'ADVANCED_FELLOWSHIP',
    'PHYSICIAN_CAREERS', 'PROVIDER_CAREERS', 'BENEFITS', 'VISA_IMMIGRATION', 'FACULTY_JOBS',
    'PHYSICIAN_SERVICES',
    'PDF_POLICY', 'APPLICATION_PORTAL', 'CONTACT_PAGE', 'REJECTION_EVIDENCE',
    'UNKNOWN_RELEVANT',
  ];

  const perFamily: FamilyCoverageEntry[] = [];
  for (const family of allFamilies) {
    const matched = perSource.filter((p) => p.deepFamily === family);
    const accepted = matched.filter((m) => m.accepted);
    const rejected = matched.filter((m) => !m.accepted);
    const tier = matched[0]?.tier ?? 'NOT_APPLICABLE';

    let status: FamilyCoverageStatus;
    let rejectedReason: string | null = null;
    if (accepted.length > 0) {
      status = 'COVERED_AND_READ';
    } else if (rejected.length > 0) {
      status = 'COVERED_REJECTED';
      rejectedReason = 'source candidate found in map but no cleaned text accepted (404 / off-topic / off-domain)';
    } else {
      status = 'ABSENT_AFTER_SEARCH';
    }

    perFamily.push({
      family,
      tier,
      status,
      searchAttempts: matched.map((m) => m.sourceUrl),
      acceptedSources: accepted.map((m) => m.sourceUrl),
      rejectedReason,
    });
  }

  const tierStatuses = {
    tier1: tierStatusFor(TIER_1_REQUIRED_FAMILIES, perFamily),
    tier2: tierStatusFor(TIER_2_REQUIRED_FAMILIES, perFamily),
    tier3: tierStatusFor(TIER_3_REQUIRED_FAMILIES, perFamily),
  };

  const tierCounts = {
    tier1AcceptedSources: perSource.filter((p) => p.tier === 'TIER_1_PRE_RESIDENCY_USCE_MATCH' && p.accepted).length,
    tier2AcceptedSources: perSource.filter((p) => p.tier === 'TIER_2_TRAINEE_RESIDENCY_FELLOWSHIP' && p.accepted).length,
    tier3AcceptedSources: perSource.filter((p) => p.tier === 'TIER_3_POST_TRAINEE_PRACTICE_CAREER' && p.accepted).length,
  };

  // ---- Write outputs ----

  const discovery: DeepDiscoveryReport = {
    schemaVersion: SCHEMA_VERSION,
    runId, institutionId: canonical.institutionId, institutionName: canonical.canonicalName,
    officialDomains: canonical.officialDomains,
    mode: opts.mode,
    budgets: { maxDiscoveredUrls: opts.maxDiscoveredUrls, maxAcceptedSources: opts.maxAcceptedSources, maxPdfs: opts.maxPdfs },
    perSource,
    attestations: { networkUsed: false, agentUsed: false, broadCrawlPerformed: false, oneInstitutionOnly: true },
    generatedAt: new Date().toISOString(),
  };
  writeJson(path.join(runDir, '00_deep_source_discovery.json'), discovery);

  const coverage: FamilyCoverageReport = {
    schemaVersion: SCHEMA_VERSION,
    runId, institutionId: canonical.institutionId,
    perFamily, tierStatuses, tierCounts,
    generatedAt: new Date().toISOString(),
  };
  writeJson(path.join(runDir, '01_deep_source_family_coverage.json'), coverage);

  const rejected: RejectedCandidatesReport = {
    schemaVersion: SCHEMA_VERSION,
    runId,
    rejectedSources: perSource.filter((p) => !p.accepted).map((p) => ({
      sourceId: p.sourceId,
      sourceUrl: p.sourceUrl,
      deepFamily: p.deepFamily,
      tier: p.tier,
      rejectedReason: 'not accepted for extraction (no cleaned text on T7)',
    })),
    generatedAt: new Date().toISOString(),
  };
  writeJson(path.join(runDir, '01_rejected_source_candidates.json'), rejected);

  if (!opts.quiet) {
    console.log(`[${runId}] deep discovery: T1=${tierCounts.tier1AcceptedSources} (${tierStatuses.tier1})  T2=${tierCounts.tier2AcceptedSources} (${tierStatuses.tier2})  T3=${tierCounts.tier3AcceptedSources} (${tierStatuses.tier3})`);
  }

  return { ok: true, summary: `${runId}: T1=${tierCounts.tier1AcceptedSources} T2=${tierCounts.tier2AcceptedSources} T3=${tierCounts.tier3AcceptedSources}` };
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.quiet) {
    console.log(`P102-0F deep source discovery (mode: ${opts.mode})`);
    console.log(`  runs: ${opts.runIds.length}`);
  }

  const results = opts.runIds.map((id) => classifyOneRun(id, opts));

  console.log(`\n=== Deep source discovery summary`);
  for (const r of results) console.log(`  [${r.ok ? 'OK' : 'FAIL'}] ${r.summary}`);
  process.exit(results.every((r) => r.ok) ? 0 : 1);
}

main();
