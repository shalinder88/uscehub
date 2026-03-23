import type { Metadata } from "next";
import RecommendClient from "./recommend-client";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Program Finder — Find the Best Observership for You",
  description:
    "Answer a few questions about your budget, specialty, visa status, and preferred region to find the best observership, externship, or research programs for IMGs in the United States.",
  alternates: {
    canonical: "https://uscehub.com/recommend",
  },
  openGraph: {
    title: "Program Finder — Find the Best Observership for You",
    description:
      "Answer a few questions to find the best clinical experience programs for International Medical Graduates.",
    url: "https://uscehub.com/recommend",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Program Finder — USCEHub",
  description:
    "Interactive tool that helps International Medical Graduates find the best observership, externship, or research programs based on budget, specialty, visa status, and location.",
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
