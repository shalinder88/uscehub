#!/usr/bin/env tsx
import * as fs from 'node:fs';
import * as path from 'node:path';
import { computeRating, RunRatingResult } from './p102-cron-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const P102_DOCS = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102');
const RUNS_DIR = path.join(P102_DOCS, 'runs');

function parseArgs(argv: string[]): { runId: string | null } {
  let runId: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--run-id') runId = argv[++i] ?? null;
  }
  return { runId };
}

function poorResult(runId: string): RunRatingResult {
  return {
    rating: 'POOR',
    rationale: 'No public-safe verified claims with acceptable paths or relevant categories.',
    categoriesFound: [],
    acceptedClaimsCount: 0,
    filteredGenericCount: 0,
  };
}

function writeRating(runId: string, result: RunRatingResult): void {
  const outDir = path.join(RUNS_DIR, runId);
  fs.mkdirSync(outDir, { recursive: true });
  const payload = {
    schemaVersion: 'p102-rating-1',
    runId,
    computedAt: new Date().toISOString(),
    rating: result.rating,
    rationale: result.rationale,
    categoriesFound: result.categoriesFound,
    acceptedClaimsCount: result.acceptedClaimsCount,
    filteredGenericCount: result.filteredGenericCount,
  };
  fs.writeFileSync(path.join(outDir, 'run_rating.json'), JSON.stringify(payload, null, 2) + '\n');
}

function main(): void {
  const { runId } = parseArgs(process.argv.slice(2));
  if (runId === null) {
    console.error('usage: p102-compute-run-rating.ts --run-id <id>');
    process.exit(2);
  }

  const claimsPath = path.join(RUNS_DIR, runId, '13_model_claims_verified.json');

  if (!fs.existsSync(claimsPath)) {
    console.log(`no verified claims file for run ${runId}, rating=POOR`);
    const result = poorResult(runId);
    writeRating(runId, result);
    console.log(`run_rating: ${result.rating}  categories: []  rationale: ${result.rationale}`);
    process.exit(0);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(claimsPath, 'utf8'));
  } catch {
    raw = {};
  }

  const doc = raw as { claims?: unknown[] };
  const rawClaims = Array.isArray(doc.claims) ? doc.claims : [];

  type ClaimArg = Parameters<typeof computeRating>[0][number];
  const claims = rawClaims as ClaimArg[];

  const result = computeRating(claims);
  writeRating(runId, result);

  const cats = result.categoriesFound.length > 0 ? result.categoriesFound.join(', ') : '';
  console.log(`run_rating: ${result.rating}  categories: [${cats}]  rationale: ${result.rationale}`);

  process.exit(0);
}

main();
