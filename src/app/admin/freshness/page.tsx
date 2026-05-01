export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

/**
 * /admin/freshness — read-only data-quality dashboard.
 *
 * Aggregates over `Listing` + `DataVerification` to show admins what
 * needs attention: never-verified rows, stale rows, recent failures,
 * top hostnames, listings missing source URLs.
 *
 * Read-only. No mutations, no buttons that trigger cron, no
 * publish/hide actions. Existing admin routes remain the place for
 * write actions.
 */
export default async function AdminFreshnessPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  // Server component runs per-request; "now" is fixed for the render.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const days30 = new Date(now - 30 * oneDay);
  const days60 = new Date(now - 60 * oneDay);
  const days90 = new Date(now - 90 * oneDay);

  const approved = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      title: true,
      state: true,
      listingType: true,
      websiteUrl: true,
      sourceUrl: true,
      applicationUrl: true,
      linkVerificationStatus: true,
      lastVerifiedAt: true,
      lastVerificationAttemptAt: true,
      verificationFailureReason: true,
      updatedAt: true,
    },
  });

  const total = approved.length;

  // Status counts
  const statusCounts: Record<string, number> = {};
  for (const l of approved) {
    statusCounts[l.linkVerificationStatus] =
      (statusCounts[l.linkVerificationStatus] || 0) + 1;
  }

  // Freshness buckets
  const neverVerified = approved.filter((l) => !l.lastVerifiedAt).length;
  const stale90 = approved.filter(
    (l) => l.lastVerifiedAt && l.lastVerifiedAt < days90
  ).length;
  const stale60 = approved.filter(
    (l) => l.lastVerifiedAt && l.lastVerifiedAt < days60 && l.lastVerifiedAt >= days90
  ).length;
  const stale30 = approved.filter(
    (l) => l.lastVerifiedAt && l.lastVerifiedAt < days30 && l.lastVerifiedAt >= days60
  ).length;
  const fresh = approved.filter(
    (l) => l.lastVerifiedAt && l.lastVerifiedAt >= days30
  ).length;

  // URL coverage
  const noUrl = approved.filter(
    (l) => !l.sourceUrl?.trim() && !l.applicationUrl?.trim() && !l.websiteUrl?.trim()
  );
  const noSourceUrl = approved.filter((l) => !l.sourceUrl?.trim()).length;
  const noApplicationUrl = approved.filter((l) => !l.applicationUrl?.trim()).length;

  // Generic-homepage detection (URL-pattern only — same heuristic as
  // P96_DATA_QUALITY_BASELINE).
  function isGeneric(url: string | null | undefined): boolean {
    if (!url) return false;
    try {
      const path = new URL(url).pathname.toLowerCase();
      if (path === "/" || path === "") return true;
      return /^\/(home|about|index|main|visit)\/?$/.test(path);
    } catch {
      return false;
    }
  }
  const generic = approved.filter((l) => isGeneric(l.sourceUrl) || isGeneric(l.websiteUrl));

  // Top hostnames
  function hostOf(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return null;
    }
  }
  const hostCounts = new Map<string, number>();
  for (const l of approved) {
    const host = hostOf(l.sourceUrl) || hostOf(l.websiteUrl);
    if (host) hostCounts.set(host, (hostCounts.get(host) || 0) + 1);
  }
  const topHosts = Array.from(hostCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Recent failures (last 14 days)
  const recentFailureRows = approved
    .filter(
      (l) =>
        l.linkVerificationStatus === "NEEDS_MANUAL_REVIEW" ||
        l.linkVerificationStatus === "SOURCE_DEAD"
    )
    .sort((a, b) => {
      const aT = a.lastVerificationAttemptAt?.getTime() || 0;
      const bT = b.lastVerificationAttemptAt?.getTime() || 0;
      return bT - aT;
    })
    .slice(0, 20);

  // Recent auto-flag AdminMessages
  const recentAutoFlags = await prisma.adminMessage.findMany({
    where: { category: "cron_verification_failure" },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, subject: true, body: true, createdAt: true, status: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Freshness</h1>
        <p className="mt-1 text-sm text-slate-500">
          Read-only data-quality dashboard for the verification queue.
          Aggregates from Listing + DataVerification + AdminMessage.
        </p>
      </div>

      <section>
        <h2 className="mb-2 text-base font-semibold text-slate-900">
          Totals
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Approved listings", value: total },
            { label: "Fresh (≤ 30 days)", value: fresh },
            { label: "Stale 30–60 days", value: stale30 },
            { label: "Stale 60–90 days", value: stale60 },
            { label: "Stale > 90 days", value: stale90 },
            { label: "Never verified", value: neverVerified },
            { label: "No URL on file", value: noUrl.length },
            { label: "Generic-homepage URL", value: generic.length },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-md border border-slate-200 bg-white px-4 py-3"
            >
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-slate-900">
          Verification status counts
        </h2>
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(statusCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => (
                  <tr key={k} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono text-xs">{k}</td>
                    <td className="px-4 py-2">{v}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-slate-900">
          URL coverage
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Missing sourceUrl", value: noSourceUrl },
            { label: "Missing applicationUrl", value: noApplicationUrl },
            { label: "No URL at all", value: noUrl.length },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-md border border-slate-200 bg-white px-4 py-3"
            >
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-slate-900">
          Top hostnames (by approved-listing count)
        </h2>
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2">Host</th>
                <th className="px-4 py-2">Listings</th>
              </tr>
            </thead>
            <tbody>
              {topHosts.map(([host, n]) => (
                <tr key={host} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-mono text-xs">{host}</td>
                  <td className="px-4 py-2">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-slate-900">
          Recent failures (NEEDS_MANUAL_REVIEW / SOURCE_DEAD)
        </h2>
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2">Listing</th>
                <th className="px-4 py-2">State</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Attempted</th>
              </tr>
            </thead>
            <tbody>
              {recentFailureRows.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">
                    <Link
                      href={`/listing/${l.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {l.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{l.state}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {l.linkVerificationStatus}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {l.verificationFailureReason || "—"}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {l.lastVerificationAttemptAt
                      ? l.lastVerificationAttemptAt.toISOString().slice(0, 10)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-slate-900">
          Recent auto-flags (cron_verification_failure)
        </h2>
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentAutoFlags.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-3 text-xs text-slate-500"
                    colSpan={3}
                  >
                    No cron auto-flags in the database.
                  </td>
                </tr>
              ) : (
                recentAutoFlags.map((m) => (
                  <tr key={m.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{m.subject}</td>
                    <td className="px-4 py-2 font-mono text-xs">{m.status}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {m.createdAt.toISOString().slice(0, 10)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-slate-400">
        Read-only view. To act on a row, use the Verification Queue,
        Flags, or User Messages admin tabs.
      </p>
    </div>
  );
}
