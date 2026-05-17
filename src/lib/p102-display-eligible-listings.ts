/**
 * P102 Display-Eligible Listings — local-only read-side adapter.
 *
 * Loads the seven JSON exports produced by
 *   scripts/p102-build-display-eligibility-export.ts
 * and shapes each display-eligible row into a small object that the
 * existing browse / listing UI can consume.
 *
 * Purpose:
 *   Provide a server-side filter the local preview surface can apply
 *   so only the 170 clinical-USCE rows + 9 research rows ever render
 *   as active opportunities. Hidden / outreach-hold / research-
 *   reverify / manual-browser / negative-info rows are kept out by
 *   construction.
 *
 * What this module is NOT:
 *   - Not wired to production /browse, /listing/[id], homepage, or any
 *     SEO surface.
 *   - Not a Prisma adapter — does not read or write the DB.
 *   - Not a seed integration — does not mutate listings-hidelist.ts,
 *     verified-links.ts, or data.js.
 *
 * Re-run the export builder any time verified-links.ts, listings-
 * hidelist.ts, or data.js change:
 *   npx tsx scripts/p102-classify-live-listings-per-type.ts
 *   npx tsx scripts/p102-build-display-eligibility-export.ts
 *
 * Server-only: reads filesystem JSON at module init.
 */

import { readFileSync, existsSync } from "node:fs";
import * as path from "node:path";

export type DisplayBadge =
  | "DIRECT"
  | "REORIENTED"
  | "PROTECTED"
  | "RESEARCH"
  | "HOLD"
  | "HIDDEN";

export type DisplayBucket =
  | "CLINICAL_USCE"
  | "RESEARCH"
  | "OUTREACH_HOLD"
  | "RESEARCH_REVERIFY_HOLD"
  | "MANUAL_BROWSER_HOLD"
  | "HIDDEN"
  | "ARCHIVE_NEG_INFO";

export interface DisplayEligibleRow {
  programName: string;
  institution: string;
  state: string;
  finalUrl: string;
  classification: string;
  badge: DisplayBadge;
  subType: string;
  audience: string;
  evidenceQuote: string;
  provenanceNote: string;
  verifiedFlag: boolean;
  specialtyLimited?: string;
  hideReason?: string;
  hideClassification?: string;
}

interface RawExportRow extends DisplayEligibleRow {}

const EXPORTS_DIR = path.resolve(
  process.cwd(),
  "docs/platform-v2/local/usce-discovery-command-center/p102/exports"
);

const FILE_FOR_BUCKET: Record<DisplayBucket, string> = {
  CLINICAL_USCE: "display_eligible_clinical_usce.json",
  RESEARCH: "display_eligible_research.json",
  OUTREACH_HOLD: "display_hold_outreach.json",
  RESEARCH_REVERIFY_HOLD: "display_hold_research_reverify.json",
  MANUAL_BROWSER_HOLD: "display_hold_manual_browser.json",
  HIDDEN: "display_hidden_or_removed.json",
  ARCHIVE_NEG_INFO: "display_archive_negative_info.json",
};

function loadBucket(bucket: DisplayBucket): RawExportRow[] {
  const file = path.join(EXPORTS_DIR, FILE_FOR_BUCKET[bucket]);
  if (!existsSync(file)) return [];
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    return Array.isArray(parsed) ? (parsed as RawExportRow[]) : [];
  } catch {
    return [];
  }
}

/**
 * Cache the loaded buckets per Node process. Cleared on dev hot
 * reload because the module is re-imported.
 */
let cache: Record<DisplayBucket, DisplayEligibleRow[]> | null = null;

function load(): Record<DisplayBucket, DisplayEligibleRow[]> {
  if (cache) return cache;
  cache = {
    CLINICAL_USCE: loadBucket("CLINICAL_USCE"),
    RESEARCH: loadBucket("RESEARCH"),
    OUTREACH_HOLD: loadBucket("OUTREACH_HOLD"),
    RESEARCH_REVERIFY_HOLD: loadBucket("RESEARCH_REVERIFY_HOLD"),
    MANUAL_BROWSER_HOLD: loadBucket("MANUAL_BROWSER_HOLD"),
    HIDDEN: loadBucket("HIDDEN"),
    ARCHIVE_NEG_INFO: loadBucket("ARCHIVE_NEG_INFO"),
  };
  return cache;
}

/** Reset cache (useful in tests). Production code should never call this. */
export function _resetDisplayEligibilityCache(): void {
  cache = null;
}

/** Return all rows in a single bucket. */
export function getDisplayEligibleByBucket(bucket: DisplayBucket): DisplayEligibleRow[] {
  return load()[bucket];
}

/** Return the 170 clinical USCE display-eligible rows. */
export function getDisplayEligibleClinical(): DisplayEligibleRow[] {
  return load().CLINICAL_USCE;
}

/** Return the 9 research display-eligible rows. */
export function getDisplayEligibleResearch(): DisplayEligibleRow[] {
  return load().RESEARCH;
}

/**
 * Return the program names that the browse / listing UI is allowed to
 * render as ACTIVE opportunities. Use this as an `IN` filter when
 * narrowing Prisma queries:
 *
 *   const active = getActiveDisplayProgramNames();
 *   const listings = await prisma.listing.findMany({
 *     where: { status: "APPROVED", title: { in: [...active] } }
 *   });
 */
export function getActiveDisplayProgramNames(): Set<string> {
  const b = load();
  return new Set([
    ...b.CLINICAL_USCE.map((r) => r.programName),
    ...b.RESEARCH.map((r) => r.programName),
  ]);
}

/** Names that must NEVER render as active opportunities. */
export function getNotActiveDisplayProgramNames(): Set<string> {
  const b = load();
  return new Set([
    ...b.OUTREACH_HOLD.map((r) => r.programName),
    ...b.RESEARCH_REVERIFY_HOLD.map((r) => r.programName),
    ...b.MANUAL_BROWSER_HOLD.map((r) => r.programName),
    ...b.HIDDEN.map((r) => r.programName),
    ...b.ARCHIVE_NEG_INFO.map((r) => r.programName),
  ]);
}

/** Find the display-eligible row matching a given program name (exact data.js key match). */
export function findDisplayEligibleByName(programName: string): {
  row: DisplayEligibleRow;
  bucket: DisplayBucket;
} | null {
  const b = load();
  for (const [bucket, rows] of Object.entries(b) as [DisplayBucket, DisplayEligibleRow[]][]) {
    const row = rows.find((r) => r.programName === programName);
    if (row) return { row, bucket };
  }
  return null;
}

/** Counts for a status banner / diagnostic surface. */
export function getDisplayEligibilityCounts(): Record<DisplayBucket | "TOTAL", number> {
  const b = load();
  return {
    CLINICAL_USCE: b.CLINICAL_USCE.length,
    RESEARCH: b.RESEARCH.length,
    OUTREACH_HOLD: b.OUTREACH_HOLD.length,
    RESEARCH_REVERIFY_HOLD: b.RESEARCH_REVERIFY_HOLD.length,
    MANUAL_BROWSER_HOLD: b.MANUAL_BROWSER_HOLD.length,
    HIDDEN: b.HIDDEN.length,
    ARCHIVE_NEG_INFO: b.ARCHIVE_NEG_INFO.length,
    TOTAL:
      b.CLINICAL_USCE.length +
      b.RESEARCH.length +
      b.OUTREACH_HOLD.length +
      b.RESEARCH_REVERIFY_HOLD.length +
      b.MANUAL_BROWSER_HOLD.length +
      b.HIDDEN.length +
      b.ARCHIVE_NEG_INFO.length,
  };
}

/**
 * Map a clinical USCE row into the field shape that the existing
 * UI consumes. Missing fields default to honest "Not listed on
 * source" sentinels per P102_BROWSE_LISTING_INTEGRATION_PLAN.md §6.
 */
export interface DisplayCardShape {
  title: string;
  institution: string;
  state: string;
  city: string; // unknown from the export; "Verify on official page"
  finalUrl: string;
  badge: DisplayBadge;
  classification: string;
  subType: string;
  audience: string;
  researchLane: boolean;
  cost: string;
  duration: string;
  visa: string;
  applicationMethod: string;
  eligibility: string;
  sourceQuote: string;
  reportIssueAvailable: boolean;
}

const NOT_LISTED = "Not listed on source";
const VERIFY_OFFICIAL = "Verify on official page";
const NOT_CLEAR = "Not clearly listed — check official page";
const CHECK_OFFICIAL = "Check official source";

export function toDisplayCard(row: DisplayEligibleRow): DisplayCardShape {
  const isResearch = row.badge === "RESEARCH";
  return {
    title: row.programName,
    institution: row.institution,
    state: row.state,
    city: VERIFY_OFFICIAL,
    finalUrl: row.finalUrl,
    badge: row.badge,
    classification: row.classification,
    subType: row.subType,
    audience: row.audience || "audience-unspecified",
    researchLane: isResearch,
    cost: NOT_LISTED,
    duration: NOT_CLEAR,
    visa: CHECK_OFFICIAL,
    applicationMethod: VERIFY_OFFICIAL,
    eligibility: VERIFY_OFFICIAL,
    sourceQuote: (row.evidenceQuote || "").trim(),
    reportIssueAvailable: true,
  };
}

/**
 * Convenience accessor: return ready-to-render display card shapes
 * for either the clinical USCE bucket or the research bucket.
 */
export function getDisplayCards(lane: "clinical" | "research"): DisplayCardShape[] {
  const rows = lane === "clinical" ? getDisplayEligibleClinical() : getDisplayEligibleResearch();
  return rows.map(toDisplayCard);
}

/**
 * URL-safe slug from a program name + state. Use this for the
 * `/usce/verified-preview/browse/[slug]` detail route.
 *
 * Slugs are NOT guaranteed unique across data.js rows — same-name
 * institutions (Wyckoff ×2, Hackensack ×2, etc.) collide. The detail
 * route resolves by program name and shows the first matching row;
 * the export keeps both for the list view counts.
 */
export function slugifyProgram(programName: string, state?: string): string {
  const stripped = programName
    .toLowerCase()
    .replace(/[–—]/g, "-")           // em / en dash → hyphen
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  const st = (state || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return st ? `${stripped}-${st}` : stripped;
}

/** Return a slug → DisplayEligibleRow map for the active display rows. */
export function getDisplaySlugIndex(): Map<string, DisplayEligibleRow> {
  const idx = new Map<string, DisplayEligibleRow>();
  const all = [...getDisplayEligibleClinical(), ...getDisplayEligibleResearch()];
  for (const r of all) {
    const slug = slugifyProgram(r.programName, r.state);
    if (!idx.has(slug)) idx.set(slug, r); // first wins on duplicates
  }
  return idx;
}
