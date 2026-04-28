/**
 * VerifiedBadge — PRESERVE for compatibility. Candidate for later review;
 * do not delete now (per docs/codebase-audit/RULES.md hard protection rules).
 *
 * Currently imported by ~17 pages, most inside the protected /career and
 * /residency areas. New listing-trust UI should reach for:
 *   - src/components/listings/listing-trust-metadata.tsx  (full block)
 *   - src/components/listings/listing-verification-badge.tsx (badge only)
 *
 * Migrating the existing call sites away from VerifiedBadge is out of scope
 * for cleanup PR2; touching /career pages requires explicit user approval.
 * This component remains the canonical "Last verified: <date>" pill until
 * a coordinated follow-up migration ships.
 */
import { ShieldCheck } from "lucide-react";

interface VerifiedBadgeProps {
  date: string;
  sources?: string[];
}

export function VerifiedBadge({ date, sources }: VerifiedBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-1.5 text-xs text-success">
      <ShieldCheck className="h-3.5 w-3.5" />
      <span>
        Last verified: <strong>{date}</strong>
      </span>
      {sources && sources.length > 0 && (
        <span className="text-muted">
          · Sources: {sources.join(", ")}
        </span>
      )}
    </div>
  );
}
