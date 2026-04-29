/**
 * Role-aware sanitizer for `PATCH /api/listings/[id]` request bodies.
 *
 * Per PR #32 (POSTER_FLOW_AUDIT.md §5, §8 — critical gaps C1, C2, C3):
 * the previous PATCH handler used a broad spread (`...updateData`) that
 * stripped only `id`, `posterId`, `createdAt`, and `views`. That left
 * trust/moderation/admin fields (status, linkVerificationStatus,
 * linkVerified, lastVerifiedAt, featured, adminNotes, etc.) writable
 * by any listing owner — letting a poster self-promote a PENDING
 * listing to APPROVED, set false trust badges, or self-feature.
 *
 * This helper enforces an explicit allowlist per role:
 *   - POSTER (or any non-ADMIN authenticated listing owner): only
 *     content fields the poster legitimately controls.
 *   - ADMIN: content fields plus moderation / trust / admin fields.
 *
 * Unknown fields are silently dropped (defense-in-depth against
 * future schema additions accidentally becoming poster-writable).
 *
 * Pure function. No DB access. No I/O. Tested in
 * scripts/test-listing-update-guard.ts.
 */

export type Role = "APPLICANT" | "POSTER" | "ADMIN";

export type ListingPatchInput = Record<string, unknown>;
export type SanitizedListingPatch = Record<string, unknown>;

/**
 * Fields posters may patch on a listing they own. Strict allowlist —
 * everything outside this set is admin-only or system-only.
 */
const POSTER_EDITABLE_FIELDS = [
  "title",
  "listingType",
  "specialty",
  "city",
  "state",
  "country",
  "format",
  "shortDescription",
  "fullDescription",
  "duration",
  "cost",
  "applicationMethod",
  "contactEmail",
  "eligibilitySummary",
  "startDate",
  "applicationDeadline",
  "certificateOffered",
  "lorPossible",
  "visaSupport",
  "housingSupport",
  "websiteUrl",
  "applicationUrl",
  "numberOfSpots",
  "supervisingPhysician",
  "graduationYearPref",
  "stepRequirements",
  "ecfmgRequired",
  "logoUrl",
] as const;

/**
 * Fields admins may patch in addition to poster-editable fields.
 * Trust / moderation / curation fields belong here.
 *
 * Note: `sourceUrl` is admin-only here — if a poster needs to update
 * the program URL, they go through admin. A future PR may allow
 * poster-side sourceUrl edits with auto-reset of linkVerificationStatus,
 * but that's out of scope for this fix.
 */
const ADMIN_ADDITIONAL_FIELDS = [
  "status",
  "linkVerified",
  "linkVerificationStatus",
  "lastVerifiedAt",
  "lastVerificationAttemptAt",
  "verificationFailureReason",
  "sourceUrl",
  "adminNotes",
  "featured",
  "audienceTag",
  "usmleTier",
  "organizationId",
] as const;

/**
 * Fields no one may patch through this route, regardless of role.
 * System-managed (id, posterId, timestamps, views).
 */
const FORBIDDEN_FIELDS = [
  "id",
  "posterId",
  "createdAt",
  "updatedAt",
  "views",
] as const;

const POSTER_ALLOWED = new Set<string>(POSTER_EDITABLE_FIELDS);
const ADMIN_ALLOWED = new Set<string>([
  ...POSTER_EDITABLE_FIELDS,
  ...ADMIN_ADDITIONAL_FIELDS,
]);
const FORBIDDEN = new Set<string>(FORBIDDEN_FIELDS);

/**
 * Sanitize a listing-patch input by role.
 *
 * - Returns an object containing only allowed fields.
 * - FORBIDDEN_FIELDS are always stripped.
 * - For non-ADMIN roles, only POSTER_EDITABLE_FIELDS pass through.
 * - For ADMIN role, POSTER_EDITABLE_FIELDS + ADMIN_ADDITIONAL_FIELDS
 *   pass through.
 * - Unknown / unrecognized fields are silently dropped.
 */
export function sanitizeListingPatchForRole(
  input: ListingPatchInput | null | undefined,
  role: Role,
): SanitizedListingPatch {
  if (!input || typeof input !== "object") return {};

  const allowed = role === "ADMIN" ? ADMIN_ALLOWED : POSTER_ALLOWED;
  const out: SanitizedListingPatch = {};

  for (const [key, value] of Object.entries(input)) {
    if (FORBIDDEN.has(key)) continue;
    if (!allowed.has(key)) continue;
    out[key] = value;
  }

  return out;
}

/**
 * Returns the list of input keys that were stripped (forbidden or
 * not-allowed for the role). Useful for log/audit when a poster
 * attempts to patch a restricted field.
 */
export function getStrippedListingFields(
  input: ListingPatchInput | null | undefined,
  role: Role,
): string[] {
  if (!input || typeof input !== "object") return [];

  const allowed = role === "ADMIN" ? ADMIN_ALLOWED : POSTER_ALLOWED;
  const stripped: string[] = [];

  for (const key of Object.keys(input)) {
    if (FORBIDDEN.has(key) || !allowed.has(key)) {
      stripped.push(key);
    }
  }

  return stripped;
}

/**
 * Exported for tests. Field constants mirrored as readonly arrays
 * so test scripts can assert membership without importing Prisma types.
 */
export const _testExports = {
  POSTER_EDITABLE_FIELDS,
  ADMIN_ADDITIONAL_FIELDS,
  FORBIDDEN_FIELDS,
} as const;
