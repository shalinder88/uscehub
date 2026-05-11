# P97 Queue 4 Session 1 — Bridge Validation Sprint Report

**Sprint ID:** `P97-QUEUE-4-SESSION-1-BRIDGE-VALIDATION`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `e5d3350d397a21d8c470a02c963c9347dabbb22f`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Convert Vanderbilt + UCSF from TIER_A curator output into a 2-row bridge-validated artifact ready to feed staged-batch-4 build. Docs + 1 new validator. No active runtime change. No production.

---

## 1. Executive result

| Metric | Value |
|--------|-------|
| Input rows | **2** (Vanderbilt + UCSF) |
| Validated rows | **2** — both `VALIDATED_WITH_CAVEATS` |
| Held rows | **0** |
| Rejected rows | **0** |
| Proposed listing_ids | `pilot-020-TN-vanderbilt-university-medical-center` · `pilot-021-CA-ucsf-medical-center` |
| Active runtime card count | **10 — UNCHANGED** |
| Staged runtime card count | **14 — UNCHANGED** |
| Production-public count | **0 — UNCHANGED** |
| GitHub open secret-scanning alerts | **0** |
| Validators (12) | All PASS |

**Both rows are validated for staged batch 4 with explicit caveat stacks.** Neither row is ready for active runtime yet — that requires staged batch 4 build + report-issue mapping + promotion-candidate audit + a noindex activation slice, mirroring the batch-3 → Slice-1/Slice-2 path.

## 2. Vanderbilt bridge validation

| Field | Value |
|-------|-------|
| Proposed listing_id | `pilot-020-TN-vanderbilt-university-medical-center` |
| Source URL | `https://medschool.vanderbilt.edu/md/visiting-students/` |
| Audience | **US_LCME_AOA_ONLY** — "accepts visiting students from other accredited U.S. medical schools" + "Step 1 or Step 2, or COMLEX score" (LCME ∨ AOA explicit) |
| Application method | VSLO via AAMC + affiliation agreement with Vanderbilt SOM |
| Cost | **$180 non-refundable processing fee** (verbatim) |
| Window | June–December |
| Visa | Not stated by source |
| Source scope | **SCHOOL_LEVEL** — Vanderbilt University School of Medicine source |
| Scope caveat (required) | `SCHOOL_LEVEL_SOURCE_NOT_HOSPITAL_SPECIFIC` — Vanderbilt SOM source, VUMC site placement not separately enumerated |
| Restriction tags | `LCME_AOA_ONLY`, `FEE_REQUIRED_180`, `MS4_ONLY`, `STEP_1_OR_2_OR_COMLEX_REQUIRED`, `VSLO_REQUIRED`, `WINDOW_JUNE_TO_DECEMBER`, `SCHOOL_LEVEL_SOURCE_NOT_HOSPITAL_SPECIFIC` |
| Evidence strength | **TIER_A** |
| Validation status | **VALIDATED_WITH_CAVEATS** |
| Recommended runtime status | `STAGED_BATCH_4_CANDIDATE` (not active) |

## 3. UCSF bridge validation

| Field | Value |
|-------|-------|
| Proposed listing_id | `pilot-021-CA-ucsf-medical-center` |
| Source URL | `https://meded.ucsf.edu/visiting-student-program` |
| Audience | **US_LCME_AOA_ONLY** — "VSLO Application Service to receive applications from US medical and osteopathic students" (LCME + AOA explicit) |
| Application method | VSLO via AAMC |
| Cost | Not stated by source |
| Window | Not stated by source |
| Visa | Not stated by source |
| Source scope | **SCHOOL_LEVEL** — UCSF School of Medicine source |
| Scope caveat (required) | `SCHOOL_LEVEL_SOURCE_NOT_HOSPITAL_SPECIFIC` — UCSF SOM source, UCSF Medical Center site placement not separately enumerated |
| Restriction tags | `LCME_AOA_ONLY`, `VSLO_REQUIRED`, `GOOD_ACADEMIC_STANDING_REQUIRED`, `COST_NOT_STATED`, `WINDOW_NOT_STATED`, `SCHOOL_LEVEL_SOURCE_NOT_HOSPITAL_SPECIFIC` |
| Evidence strength | **TIER_A** |
| Validation status | **VALIDATED_WITH_CAVEATS** |
| Recommended runtime status | `STAGED_BATCH_4_CANDIDATE` (not active) |

## 4. Public copy caveats

Detail in `session_1_bridge_public_copy_caveats.csv`. Both rows include explicit `do_not_say` lists (no `guaranteed`, `hospital-approved`, `apply through USCEHub`, `IMG-friendly`, `Caribbean accessible`, `J-1 sponsorship`, `H-1B sponsorship`). Safe public copy drafts use verbatim source quotes and source-supported caveats only.

## 5. Evidence join map

Detail in `session_1_bridge_evidence_join_map.csv`. Both rows trace back to:
- Curator quote file (4 quotes Vanderbilt, 2 quotes UCSF)
- Curator evidence manifest
- Curator-pass HTML snapshot (redacted-safe)
- PNG screenshot: PENDING (deferred to a final pre-activation sprint)
- Wayback archive: PENDING (deferred)

## 6. Source-scope audit

Detail in `session_1_bridge_source_scope_audit.csv`. Both rows: `SCHOOL_LEVEL` sources where the SOM is the canonical pathway for the medical center. Same shape as Slice-2's activated HUP + Northwestern (which also have SOM-level sources framed under hospital cards with explicit `SCHOOL_LEVEL_SOURCE_NOT_<SITE>_SPECIFIC_GUARANTEE` caveat).

## 7. Audience-scope audit

Detail in `session_1_bridge_audience_scope_audit.csv`. Both rows: `US_LCME_AOA_ONLY` with verbatim source support. Non-US audiences (international / IMG / Caribbean) all default to `EXCLUDED_NOT_STATED_AS_ELIGIBLE`. No audience broadening.

## 8. Runtime mapping preview

Detail in `session_1_bridge_runtime_mapping_preview.csv`. Preview-only card titles, audience labels, cost labels, fit_warnings. **Runtime data is NOT generated by this sprint** — preview is for the next sprint (staged batch 4 data-only).

## 9. Hold/rejection log

`session_1_bridge_rejection_or_hold_log.csv` — `NONE`. Both rows passed bridge validation with caveats; nothing held or rejected.

## 10. What this sprint did NOT do

- No staged runtime data file generated.
- No active runtime change.
- No production deploy. No PR. No merge to main.
- No `/clerkships/pilot` or `/contact` change.
- No DB / schema / Prisma / seed / cron change.
- No screening of the 23-row manual-browser backlog (that's the later browser-pass sprint).
- No FREIDA / ACGME / AAMC scraping.
- No login / CAPTCHA bypass.
- No fake PNG / Wayback / quote — PNG_PENDING + WAYBACK_PENDING set honestly.
- No public copy expansion beyond what the source supports verbatim.
- No mutation of unrelated dirty files.

## 11. Recommended next sprint

**`P99-P97-STAGED-RUNTIME-BATCH-4-DATA-ONLY`** for Vanderbilt + UCSF. Output: `src/data/usce/public-listings-pilot-staged-batch-4.generated.{json,ts}` containing the active 10 cards copied verbatim + UCSF + Vanderbilt (total 12 staged cards). NOT imported by app. Mirrors the batch-3 staged data-only pattern.

After that, the standard chain:
1. `P99-P97-STAGED-RUNTIME-BATCH-4-REPORT-ISSUE-MAPPING` — extend `/contact` mapping for the new 2 rows.
2. `P99-P97-BATCH-4-PROMOTION-CANDIDATE-AUDIT` — audit shortlist (likely both 2 if scope caveats are clean).
3. `P99-P97-BATCH-4-NOINDEX-ACTIVATION-SLICE` — activate the audit-approved subset into the noindex pilot (active 10 → 11 or 12).

Then return to `P97-QUEUE-4-SESSION-1-MANUAL-NAVIGATION-PASS-2` for the 23-row browser backlog.

## 12. Strategic checkpoint

> Are we moving toward big product?

**Yes.** Vanderbilt + UCSF are now in the same pipeline that produced Duke / NYU Tisch / IU Methodist (Slice 1) and HUP / Northwestern (Slice 2). After 3 more docs-only sprints (staged + mapping + audit) and 1 activation slice, the active runtime can grow from 10 to 12.

> Did this produce bridge inputs?

**Yes — 2 validated bridge inputs with caveat stacks ready for staged batch 4.**

> Did we drift?

**No.** This sprint touched 0 source data files, 1 new validator, 9 docs in a single named folder. No app code changed.

> What stops now?

Adding more candidates to bridge validation. The next 3 sprints must build staged batch 4 from these 2 rows; only after activation should the 23-row browser backlog be re-attempted.

> What continues?

The "screen → harden → curate → validate → stage → audit → activate" pipeline. Vanderbilt + UCSF have cleared the "validate" stage and are heading to "stage" next.

## 13. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No active runtime change | CONFIRMED |
| No staged data change | CONFIRMED |
| No `/clerkships/pilot/*` / `/contact/*` change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| `NO_PUBLIC_NOW` / `NO_IMPORT_READY` discipline preserved | CONFIRMED |
| No banned phrase outside negation/`do_not_say` context | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No FREIDA / ACGME / AAMC scraping | CONFIRMED |
| No login / CAPTCHA bypass | CONFIRMED |
| No fake PNG / Wayback / quote | CONFIRMED |
| No tokens / secrets committed | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |

## 14. Plain-English summary

We took the two confirmed candidates from the curator pass (Vanderbilt and UCSF) and turned them into a clean 2-row bridge-input file with proposed listing IDs, scope/audience/application/cost decisions, and explicit `do_not_say` lists. Both rows are validated with caveats — they're ready to become staged listings in the next sprint, the same way Duke and HUP did in earlier slices. No public-facing change happened in this sprint; production main is still byte-identical.

## 15. Progress estimate

**Rough progress toward strong USCEHub v1 launch: ~37%** (was ~35% at sprint start). Movement of +2% reflects 2 TIER_A bridge-validated candidates with explicit caveat stacks. The next sprint (staged batch 4 build) preserves this number; the +%-point bump comes when the rows actually activate in a noindex slice (~39%). The 23-row manual-browser backlog remains the larger latent unlock (~40–43% if 6–10 convert). Not inflating.
