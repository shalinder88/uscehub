import { ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";

export type ListingVerificationStatus = "verified" | "unverified" | "reverifying";

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
