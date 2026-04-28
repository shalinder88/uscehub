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

export type ListingCtaInput = {
  websiteUrl?: string | null;
  contactEmail?: string | null;
  /** True only when an admin has confirmed the source URL leads to a working application page. */
  linkVerified?: boolean | null;
  /** Future field — currently the DB doesn't expose this, but the helper supports it for future use. */
  reverifying?: boolean | null;
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
  if (listing.reverifying === true) {
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

  if (listing.websiteUrl && listing.linkVerified === true) {
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
