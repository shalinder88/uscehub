import type { Metadata } from "next";
import CompareClient from "./compare-client";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

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

export default function ComparePage() {
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
      <CompareClient />
    </>
  );
}
