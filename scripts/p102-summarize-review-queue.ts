#!/usr/bin/env tsx
/**
 * P102 Review Queue Summarizer.
 *
 * Reads `public_safe_review_queue.json` (output of
 * `scripts/p102-build-public-safe-opportunity-rows.ts`) and produces two
 * artifacts to help a human reviewer triage:
 *
 *   - `public_safe_review_queue_summary.md` — grouped human-readable summary
 *     by institution / source domain / sourceScope / deepSourceFamily.
 *   - `public_safe_review_queue_top50.csv` — top-50 priority subset for
 *     `scripts/p102-build-approved-public-safe-export.ts`.
 *
 * No network. No model calls. No DB. Pure read + score + write.
 *
 * Priority rubric (higher score = more likely to be approvable):
 *   +6  Tier 1 USCE deepSourceFamily (VISITING_STUDENT / OBSERVERSHIP / etc.)
 *   +3  HIGH confidence
 *   +5  sourceUrl path contains specific institution slug or campus token
 *   +2  quote names institution or campus by name
 *   +5  visibility lane = CAUTION_SAFE_INTERNAL_REVIEW (closer to public-safe)
 *   +2  visibility lane = HUMAN_REVIEW_REQUIRED
 *   -3  sourceScope = HEALTH_SYSTEM_LEVEL / MEDICAL_SCHOOL_LEVEL (harder)
 *   -2  warnings flag (existing limitation)
 *   -5  quote === NOT_STATED_ON_SOURCE
 *   -5  deepSourceFamily in {CAREERS, GME, RESIDENCY, FELLOWSHIP, BENEFITS}
 *
 * Usage:
 *   npx tsx scripts/p102-summarize-review-queue.ts
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');
const REVIEW_QUEUE_PATH = path.join(EXPORTS_DIR, 'public_safe_review_queue.json');
const OPPORTUNITY_ROWS_PATH = path.join(EXPORTS_DIR, 'public_safe_opportunity_rows.json');
const SUMMARY_OUT = path.join(EXPORTS_DIR, 'public_safe_review_queue_summary.md');
const TOP50_OUT = path.join(EXPORTS_DIR, 'public_safe_review_queue_top50.csv');
const TEMPLATE_OUT = path.join(EXPORTS_DIR, 'public_safe_review_decisions.template.csv');
const TOP50_DECISIONS_OUT = path.join(EXPORTS_DIR, 'public_safe_review_decisions_top50.csv');

interface ReviewQueueEntry {
  claimId: string;
  institutionId: string;
  institutionName: string;
  state: string;
  city: string;
  visibilityLane: string;
  visibilityRationale: string | null;
  lane: string;
  deepSourceFamily: string | null;
  sourceScope: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  sourceUrl: string;
  sourceQuote: string;
  warnings: string[];
  extractedFromRunId: string;
}

interface ReviewQueueFile {
  entries: ReviewQueueEntry[];
  count: number;
  schemaVersion: string;
  generatedAt: string;
}

interface ScoredEntry {
  entry: ReviewQueueEntry;
  score: number;
  reasons: string[];
  /** How many other queue entries share the same sourceUrl (collapsed at dedup). */
  urlDuplicateCount: number;
}

function readJson<T>(p: string): T {
  if (!existsSync(p)) throw new Error(`Missing input file: ${p}`);
  return JSON.parse(readFileSync(p, 'utf8')) as T;
}

function safeWrite(p: string, contents: string): void {
  if (!existsSync(path.dirname(p))) mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, contents);
}

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

/**
 * Map the model's `lane` classification to the reviewer `proposedAudience`
 * enum. Returns empty string when the lane is ambiguous or non-USCE.
 */
function laneToAudience(lane: string): string {
  switch (lane) {
    case 'VISITING_MEDICAL_STUDENT':
    case 'CLINICAL_ELECTIVE':
    case 'SUB_INTERNSHIP':
    case 'AWAY_ROTATION':
      return 'us-md-do';
    case 'IMG_OBSERVERSHIP':
      return 'img-observer';
    case 'INTERNATIONAL_MEDICAL_STUDENT':
    case 'INTERNATIONAL_VISITING_STUDENT':
      return 'international';
    default:
      return '';
  }
}

function tokensFromCanonical(name: string): string[] {
  const generic = new Set(['hospital', 'medical', 'center', 'health', 'system', 'university', 'school', 'medicine', 'college', 'clinic']);
  return name.toLowerCase().split(/[\s,-]+/).filter(t => t.length > 3 && !generic.has(t));
}

function scoreEntry(e: ReviewQueueEntry): ScoredEntry {
  // urlDuplicateCount is filled in later during dedup; default to 0 here.
  let score = 0;
  const reasons: string[] = [];

  // Tier 1 USCE family
  if (e.deepSourceFamily && TIER_1_DEEP_FAMILIES.has(e.deepSourceFamily)) {
    score += 6;
    reasons.push(`+6 tier_1_family=${e.deepSourceFamily}`);
  }
  if (e.deepSourceFamily && FUTURE_LANE_DEEP_FAMILIES.has(e.deepSourceFamily)) {
    score -= 5;
    reasons.push(`-5 future_family=${e.deepSourceFamily}`);
  }

  // Confidence
  if (e.confidence === 'HIGH') {
    score += 3;
    reasons.push('+3 HIGH confidence');
  }

  // sourceUrl path contains institution/campus token
  const canonicalTokens = tokensFromCanonical(e.institutionName);
  const urlLower = (e.sourceUrl || '').toLowerCase();
  const cityTokenInUrl = e.city && urlLower.includes(e.city.toLowerCase());
  const institutionTokenInUrl = canonicalTokens.some(t => urlLower.includes(t));
  if (cityTokenInUrl || institutionTokenInUrl) {
    score += 5;
    reasons.push('+5 url_contains_institution_or_campus_token');
  }

  // Quote names institution or campus
  const quoteLower = (e.sourceQuote || '').toLowerCase();
  const institutionInQuote = canonicalTokens.some(t => quoteLower.includes(t));
  const cityInQuote = e.city && quoteLower.includes(e.city.toLowerCase());
  if (institutionInQuote || cityInQuote) {
    score += 2;
    reasons.push('+2 quote_names_institution_or_campus');
  }

  // Visibility lane
  if (e.visibilityLane === 'CAUTION_SAFE_INTERNAL_REVIEW') {
    score += 5;
    reasons.push('+5 caution_safe_lane');
  } else if (e.visibilityLane === 'HUMAN_REVIEW_REQUIRED') {
    score += 2;
    reasons.push('+2 human_review_lane');
  }

  // Scope difficulty
  if (SYSTEM_OR_SCHOOL_SCOPES.has(e.sourceScope)) {
    score -= 3;
    reasons.push(`-3 scope=${e.sourceScope}`);
  }

  // Warnings
  if (e.warnings && e.warnings.length > 0) {
    score -= 2;
    reasons.push(`-2 warnings=${e.warnings.length}`);
  }

  // NOT_STATED
  if (e.sourceQuote === 'NOT_STATED_ON_SOURCE') {
    score -= 5;
    reasons.push('-5 quote_not_stated');
  }

  return { entry: e, score, reasons, urlDuplicateCount: 0 };
}

function deriveSourceDomain(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function csvEscape(value: unknown): string {
  if (value == null) return '';
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const DECISION_HEADER = [
  'reviewId', 'sourceQueueId', 'runId', 'institutionId', 'institutionName',
  'state', 'city', 'sourceUrl', 'sourceScope', 'deepSourceFamily',
  'visibilityLane', 'confidence', 'priorityScore', 'priorityReasons',
  'quote', 'warnings',
  // urlDuplicateCount: how many other queue entries were collapsed into this one
  // (same sourceUrl, lower score). Reviewer only needs to decide once per URL.
  'urlDuplicateCount',
  'proposedOpportunityName', 'proposedOpportunityType', 'proposedAudience', 'proposedCampus',
  'reviewerDecision', 'decisionReason', 'campusApplicabilityProof',
  'approvedOpportunityRowId', 'duplicateOfRowId',
  'reviewer', 'reviewedAt', 'notes',
];

function buildDecisionRow(s: ScoredEntry, i: number): string {
  const e = s.entry;
  return [
    `rev_${String(i + 1).padStart(4, '0')}`,
    e.claimId,
    e.extractedFromRunId,
    e.institutionId,
    e.institutionName,
    e.state,
    e.city,
    e.sourceUrl,
    e.sourceScope,
    e.deepSourceFamily ?? '',
    e.visibilityLane,
    e.confidence ?? '',
    s.score,
    s.reasons.join(' | '),
    e.sourceQuote.length > 400 ? e.sourceQuote.slice(0, 400) + '…' : e.sourceQuote,
    (e.warnings || []).join(' | '),
    s.urlDuplicateCount,            // urlDuplicateCount — how many same-URL entries collapsed
    '',                              // proposedOpportunityName
    '',                              // proposedOpportunityType
    laneToAudience(e.lane),          // proposedAudience — pre-filled from model lane
    '',                              // proposedCampus
    'KEEP_HUMAN_REVIEW',             // reviewerDecision
    '',                              // decisionReason
    '',                              // campusApplicabilityProof
    '',                              // approvedOpportunityRowId
    '',                              // duplicateOfRowId
    '',                              // reviewer
    '',                              // reviewedAt
    '',                              // notes
  ].map(csvEscape).join(',');
}

function writeDecisionCsv(scored: ScoredEntry[], outPath: string, limit?: number): void {
  const slice = typeof limit === 'number' ? scored.slice(0, limit) : scored;
  const rows: string[] = [DECISION_HEADER.join(',')];
  for (let i = 0; i < slice.length; i++) rows.push(buildDecisionRow(slice[i], i));
  safeWrite(outPath, rows.join('\n') + '\n');
}

function writeTop50Csv(scored: ScoredEntry[]): void {
  // public_safe_review_queue_top50.csv — same schema, for traceability of
  // the prioritized subset. The starter decisions file (Phase D) is the one
  // a reviewer actually edits.
  writeDecisionCsv(scored, TOP50_OUT, 50);
}

function writeSummary(scored: ScoredEntry[], opportunityRowCount: number): void {
  const byInstitution = new Map<string, { count: number; topScore: number; institutionName: string; state: string; city: string }>();
  const byDomain = new Map<string, number>();
  const byScope = new Map<string, number>();
  const byFamily = new Map<string, number>();
  const byLane = new Map<string, number>();

  for (const s of scored) {
    const e = s.entry;
    const inst = byInstitution.get(e.institutionId) ?? { count: 0, topScore: -Infinity, institutionName: e.institutionName, state: e.state, city: e.city };
    inst.count += 1;
    if (s.score > inst.topScore) inst.topScore = s.score;
    byInstitution.set(e.institutionId, inst);

    byDomain.set(deriveSourceDomain(e.sourceUrl) || 'unknown', (byDomain.get(deriveSourceDomain(e.sourceUrl) || 'unknown') ?? 0) + 1);
    byScope.set(e.sourceScope, (byScope.get(e.sourceScope) ?? 0) + 1);
    byFamily.set(e.deepSourceFamily ?? 'null', (byFamily.get(e.deepSourceFamily ?? 'null') ?? 0) + 1);
    byLane.set(e.visibilityLane, (byLane.get(e.visibilityLane) ?? 0) + 1);
  }

  const top10Institutions = [...byInstitution.entries()]
    .sort((a, b) => b[1].topScore - a[1].topScore || b[1].count - a[1].count)
    .slice(0, 10);

  const lines: string[] = [];
  lines.push('# P102 Public-Safe Review Queue — Summary');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`Branch: \`local/p102-reviewer-workflow\``);
  lines.push('');
  lines.push('## Cumulative counts');
  lines.push('');
  lines.push(`- Total review-queue entries: **${scored.length}**`);
  lines.push(`- Total auto-approved opportunity rows (already public-safe): **${opportunityRowCount}**`);
  lines.push(`- Institutions in review queue: **${byInstitution.size}**`);
  lines.push(`- Source domains: **${byDomain.size}**`);
  lines.push('');
  lines.push('## By visibility lane');
  lines.push('');
  lines.push('| Lane | Count |');
  lines.push('|---|---:|');
  for (const [k, v] of [...byLane.entries()].sort((a, b) => b[1] - a[1])) lines.push(`| ${k} | ${v} |`);
  lines.push('');
  lines.push('## By source scope');
  lines.push('');
  lines.push('| Scope | Count |');
  lines.push('|---|---:|');
  for (const [k, v] of [...byScope.entries()].sort((a, b) => b[1] - a[1])) lines.push(`| ${k} | ${v} |`);
  lines.push('');
  lines.push('## By deep source family (top 15)');
  lines.push('');
  lines.push('| Deep family | Count |');
  lines.push('|---|---:|');
  for (const [k, v] of [...byFamily.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) lines.push(`| ${k} | ${v} |`);
  lines.push('');
  lines.push('## Top 10 institutions by priority score');
  lines.push('');
  lines.push('Reviewers should consider these first — they have at least one entry with the highest priority score and the most reviewable entries overall.');
  lines.push('');
  lines.push('| # | Institution | City, State | Top score | Entry count |');
  lines.push('|---|---|---|---:|---:|');
  let i = 1;
  for (const [, v] of top10Institutions) {
    lines.push(`| ${i++} | ${v.institutionName} | ${v.city}, ${v.state} | ${v.topScore} | ${v.count} |`);
  }
  lines.push('');
  lines.push('## Top 50 review-queue entries (machine-prioritized)');
  lines.push('');
  lines.push(`See \`public_safe_review_queue_top50.csv\` for the full machine-readable starter file.`);
  lines.push(`All top-50 rows default to \`reviewerDecision=KEEP_HUMAN_REVIEW\`. The reviewer must explicitly change this per row.`);
  lines.push('');
  lines.push('| # | Score | Institution | Lane | Family | Source URL | Quote (truncated) |');
  lines.push('|---|---:|---|---|---|---|---|');
  for (let j = 0; j < Math.min(50, scored.length); j++) {
    const s = scored[j];
    const e = s.entry;
    const shortUrl = e.sourceUrl.length > 60 ? e.sourceUrl.slice(0, 60) + '…' : e.sourceUrl;
    const shortQuote = (e.sourceQuote || '').replace(/\s+/g, ' ').slice(0, 80);
    lines.push(`| ${j + 1} | ${s.score} | ${e.institutionName} | ${e.visibilityLane} | ${e.deepSourceFamily ?? ''} | \`${shortUrl}\` | ${shortQuote}… |`);
  }
  lines.push('');
  lines.push('## How to use this');
  lines.push('');
  lines.push('1. Open `public_safe_review_queue_top50.csv` in a spreadsheet.');
  lines.push('2. For each row, decide one of: `APPROVE_PUBLIC_SAFE`, `REJECT_NOT_USCE`, `REJECT_SCOPE_MISMATCH`, `REJECT_OFF_DOMAIN_NO_APPLICABILITY`, `KEEP_HUMAN_REVIEW`, `NEEDS_MORE_EVIDENCE`, `FUTURE_LANE_ONLY`, or `DUPLICATE_OF_APPROVED_ROW`.');
  lines.push('3. For `APPROVE_PUBLIC_SAFE` on system/school sources, fill `campusApplicabilityProof` with a ≥ 30-char verbatim quote or named-list reference (see `P102_REVIEWER_WORKFLOW_SPEC.md` §7).');
  lines.push('4. Fill `decisionReason` (≥ 10 chars, not "TBD"/"TODO").');
  lines.push('5. Fill `reviewer` with your name; `reviewedAt` with today\'s ISO date (YYYY-MM-DD).');
  lines.push('6. Save as `public_safe_review_decisions_top50.csv`.');
  lines.push('7. Run `npx tsx scripts/p102-build-approved-public-safe-export.ts` to generate the approved export.');
  lines.push('8. Run `npx tsx scripts/p102-validate-approved-public-safe-export.ts` to confirm safety gates hold.');
  lines.push('');
  lines.push('No row is auto-approved. The validator rejects fake placeholder values.');

  safeWrite(SUMMARY_OUT, lines.join('\n') + '\n');
}

/**
 * Deduplicate a scored list by sourceUrl: for each URL group keep only the
 * highest-scoring entry, and annotate it with urlDuplicateCount = group
 * size - 1. The input must already be sorted score-desc so that `group[0]`
 * is always the winner.
 */
function deduplicateByUrl(scored: ScoredEntry[]): ScoredEntry[] {
  const byUrl = new Map<string, ScoredEntry[]>();
  for (const s of scored) {
    const url = s.entry.sourceUrl;
    const arr = byUrl.get(url) ?? [];
    arr.push(s);
    byUrl.set(url, arr);
  }
  const deduped: ScoredEntry[] = [];
  for (const [, group] of byUrl) {
    // group[0] is the winner (highest score — list is pre-sorted)
    deduped.push({ ...group[0], urlDuplicateCount: group.length - 1 });
  }
  deduped.sort((a, b) => b.score - a.score);
  return deduped;
}

function main(): void {
  const queue = readJson<ReviewQueueFile>(REVIEW_QUEUE_PATH);
  const opportunityRows = readJson<{ rows: unknown[]; summary?: { publicSafeOpportunityRows: number } }>(OPPORTUNITY_ROWS_PATH);

  const scored = queue.entries.map(scoreEntry);
  scored.sort((a, b) => b.score - a.score);

  // Deduplicate: collapse multiple entries from the same sourceUrl into one.
  // A reviewer only needs to make one decision per source page.
  const deduped = deduplicateByUrl(scored);

  writeSummary(deduped, opportunityRows.summary?.publicSafeOpportunityRows ?? opportunityRows.rows?.length ?? 0);
  writeTop50Csv(deduped);

  // Full template (all deduped entries) — overwrites on every run.
  // Reviewers who have started editing should save under a different filename
  // (e.g. public_safe_review_decisions.csv) before re-running.
  writeDecisionCsv(deduped, TEMPLATE_OUT);

  // Top-50 starter copy at the canonical decisions filename — created ONLY
  // if it does not already exist (don't clobber in-progress reviewer work).
  if (!existsSync(TOP50_DECISIONS_OUT)) {
    writeDecisionCsv(deduped, TOP50_DECISIONS_OUT, 50);
  }

  const collapsed = scored.length - deduped.length;
  console.log('P102 review-queue summarizer');
  console.log(`  read queue:     ${scored.length} entries`);
  console.log(`  after url-dedup:${deduped.length} entries (collapsed ${collapsed} same-URL dupes)`);
  console.log(`  written:        ${SUMMARY_OUT}`);
  console.log(`  written:        ${TOP50_OUT}`);
  console.log(`  written:        ${TEMPLATE_OUT}`);
  console.log(`  written:        ${TOP50_DECISIONS_OUT} (only if it did not exist)`);
  console.log(`  top 50 scores:  ${deduped.slice(0, 50).map(s => s.score).join(', ')}`);
}

main();
