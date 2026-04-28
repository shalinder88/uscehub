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
 * Precedence (PR 3.5):
 *   1. `linkVerificationStatus` enum if present (Phase 3.2 schema field)
 *   2. legacy `reverifying` flag
 *   3. legacy `linkVerified` Boolean
 *   4. fallback "unverified"
 *
 * Conservative mapping for the enum:
 *   VERIFIED              → "verified"
 *   REVERIFYING           → "reverifying"
 *   NEEDS_MANUAL_REVIEW
 *   SOURCE_DEAD
 *   PROGRAM_CLOSED
 *   NO_OFFICIAL_SOURCE
 *   UNKNOWN               → "unverified"
 *
 * Source-dead / program-closed / no-official-source are admin-only
 * states; the public badge variant deliberately does not yet exist
 * for them. Until a richer badge system lands, surfacing them as
 * "unverified" keeps the public language honest without inventing
 * scary banners site-wide (per SEO_PRESERVATION_RULES.md).
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
}): ListingVerificationStatus {
  switch (input.linkVerificationStatus) {
    case "VERIFIED":
      return "verified";
    case "REVERIFYING":
      return "reverifying";
    case "NEEDS_MANUAL_REVIEW":
    case "SOURCE_DEAD":
    case "PROGRAM_CLOSED":
    case "NO_OFFICIAL_SOURCE":
    case "UNKNOWN":
      return "unverified";
  }
  if (input.reverifying === true) return "reverifying";
  if (input.linkVerified === true) return "verified";
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
