/**
 * Minimal verification script for the cleanup PR1 helpers.
 *
 * Runs without a test framework — there is no Vitest/Jest in this
 * repo (audit P1-11). Until a framework lands, this script is
 * invoked manually:
 *
 *   npx tsx scripts/test-cleanup-helpers.ts
 *
 * Exits 0 on success, 1 on the first failed assertion.
 */

import { SITE_METRICS, SITE_METRICS_DISPLAY } from "@/lib/site-metrics";
import { SITE_URL, siteUrl } from "@/lib/site-config";
import { decideListingCta, ctaCaption } from "@/lib/listing-cta";
import {
  listingDisplay,
  listingVerificationStatus,
} from "@/lib/listing-display";

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

// ─── site-metrics ─────────────────────────────────────────────
section("site-metrics");
assert(SITE_METRICS.opportunitiesIndexed === 304, "opportunitiesIndexed = 304");
assert(SITE_METRICS.activeVerifiedListings === 207, "activeVerifiedListings = 207");
assert(SITE_METRICS.statesCovered === 37, "statesCovered = 37");
assert(typeof SITE_METRICS.lastUpdatedLabel === "string", "lastUpdatedLabel is a string");
assert(
  SITE_METRICS_DISPLAY.opportunitiesIndexed.includes("304"),
  "display.opportunitiesIndexed contains 304",
);
assert(
  SITE_METRICS_DISPLAY.statesCovered.includes("37"),
  "display.statesCovered contains 37",
);

// ─── site-config ──────────────────────────────────────────────
section("site-config");
assert(SITE_URL === "https://uscehub.com", "SITE_URL = https://uscehub.com (no www)");
assert(siteUrl("/browse") === "https://uscehub.com/browse", "siteUrl('/browse') joins correctly");
assert(siteUrl("listing/abc") === "https://uscehub.com/listing/abc", "siteUrl prepends '/' when missing");
assert(siteUrl() === "https://uscehub.com/", "siteUrl() defaults to root");

// ─── listing-cta — verified path ─────────────────────────────
section("listing-cta: verified path");
{
  const d = decideListingCta({
    websiteUrl: "https://example.org/apply",
    linkVerified: true,
    listingType: "OBSERVERSHIP",
  });
  assert(d.label === "Apply Now", "verified -> 'Apply Now'");
  assert(d.variant === "verified", "verified -> variant 'verified'");
  assert(d.href === "https://example.org/apply", "verified -> href set");
  assert(d.external === true, "verified -> external true");
}

// ─── listing-cta — unverified URL is NOT 'Apply Now' ─────────
section("listing-cta: unverified URL must NOT show 'Apply Now'");
{
  const d = decideListingCta({
    websiteUrl: "https://example.org/maybe",
    linkVerified: false,
    listingType: "OBSERVERSHIP",
  });
  assert(d.label !== "Apply Now", "unverified !== 'Apply Now'");
  assert(d.label === "View Official Source", "unverified -> 'View Official Source'");
  assert(d.variant === "official-source", "unverified -> variant 'official-source'");
}

// ─── listing-cta — unknown (null) verification ───────────────
section("listing-cta: unknown verification (null) is conservative");
{
  const d = decideListingCta({
    websiteUrl: "https://example.org/program",
    linkVerified: null,
    listingType: "OBSERVERSHIP",
  });
  assert(d.label !== "Apply Now", "null linkVerified !== 'Apply Now'");
  assert(d.label === "View Official Source", "null linkVerified -> 'View Official Source'");
}

// ─── listing-cta — undefined verification ────────────────────
section("listing-cta: undefined verification is conservative");
{
  const d = decideListingCta({
    websiteUrl: "https://example.org/program",
    listingType: "OBSERVERSHIP",
  });
  assert(d.label !== "Apply Now", "undefined linkVerified !== 'Apply Now'");
  assert(d.label === "View Official Source", "undefined linkVerified -> 'View Official Source'");
}

// ─── listing-cta — reverifying overrides verified ────────────
section("listing-cta: reverifying overrides verified");
{
  const d = decideListingCta({
    websiteUrl: "https://example.org/apply",
    linkVerified: true,
    reverifying: true,
    listingType: "OBSERVERSHIP",
  });
  assert(d.label === "Application link being reverified", "reverifying -> 'Application link being reverified'");
  assert(d.variant === "reverifying", "reverifying -> variant 'reverifying'");
  assert(d.href === null, "reverifying -> href null");
}

// ─── listing-cta — research listings get 'Learn More' ────────
section("listing-cta: research listings get 'Learn More'");
{
  const d = decideListingCta({
    websiteUrl: "https://example.org/research",
    linkVerified: true,
    listingType: "RESEARCH",
  });
  assert(d.label === "Learn More", "research + verified -> 'Learn More'");
  assert(d.variant === "research", "research -> variant 'research'");
}

// ─── listing-cta — no URL but contact email ──────────────────
section("listing-cta: no URL but contact email");
{
  const d = decideListingCta({
    contactEmail: "pi@example.org",
    listingType: "OBSERVERSHIP",
  });
  assert(d.label === "Contact to Apply", "no URL + email -> 'Contact to Apply'");
  assert(d.href === "mailto:pi@example.org", "no URL + email -> mailto href");
  assert(d.external === false, "mailto -> external false");
}

// ─── listing-cta — nothing ───────────────────────────────────
section("listing-cta: nothing");
{
  const d = decideListingCta({ listingType: "OBSERVERSHIP" });
  assert(d.label === "Verify Program Page", "nothing -> 'Verify Program Page'");
  assert(d.variant === "missing-source", "nothing -> variant 'missing-source'");
  assert(d.href === null, "nothing -> href null");
}

// ─── ctaCaption — only verified path advertises certainty ────
section("ctaCaption: variant -> caption");
{
  const verifiedCaption = ctaCaption({
    label: "Apply Now",
    variant: "verified",
    href: "https://x",
    external: true,
  });
  assert(verifiedCaption === "Verified program link", "verified caption is positive");

  const unverifiedCaption = ctaCaption({
    label: "View Official Source",
    variant: "official-source",
    href: "https://x",
    external: true,
  });
  assert(
    unverifiedCaption !== null && unverifiedCaption.includes("not yet verified"),
    "official-source caption signals uncertainty",
  );
}

// ─── listing-display: verification status mapping ────────────
section("listing-display: verificationStatus mapping is conservative");
{
  assert(
    listingVerificationStatus({ linkVerified: true }) === "verified",
    "linkVerified=true -> 'verified'",
  );
  assert(
    listingVerificationStatus({ linkVerified: false }) === "unverified",
    "linkVerified=false -> 'unverified'",
  );
  assert(
    listingVerificationStatus({ linkVerified: null }) === "unverified",
    "linkVerified=null -> 'unverified' (conservative)",
  );
  assert(
    listingVerificationStatus({}) === "unverified",
    "linkVerified absent -> 'unverified' (conservative)",
  );
  assert(
    listingVerificationStatus({ reverifying: true }) === "reverifying",
    "reverifying=true -> 'reverifying'",
  );
  assert(
    listingVerificationStatus({ linkVerified: true, reverifying: true }) === "reverifying",
    "reverifying overrides verified",
  );
}

// ─── listing-display: full normalization composes correctly ─
section("listing-display: full normalization");
{
  const display = listingDisplay({
    websiteUrl: "https://example.org/apply",
    linkVerified: true,
    listingType: "OBSERVERSHIP",
  });
  assert(display.cta.label === "Apply Now", "verified -> CTA label 'Apply Now'");
  assert(display.cta.variant === "verified", "verified -> CTA variant 'verified'");
  assert(display.verificationStatus === "verified", "verified -> verificationStatus 'verified'");
  assert(
    display.ctaCaption === "Verified program link",
    "verified -> caption 'Verified program link'",
  );
}

// ─── listing-display: unknown verification stays safe ───────
section("listing-display: unknown verification never produces 'Apply Now'");
{
  const display = listingDisplay({
    websiteUrl: "https://example.org/maybe",
    linkVerified: undefined,
    listingType: "OBSERVERSHIP",
  });
  assert(display.cta.label !== "Apply Now", "undefined linkVerified -> not 'Apply Now'");
  assert(display.cta.label === "View Official Source", "undefined linkVerified -> 'View Official Source'");
  assert(display.verificationStatus === "unverified", "undefined linkVerified -> 'unverified'");
  assert(
    display.ctaCaption !== null && display.ctaCaption.includes("not yet verified"),
    "unverified caption signals uncertainty",
  );
}

// ─── listing-display: reverifying composes correctly ────────
section("listing-display: reverifying composes correctly");
{
  const display = listingDisplay({
    websiteUrl: "https://example.org/apply",
    linkVerified: true,
    reverifying: true,
    listingType: "OBSERVERSHIP",
  });
  assert(display.cta.label === "Application link being reverified", "reverifying -> CTA label");
  assert(display.verificationStatus === "reverifying", "reverifying -> verificationStatus 'reverifying'");
  assert(display.cta.href === null, "reverifying -> href null");
}

// ─── listing-display: research listings get 'Learn More' ────
section("listing-display: research listings get 'Learn More'");
{
  const display = listingDisplay({
    websiteUrl: "https://example.org/research",
    linkVerified: true,
    listingType: "RESEARCH",
  });
  assert(display.cta.label === "Learn More", "research -> 'Learn More'");
  assert(display.verificationStatus === "verified", "research+verified -> verificationStatus 'verified'");
}

// ─── listing-display: missing source is safe ────────────────
section("listing-display: missing source is safe");
{
  const display = listingDisplay({ listingType: "OBSERVERSHIP" });
  assert(display.cta.label === "Verify Program Page", "no source -> 'Verify Program Page'");
  assert(display.cta.href === null, "no source -> href null");
  assert(display.verificationStatus === "unverified", "no source -> 'unverified'");
}

// ─── result ───────────────────────────────────────────────────
console.log(`\n${failed === 0 ? "ALL CHECKS PASSED" : `FAILED: ${failed} assertion(s) failed`}`);
process.exit(failed === 0 ? 0 : 1);
