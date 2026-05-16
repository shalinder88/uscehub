#!/usr/bin/env tsx
/**
 * P102 Approved Public-Safe Export Builder.
 *
 * Reads:
 *   - public_safe_opportunity_rows.json (14 auto-approved rows)
 *   - public_safe_review_decisions_top50.csv (or
 *     public_safe_review_decisions.csv if present) — reviewer-authored
 *
 * Writes:
 *   - public_safe_opportunity_rows_approved.json
 *   - public_safe_opportunity_rows_rejected.json
 *   - public_safe_opportunity_rows_needs_more_evidence.json
 *   - public_safe_approval_audit.md
 *
 * Validation is intentionally LOCAL and STRICT:
 *   - APPROVE_PUBLIC_SAFE requires every field per spec §6.
 *   - HEALTH_SYSTEM_LEVEL / MEDICAL_SCHOOL_LEVEL sources require
 *     campusApplicabilityProof (≥ 30 chars, references campus/hospital
 *     by name).
 *   - GME / RESIDENCY / FELLOWSHIP / CAREERS deep families cannot be
 *     approved as PUBLIC_SAFE_USCE.
 *   - NOT_STATED_ON_SOURCE quotes cannot be approved.
 *   - decisionReason ≥ 10 chars, not a placeholder.
 *   - reviewer must be a human name, not "auto"/"model"/"system"/"TBD".
 *
 * Auto-approved rows pass through with reviewStatus=AUTO_PUBLIC_SAFE.
 * Reviewer-approved rows enter with reviewStatus=REVIEWER_APPROVED.
 *
 * No network. No model. No DB. Pure read + transform + write.
 *
 * Usage:
 *   npx tsx scripts/p102-build-approved-public-safe-export.ts
 *   npx tsx scripts/p102-build-approved-public-safe-export.ts --decisions <path>
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');
const OPP_ROWS_PATH = path.join(EXPORTS_DIR, 'public_safe_opportunity_rows.json');
const REVIEW_QUEUE_PATH = path.join(EXPORTS_DIR, 'public_safe_review_queue.json');
const DEFAULT_DECISIONS = path.join(EXPORTS_DIR, 'public_safe_review_decisions.csv');
const FALLBACK_DECISIONS = path.join(EXPORTS_DIR, 'public_safe_review_decisions_top50.csv');
const APPROVED_OUT = path.join(EXPORTS_DIR, 'public_safe_opportunity_rows_approved.json');
const REJECTED_OUT = path.join(EXPORTS_DIR, 'public_safe_opportunity_rows_rejected.json');
const NEEDS_MORE_OUT = path.join(EXPORTS_DIR, 'public_safe_opportunity_rows_needs_more_evidence.json');
const AUDIT_OUT = path.join(EXPORTS_DIR, 'public_safe_approval_audit.md');

const SCHEMA_VERSION = 'p102-approved-export-1';

// -------------------- Types --------------------

type ReviewerDecision =
  | 'APPROVE_PUBLIC_SAFE'
  | 'REJECT_NOT_USCE'
  | 'REJECT_SCOPE_MISMATCH'
  | 'REJECT_OFF_DOMAIN_NO_APPLICABILITY'
  | 'KEEP_HUMAN_REVIEW'
  | 'NEEDS_MORE_EVIDENCE'
  | 'FUTURE_LANE_ONLY'
  | 'DUPLICATE_OF_APPROVED_ROW';

interface DecisionRow {
  reviewId: string;
  sourceQueueId: string;
  runId: string;
  institutionId: string;
  institutionName: string;
  state: string;
  city: string;
  sourceUrl: string;
  sourceScope: string;
  deepSourceFamily: string;
  visibilityLane: string;
  confidence: string;
  priorityScore: string;
  priorityReasons: string;
  quote: string;
  warnings: string;
  proposedOpportunityName: string;
  proposedOpportunityType: string;
  proposedAudience: string;
  proposedCampus: string;
  reviewerDecision: ReviewerDecision;
  decisionReason: string;
  campusApplicabilityProof: string;
  approvedOpportunityRowId: string;
  duplicateOfRowId: string;
  reviewer: string;
  reviewedAt: string;
  notes: string;
}

interface ReviewQueueEntry {
  claimId: string;
  sourceUrl: string;
  sourceQuote: string;
  // sourceHash is not currently part of the review queue export — we look
  // it up from the model claims ledger when promoting reviewer-approved rows.
}

interface ReviewQueueFile {
  entries: ReviewQueueEntry[];
}

interface AutoApprovedRow {
  rowId: string;
  institutionId: string;
  institutionName: string;
  parentSystem: string | null;
  campus: string | null;
  city: string;
  state: string;
  opportunityName: string;
  opportunityType: string;
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
  confidence: string;
  visibilityLane: 'PUBLIC_SAFE_USCE';
  humanReviewStatus: string;
  extractedFromRunId: string;
  claimIds: string[];
  notStatedFields: string[];
  warnings: string[];
  schemaVersion: string;
}

interface OppRowsFile {
  rows: AutoApprovedRow[];
  summary?: unknown;
}

interface ApprovedRow {
  rowId: string;
  reviewStatus: 'AUTO_PUBLIC_SAFE' | 'REVIEWER_APPROVED';
  autoApproved: boolean;
  visibilityLane: 'PUBLIC_SAFE_USCE';
  institutionId: string;
  institutionName: string;
  parentSystem: string | null;
  campus: string | null;
  city: string;
  state: string;
  opportunityName: string;
  opportunityType: string;
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
  decisionReason: string | null;
  reviewer: string | null;
  reviewedAt: string;
  extractedFromRunId: string;
  claimIds: string[];
  warnings: string[];
  schemaVersion: typeof SCHEMA_VERSION;
}

interface RejectedRow {
  reviewId: string;
  sourceQueueId: string;
  institutionId: string;
  institutionName: string;
  sourceUrl: string;
  sourceQuote: string;
  decision: ReviewerDecision;
  decisionReason: string;
  duplicateOfRowId: string | null;
  reviewer: string | null;
  reviewedAt: string;
  schemaVersion: typeof SCHEMA_VERSION;
}

interface ValidationFailure {
  reviewId: string;
  sourceQueueId: string;
  institutionName: string;
  decision: ReviewerDecision;
  reason: string;
}

// -------------------- IO --------------------

function readJson<T>(p: string): T {
  if (!existsSync(p)) throw new Error(`Missing file: ${p}`);
  return JSON.parse(readFileSync(p, 'utf8')) as T;
}

function writeJson(p: string, data: unknown): void {
  if (!existsSync(path.dirname(p))) mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

function writeText(p: string, s: string): void {
  if (!existsSync(path.dirname(p))) mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, s);
}

// -------------------- CSV --------------------

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]);
  const out: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    const cells = splitCsvLine(line);
    const obj: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) obj[header[j]] = cells[j] ?? '';
    out.push(obj);
  }
  return out;
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else cur += ch;
    } else {
      if (ch === ',') { cells.push(cur); cur = ''; }
      else if (ch === '"') { inQuote = true; }
      else cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

// -------------------- Validation rules --------------------

const TIER_1_DEEP_FAMILIES = new Set([
  'ELECTIVE', 'CLINICAL_ELECTIVE',
  'VISITING_STUDENT', 'VISITING_MEDICAL_STUDENT',
  'OBSERVERSHIP', 'EXTERNSHIP',
  'AWAY_ROTATION', 'SUB_INTERNSHIP', 'ACTING_INTERNSHIP',
  'MEDICAL_STUDENT_ROTATION', 'UNDERGRADUATE_MEDICAL_EDUCATION',
  'INTERNATIONAL_VISITING_STUDENT', 'MEDICAL_EDUCATION',
]);

const FUTURE_LANE_DEEP_FAMILIES = new Set([
  'CAREERS', 'PHYSICIAN_CAREERS', 'PROVIDER_CAREERS', 'FACULTY_JOBS',
  'GME', 'RESIDENCY', 'FELLOWSHIP', 'BENEFITS', 'CME',
]);

const SYSTEM_OR_SCHOOL_SCOPES = new Set(['HEALTH_SYSTEM_LEVEL', 'MEDICAL_SCHOOL_LEVEL']);

const PLACEHOLDER_TOKENS = new Set([
  'tbd', 'todo', 'unknown', 'asdf', 'xxx', 'foo', 'bar', 'lorem ipsum', '?', '-', '--', 'na', 'n/a', 'none', 'null', 'pending',
]);

const NON_HUMAN_REVIEWERS = new Set(['auto', 'model', 'system', 'tbd', 'todo', 'claude', 'ai', '']);

const ALLOWED_OPPORTUNITY_TYPES = new Set([
  'OBSERVERSHIP', 'VISITING_MEDICAL_STUDENT', 'CLINICAL_ELECTIVE',
  'SUB_INTERNSHIP', 'AWAY_ROTATION', 'INTERNATIONAL_VISITING_STUDENT',
  'RESEARCH_OPPORTUNITY', 'EXTERNSHIP',
]);

function isPlaceholder(s: string): boolean {
  if (!s) return true;
  const lower = s.trim().toLowerCase();
  if (PLACEHOLDER_TOKENS.has(lower)) return true;
  if (lower.length < 3) return true;
  return false;
}

function validateApproval(d: DecisionRow): ValidationFailure | null {
  // Pre-checks (all decisions).
  if (!d.reviewerDecision) return mk(d, 'missing reviewerDecision');

  if (d.reviewerDecision === 'APPROVE_PUBLIC_SAFE') {
    if (!d.sourceUrl) return mk(d, 'missing sourceUrl');
    if (!d.quote || d.quote.trim().length === 0) return mk(d, 'missing quote');
    if (d.quote.trim() === 'NOT_STATED_ON_SOURCE') return mk(d, 'cannot approve NOT_STATED_ON_SOURCE quote');
    if (!d.proposedOpportunityName || d.proposedOpportunityName.trim().length < 3) return mk(d, 'missing or too-short proposedOpportunityName');
    if (!d.proposedOpportunityType) return mk(d, 'missing proposedOpportunityType');
    if (!ALLOWED_OPPORTUNITY_TYPES.has(d.proposedOpportunityType)) return mk(d, `proposedOpportunityType=${d.proposedOpportunityType} not in allowed set`);
    if (d.deepSourceFamily && FUTURE_LANE_DEEP_FAMILIES.has(d.deepSourceFamily)) return mk(d, `cannot approve future-lane deep family ${d.deepSourceFamily}`);
    if (d.deepSourceFamily && !TIER_1_DEEP_FAMILIES.has(d.deepSourceFamily)) return mk(d, `deepSourceFamily ${d.deepSourceFamily} not in Tier 1 set`);
    if (!d.decisionReason || d.decisionReason.trim().length < 10) return mk(d, 'decisionReason must be ≥10 chars');
    if (isPlaceholder(d.decisionReason)) return mk(d, `decisionReason looks like a placeholder: "${d.decisionReason}"`);
    if (!d.reviewer || NON_HUMAN_REVIEWERS.has(d.reviewer.trim().toLowerCase())) return mk(d, `reviewer must be a human name, got "${d.reviewer}"`);
    if (!d.reviewedAt || !/^\d{4}-\d{2}-\d{2}/.test(d.reviewedAt)) return mk(d, `reviewedAt must be ISO date, got "${d.reviewedAt}"`);

    // System/school scope → campusApplicabilityProof required
    if (SYSTEM_OR_SCHOOL_SCOPES.has(d.sourceScope)) {
      if (!d.campusApplicabilityProof || d.campusApplicabilityProof.trim().length < 30) {
        return mk(d, `${d.sourceScope} requires campusApplicabilityProof ≥30 chars`);
      }
      if (isPlaceholder(d.campusApplicabilityProof)) {
        return mk(d, 'campusApplicabilityProof looks like a placeholder');
      }
      // Proof must reference the campus/hospital by name.
      const proofLower = d.campusApplicabilityProof.toLowerCase();
      const campusLower = (d.proposedCampus || '').toLowerCase();
      const institutionLower = d.institutionName.toLowerCase();
      const cityLower = (d.city || '').toLowerCase();
      const namedHit =
        (campusLower.length >= 4 && proofLower.includes(campusLower)) ||
        (institutionLower.split(/\s+/).some(t => t.length >= 5 && proofLower.includes(t))) ||
        (cityLower.length >= 4 && proofLower.includes(cityLower));
      if (!namedHit) {
        return mk(d, 'campusApplicabilityProof does not reference campus, institution, or city by name');
      }
    }

    return null;
  }

  if (d.reviewerDecision === 'KEEP_HUMAN_REVIEW') return null; // no further validation
  if (d.reviewerDecision === 'DUPLICATE_OF_APPROVED_ROW') {
    if (!d.duplicateOfRowId || isPlaceholder(d.duplicateOfRowId)) return mk(d, 'DUPLICATE_OF_APPROVED_ROW requires duplicateOfRowId');
    if (!d.decisionReason || d.decisionReason.trim().length < 10) return mk(d, 'decisionReason must be ≥10 chars');
    return null;
  }

  // All other non-approve decisions: require decisionReason
  if (!d.decisionReason || d.decisionReason.trim().length < 10) return mk(d, `${d.reviewerDecision} requires decisionReason ≥10 chars`);
  if (isPlaceholder(d.decisionReason)) return mk(d, `decisionReason looks like a placeholder for ${d.reviewerDecision}`);
  if (!d.reviewer || NON_HUMAN_REVIEWERS.has(d.reviewer.trim().toLowerCase())) return mk(d, `reviewer must be a human name for ${d.reviewerDecision}`);
  if (!d.reviewedAt || !/^\d{4}-\d{2}-\d{2}/.test(d.reviewedAt)) return mk(d, `reviewedAt must be ISO date for ${d.reviewerDecision}`);
  return null;
}

function mk(d: DecisionRow, reason: string): ValidationFailure {
  return {
    reviewId: d.reviewId,
    sourceQueueId: d.sourceQueueId,
    institutionName: d.institutionName,
    decision: d.reviewerDecision,
    reason,
  };
}

// -------------------- Build approved rows --------------------

function hash(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 16);
}

function lookupSourceHashAndCleanedText(institutionId: string, sourceUrl: string, claimId: string): { sourceHash: string; cleanedTextPath: string } | null {
  // We need to look up sourceHash + cleanedTextPath from the original
  // 13_model_claims_verified.json (review queue export doesn't include them).
  const runsDir = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');
  if (!existsSync(runsDir)) return null;
  const { readdirSync } = require('node:fs') as typeof import('node:fs');
  for (const runId of readdirSync(runsDir)) {
    const ledgerPath = path.join(runsDir, runId, '13_model_claims_verified.json');
    if (!existsSync(ledgerPath)) continue;
    try {
      const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8')) as { claims: Array<{ claimId?: string; sourceUrl?: string; sourceHash?: string; cleanedTextPath?: string; institutionId?: string }> };
      for (const c of ledger.claims) {
        if (c && c.claimId === claimId && c.sourceUrl === sourceUrl && c.sourceHash && c.cleanedTextPath) {
          return { sourceHash: c.sourceHash, cleanedTextPath: c.cleanedTextPath };
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

function buildApprovedFromReviewer(d: DecisionRow): ApprovedRow | null {
  const lookup = lookupSourceHashAndCleanedText(d.institutionId, d.sourceUrl, d.sourceQueueId);
  const rowId = hash([d.institutionId, d.proposedOpportunityName, d.sourceUrl, d.proposedOpportunityType, d.proposedAudience || '_'].join('||'));
  return {
    rowId,
    reviewStatus: 'REVIEWER_APPROVED',
    autoApproved: false,
    visibilityLane: 'PUBLIC_SAFE_USCE',
    institutionId: d.institutionId,
    institutionName: d.institutionName,
    parentSystem: null, // not in decision CSV; downstream can re-look-up from canonical
    campus: d.proposedCampus || null,
    city: d.city,
    state: d.state,
    opportunityName: d.proposedOpportunityName,
    opportunityType: d.proposedOpportunityType,
    audience: d.proposedAudience || null,
    eligibility: null,
    specialty: null,
    applicationRoute: null,
    cost: null,
    duration: null,
    deadline: null,
    contact: null,
    sourceUrl: d.sourceUrl,
    sourceQuote: d.quote,
    sourceHash: lookup?.sourceHash ?? '',
    cleanedTextPath: lookup?.cleanedTextPath ?? '',
    sourceScope: d.sourceScope,
    campusApplicabilityProof: d.campusApplicabilityProof || null,
    decisionReason: d.decisionReason || null,
    reviewer: d.reviewer || null,
    reviewedAt: d.reviewedAt,
    extractedFromRunId: d.runId,
    claimIds: [d.sourceQueueId],
    warnings: d.warnings ? d.warnings.split(' | ').filter(Boolean) : [],
    schemaVersion: SCHEMA_VERSION,
  };
}

function autoApprovedToApprovedRow(auto: AutoApprovedRow): ApprovedRow {
  return {
    rowId: auto.rowId,
    reviewStatus: 'AUTO_PUBLIC_SAFE',
    autoApproved: true,
    visibilityLane: 'PUBLIC_SAFE_USCE',
    institutionId: auto.institutionId,
    institutionName: auto.institutionName,
    parentSystem: auto.parentSystem,
    campus: auto.campus,
    city: auto.city,
    state: auto.state,
    opportunityName: auto.opportunityName,
    opportunityType: auto.opportunityType,
    audience: auto.audience,
    eligibility: auto.eligibility,
    specialty: auto.specialty,
    applicationRoute: auto.applicationRoute,
    cost: auto.cost,
    duration: auto.duration,
    deadline: auto.deadline,
    contact: auto.contact,
    sourceUrl: auto.sourceUrl,
    sourceQuote: auto.sourceQuote,
    sourceHash: auto.sourceHash,
    cleanedTextPath: auto.cleanedTextPath,
    sourceScope: auto.sourceScope,
    campusApplicabilityProof: auto.campusApplicabilityProof,
    decisionReason: 'auto-promoted by p102-build-public-safe-opportunity-rows: framework safety gates passed; single-campus / on-domain Tier 1 USCE',
    reviewer: null,
    reviewedAt: auto.lastReviewed,
    extractedFromRunId: auto.extractedFromRunId,
    claimIds: auto.claimIds,
    warnings: auto.warnings,
    schemaVersion: SCHEMA_VERSION,
  };
}

// -------------------- Main --------------------

interface CliArgs {
  decisionsPath: string | null;
}

function parseArgs(argv: string[]): CliArgs {
  const opts: CliArgs = { decisionsPath: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--decisions') opts.decisionsPath = argv[++i];
  }
  return opts;
}

function resolveDecisionsPath(args: CliArgs): string {
  if (args.decisionsPath) return args.decisionsPath;
  if (existsSync(DEFAULT_DECISIONS)) return DEFAULT_DECISIONS;
  if (existsSync(FALLBACK_DECISIONS)) return FALLBACK_DECISIONS;
  throw new Error(`No decisions CSV found. Looked for:\n  ${DEFAULT_DECISIONS}\n  ${FALLBACK_DECISIONS}\nUse --decisions <path> or run p102-summarize-review-queue.ts first.`);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const oppRows = readJson<OppRowsFile>(OPP_ROWS_PATH);
  const queueFile = readJson<ReviewQueueFile>(REVIEW_QUEUE_PATH);
  const decisionsPath = resolveDecisionsPath(args);
  const decisionsCsv = readFileSync(decisionsPath, 'utf8');
  const decisions = parseCsv(decisionsCsv) as unknown as DecisionRow[];

  const queueIds = new Set(queueFile.entries.map(e => e.claimId));

  // Track auto-approved rowIds for duplicate cross-check.
  const autoApprovedIds = new Set(oppRows.rows.map(r => r.rowId));
  const approved: ApprovedRow[] = oppRows.rows.map(autoApprovedToApprovedRow);

  const rejected: RejectedRow[] = [];
  const needsMore: RejectedRow[] = [];
  const validationFailures: ValidationFailure[] = [];

  let keepCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;
  let needsMoreCount = 0;
  let unknownQueueIdCount = 0;

  for (const d of decisions) {
    if (!d.reviewerDecision || d.reviewerDecision === 'KEEP_HUMAN_REVIEW') {
      keepCount++;
      continue;
    }
    if (!queueIds.has(d.sourceQueueId)) {
      unknownQueueIdCount++;
      validationFailures.push(mk(d, `sourceQueueId not found in review queue: ${d.sourceQueueId}`));
      continue;
    }

    const fail = validateApproval(d);
    if (fail) {
      validationFailures.push(fail);
      continue;
    }

    if (d.reviewerDecision === 'APPROVE_PUBLIC_SAFE') {
      const row = buildApprovedFromReviewer(d);
      if (!row) {
        validationFailures.push(mk(d, 'could not build approved row (missing source-hash lookup)'));
        continue;
      }
      if (autoApprovedIds.has(row.rowId)) {
        rejected.push({
          reviewId: d.reviewId,
          sourceQueueId: d.sourceQueueId,
          institutionId: d.institutionId,
          institutionName: d.institutionName,
          sourceUrl: d.sourceUrl,
          sourceQuote: d.quote,
          decision: 'DUPLICATE_OF_APPROVED_ROW',
          decisionReason: `Reviewer-approved row rowId=${row.rowId} duplicates an auto-approved row.`,
          duplicateOfRowId: row.rowId,
          reviewer: d.reviewer || null,
          reviewedAt: d.reviewedAt,
          schemaVersion: SCHEMA_VERSION,
        });
        rejectedCount++;
        continue;
      }
      approved.push(row);
      autoApprovedIds.add(row.rowId);
      approvedCount++;
      continue;
    }

    if (d.reviewerDecision === 'NEEDS_MORE_EVIDENCE') {
      needsMore.push({
        reviewId: d.reviewId,
        sourceQueueId: d.sourceQueueId,
        institutionId: d.institutionId,
        institutionName: d.institutionName,
        sourceUrl: d.sourceUrl,
        sourceQuote: d.quote,
        decision: d.reviewerDecision,
        decisionReason: d.decisionReason,
        duplicateOfRowId: null,
        reviewer: d.reviewer || null,
        reviewedAt: d.reviewedAt,
        schemaVersion: SCHEMA_VERSION,
      });
      needsMoreCount++;
      continue;
    }

    rejected.push({
      reviewId: d.reviewId,
      sourceQueueId: d.sourceQueueId,
      institutionId: d.institutionId,
      institutionName: d.institutionName,
      sourceUrl: d.sourceUrl,
      sourceQuote: d.quote,
      decision: d.reviewerDecision,
      decisionReason: d.decisionReason,
      duplicateOfRowId: d.duplicateOfRowId || null,
      reviewer: d.reviewer || null,
      reviewedAt: d.reviewedAt,
      schemaVersion: SCHEMA_VERSION,
    });
    rejectedCount++;
  }

  // De-duplicate approved by rowId (auto-promoted already in; reviewer dupes handled above)
  const seenRowIds = new Set<string>();
  const dedupedApproved: ApprovedRow[] = [];
  for (const r of approved) {
    if (seenRowIds.has(r.rowId)) continue;
    seenRowIds.add(r.rowId);
    dedupedApproved.push(r);
  }

  writeJson(APPROVED_OUT, {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    summary: {
      total: dedupedApproved.length,
      autoApproved: dedupedApproved.filter(r => r.reviewStatus === 'AUTO_PUBLIC_SAFE').length,
      reviewerApproved: dedupedApproved.filter(r => r.reviewStatus === 'REVIEWER_APPROVED').length,
      institutions: new Set(dedupedApproved.map(r => r.institutionId)).size,
    },
    rows: dedupedApproved,
  });

  writeJson(REJECTED_OUT, {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    count: rejected.length,
    rows: rejected,
  });

  writeJson(NEEDS_MORE_OUT, {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    count: needsMore.length,
    rows: needsMore,
  });

  // Audit MD
  const audit: string[] = [];
  audit.push('# P102 Public-Safe Approval Audit');
  audit.push('');
  audit.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  audit.push(`Decisions file: \`${path.relative(REPO_ROOT, decisionsPath)}\``);
  audit.push('');
  audit.push('## Counts');
  audit.push('');
  audit.push('| Bucket | Count |');
  audit.push('|---|---:|');
  audit.push(`| Auto-approved (from p102-build-public-safe-opportunity-rows) | ${oppRows.rows.length} |`);
  audit.push(`| Reviewer-approved (this run) | ${approvedCount} |`);
  audit.push(`| Total APPROVED export | ${dedupedApproved.length} |`);
  audit.push(`| Rejected | ${rejectedCount} |`);
  audit.push(`| Needs more evidence | ${needsMoreCount} |`);
  audit.push(`| Kept in review (KEEP_HUMAN_REVIEW) | ${keepCount} |`);
  audit.push(`| Unknown sourceQueueId (validation skipped) | ${unknownQueueIdCount} |`);
  audit.push(`| Validation failures | ${validationFailures.length} |`);
  audit.push('');
  if (validationFailures.length > 0) {
    audit.push('## Validation failures (reviewer should fix these in the decisions CSV)');
    audit.push('');
    audit.push('| reviewId | institution | decision | reason |');
    audit.push('|---|---|---|---|');
    for (const f of validationFailures) {
      audit.push(`| ${f.reviewId} | ${f.institutionName} | ${f.decision} | ${f.reason} |`);
    }
    audit.push('');
  } else {
    audit.push('## Validation failures');
    audit.push('');
    audit.push('None — every non-KEEP_HUMAN_REVIEW decision passed the approval rule.');
    audit.push('');
  }
  audit.push('## What this means');
  audit.push('');
  audit.push(`- \`public_safe_opportunity_rows_approved.json\` is the launch-corpus candidate. It contains ${dedupedApproved.length} rows (${dedupedApproved.filter(r => r.reviewStatus === 'AUTO_PUBLIC_SAFE').length} auto + ${approvedCount} reviewer-approved).`);
  audit.push(`- These are NOT yet public. The next sprint (minimal website ingestion / display) will build a display surface that reads this file.`);
  audit.push(`- ${keepCount} entries remain in the review queue (\`reviewerDecision=KEEP_HUMAN_REVIEW\`). They will become eligible for promotion once a reviewer assigns a decision.`);

  writeText(AUDIT_OUT, audit.join('\n') + '\n');

  console.log('P102 approved-export builder');
  console.log(`  decisions:                  ${path.relative(REPO_ROOT, decisionsPath)}`);
  console.log(`  decisions parsed:           ${decisions.length}`);
  console.log(`  auto-approved (passthrough):${oppRows.rows.length}`);
  console.log(`  reviewer-approved:          ${approvedCount}`);
  console.log(`  rejected:                   ${rejectedCount}`);
  console.log(`  needs-more-evidence:        ${needsMoreCount}`);
  console.log(`  kept in review:             ${keepCount}`);
  console.log(`  validation failures:        ${validationFailures.length}`);
  console.log(`  TOTAL APPROVED EXPORT:      ${dedupedApproved.length}`);
  console.log('');
  console.log(`  approved:        ${APPROVED_OUT}`);
  console.log(`  rejected:        ${REJECTED_OUT}`);
  console.log(`  needs-more-ev:   ${NEEDS_MORE_OUT}`);
  console.log(`  audit:           ${AUDIT_OUT}`);

  if (validationFailures.length > 0) {
    console.log(`\n  ⚠ ${validationFailures.length} validation failure(s) — see audit above. Approved export only includes valid rows.`);
  }
}

main();
