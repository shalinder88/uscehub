# P99-P97 Runtime Generation Batch 2 — Staged Data Only — Sprint Report

**Date:** 2026-05-09
**Sprint ID:** `P99-P97-RUNTIME-GENERATION-BATCH-2-STAGED-DATA-ONLY`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `d661098 P99: prepare batch two runtime candidate package`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Promote the docs-only 7-card candidate runtime into a staged data-only artifact under `src/data/`, without importing it into the app and without changing `/clerkships/pilot`. **No route. No env-flag. No UI. No production. No active runtime replacement.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Staged data generated | YES |
| Staged JSON path | `src/data/usce/public-listings-pilot-staged-batch-2.generated.json` |
| Staged TS path | `src/data/usce/public-listings-pilot-staged-batch-2.generated.ts` |
| Card count | **7** (5 active preserved verbatim + 2 newly mapped) |
| Active runtime touched | **NO** ✅ — `src/data/usce/public-listings-pilot.generated.{json,ts}` UNCHANGED |
| Active app code touched | **NO** ✅ — `src/lib/usce-pilot-data.ts`, `src/app/clerkships/pilot/*` UNCHANGED |
| App imports of staged file | **0** ✅ |
| Staged validator authored | YES — `scripts/validate-p99-staged-runtime-batch-2.ts` |
| Staged validator result | **PASSED** — 0 errors |
| Active runtime validator | **PASSED** — 5 cards UNCHANGED |
| Production deploy | NOT TRIGGERED ✅ |

## 2. Files created

| File | Purpose |
|------|---------|
| `src/data/usce/public-listings-pilot-staged-batch-2.generated.json` | Staged 7-card runtime JSON with top-level safety flags + reference to active runtime + must_not_be_imported_by list |
| `src/data/usce/public-listings-pilot-staged-batch-2.generated.ts` | TypeScript export pair (`PILOT_USCE_CARDS_STAGED_BATCH_2_METADATA` + `PILOT_USCE_CARDS_STAGED_BATCH_2: UsceCard[]` + 3 counts) with file-header guard comments |
| `scripts/validate-p99-staged-runtime-batch-2.ts` | Strict validator (16 hard-fail rule families including import-safety grep) |
| `docs/platform-v2/local/usce-completeness/runtime-generation-batch-2-staged-data-only/runtime_generation_batch_2_staged_mapping.csv` | Per-row mapping audit |
| `docs/platform-v2/local/usce-completeness/runtime-generation-batch-2-staged-data-only/runtime_generation_batch_2_staged_audit.csv` | 22-check audit table |
| `docs/platform-v2/local/usce-completeness/runtime-generation-batch-2-staged-data-only/runtime_generation_batch_2_staged_blockers.csv` | Blockers log (none hard; 2 soft items deferred) |
| `docs/platform-v2/local/usce-completeness/runtime-generation-batch-2-staged-data-only/runtime_generation_batch_2_staged_import_safety_check.md` | Import-safety procedure + result |
| `docs/platform-v2/local/usce-completeness/runtime-generation-batch-2-staged-data-only/P99_P97_RUNTIME_GENERATION_BATCH_2_STAGED_DATA_ONLY_REPORT.md` | This report |

## 3. UPMC Western Psychiatric (`pilot-011`) — staged card result

- **listing_id:** `pilot-011-PA-upmc-western-psychiatric-hospital`
- **campus_name (caveat surface):** *"System-level UPSOM/UPMC source — Western Psychiatric site placement not separately enumerated"* (mirrors active CC Hillcrest's vocabulary)
- **display_bucket:** `READY_PUBLIC_IMG_RELEVANT` (international program admits international students with carveout)
- **audience_detail:** `{us_md_do: ELIGIBLE_EXPLICIT, international_student: ONLY_IF_AFFILIATED, img_graduate: EXCLUDED_EXPLICIT, caribbean_student: UNKNOWN_NOT_STATED}`
- **restriction_tags (11):** `LCME_AOA_ONLY · MS4_ONLY · VSLO_EXCEPT_SGUSOM · FEE_REQUIRED · MAX_TWO_APPLICATIONS · VISA_APPLICANT_OBTAINED_B1 · NO_J1_SPONSORSHIP · NO_H1B_SPONSORSHIP · SYSTEM_PAGE_SOURCE_NO_WPIC_SPECIFIC_GUARANTEE · STEP_2_REQUIRED_FOR_PSYCHIATRIC_ELECTIVE · NO_OBSERVERSHIP_FOR_GRADUATES`
- **fit_warnings (4):** highest-priority subset for amber pills
- **official_source_url:** `https://www.medstudentaffairs.pitt.edu/visiting-students`
- **last_reviewed_at:** `2026-05-09T00:00:00Z`

Caveats preserved verbatim: domestic LCME/AOA NA only · international final-year-only with $4,500/elective · Step 2 for psychiatric electives · graduates explicitly excluded · B-1/B-2 only with no J-1 / H-1B sponsorship stated · system-level source.

Remaining (soft, non-blocking): 3 new restriction-tag labels need `RESTRICTION_TAG_LABELS` entries in a future UI sprint for prettier rendering. The UI fallback already renders them as readable lowercase-with-spaces text.

## 4. Lincoln Medical (`pilot-012`) — staged card result

- **listing_id:** `pilot-012-NY-nyc-health-hospitals-lincoln`
- **campus_name (caveat surface):** *"System-level NYC H+H MOSAIC source — Lincoln site placement not separately enumerated"*
- **display_bucket:** `READY_PUBLIC_US_STUDENT_ONLY`
- **audience_detail:** `{us_md_do: ELIGIBLE_EXPLICIT, international_student: EXCLUDED_EXPLICIT, img_graduate: EXCLUDED_EXPLICIT, caribbean_student: EXCLUDED_EXPLICIT}`
- **restriction_tags (7):** `LCME_AOA_ONLY · FEE_NOT_MENTIONED · STIPEND_PROVIDED · HOUSING_STIPEND_NON_NYC_METRO · SYSTEM_PAGE_SOURCE_NO_LINCOLN_SPECIFIC_GUARANTEE · EM_SITE_SPECIFIC_SECONDARY_SOURCE · URM_ENCOURAGED`
- **fit_warnings (3):** highest-priority subset
- **official_source_url:** `https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/`
- **last_reviewed_at:** `2026-05-09T00:00:00Z`

Caveats preserved verbatim: US LCME/AOA only · Caribbean / IMG explicitly excluded · $2K rotation stipend + $2K housing stipend (non-NYC metro) · system-level source · Lincoln EM secondary source EM-only.

Remaining (soft, non-blocking): 5 new restriction-tag labels need `RESTRICTION_TAG_LABELS` entries in a future UI sprint.

## 5. Import safety

Detail in `runtime_generation_batch_2_staged_import_safety_check.md`. Summary:

- `grep -rln` for the staged file's basename and exported symbols across `src/`, `app/`, `components/` returns **only the staged file itself**.
- The active route (`src/lib/usce-pilot-data.ts`, `src/app/clerkships/pilot/page.tsx`, `src/app/clerkships/pilot/PilotClerkshipListings.tsx`) does NOT import the staged module.
- The validator's `STAGED_FILE_IS_IMPORTED` rule programmatically enforces this on every run.
- The TS file's header comment, distinct export names (`PILOT_USCE_CARDS_STAGED_BATCH_2` vs active `PILOT_USCE_CARDS`), top-level safety flags in the JSON, and validator's import-safety check together form four layers of defense against accidental future import.

## 6. Validator result

| Validator | Pre-sprint | Post-sprint |
|-----------|------------|-------------|
| `tsc --noEmit` | clean | clean |
| `validate-micro-pilot-runtime.ts` | PASSED — 5 cards | PASSED — 5 cards UNCHANGED |
| `validate-p99-p97-bridge-input.ts` against DRAFT | PASSED | PASSED — DRAFT unchanged |
| `validate-p99-runtime-prep-candidate.ts` against docs-only candidate | PASSED | PASSED — candidate unchanged |
| **NEW** `validate-p99-staged-runtime-batch-2.ts` against staged JSON | n/a | **PASSED** — 0 errors |

## 7. What this sprint did NOT do

- Did NOT modify the active runtime JSON or TS (`src/data/usce/public-listings-pilot.generated.{json,ts}` UNCHANGED).
- Did NOT modify `src/lib/usce-pilot-data.ts`.
- Did NOT modify `/clerkships/pilot` route or its component.
- Did NOT modify the bridge-input DRAFT.
- Did NOT modify any other validator script.
- Did NOT add a new route, an env-flag, or any alternate public exposure.
- Did NOT add UI restriction-tag labels (deferred).
- Did NOT mark any artifact PUBLIC_NOW or IMPORT_READY.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT submit any form, login, contact request, or payment.
- Did NOT broaden audience eligibility.
- Did NOT remove any caveat.
- Did NOT change `NO_PNG_BYPASS_AT_RUNTIME` in the DRAFT.
- Did NOT mutate the T7 queue file.
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 8. Recommended next step

Per the user's standing doctrine ("backsite/data/trust foundation first; UI later"), the next sprint should be one of these backsite continuation paths — NOT a UI/route exposure:

1. **`P99-P97-STAGED-RUNTIME-REPORT-ISSUE-MAPPING-1`** — verify and document the report-issue intake / correction-workflow mapping for the 2 newly-staged rows. Confirm `/contact?ref=pilot-listing&listing_id=…` carries the staged listing IDs correctly (no UI build; doc-spec only). Strengthens trust before any preview exposure.
2. **`P99-P97-STAGED-RUNTIME-REVIEW-BATCH-2`** — second-pass review of the staged 7-card data, focusing on a curator's adjudication of the soft items: should `NO_PNG_BYPASS_AT_RUNTIME` be removed in DRAFT? Should the 8 new restriction-tag tokens get UI labels in a separate scoped change?
3. (Deferred indefinitely) Any preview/route exposure of the 7-card staged data — requires its own scope audit + explicit user approval.

The user's prompt explicitly preferred option 1 ("Verify report-issue mapping and correction workflow for staged runtime rows before any public route or production decision."). That is the recommended next sprint.

## 9. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `--prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / prisma / seed | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED — staged validator hard-blocks both |
| No active runtime replacement | CONFIRMED — `src/data/usce/public-listings-pilot.generated.{json,ts}` UNCHANGED |
| No `src/lib/usce-pilot-data.ts` change | CONFIRMED |
| No `/clerkships/pilot` change | CONFIRMED |
| No new route / env-flag / alternate public exposure | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No UI / interface change | CONFIRMED |
| No existing validator weakened | CONFIRMED — only AUTHORED a new strict validator |
| No caveat removed | CONFIRMED |
| No audience broadened | CONFIRMED |
| No visa overclaim | CONFIRMED |
| No site-specific guarantee added | CONFIRMED |
| No fake source / fake evidence / fake PNG | CONFIRMED |
| No login / CAPTCHA / credentialed scraping | CONFIRMED |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force push | CONFIRMED |
| App imports of staged module | 0 (validator confirms) |
