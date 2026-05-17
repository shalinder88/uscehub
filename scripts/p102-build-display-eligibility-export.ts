#!/usr/bin/env tsx
/**
 * P102 Display-Eligibility Export Builder.
 *
 * Consumes the per-listing classification output (the 11-state taxonomy)
 * plus prisma/verified-links.ts + prisma/listings-hidelist.ts, and emits
 * the buckets that the local preview / future seed integration needs.
 *
 * Inputs:
 *   - usmle-observerships/data.js (PROGRAMS array) — via the classifier output
 *   - prisma/verified-links.ts (URL overrides + notes)
 *   - prisma/listings-hidelist.ts (hide reasons + classifications)
 *   - exports/live_listings_classification.json (the 11-state per-row JSON)
 *
 * Outputs (all under docs/platform-v2/local/usce-discovery-command-center/p102/exports/):
 *   display_eligible_clinical_usce.json  — clinical USCE display lane
 *   display_eligible_research.json        — research lane only
 *   display_hold_outreach.json            — borderline outreach holds
 *   display_hold_research_reverify.json   — research too-generic holds
 *   display_hold_manual_browser.json      — broken-needs-browser holds
 *   display_hidden_or_removed.json        — hidden / broker / dead
 *   display_archive_negative_info.json    — negative informational (archive only)
 *   display_eligibility_summary.md        — human-readable counts
 *
 * Bucketing rules (mirror docs/.../P102_FINAL_LINK_TRUTH_RECONCILIATION.md):
 *   - Clinical display eligible = DIRECT_TRUE_USCE_LINK
 *                                + MOVED_REORIENTED_TO_TRUE_USCE_LINK
 *                                + PROTECTED_BROWSER_REQUIRED
 *     (excluding any row that is also in HIDDEN_PROGRAMS)
 *   - Research display eligible = RESEARCH_VALID_INSTITUTIONAL_PATHWAY only
 *   - Research reverify hold     = RESEARCH_TOO_GENERIC_REVERIFY
 *   - Outreach hold              = BORDERLINE_KEEP_REVERIFY
 *   - Manual-browser hold        = BROKEN_REQUIRES_MANUAL_BROWSER
 *   - Hidden                     = NO_PROGRAM_FOUND_HIDE
 *                                 + anything else flagged isHidden in listings-hidelist.ts
 *   - Archive (negative info)    = NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE
 *                                 (separate from hidden so the operator can
 *                                  distinguish "confirmed not offered" from
 *                                  "dead / broker / out of scope")
 *
 * Side effects:
 *   - Writes 6 JSON files + 1 markdown summary.
 *   - Does NOT mutate data.js, verified-links.ts, listings-hidelist.ts,
 *     the classifier, the seed, the schema, or anything in src/.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { VERIFIED_LINKS } from '../prisma/verified-links';
import { HIDDEN_PROGRAMS, isHidden } from '../prisma/listings-hidelist';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPORTS = path.join(
  REPO_ROOT,
  'docs/platform-v2/local/usce-discovery-command-center/p102/exports'
);
const CLASSIFIER_OUT = path.join(EXPORTS, 'live_listings_classification.json');

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

type DisplayBadge = 'DIRECT' | 'REORIENTED' | 'PROTECTED' | 'RESEARCH' | 'HOLD' | 'HIDDEN';

interface ClassifierRow {
  listingTitle: string;
  institution: string;
  state: string;
  currentUrl: string;
  finalUrl: string;
  programType: string;
  subType: string;
  audience: string;
  classification: Classification;
  evidenceQuote: string;
  sourceStatus: string;
  actionTaken: string;
  reason: string;
  countsAsTrueUSCE: boolean;
  countsAsResearch: boolean;
  needsManualBrowser: boolean;
  hasVerifiedOverride: boolean;
  isHidden: boolean;
  priorRunnerStatus: string;
  notes: string;
}

interface DisplayRow {
  programName: string;            // exact data.js name
  institution: string;
  state: string;
  finalUrl: string;
  classification: Classification;
  badge: DisplayBadge;
  subType: string;
  audience: string;
  evidenceQuote: string;
  provenanceNote: string;         // pulled from VERIFIED_LINKS[programName].note when available
  verifiedFlag: boolean;
  hideReason?: string;            // present only on hidden rows
  hideClassification?: string;    // present only on hidden rows
}

function badgeFor(c: Classification): DisplayBadge {
  switch (c) {
    case 'DIRECT_TRUE_USCE_LINK': return 'DIRECT';
    case 'MOVED_REORIENTED_TO_TRUE_USCE_LINK': return 'REORIENTED';
    case 'PROTECTED_BROWSER_REQUIRED': return 'PROTECTED';
    case 'RESEARCH_VALID_INSTITUTIONAL_PATHWAY':
    case 'RESEARCH_DIRECT_PROGRAM':
    case 'RESEARCH_GENERIC_BUT_ACCEPTABLE':
    case 'RESEARCH_TOO_GENERIC_REVERIFY': return 'RESEARCH';
    case 'BORDERLINE_KEEP_REVERIFY':
    case 'BROKEN_REQUIRES_MANUAL_BROWSER': return 'HOLD';
    case 'NO_PROGRAM_FOUND_HIDE':
    case 'NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE': return 'HIDDEN';
  }
}

function toDisplayRow(r: ClassifierRow): DisplayRow {
  const programName = r.listingTitle; // classifier uses listingTitle = data.js program.name
  const vl = VERIFIED_LINKS[programName];
  const hidden = HIDDEN_PROGRAMS[programName];
  return {
    programName,
    institution: r.institution || programName,
    state: r.state,
    finalUrl: r.finalUrl || r.currentUrl,
    classification: r.classification,
    badge: badgeFor(r.classification),
    subType: r.subType,
    audience: r.audience,
    evidenceQuote: r.evidenceQuote || '',
    provenanceNote: vl?.note ?? '',
    verifiedFlag: !!vl?.verified,
    hideReason: hidden?.reason,
    hideClassification: hidden?.classification,
  };
}

function main(): void {
  if (!existsSync(CLASSIFIER_OUT)) {
    throw new Error(
      `Missing classifier output at ${CLASSIFIER_OUT}. Run scripts/p102-classify-live-listings-per-type.ts first.`
    );
  }
  const parsed = JSON.parse(readFileSync(CLASSIFIER_OUT, 'utf8')) as
    | ClassifierRow[]
    | { generatedAt?: string; totalListings?: number; rows: ClassifierRow[] };
  const raw: ClassifierRow[] = Array.isArray(parsed) ? parsed : parsed.rows;
  if (!Array.isArray(raw)) {
    throw new Error('Classifier output has no .rows array; expected ClassifierRow[].');
  }

  // Bucket the rows.
  const clinical: DisplayRow[] = [];
  const research: DisplayRow[] = [];
  const outreach: DisplayRow[] = [];
  const researchReverify: DisplayRow[] = [];
  const manualBrowser: DisplayRow[] = [];
  const hidden: DisplayRow[] = [];
  const archiveNegative: DisplayRow[] = [];

  for (const r of raw) {
    const d = toDisplayRow(r);

    // Strict exclusion: anything in HIDDEN_PROGRAMS is hidden, no matter
    // what the classifier said.
    if (isHidden(d.programName) || r.isHidden) {
      hidden.push(d);
      continue;
    }

    switch (r.classification) {
      case 'DIRECT_TRUE_USCE_LINK':
      case 'MOVED_REORIENTED_TO_TRUE_USCE_LINK':
      case 'PROTECTED_BROWSER_REQUIRED':
        clinical.push(d);
        break;
      case 'RESEARCH_VALID_INSTITUTIONAL_PATHWAY':
      case 'RESEARCH_DIRECT_PROGRAM':
      case 'RESEARCH_GENERIC_BUT_ACCEPTABLE':
        research.push(d);
        break;
      case 'RESEARCH_TOO_GENERIC_REVERIFY':
        researchReverify.push(d);
        break;
      case 'BORDERLINE_KEEP_REVERIFY':
        outreach.push(d);
        break;
      case 'BROKEN_REQUIRES_MANUAL_BROWSER':
        manualBrowser.push(d);
        break;
      case 'NO_PROGRAM_FOUND_HIDE':
        hidden.push(d);
        break;
      case 'NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE':
        archiveNegative.push(d);
        break;
    }
  }

  // Sort each bucket alphabetically by programName for stable diffs.
  const byName = (a: DisplayRow, b: DisplayRow) => a.programName.localeCompare(b.programName);
  [clinical, research, outreach, researchReverify, manualBrowser, hidden, archiveNegative].forEach(b => b.sort(byName));

  // Emit JSON.
  const write = (name: string, payload: unknown) => {
    const p = path.join(EXPORTS, name);
    writeFileSync(p, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    console.log(`  wrote ${path.relative(REPO_ROOT, p)} (${Array.isArray(payload) ? (payload as unknown[]).length + ' rows' : '1 object'})`);
  };

  write('display_eligible_clinical_usce.json', clinical);
  write('display_eligible_research.json', research);
  write('display_hold_outreach.json', outreach);
  write('display_hold_research_reverify.json', researchReverify);
  write('display_hold_manual_browser.json', manualBrowser);
  write('display_hidden_or_removed.json', hidden);
  write('display_archive_negative_info.json', archiveNegative);

  // Emit summary markdown.
  const total = raw.length;
  const sumLines: string[] = [
    '# P102 Display Eligibility Summary',
    '',
    `Generated by scripts/p102-build-display-eligibility-export.ts`,
    `Source: ${path.relative(REPO_ROOT, CLASSIFIER_OUT)}`,
    `Total data.js rows classified: ${total}`,
    '',
    '## Buckets',
    '',
    '| Bucket | File | Count | Display lane |',
    '|---|---|---:|---|',
    `| Clinical USCE eligible | display_eligible_clinical_usce.json | ${clinical.length} | Clinical USCE |`,
    `| Research eligible | display_eligible_research.json | ${research.length} | Research |`,
    `| Outreach hold | display_hold_outreach.json | ${outreach.length} | (held) |`,
    `| Research reverify hold | display_hold_research_reverify.json | ${researchReverify.length} | (held) |`,
    `| Manual-browser hold | display_hold_manual_browser.json | ${manualBrowser.length} | (held) |`,
    `| Hidden / removed | display_hidden_or_removed.json | ${hidden.length} | (none) |`,
    `| Archive (negative info) | display_archive_negative_info.json | ${archiveNegative.length} | (archive only) |`,
    `| **Sum** | | **${clinical.length + research.length + outreach.length + researchReverify.length + manualBrowser.length + hidden.length + archiveNegative.length}** | |`,
    '',
    `Active display (clinical + research): ${clinical.length + research.length}`,
    `Held: ${outreach.length + researchReverify.length + manualBrowser.length}`,
    `Hidden: ${hidden.length}`,
    `Archive (negative info): ${archiveNegative.length}`,
    '',
    '## Clinical USCE badge distribution',
    '',
  ];

  const clinicalBadges: Record<string, number> = {};
  for (const c of clinical) clinicalBadges[c.badge] = (clinicalBadges[c.badge] ?? 0) + 1;
  for (const [b, n] of Object.entries(clinicalBadges).sort((a, b2) => b2[1] - a[1])) {
    sumLines.push(`- ${b}: ${n}`);
  }
  sumLines.push('');

  sumLines.push('## Clinical USCE subType distribution');
  sumLines.push('');
  const clinicalSubs: Record<string, number> = {};
  for (const c of clinical) clinicalSubs[c.subType] = (clinicalSubs[c.subType] ?? 0) + 1;
  for (const [s, n] of Object.entries(clinicalSubs).sort((a, b2) => b2[1] - a[1])) {
    sumLines.push(`- ${s}: ${n}`);
  }
  sumLines.push('');

  sumLines.push('## Held-row institutions (need operator action)');
  sumLines.push('');
  sumLines.push('### Outreach hold (phone call needed)');
  for (const r of outreach) sumLines.push(`- ${r.programName} — ${r.finalUrl}`);
  sumLines.push('');
  sumLines.push('### Research-reverify hold (operator URL needed)');
  for (const r of researchReverify) sumLines.push(`- ${r.programName} — ${r.finalUrl}`);
  sumLines.push('');
  sumLines.push('### Manual-browser hold (in-browser check needed)');
  for (const r of manualBrowser) sumLines.push(`- ${r.programName} — ${r.finalUrl}`);
  sumLines.push('');

  writeFileSync(
    path.join(EXPORTS, 'display_eligibility_summary.md'),
    sumLines.join('\n'),
    'utf8'
  );
  console.log(`  wrote docs/.../exports/display_eligibility_summary.md`);

  console.log('');
  console.log(`Active clinical: ${clinical.length}`);
  console.log(`Active research: ${research.length}`);
  console.log(`Held (outreach + research-reverify + manual-browser): ${outreach.length + researchReverify.length + manualBrowser.length}`);
  console.log(`Hidden / removed: ${hidden.length}`);
  console.log(`Archive (negative info): ${archiveNegative.length}`);
  console.log(`Sum: ${clinical.length + research.length + outreach.length + researchReverify.length + manualBrowser.length + hidden.length + archiveNegative.length}`);
  console.log(`Source rows: ${raw.length}`);
}

main();
