import type { Metadata } from "next";
import { FreidaContent } from "./freida-content";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export const metadata: Metadata = {
  title: "IMG Resources — 2025 Match Data, ECFMG, Specialty Guide",
  description:
    "2025 NRMP Match data, ECFMG certification pathways, IMG-friendly specialties, Step 2 CK targets, program rankings, and visa guide. Updated with the latest match results for International Medical Graduates.",
  alternates: {
    canonical: "https://uscehub.com/freida",
  },
  openGraph: {
    title: "IMG Resources — 2025 Match Data, ECFMG, Specialty Guide",
    description:
      "Complete IMG residency intelligence: 2025 NRMP Match statistics, ECFMG pathways, specialty competitiveness, and program rankings.",
    url: "https://uscehub.com/freida",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "IMG Resources — 2025 Match Data, ECFMG, Specialty Guide",
  description:
    "2025 NRMP Match data, ECFMG certification pathways, IMG-friendly specialties, Step 2 CK targets, and visa guide for International Medical Graduates.",
  url: "https://uscehub.com/freida",
  dateModified: "2025-03-22",
  about: {
    "@type": "Thing",
    name: "International Medical Graduate Residency Resources",
  },
  mainEntity: {
    "@type": "Dataset",
    name: "2025 NRMP Match Data for IMGs",
    description:
      "Match statistics, specialty data, and outcomes for International Medical Graduates from the 2025 NRMP Main Residency Match.",
    creator: {
      "@type": "Organization",
      name: "NRMP",
      url: "https://www.nrmp.org",
    },
  },
};

export default function FreidaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uscehub.com" },
          { name: "IMG Resources", url: "https://uscehub.com/freida" },
        ]}
      />
      <FreidaContent />
    </>
  );
}
