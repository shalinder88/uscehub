# P99-P97 Staged Runtime Batch 3 — Noindex Activation Slice 2 Report

**Sprint ID:** `P99-P97-STAGED-RUNTIME-BATCH-3-NOINDEX-ACTIVATION-SLICE-2`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `d47c34d7dcc2a119f2b7a36c96d879689bdd42e2`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Activate exactly 2 batch-3 cards (Hospital of the University of Pennsylvania / Northwestern Memorial Hospital) into the noindex internal pilot runtime, taking active count 8 → 10. No production deploy. No public launch. Trivially reversible.

---

## 1. Executive result

| Metric | Before | After |
|--------|--------|-------|
| Active noindex pilot card count | 8 | **10** |
| `PILOT_TOTAL_COUNT` export | 8 | **10** |
| `PILOT_US_ONLY_COUNT` export | 6 | **8** |
| `PILOT_IMG_RELEVANT_COUNT` export | 2 | **2** (unchanged) |
| Staged batch 3 card count | 14 | **14** (unchanged) |
| Staged batch 2 card count | 7 | **7** (unchanged) |
| Production-public card count | **0** | **0** |
| `/clerkships/pilot` route metadata | `noindex+nofollow` | `noindex+nofollow` (unchanged) |
| Production main SHA | `739ab1e2…` | `739ab1e2…` (unchanged) |
| Browser QA `/clerkships/pilot` | n/a | **PASS** — 10 institution names render; 2 deferred absent; "10 listings" header; zero console errors |
| Browser QA `/contact` for 2 active rows | n/a | **PASS** — banner + hidden inputs + `runtime_set=active` for HUP + Northwestern |
| Browser QA `/contact` for 2 deferred rows | n/a | **PASS** — banner + hidden `runtime_set=staged` for Jackson + Methodist San Antonio |
| GitHub open secret-scanning alerts | 0 | **0** |
| Validators (10) | All PASS | All PASS |

## 2. Activated rows

1. **`pilot-016-PA-hospital-of-the-university-of-pennsylvania`** — Hospital of the University of Pennsylvania (Philadelphia, PA). System-level Perelman SOM source; campus_name carries `System-level Perelman SOM source — HUP site placement not separately enumerated`; `SYSTEM_PAGE_SOURCE_NO_HUP_SPECIFIC_GUARANTEE` tag in `restriction_tags` and `fit_warnings`. LCME/AOA-only audience.
2. **`pilot-015-IL-northwestern-memorial-hospital`** — Northwestern Memorial Hospital (Chicago, IL). Same shape: system-level Feinberg SOM source; campus_name + tags carry the explicit non-NMH-specific caveat. LCME/AOA-only audience.

Both cards copied **byte-identical** from `src/data/usce/public-listings-pilot-staged-batch-3.generated.json`. All caveats preserved verbatim.

## 3. Why these rows

The previous audit (`P99-P97-STAGED-RUNTIME-BATCH-3-PROMOTION-CANDIDATE-AUDIT`) ranked HUP + Northwestern as `SAFE_BUT_NOT_FIRST` — both share the system-level / SOM-source pattern, both carry an explicit `SYSTEM_PAGE_SOURCE_NO_<SITE>_SPECIFIC_GUARANTEE` caveat in `campus_name` + `restriction_tags` + `fit_warnings`, both have LCME/AOA-only audience with three non-US audiences `EXCLUDED_EXPLICIT`. They are mechanical activations once the Slice-1 site-level cards have proven the activation pipeline.

Slice-1's clean activation (5 → 8 with zero console errors and intact caveats) demonstrated the pipeline works. Slice-2 promotes the next two safest rows together because they share the same risk profile and there is no interaction between them.

## 4. Why Jackson and Methodist San Antonio remain deferred

| Row | Reason |
|-----|--------|
| `pilot-013-FL-jackson-memorial-hospital` | System-level UM Miller SOM source + high public brand recognizability of "Jackson Memorial". The hospital name is among the most recognizable in the country; the source's system-level scope means activation could overpromise a campus-specific opportunity. The audit rated this `LOW_TO_MEDIUM` public-copy risk vs LOW for the others. Activation deferred until either (a) a Jackson-Memorial-specific source lands, or (b) the public copy is hardened to make the SOM-lane framing more explicit. |
| `pilot-018-TX-methodist-hospital-san-antonio` | HCA GME multi-site source provides PARTIAL audience/application detail (per `quote_manifest`). System-level HCA-GME page covers multiple sites; per-site detail is thinner than ideal. Activation deferred until per-site source lands. |

These deferrals are intentional and validator-enforced. Jackson + Methodist San Antonio remain in `KNOWN_LISTINGS` with `runtimeSet: "staged"` so a user landing at their `/contact` URL still resolves a banner — but they do NOT appear in the active runtime data file.

## 5. Caveat preservation

Both rows pass byte-identical caveat preservation. Detail in `slice_2_caveat_preservation_audit.csv`.

| Caveat | HUP | Northwestern |
|--------|-----|--------------|
| Audience: US LCME/AOA only; 3 non-US `EXCLUDED_EXPLICIT` | YES | YES |
| Visa: `NOT_MENTIONED_US_ONLY_AUDIENCE` + `NO_J1_VERIFIED` + `NO_H1B_VERIFIED` | YES | YES |
| Cost: `COST_NOT_STATED` | YES | YES |
| **System-level source caveat in `campus_name`** | `System-level Perelman SOM source — HUP site placement not separately enumerated` | `System-level Feinberg SOM source — Northwestern Memorial site placement not separately enumerated` |
| `SYSTEM_PAGE_SOURCE_NO_<SITE>_SPECIFIC_GUARANTEE` tag in `restriction_tags` + `fit_warnings` | YES (HUP) | YES (NORTHWESTERN_MEMORIAL) |
| Application method: SOM lane | YES (Perelman SOM) | YES (Feinberg SOM) |
| Banned claims absent | YES | YES |

The system-level caveat is **visible to readers** because it is part of `campus_name`, which the active pilot UI renders prominently next to the institution name. This is the public-defensible framing for these two rows.

## 6. Report / contact QA

All 4 batch-3 listings (2 newly active + 2 deferred) resolve correctly via `/contact?ref=pilot-listing&listing_id=…`. Detail in `slice_2_report_link_qa.csv` and `slice_2_browser_qa_results.csv`.

| Listing | Banner | `runtime_set` |
|---------|--------|---------------|
| HUP | "Hospital of the University of Pennsylvania, Philadelphia, PA" | `active` |
| Northwestern | "Northwestern Memorial Hospital, Chicago, IL" | `active` |
| Jackson (deferred) | "Jackson Memorial Hospital, Miami, FL" | `staged` |
| Methodist San Antonio (deferred) | "Methodist Hospital (San Antonio), San Antonio, TX" | `staged` |

Live submission against the disabled endpoint returns 404 → client shows polite generic message. Endpoint env-flag unchanged.

## 7. Import / exposure audit

Detail in `slice_2_import_exposure_audit.csv`. Highlights:
- **No app source imports the staged batch-3 module.** `grep -rln 'public-listings-pilot-staged-batch-3' src/app src/lib` → only the staged generated TS/JSON itself.
- **Jackson + Methodist San Antonio absent from active runtime JSON.** Validator-enforced.
- **Jackson + Methodist San Antonio present only as `runtimeSet: "staged"` metadata in `KNOWN_LISTINGS`** — by design.
- **No homepage / nav / sitemap exposure introduced.**
- **Route remains `noindex+nofollow`.**

## 8. Rollback plan

Detail in `slice_2_rollback_plan.md`. One-liner: `git revert --no-edit <slice-2-commit>` returns active runtime to 8 cards (the post-Slice-1 baseline) and reverts every validator update. No DB rollback. No production rollback (no deploy).

## 9. Validator results

All 10 validators PASS. Detail in `slice_2_validation_results.csv`. Three validators were updated to reflect Slice-2's authorized data drift:
- `validate-micro-pilot-runtime.ts` — expected count cap 8 → 10; `SLICE_2_NEW_IDS` added; deferred set narrowed to Jackson + Methodist San Antonio.
- `validate-p99-batch-3-promotion-candidate-audit.ts` — `DEFERRED_NOT_YET_ACTIVE_IDS` narrowed to Jackson + Methodist San Antonio (HUP + Northwestern were authorized into active by this slice).
- `validate-p99-contact-ref-prefill.ts` — test cases regrouped: 5 activated IDs (Slice-1 + Slice-2) → expect `runtime_set=active`; 2 staged IDs → expect `runtime_set=staged`.

Open GitHub secret-scanning alerts: **0** (verified via `gh api`).

## 10. Browser QA results

| Check | Result |
|-------|--------|
| `/clerkships/pilot` HTTP 200 | PASS |
| Header copy "10 listings · 2 open to international students per source · 8 US MD/DO per source" | PASS — auto-derived from updated `PILOT_*_COUNT` |
| Original 8 institutions visible (Slice-1 baseline) | PASS — Morristown / Overlook / CCF Mercy / CCF Hillcrest / Highland / Duke / NYU Langone / IU Methodist |
| 2 newly active institutions visible | PASS — Hospital of the University of Pennsylvania + Northwestern Memorial Hospital |
| 2 deferred institutions NOT visible | PASS — Jackson Memorial + Methodist Hospital (San Antonio) absent |
| Route metadata contains `noindex` | PASS |
| Banned phrases absent on page | PASS |
| `/contact?listing_id=pilot-016-…&ref=pilot-listing` banner = "Hospital of the University of Pennsylvania, Philadelphia, PA" + `runtime_set=active` | PASS |
| `/contact?listing_id=pilot-015-…` banner = "Northwestern Memorial Hospital, Chicago, IL" + `runtime_set=active` | PASS |
| `/contact?listing_id=pilot-013-…` banner present + `runtime_set=staged` | PASS — deferred status preserved |
| `/contact?listing_id=pilot-018-…` banner present + `runtime_set=staged` | PASS — deferred status preserved |
| Console errors / warnings | **0 / 0** |

## 11. What this sprint did NOT do

- **No production deploy.** No `vercel --prod`. No PR. No merge to main.
- **No public launch.** Route remains `noindex+nofollow`.
- **No homepage / nav / sitemap exposure.**
- **No staged batch 3 module imported by app code.**
- **No DB / schema / Prisma / seed / cron change.**
- **No correction-endpoint env-flag flip.** `USCE_CORRECTION_INTAKE_ENABLED` still false-by-default.
- **Jackson + Methodist San Antonio not activated.** They remain `runtimeSet: "staged"` and absent from active runtime data.
- **No new evidence capture, no new screening, no Queue 4 work.**
- **No public copy expansion**, no audience broadening, no caveat removal.
- **No new validator added** beyond updates to existing ones.
- **No `/contact` UI redesign**; only resolver `KNOWN_LISTINGS` runtime_set metadata updated for HUP + Northwestern.
- **No `gh auth status -t` and no token printing.**
- **No mutation of unrelated dirty files.**

## 12. Recommended next sprint

**My bias (matches user's stated bias):** push first, then strategic checkpoint.

1. **`P99-P97-PUSH-CLEAN-BRANCH-AND-SYNC` (or just "push")** — back up Slice-2's commit to GitHub before continuing. The push is mechanical now that gh CLI is logged in.

2. **After push, strategic checkpoint between three options:**
   - **`P97-QUEUE-4-NATIONAL-SCREENING-RESUME`** — resume broader national screening. With 10 active and 14 staged, the next leverage point is more breadth (more institutions, more states), not more depth on the same 4 deferred rows.
   - **`P99-P97-NOINDEX-ACTIVE-10-CARD-BROWSER-QA-AND-COPY-POLISH`** — extend QA across viewports / dark mode / a11y; copy polish only. No new activation. Defensible if the user wants to harden the 10-card view before more growth.
   - **`P99-P97-STAGED-RUNTIME-BATCH-3-NOINDEX-ACTIVATION-SLICE-3`** — only if a curator decides Jackson's brand-vs-source mismatch is acceptable AND/OR Methodist San Antonio's per-site source is acceptable. Lower priority than the other two.

The Queue-4 path is likely the right next move: 10 active + 14 staged is a respectable inventory, but the screening corpus on T7 has 347 source-proofed rows of which only 9 reached "validated bridge input". That funnel is where the next big inventory unlock lives.

## 13. Strategic checkpoint

> Are we moving toward big product?

**Yes.** Active inventory grew **8 → 10 (25%)** in this slice. Cumulative since the original active 5: **5 → 10 (100% growth)** across two slices, both noindex, no production deploy, no public launch. The chain is: `347 screened → 9 validated → 14 staged + mapped → /contact wired → 5 activated, 2 deferred`.

> Did this reduce the 347 → 5 bottleneck?

**Yes — directly.** The visible product surface is now 10 cards, double the original. Two slices, four activated rows total, zero new screening time spent, zero production exposure.

> Are we drifting?

**No.** This sprint touched 2 source data files, updated 4 validators (none weakened — all extended), updated 1 resolver data constant, produced 9 docs. Active runtime gained exactly the 2 audit-shortlisted rows; the deferred rows stayed deferred. Browser preview verified end-to-end.

> What must stop?

Continued slice-after-slice activation of the same batch-3 candidate pool. After this slice, 5 of 7 batch-3 rows are active and the remaining 2 are deferred for source-quality reasons. The next leverage is breadth (Queue 4) or QA-polish, not Slice 3.

> What must continue?

The "audit, then activate, then verify" discipline. Every future activation slice should mirror these two: small scope, byte-identical card copy, validator updates not weakening, browser QA before commit, no deploy, no env-flag flip, trivially reversible.

## 14. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No public launch | CONFIRMED — route remains `noindex+nofollow` |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No staged batch-3 import by app | CONFIRMED — validator + grep |
| `NO_PUBLIC_NOW` / `NO_IMPORT_READY` discipline preserved | CONFIRMED |
| No banned phrase | CONFIRMED — DOM scan |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| Jackson NOT activated | CONFIRMED — absent from active runtime; resolver `runtimeSet: "staged"` |
| Methodist San Antonio NOT activated | CONFIRMED — same |
| No weakening of existing validators | CONFIRMED — 4 validators extended, none weakened |
| No `gh auth status -t` | CONFIRMED |
| No tokens / secrets printed | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| Browser preview verification run before turn end | CONFIRMED — `/clerkships/pilot` (DOM) + `/contact` for 4 rows + console-errors check |
| Trivially reversible | CONFIRMED — single `git revert <slice-2-commit>` returns active to 8 |
