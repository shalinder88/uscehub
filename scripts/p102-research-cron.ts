#!/usr/bin/env tsx
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  type RunRating,
  type RunRatingResult,
  RECHECK_DAYS,
  addDays,
  NATIONAL_QUEUE_HEADER,
} from './p102-cron-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const T7_ROOT =
  '/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner';
const P102_DOCS = path.join(
  REPO_ROOT,
  'docs/platform-v2/local/usce-discovery-command-center/p102',
);
const DEFAULT_QUEUE = path.join(P102_DOCS, 'queues/p102_national_research_queue.csv');
const JOURNAL = path.join(P102_DOCS, 'P102_RESEARCH_CRON_JOURNAL.md');
const CRON_LOCK = path.join(T7_ROOT, '.research-cron.lock');
const CLAUDE_CLI = path.join(os.homedir(), '.local/bin/claude');

const MAX_POOR_ATTEMPTS_BEFORE_EXHAUSTED = 3;

interface Options {
  dryRun: boolean;
  queue: string;
  maxSourcesPerRun: number;
}

function parseArgs(argv: string[]): Options {
  const opts: Options = { dryRun: false, queue: DEFAULT_QUEUE, maxSourcesPerRun: 12 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--queue') opts.queue = path.resolve(argv[++i]);
    else if (a === '--max-sources-per-run') opts.maxSourcesPerRun = parseInt(argv[++i], 10);
  }
  return opts;
}

function nowIso(): string {
  return new Date().toISOString();
}

function journal(line: string): void {
  const entry = `- ${nowIso()}  ${line}\n`;
  if (!fs.existsSync(JOURNAL)) {
    fs.writeFileSync(
      JOURNAL,
      '# P102 Research Cron — Journal\n\nAppend-only. Written by scripts/p102-research-cron.ts.\n\n',
    );
  }
  fs.appendFileSync(JOURNAL, entry);
  console.log(line);
}

function toLines(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split('\n')) {
    out.push(raw.endsWith('\r') ? raw.slice(0, raw.length - 1) : raw);
  }
  return out;
}

const EXPECTED_NATIONAL_QUEUE_PREFIX = 'schema_version,queue_id,scope_type,scope_value,rank,institution_id,canonical_name,state,county,city,official_domain';

interface QueueColumns {
  statusIdx: number;
  completedIdx: number;
  idIdx: number;
  nameIdx: number;
  recheckIdx: number;
  attemptIdx: number;
  ratingIdx: number;
  lockedIdx: number;
  assignedIdx: number;
}

function parseHeader(headerLine: string): QueueColumns | null {
  const h = headerLine.split(',');
  if (!headerLine.startsWith(EXPECTED_NATIONAL_QUEUE_PREFIX)) return null;
  return {
    statusIdx: h.indexOf('status'),
    completedIdx: h.indexOf('completed_at'),
    idIdx: h.indexOf('institution_id'),
    nameIdx: h.indexOf('canonical_name'),
    recheckIdx: h.indexOf('next_recheck_after'),
    attemptIdx: h.indexOf('attempt_count'),
    ratingIdx: h.indexOf('last_run_rating'),
    lockedIdx: h.indexOf('locked_at'),
    assignedIdx: h.indexOf('assigned_run_id'),
  };
}

interface Selection {
  originalLine: string;
  lineIndex: number;
  institutionId: string;
  canonicalName: string;
  cols: QueueColumns;
}

function isoDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function recheckDue(recheckStr: string): boolean {
  if (!recheckStr) return false;
  try {
    return new Date(recheckStr) <= new Date();
  } catch {
    return false;
  }
}

/**
 * Flip CRON_COMPLETED rows whose next_recheck_after date has passed back to
 * NOT_STARTED so the cron will pick them up again.
 */
function requeue(lines: string[], cols: QueueColumns): { lines: string[]; count: number } {
  let count = 0;
  const out = lines.map((line, i) => {
    if (i === 0) return line;
    const parts = line.split(',');
    if (parts[cols.statusIdx] !== 'CRON_COMPLETED') return line;
    if (!recheckDue(parts[cols.recheckIdx] ?? '')) return line;
    parts[cols.statusIdx] = 'NOT_STARTED';
    parts[cols.recheckIdx] = '';
    count++;
    return parts.join(',');
  });
  return { lines: out, count };
}

function selectNext(lines: string[], cols: QueueColumns): Selection | null {
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const parts = lines[i].split(',');
    if (parts[cols.statusIdx] === 'NOT_STARTED') {
      return {
        originalLine: lines[i],
        lineIndex: i,
        institutionId: parts[cols.idIdx] ?? 'unknown',
        canonicalName: parts[cols.nameIdx] ?? '',
        cols,
      };
    }
  }
  return null;
}

function readQueueWithRequeue(queuePath: string): {
  lines: string[];
  cols: QueueColumns;
  selection: Selection | null;
  requeued: number;
} | null {
  const raw = fs.readFileSync(queuePath, 'utf8');
  const rawLines = toLines(raw).filter(l => l.length > 0);
  if (rawLines.length < 2) return null;

  const cols = parseHeader(rawLines[0]);
  if (!cols) throw new Error('national queue must use the extended schema (see p102-seed-national-queue.ts)');
  if (cols.statusIdx < 0 || cols.idIdx < 0) throw new Error('queue header missing status or institution_id');

  const { lines, count: requeued } = requeue(rawLines, cols);

  if (requeued > 0) {
    fs.writeFileSync(queuePath, lines.join('\n'));
  }

  const selection = selectNext(lines, cols);
  return { lines, cols, selection, requeued };
}

function markCompleted(
  queuePath: string,
  sel: Selection,
  rating: RunRating,
  runId: string,
  recheckDate: string,
  attemptCount: number,
  exhausted: boolean,
): void {
  const raw = fs.readFileSync(queuePath, 'utf8');
  const lines = toLines(raw).filter(l => l.length > 0);
  const idx = lines.findIndex(l => l === sel.originalLine);
  if (idx < 0) {
    journal(`WARN: selected row no longer found in queue; skipping completion mark`);
    return;
  }
  const parts = lines[idx].split(',');

  while (parts.length < NATIONAL_QUEUE_HEADER.split(',').length) parts.push('');

  parts[sel.cols.statusIdx] = exhausted ? 'EXHAUSTED_NO_USCE' : 'CRON_COMPLETED';
  if (sel.cols.completedIdx >= 0) parts[sel.cols.completedIdx] = nowIso();
  if (sel.cols.assignedIdx >= 0) parts[sel.cols.assignedIdx] = runId;
  if (sel.cols.attemptIdx >= 0) parts[sel.cols.attemptIdx] = String(attemptCount);
  if (sel.cols.ratingIdx >= 0) parts[sel.cols.ratingIdx] = rating;
  if (sel.cols.recheckIdx >= 0) parts[sel.cols.recheckIdx] = exhausted ? '' : recheckDate;

  lines[idx] = parts.join(',');
  fs.writeFileSync(queuePath, lines.join('\n'));
}

function getAttemptCount(sel: Selection): number {
  const parts = sel.originalLine.split(',');
  const raw = parts[sel.cols.attemptIdx] ?? '';
  const n = parseInt(raw, 10);
  return isNaN(n) ? 0 : n;
}

interface StageResult {
  ok: boolean;
  code: number | null;
}

function runStage(label: string, script: string, args: string[], logPath: string): StageResult {
  const banner = `\n═══ ${label} ═══\n$ npx tsx ${script} ${args.join(' ')}\n`;
  fs.appendFileSync(logPath, banner);
  const res = spawnSync('npx', ['tsx', script, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (res.stdout) fs.appendFileSync(logPath, res.stdout);
  if (res.stderr) fs.appendFileSync(logPath, res.stderr);
  fs.appendFileSync(logPath, `\n[${label}] exit=${res.status ?? '?'}\n`);
  return { ok: res.status === 0, code: res.status };
}

function readRunRating(runId: string): RunRatingResult | null {
  const p = path.join(P102_DOCS, 'runs', runId, 'run_rating.json');
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as RunRatingResult;
  } catch {
    return null;
  }
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  // ── Preflight ───────────────────────────────────────────────────────
  if (!fs.existsSync(T7_ROOT)) {
    journal(`SKIP preflight: T7 not mounted (${T7_ROOT})`);
    return;
  }
  if (!fs.existsSync(CLAUDE_CLI)) {
    journal(`SKIP preflight: claude CLI absent at ${CLAUDE_CLI}`);
    return;
  }
  if (!fs.existsSync(opts.queue)) {
    journal(`SKIP preflight: national queue missing — run p102-seed-national-queue.ts first`);
    return;
  }
  if (fs.existsSync(CRON_LOCK)) {
    journal(`SKIP: cron lock present — another run in progress or stale lock needs review`);
    return;
  }

  let parsed: ReturnType<typeof readQueueWithRequeue>;
  try {
    parsed = readQueueWithRequeue(opts.queue);
  } catch (e) {
    journal(`SKIP: queue parse error — ${e instanceof Error ? e.message : String(e)}`);
    return;
  }
  if (!parsed) {
    journal(`SKIP: queue has no rows`);
    return;
  }
  if (parsed.requeued > 0) {
    journal(`INFO: re-queued ${parsed.requeued} CRON_COMPLETED row(s) past recheck date`);
  }
  if (!parsed.selection) {
    journal(`SKIP: queue exhausted — no NOT_STARTED rows`);
    return;
  }

  const sel = parsed.selection;
  const ts = nowIso().split(':').join('').split('-').join('').split('.')[0];
  const runId = `cron-${ts}-${sel.institutionId}`;
  const attemptCount = getAttemptCount(sel) + 1;

  // ── Dry-run ─────────────────────────────────────────────────────────
  if (opts.dryRun) {
    console.log('P102 Research Cron — DRY RUN');
    console.log(`  queue:        ${opts.queue}`);
    console.log(`  next:         ${sel.canonicalName} [${sel.institutionId}]`);
    console.log(`  run-id:       ${runId}`);
    console.log(`  attempt:      ${attemptCount}`);
    console.log(`  T7:           ${T7_ROOT}  (mounted)`);
    console.log(`  claude CLI:   ${CLAUDE_CLI}  (present)`);
    if (parsed.requeued > 0) console.log(`  requeued:     ${parsed.requeued} rows past recheck`);
    console.log('  chain:');
    console.log(`    1/6  discovery-runner  FIND`);
    console.log(`    2/6  claude-cli-extractor  EXTRACT  --max-sources-per-run ${opts.maxSourcesPerRun}`);
    console.log(`    3/6  regate-run  VALIDATE`);
    console.log(`    4/6  compute-run-rating  RATE`);
    console.log(`    5/6  build-public-safe-opportunity-rows  ENQUEUE`);
    console.log(`    6/6  summarize-review-queue  DIGEST`);
    console.log('  then: journal rating, update queue row (attempt_count, last_run_rating,');
    console.log('        next_recheck_after), STOP.');
    console.log('  never: approve / build-approved-export / sync-to-website / prisma / git');
    return;
  }

  // ── Live run ────────────────────────────────────────────────────────
  fs.writeFileSync(
    CRON_LOCK,
    JSON.stringify({ runId, pid: process.pid, acquiredAt: nowIso() }, null, 2),
  );

  const logDir = path.join(T7_ROOT, 'cron-logs');
  fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, `${runId}.log`);
  const tempQueue = path.join(os.tmpdir(), `${runId}.queue.csv`);

  try {
    const header = toLines(fs.readFileSync(opts.queue, 'utf8'))[0];
    fs.writeFileSync(tempQueue, `${header}\n${sel.originalLine}\n`);

    journal(`START ${runId} — ${sel.canonicalName} [${sel.institutionId}] attempt=${attemptCount}`);

    const chain: Array<{ label: string; script: string; args: string[] }> = [
      {
        label: '1/6 discovery (FIND)',
        script: 'scripts/p102-discovery-runner.ts',
        args: ['--queue', tempQueue, '--limit', '1', '--run-id', runId],
      },
      {
        label: '2/6 extractor (EXTRACT)',
        script: 'scripts/p102-claude-cli-extractor.ts',
        args: ['--run-id', runId, '--max-sources-per-run', String(opts.maxSourcesPerRun)],
      },
      {
        label: '3/6 regate (VALIDATE)',
        script: 'scripts/p102-regate-run.ts',
        args: ['--run-id', runId],
      },
      {
        label: '4/6 rating (RATE)',
        script: 'scripts/p102-compute-run-rating.ts',
        args: ['--run-id', runId],
      },
      {
        label: '5/6 build rows (ENQUEUE)',
        script: 'scripts/p102-build-public-safe-opportunity-rows.ts',
        args: ['--run-id', runId],
      },
      {
        label: '6/6 summarize (DIGEST)',
        script: 'scripts/p102-summarize-review-queue.ts',
        args: [],
      },
    ];

    for (const stage of chain) {
      const r = runStage(stage.label, stage.script, stage.args, logPath);
      if (!r.ok) {
        journal(
          `FAIL ${runId} at ${stage.label} (exit ${r.code ?? '?'}). ` +
          `Row left NOT_STARTED for retry. Log: ${logPath}`,
        );
        return;
      }
    }

    const ratingResult = readRunRating(runId);
    const rating: RunRating = ratingResult?.rating ?? 'POOR';
    const recheckDays = RECHECK_DAYS[rating];
    const recheckDate = isoDateStr(addDays(new Date(), recheckDays));
    const categoriesStr = ratingResult?.categoriesFound?.join(', ') ?? 'none';

    const exhausted =
      rating === 'POOR' &&
      attemptCount >= MAX_POOR_ATTEMPTS_BEFORE_EXHAUSTED &&
      (ratingResult?.acceptedClaimsCount ?? 0) === 0;

    markCompleted(opts.queue, sel, rating, runId, recheckDate, attemptCount, exhausted);

    const statusWord = exhausted ? 'EXHAUSTED_NO_USCE' : 'CRON_COMPLETED';
    journal(
      `DONE ${runId} — rating=${rating} categories=[${categoriesStr}] ` +
      `attempt=${attemptCount} status=${statusWord} recheck=${exhausted ? 'never' : recheckDate}`,
    );

    if (rating === 'POOR' || rating === 'AVERAGE') {
      journal(
        `NOTE ${runId} — ${rating} run: no items added to main review queue. ` +
        `Check low_quality_review_archive.json if needed.`,
      );
    }
  } catch (e) {
    journal(`ERROR ${runId}: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    if (fs.existsSync(tempQueue)) fs.unlinkSync(tempQueue);
    if (fs.existsSync(CRON_LOCK)) fs.unlinkSync(CRON_LOCK);
  }
}

main();
