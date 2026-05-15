#!/usr/bin/env tsx
/**
 * P102 Discovery Runner — one institution per run.
 *
 * Adapts FDD A1/A2/A3 discipline to USCEHub:
 *   A0 deterministic probe (robots, sitemap, fixed paths, JSON-LD)
 *   A1 broad source map + skeleton extraction
 *   A1.5 source completeness audit
 *   A2 depth (skeleton in P102-0R)
 *   A2.5 semantic miss detector (skeleton in P102-0R)
 *   A3 hostile gate (network-free, agent-free, run-folder-only)
 *
 * Invariants:
 *   - One institution per run.
 *   - Serial HTTP, named UA, HEAD-first on fixed paths.
 *   - All artifacts on canonical T7 (legacy root forbidden).
 *   - No invented claims; NOT_STATED_ON_SOURCE is honest.
 *   - A3 reads only run-folder files, attests networkUsed=false, agentUsed=false.
 *
 * Usage:
 *   npx tsx scripts/p102-discovery-runner.ts \
 *     --queue docs/platform-v2/local/usce-discovery-command-center/p102/queues/p102_dry_run_1_queue.csv \
 *     --limit 1 \
 *     --run-id p102-0r-dry-run-1
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { URL } from 'node:url';
import { parseSitemapXml, isPathDisallowedByRobots } from './p102-extraction-lib';
import { inferIdentity } from './p102-identity-canonicalizer';

const SCHEMA_VERSION = 'p102-0r-1';
const USER_AGENT = 'USCEHub-Research/0.1 (+https://uscehub.com/contact)';
const FETCH_TIMEOUT_MS = 15000;
const MIN_DELAY_MS = 1500;
const MAX_REDIRECTS = 5;

const T7_ROOT = '/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner';
const REPO_ROOT = path.resolve(__dirname, '..');
const REPO_P102_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102');

const FIXED_PATHS = [
  '/observership', '/observerships', '/observer', '/clinical-observer',
  '/visiting-student', '/visiting-students', '/medical-students', '/international-students',
  '/electives', '/away-rotations', '/clinical-elective', '/clinical-rotation',
  '/sub-internship', '/subinternship', '/acting-internship',
  '/research', '/student-research', '/shadow', '/shadowing',
  '/volunteer', '/volunteering',
  '/img', '/international-medical-graduates',
  '/graduate-medical-education', '/gme',
  '/residency', '/fellowship',
  '/careers', '/physician-careers', '/provider-careers',
  '/benefits', '/visa', '/immigration', '/credentialing',
  // P102-0B additions (Hartford-driven): institutions often nest USCE-adjacent content
  // one layer below the standard well-known paths.
  '/health-professionals', '/medical-education', '/professional-education',
  '/student-affairs', '/education',
  // -----------------------------------------------------------------
  // P102-FIX additions (Gap A). Each path below is derived from a real
  // P97/P101 candidate URL where TIER_A_PUBLIC_SAFE or TIER_B_CAUTION_SAFE
  // evidence was previously confirmed. These are narrow, institution-
  // pattern-derived paths — NOT a generic crawler. See
  // P102_FIX_POSITIVE_CONTROL_PROMOTION_SPEC.md §6 "Gap A".
  // -----------------------------------------------------------------
  // MSK pattern: /hcp-education-training/medical-students/{elective,observership,...}
  '/hcp-education-training',
  '/hcp-education-training/medical-students',
  '/hcp-education-training/medical-students/elective',
  '/hcp-education-training/medical-students/medical-student-observerships',
  // Orlando Health pattern: /medical-professionals/graduate-medical-education/clerkship-programs
  '/medical-professionals',
  '/medical-professionals/graduate-medical-education',
  '/medical-professionals/graduate-medical-education/clerkship-programs',
  // Houston Methodist pattern: /academic-institute/education/medical/medical-student-rotations
  '/academic-institute',
  '/academic-institute/education',
  '/academic-institute/education/medical',
  '/academic-institute/education/medical/medical-student-rotations',
  // UAB pattern: /medicine/international/international-programs/international-visiting-medical-students
  '/medicine/international',
  '/medicine/international/international-programs',
  '/medicine/international/international-programs/international-visiting-medical-students',
  // Stanford pattern: /visiting-clerkships/international
  '/visiting-clerkships',
  '/visiting-clerkships/international',
  // HSS pattern: /education-institute/academic-visitor-program
  '/education-institute',
  '/education-institute/academic-visitor-program',
  // Memorial Healthcare / generic UME hub pattern
  '/education/undergraduate-medical-education',
  '/education/undergraduate-medical-education/requirements-for-visiting-students',
  // Generic deep-path variants observed in P101 across multiple institutions
  '/education/medical-students',
  '/education/visiting-medical-students',
  '/education/medical-student-electives',
  '/medical-education/medical-student-electives',
  '/medical-education/visiting-students',
  '/medical-students/electives',
  '/medical-students/elective-rotations',
  '/medical-students/clinical-electives',
  '/students/visiting-students',
  '/graduate-medical-education/clerkship-programs',
];

interface CliArgs {
  queue: string;
  limit: number;
  runId: string;
  resume: boolean;
  dryRun: boolean;
  institutionId: string | null;
}

interface QueueRow {
  schema_version: string;
  queue_id: string;
  scope_type: string;
  scope_value: string;
  rank: string;
  institution_id: string;
  canonical_name: string;
  state: string;
  county: string;
  city: string;
  official_domain: string;
  target_lanes: string;
  priority: string;
  why_included: string;
  status: string;
  assigned_run_id: string;
  locked_at: string;
  completed_at: string;
  next_action: string;
  notes: string;
}

interface FetchResult {
  url: string;
  finalUrl: string;
  method: 'HEAD' | 'GET' | 'HEAD_THEN_GET';
  statusCode: number;
  contentType: string;
  body: string | null;
  bodyBytes: number;
  error: string | null;
  redirects: number;
}

interface SourceRecord {
  schemaVersion: string;
  sourceId: string;
  sourceUrl: string;
  sourceDomain: string;
  sourceTitle: string | null;
  sourceFamily: string;
  sourceScope: string;
  deterministicProbeType: string;
  acceptedForExtraction: boolean;
  rejectedReason: string | null;
  sourceStatus: string;
  cleanedTextPath: string | null;
  rawHtmlPath: string | null;
  sourceHash: string | null;
  screenshotStatus: string;
  pdfStatus: string;
  jsonLdExtracted: boolean;
  robotsSitemapContext: string | null;
  capturedAt: string | null;
}

// -------------------- CLI parsing --------------------

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    queue: '',
    limit: 1,
    runId: '',
    resume: false,
    dryRun: false,
    institutionId: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--queue') args.queue = argv[++i];
    else if (a === '--limit') args.limit = parseInt(argv[++i], 10);
    else if (a === '--run-id') args.runId = argv[++i];
    else if (a === '--resume') args.resume = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--institution-id') args.institutionId = argv[++i];
  }
  if (!args.queue) throw new Error('--queue is required');
  if (!args.runId) throw new Error('--run-id is required');
  return args;
}

// -------------------- CSV --------------------

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.length > 0);
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) row[header[j]] = cols[j] ?? '';
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cur += c;
    } else {
      if (c === ',') { out.push(cur); cur = ''; }
      else if (c === '"') inQuotes = true;
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

function toCsvField(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function appendCsvRow(filePath: string, row: Record<string, string>): void {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  if (!existing) throw new Error(`Index file missing header: ${filePath}`);
  const headerLine = existing.split(/\r?\n/)[0];
  const header = splitCsvLine(headerLine);
  const line = header.map(h => toCsvField(row[h] ?? '')).join(',');
  const sep = existing.endsWith('\n') ? '' : '\n';
  fs.appendFileSync(filePath, sep + line + '\n');
}

// -------------------- Hash --------------------

function sha256(buf: string | Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// -------------------- HTML --------------------

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1].trim()).replace(/\s+/g, ' ').slice(0, 500) : null;
}

function extractJsonLd(html: string): unknown[] {
  const out: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      out.push(parsed);
    } catch {
      // skip malformed JSON-LD
    }
  }
  return out;
}

function htmlToText(html: string): string {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(p|div|li|h[1-6]|tr|article|section)>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = decodeEntities(s);
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/\n\s*\n+/g, '\n\n');
  s = s.replace(/^\s+|\s+$/gm, '');
  return s.trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

// -------------------- HTTP --------------------

async function fetchUrl(url: string, method: 'HEAD' | 'GET', redirectCount = 0): Promise<FetchResult> {
  const result: FetchResult = {
    url,
    finalUrl: url,
    method,
    statusCode: 0,
    contentType: '',
    body: null,
    bodyBytes: 0,
    error: null,
    redirects: redirectCount,
  };
  try {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const resp = await fetch(url, {
      method,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: method === 'HEAD' ? '*/*' : 'text/html,application/xhtml+xml,application/xml,application/pdf;q=0.9,*/*;q=0.5',
      },
      redirect: 'manual',
      signal: controller.signal,
    });
    clearTimeout(to);
    result.statusCode = resp.status;
    result.contentType = resp.headers.get('content-type') ?? '';
    if ([301, 302, 303, 307, 308].includes(resp.status)) {
      const loc = resp.headers.get('location');
      if (loc && redirectCount < MAX_REDIRECTS) {
        const next = new URL(loc, url).toString();
        await sleep(MIN_DELAY_MS);
        return await fetchUrl(next, method, redirectCount + 1);
      }
      result.error = redirectCount >= MAX_REDIRECTS ? 'redirect_limit' : 'redirect_no_location';
      return result;
    }
    if (method === 'GET' && resp.ok) {
      const buf = Buffer.from(await resp.arrayBuffer());
      result.bodyBytes = buf.length;
      result.body = buf.toString('utf8');
    }
    result.finalUrl = url;
    return result;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    result.error = msg.includes('aborted') ? 'timeout' : msg.slice(0, 200);
    return result;
  }
}

async function headThenGet(url: string): Promise<FetchResult> {
  await sleep(MIN_DELAY_MS);
  const head = await fetchUrl(url, 'HEAD');
  if ([200, 301, 302].includes(head.statusCode)) {
    await sleep(MIN_DELAY_MS);
    const get = await fetchUrl(url, 'GET');
    get.method = 'HEAD_THEN_GET';
    return get;
  }
  if (head.statusCode === 405) {
    // HEAD unsupported — try GET
    await sleep(MIN_DELAY_MS);
    const get = await fetchUrl(url, 'GET');
    get.method = 'HEAD_THEN_GET';
    return get;
  }
  return head;
}

// -------------------- Lock --------------------

interface Lock {
  release: () => void;
  lockFile: string;
}

function acquireLock(runFolderT7: string, runId: string): Lock {
  const lockFile = path.join(runFolderT7, '.run.lock');
  if (fs.existsSync(lockFile)) {
    const existing = fs.readFileSync(lockFile, 'utf8');
    throw new Error(`STALE_LOCK_NEEDS_REVIEW: existing lock for ${runId}: ${existing}`);
  }
  fs.writeFileSync(lockFile, JSON.stringify({ runId, pid: process.pid, acquiredAt: new Date().toISOString() }, null, 2));
  return {
    lockFile,
    release: () => { try { fs.unlinkSync(lockFile); } catch { /* ignore */ } },
  };
}

// -------------------- Lane / source-family classification --------------------

function classifySourceFamily(url: string, title: string | null, body: string | null): string {
  const u = url.toLowerCase();
  const t = (title ?? '').toLowerCase();
  const matches = (frag: string): boolean => u.includes(frag) || t.includes(frag);
  if (matches('observer')) return 'OBSERVERSHIP_PAGE';
  if (matches('visiting-student') || matches('visiting student') || matches('visiting-medical')) return 'VISITING_STUDENT_PAGE';
  if (matches('elective')) return 'VISITING_STUDENT_PAGE';
  if (matches('away-rotation') || matches('away rotation')) return 'VISITING_STUDENT_PAGE';
  if (matches('sub-intern') || matches('subintern') || matches('acting-intern')) return 'VISITING_STUDENT_PAGE';
  if (matches('gme') || matches('graduate-medical') || matches('graduate medical')) return 'GME_PAGE';
  if (matches('residency')) return 'RESIDENCY_PAGE';
  if (matches('fellowship')) return 'FELLOWSHIP_PAGE';
  if (matches('careers') || matches('career') || matches('jobs') || matches('employment')) return 'CAREERS_PAGE';
  if (matches('volunteer')) return 'VOLUNTEER_PAGE';
  if (matches('research') || matches('shadow')) return 'RESEARCH_PAGE';
  if (matches('international-students') || matches('international medical')) return 'VISITING_STUDENT_PAGE';
  if (matches('img')) return 'OBSERVERSHIP_PAGE';
  if ((body ?? '').toLowerCase().match(/<script[^>]*type=["']application\/ld\+json["']/)) return 'JSON_LD';
  return 'OTHER';
}

function classifySourceScope(domain: string, family: string, _title: string | null): string {
  // Conservative default. P102-0R does not deeply infer scope; defers to A3.
  if (family === 'GME_PAGE' || family === 'RESIDENCY_PAGE' || family === 'FELLOWSHIP_PAGE') return 'DEPARTMENT_LEVEL';
  if (family === 'CAREERS_PAGE') return 'CAREERS_PORTAL';
  return 'UNKNOWN_SCOPE';
}

// -------------------- Run folder structure --------------------

interface RunPaths {
  repoFolder: string;
  t7RunFolder: string;
  t7ArtifactFolder: string;
}

function createRunFolders(runId: string): RunPaths {
  const repoFolder = path.join(REPO_P102_ROOT, 'runs', runId);
  const t7RunFolder = path.join(T7_ROOT, 'runs', runId);
  const t7ArtifactFolder = path.join(T7_ROOT, 'artifacts', runId);
  for (const p of [repoFolder, t7RunFolder, t7ArtifactFolder]) {
    if (fs.existsSync(p)) {
      // Allow if --resume or empty
      const entries = fs.readdirSync(p);
      if (entries.length > 0 && !process.argv.includes('--resume')) {
        throw new Error(`Run folder already exists with contents (will not overwrite): ${p}`);
      }
    } else {
      fs.mkdirSync(p, { recursive: true });
    }
  }
  fs.mkdirSync(path.join(t7ArtifactFolder, 'cleaned_text'), { recursive: true });
  fs.mkdirSync(path.join(t7ArtifactFolder, 'raw_html'), { recursive: true });
  fs.mkdirSync(path.join(t7ArtifactFolder, 'jsonld'), { recursive: true });
  fs.mkdirSync(path.join(t7ArtifactFolder, 'pdf'), { recursive: true });
  return { repoFolder, t7RunFolder, t7ArtifactFolder };
}

// -------------------- File writers --------------------

function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function writeText(filePath: string, text: string): void {
  fs.writeFileSync(filePath, text);
}

// -------------------- A0 deterministic probe --------------------

interface A0Result {
  robotsTxt: { fetched: boolean; statusCode: number; sitemapsAdvertised: string[]; disallows: string[]; allows: string[] };
  sitemapXml: { fetched: boolean; statusCode: number; urlsFound: number; candidatesKept: string[] };
  fixedPathProbes: Array<{
    sourceUrl: string;
    methodTried: string;
    statusCode: number;
    finalUrl: string;
    contentType: string;
    title: string | null;
    sourceFamily: string;
    acceptedForExtraction: boolean;
    rejectedReason: string | null;
    cleanedTextPath: string | null;
    rawHtmlPath: string | null;
    sourceHash: string | null;
    error: string | null;
  }>;
  jsonLdRecords: Array<{ sourceUrl: string; jsonldPath: string; itemCount: number }>;
  sourceSeedMap: string[];
}

const OPPORTUNITY_KEYWORDS = [
  'observership', 'visiting-student', 'visiting student', 'elective', 'electives',
  'away-rotation', 'sub-internship', 'subinternship', 'acting-internship',
  'medical-student', 'medical-students', 'international-student',
  'international-medical', 'img', 'shadow', 'shadowing', 'volunteer',
  'gme', 'graduate-medical', 'residency', 'fellowship', 'careers', 'visa',
  'research', 'student-research', 'credentialing',
];

function urlMatchesOpportunityKeyword(url: string): boolean {
  const u = url.toLowerCase();
  return OPPORTUNITY_KEYWORDS.some(k => u.includes(k));
}

async function runA0Probe(officialDomain: string, paths: RunPaths, runId: string, institutionId: string): Promise<A0Result> {
  const base = officialDomain.startsWith('http') ? officialDomain : `https://${officialDomain}`;
  const baseUrl = new URL(base);
  baseUrl.pathname = '/';
  const root = baseUrl.toString().replace(/\/$/, '');

  const result: A0Result = {
    robotsTxt: { fetched: false, statusCode: 0, sitemapsAdvertised: [], disallows: [], allows: [] },
    sitemapXml: { fetched: false, statusCode: 0, urlsFound: 0, candidatesKept: [] },
    fixedPathProbes: [],
    jsonLdRecords: [],
    sourceSeedMap: [],
  };

  // robots.txt
  await sleep(MIN_DELAY_MS);
  const robotsRes = await fetchUrl(`${root}/robots.txt`, 'GET');
  result.robotsTxt.statusCode = robotsRes.statusCode;
  if (robotsRes.statusCode === 200 && robotsRes.body) {
    result.robotsTxt.fetched = true;
    for (const line of robotsRes.body.split(/\r?\n/)) {
      const t = line.trim();
      if (/^sitemap:/i.test(t)) result.robotsTxt.sitemapsAdvertised.push(t.replace(/^sitemap:\s*/i, '').trim());
      else if (/^disallow:/i.test(t)) result.robotsTxt.disallows.push(t.replace(/^disallow:\s*/i, '').trim());
      else if (/^allow:/i.test(t)) result.robotsTxt.allows.push(t.replace(/^allow:\s*/i, '').trim());
    }
  }

  // sitemap.xml — try root sitemap first, then any advertised.
  // Sitemap-index recursion: if the body is a <sitemapindex>, fetch each child
  // sitemap (bounded) and aggregate URLs. Bounded to avoid runaway crawl.
  const sitemapUrls: string[] = [`${root}/sitemap.xml`, ...result.robotsTxt.sitemapsAdvertised];
  const MAX_CHILD_SITEMAPS = 10;
  const aggregateUrls: string[] = [];
  for (const smUrl of sitemapUrls) {
    if (result.sitemapXml.fetched) break;
    await sleep(MIN_DELAY_MS);
    const smRes = await fetchUrl(smUrl, 'GET');
    result.sitemapXml.statusCode = smRes.statusCode;
    if (smRes.statusCode === 200 && smRes.body) {
      result.sitemapXml.fetched = true;
      const parsed = parseSitemapXml(smRes.body);
      if (parsed.type === 'sitemapindex') {
        // Recurse into child sitemaps (bounded).
        const childSitemaps = parsed.entries.slice(0, MAX_CHILD_SITEMAPS);
        for (const childUrl of childSitemaps) {
          await sleep(MIN_DELAY_MS);
          const childRes = await fetchUrl(childUrl, 'GET');
          if (childRes.statusCode === 200 && childRes.body) {
            const childParsed = parseSitemapXml(childRes.body);
            if (childParsed.type === 'urlset') aggregateUrls.push(...childParsed.entries);
          }
        }
      } else if (parsed.type === 'urlset') {
        aggregateUrls.push(...parsed.entries);
      }
      result.sitemapXml.urlsFound = aggregateUrls.length;
      result.sitemapXml.candidatesKept = aggregateUrls.filter(urlMatchesOpportunityKeyword).slice(0, 100);
    }
  }

  // Fixed-path probes (HEAD first, GET on 2xx/3xx)
  // Skip paths disallowed by robots.txt unless an Allow override makes them OK.
  // For "Disallow: /" + "Allow: /" pattern (Hartford-style), we treat as allowed
  // since the operator's explicit Allow / signals permission.
  const hartfordStyle = result.robotsTxt.disallows.includes('/') && result.robotsTxt.allows.includes('/');
  for (const p of FIXED_PATHS) {
    const url = `${root}${p}`;
    if (!hartfordStyle && isPathDisallowedByRobots(p, result.robotsTxt.disallows, result.robotsTxt.allows)) {
      // Record as skipped-by-robots, do not fetch.
      result.fixedPathProbes.push({
        sourceUrl: url,
        methodTried: 'SKIPPED_BY_ROBOTS',
        statusCode: 0,
        finalUrl: url,
        contentType: '',
        title: null,
        sourceFamily: classifySourceFamily(url, null, null),
        acceptedForExtraction: false,
        rejectedReason: 'disallowed_by_robots_txt',
        cleanedTextPath: null,
        rawHtmlPath: null,
        sourceHash: null,
        error: null,
      });
      continue;
    }
    const r = await headThenGet(url);
    const sourceFamily = classifySourceFamily(url, null, r.body);
    const accepted = r.statusCode >= 200 && r.statusCode < 300 && !!r.body && r.contentType.includes('html');
    let cleanedTextPath: string | null = null;
    let rawHtmlPath: string | null = null;
    let sourceHash: string | null = null;
    let title: string | null = null;
    if (accepted && r.body) {
      const safeName = p.replace(/[\/]/g, '_').replace(/^_+/, '') || 'root';
      rawHtmlPath = path.join(paths.t7ArtifactFolder, 'raw_html', `${safeName}.html`);
      writeText(rawHtmlPath, r.body);
      const text = htmlToText(r.body);
      cleanedTextPath = path.join(paths.t7ArtifactFolder, 'cleaned_text', `${safeName}.txt`);
      writeText(cleanedTextPath, text);
      sourceHash = sha256(text);
      title = extractTitle(r.body);
      const jsonld = extractJsonLd(r.body);
      if (jsonld.length > 0) {
        const jpath = path.join(paths.t7ArtifactFolder, 'jsonld', `${safeName}.json`);
        writeJson(jpath, jsonld);
        result.jsonLdRecords.push({ sourceUrl: url, jsonldPath: jpath, itemCount: jsonld.length });
      }
      result.sourceSeedMap.push(url);
    }
    result.fixedPathProbes.push({
      sourceUrl: url,
      methodTried: r.method,
      statusCode: r.statusCode,
      finalUrl: r.finalUrl,
      contentType: r.contentType,
      title,
      sourceFamily,
      acceptedForExtraction: accepted,
      rejectedReason: accepted ? null : (r.error ?? `status_${r.statusCode}`),
      cleanedTextPath,
      rawHtmlPath,
      sourceHash,
      error: r.error,
    });
  }

  // For sitemap candidates: capture up to first 20 to keep P102-0R bounded
  for (const url of result.sitemapXml.candidatesKept.slice(0, 20)) {
    if (result.sourceSeedMap.includes(url)) continue;
    const r = await headThenGet(url);
    if (r.statusCode >= 200 && r.statusCode < 300 && r.body && r.contentType.includes('html')) {
      const safeName = 'sm_' + sha256(url).slice(0, 16);
      const rawHtmlPath = path.join(paths.t7ArtifactFolder, 'raw_html', `${safeName}.html`);
      writeText(rawHtmlPath, r.body);
      const text = htmlToText(r.body);
      const cleanedTextPath = path.join(paths.t7ArtifactFolder, 'cleaned_text', `${safeName}.txt`);
      writeText(cleanedTextPath, text);
      const sourceHash = sha256(text);
      const title = extractTitle(r.body);
      const sourceFamily = classifySourceFamily(url, title, r.body);
      const jsonld = extractJsonLd(r.body);
      if (jsonld.length > 0) {
        const jpath = path.join(paths.t7ArtifactFolder, 'jsonld', `${safeName}.json`);
        writeJson(jpath, jsonld);
        result.jsonLdRecords.push({ sourceUrl: url, jsonldPath: jpath, itemCount: jsonld.length });
      }
      result.fixedPathProbes.push({
        sourceUrl: url,
        methodTried: 'HEAD_THEN_GET',
        statusCode: r.statusCode,
        finalUrl: r.finalUrl,
        contentType: r.contentType,
        title,
        sourceFamily,
        acceptedForExtraction: true,
        rejectedReason: null,
        cleanedTextPath,
        rawHtmlPath,
        sourceHash,
        error: null,
      });
      result.sourceSeedMap.push(url);
    }
  }

  // Write A0 outputs
  writeJson(path.join(paths.repoFolder, '00_robots_sitemap_probe.json'), { schemaVersion: SCHEMA_VERSION, ...result.robotsTxt, sitemap: result.sitemapXml });
  writeJson(path.join(paths.repoFolder, '00_fixed_path_probe.json'), { schemaVersion: SCHEMA_VERSION, runId, institutionId, probes: result.fixedPathProbes });
  writeJson(path.join(paths.repoFolder, '00_jsonld_extract.json'), { schemaVersion: SCHEMA_VERSION, runId, institutionId, records: result.jsonLdRecords });
  writeJson(path.join(paths.repoFolder, '00_source_seed_map.json'), { schemaVersion: SCHEMA_VERSION, runId, institutionId, sourceSeedMap: result.sourceSeedMap });
  writeJson(path.join(paths.repoFolder, '00_domain_map.json'), { schemaVersion: SCHEMA_VERSION, runId, institutionId, officialDomain, baseUrl: root });

  return result;
}

// -------------------- A1 source map + skeleton --------------------

function buildSourceRecords(a0: A0Result): SourceRecord[] {
  const records: SourceRecord[] = [];
  let i = 1;
  for (const p of a0.fixedPathProbes) {
    const sourceDomain = (() => { try { return new URL(p.sourceUrl).hostname; } catch { return ''; } })();
    records.push({
      schemaVersion: SCHEMA_VERSION,
      sourceId: `src_${i++}`,
      sourceUrl: p.sourceUrl,
      sourceDomain,
      sourceTitle: p.title,
      sourceFamily: p.sourceFamily,
      sourceScope: classifySourceScope(sourceDomain, p.sourceFamily, p.title),
      deterministicProbeType: p.sourceUrl.includes('/sitemap') ? 'SITEMAP' : (p.methodTried === 'HEAD_THEN_GET' && a0.sourceSeedMap.includes(p.sourceUrl) && !FIXED_PATHS.some(f => p.sourceUrl.endsWith(f)) ? 'SITEMAP' : 'FIXED_PATH'),
      acceptedForExtraction: p.acceptedForExtraction,
      rejectedReason: p.rejectedReason,
      sourceStatus: p.statusCode === 200 ? 'FETCHED_OK' :
        p.statusCode === 404 ? 'FETCH_404' :
        p.statusCode === 403 ? 'FETCH_403' :
        p.error === 'timeout' ? 'FETCH_TIMEOUT' :
        p.error === 'redirect_limit' ? 'FETCH_REDIRECT_LIMIT' :
        p.statusCode === 0 ? 'FETCH_OTHER_ERROR' : 'NOT_FETCHED',
      cleanedTextPath: p.cleanedTextPath,
      rawHtmlPath: p.rawHtmlPath,
      sourceHash: p.sourceHash,
      screenshotStatus: 'NOT_APPLICABLE',
      pdfStatus: p.contentType.includes('pdf') ? 'PDF_TEXT_EMPTY_RENDER_PENDING' : 'NOT_PDF',
      jsonLdExtracted: a0.jsonLdRecords.some(r => r.sourceUrl === p.sourceUrl),
      robotsSitemapContext: null,
      capturedAt: p.acceptedForExtraction ? new Date().toISOString() : null,
    });
  }
  return records;
}

function writeA1Outputs(
  paths: RunPaths,
  runId: string,
  institutionId: string,
  canonicalName: string,
  records: SourceRecord[],
  queueRow: QueueRow,
): void {
  const accepted = records.filter(r => r.acceptedForExtraction);
  const rejected = records.filter(r => !r.acceptedForExtraction);

  // 01_source_map.md — human-readable + JSON sidecar
  let sm = `# Source Map — ${canonicalName}\n\nRun: ${runId}\nschemaVersion: ${SCHEMA_VERSION}\n\n## Accepted sources (${accepted.length})\n\n`;
  for (const r of accepted) {
    sm += `- **${r.sourceFamily}** [${r.sourceUrl}](${r.sourceUrl})\n  - sourceScope: ${r.sourceScope}\n  - sha256: \`${r.sourceHash ?? '(none)'}\`\n  - cleanedText: ${r.cleanedTextPath ?? '(none)'}\n`;
  }
  sm += `\n## Rejected sources (${rejected.length})\n\n`;
  for (const r of rejected) {
    sm += `- ${r.sourceUrl} — ${r.sourceStatus} (${r.rejectedReason ?? 'no reason'})\n`;
  }
  writeText(path.join(paths.repoFolder, '01_source_map.md'), sm);
  writeJson(path.join(paths.repoFolder, '01_source_map.json'), { schemaVersion: SCHEMA_VERSION, runId, sources: records });

  // 02_reader_report.md
  const rr = `# Reader Report — ${canonicalName}\n\nRun: ${runId}\nschemaVersion: ${SCHEMA_VERSION}\n\nThis run is a P102-0R framework dry-run. No model-driven interpretation of source text was performed during A1; source text and JSON-LD were captured deterministically. Lane-level depth (A2) is structural skeleton only.\n\n- Sources fetched: ${accepted.length}\n- Sources rejected: ${rejected.length}\n- JSON-LD records: ${records.filter(r => r.jsonLdExtracted).length}\n- PDFs (none expected for P102-0R dry run; cascade marks PDF_TEXT_EMPTY_RENDER_PENDING when encountered)\n\nNext A2 work needs a model reader on cleaned text files to promote claims. Until then, opportunity_objects are empty skeletons.\n`;
  writeText(path.join(paths.repoFolder, '02_reader_report.md'), rr);

  // 03_opportunity_objects.json — HONEST: empty for P102-0R (no model A1)
  writeJson(path.join(paths.repoFolder, '03_opportunity_objects.json'), { schemaVersion: SCHEMA_VERSION, runId, institutionId, opportunities: [], note: 'P102-0R dry run: no model interpretation in A1; opportunity objects deferred to P102-0B / P102-1.' });

  // 04_rejected_sources.json
  writeJson(path.join(paths.repoFolder, '04_rejected_sources.json'), { schemaVersion: SCHEMA_VERSION, runId, rejected: rejected.map(r => ({ sourceUrl: r.sourceUrl, sourceStatus: r.sourceStatus, rejectedReason: r.rejectedReason })) });

  // 05_canonical_institution.json
  // P102-FIX: consult identity canonicalizer to populate parentSystem
  // when the institution belongs to a known multi-campus health system
  // (Memorial Healthcare System, AdventHealth, HCA, etc.). The scope
  // inference function uses parentSystem to detect HEALTH_SYSTEM_LEVEL
  // pages on acronym-only domains like mhs.net where canonical-name
  // tokens don't appear in the domain string.
  const identity = inferIdentity(canonicalName, queueRow.official_domain);
  writeJson(path.join(paths.repoFolder, '05_canonical_institution.json'), {
    schemaVersion: SCHEMA_VERSION,
    institutionId,
    canonicalName,
    aliases: identity.aliases ?? [],
    state: queueRow.state,
    county: queueRow.county || null,
    city: queueRow.city,
    zip: null,
    address: null,
    parentSystem: identity.parentSystem,
    officialDomains: [queueRow.official_domain],
    medicalSchoolAffiliations: [],
    campusType: 'TEACHING_HOSPITAL',
    sourceOfIdentity: 'queue_seed',
    duplicateOf: null,
    doNotMergeReason: null,
    existingP97Packet: null,
    existingP101Packet: null,
    existingLiveListing: null,
    status: 'ACTIVE',
  });

  // 06_coverage_audit.md
  writeText(path.join(paths.repoFolder, '06_coverage_audit.md'), `# Coverage Audit — ${canonicalName}\n\nschemaVersion: ${SCHEMA_VERSION}\n\nA0 deterministic probe coverage:\n- Fixed paths attempted: ${FIXED_PATHS.length}\n- Fixed paths fetched (2xx): ${records.filter(r => r.deterministicProbeType === 'FIXED_PATH' && r.acceptedForExtraction).length}\n- Sitemap candidates fetched: ${records.filter(r => r.deterministicProbeType === 'SITEMAP' && r.acceptedForExtraction).length}\n- JSON-LD records: ${records.filter(r => r.jsonLdExtracted).length}\n\nA2 source-family coverage is not assessed in P102-0R (model reader deferred).\n`);

  // 07_retry_tasks.md
  const blockedOr5xx = records.filter(r => r.sourceStatus === 'FETCH_403' || r.sourceStatus === 'FETCH_TIMEOUT' || r.sourceStatus === 'FETCH_OTHER_ERROR');
  let rt = `# Retry Tasks — ${canonicalName}\n\nschemaVersion: ${SCHEMA_VERSION}\n\n`;
  if (blockedOr5xx.length === 0) rt += 'No retry tasks. All fetches completed (200/404).\n';
  else { rt += 'The following sources need manual retry:\n\n'; for (const r of blockedOr5xx) rt += `- ${r.sourceUrl} — ${r.sourceStatus}\n`; }
  writeText(path.join(paths.repoFolder, '07_retry_tasks.md'), rt);

  // 08_final_report.md (skeleton)
  writeText(path.join(paths.repoFolder, '08_final_report.md'), `# Final Report — ${canonicalName} (P102-0R dry run)\n\nRun: ${runId}\nschemaVersion: ${SCHEMA_VERSION}\n\nFramework dry run completed. See 14_run_summary.json for scores and 15_publish_gate.md for A3 verdict.\n`);

  // 09_final_canonical.json
  writeJson(path.join(paths.repoFolder, '09_final_canonical.json'), { schemaVersion: SCHEMA_VERSION, runId, institutionId, canonicalName, sources: accepted.length, opportunities: 0, note: 'P102-0R framework dry run; opportunity extraction deferred.' });

  // 10_scorecard.md
  writeText(path.join(paths.repoFolder, '10_scorecard.md'), `# Scorecard — ${canonicalName}\n\nschemaVersion: ${SCHEMA_VERSION}\n\n| Score | Value |\n|---|---|\n| searchCompletenessScore | (computed in 14_run_summary.json) |\n| sourceConfidenceScore | (computed in 14_run_summary.json) |\n| artifactCompletenessScore | (computed in 14_run_summary.json) |\n| publicReadinessScore | 0 (P102-0R defers extraction) |\n| futureLaneValueScore | (computed in 14_run_summary.json) |\n| hallucinationRiskScore | 0 (no claims emitted) |\n`);

  // 11/12 canonical enriched (same content as 09 for P102-0R; depth deferred)
  const enriched = { schemaVersion: SCHEMA_VERSION, runId, institutionId, canonicalName, sources: accepted.length, opportunities: 0, depthDeferred: true };
  writeJson(path.join(paths.repoFolder, '11_canonical_enriched.json'), enriched);
  writeJson(path.join(paths.repoFolder, '12_canonical_enriched_v2.json'), enriched);
}

// -------------------- A1.5 audit --------------------

function writeA1_5(paths: RunPaths, runId: string, institutionId: string, a0: A0Result, records: SourceRecord[]): void {
  const familiesPresent = new Set(records.filter(r => r.acceptedForExtraction).map(r => r.sourceFamily));
  const usceFamilies = ['OBSERVERSHIP_PAGE', 'VISITING_STUDENT_PAGE', 'VOLUNTEER_PAGE', 'RESEARCH_PAGE'];
  const futureFamilies = ['GME_PAGE', 'RESIDENCY_PAGE', 'FELLOWSHIP_PAGE', 'CAREERS_PAGE'];
  const missingUsce = usceFamilies.filter(f => !familiesPresent.has(f));
  const sc = Math.round(100 * (records.filter(r => r.acceptedForExtraction).length / Math.max(1, FIXED_PATHS.length)));
  writeJson(path.join(paths.repoFolder, 'A1_5_source_completeness_audit.json'), {
    schemaVersion: SCHEMA_VERSION,
    runId,
    institutionId,
    officialDomainChecked: true,
    robotsChecked: a0.robotsTxt.fetched,
    sitemapChecked: a0.sitemapXml.fetched,
    fixedPathProbesCompleted: a0.fixedPathProbes.length === FIXED_PATHS.length,
    jsonLdChecked: true,
    sourceFamiliesChecked: Array.from(familiesPresent),
    missingSourceFamilies: missingUsce,
    futureFamiliesPresent: futureFamilies.filter(f => familiesPresent.has(f)),
    conceptPacksDeferred: true,
    searchCompletenessScore: sc,
    canProceedToA2: true,
  });
}

// -------------------- A2 depth skeletons --------------------

function writeA2Skeletons(paths: RunPaths, runId: string, records: SourceRecord[]): void {
  const skel = (depthPass: string, families: string[]) => ({
    schemaVersion: SCHEMA_VERSION,
    runId,
    depthPass,
    sourceFamiliesReviewed: records.filter(r => families.includes(r.sourceFamily) && r.acceptedForExtraction).map(r => r.sourceFamily),
    objectsCreated: 0,
    claimsPromoted: 0,
    conflictsFound: [],
    unresolveds: ['P102-0R defers model-driven claim extraction; structural skeleton only.'],
    recoveryTasks: [],
    scoreDeltas: { publicReadinessScore: 0, futureLaneValueScore: 0 },
  });
  writeJson(path.join(paths.repoFolder, 'RT_depth_usce.json'), skel('USCE', ['OBSERVERSHIP_PAGE', 'VISITING_STUDENT_PAGE', 'VOLUNTEER_PAGE', 'RESEARCH_PAGE']));
  writeJson(path.join(paths.repoFolder, 'RT_depth_gme_residency_fellowship.json'), skel('GME_RESIDENCY_FELLOWSHIP', ['GME_PAGE', 'RESIDENCY_PAGE', 'FELLOWSHIP_PAGE']));
  writeJson(path.join(paths.repoFolder, 'RT_depth_jobs_visa.json'), skel('JOBS_VISA', ['CAREERS_PAGE']));
  writeJson(path.join(paths.repoFolder, 'RT_depth_physician_services.json'), skel('PHYSICIAN_SERVICES', []));
  writeJson(path.join(paths.repoFolder, 'RT_depth_negative_evidence.json'), {
    schemaVersion: SCHEMA_VERSION,
    runId,
    depthPass: 'NEGATIVE_EVIDENCE',
    negativeClaims: [],
    unresolveds: ['P102-0R defers negative-evidence quote extraction; placeholder only.'],
  });
  writeJson(path.join(paths.repoFolder, 'RT_depth_source_scope_conflicts.json'), {
    schemaVersion: SCHEMA_VERSION,
    runId,
    depthPass: 'SOURCE_SCOPE_CONFLICTS',
    conflicts: [],
    unresolveds: ['P102-0R defers scope-conflict surfacing; placeholder only.'],
  });
}

// -------------------- A2.5 semantic miss --------------------

function writeA2_5(paths: RunPaths, runId: string, records: SourceRecord[]): void {
  const flags: Array<{ check: string; triggered: boolean; detail: string }> = [];
  const accepted = records.filter(r => r.acceptedForExtraction);
  // P102-0R defers claim extraction so most semantic-miss checks are vacuously true (no claims to compare against).
  // We still record which signals are PRESENT for future P102-1 model run.
  const cleanedTexts = accepted.map(r => ({ url: r.sourceUrl, text: r.cleanedTextPath ? fs.readFileSync(r.cleanedTextPath, 'utf8').toLowerCase() : '' }));
  const allText = cleanedTexts.map(c => c.text).join('\n');
  const hasKeyword = (kws: string[]): boolean => kws.some(k => allText.includes(k));
  flags.push({ check: 'student_rotation_present', triggered: hasKeyword(['student']) && hasKeyword(['rotation']), detail: 'student + rotation keywords detected; visiting-student object extraction deferred to P102-1.' });
  flags.push({ check: 'elective_m4_present', triggered: hasKeyword(['elective']) && hasKeyword(['fourth-year', 'fourth year', 'm4']), detail: 'elective + M4 keywords detected; elective object extraction deferred to P102-1.' });
  flags.push({ check: 'observer_shadow_present', triggered: hasKeyword(['observer', 'shadow']), detail: 'observer/shadow keywords detected; observership object extraction deferred.' });
  flags.push({ check: 'volunteer_page_classification_pending', triggered: accepted.some(r => r.sourceFamily === 'VOLUNTEER_PAGE'), detail: 'Volunteer page captured; positive/negative USCE classification deferred.' });
  flags.push({ check: 'visa_signals_present', triggered: hasKeyword(['j-1', 'h-1b']), detail: 'visa signals detected; visa object extraction deferred.' });
  flags.push({ check: 'faculty_apply_present', triggered: hasKeyword(['faculty']) && hasKeyword(['apply']), detail: 'faculty + apply keywords detected; future-lane job object extraction deferred.' });
  flags.push({ check: 'pdf_pending', triggered: accepted.some(r => r.pdfStatus === 'PDF_TEXT_EMPTY_RENDER_PENDING'), detail: 'PDF detected but text extraction pending; add pdf-parse in P102-0B if needed.' });
  flags.push({ check: 'jsonld_not_reflected_in_source_map', triggered: false, detail: 'JSON-LD captured in source_map sidecar; reflected in source records.' });
  writeJson(path.join(paths.repoFolder, 'RT_semantic_miss_detector.json'), { schemaVersion: SCHEMA_VERSION, runId, flags, note: 'P102-0R defers concept-pack synonym lexicon; flags represent forward work for P102-1.' });
}

// -------------------- A3 hostile gate (no network, no Agent, run-folder only) --------------------

function runA3Gate(paths: RunPaths, runId: string, institutionId: string, canonicalName: string): { verdict: string; publicSafe: boolean; futureLaneValue: string; unsupportedClaims: string[]; requiredA4Tasks: string[] } {
  // A3 reads ONLY files in paths.repoFolder. No network calls.
  const repoFolder = paths.repoFolder;
  const sourceMap = JSON.parse(fs.readFileSync(path.join(repoFolder, '01_source_map.json'), 'utf8')) as { sources: SourceRecord[] };
  const opportunities = JSON.parse(fs.readFileSync(path.join(repoFolder, '03_opportunity_objects.json'), 'utf8')) as { opportunities: unknown[] };
  const audit = JSON.parse(fs.readFileSync(path.join(repoFolder, 'A1_5_source_completeness_audit.json'), 'utf8'));
  const negEv = JSON.parse(fs.readFileSync(path.join(repoFolder, 'RT_depth_negative_evidence.json'), 'utf8')) as { negativeClaims: unknown[] };

  const hallucinationRisks: string[] = [];
  const unsupportedClaims: string[] = [];
  const quoteVerificationFailures: string[] = [];
  const sourceScopeConflicts: string[] = [];
  const missingCriticalFields: string[] = [];
  const negativeEvidenceFindings: string[] = [];
  const requiredA4Tasks: string[] = [];

  // P102-0R: no claims emitted → no claim-level overclaim risk
  if ((opportunities.opportunities ?? []).length > 0) {
    hallucinationRisks.push('Opportunity objects present but P102-0R defers model extraction; verify each.');
  }
  if ((negEv.negativeClaims ?? []).length > 0) {
    hallucinationRisks.push('Negative claims present but P102-0R defers extraction; verify each.');
  }

  // Source coverage
  const accepted = (sourceMap.sources ?? []).filter(s => s.acceptedForExtraction);
  if (accepted.length === 0) {
    missingCriticalFields.push('No accepted sources fetched. A0 probe produced zero usable artifacts.');
    requiredA4Tasks.push('Re-run A0 probe with debug logging; verify official_domain is correct and reachable.');
  }
  if (!audit.robotsChecked) requiredA4Tasks.push('robots.txt not reachable; investigate domain configuration.');
  if (!audit.sitemapChecked) requiredA4Tasks.push('sitemap.xml not reachable; rely on fixed-path probes only.');

  const publicSafe = false; // P102-0R never emits PUBLIC_SAFE on the dry run because A2 model extraction is deferred.
  const futureLaneValue = accepted.some(s => ['CAREERS_PAGE', 'RESIDENCY_PAGE', 'FELLOWSHIP_PAGE', 'GME_PAGE'].includes(s.sourceFamily)) ? 'MEDIUM' : 'LOW';
  const verdict = accepted.length === 0 ? 'FAIL_NEEDS_A4' : 'PASS_WITH_CAVEATS';

  const a3 = {
    schemaVersion: SCHEMA_VERSION,
    runId,
    institutionId,
    canonicalName,
    verdict,
    networkUsed: false,
    agentUsed: false,
    publicSafe,
    futureLaneValue,
    hallucinationRisks,
    unsupportedClaims,
    quoteVerificationFailures,
    sourceScopeConflicts,
    missingCriticalFields,
    negativeEvidenceFindings,
    requiredA4Tasks,
    finalRecommendation:
      verdict === 'FAIL_NEEDS_A4'
        ? 'A0 probe failed to capture sources. Resolve before Trial 2.'
        : 'Framework dry run passed structural gates. Public extraction deferred to P102-1 with model A1/A2 enabled.',
  };

  writeJson(path.join(paths.repoFolder, 'A3_gate.json'), a3);
  writeText(
    path.join(paths.repoFolder, '15_publish_gate.md'),
    `# Publish Gate (A3) — ${canonicalName}\n\nRun: ${runId}\nschemaVersion: ${SCHEMA_VERSION}\n\n` +
    `**A3 read only run-folder files. No network. No Agent.**\n\n` +
    `- Verdict: ${verdict}\n` +
    `- Public safe: ${publicSafe}\n` +
    `- Future lane value: ${futureLaneValue}\n` +
    `- networkUsed: false\n- agentUsed: false\n\n` +
    `## Missing critical fields\n${missingCriticalFields.length ? missingCriticalFields.map(s => `- ${s}`).join('\n') : '_(none)_'}\n\n` +
    `## Required A4 tasks\n${requiredA4Tasks.length ? requiredA4Tasks.map(s => `- ${s}`).join('\n') : '_(none)_'}\n\n` +
    `## Final recommendation\n${a3.finalRecommendation}\n`
  );
  return { verdict, publicSafe, futureLaneValue, unsupportedClaims, requiredA4Tasks };
}

// -------------------- Index updates --------------------

function updateT7Indexes(runId: string, institutionId: string, canonicalName: string, queueRow: QueueRow, records: SourceRecord[], a3: { verdict: string; publicSafe: boolean }, paths: RunPaths, scores: Record<string, number>): void {
  const indexDir = path.join(T7_ROOT, 'indexes');
  const now = new Date().toISOString();

  appendCsvRow(path.join(indexDir, 'institution_index.csv'), {
    schema_version: SCHEMA_VERSION,
    institution_id: institutionId,
    canonical_name: canonicalName,
    aliases: '',
    state: queueRow.state,
    county: queueRow.county || '',
    city: queueRow.city,
    zip: '',
    address: '',
    parent_system: '',
    official_domains: queueRow.official_domain,
    medical_school_affiliations: '',
    campus_type: 'TEACHING_HOSPITAL',
    source_of_identity: 'queue_seed',
    duplicate_of: '',
    do_not_merge_reason: '',
    existing_p97_packet: '',
    existing_p101_packet: '',
    existing_live_listing: '',
    status: 'ACTIVE',
  });

  appendCsvRow(path.join(indexDir, 'run_index.csv'), {
    schema_version: SCHEMA_VERSION,
    run_id: runId,
    institution_id: institutionId,
    canonical_name: canonicalName,
    queue_id: queueRow.queue_id,
    started_at: now,
    completed_at: now,
    status: 'COMPLETE',
    current_stage: 'DONE',
    verdict: a3.verdict,
    public_safe: a3.publicSafe ? 'true' : 'false',
    search_completeness_score: String(scores.searchCompletenessScore ?? 0),
    public_readiness_score: '0',
    future_lane_value_score: String(scores.futureLaneValueScore ?? 0),
    hallucination_risk_score: '0',
    validators_pass: 'pending',
    artifact_root: paths.t7ArtifactFolder,
    repo_run_folder: paths.repoFolder,
    notes: 'P102-0R framework dry run',
  });

  for (const r of records.filter(r => r.acceptedForExtraction)) {
    appendCsvRow(path.join(indexDir, 'source_url_index.csv'), {
      schema_version: SCHEMA_VERSION,
      source_id: r.sourceId,
      run_id: runId,
      institution_id: institutionId,
      source_url: r.sourceUrl,
      source_domain: r.sourceDomain,
      source_family: r.sourceFamily,
      source_scope: r.sourceScope,
      deterministic_probe_type: r.deterministicProbeType,
      accepted_for_extraction: 'true',
      source_status: r.sourceStatus,
      sha256: r.sourceHash ?? '',
      captured_at: r.capturedAt ?? '',
      notes: '',
    });
    if (r.cleanedTextPath) {
      appendCsvRow(path.join(indexDir, 'artifact_index.csv'), {
        schema_version: SCHEMA_VERSION,
        artifact_id: `art_${r.sourceId}_cleaned`,
        run_id: runId,
        institution_id: institutionId,
        source_url: r.sourceUrl,
        artifact_type: 'CLEANED_TEXT',
        path: r.cleanedTextPath,
        sha256: r.sourceHash ?? '',
        captured_at: r.capturedAt ?? '',
        status: 'OK',
        failure_reason: '',
      });
    }
    if (r.rawHtmlPath) {
      appendCsvRow(path.join(indexDir, 'artifact_index.csv'), {
        schema_version: SCHEMA_VERSION,
        artifact_id: `art_${r.sourceId}_raw`,
        run_id: runId,
        institution_id: institutionId,
        source_url: r.sourceUrl,
        artifact_type: 'RAW_HTML',
        path: r.rawHtmlPath,
        sha256: '',
        captured_at: r.capturedAt ?? '',
        status: 'OK',
        failure_reason: '',
      });
    }
  }
}

// -------------------- Artifact manifest CSV --------------------

function writeArtifactManifest(paths: RunPaths, runId: string, institutionId: string, records: SourceRecord[]): void {
  const lines: string[] = ['schema_version,artifact_id,run_id,institution_id,source_url,artifact_type,path,sha256,captured_at,status,failure_reason'];
  let i = 1;
  for (const r of records.filter(r => r.acceptedForExtraction)) {
    if (r.cleanedTextPath) {
      lines.push([SCHEMA_VERSION, `manifest_${i++}`, runId, institutionId, r.sourceUrl, 'CLEANED_TEXT', r.cleanedTextPath, r.sourceHash ?? '', r.capturedAt ?? '', 'OK', ''].map(toCsvField).join(','));
    }
    if (r.rawHtmlPath) {
      lines.push([SCHEMA_VERSION, `manifest_${i++}`, runId, institutionId, r.sourceUrl, 'RAW_HTML', r.rawHtmlPath, '', r.capturedAt ?? '', 'OK', ''].map(toCsvField).join(','));
    }
  }
  writeText(path.join(paths.repoFolder, '00_artifact_manifest.csv'), lines.join('\n') + '\n');
}

// -------------------- Bootstrap json --------------------

function writeBootstrap(paths: RunPaths, runId: string, queueRow: QueueRow): void {
  writeJson(path.join(paths.repoFolder, '00_bootstrap.json'), {
    schemaVersion: SCHEMA_VERSION,
    runId,
    queueId: queueRow.queue_id,
    institutionId: queueRow.institution_id,
    canonicalName: queueRow.canonical_name,
    officialDomain: queueRow.official_domain,
    state: queueRow.state,
    city: queueRow.city,
    targetLanes: queueRow.target_lanes.split('|').filter(Boolean),
    bootstrappedAt: new Date().toISOString(),
    runnerVersion: 'p102-0r-1',
    notes: 'Deterministic bootstrap before any model interpretation.',
  });
}

// -------------------- Main --------------------

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  console.log(`[p102] queue=${args.queue} runId=${args.runId} limit=${args.limit}`);

  const queueText = fs.readFileSync(path.resolve(args.queue), 'utf8');
  const rows = parseCsv(queueText) as unknown as QueueRow[];
  const candidates = rows.filter(r => (r.status || 'NOT_STARTED') === 'NOT_STARTED' && (!args.institutionId || r.institution_id === args.institutionId));
  if (candidates.length === 0) throw new Error('No NOT_STARTED institutions in queue');
  const row = candidates[0];
  console.log(`[p102] selected: ${row.canonical_name} (${row.institution_id}) at ${row.official_domain}`);

  const paths = createRunFolders(args.runId);
  const lock = acquireLock(paths.t7RunFolder, args.runId);

  try {
    writeBootstrap(paths, args.runId, row);

    console.log('[p102] A0 deterministic probe…');
    const a0 = await runA0Probe(row.official_domain, paths, args.runId, row.institution_id);
    console.log(`[p102] A0: ${a0.fixedPathProbes.length} probes, ${a0.fixedPathProbes.filter(p => p.acceptedForExtraction).length} accepted, ${a0.jsonLdRecords.length} JSON-LD records`);

    const records = buildSourceRecords(a0);
    writeArtifactManifest(paths, args.runId, row.institution_id, records);

    console.log('[p102] A1 source map + skeletons…');
    writeA1Outputs(paths, args.runId, row.institution_id, row.canonical_name, records, row);

    console.log('[p102] A1.5 source completeness audit…');
    writeA1_5(paths, args.runId, row.institution_id, a0, records);

    console.log('[p102] A2 depth skeletons…');
    writeA2Skeletons(paths, args.runId, records);

    console.log('[p102] A2.5 semantic miss detector…');
    writeA2_5(paths, args.runId, records);

    console.log('[p102] A3 hostile gate (no network, no Agent, run-folder only)…');
    const a3 = runA3Gate(paths, args.runId, row.institution_id, row.canonical_name);

    const accepted = records.filter(r => r.acceptedForExtraction);
    const scores = {
      searchCompletenessScore: Math.round(100 * (accepted.length / Math.max(1, FIXED_PATHS.length))),
      sourceConfidenceScore: 100, // all sources are official domain (queue-seeded)
      artifactCompletenessScore: Math.round(100 * (accepted.filter(r => r.sourceHash).length / Math.max(1, accepted.length))),
      publicReadinessScore: 0,
      futureLaneValueScore: a3.futureLaneValue === 'HIGH' ? 75 : a3.futureLaneValue === 'MEDIUM' ? 50 : 25,
      hallucinationRiskScore: 0,
    };

    writeJson(path.join(paths.repoFolder, '14_run_summary.json'), {
      schemaVersion: SCHEMA_VERSION,
      runId: args.runId,
      institutionId: row.institution_id,
      canonicalName: row.canonical_name,
      queueId: row.queue_id,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: 'COMPLETE',
      currentStage: 'DONE',
      artifactRoot: paths.t7ArtifactFolder,
      repoRunFolder: paths.repoFolder,
      sourceFamilies: Array.from(new Set(accepted.map(r => r.sourceFamily))),
      scores,
      verdict: a3.verdict,
      validators: { validateP102: 'NOT_RUN', validateNoSecrets: 'NOT_RUN', tsc: 'NOT_RUN' },
      nextAction: a3.verdict === 'FAIL_NEEDS_A4' ? 'investigate_a0_failure' : 'proceed_to_trial_2_p102_1',
    });

    console.log('[p102] updating T7 indexes…');
    updateT7Indexes(args.runId, row.institution_id, row.canonical_name, row, records, a3, paths, scores);

    console.log(`[p102] DONE. verdict=${a3.verdict} accepted=${accepted.length} runId=${args.runId}`);
  } finally {
    lock.release();
  }
}

main().catch(err => {
  console.error('[p102] FATAL:', err);
  process.exit(1);
});
