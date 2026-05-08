# P99 Micro-Pilot Browser QA — Sprint 1 Report

**Sprint date:** 2026-05-08
**Repo:** `/Users/shelly/usmle-platform` (P99 lane)
**Branch:** `local/p97-discovery-integrity-guardrails`
**Predecessor commit:** `476000a P99: generate noindex micro pilot runtime`
**Scope:** Browser QA on `/clerkships/pilot` route — verify visually + functionally + take screenshots + assess release blockers. **No deploy. No push. No PR.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Browser QA status | **PASS WITH ONE SCOPED FIX APPLIED** |
| Route loaded | YES — HTTP 200 + page rendered cleanly desktop + mobile |
| Screenshots captured | YES — `pilot-desktop-home.png` (365 KB) + `pilot-mobile-home.png` (890 KB) |
| Blockers remaining | 2 process-gate blockers (release audit + explicit user approval) — neither is a code/data issue |
| Deploy status | **NOT DEPLOYED** |

The single substantive blocker raised by the QA prompt (no report-issue path) was **fixed in this sprint** with a minimal in-scope change: per-card "Report a listing issue" links + a footer call-out, both pointing to the existing `/contact` route. No new backend, no new state, no schema change, no new dependency.

## 2. Route tested

- URL: `http://localhost:3000/clerkships/pilot`
- Browser: Playwright Chromium 1.59.1 (Chrome for Testing 147.0.7727.15) headless
- Viewports: 1440×900 (desktop) + 390×844 (mobile, `isMobile: true`, `deviceScaleFactor: 2`)
- Dev server: `npm run dev` (Next.js 15) — started, used, then killed (`exit 143` SIGTERM as expected)
- HTTP: 200 OK
- Title: `USCE Pilot Listings — Source-Reviewed Preview — USCEHub`
- Headers: `X-Robots-Tag: noindex, nofollow` set by `next.config.ts` global header

## 3. Row count and inclusion/exclusion

| Status | Count | Institutions |
|--------|-------|--------------|
| Present (expected 5) | **5** | Morristown · Overlook · CCF Mercy · CC Hillcrest · Highland |
| Excluded (expected 0) | **0** | Mayo Mankato · Mayo Eau Claire · Bergen · Saint Elizabeths · Hemet · TJUH · Manatee · UH SA · UPMC Western Psychiatric · Lincoln Medical |

All 15 institution checks (5 expected + 10 forbidden) returned the expected counts on a `grep -c` of the rendered HTML.

## 4. Noindex result

| Check | Result |
|-------|--------|
| `<meta name="robots" content="noindex, nofollow">` in head | ✅ |
| `X-Robots-Tag: noindex, nofollow` HTTP header | ✅ |
| Route in sitemap.xml | NO ✅ |
| Route linked from public nav | NO ✅ |
| Page text "national directory" / "complete directory" / "nationwide" | 0 occurrences ✅ |
| Page text "launch" / "verified by hospital" | 0 occurrences ✅ |

## 5. Card / caveat result

Pilot uses tag-shaped caveats per the bridge contract (raw source quotes stay internal). Verbatim source text is reachable via the "Official source" link on each card.

| Card | Caveat pills (fit_warnings) | Expandable restriction tags | Source link | Last reviewed |
|------|------------------------------|------------------------------|-------------|---------------|
| Morristown (NJ) | NAMED_SCHOOLS_ONLY · HOUSING_NOT_PROVIDED · NO_BROAD_IMG_CLAIM | ✅ "Source caveats" expandable | ✅ atlantichealth.org | ✅ 2026-05-07 |
| Overlook (NJ) | same as Morristown | ✅ | ✅ atlantichealth.org (shared) | ✅ 2026-05-07 |
| CCF Mercy (OH) | LCME_AOA_ONLY · VISA_APPLICANT_OBTAINED_B1 · NO_J1_SPONSORSHIP · NO_H1B_SPONSORSHIP · FEE_REQUIRED | ✅ | ✅ my.clevelandclinic.org | ✅ 2026-05-07 |
| CC Hillcrest (OH) | LCME_AOA_ONLY · VISA_APPLICANT_OBTAINED_B1 · NO_J1_SPONSORSHIP · NO_H1B_SPONSORSHIP · FEE_REQUIRED · SYSTEM_PAGE_NO_SITE_SPECIFIC_GUARANTEE | ✅ | ✅ my.clevelandclinic.org (shared) | ✅ 2026-05-07 |
| Highland (CA) | DIVERSITY_ELIGIBILITY_REQUIRED · MS4_ONLY | ✅ | ✅ highlandmedicine.org | ✅ 2026-05-07 |

## 6. Source link result

| Source URL | Pilot cards covered | `target="_blank"` + `rel="noopener noreferrer"` |
|------------|----------------------|-------------------------------------------------|
| ahs.atlantichealth.org/professionals-medical-education/medical-students.html | Morristown + Overlook | ✅ |
| my.clevelandclinic.org/departments/elective-program/requirements | CCF Mercy + CC Hillcrest | ✅ |
| highlandmedicine.org/visiting-elective-scholarship | Highland | ✅ |

All 3 unique URLs verified HTTP 200 in prior evidence-landing sprints (2026-05-07). `target="_blank"` + `rel="noopener noreferrer"` present on each card.

## 7. Report-issue result

**Was a release blocker. Fixed in this sprint.**

| Item | Before this QA sprint | After this QA sprint |
|------|------------------------|------------------------|
| Per-card "Report a listing issue" link | ❌ | ✅ — 5 occurrences (one per card), pointing to `/contact?ref=pilot-listing&listing_id=<id>` |
| Footer "report incorrect eligibility / fee/deadline / wording" call-out | ❌ | ✅ — 1 occurrence in dedicated footer banner, pointing to `/contact?ref=pilot-feedback` |
| Backend system | n/a — `/contact` route already in repo | ✅ — reused; no new backend |
| New state / new tables / new schema | n/a | ✅ — none |

The fix is 11 lines added to `PilotClerkshipListings.tsx`: import `Link` + `Flag` icon, add per-card link, add footer banner.

## 8. Save / compare result

**NOT WIRED in pilot UI. NON_BLOCKING_LIMITATION for the noindex micro-pilot.**

- Pilot copy does NOT promise save/compare anywhere.
- Existing P99 save-compare validator still PASSES against the Maine route (unchanged).
- The 1598-line Maine `ClerkshipListings.tsx` carries the save/compare/filter/report-issue UI; replicating it on the pilot would require either refactoring it to accept cards as a prop (substantial) or duplicating it (large duplication, drift risk).
- Acceptable for noindex micro-pilot; QA-sprint blocker matrix (`B-002`) marks it as NON_BLOCKING and recommends optional post-deploy polish.

## 9. Mobile / desktop result

| Viewport | Result | Issues |
|----------|--------|--------|
| Desktop 1440×900 | ✅ | None — hero + 5 cards correctly stacked; pills wrap; no horizontal overflow |
| Mobile 390×844 | ✅ | None — cards stack vertically; pills wrap; no clipping; no horizontal scroll |

Screenshots:
- `screenshots/pilot-desktop-home.png` (365 KB)
- `screenshots/pilot-mobile-home.png` (890 KB)

## 10. Console result

| Category | Count |
|----------|-------|
| Console errors (`type === 'error'`) | **0** |
| Page errors / unhandled exceptions | **0** |
| Hydration warnings | **0** |
| Network failures (page itself) | **0** |

7–9 standard Next.js dev-mode log entries (Fast Refresh init, React DevTools notice, Tailwind dev info) — all `log` / `info` level, none rated error or pageerror.

## 11. Fixes made in this sprint

**1 small fix** to `src/app/clerkships/pilot/PilotClerkshipListings.tsx`:
- Added `Link` (next/link) + `Flag` icon imports.
- Added per-card "Report a listing issue" link at end of each card's metadata row, pointing to `/contact?ref=pilot-listing&listing_id=<encoded-listing_id>`.
- Added footer banner with "report incorrect eligibility, broken links, fee/deadline changes, or any wording that does not match the official source" call-out, pointing to `/contact?ref=pilot-feedback`.

**No other files modified.** Specifically:
- No runtime data file changes.
- No route metadata changes.
- No schema, no API, no DB.
- No Maine route changes.
- No global nav / homepage changes.
- No validator weakening.

## 12. Validators

| Validator | Before fix | After fix |
|-----------|------------|-----------|
| `scripts/validate-micro-pilot-runtime.ts` | PASSED 5 cards + route gates | PASSED unchanged |
| `tsc --noEmit` | clean | clean |
| `scripts/usce-data/validate-public-runtime-data.ts` | PASSED | PASSED unchanged |
| `scripts/validate-usce-public-cards.ts` | PASSED | PASSED unchanged |
| `scripts/validate-usce-save-compare.ts` | PASSED | PASSED unchanged |
| `scripts/validate-usce-report-intake.ts` | PASSED | PASSED unchanged |
| `scripts/validate-usce-pilot-release.ts` | PASSED | PASSED unchanged |

## 13. Release readiness

**Code/data side: ready for release audit.**

| Gate | Status |
|------|--------|
| Pilot runtime file | ✅ |
| Pilot route + noindex | ✅ |
| Caveats visible per card | ✅ |
| Source links visible per card | ✅ |
| Report-issue path | ✅ (fixed in this sprint) |
| No console errors | ✅ |
| Desktop + mobile screenshots | ✅ |
| All 5 existing P99 validators + new pilot validator | ✅ |
| tsc clean | ✅ |
| No internal field leakage | ✅ |
| No banned phrases | ✅ |
| No excluded institutions present | ✅ |

**Process gates remaining (not code/data):**
- B-003: Release audit document (`P99-MICRO-PILOT-RELEASE-AUDIT-1`) — must walk the noindex release checklist next.
- B-004: Explicit user "push" approval — global rule per CLAUDE.md.
- B-005: Pre-existing dirty files (`.claude/launch.json`, Maine generated.json/.ts) — separate cleanup, not blocking pilot deploy commit per se.
- B-007: Real-human Chrome interactive QA — recommended at release-audit stage as a final spot-check; Playwright headless captured strong static-analysis signal.

## 14. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No `git push` / PR / deploy | CONFIRMED |
| No Vercel mutation | CONFIRMED |
| No DB / schema / migration / seed / cron | CONFIRMED |
| No listing import | CONFIRMED |
| No `IMPORT_READY` / `PUBLIC_NOW` | CONFIRMED |
| No indexed route / no sitemap addition | CONFIRMED |
| No broad launch copy | CONFIRMED |
| No homepage / global nav change | CONFIRMED |
| No SEO launch claims | CONFIRMED |
| No new data rows | CONFIRMED |
| No Mayo / Bergen / Saint Elizabeths / high-risk rows added | CONFIRMED |
| No fake verification claim | CONFIRMED |
| No hospital-approved claim | CONFIRMED |
| No guaranteed placement claim | CONFIRMED |
| No official USCEHub application-system claim | CONFIRMED — pilot footer says "this page does not act as an application system" |
| No broad IMG-friendly claim | CONFIRMED |
| No unsupported visa claim | CONFIRMED |
| No raw P97 / internal fields exposed | CONFIRMED — all 9 forbidden field names returned 0 occurrences in rendered HTML |
| No screenshot paths exposed publicly | CONFIRMED |
| No reviewer notes exposed publicly | CONFIRMED |
| No `must_not_claim` exposed publicly | CONFIRMED |
| No commit amend / no history rewrite | CONFIRMED |
| No `--no-verify` | CONFIRMED |
| No unrelated dirty files staged | CONFIRMED — pre-existing dirty files NOT in this commit |
| No NPPES / redesign files staged | CONFIRMED |
| Bridge / pilot validators not weakened | CONFIRMED — both PASS unchanged |

## 15. Next step

Per the prompt's stated next-step logic:

> If QA passes with only non-blocking limitations: next = `P99-MICRO-PILOT-RELEASE-AUDIT-1`

QA passed with the report-issue blocker fixed in this sprint. Save/compare is a non-blocking limitation. Both substantive QA gates are now green.

**Recommended next step:** `P99-MICRO-PILOT-RELEASE-AUDIT-1` — re-walk the noindex release checklist (`micro_pilot_runtime_prep_1_noindex_release_checklist.md`) ticking each box; produce a release-audit document; then await explicit user "push" approval before any deploy.
