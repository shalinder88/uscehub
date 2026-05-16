#!/usr/bin/env tsx
/**
 * P102 Phase C — Page-Level Triage.
 *
 * Reads the consolidated review queue and makes ONE triage decision per
 * unique source URL. This is the first intelligent gate: it stops obvious
 * non-USCE pages from ever reaching the reviewer.
 *
 * Decision hierarchy (first matching rule wins):
 *   1. REJECT_PHARMACY_OR_ALLIED_HEALTH — pharmacy/dental/nursing/P1-P4 signal
 *   2. REJECT_PATIENT_FACING            — patient-portal/conditions/appointments URL
 *   3. REJECT_GME_ONLY                  — only residency/fellowship/GME claims, no USCE
 *   4. REJECT_RESIDENCY_FELLOWSHIP_ONLY — subset of above, more specific label
 *   5. REJECT_CAREERS_JOBS_ONLY         — only careers/jobs/physician-services
 *   6. REJECT_RESEARCH_ONLY             — only research, no student access signal
 *   7. REJECT_GENERIC_EDUCATION_NO_OPP  — generic education page, no program signal
 *   8. REJECT_NO_DIRECT_LINK            — USCE signal but URL/quote too generic
 *   9. HOLD_SCOPE_AMBIGUITY             — USCE content on system/school-level domain
 *  10. HOLD_AUDIENCE_AMBIGUITY          — cannot auto-classify VMS vs IMG
 *  11. INCLUDE_USCE_OPPORTUNITY         — clear USCE opportunity, continue pipeline
 *
 * Usage:
 *   npx tsx scripts/p102-triage-source-pages.ts [--all-existing-p102-runs]
 *
 * Output:
 *   docs/.../p102/exports/source_page_triage.json
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');
const REVIEW_QUEUE_PATH = path.join(EXPORTS_DIR, 'public_safe_review_queue.json');
const OUTPUT_PATH = path.join(EXPORTS_DIR, 'source_page_triage.json');

// ── Types ──────────────────────────────────────────────────────────────────

export type TriageDecision =
  | 'INCLUDE_USCE_OPPORTUNITY'
  | 'REJECT_PHARMACY_OR_ALLIED_HEALTH'
  | 'REJECT_GME_ONLY'
  | 'REJECT_RESIDENCY_FELLOWSHIP_ONLY'
  | 'REJECT_CAREERS_JOBS_ONLY'
  | 'REJECT_PATIENT_FACING'
  | 'REJECT_GENERIC_EDUCATION_NO_OPP'
  | 'REJECT_RESEARCH_ONLY'
  | 'REJECT_NO_DIRECT_LINK'
  | 'REJECT_DUPLICATE_SOURCE'
  | 'HOLD_SCOPE_AMBIGUITY'
  | 'HOLD_AUDIENCE_AMBIGUITY'
  | 'HOLD_NEEDS_MORE_EVIDENCE';

export interface PageTriageResult {
  sourceUrl: string;
  canonicalUrl: string;
  institutionId: string;
  institutionName: string;
  state: string;
  city: string;
  decision: TriageDecision;
  reason: string;
  claimCount: number;
  usceLanes: string[];
  scopes: string[];
  deepFamilies: string[];
  topQuote: string;
  confidence: string;
  runIds: string[];
  claimIds: string[];
}

export interface SourcePageTriageFile {
  generatedAt: string;
  inputQueueCount: number;
  uniqueUrlCount: number;
  decisions: Record<TriageDecision, number>;
  pages: PageTriageResult[];
}

interface RawEntry {
  claimId: string;
  institutionId: string;
  institutionName: string;
  state: string;
  city: string;
  lane: string;
  deepSourceFamily: string | null;
  sourceScope: string;
  confidence: string | null;
  sourceUrl: string;
  sourceQuote: string;
  warnings: string[];
  extractedFromRunId: string;
  visibilityLane: string;
}

// ── Signal sets ────────────────────────────────────────────────────────────

const USCE_LANES = new Set([
  'VISITING_MEDICAL_STUDENT', 'CLINICAL_ELECTIVE', 'IMG_OBSERVERSHIP',
  'INTERNATIONAL_MEDICAL_STUDENT', 'SUB_INTERNSHIP', 'AWAY_ROTATION',
  'INTERNATIONAL_VISITING_STUDENT',
]);

const GME_FAMILIES = new Set([
  'GME', 'RESIDENCY', 'FELLOWSHIP', 'ADVANCED_FELLOWSHIP',
]);

const GME_LANES = new Set([
  'RESIDENCY_PROGRAM_INFO', 'FELLOWSHIP_PROGRAM_INFO', 'ADVANCED_FELLOWSHIP',
]);

const CAREER_FAMILIES = new Set([
  'PHYSICIAN_CAREERS', 'PROVIDER_CAREERS', 'FACULTY_JOBS',
]);

const CAREER_LANES = new Set([
  'CAREERS_PAGE', 'J1_WAIVER_SIGNAL', 'H1B_SPONSORSHIP_SIGNAL',
  'PHYSICIAN_SERVICES', 'DISABILITY_LIFE_INSURANCE_RESOURCE',
  'MALPRACTICE_INSURANCE_RESOURCE',
]);

const RESEARCH_LANES = new Set(['RESEARCH_OPPORTUNITY']);

const SYSTEM_SCHOOL_SCOPES = new Set(['HEALTH_SYSTEM_LEVEL', 'MEDICAL_SCHOOL_LEVEL']);

// Pharmacy / allied-health text patterns
const PHARMACY_RE = /\b(pharmac(y|ist|eutical)|dental|dentistry|nursing\s+student|P[1-4]\s+student|pharm\.?d|pharmacy\s+extern|allied\s+health|radiology\s+tech|phlebotom|dietit|speech.?lang|occupational\s+therap|physical\s+therap)\b/i;

// Patient-facing URL patterns (no clinical opportunity content)
const PATIENT_URL_RE = /\/(patients?|appointments?|conditions?|symptoms?|billing|insurance|visitor|gift.?shop|parking|directions|find.?a.?doctor|physician.?finder)\b/i;

// URL patterns signalling a direct USCE opportunity page
const DIRECT_URL_RE = /\/(observ|visiting.?stud|extern|elective|clerkship|vslo|vsas|rotation|sub.?intern|acting.?intern|international.?stud|international.?medical|img.?program|away.?rotation|medical.?student)\b/i;

// Quote patterns confirming a direct program description
const DIRECT_QUOTE_RE = /\b(observership|visiting (medical )?student|clinical elective|away rotation|sub.?internship|acting internship|VSLO|VSAS|clerkship|international visiting|externship for)\b/i;

// Generic education landing URL (without direct-opportunity specificity)
const GENERIC_URL_RE = /\/(education|academics?|about|programs?|graduate|undergraduate|medical.?education|training)\/?$/i;

// ── Helpers ────────────────────────────────────────────────────────────────

function canonicalUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase();
}

function pickBestQuote(quotes: string[]): string {
  return quotes
    .filter(q => q && q !== 'NOT_STATED_ON_SOURCE')
    .sort((a, b) => b.length - a.length)[0] ?? '';
}

function highestConfidence(confs: Array<string | null>): string {
  if (confs.includes('HIGH')) return 'HIGH';
  if (confs.includes('MEDIUM')) return 'MEDIUM';
  return 'LOW';
}

// ── Triage logic ───────────────────────────────────────────────────────────

function triagePage(url: string, claims: RawEntry[]): { decision: TriageDecision; reason: string } {
  const quotes = claims.map(c => c.sourceQuote || '');
  const allQuoteText = quotes.join(' ');
  const allFamilies = new Set(claims.map(c => c.deepSourceFamily ?? 'null'));
  const allLanes = new Set(claims.map(c => c.lane));
  const allScopes = new Set(claims.map(c => c.sourceScope));

  const hasUsceClain = claims.some(c => USCE_LANES.has(c.lane));
  const hasGmeOnly = [...allLanes].every(l => GME_LANES.has(l) || l === 'NO_PUBLIC_OPPORTUNITY_FOUND');
  const hasCareerOnly = [...allLanes].every(l => CAREER_LANES.has(l) || l === 'NO_PUBLIC_OPPORTUNITY_FOUND');
  const hasResearchOnly = [...allLanes].every(l => RESEARCH_LANES.has(l) || l === 'NO_PUBLIC_OPPORTUNITY_FOUND');
  const isSystemSchool = [...allScopes].some(s => SYSTEM_SCHOOL_SCOPES.has(s));
  const isInstitutionSpecific = allScopes.has('INSTITUTION_SPECIFIC') || allScopes.has('CAMPUS_SPECIFIC') || allScopes.has('DEPARTMENT_LEVEL');

  // 1. Pharmacy / allied-health — highest priority rejection
  if (PHARMACY_RE.test(allQuoteText) || PHARMACY_RE.test(url)) {
    return { decision: 'REJECT_PHARMACY_OR_ALLIED_HEALTH', reason: 'pharmacy/allied-health signal in quote or URL' };
  }

  // 2. Patient-facing URL
  if (PATIENT_URL_RE.test(url)) {
    return { decision: 'REJECT_PATIENT_FACING', reason: 'patient-facing URL pattern — not an opportunity page' };
  }

  // 3–6. Non-USCE lane patterns (only relevant if no USCE claim exists)
  if (!hasUsceClain) {
    if ([...allFamilies].some(f => GME_FAMILIES.has(f as string)) || hasGmeOnly) {
      return { decision: 'REJECT_GME_ONLY', reason: 'only GME/residency/fellowship content — model already classified as future-lane' };
    }
    if (hasCareerOnly || [...allFamilies].some(f => CAREER_FAMILIES.has(f as string))) {
      return { decision: 'REJECT_CAREERS_JOBS_ONLY', reason: 'only careers/jobs/physician-services content' };
    }
    if (hasResearchOnly) {
      return { decision: 'REJECT_RESEARCH_ONLY', reason: 'only research content with no medical-student access signal' };
    }
    return { decision: 'REJECT_GENERIC_EDUCATION_NO_OPP', reason: 'no USCE-lane claims on this page — model found no opportunity' };
  }

  // From here: at least one USCE claim exists.

  // 7. Scope ambiguity — system or school level
  if (isSystemSchool && !isInstitutionSpecific) {
    return { decision: 'HOLD_SCOPE_AMBIGUITY', reason: `USCE content on ${[...allScopes].filter(s => SYSTEM_SCHOOL_SCOPES.has(s)).join('/')} scope — campus applicability not confirmed` };
  }

  // 8. Direct-link check — does the URL or quote actually describe the opportunity?
  const hasDirectUrlSignal = DIRECT_URL_RE.test(url);
  const hasDirectQuoteSignal = DIRECT_QUOTE_RE.test(allQuoteText);
  if (!hasDirectUrlSignal && !hasDirectQuoteSignal) {
    // Generic page: URL like /education and quote has only vague content
    if (GENERIC_URL_RE.test(url)) {
      return { decision: 'REJECT_NO_DIRECT_LINK', reason: 'generic education URL with no direct opportunity signal in URL or quote' };
    }
    // Soft hold if URL is not generic but quote is still vague
    return { decision: 'HOLD_NEEDS_MORE_EVIDENCE', reason: 'USCE lane assigned but URL and quote lack direct-opportunity confirmation' };
  }

  // 9. Audience ambiguity — multiple conflicting lanes with no clear signal
  const usceClains = claims.filter(c => USCE_LANES.has(c.lane));
  const imgClains = usceClains.filter(c => c.lane === 'IMG_OBSERVERSHIP');
  const vmsClains = usceClains.filter(c => ['VISITING_MEDICAL_STUDENT', 'CLINICAL_ELECTIVE', 'SUB_INTERNSHIP', 'AWAY_ROTATION'].includes(c.lane));
  const intlClains = usceClains.filter(c => ['INTERNATIONAL_MEDICAL_STUDENT', 'INTERNATIONAL_VISITING_STUDENT'].includes(c.lane));

  if (imgClains.length > 0 && vmsClains.length > 0 && intlClains.length === 0) {
    // Both VMS and IMG on the same URL — could be a mixed page; include and let audience classifier sort it out
  }

  // 10. System scope with USCE — already caught above, but for mixed scopes:
  if (isSystemSchool) {
    return { decision: 'HOLD_SCOPE_AMBIGUITY', reason: 'USCE content but source scope includes system/school level — campus applicability requires human confirmation' };
  }

  // 11. Clean include
  return { decision: 'INCLUDE_USCE_OPPORTUNITY', reason: 'USCE opportunity confirmed: direct URL/quote signal + institution-specific scope' };
}

// ── Main ───────────────────────────────────────────────────────────────────

function main(): void {
  if (!existsSync(REVIEW_QUEUE_PATH)) {
    throw new Error(`Missing review queue: ${REVIEW_QUEUE_PATH}\nRun: npx tsx scripts/p102-build-public-safe-opportunity-rows.ts`);
  }

  const queue = JSON.parse(readFileSync(REVIEW_QUEUE_PATH, 'utf8')) as {
    entries: RawEntry[];
    count: number;
    generatedAt: string;
  };

  // Group entries by sourceUrl
  const byUrl = new Map<string, RawEntry[]>();
  for (const entry of queue.entries) {
    const canon = canonicalUrl(entry.sourceUrl);
    const arr = byUrl.get(canon) ?? [];
    arr.push(entry);
    byUrl.set(canon, arr);
  }

  const pages: PageTriageResult[] = [];
  const decisionCounts: Record<string, number> = {};

  for (const [canon, claims] of byUrl) {
    const first = claims[0];
    const { decision, reason } = triagePage(canon, claims);
    decisionCounts[decision] = (decisionCounts[decision] ?? 0) + 1;

    pages.push({
      sourceUrl: first.sourceUrl,
      canonicalUrl: canon,
      institutionId: first.institutionId,
      institutionName: first.institutionName,
      state: first.state,
      city: first.city,
      decision,
      reason,
      claimCount: claims.length,
      usceLanes: [...new Set(claims.filter(c => USCE_LANES.has(c.lane)).map(c => c.lane))],
      scopes: [...new Set(claims.map(c => c.sourceScope))],
      deepFamilies: [...new Set(claims.map(c => c.deepSourceFamily ?? 'null'))],
      topQuote: pickBestQuote(claims.map(c => c.sourceQuote)),
      confidence: highestConfidence(claims.map(c => c.confidence)),
      runIds: [...new Set(claims.map(c => c.extractedFromRunId))],
      claimIds: claims.map(c => c.claimId),
    });
  }

  // Sort: INCLUDE first, then HOLD, then REJECT
  const ORDER: TriageDecision[] = [
    'INCLUDE_USCE_OPPORTUNITY',
    'HOLD_SCOPE_AMBIGUITY', 'HOLD_AUDIENCE_AMBIGUITY', 'HOLD_NEEDS_MORE_EVIDENCE',
    'REJECT_NO_DIRECT_LINK', 'REJECT_GENERIC_EDUCATION_NO_OPP',
    'REJECT_PHARMACY_OR_ALLIED_HEALTH', 'REJECT_GME_ONLY',
    'REJECT_RESIDENCY_FELLOWSHIP_ONLY', 'REJECT_CAREERS_JOBS_ONLY',
    'REJECT_PATIENT_FACING', 'REJECT_RESEARCH_ONLY', 'REJECT_DUPLICATE_SOURCE',
  ];
  pages.sort((a, b) => ORDER.indexOf(a.decision) - ORDER.indexOf(b.decision));

  const output: SourcePageTriageFile = {
    generatedAt: new Date().toISOString(),
    inputQueueCount: queue.entries.length,
    uniqueUrlCount: byUrl.size,
    decisions: decisionCounts as Record<TriageDecision, number>,
    pages,
  };

  if (!existsSync(EXPORTS_DIR)) mkdirSync(EXPORTS_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n');

  // Summary
  console.log('P102 page-level triage');
  console.log(`  input entries:  ${queue.entries.length}`);
  console.log(`  unique URLs:    ${byUrl.size}`);
  console.log('');
  console.log('  Decision breakdown:');
  for (const d of ORDER) {
    const n = decisionCounts[d] ?? 0;
    if (n > 0) console.log(`    ${d.padEnd(42)} ${n}`);
  }
  console.log('');
  console.log(`  written: ${OUTPUT_PATH}`);
}

main();
