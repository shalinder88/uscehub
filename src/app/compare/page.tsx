import type { Metadata } from "next";
import CompareClient from "./compare-client";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare Programs Side by Side",
  description:
    "Compare observership, externship, and research programs side by side. See cost, duration, specialty, visa support, certificates, and more for each program.",
  alternates: {
    canonical: "https://uscehub.com/compare",
  },
  openGraph: {
    title: "Compare Programs Side by Side — USCEHub",
    description:
      "Compare observership and externship programs side by side. Source-linked fields shown where available; verify missing data with the official institution.",
    url: "https://uscehub.com/compare",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Compare Programs — USCEHub",
  description:
    "Compare observership, externship, and research programs side by side. See cost, duration, specialty, visa support, certificates, and more.",
  url: "https://uscehub.com/compare",
  applicationCategory: "EducationalApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default async function ComparePage() {
  // PR cmp-fix 2026-05-28: server-render the full APPROVED listing
  // list. The previous client-side fetch hit /api/listings?limit=500
  // which the public route caps at 50, so only ~50 of 203 listings
  // were selectable in the dropdowns. Server fetch bypasses the cap
  // and removes the empty-dropdown race on first paint.
  const listings = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    select: { id: true, title: true, city: true, state: true },
    orderBy: { title: "asc" },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uscehub.com" },
          { name: "Tools", url: "https://uscehub.com/compare" },
          { name: "Compare Programs", url: "https://uscehub.com/compare" },
        ]}
      />
      <CompareClient initialListings={listings} />
    </>
  );
}
