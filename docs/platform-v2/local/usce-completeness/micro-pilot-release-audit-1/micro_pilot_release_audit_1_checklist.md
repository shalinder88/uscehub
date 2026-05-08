# Micro-Pilot Release Audit 1 — Checklist

**Audit date:** 2026-05-08
**Route:** `/clerkships/pilot`
**Commit audited:** `c4343df P99: QA noindex micro pilot route`

This is the consolidated release-audit checklist. Detail evidence lives in the SEO audit, data scope CSV, content safety CSV, and gate matrix CSVs in this folder.

## Code / data gates (all PASS)

- [x] Runtime generation completed (`476000a`)
- [x] Exactly 5 cards in runtime data
- [x] All 10+ excluded institutions absent from runtime + rendered HTML
- [x] Page-level `<meta name="robots" content="noindex, nofollow">`
- [x] HTTP-level `X-Robots-Tag: noindex, nofollow`
- [x] Pilot route NOT in `src/app/sitemap.ts`
- [x] Pilot route NOT in `public/robots.txt`
- [x] Pilot route NOT linked from public nav, layout, or homepage
- [x] No broad-launch copy (national directory / nationwide / launch / hospital-approved / verified by hospital — all 0 occurrences)
- [x] No banned forbidden phrases (guaranteed / IMG-friendly / official application system / apply through USCEHub — all 0)
- [x] Source link visible per card (target=_blank, rel=noopener noreferrer)
- [x] Last-reviewed date visible per card
- [x] Caveats visible per card (fit_warnings as pills + restriction_tags expandable)
- [x] Per-card "Report a listing issue" link → `/contact?ref=pilot-listing&listing_id=<id>` (added in QA `c4343df`)
- [x] Footer "Report listing issue" call-out → `/contact?ref=pilot-feedback`
- [x] No raw P97 / internal fields in runtime card (screenshot_path / reviewer_notes / must_not_claim / not_allowed_actions / bridge_row_id / archive_url / etc. — all 0 occurrences)
- [x] No `IMPORT_READY` / `PUBLIC_NOW` / `PUBLISHED` / `INDEXED` status
- [x] Desktop screenshot captured (1440×900, 365 KB)
- [x] Mobile screenshot captured (390×844, 890 KB)
- [x] 0 console errors during full-page load (Playwright headless)
- [x] 0 hydration warnings
- [x] Micro-pilot runtime validator PASSED 5 cards + route gates
- [x] All 5 existing P99 validators PASSED unchanged (runtime / public-cards / save-compare / report-intake / pilot-release)
- [x] `tsc --noEmit` clean
- [x] No DB / schema / seed changes
- [x] No production / Vercel config changes
- [x] No homepage / global nav changes

## Process gates (BLOCKED — user-controlled)

- [ ] **G-023 — Explicit user push approval.** User must explicitly type `push the noindex micro-pilot` or equivalent affirmation before any deploy.
- [ ] **G-024 — Post-deploy smoke test.** Cannot run until a preview/prod URL exists. Will be a follow-up task immediately after deploy.

## Pre-existing repo state (NOT a release blocker; separate cleanup)

- [ ] `M .claude/launch.json` — pre-existing, not staged in any pilot commit
- [ ] `M src/data/usce/public-listings.generated.json` — Maine runtime, modified before this work began
- [ ] `M src/data/usce/public-listings.generated.ts` — same
- [ ] Untracked `nppes/` files, redesign mockups, frozen-copy README markers — all pre-existing, not in scope

These will need a separate cleanup pass before the next deploy of any unrelated work, but they do NOT affect a pilot-only deploy because the pilot commits do not stage them.

## Verdict

**RELEASE-AUDIT VERDICT: ALL CODE/DATA GATES PASS.** Two process gates remain (user push approval + post-deploy smoke test), neither of which is a code or data issue.

The 5-row noindex micro-pilot is **READY FOR USER-APPROVED NOINDEX DEPLOY**.
