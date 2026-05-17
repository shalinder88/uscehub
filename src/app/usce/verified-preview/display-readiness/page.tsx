import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import * as path from "node:path";

/**
 * P102 Display Readiness Preview — internal-only diagnostic surface for the
 * link-truth reconciliation work.
 *
 * Reads the seven JSON exports produced by
 *   scripts/p102-build-display-eligibility-export.ts
 * and shows the count for each bucket plus a sample of clinical-USCE rows
 * with classification badges.
 *
 * Routes:
 *   /usce/verified-preview/display-readiness
 *
 * SEO: noindex via robots meta. Internal review surface only.
 *
 * Does NOT touch the Prisma `listing` table. Does NOT replace `/browse`.
 * Does NOT modify the existing /usce/verified-preview snapshot loader.
 */
export const metadata: Metadata = {
  title: "P102 display readiness — internal",
  description:
    "Internal diagnostic preview of P102 display-eligibility buckets after the link-truth reconciliation.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

interface DisplayRow {
  programName: string;
  institution: string;
  state: string;
  finalUrl: string;
  classification: string;
  badge: "DIRECT" | "REORIENTED" | "PROTECTED" | "RESEARCH" | "HOLD" | "HIDDEN";
  subType: string;
  audience: string;
  evidenceQuote: string;
  provenanceNote: string;
  verifiedFlag: boolean;
  specialtyLimited?: string;
  hideReason?: string;
  hideClassification?: string;
}

const EXPORTS_DIR = path.resolve(
  process.cwd(),
  "docs/platform-v2/local/usce-discovery-command-center/p102/exports"
);

function loadBucket(file: string): DisplayRow[] {
  try {
    return JSON.parse(readFileSync(path.join(EXPORTS_DIR, file), "utf8")) as DisplayRow[];
  } catch {
    return [];
  }
}

const BADGE_STYLES: Record<DisplayRow["badge"], string> = {
  DIRECT: "bg-emerald-100 text-emerald-900 border-emerald-300",
  REORIENTED: "bg-sky-100 text-sky-900 border-sky-300",
  PROTECTED: "bg-amber-100 text-amber-900 border-amber-300",
  RESEARCH: "bg-violet-100 text-violet-900 border-violet-300",
  HOLD: "bg-yellow-100 text-yellow-900 border-yellow-300",
  HIDDEN: "bg-stone-200 text-stone-700 border-stone-300",
};

export default function DisplayReadinessPreviewPage() {
  const clinical = loadBucket("display_eligible_clinical_usce.json");
  const research = loadBucket("display_eligible_research.json");
  const outreach = loadBucket("display_hold_outreach.json");
  const researchReverify = loadBucket("display_hold_research_reverify.json");
  const manualBrowser = loadBucket("display_hold_manual_browser.json");
  const hidden = loadBucket("display_hidden_or_removed.json");
  const archiveNegative = loadBucket("display_archive_negative_info.json");

  const activeCount = clinical.length + research.length;
  const heldCount = outreach.length + researchReverify.length + manualBrowser.length;
  const totalCount =
    activeCount + heldCount + hidden.length + archiveNegative.length;

  const clinicalBadgeCounts: Record<string, number> = {};
  for (const r of clinical) {
    clinicalBadgeCounts[r.badge] = (clinicalBadgeCounts[r.badge] ?? 0) + 1;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-stone-900 dark:text-slate-100">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-slate-400">
          Internal preview · noindex
        </p>
        <h1 className="text-3xl font-semibold mt-1">
          P102 Display Readiness
        </h1>
        <p className="mt-2 text-stone-600 dark:text-slate-300">
          Source of truth for what the live site is allowed to display after
          the 11-batch link-truth campaign. Rebuild with{" "}
          <code className="rounded bg-stone-100 dark:bg-slate-800 dark:text-slate-100 px-1 py-0.5 text-sm">
            npx tsx scripts/p102-build-display-eligibility-export.ts
          </code>
          .
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-semibold border-b border-stone-200 dark:border-slate-700 pb-1 mb-3">
          Buckets
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Clinical USCE", count: clinical.length, tone: "emerald" },
            { label: "Research", count: research.length, tone: "violet" },
            { label: "Outreach hold", count: outreach.length, tone: "yellow" },
            { label: "Research reverify", count: researchReverify.length, tone: "yellow" },
            { label: "Manual browser", count: manualBrowser.length, tone: "yellow" },
            { label: "Hidden", count: hidden.length, tone: "stone" },
            { label: "Archive (neg info)", count: archiveNegative.length, tone: "stone" },
            { label: "Total rows", count: totalCount, tone: "stone" },
          ].map((b) => (
            <div
              key={b.label}
              className="rounded border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3"
            >
              <div className="text-xs uppercase tracking-wider text-stone-500 dark:text-slate-400">
                {b.label}
              </div>
              <div className="text-2xl font-semibold mt-1 text-stone-900 dark:text-slate-50">
                {b.count}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-stone-600 dark:text-slate-300">
          Active display: <strong>{activeCount}</strong> ·
          Held: <strong>{heldCount}</strong> ·
          Not active: <strong>{hidden.length + archiveNegative.length}</strong>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold border-b border-stone-200 dark:border-slate-700 pb-1 mb-3">
          Clinical USCE badge distribution ({clinical.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(clinicalBadgeCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([badge, n]) => (
              <span
                key={badge}
                className={`inline-flex items-center rounded border px-2 py-1 text-xs font-semibold ${
                  BADGE_STYLES[badge as DisplayRow["badge"]] ?? ""
                }`}
              >
                {badge} · {n}
              </span>
            ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold border-b border-stone-200 dark:border-slate-700 pb-1 mb-3">
          Hold buckets (need operator action)
        </h2>
        <HoldList title="Outreach hold (phone call needed)" rows={outreach} />
        <HoldList title="Research reverify (operator URL needed)" rows={researchReverify} />
        <HoldList title="Manual browser (in-browser check needed)" rows={manualBrowser} />
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold border-b border-stone-200 dark:border-slate-700 pb-1 mb-3">
          Clinical USCE sample (first 25)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-slate-700 text-left text-xs uppercase tracking-wider text-stone-500 dark:text-slate-400">
                <th className="py-2 pr-3">Institution</th>
                <th className="py-2 pr-3">State</th>
                <th className="py-2 pr-3">Badge</th>
                <th className="py-2 pr-3">SubType</th>
                <th className="py-2 pr-3">Final URL</th>
              </tr>
            </thead>
            <tbody>
              {clinical.slice(0, 25).map((r, i) => (
                <tr key={`${r.programName}-${i}`} className="border-b border-stone-100 dark:border-slate-800">
                  <td className="py-2 pr-3 font-medium">
                    {r.programName}
                    {r.specialtyLimited && (
                      <span className="ml-2 inline-flex items-center rounded border border-fuchsia-300 dark:border-fuchsia-700 bg-fuchsia-50 dark:bg-fuchsia-900/40 text-fuchsia-900 dark:text-fuchsia-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        Specialty: {r.specialtyLimited}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-stone-600 dark:text-slate-400">{r.state}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${
                        BADGE_STYLES[r.badge] ?? ""
                      }`}
                    >
                      {r.badge}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-stone-600 dark:text-slate-400">{r.subType}</td>
                  <td className="py-2 pr-3 text-stone-700 dark:text-slate-300">
                    <a
                      href={r.finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-stone-300 dark:decoration-slate-600 hover:decoration-stone-500 dark:hover:decoration-slate-300"
                    >
                      {r.finalUrl}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-stone-600 dark:text-slate-300">
          Showing 25 of {clinical.length}. Full list in{" "}
          <code className="rounded bg-stone-100 dark:bg-slate-800 dark:text-slate-100 px-1 py-0.5 text-xs">
            display_eligible_clinical_usce.json
          </code>
          .
        </p>
      </section>

      <footer className="mt-12 border-t border-stone-200 dark:border-slate-700 pt-4 text-xs text-stone-500 dark:text-slate-400">
        Generated from{" "}
        <code>
          docs/platform-v2/local/usce-discovery-command-center/p102/exports/
        </code>
        . No production data is read or mutated by this page.{" "}
        <Link href="/usce/verified-preview" className="underline">
          ← Back to verified preview
        </Link>
      </footer>
    </main>
  );
}

function HoldList({ title, rows }: { title: string; rows: DisplayRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-slate-200">{title}</h3>
        <p className="text-sm text-stone-500 dark:text-slate-400 italic">No rows.</p>
      </div>
    );
  }
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-stone-700 dark:text-slate-200">
        {title} ({rows.length})
      </h3>
      <ul className="mt-1 space-y-1 text-sm">
        {rows.map((r, i) => (
          <li key={`${r.programName}-${i}`} className="text-stone-700 dark:text-slate-200">
            <span className="font-medium">{r.programName}</span>
            <span className="text-stone-500 dark:text-slate-400"> — </span>
            <a
              href={r.finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-stone-300 dark:decoration-slate-600 hover:decoration-stone-500 dark:hover:decoration-slate-300"
            >
              {r.finalUrl}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
