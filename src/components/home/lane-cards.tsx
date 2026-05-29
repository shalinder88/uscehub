"use client";

import Link from "next/link";
import { HeartPulse, Globe } from "lucide-react";

function setLaneCookie(lane: "usce" | "career") {
  const expires = new Date(Date.now() + 90 * 864e5).toUTCString();
  document.cookie = `uscehub-lane=${lane}; expires=${expires}; path=/; SameSite=Lax`;
}

export function LaneCards() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-2 pt-6"
      aria-label="Choose your path"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/browse"
          onClick={() => setLaneCookie("usce")}
          className="group rounded-2xl border p-6 transition-colors hover:border-[var(--teal)]"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="h-4.5 w-4.5" style={{ color: "var(--teal)" }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              USCE Programs
            </span>
          </div>
          <h2 className="text-sm font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
            Find Clinical Experience
          </h2>
          <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--ink-soft)" }}>
            Observerships, clerkships, MD/DO visiting rotations (VSLO), and research — source-verified with visa notes.
          </p>
          <span className="text-xs font-medium" style={{ color: "var(--teal)" }}>
            Browse programs →
          </span>
        </Link>

        <Link
          href="/career"
          onClick={() => setLaneCookie("career")}
          className="group rounded-2xl border p-6 transition-colors hover:border-[var(--teal)]"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4.5 w-4.5" style={{ color: "var(--teal)" }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Visa &amp; Jobs
            </span>
          </div>
          <h2 className="text-sm font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
            Physician Immigration Intelligence
          </h2>
          <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--ink-soft)" }}>
            J-1 waiver jobs, H-1B sponsors, Conrad 30 state rules, and career tools for residents and fellows.
          </p>
          <span className="text-xs font-medium" style={{ color: "var(--teal)" }}>
            Explore Visa &amp; Jobs →
          </span>
        </Link>
      </div>
    </section>
  );
}
