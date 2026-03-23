import type { Metadata } from "next";
import { Target, Eye, Shield, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Built by an intensivist who lived the IMG journey. USCEHub is the largest free database of clinical observership and externship opportunities for International Medical Graduates.",
  alternates: {
    canonical: "https://uscehub.com/about",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About USCEHub",
  description:
    "Built by an intensivist who lived the IMG journey. USCEHub is the largest free database of clinical observership and externship opportunities for International Medical Graduates.",
  url: "https://uscehub.com/about",
  mainEntity: {
    "@type": "Organization",
    name: "USCEHub",
    url: "https://uscehub.com",
    founder: {
      "@type": "Person",
      name: "Singh MD",
      jobTitle: "Intensivist",
    },
    description:
      "The largest structured database of clinical observership, externship, and research opportunities for International Medical Graduates in the United States.",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
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
      {/* Hero */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
              <Stethoscope className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Built by an Intensivist Who&apos;s Been There
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              From medical school abroad to the ICU. This platform was made by
              Singh MD — someone who went through every step of the IMG process.
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

        {/* Personal Story */}
        <section className="mb-14">
          <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 p-6 sm:p-8">
            <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                I built this platform because I remember. The confusion of
                figuring out which exams to take and when. The expenses that
                kept piling up — exam fees, application fees, travel, housing.
                The lonely nights studying for Step exams in a different time
                zone from everyone I knew. Cold-emailing dozens of hospitals
                hoping someone would give me a chance to observe.
              </p>
              <p>
                I went through the entire process — USMLE exams, ECFMG
                certification, observerships, research, residency, fellowship,
                and finally attending life in the ICU. At every stage, I wished
                there was one honest, organized place with the information I
                needed. There wasn&apos;t. So I built it.
              </p>
            </div>

            {/* Prominent quote */}
            <div className="mt-6 rounded-xl bg-slate-900 p-6 text-center">
              <p className="text-xl font-semibold text-white sm:text-2xl">
                &ldquo;Don&apos;t worry — it gets easier.&rdquo;
              </p>
              <p className="mt-2 text-sm text-slate-400">
                The process is hard, the uncertainty is real, but thousands of
                IMGs have walked this path before you and matched. You can too.
              </p>
            </div>
            <p className="mt-4 text-right text-sm font-medium text-slate-500 dark:text-slate-400">— Singh MD, Intensivist</p>
          </div>
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
                Build the largest, most trustworthy database of clinical and
                research opportunities for IMGs in the United States.
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
          <Link href="/freida">
            <Button variant="outline" size="lg">IMG Resources</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
