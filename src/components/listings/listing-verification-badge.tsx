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
      "bg-[#dde7e3] text-[#1a5454] dark:bg-[#0fa595]/15 dark:text-[#0fa595]",
  },
  "verified-on-file": {
    label: "Official source on file",
    icon: Link2,
    classes:
      "bg-[#f0e9d3] text-[#4a5057] dark:bg-[#2a2d36] dark:text-[#bfc1c9]",
  },
  unverified: {
    label: "Source not yet verified",
    icon: ShieldAlert,
    classes:
      "bg-[#f0e9d3] text-[#a87b2e] dark:bg-[#2a2d36] dark:text-[#d8a978]",
  },
  reverifying: {
    label: "Re-verifying link",
    icon: RefreshCw,
    classes:
      "bg-[#f0e9d3] text-[#4a5057] dark:bg-[#2a2d36] dark:text-[#bfc1c9]",
  },
  "needs-review": {
    label: "Source needs review",
    icon: AlertTriangle,
    classes:
      "bg-[#f0e9d3] text-[#9c3a2c] dark:bg-[#2a2d36] dark:text-[#e7958a]",
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
