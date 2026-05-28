import type { Metadata } from "next";
import { Target, Eye, Shield, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Built by an intensivist who lived the IMG journey. USCEHub is an independent, source-linked, free directory of U.S. clinical experience opportunities for International Medical Graduates.",
  alternates: {
    canonical: "https://uscehub.com/about",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About USCEHub",
  description:
    "Built by an intensivist who lived the IMG journey. USCEHub is an independent, source-linked, free directory of U.S. clinical experience opportunities for International Medical Graduates.",
  url: "https://uscehub.com/about",
  mainEntity: {
    "@type": "Organization",
    name: "USCEHub",
    url: "https://uscehub.com",
    founder: {
      "@type": "Person",
      name: "USCEHub Team",
    },
    description:
      "An independent, source-linked directory of U.S. clinical experience programs — observerships, clerkships, MD/DO visiting student rotations (VSLO), and research positions.",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[var(--bg)] dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uscehub.com" },
          { name: "About Us", url: "https://uscehub.com/about" },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 pt-16 pb-14 sm:px-6 lg:px-8">
        {/* Free forever + Built by intensivist — single combined block */}
        <section className="mb-14">
          <div
            className="card-lift rounded-2xl p-8 text-center sm:p-10"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
            }}
          >
            <div
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "var(--teal-soft)" }}
            >
              <Stethoscope className="h-6 w-6" style={{ color: "var(--teal)" }} />
            </div>
            <h1
              className="text-3xl sm:text-4xl"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-0.01em",
              }}
            >
              This platform is and will remain free.
            </h1>
            <p
              className="mx-auto mt-4 max-w-xl"
              style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.6 }}
            >
              No paywalls. No premium tiers. No hidden fees. Just honest,
              structured information for every medical student and graduate
              looking for U.S. clinical experience.
            </p>
            <p
              className="mt-5"
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              Built by an Intensivist.
            </p>
          </div>
        </section>

        {/* Hidden line (kept for layout grid spacing if needed) */}
        <section className="mb-14 hidden">
          <p
            className="text-center"
            style={{
              fontSize: 14,
              color: "var(--ink-soft)",
              fontStyle: "italic",
            }}
          >
            Built by an Intensivist who went through the IMG path.
          </p>
        </section>

        {/* Trust line — single sentence */}
        <section className="mb-10">
          <p
            className="text-center text-sm"
            style={{ color: "var(--ink-soft)", maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}
          >
            Every listing is reviewed. Posters are verified. Reviews are
            moderated. We clearly label what is verified and what is not — and
            we always link to the institution&apos;s own page so you can confirm.
          </p>
        </section>

        {/* Disclaimer */}
        <p className="mb-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
          USCEHub is not affiliated with NRMP, ECFMG, ERAS, AAMC, or
          any hospital or residency program. Independent informational resource —
          no guarantee of placement or match results.
        </p>

        {/* CTA */}
        <div className="flex justify-center">
          <Link href="/browse">
            <Button size="lg" style={{ background: "var(--teal)", color: "#fff" }}>Browse Opportunities</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
