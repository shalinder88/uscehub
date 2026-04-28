"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CardRoot, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ExternalLink, Flag, ListChecks, Clock } from "lucide-react";

type FlagStatus = "OPEN" | "IN_REVIEW" | "REVIEWED" | "RESOLVED" | "DISMISSED";
type FlagKind =
  | "BROKEN_LINK"
  | "WRONG_DEADLINE"
  | "PROGRAM_CLOSED"
  | "INCORRECT_INFO"
  | "DUPLICATE"
  | "SPAM"
  | "OTHER";
type LinkVerificationStatus =
  | "UNKNOWN"
  | "VERIFIED"
  | "REVERIFYING"
  | "SOURCE_DEAD"
  | "PROGRAM_CLOSED"
  | "NO_OFFICIAL_SOURCE"
  | "NEEDS_MANUAL_REVIEW";

interface DataVerificationRow {
  id: string;
  verifiedBy: string;
  method: string | null;
  statusBefore: string | null;
  statusAfter: string | null;
  httpStatus: number | null;
  finalUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
}

interface ListingSummary {
  id: string;
  title: string;
  city: string;
  state: string;
  specialty: string;
  linkVerificationStatus: LinkVerificationStatus;
  lastVerifiedAt: string | null;
  lastVerificationAttemptAt: string | null;
  verificationFailureReason: string | null;
  sourceUrl: string | null;
  applicationUrl: string | null;
  websiteUrl: string | null;
  recentVerifications?: DataVerificationRow[];
}

interface FlagItem {
  id: string;
  type: string;
  targetId: string;
  reason: string;
  status: FlagStatus;
  kind: FlagKind;
  sourceUrl: string | null;
  createdAt: string;
  reporter: { id: string; name: string | null; email: string };
  listing: ListingSummary | null;
  recentVerifications: DataVerificationRow[];
}

interface QueueResponse {
  flagReports: FlagItem[];
  listingsNeedingReview: ListingSummary[];
  agedReverifying: ListingSummary[];
  counts: {
    flagReports: number;
    listingsNeedingReview: number;
    agedReverifying: number;
  };
}

const DESTRUCTIVE_LISTING_ACTIONS = new Set([
  "mark_source_dead",
  "mark_program_closed",
  "mark_no_official_source",
]);
const DESTRUCTIVE_FLAG_ACTIONS = new Set([
  "resolve_source_dead",
  "resolve_program_closed",
]);

const ACTION_LABELS: Record<string, string> = {
  in_review: "Mark in review",
  resolve_verified: "Resolve: working",
  resolve_source_dead: "Resolve: source dead",
  resolve_program_closed: "Resolve: program closed",
  dismiss: "Dismiss",
  mark_verified: "Mark verified",
  mark_needs_review: "Mark needs review",
  mark_source_dead: "Mark source dead",
  mark_program_closed: "Mark program closed",
  mark_no_official_source: "Mark no official source",
};

export default function AdminVerificationQueuePage() {
  const [data, setData] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/verification-queue", { cache: "no-store" });
      if (!res.ok) {
        const msg = await res.text();
        setError(`Failed to load queue: ${res.status} ${msg.slice(0, 120)}`);
        return;
      }
      const json = (await res.json()) as QueueResponse;
      setData(json);
    } catch (e) {
      setError(`Failed to load queue: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const performAction = useCallback(
    async (kind: "flag" | "listing", id: string, action: string) => {
      const isDestructive =
        (kind === "flag" && DESTRUCTIVE_FLAG_ACTIONS.has(action)) ||
        (kind === "listing" && DESTRUCTIVE_LISTING_ACTIONS.has(action));
      if (isDestructive) {
        const ok = window.confirm(
          `${ACTION_LABELS[action] || action} — this is admin-only and audit-logged. Continue?`,
        );
        if (!ok) return;
      }
      const handle = `${kind}:${id}:${action}`;
      setActionPending(handle);
      setError(null);
      try {
        const res = await fetch("/api/admin/verification-queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, id, action }),
        });
        if (!res.ok) {
          const msg = await res.text();
          setError(`Action failed: ${res.status} ${msg.slice(0, 200)}`);
          return;
        }
        await refresh();
      } catch (e) {
        setError(`Action failed: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setActionPending(null);
      }
    },
    [refresh],
  );

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-700 dark:text-slate-300">Loading verification queue…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Verification Queue</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Triage user-reported flags and listings the cron flagged for human review. All actions are audit-logged.
        </p>
        {error ? (
          <p className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        ) : null}
      </div>

      {data ? (
        <>
          <Section
            icon={<Flag className="h-4 w-4" />}
            title="User-reported flags"
            subtitle="OPEN and IN_REVIEW. Resolve, dismiss, or escalate."
            count={data.counts.flagReports}
          >
            {data.flagReports.length === 0 ? (
              <EmptyHint message="No open or in-review flags." />
            ) : (
              <div className="space-y-3">
                {data.flagReports.map((f) => (
                  <FlagRow
                    key={f.id}
                    flag={f}
                    pending={actionPending}
                    onAction={(action) => performAction("flag", f.id, action)}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section
            icon={<ListChecks className="h-4 w-4" />}
            title="Listings the cron flagged for manual review"
            subtitle="linkVerificationStatus = NEEDS_MANUAL_REVIEW (typically 4xx/5xx on probe)."
            count={data.counts.listingsNeedingReview}
          >
            {data.listingsNeedingReview.length === 0 ? (
              <EmptyHint message="No cron-classified listings awaiting review." />
            ) : (
              <div className="space-y-3">
                {data.listingsNeedingReview.map((l) => (
                  <ListingRow
                    key={l.id}
                    listing={l}
                    pending={actionPending}
                    onAction={(action) => performAction("listing", l.id, action)}
                    showSourceDead
                  />
                ))}
              </div>
            )}
          </Section>

          <Section
            icon={<Clock className="h-4 w-4" />}
            title="Aged REVERIFYING listings (>14 days)"
            subtitle="Listings stuck in REVERIFYING — transient errors that did not clear. Optional triage."
            count={data.counts.agedReverifying}
          >
            {data.agedReverifying.length === 0 ? (
              <EmptyHint message="No aged REVERIFYING listings." />
            ) : (
              <div className="space-y-3">
                {data.agedReverifying.map((l) => (
                  <ListingRow
                    key={l.id}
                    listing={l}
                    pending={actionPending}
                    onAction={(action) => performAction("listing", l.id, action)}
                    showSourceDead
                  />
                ))}
              </div>
            )}
          </Section>
        </>
      ) : null}
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            {title}{" "}
            <span className="ml-2 text-sm font-normal text-slate-500">({count})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyHint({ message }: { message: string }) {
  return (
    <CardRoot>
      <CardContent className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {message}
      </CardContent>
    </CardRoot>
  );
}

function FlagRow({
  flag,
  pending,
  onAction,
}: {
  flag: FlagItem;
  pending: string | null;
  onAction: (action: string) => void;
}) {
  const handleFor = (action: string) => `flag:${flag.id}:${action}`;
  const isPending = (action: string) => pending === handleFor(action);
  const anyPending = pending?.startsWith(`flag:${flag.id}:`);

  return (
    <CardRoot>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="warning">{flag.kind}</Badge>
          <Badge variant={flag.status === "OPEN" ? "pending" : "default"}>{flag.status}</Badge>
          <Badge variant="default">{flag.type}</Badge>
        </div>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{flag.reason}</p>
        <div className="mt-2 text-xs text-slate-500">
          Reporter: {flag.reporter.name ?? "(no name)"} · {flag.reporter.email} · {formatDate(flag.createdAt)}
        </div>
        {flag.sourceUrl ? (
          <div className="mt-1 text-xs text-slate-500">
            Reported URL:{" "}
            <a
              href={flag.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {flag.sourceUrl}
            </a>
          </div>
        ) : null}
        {flag.listing ? (
          <div className="mt-3 rounded-md border border-slate-200 dark:border-slate-800 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Link
                  href={`/listing/${flag.listing.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-slate-900 underline dark:text-slate-50"
                >
                  {flag.listing.title}
                </Link>
                <div className="mt-1 text-xs text-slate-500">
                  {flag.listing.city}, {flag.listing.state} · {flag.listing.specialty} · status:{" "}
                  <code>{flag.listing.linkVerificationStatus}</code>
                </div>
              </div>
              <Link
                href={`/listing/${flag.listing.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ExternalLink className="mr-1 h-3 w-3" /> Open
              </Link>
            </div>
            {flag.recentVerifications.length > 0 ? (
              <RecentVerifications rows={flag.recentVerifications} />
            ) : null}
          </div>
        ) : (
          <div className="mt-2 text-xs text-slate-500">Target: {flag.targetId}</div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={anyPending}
            onClick={() => onAction("in_review")}
          >
            {isPending("in_review") ? "Working…" : ACTION_LABELS.in_review}
          </Button>
          {flag.type === "listing" ? (
            <>
              <Button
                variant="success"
                size="sm"
                disabled={anyPending}
                onClick={() => onAction("resolve_verified")}
              >
                {isPending("resolve_verified") ? "Working…" : ACTION_LABELS.resolve_verified}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={anyPending}
                onClick={() => onAction("resolve_source_dead")}
              >
                {isPending("resolve_source_dead") ? "Working…" : ACTION_LABELS.resolve_source_dead}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={anyPending}
                onClick={() => onAction("resolve_program_closed")}
              >
                {isPending("resolve_program_closed") ? "Working…" : ACTION_LABELS.resolve_program_closed}
              </Button>
            </>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            disabled={anyPending}
            onClick={() => onAction("dismiss")}
          >
            {isPending("dismiss") ? "Working…" : ACTION_LABELS.dismiss}
          </Button>
        </div>
      </CardContent>
    </CardRoot>
  );
}

function ListingRow({
  listing,
  pending,
  onAction,
  showSourceDead = false,
}: {
  listing: ListingSummary;
  pending: string | null;
  onAction: (action: string) => void;
  showSourceDead?: boolean;
}) {
  const handleFor = (action: string) => `listing:${listing.id}:${action}`;
  const isPending = (action: string) => pending === handleFor(action);
  const anyPending = pending?.startsWith(`listing:${listing.id}:`);
  const probedUrl = listing.sourceUrl || listing.applicationUrl || listing.websiteUrl;

  return (
    <CardRoot>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/listing/${listing.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-slate-900 underline dark:text-slate-50"
            >
              {listing.title}
            </Link>
            <div className="mt-1 text-xs text-slate-500">
              {listing.city}, {listing.state} · {listing.specialty} · status:{" "}
              <code>{listing.linkVerificationStatus}</code>
              {listing.verificationFailureReason ? (
                <>
                  {" · reason: "}
                  <code>{listing.verificationFailureReason}</code>
                </>
              ) : null}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Last attempt:{" "}
              {listing.lastVerificationAttemptAt
                ? formatDate(listing.lastVerificationAttemptAt)
                : "never"}
              {" · last verified: "}
              {listing.lastVerifiedAt ? formatDate(listing.lastVerifiedAt) : "never"}
            </div>
            {probedUrl ? (
              <div className="mt-1 text-xs text-slate-500">
                Source URL:{" "}
                <a
                  href={probedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {probedUrl}
                </a>
              </div>
            ) : null}
            {listing.recentVerifications && listing.recentVerifications.length > 0 ? (
              <RecentVerifications rows={listing.recentVerifications} />
            ) : null}
          </div>
          <Link
            href={`/listing/${listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ExternalLink className="mr-1 h-3 w-3" /> Open
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="success"
            size="sm"
            disabled={anyPending}
            onClick={() => onAction("mark_verified")}
          >
            {isPending("mark_verified") ? "Working…" : ACTION_LABELS.mark_verified}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={anyPending}
            onClick={() => onAction("mark_needs_review")}
          >
            {isPending("mark_needs_review") ? "Working…" : ACTION_LABELS.mark_needs_review}
          </Button>
          {showSourceDead ? (
            <Button
              variant="destructive"
              size="sm"
              disabled={anyPending}
              onClick={() => onAction("mark_source_dead")}
            >
              {isPending("mark_source_dead") ? "Working…" : ACTION_LABELS.mark_source_dead}
            </Button>
          ) : null}
          <Button
            variant="destructive"
            size="sm"
            disabled={anyPending}
            onClick={() => onAction("mark_program_closed")}
          >
            {isPending("mark_program_closed") ? "Working…" : ACTION_LABELS.mark_program_closed}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={anyPending}
            onClick={() => onAction("mark_no_official_source")}
          >
            {isPending("mark_no_official_source") ? "Working…" : ACTION_LABELS.mark_no_official_source}
          </Button>
        </div>
      </CardContent>
    </CardRoot>
  );
}

function RecentVerifications({ rows }: { rows: DataVerificationRow[] }) {
  return (
    <div className="mt-2 rounded-md bg-slate-50 dark:bg-slate-900 p-2 text-xs">
      <div className="font-medium text-slate-700 dark:text-slate-300">Recent verifications</div>
      <ul className="mt-1 space-y-1 text-slate-500">
        {rows.map((r) => (
          <li key={r.id}>
            {formatDate(r.createdAt)} · {r.method ?? "?"} · {r.statusBefore ?? "?"} → {r.statusAfter ?? "?"}
            {r.httpStatus !== null ? ` · http ${r.httpStatus}` : ""}
            {r.errorMessage ? ` · ${r.errorMessage}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
