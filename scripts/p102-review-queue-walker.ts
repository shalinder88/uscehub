#!/usr/bin/env tsx
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';
import type { UsceCategory } from './p102-cron-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const P102_DOCS = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102');
const EXPORTS_DIR = path.join(P102_DOCS, 'exports');
const DECISIONS_CSV = path.join(EXPORTS_DIR, 'public_safe_review_decisions.csv');
const DECISIONS_CSV_HEADER =
  'row_id,institution_id,institution_name,opportunity_type,source_url,run_rating,detected_categories,decision,reviewer_category,reviewed_at,notes';

interface ReviewRow {
  rowId: string;
  institutionId: string;
  institutionName: string;
  state: string;
  opportunityType: string;
  sourceUrl: string;
  runRating?: string;
  detectedCategories?: string[];
  quote?: string;
}

interface ReviewQueueFile {
  rows: ReviewRow[];
}

function loadExistingDecisionIds(): Set<string> {
  const decided = new Set<string>();
  if (!fs.existsSync(DECISIONS_CSV)) return decided;
  const text = fs.readFileSync(DECISIONS_CSV, 'utf8');
  const lines = text.split('\n');
  const header = lines[0] ?? '';
  const cols = header.split(',');
  const rowIdIdx = cols.indexOf('row_id');
  const decisionIdx = cols.indexOf('decision');
  if (rowIdIdx < 0 || decisionIdx < 0) return decided;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().length === 0) continue;
    const parts = line.split(',');
    const rowId = parts[rowIdIdx] ?? '';
    const decision = parts[decisionIdx] ?? '';
    if (rowId.length > 0 && decision.trim().length > 0) {
      decided.add(rowId);
    }
  }
  return decided;
}

function appendCsvRow(
  rowId: string,
  row: ReviewRow,
  decision: string,
  reviewerCategory: string,
): void {
  if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  const fileExists = fs.existsSync(DECISIONS_CSV);
  const detectedCats = (row.detectedCategories ?? []).join('|');
  const parts = [
    rowId,
    row.institutionId,
    row.institutionName,
    row.opportunityType,
    row.sourceUrl,
    row.runRating ?? '',
    detectedCats,
    decision,
    reviewerCategory,
    new Date().toISOString(),
    '',
  ];
  const escaped = parts.map((v) => {
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.split('"').join('""') + '"';
    }
    return s;
  });
  const csvLine = escaped.join(',') + '\n';
  if (!fileExists) {
    fs.writeFileSync(DECISIONS_CSV, DECISIONS_CSV_HEADER + '\n' + csvLine);
  } else {
    fs.appendFileSync(DECISIONS_CSV, csvLine);
  }
}

const CATEGORY_MAP: Record<string, UsceCategory> = {
  '1': 'VSLO',
  '2': 'CLERKSHIP',
  '3': 'OBSERVERSHIP',
  '4': 'RESEARCH',
};

async function readKey(rl: readline.Interface): Promise<string> {
  return new Promise((resolve) => {
    const handler = (line: string) => {
      rl.removeListener('line', handler);
      resolve(line.trim().slice(0, 1).toLowerCase());
    };
    rl.once('line', handler);
  });
}

async function main(): Promise<void> {
  const queuePath = path.join(EXPORTS_DIR, 'public_safe_review_queue.json');
  if (!fs.existsSync(queuePath)) {
    console.log('no review queue found');
    process.exit(0);
  }

  let queueFile: ReviewQueueFile;
  try {
    queueFile = JSON.parse(fs.readFileSync(queuePath, 'utf8')) as ReviewQueueFile;
  } catch {
    console.log('no review queue found');
    process.exit(0);
  }

  const rows = Array.isArray(queueFile.rows) ? queueFile.rows : [];
  const decided = loadExistingDecisionIds();
  const pending = rows.filter((r) => !decided.has(r.rowId));

  if (pending.length === 0) {
    console.log('review queue is empty — nothing to review');
    process.exit(0);
  }

  console.log(`=== P102 Review Queue Walker === ${pending.length} items pending`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  let rawModeEnabled = false;
  try {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      rawModeEnabled = true;
    }
  } catch {
    // Raw mode not available; fall through to line-by-line.
  }

  async function readSingleKey(): Promise<string> {
    if (rawModeEnabled) {
      return new Promise((resolve) => {
        process.stdin.once('data', (chunk: Buffer) => {
          const ch = chunk.toString('utf8').slice(0, 1);
          resolve(ch.toLowerCase());
        });
      });
    }
    return readKey(rl);
  }

  let reviewed = 0;

  for (let i = 0; i < pending.length; i++) {
    const row = pending[i];
    const displayQuote = (row.quote ?? '').slice(0, 120);
    const ratingLabel = row.runRating ?? 'unknown';
    const catHints =
      row.detectedCategories && row.detectedCategories.length > 0
        ? row.detectedCategories.join(', ')
        : 'none';

    console.log('\n' + '─'.repeat(41));
    console.log(`[${i + 1} of ${pending.length}]  ${row.institutionName} (${row.state})`);
    console.log(`Rating:   ${ratingLabel}`);
    console.log(`Category hints: ${catHints}`);
    console.log(`Type:     ${row.opportunityType}`);
    console.log(`URL:      ${row.sourceUrl}`);
    if (displayQuote.length > 0) {
      console.log(`Quote:    ${displayQuote}`);
    }
    console.log('');
    console.log('[A] Approve  [C] Correct category  [N] No USCE  [S] Skip  [Q] Quit');

    const key = await readSingleKey();

    if (key === 'a') {
      appendCsvRow(row.rowId, row, 'APPROVE', row.opportunityType);
      reviewed++;
    } else if (key === 'c') {
      console.log('  Select category: [1] VSLO  [2] CLERKSHIP  [3] OBSERVERSHIP  [4] RESEARCH');
      const pick = await readSingleKey();
      const cat = CATEGORY_MAP[pick];
      if (cat !== undefined) {
        appendCsvRow(row.rowId, row, 'APPROVE_CORRECTED', cat);
        reviewed++;
      } else {
        console.log('  Invalid pick — skipping row.');
      }
    } else if (key === 'n') {
      appendCsvRow(row.rowId, row, 'NO_USCE', '');
      reviewed++;
    } else if (key === 's') {
      // skip — no write
    } else if (key === 'q') {
      if (rawModeEnabled) process.stdin.setRawMode(false);
      rl.close();
      console.log(`\nExiting. ${reviewed} reviewed this session.`);
      process.exit(0);
    }
  }

  if (rawModeEnabled) process.stdin.setRawMode(false);
  rl.close();
  console.log('\nAll items reviewed. Session complete.');
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
