# P99-0 Input Inventory

**Date:** 2026-05-03
**Scope:** Maine (P97 pilot state)

---

## Source Counts

| Source | Count |
|---|---|
| Candidate opportunities (p97_candidate_opportunities.csv) | 21 |
| Institutions: not found after search | 16 |
| Institutions: rejected / non-target | 1 |
| Institutions: duplicates | 1 |
| Canonical institutions (canonical_institutions_for_matching.csv) | 21 |
| Identity-merged institutions (institution_identity_review_queue_maine.csv) | 21 |

---

## Opportunity Candidate Status

| Status | Count |
|---|---|
| APPROVED_FOR_HUMAN_REVIEW | 16 |
| NEEDS_MANUAL_REVIEW | 4 |
| REJECTED_NON_TARGET | 1 |

---

## Opportunity Type Breakdown

| Type | Count |
|---|---|
| Elective | 16 |
| Clerkship | 2 |
| Sub-internship | 2 |
| Observership | 1 |

---

## Specialty Breakdown

| Specialty | Count |
|---|---|
| multispecialty | 5 |
| family_medicine | 3 |
| emergency_medicine | 2 |
| pediatrics | 2 |
| general_surgery | 1 |
| anesthesiology | 1 |
| interventional_radiology | 1 |
| psychiatry | 1 |
| diagnostic_radiology | 1 |
| obstetrics_gynecology | 1 |
| surgery | 1 |
| internal_medicine | 1 |
| family_medicine_rural | 1 |

---

## Field Coverage

| Field | Populated | Total | Notes |
|---|---|---|---|
| official_source_url | 21 | 21 | |
| application_url | 9 | 21 | |
| eligibility (explicit) | 21 | 21 | |
| img_eligibility (explicit) | 21 | 21 | |
| duration | 18 | 21 | |
| contact_email | 15 | 21 | |

---

## Source Page Quality

| Category | Count | IDs |
|---|---|---|
| Exact official program page | 12 | ME-001, ME-003, ME-004, ME-005, ME-006, ME-007, ME-008, ME-010 |
| Generic homepage / path-hint only | 0 |  |

---

## IMG Eligibility Signal

| Signal | Count | IDs |
|---|---|---|
| IMG explicitly accepted | 11 | ME-001, ME-003, ME-004, ME-008, ME-015, ME-016, ME-017, ME-018, ME-019, ME-020, ME-021 |
| IMG explicitly excluded (LCME-only) | 6 | ME-001, ME-004, ME-005, ME-006, ME-007, ME-008 |
| IMG status unknown | 4 | |

---

## Future-Lane / Non-USCE Records

| Category | Count | IDs |
|---|---|---|
| Residency/fellowship only | 0 |  |
| Rejected non-target | 1 | |

---

## Missing Fields (Hard Gates)

### Missing eligibility language
None

### Missing application URL (non-rejected records)
- ME-002
- ME-004
- ME-005
- ME-006
- ME-007
- ME-008
- ME-009
- ME-010
- ME-011
- ME-013
- ME-014

---

## Identity Anchor Coverage

Of 21 opportunity candidates, **20 have an identity-anchored institution** (PUBLIC_SAFE_AFTER_REVIEW or INTERNAL_ONLY from P98-6 identity merge).

The remaining 1 are either:
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
