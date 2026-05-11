# P99-P97 Staged Runtime Batch 4 — Data-Only Sprint Report

**Sprint ID:** `P99-P97-STAGED-RUNTIME-BATCH-4-DATA-ONLY`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `b38e26480384ebd661b0628965bd06d2ea92ffd6`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Build staged-batch-4 data file containing active 10 + Vanderbilt + UCSF. Data-only. Not imported by app. No active runtime change. No production.

---

## 1. Executive result

| Metric | Value |
|--------|-------|
| Staged batch 4 files created | 2 (`.json` + `.ts`) |
| Staged batch 4 card count | **12** (active 10 + Vanderbilt + UCSF) |
| Active runtime card count | **10 — UNCHANGED** |
| Existing staged batch 3 card count | **14 — UNCHANGED** |
| Production-public count | **0 — UNCHANGED** |
| Imports of batch 4 by app code | **0** (validator-enforced) |
| Validators (13) | All PASS |
| GitHub open secret-scanning alerts | **0** |

## 2. New rows

### `pilot-020-TN-vanderbilt-university-medical-center` — Vanderbilt University Medical Center (Nashville, TN)
- Display bucket: `READY_PUBLIC_US_STUDENT_ONLY`
- Audience: `us_md_do=ELIGIBLE_EXPLICIT`; 3 non-US `EXCLUDED_EXPLICIT`
- Source: `https://medschool.vanderbilt.edu/md/visiting-students/`
- Caveats: `LCME_AOA_ONLY`, `MS4_ONLY`, `STEP_1_OR_2_OR_COMLEX_REQUIRED`, `VSLO_REQUIRED`, `AFFILIATION_AGREEMENT_REQUIRED`, `FEE_REQUIRED_180`, `WINDOW_JUNE_TO_DECEMBER`, `SYSTEM_PAGE_SOURCE_NO_VANDERBILT_UMC_SPECIFIC_GUARANTEE`
- campus_name: "System-level Vanderbilt SOM source — Vanderbilt University Medical Center site placement not separately enumerated"

### `pilot-021-CA-ucsf-medical-center` — UCSF Medical Center (San Francisco, CA)
- Display bucket: `READY_PUBLIC_US_STUDENT_ONLY`
- Audience: `us_md_do=ELIGIBLE_EXPLICIT`; 3 non-US `EXCLUDED_EXPLICIT`
- Source: `https://meded.ucsf.edu/visiting-student-program`
- Caveats: `LCME_AOA_ONLY`, `VSLO_REQUIRED`, `GOOD_ACADEMIC_STANDING_REQUIRED`, `COST_NOT_STATED`, `WINDOW_NOT_STATED`, `SYSTEM_PAGE_SOURCE_NO_UCSF_MEDICAL_CENTER_SPECIFIC_GUARANTEE`
- campus_name: "System-level UCSF SOM source — UCSF Medical Center site placement not separately enumerated"

## 3. Caveats preserved

All caveats from the bridge-validation sprint carried forward verbatim. Detail in `staged_batch_4_caveat_preservation_audit.csv`. No claim broadening; no audience inference; no fake visa or cost. UCSF's missing cost is honestly recorded as `COST_NOT_STATED`.

## 4. Public copy audit

Detail in `staged_batch_4_public_copy_audit.csv`. Both new rows: no banned phrase, no broad-IMG overclaim, no sponsorship claim, no hospital-approval overclaim, no guarantee, no apply-through-USCEHub. Safe public copy uses verbatim source phrases only.

## 5. Source-scope audit

Detail in `staged_batch_4_source_scope_audit.csv`. Both rows: SCHOOL_LEVEL source (Vanderbilt SOM / UCSF SOM); hospital-specific framing requires the `SYSTEM_PAGE_SOURCE_NO_<SITE>_SPECIFIC_GUARANTEE` caveat. Same shape as Slice-2's activated HUP + Northwestern.

## 6. Audience audit

Detail in `staged_batch_4_audience_scope_audit.csv`. Both rows: US LCME/AOA only; non-US audiences `EXCLUDED_EXPLICIT`. Vanderbilt's `Step 1/2 or COMLEX` requirement disambiguates LCME vs AOA explicitly. UCSF's "US medical and osteopathic students" verbatim.

## 7. Import / exposure audit

Detail in `staged_batch_4_import_exposure_audit.csv`. Highlights:
- Staged batch 4 JSON + TS created (12 cards).
- Active runtime unchanged (`git status --short` empty for active pilot files).
- Staged batch 3 unchanged (`git status --short` empty).
- No app source imports `public-listings-pilot-staged-batch-4` or its symbols (`grep -rln` returns only the generated TS/JSON itself).
- `pilot-020` / `pilot-021` do not appear anywhere in `src/app` or `src/lib` (the contact resolver will be updated in a later mapping sprint).
- No homepage / nav / sitemap exposure.
- Route `/clerkships/pilot` unchanged.

## 8. Validator results

All 13 validators PASS. Detail in `staged_batch_4_validation_results.csv`. The new `validate-p99-staged-runtime-batch-4.ts` enforces: 12 cards, exact ID set, US-only invariant on the 2 new rows (`us_md_do=ELIGIBLE_EXPLICIT`, three non-US `EXCLUDED_EXPLICIT`, `LCME_AOA_ONLY` tag), system-level caveats in `campus_name`, no banned phrase, no `PUBLIC_NOW`/`IMPORT_READY` token, import-safety grep.

`validate-no-secrets.ts` PASS — 1260 files / 0 findings. GitHub open alerts = 0.

## 9. Rollback plan

Detail in `staged_batch_4_rollback_plan.md`. One-liner: `git revert <commit>` removes every file added by this sprint. No DB rollback. No production rollback (no deploy).

## 10. What this sprint did NOT do

- No active runtime change. Active 10 preserved verbatim.
- No staged batch 3 change.
- No app import of staged batch 4.
- No `/clerkships/pilot` or `/contact` change.
- No production deploy. No PR. No merge to main.
- No DB / schema / Prisma / seed / cron change.
- No screening of the 23-row manual-browser backlog (still queued).
- No report-issue mapping for the new rows (separate next sprint).
- No promotion-candidate audit yet.
- No public copy expansion.
- No mutation of unrelated dirty files.

## 11. Recommended next sprint

**`P99-P97-STAGED-RUNTIME-BATCH-4-REPORT-ISSUE-MAPPING`** — extend `/contact` resolver `KNOWN_LISTINGS` to include the 2 new staged rows (with `runtimeSet: "staged"`), build listing-map + evidence-join + correction-payload artifacts mirroring the batch-3 mapping pattern. Pure docs + small resolver update.

Then:
1. `P99-P97-BATCH-4-PROMOTION-CANDIDATE-AUDIT` — pick activation order.
2. `P99-P97-BATCH-4-NOINDEX-ACTIVATION-SLICE` — activate the audit-approved subset (active 10 → 11 or 12).

Then return to `P97-QUEUE-4-SESSION-1-MANUAL-NAVIGATION-PASS-2` for the 23-row browser backlog.

## 12. Strategic checkpoint

> Are we moving toward big product?

**Yes.** Staged inventory grew from 14 (batch 3) to 12 (batch 4 — note: batch 4 is a *separate* snapshot containing active 10 + 2 new, not additive to batch 3's count). The activation pipeline is fully in motion.

> Did this create staged data?

**Yes.** Two new staged candidate cards (Vanderbilt + UCSF) with full caveat stacks, ready for the next mapping + audit + activation sprints.

> Did we drift?

**No.** This sprint touched 0 source data files (active / batch-3 staged), 2 new generated data files, 1 new generator, 1 new validator, 11 docs in a single named folder. No app code changed.

> What stops now?

Adding more candidates to staged batch 4. The next 3 sprints (mapping + audit + activation) must convert these 2 rows; only after activation lands should the 23-row browser backlog re-open.

> What continues?

The "screen → harden → curate → validate → stage → audit → activate" pipeline. Vanderbilt + UCSF have cleared the "stage" gate. Three more sprints to activation.

## 13. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No active runtime change | CONFIRMED |
| No staged batch 2 / batch 3 change | CONFIRMED |
| No `/clerkships/pilot/*` / `/contact/*` change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| `NO_PUBLIC_NOW` / `NO_IMPORT_READY` discipline preserved | CONFIRMED |
| No banned phrase | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No FREIDA / ACGME / AAMC scraping | CONFIRMED |
| No login / CAPTCHA bypass | CONFIRMED |
| No fake PNG / Wayback / quote | CONFIRMED — sources fetched honestly; cost not stated where source is silent |
| No tokens / secrets committed | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| No app import of staged batch 4 | CONFIRMED — validator-enforced |

## 14. Plain-English summary

We built the staged batch 4 data file: a copy of the 10 currently active cards plus Vanderbilt and UCSF, totalling 12. The new file lives next to the existing staged batch 2 and batch 3 files but isn't imported by the app — it's safety scaffolding for future activation. Both new rows carry the same school-level source caveats as the previously activated HUP and Northwestern rows. Production main is still byte-identical. The next sprint extends the `/contact` resolver to know about the two new IDs so the report-issue links will resolve once they activate.

## 15. Progress estimate

**Rough progress toward strong USCEHub v1 launch: ~38%** (was ~37% at sprint start).

Movement of +1% reflects 2 new staged cards in the activation pipeline. Active runtime stays 10 and production-public stays 0, so progress does not exceed 38% in this sprint. The +%-point bump beyond ~38% comes when the next 3 sprints (mapping + audit + noindex activation slice) bring active to 12. Not inflating.
