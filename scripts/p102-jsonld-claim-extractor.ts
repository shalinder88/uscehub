#!/usr/bin/env tsx
/**
 * P102 JSON-LD claim extractor — parses captured JSON-LD records
 * (schema.org structured data) from existing run folders and emits
 * structured claims separate from cleaned-text extraction.
 *
 * Claims are written to 13b_jsonld_claims.json per run. Same schema
 * shape as 13_source_claims.json but with extractionSource='JSON_LD'
 * and quote sourced from the JSON-LD field value.
 *
 * Discovered candidate URLs (e.g., separate careers domain mentioned
 * in an Organization record) are written to 00_jsonld_discovered_urls.json.
 *
 * No network. No Agent. Operates on already-captured JSON-LD files.
 *
 * Usage:
 *   npx tsx scripts/p102-jsonld-claim-extractor.ts --all-existing-p102-runs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { SCHEMA_VERSION } from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');

interface JsonLdRecord {
  sourceUrl: string;
  jsonldPath: string;
  itemCount: number;
}

interface JsonLdExtract {
  schemaVersion?: string;
  records?: JsonLdRecord[];
}

interface JsonLdClaim {
  schemaVersion: string;
  claimId: string;
  institutionId: string;
  runId: string;
  extractionSource: 'JSON_LD';
  jsonldType: string;
  jsonldFieldPath: string;
  quote: string;
  sourceUrl: string;
  jsonldPath: string;
  sourceHash: string;
  lane: string;
  visibility: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  notPublicReason: string | null;
}

interface DiscoveredUrl {
  url: string;
  source: 'JSON_LD_Organization_url' | 'JSON_LD_Organization_sameAs' | 'JSON_LD_JobPosting_hiringOrganization' | 'JSON_LD_other';
  jsonldType: string;
  originSourceUrl: string;
}

function safeRead(p: string): string | null {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function getType(o: unknown): string {
  if (o && typeof o === 'object') {
    const t = (o as { '@type'?: string | string[] })['@type'];
    if (Array.isArray(t)) return t[0] ?? 'Unknown';
    if (typeof t === 'string') return t;
  }
  return 'Unknown';
}

function extractClaimsFromJsonLd(
  record: JsonLdRecord,
  records: unknown[],
  runId: string,
  institutionId: string,
  seed: { i: number },
): { claims: JsonLdClaim[]; discoveredUrls: DiscoveredUrl[] } {
  const claims: JsonLdClaim[] = [];
  const discoveredUrls: DiscoveredUrl[] = [];

  const mkClaim = (
    type: string,
    fieldPath: string,
    quote: string,
    lane: string,
    visibility: string,
    confidence: JsonLdClaim['confidence'],
    notPublicReason: string | null,
  ): JsonLdClaim => ({
    schemaVersion: SCHEMA_VERSION,
    claimId: `jsonld_claim_${runId}_${seed.i++}`,
    institutionId,
    runId,
    extractionSource: 'JSON_LD',
    jsonldType: type,
    jsonldFieldPath: fieldPath,
    quote,
    sourceUrl: record.sourceUrl,
    jsonldPath: record.jsonldPath,
    sourceHash: '',
    lane,
    visibility,
    confidence,
    notPublicReason,
  });

  for (const item of records) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const t = getType(obj);

    if (t === 'JobPosting' || t.endsWith('JobPosting')) {
      // FUTURE_LANE_JOB signal
      const title = typeof obj.title === 'string' ? obj.title : null;
      const employmentType = typeof obj.employmentType === 'string' ? obj.employmentType : null;
      const datePosted = typeof obj.datePosted === 'string' ? obj.datePosted : null;
      const quote = [title, employmentType ? `(${employmentType})` : null, datePosted ? `posted ${datePosted}` : null].filter(Boolean).join(' ');
      if (quote) {
        claims.push(mkClaim(t, 'title|employmentType|datePosted', quote, 'CAREERS_PAGE', 'FUTURE_LANE_ONLY', 'HIGH', 'JobPosting → future-lane only'));
      }
      // hiringOrganization → discovered URL
      if (obj.hiringOrganization && typeof obj.hiringOrganization === 'object') {
        const hiring = obj.hiringOrganization as Record<string, unknown>;
        if (typeof hiring.url === 'string') {
          discoveredUrls.push({ url: hiring.url, source: 'JSON_LD_JobPosting_hiringOrganization', jsonldType: t, originSourceUrl: record.sourceUrl });
        }
      }
    } else if (t === 'EducationalOccupationalProgram' || t === 'WorkBasedProgram' || t.includes('Program')) {
      // Possible USCE candidate
      const name = typeof obj.name === 'string' ? obj.name : null;
      const description = typeof obj.description === 'string' ? obj.description : null;
      const programType = typeof obj.programType === 'string' ? obj.programType : null;
      const occupationalCategory = typeof obj.occupationalCategory === 'string' ? obj.occupationalCategory : null;
      const quote = [name, programType ? `(${programType})` : null, description ? `: ${description.slice(0, 200)}` : null].filter(Boolean).join(' ');
      if (quote) {
        // Conservative: CAUTION_SAFE_INTERNAL_REVIEW until model confirms USCE relevance
        const isUscey = /\b(observership|visiting|elective|shadow|clinical\s+experience|medical\s+student)\b/i.test(quote);
        claims.push(mkClaim(
          t,
          'name|programType|description',
          quote,
          isUscey ? 'IMG_OBSERVERSHIP' : 'PHYSICIAN_SERVICES',
          isUscey ? 'CAUTION_SAFE_INTERNAL_REVIEW' : 'FUTURE_LANE_ONLY',
          isUscey ? 'MEDIUM' : 'MEDIUM',
          isUscey ? 'JSON-LD EducationalOccupationalProgram with USCE-relevant keywords; needs model A1/A2 reader for PUBLIC_SAFE promotion' : 'JSON-LD EducationalOccupationalProgram without USCE keywords; treated as future-lane',
        ));
      }
      if (typeof obj.url === 'string') {
        discoveredUrls.push({ url: obj.url, source: 'JSON_LD_other', jsonldType: t, originSourceUrl: record.sourceUrl });
      }
    } else if (t === 'Organization' || t.endsWith('Organization')) {
      // No claim — but record discovered URLs (separate careers domain, etc.)
      if (typeof obj.url === 'string' && obj.url !== record.sourceUrl) {
        discoveredUrls.push({ url: obj.url, source: 'JSON_LD_Organization_url', jsonldType: t, originSourceUrl: record.sourceUrl });
      }
      if (Array.isArray(obj.sameAs)) {
        for (const u of obj.sameAs) {
          if (typeof u === 'string') discoveredUrls.push({ url: u, source: 'JSON_LD_Organization_sameAs', jsonldType: t, originSourceUrl: record.sourceUrl });
        }
      }
    } else if (t === 'WebSite' || t === 'WebPage' || t === 'BreadcrumbList' || t === 'Person' || t === 'ImageObject') {
      // Skip these types entirely.
      continue;
    } else {
      // Unknown type — capture as a discovered-URL hint if it has a url
      if (typeof obj.url === 'string') {
        discoveredUrls.push({ url: obj.url, source: 'JSON_LD_other', jsonldType: t, originSourceUrl: record.sourceUrl });
      }
    }
  }

  return { claims, discoveredUrls };
}

function processRun(runFolder: string): { runId: string; claims: number; discoveredUrls: number } {
  const runId = path.basename(runFolder);
  const extractPath = path.join(runFolder, '00_jsonld_extract.json');
  const canonPath = path.join(runFolder, '05_canonical_institution.json');
  if (!fs.existsSync(extractPath) || !fs.existsSync(canonPath)) {
    console.log(`  ${runId}: missing input files; skipping`);
    return { runId, claims: 0, discoveredUrls: 0 };
  }
  const extract = JSON.parse(fs.readFileSync(extractPath, 'utf8')) as JsonLdExtract;
  const canon = JSON.parse(fs.readFileSync(canonPath, 'utf8')) as { institutionId: string };

  const seed = { i: 1 };
  const allClaims: JsonLdClaim[] = [];
  const allDiscovered: DiscoveredUrl[] = [];

  for (const rec of extract.records ?? []) {
    const body = safeRead(rec.jsonldPath);
    if (!body) continue;
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { continue; }
    const records = Array.isArray(parsed) ? parsed : [parsed];
    const r = extractClaimsFromJsonLd(rec, records, runId, canon.institutionId, seed);
    allClaims.push(...r.claims);
    allDiscovered.push(...r.discoveredUrls);
  }

  // Write claims
  fs.writeFileSync(path.join(runFolder, '13b_jsonld_claims.json'), JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    runId,
    institutionId: canon.institutionId,
    extractedAt: new Date().toISOString(),
    extractedBy: 'p102-jsonld-claim-extractor (deterministic structured-data parse; no network)',
    claims: allClaims,
  }, null, 2) + '\n');

  // Write discovered URLs
  fs.writeFileSync(path.join(runFolder, '00_jsonld_discovered_urls.json'), JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    runId,
    institutionId: canon.institutionId,
    extractedAt: new Date().toISOString(),
    discoveredUrls: allDiscovered,
    note: 'URLs found in captured JSON-LD that are off-domain or otherwise candidate sources. A4 may convert these to REFETCH_TARGETED tasks. No automatic fetching.',
  }, null, 2) + '\n');

  return { runId, claims: allClaims.length, discoveredUrls: allDiscovered.length };
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
  console.log(`[jsonld] processing ${args.runIds.length} runs`);
  for (const runId of args.runIds) {
    const r = processRun(path.join(RUNS_ROOT, runId));
    console.log(`  ${r.runId}: ${r.claims} JSON-LD claims, ${r.discoveredUrls} discovered URLs`);
  }
}

main();
