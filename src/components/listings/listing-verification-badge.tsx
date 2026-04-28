import { ShieldCheck, ShieldAlert, RefreshCw, Link2, AlertTriangle } from "lucide-react";

/**
 * Listing trust badge states (PR 3.5a):
 *
 *   verified           — green: cron or admin verified the source AND
 *                        a real `lastVerifiedAt` timestamp exists.
 *                        Strong "we checked this recently" signal.
 *   verified-on-file   — slate (neutral): the listing has an official
 *                        source URL on file but no audit-trail
 *                        timestamp (legacy backfilled rows). We don't
 *                        claim "verified" without supporting evidence.
 *   reverifying        — slate: cron or admin is re-checking the URL.
 *   needs-review       — amber (stronger): cron returned 4xx/5xx and
 *                        flagged the listing for human triage. Public
 *                        users should verify directly before applying.
 *   unverified         — amber (soft): UNKNOWN, or admin-confirmed
 *                        SOURCE_DEAD / PROGRAM_CLOSED / NO_OFFICIAL_SOURCE
 *                        states (until richer admin-state badges land).
 */
export type ListingVerificationStatus =
  | "verified"
  | "verified-on-file"
  | "unverified"
  | "reverifying"
  | "needs-review";

interface ListingVerificationBadgeProps {
  status: ListingVerificationStatus;
  lastVerified?: string | null;
  className?: string;
}

const STATUS_CONFIG: Record<
  ListingVerificationStatus,
  { label: string; icon: typeof ShieldCheck; classes: string }
> = {
  verified: {
    label: "Verified link",
    icon: ShieldCheck,
    classes:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  "verified-on-file": {
    label: "Official source on file",
    icon: Link2,
    classes:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  unverified: {
    label: "Source not yet verified",
    icon: ShieldAlert,
    classes:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
  reverifying: {
    label: "Re-verifying link",
    icon: RefreshCw,
    classes:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  "needs-review": {
    label: "Source needs review",
    icon: AlertTriangle,
    classes:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  },
};

export function ListingVerificationBadge({
  status,
  lastVerified,
  className = "",
}: ListingVerificationBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const titleAttr = lastVerified
    ? `${config.label} — last verified ${lastVerified}`
    : config.label;
  return (
    <span
      title={titleAttr}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes} ${className}`.trim()}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
