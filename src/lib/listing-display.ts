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
 * Conservative: defaults to "unverified" when the verification field
 * is absent, false, or null. "reverifying" is opt-in only — the DB
 * does not yet expose this field, so the helper supports it for
 * future use (per audit P1-12 / RULES.md, the FellowshipProgram /
 * WaiverJob aspirational models are preserved unmigrated).
 */
export function listingVerificationStatus(input: {
  linkVerified?: boolean | null;
  reverifying?: boolean | null;
}): ListingVerificationStatus {
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
