#!/usr/bin/env tsx
/**
 * P102 Display-Eligibility Export Validator.
 *
 * Enforces the rules documented in
 * docs/platform-v2/local/usce-discovery-command-center/p102/P102_FINAL_LINK_TRUTH_RECONCILIATION.md
 *
 * Rules:
 *   1. Clinical export count matches the classifier's true USCE count.
 *   2. No hidden row appears in the clinical or research display export.
 *   3. No research row appears in the clinical display export.
 *   4. No negative-informational row appears in any active display export.
 *   5. No outreach hold appears in the active display export.
 *   6. No broken/manual-browser row appears in the active display export.
 *   7. Every clinical display row has a non-empty finalUrl.
 *   8. Every clinical display row has classification DIRECT / MOVED / PROTECTED.
 *   9. Every row's programName matches a data.js program.name exactly.
 *  10. No duplicate programName within a single bucket.
 *  11. No third-party broker hidden row appears in any active display export.
 *  12. Every JSON file parses.
 *
 * Exit code 0 = all checks PASS; exit code 1 = at least one FAIL.
 *
 * Designed to be runnable standalone (does not require the broader
 * p102-validate-all dispatcher to be green).
 */

import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { VERIFIED_LINKS } from '../prisma/verified-links';
import { HIDDEN_PROGRAMS, isHidden } from '../prisma/listings-hidelist';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS = path.join(
  REPO_ROOT,
  'docs/platform-v2/local/usce-discovery-command-center/p102/exports'
);
const CLASSIFIER_OUT = path.join(EXPORTS, 'live_listings_classification.json');
const DATA_JS = '/Users/shelly/usmle-observerships/data.js';

const FILES = {
  clinical: 'display_eligible_clinical_usce.json',
  research: 'display_eligible_research.json',
  outreach: 'display_hold_outreach.json',
  researchReverify: 'display_hold_research_reverify.json',
  manualBrowser: 'display_hold_manual_browser.json',
  hidden: 'display_hidden_or_removed.json',
  archiveNegative: 'display_archive_negative_info.json',
} as const;

const ACTIVE_BUCKETS = ['clinical', 'research'] as const;

type Classification =
  | 'DIRECT_TRUE_USCE_LINK'
  | 'MOVED_REORIENTED_TO_TRUE_USCE_LINK'
  | 'PROTECTED_BROWSER_REQUIRED'
  | 'BORDERLINE_KEEP_REVERIFY'
  | 'BROKEN_REQUIRES_MANUAL_BROWSER'
  | 'NO_PROGRAM_FOUND_HIDE'
  | 'NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE'
  | 'RESEARCH_DIRECT_PROGRAM'
  | 'RESEARCH_VALID_INSTITUTIONAL_PATHWAY'
  | 'RESEARCH_GENERIC_BUT_ACCEPTABLE'
  | 'RESEARCH_TOO_GENERIC_REVERIFY';

interface DisplayRow {
  programName: string;
  finalUrl: string;
  classification: Classification;
  badge: string;
  verifiedFlag: boolean;
  hideReason?: string;
  hideClassification?: string;
}

interface ClassifierRow {
  listingTitle: string;
  classification: Classification;
  countsAsTrueUSCE: boolean;
  countsAsResearch: boolean;
  isHidden: boolean;
}

const CLINICAL_OK_CLASSIFICATIONS: Set<Classification> = new Set([
  'DIRECT_TRUE_USCE_LINK',
  'MOVED_REORIENTED_TO_TRUE_USCE_LINK',
  'PROTECTED_BROWSER_REQUIRED',
]);

const RESEARCH_OK_CLASSIFICATIONS: Set<Classification> = new Set([
  'RESEARCH_VALID_INSTITUTIONAL_PATHWAY',
  'RESEARCH_DIRECT_PROGRAM',
  'RESEARCH_GENERIC_BUT_ACCEPTABLE',
]);

class CheckRunner {
  private failures: string[] = [];
  private passes = 0;

  pass(label: string): void {
    this.passes++;
    console.log(`  PASS  ${label}`);
  }
  fail(label: string, detail?: string): void {
    this.failures.push(label + (detail ? `: ${detail}` : ''));
    console.log(`  FAIL  ${label}${detail ? `: ${detail}` : ''}`);
  }

  summary(): boolean {
    console.log('');
    console.log(`Passes: ${this.passes}, Failures: ${this.failures.length}`);
    if (this.failures.length === 0) {
      console.log('All display-eligibility checks PASS.');
      return true;
    }
    console.log('FAIL — display-eligibility validator failed.');
    return false;
  }
}

function loadJson<T>(file: string): T {
  const full = path.join(EXPORTS, file);
  if (!existsSync(full)) {
    throw new Error(`Missing export file: ${file}. Run scripts/p102-build-display-eligibility-export.ts first.`);
  }
  return JSON.parse(readFileSync(full, 'utf8')) as T;
}

function loadClassifierRows(): ClassifierRow[] {
  const parsed = JSON.parse(readFileSync(CLASSIFIER_OUT, 'utf8')) as
    | ClassifierRow[]
    | { rows: ClassifierRow[] };
  return Array.isArray(parsed) ? parsed : parsed.rows;
}

function loadDataJsNames(): Set<string> {
  const t = readFileSync(DATA_JS, 'utf8');
  const m = t.match(/const PROGRAMS = \[([\s\S]*?)\];/);
  if (!m) throw new Error('Could not parse PROGRAMS from data.js');
  // eslint-disable-next-line no-eval
  const programs = eval('[' + m[1] + ']') as { name: string }[];
  return new Set(programs.map(p => p.name));
}

function loadDataJsNameCounts(): Map<string, number> {
  const t = readFileSync(DATA_JS, 'utf8');
  const m = t.match(/const PROGRAMS = \[([\s\S]*?)\];/);
  if (!m) throw new Error('Could not parse PROGRAMS from data.js');
  // eslint-disable-next-line no-eval
  const programs = eval('[' + m[1] + ']') as { name: string }[];
  const counts = new Map<string, number>();
  for (const p of programs) counts.set(p.name, (counts.get(p.name) ?? 0) + 1);
  return counts;
}

function main(): void {
  console.log('P102 display-eligibility export validator');
  console.log(`  exports dir: ${path.relative(REPO_ROOT, EXPORTS)}`);

  const runner = new CheckRunner();

  // Load every bucket; verify each is an array.
  const buckets: Record<keyof typeof FILES, DisplayRow[]> = {} as Record<keyof typeof FILES, DisplayRow[]>;
  for (const [key, file] of Object.entries(FILES) as [keyof typeof FILES, string][]) {
    try {
      const arr = loadJson<DisplayRow[]>(file);
      if (!Array.isArray(arr)) {
        runner.fail(`${file} is JSON-parseable`, 'expected an array');
        continue;
      }
      buckets[key] = arr;
      runner.pass(`${file} parses (${arr.length} rows)`);
    } catch (e) {
      runner.fail(`${file} parses`, e instanceof Error ? e.message : String(e));
    }
  }

  // Load classifier output for cross-checks.
  let classifierRows: ClassifierRow[] = [];
  try {
    classifierRows = loadClassifierRows();
    runner.pass(`classifier output loaded (${classifierRows.length} rows)`);
  } catch (e) {
    runner.fail('classifier output loaded', e instanceof Error ? e.message : String(e));
  }

  // Load data.js name set.
  let dataJsNames = new Set<string>();
  try {
    dataJsNames = loadDataJsNames();
    runner.pass(`data.js names loaded (${dataJsNames.size} unique names)`);
  } catch (e) {
    runner.fail('data.js names loaded', e instanceof Error ? e.message : String(e));
  }

  // Rule 1: clinical export count matches classifier true USCE count.
  const trueUsceCount = classifierRows.filter(r => r.countsAsTrueUSCE).length;
  if (buckets.clinical.length === trueUsceCount) {
    runner.pass(`clinical export count matches classifier true USCE count (${trueUsceCount})`);
  } else {
    runner.fail('clinical export count matches classifier true USCE count', `${buckets.clinical.length} vs ${trueUsceCount}`);
  }

  // Rule 2: no hidden row appears in clinical or research display export.
  const hiddenNames = new Set([
    ...Object.keys(HIDDEN_PROGRAMS),
    ...buckets.hidden.map(r => r.programName),
  ]);
  for (const bucketKey of ACTIVE_BUCKETS) {
    const offenders = buckets[bucketKey]
      .filter(r => hiddenNames.has(r.programName))
      .map(r => r.programName);
    if (offenders.length === 0) {
      runner.pass(`no hidden row appears in ${bucketKey} display`);
    } else {
      runner.fail(`no hidden row appears in ${bucketKey} display`, offenders.join(', '));
    }
  }

  // Rule 3: no research row appears in the clinical display export.
  const clinicalResearchOffenders = buckets.clinical
    .filter(r => RESEARCH_OK_CLASSIFICATIONS.has(r.classification) || r.classification === 'RESEARCH_TOO_GENERIC_REVERIFY')
    .map(r => r.programName);
  if (clinicalResearchOffenders.length === 0) {
    runner.pass('no research row appears in clinical display export');
  } else {
    runner.fail('no research row appears in clinical display export', clinicalResearchOffenders.join(', '));
  }

  // Rule 4: no negative-informational row appears in any active display export.
  const archiveNames = new Set(buckets.archiveNegative.map(r => r.programName));
  for (const bucketKey of ACTIVE_BUCKETS) {
    const offenders = buckets[bucketKey]
      .filter(r => archiveNames.has(r.programName) || r.classification === 'NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE')
      .map(r => r.programName);
    if (offenders.length === 0) {
      runner.pass(`no negative-informational row appears in ${bucketKey} display`);
    } else {
      runner.fail(`no negative-informational row appears in ${bucketKey} display`, offenders.join(', '));
    }
  }

  // Rule 5: no outreach hold appears in active display.
  const outreachNames = new Set(buckets.outreach.map(r => r.programName));
  for (const bucketKey of ACTIVE_BUCKETS) {
    const offenders = buckets[bucketKey]
      .filter(r => outreachNames.has(r.programName))
      .map(r => r.programName);
    if (offenders.length === 0) {
      runner.pass(`no outreach hold appears in ${bucketKey} display`);
    } else {
      runner.fail(`no outreach hold appears in ${bucketKey} display`, offenders.join(', '));
    }
  }

  // Rule 6: no broken/manual-browser row appears in active display.
  const manualBrowserNames = new Set(buckets.manualBrowser.map(r => r.programName));
  for (const bucketKey of ACTIVE_BUCKETS) {
    const offenders = buckets[bucketKey]
      .filter(r => manualBrowserNames.has(r.programName))
      .map(r => r.programName);
    if (offenders.length === 0) {
      runner.pass(`no broken/manual-browser row appears in ${bucketKey} display`);
    } else {
      runner.fail(`no broken/manual-browser row appears in ${bucketKey} display`, offenders.join(', '));
    }
  }

  // Rule 7: every clinical display row has a non-empty finalUrl.
  const clinicalEmptyUrl = buckets.clinical
    .filter(r => !r.finalUrl || r.finalUrl.trim().length === 0 || r.finalUrl === '#')
    .map(r => r.programName);
  if (clinicalEmptyUrl.length === 0) {
    runner.pass('every clinical display row has a non-empty finalUrl');
  } else {
    runner.fail('every clinical display row has a non-empty finalUrl', clinicalEmptyUrl.join(', '));
  }

  // Rule 8: every clinical display row has classification DIRECT/MOVED/PROTECTED.
  const clinicalBadClass = buckets.clinical
    .filter(r => !CLINICAL_OK_CLASSIFICATIONS.has(r.classification))
    .map(r => `${r.programName}=${r.classification}`);
  if (clinicalBadClass.length === 0) {
    runner.pass('every clinical display row has classification DIRECT/MOVED/PROTECTED');
  } else {
    runner.fail('every clinical display row has classification DIRECT/MOVED/PROTECTED', clinicalBadClass.join(', '));
  }

  // Rule 9: every row's programName matches a data.js name exactly.
  for (const [key, rows] of Object.entries(buckets) as [keyof typeof FILES, DisplayRow[]][]) {
    const missing = rows
      .filter(r => !dataJsNames.has(r.programName))
      .map(r => r.programName);
    if (missing.length === 0) {
      runner.pass(`every ${key} row's programName matches a data.js name (${rows.length} rows)`);
    } else {
      runner.fail(`every ${key} row's programName matches a data.js name`, missing.slice(0, 5).join(', ') + (missing.length > 5 ? ` …(+${missing.length - 5} more)` : ''));
    }
  }

  // Rule 10: no bucket has more rows for a given programName than data.js
  // has rows for that name. (data.js legitimately has multiple entries with
  // the same name — e.g., institutions with both general and international
  // observerships, or with em-dash vs no-em-dash spellings; the validator
  // should reject genuine duplication, not legitimate data.js multiplicity.)
  const dataJsNameCounts = loadDataJsNameCounts();
  for (const [key, rows] of Object.entries(buckets) as [keyof typeof FILES, DisplayRow[]][]) {
    const seen = new Map<string, number>();
    for (const r of rows) seen.set(r.programName, (seen.get(r.programName) ?? 0) + 1);
    const overflows = [...seen.entries()]
      .filter(([name, n]) => n > (dataJsNameCounts.get(name) ?? 0))
      .map(([name, n]) => `${name} (${n} in bucket vs ${dataJsNameCounts.get(name) ?? 0} in data.js)`);
    if (overflows.length === 0) {
      runner.pass(`no programName-count overflow within ${key}`);
    } else {
      runner.fail(`no programName-count overflow within ${key}`, overflows.join('; '));
    }
  }

  // Rule 11: no third-party broker hidden row appears in active display.
  const thirdPartyBrokerNames = new Set(
    Object.entries(HIDDEN_PROGRAMS)
      .filter(([, v]) => v.classification === 'THIRD_PARTY_BROKER' || v.classification === 'AGGREGATOR_DEAD')
      .map(([k]) => k)
  );
  for (const bucketKey of ACTIVE_BUCKETS) {
    const offenders = buckets[bucketKey]
      .filter(r => thirdPartyBrokerNames.has(r.programName))
      .map(r => r.programName);
    if (offenders.length === 0) {
      runner.pass(`no third-party broker/aggregator row appears in ${bucketKey} display`);
    } else {
      runner.fail(`no third-party broker/aggregator row appears in ${bucketKey} display`, offenders.join(', '));
    }
  }

  // Sum-check: every data.js row is accounted for exactly once across all buckets.
  // (Allow for legitimate duplicates across data.js — same name appearing twice — by
  // checking total bucket count equals classifier row count.)
  const totalBucketCount = Object.values(buckets).reduce((s, b) => s + b.length, 0);
  if (totalBucketCount === classifierRows.length) {
    runner.pass(`total bucket count equals classifier row count (${totalBucketCount})`);
  } else {
    runner.fail('total bucket count equals classifier row count', `${totalBucketCount} vs ${classifierRows.length}`);
  }

  const ok = runner.summary();
  if (!ok) process.exit(1);
}

main();
