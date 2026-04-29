/**
 * Verification script for src/lib/organization-update-guard.ts.
 *
 * Per PR 0a-fix-2 (PR #32 medium gap M1): the organization PATCH route
 * must NOT allow owners (non-admin) to update verificationStatus,
 * badges, adminNotes, or institutionalEmail (Boolean verification flag).
 *
 *   npx tsx scripts/test-organization-update-guard.ts
 *
 * Exits 0 on success, 1 on the first failed assertion.
 */

import {
  sanitizeOrganizationPatchForRole,
  getStrippedOrganizationFields,
  _testExports,
  type Role,
} from "@/lib/organization-update-guard";

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

// ─── Field constant sanity ────────────────────────────────────
section("field constants");

const { POSTER_EDITABLE_FIELDS, ADMIN_ADDITIONAL_FIELDS, FORBIDDEN_FIELDS } =
  _testExports;

const adminOnlyFields = ["verificationStatus", "badges", "adminNotes", "institutionalEmail"];
for (const field of adminOnlyFields) {
  assert(
    !POSTER_EDITABLE_FIELDS.includes(field as never),
    `admin-only field "${field}" NOT in POSTER_EDITABLE_FIELDS`,
  );
  assert(
    ADMIN_ADDITIONAL_FIELDS.includes(field as never),
    `admin-only field "${field}" IS in ADMIN_ADDITIONAL_FIELDS`,
  );
}

for (const field of ["id", "ownerId", "createdAt", "updatedAt"]) {
  assert(
    FORBIDDEN_FIELDS.includes(field as never),
    `system field "${field}" IS in FORBIDDEN_FIELDS`,
  );
}

// ─── POSTER role behavior ─────────────────────────────────────
section("sanitizeOrganizationPatchForRole(input, 'POSTER')");

const malicious = {
  name: "Updated org name",
  city: "New York",
  state: "NY",
  description: "Updated description",
  verificationStatus: "APPROVED",
  badges: "verified,trusted,featured",
  adminNotes: "I deserve verification",
  institutionalEmail: true,
  ownerId: "different-user-id",
  id: "spoofed-id",
};

const sanitizedPoster = sanitizeOrganizationPatchForRole(malicious, "POSTER");

assert(
  sanitizedPoster.name === "Updated org name",
  "POSTER: name passes through",
);
assert(
  sanitizedPoster.city === "New York",
  "POSTER: city passes through",
);
assert(
  sanitizedPoster.description === "Updated description",
  "POSTER: description passes through",
);
assert(
  !("verificationStatus" in sanitizedPoster),
  "POSTER: verificationStatus STRIPPED (cannot self-elevate)",
);
assert(
  !("badges" in sanitizedPoster),
  "POSTER: badges STRIPPED (cannot grant own badges)",
);
assert(
  !("adminNotes" in sanitizedPoster),
  "POSTER: adminNotes STRIPPED",
);
assert(
  !("institutionalEmail" in sanitizedPoster),
  "POSTER: institutionalEmail (Boolean verification flag) STRIPPED",
);
assert(
  !("ownerId" in sanitizedPoster),
  "POSTER: ownerId STRIPPED (cannot reassign ownership)",
);
assert(
  !("id" in sanitizedPoster),
  "POSTER: id STRIPPED",
);

// ─── ADMIN role behavior ──────────────────────────────────────
section("sanitizeOrganizationPatchForRole(input, 'ADMIN')");

const adminPatch = {
  name: "Admin-corrected name",
  verificationStatus: "APPROVED",
  badges: "verified",
  adminNotes: "Approved after review",
  institutionalEmail: true,
  ownerId: "should-be-stripped",
  id: "should-be-stripped",
};

const sanitizedAdmin = sanitizeOrganizationPatchForRole(adminPatch, "ADMIN");

assert(
  sanitizedAdmin.name === "Admin-corrected name",
  "ADMIN: name passes through",
);
assert(
  sanitizedAdmin.verificationStatus === "APPROVED",
  "ADMIN: verificationStatus passes through (admin can verify)",
);
assert(
  sanitizedAdmin.badges === "verified",
  "ADMIN: badges passes through",
);
assert(
  sanitizedAdmin.adminNotes === "Approved after review",
  "ADMIN: adminNotes passes through",
);
assert(
  sanitizedAdmin.institutionalEmail === true,
  "ADMIN: institutionalEmail (Boolean) passes through",
);
assert(
  !("ownerId" in sanitizedAdmin),
  "ADMIN: ownerId STRIPPED (forbidden for admin too)",
);
assert(
  !("id" in sanitizedAdmin),
  "ADMIN: id STRIPPED (forbidden for admin too)",
);

// ─── Edge cases ───────────────────────────────────────────────
section("edge cases");

assert(
  Object.keys(sanitizeOrganizationPatchForRole(null, "POSTER")).length === 0,
  "null -> empty",
);
assert(
  Object.keys(sanitizeOrganizationPatchForRole(undefined, "POSTER")).length === 0,
  "undefined -> empty",
);
assert(
  Object.keys(sanitizeOrganizationPatchForRole({}, "POSTER")).length === 0,
  "empty -> empty",
);
assert(
  Object.keys(sanitizeOrganizationPatchForRole({ unknownField: "x" }, "POSTER"))
    .length === 0,
  "unknown field DROPPED",
);

// ─── getStrippedOrganizationFields ────────────────────────────
section("getStrippedOrganizationFields");

const stripped = getStrippedOrganizationFields(malicious, "POSTER");
assert(
  stripped.includes("verificationStatus"),
  "stripped INCLUDES verificationStatus",
);
assert(
  stripped.includes("badges"),
  "stripped INCLUDES badges",
);
assert(
  stripped.includes("ownerId"),
  "stripped INCLUDES ownerId",
);
assert(
  !stripped.includes("name"),
  "stripped does NOT include name (allowed)",
);

// ─── Summary ──────────────────────────────────────────────────
console.log("");
if (failed > 0) {
  console.error(`✗ ${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("✓ All assertions passed.");
process.exit(0);
