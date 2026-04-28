"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Flag } from "lucide-react";

interface ReportBrokenLinkButtonProps {
  listingId: string;
  /**
   * Optional source URL of the link being reported. Included in the
   * report context so admins can see exactly which link was flagged.
   */
  sourceUrl?: string | null;
  /**
   * Mailto fallback recipient for unauthenticated visitors. Defaults
   * to the public contact address.
   */
  mailtoFallback?: string;
  className?: string;
}

const DEFAULT_FALLBACK_EMAIL = "contact@uscehub.com";

/**
 * "Report broken link" affordance for listings.
 *
 * Posts to the existing /api/flags endpoint with a structured
 * "[broken_link]" reason. For unauthenticated visitors, falls back
 * to a `mailto:` link so the report path is never dead.
 *
 * Intentionally lightweight — the existing FlagButton component
 * (src/components/listings/flag-button.tsx) is preserved in place
 * and continues to handle the broader "report any issue" flow per
 * docs/codebase-audit/RULES.md preservation rules.
 */
export function ReportBrokenLinkButton({
  listingId,
  sourceUrl,
  mailtoFallback = DEFAULT_FALLBACK_EMAIL,
  className = "",
}: ReportBrokenLinkButtonProps) {
  const { data: session } = useSession();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  if (!session?.user) {
    const subject = encodeURIComponent(
      `Broken application link — listing ${listingId}`
    );
    const body = encodeURIComponent(
      [
        `The application link for listing ${listingId} appears to be broken.`,
        sourceUrl ? `Reported URL: ${sourceUrl}` : "",
        "",
        "(reported via the public listing page)",
      ]
        .filter(Boolean)
        .join("\n")
    );
    return (
      <a
        href={`mailto:${mailtoFallback}?subject=${subject}&body=${body}`}
        className={`inline-flex items-center gap-1 text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline dark:text-slate-400 dark:hover:text-slate-200 ${className}`.trim()}
      >
        <Flag className="h-3 w-3" aria-hidden="true" />
        Report broken link
      </a>
    );
  }

  async function submit() {
    setState("sending");
    setErrorText(null);
    const reason = [
      "[broken_link] Reported from the listing detail page.",
      sourceUrl ? `Reported URL: ${sourceUrl}` : null,
    ]
      .filter(Boolean)
      .join(" ");
    try {
      const res = await fetch("/api/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "listing",
          targetId: listingId,
          reason,
        }),
      });
      if (res.ok) {
        setState("sent");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setErrorText(data?.error || "Could not submit report.");
      setState("error");
    } catch {
      setErrorText("Network error. Try again.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 ${className}`.trim()}>
        Thanks — admin will recheck this link.
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <button
        type="button"
        onClick={submit}
        disabled={state === "sending"}
        className="inline-flex items-center gap-1 text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <Flag className="h-3 w-3" aria-hidden="true" />
        {state === "sending" ? "Reporting…" : "Report broken link"}
      </button>
      {state === "error" && errorText && (
        <span className="text-xs text-red-600 dark:text-red-400">{errorText}</span>
      )}
    </span>
  );
}
