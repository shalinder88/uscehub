import type { Metadata } from "next";
import { FreidaContent } from "./freida-content";

export const metadata: Metadata = {
  title: "FREIDA & Residency Programs",
  description:
    "Comprehensive guide to FREIDA, residency program data, IMG-friendly programs, match statistics, and community insights for International Medical Graduates.",
  alternates: {
    canonical: "https://uscehub.com/freida",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "IMG Resources — FREIDA & Residency Programs",
  description:
    "Comprehensive guide to FREIDA, residency program data, IMG-friendly programs, match statistics, and community insights for International Medical Graduates.",
  url: "https://uscehub.com/freida",
  about: {
    "@type": "Thing",
    name: "International Medical Graduate Residency Resources",
  },
};

export default function FreidaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FreidaContent />
    </>
  );
}
