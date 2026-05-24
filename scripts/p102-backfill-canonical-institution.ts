#!/usr/bin/env tsx
/**
 * P102 backfill: update existing runs' 05_canonical_institution.json with
 * inferred parent_system + aliases (using the canonicalizer). Also populates
 * the T7 dedupe_index.csv with same-system / standalone relationships derived
 * from the institution_index.
 *
 * No network. No claim modification (only identity fields are updated).
 *
 * Usage:
 *   npx tsx scripts/p102-backfill-canonical-institution.ts --all-existing-p102-runs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { inferIdentity, compareInstitutions } from './p102-identity-canonicalizer';
import { SCHEMA_VERSION } from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');
const T7_INDEXES = '/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/indexes';

interface CanonicalInstitution {
  schemaVersion: string;
  institutionId: string;
  canonicalName: string;
  aliases: string[];
  state: string;
  county: string | null;
  city: string;
  zip: string | null;
  address: string | null;
  parentSystem: string | null;
  officialDomains: string[];
  medicalSchoolAffiliations: string[];
  campusType: string;
  sourceOfIdentity: string;
  duplicateOf: string | null;
  doNotMergeReason: string | null;
  existingP97Packet: string | null;
  existingP101Packet: string | null;
  existingLiveListing: string | null;
  status: string;
}

function backfillRun(runFolder: string): { runId: string; before: CanonicalInstitution; after: CanonicalInstitution; changed: boolean } {
  const runId = path.basename(runFolder);
  const canonPath = path.join(runFolder, '05_canonical_institution.json');
  if (!fs.existsSync(canonPath)) throw new Error(`${runId}: 05_canonical_institution.json missing`);
  const before = JSON.parse(fs.readFileSync(canonPath, 'utf8')) as CanonicalInstitution;

  const identity = inferIdentity(before.canonicalName, before.officialDomains[0]);

  const after: CanonicalInstitution = {
    ...before,
    parentSystem: identity.parentSystem,
    aliases: identity.aliases.length > 0 ? Array.from(new Set([...before.aliases, ...identity.aliases.map(a => `${before.canonicalName} (${a})`)])) : before.aliases,
    sourceOfIdentity: `${before.sourceOfIdentity} + identity_canonicalizer_backfill (${identity.evidence})`,
  };

  // Add system domain as additional official domain if relevant
  if (identity.parentSystemDomain && !after.officialDomains.includes(identity.parentSystemDomain) && identity.parentSystemDomain !== before.officialDomains[0]) {
    after.officialDomains = [...after.officialDomains, identity.parentSystemDomain];
  }

  const changed = JSON.stringify(before) !== JSON.stringify(after);
  if (changed) {
    fs.writeFileSync(canonPath, JSON.stringify(after, null, 2) + '\n');
  }

  return { runId, before, after, changed };
}

function populateDedupeIndex(canonicals: Array<{ institutionId: string; canonicalName: string; officialDomain: string }>): { rows: number; written: string } {
  const dedupePath = path.join(T7_INDEXES, 'dedupe_index.csv');
  // Build full pairwise comparison (small N).
  const rows: string[] = [];
  const header = 'schema_version,primary_institution_id,duplicate_institution_id,duplicate_type,confidence,evidence,decision,reviewer,notes';
  if (fs.existsSync(dedupePath)) {
    const existing = fs.readFileSync(dedupePath, 'utf8').split(/\r?\n/);
    if (existing[0] === header) {
      // Append-only: keep existing rows. Detect collisions before appending.
    } else {
      // Re-init with proper header.
      fs.writeFileSync(dedupePath, header + '\n');
    }
  } else {
    fs.mkdirSync(T7_INDEXES, { recursive: true });
    fs.writeFileSync(dedupePath, header + '\n');
  }

  const existingRows = fs.readFileSync(dedupePath, 'utf8').split(/\r?\n/).slice(1).filter(Boolean);
  const seen = new Set(existingRows.map(r => r.split(',').slice(1, 3).join('|')));

  for (let i = 0; i < canonicals.length; i++) {
    for (let j = i + 1; j < canonicals.length; j++) {
      const a = canonicals[i]; const b = canonicals[j];
      const cmp = compareInstitutions(a, b);
      const key = `${a.institutionId}|${b.institutionId}`;
      if (seen.has(key)) continue;
      const csvRow = [
        SCHEMA_VERSION,
        a.institutionId,
        b.institutionId,
        cmp.relationship,
        cmp.relationship === 'SAME_INSTITUTION' || cmp.relationship === 'DISTINCT_CAMPUS_SAME_SYSTEM' ? 'HIGH' : (cmp.relationship === 'UNRELATED' ? 'HIGH' : 'LOW'),
        `"${cmp.evidence.replace(/"/g, '""')}"`,
        cmp.relationship === 'DISTINCT_CAMPUS_SAME_SYSTEM' ? 'KEPT_DISTINCT' : (cmp.relationship === 'SAME_INSTITUTION' ? 'MERGED' : 'KEPT_DISTINCT'),
        'automated',
        'p102-0H backfill',
      ].join(',');
      rows.push(csvRow);
      seen.add(key);
    }
  }
  if (rows.length > 0) fs.appendFileSync(dedupePath, rows.join('\n') + '\n');
  return { rows: rows.length, written: dedupePath };
}

function parseArgs(argv: string[]): { runIds: string[] } {
  const args = { runIds: [] as string[] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-id') args.runIds.push(argv[++i]);
    else if (a === '--all-existing-p102-runs') {
      if (fs.existsSync(RUNS_ROOT)) {
        args.runIds = fs.readdirSync(RUNS_ROOT).filter(n => fs.statSync(path.join(RUNS_ROOT, n)).isDirectory());
      }
    }
  }
  return args;
}

function main(): void {
  const args = parseArgs(process.argv);
  if (args.runIds.length === 0) { console.error('No runs specified.'); process.exit(2); }
  console.log(`[backfill] processing ${args.runIds.length} runs`);

  const results: Array<{ runId: string; institutionId: string; canonicalName: string; officialDomain: string; parentSystem: string | null; changed: boolean }> = [];
  for (const runId of args.runIds) {
    const r = backfillRun(path.join(RUNS_ROOT, runId));
    results.push({
      runId: r.runId,
      institutionId: r.after.institutionId,
      canonicalName: r.after.canonicalName,
      officialDomain: r.after.officialDomains[0],
      parentSystem: r.after.parentSystem,
      changed: r.changed,
    });
    console.log(`  ${r.runId}: ${r.before.canonicalName} → parent=${r.after.parentSystem ?? 'standalone'} (changed=${r.changed})`);
  }

  // Populate dedupe index
  const dedupeResult = populateDedupeIndex(results.map(r => ({
    institutionId: r.institutionId,
    canonicalName: r.canonicalName,
    officialDomain: r.officialDomain,
  })));
  console.log(`[backfill] dedupe index appended ${dedupeResult.rows} new pairwise comparisons → ${dedupeResult.written}`);
}

main();
