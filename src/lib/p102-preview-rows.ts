/**
 * P102 unified preview adapter.
 *
 * Combines three sources into the same P102ApprovedRow shape so the
 * preview surface at /usce/verified-preview can show:
 *
 *   1. AUTO_REVIEWED      — existing approved snapshot (static-generated)
 *   2. EXACT_SEED         — exact_seed_public_safe_rows.json from runner
 *   3. INTELLIGENT_GATE   — intelligent_public_safe_rows.json from stage F
 *
 * Each row is tagged with `previewSource` so the UI can show provenance.
 * Duplicates across sources are collapsed by signature, with this
 * precedence: AUTO_REVIEWED > EXACT_SEED > INTELLIGENT_GATE.
 *
 * Reads filesystem JSON at request time on the server. SSR-safe.
 * Never used in client components.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import {
  type P102ApprovedRow,
  type P102OpportunityType,
  getAllApprovedRows as getApprovedSnapshotRows,
  getApprovedRowById as getApprovedSnapshotRowById,
} from './p102-approved-usce';

export type PreviewSource = 'AUTO_REVIEWED' | 'EXACT_SEED' | 'INTELLIGENT_GATE';

export interface PreviewRow extends P102ApprovedRow {
  previewSource: PreviewSource;
  audienceClass?: string;
}

const EXPORTS_DIR = path.resolve(
  process.cwd(),
  'docs/platform-v2/local/usce-discovery-command-center/p102/exports',
);

const INTELLIGENT_PATH = path.join(EXPORTS_DIR, 'intelligent_public_safe_rows.json');
const EXACT_SEED_PATH = path.join(EXPORTS_DIR, 'exact_seed_public_safe_rows.json');

// ── Audience normalization ────────────────────────────────────────────────

/** Convert audience class enums to the snapshot's audience string set. */
function normalizeAudience(audienceClass: string | undefined | null): string {
  switch (audienceClass) {
    case 'US_MD_DO_VISITING_STUDENT': return 'us-md-do';
    case 'INTERNATIONAL_MEDICAL_STUDENT': return 'international';
    case 'IMG_GRADUATE_OBSERVER':
    case 'IMG_GRADUATE_EXTERNSHIP':
      return 'img-observer';
    default: return 'unknown';
  }
}

/** Convert intelligent/exact-seed opportunity type enums to the snapshot's enum. */
function normalizeOpportunityType(t: string): P102OpportunityType {
  switch (t) {
    case 'OBSERVERSHIP': return 'OBSERVERSHIP';
    case 'EXTERNSHIP': return 'EXTERNSHIP';
    case 'SUB_INTERNSHIP': return 'SUB_INTERNSHIP';
    case 'CLINICAL_ELECTIVE': return 'CLINICAL_ELECTIVE';
    case 'VISITING_STUDENT_ROTATION':
    case 'VISITING_MEDICAL_STUDENT_ELECTIVE':
      return 'VISITING_MEDICAL_STUDENT';
    case 'CLERKSHIP': return 'VISITING_MEDICAL_STUDENT';
    case 'VISITING_STUDENT_INTL':
    case 'INTERNATIONAL_VISITING_STUDENT':
      return 'INTERNATIONAL_VISITING_STUDENT';
    case 'IMG_OBSERVERSHIP': return 'OBSERVERSHIP';
    case 'OTHER_USCE': return 'CLINICAL_ELECTIVE';
    default: return 'CLINICAL_ELECTIVE';
  }
}

// ── Row normalization ─────────────────────────────────────────────────────

interface IntelligentRow {
  rowId: string;
  institutionId: string;
  institutionName: string;
  state: string;
  city: string;
  sourceUrl: string;
  canonicalUrl: string;
  opportunityType: string;
  audienceClass: string;
  topQuote: string;
  triageDecision: string;
  runIds?: string[];
  claimIds?: string[];
}

function intelligentToPreview(r: IntelligentRow): PreviewRow {
  const oppType = normalizeOpportunityType(r.opportunityType);
  const audience = normalizeAudience(r.audienceClass);
  return {
    rowId: r.rowId,
    reviewStatus: 'AUTO_PUBLIC_SAFE',
    autoApproved: true,
    visibilityLane: 'PUBLIC_SAFE_USCE',
    institutionId: r.institutionId,
    institutionName: r.institutionName,
    parentSystem: null,
    campus: null,
    city: r.city,
    state: r.state,
    opportunityName: opportunityTitle(r.institutionName, oppType, audience),
    opportunityType: oppType,
    audience,
    eligibility: null,
    specialty: null,
    applicationRoute: null,
    cost: null,
    duration: null,
    deadline: null,
    contact: null,
    sourceUrl: r.sourceUrl,
    sourceQuote: r.topQuote,
    sourceHash: '',
    sourceScope: 'INSTITUTION_SPECIFIC',
    campusApplicabilityProof: null,
    decisionReason: 'Intelligent gate: ' + r.triageDecision,
    reviewer: null,
    reviewedAt: '',
    extractedFromRunId: r.runIds?.[0] ?? '',
    claimIds: r.claimIds ?? [],
    warnings: [],
    schemaVersion: 'p102-intelligent-preview-1',
    previewSource: 'INTELLIGENT_GATE',
    audienceClass: r.audienceClass,
  };
}

interface ExactSeedRow {
  rowId: string;
  seedId: string;
  pageTitle: string | null;
  institutionId: string;
  institutionName: string;
  parentSystem: string | null;
  campus: string | null;
  city: string;
  state: string;
  sourceUrl: string;
  canonicalUrl: string;
  opportunityType: string;
  audienceClass: string;
  topQuote: string;
  sourceHash: string;
  cleanedTextPath: string;
  triageDecision: string;
  audienceConfidence: string;
}

function exactSeedToPreview(r: ExactSeedRow): PreviewRow {
  const oppType = normalizeOpportunityType(r.opportunityType);
  const audience = normalizeAudience(r.audienceClass);
  // Prefer the real page title; fall back to generic generated label
  const name = r.pageTitle && r.pageTitle.length >= 6
    ? r.pageTitle
    : opportunityTitle(r.institutionName, oppType, audience);
  return {
    rowId: r.rowId,
    reviewStatus: 'AUTO_PUBLIC_SAFE',
    autoApproved: true,
    visibilityLane: 'PUBLIC_SAFE_USCE',
    institutionId: r.institutionId,
    institutionName: r.institutionName,
    parentSystem: r.parentSystem,
    campus: r.campus,
    city: r.city,
    state: r.state,
    opportunityName: name,
    opportunityType: oppType,
    audience,
    eligibility: null,
    specialty: null,
    applicationRoute: null,
    cost: null,
    duration: null,
    deadline: null,
    contact: null,
    sourceUrl: r.sourceUrl,
    sourceQuote: r.topQuote,
    sourceHash: r.sourceHash,
    sourceScope: 'INSTITUTION_SPECIFIC',
    campusApplicabilityProof: null,
    decisionReason: `Exact-link seed (${r.seedId}); audience confidence: ${r.audienceConfidence}`,
    reviewer: null,
    reviewedAt: '',
    extractedFromRunId: r.seedId,
    claimIds: [],
    warnings: [],
    schemaVersion: 'p102-exact-seed-preview-1',
    previewSource: 'EXACT_SEED',
    audienceClass: r.audienceClass,
  };
}

function opportunityTitle(institutionName: string, oppType: P102OpportunityType, audience: string): string {
  const audLabel =
    audience === 'us-md-do' ? 'US Medical Students' :
    audience === 'international' ? 'International Medical Students' :
    audience === 'img-observer' ? 'IMG Observers' :
    'Visitors';
  const typeLabel =
    oppType === 'OBSERVERSHIP' ? 'Observership' :
    oppType === 'EXTERNSHIP' ? 'Externship' :
    oppType === 'SUB_INTERNSHIP' ? 'Sub-Internship' :
    oppType === 'CLINICAL_ELECTIVE' ? 'Clinical Elective' :
    oppType === 'VISITING_MEDICAL_STUDENT' ? 'Visiting Medical Student Program' :
    oppType === 'INTERNATIONAL_VISITING_STUDENT' ? 'International Visiting Student Program' :
    oppType === 'AWAY_ROTATION' ? 'Away Rotation' :
    oppType === 'RESEARCH_OPPORTUNITY' ? 'Research Opportunity' :
    'USCE Opportunity';
  return `${typeLabel} for ${audLabel}`;
}

// ── Source loaders ────────────────────────────────────────────────────────

function loadIntelligent(): PreviewRow[] {
  if (!existsSync(INTELLIGENT_PATH)) return [];
  try {
    const file = JSON.parse(readFileSync(INTELLIGENT_PATH, 'utf8')) as { rows?: IntelligentRow[] };
    return (file.rows ?? []).map(intelligentToPreview);
  } catch {
    return [];
  }
}

function loadExactSeed(): PreviewRow[] {
  if (!existsSync(EXACT_SEED_PATH)) return [];
  try {
    const file = JSON.parse(readFileSync(EXACT_SEED_PATH, 'utf8')) as { rows?: ExactSeedRow[] };
    return (file.rows ?? []).map(exactSeedToPreview);
  } catch {
    return [];
  }
}

function loadApproved(): PreviewRow[] {
  return getApprovedSnapshotRows().map((r) => ({
    ...r,
    opportunityName: presentableApprovedName(r),
    previewSource: 'AUTO_REVIEWED' as const,
  }));
}

/**
 * Reviewer-entered opportunity names were inconsistent in the early
 * batches: some are full descriptions, some are dollar amounts, some are
 * the bare type. Heuristic cleanup until the reviewer UI gets a stronger
 * name-quality lint.
 */
function presentableApprovedName(r: P102ApprovedRow): string {
  const n = (r.opportunityName ?? '').trim();
  // Reject obviously-wrong names: starts with $ / digit, looks like a sentence fragment, too long
  const looksWrong =
    /^\$/.test(n) ||
    /^\d/.test(n) ||
    /\.\.\.$/.test(n) ||  // truncated descriptions
    n.length > 90 ||
    n.length < 4;
  if (looksWrong) {
    return `${r.institutionName} — ${prettyOpportunityType(r.opportunityType)}`;
  }
  // Bare type names: prepend institution
  if (/^(Observership|Visiting Medical Student|Clinical Elective|Sub-?Internship|Away Rotation|International Visiting Student|Research Opportunity|Externship)$/i.test(n)) {
    return `${r.institutionName} ${n}`;
  }
  return n;
}

function prettyOpportunityType(t: P102OpportunityType): string {
  switch (t) {
    case 'OBSERVERSHIP': return 'Observership';
    case 'VISITING_MEDICAL_STUDENT': return 'Visiting Medical Student Program';
    case 'CLINICAL_ELECTIVE': return 'Clinical Elective';
    case 'SUB_INTERNSHIP': return 'Sub-Internship';
    case 'AWAY_ROTATION': return 'Away Rotation';
    case 'INTERNATIONAL_VISITING_STUDENT': return 'International Visiting Student Program';
    case 'RESEARCH_OPPORTUNITY': return 'Research Opportunity';
    case 'EXTERNSHIP': return 'Externship';
    default: return 'USCE Opportunity';
  }
}

// ── Dedup + merge ─────────────────────────────────────────────────────────

function signature(r: PreviewRow): string {
  return `${r.institutionId}||${r.sourceUrl}||${r.opportunityType}||${r.audience ?? 'unknown'}`;
}

const SOURCE_PRECEDENCE: Record<PreviewSource, number> = {
  AUTO_REVIEWED: 3,
  EXACT_SEED: 2,
  INTELLIGENT_GATE: 1,
};

let cached: PreviewRow[] | null = null;

function buildMerged(): PreviewRow[] {
  const all = [...loadApproved(), ...loadExactSeed(), ...loadIntelligent()];
  // Dedup by signature, keep highest-precedence source
  const bySig = new Map<string, PreviewRow>();
  for (const r of all) {
    const sig = signature(r);
    const existing = bySig.get(sig);
    if (!existing || SOURCE_PRECEDENCE[r.previewSource] > SOURCE_PRECEDENCE[existing.previewSource]) {
      bySig.set(sig, r);
    }
  }
  return [...bySig.values()].sort(
    (a, b) =>
      a.institutionName.localeCompare(b.institutionName) ||
      a.opportunityName.localeCompare(b.opportunityName),
  );
}

function getCached(): PreviewRow[] {
  if (cached === null) cached = buildMerged();
  return cached;
}

// Reset cache in dev so file changes take effect without server restart
if (process.env.NODE_ENV !== 'production') {
  cached = null;
}

// ── Public API ────────────────────────────────────────────────────────────

export function getAllPreviewRows(): PreviewRow[] {
  // Always recompute in dev so JSON file edits are picked up
  if (process.env.NODE_ENV !== 'production') return buildMerged();
  return getCached();
}

export function getPreviewRowById(rowId: string): PreviewRow | null {
  // Fast path: snapshot
  const fromSnapshot = getApprovedSnapshotRowById(rowId);
  if (fromSnapshot) return { ...fromSnapshot, previewSource: 'AUTO_REVIEWED' };
  return getAllPreviewRows().find((r) => r.rowId === rowId) ?? null;
}

export function getPreviewSummary(): {
  total: number;
  bySource: Record<PreviewSource, number>;
  institutions: number;
} {
  const rows = getAllPreviewRows();
  const bySource: Record<PreviewSource, number> = { AUTO_REVIEWED: 0, EXACT_SEED: 0, INTELLIGENT_GATE: 0 };
  for (const r of rows) bySource[r.previewSource]++;
  return {
    total: rows.length,
    bySource,
    institutions: new Set(rows.map((r) => r.institutionId)).size,
  };
}

export const PREVIEW_SOURCE_LABELS: Record<PreviewSource, string> = {
  AUTO_REVIEWED: 'Reviewer-approved',
  EXACT_SEED: 'Exact-link seed',
  INTELLIGENT_GATE: 'Intelligent gate',
};
