#!/usr/bin/env tsx
/**
 * P102 Per-Listing USCE Classifier — type-aware, evidence-based.
 *
 * Replaces the prior "INVALID_NOT_USCE_SOURCE" framing that
 * batch-condemned URLs. Applies the operator's 11-state taxonomy
 * per programType:
 *
 *   Clinical USCE (observership/elective/clerkship/sub-I/externship/INTL):
 *     DIRECT_TRUE_USCE_LINK
 *     MOVED_REORIENTED_TO_TRUE_USCE_LINK
 *     BORDERLINE_KEEP_REVERIFY
 *     PROTECTED_BROWSER_REQUIRED
 *     NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE
 *     NO_PROGRAM_FOUND_HIDE
 *     BROKEN_REQUIRES_MANUAL_BROWSER
 *
 *   Research / postdoc (different standard):
 *     RESEARCH_DIRECT_PROGRAM
 *     RESEARCH_VALID_INSTITUTIONAL_PATHWAY
 *     RESEARCH_GENERIC_BUT_ACCEPTABLE
 *     RESEARCH_TOO_GENERIC_REVERIFY
 *
 * Evidence sources (in priority order):
 *   1. prisma/listings-hidelist.ts — explicit hide
 *   2. prisma/verified-links.ts — operator URL override + verified flag
 *   3. exact_seed_run_report.json — prior runner result for the URL
 *   4. Heuristic URL pattern + program.description text
 *
 * Outputs:
 *   exports/live_listings_classification.json
 *   exports/live_listings_classification_summary.md
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { VERIFIED_LINKS } from '../prisma/verified-links';
import { HIDDEN_PROGRAMS, isHidden } from '../prisma/listings-hidelist';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');
const DATA_JS = '/Users/shelly/usmle-observerships/data.js';

const OUT_JSON = path.join(EXPORTS, 'live_listings_classification.json');
const OUT_MD = path.join(EXPORTS, 'live_listings_classification_summary.md');

// ── Types ──────────────────────────────────────────────────────────────────

type Classification =
  // Clinical USCE
  | 'DIRECT_TRUE_USCE_LINK'
  | 'MOVED_REORIENTED_TO_TRUE_USCE_LINK'
  | 'BORDERLINE_KEEP_REVERIFY'
  | 'PROTECTED_BROWSER_REQUIRED'
  | 'NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE'
  | 'NO_PROGRAM_FOUND_HIDE'
  | 'BROKEN_REQUIRES_MANUAL_BROWSER'
  // Research
  | 'RESEARCH_DIRECT_PROGRAM'
  | 'RESEARCH_VALID_INSTITUTIONAL_PATHWAY'
  | 'RESEARCH_GENERIC_BUT_ACCEPTABLE'
  | 'RESEARCH_TOO_GENERIC_REVERIFY';

type SubType =
  | 'observership'
  | 'visiting-student-elective'
  | 'visiting-student-clerkship'
  | 'sub-internship'
  | 'externship'
  | 'international-visiting-student'
  | 'research-postdoc'
  | 'multi-rotation';

interface Program {
  name: string;
  type: string;
  location: string;
  state: string;
  link: string;
  description: string;
  specialties?: string;
  fee?: string;
  duration?: string;
}

interface Row {
  listingTitle: string;
  institution: string;
  state: string;
  currentUrl: string;
  finalUrl: string;
  programType: string;
  subType: SubType;
  audience: string;
  classification: Classification;
  evidenceQuote: string;
  sourceStatus: string;
  actionTaken: string;
  reason: string;
  countsAsTrueUSCE: boolean;
  countsAsResearch: boolean;
  needsManualBrowser: boolean;
  hasVerifiedOverride: boolean;
  isHidden: boolean;
  priorRunnerStatus: string;
  notes: string;
}

// ── Parse data.js ──────────────────────────────────────────────────────────

function parsePrograms(): Program[] {
  const t = readFileSync(DATA_JS, 'utf8');
  const m = t.match(/const PROGRAMS = \[([\s\S]*?)\];/);
  if (!m) throw new Error('Could not parse PROGRAMS from data.js');
  // eslint-disable-next-line no-eval
  return eval('[' + m[1] + ']');
}

// ── Load prior runner evidence ─────────────────────────────────────────────

interface RunnerResult { runStatus: string; finalStatus: string; fetchHttpStatus?: number; fetchError?: string; }

function loadPriorRunnerEvidence(): Map<string, RunnerResult> {
  // Map sourceUrl → runner result for any seed where we've previously
  // fetched and classified.
  const map = new Map<string, RunnerResult>();
  const reportPath = path.join(EXPORTS, 'exact_seed_run_report.json');
  if (!existsSync(reportPath)) return map;
  try {
    const r = JSON.parse(readFileSync(reportPath, 'utf8'));
    // Build URL → runner-status from per-seed results
    const csvPath = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/queues/p102_reorientation_candidates.csv');
    if (existsSync(csvPath)) {
      const lines = readFileSync(csvPath, 'utf8').split('\n').filter(l => l.trim());
      const hdr = lines[0].split(',');
      const sIdx = hdr.indexOf('seedId');
      const uIdx = hdr.indexOf('sourceUrl');
      const seedToUrl = new Map<string, string>();
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(',');
        seedToUrl.set(cells[sIdx], cells[uIdx]);
      }
      for (const sr of (r.seedResults ?? [])) {
        const url = seedToUrl.get(sr.seedId);
        if (url) map.set(url, { runStatus: sr.runStatus, finalStatus: sr.finalStatus, fetchHttpStatus: sr.fetchHttpStatus, fetchError: sr.fetchError });
      }
    }
  } catch { /* ignore */ }
  return map;
}

// ── SubType derivation ─────────────────────────────────────────────────────

function deriveSubType(p: Program, finalUrl: string): SubType {
  const desc = (p.description || '').toLowerCase();
  const nameLow = p.name.toLowerCase();
  const url = finalUrl.toLowerCase();
  if (p.type === 'research') return 'research-postdoc';
  if (/sub.?intern|acting.?intern/.test(desc) || /sub.?intern|acting.?intern/.test(url)) return 'sub-internship';
  if (/extern(ship)?/.test(desc) && !/observership/.test(desc)) return 'externship';
  if (/international (medical )?student|intl (medical )?student/.test(desc) || /international[_-]?(visiting|medical)/.test(url)) return 'international-visiting-student';
  if (/clerkship/.test(desc) || /clerkship/.test(url)) return 'visiting-student-clerkship';
  if (/visiting (medical )?student|elective/.test(desc) || /visiting[_-]?stud|elective/.test(url)) return 'visiting-student-elective';
  if (/multi.?site|multi.?rotation/.test(nameLow) || p.type === 'rotation') return 'multi-rotation';
  return 'observership';
}

// ── Negative-info detection ────────────────────────────────────────────────

function isNegativeInfo(p: Program): boolean {
  const t = (p.description || '').toLowerCase();
  // Phrases used in data.js to flag programs that don't actually offer USCE
  return /does not offer|do not offer|no longer offers?|currently not (offered|accepting)|not available|cannot offer|does not provide/i.test(t)
    && !/(application|elective|clerkship|observership|residency) (process|application|criteria)/i.test(t);
}

// ── URL pattern strength ───────────────────────────────────────────────────

function urlHasDirectUSCESignal(url: string): boolean {
  return /\/(observ(ership)?s?|visiting[_-]?[a-z]*[_-]?stud|elective|clerkship|extern(ship)?|sub[_-]?intern|acting[_-]?intern|international[_-]?(visiting|medical)|medical[_-]students?|visitor[_-]?program|academic[_-]?visitor|md[_-]?program\/visiting|vslo|vsas)/i.test(url);
}

function urlIsHomepage(url: string): boolean {
  try {
    const u = new URL(url);
    const p = u.pathname.replace(/\/$/, '');
    return p === '' || p === '/' || p === '/index' || /^\/index\.(html?|php|asp)$/i.test(p);
  } catch { return false; }
}

function urlIsResearchPathway(url: string): boolean {
  return /\/(research|postdoc(toral)?|fellowship|training[_-]program|career[_-]development|scholar|lerner|institute)/i.test(url);
}

// ── Audience derivation (simple) ──────────────────────────────────────────

function deriveAudience(p: Program, sub: SubType): string {
  const t = (p.description || '').toLowerCase();
  if (sub === 'research-postdoc') return 'researcher';
  if (sub === 'international-visiting-student') return 'international-medical-student';
  if (/img|international medical grad|foreign medical grad|ecfmg|graduate physician/.test(t)) return 'img-graduate';
  if (/visiting (medical )?student|us medical student|lcme|coca/.test(t)) return 'us-medical-student';
  if (sub === 'observership' || sub === 'externship') return 'img-graduate';
  if (sub === 'visiting-student-elective' || sub === 'visiting-student-clerkship' || sub === 'sub-internship') return 'us-medical-student';
  return 'unknown';
}

// ── Main classifier ───────────────────────────────────────────────────────

function classify(p: Program, runnerEvidence: Map<string, RunnerResult>): Row {
  const verified = VERIFIED_LINKS[p.name];
  const finalUrl = verified?.url ?? p.link;
  const sub = deriveSubType(p, finalUrl);
  const isResearch = sub === 'research-postdoc';
  const prior = runnerEvidence.get(finalUrl);
  const priorStatus = prior ? `${prior.runStatus}/${prior.finalStatus}${prior.fetchHttpStatus ? ` (HTTP ${prior.fetchHttpStatus})` : ''}` : 'not-yet-fetched';

  // 1. Hide-list override
  if (isHidden(p.name)) {
    const h = HIDDEN_PROGRAMS[p.name];
    return baseRow(p, finalUrl, sub, 'NO_PROGRAM_FOUND_HIDE', `Hidden in listings-hidelist: ${h.reason}`, h.reason, priorStatus, { counts: false, research: false, browser: false, override: !!verified, hidden: true });
  }

  // 2. Negative informational row
  if (isNegativeInfo(p)) {
    return baseRow(p, finalUrl, sub, 'NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE', `Description indicates institution does NOT offer USCE: '${(p.description||'').slice(0,140)}'`, 'institution-says-no', priorStatus, { counts: false, research: false, browser: false, override: !!verified, hidden: false });
  }

  // 3. Research: apply research standard
  if (isResearch) {
    if (verified?.verified) {
      return baseRow(p, finalUrl, sub, 'RESEARCH_DIRECT_PROGRAM', `Operator-verified research URL`, verified.note ?? '', priorStatus, { counts: false, research: true, browser: false, override: true, hidden: false });
    }
    if (urlIsResearchPathway(finalUrl)) {
      return baseRow(p, finalUrl, sub, 'RESEARCH_VALID_INSTITUTIONAL_PATHWAY', `URL is institutional research pathway page (postdoc/lerner/research/training)`, '', priorStatus, { counts: false, research: true, browser: false, override: !!verified, hidden: false });
    }
    if (urlIsHomepage(finalUrl)) {
      return baseRow(p, finalUrl, sub, 'RESEARCH_TOO_GENERIC_REVERIFY', `Research listing pointing at institution homepage — operator can supply deeper research-office URL`, '', priorStatus, { counts: false, research: false, browser: false, override: !!verified, hidden: false });
    }
    return baseRow(p, finalUrl, sub, 'RESEARCH_GENERIC_BUT_ACCEPTABLE', `Research listing with non-homepage URL; institutional research entry-point is valid for research (different standard from clinical USCE)`, '', priorStatus, { counts: false, research: true, browser: false, override: !!verified, hidden: false });
  }

  // 4. Clinical USCE: apply strict standard
  // 4a. Protected (Cloudflare 403)
  if (prior && prior.runStatus === 'FAILED_FETCH' && prior.fetchHttpStatus === 403) {
    return baseRow(p, finalUrl, sub, 'PROTECTED_BROWSER_REQUIRED', `Cloudflare 403 to bot fetchers — page exists; works in a real browser`, 'kept', priorStatus, { counts: true, research: false, browser: true, override: !!verified, hidden: false });
  }
  // 4b. Broken / hard failure (network dead)
  if (prior && prior.runStatus === 'FAILED_FETCH' && prior.fetchHttpStatus !== 403) {
    return baseRow(p, finalUrl, sub, 'BROKEN_REQUIRES_MANUAL_BROWSER', `Runner FAILED_FETCH (${prior.fetchHttpStatus ?? prior.fetchError ?? 'unknown'}); verify with browser`, 'manual-check-needed', priorStatus, { counts: false, research: false, browser: true, override: !!verified, hidden: false });
  }
  // 4c. Operator-verified link
  if (verified?.verified) {
    return baseRow(p, finalUrl, sub, urlHasDirectUSCESignal(finalUrl) ? 'DIRECT_TRUE_USCE_LINK' : 'MOVED_REORIENTED_TO_TRUE_USCE_LINK', `Operator-verified${urlHasDirectUSCESignal(finalUrl) ? ' direct USCE' : ' (institutional pathway)'} URL`, verified.note ?? '', priorStatus, { counts: true, research: false, browser: false, override: true, hidden: false });
  }
  // 4d. Runner AUTO_PROMOTE'd this URL
  if (prior && prior.finalStatus === 'AUTO_PROMOTE') {
    return baseRow(p, finalUrl, sub, urlHasDirectUSCESignal(finalUrl) ? 'DIRECT_TRUE_USCE_LINK' : 'MOVED_REORIENTED_TO_TRUE_USCE_LINK', `Runner AUTO_PROMOTE'd this URL`, 'runner-validated', priorStatus, { counts: true, research: false, browser: false, override: false, hidden: false });
  }
  // 4e. URL has direct USCE signal even without explicit verification
  if (urlHasDirectUSCESignal(finalUrl)) {
    return baseRow(p, finalUrl, sub, 'DIRECT_TRUE_USCE_LINK', `URL path contains direct USCE signal (observership/elective/clerkship/visiting-student/etc.)`, '', priorStatus, { counts: true, research: false, browser: false, override: false, hidden: false });
  }
  // 4f. Homepage / very generic — keep but reverify
  if (urlIsHomepage(finalUrl)) {
    return baseRow(p, finalUrl, sub, 'BORDERLINE_KEEP_REVERIFY', `Institution homepage URL — needs deeper page; operator can reorient via verified-links.ts`, '', priorStatus, { counts: false, research: false, browser: false, override: !!verified, hidden: false });
  }
  // 4g. Some path but no direct USCE signal
  return baseRow(p, finalUrl, sub, 'BORDERLINE_KEEP_REVERIFY', `URL is institutional but path lacks direct USCE keyword — keep and reverify with browser`, '', priorStatus, { counts: false, research: false, browser: false, override: !!verified, hidden: false });
}

function baseRow(
  p: Program,
  finalUrl: string,
  sub: SubType,
  c: Classification,
  reason: string,
  evidenceQuote: string,
  priorStatus: string,
  flags: { counts: boolean; research: boolean; browser: boolean; override: boolean; hidden: boolean },
): Row {
  return {
    listingTitle: p.name,
    institution: p.name,
    state: p.state || '',
    currentUrl: p.link,
    finalUrl,
    programType: p.type,
    subType: sub,
    audience: deriveAudience(p, sub),
    classification: c,
    evidenceQuote: (evidenceQuote || '').slice(0, 300),
    sourceStatus: priorStatus,
    actionTaken: flags.hidden ? 'hidden' : flags.override ? 'verified-link-override' : 'kept-as-is',
    reason,
    countsAsTrueUSCE: flags.counts,
    countsAsResearch: flags.research,
    needsManualBrowser: flags.browser,
    hasVerifiedOverride: flags.override,
    isHidden: flags.hidden,
    priorRunnerStatus: priorStatus,
    notes: '',
  };
}

// ── Counting + report ─────────────────────────────────────────────────────

function buildReport(rows: Row[]): string {
  const trueObservership = rows.filter(r => r.countsAsTrueUSCE && r.subType === 'observership').length;
  const trueVME = rows.filter(r => r.countsAsTrueUSCE && (r.subType === 'visiting-student-elective' || r.subType === 'visiting-student-clerkship')).length;
  const trueSubI = rows.filter(r => r.countsAsTrueUSCE && r.subType === 'sub-internship').length;
  const trueExtern = rows.filter(r => r.countsAsTrueUSCE && r.subType === 'externship').length;
  const trueIntl = rows.filter(r => r.countsAsTrueUSCE && r.subType === 'international-visiting-student').length;
  const trueMulti = rows.filter(r => r.countsAsTrueUSCE && r.subType === 'multi-rotation').length;
  const trueTotal = rows.filter(r => r.countsAsTrueUSCE).length;

  const researchDirect = rows.filter(r => r.classification === 'RESEARCH_DIRECT_PROGRAM').length;
  const researchValid = rows.filter(r => r.classification === 'RESEARCH_VALID_INSTITUTIONAL_PATHWAY').length;
  const researchGeneric = rows.filter(r => r.classification === 'RESEARCH_GENERIC_BUT_ACCEPTABLE').length;
  const researchReverify = rows.filter(r => r.classification === 'RESEARCH_TOO_GENERIC_REVERIFY').length;
  const researchCounted = researchDirect + researchValid + researchGeneric;

  const negInfo = rows.filter(r => r.classification === 'NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE').length;
  const hidden = rows.filter(r => r.classification === 'NO_PROGRAM_FOUND_HIDE').length;
  const protectedRows = rows.filter(r => r.classification === 'PROTECTED_BROWSER_REQUIRED').length;
  const borderline = rows.filter(r => r.classification === 'BORDERLINE_KEEP_REVERIFY').length;
  const broken = rows.filter(r => r.classification === 'BROKEN_REQUIRES_MANUAL_BROWSER').length;

  const directExact = rows.filter(r => r.classification === 'DIRECT_TRUE_USCE_LINK').length;
  const reoriented = rows.filter(r => r.classification === 'MOVED_REORIENTED_TO_TRUE_USCE_LINK').length;
  const genericKept = borderline + researchReverify + researchGeneric;
  const deadHidden = hidden;
  const manualNeeded = protectedRows + broken;

  return [
    `# P102 Live Listings — Per-Listing Classification`,
    ``,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    `Programs classified: ${rows.length} (from data.js)`,
    ``,
    `## TRUE_USCE_COUNT`,
    `- Observership:                       ${trueObservership}`,
    `- Visiting student elective/clerkship: ${trueVME}`,
    `- Sub-I / acting internship:          ${trueSubI}`,
    `- Externship:                         ${trueExtern}`,
    `- International visiting student:     ${trueIntl}`,
    `- Multi-site rotation:                ${trueMulti}`,
    `- **Total true USCE:                  ${trueTotal}**`,
    ``,
    `## RESEARCH_COUNT`,
    `- Research direct program:            ${researchDirect}`,
    `- Research valid institutional:       ${researchValid}`,
    `- Research generic but acceptable:    ${researchGeneric}`,
    `- Research too generic (reverify):    ${researchReverify}`,
    `- **Total counted research:           ${researchCounted}**`,
    ``,
    `## NOT_COUNTED_AS_TRUE_USCE`,
    `- Negative informational rows:        ${negInfo}`,
    `- Hidden / no program found:          ${hidden}`,
    `- Protected / manual browser needed:  ${protectedRows}`,
    `- Borderline keep/reverify:           ${borderline}`,
    `- Broken / manual browser needed:     ${broken}`,
    ``,
    `## LINK_STATUS`,
    `- Direct exact official links:        ${directExact}`,
    `- Reoriented moved links:             ${reoriented}`,
    `- Generic but kept:                   ${genericKept}`,
    `- Dead hidden:                        ${deadHidden}`,
    `- Failed / browser-manual needed:     ${manualNeeded}`,
    ``,
    `## Per-classification breakdown`,
    ``,
    `| Classification | Count |`,
    `|---|---:|`,
    ...classCounts(rows).map(([c, n]) => `| ${c} | ${n} |`),
  ].join('\n');
}

function classCounts(rows: Row[]): Array<[string, number]> {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.classification, (m.get(r.classification) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

// ── Main ───────────────────────────────────────────────────────────────────

function main(): void {
  const programs = parsePrograms();
  const runnerEvidence = loadPriorRunnerEvidence();
  const rows = programs.map(p => classify(p, runnerEvidence));

  writeFileSync(OUT_JSON, JSON.stringify({ generatedAt: new Date().toISOString(), totalListings: rows.length, rows }, null, 2) + '\n');

  const md = buildReport(rows);
  writeFileSync(OUT_MD, md + '\n');

  console.log(md);
  console.log('');
  console.log(`written: ${OUT_JSON}`);
  console.log(`         ${OUT_MD}`);
}

main();
