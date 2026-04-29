/**
 * <PathwaySelectorSection> — soft homepage pathway selector.
 *
 * First user-facing v2 surface (PR P1-2). Sits below the existing
 * USCE-first <Hero> and offers four soft choices:
 *
 *   - USCE & Match (Pathway 1, default)
 *   - Residency & Fellowship (Pathway 2)
 *   - Practice & Career (Pathway 3)
 *   - Show All Pathways (meta / reset)
 *
 * Doctrine (must remain true forever):
 *
 *   1. URL-wins. The selector NEVER navigates, redirects, or
 *      replaces the route. Selecting a pathway only changes which
 *      modules and surfaces are emphasized in future PRs (P1-3
 *      dashboard shell, etc.).
 *
 *   2. localStorage-only. Pathway preference is stored under
 *      `PATHWAY_LOCALSTORAGE_KEY` and never sent to the server, the
 *      URL, or a cookie. Anonymous visitors are treated identically
 *      to signed-in visitors here — there is no auth coupling.
 *
 *   3. No login wall. No modal. No forced selection. The page is
 *      fully functional whether or not the visitor interacts with
 *      this section.
 *
 *   4. No fake counts, no fake activity, no manufactured social
 *      proof. The four cards just describe what each pathway
 *      contains.
 *
 * SSR-safe: this is a client component. The first render uses the
 * default key (USCE & Match) and `useEffect` reads localStorage on
 * mount to apply any prior preference. This avoids the
 * server/client hydration mismatch that would happen if we read
 * `localStorage` during render.
 */
"use client";

import { useEffect, useState } from "react";
import {
  PATHWAYS,
  PATHWAY_LOCALSTORAGE_KEY,
  DEFAULT_PATHWAY_KEY,
  resolvePathwayKey,
  type PathwayKey,
} from "@/lib/platform-v2";
import { PathwayCard } from "@/components/platform-v2";

const PATHWAY_EYEBROWS: Record<PathwayKey, string> = {
  usce_match: "Pathway 1",
  residency_fellowship: "Pathway 2",
  practice_career: "Pathway 3",
  all_pathways: "Show everything",
};

export function PathwaySelectorSection() {
  // Server render and first client render BOTH show the default
  // pathway (`DEFAULT_PATHWAY_KEY`) so hydration matches. The
  // `useEffect` below upgrades to a stored preference on mount —
  // this is a one-frame visual blink, intentional, simpler than
  // gating the whole section on hydration.
  const [selected, setSelected] = useState<PathwayKey>(DEFAULT_PATHWAY_KEY);

  // Hydrate from localStorage on mount. Try/catch because
  // localStorage can throw in private mode or with strict CSP.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PATHWAY_LOCALSTORAGE_KEY);
      if (stored) {
        const resolved = resolvePathwayKey(stored);
        if (resolved !== selected) setSelected(resolved);
      }
    } catch {
      // Silent fail — not having a stored preference is fine.
    }
    // Run once on mount only. `selected` intentionally not in deps;
    // we don't want this to re-fire when the user clicks a card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(key: PathwayKey) {
    setSelected(key);
    try {
      window.localStorage.setItem(PATHWAY_LOCALSTORAGE_KEY, key);
    } catch {
      // Silent fail — UI still updates for this session even if we
      // can't persist.
    }
  }

  return (
    <section
      aria-labelledby="pathway-selector-heading"
      className="bg-white py-12 dark:bg-slate-950 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Optional
          </p>
          <h2
            id="pathway-selector-heading"
            className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl"
          >
            Choose how USCEHub should organize your path
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
            This does not change the page you opened. It only helps organize
            future tools and dashboards. Default is{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              USCE &amp; Match
            </span>{" "}
            until you choose otherwise.
          </p>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Direct links always open exactly where they point. Your selection
            is saved locally on this device only.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PATHWAYS.map((p) => (
            <PathwayCard
              key={p.key}
              pathwayKey={p.key}
              eyebrow={PATHWAY_EYEBROWS[p.key]}
              title={p.label}
              description={p.description}
              active={selected === p.key}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          {selected === "all_pathways"
            ? "Showing everything across pathways."
            : `Future modules will emphasize ${
                PATHWAYS.find((p) => p.key === selected)?.label
              }. Pick "Show All Pathways" anytime to reset.`}
        </p>
      </div>
    </section>
  );
}
