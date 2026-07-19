export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  resolveInstitutionContext,
  getInstitutionAnalytics,
} from "@/lib/institution";
import { LISTING_TYPE_LABELS } from "@/lib/utils";
import {
  Building2,
  Eye,
  Bookmark,
  FileText,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Users,
  Plus,
} from "lucide-react";

const n = (v: number) => v.toLocaleString("en-US");
const pct = (num: number, den: number) =>
  den > 0 ? Math.round((num / den) * 100) : 0;

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  COORDINATOR: "Coordinator",
  VIEWER: "Viewer",
};

const STATUS_TONE: Record<string, string> = {
  APPROVED: "var(--teal)",
  PENDING: "#b45309",
  REJECTED: "#b91c1c",
  HIDDEN: "var(--text-muted)",
  PAUSED: "var(--text-muted)",
};

const PIPELINE_STAGES: { key: string; label: string }[] = [
  { key: "SUBMITTED", label: "New" },
  { key: "UNDER_REVIEW", label: "In review" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "COMPLETED", label: "Completed" },
  { key: "REJECTED", label: "Declined" },
];

export default async function InstitutionOverview() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const ctx = await resolveInstitutionContext(session.user.id);

  if (!ctx) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "var(--teal-soft)" }}
        >
          <Building2 className="h-7 w-7" style={{ color: "var(--teal)" }} />
        </div>
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
        >
          Set up your institution
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: "var(--ink-soft)" }}>
          Create your organization profile to start posting clinical
          opportunities and managing candidates from one dashboard.
        </p>
        <Link
          href="/poster/organization"
          className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--teal)" }}
        >
          <Plus className="h-4 w-4" /> Create organization
        </Link>
      </div>
    );
  }

  const a = await getInstitutionAnalytics(ctx.org.id);
  const badges = ctx.org.badges ? ctx.org.badges.split(",").filter(Boolean) : [];
  const verified = ctx.org.verificationStatus === "APPROVED";
  const maxFunnel = Math.max(...a.funnel.map((f) => f.value), 1);

  // Where applicants actually go to apply, most-common first.
  const applyRoutes = Object.entries(
    a.listings.reduce<Record<string, number>>((acc, l) => {
      const key = l.applicationMethod?.trim() || "not specified";
      const label = key.length > 28 ? `${key.slice(0, 28)}…` : key;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([method, count]) => ({ method, count }))
    .sort((x, y) => y.count - x.count)
    .slice(0, 5);

  // Only surface applicant metrics when applications can actually land here.
  // Otherwise show what genuinely moves: reach, saved interest, and how
  // current the source links are.
  const kpis = a.pipelineActive
    ? [
        { label: "Active listings", value: a.totals.activeListings, sub: `${a.totals.totalListings} total`, icon: Building2 },
        { label: "Total views", value: a.totals.views, sub: "across all listings", icon: Eye },
        { label: "Applicants", value: a.totals.applications, sub: `${a.totals.saves} saved`, icon: FileText },
        { label: "Accepted", value: a.totals.accepted, sub: `${pct(a.totals.accepted, a.totals.applications)}% of applicants`, icon: CheckCircle2 },
      ]
    : [
        { label: "Active listings", value: a.totals.activeListings, sub: `${a.totals.totalListings} total`, icon: Building2 },
        { label: "Total views", value: a.totals.views, sub: "across all listings", icon: Eye },
        { label: "Saved by applicants", value: a.totals.saves, sub: `${pct(a.totals.saves, a.totals.views)}% of viewers`, icon: Bookmark },
        { label: "Source verified", value: a.freshness.verified, sub: a.freshness.unverified > 0 ? `${a.freshness.unverified} need a check` : "all links current", icon: ShieldCheck },
      ];

  return (
    <div className="space-y-8">
      {/* Institution header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Institution Dashboard
          </p>
          <h1
            className="mt-1 text-3xl"
            style={{ fontFamily: "var(--font-serif)", color: "var(--ink)", letterSpacing: "-0.01em" }}
          >
            {ctx.org.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            {ctx.org.type && <span>{ctx.org.type}</span>}
            <span aria-hidden>·</span>
            <span>{ctx.org.city}, {ctx.org.state}</span>
            {verified && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ background: "var(--teal-soft)", color: "var(--teal-deep)" }}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
          </div>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: "var(--paper-soft)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}
        >
          {ROLE_LABEL[ctx.role] ?? ctx.role} access
        </span>
      </header>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl p-5"
            style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {k.label}
              </p>
              <k.icon className="h-4 w-4" style={{ color: "var(--teal)" }} />
            </div>
            <p className="mt-2 text-3xl" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
              {n(k.value)}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Conversion funnel */}
        <section
          className="rounded-2xl p-6 lg:col-span-3"
          style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
        >
          <h2 className="text-lg" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
            {a.pipelineActive ? "Candidate funnel" : "Interest"}
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {a.pipelineActive
              ? "How interest converts into accepted candidates."
              : "How many people find your programs and save them for later."}
          </p>
          <div className="mt-5 space-y-4">
            {a.funnel.map((step, i) => {
              const prev = i > 0 ? a.funnel[i - 1].value : null;
              return (
                <div key={step.label}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span style={{ color: "var(--ink)" }}>{step.label}</span>
                    <span className="tabular-nums" style={{ color: "var(--ink-soft)" }}>
                      {n(step.value)}
                      {prev !== null && (
                        <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
                          {pct(step.value, prev)}% of prev
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-band)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max((step.value / maxFunnel) * 100, 1.5)}%`,
                        background: "var(--teal)",
                        opacity: 1 - i * 0.16,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pipeline snapshot — only when applications can actually arrive here.
            Otherwise show how applicants really reach this institution. */}
        {a.pipelineActive ? (
          <section
            className="rounded-2xl p-6 lg:col-span-2"
            style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
                Pipeline
              </h2>
              <Link
                href="/poster/applications"
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: "var(--teal)" }}
              >
                Review <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-4 space-y-2.5">
              {PIPELINE_STAGES.map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--ink-soft)" }}>{s.label}</span>
                  <span
                    className="min-w-[2rem] rounded-md px-2 py-0.5 text-center text-sm font-semibold tabular-nums"
                    style={{ background: "var(--paper-soft)", border: "1px solid var(--line)", color: "var(--ink)" }}
                  >
                    {n(a.pipeline[s.key] ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section
            className="rounded-2xl p-6 lg:col-span-2"
            style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <h2 className="text-lg" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
              How applicants reach you
            </h2>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
              Applications are made on your own site, not on USCEHub.
            </p>
            <div className="mt-4 space-y-2.5">
              {applyRoutes.map((r) => (
                <div key={r.method} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--ink-soft)" }}>{r.method}</span>
                  <span
                    className="min-w-[2rem] rounded-md px-2 py-0.5 text-center text-sm font-semibold tabular-nums"
                    style={{ background: "var(--paper-soft)", border: "1px solid var(--line)", color: "var(--ink)" }}
                  >
                    {n(r.count)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
              Keeping these links current is the most valuable thing you can do
              here — {n(a.freshness.verified)} of {n(a.totals.totalListings)} are
              verified{a.freshness.lastCheckedAt ? `, last checked ${a.freshness.lastCheckedAt.slice(0, 10)}` : ""}.
            </p>
          </section>
        )}
      </div>

      {/* Listings performance */}
      <section
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
      >
        <div className="flex items-center justify-between p-6 pb-3">
          <h2 className="text-lg" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
            Listing performance
          </h2>
          <Link href="/poster/listings" className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--teal)" }}>
            All listings <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {a.listings.length === 0 ? (
          <div className="p-6 pt-0 text-sm" style={{ color: "var(--text-muted)" }}>
            No listings yet.{" "}
            <Link href="/poster/listings/new" style={{ color: "var(--teal)" }}>Create your first listing</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: "var(--text-muted)" }} className="text-left text-xs uppercase tracking-wide">
                  <th className="px-6 py-2 font-medium">Listing</th>
                  <th className="px-3 py-2 text-right font-medium">Views</th>
                  <th className="px-3 py-2 text-right font-medium">Saved</th>
                  {a.pipelineActive ? (
                    <>
                      <th className="px-3 py-2 text-right font-medium">Applied</th>
                      <th className="px-3 py-2 text-right font-medium">Accepted</th>
                    </>
                  ) : (
                    <>
                      <th className="px-3 py-2 text-right font-medium">Apply via</th>
                      <th className="px-3 py-2 text-right font-medium">Last checked</th>
                    </>
                  )}
                  <th className="px-6 py-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {a.listings.map((l) => (
                  <tr key={l.id} style={{ borderTop: "1px solid var(--line)" }}>
                    <td className="px-6 py-3">
                      <Link href={`/poster/listings/${l.id}/edit`} className="font-medium hover:underline" style={{ color: "var(--ink)" }}>
                        {l.title}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span>{LISTING_TYPE_LABELS[l.listingType] ?? l.listingType}</span>
                        {l.linkVerified && (
                          <span className="inline-flex items-center gap-0.5" style={{ color: "var(--teal-deep)" }}>
                            <ShieldCheck className="h-3 w-3" /> source verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--ink-soft)" }}>{n(l.views)}</td>
                    <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--ink-soft)" }}>{n(l.saves)}</td>
                    {a.pipelineActive ? (
                      <>
                        <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--ink-soft)" }}>{n(l.applications)}</td>
                        <td className="px-3 py-3 text-right tabular-nums font-semibold" style={{ color: "var(--ink)" }}>{n(l.accepted)}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-3 text-right" style={{ color: "var(--ink-soft)" }}>{l.applicationMethod || "—"}</td>
                        <td className="px-3 py-3 text-right tabular-nums" style={{ color: l.lastVerifiedAt ? "var(--ink-soft)" : "var(--text-muted)" }}>
                          {l.lastVerifiedAt ? l.lastVerifiedAt.slice(0, 10) : "never"}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: STATUS_TONE[l.status] ?? "var(--ink-soft)" }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_TONE[l.status] ?? "var(--ink-soft)" }} />
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Team */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" style={{ color: "var(--teal)" }} />
          <h2 className="text-lg" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
            Team
          </h2>
        </div>
        {a.team.length === 0 ? (
          <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
            Just you so far. Coordinator invites are coming soon.
          </p>
        ) : (
          <div className="mt-4 divide-y" style={{ borderColor: "var(--line)" }}>
            {a.team.map((m) => (
              <div key={m.email} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>{m.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.title ?? m.email}</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: "var(--teal-soft)", color: "var(--teal-deep)" }}
                >
                  {ROLE_LABEL[m.role] ?? m.role}
                </span>
              </div>
            ))}
          </div>
        )}
        {badges.length > 0 && (
          <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
            Trust badges: {badges.map((b) => b.replace(/_/g, " ")).join(" · ")}
          </p>
        )}
      </section>
    </div>
  );
}
