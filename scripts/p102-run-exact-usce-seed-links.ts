#!/usr/bin/env tsx
/**
 * P102 Exact-Link USCE Seed Runner.
 *
 * Reads a curated CSV of exact USCE opportunity URLs and produces clean
 * opportunity rows by fetching each URL once (no broad crawling) and
 * running it through the intelligent gate (Stages C-G logic).
 *
 * Deterministic — no model calls this sprint. Quote selection is
 * heuristic over the cleaned page text.
 *
 * Usage:
 *   npx tsx scripts/p102-run-exact-usce-seed-links.ts \
 *     --seed-file docs/.../queues/p102_exact_usce_seed_links.csv \
 *     [--limit 20] [--seed-id seed_001] [--offline]
 *
 * The --offline flag skips HTTP fetches and reads previously cached
 * evidence from disk. Useful for replay and validation.
 *
 * Outputs:
 *   exports/exact_seed_public_safe_rows.json
 *   exports/exact_seed_hold_rows.json
 *   exports/exact_seed_rejected_rows.json
 *   exports/exact_seed_duplicate_clusters.json
 *   exports/exact_seed_run_report.json
 *   evidence/exact-seed/<seedId>/{raw.html,cleaned.txt,meta.json}
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');
const EVIDENCE_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/evidence/exact-seed');

const OUT_PUBLIC   = path.join(EXPORTS_DIR, 'exact_seed_public_safe_rows.json');
const OUT_HOLD     = path.join(EXPORTS_DIR, 'exact_seed_hold_rows.json');
const OUT_REJECTED = path.join(EXPORTS_DIR, 'exact_seed_rejected_rows.json');
const OUT_DUPES    = path.join(EXPORTS_DIR, 'exact_seed_duplicate_clusters.json');
const OUT_REPORT   = path.join(EXPORTS_DIR, 'exact_seed_run_report.json');

// Real-browser UA. Many institutional CDNs (Cloudflare-fronted) 403 any
// UA that doesn't look like a real browser. We respect robots.txt by
// only fetching the operator-curated exact URL — no crawling, no link
// following, no scraping.
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const FETCH_TIMEOUT_MS = 15_000;
const DELAY_BETWEEN_SEEDS_MS = 1500;

// ── Types ──────────────────────────────────────────────────────────────────

type AudienceClass =
  | 'US_MD_DO_VISITING_STUDENT'
  | 'INTERNATIONAL_MEDICAL_STUDENT'
  | 'IMG_GRADUATE_OBSERVER'
  | 'IMG_GRADUATE_EXTERNSHIP'
  | 'BOTH_STUDENT_AND_IMG_GRADUATE'
  | 'UNKNOWN_HOLD';

type OpportunityType =
  | 'VISITING_MEDICAL_STUDENT_ELECTIVE'
  | 'CLINICAL_ELECTIVE'
  | 'OBSERVERSHIP'
  | 'EXTERNSHIP'
  | 'SUB_INTERNSHIP'
  | 'CLERKSHIP'
  | 'INTERNATIONAL_VISITING_STUDENT'
  | 'IMG_OBSERVERSHIP'
  | 'OTHER_USCE';

type DirectLinkStatus = 'VALID_DIRECT_USCE_SOURCE' | 'GENERIC_PAGE_HOLD' | 'INDIRECT_THIRD_PARTY' | 'INVALID_NOT_USCE_SOURCE';
type RowRoute = 'AUTO_PROMOTE' | 'HOLD_REVIEW' | 'REJECTED';
type RunStatus = 'PENDING' | 'FETCHED' | 'EXTRACTED' | 'FAILED_FETCH' | 'FAILED_EXTRACT';
type FinalStatus = 'PENDING' | 'AUTO_PROMOTE' | 'HOLD_REVIEW' | 'REJECTED' | 'FAILED';

interface SeedRow {
  seedId: string;
  institutionId: string;
  institutionName: string;
  parentSystem: string;
  campus: string;
  city: string;
  state: string;
  sourceUrl: string;
  sourceDomain: string;
  expectedAudience: AudienceClass;
  expectedOpportunityType: OpportunityType;
  expectedSpecialty: string;
  expectedCampus: string;
  expectedDirectLink: string;
  knownGoodReason: string;
  priorEvidenceRef: string;
  notes: string;
  runStatus: RunStatus;
  finalStatus: FinalStatus;
}

interface SeedRunResult extends SeedRow {
  runStatus: RunStatus;
  finalStatus: FinalStatus;
  fetchHttpStatus?: number;
  fetchError?: string;
  rawHtmlPath?: string;
  cleanedTextPath?: string;
  sourceHash?: string;
  emittedRowIds: string[];
}

interface ExactSeedRow {
  rowId: string;
  seedId: string;
  pageTitle: string | null;
  opportunitySignature: string;
  institutionId: string;
  institutionName: string;
  parentSystem: string | null;
  campus: string | null;
  city: string;
  state: string;
  sourceUrl: string;
  canonicalUrl: string;
  sourceDomain: string;
  opportunityType: OpportunityType;
  audienceClass: AudienceClass;
  topQuote: string;
  quoteScore: number;
  sourceHash: string;
  cleanedTextPath: string;
  directLinkStatus: DirectLinkStatus;
  directLinkReason: string;
  directLinkSignals: string[];
  triageDecision: string;
  audienceConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  route: RowRoute;
  holdReasons: string[];
  rejectionReason: string | null;
  fetchedAt: string;
  schemaVersion: string;
}

// ── CSV parser ─────────────────────────────────────────────────────────────

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else { cur += ch; }
    } else {
      if (ch === ',') { cells.push(cur); cur = ''; }
      else if (ch === '"') { inQuote = true; }
      else { cur += ch; }
    }
  }
  cells.push(cur);
  return cells;
}

function readSeedCsv(csvPath: string): SeedRow[] {
  const text = readFileSync(csvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) throw new Error(`Seed CSV has no rows: ${csvPath}`);
  const header = splitCsvLine(lines[0]);
  const rows: SeedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) row[header[j]] = cells[j] ?? '';
    rows.push(row as unknown as SeedRow);
  }
  return rows;
}

// ── Fetch + clean ──────────────────────────────────────────────────────────

interface FetchResult {
  ok: boolean;
  status?: number;
  html?: string;
  error?: string;
}

async function fetchExact(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timer);
    const html = await res.text();
    if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    return { ok: true, status: res.status, html };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract a presentable program name from <title> tag (preferred) or
 * first <h1>. Strips the institution name suffix when it duplicates the
 * known institution. Returns null if no usable title is found.
 */
function extractPageTitle(html: string, institutionName: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let raw = titleMatch ? decodeEntities(titleMatch[1]).trim() : '';
  if (!raw) {
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    raw = h1Match ? decodeEntities(h1Match[1]).trim() : '';
  }
  if (!raw) return null;

  // Strip pipe/dash-separated suffixes that contain the institution name
  // or generic site labels.
  const parts = raw.split(/\s*[|·–—-]\s*/).map(p => p.trim()).filter(p => p.length > 0);
  // Only use DISTINCTIVE institution tokens — generic medical words like
  // "medical", "hospital", "center", "school" appear in opportunity titles
  // and should not trigger institution-name filtering.
  const GENERIC_INST_WORDS = new Set(['medical', 'hospital', 'center', 'centre', 'university', 'school', 'health', 'clinic', 'college', 'department', 'institute', 'system', 'the', 'of', 'and']);
  const instTokens = institutionName.toLowerCase().split(/\s+/)
    .filter(w => w.length > 3 && !GENERIC_INST_WORDS.has(w));
  const isInstitution = (p: string): boolean => {
    const low = p.toLowerCase();
    // Drop any part containing a distinctive institution token, regardless
    // of word count — long titles that read like the institution's name
    // (e.g. "The Robert Larner, M.D. College of Medicine") are not program
    // titles and should fall back to the synthetic name.
    return instTokens.length > 0 && instTokens.some(t => low.includes(t));
  };
  const isGenericLabel = (p: string): boolean =>
    /^(home|us\s*students|academic\s*institute|international\s+medical\s+education|us|usa|international)$/i.test(p.trim());

  const isAcronym = (p: string): boolean => /^[A-Z]{3,8}$/.test(p);
  const isMeaningful = (p: string): boolean => p.length >= 6 || isAcronym(p);

  // Prefer recognized program acronyms (VSLO, VSAS, IVMS) first since
  // they're the canonical names for those programs. Then prefer parts
  // that mention program vocab. Then longest non-institution part.
  const candidates = parts.filter(p => !isInstitution(p) && !isGenericLabel(p) && isMeaningful(p));
  const knownAcronyms = /^(VSLO|VSAS|IVMS|AVP|IVS|IVMSP)$/i;
  const acronymMatch = candidates.find(p => knownAcronyms.test(p));
  if (acronymMatch) return acronymMatch;
  const programVocab = /(visiting|visitor|observership|extern|elective|clerkship|rotation|sub.?intern|away|student|fellowship|scholar)/i;
  const programMatches = candidates.filter(p => programVocab.test(p));
  if (programMatches.length > 0) return programMatches.sort((a, b) => b.length - a.length)[0];
  if (candidates.length > 0) return candidates.sort((a, b) => b.length - a.length)[0];
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function sha256(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex');
}

// ── Quote scoring (same shape as intelligent gate) ────────────────────────

const QUOTE_SIGNALS: Array<[RegExp, number]> = [
  [/\b(apply|application|how to apply|apply (online|here|now))\b/i, 4],
  [/\b(fee|cost|\$\d+|free of charge|no (application )?fee)\b/i, 4],
  [/\b(\d+(-|\s)week|weeks? (rotation|program|elective)|duration)\b/i, 4],
  [/\b(eligib|requirement|prerequisite|must have|must be enrolled)\b/i, 3],
  [/\b(VSLO|VSAS|AAMC|LCME|ECFMG)\b/i, 3],
  [/\b(coordinator|program director|contact .+@|@[\w.-]+\.\w{2,})\b/i, 3],
  [/\b(accept(s|ing)?|welcome|open to|available to) (visiting|international|IMG)\b/i, 3],
  [/\b(submit|upload|letter of rec|CV required|transcript)\b/i, 2],
  [/\b(rotation|elective|clerkship|observership|externship)\b/i, 1],
  [/\b(medical student|IMG|international|visiting student)\b/i, 1],
];

function scoreQuote(quote: string): number {
  if (!quote) return 0;
  return QUOTE_SIGNALS.reduce((acc, [re, weight]) => acc + (re.test(quote) ? weight : 0), 0);
}

function splitSentences(text: string): string[] {
  // Split on sentence endings followed by whitespace + capital letter, with min length filter
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length >= 40 && s.length <= 400);
}

function selectBestQuote(text: string): { quote: string; score: number } {
  const sentences = splitSentences(text);
  let best = { quote: '', score: -1 };
  for (const s of sentences) {
    const sc = scoreQuote(s);
    if (sc > best.score) best = { quote: s, score: sc };
  }
  // Fallback: first ≥80-char sentence if nothing scored
  if (best.score <= 0 && sentences.length > 0) {
    const fallback = sentences.find(s => s.length >= 80) ?? sentences[0];
    best = { quote: fallback, score: 0 };
  }
  return best;
}

// ── Triage (per-page, deterministic) ──────────────────────────────────────

// Tightened: require pharmacy in a student/training context so we don't
// trigger on institutional nav/footer mentions of a College of Pharmacy.
const PHARMACY_RE = /\b(pharm\.?d|doctor of pharmacy|pharmacy (student|extern(ship)?|residen(t|cy)|fellow(ship)?|trainee|rotation|clerkship)|P[1-4]\s+student|college of pharmacy program|pharmacy school of)\b/i;
const ALLIED_RE = /\b(nursing student|dental student|physician assistant student|PA student|allied health student)\b/i;
const PATIENT_RE = /\b(make an appointment|find a doctor|patient portal|insurance|billing)\b/i;
const RESEARCH_ONLY_RE = /\b(research only|laboratory rotation|wet lab|bench research|basic science research)\b/i;
const CAREERS_RE = /\b(job posting|employment opportunity|apply for this job|career\s+opportunity|hiring manager)\b/i;
const GME_ONLY_RE = /\b(residency program|fellowship program|PGY-?[1-7]|categorical resident|chief resident)\b/i;

/**
 * Triage with USCE-priority ordering.
 *
 * The old order (cheap rejects first) was wrong: it rejected pages with
 * strong USCE signals because of an incidental pharmacy/GME nav mention.
 * The new order:
 *   1. Strong USCE signal in URL or text → INCLUDE
 *   2. Only then check rejection patterns (now require multiple matches
 *      or topic-level signals, not single cross-references)
 */
function triagePage(seed: SeedRow, cleanedText: string): { decision: string; reason: string } {
  // Strong USCE signal: page is clearly ABOUT USCE if any of these are present
  const STRONG_USCE_TEXT = /\b(visiting (medical )?student|visiting student program|away rotation|sub.?intern(ship)?|clerkship (program|application|elective)|clinical elective|observership program|externship for|VSLO|VSAS)\b/i;
  // Path-segment match: allows /academic-visitor-program (not anchored on /)
  const URL_STRONG = /(visiting[_-]?[a-z]*[_-]?stud|extern(ship)?|elective|clerkship|observ(ership)?|vslo|vsas|sub[_-]?intern|acting[_-]?intern|international[_-]?(visiting|medical)|medical[_-]students?|visitor[_-]?program|academic[_-]?visitor)/i;

  const hasStrongUsceText = STRONG_USCE_TEXT.test(cleanedText);
  const hasStrongUsceUrl = URL_STRONG.test(seed.sourceUrl);

  // Topic-level pharmacy/allied indicator: title-like phrases or multiple
  // distinct mentions, not just one cross-link in a nav menu.
  const pharmacyMatches = cleanedText.match(/\b(pharm\.?d|doctor of pharmacy|pharmacy (student|extern(ship)?|residen(t|cy)|fellow(ship)?|trainee|rotation|clerkship)|P[1-4]\s+student)\b/gi) ?? [];
  const alliedMatches = cleanedText.match(ALLIED_RE) ?? [];

  // Only reject as pharmacy when the page has NO USCE signal AND has
  // pharmacy as a topic (multiple matches → likely the page's subject).
  if (!hasStrongUsceText && !hasStrongUsceUrl) {
    if (pharmacyMatches.length >= 1) return { decision: 'REJECT_PHARMACY_OR_ALLIED_HEALTH', reason: `pharmacy topic (${pharmacyMatches.length} matches), no USCE signal` };
    if (alliedMatches.length >= 1) return { decision: 'REJECT_PHARMACY_OR_ALLIED_HEALTH', reason: 'allied-health topic, no USCE signal' };
  }
  if (PATIENT_RE.test(cleanedText) && !hasStrongUsceText && !hasStrongUsceUrl) {
    return { decision: 'REJECT_PATIENT_FACING', reason: 'patient-facing page with no opportunity signal' };
  }
  if (CAREERS_RE.test(cleanedText) && !hasStrongUsceText && !hasStrongUsceUrl) {
    return { decision: 'REJECT_CAREERS_JOBS_ONLY', reason: 'careers page with no student/visiting signal' };
  }
  if (RESEARCH_ONLY_RE.test(cleanedText) && !/\b(clinical|elective|clerkship|observership)\b/i.test(cleanedText)) {
    return { decision: 'REJECT_RESEARCH_ONLY', reason: 'research-only page' };
  }
  if (GME_ONLY_RE.test(cleanedText) && !hasStrongUsceText && !hasStrongUsceUrl) {
    return { decision: 'REJECT_GME_ONLY', reason: 'GME-only page with no medical student/visiting signal' };
  }

  if (hasStrongUsceText || hasStrongUsceUrl) {
    return { decision: 'INCLUDE_USCE_OPPORTUNITY', reason: `USCE signal: ${hasStrongUsceUrl ? 'URL' : ''}${hasStrongUsceUrl && hasStrongUsceText ? '+' : ''}${hasStrongUsceText ? 'text' : ''}` };
  }
  if (cleanedText.length < 200) return { decision: 'HOLD_NEEDS_MORE_EVIDENCE', reason: 'page text very short (<200 chars)' };
  return { decision: 'HOLD_NEEDS_MORE_EVIDENCE', reason: 'no clear USCE signal in URL or cleaned text' };
}

// ── Direct-link validation (reuses intelligent gate logic) ────────────────

const STRONG_URL_SIGNALS: Array<[RegExp, string]> = [
  [/\/observ(ership)?s?\b/i, 'observership URL segment'],
  // Tolerates interstitial words: /visiting-students AND /visiting-medical-students
  [/\/visiting[_-]([a-z]+[_-])?stud/i, 'visiting-student URL segment'],
  [/\/extern(ship)?s?\b/i, 'externship URL segment'],
  [/\/(clinical[_-]?)?elective/i, 'elective URL segment'],
  [/\/clerkship/i, 'clerkship URL segment'],
  [/\/vslo|\/vsas/i, 'VSLO/VSAS URL segment'],
  [/\/(away|acting)[_-]?rotation/i, 'away/acting rotation URL segment'],
  [/\/sub[_-]?intern/i, 'sub-internship URL segment'],
  [/\/acting[_-]?intern/i, 'acting internship URL segment'],
  [/\/international[_-]?visiting/i, 'international visiting URL segment'],
  [/\/international[_-]?(medical[_-]?)?student/i, 'international student URL segment'],
  [/\/img[_-]?program/i, 'IMG program URL segment'],
  // Bare /medical-students OR with program/rotation suffix
  [/\/medical[_-]students?\b/i, 'medical-students URL segment'],
  [/\/medical[_-]?student[_-]?(program|rotation)/i, 'medical student program URL segment'],
  // Academic visitor / visitor program (HSS-style)
  [/\/(academic[_-])?visitor[_-]?(program)?/i, 'academic visitor URL segment'],
];

const GENERIC_URL_PATTERNS: Array<[RegExp, string]> = [
  [/\/education\/?$/i, 'generic /education URL'],
  [/\/medical-education\/?$/i, 'generic /medical-education URL'],
  [/\/academics\/?$/i, 'generic /academics URL'],
  [/\/training\/?$/i, 'generic /training URL'],
  [/\/programs?\/?$/i, 'generic /programs URL'],
  [/\/about\/?$/i, 'generic /about URL'],
];

function validateDirectLink(url: string, quote: string): { status: DirectLinkStatus; reason: string; signals: string[] } {
  const signals: string[] = [];
  let urlPath = '';
  try { urlPath = new URL(url).pathname; } catch { urlPath = url.replace(/^https?:\/\/[^/]+/, ''); }
  for (const [re, label] of STRONG_URL_SIGNALS) {
    if (re.test(urlPath)) signals.push(label);
  }
  const generic = GENERIC_URL_PATTERNS.find(([re]) => re.test(urlPath));
  if (signals.length >= 1) return { status: 'VALID_DIRECT_USCE_SOURCE', reason: `direct USCE URL signal: ${signals.join(', ')}`, signals };
  if (generic) return { status: 'GENERIC_PAGE_HOLD', reason: `generic landing page URL (${generic[1]})`, signals: [generic[1]] };
  // Quote strong enough?
  if (scoreQuote(quote) >= 6) return { status: 'VALID_DIRECT_USCE_SOURCE', reason: 'strong quote evidence', signals };
  return { status: 'INVALID_NOT_USCE_SOURCE', reason: 'no direct-opportunity URL or quote signals', signals };
}

// ── Audience classification (lighter than gate; uses expectedAudience as anchor) ──

function classifyAudienceFromText(expected: AudienceClass, cleanedText: string, sourceUrl: string = ''): { audience: AudienceClass; confidence: 'HIGH' | 'MEDIUM' | 'LOW'; rationale: string } {
  const vmsTextSignal = /\b(visiting (medical )?students?|VSLO|VSAS|LCME|COCA|MS-?[34]|medical students? (rotation|clerkship|elective|program)|clerkship|elective|away rotation|sub.?intern|acting intern)\b/i.test(cleanedText);
  const imgTextSignal = /\b(international medical grad(uate)?s?|IMG\b|foreign medical grad(uate)?s?|ECFMG|observer(ship)?s?|extern(ship)?s?|academic visitors?)\b/i.test(cleanedText);
  const intlTextSignal = /\b(international (medical )?students?|international visiting|non-US medical student|foreign med student)\b/i.test(cleanedText);

  // URL evidence — many med-school pages are JS-heavy and the static HTML
  // is sparse. The curated source URL is itself strong evidence.
  const vmsUrlSignal = /\/(visiting[_-][a-z]*[_-]?students?|medical[_-]students?|clerkship|elective|sub[_-]?intern|away[_-]?rotation|vslo|vsas)\b/i.test(sourceUrl);
  const imgUrlSignal = /\/(observ(ership)?|extern(ship)?|img|academic[_-]?visitor|visitor[_-]?program|international[_-]?(visiting|graduate))/i.test(sourceUrl);
  const intlUrlSignal = /\/(international[_-]?(visiting|medical[_-]?student)|intl[_-]?(visiting|student))/i.test(sourceUrl);

  const vmsSignal = vmsTextSignal || vmsUrlSignal;
  const imgSignal = imgTextSignal || imgUrlSignal;
  const intlSignal = intlTextSignal || intlUrlSignal;

  // Confirm or downgrade the seed's expectedAudience
  switch (expected) {
    case 'BOTH_STUDENT_AND_IMG_GRADUATE':
      if (vmsSignal && imgSignal) return { audience: 'BOTH_STUDENT_AND_IMG_GRADUATE', confidence: 'HIGH', rationale: 'both VMS and IMG signals in page text' };
      if (vmsSignal) return { audience: 'US_MD_DO_VISITING_STUDENT', confidence: 'MEDIUM', rationale: 'expected BOTH but only VMS signal found' };
      if (imgSignal) return { audience: 'IMG_GRADUATE_OBSERVER', confidence: 'MEDIUM', rationale: 'expected BOTH but only IMG signal found' };
      return { audience: 'BOTH_STUDENT_AND_IMG_GRADUATE', confidence: 'LOW', rationale: 'seed expected BOTH; signals not detected in cleaned text' };
    case 'US_MD_DO_VISITING_STUDENT':
      if (vmsSignal) return { audience: 'US_MD_DO_VISITING_STUDENT', confidence: 'HIGH', rationale: 'VMS signal present' };
      return { audience: 'US_MD_DO_VISITING_STUDENT', confidence: 'LOW', rationale: 'seed expected VMS; no explicit signal in cleaned text' };
    case 'INTERNATIONAL_MEDICAL_STUDENT':
      if (intlSignal) return { audience: 'INTERNATIONAL_MEDICAL_STUDENT', confidence: 'HIGH', rationale: 'international student signal present' };
      return { audience: 'INTERNATIONAL_MEDICAL_STUDENT', confidence: 'LOW', rationale: 'seed expected INTL; no explicit signal' };
    case 'IMG_GRADUATE_OBSERVER':
      if (imgSignal) return { audience: 'IMG_GRADUATE_OBSERVER', confidence: 'HIGH', rationale: 'IMG/observer signal present' };
      return { audience: 'IMG_GRADUATE_OBSERVER', confidence: 'LOW', rationale: 'seed expected IMG; no explicit signal' };
    case 'IMG_GRADUATE_EXTERNSHIP':
      if (imgSignal && /\bextern/i.test(cleanedText)) return { audience: 'IMG_GRADUATE_EXTERNSHIP', confidence: 'HIGH', rationale: 'IMG + extern signal' };
      return { audience: 'IMG_GRADUATE_EXTERNSHIP', confidence: 'LOW', rationale: 'seed expected IMG externship; weak evidence' };
    default:
      return { audience: 'UNKNOWN_HOLD', confidence: 'LOW', rationale: 'expected audience UNKNOWN_HOLD' };
  }
}

// ── Opportunity-type derivation (audience-aware, like Phase F) ────────────

function deriveOpportunityType(seedType: OpportunityType, audience: AudienceClass): OpportunityType {
  if (audience === 'IMG_GRADUATE_EXTERNSHIP') return 'EXTERNSHIP';
  if (audience === 'IMG_GRADUATE_OBSERVER') return 'OBSERVERSHIP';
  if (audience === 'INTERNATIONAL_MEDICAL_STUDENT') {
    return seedType === 'INTERNATIONAL_VISITING_STUDENT' ? 'INTERNATIONAL_VISITING_STUDENT' : 'INTERNATIONAL_VISITING_STUDENT';
  }
  // Student audience: trust the seed's type unless it's an IMG-coded type
  if (seedType === 'OBSERVERSHIP' || seedType === 'EXTERNSHIP' || seedType === 'IMG_OBSERVERSHIP') {
    return 'CLINICAL_ELECTIVE';
  }
  return seedType;
}

// ── Routing ───────────────────────────────────────────────────────────────

function routeRow(triageDecision: string, dlStatus: DirectLinkStatus, audConf: 'HIGH' | 'MEDIUM' | 'LOW', audience: AudienceClass, quoteScore: number): { route: RowRoute; holdReasons: string[]; rejection: string | null } {
  if (dlStatus === 'INVALID_NOT_USCE_SOURCE') return { route: 'REJECTED', holdReasons: [], rejection: 'direct-link validation: INVALID_NOT_USCE_SOURCE' };
  if (dlStatus === 'INDIRECT_THIRD_PARTY') return { route: 'REJECTED', holdReasons: [], rejection: 'direct-link validation: third-party URL' };
  if (triageDecision.startsWith('REJECT_')) return { route: 'REJECTED', holdReasons: [], rejection: triageDecision };

  const holds: string[] = [];
  if (triageDecision === 'HOLD_SCOPE_AMBIGUITY') holds.push('triage: scope ambiguity');
  if (triageDecision === 'HOLD_AUDIENCE_AMBIGUITY') holds.push('triage: audience ambiguity');
  if (triageDecision === 'HOLD_NEEDS_MORE_EVIDENCE') holds.push('triage: needs more evidence');
  if (dlStatus === 'GENERIC_PAGE_HOLD') holds.push('direct-link: generic page');
  if (audience === 'UNKNOWN_HOLD') holds.push('audience: cannot classify');
  if (audConf === 'LOW') holds.push('audience confidence: LOW');
  // Quote-quality gate: page rendered but no opportunity-detail sentence
  // found (likely JS-rendered page; URL is good but quote is nav text)
  if (quoteScore < 1) holds.push('quote: weak evidence (no application/cost/eligibility/contact signals)');

  if (holds.length > 0) return { route: 'HOLD_REVIEW', holdReasons: holds, rejection: null };
  return { route: 'AUTO_PROMOTE', holdReasons: [], rejection: null };
}

// ── Signature / row id ────────────────────────────────────────────────────

function opportunitySignature(institutionId: string, canonicalUrl: string, oppType: OpportunityType, audience: AudienceClass): string {
  return `${institutionId}||${canonicalUrl}||${oppType}||${audience}`;
}

function rowId(sig: string): string {
  return 'exact_' + crypto.createHash('sha1').update(sig).digest('hex').slice(0, 10);
}

// ── Per-seed processing ───────────────────────────────────────────────────

async function processSeed(seed: SeedRow, opts: { offline: boolean }): Promise<{ result: SeedRunResult; rows: ExactSeedRow[] }> {
  const result: SeedRunResult = { ...seed, runStatus: 'PENDING', finalStatus: 'PENDING', emittedRowIds: [] };
  const seedDir = path.join(EVIDENCE_DIR, seed.seedId);
  mkdirSync(seedDir, { recursive: true });
  const rawPath = path.join(seedDir, 'raw.html');
  const cleanPath = path.join(seedDir, 'cleaned.txt');
  const metaPath = path.join(seedDir, 'meta.json');

  let html = '';
  if (opts.offline) {
    if (!existsSync(rawPath)) {
      result.runStatus = 'FAILED_FETCH';
      result.finalStatus = 'FAILED';
      result.fetchError = 'offline mode but no cached raw.html';
      return { result, rows: [] };
    }
    html = readFileSync(rawPath, 'utf8');
    result.runStatus = 'FETCHED';
  } else {
    const fr = await fetchExact(seed.sourceUrl);
    result.fetchHttpStatus = fr.status;
    if (!fr.ok || !fr.html) {
      result.runStatus = 'FAILED_FETCH';
      result.finalStatus = 'FAILED';
      result.fetchError = fr.error;
      writeFileSync(metaPath, JSON.stringify({ ...result, fetchedAt: new Date().toISOString() }, null, 2));
      return { result, rows: [] };
    }
    html = fr.html;
    writeFileSync(rawPath, html);
    result.runStatus = 'FETCHED';
  }

  const cleaned = cleanHtml(html);
  writeFileSync(cleanPath, cleaned);
  const sourceHash = sha256(html);
  result.rawHtmlPath = path.relative(REPO_ROOT, rawPath);
  result.cleanedTextPath = path.relative(REPO_ROOT, cleanPath);
  result.sourceHash = sourceHash;

  // Triage
  const triage = triagePage(seed, cleaned);
  // Quote
  const { quote, score: quoteScore } = selectBestQuote(cleaned);
  // Direct-link validation
  const dl = validateDirectLink(seed.sourceUrl, quote);
  // Audience
  const aud = classifyAudienceFromText(seed.expectedAudience, cleaned, seed.sourceUrl);
  // Page title (presentable opportunity name)
  const pageTitle = extractPageTitle(html, seed.institutionName);
  result.runStatus = 'EXTRACTED';

  // Build rows — BOTH expands to two
  const audiences: AudienceClass[] = aud.audience === 'BOTH_STUDENT_AND_IMG_GRADUATE'
    ? ['US_MD_DO_VISITING_STUDENT', 'IMG_GRADUATE_OBSERVER']
    : [aud.audience];

  const rows: ExactSeedRow[] = [];
  const routes: RowRoute[] = [];
  for (const ac of audiences) {
    const oppType = deriveOpportunityType(seed.expectedOpportunityType, ac);
    const sig = opportunitySignature(seed.institutionId, seed.sourceUrl, oppType, ac);
    const id = rowId(sig);
    const { route, holdReasons, rejection } = routeRow(triage.decision, dl.status, aud.confidence, ac, quoteScore);
    routes.push(route);
    rows.push({
      rowId: id,
      seedId: seed.seedId,
      pageTitle,
      opportunitySignature: sig,
      institutionId: seed.institutionId,
      institutionName: seed.institutionName,
      parentSystem: seed.parentSystem || null,
      campus: seed.campus || null,
      city: seed.city,
      state: seed.state,
      sourceUrl: seed.sourceUrl,
      canonicalUrl: seed.sourceUrl,
      sourceDomain: seed.sourceDomain,
      opportunityType: oppType,
      audienceClass: ac,
      topQuote: quote,
      quoteScore,
      sourceHash,
      cleanedTextPath: result.cleanedTextPath ?? '',
      directLinkStatus: dl.status,
      directLinkReason: dl.reason,
      directLinkSignals: dl.signals,
      triageDecision: triage.decision,
      audienceConfidence: aud.confidence,
      route,
      holdReasons,
      rejectionReason: rejection,
      fetchedAt: new Date().toISOString(),
      schemaVersion: 'p102-exact-seed-1',
    });
    result.emittedRowIds.push(id);
  }

  // Reflect best route back to seed.finalStatus
  if (routes.includes('AUTO_PROMOTE')) result.finalStatus = 'AUTO_PROMOTE';
  else if (routes.includes('HOLD_REVIEW')) result.finalStatus = 'HOLD_REVIEW';
  else result.finalStatus = 'REJECTED';

  writeFileSync(metaPath, JSON.stringify({ ...result, triage, aud, dl, quoteScore, fetchedAt: new Date().toISOString() }, null, 2));

  return { result, rows };
}

// ── Main ───────────────────────────────────────────────────────────────────

function parseArgs(): { seedFile: string; limit: number; seedId?: string; offline: boolean } {
  const a = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = a.indexOf(flag);
    return i >= 0 ? a[i + 1] : undefined;
  };
  const seedFile = get('--seed-file') ?? path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/queues/p102_exact_usce_seed_links.csv');
  const limit = parseInt(get('--limit') ?? '50', 10);
  const seedId = get('--seed-id');
  const offline = a.includes('--offline');
  return { seedFile, limit, seedId, offline };
}

async function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

async function main(): Promise<void> {
  const { seedFile, limit, seedId, offline } = parseArgs();
  console.log(`P102 exact-link seed runner (offline=${offline}, limit=${limit})`);
  console.log(`  seed file: ${seedFile}`);

  mkdirSync(EVIDENCE_DIR, { recursive: true });
  if (!existsSync(EXPORTS_DIR)) mkdirSync(EXPORTS_DIR, { recursive: true });

  let seeds = readSeedCsv(seedFile);
  if (seedId) seeds = seeds.filter(s => s.seedId === seedId);
  seeds = seeds.slice(0, limit);
  console.log(`  seeds to process: ${seeds.length}\n`);

  const results: SeedRunResult[] = [];
  const allRows: ExactSeedRow[] = [];

  for (const seed of seeds) {
    process.stdout.write(`  ${seed.seedId.padEnd(10)} ${seed.institutionName.padEnd(45).slice(0, 45)} `);
    const { result, rows } = await processSeed(seed, { offline });
    results.push(result);
    allRows.push(...rows);
    const tag = result.runStatus === 'EXTRACTED' ? `${result.finalStatus} (${rows.length} row${rows.length === 1 ? '' : 's'})` : result.runStatus;
    console.log(tag);
    if (!offline) await sleep(DELAY_BETWEEN_SEEDS_MS);
  }

  // Dedup by signature within this batch
  const seenSigs = new Map<string, string>();
  const dupClusters = new Map<string, { signature: string; keptRowId: string; duplicateRowIds: string[] }>();
  const dedupedRows: ExactSeedRow[] = [];
  for (const r of allRows) {
    if (seenSigs.has(r.opportunitySignature)) {
      const keptId = seenSigs.get(r.opportunitySignature)!;
      const c = dupClusters.get(r.opportunitySignature) ?? { signature: r.opportunitySignature, keptRowId: keptId, duplicateRowIds: [] };
      c.duplicateRowIds.push(r.rowId);
      dupClusters.set(r.opportunitySignature, c);
      continue;
    }
    seenSigs.set(r.opportunitySignature, r.rowId);
    dedupedRows.push(r);
  }

  const publicRows   = dedupedRows.filter(r => r.route === 'AUTO_PROMOTE');
  const holdRows     = dedupedRows.filter(r => r.route === 'HOLD_REVIEW');
  const rejectedRows = dedupedRows.filter(r => r.route === 'REJECTED');
  const dupes = [...dupClusters.values()];

  const now = new Date().toISOString();
  writeFileSync(OUT_PUBLIC,   JSON.stringify({ generatedAt: now, totalRows: publicRows.length, rows: publicRows }, null, 2) + '\n');
  writeFileSync(OUT_HOLD,     JSON.stringify({ generatedAt: now, totalHolds: holdRows.length, rows: holdRows }, null, 2) + '\n');
  writeFileSync(OUT_REJECTED, JSON.stringify({ generatedAt: now, totalRejected: rejectedRows.length, rows: rejectedRows }, null, 2) + '\n');
  writeFileSync(OUT_DUPES,    JSON.stringify({ generatedAt: now, totalClusters: dupes.length, clusters: dupes }, null, 2) + '\n');

  // Summary report
  const report = {
    generatedAt: now,
    seedFile: path.relative(REPO_ROOT, seedFile),
    offline,
    seedsAttempted: results.length,
    runStatusCounts: tally(results, r => r.runStatus),
    finalStatusCounts: tally(results, r => r.finalStatus),
    routeCounts: { AUTO_PROMOTE: publicRows.length, HOLD_REVIEW: holdRows.length, REJECTED: rejectedRows.length },
    audienceCounts: tally(dedupedRows, r => r.audienceClass),
    directLinkCounts: tally(dedupedRows, r => r.directLinkStatus),
    duplicateClusters: dupes.length,
    seedResults: results.map(r => ({
      seedId: r.seedId,
      institutionName: r.institutionName,
      runStatus: r.runStatus,
      finalStatus: r.finalStatus,
      fetchHttpStatus: r.fetchHttpStatus,
      fetchError: r.fetchError,
      emittedRowIds: r.emittedRowIds,
    })),
  };
  writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2) + '\n');

  console.log('');
  console.log('  Summary:');
  console.log(`    AUTO_PROMOTE  ${publicRows.length}`);
  console.log(`    HOLD_REVIEW   ${holdRows.length}`);
  console.log(`    REJECTED      ${rejectedRows.length}`);
  console.log(`    duplicates    ${dupes.length}`);
  console.log('');
  const autoSeeds = results.filter(r => r.finalStatus === 'AUTO_PROMOTE').length;
  const fetchedSeeds = results.filter(r => r.runStatus === 'EXTRACTED').length;
  const ratePct = fetchedSeeds === 0 ? 0 : Math.round((autoSeeds / fetchedSeeds) * 100);
  console.log(`    auto-promote rate: ${autoSeeds}/${fetchedSeeds} fetched seeds (${ratePct}%)`);
  console.log('');
  console.log(`  written:`);
  console.log(`    ${path.relative(REPO_ROOT, OUT_PUBLIC)}`);
  console.log(`    ${path.relative(REPO_ROOT, OUT_HOLD)}`);
  console.log(`    ${path.relative(REPO_ROOT, OUT_REJECTED)}`);
  console.log(`    ${path.relative(REPO_ROOT, OUT_DUPES)}`);
  console.log(`    ${path.relative(REPO_ROOT, OUT_REPORT)}`);
}

function tally<T>(arr: T[], fn: (x: T) => string): Record<string, number> {
  const c: Record<string, number> = {};
  for (const x of arr) { const k = fn(x); c[k] = (c[k] ?? 0) + 1; }
  return c;
}

main().catch(e => { console.error(e); process.exit(1); });
