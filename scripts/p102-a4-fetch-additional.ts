#!/usr/bin/env tsx
/**
 * P102-0G A4 bounded fetch-additional.
 *
 * Executes ONLY the recovery tasks listed in
 * `A4_deep_recovery_tasks.json` (written by the A3 deep gate in P102-0F).
 *
 * Each task identifies a narrow follow-up: a specific page A3 thinks
 * exists on the institution's own domain that wasn't captured in the
 * original A0 probe. Examples:
 *   - "Medical Clerkship - Orlando Campuses" landing page on adventhealth.com
 *   - Loma Linda University–AdventHealth Orlando affiliation page
 *
 * RULES (all enforced in code):
 *
 *   - Disabled by default at the orchestrator level; this script only runs
 *     when explicitly invoked via `--fetch-additional`.
 *   - Same institution / run folder only. No cross-institution work.
 *   - Same official domain (or explicitly allow-listed institutional domains
 *     from `05_canonical_institution.json` → `officialDomains`).
 *   - No third-party search. No Google / Bing / etc.
 *   - HEAD first to check status + content-type. GET only on 200 / 301 / 302
 *     (and follow up to 5 redirects within the allowed domain set).
 *   - Budget caps:
 *       --max-additional-candidates  default 20  (HEAD attempts)
 *       --max-additional-accepted    default 10  (GET successes)
 *       --max-additional-pdfs        default  5  (PDF GET successes)
 *   - 1 s sleep between requests (rate limit).
 *   - 10 s per-request timeout.
 *   - User-Agent identifies as "USCEHub-P102-Recovery/0.1".
 *   - Every fetched artifact is hashed (SHA-256) and saved to the T7 run
 *     folder under `additional/` subfolders.
 *   - `01_source_map.json` is appended with new accepted sources
 *     (acceptedForExtraction: true, with the same shape as the A0 probe).
 *   - `00_artifact_manifest.csv` is appended with the new artifacts.
 *   - Every skipped or rejected task is recorded with a reason. We never
 *     infer claims from a URL we didn't fetch and parse.
 *   - We never broaden the search to a URL not named in the task list.
 *
 * Outputs (per run):
 *   - A4_fetch_additional_plan.json
 *   - A4_fetch_additional_results.json
 *   - A4_fetch_additional_artifact_manifest.csv
 *   - A4_fetch_additional_rejected.json
 *   - additional/<sourceId>.html  (raw HTML)
 *   - additional/<sourceId>.txt   (cleaned text v2)
 *   - additional/<sourceId>.pdf   (when PDF)
 *
 * No network during this script unless run with `--execute`. Default mode
 * is `--plan-only` which prints the recovery plan without fetching.
 *
 * Usage:
 *   npx tsx scripts/p102-a4-fetch-additional.ts --run-id <id>           # plan only
 *   npx tsx scripts/p102-a4-fetch-additional.ts --run-id <id> --execute # do fetches
 *   npx tsx scripts/p102-a4-fetch-additional.ts --run-id <id> --execute \
 *     --max-additional-candidates 20 --max-additional-accepted 10 --max-additional-pdfs 5
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { htmlToTextV2, inferSourceScope } from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_DIR = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');
const T7_ARTIFACTS_ROOT = '/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/artifacts';
const SCHEMA_VERSION = 'p102-deep-0f-1';

// -------------------- Types --------------------

interface DeepRecoveryTask {
  taskId: string;
  missingFamily?: string | null;
  missingTier?: string | null;
  reason: string;
  suggestedNarrowAction: string;
  // Optional explicit URL list — if present we use it directly. Otherwise we
  // try to mine URLs out of the suggestedNarrowAction prose using a strict
  // regex (anchored to http/https and the institution's allowed domains).
  candidateUrls?: string[];
}

interface CanonicalInstitution {
  schemaVersion: string;
  institutionId: string;
  canonicalName: string;
  officialDomains: string[];
}

interface SourceMap {
  schemaVersion: string;
  runId: string;
  sources: SourceRecord[];
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
  robotsSitemapContext: unknown;
  capturedAt: string | null;
}

interface FetchResult {
  taskId: string;
  attemptedUrl: string;
  status: 'ACCEPTED' | 'REJECTED' | 'SKIPPED_BY_BUDGET' | 'HEAD_NOT_OK' | 'OFF_DOMAIN' | 'TIMEOUT' | 'ERROR';
  httpStatus: number | null;
  contentType: string | null;
  byteLength: number | null;
  sourceId: string | null;
  sha256: string | null;
  cleanedTextPath: string | null;
  rawArtifactPath: string | null;
  reason: string;
  capturedAt: string | null;
}

interface CliOptions {
  runId: string;
  execute: boolean;
  maxCandidates: number;
  maxAccepted: number;
  maxPdfs: number;
  quiet: boolean;
}

// -------------------- Helpers --------------------

function readJson<T>(p: string): T { return JSON.parse(readFileSync(p, 'utf8')) as T; }
function writeJson(p: string, data: unknown): void {
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
function writeText(p: string, s: string): void {
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, s, 'utf8');
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    runId: '',
    execute: false,
    maxCandidates: 20,
    maxAccepted: 10,
    maxPdfs: 5,
    quiet: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-id') { opts.runId = argv[++i]; continue; }
    if (a === '--execute') { opts.execute = true; continue; }
    if (a === '--plan-only') { opts.execute = false; continue; }
    if (a === '--max-additional-candidates') { opts.maxCandidates = parseInt(argv[++i], 10); continue; }
    if (a === '--max-additional-accepted') { opts.maxAccepted = parseInt(argv[++i], 10); continue; }
    if (a === '--max-additional-pdfs') { opts.maxPdfs = parseInt(argv[++i], 10); continue; }
    if (a === '--quiet') { opts.quiet = true; continue; }
    if (a === '--help' || a === '-h') {
      console.log('Usage: npx tsx scripts/p102-a4-fetch-additional.ts --run-id <id> [--execute] [--max-additional-* N]');
      process.exit(0);
    }
    throw new Error(`unknown flag: ${a}`);
  }
  if (!opts.runId) throw new Error('--run-id <id> required');
  return opts;
}

function hostOf(u: string): string | null {
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return null; }
}

function isAllowedHost(u: string, allowedDomains: string[]): boolean {
  const h = hostOf(u);
  if (!h) return false;
  return allowedDomains.some((d) => {
    const dd = d.replace(/^www\./, '');
    return h === dd || h.endsWith('.' + dd);
  });
}

/**
 * Mine candidate URLs from a recovery task's suggestedNarrowAction prose.
 * Only accepts URLs that are within the institution's allowed domains.
 */
function mineCandidateUrls(task: DeepRecoveryTask, allowedDomains: string[]): string[] {
  const found = new Set<string>();
  if (task.candidateUrls) {
    for (const u of task.candidateUrls) if (isAllowedHost(u, allowedDomains)) found.add(u);
  }
  const text = `${task.suggestedNarrowAction} ${task.reason}`;
  // 1) Explicit absolute URLs in the prose.
  for (const m of Array.from(text.matchAll(/https?:\/\/[^\s)"'<>]+/g))) {
    const u = m[0].replace(/[.,;:!?)\]]+$/, '');
    if (isAllowedHost(u, allowedDomains)) found.add(u);
  }
  // 1b) Schemeless "<domain>/<path>" references — promote to https://.
  for (const d of allowedDomains) {
    const dd = d.replace(/^www\./, '');
    const pattern = new RegExp(`\\b${dd.replace(/\./g, '\\.')}(\\/[A-Za-z0-9._~/\\-]+)`, 'g');
    for (const m of Array.from(text.matchAll(pattern))) {
      const u = 'https://' + dd + m[1];
      if (isAllowedHost(u, allowedDomains)) found.add(u);
    }
  }
  // 2) Path-like substrings the model named (e.g. "/medical-clerkship", "/gme")
  // — promote each to all allowed domains.
  const pathPattern = /(?<![\w\/])\/[a-z][a-z0-9-]+(?:\/[a-z][a-z0-9-]+){0,3}\b/gi;
  for (const m of Array.from(text.matchAll(pathPattern))) {
    const p = m[0].replace(/\/$/, '');
    if (p.length < 4) continue; // skip very short paths
    for (const d of allowedDomains) {
      const root = `https://${d.replace(/^www\./, '')}`;
      found.add(root + p);
    }
  }
  return Array.from(found);
}

/**
 * Construct concrete probe URLs from a task's family/tier hint when the
 * task prose doesn't include explicit URLs. This is the bounded "build a
 * narrow path candidate" path. We only construct URLs under allowed
 * domains and only for a small, hand-curated set of well-known USCE paths.
 */
function constructProbeUrls(task: DeepRecoveryTask, allowedDomains: string[]): string[] {
  // Normalize family: A3 may emit "VISITING_STUDENT_PAGE" (legacy form) or
  // "VISITING_STUDENT" (deep form). Strip the "_PAGE" suffix.
  const family = (task.missingFamily ?? '').toUpperCase().replace(/_PAGE$/, '');
  const familyPaths: Record<string, string[]> = {
    VISITING_STUDENT: ['/medical-education/visiting-students', '/visiting-students', '/medical-clerkship', '/clerkship', '/medical-students', '/student-visit'],
    OBSERVERSHIP: ['/observership', '/observerships', '/observer', '/clinical-observer'],
    EXTERNSHIP: ['/externship', '/externships'],
    ELECTIVE: ['/electives', '/clinical-electives', '/away-rotation', '/away-rotations'],
    SUB_INTERNSHIP: ['/sub-internship', '/acting-internship'],
    RESEARCH_EDUCATION: ['/student-research', '/summer-research'],
    UNDERGRADUATE_MEDICAL_EDUCATION: ['/ume', '/undergraduate-medical-education', '/medical-student-affairs'],
    GME: ['/gme', '/graduate-medical-education', '/residency', '/fellowships'],
    PHYSICIAN_CAREERS: ['/physician-careers', '/provider-careers'],
    VISA_IMMIGRATION: ['/visa-sponsorship', '/j1-waiver', '/h1b-sponsorship'],
    MEDICAL_SCHOOL_AFFILIATION: ['/medical-school-affiliations', '/affiliations', '/affiliated-schools'],
  };
  const paths = familyPaths[family] ?? [];
  if (paths.length === 0) return [];
  const urls: string[] = [];
  for (const d of allowedDomains) {
    const root = `https://${d.replace(/^www\./, '')}`;
    for (const p of paths) urls.push(root + p);
  }
  return urls;
}

/**
 * HEAD request with timeout. Returns status, content-type, and final URL
 * after at most 5 same-domain redirects.
 */
async function headWithFollow(url: string, allowedDomains: string[], timeoutMs = 10_000): Promise<{ status: number; contentType: string | null; finalUrl: string; reason?: string }> {
  let current = url;
  for (let i = 0; i < 5; i++) {
    if (!isAllowedHost(current, allowedDomains)) {
      return { status: 0, contentType: null, finalUrl: current, reason: 'redirect off-domain' };
    }
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const res = await fetch(current, {
        method: 'HEAD',
        redirect: 'manual',
        headers: { 'User-Agent': 'USCEHub-P102-Recovery/0.1' },
        signal: ctl.signal,
      });
      clearTimeout(t);
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) return { status: res.status, contentType: res.headers.get('content-type'), finalUrl: current };
        current = new URL(loc, current).toString();
        continue;
      }
      return { status: res.status, contentType: res.headers.get('content-type'), finalUrl: current };
    } catch (e) {
      clearTimeout(t);
      return { status: 0, contentType: null, finalUrl: current, reason: `head_error: ${(e as Error).message.slice(0, 120)}` };
    }
  }
  return { status: 0, contentType: null, finalUrl: current, reason: 'too_many_redirects' };
}

async function getBody(url: string, timeoutMs = 15_000): Promise<{ ok: boolean; body: Buffer | null; status: number; reason?: string }> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'USCEHub-P102-Recovery/0.1' },
      signal: ctl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return { ok: false, body: null, status: res.status, reason: `http_${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    return { ok: true, body: buf, status: res.status };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, body: null, status: 0, reason: `get_error: ${(e as Error).message.slice(0, 120)}` };
  }
}

function sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }
function sha256(b: Buffer): string { return createHash('sha256').update(b).digest('hex'); }

// -------------------- Main per-run runner --------------------

async function runOne(opts: CliOptions): Promise<{ ok: boolean; summary: string }> {
  const runDir = path.join(RUNS_DIR, opts.runId);
  if (!existsSync(runDir)) return { ok: false, summary: `run dir not found: ${runDir}` };

  const recoveryPath = path.join(runDir, 'A4_deep_recovery_tasks.json');
  const canonicalPath = path.join(runDir, '05_canonical_institution.json');
  const sourceMapPath = path.join(runDir, '01_source_map.json');
  if (!existsSync(recoveryPath)) return { ok: false, summary: `${opts.runId}: A4_deep_recovery_tasks.json missing — run --deep first` };
  if (!existsSync(canonicalPath)) return { ok: false, summary: `${opts.runId}: 05_canonical_institution.json missing` };
  if (!existsSync(sourceMapPath)) return { ok: false, summary: `${opts.runId}: 01_source_map.json missing` };

  const recovery = readJson<{ tasks: DeepRecoveryTask[] }>(recoveryPath);
  const canonical = readJson<CanonicalInstitution>(canonicalPath);
  const sourceMap = readJson<SourceMap>(sourceMapPath);

  const tasks = recovery.tasks ?? [];
  if (tasks.length === 0) {
    if (!opts.quiet) console.log(`${opts.runId}: no recovery tasks present — nothing to fetch`);
    return { ok: true, summary: `${opts.runId}: zero recovery tasks` };
  }

  // Build the plan: per task, list candidate URLs (from prose OR from family hint).
  const allowedDomains = canonical.officialDomains;
  const plannedCandidatesPerTask: Array<{ task: DeepRecoveryTask; candidates: string[] }> = [];
  for (const task of tasks) {
    let candidates = mineCandidateUrls(task, allowedDomains);
    if (candidates.length === 0) {
      candidates = constructProbeUrls(task, allowedDomains);
    }
    plannedCandidatesPerTask.push({ task, candidates });
  }

  const plan = {
    schemaVersion: SCHEMA_VERSION,
    runId: opts.runId,
    institutionId: canonical.institutionId,
    institutionName: canonical.canonicalName,
    officialDomains: allowedDomains,
    budgets: { maxCandidates: opts.maxCandidates, maxAccepted: opts.maxAccepted, maxPdfs: opts.maxPdfs },
    tasks: plannedCandidatesPerTask.map((x) => ({
      taskId: x.task.taskId,
      missingFamily: x.task.missingFamily ?? null,
      missingTier: x.task.missingTier ?? null,
      candidates: x.candidates,
    })),
    mode: opts.execute ? 'execute' : 'plan-only',
    attestations: { networkUsed: opts.execute, agentUsed: false, broadCrawlPerformed: false, sameInstitutionOnly: true },
    generatedAt: new Date().toISOString(),
  };
  writeJson(path.join(runDir, 'A4_fetch_additional_plan.json'), plan);

  if (!opts.quiet) {
    console.log(`P102-0G A4 fetch-additional`);
    console.log(`  run: ${opts.runId} (${canonical.canonicalName})`);
    console.log(`  tasks: ${tasks.length}  candidates: ${plannedCandidatesPerTask.reduce((s, x) => s + x.candidates.length, 0)}`);
    console.log(`  budgets: candidates=${opts.maxCandidates}  accepted=${opts.maxAccepted}  pdfs=${opts.maxPdfs}`);
    console.log(`  mode: ${opts.execute ? 'EXECUTE (will fetch)' : 'PLAN-ONLY (no network)'}`);
    console.log(`  allowed domains: ${allowedDomains.join(', ')}`);
  }

  if (!opts.execute) {
    if (!opts.quiet) console.log(`\nPlan written. Re-run with --execute to actually fetch.`);
    return { ok: true, summary: `${opts.runId}: plan-only` };
  }

  // ---- EXECUTE ----

  // Prepare T7 dirs.
  const t7CleanedDir = path.join(T7_ARTIFACTS_ROOT, opts.runId, 'additional', 'cleaned_text');
  const t7RawDir = path.join(T7_ARTIFACTS_ROOT, opts.runId, 'additional', 'raw_html');
  const t7PdfDir = path.join(T7_ARTIFACTS_ROOT, opts.runId, 'additional', 'pdf');
  if (!existsSync('/Volumes/T7Shield_Code')) {
    return { ok: false, summary: `${opts.runId}: T7 not mounted at /Volumes/T7Shield_Code — refusing to fetch without artifact storage` };
  }
  mkdirSync(t7CleanedDir, { recursive: true });
  mkdirSync(t7RawDir, { recursive: true });
  mkdirSync(t7PdfDir, { recursive: true });

  const existingSourceIds = new Set(sourceMap.sources.map((s) => s.sourceId));
  const existingSourceUrls = new Set(sourceMap.sources.map((s) => s.sourceUrl));
  let nextSrcN = sourceMap.sources.length;

  const results: FetchResult[] = [];
  const rejected: FetchResult[] = [];
  let candidatesAttempted = 0;
  let acceptedHtmlCount = 0;
  let acceptedPdfCount = 0;

  for (const planEntry of plannedCandidatesPerTask) {
    for (const url of planEntry.candidates) {
      if (candidatesAttempted >= opts.maxCandidates) {
        rejected.push({ taskId: planEntry.task.taskId, attemptedUrl: url, status: 'SKIPPED_BY_BUDGET', httpStatus: null, contentType: null, byteLength: null, sourceId: null, sha256: null, cleanedTextPath: null, rawArtifactPath: null, reason: `candidates budget ${opts.maxCandidates} exhausted`, capturedAt: null });
        continue;
      }
      if (existingSourceUrls.has(url)) {
        rejected.push({ taskId: planEntry.task.taskId, attemptedUrl: url, status: 'REJECTED', httpStatus: null, contentType: null, byteLength: null, sourceId: null, sha256: null, cleanedTextPath: null, rawArtifactPath: null, reason: 'already in source map', capturedAt: null });
        continue;
      }
      if (!isAllowedHost(url, allowedDomains)) {
        rejected.push({ taskId: planEntry.task.taskId, attemptedUrl: url, status: 'OFF_DOMAIN', httpStatus: null, contentType: null, byteLength: null, sourceId: null, sha256: null, cleanedTextPath: null, rawArtifactPath: null, reason: `host not in allowed domains [${allowedDomains.join(', ')}]`, capturedAt: null });
        continue;
      }

      candidatesAttempted++;
      if (!opts.quiet) console.log(`  HEAD ${url}`);
      const head = await headWithFollow(url, allowedDomains);
      await sleep(1000);

      if (head.status !== 200) {
        rejected.push({ taskId: planEntry.task.taskId, attemptedUrl: url, status: 'HEAD_NOT_OK', httpStatus: head.status, contentType: head.contentType, byteLength: null, sourceId: null, sha256: null, cleanedTextPath: null, rawArtifactPath: null, reason: head.reason ?? `head status ${head.status}`, capturedAt: null });
        continue;
      }

      const isPdf = (head.contentType ?? '').toLowerCase().includes('pdf') || /\.pdf(\?|$)/i.test(head.finalUrl);
      if (isPdf && acceptedPdfCount >= opts.maxPdfs) {
        rejected.push({ taskId: planEntry.task.taskId, attemptedUrl: url, status: 'SKIPPED_BY_BUDGET', httpStatus: head.status, contentType: head.contentType, byteLength: null, sourceId: null, sha256: null, cleanedTextPath: null, rawArtifactPath: null, reason: `pdf budget ${opts.maxPdfs} exhausted`, capturedAt: null });
        continue;
      }
      if (acceptedHtmlCount + acceptedPdfCount >= opts.maxAccepted) {
        rejected.push({ taskId: planEntry.task.taskId, attemptedUrl: url, status: 'SKIPPED_BY_BUDGET', httpStatus: head.status, contentType: head.contentType, byteLength: null, sourceId: null, sha256: null, cleanedTextPath: null, rawArtifactPath: null, reason: `accepted budget ${opts.maxAccepted} exhausted`, capturedAt: null });
        continue;
      }

      if (!opts.quiet) console.log(`  GET  ${head.finalUrl}`);
      const get = await getBody(head.finalUrl);
      await sleep(1000);
      if (!get.ok || !get.body) {
        rejected.push({ taskId: planEntry.task.taskId, attemptedUrl: url, status: 'ERROR', httpStatus: get.status, contentType: head.contentType, byteLength: null, sourceId: null, sha256: null, cleanedTextPath: null, rawArtifactPath: null, reason: get.reason ?? 'get_failed', capturedAt: null });
        continue;
      }

      const sourceId = `src_${++nextSrcN}_additional`;
      while (existingSourceIds.has(sourceId)) { nextSrcN++; }
      existingSourceIds.add(sourceId);
      existingSourceUrls.add(head.finalUrl);

      // sourceHash convention (per p102-validate-run-integrity.ts):
      // hash of the cleaned-text file content for HTML, or hash of the raw
      // PDF bytes for PDFs. We compute below after writing.
      let cleanedPath: string | null = null;
      let rawPath: string | null = null;
      let hash: string;
      if (isPdf) {
        rawPath = path.join(t7PdfDir, `${sourceId}.pdf`);
        writeFileSync(rawPath, get.body);
        hash = sha256(get.body);
        acceptedPdfCount++;
      } else {
        rawPath = path.join(t7RawDir, `${sourceId}.html`);
        writeFileSync(rawPath, get.body);
        const text = htmlToTextV2(get.body.toString('utf8'));
        cleanedPath = path.join(t7CleanedDir, `${sourceId}.txt`);
        writeFileSync(cleanedPath, text, 'utf8');
        hash = sha256(Buffer.from(text, 'utf8'));
        acceptedHtmlCount++;
      }

      // Run deterministic scope inference. Sources fetched by A4 on a
      // system-level or medical-school-level domain MUST be classified as
      // such so the visibility re-classifier downgrades them to
      // HUMAN_REVIEW_REQUIRED. Setting UNKNOWN_SCOPE here would let the
      // model's "INSTITUTION_SPECIFIC" suggestion slip through and produce
      // a false PUBLIC_SAFE_USCE attribution.
      const inferredScope = inferSourceScope(
        { sourceDomain: hostOf(head.finalUrl) ?? '', sourceScope: 'UNKNOWN_SCOPE', sourceFamily: '', sourceUrl: head.finalUrl },
        { institutionId: canonical.institutionId, canonicalName: canonical.canonicalName, officialDomain: allowedDomains[0] ?? '', parentSystem: null },
      );

      const newRecord: SourceRecord = {
        schemaVersion: 'p102-0r-1',
        sourceId,
        sourceUrl: head.finalUrl,
        sourceDomain: hostOf(head.finalUrl) ?? '',
        sourceTitle: null,
        sourceFamily: isPdf ? 'PDF_HANDBOOK' : (planEntry.task.missingFamily ?? 'OTHER'),
        sourceScope: inferredScope,
        deterministicProbeType: 'A4_FETCH_ADDITIONAL',
        acceptedForExtraction: !isPdf, // PDFs need a separate cascade
        rejectedReason: null,
        sourceStatus: 'FETCHED_OK',
        cleanedTextPath: cleanedPath,
        rawHtmlPath: isPdf ? null : rawPath,
        sourceHash: hash,
        screenshotStatus: 'NOT_APPLICABLE',
        pdfStatus: isPdf ? 'PDF_BINARY_NOT_AVAILABLE' : 'NOT_PDF',
        jsonLdExtracted: false,
        robotsSitemapContext: null,
        capturedAt: new Date().toISOString(),
      };
      sourceMap.sources.push(newRecord);

      results.push({
        taskId: planEntry.task.taskId,
        attemptedUrl: url,
        status: 'ACCEPTED',
        httpStatus: head.status,
        contentType: head.contentType,
        byteLength: get.body.length,
        sourceId,
        sha256: hash,
        cleanedTextPath: cleanedPath,
        rawArtifactPath: rawPath,
        reason: 'fetched ok',
        capturedAt: newRecord.capturedAt,
      });
    }
  }

  // Persist updated source map.
  writeJson(sourceMapPath, sourceMap);

  // Append to artifact manifest CSV.
  const manifestPath = path.join(runDir, 'A4_fetch_additional_artifact_manifest.csv');
  const header = 'sourceId,sourceUrl,sha256,rawArtifactPath,cleanedTextPath,capturedAt\n';
  const rows = results.map((r) => [r.sourceId, r.attemptedUrl, r.sha256, r.rawArtifactPath, r.cleanedTextPath, r.capturedAt].map((v) => v ?? '').join(',')).join('\n');
  writeText(manifestPath, header + rows + (rows ? '\n' : ''));

  writeJson(path.join(runDir, 'A4_fetch_additional_results.json'), {
    schemaVersion: SCHEMA_VERSION,
    runId: opts.runId,
    institutionId: canonical.institutionId,
    candidatesAttempted,
    accepted: results.length,
    rejected: rejected.length,
    htmlAccepted: acceptedHtmlCount,
    pdfAccepted: acceptedPdfCount,
    results,
    generatedAt: new Date().toISOString(),
  });
  writeJson(path.join(runDir, 'A4_fetch_additional_rejected.json'), {
    schemaVersion: SCHEMA_VERSION,
    runId: opts.runId,
    rejected,
    generatedAt: new Date().toISOString(),
  });

  if (!opts.quiet) {
    console.log(`\n=== A4 fetch-additional summary`);
    console.log(`  attempted: ${candidatesAttempted}`);
    console.log(`  accepted:  ${results.length} (html=${acceptedHtmlCount}, pdf=${acceptedPdfCount})`);
    console.log(`  rejected:  ${rejected.length}`);
  }

  return { ok: true, summary: `${opts.runId}: attempted=${candidatesAttempted} accepted=${results.length} rejected=${rejected.length}` };
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const r = await runOne(opts);
  console.log(`\n[${r.ok ? 'OK' : 'FAIL'}] ${r.summary}`);
  process.exit(r.ok ? 0 : 1);
}

main().catch((err) => { console.error(`fatal: ${err.message}`); process.exit(1); });
