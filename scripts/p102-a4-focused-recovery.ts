#!/usr/bin/env tsx
/**
 * P102 A4 focused recovery — enumerates structured recovery tasks for
 * a run based on what A3 named in `requiredA4Tasks` and what the
 * source map / claims indicate is missing.
 *
 * Per doctrine: A4 does ONLY what A3 named, plus any deterministic
 * structural recovery the validator can identify. No broad re-crawl.
 *
 * NETWORK POLICY (P102-0G, while extraction is on hold):
 *   The script does NOT perform network-bound recovery tasks. It enumerates
 *   them, marks them PENDING_OPERATOR, and writes A4_focused_recovery_tasks.json.
 *   When extraction resumes, an operator-triggered follow-up sprint will
 *   execute the tasks (using --execute, which is a no-op in this script).
 *
 * Usage:
 *   npx tsx scripts/p102-a4-focused-recovery.ts --run-id p102-0r-dry-run-1
 *   npx tsx scripts/p102-a4-focused-recovery.ts --all-existing-p102-runs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { SCHEMA_VERSION } from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');

interface A3Gate {
  verdict: string;
  publicSafe: boolean;
  requiredA4Tasks: string[];
  missingCriticalFields: string[];
  hallucinationRisks: string[];
  unsupportedClaims: string[];
  quoteVerificationFailures: string[];
  sourceScopeConflicts: string[];
}

interface SourceRecord {
  sourceUrl: string;
  sourceFamily: string;
  sourceScope: string;
  acceptedForExtraction: boolean;
  sourceStatus: string;
  rejectedReason: string | null;
  cleanedTextPath: string | null;
}

interface A4Task {
  taskId: string;
  taskType:
    | 'REFETCH_FAILED_SOURCE'
    | 'EXPAND_FIXED_PATHS'
    | 'INVESTIGATE_REDIRECT'
    | 'ADD_CAMPUS_APPLICABILITY_PROOF'
    | 'HUMAN_REVIEW_VOLUNTEER_PAGE'
    | 'RECLASSIFY_SOURCE_FAMILY'
    | 'RECOVER_EMPTY_SITEMAP'
    | 'INCREASE_PROBE_DEPTH';
  sourceUrl: string | null;
  proposedAction: string;
  blockedBy: 'NETWORK_ON_HOLD' | 'NEEDS_OPERATOR_REVIEW' | 'NEEDS_P102_0D_MODEL_READER' | null;
  status: 'PENDING_OPERATOR' | 'PENDING_EXECUTION' | 'NOT_ACTIONABLE';
  rationale: string;
}

function generateA4Tasks(runFolder: string): A4Task[] {
  const tasks: A4Task[] = [];
  let i = 1;
  const mk = (over: Omit<A4Task, 'taskId'>): A4Task => ({ taskId: `a4_${path.basename(runFolder)}_${i++}`, ...over });

  // Read A3 gate
  const a3Path = path.join(runFolder, 'A3_gate.json');
  let a3: A3Gate | null = null;
  if (fs.existsSync(a3Path)) {
    try { a3 = JSON.parse(fs.readFileSync(a3Path, 'utf8')) as A3Gate; } catch { /* ignore */ }
  }

  // Read source map
  const smPath = path.join(runFolder, '01_source_map.json');
  let sm: { sources: SourceRecord[] } | null = null;
  if (fs.existsSync(smPath)) {
    try { sm = JSON.parse(fs.readFileSync(smPath, 'utf8')) as { sources: SourceRecord[] }; } catch { /* ignore */ }
  }

  // Read robots/sitemap probe
  type RobotsProbe = { sitemap?: { fetched: boolean; urlsFound: number } };
  const robotsPath = path.join(runFolder, '00_robots_sitemap_probe.json');
  let robots: RobotsProbe | null = null;
  if (fs.existsSync(robotsPath)) {
    try { robots = JSON.parse(fs.readFileSync(robotsPath, 'utf8')) as RobotsProbe; } catch { /* ignore */ }
  }

  // Task generation strategy

  // 1) From A3 requiredA4Tasks: each becomes a structured task.
  if (a3?.requiredA4Tasks) {
    for (const taskDescription of a3.requiredA4Tasks) {
      const isSearchCompletenessZero = /searchCompletenessScore=0/.test(taskDescription);
      const isSitemap = /sitemap/i.test(taskDescription);
      const isRobots = /robots/i.test(taskDescription);
      if (isSearchCompletenessZero) {
        tasks.push(mk({
          taskType: 'INCREASE_PROBE_DEPTH',
          sourceUrl: null,
          proposedAction: 'Investigate why A0 fixed-path probes returned 0 accepted sources. Verify official_domain is correct, reachable, and not aggressively bot-blocked. Consider adding institution-specific candidate paths.',
          blockedBy: 'NETWORK_ON_HOLD',
          status: 'PENDING_OPERATOR',
          rationale: `A3 reported: ${taskDescription}`,
        }));
      } else if (isSitemap) {
        tasks.push(mk({
          taskType: 'RECOVER_EMPTY_SITEMAP',
          sourceUrl: null,
          proposedAction: 'Sitemap was unreachable or empty. Try alternate sitemap paths (/sitemap_index.xml, /robots.txt advertised sitemaps, /sitemap-pages.xml). If empty, rely on expanded fixed-path probes.',
          blockedBy: 'NETWORK_ON_HOLD',
          status: 'PENDING_OPERATOR',
          rationale: `A3 reported: ${taskDescription}`,
        }));
      } else if (isRobots) {
        tasks.push(mk({
          taskType: 'REFETCH_FAILED_SOURCE',
          sourceUrl: null,
          proposedAction: 'robots.txt was not reachable. Verify domain DNS, retry with longer timeout, check for IP-level blocks.',
          blockedBy: 'NETWORK_ON_HOLD',
          status: 'PENDING_OPERATOR',
          rationale: `A3 reported: ${taskDescription}`,
        }));
      }
    }
  }

  // 2) Failed-fetch sources: REFETCH_FAILED_SOURCE
  if (sm?.sources) {
    for (const s of sm.sources) {
      if (s.acceptedForExtraction) continue;
      const fatal = s.sourceStatus === 'FETCH_TIMEOUT' || s.sourceStatus === 'FETCH_403' || s.sourceStatus === 'FETCH_OTHER_ERROR' || s.sourceStatus === 'FETCH_REDIRECT_LIMIT';
      if (fatal) {
        tasks.push(mk({
          taskType: 'REFETCH_FAILED_SOURCE',
          sourceUrl: s.sourceUrl,
          proposedAction: `Retry fetch with longer timeout (30s) and/or rotated user-agent. If 403 persists, mark BOT_BLOCKED_MANUAL_RETRY.`,
          blockedBy: 'NETWORK_ON_HOLD',
          status: 'PENDING_OPERATOR',
          rationale: `Source status: ${s.sourceStatus} (${s.rejectedReason ?? 'no reason'})`,
        }));
      }
    }
  }

  // 3) Scope-conflict claims: ADD_CAMPUS_APPLICABILITY_PROOF
  if (a3?.sourceScopeConflicts) {
    for (const sc of a3.sourceScopeConflicts) {
      tasks.push(mk({
        taskType: 'ADD_CAMPUS_APPLICABILITY_PROOF',
        sourceUrl: null,
        proposedAction: 'Locate a campus-specific source (or campus-specific quote in the existing source) that establishes the claim applies to the specific institution, not the parent system.',
        blockedBy: 'NETWORK_ON_HOLD',
        status: 'PENDING_OPERATOR',
        rationale: `A3 surfaced: ${sc}`,
      }));
    }
  }

  // 4) Quote-verification failures: re-extract or model-reader
  if (a3?.quoteVerificationFailures) {
    for (const qf of a3.quoteVerificationFailures) {
      tasks.push(mk({
        taskType: 'RECLASSIFY_SOURCE_FAMILY',
        sourceUrl: null,
        proposedAction: 'Quote not found in cleaned text. Re-run extractor against cleaned_text_v2 (if available) or invoke P102-0D model reader to extract a verifiable quote.',
        blockedBy: 'NEEDS_P102_0D_MODEL_READER',
        status: 'PENDING_EXECUTION',
        rationale: `A3 surfaced: ${qf}`,
      }));
    }
  }

  // 5) Hallucination risks: needs operator review
  if (a3?.hallucinationRisks) {
    for (const hr of a3.hallucinationRisks) {
      tasks.push(mk({
        taskType: 'HUMAN_REVIEW_VOLUNTEER_PAGE',
        sourceUrl: null,
        proposedAction: 'Human review of the claim and source.',
        blockedBy: 'NEEDS_OPERATOR_REVIEW',
        status: 'PENDING_OPERATOR',
        rationale: `A3 flagged: ${hr}`,
      }));
    }
  }

  // 6) Empty sitemap detected: add expansion task
  if (robots?.sitemap?.fetched === true && robots.sitemap.urlsFound === 0) {
    tasks.push(mk({
      taskType: 'EXPAND_FIXED_PATHS',
      sourceUrl: null,
      proposedAction: 'Sitemap.xml was reachable but contained 0 URLs. Lean on fixed-path probes; consider adding institution-specific paths if known.',
      blockedBy: 'NETWORK_ON_HOLD',
      status: 'PENDING_OPERATOR',
      rationale: `Sitemap empty: 200 OK with 0 <loc> entries`,
    }));
  }

  // 7) If publicSafe=false but cautionSafe count > 0 in claims, suggest P102-0D
  // (We don't load claims here for simplicity — the validator already reports this.)

  return tasks;
}

function processRun(runFolder: string): { runId: string; tasks: A4Task[] } {
  const runId = path.basename(runFolder);
  const tasks = generateA4Tasks(runFolder);
  fs.writeFileSync(path.join(runFolder, 'A4_focused_recovery_tasks.json'), JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    runId,
    generatedAt: new Date().toISOString(),
    generatedBy: 'p102-a4-focused-recovery (network-free enumerator; tasks PENDING execution)',
    networkOnHold: true,
    tasks,
    summary: {
      total: tasks.length,
      byType: tasks.reduce((acc, t) => { acc[t.taskType] = (acc[t.taskType] ?? 0) + 1; return acc; }, {} as Record<string, number>),
      byBlocker: tasks.reduce((acc, t) => { const k = t.blockedBy ?? 'NONE'; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {} as Record<string, number>),
    },
  }, null, 2) + '\n');
  return { runId, tasks };
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
  console.log(`[a4] processing ${args.runIds.length} runs`);
  for (const runId of args.runIds) {
    const result = processRun(path.join(RUNS_ROOT, runId));
    const byType = result.tasks.reduce((acc, t) => { acc[t.taskType] = (acc[t.taskType] ?? 0) + 1; return acc; }, {} as Record<string, number>);
    console.log(`  ${result.runId}: ${result.tasks.length} tasks (${Object.entries(byType).map(([k, v]) => `${k}=${v}`).join(', ') || 'none'})`);
  }
}

main();
