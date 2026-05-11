/**
 * P99-P97 Contact Report Context — client/server-safe resolver
 *
 * Reads reserved query params arriving at /contact:
 *   - listing_id    → must match LISTING_ID_REGEX and resolve to a known card
 *   - ref           → must be in ALLOWED_REPORT_REFS
 *   - runtime_source → optional, sanitized
 *   - evidence_join_key → optional, sanitized; never displayed to the user
 *   - page_path     → optional, sanitized; never displayed
 *
 * Returns a structured context object. Never throws on bad params.
 *
 * KNOWN_LISTINGS is a hand-maintained, public-safe summary of the 14 staged
 * cards (5 active + 2 prior staged + 7 batch-3 new). It contains only
 * institution_name + city + state + runtime_set — NOT the full runtime card
 * data and NOT any evidence path. This module is intentionally not a
 * back-channel for the staged data file under src/data/usce/; the
 * per-batch-3 validator's import-safety grep continues to pass.
 */

export const ALLOWED_REPORT_REFS = [
  "pilot-listing",
  "pilot-feedback",
  "pilot-source-link-broken",
  "pilot-eligibility",
  "pilot-visa",
  "pilot-cost",
  "pilot-application",
  "pilot-program-closed",
  "pilot-duplicate",
  "pilot-other",
] as const;

export type ContactReportRef = (typeof ALLOWED_REPORT_REFS)[number];

export const ALLOWED_RUNTIME_SETS = [
  "active",
  "staged",
  "bridge_draft",
  "maine",
  "unknown",
] as const;

export type ContactRuntimeSet = (typeof ALLOWED_RUNTIME_SETS)[number];

const LISTING_ID_REGEX = /^pilot-\d{3}-[A-Z]{2}-[a-z0-9-]+$/;
const SAFE_TOKEN_REGEX = /^[A-Za-z0-9_\-./]+$/;
const MAX_LISTING_ID_LEN = 96;
const MAX_REF_LEN = 64;
const MAX_RUNTIME_SOURCE_LEN = 96;
const MAX_EVIDENCE_KEY_LEN = 96;
const MAX_PAGE_PATH_LEN = 256;

export interface KnownListing {
  listingId: string;
  institutionName: string;
  city: string;
  state: string;
  runtimeSet: ContactRuntimeSet;
}

export const KNOWN_LISTINGS: KnownListing[] = [
  // Active 5
  { listingId: "pilot-001-NJ-morristown-medical-center", institutionName: "Morristown Medical Center", city: "Morristown", state: "NJ", runtimeSet: "active" },
  { listingId: "pilot-002-NJ-overlook-medical-center", institutionName: "Overlook Medical Center", city: "Summit", state: "NJ", runtimeSet: "active" },
  { listingId: "pilot-003-OH-cleveland-clinic-mercy-hospital", institutionName: "Cleveland Clinic Mercy Hospital", city: "Canton", state: "OH", runtimeSet: "active" },
  { listingId: "pilot-004-OH-cleveland-clinic-hillcrest-hospital", institutionName: "Cleveland Clinic Hillcrest Hospital", city: "Mayfield Heights", state: "OH", runtimeSet: "active" },
  { listingId: "pilot-007-CA-highland-hospital-alameda-health-system", institutionName: "Highland Hospital (Alameda Health System)", city: "Oakland", state: "CA", runtimeSet: "active" },
  // Prior staged 2
  { listingId: "pilot-011-PA-upmc-western-psychiatric-hospital", institutionName: "UPMC Western Psychiatric Hospital", city: "Pittsburgh", state: "PA", runtimeSet: "staged" },
  { listingId: "pilot-012-NY-nyc-health-hospitals-lincoln", institutionName: "NYC Health + Hospitals/Lincoln", city: "Bronx", state: "NY", runtimeSet: "staged" },
  // Batch 3 — activated in noindex slice 1 (Duke / NYU Tisch / IU Methodist)
  { listingId: "pilot-014-NC-duke-university-hospital", institutionName: "Duke University Hospital", city: "Durham", state: "NC", runtimeSet: "active" },
  { listingId: "pilot-017-NY-nyu-langone-tisch-hospital", institutionName: "NYU Langone Health - Tisch Hospital", city: "New York", state: "NY", runtimeSet: "active" },
  { listingId: "pilot-019-IN-iu-health-methodist-hospital", institutionName: "Indiana University Health Methodist Hospital", city: "Indianapolis", state: "IN", runtimeSet: "active" },
  // Batch 3 — activated in noindex slice 2 (HUP / Northwestern)
  { listingId: "pilot-016-PA-hospital-of-the-university-of-pennsylvania", institutionName: "Hospital of the University of Pennsylvania", city: "Philadelphia", state: "PA", runtimeSet: "active" },
  { listingId: "pilot-015-IL-northwestern-memorial-hospital", institutionName: "Northwestern Memorial Hospital", city: "Chicago", state: "IL", runtimeSet: "active" },
  // Batch 3 — staged-only (audit-deferred; not yet in active runtime)
  { listingId: "pilot-013-FL-jackson-memorial-hospital", institutionName: "Jackson Memorial Hospital", city: "Miami", state: "FL", runtimeSet: "staged" },
  { listingId: "pilot-018-TX-methodist-hospital-san-antonio", institutionName: "Methodist Hospital (San Antonio)", city: "San Antonio", state: "TX", runtimeSet: "staged" },
  // Batch 4 — staged-only (Queue 4 Session 1 bridge-validated; pending mapping + audit + activation)
  { listingId: "pilot-020-TN-vanderbilt-university-medical-center", institutionName: "Vanderbilt University Medical Center", city: "Nashville", state: "TN", runtimeSet: "staged" },
  { listingId: "pilot-021-CA-ucsf-medical-center", institutionName: "UCSF Medical Center", city: "San Francisco", state: "CA", runtimeSet: "staged" },
];

const KNOWN_LISTINGS_BY_ID = new Map(KNOWN_LISTINGS.map((l) => [l.listingId, l]));

export type ContextStatus =
  | "VALID_LISTING_CONTEXT"
  | "GENERIC_FEEDBACK_NO_LISTING"
  | "INVALID_PARAMS_FALLBACK_GENERIC";

export interface ResolvedContactContext {
  status: ContextStatus;
  listingId: string | null;
  reportRef: ContactReportRef | null;
  runtimeSet: ContactRuntimeSet | null;
  displayInstitutionName: string | null;
  displayCityState: string | null;
  evidenceJoinKey: string | null;
  pagePath: string | null;
  warnings: string[];
}

type SearchParamsLike =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function pickFirst(
  params: SearchParamsLike,
  key: string
): string | undefined {
  if (params instanceof URLSearchParams) {
    const v = params.get(key);
    return v === null ? undefined : v;
  }
  const v = params[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

function sanitizeToken(value: string | undefined, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLen) return null;
  if (!SAFE_TOKEN_REGEX.test(trimmed)) return null;
  return trimmed;
}

function sanitizePagePath(value: string | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > MAX_PAGE_PATH_LEN) return null;
  if (!trimmed.startsWith("/")) return null;
  if (/[<>"`'\\]/.test(trimmed)) return null;
  return trimmed;
}

export function resolveContactContext(
  params: SearchParamsLike
): ResolvedContactContext {
  const warnings: string[] = [];

  const rawListingId = pickFirst(params, "listing_id");
  const rawRef = pickFirst(params, "ref");
  const rawRuntimeSource = pickFirst(params, "runtime_source");
  const rawEvidenceKey = pickFirst(params, "evidence_join_key");
  const rawPagePath = pickFirst(params, "page_path");

  // Empty/no params → generic contact form, no warning.
  if (!rawListingId && !rawRef && !rawRuntimeSource && !rawEvidenceKey && !rawPagePath) {
    return {
      status: "GENERIC_FEEDBACK_NO_LISTING",
      listingId: null,
      reportRef: null,
      runtimeSet: null,
      displayInstitutionName: null,
      displayCityState: null,
      evidenceJoinKey: null,
      pagePath: null,
      warnings: [],
    };
  }

  const listingId = sanitizeToken(rawListingId, MAX_LISTING_ID_LEN);
  const ref = sanitizeToken(rawRef, MAX_REF_LEN);
  const runtimeSourceToken = sanitizeToken(rawRuntimeSource, MAX_RUNTIME_SOURCE_LEN);
  const evidenceKey = sanitizeToken(rawEvidenceKey, MAX_EVIDENCE_KEY_LEN);
  const pagePath = sanitizePagePath(rawPagePath);

  const refIsAllowed =
    ref !== null && (ALLOWED_REPORT_REFS as readonly string[]).includes(ref);

  // Pure feedback ref (no listing required)
  if (refIsAllowed && ref === "pilot-feedback" && !listingId) {
    return {
      status: "GENERIC_FEEDBACK_NO_LISTING",
      listingId: null,
      reportRef: "pilot-feedback",
      runtimeSet: null,
      displayInstitutionName: null,
      displayCityState: null,
      evidenceJoinKey: null,
      pagePath,
      warnings: [],
    };
  }

  // Listing-specific ref requires a valid known listing_id
  if (!listingId || !LISTING_ID_REGEX.test(listingId)) {
    if (rawListingId) warnings.push("UNKNOWN_LISTING_ID_IGNORED");
    if (rawRef && !refIsAllowed) warnings.push("UNKNOWN_REF_IGNORED");
    return {
      status: "INVALID_PARAMS_FALLBACK_GENERIC",
      listingId: null,
      reportRef: null,
      runtimeSet: null,
      displayInstitutionName: null,
      displayCityState: null,
      evidenceJoinKey: null,
      pagePath,
      warnings,
    };
  }

  const known = KNOWN_LISTINGS_BY_ID.get(listingId);
  if (!known) {
    warnings.push("UNKNOWN_LISTING_ID_IGNORED");
    return {
      status: "INVALID_PARAMS_FALLBACK_GENERIC",
      listingId: null,
      reportRef: null,
      runtimeSet: null,
      displayInstitutionName: null,
      displayCityState: null,
      evidenceJoinKey: null,
      pagePath,
      warnings,
    };
  }

  const finalRef: ContactReportRef = refIsAllowed
    ? (ref as ContactReportRef)
    : "pilot-listing";

  if (rawRef && !refIsAllowed) warnings.push("UNKNOWN_REF_DEFAULTED_TO_PILOT_LISTING");

  // runtime_source from URL is informational only; the canonical runtimeSet
  // comes from the known listing.
  if (runtimeSourceToken && runtimeSourceToken.length > 0) {
    // recorded but does not override
  }

  return {
    status: "VALID_LISTING_CONTEXT",
    listingId: known.listingId,
    reportRef: finalRef,
    runtimeSet: known.runtimeSet,
    displayInstitutionName: known.institutionName,
    displayCityState: `${known.city}, ${known.state}`,
    evidenceJoinKey: evidenceKey ?? known.listingId,
    pagePath,
    warnings,
  };
}
