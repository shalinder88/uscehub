#!/usr/bin/env tsx
/**
 * P102 claim extractor — deterministic pattern matching over already-captured
 * cleaned text. Reads run-folder files only; no network; no Agent.
 *
 * Operates on existing P102 run folders. Does not fetch anything new.
 *
 * Outputs (updates) per run:
 *   - 13_source_claims.json    (new ledger of all claims)
 *   - 03_opportunity_objects.json  (overwritten: built from PUBLIC_SAFE_USCE / CAUTION_SAFE_INTERNAL_REVIEW claims)
 *   - RT_depth_usce.json
 *   - RT_depth_gme_residency_fellowship.json
 *   - RT_depth_jobs_visa.json
 *   - RT_depth_physician_services.json
 *   - RT_depth_negative_evidence.json
 *   - RT_depth_source_scope_conflicts.json
 *   - RT_semantic_miss_detector.json
 *   - 06_coverage_audit.md  (appended note)
 *   - 07_retry_tasks.md  (appended unresolveds)
 *   - 09_final_canonical.json (updated)
 *
 * Usage:
 *   npx tsx scripts/p102-extract-claims-from-run.ts --run-id p102-1-trial-2-run-1
 *   npx tsx scripts/p102-extract-claims-from-run.ts --all-existing-p102-runs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  SCHEMA_VERSION, NOT_STATED,
  USCE_OBSERVERSHIP_PATTERNS, USCE_VSM_PATTERNS, USCE_RESEARCH_PATTERNS, USCE_SHADOW_VOLUNTEER_PATTERNS,
  NEGATIVE_STRONG_PATTERNS, NEGATIVE_MEDIUM_PATTERNS,
  GME_PATTERNS, JOBS_VISA_PATTERNS, SERVICES_PATTERNS,
  findSentenceMatches as libFindSentenceMatches,
  inferSourceScope as libInferSourceScope,
  negativeStrength,
  type InstitutionContext as LibInstitutionContext,
  type SourceLike,
} from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const REPO_P102_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102');
const RUNS_ROOT = path.join(REPO_P102_ROOT, 'runs');

// -------------------- Types --------------------

interface SourceRecord {
  sourceId: string;
  sourceUrl: string;
  sourceDomain: string;
  sourceTitle: string | null;
  sourceFamily: string;
  sourceScope: string;
  acceptedForExtraction: boolean;
  cleanedTextPath: string | null;
  rawHtmlPath: string | null;
  sourceHash: string | null;
  capturedAt: string | null;
}

type InstitutionContext = LibInstitutionContext;

interface ClaimRecord {
  schemaVersion: string;
  claimId: string;
  institutionId: string;
  runId: string;
  claimType: string;
  claimText: string;
  normalizedField: string | null;
  quote: string;
  sourceUrl: string;
  sourceHash: string;
  cleanedTextPath: string;
  quoteVerified: boolean;
  sourceScope: string;
  sourceFamily: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  visibility: 'PUBLIC_SAFE_USCE' | 'CAUTION_SAFE_INTERNAL_REVIEW' | 'FUTURE_LANE_ONLY' | 'HIDDEN_REJECTED' | 'HUMAN_REVIEW_REQUIRED' | 'PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY';
  usedInPublicCopy: boolean;
  notPublicReason: string | null;
  lane: string;
  campusApplicabilityProof: string | null;
}

interface NegativeEvidenceClaim {
  schemaVersion: string;
  claimId: string;
  institutionId: string;
  runId: string;
  negativeEvidenceType: 'EXPLICIT_NEGATIVE_QUOTE' | 'ABSENCE_AFTER_BROAD_SEARCH' | 'POLICY_PAGE_RESTRICTS';
  quote: string;
  sourceUrl: string;
  sourceHash: string;
  quoteVerified: boolean;
  exactStatement: string;
  negativeEvidenceStrength: 'STRONG' | 'MEDIUM' | 'WEAK';
  publicSafeNegativeClaim: boolean;
  sourceScope: string;
  limitations: string;
  nextAction: string;
}

interface ScopeConflict {
  sourceUrl: string;
  sourceScope: string;
  detectedLane: string;
  reason: string;
  recommendedAction: string;
}

// -------------------- Concept detectors / scope inference (imported from lib) --------------------
// (patterns + findSentenceMatches + inferSourceScope come from ./p102-extraction-lib)
// Local alias to keep call sites short:
const findSentenceMatches = libFindSentenceMatches;
type DetectorMatch = { sentence: string; matched: string };

// -------------------- Source-scope inference --------------------

// inferSourceScope imported from p102-extraction-lib.
function inferSourceScope(source: SourceRecord, ctx: InstitutionContext): string {
  return libInferSourceScope(source as unknown as SourceLike, ctx);
}

// -------------------- Extraction over one source --------------------

function extractClaimsFromSource(
  source: SourceRecord,
  ctx: InstitutionContext,
  runId: string,
  claimIdSeed: { i: number },
  scopeOverride?: string,
): { claims: ClaimRecord[]; negatives: NegativeEvidenceClaim[]; scopeConflicts: ScopeConflict[] } {
  const out: { claims: ClaimRecord[]; negatives: NegativeEvidenceClaim[]; scopeConflicts: ScopeConflict[] } = { claims: [], negatives: [], scopeConflicts: [] };
  if (!source.cleanedTextPath || !fs.existsSync(source.cleanedTextPath)) return out;
  const text = fs.readFileSync(source.cleanedTextPath, 'utf8');
  if (!text || text.length < 30) return out; // skip tiny pages
  const sourceScope = scopeOverride ?? inferSourceScope(source, ctx);
  const sourceFamily = source.sourceFamily ?? 'OTHER';
  const isFutureLaneFamily = ['GME_PAGE', 'RESIDENCY_PAGE', 'FELLOWSHIP_PAGE', 'CAREERS_PAGE'].includes(sourceFamily);
  const isSystemOrSchool = ['HEALTH_SYSTEM_LEVEL', 'MEDICAL_SCHOOL_LEVEL'].includes(sourceScope);

  // Helper to build a claim
  const mkClaim = (
    claimType: string,
    lane: string,
    match: DetectorMatch,
    visibility: ClaimRecord['visibility'],
    confidence: ClaimRecord['confidence'],
    notPublicReason: string | null,
    normalizedField: string | null,
  ): ClaimRecord => ({
    schemaVersion: SCHEMA_VERSION,
    claimId: `claim_${runId}_${claimIdSeed.i++}`,
    institutionId: ctx.institutionId,
    runId,
    claimType,
    claimText: match.matched,
    normalizedField,
    quote: match.sentence,
    sourceUrl: source.sourceUrl,
    sourceHash: source.sourceHash ?? '',
    cleanedTextPath: source.cleanedTextPath ?? '',
    quoteVerified: true, // extractor sets true; validator re-verifies and may downgrade
    sourceScope,
    sourceFamily,
    confidence,
    visibility,
    usedInPublicCopy: false,
    notPublicReason,
    lane,
    campusApplicabilityProof: null,
  });

  // 1) USCE observership
  for (const m of findSentenceMatches(text, USCE_OBSERVERSHIP_PATTERNS)) {
    let visibility: ClaimRecord['visibility'] = 'CAUTION_SAFE_INTERNAL_REVIEW';
    let notPublic: string | null = 'P102-0C deterministic detection; human review before public-safe promotion';
    let confidence: ClaimRecord['confidence'] = 'MEDIUM';

    if (isFutureLaneFamily) {
      visibility = 'FUTURE_LANE_ONLY';
      notPublic = `source family ${sourceFamily} is future-lane only`;
    } else if (isSystemOrSchool) {
      visibility = 'HUMAN_REVIEW_REQUIRED';
      notPublic = `source scope ${sourceScope} cannot prove ${ctx.canonicalName}-specific availability without campus-applicability proof`;
      out.scopeConflicts.push({
        sourceUrl: source.sourceUrl,
        sourceScope,
        detectedLane: 'IMG_OBSERVERSHIP',
        reason: `Observership keyword detected on ${sourceScope} source; cannot apply to specific campus.`,
        recommendedAction: 'Find campus-specific source or downgrade to system-level claim',
      });
    } else if (sourceFamily === 'OBSERVERSHIP_PAGE' || sourceFamily === 'VISITING_STUDENT_PAGE') {
      // High-yield page family + institution-specific scope → CAUTION_SAFE pending model review
      visibility = 'CAUTION_SAFE_INTERNAL_REVIEW';
      confidence = 'MEDIUM';
      notPublic = 'P102-0C deterministic detection; needs model A1/A2 reader (P102-0D) for PUBLIC_SAFE_USCE promotion';
    }
    out.claims.push(mkClaim('OFFERS_OBSERVERSHIP', 'IMG_OBSERVERSHIP', m, visibility, confidence, notPublic, 'lane.OBSERVERSHIP.offered'));
  }

  // 2) USCE visiting student
  for (const m of findSentenceMatches(text, USCE_VSM_PATTERNS)) {
    let visibility: ClaimRecord['visibility'] = 'CAUTION_SAFE_INTERNAL_REVIEW';
    let notPublic: string | null = 'P102-0C deterministic detection; needs model reader for PUBLIC_SAFE promotion';
    let confidence: ClaimRecord['confidence'] = 'MEDIUM';
    if (isFutureLaneFamily) { visibility = 'FUTURE_LANE_ONLY'; notPublic = `source family ${sourceFamily} is future-lane only`; }
    else if (isSystemOrSchool) {
      visibility = 'HUMAN_REVIEW_REQUIRED';
      notPublic = `source scope ${sourceScope} cannot prove ${ctx.canonicalName}-specific availability`;
      out.scopeConflicts.push({
        sourceUrl: source.sourceUrl, sourceScope,
        detectedLane: 'VISITING_MEDICAL_STUDENT',
        reason: `Visiting-student keyword detected on ${sourceScope} source.`,
        recommendedAction: 'Find campus-specific source or treat as system-level',
      });
    }
    out.claims.push(mkClaim('OFFERS_VSLO', 'VISITING_MEDICAL_STUDENT', m, visibility, confidence, notPublic, 'lane.VISITING_STUDENT.offered'));
  }

  // 3) Research opportunities (lower confidence as USCE)
  for (const m of findSentenceMatches(text, USCE_RESEARCH_PATTERNS)) {
    let visibility: ClaimRecord['visibility'] = 'CAUTION_SAFE_INTERNAL_REVIEW';
    if (isFutureLaneFamily) visibility = 'FUTURE_LANE_ONLY';
    if (isSystemOrSchool) visibility = 'HUMAN_REVIEW_REQUIRED';
    out.claims.push(mkClaim(
      'OFFERS_RESEARCH', 'RESEARCH_OPPORTUNITY', m, visibility, 'LOW',
      'research opportunity; needs explicit med-student-access quote for PUBLIC_SAFE',
      'lane.RESEARCH.offered',
    ));
  }

  // 4) Shadow / volunteer — separate file/lane treatment downstream; lower confidence
  for (const m of findSentenceMatches(text, USCE_SHADOW_VOLUNTEER_PATTERNS)) {
    const visibility: ClaimRecord['visibility'] = 'HUMAN_REVIEW_REQUIRED';
    out.claims.push(mkClaim(
      'POSSIBLE_SHADOW_VOLUNTEER', 'NO_PUBLIC_OPPORTUNITY_FOUND', m, visibility, 'LOW',
      'shadow/volunteer is not auto-USCE; human review',
      'lane.SHADOW.possible',
    ));
  }

  // 5) Strong explicit-negative
  for (const m of findSentenceMatches(text, NEGATIVE_STRONG_PATTERNS)) {
    const isInstSpecific = sourceScope === 'INSTITUTION_SPECIFIC' || sourceScope === 'CAMPUS_SPECIFIC';
    out.negatives.push({
      schemaVersion: SCHEMA_VERSION,
      claimId: `negclaim_${runId}_${claimIdSeed.i++}`,
      institutionId: ctx.institutionId,
      runId,
      negativeEvidenceType: 'EXPLICIT_NEGATIVE_QUOTE',
      quote: m.sentence,
      sourceUrl: source.sourceUrl,
      sourceHash: source.sourceHash ?? '',
      quoteVerified: true,
      exactStatement: m.matched,
      negativeEvidenceStrength: isInstSpecific ? 'STRONG' : 'MEDIUM',
      publicSafeNegativeClaim: isInstSpecific,
      sourceScope,
      limitations: isInstSpecific ? 'institution-specific scope confirms negative' : 'broader scope; needs campus-specific confirmation',
      nextAction: isInstSpecific ? 'use as PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY' : 'human review',
    });
  }

  // 6) Medium-strength negative (restriction)
  for (const m of findSentenceMatches(text, NEGATIVE_MEDIUM_PATTERNS)) {
    out.negatives.push({
      schemaVersion: SCHEMA_VERSION,
      claimId: `negclaim_${runId}_${claimIdSeed.i++}`,
      institutionId: ctx.institutionId,
      runId,
      negativeEvidenceType: 'POLICY_PAGE_RESTRICTS',
      quote: m.sentence,
      sourceUrl: source.sourceUrl,
      sourceHash: source.sourceHash ?? '',
      quoteVerified: true,
      exactStatement: m.matched,
      negativeEvidenceStrength: 'MEDIUM',
      publicSafeNegativeClaim: false,
      sourceScope,
      limitations: 'restriction language; not absolute denial',
      nextAction: 'context_for_eligibility_field',
    });
  }

  // 7) Future-lane: GME / residency / fellowship
  for (const m of findSentenceMatches(text, GME_PATTERNS)) {
    out.claims.push(mkClaim(
      'FUTURE_LANE_GME_GENERAL', 'RESIDENCY_PROGRAM_INFO', m, 'FUTURE_LANE_ONLY', 'MEDIUM',
      'GME/residency/fellowship content; future-lane only', 'lane.RESIDENCY.signal',
    ));
  }

  // 8) Future-lane: jobs / visa
  for (const m of findSentenceMatches(text, JOBS_VISA_PATTERNS)) {
    out.claims.push(mkClaim(
      'FUTURE_LANE_JOB', 'CAREERS_PAGE', m, 'FUTURE_LANE_ONLY', 'MEDIUM',
      'jobs/visa content; future-lane only', 'lane.JOBS.signal',
    ));
  }

  // 9) Future-lane: physician services
  for (const m of findSentenceMatches(text, SERVICES_PATTERNS)) {
    out.claims.push(mkClaim(
      'FUTURE_LANE_SERVICE', 'PHYSICIAN_SERVICES', m, 'FUTURE_LANE_ONLY', 'MEDIUM',
      'physician services content; future-lane only', 'lane.SERVICES.signal',
    ));
  }

  return out;
}

// -------------------- File I/O helpers --------------------

function writeJson(p: string, data: unknown): void { fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n'); }
function writeText(p: string, s: string): void { fs.writeFileSync(p, s); }
function readJson<T = unknown>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return null; }
}

// -------------------- Per-run processor --------------------

interface ExtractionSummary {
  runId: string;
  institutionId: string;
  canonicalName: string;
  sourcesProcessed: number;
  claimsTotal: number;
  publicSafeUsce: number;
  cautionSafe: number;
  futureLane: number;
  humanReview: number;
  hiddenRejected: number;
  negativeClaims: number;
  publicSafeNegative: number;
  scopeConflicts: number;
}

function processRun(runFolder: string): ExtractionSummary {
  const runId = path.basename(runFolder);
  console.log(`[extractor] processing ${runId}`);

  const sourceMap = readJson<{ sources: SourceRecord[] }>(path.join(runFolder, '01_source_map.json'));
  const canonical = readJson<{ institutionId: string; canonicalName: string; officialDomains: string[]; parentSystem: string | null }>(path.join(runFolder, '05_canonical_institution.json'));
  if (!sourceMap || !canonical) throw new Error(`Run ${runId} missing source_map or canonical_institution`);

  const ctx: InstitutionContext = {
    institutionId: canonical.institutionId,
    canonicalName: canonical.canonicalName,
    officialDomain: canonical.officialDomains[0],
    parentSystem: canonical.parentSystem,
  };

  const claimIdSeed = { i: 1 };
  const allClaims: ClaimRecord[] = [];
  const allNegatives: NegativeEvidenceClaim[] = [];
  const allScopeConflicts: ScopeConflict[] = [];

  let sourcesProcessed = 0;
  for (const src of sourceMap.sources) {
    if (!src.acceptedForExtraction) continue;
    if (!src.cleanedTextPath) continue;
    sourcesProcessed++;
    const { claims, negatives, scopeConflicts } = extractClaimsFromSource(src, ctx, runId, claimIdSeed);
    allClaims.push(...claims);
    allNegatives.push(...negatives);
    allScopeConflicts.push(...scopeConflicts);
  }

  // ----- Write 13_source_claims.json -----
  writeJson(path.join(runFolder, '13_source_claims.json'), {
    schemaVersion: SCHEMA_VERSION,
    runId,
    institutionId: ctx.institutionId,
    canonicalName: ctx.canonicalName,
    extractedBy: 'p102-extract-claims-from-run (deterministic)',
    extractedAt: new Date().toISOString(),
    claims: allClaims,
  });

  // ----- Build opportunity_objects.json (only PUBLIC_SAFE_USCE and CAUTION_SAFE_INTERNAL_REVIEW) -----
  // Group claims by lane (CAUTION) — one opportunity per lane per source for now.
  const opportunityCandidates = allClaims.filter(c =>
    c.visibility === 'PUBLIC_SAFE_USCE' || c.visibility === 'CAUTION_SAFE_INTERNAL_REVIEW'
  );
  const oppByKey = new Map<string, { lane: string; sourceClaimIds: string[]; visibility: ClaimRecord['visibility']; sources: Set<string>; samples: ClaimRecord[] }>();
  for (const c of opportunityCandidates) {
    const key = `${c.lane}|${c.sourceUrl}`;
    if (!oppByKey.has(key)) oppByKey.set(key, { lane: c.lane, sourceClaimIds: [], visibility: c.visibility, sources: new Set(), samples: [] });
    const entry = oppByKey.get(key)!;
    entry.sourceClaimIds.push(c.claimId);
    entry.sources.add(c.sourceUrl);
    if (entry.samples.length < 3) entry.samples.push(c);
    if (c.visibility === 'PUBLIC_SAFE_USCE') entry.visibility = 'PUBLIC_SAFE_USCE';
  }
  let oppIdx = 1;
  const opportunities = Array.from(oppByKey.values()).map(entry => ({
    schemaVersion: SCHEMA_VERSION,
    opportunityId: `opp_${runId}_${oppIdx++}`,
    institutionId: ctx.institutionId,
    runId,
    opportunityLane: entry.lane,
    audience: 'IMG_PRE_MATCH',
    applicantStage: NOT_STATED,
    handsOnStatus: 'UNCLEAR',
    applicationPathway: 'UNCLEAR',
    applicationUrl: null,
    cost: { amount: null, currency: null, details: null },
    duration: null,
    specialties: [],
    visa: 'UNCLEAR',
    requirements: [],
    contact: { email: null, phone: null, name: null },
    sourceClaimIds: entry.sourceClaimIds,
    visibilityLane: entry.visibility,
    classification: entry.visibility === 'PUBLIC_SAFE_USCE' ? 'PUBLIC_SAFE_USCE' : 'CAUTION_SAFE_INTERNAL_REVIEW',
    confidence: 'MEDIUM',
    notPublicReason: entry.visibility === 'PUBLIC_SAFE_USCE' ? null : 'P102-0C deterministic detection; needs model A1/A2 reader before PUBLIC_SAFE promotion',
  }));
  writeJson(path.join(runFolder, '03_opportunity_objects.json'), {
    schemaVersion: SCHEMA_VERSION, runId, institutionId: ctx.institutionId, opportunities,
    note: 'P102-0C deterministic extraction. PUBLIC_SAFE_USCE not auto-promoted; CAUTION_SAFE_INTERNAL_REVIEW is the default for positive detections.',
  });

  // ----- Build RT_depth files (lane-specific) -----
  const usceClaims = allClaims.filter(c => ['IMG_OBSERVERSHIP', 'VISITING_MEDICAL_STUDENT', 'RESEARCH_OPPORTUNITY', 'NO_PUBLIC_OPPORTUNITY_FOUND'].includes(c.lane) && c.visibility !== 'FUTURE_LANE_ONLY');
  writeJson(path.join(runFolder, 'RT_depth_usce.json'), {
    schemaVersion: SCHEMA_VERSION, runId, depthPass: 'USCE',
    sourceFamiliesReviewed: Array.from(new Set(usceClaims.map(c => c.sourceFamily))),
    objectsCreated: opportunities.filter(o => ['IMG_OBSERVERSHIP', 'VISITING_MEDICAL_STUDENT', 'RESEARCH_OPPORTUNITY'].includes(o.opportunityLane)).length,
    claimsPromoted: usceClaims.length,
    conflictsFound: allScopeConflicts.filter(s => ['IMG_OBSERVERSHIP', 'VISITING_MEDICAL_STUDENT'].includes(s.detectedLane)).map(s => `${s.sourceUrl}: ${s.reason}`),
    unresolveds: usceClaims.filter(c => c.visibility === 'CAUTION_SAFE_INTERNAL_REVIEW' || c.visibility === 'HUMAN_REVIEW_REQUIRED').map(c => `${c.sourceUrl}: ${c.notPublicReason}`),
    recoveryTasks: [],
    scoreDeltas: { publicReadinessScore: 0, futureLaneValueScore: 0 },
    claims: usceClaims,
  });

  const gmeClaims = allClaims.filter(c => c.lane === 'RESIDENCY_PROGRAM_INFO' || c.lane === 'FELLOWSHIP_PROGRAM_INFO');
  writeJson(path.join(runFolder, 'RT_depth_gme_residency_fellowship.json'), {
    schemaVersion: SCHEMA_VERSION, runId, depthPass: 'GME_RESIDENCY_FELLOWSHIP',
    sourceFamiliesReviewed: Array.from(new Set(gmeClaims.map(c => c.sourceFamily))),
    objectsCreated: 0, claimsPromoted: gmeClaims.length,
    conflictsFound: [], unresolveds: [], recoveryTasks: [],
    scoreDeltas: { publicReadinessScore: 0, futureLaneValueScore: Math.min(25, gmeClaims.length * 3) },
    claims: gmeClaims,
  });

  const jobsClaims = allClaims.filter(c => c.lane === 'CAREERS_PAGE');
  writeJson(path.join(runFolder, 'RT_depth_jobs_visa.json'), {
    schemaVersion: SCHEMA_VERSION, runId, depthPass: 'JOBS_VISA',
    sourceFamiliesReviewed: Array.from(new Set(jobsClaims.map(c => c.sourceFamily))),
    objectsCreated: 0, claimsPromoted: jobsClaims.length,
    conflictsFound: [], unresolveds: [], recoveryTasks: [],
    scoreDeltas: { publicReadinessScore: 0, futureLaneValueScore: Math.min(15, jobsClaims.length * 3) },
    claims: jobsClaims,
  });

  const servicesClaims = allClaims.filter(c => c.lane === 'PHYSICIAN_SERVICES');
  writeJson(path.join(runFolder, 'RT_depth_physician_services.json'), {
    schemaVersion: SCHEMA_VERSION, runId, depthPass: 'PHYSICIAN_SERVICES',
    sourceFamiliesReviewed: Array.from(new Set(servicesClaims.map(c => c.sourceFamily))),
    objectsCreated: 0, claimsPromoted: servicesClaims.length,
    conflictsFound: [], unresolveds: [], recoveryTasks: [],
    scoreDeltas: { publicReadinessScore: 0, futureLaneValueScore: 0 },
    claims: servicesClaims,
  });

  writeJson(path.join(runFolder, 'RT_depth_negative_evidence.json'), {
    schemaVersion: SCHEMA_VERSION, runId, depthPass: 'NEGATIVE_EVIDENCE',
    negativeClaims: allNegatives,
    unresolveds: allNegatives.length === 0 ? ['No explicit negative quotes found; absence-only is not public-safe.'] : [],
  });

  writeJson(path.join(runFolder, 'RT_depth_source_scope_conflicts.json'), {
    schemaVersion: SCHEMA_VERSION, runId, depthPass: 'SOURCE_SCOPE_CONFLICTS',
    conflicts: allScopeConflicts,
    unresolveds: allScopeConflicts.map(s => `${s.sourceUrl}: ${s.recommendedAction}`),
  });

  // Update 09_final_canonical.json
  writeJson(path.join(runFolder, '09_final_canonical.json'), {
    schemaVersion: SCHEMA_VERSION,
    runId,
    institutionId: ctx.institutionId,
    canonicalName: ctx.canonicalName,
    sources: sourcesProcessed,
    opportunities: opportunities.length,
    claimsTotal: allClaims.length,
    publicSafeUsce: allClaims.filter(c => c.visibility === 'PUBLIC_SAFE_USCE').length,
    cautionSafe: allClaims.filter(c => c.visibility === 'CAUTION_SAFE_INTERNAL_REVIEW').length,
    futureLane: allClaims.filter(c => c.visibility === 'FUTURE_LANE_ONLY').length,
    humanReview: allClaims.filter(c => c.visibility === 'HUMAN_REVIEW_REQUIRED').length,
    negativeClaims: allNegatives.length,
    scopeConflicts: allScopeConflicts.length,
    note: 'P102-0C extraction (deterministic). PUBLIC_SAFE_USCE not auto-promoted; awaits P102-0D model A1/A2 reader.',
  });

  // Append note to coverage audit
  const coverageNote = `\n\n## P102-0C extraction pass (${new Date().toISOString()})\n\n- Sources processed: ${sourcesProcessed}\n- Claims extracted: ${allClaims.length} (PUBLIC_SAFE_USCE=${allClaims.filter(c => c.visibility === 'PUBLIC_SAFE_USCE').length}, CAUTION_SAFE=${allClaims.filter(c => c.visibility === 'CAUTION_SAFE_INTERNAL_REVIEW').length}, FUTURE_LANE_ONLY=${allClaims.filter(c => c.visibility === 'FUTURE_LANE_ONLY').length}, HUMAN_REVIEW=${allClaims.filter(c => c.visibility === 'HUMAN_REVIEW_REQUIRED').length})\n- Negative evidence claims: ${allNegatives.length} (publicSafe=${allNegatives.filter(n => n.publicSafeNegativeClaim).length})\n- Source-scope conflicts surfaced: ${allScopeConflicts.length}\n`;
  fs.appendFileSync(path.join(runFolder, '06_coverage_audit.md'), coverageNote);

  // Append unresolveds to retry tasks
  const unresolvedNote = allClaims.filter(c => c.visibility === 'CAUTION_SAFE_INTERNAL_REVIEW' || c.visibility === 'HUMAN_REVIEW_REQUIRED').length > 0
    ? `\n\n## P102-0C unresolveds (${new Date().toISOString()})\n\nClaims awaiting model A1/A2 reader (P102-0D) for PUBLIC_SAFE promotion:\n${allClaims.filter(c => c.visibility === 'CAUTION_SAFE_INTERNAL_REVIEW' || c.visibility === 'HUMAN_REVIEW_REQUIRED').slice(0, 20).map(c => `- ${c.lane} on ${c.sourceUrl}: ${c.notPublicReason}`).join('\n')}\n`
    : '';
  if (unresolvedNote) fs.appendFileSync(path.join(runFolder, '07_retry_tasks.md'), unresolvedNote);

  const summary: ExtractionSummary = {
    runId,
    institutionId: ctx.institutionId,
    canonicalName: ctx.canonicalName,
    sourcesProcessed,
    claimsTotal: allClaims.length,
    publicSafeUsce: allClaims.filter(c => c.visibility === 'PUBLIC_SAFE_USCE').length,
    cautionSafe: allClaims.filter(c => c.visibility === 'CAUTION_SAFE_INTERNAL_REVIEW').length,
    futureLane: allClaims.filter(c => c.visibility === 'FUTURE_LANE_ONLY').length,
    humanReview: allClaims.filter(c => c.visibility === 'HUMAN_REVIEW_REQUIRED').length,
    hiddenRejected: allClaims.filter(c => c.visibility === 'HIDDEN_REJECTED').length,
    negativeClaims: allNegatives.length,
    publicSafeNegative: allNegatives.filter(n => n.publicSafeNegativeClaim).length,
    scopeConflicts: allScopeConflicts.length,
  };
  console.log(`[extractor] ${runId}: ${summary.claimsTotal} claims (caution=${summary.cautionSafe}, futureLane=${summary.futureLane}, humanReview=${summary.humanReview}); ${summary.negativeClaims} negative claims; ${summary.scopeConflicts} scope conflicts`);
  return summary;
}

// -------------------- CLI --------------------

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
  console.log(`[extractor] processing ${args.runIds.length} runs: ${args.runIds.join(', ')}`);
  const summaries: ExtractionSummary[] = [];
  for (const runId of args.runIds) {
    const runFolder = path.join(RUNS_ROOT, runId);
    if (!fs.existsSync(runFolder)) { console.error(`[extractor] run folder missing: ${runFolder}`); continue; }
    summaries.push(processRun(runFolder));
  }
  console.log('\n[extractor] summary:');
  for (const s of summaries) {
    console.log(`  ${s.runId} (${s.canonicalName}): ${s.sourcesProcessed} sources, ${s.claimsTotal} claims, ${s.publicSafeUsce} PUBLIC_SAFE_USCE, ${s.cautionSafe} CAUTION, ${s.futureLane} FUTURE, ${s.humanReview} HUMAN_REVIEW, ${s.negativeClaims} NEG (${s.publicSafeNegative} public-safe), ${s.scopeConflicts} scope conflicts`);
  }
}

main();
