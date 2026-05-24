# P101-2 Checkpoint After 10 Institutions

**Date:** 2026-05-11
**Sprint:** P101-2 (25-institution block)
**Progress:** 10 of 25

---

## Institutions 1–10

| # | Institution | State | Classification | Tier | Notes |
|---|---|---|---|---|---|
| 1 | UPMC Presbyterian | PA | `INTERNATIONAL_STUDENT_CONFIRMED` | B | $4,500/elective · Global Health Dean review · PA first packet |
| 2 | Boston Medical Center | MA | `INTERNATIONAL_STUDENT_CONFIRMED` | B | $3,000/4wk · Caribbean + MD-grad EXCLUDED verbatim · MA first packet |
| 3 | Bellevue Hospital - NYC H+H | NY | `VSLO_US_MD_DO_ONLY` | B | **No observer category** verbatim · non-LCME EXCLUDED · NY first packet |
| 4 | LAC+USC Medical Center | CA | `VSLO_US_MD_DO_ONLY` | B | Via Keck SOM · First P101 `IMG_GRAD_OBSERVERSHIP_CONFIRMED` sub-finding (USC Keck Medicine) |
| 5 | Cook County Health (Stroger) | IL | `POSSIBLE_USCE_NEEDS_REVIEW` | C | **No observership/shadowing** verbatim · Affiliated-coordinator-only |
| 6 | Parkland Health / UTSW | TX | `INTERNATIONAL_STUDENT_CONFIRMED` | B | $150 · B-1 · Intl RESTRICTED to Path+Peds · TX first packet |
| 7 | Harborview Medical Center | WA | `VSLO_US_MD_DO_ONLY` | B | UW IM/Derm at Harborview · WA first packet |
| 8 | ZSFG | CA | `VSLO_US_MD_DO_ONLY` | B | Via UCSF · NOT independent IMG-friendly safety-net |
| 9 | Brigham and Women's Hospital | MA | `INTERNATIONAL_STUDENT_CONFIRMED` | B | Via HMS · $115/experience · Oct-Mar intl window |
| 10 | Massachusetts General Hospital | MA | `INTERNATIONAL_STUDENT_CONFIRMED` | B | Via HMS · same as BWH · Surgery RES IMG correctly rejected |

## Classification counts (1-10)

| Classification | Count |
|---|---|
| `INTERNATIONAL_STUDENT_CONFIRMED` | 5 (UPMC, BMC, Parkland, BWH, MGH) |
| `VSLO_US_MD_DO_ONLY` | 4 (Bellevue, LAC+USC, Harborview, ZSFG) |
| `POSSIBLE_USCE_NEEDS_REVIEW` | 1 (Cook County) |
| `IMG_GRAD_OBSERVERSHIP_CONFIRMED` (sub-finding) | 1 (USC Keck Medicine broader lane via LAC+USC packet) |
| All other | 0 |

States newly touched in P101-2 first half: **PA, MA, NY, TX, WA, IL** (+6 states; cumulative 8 → 14).

## Quality checks

| Check | Result |
|---|---|
| One packet per institution | ✅ YES |
| One website / institution at a time | ✅ YES |
| No bunch extraction | ✅ YES |
| Verbatim quote or no claim | ✅ YES — Cook County classified C (no full verbatim audience capture); MGH Surgery RES correctly rejected as residency |
| Negative evidence recorded | ✅ YES |
| No noindex / backend / schema drift | ✅ YES |
| Existing 304 DB not modified | ✅ YES |
| One-website-at-a-time discipline | ✅ YES |

## Drift check

**NO DRIFT.** Lane held to discovery-only. Key discipline saves:
- Bellevue: classified `VSLO_US_MD_DO_ONLY` (not IMG-friendly) despite the "NYC safety-net" priors; verbatim "no observer category" captured.
- Cook County: classified `POSSIBLE_USCE_NEEDS_REVIEW` (not overclaimed) because PDF policy is 2018 and unverified for 2026.
- ZSFG: classified gated-by-UCSF (not independent IMG-friendly) despite the SF safety-net label.
- MGH: Surgery Residency IMG language correctly classified `RESIDENCY_ONLY` as a sub-finding rather than misread as IMG observership.

## Continue to 20?

**YES.** Quality discipline is holding. The next 10 institutions (11-20) cover:
11. Tufts Medical Center (MA)
12. Beth Israel Deaconess (MA)
13. University of Chicago Medicine (IL)
14. Rush University Medical Center (IL)
15. UPMC Children's of Pittsburgh (PA)
16. Geisinger Medical Center (PA)
17. Penn State Hershey (PA)
18. Henry Ford Hospital (MI)
19. Detroit Medical Center / Wayne State (MI)
20. Beaumont Hospital - Royal Oak (MI)

Expected: MA cluster completion · IL deepening · PA depth · MI cluster (Michigan Medicine remains bot-blocked from P101-1).

## Updated percentages

- Discovery Engine Completion: **~25%** (up from 22% pre-P101-2 start; +3 pts)
- Public V1 Readiness: **~43%** (unchanged)

## Plain English

10 down, 15 to go. Five new international-confirmed lanes (UPMC, BMC, Parkland, BWH, MGH) — that's a 67% increase in IMG-relevant P101 inventory in a single half-sprint. Four US-only-via-system-affiliate confirmations (Bellevue, LAC+USC, Harborview, ZSFG) where we correctly avoided overclaiming the "safety-net" label as IMG-friendly. One PDF/PDF-stale gray zone (Cook County) classified honestly as needs-review. No drift. The Boston cluster is partially captured (BMC + BWH + MGH = 3 of 5 planned for MA); Tufts + BIDMC come next.

Continuing to institutions 11-20.
