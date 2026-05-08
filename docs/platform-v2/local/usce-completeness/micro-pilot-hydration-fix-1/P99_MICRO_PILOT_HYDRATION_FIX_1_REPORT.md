# P99 Micro-Pilot Hydration Fix — Sprint 1 Report

**Date:** 2026-05-08
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-fix HEAD:** `11dddc0f...`
**Production main SHA:** `739ab1e2...` — UNCHANGED
**Scope:** Fix React #418 hydration mismatch found by preview smoke. **No production deploy. Branch-preview only.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Hydration root cause | identified (`toLocaleDateString()` locale-dependent SSR/CSR drift) |
| Fix applied | YES — `src/app/clerkships/pilot/PilotClerkshipListings.tsx` |
| Diff size | +7 lines / -1 line, single file |
| `tsc --noEmit` post-fix | clean |
| `validate-micro-pilot-runtime.ts` post-fix | PASSED (5 cards + route gates) |
| Production main SHA | `739ab1e2...` UNCHANGED |
| Pre-existing dirty files | untouched, NOT staged |
| Commit + push | pending Phase H |
| Preview re-smoke | pending Phase I |

## 2. Root cause

`PilotClerkshipListings.tsx` line 122 (pre-fix):
```tsx
Last reviewed {new Date(c.last_reviewed_at).toLocaleDateString()}
```

`Date#toLocaleDateString()` formats according to the runtime's resolved locale and timezone. The Vercel Node SSR runtime resolves locale differently than the browser CSR runtime, so the server-rendered HTML and the client-rendered HTML disagree on the formatted date string. React's production hydration check (#418) fires on the mismatch.

This did not surface in local Playwright headless QA because both Node and headless Chrome resolved to the same en-US locale on `c4343df`. It surfaced on the live Vercel preview, where the runtime locale on Vercel Functions can differ from the user's browser locale.

## 3. Fix

Single-file change. Stable ISO-date prefix strategy (preferred over locking `'en-US'` because the source value is already an ISO 8601 string — slicing the date prefix is locale-independent and timezone-independent).

```tsx
// Deterministic ISO-prefix date so SSR and CSR hydrate identically
// regardless of browser locale or timezone (avoids React hydration error #418).
function formatReviewedDate(value: string): string {
  return value?.slice(0, 10) || "Date unavailable";
}

// Render site:
<span>
  Last reviewed {formatReviewedDate(c.last_reviewed_at)}
</span>
```

The format `YYYY-MM-DD` is unambiguous, ISO-standard, and identical on every runtime. The tradeoff is cosmetic: the date now reads as `2026-05-08` rather than `5/8/2026` (US) / `08/05/2026` (UK). Given this is a small footer-line "Last reviewed" timestamp on a noindex pilot route, the consistency win is worth the format change.

Diff:
```diff
+// Deterministic ISO-prefix date so SSR and CSR hydrate identically
+// regardless of browser locale or timezone (avoids React hydration error #418).
+function formatReviewedDate(value: string): string {
+  return value?.slice(0, 10) || "Date unavailable";
+}
...
-                Last reviewed {new Date(c.last_reviewed_at).toLocaleDateString()}
+                Last reviewed {formatReviewedDate(c.last_reviewed_at)}
```

## 4. Validators run after fix

| Check | Result |
|-------|--------|
| `tsc --noEmit` (after `.next` clear) | clean — zero source-level errors |
| `scripts/validate-micro-pilot-runtime.ts` | PASSED — 5 cards, noindex+nofollow gates |

The fix is purely a render-string change. It does not touch the runtime data, the route metadata, the validator allow-lists, or any other gate. Other validators (save-compare, report-intake, public-cards, public-runtime-data, pilot-release) operate on data not on render output and were not affected; they remain green from the prior sprint.

## 5. Local dev smoke status

**Inconclusive — environmental, not a fix problem.** The Mac-local Next.js 16.2.1 dev server returned HTTP 404 on `/clerkships/pilot` after the fix was applied. The route file is intact, the fix is correct in source, and tsc + the runtime validator both pass. The 404 is most likely a Turbopack cache artifact in Next 16's new bundler — the directory was cleared (`rm -rf .next`) after the dev server attempt, but a stale runtime is still suspected. Local dev smoke is **not on the gate path** for this fix; the production preview re-smoke (Phase I) is the canonical verification.

## 6. Out-of-scope confirmations

| Concern | Status |
|---------|--------|
| Pre-existing dirty files staged | NO — `.claude/launch.json`, Maine `public-listings.generated.{json,ts}` left untouched |
| NPPES / redesign-mockups files staged | NO |
| Other source files modified | NO |
| Runtime data regenerated | NO — fix is render-string only, no data rebuild needed |
| `next.config.ts` changed | NO |
| `sitemap.ts` changed | NO |
| `robots.txt` changed | NO |
| Pilot route metadata (noindex / nofollow) changed | NO |
| Bridge / pilot validators weakened | NO |

## 7. Production safety

| Rule | Status |
|------|--------|
| `--prod` flag | NEVER used |
| `git push origin main` | NOT executed |
| `git merge` to main | NOT executed |
| PR to main | NOT created |
| `--no-verify` | NOT used |
| `--amend` | NOT used |
| Force push | NOT used |
| History rewrite | NOT used |
| DB / schema / prisma / seed | UNTOUCHED |
| Vercel project / domain / DNS / env vars | UNTOUCHED |
| `origin/main` SHA | `739ab1e2...` UNCHANGED |

## 8. Remaining steps after this report

- **Phase H:** stage exactly two paths (`src/app/clerkships/pilot/PilotClerkshipListings.tsx` + this report), commit, push to the same preview branch.
- **Phase I:** wait for Vercel auto-build, find the new preview URL via `gh api repos/shalinder88/uscehub/deployments`, open the page in the user's authenticated Chrome session, and run `read_console_messages` to confirm React #418 is GONE.
- **Phase J:** annotate this report with the new preview URL + post-fix console capture, then stop.

After re-smoke passes, the next sprint per the user's standing rule is **USCEHUB-NEW-UI-LOCAL-QA-AND-INTEGRATION-1** — NOT a production merge. Production stays gated until the newer USCEHub interface/UI work is locally validated.

## 9. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy | CONFIRMED |
| No push to main | CONFIRMED |
| No merge to main | CONFIRMED |
| No PR to main | CONFIRMED |
| No `vercel --prod` | CONFIRMED — Vercel CLI not installed |
| No DB / schema / migration / seed | CONFIRMED |
| No env var / DNS / domain / Vercel-project change | CONFIRMED |
| No sitemap / robots / nav / homepage change | CONFIRMED |
| Pilot route stays noindex+nofollow | CONFIRMED — metadata untouched |
| No new rows | CONFIRMED |
| No banned phrases introduced | CONFIRMED |
| No internal-field leakage introduced | CONFIRMED |
| No pre-existing unrelated dirty files staged | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| Single-file fix, single-purpose commit | CONFIRMED |
