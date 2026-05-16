# P102 Intelligent Extraction Gate — Run Report

Generated: 2026-05-16  
Branch: `local/p102-intelligent-extraction-gate`  
Input: 4 existing P102 extraction runs (35 runs total in the system; these 4 had full data)

---

## Before vs After

| Metric | Before (P101 approach) | After (P102 gate) |
|---|---:|---:|
| Review queue entries | 925 | 24 |
| Noise reduction | — | **97%** |
| Pharmacy rows in queue | 143+ | 0 |
| GME/residency rows in queue | ~570 | 0 |
| Duplicate URL rows in queue | ~37× per URL | 1 per URL |
| Audience label present | None | All rows |
| Direct-link validated | No | All rows |

---

## Stage C: Page Triage

184 unique source URLs processed (from 925 raw claims across 4 runs).

| Decision | Count |
|---|---:|
| REJECT_GME_ONLY | 110 |
| HOLD_SCOPE_AMBIGUITY | 20 |
| HOLD_NEEDS_MORE_EVIDENCE | 16 |
| REJECT_RESEARCH_ONLY | 13 |
| REJECT_PHARMACY_OR_ALLIED_HEALTH | 8 |
| REJECT_GENERIC_EDUCATION_NO_OPP | 6 |
| INCLUDE_USCE_OPPORTUNITY | 4 |
| REJECT_NO_DIRECT_LINK | 3 |
| REJECT_CAREERS_JOBS_ONLY | 3 |
| REJECT_PATIENT_FACING | 1 |
| **Total** | **184** |

110 of 184 URLs (60%) were GME/residency-only — already classified as non-USCE by the extraction model but previously dumped into the review queue anyway.

---

## Stage D: Audience Classification

40 non-rejected pages classified.

| Audience Class | Count |
|---|---:|
| US_MD_DO_VISITING_STUDENT | 28 |
| INTERNATIONAL_MEDICAL_STUDENT | 5 |
| IMG_GRADUATE_OBSERVER | 4 |
| BOTH_STUDENT_AND_IMG_GRADUATE | 3 |

Student vs Graduate: 33 STUDENT · 4 IMG_GRADUATE · 3 BOTH

---

## Stage E: Direct-Link Validation

180 pages validated (includes pre-rejected pages for ledger completeness).

| Status | Count |
|---|---:|
| INVALID_NOT_USCE_SOURCE | 151 |
| GENERIC_PAGE_HOLD | 23 |
| VALID_DIRECT_USCE_SOURCE | 6 |

---

## Stages F + G: Row Builder + Deduplication

43 opportunity rows built from 40 pages (3 BOTH pages expanded to 2 rows each).  
0 duplicate signatures detected.

| Route | Rows |
|---|---:|
| AUTO_PROMOTE | 2 |
| HOLD_REVIEW | 24 |
| REJECTED | 17 |

### Auto-Promote Rows

| Institution | Audience | Type | URL |
|---|---|---|---|
| Houston Methodist Hospital | US_MD_DO_VISITING_STUDENT | CLINICAL_ELECTIVE | /academic-institute/education/medical/medical-student-rotations |
| Houston Methodist Hospital | IMG_GRADUATE_OBSERVER | OBSERVERSHIP | /academic-institute/education/medical/medical-student-rotations |

---

## Stage H: Review Queue

24 entries — all legitimate USCE uncertainty only.

| Hold Reason | Count |
|---|---:|
| direct-link: generic page, not confirmed opportunity-specific | 18 |
| triage: scope ambiguity (system/school-level, campus unclear) | 15 |
| triage: needs more evidence | 8 |

Audience in hold queue: 19 VMS · 3 IMG · 2 INTL  
No pharmacy, no residency, no careers, no duplicates.

---

## Stage K: Validator

19 checks. 19 passed. 0 failed.

---

## Key observations

1. **The model was already doing the work.** 110 of 184 URLs were GME/residency-only — the extraction model correctly classified them `lane: RESIDENCY_PROGRAM_INFO`. The P101 system ignored that classification and put them in the review queue. The gate now enforces it.

2. **Generic URLs are the main hold cause.** 18 of 24 holds are generic education landing pages (e.g. `/education`, `/academics`, `/medical-education`). These pages mention USCE but are not specifically about a USCE program. Fixing this requires better crawl targets — exact seed links — not a better review workflow.

3. **Scope ambiguity is the second hold cause.** Health-system and medical-school level pages (e.g. Mayo Clinic's system-wide `/education` page) cannot be attributed to a specific campus without human confirmation. These are legitimate holds.

4. **2 auto-promote rows from 4 runs is expected.** The 4 runs processed in this batch were discovery runs, not targeted exact-link runs. Exact-link seeding (see `p102_exact_usce_seed_links.csv`) will produce a much higher auto-promote rate because the extractor is pointed at known opportunity pages rather than institutional home pages.

---

## Output files

```
exports/
  source_page_triage.json            — 184 triage decisions
  usce_audience_classified.json      — 40 audience classifications
  direct_link_validation.json        — 180 direct-link results
  intelligent_public_safe_rows.json  — 2 auto-promote rows
  intelligent_hold_rows.json         — 24 hold rows
  intelligent_rejected_rows.json     — 17 rejected rows
  intelligent_duplicate_clusters.json — 0 clusters
  intelligent_review_queue.json      — 24 review entries (HOLD_* only)
```

---

## Scripts

| Script | Phase | Purpose |
|---|---|---|
| `p102-triage-source-pages.ts` | C | One triage decision per source URL |
| `p102-classify-usce-audience.ts` | D | Audience classification per USCE URL |
| `p102-validate-direct-usce-links.ts` | E | Direct-link gate |
| `p102-build-intelligent-opportunity-rows.ts` | F+G | Row builder + dedup |
| `p102-validate-intelligent-opportunity-rows.ts` | K | Output validator (19 checks) |
