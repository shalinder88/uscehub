"""
P99-0 Phase A: USCE Listing Completeness Inventory

Reads all P97 opportunity and institution records and produces a summary
of what exists, what's missing, and what's ready for scoring.

Inputs:
  - p97_candidate_opportunities.csv
  - p97_not_found_after_search.csv
  - p97_rejected_or_non_target_candidates.csv
  - p97_duplicate_candidates.csv
  - nppes/canonical_institutions_for_matching.csv
  - identity/institution_identity_review_queue_maine.csv

Output:
  usce-completeness/P99_0_INPUT_INVENTORY.md

Run: python3 build_usce_inventory.py
"""

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

BASE = Path(__file__).parent
LOCAL = BASE.parent
CANONICAL = LOCAL / "nppes" / "canonical_institutions_for_matching.csv"
IDENTITY = LOCAL / "identity" / "institution_identity_review_queue_maine.csv"
OPPORTUNITIES = LOCAL / "p97_candidate_opportunities.csv"
NOT_FOUND = LOCAL / "p97_not_found_after_search.csv"
REJECTED = LOCAL / "p97_rejected_or_non_target_candidates.csv"
DUPLICATES = LOCAL / "p97_duplicate_candidates.csv"
REPORT_OUT = BASE / "P99_0_INPUT_INVENTORY.md"


def load_csv(path):
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def main():
    opps = load_csv(OPPORTUNITIES)
    not_found = load_csv(NOT_FOUND)
    rejected = load_csv(REJECTED)
    dups = load_csv(DUPLICATES)
    canonical = load_csv(CANONICAL)
    identity = load_csv(IDENTITY)

    # ── Opportunity stats ──────────────────────────────────────────────
    status_counts = Counter(r["candidateStatus"] for r in opps)
    type_counts = Counter(r["opportunityType"] for r in opps)
    specialty_counts = Counter(r["specialty"] for r in opps)
    source_page_counts = Counter(r["sourcePageType"] for r in opps)

    has_official_source = sum(1 for r in opps if r.get("officialSourceUrl","").strip())
    has_application_url = sum(1 for r in opps if r.get("applicationUrl","").strip())
    has_explicit_eligibility = sum(
        1 for r in opps
        if r.get("eligibility","").strip() and r.get("eligibility","") not in ("","Unknown","unknown")
    )
    has_explicit_img = sum(
        1 for r in opps
        if r.get("imgEligibility","").strip() and r.get("imgEligibility","") not in ("","Unknown","unknown")
    )
    has_duration = sum(1 for r in opps if r.get("duration","").strip())
    has_contact = sum(1 for r in opps if r.get("contactEmail","").strip())

    missing_eligibility = [
        r["candidateId"] for r in opps
        if not r.get("eligibility","").strip() or r.get("eligibility","") in ("Unknown","unknown")
    ]
    missing_app_url = [
        r["candidateId"] for r in opps
        if r.get("candidateStatus") not in ("REJECTED_NON_TARGET",) and not r.get("applicationUrl","").strip()
    ]
    explicit_img_accepted = [
        r["candidateId"] for r in opps
        if "international" in r.get("imgEligibility","").lower() or "img" in r.get("imgEligibility","").lower()
    ]
    explicit_img_excluded = [
        r["candidateId"] for r in opps
        if "exclud" in r.get("imgEligibility","").lower() or "lcme" in r.get("imgEligibility","").lower()
    ]

    # ── Source page quality ────────────────────────────────────────────
    generic_homepage = [
        r["candidateId"] for r in opps
        if r.get("sourcePageType","") in ("GENERIC_HOMEPAGE","GENERIC_HOMEPAGE_ONLY","PATH_HINTS_ONLY")
        or "generic" in r.get("sourcePageType","").lower()
    ]
    exact_program_page = [
        r["candidateId"] for r in opps
        if r.get("sourcePageType","") in ("EXACT_OFFICIAL_PROGRAM_PAGE","OFFICIAL_PROGRAM_PAGE")
    ]

    # ── Future-lane candidates ─────────────────────────────────────────
    future_lane = [
        r["candidateId"] for r in opps
        if r.get("opportunityType","") in ("Residency","Fellowship","residency","fellowship")
        or "residency" in r.get("opportunityTitle","").lower()
        or "fellowship" in r.get("opportunityTitle","").lower()
    ]

    # ── Identity coverage for opportunity institutions ─────────────────
    identity_by_id = {r["canonical_institution_id"]: r for r in identity}
    canonical_by_name = {}
    for c in canonical:
        canonical_by_name[c["institution_name"].lower()] = c

    opp_identity_map = {}
    for r in opps:
        inst = r["institutionName"].lower()
        cid = None
        for c in canonical:
            if c["institution_name"].lower() in inst or inst in c["institution_name"].lower():
                cid = c["canonical_institution_id"]
                break
        opp_identity_map[r["candidateId"]] = identity_by_id.get(cid, {}) if cid else {}

    identity_anchored = sum(
        1 for cid, irow in opp_identity_map.items()
        if irow.get("public_eligibility") in ("PUBLIC_SAFE_AFTER_REVIEW", "INTERNAL_ONLY")
    )

    # ── Print summary ──────────────────────────────────────────────────
    print(f"P99-0 Input Inventory")
    print(f"  Total opportunity candidates : {len(opps)}")
    print(f"  Not-found institutions       : {len(not_found)}")
    print(f"  Rejected / non-target        : {len(rejected)}")
    print(f"  Duplicates                   : {len(dups)}")
    print(f"  Canonical institutions       : {len(canonical)}")
    print()
    print(f"  By status:")
    for s, c in sorted(status_counts.items(), key=lambda x: -x[1]):
        print(f"    {s:35s}: {c}")
    print(f"\n  Has official source URL      : {has_official_source}/{len(opps)}")
    print(f"  Has application URL          : {has_application_url}/{len(opps)}")
    print(f"  Has explicit eligibility     : {has_explicit_eligibility}/{len(opps)}")
    print(f"  Has explicit IMG eligibility : {has_explicit_img}/{len(opps)}")
    print(f"  Has duration                 : {has_duration}/{len(opps)}")
    print(f"  Has contact info             : {has_contact}/{len(opps)}")
    print(f"  IMG explicitly accepted      : {len(explicit_img_accepted)}")
    print(f"  IMG explicitly excluded      : {len(explicit_img_excluded)}")
    print(f"  Exact official program page  : {len(exact_program_page)}")
    print(f"  Generic homepage source      : {len(generic_homepage)}")
    print(f"  Future lane (res/fellow)     : {len(future_lane)}")
    print(f"  Identity-anchored opps       : {identity_anchored}/{len(opps)}")

    # ── Write report ──────────────────────────────────────────────────
    report = f"""# P99-0 Input Inventory

**Date:** 2026-05-03
**Scope:** Maine (P97 pilot state)

---

## Source Counts

| Source | Count |
|---|---|
| Candidate opportunities (p97_candidate_opportunities.csv) | {len(opps)} |
| Institutions: not found after search | {len(not_found)} |
| Institutions: rejected / non-target | {len(rejected)} |
| Institutions: duplicates | {len(dups)} |
| Canonical institutions (canonical_institutions_for_matching.csv) | {len(canonical)} |
| Identity-merged institutions (institution_identity_review_queue_maine.csv) | {len(identity)} |

---

## Opportunity Candidate Status

| Status | Count |
|---|---|
"""
    for s, c in sorted(status_counts.items(), key=lambda x: -x[1]):
        report += f"| {s} | {c} |\n"

    report += f"""
---

## Opportunity Type Breakdown

| Type | Count |
|---|---|
"""
    for t, c in sorted(type_counts.items(), key=lambda x: -x[1]):
        report += f"| {t} | {c} |\n"

    report += f"""
---

## Specialty Breakdown

| Specialty | Count |
|---|---|
"""
    for t, c in sorted(specialty_counts.items(), key=lambda x: -x[1]):
        report += f"| {t} | {c} |\n"

    report += f"""
---

## Field Coverage

| Field | Populated | Total | Notes |
|---|---|---|---|
| official_source_url | {has_official_source} | {len(opps)} | |
| application_url | {has_application_url} | {len(opps)} | |
| eligibility (explicit) | {has_explicit_eligibility} | {len(opps)} | |
| img_eligibility (explicit) | {has_explicit_img} | {len(opps)} | |
| duration | {has_duration} | {len(opps)} | |
| contact_email | {has_contact} | {len(opps)} | |

---

## Source Page Quality

| Category | Count | IDs |
|---|---|---|
| Exact official program page | {len(exact_program_page)} | {", ".join(exact_program_page[:8])} |
| Generic homepage / path-hint only | {len(generic_homepage)} | {", ".join(generic_homepage[:8])} |

---

## IMG Eligibility Signal

| Signal | Count | IDs |
|---|---|---|
| IMG explicitly accepted | {len(explicit_img_accepted)} | {", ".join(explicit_img_accepted)} |
| IMG explicitly excluded (LCME-only) | {len(explicit_img_excluded)} | {", ".join(explicit_img_excluded[:8])} |
| IMG status unknown | {len(opps) - len(explicit_img_accepted) - len(explicit_img_excluded)} | |

---

## Future-Lane / Non-USCE Records

| Category | Count | IDs |
|---|---|---|
| Residency/fellowship only | {len(future_lane)} | {", ".join(future_lane)} |
| Rejected non-target | {status_counts.get('REJECTED_NON_TARGET', 0)} | |

---

## Missing Fields (Hard Gates)

### Missing eligibility language
{chr(10).join(f"- {cid}" for cid in missing_eligibility) or "None"}

### Missing application URL (non-rejected records)
{chr(10).join(f"- {cid}" for cid in missing_app_url) or "None"}

---

## Identity Anchor Coverage

Of {len(opps)} opportunity candidates, **{identity_anchored} have an identity-anchored institution** (PUBLIC_SAFE_AFTER_REVIEW or INTERNAL_ONLY from P98-6 identity merge).

The remaining {len(opps) - identity_anchored} are either:
- Affiliated/routed through another institution (Togus VA → MMC)
- From institutions with NOT_FOUND yield_class that received CMS bridge anchors
- From institutions not yet in the canonical table (EMMC deepened-pass find)

---

## Files Used

| File | Description |
|---|---|
| `p97_candidate_opportunities.csv` | 21 opportunity candidates from P97 Maine discovery |
| `p97_not_found_after_search.csv` | 16 institutions with no opportunity found |
| `p97_rejected_or_non_target_candidates.csv` | 1 rejected + 1 non-target |
| `p97_duplicate_candidates.csv` | 1 duplicate (MMC Biddeford) |
| `nppes/canonical_institutions_for_matching.csv` | 21 canonical institutions |
| `identity/institution_identity_review_queue_maine.csv` | P98-6 identity merge output |
"""

    with open(REPORT_OUT, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"\nReport: {REPORT_OUT}")


if __name__ == "__main__":
    main()
