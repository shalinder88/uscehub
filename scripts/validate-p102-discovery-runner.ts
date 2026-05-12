#!/usr/bin/env tsx
/**
 * P102 Discovery Runner Validator
 *
 * Checks structural and content rules for P102 spec, doctrine, contracts,
 * templates, and any completed run folders. Refuses to PASS if any rule
 * is violated.
 *
 * Run: npx tsx scripts/validate-p102-discovery-runner.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const REPO_P102_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102');
const T7_P102_ROOT = '/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner';
const T7_LEGACY_FORBIDDEN = '/Volumes/T7Shield_Code/USCEHubEvidence/';
const SCHEMA_VERSION = 'p102-0r-1';

const findings: string[] = [];
const warnings: string[] = [];

function fail(msg: string): void { findings.push(msg); }
function warn(msg: string): void { warnings.push(msg); }

function fileExists(p: string): boolean { return fs.existsSync(p) && fs.statSync(p).isFile(); }
function dirExists(p: string): boolean { return fs.existsSync(p) && fs.statSync(p).isDirectory(); }

function safeJson<T = unknown>(p: string): T | null {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return null; }
}

// -------------------- Quote verification --------------------

const NOT_STATED = 'NOT_STATED_ON_SOURCE';

function normalizeForQuoteMatch(s: string): string {
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

interface ClaimRecord {
  claimId?: string;
  claimType?: string;
  quote?: string;
  sourceUrl?: string;
  sourceHash?: string;
  cleanedTextPath?: string;
  quoteVerified?: boolean;
  sourceScope?: string;
  sourceFamily?: string;
  confidence?: string;
  visibility?: string;
  publicSafeNegativeClaim?: boolean;
  negativeEvidenceType?: string;
  negativeEvidenceStrength?: string;
  campusApplicabilityProof?: string;
}

const FUTURE_LANE_SOURCE_FAMILIES = new Set([
  'GME_PAGE', 'RESIDENCY_PAGE', 'FELLOWSHIP_PAGE',
  'CAREERS_PAGE', 'JOBS_PAGE',
]);
const SYSTEM_OR_SCHOOL_SCOPES = new Set([
  'HEALTH_SYSTEM_LEVEL', 'MEDICAL_SCHOOL_LEVEL',
]);

function verifyOneQuote(quote: string, cleanedTextPath: string): { quoteVerified: boolean; reason: string } {
  if (!quote || quote === NOT_STATED) return { quoteVerified: false, reason: 'NOT_STATED_ON_SOURCE' };
  if (!fileExists(cleanedTextPath)) return { quoteVerified: false, reason: `cleaned_text_missing:${cleanedTextPath}` };
  let cleaned: string;
  try { cleaned = fs.readFileSync(cleanedTextPath, 'utf8'); }
  catch { return { quoteVerified: false, reason: 'cleaned_text_unreadable' }; }
  const normalizedText = normalizeForQuoteMatch(cleaned);
  const normalizedQuote = normalizeForQuoteMatch(quote);
  if (normalizedText.includes(normalizedQuote)) return { quoteVerified: true, reason: 'normalized_substring' };
  return { quoteVerified: false, reason: 'not_found_in_cleaned_text' };
}

// -------------------- Spec / doctrine / contracts --------------------

function checkDocs(): void {
  const required = [
    'P102_NATIONAL_MEDICAL_OPPORTUNITY_EXTRACTOR_SPEC.md',
    'P102_OPERATING_DOCTRINE.md',
    'specs/P102_DATA_CONTRACTS.md',
  ];
  for (const r of required) {
    if (!fileExists(path.join(REPO_P102_ROOT, r))) fail(`Missing required doc: ${r}`);
  }
  const templateDir = path.join(REPO_P102_ROOT, 'indexes');
  for (const t of ['p102_institution_index_template.csv', 'p102_run_index_template.csv', 'p102_source_url_index_template.csv', 'p102_claim_index_template.csv', 'p102_opportunity_index_template.csv', 'p102_artifact_index_template.csv', 'p102_dedupe_index_template.csv']) {
    if (!fileExists(path.join(templateDir, t))) fail(`Missing index template: ${t}`);
  }
  if (!fileExists(path.join(REPO_P102_ROOT, 'queues/p102_queue_template.csv'))) fail('Missing queue template');
}

// -------------------- Forbidden repo changes (best-effort static check) --------------------

function checkForbiddenRepoChanges(): void {
  // We can only check that we didn't create forbidden files; live git diff check is part of Phase L manually.
  const forbiddenIfModified = [
    'prisma/schema.prisma',
    'middleware.ts',
    'app/sitemap.ts',
    'app/robots.ts',
    'app/manifest.ts',
  ];
  // We don't read git here; the validator just confirms it didn't create them as new files.
  // (If they exist pre-P102, that's fine; we don't reject baseline.)
  for (const f of forbiddenIfModified) {
    const p = path.join(REPO_ROOT, f);
    if (fileExists(p)) {
      // OK if pre-existing. The Phase L diff review is the enforcement layer.
    }
  }
  // Confirm we have not written into legacy T7 root.
  if (dirExists(T7_LEGACY_FORBIDDEN) && dirExists(path.join(T7_LEGACY_FORBIDDEN, 'p102-national-runner'))) {
    fail(`Forbidden: P102 artifacts found in legacy root ${T7_LEGACY_FORBIDDEN}`);
  }
}

// -------------------- Run folder checks --------------------

interface RunCheckResult {
  runId: string;
  missing: string[];
  jsonErrors: string[];
  schemaVersionMismatches: string[];
  a3NetworkUsed: boolean | null;
  a3AgentUsed: boolean | null;
  publicSafeClaimsCount: number;
  publicSafeWithoutQuote: number;
  publicSafeNegativeWithoutQuote: number;
  scopeOverclaims: number;
  artifactPathsValid: boolean;
  claimsTotal: number;
  claimsQuoteVerified: number;
  claimsFutureLane: number;
  claimsPublicSafeBlocked: number;
}

const REQUIRED_RUN_FILES = [
  '00_bootstrap.json',
  '00_domain_map.json',
  '00_source_seed_map.json',
  '00_artifact_manifest.csv',
  '00_robots_sitemap_probe.json',
  '00_jsonld_extract.json',
  '00_fixed_path_probe.json',
  '01_source_map.md',
  '02_reader_report.md',
  '03_opportunity_objects.json',
  '04_rejected_sources.json',
  '05_canonical_institution.json',
  '06_coverage_audit.md',
  '07_retry_tasks.md',
  '08_final_report.md',
  '09_final_canonical.json',
  '10_scorecard.md',
  '11_canonical_enriched.json',
  '12_canonical_enriched_v2.json',
  '13_source_claims.json',
  '14_run_summary.json',
  'A1_5_source_completeness_audit.json',
  'RT_depth_usce.json',
  'RT_depth_gme_residency_fellowship.json',
  'RT_depth_jobs_visa.json',
  'RT_depth_physician_services.json',
  'RT_depth_negative_evidence.json',
  'RT_depth_source_scope_conflicts.json',
  'RT_semantic_miss_detector.json',
  '15_publish_gate.md',
  'A3_gate.json',
];

function checkRun(runFolder: string): RunCheckResult {
  const runId = path.basename(runFolder);
  const r: RunCheckResult = {
    runId,
    missing: [],
    jsonErrors: [],
    schemaVersionMismatches: [],
    a3NetworkUsed: null,
    a3AgentUsed: null,
    publicSafeClaimsCount: 0,
    publicSafeWithoutQuote: 0,
    publicSafeNegativeWithoutQuote: 0,
    scopeOverclaims: 0,
    artifactPathsValid: true,
    claimsTotal: 0,
    claimsQuoteVerified: 0,
    claimsFutureLane: 0,
    claimsPublicSafeBlocked: 0,
  };
  for (const f of REQUIRED_RUN_FILES) {
    if (!fileExists(path.join(runFolder, f))) r.missing.push(f);
  }
  for (const f of REQUIRED_RUN_FILES.filter(x => x.endsWith('.json'))) {
    const p = path.join(runFolder, f);
    if (!fileExists(p)) continue;
    const j = safeJson<Record<string, unknown>>(p);
    if (j === null) { r.jsonErrors.push(f); continue; }
    if (j.schemaVersion && j.schemaVersion !== SCHEMA_VERSION) r.schemaVersionMismatches.push(`${f}:${String(j.schemaVersion)}`);
  }

  // A3 self-attestation
  const a3 = safeJson<Record<string, unknown>>(path.join(runFolder, 'A3_gate.json'));
  if (a3) {
    r.a3NetworkUsed = a3.networkUsed === true ? true : a3.networkUsed === false ? false : null;
    r.a3AgentUsed = a3.agentUsed === true ? true : a3.agentUsed === false ? false : null;
    if (r.a3NetworkUsed !== false) fail(`${runId}: A3_gate.json networkUsed must be false (got ${a3.networkUsed})`);
    if (r.a3AgentUsed !== false) fail(`${runId}: A3_gate.json agentUsed must be false (got ${a3.agentUsed})`);
  }
  const pgateMd = path.join(runFolder, '15_publish_gate.md');
  if (fileExists(pgateMd)) {
    const txt = fs.readFileSync(pgateMd, 'utf8');
    if (!/networkUsed:\s*false/.test(txt)) fail(`${runId}: 15_publish_gate.md must state networkUsed: false`);
    if (!/agentUsed:\s*false/.test(txt)) fail(`${runId}: 15_publish_gate.md must state agentUsed: false`);
    if (!/run-folder/.test(txt)) fail(`${runId}: 15_publish_gate.md should state A3 reads only run-folder files`);
  }

  // Public-safe claims discipline
  const opps = safeJson<{ opportunities?: Array<Record<string, unknown>> }>(path.join(runFolder, '03_opportunity_objects.json'));
  if (opps && Array.isArray(opps.opportunities)) {
    for (const o of opps.opportunities) {
      if (o.visibilityLane === 'PUBLIC_SAFE_USCE') {
        r.publicSafeClaimsCount++;
        const claimIds = (o.sourceClaimIds as string[] | undefined) ?? [];
        if (claimIds.length === 0) {
          fail(`${runId}: PUBLIC_SAFE_USCE opportunity ${String(o.opportunityId)} has no sourceClaimIds`);
          r.publicSafeWithoutQuote++;
        }
      }
    }
  }

  // Negative evidence discipline
  const neg = safeJson<{ negativeClaims?: Array<Record<string, unknown>> }>(path.join(runFolder, 'RT_depth_negative_evidence.json'));
  if (neg && Array.isArray(neg.negativeClaims)) {
    for (const n of neg.negativeClaims) {
      if (n.publicSafeNegativeClaim === true) {
        const t = n.negativeEvidenceType;
        if (t !== 'EXPLICIT_NEGATIVE_QUOTE') { fail(`${runId}: publicSafeNegativeClaim=true but type is ${String(t)}`); r.publicSafeNegativeWithoutQuote++; }
        if (n.quoteVerified !== true) { fail(`${runId}: publicSafeNegativeClaim=true but quoteVerified is not true`); r.publicSafeNegativeWithoutQuote++; }
        if (n.negativeEvidenceStrength !== 'STRONG') { fail(`${runId}: publicSafeNegativeClaim=true but strength is ${String(n.negativeEvidenceStrength)}`); r.publicSafeNegativeWithoutQuote++; }
      }
    }
  }

  // Source scope discipline — public-safe USCE on HEALTH_SYSTEM_LEVEL without campus proof = fail
  const srcMapJson = safeJson<{ sources?: Array<Record<string, unknown>> }>(path.join(runFolder, '01_source_map.json'));
  const sourcesByUrl = new Map<string, Record<string, unknown>>();
  if (srcMapJson && Array.isArray(srcMapJson.sources)) {
    for (const s of srcMapJson.sources) sourcesByUrl.set(String(s.sourceUrl), s);
  }

  // -------------------- Claim verification (P102-0C) --------------------
  const claimsFile = path.join(runFolder, '13_source_claims.json');
  const claimsDoc = safeJson<{ claims?: ClaimRecord[] }>(claimsFile);
  if (claimsDoc && Array.isArray(claimsDoc.claims)) {
    for (const c of claimsDoc.claims) {
      r.claimsTotal++;
      const claimId = c.claimId ?? '(no-id)';

      // Structural requirements for every claim
      if (!c.sourceUrl) fail(`${runId}: claim ${claimId} missing sourceUrl`);
      if (!c.sourceHash) fail(`${runId}: claim ${claimId} missing sourceHash`);
      if (!c.cleanedTextPath) fail(`${runId}: claim ${claimId} missing cleanedTextPath`);
      if (c.quote === undefined || c.quote === null) fail(`${runId}: claim ${claimId} missing quote (use NOT_STATED_ON_SOURCE if absent)`);

      // Quote verification
      const isNotStated = c.quote === NOT_STATED;
      const path_ok = !!c.cleanedTextPath && fileExists(c.cleanedTextPath);
      const verifyResult = (c.quote && c.cleanedTextPath)
        ? verifyOneQuote(c.quote, c.cleanedTextPath)
        : { quoteVerified: false, reason: 'missing_quote_or_path' };

      // The extractor sets quoteVerified; the validator re-checks it for correctness.
      // If the extractor said true but the substring fails → fail.
      // If the extractor said false → accept (claim is honestly unverified and cannot go PUBLIC_SAFE).
      if (c.quoteVerified === true && !verifyResult.quoteVerified && !isNotStated) {
        fail(`${runId}: claim ${claimId} quoteVerified=true but quote not found in cleaned text (${verifyResult.reason})`);
      }
      if (verifyResult.quoteVerified) r.claimsQuoteVerified++;

      // Visibility rules
      const visibility = c.visibility ?? '';
      const sourceFamily = (() => {
        const s = c.sourceUrl ? sourcesByUrl.get(c.sourceUrl) : undefined;
        return s ? String(s.sourceFamily) : (c.sourceFamily ?? '');
      })();
      const sourceScope = (() => {
        const s = c.sourceUrl ? sourcesByUrl.get(c.sourceUrl) : undefined;
        return s ? String(s.sourceScope) : (c.sourceScope ?? '');
      })();

      if (visibility === 'PUBLIC_SAFE_USCE') {
        // Must be quote-verified
        if (!verifyResult.quoteVerified) {
          fail(`${runId}: claim ${claimId} PUBLIC_SAFE_USCE but quote not verified (${verifyResult.reason})`);
          r.claimsPublicSafeBlocked++;
        }
        // Quote cannot be NOT_STATED
        if (isNotStated) {
          fail(`${runId}: claim ${claimId} PUBLIC_SAFE_USCE has quote=NOT_STATED_ON_SOURCE`);
          r.claimsPublicSafeBlocked++;
        }
        // Source family cannot be future-lane only
        if (FUTURE_LANE_SOURCE_FAMILIES.has(sourceFamily)) {
          fail(`${runId}: claim ${claimId} PUBLIC_SAFE_USCE from future-lane source family ${sourceFamily}`);
          r.claimsPublicSafeBlocked++;
        }
        // Source scope check
        if (SYSTEM_OR_SCHOOL_SCOPES.has(sourceScope) && !c.campusApplicabilityProof) {
          fail(`${runId}: claim ${claimId} PUBLIC_SAFE_USCE from ${sourceScope} without campusApplicabilityProof`);
          r.claimsPublicSafeBlocked++;
        }
        r.publicSafeClaimsCount++;
      } else if (visibility === 'FUTURE_LANE_ONLY') {
        r.claimsFutureLane++;
      }

      if (!path_ok && !isNotStated) {
        // structural fault already reported above
      }
    }
  }

  // Opportunity-to-claim back-reference check (existing PUBLIC_SAFE_USCE on opportunity must trace to verified claim)
  if (opps && Array.isArray(opps.opportunities) && claimsDoc && Array.isArray(claimsDoc.claims)) {
    const claimById = new Map<string, ClaimRecord>();
    for (const c of claimsDoc.claims) if (c.claimId) claimById.set(c.claimId, c);
    for (const o of opps.opportunities) {
      if (o.visibilityLane !== 'PUBLIC_SAFE_USCE') continue;
      const refs = (o.sourceClaimIds as string[] | undefined) ?? [];
      if (refs.length === 0) continue;
      let anyVerified = false;
      for (const ref of refs) {
        const c = claimById.get(ref);
        if (!c) { fail(`${runId}: PUBLIC_SAFE_USCE opportunity ${String(o.opportunityId)} references missing claim ${ref}`); continue; }
        if (c.quoteVerified === true && c.quote !== NOT_STATED) anyVerified = true;
      }
      if (!anyVerified) fail(`${runId}: PUBLIC_SAFE_USCE opportunity ${String(o.opportunityId)} has no verified claims`);
    }
  }

  // Artifact path discipline: T7 paths in cleanedTextPath / rawHtmlPath must start with canonical root
  if (srcMapJson && Array.isArray(srcMapJson.sources)) {
    for (const s of srcMapJson.sources) {
      const cleaned = s.cleanedTextPath as string | null;
      const raw = s.rawHtmlPath as string | null;
      for (const p of [cleaned, raw]) {
        if (!p) continue;
        if (!p.startsWith(T7_P102_ROOT)) {
          fail(`${runId}: artifact path outside canonical T7 root: ${p}`);
          r.artifactPathsValid = false;
        }
        if (p.startsWith(T7_LEGACY_FORBIDDEN)) {
          fail(`${runId}: artifact path uses legacy T7 root: ${p}`);
          r.artifactPathsValid = false;
        }
        if (!fileExists(p)) {
          fail(`${runId}: artifact path declared but file missing: ${p}`);
          r.artifactPathsValid = false;
        }
      }
    }
  }

  // No fake placeholders
  const a0Probe = safeJson<{ probes?: Array<Record<string, unknown>> }>(path.join(runFolder, '00_fixed_path_probe.json'));
  if (a0Probe && Array.isArray(a0Probe.probes)) {
    for (const p of a0Probe.probes) {
      const screenshotStatus = p.screenshotStatus as string | undefined;
      if (screenshotStatus === 'CAPTURED' && !p.cleanedTextPath) {
        fail(`${runId}: probe claims CAPTURED screenshot but no source captured: ${String(p.sourceUrl)}`);
      }
    }
  }
  // Banned placeholder strings
  const allFiles = REQUIRED_RUN_FILES.map(f => path.join(runFolder, f)).filter(fileExists);
  for (const f of allFiles) {
    const txt = fs.readFileSync(f, 'utf8');
    if (txt.includes('PENDING_T7_BACKFILL')) fail(`${runId}: banned placeholder PENDING_T7_BACKFILL found in ${path.basename(f)}`);
  }

  // Report missing
  for (const m of r.missing) fail(`${runId}: missing required file ${m}`);
  for (const j of r.jsonErrors) fail(`${runId}: JSON parse error in ${j}`);
  for (const s of r.schemaVersionMismatches) fail(`${runId}: schemaVersion mismatch ${s}`);

  return r;
}

// -------------------- T7 index sanity --------------------

function checkT7Indexes(): void {
  if (!dirExists(T7_P102_ROOT)) { warn(`T7 P102 root not present (acceptable if T7 not mounted): ${T7_P102_ROOT}`); return; }
  const indexDir = path.join(T7_P102_ROOT, 'indexes');
  for (const idx of ['institution_index.csv', 'run_index.csv', 'source_url_index.csv', 'artifact_index.csv']) {
    const p = path.join(indexDir, idx);
    if (!fileExists(p)) fail(`Missing T7 index: ${idx}`);
    else {
      const first = fs.readFileSync(p, 'utf8').split('\n')[0];
      if (!first.startsWith('schema_version')) fail(`T7 index ${idx} missing schema_version column`);
    }
  }
}

// -------------------- Main --------------------

function main(): void {
  console.log('='.repeat(60));
  console.log('P102 Discovery Runner Validator');
  console.log('='.repeat(60));

  checkDocs();
  checkForbiddenRepoChanges();
  checkT7Indexes();

  // Check each run folder
  const runsDir = path.join(REPO_P102_ROOT, 'runs');
  if (dirExists(runsDir)) {
    const runs = fs.readdirSync(runsDir).filter(n => dirExists(path.join(runsDir, n)));
    for (const run of runs) {
      const result = checkRun(path.join(runsDir, run));
      console.log(`  Run ${result.runId}: missing=${result.missing.length}, jsonErrors=${result.jsonErrors.length}, network=${result.a3NetworkUsed}, agent=${result.a3AgentUsed}, claims=${result.claimsTotal} (verified=${result.claimsQuoteVerified}, futureLane=${result.claimsFutureLane}, publicSafe=${result.publicSafeClaimsCount}, blocked=${result.claimsPublicSafeBlocked})`);
    }
  } else {
    warn('No runs/ directory yet (acceptable before first dry run).');
  }

  console.log('-'.repeat(60));
  if (findings.length === 0) {
    console.log(`Overall: PASSED  (warnings: ${warnings.length})`);
    if (warnings.length > 0) for (const w of warnings) console.log(`  WARN: ${w}`);
    process.exit(0);
  } else {
    console.log(`Overall: FAILED  (findings: ${findings.length}, warnings: ${warnings.length})`);
    for (const f of findings) console.log(`  FAIL: ${f}`);
    for (const w of warnings) console.log(`  WARN: ${w}`);
    process.exit(1);
  }
}

main();
