/**
 * Analytics safety regression tests.
 *
 * Verifies that:
 *  - the event taxonomy contains the expected names
 *  - safe primitive properties pass through unchanged
 *  - null / undefined are dropped silently
 *  - forbidden PII / sensitive keys are blocked
 *  - object / array values are rejected
 *  - explicitly-allowed keys (listingId, verificationStatus) survive
 *
 * Run via: `npx tsx scripts/test-analytics-safety.ts`
 *
 * Same hands-on test pattern as scripts/test-cleanup-helpers.ts and
 * scripts/test-env-safety.ts — no external test framework.
 */

import {
  ANALYTICS_EVENTS,
  sanitizeAnalyticsProperties,
} from "@/lib/analytics";

let failed = 0;

function assert(cond: boolean, label: string): void {
  if (!cond) {
    failed++;
    console.log(`  FAIL  ${label}`);
  } else {
    console.log(`  ok    ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

// Suppresses console.warn during tests that intentionally trigger warnings.
function withSilencedWarnings<T>(fn: () => T): T {
  const original = console.warn;
  console.warn = () => {};
  try {
    return fn();
  } finally {
    console.warn = original;
  }
}

// ─── 1. Taxonomy completeness ─────────────────────────────────────────────
section("ANALYTICS_EVENTS taxonomy includes the expected event names");
{
  const expected = [
    "listing_view",
    "source_click",
    "cta_click",
    "broken_link_report",
    "verification_badge_seen",
    "browse_filter_used",
    "search_submitted",
    "state_page_view",
    "specialty_page_view",
  ];
  const actual = Object.values(ANALYTICS_EVENTS) as string[];
  for (const name of expected) {
    assert(actual.includes(name), `event "${name}" present`);
  }
  // Defensive: confirm no event name has a leading/trailing space or uppercase
  for (const name of actual) {
    assert(name === name.trim(), `event "${name}" has no leading/trailing whitespace`);
    assert(name === name.toLowerCase(), `event "${name}" is lowercase`);
  }
}

// ─── 2. Safe primitives pass through ──────────────────────────────────────
section("sanitizeAnalyticsProperties: safe primitives pass through");
{
  const out = sanitizeAnalyticsProperties({
    listingId: "cmo3384zl000l1ny9lhsjj0ib",
    verificationStatus: "verified",
    listingType: "OBSERVERSHIP",
    state: "CA",
    activeFilters: 2,
    isVerified: true,
  });
  assert(out.listingId === "cmo3384zl000l1ny9lhsjj0ib", "listingId preserved");
  assert(out.verificationStatus === "verified", "verificationStatus preserved");
  assert(out.listingType === "OBSERVERSHIP", "listingType preserved");
  assert(out.state === "CA", "state code preserved");
  assert(out.activeFilters === 2, "numeric value preserved");
  assert(out.isVerified === true, "boolean value preserved");
  assert(Object.keys(out).length === 6, "no extra keys introduced");
}

// ─── 3. null / undefined dropped silently ─────────────────────────────────
section("sanitizeAnalyticsProperties: null/undefined dropped");
{
  const out = sanitizeAnalyticsProperties({
    listingId: "abc",
    optional: null,
    other: undefined,
  });
  assert(!("optional" in out), "null dropped");
  assert(!("other" in out), "undefined dropped");
  assert(out.listingId === "abc", "siblings preserved");
}

// ─── 4. Forbidden PII keys are blocked ────────────────────────────────────
section("sanitizeAnalyticsProperties: forbidden PII / sensitive keys blocked");
{
  withSilencedWarnings(() => {
    const forbiddenKeys = [
      "email",
      "userEmail",
      "user_email",
      "EMAIL",
      "name",
      "fullName",
      "first_name",
      "phone",
      "phoneNumber",
      "ip",
      "ipAddress",
      "userAgent",
      "ua",
      "message",
      "comment",
      "notes",
      "freeText",
      "visaStatus",
      "visa_status",
      "immigrationStatus",
      "ssn",
      "diagnosis",
      "medical",
    ];
    for (const k of forbiddenKeys) {
      const out = sanitizeAnalyticsProperties({ [k]: "leak", listingId: "ok" });
      assert(!(k in out), `forbidden key "${k}" dropped`);
      assert(out.listingId === "ok", `siblings of "${k}" preserved`);
    }
  });
}

// ─── 5. Object / array values are rejected ────────────────────────────────
section("sanitizeAnalyticsProperties: object/array values rejected");
{
  withSilencedWarnings(() => {
    const out = sanitizeAnalyticsProperties({
      listingId: "ok",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bag: { nested: "value" } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      list: [1, 2, 3] as any,
    });
    assert(!("bag" in out), "object value dropped");
    assert(!("list" in out), "array value dropped");
    assert(out.listingId === "ok", "siblings preserved");
  });
}

// ─── 6. Explicitly-allowed keys survive ───────────────────────────────────
section("sanitizeAnalyticsProperties: explicitly-allowed identifiers survive");
{
  const out = sanitizeAnalyticsProperties({
    listingId: "cmo3384zl000l1ny9lhsjj0ib",
    verificationStatus: "verified",
  });
  assert(
    typeof out.listingId === "string" && (out.listingId as string).length > 0,
    "listingId persisted",
  );
  assert(out.verificationStatus === "verified", "verificationStatus persisted");
}

// ─── 7. Empty input handled cleanly ───────────────────────────────────────
section("sanitizeAnalyticsProperties: empty input returns empty object");
{
  const outNoArg = sanitizeAnalyticsProperties();
  const outEmpty = sanitizeAnalyticsProperties({});
  assert(Object.keys(outNoArg).length === 0, "no-arg call returns empty");
  assert(Object.keys(outEmpty).length === 0, "empty object returns empty");
}

// ─── result ───────────────────────────────────────────────────────────────
console.log(
  `\n${failed === 0 ? "ALL CHECKS PASSED" : `FAILED: ${failed} assertion(s) failed`}`,
);
process.exit(failed === 0 ? 0 : 1);
