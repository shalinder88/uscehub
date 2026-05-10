# P99-P97 Staged Runtime Batch 3 — Promotion Candidate Audit Report

**Sprint ID:** `P99-P97-STAGED-RUNTIME-BATCH-3-PROMOTION-CANDIDATE-AUDIT`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `f146c3cfcd15f7bd6752689123c8d3200c1864ba`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Audit the 7 new staged batch-3 rows; pick a 1–3 row shortlist for a future noindex-active activation slice. Docs + 1 small validator. No code change beyond the validator. No active runtime change. No production. No activation.

---

## 1. Executive result

| Item | Value |
|------|-------|
| Top 1 candidate | **`pilot-014-NC-duke-university-hospital`** (Duke University Hospital) |
| Top 2 candidate | **`pilot-017-NY-nyu-langone-tisch-hospital`** (NYU Langone Health - Tisch Hospital) |
| Top 3 candidate | **`pilot-019-IN-iu-health-methodist-hospital`** (Indiana University Health Methodist Hospital) |
| Deferred (system-level scope; safe but not first) | `pilot-013` Jackson · `pilot-015` Northwestern · `pilot-016` HUP |
| Deferred (PARTIAL source detail) | `pilot-018` Methodist San Antonio |
| Active runtime card count | **5 — UNCHANGED** |
| Staged batch 3 card count | **14 — UNCHANGED** |
| Production-public card count | **0 — UNCHANGED** |
| Activation performed? | **NO — no active runtime change in this sprint** |
| Validators run | All PASS (12 distinct checks) |
| New validator added | `scripts/validate-p99-batch-3-promotion-candidate-audit.ts` |

## 2. Why this sprint matters

The previous four sprints landed verified data, staged it, mapped report-issue context, and closed the `/contact` UI blocker. Together they made the activation decision *defensible* — but not yet *made*. This sprint makes the decision: which subset of the 7 new rows is safest to activate first, and which to hold back. The output is a shortlist with explicit defer reasons for the rest. **The activation itself is the next sprint, not this one.**

## 3. Candidate ranking table

| Rank | Listing | Source scope | Public-copy risk | Decision |
|------|---------|--------------|------------------|----------|
| 1 | `pilot-014` Duke University Hospital (NC) | **SITE_LEVEL** Duke SOM visiting-students office | LOW | TOP_1 |
| 2 | `pilot-017` NYU Langone Health - Tisch Hospital (NY) | **SITE_LEVEL** Tisch under NYU Langone (NYU Grossman SOM lane) | LOW | TOP_2 |
| 3 | `pilot-019` Indiana University Health Methodist Hospital (IN) | **SITE_LEVEL** IU Health Methodist under IU SOM | LOW | TOP_3 |
| 4 | `pilot-016` Hospital of the University of Pennsylvania (PA) | SYSTEM_LEVEL Perelman; HUP not separately enumerated | LOW | SAFE_BUT_NOT_FIRST |
| 5 | `pilot-015` Northwestern Memorial Hospital (IL) | SYSTEM_LEVEL Feinberg; NMH not separately enumerated | LOW | SAFE_BUT_NOT_FIRST |
| 6 | `pilot-013` Jackson Memorial Hospital (FL) | SYSTEM_LEVEL UM Miller; brand recognizability vs source mismatch | LOW_TO_MEDIUM | DEFER_SOURCE_SCOPE |
| 7 | `pilot-018` Methodist Hospital — San Antonio (TX) | SYSTEM_LEVEL HCA GME multi-site; PARTIAL source detail | MEDIUM | DEFER_APPLICATION_METHOD |

Detail in `batch_3_promotion_candidate_matrix.csv`.

## 4. Source-scope findings

The discriminating axis among the 7 is **how cleanly the card's name maps to the source's scope**:

- **Site-level cards** (Duke, NYU Tisch, IU Methodist) — `campus_name` literally names the SOM office or the site under its parent system. The source URL is the canonical visiting-students page for that lane. No copy framing acrobatics needed; the existing card is publicly defensible as-is.
- **System-level cards** (Northwestern, HUP, Jackson) — `campus_name` carries the explicit `System-level <SOM> source — <site> placement not separately enumerated` caveat, plus a `SYSTEM_PAGE_SOURCE_NO_<SITE>_SPECIFIC_GUARANTEE` tag in `restriction_tags` and `fit_warnings`. Activatable, but the brand-vs-source mismatch is highest for Jackson because "Jackson Memorial" is among the most publicly recognizable hospital names in the country.
- **Multi-site partial source** (Methodist San Antonio) — quote_manifest rated PARTIAL audience/application. Activatable only after a per-site source lands.

Detail in `batch_3_source_scope_audit.csv`.

## 5. Audience / visa / cost findings

All 7 rows share the same audience structure:
- `us_md_do = ELIGIBLE_EXPLICIT`
- `international_student = EXCLUDED_EXPLICIT`
- `img_graduate = EXCLUDED_EXPLICIT`
- `caribbean_student = EXCLUDED_EXPLICIT`

This uniformity is by design — every row was promoted out of the curator pass with that exclusion intact. None of them is a candidate for "broad IMG" claims, which is correct given the source language. Visa is `VISA_NOT_MENTIONED_US_ONLY_AUDIENCE` for all 7, with `NO_J1_VERIFIED` and `NO_H1B_VERIFIED` carried as conservative tags. Cost is `COST_NOT_STATED` for all 7 — no "free" or "no fee" claim is permitted.

Duke additionally has `COCA_OSTEO_ALSO_ELIGIBLE` as a source-supported audience expansion (LCME *or* COCA-osteo). That widens the eligible audience by a tiny, source-verified amount and does not introduce overpromise risk.

Detail in `batch_3_audience_visa_cost_audit.csv`.

## 6. Contact / report readiness

All 7 rows already pass:
- Report-issue listing map row exists (from previous mapping sprint).
- Evidence join map row exists.
- Correction payload contract defined.
- Resolver `resolveContactContext` returns `VALID_LISTING_CONTEXT` with the correct visible banner.
- Hidden form fields (`listing_id`, `report_ref`, `runtime_set=staged`, `evidence_join_key`, `honeypot_field`) render in the page.

The only gap that still requires a future env-flag flip is **live correction submission**: with `USCE_CORRECTION_INTAKE_ENABLED=false`, the endpoint returns 404 and the client surfaces a polite generic message. **This is acceptable for the noindex slice** — readers can still report an issue (the form posts successfully when the flag is later enabled), and the immediate noindex audience is small and curator-monitored.

Detail in `batch_3_contact_report_readiness_audit.csv`.

## 7. Deferred rows and why

| Row | Defer reason | Severity |
|-----|--------------|----------|
| `pilot-013` Jackson Memorial | Source-scope system-level + brand recognizability mismatch — high public expectation vs system-level evidence | LOW_TO_MEDIUM |
| `pilot-015` Northwestern Memorial | Source-scope system-level (Feinberg → NMH) — same shape as HUP; just not first | LOW |
| `pilot-016` HUP | Source-scope system-level (Perelman → HUP) — strong candidate for Slice-2 | LOW |
| `pilot-018` Methodist San Antonio | Source detail PARTIAL; HCA GME multi-site source — needs per-site source landed before activation | MEDIUM |

Detail in `batch_3_defer_reasons.csv`.

## 8. Noindex activation preflight

Detail in `batch_3_noindex_activation_preflight_checklist.md`. Summary of what the next sprint MUST do:

1. Activate **only** rows from the shortlist (Duke / NYU Tisch / IU Methodist).
2. Keep `/clerkships/pilot` `noindex+nofollow`. No homepage / nav / sitemap exposure.
3. Re-verify `/contact?ref=pilot-listing&listing_id=…` banner for each promoted row in browser preview.
4. Disabled-endpoint behavior is acceptable for the noindex slice; env-flag flip is its own decision.
5. Trivially reversible: a single revert of the slice commit returns active runtime to 5.
6. No production deploy. No PR. No merge to `main`. No force-push.

## 9. Validator results

All 12 validators PASS. Detail in `batch_3_promotion_candidate_validation_results.csv`. The new `validate-p99-batch-3-promotion-candidate-audit.ts` enforces:
- 7-row matrix completeness
- shortlist size 1–3
- no HIGH-risk row shortlisted
- shortlisted rows already exist in the prior batch-3 report-issue listing map
- every non-shortlisted row has a defer reason
- no `PUBLIC_NOW` / `IMPORT_READY` token in any audit doc
- no drift on `src/data/usce/public-listings-pilot.generated.{json,ts}`, `src/data/usce/public-listings-pilot-staged-batch-2.generated.json`, `src/data/usce/public-listings-pilot-staged-batch-3.generated.json`, or `src/app/clerkships/pilot/`
- no app source imports the staged batch-3 module

GitHub open alerts: NOT_VERIFIED_THIS_TURN (gh CLI logged out from the prior P0 token-rotation cleanup). Last verified state = 0 open / alert #1 resolved as `wont_fix`.

## 10. What this sprint did NOT do

- **No active runtime change.** `src/data/usce/public-listings-pilot.generated.{json,ts}` not modified.
- **No staged batch 3 data change.**
- **No `/clerkships/pilot` route change.**
- **No `/contact` UI change.**
- **No correction endpoint env-flag flip.**
- No homepage / nav / sitemap exposure.
- No production deploy. No PR. No merge to main.
- No DB / schema / Prisma / seed / cron.
- No new evidence capture, no new screening, no Queue 4 work.
- No new public copy expansion; no audience broadening; no caveat removal.
- No `PUBLIC_NOW` / `IMPORT_READY` token introduced.
- No mutation of unrelated dirty files.

## 11. Recommended next sprint

**`P99-P97-STAGED-RUNTIME-BATCH-3-NOINDEX-ACTIVATION-SLICE-1`.**

Activate **exactly** the 3 shortlisted rows (or any subset thereof, at the user's call):
- `pilot-014-NC-duke-university-hospital`
- `pilot-017-NY-nyu-langone-tisch-hospital`
- `pilot-019-IN-iu-health-methodist-hospital`

Slice contract:
1. Append the 3 cards (or a subset) to `src/data/usce/public-listings-pilot.generated.{json,ts}` as new entries; preserve the existing 5 verbatim.
2. Update `validate-micro-pilot-runtime.ts` if its expected-count cap is exceeded.
3. Re-run `validate-no-secrets`, `tsc --noEmit`, and the full validator stack.
4. Browser-preview verification on `/clerkships/pilot` for each new card and `/contact?listing_id=…&ref=pilot-listing` for each.
5. Single commit; local only; push held until user types "push".

Strict scope: no UI redesign, no `/contact` change, no correction-endpoint env-flag flip, no production deploy. The slice is reversible by reverting the commit.

## 12. Strategic checkpoint

> Are we moving toward big product?

Yes. The decision step is now made for the next slice — Duke + NYU Tisch + IU Methodist as the safest first activations. The chain is `347 screened → 9 validated → 14 staged + mapped → /contact wired → 3 chosen for first activation`.

> Did this reduce the 347 → 5 bottleneck?

Indirectly — but the next sprint will. If Slice-1 lands cleanly, active runtime grows from **5 → up to 8** in one move (a 60% increase in active inventory) using zero new screening time.

> Are we drifting?

No. This sprint produced 9 docs + 1 validator in one named folder. No app code touched.

> What should stop?

Continued audit / mapping / infrastructure work past this point. The next sprint must be the activation slice itself.

> What should continue?

The "validate, stage, audit, then activate" discipline. Today's sprint is the audit. Slice-1 is the activation. After Slice-1 lands, deferred rows can be reconsidered as Slice-2 or Slice-3 candidates.

## 13. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No active runtime change | CONFIRMED |
| No batch 2 / batch 3 staged data change | CONFIRMED |
| No `/clerkships/pilot/*` change | CONFIRMED |
| No `/contact/*` change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No app code change | CONFIRMED — only docs + 1 validator added |
| No `PUBLIC_NOW` / `IMPORT_READY` token | CONFIRMED |
| No banned phrase | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED — `.claude/launch.json`, `public-listings.generated.{json,ts}`, NPPES, redesign-mockups, frozen-internal-copy READMEs all UNTOUCHED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No tokens / secrets printed | CONFIRMED |
| No weakening of existing validators | CONFIRMED — added new validator only |
