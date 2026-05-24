#!/usr/bin/env tsx
/**
 * P102 Phase E — Direct USCE Link Validator.
 *
 * Determines whether a source URL is a direct official opportunity page
 * (a page specifically about a USCE program) or a generic landing page
 * that mentions USCE only incidentally.
 *
 * Status:
 *   VALID_DIRECT_USCE_SOURCE  — URL path or quote confirms this is an
 *                               opportunity-specific page
 *   GENERIC_PAGE_HOLD         — USCE content present but page is a generic
 *                               landing; campus/program not directly confirmed
 *   INDIRECT_THIRD_PARTY      — URL is a third-party aggregator or redirect
 *   INVALID_NOT_USCE_SOURCE   — does not describe a USCE opportunity
 *
 * Usage:
 *   npx tsx scripts/p102-validate-direct-usce-links.ts [--all-existing-p102-runs]
 *
 * Reads:  exports/source_page_triage.json
 *         exports/usce_audience_classified.json
 * Writes: exports/direct_link_validation.json
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { type SourcePageTriageFile } from './p102-triage-source-pages.js';
import { type AudienceClassifiedFile } from './p102-classify-usce-audience.js';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');
const TRIAGE_PATH = path.join(EXPORTS_DIR, 'source_page_triage.json');
const AUDIENCE_PATH = path.join(EXPORTS_DIR, 'usce_audience_classified.json');
const OUTPUT_PATH = path.join(EXPORTS_DIR, 'direct_link_validation.json');

// ── Types ──────────────────────────────────────────────────────────────────

export type DirectLinkStatus =
  | 'VALID_DIRECT_USCE_SOURCE'
  | 'GENERIC_PAGE_HOLD'
  | 'INDIRECT_THIRD_PARTY'
  | 'INVALID_NOT_USCE_SOURCE';

export interface DirectLinkResult {
  sourceUrl: string;
  canonicalUrl: string;
  institutionId: string;
  institutionName: string;
  directLinkStatus: DirectLinkStatus;
  directLinkReason: string;
  signals: string[];
  urlPathDepth: number;
}

export interface DirectLinkValidationFile {
  generatedAt: string;
  totalValidated: number;
  statusCounts: Record<DirectLinkStatus, number>;
  results: DirectLinkResult[];
}

// ── URL signal sets ────────────────────────────────────────────────────────

// Strong URL path signals — page is specifically about a USCE program
const STRONG_URL_SIGNALS: Array<[RegExp, string]> = [
  [/\/observ(ership)?s?\b/i,                        'observership URL segment'],
  [/\/visiting[_-]?stud/i,                           'visiting-student URL segment'],
  [/\/extern(ship)?s?\b/i,                           'externship URL segment'],
  [/\/(clinical[_-]?)?elective/i,                    'elective URL segment'],
  [/\/clerkship/i,                                   'clerkship URL segment'],
  [/\/vslo|\/vsas/i,                                 'VSLO/VSAS URL segment'],
  [/\/(away|acting)[_-]?rotation/i,                  'away/acting rotation URL segment'],
  [/\/sub[_-]?intern/i,                              'sub-internship URL segment'],
  [/\/acting[_-]?intern/i,                           'acting internship URL segment'],
  [/\/international[_-]?visiting/i,                  'international visiting URL segment'],
  [/\/international[_-]?(medical[_-]?)?student/i,    'international student URL segment'],
  [/\/img[_-]?program/i,                             'IMG program URL segment'],
  [/\/medical[_-]?student[_-]?(program|rotation)/i,  'medical student program URL segment'],
];

// Strong quote signals — quote directly describes the opportunity
const STRONG_QUOTE_SIGNALS: Array<[RegExp, string]> = [
  [/\b(apply|application|how to apply|apply (online|here|now))\b/i, 'application language in quote'],
  [/\b(fee|cost|\$\d+|free of charge|no (application )?fee)\b/i,   'cost/fee language in quote'],
  [/\b(\d+(-|\s)week|weeks? (rotation|program|elective)|duration)\b/i, 'duration in quote'],
  [/\b(eligib|requirement|prerequisite|must have|must be)\b/i,     'eligibility language in quote'],
  [/\b(VSLO|VSAS|AAMC|LCME|ECFMG)\b/i,                            'program-specific abbreviation in quote'],
  [/\b(coordinator|program director|contact .+@|@[\w.-]+\.\w{2,})\b/i, 'contact information in quote'],
  [/\b(accept(s|ing)?|welcome|open to|available to) (visiting|international|IMG)\b/i, 'explicit acceptance language'],
  [/\b(submit|upload|letter of rec|CV required|transcript)\b/i,    'application document requirement'],
];

// Weak signals — confirm USCE content but do not confirm it's the primary purpose
const GENERIC_URL_PATTERNS: Array<[RegExp, string]> = [
  [/\/education\/?$/i,                 'generic /education URL'],
  [/\/medical-education\/?$/i,         'generic /medical-education URL'],
  [/\/academics\/?$/i,                 'generic /academics URL'],
  [/\/training\/?$/i,                  'generic /training URL'],
  [/\/graduate\/?$/i,                  'generic /graduate URL'],
  [/\/undergraduate\/?$/i,             'generic /undergraduate URL'],
  [/\/programs?\/?$/i,                 'generic /programs URL'],
  [/\/about\/?$/i,                     'generic /about URL'],
  [/\/(index|home|main)\.(html?|php|asp)\/?$/i, 'index/home page URL'],
];

// Third-party / aggregator signals
const THIRD_PARTY_RE = /\b(freida|doximity|indeed|glassdoor|linkedin|ziprecruiter|studentdoctor|usmle.?forum|reddit\.com)\b/i;

// ── Logic ──────────────────────────────────────────────────────────────────

function validateDirectLink(url: string, topQuote: string): {
  status: DirectLinkStatus;
  reason: string;
  signals: string[];
} {
  const signals: string[] = [];

  // Third-party check
  if (THIRD_PARTY_RE.test(url)) {
    return { status: 'INDIRECT_THIRD_PARTY', reason: 'third-party or aggregator URL', signals };
  }

  // URL depth: very shallow paths (depth 0-1) are generic
  let urlPath = '';
  try {
    urlPath = new URL(url).pathname;
  } catch {
    urlPath = url.replace(/^https?:\/\/[^/]+/, '');
  }
  const depth = urlPath.split('/').filter(Boolean).length;

  // Check strong URL signals
  for (const [re, label] of STRONG_URL_SIGNALS) {
    if (re.test(urlPath)) {
      signals.push(label);
    }
  }

  // Check strong quote signals
  for (const [re, label] of STRONG_QUOTE_SIGNALS) {
    if (re.test(topQuote)) {
      signals.push(label);
    }
  }

  // Check generic URL patterns
  const genericUrlMatches: string[] = [];
  for (const [re, label] of GENERIC_URL_PATTERNS) {
    if (re.test(urlPath)) genericUrlMatches.push(label);
  }

  const strongUrlCount = signals.filter(s => s.includes('URL segment')).length;
  const strongQuoteCount = signals.filter(s => !s.includes('URL segment')).length;

  // Strong URL signal → VALID
  if (strongUrlCount >= 1) {
    return {
      status: 'VALID_DIRECT_USCE_SOURCE',
      reason: `direct USCE URL signal: ${signals.filter(s => s.includes('URL segment')).join(', ')}`,
      signals,
    };
  }

  // Generic URL pattern → HOLD unless quote has 2+ strong signals
  if (genericUrlMatches.length > 0 && strongQuoteCount < 2) {
    return {
      status: 'GENERIC_PAGE_HOLD',
      reason: `generic landing page URL (${genericUrlMatches[0]}) with insufficient quote evidence`,
      signals: [...signals, ...genericUrlMatches],
    };
  }

  // Shallow URL depth (≤1) with no strong signals → likely homepage/landing
  if (depth <= 1 && signals.length === 0) {
    return {
      status: 'GENERIC_PAGE_HOLD',
      reason: `very shallow URL depth (${depth}) with no direct-opportunity signals`,
      signals,
    };
  }

  // Good quote evidence even without perfect URL
  if (strongQuoteCount >= 2) {
    return {
      status: 'VALID_DIRECT_USCE_SOURCE',
      reason: `strong quote evidence (${strongQuoteCount} signals) confirms direct opportunity page`,
      signals,
    };
  }

  // Some evidence but not enough to confirm
  if (signals.length > 0) {
    return {
      status: 'GENERIC_PAGE_HOLD',
      reason: `some USCE evidence but insufficient to confirm direct opportunity page (${signals.length} signals)`,
      signals,
    };
  }

  return { status: 'INVALID_NOT_USCE_SOURCE', reason: 'no direct-opportunity URL or quote signals found', signals };
}

// ── Main ───────────────────────────────────────────────────────────────────

function main(): void {
  for (const p of [TRIAGE_PATH, AUDIENCE_PATH]) {
    if (!existsSync(p)) throw new Error(`Missing: ${p}`);
  }

  const triage = JSON.parse(readFileSync(TRIAGE_PATH, 'utf8')) as SourcePageTriageFile;
  const audience = JSON.parse(readFileSync(AUDIENCE_PATH, 'utf8')) as AudienceClassifiedFile;

  // Build audience index
  const audByUrl = new Map(audience.classifications.map(c => [c.canonicalUrl, c]));

  const results: DirectLinkResult[] = [];
  const statusCounts: Partial<Record<DirectLinkStatus, number>> = {};

  for (const page of triage.pages) {
    // Validate all non-hard-rejected pages
    if (['REJECT_CAREERS_JOBS_ONLY', 'REJECT_PATIENT_FACING'].includes(page.decision)) continue;
    if (page.decision.startsWith('REJECT_') && !page.decision.includes('DIRECT_LINK') && !page.decision.includes('GENERIC')) {
      // Include in validation output for completeness but mark as INVALID
      results.push({
        sourceUrl: page.sourceUrl,
        canonicalUrl: page.canonicalUrl,
        institutionId: page.institutionId,
        institutionName: page.institutionName,
        directLinkStatus: 'INVALID_NOT_USCE_SOURCE',
        directLinkReason: `pre-rejected by triage: ${page.decision}`,
        signals: [],
        urlPathDepth: 0,
      });
      statusCounts['INVALID_NOT_USCE_SOURCE'] = (statusCounts['INVALID_NOT_USCE_SOURCE'] ?? 0) + 1;
      continue;
    }

    const { status, reason, signals } = validateDirectLink(page.sourceUrl, page.topQuote);
    statusCounts[status] = (statusCounts[status] ?? 0) + 1;

    let depth = 0;
    try {
      depth = new URL(page.sourceUrl).pathname.split('/').filter(Boolean).length;
    } catch { /* ignore */ }

    results.push({
      sourceUrl: page.sourceUrl,
      canonicalUrl: page.canonicalUrl,
      institutionId: page.institutionId,
      institutionName: audByUrl.get(page.canonicalUrl)?.institutionName ?? page.institutionName,
      directLinkStatus: status,
      directLinkReason: reason,
      signals,
      urlPathDepth: depth,
    });
  }

  const output: DirectLinkValidationFile = {
    generatedAt: new Date().toISOString(),
    totalValidated: results.length,
    statusCounts: statusCounts as Record<DirectLinkStatus, number>,
    results,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n');

  console.log('P102 direct-link validator');
  console.log(`  validated: ${results.length} pages`);
  console.log('');
  console.log('  Status breakdown:');
  for (const [k, v] of Object.entries(statusCounts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))) {
    console.log(`    ${k.padEnd(35)} ${v}`);
  }
  console.log('');
  console.log(`  written: ${OUTPUT_PATH}`);
}

main();
