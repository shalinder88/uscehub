/**
 * One-stop display normalization for a listing's CTA + verification UI.
 *
 * Listing detail and listing card both render the same conceptual
 * trust/CTA decisions. Without a chokepoint, those decisions drift
 * (audit P1-5 documented inline conditional CTA logic spread across
 * pages). This helper composes the existing primitives into one
 * `listingDisplay()` call that returns everything a render site needs.
 *
 * Conservative defaults are inherited from src/lib/listing-cta.ts:
 * unknown / unverified link status never produces "Apply Now". The
 * verification status mapping mirrors the same conservatism — anything
 * not explicitly verified is "unverified", and "reverifying" is only
 * ever set when the caller passes it explicitly.
 *
 * Pure function. SSR-safe. No React. No DB calls.
 */

import type { ListingVerificationStatus } from "@/components/listings/listing-verification-badge";
import {
  decideListingCta,
  ctaCaption,
  type ListingCtaDecision,
  type ListingCtaInput,
} from "@/lib/listing-cta";

export type ListingDisplayInput = ListingCtaInput;

/**
 * Map a listing's raw verification fields to the canonical
 * ListingVerificationStatus used by ListingVerificationBadge and
 * ListingTrustMetadata.
 *
 * Precedence (PR 3.5a):
 *   1. `linkVerificationStatus` enum if present (Phase 3.2 schema field)
 *   2. legacy `reverifying` flag
 *   3. legacy `linkVerified` Boolean
 *   4. fallback "unverified"
 *
 * Conservative mapping for the enum:
 *   VERIFIED + lastVerifiedAt set    → "verified"          (green; cron or admin verified recently)
 *   VERIFIED + lastVerifiedAt null   → "verified-on-file"  (slate; URL on file, no audit trail)
 *   REVERIFYING                      → "reverifying"
 *   NEEDS_MANUAL_REVIEW              → "needs-review"      (amber stronger; cron 4xx/5xx)
 *   SOURCE_DEAD
 *   PROGRAM_CLOSED
 *   NO_OFFICIAL_SOURCE
 *   UNKNOWN                          → "unverified"        (amber soft)
 *
 * The `verified` vs `verified-on-file` split is the PR 3.5a fix: 136
 * legacy-backfilled rows on production have linkVerificationStatus =
 * VERIFIED but lastVerifiedAt = null (they were copied from the legacy
 * `linkVerified` Boolean during the PR #7 migration; the cron has not
 * yet probed them). Rendering them as the same green "Verified link"
 * badge as freshly-cron-verified rows would overclaim. The
 * "verified-on-file" variant says "URL is on file, we have not
 * recently checked it" — honest without scary banners.
 *
 * Source-dead / program-closed / no-official-source are admin-only
 * states; richer admin-state badge variants are deferred to a follow-up
 * PR. Surfacing them as "unverified" keeps the public language honest
 * without inventing scary banners site-wide (per SEO_PRESERVATION_RULES.md).
 */
export function listingVerificationStatus(input: {
  linkVerified?: boolean | null;
  reverifying?: boolean | null;
  linkVerificationStatus?:
    | "VERIFIED"
    | "REVERIFYING"
    | "NEEDS_MANUAL_REVIEW"
    | "SOURCE_DEAD"
    | "PROGRAM_CLOSED"
    | "NO_OFFICIAL_SOURCE"
    | "UNKNOWN"
    | null;
  lastVerifiedAt?: Date | string | null;
}): ListingVerificationStatus {
  const hasRealVerifiedAt = input.lastVerifiedAt != null;

  switch (input.linkVerificationStatus) {
    case "VERIFIED":
      return hasRealVerifiedAt ? "verified" : "verified-on-file";
    case "REVERIFYING":
      return "reverifying";
    case "NEEDS_MANUAL_REVIEW":
      return "needs-review";
    case "SOURCE_DEAD":
    case "PROGRAM_CLOSED":
    case "NO_OFFICIAL_SOURCE":
    case "UNKNOWN":
      return "unverified";
  }
  // Legacy fallback (no enum): be conservative. linkVerified=true
  // without an audit-trail timestamp still maps to verified-on-file,
  // never green "verified".
  if (input.reverifying === true) return "reverifying";
  if (input.linkVerified === true) {
    return hasRealVerifiedAt ? "verified" : "verified-on-file";
  }
  return "unverified";
}

export interface ListingDisplay {
  /** CTA decision: label, variant, href, external. */
  cta: ListingCtaDecision;
  /** Optional caption beneath the CTA. `null` for variants that do not need one. */
  ctaCaption: string | null;
  /** Canonical verification status for trust UI. */
  verificationStatus: ListingVerificationStatus;
}

/**
 * Single normalization entry point. Call this once per listing when
 * rendering — both the listing detail page and any future listing card
 * migration should funnel through it.
 */
export function listingDisplay(input: ListingDisplayInput): ListingDisplay {
  const cta = decideListingCta(input);
  return {
    cta,
    ctaCaption: ctaCaption(cta),
    verificationStatus: listingVerificationStatus(input),
  };
}
