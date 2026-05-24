#!/usr/bin/env tsx
/**
 * P102 Phases F + G — Intelligent Opportunity Row Builder + Deduplication.
 *
 * Combines triage, audience, and direct-link results into clean, deduped
 * opportunity rows. One row per (sourceUrl × audienceClass). Pages classified
 * as BOTH_STUDENT_AND_IMG_GRADUATE emit two rows — one VMS, one IMG.
 *
 * Routing:
 *   AUTO_PROMOTE  — INCLUDE triage + VALID direct link + known audience
 *   HOLD_REVIEW   — any HOLD_* condition (triage, audience, or direct-link)
 *   REJECTED      — INVALID direct-link or late rejection by this stage
 *
 * Deduplication key: institutionId + canonicalUrl + opportunityType + audienceClass
 *
 * Usage:
 *   npx tsx scripts/p102-build-intelligent-opportunity-rows.ts
 *
 * Reads:
 *   exports/source_page_triage.json
 *   exports/usce_audience_classified.json
 *   exports/direct_link_validation.json
 *   exports/public_safe_review_queue.json
 *
 * Writes:
 *   exports/intelligent_public_safe_rows.json
 *   exports/intelligent_hold_rows.json
 *   exports/intelligent_rejected_rows.json
 *   exports/intelligent_duplicate_clusters.json
 *   exports/intelligent_review_queue.json
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { type SourcePageTriageFile } from './p102-triage-source-pages.js';
import { type AudienceClassifiedFile, type AudienceClass } from './p102-classify-usce-audience.js';
import { type DirectLinkValidationFile, type DirectLinkStatus } from './p102-validate-direct-usce-links.js';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');

const TRIAGE_PATH    = path.join(EXPORTS_DIR, 'source_page_triage.json');
const AUDIENCE_PATH  = path.join(EXPORTS_DIR, 'usce_audience_classified.json');
const DIRECT_PATH    = path.join(EXPORTS_DIR, 'direct_link_validation.json');
const QUEUE_PATH     = path.join(EXPORTS_DIR, 'public_safe_review_queue.json');

const OUT_PUBLIC    = path.join(EXPORTS_DIR, 'intelligent_public_safe_rows.json');
const OUT_HOLD      = path.join(EXPORTS_DIR, 'intelligent_hold_rows.json');
const OUT_REJECTED  = path.join(EXPORTS_DIR, 'intelligent_rejected_rows.json');
const OUT_DUPES     = path.join(EXPORTS_DIR, 'intelligent_duplicate_clusters.json');
const OUT_QUEUE     = path.join(EXPORTS_DIR, 'intelligent_review_queue.json');

// ── Types ──────────────────────────────────────────────────────────────────

export type OpportunityType =
  | 'VISITING_STUDENT_ROTATION'    // VSLO/clerkship/away/sub-I for US students
  | 'CLINICAL_ELECTIVE'            // elective, ambiguous student type
  | 'OBSERVERSHIP'                 // IMG observer (non-clinical)
  | 'EXTERNSHIP'                   // IMG clinical extern
  | 'VISITING_STUDENT_INTL'        // international medical student
  | 'UNKNOWN';

export type RowRoute = 'AUTO_PROMOTE' | 'HOLD_REVIEW' | 'REJECTED';

export interface OpportunityRow {
  rowId: string;
  opportunitySignature: string;
  institutionId: string;
  institutionName: string;
  state: string;
  city: string;
  sourceUrl: string;
  canonicalUrl: string;
  opportunityType: OpportunityType;
  audienceClass: AudienceClass;
  studentVsGraduate: string;
  topQuote: string;
  quoteScore: number;
  usceLanes: string[];
  deepFamilies: string[];
  triageDecision: string;
  directLinkStatus: DirectLinkStatus;
  audienceConfidence: string;
  confidence: string;
  route: RowRoute;
  holdReasons: string[];
  urlPathDepth: number;
  runIds: string[];
  claimIds: string[];
}

export interface IntelligentRowsFile {
  generatedAt: string;
  totalRows: number;
  routeCounts: Record<RowRoute, number>;
  rows: OpportunityRow[];
}

export interface HoldFile {
  generatedAt: string;
  totalHolds: number;
  rows: OpportunityRow[];
}

export interface RejectedFile {
  generatedAt: string;
  totalRejected: number;
  rows: OpportunityRow[];
}

export interface DuplicateCluster {
  signature: string;
  keptRowId: string;
  duplicateRowIds: string[];
  allSourceUrls: string[];
}

export interface DuplicateClustersFile {
  generatedAt: string;
  totalClusters: number;
  clusters: DuplicateCluster[];
}

export interface ReviewQueueEntry {
  rowId: string;
  institutionId: string;
  institutionName: string;
  state: string;
  city: string;
  sourceUrl: string;
  opportunityType: OpportunityType;
  audienceClass: AudienceClass;
  topQuote: string;
  holdReasons: string[];
  triageDecision: string;
  directLinkStatus: DirectLinkStatus;
  audienceConfidence: string;
}

// ── Raw claim shape from the queue ────────────────────────────────────────

interface QueueEntry {
  claimId: string;
  institutionId: string;
  institutionName: string;
  state?: string;
  city?: string;
  lane: string;
  deepSourceFamily: string;
  sourceScope: string;
  confidence: string;
  sourceUrl: string;
  sourceQuote: string;
  extractedFromRunId?: string;
}

// ── OpportunityType derivation ────────────────────────────────────────────

function deriveOpportunityType(lanes: string[], families: string[], audienceClass: AudienceClass): OpportunityType {
  // Audience-first: when a BOTH page is split, each row uses only the lanes
  // relevant to that audience so we don't assign IMG types to a VMS row.
  if (audienceClass === 'IMG_GRADUATE_EXTERNSHIP') return 'EXTERNSHIP';
  if (audienceClass === 'IMG_GRADUATE_OBSERVER') return 'OBSERVERSHIP';
  if (audienceClass === 'INTERNATIONAL_MEDICAL_STUDENT') return 'VISITING_STUDENT_INTL';

  // For student-audience rows: ignore IMG_OBSERVERSHIP lane when VMS or
  // INTL lanes are present on the same page (i.e. the page serves both)
  const studentLanes = lanes.filter(l => l !== 'IMG_OBSERVERSHIP');

  if (studentLanes.includes('SUB_INTERNSHIP') || studentLanes.includes('AWAY_ROTATION')) {
    return 'VISITING_STUDENT_ROTATION';
  }
  if (studentLanes.includes('VISITING_MEDICAL_STUDENT')) return 'VISITING_STUDENT_ROTATION';
  if (studentLanes.includes('INTERNATIONAL_MEDICAL_STUDENT') || studentLanes.includes('INTERNATIONAL_VISITING_STUDENT')) {
    return 'VISITING_STUDENT_INTL';
  }
  if (studentLanes.includes('CLINICAL_ELECTIVE')) return 'CLINICAL_ELECTIVE';

  // Fallback: IMG lane only (page serves IMGs, no student lane present)
  if (lanes.includes('IMG_OBSERVERSHIP')) {
    if (families.includes('EXTERNSHIP')) return 'EXTERNSHIP';
    return 'OBSERVERSHIP';
  }

  return 'UNKNOWN';
}

// ── Quote scoring — pick the most informative quote ───────────────────────

const QUOTE_SIGNALS: Array<[RegExp, number]> = [
  [/\b(apply|application|how to apply|apply (online|here|now))\b/i, 4],
  [/\b(fee|cost|\$\d+|free of charge|no (application )?fee)\b/i,   4],
  [/\b(\d+(-|\s)week|weeks? (rotation|program|elective)|duration)\b/i, 4],
  [/\b(eligib|requirement|prerequisite|must have|must be enrolled)\b/i, 3],
  [/\b(VSLO|VSAS|AAMC|LCME|ECFMG)\b/i,                             3],
  [/\b(coordinator|program director|contact .+@|@[\w.-]+\.\w{2,})\b/i, 3],
  [/\b(accept(s|ing)?|welcome|open to|available to) (visiting|international|IMG)\b/i, 3],
  [/\b(submit|upload|letter of rec|CV required|transcript)\b/i,     2],
  [/\b(rotation|elective|clerkship|observership|externship)\b/i,    1],
  [/\b(medical student|IMG|international|visiting student)\b/i,     1],
];

function scoreQuote(quote: string): number {
  if (!quote || quote === 'NOT_STATED_ON_SOURCE') return 0;
  return QUOTE_SIGNALS.reduce((acc, [re, weight]) => acc + (re.test(quote) ? weight : 0), 0);
}

function selectBestQuote(quotes: string[]): { quote: string; score: number } {
  let best = { quote: '', score: -1 };
  for (const q of quotes) {
    const s = scoreQuote(q);
    if (s > best.score) best = { quote: q, score: s };
  }
  return best;
}

// ── Row routing ───────────────────────────────────────────────────────────

function routeRow(
  triageDecision: string,
  directLinkStatus: DirectLinkStatus,
  audienceClass: AudienceClass,
  audienceConfidence: string,
): { route: RowRoute; holdReasons: string[] } {
  const holdReasons: string[] = [];

  // Hard rejects
  if (directLinkStatus === 'INVALID_NOT_USCE_SOURCE') {
    return { route: 'REJECTED', holdReasons: ['direct-link validation: INVALID_NOT_USCE_SOURCE'] };
  }
  if (directLinkStatus === 'INDIRECT_THIRD_PARTY') {
    return { route: 'REJECTED', holdReasons: ['direct-link validation: third-party URL'] };
  }

  // Collect holds
  if (triageDecision === 'HOLD_SCOPE_AMBIGUITY') holdReasons.push('triage: scope ambiguity (system/school-level, campus unclear)');
  if (triageDecision === 'HOLD_AUDIENCE_AMBIGUITY') holdReasons.push('triage: audience ambiguity');
  if (triageDecision === 'HOLD_NEEDS_MORE_EVIDENCE') holdReasons.push('triage: needs more evidence');
  if (directLinkStatus === 'GENERIC_PAGE_HOLD') holdReasons.push('direct-link: generic page, not confirmed opportunity-specific');
  if (audienceClass === 'UNKNOWN_HOLD') holdReasons.push('audience: cannot classify without human review');
  if (audienceConfidence === 'LOW') holdReasons.push('audience confidence: LOW');

  if (holdReasons.length > 0) return { route: 'HOLD_REVIEW', holdReasons };

  // All clear → candidate for auto-promote
  return { route: 'AUTO_PROMOTE', holdReasons: [] };
}

// ── Opportunity signature ─────────────────────────────────────────────────

function opportunitySignature(institutionId: string, canonicalUrl: string, opportunityType: OpportunityType, audienceClass: AudienceClass): string {
  return `${institutionId}||${canonicalUrl}||${opportunityType}||${audienceClass}`;
}

function rowId(sig: string, n: number): string {
  const hash = crypto.createHash('sha1').update(sig).digest('hex').slice(0, 8);
  return `opp_${hash}${n > 0 ? `_${n}` : ''}`;
}

// ── Main ───────────────────────────────────────────────────────────────────

function main(): void {
  for (const p of [TRIAGE_PATH, AUDIENCE_PATH, DIRECT_PATH, QUEUE_PATH]) {
    if (!existsSync(p)) throw new Error(`Missing: ${p}\nRun preceding scripts first.`);
  }

  const triage   = JSON.parse(readFileSync(TRIAGE_PATH,   'utf8')) as SourcePageTriageFile;
  const audience = JSON.parse(readFileSync(AUDIENCE_PATH, 'utf8')) as AudienceClassifiedFile;
  const direct   = JSON.parse(readFileSync(DIRECT_PATH,   'utf8')) as DirectLinkValidationFile;
  const rawQueue = JSON.parse(readFileSync(QUEUE_PATH,    'utf8')) as { entries: QueueEntry[] };

  // Index audience and direct-link by sourceUrl
  const audByUrl    = new Map(audience.classifications.map(c => [c.sourceUrl, c]));
  const directByUrl = new Map(direct.results.map(r => [r.sourceUrl, r]));

  // Index all claims by sourceUrl for quote selection
  const claimsByUrl = new Map<string, QueueEntry[]>();
  for (const e of rawQueue.entries) {
    const list = claimsByUrl.get(e.sourceUrl) ?? [];
    list.push(e);
    claimsByUrl.set(e.sourceUrl, list);
  }

  // Track signatures for deduplication
  const seenSigs = new Map<string, string>();       // sig → first rowId
  const dupClusters = new Map<string, DuplicateCluster>();

  const allRows: OpportunityRow[] = [];

  for (const page of triage.pages) {
    // Only process non-hard-rejected pages
    if (page.decision.startsWith('REJECT_')) continue;

    const aud    = audByUrl.get(page.sourceUrl);
    const dir    = directByUrl.get(page.sourceUrl);

    if (!aud || !dir) continue; // shouldn't happen if scripts ran in order

    const claims = claimsByUrl.get(page.sourceUrl) ?? [];
    const quotes = claims.map(c => c.sourceQuote).filter(Boolean);
    const { quote: topQuote, score: quoteScore } = selectBestQuote(quotes.length > 0 ? quotes : [page.topQuote]);

    const deepFamilies = [...new Set(claims.map(c => c.deepSourceFamily).filter(Boolean))];
    const runIds       = [...new Set(claims.map(c => c.extractedFromRunId).filter(Boolean) as string[])];
    const claimIds     = claims.map(c => c.claimId);
    const state        = page.state ?? claims[0]?.state ?? '';
    const city         = page.city ?? claims[0]?.city ?? '';

    // Expand BOTH audience into two distinct rows
    const audienceClasses: AudienceClass[] = aud.audienceClass === 'BOTH_STUDENT_AND_IMG_GRADUATE'
      ? ['US_MD_DO_VISITING_STUDENT', 'IMG_GRADUATE_OBSERVER']
      : [aud.audienceClass];

    for (const ac of audienceClasses) {
      const oppType = deriveOpportunityType(page.usceLanes, deepFamilies, ac);
      const sig = opportunitySignature(page.institutionId, page.canonicalUrl, oppType, ac);

      // Deduplication
      if (seenSigs.has(sig)) {
        const firstId = seenSigs.get(sig)!;
        const cluster = dupClusters.get(sig) ?? {
          signature: sig,
          keptRowId: firstId,
          duplicateRowIds: [],
          allSourceUrls: [page.canonicalUrl],
        };
        cluster.duplicateRowIds.push(`(skipped:${page.sourceUrl})`);
        cluster.allSourceUrls.push(page.sourceUrl);
        dupClusters.set(sig, cluster);
        continue;
      }

      const { route, holdReasons } = routeRow(
        page.decision,
        dir.directLinkStatus,
        ac,
        aud.audienceConfidence,
      );

      const id = rowId(sig, 0);
      seenSigs.set(sig, id);

      allRows.push({
        rowId: id,
        opportunitySignature: sig,
        institutionId: page.institutionId,
        institutionName: page.institutionName,
        state,
        city,
        sourceUrl: page.sourceUrl,
        canonicalUrl: page.canonicalUrl,
        opportunityType: oppType,
        audienceClass: ac,
        studentVsGraduate: aud.studentVsGraduate,
        topQuote,
        quoteScore,
        usceLanes: page.usceLanes,
        deepFamilies,
        triageDecision: page.decision,
        directLinkStatus: dir.directLinkStatus,
        audienceConfidence: aud.audienceConfidence,
        confidence: page.confidence,
        route,
        holdReasons,
        urlPathDepth: dir.urlPathDepth,
        runIds: runIds.length > 0 ? runIds : page.runIds,
        claimIds,
      });
    }
  }

  // Split by route
  const publicRows   = allRows.filter(r => r.route === 'AUTO_PROMOTE');
  const holdRows     = allRows.filter(r => r.route === 'HOLD_REVIEW');
  const rejectedRows = allRows.filter(r => r.route === 'REJECTED');

  const routeCounts: Record<RowRoute, number> = {
    AUTO_PROMOTE: publicRows.length,
    HOLD_REVIEW:  holdRows.length,
    REJECTED:     rejectedRows.length,
  };

  // Review queue — slim representation of HOLD_REVIEW rows only
  const reviewQueue: ReviewQueueEntry[] = holdRows.map(r => ({
    rowId: r.rowId,
    institutionId: r.institutionId,
    institutionName: r.institutionName,
    state: r.state,
    city: r.city,
    sourceUrl: r.sourceUrl,
    opportunityType: r.opportunityType,
    audienceClass: r.audienceClass,
    topQuote: r.topQuote,
    holdReasons: r.holdReasons,
    triageDecision: r.triageDecision,
    directLinkStatus: r.directLinkStatus,
    audienceConfidence: r.audienceConfidence,
  }));

  const dupClustersArr = [...dupClusters.values()];

  // Write outputs
  const now = new Date().toISOString();

  writeFileSync(OUT_PUBLIC, JSON.stringify({
    generatedAt: now,
    totalRows: publicRows.length,
    routeCounts,
    rows: publicRows,
  } satisfies IntelligentRowsFile, null, 2) + '\n');

  writeFileSync(OUT_HOLD, JSON.stringify({
    generatedAt: now,
    totalHolds: holdRows.length,
    rows: holdRows,
  } satisfies HoldFile, null, 2) + '\n');

  writeFileSync(OUT_REJECTED, JSON.stringify({
    generatedAt: now,
    totalRejected: rejectedRows.length,
    rows: rejectedRows,
  } satisfies RejectedFile, null, 2) + '\n');

  writeFileSync(OUT_DUPES, JSON.stringify({
    generatedAt: now,
    totalClusters: dupClustersArr.length,
    clusters: dupClustersArr,
  } satisfies DuplicateClustersFile, null, 2) + '\n');

  writeFileSync(OUT_QUEUE, JSON.stringify({
    generatedAt: now,
    count: reviewQueue.length,
    entries: reviewQueue,
  }, null, 2) + '\n');

  // Report
  console.log('P102 intelligent row builder');
  console.log(`  pages processed:       ${triage.pages.filter(p => !p.decision.startsWith('REJECT_')).length}`);
  console.log(`  opportunity rows built: ${allRows.length}`);
  console.log(`  duplicate clusters:     ${dupClustersArr.length}`);
  console.log('');
  console.log('  Route breakdown:');
  console.log(`    AUTO_PROMOTE   ${publicRows.length}`);
  console.log(`    HOLD_REVIEW    ${holdRows.length}`);
  console.log(`    REJECTED       ${rejectedRows.length}`);
  console.log('');
  console.log(`  AUTO_PROMOTE institutions:`);
  for (const r of publicRows) {
    console.log(`    ${r.institutionName.padEnd(45)} ${r.audienceClass.padEnd(30)} ${r.opportunityType}`);
  }
  console.log('');
  console.log(`  written: intelligent_public_safe_rows.json (${publicRows.length} rows)`);
  console.log(`           intelligent_hold_rows.json         (${holdRows.length} rows)`);
  console.log(`           intelligent_rejected_rows.json     (${rejectedRows.length} rows)`);
  console.log(`           intelligent_duplicate_clusters.json (${dupClustersArr.length} clusters)`);
  console.log(`           intelligent_review_queue.json       (${reviewQueue.length} entries)`);
}

main();
