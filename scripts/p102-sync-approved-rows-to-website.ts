#!/usr/bin/env tsx
/**
 * P102 → website static-snapshot sync.
 *
 * Copies the canonical approved-export
 *   docs/.../p102/exports/public_safe_opportunity_rows_approved.json
 * into the Next.js build-time static snapshot
 *   src/data/generated/p102-approved-usce.generated.json
 *
 * The snapshot is the file the Next.js preview route imports. Keeping the
 * canonical source under docs/ keeps the data product separate from the web
 * build, but Next.js App Router prefers in-src imports for static analysis.
 *
 * Pure read + write. No DB. No model. No network.
 *
 * Re-run this script after every reviewer pass / re-build of the approved
 * export. Idempotent — running twice with no upstream change produces an
 * identical file modulo the `generatedAt` timestamp.
 *
 * Usage:
 *   npx tsx scripts/p102-sync-approved-rows-to-website.ts
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const CANONICAL_SOURCE = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/exports/public_safe_opportunity_rows_approved.json');
const STATIC_SNAPSHOT = path.join(REPO_ROOT, 'src/data/generated/p102-approved-usce.generated.json');

interface ApprovedRow {
  rowId: string;
  reviewStatus: 'AUTO_PUBLIC_SAFE' | 'REVIEWER_APPROVED';
  autoApproved: boolean;
  visibilityLane: 'PUBLIC_SAFE_USCE';
  institutionId: string;
  institutionName: string;
  parentSystem: string | null;
  campus: string | null;
  city: string;
  state: string;
  opportunityName: string;
  opportunityType: string;
  audience: string | null;
  eligibility: string | null;
  specialty: string | null;
  applicationRoute: string | null;
  cost: string | null;
  duration: string | null;
  deadline: string | null;
  contact: { name: string | null; title: string | null; email: string | null; phone: string | null } | null;
  sourceUrl: string;
  sourceQuote: string;
  sourceHash: string;
  cleanedTextPath: string;
  sourceScope: string;
  campusApplicabilityProof: string | null;
  decisionReason: string | null;
  reviewer: string | null;
  reviewedAt: string;
  extractedFromRunId: string;
  claimIds: string[];
  warnings: string[];
  schemaVersion: string;
}

interface CanonicalFile {
  schemaVersion: string;
  generatedAt: string;
  summary: {
    total: number;
    autoApproved: number;
    reviewerApproved: number;
    institutions: number;
  };
  rows: ApprovedRow[];
}

function main(): void {
  if (!existsSync(CANONICAL_SOURCE)) {
    console.error(`FATAL: canonical source missing: ${CANONICAL_SOURCE}`);
    console.error(`  run p102-build-approved-public-safe-export.ts first`);
    process.exit(2);
  }

  const canonical = JSON.parse(readFileSync(CANONICAL_SOURCE, 'utf8')) as CanonicalFile;

  if (!Array.isArray(canonical.rows)) {
    console.error('FATAL: canonical.rows is not an array');
    process.exit(2);
  }

  // Strip cleanedTextPath from the public snapshot — it's a private T7 path
  // that has no business on the website. The rest of the row carries all
  // the public-facing fields.
  const publicRows = canonical.rows.map(r => {
    const { cleanedTextPath: _ignored, ...publicView } = r;
    void _ignored;
    return publicView;
  });

  const snapshot = {
    schemaVersion: canonical.schemaVersion,
    canonicalSource: 'docs/platform-v2/local/usce-discovery-command-center/p102/exports/public_safe_opportunity_rows_approved.json',
    canonicalGeneratedAt: canonical.generatedAt,
    syncedAt: new Date().toISOString(),
    summary: canonical.summary,
    rows: publicRows,
  };

  const outDir = path.dirname(STATIC_SNAPSHOT);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(STATIC_SNAPSHOT, JSON.stringify(snapshot, null, 2) + '\n');

  console.log('P102 → website sync');
  console.log(`  source:    ${path.relative(REPO_ROOT, CANONICAL_SOURCE)}`);
  console.log(`  snapshot:  ${path.relative(REPO_ROOT, STATIC_SNAPSHOT)}`);
  console.log(`  rows:      ${publicRows.length} (auto: ${snapshot.summary.autoApproved}, reviewer: ${snapshot.summary.reviewerApproved})`);
  console.log(`  ✓ synced`);
}

main();
