#!/usr/bin/env tsx
/**
 * P102 Approved Public-Safe Export Validator.
 *
 * Independently validates the four exports produced by
 * scripts/p102-build-approved-public-safe-export.ts:
 *
 *   - public_safe_opportunity_rows_approved.json
 *   - public_safe_opportunity_rows_rejected.json
 *   - public_safe_opportunity_rows_needs_more_evidence.json
 *   - public_safe_review_decisions[ _top50 | empty ].csv
 *
 * Hard rules (every approved row must pass):
 *   - rowId present + unique
 *   - sourceUrl present
 *   - sourceQuote present + ≥10 chars + != 'NOT_STATED_ON_SOURCE'
 *   - sourceHash present (≥10 chars)
 *   - cleanedTextPath present
 *   - visibilityLane ∈ {PUBLIC_SAFE_USCE}
 *   - reviewStatus ∈ {AUTO_PUBLIC_SAFE, REVIEWER_APPROVED}
 *   - opportunityType ∈ allowed set
 *   - sourceScope ∈ {INSTITUTION_SPECIFIC, CAMPUS_SPECIFIC, DEPARTMENT_LEVEL}
 *     unless campusApplicabilityProof present
 *   - If REVIEWER_APPROVED:
 *       - reviewer is human (not 'auto'/'system'/'model'/etc.)
 *       - reviewedAt is ISO date
 *       - decisionReason ≥10 chars and not a placeholder
 *       - if HEALTH_SYSTEM_LEVEL or MEDICAL_SCHOOL_LEVEL → campusApplicabilityProof ≥30 chars
 *
 * No model. No DB. No network.
 *
 * Exit code 0 if all approved rows pass; 1 otherwise.
 *
 * Usage:
 *   npx tsx scripts/p102-validate-approved-public-safe-export.ts
 */

import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');
const APPROVED_PATH = path.join(EXPORTS_DIR, 'public_safe_opportunity_rows_approved.json');
const REJECTED_PATH = path.join(EXPORTS_DIR, 'public_safe_opportunity_rows_rejected.json');
const NEEDS_MORE_PATH = path.join(EXPORTS_DIR, 'public_safe_opportunity_rows_needs_more_evidence.json');
const DECISIONS_PATH_DEFAULT = path.join(EXPORTS_DIR, 'public_safe_review_decisions.csv');
const DECISIONS_PATH_FALLBACK = path.join(EXPORTS_DIR, 'public_safe_review_decisions_top50.csv');

const ALLOWED_OPPORTUNITY_TYPES = new Set([
  'OBSERVERSHIP', 'VISITING_MEDICAL_STUDENT', 'CLINICAL_ELECTIVE',
  'SUB_INTERNSHIP', 'AWAY_ROTATION', 'INTERNATIONAL_VISITING_STUDENT',
  'RESEARCH_OPPORTUNITY', 'EXTERNSHIP',
]);

const ALLOWED_SCOPES = new Set([
  'INSTITUTION_SPECIFIC', 'CAMPUS_SPECIFIC', 'DEPARTMENT_LEVEL',
  // Allowed only when campusApplicabilityProof is non-empty (validator
  // enforces this conditional rule per-row, below).
  'HEALTH_SYSTEM_LEVEL', 'MEDICAL_SCHOOL_LEVEL',
]);

const SYSTEM_OR_SCHOOL_SCOPES = new Set(['HEALTH_SYSTEM_LEVEL', 'MEDICAL_SCHOOL_LEVEL']);

const FUTURE_LANE_DEEP_FAMILIES_LOWER = new Set([
  'careers', 'physician_careers', 'provider_careers', 'faculty_jobs',
  'gme', 'residency', 'fellowship', 'benefits', 'cme',
]);

const PLACEHOLDER_TOKENS = new Set([
  'tbd', 'todo', 'unknown', 'asdf', 'xxx', 'foo', 'bar', 'lorem ipsum',
  '?', '-', '--', 'na', 'n/a', 'none', 'null', 'pending',
]);

const NON_HUMAN_REVIEWERS = new Set(['auto', 'model', 'system', 'tbd', 'todo', 'claude', 'ai', '']);

interface ApprovedRow {
  rowId?: string;
  reviewStatus?: string;
  autoApproved?: boolean;
  institutionId?: string;
  institutionName?: string;
  sourceScope?: string;
  sourceUrl?: string;
  sourceQuote?: string;
  sourceHash?: string;
  cleanedTextPath?: string;
  visibilityLane?: string;
  opportunityType?: string;
  opportunityName?: string;
  campusApplicabilityProof?: string | null;
  decisionReason?: string | null;
  reviewer?: string | null;
  reviewedAt?: string;
  schemaVersion?: string;
  claimIds?: string[];
}

interface ApprovedExport {
  schemaVersion?: string;
  generatedAt?: string;
  summary?: unknown;
  rows: ApprovedRow[];
}

interface Issue { rowId: string; reviewStatus: string; institutionName: string; reason: string }

function readJson<T>(p: string): T | null {
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')) as T; } catch { return null; }
}

function isPlaceholder(s: string | null | undefined): boolean {
  if (s == null) return true;
  const lower = s.trim().toLowerCase();
  if (PLACEHOLDER_TOKENS.has(lower)) return true;
  if (lower.length < 3) return true;
  return false;
}

function validateApprovedRow(r: ApprovedRow, seen: Set<string>): Issue[] {
  const issues: Issue[] = [];
  const rid = r.rowId ?? '(missing)';
  const rstat = r.reviewStatus ?? '(missing)';
  const iname = r.institutionName ?? '(missing)';
  const push = (reason: string) => issues.push({ rowId: rid, reviewStatus: rstat, institutionName: iname, reason });

  if (!r.rowId) push('missing rowId');
  if (r.rowId && seen.has(r.rowId)) push(`duplicate rowId: ${r.rowId}`);
  if (r.rowId) seen.add(r.rowId);

  if (!r.sourceUrl) push('missing sourceUrl');
  if (!r.sourceQuote || r.sourceQuote.trim().length < 10) push('sourceQuote missing or <10 chars');
  if (r.sourceQuote === 'NOT_STATED_ON_SOURCE') push('sourceQuote is NOT_STATED_ON_SOURCE — cannot be approved');
  if (!r.sourceHash || r.sourceHash.length < 10) push('sourceHash missing or too short (<10 chars)');
  if (!r.cleanedTextPath) push('missing cleanedTextPath');

  if (r.visibilityLane !== 'PUBLIC_SAFE_USCE') push(`visibilityLane must be PUBLIC_SAFE_USCE, got "${r.visibilityLane}"`);
  if (r.reviewStatus !== 'AUTO_PUBLIC_SAFE' && r.reviewStatus !== 'REVIEWER_APPROVED') {
    push(`reviewStatus must be AUTO_PUBLIC_SAFE or REVIEWER_APPROVED, got "${r.reviewStatus}"`);
  }

  if (!r.opportunityType || !ALLOWED_OPPORTUNITY_TYPES.has(r.opportunityType)) {
    push(`opportunityType "${r.opportunityType}" not in allowed set`);
  }

  if (!r.sourceScope || !ALLOWED_SCOPES.has(r.sourceScope)) {
    push(`sourceScope "${r.sourceScope}" not in allowed set`);
  }

  // System / school scope → campusApplicabilityProof required
  if (r.sourceScope && SYSTEM_OR_SCHOOL_SCOPES.has(r.sourceScope)) {
    if (!r.campusApplicabilityProof || r.campusApplicabilityProof.trim().length < 30) {
      push(`${r.sourceScope} scope requires campusApplicabilityProof ≥30 chars`);
    }
    if (r.campusApplicabilityProof && isPlaceholder(r.campusApplicabilityProof)) {
      push('campusApplicabilityProof is a placeholder');
    }
  }

  // Future-lane deep family check via opportunityType (we don't carry
  // deepSourceFamily in the approved row schema; opportunityType is the
  // canonical USCE-positive enum). If somehow a future-lane string sneaks in
  // (e.g. someone hand-edited to "GME"), the opportunityType check above will
  // already flag it. Extra defense:
  if (r.opportunityType && FUTURE_LANE_DEEP_FAMILIES_LOWER.has(r.opportunityType.toLowerCase())) {
    push(`opportunityType "${r.opportunityType}" is future-lane only`);
  }

  if (r.reviewStatus === 'REVIEWER_APPROVED') {
    if (!r.reviewer || NON_HUMAN_REVIEWERS.has(r.reviewer.trim().toLowerCase())) {
      push(`reviewer must be a human name, got "${r.reviewer}"`);
    }
    if (!r.reviewedAt || !/^\d{4}-\d{2}-\d{2}/.test(r.reviewedAt)) {
      push(`reviewedAt must be ISO date, got "${r.reviewedAt}"`);
    }
    if (!r.decisionReason || r.decisionReason.trim().length < 10) {
      push('decisionReason must be ≥10 chars for REVIEWER_APPROVED');
    }
    if (r.decisionReason && isPlaceholder(r.decisionReason)) {
      push(`decisionReason looks like a placeholder: "${r.decisionReason}"`);
    }
  }

  return issues;
}

interface DecisionParseIssue { line: number; reason: string }

function validateDecisionsCsv(): DecisionParseIssue[] {
  const issues: DecisionParseIssue[] = [];
  const p = existsSync(DECISIONS_PATH_DEFAULT) ? DECISIONS_PATH_DEFAULT
    : (existsSync(DECISIONS_PATH_FALLBACK) ? DECISIONS_PATH_FALLBACK : null);
  if (!p) {
    // Not having a decisions CSV is allowed (e.g. first run); only the
    // approved/rejected/needs-more JSON files are required.
    return issues;
  }
  const text = readFileSync(p, 'utf8');
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) {
    issues.push({ line: 0, reason: 'decisions CSV has no rows' });
    return issues;
  }
  const header = lines[0].split(',');
  const required = ['reviewId', 'sourceQueueId', 'reviewerDecision'];
  for (const col of required) {
    if (!header.includes(col)) issues.push({ line: 0, reason: `header missing required column: ${col}` });
  }
  // Spot-check: no obvious fake "approved" rows with placeholder reviewer/reason.
  const decIdx = header.indexOf('reviewerDecision');
  const reviewerIdx = header.indexOf('reviewer');
  const reasonIdx = header.indexOf('decisionReason');
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    if (raw.trim() === '') continue;
    const cells = parseLine(raw);
    const decision = cells[decIdx] ?? '';
    if (decision === 'APPROVE_PUBLIC_SAFE') {
      const reviewer = (cells[reviewerIdx] ?? '').trim();
      const reason = (cells[reasonIdx] ?? '').trim();
      if (NON_HUMAN_REVIEWERS.has(reviewer.toLowerCase())) {
        issues.push({ line: i + 1, reason: `APPROVE_PUBLIC_SAFE with non-human reviewer "${reviewer}"` });
      }
      if (isPlaceholder(reason)) {
        issues.push({ line: i + 1, reason: `APPROVE_PUBLIC_SAFE with placeholder decisionReason "${reason}"` });
      }
    }
  }
  return issues;
}

function parseLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuote = false;
      else cur += ch;
    } else {
      if (ch === ',') { cells.push(cur); cur = ''; }
      else if (ch === '"') inQuote = true;
      else cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

function main(): void {
  const approved = readJson<ApprovedExport>(APPROVED_PATH);
  const rejected = readJson<{ count?: number; rows?: unknown[] }>(REJECTED_PATH);
  const needsMore = readJson<{ count?: number; rows?: unknown[] }>(NEEDS_MORE_PATH);

  let exitCode = 0;
  const issues: Issue[] = [];

  if (!approved) {
    issues.push({ rowId: '-', reviewStatus: '-', institutionName: '-', reason: `approved export missing or unparsable: ${APPROVED_PATH}` });
    exitCode = 1;
  } else if (!Array.isArray(approved.rows)) {
    issues.push({ rowId: '-', reviewStatus: '-', institutionName: '-', reason: 'approved.rows is not an array' });
    exitCode = 1;
  } else {
    const seen = new Set<string>();
    for (const r of approved.rows) {
      const rowIssues = validateApprovedRow(r, seen);
      issues.push(...rowIssues);
    }
  }

  if (!rejected) {
    issues.push({ rowId: '-', reviewStatus: '-', institutionName: '-', reason: `rejected export missing or unparsable: ${REJECTED_PATH}` });
    exitCode = 1;
  }
  if (!needsMore) {
    issues.push({ rowId: '-', reviewStatus: '-', institutionName: '-', reason: `needs-more-evidence export missing or unparsable: ${NEEDS_MORE_PATH}` });
    exitCode = 1;
  }

  const decisionIssues = validateDecisionsCsv();
  if (decisionIssues.length > 0) exitCode = 1;

  if (issues.length > 0) exitCode = 1;

  console.log('P102 approved-public-safe-export validator');
  console.log(`  approved rows:      ${approved?.rows?.length ?? '(no file)'}`);
  console.log(`  rejected count:     ${rejected?.count ?? rejected?.rows?.length ?? '(no file)'}`);
  console.log(`  needs-more count:   ${needsMore?.count ?? needsMore?.rows?.length ?? '(no file)'}`);
  console.log(`  decision csv issues: ${decisionIssues.length}`);
  console.log(`  approved row issues: ${issues.length}`);
  if (decisionIssues.length > 0) {
    console.log('\n  DECISIONS CSV ISSUES:');
    for (const di of decisionIssues) console.log(`    line ${di.line}: ${di.reason}`);
  }
  if (issues.length > 0) {
    console.log('\n  APPROVED ROW ISSUES:');
    for (const i of issues) console.log(`    [${i.reviewStatus}] ${i.institutionName} (${i.rowId}): ${i.reason}`);
  }

  if (exitCode === 0) {
    console.log('\n  ✓ PASS');
  } else {
    console.log('\n  ✗ FAIL');
  }
  process.exit(exitCode);
}

main();
