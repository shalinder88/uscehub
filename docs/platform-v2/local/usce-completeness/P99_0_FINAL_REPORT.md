# P99-0 USCE Listing Completeness Scorer — Final Report

**Date:** 2026-05-03  
**Branch:** dossier-integration  
**Scope:** Maine (P97 pilot state, 21 candidate opportunities)

---

## Executive Summary

P99-0 built the USCE listing completeness scoring pipeline. It reads P97 opportunity discovery data, joins it with P98-6 identity anchors, scores each listing on 15 dimensions, and classifies it for public display readiness. The pipeline is gated by a TypeScript validator that prevents DO_NOT_SHOW records from leaking into public output and enforces source quality on READY_PUBLIC listings.

**Result:** 12 of 20 listings are READY_PUBLIC. 8 are PUBLIC_WITH_UNKNOWN_FIELDS. Zero are DO_NOT_SHOW.

---

## Phase A — Input Inventory

**Script:** `build_usce_inventory.py`  
**Output:** `P99_0_INPUT_INVENTORY.md`

| Metric | Count |
|---|---|
| Candidate opportunities (p97_candidate_opportunities.csv) | 21 |
| Institutions not found after search | 16 |
| Rejected / non-target | 1 |
| Duplicates | 1 |
| Canonical institutions | 21 |

Key field coverage across the 21 candidates:
- Official source URL: 21/21 (100%)
- Eligibility language: 21/21
- IMG eligibility signal: 21/21
- Application URL: 9/21 (43%)
- Duration: 18/21
- Contact info: 15/21
- IMG explicitly accepted: 11
- IMG explicitly excluded (LCME-only): 6
- Exact official program page: 12
- Identity-anchored (P98-6): 20/21

---

## Phase B — Listing Schema

**Script:** `build_listing_candidates.py`  
**Output:** `usce_listing_candidates.csv`

20 listing rows (1 REJECTED_NON_TARGET excluded). Fields derived from P97 opportunity data:

| Derived field | Logic |
|---|---|
| img_eligibility | YES / NO / UNKNOWN from imgEligibility raw text |
| vslo_required | Presence of "vslo" in applicationUrl or evidenceSnippet |
| application_method | VSLO / SMARTSHEET / ONLINE_PORTAL / EMAIL / UNKNOWN |
| hands_on_level | CLINICAL / OBSERVATION / UNKNOWN from opportunity type |
| fee_status / deadline_status | Derived from cost / deadline fields |

IMG eligibility breakdown: YES=8, NO=4, UNKNOWN=8

---

## Phase C — Completeness Scoring

**Script:** `score_listing_completeness.py`  
**Output:** `usce_listing_completeness.csv`

15 scoring dimensions (0–5 each, max=75):

| Dimension | What it measures |
|---|---|
| official_source | Source page quality (program page=5, dept=4, generic=1) |
| eligibility_clarity | Explicit eligibility language present |
| usce_type_clarity | Known type (elective/clerkship/sub-I/observership) |
| student_grad_clarity | Medical student vs. resident/fellow distinction |
| img_clarity | Explicit IMG YES/NO vs. UNKNOWN |
| vslo_affiliation_clarity | VSLO and affiliation requirements explicit |
| hands_on_clarity | Clinical vs. observation vs. unknown |
| lor_eval_clarity | LOR / evaluation possibility stated |
| application_method | Method + URL known |
| fee_clarity | Fee stated or confirmed no fee |
| deadline_clarity | Deadline stated or rolling |
| duration_clarity | Duration in weeks/months stated |
| contact_clarity | Contact email or URL present |
| source_quote_coverage | Eligibility + fee + deadline quotes present |
| freshness | Review date recency |

### Classification results

| Status | Count | Meaning |
|---|---|---|
| READY_PUBLIC | 12 | Source + eligibility + application method all explicit |
| PUBLIC_WITH_UNKNOWN_FIELDS | 8 | Good source but ≥1 key field unknown |
| NEEDS_REVIEW | 0 | |
| DO_NOT_SHOW | 0 | |
| FUTURE_LANE_ONLY | 0 | |

Average completeness score: 45.5 / 75

### READY_PUBLIC listings

| ID | Institution | Specialty |
|---|---|---|
| ME-001 | Maine Medical Center (MMC) | multispecialty |
| ME-003 | Central Maine Medical Center / CMHC | multispecialty |
| ME-004 | MMC / General Surgery | general_surgery |
| ME-006 | MMC / Anesthesiology | anesthesiology |
| ME-007 | MMC / Interventional Radiology | interventional_radiology |
| ME-015 | CMHC / Family Medicine | family_medicine |
| ME-016 | CMHC / Emergency Medicine | emergency_medicine |
| ME-017 | CMHC / OB-GYN | obstetrics_gynecology |
| ME-018 | CMHC / Pediatrics | pediatrics |
| ME-019 | CMHC / Surgery | surgery |
| ME-020 | CMHC / Internal Medicine | internal_medicine |
| ME-021 | CMHC / Rural Family Medicine | family_medicine_rural |

### PUBLIC_WITH_UNKNOWN_FIELDS listings

| ID | Institution | Primary unknown fields |
|---|---|---|
| ME-002 | Togus VA | img_eligibility, application_method |
| ME-005 | MMC / Emergency Medicine | img_eligibility |
| ME-008 | MMC / Family Medicine | img_eligibility |
| ME-009 | MMC / Pediatrics | img_eligibility |
| ME-010 | MMC / Psychiatry | img_eligibility, application_url |
| ME-011 | MMC / Diagnostic Radiology | img_eligibility, application_url |
| ME-013 | Northern Light EMMC | img_eligibility |
| ME-014 | EMMC FM Residency | img_eligibility, application_url |

The MMC specialties all have unknown IMG eligibility because the hub page (ME-001) explicitly excludes IMGs, but the individual specialty sub-pages do not restate this. The actual policy is likely inherited from the hub (LCME/AOA only), but this cannot be asserted without per-page confirmation. Marked PUBLIC_WITH_UNKNOWN_FIELDS until a reviewer confirms per-specialty IMG policy.

---

## Phase D — Public Card Preview

**Script:** `build_public_card_preview.py`  
**Output:** `public_listing_cards_preview.json`

20 public cards generated. Forbidden fields confirmed absent:
- No NPI, CCN, EIN, NPPES raw fields, CMS raw fields in any card
- All cards include official_source_url

Each card carries:
- `eligibility_tags` — IMG_ELIGIBLE / IMG_EXCLUDED / MEDICAL_STUDENTS / RESIDENTS_FELLOWS / VSLO_PLATFORM
- `restriction_tags` — VSLO_REQUIRED / AFFILIATION_REQUIRED / OBSERVERSHIP_ONLY / LCME_AOA_ONLY
- `unknown_fields` — list of fields that need reviewer confirmation
- `fit_warnings` — flags that affect applicant eligibility

---

## Phase E — Completeness Workbench

**File:** `usce_completeness_workbench.html`

Load `usce_listing_completeness.csv` to review. Reviewer decisions:
- `APPROVE_PUBLIC` — listing is ready for public display
- `APPROVE_WITH_UNKNOWN_FIELDS` — acceptable with caveats
- `NEEDS_SOURCE_REVIEW` — source quality insufficient
- `DO_NOT_SHOW` — exclude from product
- `FUTURE_LANE_ONLY` — residency/fellowship, not current USCE scope

Exports: `completeness_review_decisions.csv`, `.json`, `audit_log.jsonl`

---

## Phase F — Validator

**Script:** `scripts/validate-usce-public-cards.ts`  
**Report:** `validation_report_usce.json`

### Final run result

```
[1/4] Source-rights validator    → PASSED
[2/4] CMS bridge validator       → PASSED
[3/4] USCE card rules            → PASSED (20 listings, 20 cards)
[4/4] tsc --noEmit               → PASSED

Overall (hard rules):            PASSED
```

### Rules enforced

| Rule | Description |
|---|---|
| FORBIDDEN_FIELD_IN_PUBLIC_CARD | NPI/CCN/EIN must not appear in public cards |
| PUBLIC_CARD_MISSING_OFFICIAL_SOURCE | Every public card needs official_source_url |
| READY_PUBLIC_IMG_UNKNOWN | READY_PUBLIC requires explicit IMG eligibility |
| READY_PUBLIC_GENERIC_HOMEPAGE | READY_PUBLIC requires program/department page |
| DO_NOT_SHOW_IN_PUBLIC_PREVIEW | DO_NOT_SHOW must not appear in preview JSON |

---

## Safety Contract

- **READY_PUBLIC does not mean published.** It means the listing is complete enough that a reviewer can approve it. Human review via the workbench is the publish gate.
- **PUBLIC_WITH_UNKNOWN_FIELDS listings are visible** in the workbench but cannot be marked READY_PUBLIC until the unknown fields are confirmed.
- **USCE listing ≠ identity anchor.** This pipeline scores listing completeness. The P98-6 identity table is a separate concern and is used here only to surface identity coverage per listing.
- **No NPI, CCN, or CMS data surfaces in public output.** Confirmed clean by validator.

---

## What P99-0 Did Not Do

- **Source verification**: We trust the P97 source URLs as recorded. Whether those pages still exist and match what was captured is a separate freshness check (P99-1 or a cron job).
- **National listings**: Maine only. National scoring requires running the same pipeline against Queue 1 / Queue 2 data.
- **UI rendering**: The public card preview JSON is the data layer. The actual user-facing UI is P99-1.
- **Save/compare flow**: P99-2.
- **Correction/report-issue flow**: P99-3.

---

## File Inventory

| File | Description |
|---|---|
| `build_usce_inventory.py` | Phase A inventory script |
| `P99_0_INPUT_INVENTORY.md` | Phase A report |
| `build_listing_candidates.py` | Phase B listing schema builder |
| `usce_listing_candidates.csv` | Phase B output: 20 listing rows |
| `score_listing_completeness.py` | Phase C completeness scorer |
| `usce_listing_completeness.csv` | Phase C output: scored listings |
| `build_public_card_preview.py` | Phase D public card builder |
| `public_listing_cards_preview.json` | Phase D output: 20 public cards |
| `usce_completeness_workbench.html` | Phase E review workbench |
| `scripts/validate-usce-public-cards.ts` | Phase F TypeScript validator |
| `validation_report_usce.json` | Phase F validation report |
| `P99_0_FINAL_REPORT.md` | This file |
