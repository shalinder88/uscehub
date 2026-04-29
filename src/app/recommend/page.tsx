import type { Metadata } from "next";
import RecommendClient from "./recommend-client";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

// PR 0f-fix (audit H1): "best match" / "best programs" framing removed.
// The engine filters APPROVED listings by user input and orders by
// trust+views — there is no quality-ranking model behind "best". Copy
// reframed as filter-based matching.
export const metadata: Metadata = {
  title: "Program Finder — Match Programs to Your Profile",
  description:
    "Answer a few questions about your budget, specialty, visa needs, and preferred region to find observership, externship, or research programs that match your filters. Results may prioritize recently verified, source-linked, approved listings.",
  alternates: {
    canonical: "https://uscehub.com/recommend",
  },
  openGraph: {
    title: "Program Finder — Match Programs to Your Profile",
    description:
      "Answer a few questions to find clinical experience programs that match your filters.",
    url: "https://uscehub.com/recommend",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Program Finder — USCEHub",
  description:
    "Interactive tool that helps International Medical Graduates find observership, externship, or research programs that match their filters by budget, specialty, visa needs, and location.",
  url: "https://uscehub.com/recommend",
  applicationCategory: "EducationalApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RecommendPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uscehub.com" },
          { name: "Tools", url: "https://uscehub.com/recommend" },
          { name: "Program Finder", url: "https://uscehub.com/recommend" },
        ]}
      />
      <RecommendClient />
    </>
  );
}
