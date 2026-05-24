# P99-P97 Staged Runtime Batch 3 — Noindex Activation Slice 1 Report

**Sprint ID:** `P99-P97-STAGED-RUNTIME-BATCH-3-NOINDEX-ACTIVATION-SLICE-1`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `42076763f25468a74db43f6303df4f1d50683519`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Activate exactly 3 batch-3 cards (Duke / NYU Langone Tisch / IU Health Methodist) into the noindex internal pilot runtime, taking active count 5 → 8. No production deploy. No public launch. Trivially reversible.

---

## 1. Executive result

| Metric | Before | After |
|--------|--------|-------|
| Active noindex pilot card count | 5 | **8** |
| `PILOT_TOTAL_COUNT` export | 5 | **8** |
| `PILOT_US_ONLY_COUNT` export | 3 | **6** |
| `PILOT_IMG_RELEVANT_COUNT` export | 2 | **2** (unchanged) |
| Staged batch 3 card count | 14 | **14** (unchanged) |
| Staged batch 2 card count | 7 | **7** (unchanged) |
| Production-public card count | **0** | **0** |
| `/clerkships/pilot` route metadata | `noindex+nofollow` | `noindex+nofollow` (unchanged) |
| Production main SHA | `739ab1e2…` | `739ab1e2…` (unchanged) |
| Browser QA `/clerkships/pilot` | n/a | **PASS** — 8 institution names render; 4 deferred absent; "8 listings" header; zero console errors |
| Browser QA `/contact` for 3 active rows | n/a | **PASS** — banner + hidden inputs + `runtime_set=active` for each |
| Validators (11) | All PASS | All PASS |

## 2. Activated rows

1. **`pilot-014-NC-duke-university-hospital`** — Duke University Hospital (Durham, NC). Site-level Duke SOM visiting-students office; VSLO required; LCME/AOA + COCA-osteo audience source-supported.
2. **`pilot-017-NY-nyu-langone-tisch-hospital`** — NYU Langone Health - Tisch Hospital (New York, NY). Site-level Tisch under NYU Langone; NYU Grossman SOM visiting-students lane.
3. **`pilot-019-IN-iu-health-methodist-hospital`** — Indiana University Health Methodist Hospital (Indianapolis, IN). Site-level IU Health Methodist under IU SOM Guest Students.

All 3 cards were copied **byte-identical** from `src/data/usce/public-listings-pilot-staged-batch-3.generated.json` (verified via `git checkout`-style replay). Caveats preserved verbatim: `LCME_AOA_ONLY` (Duke also `COCA_OSTEO_ALSO_ELIGIBLE`); 3 non-US audiences `EXCLUDED_EXPLICIT`; `VISA_NOT_MENTIONED_US_ONLY_AUDIENCE` + `NO_J1_VERIFIED` + `NO_H1B_VERIFIED`; `COST_NOT_STATED`. No banned phrases.

## 3. Why these rows

The previous audit (`P99-P97-STAGED-RUNTIME-BATCH-3-PROMOTION-CANDIDATE-AUDIT`) ranked the 7 batch-3 candidates by source scope, public-copy risk, and report-mapping readiness. These 3 are the **site-level** rows whose `campus_name` literally names the SOM lane that owns the rotation — the cleanest brand-vs-source match. The 4 system-level rows (Jackson / Northwestern / HUP / Methodist San Antonio) carry an explicit `SYSTEM_PAGE_SOURCE_NO_<SITE>_SPECIFIC_GUARANTEE` caveat and are deferred to a later slice. Methodist San Antonio additionally has PARTIAL source detail and needs a per-site source landed first.

## 4. Caveat preservation

All 3 rows pass byte-identical caveat preservation. Detail in `slice_1_caveat_preservation_audit.csv`.

| Caveat | Duke | NYU Tisch | IU Methodist |
|--------|------|-----------|--------------|
| Audience: US LCME/AOA only; non-US `EXCLUDED_EXPLICIT` | YES | YES | YES |
| Visa: `NOT_MENTIONED_US_ONLY_AUDIENCE` + `NO_J1_VERIFIED` + `NO_H1B_VERIFIED` | YES | YES | YES |
| Cost: `COST_NOT_STATED` | YES | YES | YES |
| Site scope: campus_name names the canonical SOM lane | YES (Duke SOM office) | YES (Tisch under NYU Langone) | YES (IU Health Methodist under IU SOM) |
| Application method: VSLO_REQUIRED (Duke) / SOM lane | YES | YES | YES |
| Banned claims absent | YES | YES | YES |

## 5. Report / contact QA

All 3 rows resolve correctly via `/contact?ref=pilot-listing&listing_id=…`. Detail in `slice_1_report_link_qa.csv` and `slice_1_browser_qa_results.csv`. Resolver `runtimeSet` for the 3 activated rows in `KNOWN_LISTINGS` was flipped from `"staged"` to `"active"` and the resolver-validator's per-row expectation was updated to match. The 4 deferred rows still resolve to `runtimeSet: "staged"` — by design.

Live submission against the disabled endpoint returns 404 → client shows polite generic message. This is acceptable for the noindex slice; the env-flag flip is its own decision after rate-limit + larger QA.

## 6. Import / exposure audit

Detail in `slice_1_import_exposure_audit.csv`. Highlights:
- **No app source imports the staged batch-3 module.** `grep -rln 'public-listings-pilot-staged-batch-3' src/app src/lib` → only the staged generated TS/JSON itself.
- **Deferred IDs (Jackson / Northwestern / HUP / Methodist San Antonio) absent from active runtime JSON.** Validator-enforced.
- **Deferred IDs present only as `runtimeSet: "staged"` metadata in `KNOWN_LISTINGS`** — required for `/contact` to resolve a banner if a user lands at a deferred ID's URL; the resolver disambiguates via `runtime_set`.
- **No homepage / nav / sitemap exposure introduced.** No layout / sitemap config touched.
- **Route remains `noindex+nofollow`.** `/clerkships/pilot/page.tsx` not modified.
- **Pre-existing Prisma DB pool exhaustion** affects the homepage (`/`) and is unrelated to this slice. `/clerkships/pilot` and `/contact` do not use Prisma.

## 7. Rollback plan

Detail in `slice_1_rollback_plan.md`. One-liner: `git revert --no-edit <slice-commit>` returns active runtime to 5 cards and reverts every validator update. No DB rollback needed (no DB writes). No production rollback needed (no deploy).

## 8. Validator results

All 11 validators PASS. Detail in `slice_1_validation_results.csv`. Three validators were updated to remain truthful after a slice that intentionally drifts active runtime:
- `validate-micro-pilot-runtime.ts` — expected count cap 5 → 8; original-5 preservation; slice-1 IDs present; deferred IDs absent.
- `validate-p99-staged-runtime-batch-2.ts` — restricted active-card cross-check to original-5 IDs (so the validator doesn't break when active grows).
- `validate-p99-batch-3-promotion-candidate-audit.ts` — replaced "active runtime not changed in git" with "deferred batch-3 IDs not in active runtime" (data-level invariant survives slices).
- `validate-p99-contact-ref-prefill.ts` — split test cases; 3 activated → expect `runtime_set=active`; 4 staged → expect `runtime_set=staged`.

GitHub open alerts: NOT_VERIFIED_THIS_TURN (gh CLI logged out from the prior P0 token-rotation cleanup). Last verified state = 0 open / alert #1 resolved as `wont_fix`.

## 9. Browser QA results

| Check | Result |
|-------|--------|
| `/clerkships/pilot` HTTP 200 | PASS |
| Header copy "8 listings · 2 open to international students per source · 6 US MD/DO per source" | PASS — auto-derived from updated `PILOT_*_COUNT` exports |
| Original 5 institutions visible (Morristown / Overlook / CCF Mercy / CCF Hillcrest / Highland) | PASS |
| 3 newly active institutions visible (Duke / NYU Langone / IU Health Methodist) | PASS |
| 4 deferred institutions NOT visible (Jackson / Northwestern / HUP / Methodist San Antonio) | PASS |
| Route metadata contains `noindex` | PASS |
| Banned phrases absent on page | PASS — no `guaranteed` / `IMG-friendly` / `apply through USCEHub` / `hospital-approved` / `officially approved by` / `nationwide` |
| `/contact?listing_id=pilot-014-…&ref=pilot-listing` banner = "Duke University Hospital, Durham, NC" + `runtime_set=active` hidden field | PASS |
| `/contact?listing_id=pilot-017-…` banner = "NYU Langone Health - Tisch Hospital, New York, NY" + `runtime_set=active` | PASS |
| `/contact?listing_id=pilot-019-…` banner = "Indiana University Health Methodist Hospital, Indianapolis, IN" + `runtime_set=active` | PASS |
| `/contact?ref=pilot-feedback` (no listing) — generic Subject dropdown, no banner | PASS |
| Console errors / warnings | **0 / 0** |
| Mobile viewport (default preset) layout | PASS — header wraps, intro stacks |

## 10. What this sprint did NOT do

- **No production deploy.** No `vercel --prod`. No PR. No merge to main.
- **No public launch.** Route remains `noindex+nofollow`.
- **No homepage / nav / sitemap exposure.**
- **No staged batch 3 module imported by app code.**
- **No DB / schema / Prisma / seed / cron change.**
- **No correction-endpoint env-flag flip.** `USCE_CORRECTION_INTAKE_ENABLED` still false-by-default.
- **No deferred batch-3 row activated** (Jackson / Northwestern / HUP / Methodist San Antonio remain non-active).
- **No new evidence capture, no new screening, no Queue 4 work.**
- **No public copy expansion**, no audience broadening, no caveat removal.
- **No new validator added** beyond updates to existing ones.
- **No `/contact` UI redesign**; only resolver `KNOWN_LISTINGS` runtime_set metadata updated for the 3 activated rows.
- **No `gh auth status -t` and no token printing.**
- **No mutation of unrelated dirty files** (`.claude/launch.json`, `src/data/usce/public-listings.generated.{json,ts}`, NPPES files, redesign-mockups, frozen-internal-copy READMEs all untouched and unstaged).

## 11. Recommended next sprint

**Most likely:** **`P99-P97-STAGED-RUNTIME-BATCH-3-NOINDEX-ACTIVATION-SLICE-2`** — activate HUP and/or Northwestern Memorial. They share the same system-level pattern as Slice-1's deferral set; their `SYSTEM_PAGE_SOURCE_NO_<SITE>_SPECIFIC_GUARANTEE` caveat is already present in `campus_name` and `fit_warnings`, so activation is mechanical. Pick 1 or 2 at the user's call.

**Alternative if anything in Slice-1's first hours of QA looks off:** **`P99-P97-NOINDEX-ACTIVE-8-CARD-BROWSER-QA-AND-COPY-POLISH`** — focus only on polishing copy and verifying the 3 newly-active cards in extended viewports / dark mode / mobile / a11y. No new activation.

**If the user wants the clean branch backed up to GitHub:** **`P99-P97-PUSH-CLEAN-BRANCH-AND-SYNC`** — re-login to gh CLI, push the clean branch's accumulated commits (currently 5 ahead of when it was first pushed), re-verify the secret-scanning alert state.

## 12. Strategic checkpoint

> Are we moving toward big product?

**Yes.** Active inventory grew **5 → 8 (60%)** in this slice. The chain is now: `347 screened → 9 validated → 14 staged + mapped → /contact wired → 3 activated, 4 deferred`. The next slice can grow active to 10 or 11 by activating HUP and/or Northwestern.

> Did this reduce the 347 → 5 bottleneck?

**Yes — directly.** The visible product surface grew by 60% in one sprint using zero new screening time. This is the first sprint in the entire chain that increased the *visible, browser-rendering* card count.

> Are we drifting?

**No.** The slice touched 4 source files, updated 4 validators (none weakened — all extended), and produced 9 docs. Active runtime gained 3 cards exactly as audited. Browser preview verified the change end-to-end.

> What must stop?

Continued audit / mapping / infrastructure work past this point. The next sprint must either (a) the Slice-2 activation, (b) push the clean branch to GitHub for backup, or (c) browser-polish the 8-card view in more viewports.

> What must continue?

The "audit, then activate, then verify" discipline. Every future slice should mirror this one: small scope, byte-identical card copy, validator updates not weakening, browser QA before commit, no deploy, no env-flag flip, trivially reversible.

## 13. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No public launch | CONFIRMED — route remains `noindex+nofollow` |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No staged batch 3 import by app | CONFIRMED — validator + grep |
| No `NO_PUBLIC_NOW` / `NO_IMPORT_READY` token discipline broken | CONFIRMED |
| No banned phrase | CONFIRMED — DOM scan |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No tokens / secrets printed | CONFIRMED |
| No deferred batch-3 row activated | CONFIRMED — Jackson / Northwestern / HUP / Methodist San Antonio absent from active runtime; validator-enforced |
| No weakening of existing validators | CONFIRMED — 4 validators extended, none weakened |
| Browser preview verification run before turn end | CONFIRMED — `/clerkships/pilot` + `/contact` for 3 rows + console-errors check |
| Trivially reversible | CONFIRMED — single `git revert` returns active to 5 |
