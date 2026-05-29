#!/usr/bin/env tsx
/**
 * P102 Public-Safe Opportunity Row Builder.
 *
 * Reads existing 13_model_claims_verified.json + 13_source_claims.json ledgers
 * and groups verified PUBLIC_SAFE_USCE claims into deduplicated opportunity
 * rows that downstream display surfaces can render.
 *
 * Pure read + group + write. No model calls. No DB. No public-facing UI. No
 * mutation of upstream ledgers. Local JSON exports only.
 *
 * Outputs (under docs/.../p102/exports/):
 *   - public_safe_opportunity_rows.json     (PUBLIC_SAFE_USCE, grouped)
 *   - public_safe_review_queue.json         (CAUTION_SAFE + HUMAN_REVIEW)
 *   - future_lane_archive.json              (FUTURE_LANE_ONLY, audit)
 *   - hidden_rejected_archive.json          (HIDDEN_REJECTED, audit)
 *
 * Usage:
 *   npx tsx scripts/p102-build-public-safe-opportunity-rows.ts --all-existing-p102-runs
 *   npx tsx scripts/p102-build-public-safe-opportunity-rows.ts --run-id <run_id>
 *   npx tsx scripts/p102-build-public-safe-opportunity-rows.ts --queue p102_high_yield_usce_queue
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { hasAcceptablePath, laneToCategory, type UsceCategory } from './p102-cron-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');
const EXPORTS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');
const QUEUES_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/queues');
const SCHEMA_VERSION = 'p102-row-contract-1';

// -------------------- Types --------------------

type Visibility =
  | 'PUBLIC_SAFE_USCE'
  | 'PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY'
  | 'CAUTION_SAFE_INTERNAL_REVIEW'
  | 'FUTURE_LANE_ONLY'
  | 'HIDDEN_REJECTED'
  | 'HUMAN_REVIEW_REQUIRED';

type OpportunityType =
  | 'OBSERVERSHIP'
  | 'VISITING_MEDICAL_STUDENT'
  | 'CLINICAL_ELECTIVE'
  | 'SUB_INTERNSHIP'
  | 'AWAY_ROTATION'
  | 'INTERNATIONAL_VISITING_STUDENT'
  | 'RESEARCH_OPPORTUNITY'
  | 'EXTERNSHIP';

interface RawClaim {
  claimId: string;
  claimType?: string;
  lane?: string;
  sourceUrl?: string;
  sourceHash?: string;
  cleanedTextPath?: string;
  sourceScope?: string;
  sourceFamily?: string;
  deepSourceFamily?: string | null;
  quote?: string;
  normalizedField?: string | null;
  claimText?: string;
  visibility?: Visibility;
  visibilityRationale?: string | null;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  quoteVerified?: boolean;
  limitations?: string | null;
  campusApplicabilityProof?: string | null;
  tier?: string;
  runId?: string;
  institutionId?: string;
}

interface CanonicalInstitution {
  institutionId: string;
  canonicalName: string;
  state: string;
  city: string;
  parentSystem: string | null;
  officialDomains: string[];
}

interface OpportunityRow {
  rowId: string;
  institutionId: string;
  institutionName: string;
  parentSystem: string | null;
  campus: string | null;
  city: string;
  state: string;
  opportunityName: string;
  opportunityType: OpportunityType;
  audience: string | null;
  eligibility: string | null;
  specialty: string | null;
  applicationRoute: string | null;
  cost: string | null;
  duration: string | null;
  deadline: string | null;
  contact: { name: string | null; title: string | null; email: string | null; phone: string | null } | null;
  sourceUrl: string;
  sourceQuote: string;
  sourceHash: string;
  cleanedTextPath: string;
  sourceScope: string;
  campusApplicabilityProof: string | null;
  lastReviewed: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  visibilityLane: 'PUBLIC_SAFE_USCE';
  humanReviewStatus: 'PENDING';
  usceCategory: UsceCategory | null;
  extractedFromRunId: string;
  claimIds: string[];
  notStatedFields: string[];
  warnings: string[];
  schemaVersion: typeof SCHEMA_VERSION;
}

interface ReviewQueueEntry {
  claimId: string;
  institutionId: string;
  institutionName: string;
  state: string;
  city: string;
  visibilityLane: Visibility;
  visibilityRationale: string | null;
  lane: string;
  deepSourceFamily: string | null;
  sourceScope: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  sourceUrl: string;
  sourceQuote: string;
  warnings: string[];
  extractedFromRunId: string;
  schemaVersion: typeof SCHEMA_VERSION;
}

interface ArchiveEntry {
  claimId: string;
  institutionId: string;
  state: string;
  visibilityLane: Visibility;
  lane: string;
  deepSourceFamily: string | null;
  sourceUrl: string;
  sourceQuote: string;
  extractedFromRunId: string;
  rationale: string;
  schemaVersion: typeof SCHEMA_VERSION;
}

// -------------------- CLI args --------------------

interface CliArgs {
  runIds: string[];
  allExisting: boolean;
  queue: string | null;
}

function parseArgs(argv: string[]): CliArgs {
  const opts: CliArgs = { runIds: [], allExisting: false, queue: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-id') opts.runIds.push(argv[++i]);
    else if (a === '--all-existing-p102-runs') opts.allExisting = true;
    else if (a === '--queue') opts.queue = argv[++i];
  }
  return opts;
}

// -------------------- IO --------------------

function readJson<T>(p: string): T | null {
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as T;
  } catch {
    return null;
  }
}

function writeJson(p: string, data: unknown): void {
  if (!existsSync(path.dirname(p))) mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

// -------------------- Helpers --------------------

function hash(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 16);
}

function mapLaneToOpportunityType(lane: string | undefined, deepFamily: string | null | undefined): OpportunityType {
  const l = (lane ?? '').toUpperCase();
  const d = (deepFamily ?? '').toUpperCase();
  if (l === 'IMG_OBSERVERSHIP' || l === 'OBSERVERSHIP' || l === 'PHYSICIAN_OBSERVERSHIP' || d === 'OBSERVERSHIP') return 'OBSERVERSHIP';
  if (l === 'INTERNATIONAL_MEDICAL_STUDENT' || d === 'INTERNATIONAL_VISITING_STUDENT') return 'INTERNATIONAL_VISITING_STUDENT';
  if (l === 'SUB_INTERNSHIP' || d === 'SUB_INTERNSHIP') return 'SUB_INTERNSHIP';
  if (l === 'AWAY_ROTATION' || d === 'AWAY_ROTATION') return 'AWAY_ROTATION';
  if (l === 'CLINICAL_ELECTIVE' || d === 'CLINICAL_ELECTIVE' || d === 'ELECTIVE') return 'CLINICAL_ELECTIVE';
  if (l === 'RESEARCH_OPPORTUNITY' || d === 'RESEARCH_EDUCATION') return 'RESEARCH_OPPORTUNITY';
  if (d === 'EXTERNSHIP') return 'EXTERNSHIP';
  return 'VISITING_MEDICAL_STUDENT';
}

function deriveCampus(canonicalName: string, parentSystem: string | null): string | null {
  if (!parentSystem) return null;
  const lower = canonicalName.toLowerCase();
  const parentLower = parentSystem.toLowerCase();
  if (!lower.includes(parentLower)) return null;
  // "Mayo Clinic Florida" - "Mayo Clinic" → " Florida"
  const remainder = canonicalName.replace(new RegExp(parentSystem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '').trim().replace(/^[-–—,\s]+|[-–—,\s]+$/g, '');
  return remainder.length > 0 ? remainder : null;
}

function isNotStated(quote: string | undefined): boolean {
  return quote === 'NOT_STATED_ON_SOURCE';
}

function isFutureLane(visibility: Visibility): boolean {
  return visibility === 'FUTURE_LANE_ONLY';
}

function isReviewQueue(visibility: Visibility): boolean {
  return visibility === 'CAUTION_SAFE_INTERNAL_REVIEW' || visibility === 'HUMAN_REVIEW_REQUIRED' || visibility === 'PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY';
}

function isHidden(visibility: Visibility): boolean {
  return visibility === 'HIDDEN_REJECTED';
}

function isPublicSafe(visibility: Visibility): boolean {
  return visibility === 'PUBLIC_SAFE_USCE';
}

// -------------------- Grouping --------------------

interface Group {
  key: string;
  claims: Array<{ claim: RawClaim; runId: string; canonical: CanonicalInstitution }>;
}

function groupKey(institutionId: string, sourceUrl: string, oppType: OpportunityType, audience: string | null): string {
  return [institutionId, sourceUrl, oppType, audience ?? '_'].join('||');
}

function buildGroups(verifiedByRun: Map<string, RawClaim[]>, canonicalByRun: Map<string, CanonicalInstitution>): Map<string, Group> {
  const groups = new Map<string, Group>();
  for (const [runId, claims] of verifiedByRun) {
    const canonical = canonicalByRun.get(runId);
    if (!canonical) continue;
    for (const claim of claims) {
      if (!claim || typeof claim !== 'object') continue;
      if (!isPublicSafe(claim.visibility ?? 'HIDDEN_REJECTED')) continue;
      if (claim.quoteVerified !== true) continue;
      if (!claim.sourceUrl || !claim.sourceHash || !claim.cleanedTextPath) continue;
      if (!hasAcceptablePath(claim.sourceUrl)) continue;
      if (isNotStated(claim.quote)) continue;

      const oppType = mapLaneToOpportunityType(claim.lane, claim.deepSourceFamily ?? null);
      const audience = (() => {
        const lane = (claim.lane ?? '').toUpperCase();
        if (lane === 'INTERNATIONAL_MEDICAL_STUDENT') return 'international';
        if (lane === 'IMG_OBSERVERSHIP') return 'img-observer';
        return 'us-md-do';
      })();
      const key = groupKey(claim.institutionId ?? canonical.institutionId, claim.sourceUrl, oppType, audience);
      let g = groups.get(key);
      if (!g) {
        g = { key, claims: [] };
        groups.set(key, g);
      }
      g.claims.push({ claim, runId, canonical });
    }
  }
  return groups;
}

function pickStrongestQuote(claims: Array<{ claim: RawClaim }>): RawClaim {
  // Prefer HIGH confidence; if tie, prefer longest quote (more context).
  const sorted = [...claims].sort((a, b) => {
    const confRank = (c: 'HIGH' | 'MEDIUM' | 'LOW' | undefined) => (c === 'HIGH' ? 0 : c === 'MEDIUM' ? 1 : 2);
    const cr = confRank(a.claim.confidence) - confRank(b.claim.confidence);
    if (cr !== 0) return cr;
    return (b.claim.quote?.length ?? 0) - (a.claim.quote?.length ?? 0);
  });
  return sorted[0].claim;
}

function deriveOpportunityName(claims: RawClaim[], oppType: OpportunityType): string {
  // Try to find a `claimText` mentioning a program name; otherwise fall back to oppType.
  for (const c of claims) {
    if (c.claimText && /\b(program|elective|rotation|clerkship|observer|internship|fellowship|institute)\b/i.test(c.claimText)) {
      return c.claimText.length > 80 ? c.claimText.slice(0, 80) + '…' : c.claimText;
    }
  }
  return oppType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function findFieldFromQuote(claims: RawClaim[], pattern: RegExp): string | null {
  for (const c of claims) {
    if (c.quote && pattern.test(c.quote)) {
      const m = c.quote.match(pattern);
      if (m) return m[0].trim();
    }
  }
  return null;
}

function findFieldFromNormalized(claims: RawClaim[], targetField: string): string | null {
  for (const c of claims) {
    if (c.normalizedField === targetField && c.quote && !isNotStated(c.quote)) return c.quote;
  }
  return null;
}

function buildContactFromClaims(claims: RawClaim[]): { name: string | null; title: string | null; email: string | null; phone: string | null } | null {
  let name: string | null = null;
  let title: string | null = null;
  let email: string | null = null;
  let phone: string | null = null;
  for (const c of claims) {
    if (c.claimType === 'CONTACT_EMAIL' && c.quote && c.quote.includes('@')) {
      const m = c.quote.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
      if (m && !email) email = m[0];
    }
    if (c.claimType === 'CONTACT_PHONE' && c.quote) {
      const m = c.quote.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
      if (m && !phone) phone = m[0];
    }
    if (c.claimType === 'CONTACT_NAME' && c.quote && !name) {
      // First two lines often contain "Name\nTitle"
      const lines = c.quote.split(/\n+/).map(s => s.trim()).filter(Boolean);
      if (lines.length >= 1) name = lines[0];
      if (lines.length >= 2) title = lines[1];
    }
  }
  if (!name && !title && !email && !phone) return null;
  return { name, title, email, phone };
}

function buildRowFromGroup(g: Group): OpportunityRow {
  const allClaims = g.claims.map(x => x.claim);
  const strongest = pickStrongestQuote(g.claims);
  const canonical = g.claims[0].canonical;
  const runId = g.claims[0].runId;

  const oppType = mapLaneToOpportunityType(strongest.lane, strongest.deepSourceFamily ?? null);
  const opportunityName = deriveOpportunityName(allClaims, oppType);
  const campus = deriveCampus(canonical.canonicalName, canonical.parentSystem);

  const audience = findFieldFromQuote(allClaims, /\bLCME[-\w\s]*accredited\b|\bU\.?S\.?\s+(MD|DO|medical)\b|\binternational\s+medical\s+student/i)
    || findFieldFromNormalized(allClaims, 'audience');
  const eligibility = findFieldFromQuote(allClaims, /\bfourth[-\s]year\b|\bfinal\s+year\b|\bsenior\s+year\b|\bgood\s+academic\s+standing\b/i);
  const specialty = (() => {
    for (const c of allClaims) {
      if (c.claimText) {
        const m = c.claimText.match(/\b(Cardiology|Anesthesiology|Otolaryngology|ENT|Pediatrics|Dermatology|Emergency Medicine|Family Medicine|Internal Medicine|Surgery|Radiology|Psychiatry|Neurology|Bone Marrow Transplant|Hematology|Oncology|Critical Care|Pathology|Ophthalmology|Orthopedics?|Urology)\b/);
        if (m) return m[0];
      }
    }
    return null;
  })();
  const applicationRoute = findFieldFromQuote(allClaims, /\bVSLO\b|\bVSAS\b|\bSlideRoom\b|\bAAMC\b|\bpaper\s+application\b/i);
  const cost = findFieldFromQuote(allClaims, /\$[\d,]+(?:\.\d+)?(?:\s*[-–]\s*\$[\d,]+)?[\w\s\/]*\b(?:fee|elective|application|week|application fee|per\b)/i);
  const duration = findFieldFromQuote(allClaims, /\b\d+(?:\s*[-–]\s*\d+)?\s+(?:weeks?|months?)\b/i);
  const deadline = findFieldFromQuote(allClaims, /\b(?:deadline|rolling|due\s+by|application\s+window|opens\s+\w+\s+\d|closes\s+\w+\s+\d|by\s+\w+\s+\d{1,2})\b/i);
  const contact = buildContactFromClaims(allClaims);

  const notStatedFields: string[] = [];
  for (const c of allClaims) {
    if (isNotStated(c.quote) && c.normalizedField) notStatedFields.push(c.normalizedField);
  }

  const warnings: string[] = [];
  if (strongest.confidence !== 'HIGH') warnings.push(`strongest_quote_confidence=${strongest.confidence}`);
  if (strongest.sourceScope === 'DEPARTMENT_LEVEL') warnings.push('scope_department_level_promoted_via_deep_family');
  if (strongest.limitations) warnings.push(`limitation: ${strongest.limitations}`);

  const rowId = hash([canonical.institutionId, opportunityName, strongest.sourceUrl, oppType, audience ?? '_'].join('||'));

  // Take minimum confidence across contributing claims.
  const minConfidence: 'HIGH' | 'MEDIUM' | 'LOW' = (() => {
    if (allClaims.some(c => c.confidence === 'LOW')) return 'LOW';
    if (allClaims.some(c => c.confidence === 'MEDIUM')) return 'MEDIUM';
    return 'HIGH';
  })();

  return {
    rowId,
    institutionId: canonical.institutionId,
    institutionName: canonical.canonicalName,
    parentSystem: canonical.parentSystem,
    campus,
    city: canonical.city,
    state: canonical.state,
    opportunityName,
    opportunityType: oppType,
    audience,
    eligibility,
    specialty,
    applicationRoute,
    cost,
    duration,
    deadline,
    contact,
    sourceUrl: strongest.sourceUrl ?? '',
    sourceQuote: strongest.quote ?? '',
    sourceHash: strongest.sourceHash ?? '',
    cleanedTextPath: strongest.cleanedTextPath ?? '',
    sourceScope: strongest.sourceScope ?? 'UNKNOWN_SCOPE',
    campusApplicabilityProof: strongest.campusApplicabilityProof ?? null,
    lastReviewed: new Date().toISOString().slice(0, 10),
    confidence: minConfidence,
    visibilityLane: 'PUBLIC_SAFE_USCE',
    humanReviewStatus: 'PENDING',
    usceCategory: laneToCategory(strongest.lane ?? null),
    extractedFromRunId: runId,
    claimIds: allClaims.map(c => c.claimId).sort(),
    notStatedFields,
    warnings,
    schemaVersion: SCHEMA_VERSION,
  };
}

// -------------------- Routing for non-public-safe claims --------------------

function buildReviewEntry(claim: RawClaim, runId: string, canonical: CanonicalInstitution): ReviewQueueEntry {
  const warnings: string[] = [];
  if (claim.limitations) warnings.push(claim.limitations);
  if (isNotStated(claim.quote)) warnings.push('quote_not_stated_on_source');
  return {
    claimId: claim.claimId,
    institutionId: canonical.institutionId,
    institutionName: canonical.canonicalName,
    state: canonical.state,
    city: canonical.city,
    visibilityLane: claim.visibility ?? 'HUMAN_REVIEW_REQUIRED',
    visibilityRationale: claim.visibilityRationale ?? null,
    lane: claim.lane ?? '',
    deepSourceFamily: claim.deepSourceFamily ?? null,
    sourceScope: claim.sourceScope ?? '',
    confidence: claim.confidence ?? null,
    sourceUrl: claim.sourceUrl ?? '',
    sourceQuote: claim.quote ?? '',
    warnings,
    extractedFromRunId: runId,
    schemaVersion: SCHEMA_VERSION,
  };
}

function buildArchiveEntry(claim: RawClaim, runId: string, canonical: CanonicalInstitution): ArchiveEntry {
  return {
    claimId: claim.claimId,
    institutionId: canonical.institutionId,
    state: canonical.state,
    visibilityLane: claim.visibility ?? 'HIDDEN_REJECTED',
    lane: claim.lane ?? '',
    deepSourceFamily: claim.deepSourceFamily ?? null,
    sourceUrl: claim.sourceUrl ?? '',
    sourceQuote: claim.quote ?? '',
    extractedFromRunId: runId,
    rationale: claim.visibilityRationale ?? '',
    schemaVersion: SCHEMA_VERSION,
  };
}

// -------------------- Main --------------------

interface BuildSummary {
  runsProcessed: number;
  totalClaims: number;
  publicSafeSourceClaims: number;
  publicSafeOpportunityRows: number;
  reviewQueueEntries: number;
  lowQualityFilteredEntries: number;
  futureLaneEntries: number;
  hiddenEntries: number;
  institutionsWithPublicSafeRows: number;
}

interface RunRatingCache {
  rating: string;
  categoriesFound: string[];
}

function resolveRunIds(args: CliArgs): string[] {
  if (args.allExisting) {
    return readdirSync(RUNS_DIR).filter(n => /^p102-/.test(n));
  }
  if (args.queue) {
    const queuePath = path.join(QUEUES_DIR, args.queue.endsWith('.csv') ? args.queue : `${args.queue}.csv`);
    if (!existsSync(queuePath)) {
      console.error(`queue file not found: ${queuePath}`);
      process.exit(2);
    }
    const text = readFileSync(queuePath, 'utf8');
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const header = lines[0].split(',');
    const idIdx = header.indexOf('institution_id');
    const runIds: string[] = [];
    if (idIdx < 0) return [];
    // Find run folders whose canonical institution matches any institutionId in the queue.
    const queueIds = new Set(lines.slice(1).map(line => line.split(',')[idIdx]?.trim()).filter(Boolean));
    for (const r of readdirSync(RUNS_DIR)) {
      const c = readJson<{ institutionId?: string }>(path.join(RUNS_DIR, r, '05_canonical_institution.json'));
      if (c?.institutionId && queueIds.has(c.institutionId)) runIds.push(r);
    }
    return runIds;
  }
  return args.runIds;
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const runIds = resolveRunIds(args);
  if (runIds.length === 0) {
    console.error('usage: p102-build-public-safe-opportunity-rows.ts --run-id <id> | --all-existing-p102-runs | --queue <queue_filename>');
    process.exit(2);
  }

  console.log(`P102 row builder — runs: ${runIds.length}`);

  const verifiedByRun = new Map<string, RawClaim[]>();
  const canonicalByRun = new Map<string, CanonicalInstitution>();
  const ratingByRun = new Map<string, RunRatingCache>();

  let totalClaims = 0;

  for (const runId of runIds) {
    const ledgerPath = path.join(RUNS_DIR, runId, '13_model_claims_verified.json');
    const canonicalPath = path.join(RUNS_DIR, runId, '05_canonical_institution.json');
    const ratingPath = path.join(RUNS_DIR, runId, 'run_rating.json');
    const ledger = readJson<{ claims: RawClaim[] }>(ledgerPath);
    const canonical = readJson<CanonicalInstitution>(canonicalPath);
    if (!ledger || !canonical) continue;
    const claims: RawClaim[] = (ledger.claims ?? []).filter((c): c is RawClaim => !!c && typeof c === 'object');
    verifiedByRun.set(runId, claims);
    canonicalByRun.set(runId, canonical);
    totalClaims += claims.length;
    const rating = readJson<RunRatingCache>(ratingPath);
    if (rating) ratingByRun.set(runId, rating);
  }

  // Build public-safe opportunity rows.
  const groups = buildGroups(verifiedByRun, canonicalByRun);
  const publicSafeRows: OpportunityRow[] = [];
  const publicSafeClaimIds = new Set<string>();
  for (const g of groups.values()) {
    const row = buildRowFromGroup(g);
    publicSafeRows.push(row);
    for (const id of row.claimIds) publicSafeClaimIds.add(id);
  }
  publicSafeRows.sort((a, b) => a.institutionName.localeCompare(b.institutionName) || a.opportunityName.localeCompare(b.opportunityName));

  // Build review / future / hidden routing for everything else.
  const reviewEntries: ReviewQueueEntry[] = [];
  const lowQualityEntries: ArchiveEntry[] = [];
  const futureLaneEntries: ArchiveEntry[] = [];
  const hiddenEntries: ArchiveEntry[] = [];

  for (const [runId, claims] of verifiedByRun) {
    const canonical = canonicalByRun.get(runId)!;
    for (const c of claims) {
      const v: Visibility = c.visibility ?? 'HIDDEN_REJECTED';
      if (isPublicSafe(v) && publicSafeClaimIds.has(c.claimId)) continue; // already in opportunity rows
      if (isPublicSafe(v) && !publicSafeClaimIds.has(c.claimId)) {
        // PUBLIC_SAFE but failed grouping — either bare-domain URL (filtered by hasAcceptablePath)
        // or missing required fields. Bare-domain claims go to low-quality archive; others to review.
        if (!hasAcceptablePath(c.sourceUrl ?? '')) {
          lowQualityEntries.push(buildArchiveEntry(c, runId, canonical));
        } else {
          reviewEntries.push(buildReviewEntry(c, runId, canonical));
        }
        continue;
      }
      if (isReviewQueue(v)) {
        reviewEntries.push(buildReviewEntry(c, runId, canonical));
        continue;
      }
      if (isFutureLane(v)) {
        futureLaneEntries.push(buildArchiveEntry(c, runId, canonical));
        continue;
      }
      if (isHidden(v)) {
        hiddenEntries.push(buildArchiveEntry(c, runId, canonical));
        continue;
      }
    }
  }

  const institutionsWithPublicSafeRows = new Set(publicSafeRows.map(r => r.institutionId)).size;

  const summary: BuildSummary = {
    runsProcessed: runIds.length,
    totalClaims,
    publicSafeSourceClaims: publicSafeClaimIds.size,
    publicSafeOpportunityRows: publicSafeRows.length,
    reviewQueueEntries: reviewEntries.length,
    lowQualityFilteredEntries: lowQualityEntries.length,
    futureLaneEntries: futureLaneEntries.length,
    hiddenEntries: hiddenEntries.length,
    institutionsWithPublicSafeRows,
  };

  // Build the walker-compatible rows for the review queue — maps public-safe rows
  // with rating info so the walker can show rating + categories per institution.
  const reviewQueueRows = publicSafeRows.map(row => {
    const runRating = ratingByRun.get(row.extractedFromRunId);
    return {
      rowId: row.rowId,
      institutionId: row.institutionId,
      institutionName: row.institutionName,
      state: row.state,
      opportunityType: row.opportunityType,
      usceCategory: row.usceCategory,
      sourceUrl: row.sourceUrl,
      runRating: runRating?.rating ?? null,
      detectedCategories: runRating?.categoriesFound ?? [],
      quote: row.sourceQuote,
      confidence: row.confidence,
      humanReviewStatus: row.humanReviewStatus,
    };
  });

  // Write exports.
  writeJson(path.join(EXPORTS_DIR, 'public_safe_opportunity_rows.json'), {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    summary,
    rows: publicSafeRows,
  });
  writeJson(path.join(EXPORTS_DIR, 'public_safe_review_queue.json'), {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    count: reviewEntries.length,
    entries: reviewEntries,
    rows: reviewQueueRows,
  });
  writeJson(path.join(EXPORTS_DIR, 'low_quality_review_archive.json'), {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    count: lowQualityEntries.length,
    note: 'PUBLIC_SAFE claims whose sourceUrl had no path (bare domain). Not surfaced in main review queue.',
    entries: lowQualityEntries,
  });
  writeJson(path.join(EXPORTS_DIR, 'future_lane_archive.json'), {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    count: futureLaneEntries.length,
    entries: futureLaneEntries,
  });
  writeJson(path.join(EXPORTS_DIR, 'hidden_rejected_archive.json'), {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    count: hiddenEntries.length,
    entries: hiddenEntries,
  });

  console.log('\n=== P102 row builder summary');
  console.log(`  runs processed:                ${summary.runsProcessed}`);
  console.log(`  total claims read:             ${summary.totalClaims}`);
  console.log(`  public-safe source claims:     ${summary.publicSafeSourceClaims}`);
  console.log(`  public-safe opportunity rows:  ${summary.publicSafeOpportunityRows}`);
  console.log(`  institutions with rows:        ${summary.institutionsWithPublicSafeRows}`);
  console.log(`  review queue entries:          ${summary.reviewQueueEntries}`);
  console.log(`  low-quality filtered:          ${summary.lowQualityFilteredEntries}`);
  console.log(`  future-lane entries:           ${summary.futureLaneEntries}`);
  console.log(`  hidden-rejected entries:       ${summary.hiddenEntries}`);
  console.log(`\nExports written to: ${EXPORTS_DIR}`);
}

main();
