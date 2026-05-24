#!/usr/bin/env tsx
/**
 * P102 Phase D — USCE Audience Classifier.
 *
 * For each page that passed triage (INCLUDE_USCE_OPPORTUNITY or HOLD_*),
 * determines the audience class. The lane classification the model already
 * emitted is the primary signal; quote content provides secondary evidence.
 *
 * Audience classes:
 *   US_MD_DO_VISITING_STUDENT      — VSLO, clerkship, away rotation, sub-I
 *   INTERNATIONAL_MEDICAL_STUDENT  — international med student (enrolled, not graduated)
 *   IMG_GRADUATE_OBSERVER          — observership for post-MD IMGs
 *   IMG_GRADUATE_EXTERNSHIP        — externship for post-MD IMGs
 *   BOTH_STUDENT_AND_IMG_GRADUATE  — page explicitly serves both
 *   US_MD_DO_ONLY                  — domestic students, IMGs not mentioned
 *   PHARMACY_ONLY                  — should have been caught by triage (belt-and-suspenders)
 *   ALLIED_HEALTH_ONLY             — same
 *   RESIDENT_FELLOW_ONLY           — future-lane, not pre-residency USCE
 *   UNKNOWN_HOLD                   — cannot determine without human read
 *
 * Usage:
 *   npx tsx scripts/p102-classify-usce-audience.ts [--all-existing-p102-runs]
 *
 * Reads:  exports/source_page_triage.json
 *         exports/public_safe_review_queue.json
 * Writes: exports/usce_audience_classified.json
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { type SourcePageTriageFile, type TriageDecision } from './p102-triage-source-pages.js';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');
const TRIAGE_PATH = path.join(EXPORTS_DIR, 'source_page_triage.json');
const QUEUE_PATH = path.join(EXPORTS_DIR, 'public_safe_review_queue.json');
const OUTPUT_PATH = path.join(EXPORTS_DIR, 'usce_audience_classified.json');

// ── Types ──────────────────────────────────────────────────────────────────

export type AudienceClass =
  | 'US_MD_DO_VISITING_STUDENT'
  | 'INTERNATIONAL_MEDICAL_STUDENT'
  | 'IMG_GRADUATE_OBSERVER'
  | 'IMG_GRADUATE_EXTERNSHIP'
  | 'BOTH_STUDENT_AND_IMG_GRADUATE'
  | 'US_MD_DO_ONLY'
  | 'PHARMACY_ONLY'
  | 'ALLIED_HEALTH_ONLY'
  | 'RESIDENT_FELLOW_ONLY'
  | 'UNKNOWN_HOLD';

export type StudentVsGraduate = 'STUDENT' | 'IMG_GRADUATE' | 'BOTH' | 'UNKNOWN';

export interface AudienceClassification {
  sourceUrl: string;
  canonicalUrl: string;
  institutionId: string;
  institutionName: string;
  audienceClass: AudienceClass;
  studentVsGraduate: StudentVsGraduate;
  audienceConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  audienceRationale: string;
  usceLanes: string[];
  triageDecision: TriageDecision;
}

export interface AudienceClassifiedFile {
  generatedAt: string;
  totalClassified: number;
  audienceCounts: Record<AudienceClass, number>;
  studentVsGraduateCounts: Record<StudentVsGraduate, number>;
  classifications: AudienceClassification[];
}

// ── Lane → audience mapping ────────────────────────────────────────────────

function classifyFromLane(
  lanes: string[],
  quote: string,
): { audienceClass: AudienceClass; studentVsGraduate: StudentVsGraduate; confidence: 'HIGH' | 'MEDIUM' | 'LOW'; rationale: string } {
  const hasVms = lanes.some(l => ['VISITING_MEDICAL_STUDENT', 'CLINICAL_ELECTIVE', 'SUB_INTERNSHIP', 'AWAY_ROTATION'].includes(l));
  const hasImg = lanes.includes('IMG_OBSERVERSHIP');
  const hasIntl = lanes.some(l => ['INTERNATIONAL_MEDICAL_STUDENT', 'INTERNATIONAL_VISITING_STUDENT'].includes(l));

  // Secondary quote signals
  const quoteLower = quote.toLowerCase();
  const imgQuoteSignal = /\b(international medical grad|img\b|foreign medical grad|non-us grad|ecfmg|observer|observership)\b/i.test(quote);
  const vmsQuoteSignal = /\b(visiting (medical )?student|vslo|vsas|lcme|coca|ms3|ms4|clerkship|elective|away rotation|sub.?intern|acting intern)\b/i.test(quote);
  const intlStudentSignal = /\b(international (medical )?student|international visiting|non-us medical student|foreign med student)\b/i.test(quote);
  const pharmacySignal = /\b(pharmac|dental|P[1-4]\s+student|pharmacy extern)\b/i.test(quote);
  const residentSignal = /\b(resident|fellow|pgy-?\d|gme|acgme)\b/i.test(quote) && !vmsQuoteSignal && !imgQuoteSignal;

  // Belt-and-suspenders pharmacy check
  if (pharmacySignal) {
    return { audienceClass: 'PHARMACY_ONLY', studentVsGraduate: 'UNKNOWN', confidence: 'HIGH', rationale: 'pharmacy signal in quote overrides lane' };
  }

  // Resident/fellow only
  if (residentSignal && !hasVms && !hasImg && !hasIntl) {
    return { audienceClass: 'RESIDENT_FELLOW_ONLY', studentVsGraduate: 'UNKNOWN', confidence: 'MEDIUM', rationale: 'resident/fellow signal only, no student or IMG lane' };
  }

  // Both VMS and IMG
  if (hasVms && hasImg) {
    return { audienceClass: 'BOTH_STUDENT_AND_IMG_GRADUATE', studentVsGraduate: 'BOTH', confidence: 'HIGH', rationale: 'both VMS lane and IMG_OBSERVERSHIP lane on same page' };
  }

  // International medical student (enrolled student, not graduate)
  if (hasIntl || intlStudentSignal) {
    if (hasImg) {
      return { audienceClass: 'BOTH_STUDENT_AND_IMG_GRADUATE', studentVsGraduate: 'BOTH', confidence: 'MEDIUM', rationale: 'international student + IMG lanes' };
    }
    return { audienceClass: 'INTERNATIONAL_MEDICAL_STUDENT', studentVsGraduate: 'STUDENT', confidence: 'HIGH', rationale: 'INTERNATIONAL_MEDICAL_STUDENT lane' };
  }

  // IMG observership
  if (hasImg) {
    const isExternship = /extern/i.test(quoteLower);
    return {
      audienceClass: isExternship ? 'IMG_GRADUATE_EXTERNSHIP' : 'IMG_GRADUATE_OBSERVER',
      studentVsGraduate: 'IMG_GRADUATE',
      confidence: 'HIGH',
      rationale: `IMG_OBSERVERSHIP lane${isExternship ? ' with externship signal' : ''}`,
    };
  }

  // VMS (CLINICAL_ELECTIVE is ambiguous — could accept IMGs)
  if (hasVms) {
    const elective = lanes.includes('CLINICAL_ELECTIVE') && !lanes.some(l => ['VISITING_MEDICAL_STUDENT', 'SUB_INTERNSHIP', 'AWAY_ROTATION'].includes(l));
    if (elective && imgQuoteSignal) {
      return { audienceClass: 'BOTH_STUDENT_AND_IMG_GRADUATE', studentVsGraduate: 'BOTH', confidence: 'MEDIUM', rationale: 'CLINICAL_ELECTIVE lane with IMG quote signal — may accept both' };
    }
    if (vmsQuoteSignal || !imgQuoteSignal) {
      return { audienceClass: 'US_MD_DO_VISITING_STUDENT', studentVsGraduate: 'STUDENT', confidence: 'HIGH', rationale: `${lanes.filter(l => ['VISITING_MEDICAL_STUDENT','SUB_INTERNSHIP','AWAY_ROTATION','CLINICAL_ELECTIVE'].includes(l)).join('/')} lane` };
    }
    return { audienceClass: 'UNKNOWN_HOLD', studentVsGraduate: 'UNKNOWN', confidence: 'LOW', rationale: 'VMS lane but quote has ambiguous audience signals' };
  }

  return { audienceClass: 'UNKNOWN_HOLD', studentVsGraduate: 'UNKNOWN', confidence: 'LOW', rationale: 'insufficient signals to classify audience' };
}

// ── Main ───────────────────────────────────────────────────────────────────

function main(): void {
  for (const p of [TRIAGE_PATH, QUEUE_PATH]) {
    if (!existsSync(p)) throw new Error(`Missing: ${p}\nRun preceding scripts first.`);
  }

  const triage = JSON.parse(readFileSync(TRIAGE_PATH, 'utf8')) as SourcePageTriageFile;
  const queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf8')) as { entries: Array<{ sourceUrl: string; lane: string; sourceQuote: string; institutionId: string; institutionName: string }> };

  // Build quote index by canonical URL
  const quoteByUrl = new Map<string, { lanes: string[]; quotes: string[] }>();
  for (const e of queue.entries) {
    const canon = e.sourceUrl.replace(/\/$/, '').toLowerCase();
    const rec = quoteByUrl.get(canon) ?? { lanes: [], quotes: [] };
    rec.lanes.push(e.lane);
    if (e.sourceQuote && e.sourceQuote !== 'NOT_STATED_ON_SOURCE') rec.quotes.push(e.sourceQuote);
    quoteByUrl.set(canon, rec);
  }

  // Classify pages that are INCLUDE or HOLD (skip hard REJECT)
  const CLASSIFY_DECISIONS: TriageDecision[] = [
    'INCLUDE_USCE_OPPORTUNITY', 'HOLD_SCOPE_AMBIGUITY',
    'HOLD_AUDIENCE_AMBIGUITY', 'HOLD_NEEDS_MORE_EVIDENCE',
  ];

  const classifications: AudienceClassification[] = [];
  const audienceCounts: Partial<Record<AudienceClass, number>> = {};
  const svgCounts: Partial<Record<StudentVsGraduate, number>> = {};

  for (const page of triage.pages) {
    if (!CLASSIFY_DECISIONS.includes(page.decision)) continue;

    const rec = quoteByUrl.get(page.canonicalUrl) ?? { lanes: page.usceLanes, quotes: [page.topQuote] };
    const allQuote = rec.quotes.join(' ');
    const uniqueLanes = [...new Set(rec.lanes)];
    const { audienceClass, studentVsGraduate, confidence, rationale } = classifyFromLane(uniqueLanes, allQuote);

    audienceCounts[audienceClass] = (audienceCounts[audienceClass] ?? 0) + 1;
    svgCounts[studentVsGraduate] = (svgCounts[studentVsGraduate] ?? 0) + 1;

    classifications.push({
      sourceUrl: page.sourceUrl,
      canonicalUrl: page.canonicalUrl,
      institutionId: page.institutionId,
      institutionName: page.institutionName,
      audienceClass,
      studentVsGraduate,
      audienceConfidence: confidence,
      audienceRationale: rationale,
      usceLanes: page.usceLanes,
      triageDecision: page.decision,
    });
  }

  const output: AudienceClassifiedFile = {
    generatedAt: new Date().toISOString(),
    totalClassified: classifications.length,
    audienceCounts: audienceCounts as Record<AudienceClass, number>,
    studentVsGraduateCounts: svgCounts as Record<StudentVsGraduate, number>,
    classifications,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n');

  console.log('P102 USCE audience classifier');
  console.log(`  classified: ${classifications.length} pages`);
  console.log('');
  console.log('  Audience breakdown:');
  for (const [k, v] of Object.entries(audienceCounts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))) {
    console.log(`    ${k.padEnd(40)} ${v}`);
  }
  console.log('');
  console.log('  Student vs Graduate:');
  for (const [k, v] of Object.entries(svgCounts)) {
    console.log(`    ${k.padEnd(20)} ${v}`);
  }
  console.log('');
  console.log(`  written: ${OUTPUT_PATH}`);
}

main();
