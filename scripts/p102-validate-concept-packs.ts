#!/usr/bin/env tsx
/**
 * P102 concept-pack validator — ensures the JSON concept-pack lexicon
 * stays in sync with the hand-mirrored regex constants in
 * p102-extraction-lib.ts.
 *
 * For each pack in p102_concept_packs.json:
 *   - The pack's `lane` should map to a known patterns export in the lib.
 *   - Every regex string in the pack should compile without error.
 *   - Every regex string should also appear (as a regex literal) in the
 *     corresponding lib constant.
 *
 * Run this whenever you edit either the JSON or the lib constants.
 *
 * No network. No Agent.
 *
 * Usage:
 *   npx tsx scripts/p102-validate-concept-packs.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  USCE_OBSERVERSHIP_PATTERNS, USCE_VSM_PATTERNS, USCE_RESEARCH_PATTERNS,
  USCE_SHADOW_VOLUNTEER_PATTERNS, NEGATIVE_STRONG_PATTERNS, NEGATIVE_MEDIUM_PATTERNS,
  GME_PATTERNS, JOBS_VISA_PATTERNS, SERVICES_PATTERNS,
} from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const PACKS_PATH = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/specs/p102_concept_packs.json');

const LIB_PATTERNS: Record<string, RegExp[]> = {
  IMG_OBSERVERSHIP: USCE_OBSERVERSHIP_PATTERNS,
  VISITING_MEDICAL_STUDENT: USCE_VSM_PATTERNS,
  RESEARCH_OPPORTUNITY: USCE_RESEARCH_PATTERNS,
  SHADOW_VOLUNTEER: USCE_SHADOW_VOLUNTEER_PATTERNS,
  NEGATIVE_STRONG: NEGATIVE_STRONG_PATTERNS,
  NEGATIVE_MEDIUM: NEGATIVE_MEDIUM_PATTERNS,
  GME_FUTURE: GME_PATTERNS,
  JOBS_VISA_FUTURE: JOBS_VISA_PATTERNS,
  SERVICES_FUTURE: SERVICES_PATTERNS,
};

interface ConceptPack {
  lane: string;
  description: string;
  patterns: string[];
}

interface ConceptPackFile {
  schemaVersion: string;
  packs: ConceptPack[];
}

const findings: string[] = [];
const warnings: string[] = [];

function fail(msg: string): void { findings.push(msg); }
function warn(msg: string): void { warnings.push(msg); }

function main(): void {
  console.log('='.repeat(60));
  console.log('P102 Concept-Pack Validator');
  console.log('='.repeat(60));

  if (!fs.existsSync(PACKS_PATH)) { fail(`Missing: ${PACKS_PATH}`); return finalize(); }
  const data = JSON.parse(fs.readFileSync(PACKS_PATH, 'utf8')) as ConceptPackFile;

  for (const pack of data.packs) {
    // 1) Lane must map to a lib constant
    const libPatterns = LIB_PATTERNS[pack.lane];
    if (!libPatterns) {
      warn(`pack ${pack.lane} has no corresponding lib patterns constant; this is OK if the lane is JSON-only`);
      continue;
    }

    // 2) Every JSON pattern compiles
    for (const p of pack.patterns) {
      try {
        new RegExp(p, 'i');
      } catch (e) {
        fail(`pack ${pack.lane} pattern "${p}" failed to compile: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // 3) Every JSON pattern should match (as source) one of the lib regex sources.
    //    Lib regex `source` is the pattern without the slashes / flags.
    const libSources = new Set(libPatterns.map(r => r.source));
    for (const p of pack.patterns) {
      if (!libSources.has(p)) warn(`pack ${pack.lane}: JSON pattern "${p}" not present as a lib regex source`);
    }

    // 4) Every lib pattern should appear in the JSON
    const jsonSet = new Set(pack.patterns);
    for (const libRe of libPatterns) {
      if (!jsonSet.has(libRe.source)) warn(`pack ${pack.lane}: lib pattern "${libRe.source}" not present in JSON`);
    }
  }

  finalize();

  function finalize(): void {
    console.log('-'.repeat(60));
    if (findings.length === 0) {
      console.log(`Overall: PASSED (warnings: ${warnings.length})`);
      if (warnings.length > 0) for (const w of warnings) console.log(`  WARN: ${w}`);
      process.exit(0);
    } else {
      console.log(`Overall: FAILED (findings: ${findings.length}, warnings: ${warnings.length})`);
      for (const f of findings) console.log(`  FAIL: ${f}`);
      for (const w of warnings) console.log(`  WARN: ${w}`);
      process.exit(1);
    }
  }
}

main();
