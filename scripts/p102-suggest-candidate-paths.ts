#!/usr/bin/env tsx
/**
 * P102 candidate-path generator — suggests additional URL paths to probe
 * for a given institution beyond the framework's standard FIXED_PATHS.
 *
 * Inputs: canonical name, official domain, optional medical-school
 * affiliation, optional parent system.
 *
 * Output: ranked list of candidate path suggestions with rationale.
 *
 * No network. No file I/O. Diagnostic output only.
 *
 * Usage:
 *   npx tsx scripts/p102-suggest-candidate-paths.ts \
 *     --canonical-name "Houston Methodist Hospital" \
 *     --official-domain houstonmethodist.org \
 *     --medical-school "Weill Cornell"
 */

import { inferIdentity } from './p102-identity-canonicalizer';

interface CandidatePath {
  path: string;
  rationale: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  bucket: 'CORE_USCE' | 'CORE_USCE_NESTED' | 'GME_LIKE' | 'EDUCATION_PORTAL' | 'INSTITUTION_SPECIFIC' | 'SYSTEM_SPECIFIC';
}

const BASE_CORE_PATHS: CandidatePath[] = [
  { path: '/observership', rationale: 'standard observership URL', confidence: 'HIGH', bucket: 'CORE_USCE' },
  { path: '/observerships', rationale: 'plural variant', confidence: 'HIGH', bucket: 'CORE_USCE' },
  { path: '/visiting-medical-students', rationale: 'standard VSM URL', confidence: 'HIGH', bucket: 'CORE_USCE' },
  { path: '/electives', rationale: 'standard electives URL', confidence: 'HIGH', bucket: 'CORE_USCE' },
];

const NESTED_PATHS: CandidatePath[] = [
  { path: '/health-professionals/education/observership', rationale: 'nested under health-professionals/education', confidence: 'MEDIUM', bucket: 'CORE_USCE_NESTED' },
  { path: '/health-professionals/education/medical-students', rationale: 'nested under health-professionals/education', confidence: 'MEDIUM', bucket: 'CORE_USCE_NESTED' },
  { path: '/health-professionals/education/visiting-students', rationale: 'nested under health-professionals/education', confidence: 'MEDIUM', bucket: 'CORE_USCE_NESTED' },
  { path: '/medical-education/observership', rationale: 'nested under medical-education', confidence: 'MEDIUM', bucket: 'CORE_USCE_NESTED' },
  { path: '/medical-education/visiting-students', rationale: 'nested under medical-education', confidence: 'MEDIUM', bucket: 'CORE_USCE_NESTED' },
  { path: '/professional-education/observership', rationale: 'nested under professional-education', confidence: 'MEDIUM', bucket: 'CORE_USCE_NESTED' },
  { path: '/student-affairs/visiting-students', rationale: 'nested under student-affairs', confidence: 'MEDIUM', bucket: 'CORE_USCE_NESTED' },
  { path: '/education/medical-students/visiting', rationale: 'nested under education/medical-students', confidence: 'MEDIUM', bucket: 'CORE_USCE_NESTED' },
  { path: '/education/observership', rationale: 'nested under /education', confidence: 'MEDIUM', bucket: 'CORE_USCE_NESTED' },
  { path: '/education/clinical-experience', rationale: 'less common; nested', confidence: 'LOW', bucket: 'CORE_USCE_NESTED' },
  { path: '/clinical-experience', rationale: 'less common; root-level', confidence: 'LOW', bucket: 'CORE_USCE' },
];

const GME_LIKE_PATHS: CandidatePath[] = [
  { path: '/gme/visiting-students', rationale: 'GME pages sometimes host visiting student info', confidence: 'MEDIUM', bucket: 'GME_LIKE' },
  { path: '/graduate-medical-education/visiting-students', rationale: 'fuller GME path', confidence: 'MEDIUM', bucket: 'GME_LIKE' },
  { path: '/residency/visiting-students', rationale: 'cross-cutting residency/VSM', confidence: 'LOW', bucket: 'GME_LIKE' },
];

const EDUCATION_PORTAL_PATHS: CandidatePath[] = [
  { path: '/academic', rationale: 'academic portal', confidence: 'LOW', bucket: 'EDUCATION_PORTAL' },
  { path: '/academic-institute', rationale: 'academic institute portal (e.g. Houston Methodist)', confidence: 'MEDIUM', bucket: 'EDUCATION_PORTAL' },
  { path: '/learning', rationale: 'learning portal', confidence: 'LOW', bucket: 'EDUCATION_PORTAL' },
  { path: '/center-for-medical-education', rationale: 'CME-style center page', confidence: 'LOW', bucket: 'EDUCATION_PORTAL' },
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function generateCandidates(args: { canonicalName: string; officialDomain: string; medicalSchool?: string; parentSystem?: string | null }): CandidatePath[] {
  const candidates: CandidatePath[] = [];
  candidates.push(...BASE_CORE_PATHS);
  candidates.push(...NESTED_PATHS);
  candidates.push(...GME_LIKE_PATHS);
  candidates.push(...EDUCATION_PORTAL_PATHS);

  // Institution-specific candidates from canonical name tokens
  const tokens = args.canonicalName.toLowerCase().split(/\s+/).filter(t => t.length > 3 && t !== 'hospital' && t !== 'health' && t !== 'medical' && t !== 'center' && t !== 'university');
  for (const t of tokens) {
    candidates.push({
      path: `/${slugify(t)}-observership`,
      rationale: `institution-token "${t}" + observership compound path`,
      confidence: 'LOW',
      bucket: 'INSTITUTION_SPECIFIC',
    });
  }

  // Medical-school affiliated paths (probe SOM domain, not institution domain — informational only)
  if (args.medicalSchool) {
    const somSlug = slugify(args.medicalSchool);
    candidates.push({
      path: `(at SOM domain) /visiting-students`,
      rationale: `medical-school affiliate ${args.medicalSchool} typically owns VSM page; probe SOM domain separately`,
      confidence: 'MEDIUM',
      bucket: 'EDUCATION_PORTAL',
    });
    candidates.push({
      path: `(at SOM domain) /${somSlug}/visiting-students`,
      rationale: `SOM-pathed VSM page (${somSlug})`,
      confidence: 'LOW',
      bucket: 'EDUCATION_PORTAL',
    });
  }

  // Parent-system-specific candidates (probe system domain, not institution domain)
  const ident = inferIdentity(args.canonicalName, args.officialDomain);
  if (ident.parentSystem && ident.parentSystemDomain && ident.parentSystemDomain !== args.officialDomain) {
    candidates.push({
      path: `(at SYSTEM domain ${ident.parentSystemDomain}) /observership`,
      rationale: `parent system ${ident.parentSystem} may host system-level observership info`,
      confidence: 'MEDIUM',
      bucket: 'SYSTEM_SPECIFIC',
    });
  }

  // Dedupe by path
  const seen = new Set<string>();
  const unique = candidates.filter(c => { if (seen.has(c.path)) return false; seen.add(c.path); return true; });

  // Sort: HIGH > MEDIUM > LOW
  const confidenceOrder: Record<CandidatePath['confidence'], number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  unique.sort((a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence]);
  return unique;
}

function parseArgs(argv: string[]): { canonicalName: string; officialDomain: string; medicalSchool?: string; parentSystem?: string | null } {
  const args = { canonicalName: '', officialDomain: '', medicalSchool: undefined as string | undefined, parentSystem: null as string | null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--canonical-name') args.canonicalName = argv[++i];
    else if (a === '--official-domain') args.officialDomain = argv[++i];
    else if (a === '--medical-school') args.medicalSchool = argv[++i];
    else if (a === '--parent-system') args.parentSystem = argv[++i];
  }
  if (!args.canonicalName) throw new Error('--canonical-name required');
  if (!args.officialDomain) throw new Error('--official-domain required');
  return args;
}

function main(): void {
  const args = parseArgs(process.argv);
  console.log(`[paths] candidate paths for ${args.canonicalName} (${args.officialDomain})`);
  if (args.medicalSchool) console.log(`        medical-school affiliate: ${args.medicalSchool}`);
  if (args.parentSystem) console.log(`        parent system: ${args.parentSystem}`);
  console.log();

  const identity = inferIdentity(args.canonicalName, args.officialDomain);
  console.log(`Identity inference:`);
  console.log(`  parentSystem:        ${identity.parentSystem ?? 'standalone'}`);
  console.log(`  parentSystemDomain:  ${identity.parentSystemDomain ?? '-'}`);
  console.log(`  campusName:          ${identity.campusName ?? '-'}`);
  console.log(`  evidence:            ${identity.evidence}`);
  console.log();

  const candidates = generateCandidates(args);
  console.log(`Candidate paths (${candidates.length}):`);
  const grouped: Record<string, CandidatePath[]> = {};
  for (const c of candidates) {
    (grouped[c.bucket] ??= []).push(c);
  }
  for (const bucket of Object.keys(grouped)) {
    console.log(`\n  [${bucket}] ${grouped[bucket].length} paths:`);
    for (const c of grouped[bucket]) {
      console.log(`    ${c.confidence.padEnd(6)} ${c.path.padEnd(60)} ${c.rationale}`);
    }
  }
  console.log();
  console.log(`These are suggestions only. The framework's standard FIXED_PATHS list (in p102-discovery-runner.ts) is the authoritative probe list; this script identifies additional candidates worth manual review or P102-0K addition.`);
}

main();
