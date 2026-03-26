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
