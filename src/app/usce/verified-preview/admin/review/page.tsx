import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readDecisions, DECISION_LABEL, type ReviewerDecision } from "@/lib/p102-review-csv";
import { rebuildAndSyncExports } from "../_actions";
import { Badge } from "@/components/ui/badge";

/**
 * P102 Reviewer Admin — list view.
 *
 * Local-only. 404 in production. Shows every row from the canonical
 * decisions CSV with current decision + quick-link to edit each row.
 *
 * Sorted by priorityScore (desc) so the highest-leverage rows come
 * first — same prioritization the human reviewer would follow in CSV.
 */
export const metadata: Metadata = {
  title: "P102 Reviewer admin — internal",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function decisionVariant(d: string): "approved" | "rejected" | "pending" | "hidden" | "default" {
  switch (d as ReviewerDecision) {
    case "APPROVE_PUBLIC_SAFE":
      return "approved";
    case "REJECT_NOT_USCE":
    case "REJECT_SCOPE_MISMATCH":
    case "REJECT_OFF_DOMAIN_NO_APPLICABILITY":
    case "DUPLICATE_OF_APPROVED_ROW":
      return "rejected";
    case "NEEDS_MORE_EVIDENCE":
    case "FUTURE_LANE_ONLY":
      return "pending";
    case "KEEP_HUMAN_REVIEW":
      return "default";
    default:
      return "default";
  }
}

export default async function ReviewListPage({
  searchParams,
}: {
  searchParams: Promise<{ rebuilt?: string; error?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const params = await searchParams;
  const { csvPath, rows } = readDecisions();

  // Sort by priorityScore desc (top of the queue first).
  const sortedRows = [...rows].sort(
    (a, b) =>
      Number(b.priorityScore || 0) - Number(a.priorityScore || 0) ||
      a.institutionName.localeCompare(b.institutionName),
  );

  // Decision counts
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.reviewerDecision] = (counts[r.reviewerDecision] ?? 0) + 1;
  const approvedCount = counts.APPROVE_PUBLIC_SAFE ?? 0;
  const rejectedCount =
    (counts.REJECT_NOT_USCE ?? 0) +
    (counts.REJECT_SCOPE_MISMATCH ?? 0) +
    (counts.REJECT_OFF_DOMAIN_NO_APPLICABILITY ?? 0) +
    (counts.DUPLICATE_OF_APPROVED_ROW ?? 0);
  const deferredCount =
    (counts.NEEDS_MORE_EVIDENCE ?? 0) + (counts.FUTURE_LANE_ONLY ?? 0);
  const keepCount = counts.KEEP_HUMAN_REVIEW ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Internal admin · not indexed · dev-only
      </div>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            P102 Review Queue
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            {rows.length} entries. Editing here writes directly to{" "}
            <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-700">
              {csvPath.replace(process.cwd() + "/", "")}
            </code>
            . Click <strong>Review</strong> on any row. After making
            decisions, run the rebuild action to refresh the approved export
            and re-sync the website snapshot.
          </p>
        </div>
        <form action={rebuildAndSyncExports}>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Rebuild approved export &amp; sync website
          </button>
        </form>
      </header>

      {params.rebuilt === "1" ? (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          Rebuild + sync complete. Reload <Link href="/usce/verified-preview" className="underline">/usce/verified-preview</Link> to see updated rows.
        </div>
      ) : null}
      {params.error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200">
          {params.error}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Approved" value={approvedCount} variant="approved" />
        <Stat label="Rejected" value={rejectedCount} variant="rejected" />
        <Stat label="Deferred" value={deferredCount} variant="pending" />
        <Stat label="Pending review" value={keepCount} variant="default" />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-700/40 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Pri</th>
              <th className="px-3 py-2">Institution</th>
              <th className="px-3 py-2">Scope</th>
              <th className="px-3 py-2">Deep family</th>
              <th className="px-3 py-2">Quote (preview)</th>
              <th className="px-3 py-2">Decision</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {sortedRows.map((r, idx) => (
              <tr
                key={r.reviewId}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/40"
              >
                <td className="px-3 py-2 text-xs text-slate-400">{idx + 1}</td>
                <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                  {r.priorityScore}
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {r.institutionName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {r.city}, {r.state}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                  {r.sourceScope}
                </td>
                <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                  {r.deepSourceFamily}
                </td>
                <td className="max-w-md px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="line-clamp-2">{r.quote}</span>
                </td>
                <td className="px-3 py-2">
                  <Badge variant={decisionVariant(r.reviewerDecision)}>
                    {(DECISION_LABEL as Record<string, string>)[r.reviewerDecision] ?? r.reviewerDecision}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/usce/verified-preview/admin/review/${r.reviewId}`}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400 dark:hover:text-slate-50"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-8 text-xs text-slate-500 dark:text-slate-500">
        Source-of-truth CSV:{" "}
        <code className="rounded bg-slate-100 px-1 dark:bg-slate-700">
          {csvPath.replace(process.cwd() + "/", "")}
        </code>
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "approved" | "rejected" | "pending" | "default";
}) {
  const cls =
    variant === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
      : variant === "rejected"
        ? "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200"
        : variant === "pending"
          ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
          : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
  return (
    <div className={`rounded-lg border px-4 py-3 ${cls}`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
