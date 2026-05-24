# P98-6 CMS Bridge Report

**Date:** 2026-05-03  
**Branch:** dossier-integration  
**Scope:** Maine — all P97 institutions (20 matchable + 1 duplicate)

---

## Executive Summary

P98-6 extended the institution identity pipeline with a CMS Hospital General Information bridge. Of the 12 institutions that NPPES could not resolve in P98-5, 10 received definitive CMS CCN anchors. The 2 remaining no-match records are medical school programs (no hospital CCN expected). Combined with the 8 NPPES-passable institutions from P98-5, **18 of 20 Maine institutions now have a confirmed identity anchor** (NPI or CCN or both).

Zero public safety violations. Validator exits 0 on hard rules.

---

## Phase A — Data Rights Ledger

**Status:** Pre-existing ledger reviewed; CMS entry confirmed.

CMS Care Compare (Hospital General Information) is a publicly released federal dataset. Open government data license. Commercial use permitted with attribution. Raw CCN must not appear in public-facing output — CCN is internal identity plumbing only.

**Manifest:** `cms/cms_hospital_ingest_manifest.json`  
SHA-256: `e3c290c3953d8cf7609a3e51740c9a1a3836f97268ee5b1143ec4e85787854a3`

---

## Phase B — CMS Ingest

**Script:** `cms/cms_bridge_matcher.py` (ingest + match combined)  
**Source:** `cms/cms_hospital_general_information.csv` — 5,426 hospitals, Jan 2026 vintage  
**Maine subset:** 36 hospitals

Key field provenance documented in `cms/CMS_HOSPITAL_INGEST_AUDIT.md`.

---

## Phase C — CMS Bridge Matcher

**Script:** `cms/cms_bridge_matcher.py`  
**Input:** 12 NPPES-blocked institutions from `nppes/match_results_v2.csv`  
**Outputs:** `maine_cms_bridge_candidates.csv`, `maine_cms_bridge_review_queue.csv`

### Bridge Status Results

| Status | Count | Blocked |
|---|---|---|
| VERIFIED_CMS_CCN_ADDRESS_BRIDGE | 10 | No |
| CMS_NO_MATCH | 2 | — (medical schools) |

### CCN Assignments

| Canonical ID | Institution | CCN | Similarity |
|---|---|---|---|
| ME-aroostook-001 | Northern Light A.R. Gould Hospital | 200018 | 0.909 |
| ME-hancock-001 | Maine Coast Memorial / MDI Hospital | 200050 | 1.000 |
| ME-knox-001 | Pen Bay Medical Center (MaineHealth) | 200063 | 1.000 |
| ME-lincoln-001 | LincolnHealth (MaineHealth) | 201302 | 0.857 |
| ME-oxford-001 | Stephens Memorial Hospital (MaineHealth) | 201315 | 0.857 |
| ME-penobscot-001 | Northern Light Acadia Hospital (Psychiatry) | 204006 | 0.889 |
| ME-penobscot-002 | Northern Light EMMC | 200033 | 1.000 |
| ME-piscataquis-001 | Mayo Regional Hospital | 201309 | 1.000 |
| ME-somerset-001 | Redington-Fairview General Hospital | 201314 | 0.941 |
| ME-york-003 | York Hospital | 200020 | 1.000 |

### No-match (expected)

| Canonical ID | Institution | Reason |
|---|---|---|
| ME-cumberland-002 | Maine Track Program (Tufts/MMC) | Medical school program; no hospital NPI/CCN |
| ME-york-002 | UNECOM | Medical school; no hospital NPI/CCN |

### Normalization notes

Several matches required extended STRIP_WORDS to converge core names across rebrands:
- "Northern light" prefix stripped → EMMC, A.R. Gould, Acadia all normalize to their legacy names
- "regional", "memorial", "general" stripped standalone → Mayo Regional / Northern Light Mayo Hospital converge

---

## Phase D — Identity Merge

**Script:** `identity/build_identity_merge.py`  
**Outputs:** `identity/institution_identity_review_queue_maine.csv`, `identity/institution_identity_candidates_maine.csv`, `identity/P98_6_IDENTITY_MERGE_REPORT.md`

Combines NPPES match status (P98-5) + CMS bridge status (P98-6 Phase C) into a single institution identity table.

### Combined Identity Status

| Status | Count |
|---|---|
| RESOLVED_BY_CMS_BRIDGE | 10 |
| NPPES_ONLY_CAMPUS_MATCH | 8 |
| MEDICAL_SCHOOL_NO_HOSPITAL | 2 |
| EXCLUDED_DUPLICATE | 1 |

### Public Eligibility

| Eligibility | Count | Notes |
|---|---|---|
| PUBLIC_SAFE_AFTER_REVIEW | 18 | Identity confirmed; reviewer must sign off in workbench |
| INTERNAL_ONLY | 2 | Medical schools — entity exists but no hospital identity |
| REJECTED | 1 | MMC Biddeford — DUPLICATE of MMC Cumberland |
| REVIEW_REQUIRED | 0 | All institutions resolved |

**Key result:** Zero UNRESOLVED institutions. The CMS bridge fully resolved the residual NPPES failures (excluding medical schools, which are expected CMS no-matches).

---

## Phase E — Validator

**Script:** `cms/validate_cms_bridge.py`  
**Report:** `cms/validation_report_cms_bridge.json`

### Run result

```
[1/3] NPPES public safety validator → FAILED (expected — 12 pre-review blocked records)
[2/3] CMS bridge rules             → PASSED (12 CMS records)
[3/3] Identity merge rules         → PASSED (21 institutions)

Overall (hard rules only):         PASSED
```

### Rules enforced

**CMS bridge rules:**
- `CMS_NAME_ONLY_REJECTED` cannot serve as identity proof
- `CMS_PARENT_ONLY` cannot be used as campus proof
- `AMBIGUOUS_MULTI_CCN` is blocked
- Raw CCN must not appear in public-facing exports

**Identity merge rules:**
- `UNRESOLVED` cannot be published
- `EXCLUDED_DUPLICATE` cannot be published
- `PUBLIC_SAFE_AFTER_REVIEW` must have at least one identity anchor (NPI or CCN)
- `INTERNAL_ONLY` institutions cannot contribute to public listings

The NPPES validator failure is the expected pre-review state (12 blocked records await human review in `review_workbench_v2.html`). It does not block Phase E — the hard-rule sections pass clean.

---

## Identity Safety Contract

- **NPI and CCN are internal joins only.** Neither field surfaces in any public-facing product output.
- **CMS bridge establishes hospital identity only.** It does not assert that a USCE rotation opportunity exists at an institution. USCE availability is governed by P97 opportunity data.
- **`PUBLIC_SAFE_AFTER_REVIEW` requires workbench sign-off.** An institution reaching this status is approved for internal identity joins; a reviewer must confirm before any public listing references the institution.
- **Medical school programs (INTERNAL_ONLY)** have no hospital NPI or CCN and must not be listed as hospital USCE sites.

---

## What P98-6 Did Not Do

- **NPPES review**: The 12 blocked NPPES records still require human review in `review_workbench_v2.html`. P98-6 provided CMS CCN anchors for them, but the NPPES workbench decisions (confirm/reject/correct) have not been recorded.
- **National expansion**: Still zero non-Maine institutions. Queue 1 / Queue 2 have not been run.
- **`build_evidence_graph.py` update**: Still reads `match_results.csv` (v1). Should be updated to read `match_results_v2.csv` as a separate pass.
- **USCE Listing Completeness Scorer**: Separate work item; not part of P98-6.

---

## File Inventory

| File | Description |
|---|---|
| `cms/cms_hospital_general_information.csv` | Source: CMS Care Compare Jan 2026 |
| `cms/cms_hospital_ingest_manifest.json` | SHA-256 + rights declaration |
| `cms/CMS_HOSPITAL_INGEST_AUDIT.md` | Field provenance + rights doc |
| `cms/cms_bridge_matcher.py` | Phase C bridge matcher |
| `cms/maine_cms_bridge_candidates.csv` | All scored CMS candidates |
| `cms/maine_cms_bridge_review_queue.csv` | One row per institution, final CMS status |
| `cms/validate_cms_bridge.py` | Phase E validator |
| `cms/validation_report_cms_bridge.json` | Phase E validation report |
| `identity/build_identity_merge.py` | Phase D identity merge |
| `identity/institution_identity_review_queue_maine.csv` | Combined identity table (one row/institution) |
| `identity/institution_identity_candidates_maine.csv` | All identity signals (NPPES + CMS rows) |
| `identity/P98_6_IDENTITY_MERGE_REPORT.md` | Phase D summary |
| `P98_6_CMS_BRIDGE_REPORT.md` | This file |
