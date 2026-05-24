#!/usr/bin/env tsx
/**
 * P102 identity-registry validator — enforces parity between
 * docs/.../p102/specs/p102_identity_registry.json (the human-editable
 * source of truth) and scripts/p102-identity-canonicalizer.ts (the
 * hand-mirrored runtime).
 *
 * Checks:
 *   1. Every system in the JSON appears in the TS module.
 *   2. Every system in the TS module appears in the JSON.
 *   3. Domain tokens, system domains, and campus-keyword lists match.
 *
 * Runs by reading the TS source file as text (regex extraction) — no
 * dynamic eval. Fast and safe.
 *
 * No network. No Agent.
 *
 * Usage:
 *   npx tsx scripts/p102-validate-identity-registry.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const JSON_PATH = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/specs/p102_identity_registry.json');
const TS_PATH = path.join(REPO_ROOT, 'scripts/p102-identity-canonicalizer.ts');

interface SystemEntry {
  systemName: string;
  systemDomain: string;
  domainTokens: string[];
  knownCampusKeywords: string[];
}

interface IdentityRegistryFile {
  systems: SystemEntry[];
  knownStandalones: string[];
}

const findings: string[] = [];
const warnings: string[] = [];

function fail(msg: string): void { findings.push(msg); }
function warn(msg: string): void { warnings.push(msg); }

/**
 * Extract all quoted strings from a TS source fragment, respecting both
 * single-quoted and double-quoted strings and ignoring escaped quotes.
 */
function extractQuotedStrings(source: string): string[] {
  const out: string[] = [];
  // Double-quoted strings: handle escaped quotes
  for (const m of source.matchAll(/"((?:[^"\\]|\\.)*)"/g)) out.push(m[1].replace(/\\"/g, '"').replace(/\\'/g, "'"));
  // Single-quoted strings: handle escaped quotes
  for (const m of source.matchAll(/'((?:[^'\\]|\\.)*)'/g)) out.push(m[1].replace(/\\"/g, '"').replace(/\\'/g, "'"));
  return out;
}

function extractTsSystems(tsSource: string): SystemEntry[] {
  // Match each `{ systemName: '...', systemDomain: '...', domainTokens: [...], knownCampusKeywords: [...] }` block
  // inside SYSTEM_REGISTRY.
  const out: SystemEntry[] = [];
  const blockRe = /systemName:\s*(['"])([^'"]+)\1\s*,\s*systemDomain:\s*(['"])([^'"]+)\3\s*,\s*domainTokens:\s*\[([^\]]*)\]\s*,\s*knownCampusKeywords:\s*\[([^\]]*)\]/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(tsSource)) !== null) {
    out.push({
      systemName: m[2],
      systemDomain: m[4],
      domainTokens: extractQuotedStrings(m[5]),
      knownCampusKeywords: extractQuotedStrings(m[6]),
    });
  }
  return out;
}

function extractTsKnownStandalones(tsSource: string): string[] {
  const blockMatch = tsSource.match(/const KNOWN_STANDALONES = new Set<string>\(\[\s*([\s\S]*?)\s*\]\);/);
  if (!blockMatch) return [];
  const body = blockMatch[1];
  // Parse line-by-line: each non-empty line is either a single-quoted or
  // double-quoted string literal followed by a comma.
  const out: string[] = [];
  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('/*')) continue;
    // Match a leading quoted string literal.
    let m = line.match(/^"((?:[^"\\]|\\.)*)"/);
    if (m) { out.push(m[1].replace(/\\"/g, '"').replace(/\\'/g, "'")); continue; }
    m = line.match(/^'((?:[^'\\]|\\.)*)'/);
    if (m) { out.push(m[1].replace(/\\"/g, '"').replace(/\\'/g, "'")); continue; }
  }
  return out;
}

function main(): void {
  console.log('='.repeat(60));
  console.log('P102 Identity-Registry Validator');
  console.log('='.repeat(60));

  if (!fs.existsSync(JSON_PATH)) { fail(`Missing JSON: ${JSON_PATH}`); return finalize(); }
  if (!fs.existsSync(TS_PATH)) { fail(`Missing TS module: ${TS_PATH}`); return finalize(); }

  const json = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8')) as IdentityRegistryFile;
  const tsSource = fs.readFileSync(TS_PATH, 'utf8');

  const tsSystems = extractTsSystems(tsSource);
  const tsStandalones = extractTsKnownStandalones(tsSource);

  // System parity checks
  const jsonByName = new Map<string, SystemEntry>(json.systems.map(s => [s.systemName, s]));
  const tsByName = new Map<string, SystemEntry>(tsSystems.map(s => [s.systemName, s]));

  for (const name of jsonByName.keys()) {
    if (!tsByName.has(name)) fail(`System "${name}" in JSON but NOT in TS module`);
  }
  for (const name of tsByName.keys()) {
    if (!jsonByName.has(name)) fail(`System "${name}" in TS module but NOT in JSON`);
  }
  for (const [name, jsonSys] of jsonByName) {
    const tsSys = tsByName.get(name);
    if (!tsSys) continue;
    if (jsonSys.systemDomain !== tsSys.systemDomain) fail(`${name}: systemDomain mismatch — JSON=${jsonSys.systemDomain}, TS=${tsSys.systemDomain}`);
    const jsonTokens = new Set(jsonSys.domainTokens);
    const tsTokens = new Set(tsSys.domainTokens);
    for (const t of jsonTokens) if (!tsTokens.has(t)) fail(`${name}: domain token "${t}" in JSON but not TS`);
    for (const t of tsTokens) if (!jsonTokens.has(t)) fail(`${name}: domain token "${t}" in TS but not JSON`);
    const jsonKw = new Set(jsonSys.knownCampusKeywords);
    const tsKw = new Set(tsSys.knownCampusKeywords);
    for (const k of jsonKw) if (!tsKw.has(k)) warn(`${name}: campus keyword "${k}" in JSON but not TS`);
    for (const k of tsKw) if (!jsonKw.has(k)) warn(`${name}: campus keyword "${k}" in TS but not JSON`);
  }

  // Standalone parity
  const jsonStandSet = new Set(json.knownStandalones);
  const tsStandSet = new Set(tsStandalones);
  for (const s of jsonStandSet) if (!tsStandSet.has(s)) fail(`Standalone "${s}" in JSON but not TS`);
  for (const s of tsStandSet) if (!jsonStandSet.has(s)) fail(`Standalone "${s}" in TS but not JSON`);

  finalize();

  function finalize(): void {
    console.log(`Systems checked: ${jsonByName.size} (JSON), ${tsByName.size} (TS)`);
    console.log(`Standalones checked: ${jsonStandSet.size} (JSON), ${tsStandSet.size} (TS)`);
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
}

main();
