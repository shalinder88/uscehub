import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllApprovedRows,
  getSnapshotMetadata,
} from "@/lib/p102-approved-usce";
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

export const dynamic = "force-static";

export default function VerifiedPreviewPage() {
  const rows = getAllApprovedRows();
  const meta = getSnapshotMetadata();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Internal preview · not indexed
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Source-linked USCE preview
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          {rows.length} quote-backed opportunity{rows.length === 1 ? "" : "s"} from {meta.summary.institutions} institutions. Each row was extracted from the official institution source page and held to{" "}
          <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-700">
            PUBLIC_SAFE_USCE
          </code>{" "}
          by the framework&apos;s safety discipline. Auto-approved: {meta.summary.autoApproved}; reviewer-approved: {meta.summary.reviewerApproved}.
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
          Snapshot synced: {meta.syncedAt.slice(0, 10)} · canonical updated:{" "}
          {meta.canonicalGeneratedAt.slice(0, 10)}
        </p>
      </header>

      <ListingDisclaimer className="mb-6" />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          No approved rows in the static snapshot. Run{" "}
          <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-700">
            npx tsx scripts/p102-build-approved-public-safe-export.ts
          </code>{" "}
          then{" "}
          <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-700">
            npx tsx scripts/p102-sync-approved-rows-to-website.ts
          </code>
          .
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <P102PreviewListingCard key={row.rowId} row={row} />
          ))}
        </div>
      )}

      <footer className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-500">
        <p>
          This is an internal preview route. Production listings are served by{" "}
          <Link href="/browse" className="underline">
            /browse
          </Link>{" "}
          and read from the Prisma listing table. Preview rows are not yet
          promoted into the production data path.
        </p>
      </footer>
    </div>
  );
}
