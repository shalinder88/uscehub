#!/usr/bin/env tsx
/**
 * P102 A5 continue-if-stuck — detects runs that didn't complete A1 and
 * provides a controlled restart decision.
 *
 * Runs through each run folder and evaluates:
 *   - Are all required A1 output files present and parse-able?
 *   - Is A3_gate.json present and parse-able?
 *   - Is the run in a recoverable state vs unrecoverable?
 *
 * Outputs `A5_continue_decision.json` per run.
 *
 * NETWORK POLICY: A5 does not perform any network or extraction work.
 * It only decides whether the run can proceed and what to do next.
 *
 * Usage:
 *   npx tsx scripts/p102-a5-continue-if-stuck.ts --run-id p102-0r-dry-run-1
 *   npx tsx scripts/p102-a5-continue-if-stuck.ts --all-existing-p102-runs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { SCHEMA_VERSION } from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');

const REQUIRED_A0_FILES = [
  '00_bootstrap.json',
  '00_domain_map.json',
  '00_source_seed_map.json',
  '00_artifact_manifest.csv',
  '00_robots_sitemap_probe.json',
  '00_jsonld_extract.json',
  '00_fixed_path_probe.json',
];

const REQUIRED_A1_FILES = [
  '01_source_map.md',
  '01_source_map.json',
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
  '14_run_summary.json',
];

const REQUIRED_A1_5_FILES = ['A1_5_source_completeness_audit.json'];

const REQUIRED_A2_FILES = [
  'RT_depth_usce.json',
  'RT_depth_gme_residency_fellowship.json',
  'RT_depth_jobs_visa.json',
  'RT_depth_physician_services.json',
  'RT_depth_negative_evidence.json',
  'RT_depth_source_scope_conflicts.json',
];

const REQUIRED_A2_5_FILES = ['RT_semantic_miss_detector.json'];

const REQUIRED_A3_FILES = ['15_publish_gate.md', 'A3_gate.json'];

const REQUIRED_P102_0C_FILES = ['13_source_claims.json'];

type StageStatus = 'COMPLETE' | 'INCOMPLETE' | 'CORRUPT';

interface StageCheck {
  stage: 'A0' | 'A1' | 'A1.5' | 'A2' | 'A2.5' | 'A3' | 'P102-0C';
  status: StageStatus;
  missingFiles: string[];
  corruptFiles: string[];
}

interface A5Decision {
  schemaVersion: string;
  runId: string;
  generatedAt: string;
  stages: StageCheck[];
  overallStatus: 'RUN_COMPLETE' | 'RUN_STUCK_AT' | 'RUN_CORRUPT' | 'RUN_NEEDS_RESTART';
  stuckAtStage: string | null;
  recommendedAction:
    | 'NONE_RUN_IS_COMPLETE'
    | 'RE_RUN_A0_PROBE'
    | 'RE_RUN_A1_FROM_A0_ARTIFACTS'
    | 'RE_RUN_A2_FROM_A1'
    | 'RE_RUN_A3_REGATE'
    | 'INVESTIGATE_CORRUPT_FILES'
    | 'RE_RUN_P102_0C_EXTRACTOR';
  rationale: string;
  blockedBy: 'NETWORK_ON_HOLD' | 'NONE';
}

function checkStage(runFolder: string, stage: StageCheck['stage'], requiredFiles: string[]): StageCheck {
  const check: StageCheck = { stage, status: 'COMPLETE', missingFiles: [], corruptFiles: [] };
  for (const f of requiredFiles) {
    const p = path.join(runFolder, f);
    if (!fs.existsSync(p)) { check.missingFiles.push(f); continue; }
    if (f.endsWith('.json')) {
      try { JSON.parse(fs.readFileSync(p, 'utf8')); }
      catch { check.corruptFiles.push(f); }
    }
  }
  if (check.corruptFiles.length > 0) check.status = 'CORRUPT';
  else if (check.missingFiles.length > 0) check.status = 'INCOMPLETE';
  return check;
}

function evaluateRun(runFolder: string): A5Decision {
  const runId = path.basename(runFolder);
  const stages: StageCheck[] = [
    checkStage(runFolder, 'A0', REQUIRED_A0_FILES),
    checkStage(runFolder, 'A1', REQUIRED_A1_FILES),
    checkStage(runFolder, 'A1.5', REQUIRED_A1_5_FILES),
    checkStage(runFolder, 'A2', REQUIRED_A2_FILES),
    checkStage(runFolder, 'A2.5', REQUIRED_A2_5_FILES),
    checkStage(runFolder, 'A3', REQUIRED_A3_FILES),
    checkStage(runFolder, 'P102-0C', REQUIRED_P102_0C_FILES),
  ];

  // First corrupt stage is the most serious problem
  const firstCorrupt = stages.find(s => s.status === 'CORRUPT');
  if (firstCorrupt) {
    return {
      schemaVersion: SCHEMA_VERSION, runId, generatedAt: new Date().toISOString(), stages,
      overallStatus: 'RUN_CORRUPT', stuckAtStage: firstCorrupt.stage,
      recommendedAction: 'INVESTIGATE_CORRUPT_FILES',
      rationale: `Corrupt JSON in ${firstCorrupt.stage}: ${firstCorrupt.corruptFiles.join(', ')}`,
      blockedBy: 'NONE',
    };
  }

  // First incomplete stage
  const firstIncomplete = stages.find(s => s.status === 'INCOMPLETE');
  if (!firstIncomplete) {
    return {
      schemaVersion: SCHEMA_VERSION, runId, generatedAt: new Date().toISOString(), stages,
      overallStatus: 'RUN_COMPLETE', stuckAtStage: null,
      recommendedAction: 'NONE_RUN_IS_COMPLETE',
      rationale: 'All stage files present and parse-able.',
      blockedBy: 'NONE',
    };
  }

  // Map incomplete-stage to recommended action
  const recommendedAction: A5Decision['recommendedAction'] = (() => {
    switch (firstIncomplete.stage) {
      case 'A0': return 'RE_RUN_A0_PROBE';
      case 'A1':
      case 'A1.5': return 'RE_RUN_A1_FROM_A0_ARTIFACTS';
      case 'A2':
      case 'A2.5': return 'RE_RUN_A2_FROM_A1';
      case 'A3': return 'RE_RUN_A3_REGATE';
      case 'P102-0C': return 'RE_RUN_P102_0C_EXTRACTOR';
    }
  })();

  // A0/A1/A1.5 + A2/A2.5 + REFETCH need network; A3 regate + P102-0C extractor are network-free.
  const networkBound = firstIncomplete.stage === 'A0' || firstIncomplete.stage === 'A1' || firstIncomplete.stage === 'A1.5' || firstIncomplete.stage === 'A2' || firstIncomplete.stage === 'A2.5';

  return {
    schemaVersion: SCHEMA_VERSION, runId, generatedAt: new Date().toISOString(), stages,
    overallStatus: 'RUN_STUCK_AT', stuckAtStage: firstIncomplete.stage,
    recommendedAction,
    rationale: `Stage ${firstIncomplete.stage} incomplete: missing ${firstIncomplete.missingFiles.join(', ')}`,
    blockedBy: networkBound ? 'NETWORK_ON_HOLD' : 'NONE',
  };
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
  console.log(`[a5] evaluating ${args.runIds.length} runs`);
  for (const runId of args.runIds) {
    const runFolder = path.join(RUNS_ROOT, runId);
    if (!fs.existsSync(runFolder)) { console.error(`[a5] missing: ${runFolder}`); continue; }
    const decision = evaluateRun(runFolder);
    fs.writeFileSync(path.join(runFolder, 'A5_continue_decision.json'), JSON.stringify(decision, null, 2) + '\n');
    console.log(`  ${decision.runId}: ${decision.overallStatus}${decision.stuckAtStage ? ` (stuck at ${decision.stuckAtStage})` : ''} → ${decision.recommendedAction} [blockedBy=${decision.blockedBy}]`);
  }
}

main();
