/**
 * Centralized CTA decision for listing apply buttons.
 *
 * Conservative defaults: only return "Apply Now" when a listing is
 * EXPLICITLY verified for direct application. Unknown or unverified
 * link status defaults to "View Official Source" — never invent
 * confidence we don't have.
 *
 * The audit found CTA wording inline in src/app/listing/[id]/page.tsx
 * with research/verified/fallback branches that are easy to drift.
 * This helper is the single chokepoint.
 *
 * Pure function. SSR-safe. No React. No DB calls.
 */

/**
 * Subset of Prisma's `LinkVerificationStatus` we accept here. Defined as
 * a string union (not the Prisma type) to keep this module dependency-free
 * for SSR/edge call sites and to match what serialized Prisma rows look
 * like over the wire.
 */
export type LinkVerificationStatusInput =
  | "VERIFIED"
  | "REVERIFYING"
  | "NEEDS_MANUAL_REVIEW"
  | "SOURCE_DEAD"
  | "PROGRAM_CLOSED"
  | "NO_OFFICIAL_SOURCE"
  | "UNKNOWN";

export type ListingCtaInput = {
  websiteUrl?: string | null;
  contactEmail?: string | null;
  /** True only when an admin has confirmed the source URL leads to a working application page. */
  linkVerified?: boolean | null;
  /** Future field — currently the DB doesn't expose this, but the helper supports it for future use. */
  reverifying?: boolean | null;
  /**
   * Phase 3.2 verification enum. When present, takes precedence over
   * `linkVerified` Boolean and `reverifying` flag. Conservative
   * mapping: VERIFIED → verified path; REVERIFYING → reverifying path;
   * everything else → unverified path.
   */
  linkVerificationStatus?: LinkVerificationStatusInput | null;
  /**
   * Real verification timestamp from the DB. CTA decisions don't read this,
   * but it's part of the shared `ListingDisplayInput` so downstream
   * verification-status mapping (PR 3.5a) can distinguish "verified" from
   * "verified-on-file" rows. Keeping it on the same input type avoids
   * call-site boilerplate.
   */
  lastVerifiedAt?: Date | string | null;
  /** Listing.listingType from Prisma. Research listings use a softer CTA. */
  listingType?: string | null;
};

export type ListingCtaVariant =
  | "verified"
  | "official-source"
  | "reverifying"
  | "missing-source"
  | "research"
  | "contact"
  | "platform";

export type ListingCtaDecision = {
  /** Button label shown to users. */
  label: string;
  /** Discriminator for downstream styling and caption choice. */
  variant: ListingCtaVariant;
  /** Where the button goes. `null` means render as a disabled / non-link state. */
  href: string | null;
  /** Whether the href should open in a new tab. */
  external: boolean;
};

/**
 * Decide the CTA label + href for a listing.
 *
 * Order of precedence:
 *  1. Reverifying — overrides everything else (we explicitly know the link is mid-recheck)
 *  2. Research listings with a URL — "Learn More" (existing UX)
 *  3. Has a URL + admin-verified — "Apply Now"
 *  4. Has a URL but unverified — "View Official Source" (CONSERVATIVE)
 *  5. No URL but contact email — "Contact to Apply"
 *  6. Nothing — "Verify Program Page"
 */
export function decideListingCta(listing: ListingCtaInput): ListingCtaDecision {
  // Phase 3.2 enum takes precedence when present. We map to the existing
  // behavior paths so this stays back-compat with rows that only have
  // the legacy `linkVerified` Boolean populated.
  const enumStatus = listing.linkVerificationStatus ?? null;
  const isReverifying = listing.reverifying === true || enumStatus === "REVERIFYING";
  const isEnumVerified = enumStatus === "VERIFIED";
  const isLegacyVerified = enumStatus == null && listing.linkVerified === true;

  if (isReverifying) {
    return {
      label: "Application link being reverified",
      variant: "reverifying",
      href: null,
      external: false,
    };
  }

  if (listing.listingType === "RESEARCH" && listing.websiteUrl) {
    return {
      label: "Learn More",
      variant: "research",
      href: listing.websiteUrl,
      external: true,
    };
  }

  if (listing.websiteUrl && (isEnumVerified || isLegacyVerified)) {
    return {
      label: "Apply Now",
      variant: "verified",
      href: listing.websiteUrl,
      external: true,
    };
  }

  if (listing.websiteUrl) {
    return {
      label: "View Official Source",
      variant: "official-source",
      href: listing.websiteUrl,
      external: true,
    };
  }

  if (listing.contactEmail) {
    return {
      label: "Contact to Apply",
      variant: "contact",
      href: `mailto:${listing.contactEmail}`,
      external: false,
    };
  }

  return {
    label: "Verify Program Page",
    variant: "missing-source",
    href: null,
    external: false,
  };
}

/**
 * Optional caption shown beneath the button. Mirrors the variant
 * decision so consumers don't have to re-derive context.
 */
export function ctaCaption(decision: ListingCtaDecision): string | null {
  switch (decision.variant) {
    case "verified":
      return "Verified program link";
    case "official-source":
      return "Source link not yet verified — confirm details on the official institution page before applying.";
    case "reverifying":
      return "We're re-checking this application link. Try again shortly or contact the institution directly.";
    case "missing-source":
      return "We don't have a verified source URL for this listing. Search the institution's website to confirm program availability.";
    case "research":
      return "Research positions are typically arranged by emailing the PI directly. This link goes to the institution's research page.";
    case "contact":
      return null;
    case "platform":
      return null;
  }
}
