"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useSavedListings } from "@/components/listings/saved-listings-provider";

interface SaveButtonProps {
  listingId: string;
  /**
   * Visual variant. "icon" = compact icon-only (listing card top-right).
   * "labeled" = icon + "Save" / "Saved" text (listing detail page).
   */
  variant?: "icon" | "labeled";
  /**
   * If the button lives inside a parent <Link>, set this so the click
   * stops propagation and prevents navigation. Default true because both
   * current call sites are inside listing cards / inside Link wrappers.
   */
  stopParentNavigation?: boolean;
  className?: string;
}

export function SaveButton({
  listingId,
  variant = "icon",
  stopParentNavigation = true,
  className = "",
}: SaveButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isReady, isSaved, toggleSaved } = useSavedListings();
  const [pending, setPending] = useState(false);
  const saved = isSaved(listingId);

  async function handleClick(e: React.MouseEvent) {
    if (stopParentNavigation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAuthenticated) {
      router.push(`/auth/signin?callbackUrl=/listing/${encodeURIComponent(listingId)}`);
      return;
    }
    if (pending) return;
    setPending(true);
    await toggleSaved(listingId);
    setPending(false);
  }

  const ariaLabel = saved ? "Remove from saved listings" : "Save listing";
  const tooltip = isAuthenticated
    ? saved
      ? "Saved to your dashboard"
      : "Save to your dashboard"
    : "Sign in to save";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending || !isReady}
        aria-pressed={saved}
        aria-label={ariaLabel}
        title={tooltip}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-500 transition-colors hover:text-slate-900 hover:border-slate-300 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:border-slate-500 ${className}`.trim()}
      >
        <Bookmark
          className={`h-4 w-4 ${saved ? "fill-slate-700 text-slate-700 dark:fill-slate-200 dark:text-slate-200" : ""}`}
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || !isReady}
      aria-pressed={saved}
      aria-label={ariaLabel}
      title={tooltip}
      className={`inline-flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:opacity-50 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white ${className}`.trim()}
    >
      <Bookmark
        className={`h-4 w-4 ${saved ? "fill-slate-700 text-slate-700 dark:fill-slate-200 dark:text-slate-200" : ""}`}
        aria-hidden="true"
      />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
