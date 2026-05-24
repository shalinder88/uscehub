# P99-P97 Bridge-to-Runtime Prep Batch 2 — Sprint Report

**Date:** 2026-05-09
**Sprint ID:** `P99-P97-BRIDGE-TO-RUNTIME-PREP-BATCH-2`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `2ed48c8 P99: land manual PNG evidence for batch two`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Build a docs-only staged 7-card runtime candidate package combining the active 5-card pilot runtime + the 2 newly Tier-A+ validated bridge rows (`pilot-011` UPMC Western Psychiatric, `pilot-012` Lincoln Medical). **No active runtime mutation. No production. No UI. No route exposure.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Rows prepared | 2 (`pilot-011`, `pilot-012`) |
| Candidate runtime card count | **7** (5 active preserved verbatim + 2 newly mapped) |
| Active app runtime touched | **NO** ✅ — `src/data/usce/public-listings-pilot.generated.json` UNCHANGED |
| Active route touched | **NO** ✅ — `/clerkships/pilot` UNCHANGED |
| Candidate runtime location | `docs/platform-v2/local/usce-completeness/bridge-to-runtime-prep-batch-2/bridge_to_runtime_prep_batch_2_candidate_runtime.json` (NOT under `src/data/`) |
| Candidate validator authored | YES — `scripts/validate-p99-runtime-prep-candidate.ts` |
| Candidate validator result | **PASSED** — 0 errors |
| Bridge-input validator post-sprint | **PASSED** — DRAFT unchanged from prior sprint |
| Existing 5-row pilot runtime validator | **PASSED** — runtime untouched |
| Production deploy | NOT TRIGGERED ✅ |

## 2. Input evidence

| Source | Status |
|--------|--------|
| Bridge-input DRAFT (`first_pilot_mini_curator_reaudit_6_bridge_input_DRAFT.csv`) | `bridge_review_status=VALIDATED_BRIDGE_INPUT` for both rows; bridge validator PASSED in prior sprint and re-PASSED today |
| PNG evidence (`manual-png-landing-1/screenshots/`) | 5 canonical PNGs landed; Tier-A+ achieved in prior sprint |
| Wayback archives | All 5 archived (4 sprint-fresh, 1 prior April 12 snapshot HEAD-verified) |
| Verbatim source quotes | Captured in DRAFT `source_quote_under_280` and in this sprint's evidence manifest |

## 3. UPMC Western Psychiatric (`pilot-011`) — runtime-prep result

### Safe runtime card mapped
- `listing_id`: `pilot-011-PA-upmc-western-psychiatric-hospital`
- `campus_name`: *"System-level UPSOM/UPMC source — Western Psychiatric site placement not separately enumerated"* (mirrors active CC Hillcrest pattern)
- `display_bucket`: `READY_PUBLIC_IMG_RELEVANT` (international program admits international students with carveout)
- `eligible_audiences`: `[US_MD_DO, INTERNATIONAL_STUDENT]`
- `excluded_audiences`: `[IMG_GRADUATE]`
- `unknown_audiences`: `[CARIBBEAN_STUDENT]` (source silent on Caribbean for international program)
- `audience_detail`: `{us_md_do: ELIGIBLE_EXPLICIT, international_student: ONLY_IF_AFFILIATED, img_graduate: EXCLUDED_EXPLICIT, caribbean_student: UNKNOWN_NOT_STATED}`
- `restriction_tags`: 11 tokens — LCME_AOA_ONLY · MS4_ONLY · VSLO_EXCEPT_SGUSOM · FEE_REQUIRED · MAX_TWO_APPLICATIONS · VISA_APPLICANT_OBTAINED_B1 · NO_J1_SPONSORSHIP · NO_H1B_SPONSORSHIP · SYSTEM_PAGE_SOURCE_NO_WPIC_SPECIFIC_GUARANTEE · STEP_2_REQUIRED_FOR_PSYCHIATRIC_ELECTIVE · NO_OBSERVERSHIP_FOR_GRADUATES
- `fit_warnings`: 4 highest-priority — LCME_AOA_ONLY · FEE_REQUIRED · MS4_ONLY · SYSTEM_PAGE_SOURCE_NO_WPIC_SPECIFIC_GUARANTEE
- `official_source_url`: `https://www.medstudentaffairs.pitt.edu/visiting-students`
- `last_reviewed_at`: `2026-05-09T00:00:00Z`

### Caveats preserved verbatim
Domestic LCME/AOA NA only · International final-year-only with $4,500/elective · Step 2 for psych · graduates explicitly excluded · B-1/B-2 only (no J-1/H-1B sponsorship) · system-level source (no Western Psychiatric site guarantee).

### Source links + report links
- Source link: `https://www.medstudentaffairs.pitt.edu/visiting-students` (will render as "Official source" external link).
- Report-issue link: derivable from `listing_id` via existing `/contact?ref=pilot-listing&listing_id=pilot-011-PA-upmc-western-psychiatric-hospital` pattern (no UI change required).

### Remaining blockers (soft)
- New restriction tag tokens (`SYSTEM_PAGE_SOURCE_NO_WPIC_SPECIFIC_GUARANTEE`, `STEP_2_REQUIRED_FOR_PSYCHIATRIC_ELECTIVE`, `NO_OBSERVERSHIP_FOR_GRADUATES`) need `RESTRICTION_TAG_LABELS` entries in `PilotClerkshipListings.tsx` for clean rendering (current UI fallback produces readable lowercase-with-spaces text — usable but less polished).

## 4. Lincoln Medical (`pilot-012`) — runtime-prep result

### Safe runtime card mapped
- `listing_id`: `pilot-012-NY-nyc-health-hospitals-lincoln`
- `campus_name`: *"System-level NYC H+H MOSAIC source — Lincoln site placement not separately enumerated"* (mirrors active CC Hillcrest vocabulary)
- `display_bucket`: `READY_PUBLIC_US_STUDENT_ONLY`
- `eligible_audiences`: `[US_MD_DO]`
- `excluded_audiences`: `[INTERNATIONAL_STUDENT, IMG_GRADUATE, CARIBBEAN_STUDENT]`
- `audience_detail`: `{us_md_do: ELIGIBLE_EXPLICIT, international_student: EXCLUDED_EXPLICIT, img_graduate: EXCLUDED_EXPLICIT, caribbean_student: EXCLUDED_EXPLICIT}`
- `restriction_tags`: 7 tokens — LCME_AOA_ONLY · FEE_NOT_MENTIONED · STIPEND_PROVIDED · HOUSING_STIPEND_NON_NYC_METRO · SYSTEM_PAGE_SOURCE_NO_LINCOLN_SPECIFIC_GUARANTEE · EM_SITE_SPECIFIC_SECONDARY_SOURCE · URM_ENCOURAGED
- `fit_warnings`: 3 — LCME_AOA_ONLY · SYSTEM_PAGE_SOURCE_NO_LINCOLN_SPECIFIC_GUARANTEE · STIPEND_PROVIDED
- `official_source_url`: `https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/`
- `last_reviewed_at`: `2026-05-09T00:00:00Z`

### Caveats preserved verbatim
US LCME/AOA only · Caribbean / IMG explicitly excluded · $2K rotation stipend + $2K housing stipend (non-NYC metro) · system-level (no Lincoln site guarantee) · Lincoln EM secondary source EM-only.

### Source links + report links
- Source link: `https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/`.
- Report-issue link derivable from `listing_id`.

### Remaining blockers (soft)
- New restriction tag tokens (`SYSTEM_PAGE_SOURCE_NO_LINCOLN_SPECIFIC_GUARANTEE`, `STIPEND_PROVIDED`, `HOUSING_STIPEND_NON_NYC_METRO`, `EM_SITE_SPECIFIC_SECONDARY_SOURCE`, `URM_ENCOURAGED`) need `RESTRICTION_TAG_LABELS` entries.

## 5. Candidate runtime package

| Field | Value |
|-------|-------|
| Path | `docs/platform-v2/local/usce-completeness/bridge-to-runtime-prep-batch-2/bridge_to_runtime_prep_batch_2_candidate_runtime.json` |
| Card count | 7 |
| Active 5 cards preserved verbatim | YES (verified by candidate validator) |
| 2 candidate cards added | YES (`pilot-011`, `pilot-012`) |
| Top-level safety flags | `candidate_only=true`, `not_imported_by_app=true`, `not_public_now=true`, `not_import_ready=true`, `not_production=true` |
| `must_not_be_imported_by` declared | `src/lib/usce-pilot-data.ts`, `src/app/clerkships/pilot/page.tsx`, `src/app/clerkships/pilot/PilotClerkshipListings.tsx` |
| Imported by app code | NO — file lives under `docs/`, never under `src/data/`; no app code references it |
| Banned phrases | NONE (validator confirms) |
| `PUBLIC_NOW` / `IMPORT_READY` / `BRIDGE_READY_TO_RUNTIME` / `APPROVED_FOR_PUBLICATION` tokens | NONE in unsafe positions (validator confirms) |
| Evidence manifest PNG paths exist on disk | YES (validator verified) |

## 6. `NO_PNG_BYPASS_AT_RUNTIME` decision

**Option A retained: token kept in DRAFT `not_allowed_actions`.**

Rationale (per the prompt's preferred conservative path):
- The token's purpose is defense in depth at the runtime gate. PNG evidence has landed (Tier-A+ achieved), but the *runtime-generation* sprint is the gate that has the authority to decide whether PNG sufficiency is met for this specific row set.
- This sprint is bridge-to-runtime *prep*, not runtime generation. Removing the token here would prematurely authorize the next sprint without that sprint's own audit.
- The candidate runtime audit (Section 3) records that PNG evidence has landed, supplying the runtime-generation sprint with a clear waiver path: it can satisfy the constraint by either (a) re-verifying the PNGs and documenting the satisfaction, or (b) explicitly removing the token in its own scoped DRAFT update.

The DRAFT was NOT mutated in this sprint.

## 7. What this sprint did NOT do

- Did NOT modify the active 5-card pilot runtime (`src/data/usce/public-listings-pilot.generated.json` UNCHANGED).
- Did NOT modify the active pilot route (`src/app/clerkships/pilot/*` UNCHANGED).
- Did NOT modify validators (only AUTHORED a new docs-only candidate validator).
- Did NOT modify the bridge-input DRAFT (Option A — defense in depth retained).
- Did NOT generate runtime data files (the candidate package is docs-only).
- Did NOT mark any row PUBLIC_NOW or IMPORT_READY.
- Did NOT add restriction tag UI labels (deferred to runtime-generation sprint).
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT broaden audience eligibility.
- Did NOT remove caveats.
- Did NOT mutate the T7 queue file.
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 8. Recommended next step

**`P99-P97-RUNTIME-GENERATION-BATCH-2-STAGED`** — that sprint will:

1. Audit the candidate runtime package against the active runtime allow-list and the existing micro-pilot validator.
2. Decide whether to remove `NO_PNG_BYPASS_AT_RUNTIME` from the bridge DRAFT's `not_allowed_actions` (defense-in-depth retained today).
3. Either:
   - **Path A (preferred):** Promote a 7-card runtime artifact to a NEW path (e.g. `src/data/usce/public-listings-pilot-batch-2.generated.json`) without replacing the active 5-card file, and gate UI rendering by an env-flag or non-default route segment. This keeps the existing `/clerkships/pilot` 5-card pilot stable while a parallel 7-card preview can be smoke-tested.
   - **Path B (more aggressive):** Replace the active 5-card runtime with the 7-card runtime in place, but only after explicit user approval and a separate scope audit.
4. Add `RESTRICTION_TAG_LABELS` entries for the new tokens (small UI change, scoped to label vocabulary only).
5. Re-run `validate-micro-pilot-runtime.ts` to confirm the expanded set still passes (validator may need a small allow-list extension for the new tag tokens).
6. Stop before any preview-route-rebuild or production deploy.

## 9. Validators run

| Check | Result |
|-------|--------|
| Pre-sprint `tsc --noEmit` | clean |
| Pre-sprint `validate-micro-pilot-runtime.ts` | PASSED — 5 cards |
| Pre-sprint `validate-p99-p97-bridge-input.ts` against DRAFT | PASSED |
| New `validate-p99-runtime-prep-candidate.ts` | **PASSED** — 0 errors against the 7-card candidate JSON |
| Post-sprint `validate-micro-pilot-runtime.ts` | PASSED — active runtime UNCHANGED |
| Post-sprint runtime data files | UNCHANGED |

## 10. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `--prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / prisma / seed | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED |
| No runtime generation | CONFIRMED — candidate package is docs-only and explicitly flagged not_imported_by_app, not_public_now, not_import_ready, not_production, candidate_only |
| No active runtime replacement | CONFIRMED — `src/data/usce/public-listings-pilot.generated.json` UNCHANGED |
| No route / UI / sitemap / nav / homepage changes | CONFIRMED |
| No validator weakening | CONFIRMED — new validator is strict; existing validators untouched |
| No caveat removed | CONFIRMED |
| No audience broadened | CONFIRMED |
| No visa overclaim | CONFIRMED — UPMC: B-1/B-2 only with NO_J1_SPONSORSHIP + NO_H1B_SPONSORSHIP tags |
| No site-specific guarantee added | CONFIRMED — both candidates use SYSTEM_PAGE_SOURCE_NO_*_SPECIFIC_GUARANTEE tokens |
| No fake source / fake evidence / fake PNG | CONFIRMED — all source URLs, archive URLs, PNG paths verified by candidate validator |
| No login / CAPTCHA / credentialed scraping | CONFIRMED |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force push | CONFIRMED |
