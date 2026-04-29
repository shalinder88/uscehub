/**
 * Role-aware sanitizer for `PATCH /api/organizations` request bodies.
 *
 * Per PR #32 (POSTER_FLOW_AUDIT.md §5, §8 — medium gap M1): the
 * previous PATCH handler only deleted `ownerId` and `createdAt` from
 * the body, leaving `verificationStatus`, `badges`, `adminNotes`, and
 * `institutionalEmail` (Boolean — verification signal) writable by
 * any owner. An owner could self-elevate their organization's
 * verification status or grant themselves badges.
 *
 * Symmetric with src/lib/listing-update-guard.ts:
 *   - POSTER (or any non-ADMIN owner): only content fields.
 *   - ADMIN: content fields plus verification/badges/admin fields.
 *
 * Pure function. No DB. No I/O. Tested in
 * scripts/test-organization-update-guard.ts.
 */

export type Role = "APPLICANT" | "POSTER" | "ADMIN";

export type OrganizationPatchInput = Record<string, unknown>;
export type SanitizedOrganizationPatch = Record<string, unknown>;

/**
 * Fields the org owner (non-ADMIN) may patch on their own organization.
 */
const POSTER_EDITABLE_FIELDS = [
  "name",
  "type",
  "contactName",
  "contactEmail",
  "phone",
  "website",
  "city",
  "state",
  "description",
] as const;

/**
 * Fields admins may patch in addition to owner-editable fields.
 * `institutionalEmail` (Boolean) is a verification signal admins
 * set after confirming the owner has a real institutional email.
 */
const ADMIN_ADDITIONAL_FIELDS = [
  "verificationStatus",
  "badges",
  "adminNotes",
  "institutionalEmail",
] as const;

/**
 * Fields no one may patch through this route, regardless of role.
 */
const FORBIDDEN_FIELDS = [
  "id",
  "ownerId",
  "createdAt",
  "updatedAt",
] as const;

const POSTER_ALLOWED = new Set<string>(POSTER_EDITABLE_FIELDS);
const ADMIN_ALLOWED = new Set<string>([
  ...POSTER_EDITABLE_FIELDS,
  ...ADMIN_ADDITIONAL_FIELDS,
]);
const FORBIDDEN = new Set<string>(FORBIDDEN_FIELDS);

export function sanitizeOrganizationPatchForRole(
  input: OrganizationPatchInput | null | undefined,
  role: Role,
): SanitizedOrganizationPatch {
  if (!input || typeof input !== "object") return {};

  const allowed = role === "ADMIN" ? ADMIN_ALLOWED : POSTER_ALLOWED;
  const out: SanitizedOrganizationPatch = {};

  for (const [key, value] of Object.entries(input)) {
    if (FORBIDDEN.has(key)) continue;
    if (!allowed.has(key)) continue;
    out[key] = value;
  }

  return out;
}

export function getStrippedOrganizationFields(
  input: OrganizationPatchInput | null | undefined,
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

export const _testExports = {
  POSTER_EDITABLE_FIELDS,
  ADMIN_ADDITIONAL_FIELDS,
  FORBIDDEN_FIELDS,
} as const;
