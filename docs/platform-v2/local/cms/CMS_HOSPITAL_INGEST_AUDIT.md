# CMS Hospital General Information — Ingest Audit

**P98-6 Phase B**  
**Date:** 2026-05-03  
**File:** `cms_hospital_general_information.csv`

---

## Data Source

| Field | Value |
|---|---|
| Source | CMS Care Compare — Hospital General Information |
| Publisher | U.S. Centers for Medicare & Medicaid Services |
| URL | https://data.cms.gov/provider-data/dataset/xubh-q36u |
| Vintage | January 2026 |
| Download format | CSV |
| Rows | 5,426 hospitals |
| SHA-256 | e3c290c3953d8cf7609a3e51740c9a1a3836f97268ee5b1143ec4e85787854a3 |
| File size | 1,478,095 bytes |

## Public Use Rights

CMS Care Compare data is published under an open government data license and is intended for public use. CMS explicitly permits:
- Download, analysis, and redistribution
- Derived products and research
- Commercial use with attribution

**Restrictions:**
- Raw CCN (Facility ID) must not appear in public-facing product output. CCN is an internal identity anchor only.
- CMS bridge status is identity plumbing — it does not assert that a USCE opportunity exists at an institution.
- This pipeline uses CMS data for institution identity matching only, not for care quality or outcome metrics.

See `cms_hospital_ingest_manifest.json` for SHA-256 chain of custody.

---

## Fields Ingested

| Column (CSV header) | Internal field name | Used in pipeline |
|---|---|---|
| Facility ID | `cms_facility_id` (CCN) | Yes — identity anchor |
| Facility Name | `cms_facility_name` | Yes — name matching |
| Address | `cms_address` | Yes — address confirmation |
| City/Town | `cms_city` | Yes — city confirmation |
| State | `cms_state` | Yes — state filter |
| ZIP Code | `cms_zip` | Yes — stored in queue |
| County/Parish | `cms_county` | Stored, not matched |
| Hospital Type | `cms_hospital_type` | Stored — context only |
| Hospital Ownership | `cms_ownership` | Stored — context only |
| Emergency Services | `cms_emergency_services` | Stored — context only |

**Fields not ingested:**
- Overall Rating, Safety Group, Readmission National Comparison, Mortality National Comparison — outcome metrics, not relevant to identity matching
- Phone Number — not used
- Meets Criteria for Meaningful Use of EHR — not used

---

## Maine Subset

Filtered to `State == "ME"`. 36 Maine hospitals loaded for bridge matching.

| Hospital Type | Count |
|---|---|
| Acute Care Hospitals | 20 |
| Critical Access Hospitals | 14 |
| Psychiatric | 1 |
| Other | 1 |

---

## Bridge Matching Logic

See `cms_bridge_matcher.py` for full algorithm. Summary:

1. **Scope**: Only the 12 NPPES-blocked institutions are run through the CMS bridge. The 8 LIKELY_CAMPUS_MATCH institutions are not re-checked against CMS (they are already passable via NPPES).
2. **Medical school filter**: Institutions matching known medical-school name patterns are skipped. CMS has no hospital CCN for medical school programs.
3. **Name normalization**: Unicode NFD → lowercase → strip punctuation → strip health-system prefixes and generic words (hospital, medical center, etc.).
4. **Similarity threshold**:
   - `sim >= 0.90` or exact normalized match → `VERIFIED_CMS_CCN_ADDRESS_BRIDGE`
   - `sim >= 0.75` → `LIKELY_CMS_CAMPUS_MATCH`
   - `sim < 0.75` → `CMS_NAME_ONLY_REJECTED` (blocked)
5. **Ambiguity check**: If two candidates tie within 0.03 similarity → `AMBIGUOUS_MULTI_CCN` (blocked).

---

## Results Summary

| CMS Status | Count | Blocked |
|---|---|---|
| VERIFIED_CMS_CCN_ADDRESS_BRIDGE | 10 | No |
| CMS_NO_MATCH | 2 | — (medical schools, expected) |

All 10 hospital institutions that were blocked by NPPES received a definitive CMS CCN anchor. The 2 no-match records are medical school programs (Maine Track / UNECOM) for which no hospital CCN is expected.

---

## CCN Assignments

| Institution | CCN | CMS Name |
|---|---|---|
| Northern Light A.R. Gould Hospital | 200018 | A R GOULD MEMORIAL HOSPITAL |
| Maine Coast Memorial / MDI Hospital | 200050 | MAINE COAST MEMORIAL HOSPITAL |
| Northern Light EMMC | 200033 | EASTERN MAINE MEDICAL CENTER |
| York Hospital | 200020 | YORK HOSPITAL |
| Pen Bay Medical Center (MaineHealth) | 200063 | PEN BAY MEDICAL CENTER |
| LincolnHealth (MaineHealth) | 201302 | LINCOLNHEALTH - MILES CAMPUS |
| Stephens Memorial Hospital (MaineHealth) | 201315 | STEPHENS MEMORIAL HOSPITAL |
| Mayo Regional Hospital | 201309 | NORTHERN LIGHT MAYO HOSPITAL |
| Redington-Fairview General Hospital | 201314 | REDINGTON FAIRVIEW GENERAL HOSPITAL |
| Northern Light Acadia Hospital (Psychiatry) | 204006 | ACADIA HOSPITAL |

---

## Hard Gates Enforced

| Gate | Rule |
|---|---|
| CMS_NAME_ONLY_REJECTED | Cannot be used as identity proof |
| CMS_PARENT_ONLY | Cannot serve as campus proof |
| AMBIGUOUS_MULTI_CCN | Cannot resolve without human disambiguation |
| Raw CCN in public export | CCN is internal identity anchor only — never surfaces in product output |
| USCE availability | CMS bridge establishes hospital identity only; it does not assert USCE availability |

---

## Files

| File | Description |
|---|---|
| `cms_hospital_general_information.csv` | Source dataset (Jan 2026) |
| `cms_hospital_ingest_manifest.json` | SHA-256 + rights declaration |
| `cms_bridge_matcher.py` | Bridge matching script |
| `maine_cms_bridge_candidates.csv` | All scored CMS candidates per institution |
| `maine_cms_bridge_review_queue.csv` | One row per institution, final CMS status |
| `CMS_HOSPITAL_INGEST_AUDIT.md` | This file |
