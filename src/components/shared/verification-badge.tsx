"use client";

import { CheckCircle, Users, AlertTriangle, AlertOctagon, Clock, Flag } from "lucide-react";
import { useState } from "react";

export type SourceType = "official" | "community" | "self_reported" | "disputed" | "outdated";

interface VerificationBadgeProps {
  sourceType: SourceType;
  lastVerified?: string;
  verifiedBy?: string;
  compact?: boolean;
  showReport?: boolean;
  onReport?: () => void;
}

const SOURCE_CONFIG: Record<SourceType, { label: string; icon: typeof CheckCircle; color: string; bgColor: string }> = {
  official: {
    label: "Official Source",
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  community: {
    label: "Community Verified",
    icon: Users,
    color: "text-cyan",
    bgColor: "bg-cyan/10",
  },
  self_reported: {
    label: "Self-Reported",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  disputed: {
    label: "Disputed",
    icon: AlertOctagon,
    color: "text-danger",
    bgColor: "bg-danger/10",
  },
  outdated: {
    label: "Outdated",
    icon: Clock,
    color: "text-muted",
    bgColor: "bg-muted/10",
  },
};

export function VerificationBadge({
  sourceType,
  lastVerified,
  verifiedBy,
  compact = false,
  showReport = true,
}: VerificationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = SOURCE_CONFIG[sourceType];
  const Icon = config.icon;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 ${config.color}`}
        title={`${config.label}${lastVerified ? ` — Last verified: ${lastVerified}` : ""}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bgColor} ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border border-border bg-surface p-3 shadow-lg animate-fade-in">
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              <span className="font-medium text-foreground">{config.label}</span>
            </div>
            {lastVerified && (
              <p className="text-muted">
                Last verified: <span className="text-foreground">{lastVerified}</span>
              </p>
            )}
            {verifiedBy && (
              <p className="text-muted">
                Verified by: <span className="text-foreground">{verifiedBy}</span>
              </p>
            )}
            {showReport && (
              <button className="mt-2 flex items-center gap-1 text-danger hover:underline">
                <Flag className="h-3 w-3" />
                Report inaccuracy
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
