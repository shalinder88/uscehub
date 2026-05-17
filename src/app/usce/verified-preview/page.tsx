import type { Metadata } from "next";
import Link from "next/link";
import {
  getDisplayEligibleClinical,
  getDisplayEligibleResearch,
  getDisplayEligibilityCounts,
  type DisplayEligibleRow,
} from "@/lib/p102-display-eligible-listings";
import { BrowseCard } from "./browse/browse-card";
import { ListingDisclaimer } from "@/components/listings/listing-disclaimer";

/**
 * P102 Verified-Preview Listing Page.
 *
 * REWIRED 2026-05-17 (Shape C cutover) to read directly from the
 * display-eligibility truth layer instead of the older three-source
 * snapshot merger. Every preview surface plus production `/browse`
 * now share one source of truth — drift is impossible.
 *
 * Reads:
 *   - getDisplayEligibleClinical() → 167 rows
 *   - getDisplayEligibleResearch() → 9 rows
 *   - hidden / outreach / research-reverify / manual-browser /
 *     negative-info: excluded by construction
 *
 * Backward compatibility:
 *   - /usce/verified-preview/[rowId]  (snapshot-based legacy detail) — left intact
 *   - /usce/verified-preview/admin/*  (admin reviewer flow on the CSV) — left intact
 *   - getAllPreviewRows() / getPreviewSummary() — still exported; the
 *     legacy detail + admin surfaces import them
 *
 * Does NOT mutate the Prisma `listing` table.
 * Does NOT change `/browse`.
 *
 * SEO: noindex.
 */
export const metadata: Metadata = {
  title: "Source-linked USCE preview — internal",
  description:
    "Internal preview of source-linked USCE opportunities sourced from the display-eligibility truth layer (Shape C). Each card carries a verified URL and a source-classification badge.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const dynamic = "force-dynamic";

interface SearchParams {
  audience?: string;
  state?: string;
  type?: string;
  lane?: "clinical" | "research" | "all";
  q?: string;
  badge?: string;
  specialty?: string;
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
  params: SearchParams
): DisplayEligibleRow[] {
  const q = (params.q || "").toLowerCase().trim();
  const subType = (params.type || "").trim();
  const state = (params.state || "").trim().toUpperCase();
  const badge = (params.badge || "").trim().toUpperCase();
  const specialty = (params.specialty || "").trim();

  return rows.filter((r) => {
    if (q) {
      const blob = `${r.programName} ${r.institution} ${r.state}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (subType && r.subType !== subType) return false;
    if (state && state !== "ALL" && (r.state || "").toUpperCase() !== state) return false;
    if (badge && badge !== "ALL" && r.badge !== badge) return false;
    if (specialty === "only" && !r.specialtyLimited) return false;
    return true;
  });
}

function uniqStates(rows: DisplayEligibleRow[]): string[] {
  const s = new Set<string>();
  for (const r of rows) if (r.state) s.add(r.state);
  return [...s].sort();
}

export default async function VerifiedPreviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const lane: "clinical" | "research" | "all" =
    params.lane === "research" ? "research" : params.lane === "all" ? "all" : "clinical";

  const clinical = getDisplayEligibleClinical();
  const research = getDisplayEligibleResearch();
  const counts = getDisplayEligibilityCounts();

  const laneRows =
    lane === "research" ? research : lane === "all" ? [...clinical, ...research] : clinical;
  const filtered = filterRows(laneRows, params);
  const allStates = uniqStates([...clinical, ...research]);
  const activeFilters = [
    params.q,
    params.type,
    params.state && params.state !== "all" ? params.state : null,
    params.badge,
    params.specialty,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Internal preview · not indexed · sourced from display-eligibility truth layer
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Source-linked USCE preview
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {counts.CLINICAL_USCE}
          </span>{" "}
          clinical USCE ·{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {counts.RESEARCH}
          </span>{" "}
          research ·{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {counts.HIDDEN + counts.ARCHIVE_NEG_INFO}
          </span>{" "}
          not displayed (hidden / archived).
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Related surfaces:{" "}
          <Link href="/browse" className="underline hover:text-slate-900 dark:hover:text-slate-100">
            production /browse
          </Link>
          {" · "}
          <Link
            href="/usce/verified-preview/browse"
            className="underline hover:text-slate-900 dark:hover:text-slate-100"
          >
            /usce/verified-preview/browse
          </Link>
          {" · "}
          <Link
            href="/usce/verified-preview/display-readiness"
            className="underline hover:text-slate-900 dark:hover:text-slate-100"
          >
            /usce/verified-preview/display-readiness
          </Link>
        </p>
      </header>

      <ListingDisclaimer className="mb-5" />

      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Lane">
        {[
          { key: "clinical", label: `Clinical USCE (${clinical.length})` },
          { key: "research", label: `Research (${research.length})` },
          { key: "all", label: `All active (${clinical.length + research.length})` },
        ].map((opt) => {
          const isActive = lane === opt.key;
          return (
            <Link
              key={opt.key}
              href={`/usce/verified-preview?lane=${opt.key}`}
              className={`inline-flex items-center rounded border px-3 py-1 text-sm font-semibold ${
                isActive
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                  : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </nav>

      <form
        method="get"
        className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 sm:grid-cols-6"
      >
        <input type="hidden" name="lane" value={lane} />
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Search
          </label>
          <input
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Institution, program, state…"
            className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Type
          </label>
          <select
            name="type"
            defaultValue={params.type || ""}
            className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
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
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            State
          </label>
          <select
            name="state"
            defaultValue={params.state || ""}
            className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
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
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Source
          </label>
          <select
            name="badge"
            defaultValue={params.badge || ""}
            className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
          >
            <option value="">Any</option>
            <option value="DIRECT">Direct</option>
            <option value="REORIENTED">Reoriented</option>
            <option value="PROTECTED">Protected</option>
            <option value="RESEARCH">Research</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Specialty
          </label>
          <select
            name="specialty"
            defaultValue={params.specialty || ""}
            className="mt-1 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
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
            href={`/usce/verified-preview?lane=${lane}`}
            className="text-sm text-slate-500 dark:text-slate-400 hover:underline"
          >
            Reset
          </Link>
          <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} {filtered.length === 1 ? "row" : "rows"} match
            {activeFilters > 0 ? ` · ${activeFilters} filter${activeFilters === 1 ? "" : "s"} active` : ""}
          </span>
        </div>
      </form>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r, i) => (
          <BrowseCard key={`${r.programName}-${r.state}-${i}`} row={r} />
        ))}
      </section>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
          No rows match these filters.{" "}
          <Link
            href={`/usce/verified-preview?lane=${lane}`}
            className="underline"
          >
            Reset
          </Link>
          .
        </p>
      )}

      <footer className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-4 text-xs text-slate-500 dark:text-slate-400">
        Sourced from the display-eligibility truth layer (Shape C
        regeneration). Each card links to the institution&apos;s own official
        source page; we do not host or substitute their content. Last
        reviewed locally on 2026-05-17.
      </footer>
    </div>
  );
}
