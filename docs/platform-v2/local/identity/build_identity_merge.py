"""
P98-6 Phase D: Institution identity merge

Combines NPPES match status + CMS bridge status into a single
institution identity table for Maine.

Combined identity status:
  VERIFIED_NPPES_AND_CMS      — NPPES LIKELY_CAMPUS_MATCH + CMS VERIFIED
  RESOLVED_BY_CMS_BRIDGE      — NPPES blocked, CMS bridge provides CCN anchor
  NPPES_ONLY_CAMPUS_MATCH     — NPPES LIKELY_CAMPUS_MATCH, no CMS bridge attempted
  MEDICAL_SCHOOL_NO_HOSPITAL  — medical school; no hospital NPI/CCN expected
  UNRESOLVED                  — neither NPPES nor CMS provide a passable match

Public eligibility:
  PUBLIC_SAFE_AFTER_REVIEW    — identity established; reviewer confirms in workbench
  INTERNAL_ONLY               — entity exists but is a school/non-hospital
  REVIEW_REQUIRED             — ambiguous; needs more investigation
  REJECTED                    — institution is a duplicate or excluded

Output:
  identity/institution_identity_candidates_maine.csv
  identity/institution_identity_review_queue_maine.csv
  identity/P98_6_IDENTITY_MERGE_REPORT.md

Run: python3 build_identity_merge.py
"""

import csv
import json
import os
from pathlib import Path

BASE = Path(__file__).parent
LOCAL = BASE.parent
NPPES_DIR = LOCAL / "nppes"
CMS_DIR = LOCAL / "cms"

NPPES_RESULTS = NPPES_DIR / "match_results_v2.csv"
CMS_QUEUE = CMS_DIR / "maine_cms_bridge_review_queue.csv"
CANONICAL = NPPES_DIR / "canonical_institutions_for_matching.csv"

IDENTITY_CANDIDATES_OUT = BASE / "institution_identity_candidates_maine.csv"
IDENTITY_QUEUE_OUT = BASE / "institution_identity_review_queue_maine.csv"
REPORT_OUT = BASE / "P98_6_IDENTITY_MERGE_REPORT.md"

NPPES_BLOCKED = {
    "REJECTED_NAME_ONLY", "PARENT_ONLY_NOT_CAMPUS_PROVEN",
    "REJECTED_DEACTIVATED_ONLY", "REJECTED_ADDRESS_MISMATCH",
    "AMBIGUOUS_MULTI_NPI", "NO_NPPES_MATCH",
}
CMS_PASSABLE = {"VERIFIED_CMS_CCN_ADDRESS_BRIDGE", "LIKELY_CMS_CAMPUS_MATCH"}
CMS_BLOCKED = {"CMS_NAME_ONLY_REJECTED", "CMS_PARENT_ONLY", "CMS_NO_MATCH", "AMBIGUOUS_MULTI_CCN"}


def load_csv(path: Path) -> list:
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def main():
    nppes_rows = load_csv(NPPES_RESULTS)
    cms_rows = load_csv(CMS_QUEUE)
    canonical_rows = load_csv(CANONICAL)

    # Index by canonical_institution_id
    nppes_by_id = {r.get("canonical_institution_id", r.get("institution_name", "")): r for r in nppes_rows}
    cms_by_id = {r.get("canonical_institution_id", ""): r for r in cms_rows}
    canonical_by_id = {r["canonical_institution_id"]: r for r in canonical_rows}

    all_ids = sorted(set(list(nppes_by_id.keys()) + list(canonical_by_id.keys())))

    queue_rows = []
    candidate_rows = []

    for cid in all_ids:
        nppes = nppes_by_id.get(cid, {})
        cms = cms_by_id.get(cid, {})
        canon = canonical_by_id.get(cid, {})

        institution_name = (
            nppes.get("institution_name")
            or canon.get("institution_name")
            or cid
        )
        state = nppes.get("state") or canon.get("state", "")
        county = nppes.get("county") or canon.get("county", "")
        yield_class = nppes.get("yield_class") or canon.get("yield_class", "")

        nppes_status = nppes.get("status", nppes.get("match_tier", "")) if nppes else ""
        nppes_npi = nppes.get("npi", "") if nppes else ""
        nppes_org = nppes.get("org_name", "") if nppes else ""
        nppes_conf = nppes.get("confidence", "") if nppes else ""

        cms_status = cms.get("cms_status", "") if cms else ""
        cms_ccn = cms.get("cms_facility_id", "") if cms else ""
        cms_facility_name = cms.get("cms_facility_name", "") if cms else ""
        cms_city = cms.get("cms_city", "") if cms else ""
        cms_hospital_type = cms.get("cms_hospital_type", "") if cms else ""
        cms_conf = cms.get("cms_confidence", "") if cms else ""

        # Determine combined identity status
        nppes_passable = nppes_status and nppes_status not in NPPES_BLOCKED
        cms_passable_flag = cms_status in CMS_PASSABLE

        is_medical_school = cms.get("is_medical_school_no_cms_record", "") in ("True", "true", True)

        if yield_class == "DUPLICATE":
            combined_status = "EXCLUDED_DUPLICATE"
            public_eligibility = "REJECTED"
        elif is_medical_school:
            combined_status = "MEDICAL_SCHOOL_NO_HOSPITAL"
            public_eligibility = "INTERNAL_ONLY"
        elif nppes_passable and cms_passable_flag:
            combined_status = "VERIFIED_NPPES_AND_CMS"
            public_eligibility = "PUBLIC_SAFE_AFTER_REVIEW"
        elif nppes_passable and not cms_status:
            combined_status = "NPPES_ONLY_CAMPUS_MATCH"
            public_eligibility = "PUBLIC_SAFE_AFTER_REVIEW"
        elif not nppes_passable and cms_passable_flag:
            combined_status = "RESOLVED_BY_CMS_BRIDGE"
            public_eligibility = "PUBLIC_SAFE_AFTER_REVIEW"
        elif not nppes_passable and not cms_status:
            combined_status = "UNRESOLVED"
            public_eligibility = "REVIEW_REQUIRED"
        else:
            combined_status = "UNRESOLVED"
            public_eligibility = "REVIEW_REQUIRED"

        row = {
            "canonical_institution_id": cid,
            "institution_name": institution_name,
            "state": state,
            "county": county,
            "yield_class": yield_class,
            "combined_identity_status": combined_status,
            "public_eligibility": public_eligibility,
            "nppes_status": nppes_status,
            "nppes_npi": nppes_npi,
            "nppes_org_name": nppes_org,
            "nppes_confidence": nppes_conf,
            "cms_status": cms_status,
            "cms_facility_id": cms_ccn,
            "cms_facility_name": cms_facility_name,
            "cms_city": cms_city,
            "cms_hospital_type": cms_hospital_type,
            "cms_confidence": cms_conf,
            "official_source_url": canon.get("official_source_url", ""),
            "packet_path": canon.get("packet_path", ""),
        }
        queue_rows.append(row)

        # Candidate rows include both NPPES and CMS identity signals
        candidate_rows.append({
            **row,
            "source": "NPPES",
            "identity_id": nppes_npi,
            "identity_name": nppes_org,
            "identity_confidence": nppes_conf,
        })
        if cms_ccn:
            candidate_rows.append({
                **row,
                "source": "CMS",
                "identity_id": cms_ccn,
                "identity_name": cms_facility_name,
                "identity_confidence": cms_conf,
            })

    queue_fields = [
        "canonical_institution_id", "institution_name", "state", "county",
        "yield_class", "combined_identity_status", "public_eligibility",
        "nppes_status", "nppes_npi", "nppes_org_name", "nppes_confidence",
        "cms_status", "cms_facility_id", "cms_facility_name", "cms_city",
        "cms_hospital_type", "cms_confidence",
        "official_source_url", "packet_path",
    ]
    candidate_fields = queue_fields + ["source", "identity_id", "identity_name", "identity_confidence"]

    os.makedirs(BASE, exist_ok=True)

    with open(IDENTITY_QUEUE_OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=queue_fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(queue_rows)

    with open(IDENTITY_CANDIDATES_OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=candidate_fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(candidate_rows)

    print(f"Identity merge: {len(queue_rows)} institutions")
    print()

    # Print summary
    from collections import Counter
    status_counts = Counter(r["combined_identity_status"] for r in queue_rows)
    eligibility_counts = Counter(r["public_eligibility"] for r in queue_rows)

    print("=== Combined Identity Status ===")
    for s, c in sorted(status_counts.items(), key=lambda x: -x[1]):
        print(f"  {s:35s}: {c}")

    print("\n=== Public Eligibility ===")
    for e, c in sorted(eligibility_counts.items(), key=lambda x: -x[1]):
        print(f"  {e:35s}: {c}")

    print()
    print(f"Identity queue : {IDENTITY_QUEUE_OUT}")
    print(f"Candidates     : {IDENTITY_CANDIDATES_OUT}")

    # Write report
    public_safe = sum(1 for r in queue_rows if r["public_eligibility"] == "PUBLIC_SAFE_AFTER_REVIEW")
    internal_only = sum(1 for r in queue_rows if r["public_eligibility"] == "INTERNAL_ONLY")
    review_required = sum(1 for r in queue_rows if r["public_eligibility"] == "REVIEW_REQUIRED")

    report = f"""# P98-6 Identity Merge Report

**Date:** 2026-05-03
**Scope:** Maine (all P97 institutions)

## Summary

| Combined Status | Count |
|---|---|
""" + "\n".join(f"| {s} | {c} |" for s, c in sorted(status_counts.items())) + f"""

| Public Eligibility | Count |
|---|---|
| PUBLIC_SAFE_AFTER_REVIEW | {public_safe} |
| INTERNAL_ONLY | {internal_only} |
| REVIEW_REQUIRED | {review_required} |

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
"""

    with open(REPORT_OUT, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"Report         : {REPORT_OUT}")


if __name__ == "__main__":
    main()
