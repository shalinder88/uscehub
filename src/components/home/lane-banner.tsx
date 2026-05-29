"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

function getLaneCookie(): string | null {
  const prefix = "uscehub-lane=";
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) {
      return part.slice(prefix.length);
    }
  }
  return null;
}

export function LaneBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("lane-banner-dismissed")) return;
    if (getLaneCookie() === "career") setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
      <div
        className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm"
        style={{
          background: "var(--paper-soft)",
          border: "1px solid var(--line)",
          color: "var(--ink-soft)",
        }}
      >
        <span>
          Welcome back —{" "}
          <Link
            href="/career"
            className="font-medium hover:underline"
            style={{ color: "var(--teal)" }}
          >
            continue to Visa &amp; Jobs →
          </Link>
        </span>
        <button
          onClick={() => {
            sessionStorage.setItem("lane-banner-dismissed", "1");
            setVisible(false);
          }}
          className="shrink-0 rounded p-1 transition-colors hover:bg-[var(--paper)]"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
