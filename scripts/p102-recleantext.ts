#!/usr/bin/env tsx
/**
 * Diagnostic: re-clean raw HTML with the improved htmlToTextV2 extractor
 * and report v1 vs v2 differences. Does NOT modify existing source_map.json
 * or claim files — strictly a diagnostic to inform future P102 runs.
 *
 * For each accepted source in each run:
 *   - reads rawHtmlPath
 *   - applies htmlToTextV2
 *   - writes to T7 artifacts/<run>/cleaned_text_v2/<file>.txt
 *   - measures: byte count, keyword counts (observership, visiting student,
 *     residency, careers, volunteer)
 *
 * Outputs a per-run diagnostic JSON at
 * docs/.../p102/runs/<run>/diagnostic_cleaned_text_v2.json
 *
 * Usage:
 *   npx tsx scripts/p102-recleantext.ts --run-id p102-1-trial-2-run-1
 *   npx tsx scripts/p102-recleantext.ts --all-existing-p102-runs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { htmlToTextV2, reclassifySourceFamilyByContent, SCHEMA_VERSION,
  USCE_OBSERVERSHIP_PATTERNS, USCE_VSM_PATTERNS, GME_PATTERNS, JOBS_VISA_PATTERNS,
} from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');

interface SourceRecord {
  sourceUrl: string;
  sourceFamily: string;
  acceptedForExtraction: boolean;
  rawHtmlPath: string | null;
  cleanedTextPath: string | null;
}

interface PerSourceDiff {
  sourceUrl: string;
  urlBasedFamily: string;
  reclassifiedFamily: string;
  reclassifyReason: string | null;
  v1Bytes: number;
  v2Bytes: number;
  v1ObservershipHits: number;
  v2ObservershipHits: number;
  v1VsmHits: number;
  v2VsmHits: number;
  v1GmeHits: number;
  v2GmeHits: number;
  v1JobsHits: number;
  v2JobsHits: number;
  v2Path: string;
}

function countPatternMatches(text: string, patterns: RegExp[]): number {
  let n = 0;
  for (const p of patterns) {
    const m = text.match(new RegExp(p.source, p.flags.includes('g') ? p.flags : p.flags + 'g'));
    n += m ? m.length : 0;
  }
  return n;
}

function processRun(runFolder: string): { runId: string; diffs: PerSourceDiff[] } {
  const runId = path.basename(runFolder);
  console.log(`[recleantext] processing ${runId}`);
  const smPath = path.join(runFolder, '01_source_map.json');
  if (!fs.existsSync(smPath)) { console.error(`  no source_map.json`); return { runId, diffs: [] }; }
  const sm = JSON.parse(fs.readFileSync(smPath, 'utf8')) as { sources: SourceRecord[] };

  const diffs: PerSourceDiff[] = [];
  for (const src of sm.sources) {
    if (!src.acceptedForExtraction) continue;
    if (!src.rawHtmlPath || !fs.existsSync(src.rawHtmlPath)) continue;
    const rawHtml = fs.readFileSync(src.rawHtmlPath, 'utf8');
    const v2Text = htmlToTextV2(rawHtml);
    const v1Text = src.cleanedTextPath && fs.existsSync(src.cleanedTextPath) ? fs.readFileSync(src.cleanedTextPath, 'utf8') : '';

    // Write v2 to sidecar path: same artifacts dir, cleaned_text_v2/
    const v1Dir = path.dirname(src.cleanedTextPath ?? '');
    const v1Base = path.basename(src.cleanedTextPath ?? 'unknown.txt');
    const v2Dir = v1Dir.replace(/\/cleaned_text$/, '/cleaned_text_v2');
    if (!fs.existsSync(v2Dir)) fs.mkdirSync(v2Dir, { recursive: true });
    const v2Path = path.join(v2Dir, v1Base);
    fs.writeFileSync(v2Path, v2Text);

    const reclassified = reclassifySourceFamilyByContent(src.sourceFamily, v2Text);

    diffs.push({
      sourceUrl: src.sourceUrl,
      urlBasedFamily: src.sourceFamily,
      reclassifiedFamily: reclassified.family,
      reclassifyReason: reclassified.reason,
      v1Bytes: v1Text.length,
      v2Bytes: v2Text.length,
      v1ObservershipHits: countPatternMatches(v1Text, USCE_OBSERVERSHIP_PATTERNS),
      v2ObservershipHits: countPatternMatches(v2Text, USCE_OBSERVERSHIP_PATTERNS),
      v1VsmHits: countPatternMatches(v1Text, USCE_VSM_PATTERNS),
      v2VsmHits: countPatternMatches(v2Text, USCE_VSM_PATTERNS),
      v1GmeHits: countPatternMatches(v1Text, GME_PATTERNS),
      v2GmeHits: countPatternMatches(v2Text, GME_PATTERNS),
      v1JobsHits: countPatternMatches(v1Text, JOBS_VISA_PATTERNS),
      v2JobsHits: countPatternMatches(v2Text, JOBS_VISA_PATTERNS),
      v2Path,
    });
  }

  // Write diagnostic JSON to repo run folder
  fs.writeFileSync(path.join(runFolder, 'diagnostic_cleaned_text_v2.json'), JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    runId,
    generatedAt: new Date().toISOString(),
    generatedBy: 'p102-recleantext (diagnostic; htmlToTextV2 applied to existing raw_html, no network)',
    sourcesProcessed: diffs.length,
    diffs,
    summary: {
      totalV1Bytes: diffs.reduce((s, d) => s + d.v1Bytes, 0),
      totalV2Bytes: diffs.reduce((s, d) => s + d.v2Bytes, 0),
      v2BytesAsPercentOfV1: diffs.length > 0 ? Math.round(100 * diffs.reduce((s, d) => s + d.v2Bytes, 0) / Math.max(1, diffs.reduce((s, d) => s + d.v1Bytes, 0))) : 0,
      v1ObservershipTotal: diffs.reduce((s, d) => s + d.v1ObservershipHits, 0),
      v2ObservershipTotal: diffs.reduce((s, d) => s + d.v2ObservershipHits, 0),
      v1VsmTotal: diffs.reduce((s, d) => s + d.v1VsmHits, 0),
      v2VsmTotal: diffs.reduce((s, d) => s + d.v2VsmHits, 0),
      v1GmeTotal: diffs.reduce((s, d) => s + d.v1GmeHits, 0),
      v2GmeTotal: diffs.reduce((s, d) => s + d.v2GmeHits, 0),
      reclassificationsCount: diffs.filter(d => d.urlBasedFamily !== d.reclassifiedFamily).length,
      reclassificationsList: diffs.filter(d => d.urlBasedFamily !== d.reclassifiedFamily).map(d => `${d.sourceUrl}: ${d.urlBasedFamily} → ${d.reclassifiedFamily} (${d.reclassifyReason})`),
    },
  }, null, 2) + '\n');

  return { runId, diffs };
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
  console.log(`[recleantext] processing ${args.runIds.length} runs`);
  const results = args.runIds.map(runId => processRun(path.join(RUNS_ROOT, runId)));

  console.log('\n[recleantext] summary:');
  for (const r of results) {
    const totalV1 = r.diffs.reduce((s, d) => s + d.v1Bytes, 0);
    const totalV2 = r.diffs.reduce((s, d) => s + d.v2Bytes, 0);
    const reclass = r.diffs.filter(d => d.urlBasedFamily !== d.reclassifiedFamily).length;
    const obsDelta = r.diffs.reduce((s, d) => s + d.v2ObservershipHits, 0) - r.diffs.reduce((s, d) => s + d.v1ObservershipHits, 0);
    const vsmDelta = r.diffs.reduce((s, d) => s + d.v2VsmHits, 0) - r.diffs.reduce((s, d) => s + d.v1VsmHits, 0);
    console.log(`  ${r.runId}: ${r.diffs.length} sources, ${totalV1} → ${totalV2} bytes (${totalV1 > 0 ? Math.round(100 * totalV2 / totalV1) : 0}%), ${reclass} reclassifications, observership Δ=${obsDelta >= 0 ? '+' : ''}${obsDelta}, vsm Δ=${vsmDelta >= 0 ? '+' : ''}${vsmDelta}`);
  }
}

main();
