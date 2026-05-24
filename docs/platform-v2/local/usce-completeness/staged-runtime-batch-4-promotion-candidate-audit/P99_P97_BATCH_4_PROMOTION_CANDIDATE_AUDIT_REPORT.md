# P99-P97 Batch 4 — Promotion Candidate Audit Report

**Sprint ID:** `P99-P97-BATCH-4-PROMOTION-CANDIDATE-AUDIT`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `57c39ac` (Sprint 1 — batch 4 report-issue mapping)
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED
**Scope:** Audit the 2 staged batch-4 rows (Vanderbilt UMC, UCSF Medical Center) and decide whether each is safe to activate in the next noindex slice. Docs + 1 validator only. No code change beyond the validator. No active runtime change. No activation.

---

## 1. Executive result

| Item | Value |
|------|-------|
| Top 1 candidate | `pilot-020-TN-vanderbilt-university-medical-center` — `PROMOTE_WITH_CAVEAT` |
| Top 2 candidate | `pilot-021-CA-ucsf-medical-center` — `PROMOTE_WITH_CAVEAT` |
| Deferred rows | NONE |
| Active runtime card count | **10 — UNCHANGED** |
| Staged batch-4 card count | **2 — UNCHANGED** |
| Production-public card count | **0 — UNCHANGED** |
| Activation performed? | **NO — no active runtime change in this sprint** |
| Validators run | All PASS |
| New validator added | `scripts/validate-p99-batch-4-promotion-candidate-audit.ts` |

## 2. Why this sprint matters

Sprint 1 (HEAD `57c39ac`) wired the 2 batch-4 IDs into the report-issue / evidence-join / correction-payload mapping and into the contact resolver as `runtimeSet=staged`. That made activation *defensible*. This sprint decides whether the same activation pattern that worked for HUP and Northwestern in batch-3 Slice 2 is safe to repeat for Vanderbilt UMC and UCSF Medical Center. **The activation slice itself is the next sprint.**

## 3. Candidate ranking table

| Rank | Listing | Source scope | Public-copy risk | Decision |
|------|---------|--------------|------------------|----------|
| 1 | `pilot-020` Vanderbilt UMC (TN) | **SCHOOL_LEVEL** — Vanderbilt SOM visiting-students page; UMC not separately enumerated | LOW | `PROMOTE_WITH_CAVEAT` |
| 2 | `pilot-021` UCSF Medical Center (CA) | **SCHOOL_LEVEL** — UCSF SOM visiting-student page; UCSF MC not separately enumerated | LOW | `PROMOTE_WITH_CAVEAT` |

Both rows mirror the batch-3 Slice-2 shape (HUP / Northwestern) and rely on the same school-level caveat already embedded in `campus_name`, `restriction_tags`, and `fit_warnings`.

Detail in `batch_4_activation_candidate_shortlist.csv`.

## 4. Source-scope findings

Both rows are **school-level**: the source is the SOM visiting-students page, not a hospital-specific page. This is identical in shape to the activated HUP (Penn / Perelman SOM) and Northwestern (Feinberg SOM) cards. The mitigation is the same three-line caveat:

1. `campus_name` contains the literal `SYSTEM_PAGE_SOURCE_NO_<HOSPITAL>_SPECIFIC_GUARANTEE` token.
2. `restriction_tags` repeats the token.
3. `fit_warnings` surfaces a reader-visible school-level disclosure.

No system-level multi-hospital language appears in either source. No brand-vs-source mismatch large enough to warrant deferral.

Detail in `batch_4_source_scope_audit.csv`.

## 5. Audience / visa / cost findings

| Listing | Audience | IMG | Visa | Cost |
|---------|----------|-----|------|------|
| `pilot-020` Vanderbilt | `ELIGIBLE_EXPLICIT_VIA_STEP_OR_COMLEX` (LCME *and* AOA) | `EXCLUDED_EXPLICIT` | `VISA_NOT_MENTIONED_US_ONLY_AUDIENCE` | `FEE_REQUIRED_180_VERBATIM` |
| `pilot-021` UCSF | `ELIGIBLE_EXPLICIT_VIA_VSLO_US_MD_DO` (LCME *and* AOA; verbatim "US medical and osteopathic students") | `EXCLUDED_EXPLICIT` | `VISA_NOT_MENTIONED_US_ONLY_AUDIENCE` | `COST_NOT_STATED` (honest absence; no inferred number) |

Neither row carries IMG / international / "broad audience" language. UCSF's cost field is recorded as missing — the card never substitutes a fabricated figure.

Detail in `batch_4_audience_scope_audit.csv`.

## 6. Public-copy risk

Both rows score LOW on every axis: no banned phrase, no broad IMG claim, no visa overclaim, no hospital-approval overclaim, no guarantee, no "apply through USCEHub" language. Reader-visible caveat strings are present.

Detail in `batch_4_public_copy_risk_audit.csv`.

## 7. Contact / report readiness

Both rows already pass:
- Report-issue listing map row exists (Sprint 1).
- Evidence join map row exists (Sprint 1).
- Correction payload contract defined (Sprint 1).
- Resolver returns `VALID_LISTING_CONTEXT` with `runtimeSet=staged`.
- Hidden form fields render in the page on `/contact?listing_id=…&ref=pilot-listing`.

Live correction submission still gates on `USCE_CORRECTION_INTAKE_ENABLED`. Acceptable for the noindex slice: posts succeed silently when the flag is later enabled.

## 8. Deferred rows and why

NONE. Both batch-4 candidates clear the same gates that HUP and Northwestern cleared. `batch_4_defer_reasons.csv` contains a single `NONE` placeholder row to make the explicit "nothing deferred" statement auditable.

## 9. Validator results

`scripts/validate-p99-batch-4-promotion-candidate-audit.ts` enforces:
- shortlist size 1..2
- every shortlisted row has `recommended_action` containing `CAVEAT`
- no HIGH-risk public-copy row shortlisted
- every shortlisted row already exists in the prior batch-4 report-issue listing map
- every shortlisted row has the school-level caveat preserved (`scope_decision` matches `SCHOOL_LEVEL`, `required_caveat` matches `SPECIFIC_GUARANTEE`)
- every shortlisted row has US-only audience (LCME/AOA `ELIGIBLE_EXPLICIT`, IMG `EXCLUDED_EXPLICIT`, international `EXCLUDED_EXPLICIT`, `audience_caveat_safe=YES`, `activation_blocker=NO`)
- every non-shortlisted row has a defer reason
- no bare runtime-promotion token in any audit doc (`NO_PUBLIC_NOW` / `NO_IMPORT_READY` discipline preserved)
- both batch-4 IDs resolve in `usce-contact-context.ts` with `runtimeSet=staged`
- no drift on protected paths: `public-listings-pilot.generated.{json,ts}`, `public-listings-pilot-staged-batch-{2,3,4}.generated.{json,ts}`, `src/app/clerkships/pilot`, `src/app/contact`
- no app source imports the staged batch-4 module

GitHub open alerts: NOT_VERIFIED_THIS_TURN (gh CLI may be logged out post P0 token-rotation cleanup). Last verified state = 0 open / prior alert resolved as `wont_fix`.

## 10. What this sprint did NOT do

- **No active runtime change** (`public-listings-pilot.generated.{json,ts}` untouched).
- **No staged batch-4 data change.**
- **No `/clerkships/pilot` route change.**
- **No `/contact` UI change.**
- **No correction endpoint env-flag flip.**
- No homepage / nav / sitemap exposure.
- No production deploy. No PR. No merge to main. No force-push.
- No DB / schema / Prisma / seed / cron.
- No new evidence capture, no new screening.
- No public copy expansion. No audience broadening. No caveat removal.
- `NO_PUBLIC_NOW` / `NO_IMPORT_READY` token discipline preserved.
- No mutation of unrelated dirty files.

## 11. Recommended next sprint

`P99-P97-STAGED-RUNTIME-BATCH-4-NOINDEX-ACTIVATION-SLICE`.

Activate **both** shortlisted rows (or one of them, at the user's call):
- `pilot-020-TN-vanderbilt-university-medical-center`
- `pilot-021-CA-ucsf-medical-center`

Slice contract:
1. Append the 2 cards verbatim from staged batch-4 to `src/data/usce/public-listings-pilot.generated.{json,ts}`; preserve the existing 10 verbatim. Active runtime grows **10 → 12**.
2. Flip both IDs from `runtimeSet: "staged"` to `runtimeSet: "active"` in `src/lib/usce-contact-context.ts`.
3. Update `STAGED_ONLY_IDS` in `scripts/validate-p99-contact-ref-prefill.ts` to drop both IDs.
4. Update `validate-micro-pilot-runtime.ts` if its expected-count cap is exceeded.
5. Re-run `validate-no-secrets`, `tsc --noEmit`, and the full validator stack.
6. Browser-preview verify `/clerkships/pilot` (both cards visible) and `/contact?listing_id=…&ref=pilot-listing` for each.
7. Single commit; local only; push held until user types "push".

Strict scope: no UI redesign, no `/contact` change, no correction-endpoint env-flag flip, no production deploy. The slice is reversible by reverting the commit.

## 12. Strategic checkpoint

> Are we moving toward big product?

Yes — and the chain shortens: `347 screened → 9 (then +6 in batch-3, +2 in batch-4) bridge-validated → 16 staged + mapped → 10 active → 12 active in the next slice`. The audit-then-activate discipline holds.

> Did this reduce the 347 → 10 bottleneck?

Indirectly. The next sprint will move active 10 → 12 (a 20% inventory increase) using zero new screening time.

> Are we drifting?

No. This sprint produced 5 CSVs + 1 decision log + 1 validator + this report — all inside one named folder. No app code touched.

> What should stop?

Further audit / mapping / infrastructure work past this point. The next move must be the activation slice itself.

> What should continue?

The "validate, stage, audit, then activate" discipline.

## 13. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No active runtime change | CONFIRMED |
| No batch 2 / batch 3 / batch 4 staged data change | CONFIRMED |
| No `/clerkships/pilot/*` change | CONFIRMED |
| No `/contact/*` change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No app code change | CONFIRMED — only docs + 1 validator added |
| `NO_PUBLIC_NOW` / `NO_IMPORT_READY` token discipline | CONFIRMED |
| No banned phrase | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No tokens / secrets printed | CONFIRMED |
| No weakening of existing validators | CONFIRMED — added new validator only |
