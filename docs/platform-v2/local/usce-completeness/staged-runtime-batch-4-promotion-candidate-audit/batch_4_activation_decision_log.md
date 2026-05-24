# Batch 4 — Activation Decision Log

**Sprint ID:** `P99-P97-BATCH-4-PROMOTION-CANDIDATE-AUDIT`
**Date:** 2026-05-10
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED
**Scope:** Decide which batch-4 rows are safe to activate into the noindex pilot in the next sprint. **No activation in this sprint.**

---

## Rows audited

| Listing ID | Institution | City / State |
|------------|-------------|--------------|
| `pilot-020-TN-vanderbilt-university-medical-center` | Vanderbilt University Medical Center | Nashville, TN |
| `pilot-021-CA-ucsf-medical-center` | UCSF Medical Center | San Francisco, CA |

Both rows were staged by `P99-STAGED-RUNTIME-BATCH-4-DATA-ONLY` (HEAD `847fb9b`) and report-mapped by `P99-MAP-STAGED-RUNTIME-BATCH-FOUR-REPORTS` (HEAD `57c39ac`).

## Decision

| Listing | Recommended action | Why |
|---------|-------------------|-----|
| `pilot-020` Vanderbilt UMC | `PROMOTE_WITH_CAVEAT` | Vanderbilt SOM source (school-level). Audience LCME *and* AOA explicit (Step 1/2 or COMLEX). Application method VSLO + affiliation agreement verbatim. Cost `$180` verbatim. Window June–December verbatim. School-level caveat already embedded in `campus_name` + `restriction_tags` + `fit_warnings`. Mirrors HUP/Northwestern shape already activated in Batch-3 Slice 2. |
| `pilot-021` UCSF Medical Center | `PROMOTE_WITH_CAVEAT` | UCSF SOM source (school-level). Audience verbatim "US medical and osteopathic students" — LCME *and* AOA explicit. Application method VSLO via AAMC verbatim. Cost honestly recorded as `COST_NOT_STATED` (do not infer a number). Same school-level caveat shape as Vanderbilt. |

**Deferred rows:** none. Both candidates clear the same gates that HUP and Northwestern cleared in Batch-3 Slice 2. `batch_4_defer_reasons.csv` carries a single `NONE` row by design.

## Why the school-level caveat is sufficient (not a blocker)

For both rows, the source is the school of medicine's visiting-students page, not a hospital-specific page. The card therefore cannot promise that the named hospital separately enumerates the visiting clerkship lane. Three concrete mitigations are in place from the data-only sprint:

1. `campus_name` includes the literal `SYSTEM_PAGE_SOURCE_NO_<HOSPITAL>_SPECIFIC_GUARANTEE` token.
2. `restriction_tags` repeats the same token.
3. `fit_warnings` surfaces a school-level disclosure to the reader.

This is the same caveat shape applied to HUP and Northwestern when they activated. It does not require new public copy work; the renderer already handles it.

## Why audience is safe (no IMG overclaim)

For both rows:
- `us_md_do_status = ELIGIBLE_EXPLICIT_VIA_*`
- `img_status = EXCLUDED_EXPLICIT`
- `international_status = EXCLUDED_EXPLICIT`

There is no language in the cards or in the source quotes that implies IMG or international eligibility. The shape is identical to all 5 batch-3 active cards, and the audit reviewed the source quote manifest line-by-line for any broad "international students" or "IMG" language. None found.

## Why cost / visa is safe

| Listing | Cost | Visa |
|---------|------|------|
| `pilot-020` Vanderbilt UMC | `FEE_REQUIRED_180_VERBATIM` — the `$180` figure appears verbatim in the school's published fee schedule | `VISA_NOT_MENTIONED_US_ONLY_AUDIENCE` — no J-1 / H-1B claim; consistent with US-only audience |
| `pilot-021` UCSF Medical Center | `COST_NOT_STATED` — source does not state a fee; card records absence honestly rather than inferring | same |

Neither row contains a "no fee" or "free" claim. UCSF's missing cost is recorded as missing, not as zero.

## Public copy review

`batch_4_public_copy_audit.csv` (from the data-only sprint) and `batch_4_public_copy_risk_audit.csv` (this sprint) both rate the cards at LOW risk on every axis: no banned claim, no broad IMG claim, no visa overclaim, no hospital-approval overclaim, no guarantee, no "apply through USCEHub". Both cards keep the school-level caveat visible to the reader in `campus_name`.

## Contact / report readiness

The Sprint-1 mapping (HEAD `57c39ac`) already wired both IDs into:
- `staged_runtime_batch_4_report_issue_listing_map.csv`
- `staged_runtime_batch_4_evidence_join_map.csv`
- `staged_runtime_batch_4_correction_payload_map.csv`
- `src/lib/usce-contact-context.ts` — `KNOWN_LISTINGS` (with `runtimeSet=staged`)

The resolver therefore returns `VALID_LISTING_CONTEXT` for `?listing_id=pilot-020-…&ref=pilot-listing` and `?listing_id=pilot-021-…&ref=pilot-listing` without code change. The next sprint can flip both rows to `runtimeSet=active` as part of the slice commit.

## What the next sprint will do

`P99-P97-STAGED-RUNTIME-BATCH-4-NOINDEX-ACTIVATION-SLICE` will:

1. Append both rows to `src/data/usce/public-listings-pilot.generated.{json,ts}` verbatim from the batch-4 staged file. Active runtime grows **10 → 12**.
2. Flip `runtimeSet: "staged"` to `runtimeSet: "active"` for both IDs in `src/lib/usce-contact-context.ts`.
3. Update `validate-p99-contact-ref-prefill.ts` `STAGED_ONLY_IDS` accordingly.
4. Run the full validator stack: secrets, type-check, report-mapping, this audit, contact-resolver, micro-runtime.
5. Browser-preview verify both new cards on `/clerkships/pilot` and `/contact?listing_id=…&ref=pilot-listing` for each.
6. Keep route `noindex+nofollow`. No homepage, nav, sitemap, PR, deploy, or merge to main.

The slice is trivially reversible: a single revert restores active to 10 and both IDs to `staged`.

## What this sprint did NOT do

- No active runtime change (`public-listings-pilot.generated.{json,ts}` untouched).
- No staged batch-4 data change.
- No `/clerkships/pilot` route change.
- No `/contact` UI change.
- No correction endpoint env-flag flip.
- No production deploy. No PR. No merge to main. No force-push.
- No DB / schema / Prisma / seed / cron.
- No new evidence capture, no new screening.
- No public copy expansion. No caveat removal. No audience broadening.
- `NO_PUBLIC_NOW` / `NO_IMPORT_READY` token discipline preserved.
- No mutation of unrelated dirty files.
