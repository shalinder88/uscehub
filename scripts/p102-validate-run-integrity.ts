#!/usr/bin/env tsx
/**
 * P102 run-folder integrity validator — deeper I/O checks beyond the
 * main validator. For each run:
 *
 *   1. Every cleanedTextPath / rawHtmlPath in 01_source_map.json must
 *      exist on T7 and be non-empty.
 *   2. Every sourceHash in 01_source_map.json (cleaned-text hash) must
 *      equal sha256 of the actual cleaned text file.
 *   3. Every claim in 13_source_claims.json must reference a
 *      sourceUrl that appears in 01_source_map.json.
 *   4. Every claim's cleanedTextPath must exist; its sourceHash must
 *      match the file's actual sha256.
 *   5. Every artifact in 00_artifact_manifest.csv must exist on T7.
 *
 * Reports a per-run integrity summary; non-zero exit on real drift.
 *
 * No network. No Agent.
 *
 * Usage:
 *   npx tsx scripts/p102-validate-run-integrity.ts
 *   npx tsx scripts/p102-validate-run-integrity.ts --run-id <id>
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');

function safeJson<T = unknown>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return null; }
}

function sha256(buf: Buffer | string): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

interface IntegrityFinding {
  runId: string;
  severity: 'FAIL' | 'WARN';
  rule: string;
  detail: string;
}

function validateRun(runFolder: string): IntegrityFinding[] {
  const runId = path.basename(runFolder);
  const findings: IntegrityFinding[] = [];

  const sourceMap = safeJson<{ sources?: Array<{ sourceUrl: string; cleanedTextPath: string | null; rawHtmlPath: string | null; sourceHash: string | null; acceptedForExtraction: boolean }> }>(path.join(runFolder, '01_source_map.json'));
  if (!sourceMap?.sources) {
    findings.push({ runId, severity: 'FAIL', rule: 'source_map_present', detail: '01_source_map.json missing or unreadable' });
    return findings;
  }

  // Rule 1+2: cleanedText + rawHtml files exist + hash matches
  const sourceUrlSet = new Set<string>();
  for (const s of sourceMap.sources) {
    sourceUrlSet.add(s.sourceUrl);
    if (!s.acceptedForExtraction) continue;
    if (s.cleanedTextPath) {
      if (!fs.existsSync(s.cleanedTextPath)) {
        findings.push({ runId, severity: 'FAIL', rule: 'cleaned_text_exists', detail: `cleanedTextPath missing: ${s.cleanedTextPath}` });
      } else {
        const content = fs.readFileSync(s.cleanedTextPath, 'utf8');
        if (content.length === 0) findings.push({ runId, severity: 'WARN', rule: 'cleaned_text_nonempty', detail: `${s.sourceUrl}: cleaned text is empty` });
        if (s.sourceHash) {
          const actual = sha256(content);
          if (actual !== s.sourceHash) {
            findings.push({ runId, severity: 'FAIL', rule: 'cleaned_text_hash_match', detail: `${s.sourceUrl}: stored hash ${s.sourceHash} ≠ actual ${actual}` });
          }
        }
      }
    }
    if (s.rawHtmlPath) {
      if (!fs.existsSync(s.rawHtmlPath)) {
        findings.push({ runId, severity: 'WARN', rule: 'raw_html_exists', detail: `rawHtmlPath missing: ${s.rawHtmlPath}` });
      }
    }
  }

  // Rule 3+4: claim source URLs map back to source map + hashes match
  const claims = safeJson<{ claims?: Array<{ claimId: string; sourceUrl: string; cleanedTextPath: string; sourceHash: string }> }>(path.join(runFolder, '13_source_claims.json'));
  if (claims?.claims) {
    for (const c of claims.claims) {
      if (!sourceUrlSet.has(c.sourceUrl)) {
        findings.push({ runId, severity: 'FAIL', rule: 'claim_source_back_reference', detail: `claim ${c.claimId} sourceUrl ${c.sourceUrl} not in 01_source_map.json` });
      }
      if (c.cleanedTextPath && !fs.existsSync(c.cleanedTextPath)) {
        findings.push({ runId, severity: 'FAIL', rule: 'claim_cleaned_text_exists', detail: `claim ${c.claimId} cleanedTextPath missing: ${c.cleanedTextPath}` });
      } else if (c.cleanedTextPath && c.sourceHash) {
        const content = fs.readFileSync(c.cleanedTextPath, 'utf8');
        const actual = sha256(content);
        if (actual !== c.sourceHash) {
          findings.push({ runId, severity: 'FAIL', rule: 'claim_hash_match', detail: `claim ${c.claimId} stored hash ≠ actual` });
        }
      }
    }
  }

  // Rule 5: artifact manifest paths exist
  const manifestPath = path.join(runFolder, '00_artifact_manifest.csv');
  if (fs.existsSync(manifestPath)) {
    const csv = fs.readFileSync(manifestPath, 'utf8').split(/\r?\n/);
    const header = csv[0].split(',');
    const pathCol = header.indexOf('path');
    const statusCol = header.indexOf('status');
    if (pathCol >= 0) {
      for (let i = 1; i < csv.length; i++) {
        if (!csv[i].trim()) continue;
        const cols = csv[i].split(',');
        const p = cols[pathCol];
        const status = cols[statusCol] ?? 'OK';
        if (status === 'OK' && p && !fs.existsSync(p)) {
          findings.push({ runId, severity: 'WARN', rule: 'manifest_path_exists', detail: `manifest entry missing on disk: ${p}` });
        }
      }
    }
  }

  return findings;
}

function parseArgs(argv: string[]): { runIds: string[] } {
  const args = { runIds: [] as string[] };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--run-id') args.runIds.push(argv[++i]);
  }
  if (args.runIds.length === 0 && fs.existsSync(RUNS_ROOT)) {
    args.runIds = fs.readdirSync(RUNS_ROOT).filter(n => fs.statSync(path.join(RUNS_ROOT, n)).isDirectory());
  }
  return args;
}

function main(): void {
  const args = parseArgs(process.argv);
  console.log('='.repeat(60));
  console.log('P102 Run-Folder Integrity Validator');
  console.log('='.repeat(60));
  let totalFail = 0; let totalWarn = 0;
  for (const runId of args.runIds) {
    const findings = validateRun(path.join(RUNS_ROOT, runId));
    const fails = findings.filter(f => f.severity === 'FAIL').length;
    const warns = findings.filter(f => f.severity === 'WARN').length;
    totalFail += fails; totalWarn += warns;
    console.log(`  ${runId}: FAIL=${fails}, WARN=${warns}`);
    for (const f of findings) console.log(`    ${f.severity}: ${f.rule} — ${f.detail}`);
  }
  console.log('-'.repeat(60));
  console.log(`Overall: ${totalFail === 0 ? 'PASSED' : 'FAILED'} (FAIL=${totalFail}, WARN=${totalWarn})`);
  process.exit(totalFail === 0 ? 0 : 1);
}

main();
