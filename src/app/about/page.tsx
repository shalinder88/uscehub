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
      {/* Hero — cream/serif per mockup 127 */}
      <div style={{ background: "var(--bg-alt)", borderBottom: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "var(--teal-soft)" }}
            >
              <Stethoscope className="h-8 w-8" style={{ color: "var(--teal)" }} />
            </div>
            <h1
              className="text-4xl sm:text-5xl"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-0.01em",
              }}
            >
              Built by an Intensivist Who&apos;s Been There
            </h1>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              From medical school abroad to the ICU. This platform was made by
              someone who went through every step of the IMG process.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Free forever — FIRST */}
        <section className="mb-10">
          <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/30 p-6 text-center sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              This platform is and will remain free.
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              No paywalls. No premium tiers. No hidden fees. Just honest,
              structured information for every IMG who needs it.
            </p>
          </div>
        </section>

        {/* Built by an Intensivist — single subtle line */}
        <section className="mb-14">
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

        {/* What we understand */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            We understand what you&apos;re going through
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { title: "ECFMG Certification", desc: "Navigating pathways, scheduling exams across countries, waiting for results. The process is long but it's doable." },
              { title: "Exam Pressure", desc: "USMLE Step 1 (pass/fail), Step 2 CK (score matters more than ever), OET — each one feels like a mountain." },
              { title: "Financial Strain", desc: "Exam fees, application fees, observership costs, travel, housing — it adds up fast. That's why this platform is free." },
              { title: "Finding Opportunities", desc: "Cold-emailing hospitals, scrolling forums, asking friends — finding legitimate programs shouldn't be this hard." },
              { title: "The Waiting", desc: "Waiting for exam results, waiting for visa appointments, waiting for Match Day. The uncertainty is the hardest part." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission / Vision / Trust */}
        <section className="mb-14">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Target className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Mission</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Build an independent, source-linked, trustworthy directory of
                clinical and research opportunities for IMGs in the United
                States.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Eye className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Vision</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Every qualified IMG has transparent, equal access to
                information about US clinical opportunities — no gatekeeping,
                no scams, no confusion.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Shield className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Trust</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Every listing is reviewed. Posters are verified. Reviews are
                moderated. We clearly label what is verified and what is not.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <p className="mb-10 text-center text-xs text-slate-400">
          USCEHub is not affiliated with NRMP, ECFMG, ERAS, AAMC, or
          any hospital or residency program. This is an independent informational
          resource and does not guarantee placement or match results.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/browse">
            <Button size="lg">Browse Opportunities</Button>
          </Link>
          <Link href="/img-resources">
            <Button variant="outline" size="lg">Residency Intelligence</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
