/**
 * P102 Reviewer Decisions CSV — read / parse / update / write.
 *
 * Shared utility used by:
 *   - the admin click-through UI at /usce/verified-preview/admin/review
 *   - any future review tooling
 *
 * Source-of-truth file:
 *   docs/.../p102/exports/public_safe_review_decisions.csv
 *     (if missing, the top-50 starter is promoted on first write)
 *
 * Pure node:fs. No DB. No network. Server-side only — do not import
 * this module from client components.
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  copyFileSync,
} from "node:fs";
import path from "node:path";

const EXPORTS_DIR = path.resolve(
  process.cwd(),
  "docs/platform-v2/local/usce-discovery-command-center/p102/exports",
);
const CANONICAL_CSV = path.join(
  EXPORTS_DIR,
  "public_safe_review_decisions.csv",
);
const FALLBACK_CSV = path.join(
  EXPORTS_DIR,
  "public_safe_review_decisions_top50.csv",
);

export const REVIEWER_DECISIONS = [
  "KEEP_HUMAN_REVIEW",
  "APPROVE_PUBLIC_SAFE",
  "REJECT_NOT_USCE",
  "REJECT_SCOPE_MISMATCH",
  "REJECT_OFF_DOMAIN_NO_APPLICABILITY",
  "NEEDS_MORE_EVIDENCE",
  "FUTURE_LANE_ONLY",
  "DUPLICATE_OF_APPROVED_ROW",
] as const;

export type ReviewerDecision = (typeof REVIEWER_DECISIONS)[number];

export const OPPORTUNITY_TYPES = [
  "OBSERVERSHIP",
  "VISITING_MEDICAL_STUDENT",
  "CLINICAL_ELECTIVE",
  "SUB_INTERNSHIP",
  "AWAY_ROTATION",
  "INTERNATIONAL_VISITING_STUDENT",
  "RESEARCH_OPPORTUNITY",
  "EXTERNSHIP",
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const AUDIENCES = [
  "international",
  "us-md-do",
  "img-observer",
  "unknown",
] as const;

export type Audience = (typeof AUDIENCES)[number];

export interface DecisionRow {
  reviewId: string;
  sourceQueueId: string;
  runId: string;
  institutionId: string;
  institutionName: string;
  state: string;
  city: string;
  sourceUrl: string;
  sourceScope: string;
  deepSourceFamily: string;
  visibilityLane: string;
  confidence: string;
  priorityScore: string;
  priorityReasons: string;
  quote: string;
  warnings: string;
  /** Number of other queue entries from the same sourceUrl that were collapsed. */
  urlDuplicateCount: string;
  proposedOpportunityName: string;
  proposedOpportunityType: string;
  proposedAudience: string;
  proposedCampus: string;
  reviewerDecision: string;
  decisionReason: string;
  campusApplicabilityProof: string;
  approvedOpportunityRowId: string;
  duplicateOfRowId: string;
  reviewer: string;
  reviewedAt: string;
  notes: string;
}

export interface CsvFile {
  csvPath: string;
  header: string[];
  rows: DecisionRow[];
}

// -------------------- CSV parser/serializer --------------------

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuote = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === ",") {
        cells.push(cur);
        cur = "";
      } else if (ch === '"') {
        inQuote = true;
      } else {
        cur += ch;
      }
    }
  }
  cells.push(cur);
  return cells;
}

function escapeCsvCell(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// -------------------- Path resolution --------------------

/**
 * Get the active decisions CSV path. If the canonical file does not
 * exist but the top-50 fallback does, promote the fallback to canonical
 * (preserves the starter file unchanged for future re-runs of the
 * summarizer).
 */
function resolveCsvPath(): string {
  if (existsSync(CANONICAL_CSV)) return CANONICAL_CSV;
  if (existsSync(FALLBACK_CSV)) {
    copyFileSync(FALLBACK_CSV, CANONICAL_CSV);
    return CANONICAL_CSV;
  }
  throw new Error(
    `No decisions CSV found. Looked for:\n  ${CANONICAL_CSV}\n  ${FALLBACK_CSV}\nRun: npx tsx scripts/p102-summarize-review-queue.ts`,
  );
}

// -------------------- Public API --------------------

export function readDecisions(): CsvFile {
  const csvPath = resolveCsvPath();
  const text = readFileSync(csvPath, "utf8");
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error(`CSV has no rows: ${csvPath}`);
  }
  const header = splitCsvLine(lines[0]);
  const rows: DecisionRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") continue;
    const cells = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cells[j] ?? "";
    }
    rows.push(row as unknown as DecisionRow);
  }
  return { csvPath, header, rows };
}

export function getDecisionById(reviewId: string): DecisionRow | null {
  const { rows } = readDecisions();
  return rows.find((r) => r.reviewId === reviewId) ?? null;
}

export interface UpdateInput {
  reviewerDecision: ReviewerDecision;
  decisionReason: string;
  reviewer: string;
  reviewedAt: string;
  proposedOpportunityName?: string;
  proposedOpportunityType?: string;
  proposedAudience?: string;
  proposedCampus?: string;
  campusApplicabilityProof?: string;
  duplicateOfRowId?: string;
  notes?: string;
}

const UPDATABLE_KEYS = new Set<keyof DecisionRow>([
  "reviewerDecision",
  "decisionReason",
  "reviewer",
  "reviewedAt",
  "proposedOpportunityName",
  "proposedOpportunityType",
  "proposedAudience",
  "proposedCampus",
  "campusApplicabilityProof",
  "duplicateOfRowId",
  "notes",
]);

/**
 * Update one row in the canonical decisions CSV. Preserves header order
 * and every other column on every other row. Atomic: read → update →
 * write. No partial writes.
 *
 * Returns the row as it appears AFTER the update.
 */
export function updateDecision(
  reviewId: string,
  updates: UpdateInput,
): DecisionRow {
  const { csvPath, header, rows } = readDecisions();
  const idx = rows.findIndex((r) => r.reviewId === reviewId);
  if (idx < 0) {
    throw new Error(`reviewId not found: ${reviewId}`);
  }
  const row = { ...rows[idx] };
  for (const [k, v] of Object.entries(updates)) {
    if (!UPDATABLE_KEYS.has(k as keyof DecisionRow)) continue;
    (row as unknown as Record<string, string>)[k] = v ?? "";
  }
  rows[idx] = row;

  const out: string[] = [header.join(",")];
  for (const r of rows) {
    out.push(
      header
        .map((k) => escapeCsvCell((r as unknown as Record<string, unknown>)[k]))
        .join(","),
    );
  }
  writeFileSync(csvPath, out.join("\n") + "\n");
  return row;
}

// -------------------- Display helpers --------------------

export const DECISION_LABEL: Record<ReviewerDecision, string> = {
  KEEP_HUMAN_REVIEW: "Keep in review (default)",
  APPROVE_PUBLIC_SAFE: "Approve as public-safe",
  REJECT_NOT_USCE: "Reject — not a USCE offer",
  REJECT_SCOPE_MISMATCH: "Reject — scope mismatch (wrong campus)",
  REJECT_OFF_DOMAIN_NO_APPLICABILITY:
    "Reject — off-domain medschool, no applicability proof",
  NEEDS_MORE_EVIDENCE: "Defer — need more evidence",
  FUTURE_LANE_ONLY: "Downgrade — future-lane only (Tier 2/3)",
  DUPLICATE_OF_APPROVED_ROW: "Reject — duplicate of approved row",
};
