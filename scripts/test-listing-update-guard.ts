/**
 * Verification script for src/lib/listing-update-guard.ts.
 *
 * Per PR 0a-fix-1 (PR #32 critical gap C1): the listing PATCH route
 * must NOT allow poster users to update trust/moderation/admin fields
 * (status, linkVerificationStatus, featured, adminNotes, etc.).
 *
 * Runs without a test framework — invoke manually:
 *
 *   npx tsx scripts/test-listing-update-guard.ts
 *
 * Exits 0 on success, 1 on the first failed assertion.
 */

import {
  sanitizeListingPatchForRole,
  getStrippedListingFields,
  _testExports,
  type Role,
} from "@/lib/listing-update-guard";

let failed = 0;

function assert(condition: unknown, label: string): void {
  if (condition) {
    console.log(`  ok  ${label}`);
  } else {
    console.error(`  FAIL ${label}`);
    failed++;
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

// ─── Field constant sanity checks ─────────────────────────────
section("field constants");

const { POSTER_EDITABLE_FIELDS, ADMIN_ADDITIONAL_FIELDS, FORBIDDEN_FIELDS } =
  _testExports;

assert(
  Array.isArray(POSTER_EDITABLE_FIELDS) && POSTER_EDITABLE_FIELDS.length > 0,
  "POSTER_EDITABLE_FIELDS exists and is non-empty",
);
assert(
  Array.isArray(ADMIN_ADDITIONAL_FIELDS) && ADMIN_ADDITIONAL_FIELDS.length > 0,
  "ADMIN_ADDITIONAL_FIELDS exists and is non-empty",
);
assert(
  Array.isArray(FORBIDDEN_FIELDS) && FORBIDDEN_FIELDS.length > 0,
  "FORBIDDEN_FIELDS exists and is non-empty",
);

// Critical-gap fields must be in admin-only list, not poster-editable
const criticalAdminFields = [
  "status",
  "linkVerificationStatus",
  "linkVerified",
  "lastVerifiedAt",
  "lastVerificationAttemptAt",
  "verificationFailureReason",
  "featured",
  "adminNotes",
  "sourceUrl",
];
for (const field of criticalAdminFields) {
  assert(
    !POSTER_EDITABLE_FIELDS.includes(field as never),
    `critical field "${field}" NOT in POSTER_EDITABLE_FIELDS`,
  );
  assert(
    ADMIN_ADDITIONAL_FIELDS.includes(field as never),
    `critical field "${field}" IS in ADMIN_ADDITIONAL_FIELDS`,
  );
}

// Forbidden fields must be in FORBIDDEN list
for (const field of ["id", "posterId", "createdAt", "updatedAt", "views"]) {
  assert(
    FORBIDDEN_FIELDS.includes(field as never),
    `system field "${field}" IS in FORBIDDEN_FIELDS`,
  );
}

// ─── POSTER role behavior ─────────────────────────────────────
section("sanitizeListingPatchForRole(input, 'POSTER')");

const malicious = {
  title: "Updated title",
  shortDescription: "Updated description",
  status: "APPROVED",
  linkVerificationStatus: "VERIFIED",
  linkVerified: true,
  lastVerifiedAt: new Date("2026-01-01"),
  featured: true,
  adminNotes: "Self-noted as great",
  sourceUrl: "https://malicious.example.com",
  posterId: "different-user-id",
  id: "spoofed-id",
};

const sanitizedPoster = sanitizeListingPatchForRole(malicious, "POSTER");

assert(
  sanitizedPoster.title === "Updated title",
  "POSTER: title passes through",
);
assert(
  sanitizedPoster.shortDescription === "Updated description",
  "POSTER: shortDescription passes through",
);
assert(
  !("status" in sanitizedPoster),
  "POSTER: status STRIPPED (cannot self-promote PENDING -> APPROVED)",
);
assert(
  !("linkVerificationStatus" in sanitizedPoster),
  "POSTER: linkVerificationStatus STRIPPED (cannot self-set VERIFIED)",
);
assert(
  !("linkVerified" in sanitizedPoster),
  "POSTER: linkVerified STRIPPED (legacy boolean cannot be self-set)",
);
assert(
  !("lastVerifiedAt" in sanitizedPoster),
  "POSTER: lastVerifiedAt STRIPPED",
);
assert(
  !("featured" in sanitizedPoster),
  "POSTER: featured STRIPPED (cannot self-feature)",
);
assert(
  !("adminNotes" in sanitizedPoster),
  "POSTER: adminNotes STRIPPED",
);
assert(
  !("sourceUrl" in sanitizedPoster),
  "POSTER: sourceUrl STRIPPED (admin-only per fix-1 scope)",
);
assert(
  !("posterId" in sanitizedPoster),
  "POSTER: posterId STRIPPED (cannot reassign listing)",
);
assert(
  !("id" in sanitizedPoster),
  "POSTER: id STRIPPED",
);

// ─── ADMIN role behavior ──────────────────────────────────────
section("sanitizeListingPatchForRole(input, 'ADMIN')");

const adminPatch = {
  title: "Admin-corrected title",
  status: "APPROVED",
  linkVerificationStatus: "VERIFIED",
  featured: true,
  adminNotes: "Approved after review",
  sourceUrl: "https://corrected.example.com",
  posterId: "should-be-stripped",
  id: "should-be-stripped",
  updatedAt: new Date(),
};

const sanitizedAdmin = sanitizeListingPatchForRole(adminPatch, "ADMIN");

assert(
  sanitizedAdmin.title === "Admin-corrected title",
  "ADMIN: title passes through",
);
assert(
  sanitizedAdmin.status === "APPROVED",
  "ADMIN: status passes through (admin can moderate)",
);
assert(
  sanitizedAdmin.linkVerificationStatus === "VERIFIED",
  "ADMIN: linkVerificationStatus passes through",
);
assert(
  sanitizedAdmin.featured === true,
  "ADMIN: featured passes through",
);
assert(
  sanitizedAdmin.adminNotes === "Approved after review",
  "ADMIN: adminNotes passes through",
);
assert(
  sanitizedAdmin.sourceUrl === "https://corrected.example.com",
  "ADMIN: sourceUrl passes through",
);
assert(
  !("posterId" in sanitizedAdmin),
  "ADMIN: posterId STRIPPED (forbidden even for admin)",
);
assert(
  !("id" in sanitizedAdmin),
  "ADMIN: id STRIPPED (forbidden even for admin)",
);
assert(
  !("updatedAt" in sanitizedAdmin),
  "ADMIN: updatedAt STRIPPED (system-managed)",
);

// ─── APPLICANT role behavior (treated as non-admin) ───────────
section("sanitizeListingPatchForRole(input, 'APPLICANT')");

const applicantPatch = sanitizeListingPatchForRole(malicious, "APPLICANT");

assert(
  applicantPatch.title === "Updated title",
  "APPLICANT: title passes through (route still gates access; this fn is content filter)",
);
assert(
  !("status" in applicantPatch),
  "APPLICANT: status STRIPPED (same as POSTER)",
);
assert(
  !("featured" in applicantPatch),
  "APPLICANT: featured STRIPPED",
);

// ─── Edge cases ───────────────────────────────────────────────
section("edge cases");

assert(
  Object.keys(sanitizeListingPatchForRole(null, "POSTER")).length === 0,
  "null input -> empty object",
);
assert(
  Object.keys(sanitizeListingPatchForRole(undefined, "POSTER")).length === 0,
  "undefined input -> empty object",
);
assert(
  Object.keys(sanitizeListingPatchForRole({}, "POSTER")).length === 0,
  "empty object -> empty object",
);
assert(
  Object.keys(sanitizeListingPatchForRole({ unknownField: "x" }, "POSTER"))
    .length === 0,
  "unknown field DROPPED silently",
);

// ─── getStrippedListingFields ─────────────────────────────────
section("getStrippedListingFields");

const stripped = getStrippedListingFields(malicious, "POSTER");
assert(
  stripped.includes("status"),
  "stripped list INCLUDES status",
);
assert(
  stripped.includes("featured"),
  "stripped list INCLUDES featured",
);
assert(
  stripped.includes("posterId"),
  "stripped list INCLUDES posterId",
);
assert(
  !stripped.includes("title"),
  "stripped list does NOT include title (allowed)",
);
assert(
  !stripped.includes("shortDescription"),
  "stripped list does NOT include shortDescription (allowed)",
);

// ─── Role default for missing role (defensive) ────────────────
section("role coercion (defensive)");

// If role is somehow missing/undefined, treat as non-admin (POSTER-equivalent)
// In the route handler, we coerce session.user.role ?? "APPLICANT" before passing.
const undefinedRolePatch = sanitizeListingPatchForRole(malicious, "APPLICANT");
assert(
  !("status" in undefinedRolePatch),
  "missing/applicant role: status STRIPPED (fail-closed default)",
);

// ─── Summary ──────────────────────────────────────────────────
console.log("");
if (failed > 0) {
  console.error(`✗ ${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("✓ All assertions passed.");
process.exit(0);
