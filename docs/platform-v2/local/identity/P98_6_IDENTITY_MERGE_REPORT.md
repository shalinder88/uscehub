# P98-6 Identity Merge Report

**Date:** 2026-05-03
**Scope:** Maine (all P97 institutions)

## Summary

| Combined Status | Count |
|---|---|
| EXCLUDED_DUPLICATE | 1 |
| MEDICAL_SCHOOL_NO_HOSPITAL | 2 |
| NPPES_ONLY_CAMPUS_MATCH | 8 |
| RESOLVED_BY_CMS_BRIDGE | 10 |

| Public Eligibility | Count |
|---|---|
| PUBLIC_SAFE_AFTER_REVIEW | 18 |
| INTERNAL_ONLY | 2 |
| REVIEW_REQUIRED | 0 |

## How to Read This Table

- **VERIFIED_NPPES_AND_CMS**: Both NPPES and CMS confirmed this hospital entity. Highest confidence for identity joins.
- **RESOLVED_BY_CMS_BRIDGE**: NPPES match was ambiguous/rejected, but CMS CCN provides a definitive hospital identity anchor.
- **NPPES_ONLY_CAMPUS_MATCH**: NPPES confirmed, CMS bridge not applied (institution was already passable).
- **MEDICAL_SCHOOL_NO_HOSPITAL**: Medical school or educational program. No hospital NPI/CCN expected or needed.
- **UNRESOLVED**: Neither NPPES nor CMS resolved the institution. Needs manual investigation.

## Public Safety Rules

- PUBLIC_SAFE_AFTER_REVIEW institutions may have their NPI/CCN used in **internal joins only**.
- No raw NPI, CCN, or EIN may appear in public-facing product output.
- USCE opportunity listing is governed by P97 opportunity data, not by this identity table.
- This table is identity plumbing only — it does not assert that a USCE opportunity exists.

## Files

| File | Description |
|---|---|
| `institution_identity_review_queue_maine.csv` | One row per institution, combined status |
| `institution_identity_candidates_maine.csv` | All identity signals (NPPES + CMS rows) |
