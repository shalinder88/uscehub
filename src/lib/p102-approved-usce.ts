/**
 * P102 approved-rows adapter.
 *
 * Reads the build-time static snapshot
 *   src/data/generated/p102-approved-usce.generated.json
 * and exposes accessor functions for the preview route at
 *   /usce/verified-preview
 *
 * Pure functions. SSR-safe. No DB calls. No model calls. No network.
 *
 * The canonical source of truth is
 *   docs/platform-v2/local/usce-discovery-command-center/p102/exports/
 *     public_safe_opportunity_rows_approved.json
 * synced into the snapshot via scripts/p102-sync-approved-rows-to-website.ts.
 */

import snapshot from "@/data/generated/p102-approved-usce.generated.json";

export type P102OpportunityType =
  | "OBSERVERSHIP"
  | "VISITING_MEDICAL_STUDENT"
  | "CLINICAL_ELECTIVE"
  | "SUB_INTERNSHIP"
  | "AWAY_ROTATION"
  | "INTERNATIONAL_VISITING_STUDENT"
  | "RESEARCH_OPPORTUNITY"
  | "EXTERNSHIP";

export type P102SourceScope =
  | "INSTITUTION_SPECIFIC"
  | "CAMPUS_SPECIFIC"
  | "DEPARTMENT_LEVEL"
  | "HEALTH_SYSTEM_LEVEL"
  | "MEDICAL_SCHOOL_LEVEL";

export type P102ReviewStatus = "AUTO_PUBLIC_SAFE" | "REVIEWER_APPROVED";

export interface P102ApprovedRow {
  rowId: string;
  reviewStatus: P102ReviewStatus;
  autoApproved: boolean;
  visibilityLane: "PUBLIC_SAFE_USCE";
  institutionId: string;
  institutionName: string;
  parentSystem: string | null;
  campus: string | null;
  city: string;
  state: string;
  opportunityName: string;
  opportunityType: P102OpportunityType;
  audience: string | null;
  eligibility: string | null;
  specialty: string | null;
  applicationRoute: string | null;
  cost: string | null;
  duration: string | null;
  deadline: string | null;
  contact: {
    name: string | null;
    title: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  sourceUrl: string;
  sourceQuote: string;
  sourceHash: string;
  sourceScope: P102SourceScope;
  campusApplicabilityProof: string | null;
  decisionReason: string | null;
  reviewer: string | null;
  reviewedAt: string;
  extractedFromRunId: string;
  claimIds: string[];
  warnings: string[];
  schemaVersion: string;
}

export interface P102Snapshot {
  schemaVersion: string;
  canonicalSource: string;
  canonicalGeneratedAt: string;
  syncedAt: string;
  summary: {
    total: number;
    autoApproved: number;
    reviewerApproved: number;
    institutions: number;
  };
  rows: P102ApprovedRow[];
}

const SNAPSHOT = snapshot as unknown as P102Snapshot;

/**
 * Validate one row at access time. Returns false (skip) for any row that
 * fails the public-safety floor — even though the build-time validator
 * already rejected these, the adapter double-checks at runtime so a
 * broken or hand-edited snapshot can never leak unsafe rows.
 */
function isDisplayable(row: P102ApprovedRow): boolean {
  if (!row || typeof row !== "object") return false;
  if (!row.rowId) return false;
  if (row.visibilityLane !== "PUBLIC_SAFE_USCE") return false;
  if (!row.sourceUrl) return false;
  if (!row.sourceQuote || row.sourceQuote === "NOT_STATED_ON_SOURCE") return false;
  if (!row.sourceHash) return false;
  if (!row.institutionName || !row.city || !row.state) return false;
  return true;
}

const DISPLAYABLE_ROWS: P102ApprovedRow[] = SNAPSHOT.rows.filter(isDisplayable);

const ROW_BY_ID = new Map<string, P102ApprovedRow>();
for (const row of DISPLAYABLE_ROWS) ROW_BY_ID.set(row.rowId, row);

export function getAllApprovedRows(): P102ApprovedRow[] {
  // Sorted by institution name then opportunity name for stable display.
  return [...DISPLAYABLE_ROWS].sort(
    (a, b) =>
      a.institutionName.localeCompare(b.institutionName) ||
      a.opportunityName.localeCompare(b.opportunityName),
  );
}

export function getApprovedRowById(rowId: string): P102ApprovedRow | null {
  return ROW_BY_ID.get(rowId) ?? null;
}

export function getApprovedRowIds(): string[] {
  return DISPLAYABLE_ROWS.map((r) => r.rowId);
}

export function getSnapshotMetadata(): {
  canonicalGeneratedAt: string;
  syncedAt: string;
  summary: P102Snapshot["summary"];
  displayableRowCount: number;
} {
  return {
    canonicalGeneratedAt: SNAPSHOT.canonicalGeneratedAt,
    syncedAt: SNAPSHOT.syncedAt,
    summary: SNAPSHOT.summary,
    displayableRowCount: DISPLAYABLE_ROWS.length,
  };
}

// -------------------- Display helpers --------------------

export const OPPORTUNITY_TYPE_LABELS: Record<P102OpportunityType, string> = {
  OBSERVERSHIP: "Observership",
  VISITING_MEDICAL_STUDENT: "Visiting Medical Student",
  CLINICAL_ELECTIVE: "Clinical Elective",
  SUB_INTERNSHIP: "Sub-Internship",
  AWAY_ROTATION: "Away Rotation",
  INTERNATIONAL_VISITING_STUDENT: "International Visiting Student",
  RESEARCH_OPPORTUNITY: "Research Opportunity",
  EXTERNSHIP: "Externship",
};

export const SOURCE_SCOPE_LABELS: Record<P102SourceScope, string> = {
  INSTITUTION_SPECIFIC: "Institution-specific",
  CAMPUS_SPECIFIC: "Campus-specific",
  DEPARTMENT_LEVEL: "Department-level",
  HEALTH_SYSTEM_LEVEL: "Health-system-level (with campus proof)",
  MEDICAL_SCHOOL_LEVEL: "Medical-school-level (with campus proof)",
};

export const AUDIENCE_LABELS: Record<string, string> = {
  international: "International medical students",
  "us-md-do": "US LCME / AOA medical students",
  "img-observer": "IMG physicians (observer)",
  unknown: "Audience not specified on source",
};

export function audienceLabel(audience: string | null): string {
  if (!audience) return "Audience not specified on source";
  return AUDIENCE_LABELS[audience] ?? audience;
}
