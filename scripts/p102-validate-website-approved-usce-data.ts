#!/usr/bin/env tsx
/**
 * P102 website-approved USCE data validator.
 *
 * Re-validates the build-time static snapshot
 *   src/data/generated/p102-approved-usce.generated.json
 * to ensure no row can ever leak onto the website surface that violates
 * the public-safe display contract.
 *
 * This is the SECOND layer of validation, run after the snapshot is
 * synced from the canonical approved-export. The first layer is
 * scripts/p102-validate-approved-public-safe-export.ts which validates
 * the canonical export at the data layer; this layer validates what the
 * Next.js preview route will actually serve.
 *
 * Hard rules per row:
 *   - rowId present + unique
 *   - institutionName, city, state present
 *   - sourceUrl present, https:// or http://
 *   - sourceQuote present, ≥10 chars, NEVER 'NOT_STATED_ON_SOURCE'
 *   - sourceHash present
 *   - visibilityLane === 'PUBLIC_SAFE_USCE'
 *   - reviewStatus ∈ {AUTO_PUBLIC_SAFE, REVIEWER_APPROVED}
 *   - opportunityType in allowed Tier 1 USCE set (no GME/RESIDENCY/etc.)
 *   - HEALTH_SYSTEM_LEVEL / MEDICAL_SCHOOL_LEVEL scope → campusApplicabilityProof ≥30 chars
 *   - reviewedAt parses as ISO date
 *
 * Exit code 0 if all rows pass; 1 otherwise.
 *
 * Usage:
 *   npx tsx scripts/p102-validate-website-approved-usce-data.ts
 */

import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT_PATH = path.join(REPO_ROOT, 'src/data/generated/p102-approved-usce.generated.json');

const ALLOWED_OPPORTUNITY_TYPES = new Set([
  'OBSERVERSHIP', 'VISITING_MEDICAL_STUDENT', 'CLINICAL_ELECTIVE',
  'SUB_INTERNSHIP', 'AWAY_ROTATION', 'INTERNATIONAL_VISITING_STUDENT',
  'RESEARCH_OPPORTUNITY', 'EXTERNSHIP',
]);

const ALLOWED_SCOPES = new Set([
  'INSTITUTION_SPECIFIC', 'CAMPUS_SPECIFIC', 'DEPARTMENT_LEVEL',
  'HEALTH_SYSTEM_LEVEL', 'MEDICAL_SCHOOL_LEVEL',
]);

const SYSTEM_OR_SCHOOL_SCOPES = new Set(['HEALTH_SYSTEM_LEVEL', 'MEDICAL_SCHOOL_LEVEL']);

interface SnapshotRow {
  rowId?: string;
  reviewStatus?: string;
  visibilityLane?: string;
  institutionName?: string;
  city?: string;
  state?: string;
  opportunityType?: string;
  sourceUrl?: string;
  sourceQuote?: string;
  sourceHash?: string;
  sourceScope?: string;
  campusApplicabilityProof?: string | null;
  reviewedAt?: string;
}

interface Snapshot {
  schemaVersion?: string;
  rows?: SnapshotRow[];
  summary?: unknown;
}

interface Issue {
  rowId: string;
  institutionName: string;
  reason: string;
}

function main(): void {
  if (!existsSync(SNAPSHOT_PATH)) {
    console.error(`FAIL: snapshot missing: ${SNAPSHOT_PATH}`);
    console.error('       run p102-sync-approved-rows-to-website.ts');
    process.exit(1);
  }

  let snapshot: Snapshot;
  try {
    snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as Snapshot;
  } catch (e) {
    console.error(`FAIL: snapshot unparsable: ${(e as Error).message}`);
    process.exit(1);
  }

  if (!Array.isArray(snapshot.rows)) {
    console.error('FAIL: snapshot.rows is not an array');
    process.exit(1);
  }

  const issues: Issue[] = [];
  const seenRowIds = new Set<string>();

  for (const r of snapshot.rows) {
    const rid = r.rowId ?? '(missing)';
    const iname = r.institutionName ?? '(missing)';
    const push = (reason: string) => issues.push({ rowId: rid, institutionName: iname, reason });

    if (!r.rowId) push('missing rowId');
    if (r.rowId && seenRowIds.has(r.rowId)) push(`duplicate rowId: ${r.rowId}`);
    if (r.rowId) seenRowIds.add(r.rowId);

    if (!r.institutionName) push('missing institutionName');
    if (!r.city) push('missing city');
    if (!r.state) push('missing state');

    if (!r.sourceUrl) push('missing sourceUrl');
    else if (!/^https?:\/\//i.test(r.sourceUrl)) push(`sourceUrl is not http/https: ${r.sourceUrl}`);

    if (!r.sourceQuote || r.sourceQuote.length < 10) push('sourceQuote missing or <10 chars');
    if (r.sourceQuote === 'NOT_STATED_ON_SOURCE') push('sourceQuote is NOT_STATED_ON_SOURCE — cannot display as public-safe');

    if (!r.sourceHash || r.sourceHash.length < 10) push('sourceHash missing or too short');

    if (r.visibilityLane !== 'PUBLIC_SAFE_USCE') push(`visibilityLane must be PUBLIC_SAFE_USCE, got "${r.visibilityLane}"`);
    if (r.reviewStatus !== 'AUTO_PUBLIC_SAFE' && r.reviewStatus !== 'REVIEWER_APPROVED') {
      push(`reviewStatus must be AUTO_PUBLIC_SAFE or REVIEWER_APPROVED, got "${r.reviewStatus}"`);
    }

    if (!r.opportunityType || !ALLOWED_OPPORTUNITY_TYPES.has(r.opportunityType)) {
      push(`opportunityType "${r.opportunityType}" not in allowed Tier 1 set`);
    }

    if (!r.sourceScope || !ALLOWED_SCOPES.has(r.sourceScope)) {
      push(`sourceScope "${r.sourceScope}" not in allowed set`);
    }

    if (r.sourceScope && SYSTEM_OR_SCHOOL_SCOPES.has(r.sourceScope)) {
      if (!r.campusApplicabilityProof || r.campusApplicabilityProof.trim().length < 30) {
        push(`${r.sourceScope} requires campusApplicabilityProof ≥30 chars`);
      }
    }

    if (!r.reviewedAt || !/^\d{4}-\d{2}-\d{2}/.test(r.reviewedAt)) {
      push(`reviewedAt must be ISO date, got "${r.reviewedAt}"`);
    }
  }

  console.log('P102 website-approved USCE data validator');
  console.log(`  snapshot:      ${path.relative(REPO_ROOT, SNAPSHOT_PATH)}`);
  console.log(`  rows checked:  ${snapshot.rows.length}`);
  console.log(`  unique rowIds: ${seenRowIds.size}`);
  console.log(`  issues:        ${issues.length}`);

  if (issues.length > 0) {
    console.log('\n  ISSUES:');
    for (const i of issues) console.log(`    ${i.institutionName} (${i.rowId}): ${i.reason}`);
    console.log('\n  ✗ FAIL');
    process.exit(1);
  }

  console.log('\n  ✓ PASS');
}

main();
