import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Methodology — How We Verify Listings",
  description:
    "How USCEHub sources, verifies, and maintains its directory of clinical observership, externship, and research opportunities for IMGs.",
  alternates: {
    canonical: "https://uscehub.com/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uscehub.com" },
          { name: "Methodology", url: "https://uscehub.com/methodology" },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          How We Build and Verify This Directory
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Last updated: March 2026
        </p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {/* What counts as a listing */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              What Counts as a Listing
            </h2>
            <p>
              A listing on USCEHub represents one of four program types offered by a U.S. medical institution:
            </p>
            <ul className="mt-3 ml-4 list-disc space-y-1.5">
              <li><strong className="text-slate-800 dark:text-slate-200">Observership</strong> — A program where an IMG observes clinical practice without direct patient contact. No medical license required.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Externship / Clinical Rotation</strong> — A program where an IMG participates in clinical activities with some degree of hands-on involvement. May require a medical license or training agreement.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Research Position</strong> — A paid or unpaid research role at a U.S. institution, typically requiring a medical degree.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Postdoctoral Fellowship</strong> — A postdoctoral research or clinical research fellowship at an academic medical center.</li>
            </ul>
            <p className="mt-3">
              We do not list programs that lack verifiable institutional backing, programs that are exclusively marketed as paid &ldquo;packages&rdquo; with no institutional affiliation, or programs from individuals without verifiable credentials.
            </p>
          </section>

          {/* How we source listings */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              How We Source Listings
            </h2>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Direct review of hospital and medical center websites (GME offices, academic affairs pages, international visitor programs)</li>
              <li>Public directories including ECFMG, AMA FREIDA, and individual state medical association listings</li>
              <li>Community submissions verified against official institutional sources</li>
              <li>Direct communication with GME coordinators and program administrators</li>
              <li>Self-submissions from institutions through our posting portal (reviewed before publication)</li>
            </ul>
          </section>

          {/* What verified means */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              What the Trust Badges Mean
            </h2>
            <p>
              We use a small set of conservative badges to describe the
              source-link state of each listing. We never claim a listing is
              endorsed, approved, or verified by the listed institution.
            </p>
            <ul className="mt-3 ml-4 list-disc space-y-1.5">
              <li>
                <strong className="text-emerald-600 dark:text-emerald-400">Verified link</strong> —
                an automated check or admin review confirmed the source URL was
                reachable and the listing has a real verification timestamp on
                file.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Official source on file</strong> —
                the listing has an official institutional URL on file, but we
                have not yet recorded a fresh verification timestamp. Common for
                rows imported from public sources before the verification
                pipeline existed.
              </li>
              <li>
                <strong className="text-amber-700 dark:text-amber-300">Source needs review</strong> —
                a recent check returned an error or the page changed in a way
                that needs human review. Verify directly with the institution
                before applying.
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Source not yet verified</strong> —
                public information only; we have not confirmed the source URL
                ourselves yet.
              </li>
            </ul>
            <p className="mt-3">
              We always include the source link so users can verify
              independently. USCEHub is not affiliated with the listed
              institutions and does not represent them.
            </p>
          </section>

          {/* How often we check */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              How Often We Re-check
            </h2>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong className="text-slate-800 dark:text-slate-200">Link checks:</strong> Listing URLs are re-checked on a recurring schedule. Reports of broken links are queued for admin review; we do not guarantee a response time.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Program details:</strong> Cost, duration, and specialty information is reviewed periodically and on receipt of a correction request.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Match data:</strong> NRMP match statistics are updated after official release (currently reflects March 20, 2026 data).</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ECFMG requirements:</strong> Pathway and exam requirements are updated as ECFMG publishes changes.</li>
            </ul>
          </section>

          {/* Data sources */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Data Sources
            </h2>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><a href="https://www.nrmp.org/match-data/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">NRMP</a> — Match statistics, fill rates, specialty data</li>
              <li><a href="https://www.ecfmg.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">ECFMG</a> — Certification requirements, pathways, exam details</li>
              <li><a href="https://freida.ama-assn.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">AMA FREIDA</a> — Program database, IMG percentages, visa sponsorship data</li>
              <li><a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">USMLE</a> — Exam scoring, passing criteria, testing policies</li>
              <li>Individual hospital and medical center websites — Program-specific details</li>
            </ul>
          </section>

          {/* Corrections, updates, removals */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Corrections, Updates, and Removal Requests
            </h2>
            <p>
              We welcome corrections and updates from applicants, program
              coordinators, and the listed institutions themselves.
            </p>
            <ul className="mt-3 ml-4 list-disc space-y-1.5">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Report a broken link</strong> —
                use the small &ldquo;Report broken link&rdquo; affordance under
                the source link on any listing page.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Suggest a correction</strong> —
                use the &ldquo;Suggest an update&rdquo; link in the listing
                trust block, or send a structured message via{" "}
                <a href="/contact-admin" className="text-blue-600 dark:text-blue-400 underline">contact-admin</a>{" "}
                with the &ldquo;Data correction&rdquo; or &ldquo;Coordinator
                correction&rdquo; category.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Request an update or removal</strong> —
                if you represent the listed institution and want a listing
                updated or removed, use{" "}
                <a href="/contact-admin" className="text-blue-600 dark:text-blue-400 underline">contact-admin</a>{" "}
                with the &ldquo;Institution / program update&rdquo; or
                &ldquo;Request listing removal or review&rdquo; category.
              </li>
            </ul>
            <p className="mt-3">
              Corrections, updates, and removal requests are reviewed before
              any public change. We do not guarantee a response time, but
              every request is queued for an admin to read.
            </p>
          </section>

          {/* Disclaimer */}
          <section className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Important Disclaimer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              USCEHub is an informational directory. We are not a placement agency, medical advisor, or guarantor of any program. All information is provided as-is. Programs may change requirements, fees, availability, or close without notice. Users must verify all information independently before applying or making any payments. USCEHub is not affiliated with NRMP, ECFMG, ERAS, AAMC, AMA, or any hospital or residency program.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
