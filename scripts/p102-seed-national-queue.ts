import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  NATIONAL_QUEUE_HEADER,
  NationalQueueStatus,
} from './p102-cron-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const P102_DOCS = path.join(
  REPO_ROOT,
  'docs/platform-v2/local/usce-discovery-command-center/p102',
);
const QUEUES_DIR = path.join(P102_DOCS, 'queues');
const OUTPUT = path.join(QUEUES_DIR, 'p102_national_research_queue.csv');

const VALID_STATUSES = new Set<string>([
  'NOT_STARTED',
  'IN_PROGRESS',
  'CRON_COMPLETED',
  'EXHAUSTED_NO_USCE',
]);

function toLines(text: string): string[] {
  return text.split('\n').filter(Boolean);
}

function normalizeStatus(raw: string): NationalQueueStatus {
  if (VALID_STATUSES.has(raw)) return raw as NationalQueueStatus;
  return 'NOT_STARTED';
}

interface ParsedRow {
  parts: string[];
  institutionId: string;
  status: NationalQueueStatus;
}

interface ParsedFile {
  rows: ParsedRow[];
  idIndex: number;
  statusIndex: number;
  assignedRunIdIndex: number;
  completedAtIndex: number;
}

function parseQueueFile(filePath: string): ParsedFile | null {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = toLines(text);
  if (lines.length < 2) return null;

  const header = lines[0].split(',');
  if (!lines[0].startsWith('schema_version,queue_id')) return null;

  const idIndex = header.indexOf('institution_id');
  const statusIndex = header.indexOf('status');
  const assignedRunIdIndex = header.indexOf('assigned_run_id');
  const completedAtIndex = header.indexOf('completed_at');

  if (idIndex < 0) return null;

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    const institutionId = parts[idIndex] ?? '';
    if (!institutionId) continue;
    const rawStatus = statusIndex >= 0 ? (parts[statusIndex] ?? '') : '';
    const status = normalizeStatus(rawStatus);
    rows.push({ parts, institutionId, status });
  }

  return { rows, idIndex, statusIndex, assignedRunIdIndex, completedAtIndex };
}

function buildOutputRow(parts: string[]): string {
  const base = parts.slice(0, 20);
  while (base.length < 20) base.push('');

  if (parts.length > 20) {
    const extra = parts.slice(20);
    while (extra.length < 3) extra.push('');
    return base.concat(extra.slice(0, 3)).join(',');
  }

  return base.concat(['0', '', '']).join(',');
}

interface Options {
  dryRun: boolean;
  force: boolean;
  acgmeCsv: string | null;
}

function parseArgs(argv: string[]): Options {
  const opts: Options = { dryRun: false, force: false, acgmeCsv: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--force') opts.force = true;
    else if (a === '--acgme-csv') opts.acgmeCsv = argv[++i] ?? null;
  }
  return opts;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .split('')
    .map((c) => {
      const code = c.charCodeAt(0);
      const isAlphanumeric =
        (code >= 97 && code <= 122) || (code >= 48 && code <= 57);
      return isAlphanumeric ? c : '-';
    })
    .join('')
    .split('-')
    .filter(Boolean)
    .join('-');
}

function buildAcgmeStubRow(institutionName: string, city: string, state: string): string {
  const institutionId = slugify(institutionName);
  const parts = [
    'p102-0r-1',
    'p102_national_research',
    'INSTITUTION',
    institutionId,
    '9999',
    institutionId,
    institutionName,
    state.trim(),
    '',
    city.trim(),
    '',
    '',
    'ACGME_IMPORT',
    'ACGME CSV import',
    'NOT_STARTED',
    '',
    '',
    '',
    '',
    '',
    '0',
    '',
    '',
  ];
  return parts.join(',');
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.force && fs.existsSync(OUTPUT)) {
    const existing = fs.readFileSync(OUTPUT, 'utf8');
    const existingRows = toLines(existing).slice(1).filter(Boolean);
    if (existingRows.length > 0) {
      console.log(
        `Output already exists with ${existingRows.length} row(s). Use --force to overwrite.`,
      );
      return;
    }
  }

  const allFiles = fs.readdirSync(QUEUES_DIR).filter((f) => f.endsWith('.csv'));
  const sourceFiles = allFiles.filter(
    (f) =>
      f !== 'p102_national_research_queue.csv' && f !== 'p102_queue_template.csv',
  );

  const deduped = new Map<string, string[]>();
  let totalRows = 0;
  let sourceFileCount = 0;

  for (const filename of sourceFiles) {
    const filePath = path.join(QUEUES_DIR, filename);
    const parsed = parseQueueFile(filePath);
    if (parsed === null) continue;

    sourceFileCount++;

    for (const row of parsed.rows) {
      totalRows++;
      const existing = deduped.get(row.institutionId);
      if (existing === undefined) {
        deduped.set(row.institutionId, row.parts);
        continue;
      }

      const existingStatusIndex = parsed.statusIndex;
      const existingRaw =
        existingStatusIndex >= 0 ? (existing[existingStatusIndex] ?? '') : '';
      const existingStatus = normalizeStatus(existingRaw);

      if (
        existingStatus === 'NOT_STARTED' &&
        row.status !== 'NOT_STARTED'
      ) {
        deduped.set(row.institutionId, row.parts);
      }
    }
  }

  if (opts.acgmeCsv !== null) {
    if (!fs.existsSync(opts.acgmeCsv)) {
      console.warn(`WARNING: ACGME CSV not found at ${opts.acgmeCsv}; skipping.`);
    } else {
      const acgmeText = fs.readFileSync(opts.acgmeCsv, 'utf8');
      const acgmeLines = toLines(acgmeText).slice(1);
      let acgmeAdded = 0;
      for (const line of acgmeLines) {
        const cols = line.split(',');
        const institutionName = (cols[0] ?? '').trim();
        const city = (cols[1] ?? '').trim();
        const state = (cols[2] ?? '').trim();
        if (!institutionName) continue;
        const institutionId = slugify(institutionName);
        if (deduped.has(institutionId)) continue;
        const stubParts = buildAcgmeStubRow(institutionName, city, state).split(',');
        deduped.set(institutionId, stubParts);
        acgmeAdded++;
      }
      console.log(`ACGME import: added ${acgmeAdded} stub row(s).`);
    }
  }

  const alreadyCompleted = Array.from(deduped.values()).filter((parts) => {
    const headerCols = NATIONAL_QUEUE_HEADER.split(',');
    const statusIdx = headerCols.indexOf('status');
    const rawStatus = statusIdx >= 0 ? (parts[statusIdx] ?? '') : '';
    return normalizeStatus(rawStatus) === 'CRON_COMPLETED';
  }).length;

  const outputLines = [NATIONAL_QUEUE_HEADER];
  for (const parts of deduped.values()) {
    outputLines.push(buildOutputRow(parts));
  }
  const outputText = outputLines.join('\n') + '\n';

  console.log(
    `${totalRows} total rows from ${sourceFileCount} source file(s), ` +
      `${deduped.size} unique institution(s), ` +
      `${alreadyCompleted} already completed.`,
  );

  if (opts.dryRun) {
    console.log('--dry-run: would write the following to', OUTPUT);
    console.log(outputText.slice(0, 2000));
    if (outputText.length > 2000) {
      console.log(`... (${outputLines.length - 1} rows total, truncated)`);
    }
    return;
  }

  fs.writeFileSync(OUTPUT, outputText, 'utf8');
  console.log(`Wrote ${deduped.size} row(s) to ${OUTPUT}`);
}

main();
