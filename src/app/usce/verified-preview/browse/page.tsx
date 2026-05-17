import type { Metadata } from "next";
import Link from "next/link";
import {
  getDisplayEligibleClinical,
  getDisplayEligibleResearch,
  getDisplayEligibilityCounts,
  type DisplayEligibleRow,
} from "@/lib/p102-display-eligible-listings";
import { BrowseCard } from "./browse-card";

/**
 * P102 Local Browse Preview — user-facing browse experience powered by
 * the display-eligibility truth layer. NoIndex, local-only, no Prisma.
 *
 * Routes:
 *   /usce/verified-preview/browse
 *   /usce/verified-preview/browse/[slug]   (detail; co-located)
 *
 * Replaces nothing in production. The existing /browse keeps reading
 * from Prisma; this page exists as a parallel surface to evaluate the
 * cleaned truth layer before any cutover.
 */
export const metadata: Metadata = {
  title: "Browse preview — internal",
  description:
    "Local-only preview of USCEHub browse powered by the cleaned display-eligibility layer. No DB, no production data.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    lane?: "clinical" | "research" | "all";
    subType?: string;
    state?: string;
    badge?: string;
    specialty?: string;
  }>;
}

const SUB_TYPE_OPTIONS = [
  "observership",
  "visiting-student-elective",
  "visiting-student-clerkship",
  "sub-internship",
  "externship",
  "international-visiting-student",
  "multi-rotation",
  "research-postdoc",
];

function filterRows(
  rows: DisplayEligibleRow[],
  params: Awaited<PageProps["searchParams"]>
): DisplayEligibleRow[] {
  const q = (params.q || "").toLowerCase().trim();
  const subType = (params.subType || "").trim();
  const state = (params.state || "").trim().toUpperCase();
  const badge = (params.badge || "").trim().toUpperCase();
  const specialty = (params.specialty || "").trim();

  return rows.filter((r) => {
    if (q) {
      const blob = `${r.programName} ${r.institution} ${r.state}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (subType && r.subType !== subType) return false;
    if (state && (r.state || "").toUpperCase() !== state) return false;
    if (badge && r.badge !== badge) return false;
    if (specialty === "only" && !r.specialtyLimited) return false;
    return true;
  });
}

function uniqStates(rows: DisplayEligibleRow[]): string[] {
  const s = new Set<string>();
  for (const r of rows) if (r.state) s.add(r.state);
  return [...s].sort();
}

export default async function BrowsePreviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const lane = params.lane === "research" ? "research" : params.lane === "all" ? "all" : "clinical";

  const clinical = getDisplayEligibleClinical();
  const research = getDisplayEligibleResearch();
  const counts = getDisplayEligibilityCounts();

  const rowsForLane =
    lane === "research" ? research : lane === "all" ? [...clinical, ...research] : clinical;
  const filtered = filterRows(rowsForLane, params);
  const allStates = uniqStates([...clinical, ...research]);

  return (
    <main className="bg-white dark:bg-slate-950 text-stone-900 dark:text-slate-100 min-h-screen">
      <div className="border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-slate-400">
            Internal preview · noindex · sourced from display-eligibility layer
          </p>
          <h1 className="mt-1 text-2xl font-bold">Source-linked USCE — Browse Preview</h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-slate-400">
            <span className="font-semibold text-stone-900 dark:text-slate-50">
              {counts.CLINICAL_USCE}
            </span>{" "}
            clinical USCE ·{" "}
            <span className="font-semibold text-stone-900 dark:text-slate-50">
              {counts.RESEARCH}
            </span>{" "}
            research · {counts.HIDDEN + counts.ARCHIVE_NEG_INFO} not displayed (hidden / archived).{" "}
            <Link
              href="/usce/verified-preview/display-readiness"
              className="underline decoration-stone-400 dark:decoration-slate-500 hover:text-stone-900 dark:hover:text-white"
            >
              See display-readiness diagnostic →
            </Link>
          </p>

          <nav className="mt-5 flex flex-wrap gap-2" aria-label="Lane">
            {[
              { key: "clinical", label: `Clinical USCE (${clinical.length})` },
              { key: "research", label: `Research (${research.length})` },
              { key: "all", label: `All active (${clinical.length + research.length})` },
            ].map((opt) => {
              const isActive = lane === opt.key;
              return (
                <Link
                  key={opt.key}
                  href={`/usce/verified-preview/browse?lane=${opt.key}`}
                  className={`inline-flex items-center rounded border px-3 py-1 text-sm font-semibold ${
                    isActive
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                      : "border-stone-300 dark:border-slate-600 text-stone-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <form
          method="get"
          className="grid grid-cols-1 gap-3 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 p-4 sm:grid-cols-6"
        >
          <input type="hidden" name="lane" value={lane} />
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Search
            </label>
            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Institution, program, state…"
              className="mt-1 w-full rounded border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-stone-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Type
            </label>
            <select
              name="subType"
              defaultValue={params.subType || ""}
              className="mt-1 w-full rounded border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-stone-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              {SUB_TYPE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              State
            </label>
            <select
              name="state"
              defaultValue={params.state || ""}
              className="mt-1 w-full rounded border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-stone-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              {allStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Source
            </label>
            <select
              name="badge"
              defaultValue={params.badge || ""}
              className="mt-1 w-full rounded border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-stone-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              <option value="DIRECT">Direct</option>
              <option value="REORIENTED">Reoriented</option>
              <option value="PROTECTED">Protected</option>
              <option value="RESEARCH">Research</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Specialty
            </label>
            <select
              name="specialty"
              defaultValue={params.specialty || ""}
              className="mt-1 w-full rounded border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-stone-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              <option value="only">Specialty-limited only</option>
            </select>
          </div>
          <div className="flex items-end gap-2 sm:col-span-6">
            <button
              type="submit"
              className="rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-1.5 text-sm font-semibold hover:bg-slate-700 dark:hover:bg-white"
            >
              Apply
            </button>
            <Link
              href={`/usce/verified-preview/browse?lane=${lane}`}
              className="text-sm text-stone-500 dark:text-slate-400 hover:underline"
            >
              Reset
            </Link>
            <span className="ml-auto text-sm text-stone-500 dark:text-slate-400">
              {filtered.length} {filtered.length === 1 ? "row" : "rows"} match
            </span>
          </div>
        </form>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) => (
            <BrowseCard key={`${r.programName}-${r.state}-${i}`} row={r} />
          ))}
        </section>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-sm text-stone-500 dark:text-slate-400">
            No rows match these filters.{" "}
            <Link
              href={`/usce/verified-preview/browse?lane=${lane}`}
              className="underline"
            >
              Reset
            </Link>
            .
          </p>
        )}
      </div>

      <footer className="mt-12 border-t border-stone-200 dark:border-slate-800 px-4 py-6 text-xs text-stone-500 dark:text-slate-400">
        <div className="mx-auto max-w-7xl">
          Source-linked browse preview. Each card links to the institution&apos;s
          own official source page; we do not host or substitute their content.
          Last reviewed locally on 2026-05-17. No production data is read or
          mutated by this page.
        </div>
      </footer>
    </main>
  );
}
