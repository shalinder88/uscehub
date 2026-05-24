#!/usr/bin/env tsx
/**
 * P102 claim provenance tracer — given a claim ID, walks backwards
 * through the run folder and T7 artifacts to print the complete
 * provenance chain:
 *
 *   1. Claim record (visibility, lane, source family, quote)
 *   2. Source record (URL, hash, scope)
 *   3. Cleaned text file (existence, size, hash match)
 *   4. Raw HTML file (existence)
 *   5. JSON-LD record (if applicable)
 *   6. Quote position in cleaned text (line + surrounding context)
 *   7. Institution canonical (name, parent system, state)
 *
 * Useful when reviewing a PUBLIC_SAFE_USCE claim or debugging a
 * quote-verification failure.
 *
 * No network. No Agent.
 *
 * Usage:
 *   npx tsx scripts/p102-trace-claim.ts --claim-id claim_<run>_<n>
 *   npx tsx scripts/p102-trace-claim.ts --claim-id claim_<run>_<n> --run-id <run>
 *   npx tsx scripts/p102-trace-claim.ts --list  # list all claims by run
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { normalizeForQuoteMatch } from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');

interface ClaimRecord {
  claimId: string;
  lane: string;
  visibility: string;
  quote: string;
  sourceUrl: string;
  sourceHash: string;
  cleanedTextPath: string;
  sourceFamily: string;
  sourceScope: string;
  quoteVerified: boolean;
}

function safeJson<T = unknown>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return null; }
}

function findClaim(claimId: string, runIdHint?: string): { runId: string; claim: ClaimRecord } | null {
  const runIds = runIdHint ? [runIdHint] : (fs.existsSync(RUNS_ROOT) ? fs.readdirSync(RUNS_ROOT) : []);
  for (const runId of runIds) {
    const runFolder = path.join(RUNS_ROOT, runId);
    if (!fs.statSync(runFolder).isDirectory()) continue;
    const doc = safeJson<{ claims?: ClaimRecord[] }>(path.join(runFolder, '13_source_claims.json'));
    if (!doc?.claims) continue;
    const c = doc.claims.find(x => x.claimId === claimId);
    if (c) return { runId, claim: c };
  }
  return null;
}

function listClaims(): void {
  if (!fs.existsSync(RUNS_ROOT)) { console.error('No runs folder.'); return; }
  for (const runId of fs.readdirSync(RUNS_ROOT)) {
    const runFolder = path.join(RUNS_ROOT, runId);
    if (!fs.statSync(runFolder).isDirectory()) continue;
    const doc = safeJson<{ claims?: ClaimRecord[] }>(path.join(runFolder, '13_source_claims.json'));
    if (!doc?.claims || doc.claims.length === 0) { console.log(`${runId}: 0 claims`); continue; }
    console.log(`${runId}: ${doc.claims.length} claims`);
    for (const c of doc.claims) console.log(`  ${c.claimId}  ${c.visibility.padEnd(28)} ${c.lane.padEnd(28)} ${c.sourceUrl}`);
  }
}

function trace(claimId: string, runIdHint?: string): number {
  const found = findClaim(claimId, runIdHint);
  if (!found) { console.error(`Claim ${claimId} not found.`); return 1; }
  const { runId, claim } = found;
  const runFolder = path.join(RUNS_ROOT, runId);

  console.log('='.repeat(60));
  console.log(`Claim provenance: ${claimId}`);
  console.log('='.repeat(60));
  console.log(`Run:                ${runId}`);
  console.log(`Lane:               ${claim.lane}`);
  console.log(`Visibility:         ${claim.visibility}`);
  console.log(`Source family:      ${claim.sourceFamily}`);
  console.log(`Source scope:       ${claim.sourceScope}`);
  console.log(`Source URL:         ${claim.sourceUrl}`);
  console.log(`Source hash:        ${claim.sourceHash}`);
  console.log(`Cleaned text path:  ${claim.cleanedTextPath}`);
  console.log(`Quote verified (extractor): ${claim.quoteVerified}`);
  console.log('');

  // Institution context
  const canon = safeJson<{ canonicalName?: string; state?: string; city?: string; parentSystem?: string | null; officialDomains?: string[] }>(path.join(runFolder, '05_canonical_institution.json'));
  if (canon) {
    console.log('Institution:');
    console.log(`  canonicalName:    ${canon.canonicalName}`);
    console.log(`  city/state:       ${canon.city ?? '?'}, ${canon.state ?? '?'}`);
    console.log(`  parentSystem:     ${canon.parentSystem ?? '(standalone)'}`);
    console.log(`  officialDomains:  ${(canon.officialDomains ?? []).join(', ')}`);
  }
  console.log('');

  // Quote
  console.log('Quote:');
  console.log(`  "${claim.quote.slice(0, 400)}${claim.quote.length > 400 ? '…' : ''}"`);
  console.log('');

  // Cleaned text verification
  if (claim.cleanedTextPath && fs.existsSync(claim.cleanedTextPath)) {
    const cleaned = fs.readFileSync(claim.cleanedTextPath, 'utf8');
    const cleanedHash = crypto.createHash('sha256').update(cleaned).digest('hex');
    const hashMatch = cleanedHash === claim.sourceHash;
    console.log(`Cleaned text file:`);
    console.log(`  exists:           true`);
    console.log(`  size (bytes):     ${cleaned.length}`);
    console.log(`  sha256 match:     ${hashMatch} (stored: ${claim.sourceHash}, actual: ${cleanedHash})`);

    // Find quote position
    const normalizedClean = normalizeForQuoteMatch(cleaned);
    const normalizedQuote = normalizeForQuoteMatch(claim.quote);
    const idx = normalizedClean.indexOf(normalizedQuote);
    if (idx >= 0) {
      console.log(`  quote found at:   char ${idx} (in normalized text)`);
      // Estimate line number in original text
      const charsBeforeQuoteInOriginal = Math.floor(idx * (cleaned.length / Math.max(1, normalizedClean.length)));
      const linesBefore = cleaned.slice(0, charsBeforeQuoteInOriginal).split('\n').length;
      console.log(`  approx line:      ${linesBefore}`);
    } else {
      console.log(`  quote NOT FOUND in cleaned text (current state). Either content drifted or claim is hallucinated.`);
    }
  } else {
    console.log(`Cleaned text file: MISSING (${claim.cleanedTextPath})`);
  }
  console.log('');

  // Raw HTML
  const sourceMap = safeJson<{ sources?: Array<{ sourceUrl: string; rawHtmlPath?: string }> }>(path.join(runFolder, '01_source_map.json'));
  const sourceRecord = sourceMap?.sources?.find(s => s.sourceUrl === claim.sourceUrl);
  if (sourceRecord?.rawHtmlPath) {
    console.log(`Raw HTML file:`);
    console.log(`  path:             ${sourceRecord.rawHtmlPath}`);
    console.log(`  exists:           ${fs.existsSync(sourceRecord.rawHtmlPath)}`);
    if (fs.existsSync(sourceRecord.rawHtmlPath)) {
      console.log(`  size (bytes):     ${fs.statSync(sourceRecord.rawHtmlPath).size}`);
    }
  }
  console.log('');

  // JSON-LD
  const jsonldExtract = safeJson<{ records?: Array<{ sourceUrl: string; jsonldPath: string; itemCount: number }> }>(path.join(runFolder, '00_jsonld_extract.json'));
  const jsonldRecord = jsonldExtract?.records?.find(r => r.sourceUrl === claim.sourceUrl);
  if (jsonldRecord) {
    console.log(`JSON-LD:`);
    console.log(`  path:             ${jsonldRecord.jsonldPath}`);
    console.log(`  item count:       ${jsonldRecord.itemCount}`);
    console.log(`  exists:           ${fs.existsSync(jsonldRecord.jsonldPath)}`);
  }
  console.log('');

  // A3 context
  const a3 = safeJson<{ verdict?: string; publicSafe?: boolean; networkUsed?: boolean; agentUsed?: boolean }>(path.join(runFolder, 'A3_gate.json'));
  if (a3) {
    console.log(`A3 hostile gate (whole run):`);
    console.log(`  verdict:          ${a3.verdict}`);
    console.log(`  publicSafe:       ${a3.publicSafe}`);
    console.log(`  networkUsed:      ${a3.networkUsed}`);
    console.log(`  agentUsed:        ${a3.agentUsed}`);
  }

  return 0;
}

function parseArgs(argv: string[]): { claimId?: string; runIdHint?: string; list?: boolean } {
  const args: { claimId?: string; runIdHint?: string; list?: boolean } = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--claim-id') args.claimId = argv[++i];
    else if (argv[i] === '--run-id') args.runIdHint = argv[++i];
    else if (argv[i] === '--list') args.list = true;
  }
  return args;
}

function main(): void {
  const args = parseArgs(process.argv);
  if (args.list) { listClaims(); return; }
  if (!args.claimId) {
    console.error('Usage: --claim-id <id> [--run-id <run>]  |  --list');
    process.exit(2);
  }
  process.exit(trace(args.claimId, args.runIdHint));
}

main();
