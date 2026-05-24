#!/usr/bin/env tsx
/**
 * P102 Live Listings Crosswalk Builder.
 *
 * Reads:
 *   - exact_seed_run_report.json  (per-seed run results, from the exact-link runner)
 *   - exact_seed_public_safe_rows.json / hold / rejected
 *   - the live program list at /Users/shelly/usmle-observerships/data.js
 *   - prisma/verified-links.ts (the operator's URL overrides)
 *
 * Emits:
 *   - exports/live_listings_crosswalk.json — per-live-listing decision
 *   - exports/live_listings_crosswalk_summary.md — human-readable summary
 *
 * Decisions (one per live listing, applied based on runner result):
 *   MATCH_UPDATE_WITH_SOURCE_QUOTE — runner produced AUTO_PROMOTE
 *   LIVE_ROW_NEEDS_REVERIFY        — FAILED_FETCH or GENERIC_PAGE_HOLD
 *   LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK — INVALID_NOT_USCE_SOURCE
 *   FUTURE_LANE_ONLY               — REJECT_GME_ONLY / REJECT_PHARMACY / REJECT_RESEARCH
 *   NEW_SOURCE_LINKED_ROW          — exact-seed row with no matching live listing
 *   DUPLICATE_HIDE_PREVIEW_ROW     — exact-seed sourceUrl matches a live websiteUrl
 *
 * No DB mutation. Pure read + JSON write.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports');
const REPORT_PATH = path.join(EXPORTS, 'exact_seed_run_report.json');
const PUBLIC_PATH = path.join(EXPORTS, 'exact_seed_public_safe_rows.json');
const HOLD_PATH = path.join(EXPORTS, 'exact_seed_hold_rows.json');
const REJ_PATH = path.join(EXPORTS, 'exact_seed_rejected_rows.json');
const DATA_JS = '/Users/shelly/usmle-observerships/data.js';
const VLINKS_TS = path.join(REPO_ROOT, 'prisma/verified-links.ts');

const OUT_JSON = path.join(EXPORTS, 'live_listings_crosswalk.json');
const OUT_MD = path.join(EXPORTS, 'live_listings_crosswalk_summary.md');

type Decision =
  | 'MATCH_UPDATE_WITH_SOURCE_QUOTE'
  | 'LIVE_ROW_NEEDS_REVERIFY'
  | 'LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK'
  | 'FUTURE_LANE_ONLY'
  | 'NEW_SOURCE_LINKED_ROW'
  | 'DUPLICATE_HIDE_PREVIEW_ROW';

interface CrosswalkRow {
  liveProgramName: string;
  liveType: string;
  liveState: string;
  liveSourceUrl: string;
  verifiedOverride: boolean;
  seedId: string;
  runStatus: string;
  finalStatus: string;
  fetchHttpStatus?: number;
  fetchError?: string;
  triageDecision?: string;
  directLinkStatus?: string;
  audienceClass?: string;
  quoteScore?: number;
  topQuote?: string;
  decision: Decision;
  decisionReason: string;
}

function parsePrograms(): Array<{ name: string; state: string; type: string; link: string; description: string; specialties: string }> {
  const t = readFileSync(DATA_JS, 'utf8');
  const m = t.match(/const PROGRAMS = \[([\s\S]*?)\];/);
  if (!m) throw new Error('Could not parse PROGRAMS from data.js');
  // eslint-disable-next-line no-eval
  return eval('[' + m[1] + ']');
}

function parseVerifiedLinks(): Map<string, { url: string; verified: boolean }> {
  const t = readFileSync(VLINKS_TS, 'utf8');
  const map = new Map<string, { url: string; verified: boolean }>();
  const re = /"([^"\\]+)":\s*\{\s*url:\s*"([^"]+)"(?:,\s*verified:\s*(true|false))?/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    map.set(m[1], { url: m[2], verified: m[3] === 'true' });
  }
  return map;
}

function main(): void {
  for (const p of [REPORT_PATH, PUBLIC_PATH, HOLD_PATH, REJ_PATH, DATA_JS, VLINKS_TS]) {
    if (!existsSync(p)) throw new Error(`Missing: ${p}`);
  }

  const report = JSON.parse(readFileSync(REPORT_PATH, 'utf8'));
  const publicRows = JSON.parse(readFileSync(PUBLIC_PATH, 'utf8')).rows ?? [];
  const holdRows = JSON.parse(readFileSync(HOLD_PATH, 'utf8')).rows ?? [];
  const rejRows = JSON.parse(readFileSync(REJ_PATH, 'utf8')).rows ?? [];
  const allEmittedRows = [...publicRows, ...holdRows, ...rejRows];
  const programs = parsePrograms();
  const verified = parseVerifiedLinks();

  // Index emitted rows by seedId
  const rowsBySeedId = new Map<string, typeof allEmittedRows[number]>();
  for (const r of allEmittedRows) {
    if (r.seedId && !rowsBySeedId.has(r.seedId)) rowsBySeedId.set(r.seedId, r);
  }

  // Build crosswalk for live_* seeds (the 206 from data.js)
  const liveSeedResults = (report.seedResults ?? []).filter((s: { seedId: string }) => s.seedId.startsWith('live_'));

  const crosswalk: CrosswalkRow[] = [];
  for (const sr of liveSeedResults) {
    // Find the matching program in data.js by institutionName (we encoded
    // institutionName from p.name when building the seed CSV)
    const program = programs.find(p => p.name === sr.institutionName);
    if (!program) continue;
    const vOverride = verified.get(program.name);
    const emittedRow = rowsBySeedId.get(sr.seedId);

    const decision: Decision = (() => {
      if (sr.runStatus === 'FAILED_FETCH') return 'LIVE_ROW_NEEDS_REVERIFY';
      if (sr.finalStatus === 'AUTO_PROMOTE') return 'MATCH_UPDATE_WITH_SOURCE_QUOTE';
      if (sr.finalStatus === 'HOLD_REVIEW') return 'LIVE_ROW_NEEDS_REVERIFY';
      if (sr.finalStatus === 'REJECTED') {
        const td = emittedRow?.triageDecision ?? '';
        const dl = emittedRow?.directLinkStatus ?? '';
        // FUTURE_LANE means the page IS about something real but not Tier-1
        // USCE (GME / research / pharmacy / careers). PATIENT_FACING means
        // the URL is just a hospital homepage — different problem.
        if (/REJECT_(PHARMACY|RESEARCH|GME|CAREERS)/.test(td)) return 'FUTURE_LANE_ONLY';
        if (td === 'REJECT_PATIENT_FACING') return 'LIVE_ROW_NEEDS_REVERIFY';
        if (dl === 'INVALID_NOT_USCE_SOURCE') return 'LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK';
        return 'LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK';
      }
      return 'LIVE_ROW_NEEDS_REVERIFY';
    })();

    const reason: string = (() => {
      if (sr.runStatus === 'FAILED_FETCH') return `fetch failed: ${sr.fetchError ?? sr.fetchHttpStatus ?? 'unknown'} — URL likely 404/403/dead`;
      if (sr.finalStatus === 'AUTO_PROMOTE') return `runner returned VALID direct link + strong quote → enrich live row`;
      if (sr.finalStatus === 'HOLD_REVIEW') return `runner triaged HOLD (${emittedRow?.triageDecision ?? '?'}) — needs reviewer attention before public`;
      if (decision === 'FUTURE_LANE_ONLY') return `runner triaged ${emittedRow?.triageDecision} — not Tier-1 USCE`;
      if (decision === 'LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK') return `direct-link validation INVALID — live row points at non-opportunity page`;
      if (emittedRow?.triageDecision === 'REJECT_PATIENT_FACING') return `live URL is a hospital homepage — operator should supply a deeper page URL`;
      return 'no specific signal';
    })();

    crosswalk.push({
      liveProgramName: program.name,
      liveType: program.type,
      liveState: program.state || '',
      liveSourceUrl: vOverride?.url ?? program.link,
      verifiedOverride: !!vOverride?.verified,
      seedId: sr.seedId,
      runStatus: sr.runStatus,
      finalStatus: sr.finalStatus,
      fetchHttpStatus: sr.fetchHttpStatus,
      fetchError: sr.fetchError,
      triageDecision: emittedRow?.triageDecision,
      directLinkStatus: emittedRow?.directLinkStatus,
      audienceClass: emittedRow?.audienceClass,
      quoteScore: emittedRow?.quoteScore,
      topQuote: emittedRow?.topQuote ? String(emittedRow.topQuote).slice(0, 200) : undefined,
      decision,
      decisionReason: reason,
    });
  }

  // NEW_SOURCE_LINKED_ROW: exact-seed rows (Batch 1/2, non-live_) that aren't in any live listing
  const liveUrls = new Set(programs.map(p => verified.get(p.name)?.url ?? p.link).filter(Boolean));
  const newRows: CrosswalkRow[] = [];
  for (const r of publicRows) {
    if (!r.seedId?.startsWith('seed_')) continue;
    if (!liveUrls.has(r.sourceUrl)) {
      newRows.push({
        liveProgramName: '(no live match)',
        liveType: '',
        liveState: r.state,
        liveSourceUrl: r.sourceUrl,
        verifiedOverride: false,
        seedId: r.seedId,
        runStatus: 'EXTRACTED',
        finalStatus: r.route,
        triageDecision: r.triageDecision,
        directLinkStatus: r.directLinkStatus,
        audienceClass: r.audienceClass,
        quoteScore: r.quoteScore,
        topQuote: String(r.topQuote || '').slice(0, 200),
        decision: 'NEW_SOURCE_LINKED_ROW',
        decisionReason: `exact-seed row with no live ${r.sourceUrl.startsWith('http') ? 'URL' : 'listing'} match in data.js`,
      });
    }
  }

  // Tally
  const tally: Record<Decision, number> = {
    MATCH_UPDATE_WITH_SOURCE_QUOTE: 0,
    LIVE_ROW_NEEDS_REVERIFY: 0,
    LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK: 0,
    FUTURE_LANE_ONLY: 0,
    NEW_SOURCE_LINKED_ROW: 0,
    DUPLICATE_HIDE_PREVIEW_ROW: 0,
  };
  const all = [...crosswalk, ...newRows];
  for (const r of all) tally[r.decision]++;

  // Write JSON
  writeFileSync(
    OUT_JSON,
    JSON.stringify({ generatedAt: new Date().toISOString(), totalLiveListings: crosswalk.length, totalNewRows: newRows.length, decisionTally: tally, rows: all }, null, 2) + '\n',
  );

  // Write markdown summary
  const md: string[] = [
    '# P102 Live Listings Crosswalk — Decision Summary',
    '',
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    `Live listings analyzed: ${crosswalk.length}`,
    `New source-linked rows (no live match): ${newRows.length}`,
    '',
    '## Decision tally',
    '',
    '| Decision | Count |',
    '|---|---:|',
    ...Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`),
    '',
    '## Sample rows by decision',
    '',
  ];
  for (const d of Object.keys(tally) as Decision[]) {
    const sample = all.filter(r => r.decision === d).slice(0, 5);
    if (sample.length === 0) continue;
    md.push(`### ${d}`);
    md.push('');
    md.push('| Program | State | URL | Reason |');
    md.push('|---|---|---|---|');
    for (const r of sample) {
      md.push(`| ${r.liveProgramName} | ${r.liveState} | ${r.liveSourceUrl.slice(0, 60)}${r.liveSourceUrl.length > 60 ? '…' : ''} | ${r.decisionReason.slice(0, 80)} |`);
    }
    md.push('');
  }

  writeFileSync(OUT_MD, md.join('\n') + '\n');

  console.log('P102 live-listings crosswalk');
  console.log(`  live listings analyzed: ${crosswalk.length}`);
  console.log(`  new exact-seed rows: ${newRows.length}`);
  console.log('  decision tally:');
  for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(`    ${k.padEnd(35)} ${v}`);
  console.log('');
  console.log(`  written: ${OUT_JSON}`);
  console.log(`           ${OUT_MD}`);
}

main();
