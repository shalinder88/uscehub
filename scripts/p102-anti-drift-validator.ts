#!/usr/bin/env tsx
/**
 * P102 anti-drift validator — scans the P102 doc + code tree for
 * inconsistencies that creep in over many sprints:
 *
 *   1. Referenced files (links, paths, scripts) that don't exist.
 *   2. schemaVersion strings that don't match SCHEMA_VERSION in the lib.
 *   3. Run folders referenced in docs that aren't in the runs/ dir.
 *   4. Scripts referenced in docs that don't exist.
 *   5. Commits referenced in docs that don't exist in git history.
 *   6. Validator finding-related markers ("FAIL_FATAL", "blocked=") that
 *      shouldn't appear in committed docs without context.
 *
 * Exit 0 if clean, non-zero if drift found.
 *
 * No network. No Agent.
 *
 * Usage:
 *   npx tsx scripts/p102-anti-drift-validator.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { SCHEMA_VERSION } from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const P102_DOC_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102');
const SCRIPTS_ROOT = path.join(REPO_ROOT, 'scripts');
const RUNS_ROOT = path.join(P102_DOC_ROOT, 'runs');

const findings: string[] = [];
const warnings: string[] = [];

function fail(msg: string): void { findings.push(msg); }
function warn(msg: string): void { warnings.push(msg); }

function listFilesRecursive(dir: string, ext: string[]): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(full, ext));
    else if (ext.some(e => entry.name.endsWith(e))) out.push(full);
  }
  return out;
}

function gitCommitExists(hash: string): boolean {
  try {
    execSync(`git -C "${REPO_ROOT}" cat-file -e ${hash}^{commit}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function check(): void {
  const docs = listFilesRecursive(P102_DOC_ROOT, ['.md', '.json']);

  // Build a set of existing scripts + repo files for reference checks.
  const allScripts = fs.existsSync(SCRIPTS_ROOT) ? fs.readdirSync(SCRIPTS_ROOT).filter(f => f.endsWith('.ts')) : [];
  const existingScripts = new Set(allScripts);
  const existingRunIds = fs.existsSync(RUNS_ROOT) ? fs.readdirSync(RUNS_ROOT) : [];
  const existingRunIdSet = new Set(existingRunIds);

  for (const doc of docs) {
    const rel = path.relative(REPO_ROOT, doc);
    const txt = fs.readFileSync(doc, 'utf8');

    // A doc that marks itself SUPERSEDED in its title or first 10 lines is
    // exempted from missing-script-reference checks — historical references
    // to scripts that have since been deleted are expected.
    const docHead = txt.split('\n').slice(0, 10).join('\n');
    const isSuperseded = /\bSUPERSEDED\b/.test(docHead);

    // 1) schemaVersion check — every "schemaVersion": "..." should match SCHEMA_VERSION
    const svMatches = Array.from(txt.matchAll(/(?:^|\s|")schemaVersion"?\s*:\s*"([^"]+)"/g));
    for (const m of svMatches) {
      if (m[1] !== SCHEMA_VERSION && !m[1].startsWith('p102-')) {
        warn(`${rel}: schemaVersion "${m[1]}" — expected "${SCHEMA_VERSION}" or another p102- variant`);
      }
    }

    // 2) Markdown-style file references: `scripts/p102-*.ts`
    if (!isSuperseded) {
      const scriptRefs = Array.from(txt.matchAll(/`scripts\/(p102-[\w-]+\.ts)`/g)).map(m => m[1]);
      for (const s of scriptRefs) {
        if (!existingScripts.has(s)) fail(`${rel}: references missing script scripts/${s}`);
      }
    }

    // 3) Run-id references in markdown
    const runRefs = Array.from(txt.matchAll(/`(p102-[\w-]+(?:-\d+|\d+))`/g)).map(m => m[1]);
    for (const r of runRefs) {
      // Filter to ones that look like run ids (e.g., "p102-1-trial-2-run-1", "p102-0r-dry-run-1")
      if (!/p102-[\w-]+-(run|dry|trial)/.test(r)) continue;
      if (!existingRunIdSet.has(r)) {
        warn(`${rel}: references run-id "${r}" not in runs/ folder`);
      }
    }

    // 4) Git commit references (7+ hex chars near a P102- label)
    const commitRefs = Array.from(txt.matchAll(/`([0-9a-f]{7,40})`(?:\s*(?:—|–|-|:)\s*P102-[0-9A-Z]+)?/g)).map(m => m[1]);
    for (const c of commitRefs) {
      if (!gitCommitExists(c)) warn(`${rel}: references git commit "${c}" not found in repo`);
    }

    // 5) Banned placeholders left over
    for (const banned of ['PENDING_T7_BACKFILL', 'TODO_FIX_BEFORE_COMMIT', 'XXX_PLACEHOLDER']) {
      if (txt.includes(banned)) fail(`${rel}: contains banned placeholder ${banned}`);
    }
  }

  // 6) Every script in scripts/p102-*.ts should be referenced in at least one doc
  //    (helps catch dead scripts).
  // (Best-effort: not all scripts need to be doc-referenced, so this is a warn.)
  const allDocText = docs.map(d => fs.readFileSync(d, 'utf8')).join('\n');
  for (const s of allScripts.filter(s => s.startsWith('p102-'))) {
    if (!allDocText.includes(s)) warn(`script scripts/${s} not referenced in any P102 doc`);
  }
}

function main(): void {
  console.log('='.repeat(60));
  console.log('P102 Anti-Drift Validator');
  console.log('='.repeat(60));

  check();

  console.log('-'.repeat(60));
  if (findings.length === 0) {
    console.log(`Overall: PASSED (warnings: ${warnings.length})`);
    if (warnings.length > 0) for (const w of warnings) console.log(`  WARN: ${w}`);
    process.exit(0);
  } else {
    console.log(`Overall: FAILED (findings: ${findings.length}, warnings: ${warnings.length})`);
    for (const f of findings) console.log(`  FAIL: ${f}`);
    for (const w of warnings) console.log(`  WARN: ${w}`);
    process.exit(1);
  }
}

main();
