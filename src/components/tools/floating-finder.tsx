"use client";

import Link from "next/link";
import { Compass, Share2 } from "lucide-react";

// Editorial floating action — paired Find + Share buttons in a single
// stacked rail at bottom-right. Replaces the bright green pill with a
// warm-paper card that matches the rest of the day surface and a
// charcoal card for night. Uses the same plush shadow as the rest of
// the page.
export function FloatingFinder() {
  return (
    <div className="fixed bottom-6 right-6 z-40 hidden flex-col gap-2 md:flex">
      <Link
        href="/recommend"
        title="Program Finder"
        aria-label="Open program finder"
        className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#dfd5b8] bg-[#fcf9eb] text-[#1a5454] shadow-plush shadow-plush-hover transition-all hover:-translate-y-0.5 hover:bg-[#f0e9d3] dark:border-[#34373f] dark:bg-[#23262e] dark:text-[#0fa595] dark:hover:bg-[#2a2d36]"
      >
        <Compass className="h-5 w-5" />
      </Link>
      <ShareButton />
    </div>
  );
}

function ShareButton() {
  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const title = document.title;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled or unsupported — silent
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard unavailable — silent
    }
  };
  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share this page"
      aria-label="Share this page"
      className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#dfd5b8] bg-[#fcf9eb] text-[#1a5454] shadow-plush shadow-plush-hover transition-all hover:-translate-y-0.5 hover:bg-[#f0e9d3] dark:border-[#34373f] dark:bg-[#23262e] dark:text-[#0fa595] dark:hover:bg-[#2a2d36]"
    >
      <Share2 className="h-5 w-5" />
    </button>
  );
}
