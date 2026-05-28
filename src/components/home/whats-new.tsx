import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Sparkles, ShieldCheck, RefreshCw, ArrowRight, MapPin } from "lucide-react";

/**
 * First-party "What's New" feed.
 *
 * Pulls real activity from the listings table — no Twitter, no external
 * RSS, no editor input. Three event types:
 *
 *   NEW       — listing created in the last 30 days
 *   VERIFIED  — lastVerifiedAt within the last 30 days AND clearly after
 *               creation (i.e. an actual re-verify, not the initial import)
 *   UPDATED   — updatedAt within the last 14 days AND distinguishable from
 *               creation (avoids surfacing the seed-import noise)
 *
 * Merged into a single timeline, newest first, capped at 8 items. The
 * surface doubles as a freshness signal for SEO + a trust signal for
 * visitors who want to see the directory is actively maintained.
 */

type EventType = "NEW" | "VERIFIED" | "UPDATED";

interface FeedEvent {
  id: string;
  listingId: string;
  type: EventType;
  date: Date;
  title: string;
  city: string;
  state: string;
}

const DAY_MS = 1000 * 60 * 60 * 24;

function relativeDays(d: Date): string {
  const now = Date.now();
  const days = Math.floor((now - d.getTime()) / DAY_MS);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} month${days >= 60 ? "s" : ""} ago`;
}

const TYPE_META: Record<EventType, { label: string; icon: typeof Sparkles; tint: string }> = {
  NEW: { label: "New", icon: Sparkles, tint: "var(--teal)" },
  VERIFIED: { label: "Re-verified", icon: ShieldCheck, tint: "#1d7c5b" },
  UPDATED: { label: "Updated", icon: RefreshCw, tint: "#b3503e" },
};

export async function WhatsNew() {
  const since30 = new Date(Date.now() - 30 * DAY_MS);
  const since14 = new Date(Date.now() - 14 * DAY_MS);

  const recentlyCreated = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      createdAt: { gte: since30 },
    },
    select: { id: true, title: true, city: true, state: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const recentlyVerified = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      lastVerifiedAt: { gte: since30 },
    },
    select: {
      id: true,
      title: true,
      city: true,
      state: true,
      createdAt: true,
      lastVerifiedAt: true,
    },
    orderBy: { lastVerifiedAt: "desc" },
    take: 12,
  });

  const recentlyUpdated = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      updatedAt: { gte: since14 },
    },
    select: {
      id: true,
      title: true,
      city: true,
      state: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });

  const events: FeedEvent[] = [];

  for (const l of recentlyCreated) {
    events.push({
      id: `new-${l.id}`,
      listingId: l.id,
      type: "NEW",
      date: l.createdAt,
      title: l.title,
      city: l.city,
      state: l.state,
    });
  }

  for (const l of recentlyVerified) {
    // Skip if the verification happened within a day of creation — that
    // was the initial import, not a real re-verify.
    if (!l.lastVerifiedAt) continue;
    if (l.lastVerifiedAt.getTime() - l.createdAt.getTime() < DAY_MS) continue;
    events.push({
      id: `verified-${l.id}`,
      listingId: l.id,
      type: "VERIFIED",
      date: l.lastVerifiedAt,
      title: l.title,
      city: l.city,
      state: l.state,
    });
  }

  for (const l of recentlyUpdated) {
    // Skip if updatedAt is the same as createdAt — never modified after
    // import.
    if (l.updatedAt.getTime() - l.createdAt.getTime() < DAY_MS) continue;
    events.push({
      id: `updated-${l.id}`,
      listingId: l.id,
      type: "UPDATED",
      date: l.updatedAt,
      title: l.title,
      city: l.city,
      state: l.state,
    });
  }

  // Sort newest first and cap.
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  // De-dupe: if the same listing shows up under two event types within
  // the window, prefer NEW > VERIFIED > UPDATED.
  const seen = new Set<string>();
  const ranked: Record<EventType, number> = { NEW: 0, VERIFIED: 1, UPDATED: 2 };
  const deduped = events
    .sort((a, b) => ranked[a.type] - ranked[b.type])
    .filter((e) => {
      if (seen.has(e.listingId)) return false;
      seen.add(e.listingId);
      return true;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  if (deduped.length === 0) return null;

  return (
    <section className="bg-[var(--bg)] dark:bg-slate-950 py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p
              className="mb-1 text-xs font-medium uppercase tracking-[0.18em]"
              style={{ color: "var(--text-muted)" }}
            >
              First-party feed
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
                fontSize: 30,
                lineHeight: 1.1,
                color: "var(--ink)",
                letterSpacing: "-0.01em",
              }}
            >
              What&apos;s new on USCEHub
            </h2>
          </div>
          <Link
            href="/browse"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium"
            style={{ color: "var(--teal)" }}
          >
            Browse all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ol
          className="card-lift rounded-2xl divide-y"
          style={{
            background: "var(--paper)",
            borderColor: "var(--line)",
            border: "1px solid var(--line)",
          }}
        >
          {deduped.map((e) => {
            const meta = TYPE_META[e.type];
            const Icon = meta.icon;
            return (
              <li key={e.id} className="divide-y" style={{ borderColor: "var(--line)" }}>
                <Link
                  href={`/listing/${e.listingId}`}
                  className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[var(--paper-soft)]"
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--teal-soft)" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: meta.tint }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          background: "var(--paper-soft)",
                          color: meta.tint,
                          border: "1px solid var(--line)",
                        }}
                      >
                        {meta.label}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {relativeDays(e.date)}
                      </span>
                    </div>
                    <p
                      className="mt-1 truncate text-sm font-semibold"
                      style={{ color: "var(--ink)" }}
                    >
                      {e.title}
                    </p>
                    <p
                      className="mt-0.5 inline-flex items-center gap-1 text-xs"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      <MapPin className="h-3 w-3" />
                      {e.city}, {e.state}
                    </p>
                  </div>
                  <ArrowRight
                    className="mt-2 h-4 w-4 shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  />
                </Link>
              </li>
            );
          })}
        </ol>

        <p
          className="mt-4 text-center text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Updated continuously as the directory verifies and adds programs.
          See <Link href="/methodology" style={{ color: "var(--teal-deep)", textDecoration: "underline" }}>how we verify</Link>.
        </p>
      </div>
    </section>
  );
}
