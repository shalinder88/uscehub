import type { Metadata } from "next";
import Link from "next/link";
import { getSnapshotMetadata } from "@/lib/p102-approved-usce";
import {
  getAllPreviewRows,
  getPreviewSummary,
  PREVIEW_SOURCE_LABELS,
} from "@/lib/p102-preview-rows";
import { P102PreviewListingCard } from "@/components/listings/p102-preview-listing-card";
import { ListingDisclaimer } from "@/components/listings/listing-disclaimer";

/**
 * P102 Verified-Preview Listing Page.
 *
 * Local preview ONLY. Reads from the build-time static snapshot
 *   src/data/generated/p102-approved-usce.generated.json
 * which is synced from the canonical approved-export.
 *
 * Does NOT touch the Prisma `listing` table. Does NOT replace `/browse`.
 * This is a parallel preview route the team uses to evaluate the
 * source-linked corpus before deciding whether to promote into Prisma.
 *
 * SEO: noindex via robots meta + no canonical override. We do NOT want
 * search engines indexing the preview surface until rows are
 * one-time-promoted into the real listings flow.
 */
export const metadata: Metadata = {
  title: "Source-linked USCE preview — internal",
  description:
    "Internal preview of source-linked, quote-backed USCE opportunities. Each row carries a verbatim quote from the official institution source page.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

// Force dynamic so live JSON edits (intelligent + exact-seed rows) appear
// without a rebuild during local review.
export const dynamic = "force-dynamic";

interface SearchParams {
  audience?: string;
  state?: string;
  type?: string;
}

export default async function VerifiedPreviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const search = await searchParams;
  const allRows = getAllPreviewRows();
  const summary = getPreviewSummary();
  const snapshotMeta = getSnapshotMetadata();

  // Collect filter options from all rows
  const allStates = [...new Set(allRows.map((r) => r.state).filter(Boolean))].sort();
  const allAudiences = [...new Set(allRows.map((r) => r.audience).filter((a): a is string => !!a))];
  const allTypes = [...new Set(allRows.map((r) => r.opportunityType))];

  // Apply filters
  const rows = allRows.filter((r) => {
    if (search.audience && search.audience !== "all" && r.audience !== search.audience) return false;
    if (search.state && search.state !== "all" && r.state !== search.state) return false;
    if (search.type && search.type !== "all" && r.opportunityType !== search.type) return false;
    return true;
  });

  const activeFilters = [search.audience, search.state, search.type].filter(
    (v) => v && v !== "all",
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Internal preview · not indexed
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Source-linked USCE opportunities
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          {summary.total} quote-backed opportunit{summary.total === 1 ? "y" : "ies"} from {summary.institutions} institutions. Each row was extracted directly from an official institution source page, with a verbatim quote, audience classification, and direct-link validation.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {summary.bySource.AUTO_REVIEWED} {PREVIEW_SOURCE_LABELS.AUTO_REVIEWED}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            {summary.bySource.EXACT_SEED} {PREVIEW_SOURCE_LABELS.EXACT_SEED}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            {summary.bySource.INTELLIGENT_GATE} {PREVIEW_SOURCE_LABELS.INTELLIGENT_GATE}
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
          Reviewer snapshot synced: {snapshotMeta.syncedAt.slice(0, 10)} · merged at render time
        </p>
      </header>

      <ListingDisclaimer className="mb-6" />

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
      >
        <FilterSelect
          name="audience"
          label="Audience"
          value={search.audience ?? "all"}
          options={[
            { value: "all", label: `All audiences (${allRows.length})` },
            ...allAudiences.map((a) => ({
              value: a,
              label: `${audienceShortLabel(a)} (${allRows.filter((r) => r.audience === a).length})`,
            })),
          ]}
        />
        <FilterSelect
          name="state"
          label="State"
          value={search.state ?? "all"}
          options={[
            { value: "all", label: `All states (${allStates.length})` },
            ...allStates.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          name="type"
          label="Type"
          value={search.type ?? "all"}
          options={[
            { value: "all", label: "All types" },
            ...allTypes.map((t) => ({ value: t, label: prettyType(t) })),
          ]}
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          Apply
        </button>
        {activeFilters > 0 ? (
          <Link
            href="/usce/verified-preview"
            className="text-sm text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
          >
            Clear filters
          </Link>
        ) : null}
        <span className="ml-auto text-sm text-slate-600 dark:text-slate-400">
          Showing <strong>{rows.length}</strong> of {allRows.length}
        </span>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          No rows match the current filters. <Link href="/usce/verified-preview" className="underline">Clear filters</Link> to see everything.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <P102PreviewListingCard key={row.rowId} row={row} />
          ))}
        </div>
      )}

      <footer className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-500" id="footer">
        <p>
          This is an internal preview route. Production listings are served by{" "}
          <Link href="/browse" className="underline">
            /browse
          </Link>{" "}
          and read from the Prisma listing table. Preview rows are not yet
          promoted into the production data path.
        </p>
        {process.env.NODE_ENV !== "production" ? (
          <p className="mt-3">
            Reviewer admin (dev-only):{" "}
            <Link
              href="/usce/verified-preview/admin/review"
              className="underline"
            >
              /usce/verified-preview/admin/review
            </Link>
          </p>
        ) : null}
      </footer>
    </div>
  );
}

function FilterSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function audienceShortLabel(a: string): string {
  switch (a) {
    case "us-md-do": return "US MD/DO visiting students";
    case "international": return "International medical students";
    case "img-observer": return "IMG observers";
    default: return a;
  }
}

function prettyType(t: string): string {
  switch (t) {
    case "OBSERVERSHIP": return "Observership";
    case "VISITING_MEDICAL_STUDENT": return "Visiting Medical Student";
    case "CLINICAL_ELECTIVE": return "Clinical Elective";
    case "SUB_INTERNSHIP": return "Sub-Internship";
    case "AWAY_ROTATION": return "Away Rotation";
    case "INTERNATIONAL_VISITING_STUDENT": return "International Visiting Student";
    case "RESEARCH_OPPORTUNITY": return "Research";
    case "EXTERNSHIP": return "Externship";
    default: return t;
  }
}
