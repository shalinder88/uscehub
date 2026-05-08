# USCEHub Backsite / Data / Trust Continuation — Sprint 1 State Lock

**Date:** 2026-05-08
**Repo:** `/Users/shelly/usmle-platform`
**Sprint ID:** `P99-P97-BACKSITE-DATA-TRUST-CONTINUATION-1`
**Sprint type:** docs-only freeze + priority audit + next-sprint prompt prep

---

## 1. Why this freeze exists

The hydration fix on `/clerkships/pilot` produced a clean noindex preview. Prior to this freeze, the working assumption was the next sprint would be `USCEHUB-NEW-UI-LOCAL-QA-AND-INTEGRATION-1`. That assumption is **revoked by the user**. The corrected sequencing doctrine is:

1. Build the back-site first.
2. Build the USCE backend / data / trust / content foundation first.
3. Continue source verification, validators, report/correction flow, runtime safety, data promotion gates, and admin/review infrastructure.
4. Leave major UI/interface redesign until the end.
5. Keep UI work local/deferred.
6. Do not deploy production.
7. Do not merge to main.
8. Do not expose unfinished UI.
9. Do not call this a launch.

This state-lock documents the clean preview snapshot so future agents do not mistakenly treat preview-clean as "ready for production merge" or "ready for UI redesign push."

## 2. Frozen state — git

| Field | Value |
|-------|-------|
| Branch | `local/p97-discovery-integrity-guardrails` |
| Pre-sprint HEAD | `d867984 P99: annotate hydration fix report with preview re-smoke result` |
| Hydration fix commit | `7bbc64d P99: fix pilot last-reviewed hydration mismatch` |
| Production main SHA | `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — **UNCHANGED** |
| Commits ahead of `origin/main` | 47 (full P96 → P99 stack + this sprint's docs to follow) |

Recent log:
```
d867984 P99: annotate hydration fix report with preview re-smoke result
7bbc64d P99: fix pilot last-reviewed hydration mismatch
11dddc0 P99: document noindex micro pilot preview smoke
ad2b3f6 P99: document canonical USCEHub preview alignment
d2d17c7 P99: document noindex micro pilot preview push
f9063bb P99: audit noindex micro pilot release readiness
c4343df P99: QA noindex micro pilot route
476000a P99: generate noindex micro pilot runtime
0d24941 Audit P97 to P99 pilot data bridge
383930b P99-5: pilot release hardening — noindex, a11y, localStorage resilience, copy, release validator
```

## 3. Frozen state — preview deployment

| Field | Value |
|-------|-------|
| Vercel project | `uscehub` (canonical, dashboard slug; team `shalinder88s-projects`; project ID `prj_s1t73G2jniMr2gUb0PIfoQ8fLp9J`) |
| Note | Local `.vercel/project.json` says `usmle-platform` — STALE cosmetic artifact. Same project ID. No relink. |
| Latest preview deployment | `4626113037` for sha `7bbc64d4`, state `success` |
| Preview URL | `https://uscehub-8oermuntd-shalinder88s-projects.vercel.app` |
| Route smoked | `/clerkships/pilot` |
| HTTP via Chrome SSO | 200 |
| `<meta name="robots">` | `noindex, nofollow` |
| Card count | 5 (Morristown · Overlook · CCF Mercy · CC Hillcrest · Highland) |
| Hero count | `5 listings · 2 open to international students per source · 3 US MD/DO per source` |
| `Last reviewed` rendering | uniform `2026-05-07` (ISO `YYYY-MM-DD`) — no SSR/CSR drift |
| **React #418 hydration error** | **GONE** ✅ (verified post-reload console capture) |
| Other console errors | 0 |
| Production deploy triggered | NO — `--prod` never used; preview only |

## 4. Frozen state — local validators

All validators run at the start of this freeze:

| Validator | Result |
|-----------|--------|
| `tsc --noEmit` (after `.next` clear) | clean — zero source-level errors |
| `scripts/validate-micro-pilot-runtime.ts` | PASSED — 5 pilot cards + route noindex+nofollow |
| `scripts/usce-data/validate-public-runtime-data.ts` | PASSED — Maine 12 cards |
| `scripts/validate-usce-public-cards.ts` | PASSED — public card gate, supporting-source flags |
| `scripts/validate-usce-save-compare.ts` | PASSED — save/compare UI + runtime |
| `scripts/validate-usce-report-intake.ts` | PASSED — report intake + privacy copy + no server submission |
| `scripts/validate-usce-pilot-release.ts` | PASSED — noindex + a11y + localStorage resilience |

## 5. Frozen state — pilot data gates

| Gate | Status |
|------|--------|
| 5 pilot cards present | YES |
| 10+ excluded institutions absent | YES (Mayo Mankato/Eau Claire, Bergen, Saint Elizabeths, Hemet, TJUH, Manatee, UH SA, UPMC Western Psychiatric, Lincoln Medical) |
| Pilot route metadata | `robots: { index: false, follow: false }` |
| Pilot route in `src/app/sitemap.ts` | NO |
| Pilot route in `public/robots.txt` | NO entry needed (page-level noindex sufficient) |
| Pilot linked from public nav / homepage | NO |
| Banned phrases in rendered HTML | 0 |
| Internal-field leakage in rendered HTML | 0 |
| Source links per card | YES (3 unique URLs across 5 cards, target=_blank rel=noopener noreferrer) |
| Per-card "Report a listing issue" | YES (5 links → `/contact?ref=pilot-listing&listing_id=<id>`) |

## 6. What is explicitly NOT next

- Production deploy
- Merge to main
- PR to main
- Production blast-radius merge audit
- UI / interface redesign of any kind
- New theme work
- Public-now / import-ready promotion of any non-pilot row
- Bridge approval of any new row
- Site-wide UI integration of the newer USCEHub interface
- Homepage / nav exposure of the pilot
- Sitemap / robots inclusion of the pilot
- Broad launch copy

## 7. What IS next (priority order)

1. **`P99-P97-FIRST-PILOT-SOURCE-CAPTURE-BATCH-3`** — capture source evidence for Manatee, UH San Antonio, UPMC Western Psychiatric, Lincoln Medical. Backend / data / trust scope only.
2. Strengthen data promotion gates (bridge input validator, micro-pilot prep validator, runtime validator, blocked-row exclusion, noindex checks).
3. Strengthen report / correction trust flow (listing-ID payload mapping; correction review workflow; no UI-heavy work).
4. Strengthen admin / backsite review (internal source-correction queue, blocked-row review queue, future `IMPORT_READY` gate, public-copy risk queue).
5. **Deferred:** UI / interface polish — only after 1–4 are mature.
6. **Deferred indefinitely without separate audit + explicit approval:** production merge.

## 8. Pre-existing dirty state (untouched, NOT staged)

Modified (left as-is):
- `.claude/launch.json`
- `src/data/usce/public-listings.generated.json`
- `src/data/usce/public-listings.generated.ts`

Untracked (left as-is):
- `DO_NOT_EDIT_INTERNAL_COPY_USE_T7.md`
- `README_FROZEN_INTERNAL_COPY.md`
- `docs/platform-v2/local/nppes/*` (13 files — NPPES workbench, out of scope)
- `docs/platform-v2/redesign-mockups/39-luxury-palette-explorations.html` and `40-final-trio-day-and-nights.html` (deferred UI work)

These remain untouched. They are not staged into this sprint and will not be staged absent a separate scoped cleanup pass.

## 9. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy | CONFIRMED |
| No `vercel --prod` | CONFIRMED — Vercel CLI not installed |
| No merge to main | CONFIRMED |
| No PR to main | CONFIRMED |
| No Vercel production promotion | CONFIRMED |
| No DB / schema / prisma / seed | CONFIRMED |
| No public indexing | CONFIRMED |
| No homepage / nav exposure | CONFIRMED |
| No `PUBLIC_NOW` | CONFIRMED |
| No `IMPORT_READY` | CONFIRMED |
| No broad launch copy | CONFIRMED |
| No UI redesign | CONFIRMED |
| No new interface / theme work | CONFIRMED |
| No deploying the newer UI | CONFIRMED |
| No staging of unrelated dirty files | CONFIRMED |
| No cleaning of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated file changes | CONFIRMED |
| No touching unrelated NPPES / redesign files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` | CONFIRMED |
| No history rewrite / amend / force push | CONFIRMED |
