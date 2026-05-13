#!/usr/bin/env tsx
/**
 * P102 universe inventory — tracks national coverage:
 *   - How many institutions exist (from a coverage baseline file)
 *   - How many we have packets for (P101 + P102)
 *   - How many have been A0-probed (P102 runs)
 *   - How many have quote-verified claims
 *   - How many have PUBLIC_SAFE_USCE
 *   - Coverage by state / type / parent system
 *
 * Reads only repo files + T7 index CSVs. No network. No Agent.
 *
 * Outputs:
 *   - docs/.../p102/P102_UNIVERSE_INVENTORY.md (human-readable summary)
 *   - docs/.../p102/specs/p102_universe_inventory.json (machine-readable detail)
 *
 * Usage:
 *   npx tsx scripts/p102-universe-inventory.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { SCHEMA_VERSION } from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const P102_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102');
const RUNS_ROOT = path.join(P102_ROOT, 'runs');
const P101_PACKETS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/institution-packets');
const T7_INSTITUTION_INDEX = '/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/indexes/institution_index.csv';

// US national hospital universe — rough reference numbers. These are
// approximations from public sources (AHA, CMS) for sense-of-scale only.
// Not authoritative; revise when better counts available.
const NATIONAL_UNIVERSE_BASELINE = {
  acuteCareHospitals: 5180,         // AHA 2024 community hospitals
  teachingHospitals: 1100,          // ~ACGME-accredited sponsoring institutions
  academicMedicalCenters: 180,      // AAMC member medical centers
  childrenHospitals: 220,
  totalEstimatedRelevant: 6000,     // catch-all for USCE-relevant institutions
};

function safeJson<T = unknown>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return null; }
}

function listFilesRecursive(dir: string, ext: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(full, ext));
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out;
}

interface InstitutionRecord {
  institutionId: string;
  canonicalName: string;
  state: string;
  city?: string;
  parentSystem?: string | null;
  campusType?: string;
  hasP101Packet: boolean;
  hasP102Run: boolean;
  hasClaims: boolean;
  publicSafeClaimsCount: number;
  totalClaimsCount: number;
}

function collectFromP101(): Map<string, Partial<InstitutionRecord>> {
  const map = new Map<string, Partial<InstitutionRecord>>();
  const files = listFilesRecursive(P101_PACKETS_ROOT, '.json');
  for (const f of files) {
    const data = safeJson<{ institution?: { name?: string; state?: string; city?: string }; institutionIdentity?: { name?: string; state?: string; city?: string } }>(f);
    if (!data) continue;
    const inst = data.institution ?? data.institutionIdentity;
    if (!inst?.name) continue;
    const slug = inst.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    const id = `inst_${slug}_${(inst.state ?? '').toLowerCase()}`;
    map.set(id, {
      institutionId: id,
      canonicalName: inst.name,
      state: inst.state ?? '?',
      city: inst.city,
      hasP101Packet: true,
    });
  }
  return map;
}

function collectFromP102Runs(): Map<string, Partial<InstitutionRecord>> {
  const map = new Map<string, Partial<InstitutionRecord>>();
  if (!fs.existsSync(RUNS_ROOT)) return map;
  for (const runId of fs.readdirSync(RUNS_ROOT)) {
    const runFolder = path.join(RUNS_ROOT, runId);
    if (!fs.statSync(runFolder).isDirectory()) continue;
    const canon = safeJson<{ institutionId?: string; canonicalName?: string; state?: string; city?: string; parentSystem?: string | null; campusType?: string }>(path.join(runFolder, '05_canonical_institution.json'));
    if (!canon?.institutionId) continue;
    const claims = safeJson<{ claims?: Array<{ visibility: string }> }>(path.join(runFolder, '13_source_claims.json'));
    const allClaims = claims?.claims ?? [];
    const publicSafe = allClaims.filter(c => c.visibility === 'PUBLIC_SAFE_USCE').length;
    const prior = map.get(canon.institutionId) ?? {};
    map.set(canon.institutionId, {
      ...prior,
      institutionId: canon.institutionId,
      canonicalName: canon.canonicalName ?? prior.canonicalName,
      state: canon.state ?? prior.state ?? '?',
      city: canon.city ?? prior.city,
      parentSystem: canon.parentSystem ?? prior.parentSystem,
      campusType: canon.campusType ?? prior.campusType,
      hasP102Run: true,
      hasClaims: allClaims.length > 0,
      publicSafeClaimsCount: (prior.publicSafeClaimsCount ?? 0) + publicSafe,
      totalClaimsCount: (prior.totalClaimsCount ?? 0) + allClaims.length,
    });
  }
  return map;
}

function mergeInstitutions(p101: Map<string, Partial<InstitutionRecord>>, p102: Map<string, Partial<InstitutionRecord>>): InstitutionRecord[] {
  const all = new Map<string, Partial<InstitutionRecord>>();
  for (const [k, v] of p101) all.set(k, { ...v });
  for (const [k, v] of p102) all.set(k, { ...all.get(k), ...v });
  return Array.from(all.values()).map(p => ({
    institutionId: p.institutionId ?? '?',
    canonicalName: p.canonicalName ?? '?',
    state: p.state ?? '?',
    city: p.city,
    parentSystem: p.parentSystem ?? null,
    campusType: p.campusType,
    hasP101Packet: p.hasP101Packet ?? false,
    hasP102Run: p.hasP102Run ?? false,
    hasClaims: p.hasClaims ?? false,
    publicSafeClaimsCount: p.publicSafeClaimsCount ?? 0,
    totalClaimsCount: p.totalClaimsCount ?? 0,
  }));
}

function generateReport(institutions: InstitutionRecord[]): { md: string; json: object } {
  const totals = {
    institutions: institutions.length,
    p101Packets: institutions.filter(i => i.hasP101Packet).length,
    p102Runs: institutions.filter(i => i.hasP102Run).length,
    institutionsWithClaims: institutions.filter(i => i.hasClaims).length,
    institutionsWithPublicSafe: institutions.filter(i => i.publicSafeClaimsCount > 0).length,
    totalClaims: institutions.reduce((s, i) => s + i.totalClaimsCount, 0),
    totalPublicSafe: institutions.reduce((s, i) => s + i.publicSafeClaimsCount, 0),
  };

  const byState: Record<string, number> = {};
  for (const i of institutions) byState[i.state] = (byState[i.state] ?? 0) + 1;

  const byParent: Record<string, number> = {};
  for (const i of institutions) {
    const k = i.parentSystem ?? '(standalone)';
    byParent[k] = (byParent[k] ?? 0) + 1;
  }

  const md = (() => {
    const lines: string[] = [];
    lines.push(`# P102 Universe Inventory`);
    lines.push('');
    lines.push(`_Generated: ${new Date().toISOString()}. Pure data transform from P101 packets + P102 runs. No network._`);
    lines.push('');
    lines.push(`## National baseline (reference; not authoritative)`);
    lines.push('');
    lines.push(`| Category | Approximate count |`);
    lines.push(`|---|---:|`);
    lines.push(`| Acute-care hospitals (AHA 2024) | ${NATIONAL_UNIVERSE_BASELINE.acuteCareHospitals} |`);
    lines.push(`| Teaching hospitals (ACGME) | ${NATIONAL_UNIVERSE_BASELINE.teachingHospitals} |`);
    lines.push(`| Academic medical centers (AAMC) | ${NATIONAL_UNIVERSE_BASELINE.academicMedicalCenters} |`);
    lines.push(`| Children's hospitals | ${NATIONAL_UNIVERSE_BASELINE.childrenHospitals} |`);
    lines.push(`| **Total estimated USCE-relevant** | **${NATIONAL_UNIVERSE_BASELINE.totalEstimatedRelevant}** |`);
    lines.push('');

    lines.push(`## Current coverage`);
    lines.push('');
    lines.push(`| Metric | Value | % of estimated USCE-relevant |`);
    lines.push(`|---|---:|---:|`);
    lines.push(`| Institutions tracked (P101 ∪ P102) | ${totals.institutions} | ${(100 * totals.institutions / NATIONAL_UNIVERSE_BASELINE.totalEstimatedRelevant).toFixed(2)}% |`);
    lines.push(`| With P101 enhanced packets | ${totals.p101Packets} | ${(100 * totals.p101Packets / NATIONAL_UNIVERSE_BASELINE.totalEstimatedRelevant).toFixed(2)}% |`);
    lines.push(`| With P102 A0+ runs | ${totals.p102Runs} | ${(100 * totals.p102Runs / NATIONAL_UNIVERSE_BASELINE.totalEstimatedRelevant).toFixed(2)}% |`);
    lines.push(`| With ≥1 quote-verified claim | ${totals.institutionsWithClaims} | ${(100 * totals.institutionsWithClaims / NATIONAL_UNIVERSE_BASELINE.totalEstimatedRelevant).toFixed(2)}% |`);
    lines.push(`| With ≥1 PUBLIC_SAFE_USCE | ${totals.institutionsWithPublicSafe} | ${(100 * totals.institutionsWithPublicSafe / NATIONAL_UNIVERSE_BASELINE.totalEstimatedRelevant).toFixed(2)}% |`);
    lines.push('');
    lines.push(`Total claims emitted: ${totals.totalClaims}`);
    lines.push(`Total PUBLIC_SAFE_USCE claims: ${totals.totalPublicSafe}`);
    lines.push('');

    lines.push(`## Coverage by state`);
    lines.push('');
    lines.push(`| State | Institutions tracked |`);
    lines.push(`|---|---:|`);
    for (const s of Object.keys(byState).sort()) lines.push(`| ${s} | ${byState[s]} |`);
    lines.push('');

    lines.push(`## Coverage by parent system`);
    lines.push('');
    lines.push(`| Parent system | Institutions tracked |`);
    lines.push(`|---|---:|`);
    for (const p of Object.keys(byParent).sort((a, b) => byParent[b] - byParent[a])) lines.push(`| ${p} | ${byParent[p]} |`);
    lines.push('');

    lines.push(`## Gap analysis`);
    lines.push('');
    const gapInstitutions = NATIONAL_UNIVERSE_BASELINE.totalEstimatedRelevant - totals.institutions;
    const gapPublicSafe = NATIONAL_UNIVERSE_BASELINE.totalEstimatedRelevant - totals.institutionsWithPublicSafe;
    lines.push(`- Untouched institutions (estimate): ${gapInstitutions} (~${(100 * gapInstitutions / NATIONAL_UNIVERSE_BASELINE.totalEstimatedRelevant).toFixed(0)}% of the universe)`);
    lines.push(`- Institutions still needing a PUBLIC_SAFE_USCE outcome: ${gapPublicSafe}`);
    lines.push('');
    lines.push(`**To close the gap:** P102-0D model reader is the blocker. Once online, the runner scales to one-institution-per-batch with sub-hour wall time per institution.`);
    return lines.join('\n') + '\n';
  })();

  const jsonOut = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    nationalBaseline: NATIONAL_UNIVERSE_BASELINE,
    totals,
    byState,
    byParentSystem: byParent,
    institutions,
  };

  return { md, json: jsonOut };
}

function main(): void {
  console.log('[universe] collecting from P101 packets…');
  const p101 = collectFromP101();
  console.log(`[universe]   ${p101.size} institutions in P101`);
  console.log('[universe] collecting from P102 runs…');
  const p102 = collectFromP102Runs();
  console.log(`[universe]   ${p102.size} institutions in P102`);

  const merged = mergeInstitutions(p101, p102);
  console.log(`[universe] total tracked: ${merged.length}`);

  const { md, json } = generateReport(merged);
  const mdPath = path.join(P102_ROOT, 'P102_UNIVERSE_INVENTORY.md');
  const jsonPath = path.join(P102_ROOT, 'specs/p102_universe_inventory.json');
  fs.writeFileSync(mdPath, md);
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n');
  console.log(`[universe] → ${path.relative(REPO_ROOT, mdPath)}`);
  console.log(`[universe] → ${path.relative(REPO_ROOT, jsonPath)}`);
}

main();
