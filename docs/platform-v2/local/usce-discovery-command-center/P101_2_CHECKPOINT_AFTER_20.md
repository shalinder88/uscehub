# P101-2 Checkpoint After 20 Institutions

**Date:** 2026-05-11
**Sprint:** P101-2 · Progress: 20 of 25

---

## Institutions 11–20

| # | Institution | State | Classification | Tier |
|---|---|---|---|---|
| 11 | Tufts Medical Center | MA | `VSLO_US_MD_DO_ONLY` | B |
| 12 | Beth Israel Deaconess | MA | `INTERNATIONAL_STUDENT_CONFIRMED` (via HMS) | B |
| 13 | University of Chicago Medicine | IL | `VSLO_US_MD_DO_ONLY` (conditional intl) | B |
| 14 | Rush University Medical Center | IL | `VSLO_US_MD_DO_ONLY` | B |
| 15 | UPMC Children's of Pittsburgh | PA | `INTERNATIONAL_STUDENT_CONFIRMED` | B |
| 16 | Geisinger Medical Center | PA | `VSLO_US_MD_DO_ONLY` | B |
| 17 | Penn State Hershey | PA | `VSLO_US_MD_DO_ONLY` (US+Canada) | B |
| 18 | Henry Ford Hospital | MI | `VSLO_US_MD_DO_ONLY` (intl = HFH-family-only sub-finding) | B |
| 19 | DMC / Wayne State | MI | `VSLO_US_MD_DO_ONLY` | B |
| 20 | Beaumont Royal Oak | MI | `VSLO_US_MD_DO_ONLY` | B |

## Cumulative P101-2 counts (1-20)

| Classification | Count |
|---|---|
| `INTERNATIONAL_STUDENT_CONFIRMED` | 7 (UPMC Presb, BMC, Parkland, BWH, MGH, BIDMC, UPMC Children's) |
| `VSLO_US_MD_DO_ONLY` | 12 |
| `POSSIBLE_USCE_NEEDS_REVIEW` | 1 (Cook County) |
| Sub-findings: `IMG_GRAD_OBSERVERSHIP_CONFIRMED` | 1 (USC Keck) · `AFFILIATED_ONLY` (HFH intl) | 1 each |

States touched in P101-2: PA(4), MA(5), NY(1), TX(1), WA(1), IL(3), CA(2 new), TN(0 - already done), MI(3), IN(0 yet), GA(0 - already done) = **8 newly-deep states + 3 already-covered**.

Cumulative P101 states: AR, AL, DC, CA, TN, MO, GA, MI, PA, MA, NY, TX, WA, IL = **14 states**.

## Quality checks (1-20)

| Check | Result |
|---|---|
| One packet per institution | ✅ YES |
| One website / institution at a time | ✅ YES |
| No bunch extraction | ✅ YES |
| Verbatim quote or no claim | ✅ YES |
| Negative evidence recorded | ✅ YES |
| PDF failures handled honestly | ✅ N/A (no PDF retrieval needed for 11-20) |
| No noindex / backend / schema drift | ✅ YES |
| Existing 304 DB not modified | ✅ YES |
| Runtime not modified | ✅ YES |

## Drift check

**NO DRIFT.** Discipline holds at 20 packets. Notable saves in second half:
- Cook County: classified as `POSSIBLE_USCE_NEEDS_REVIEW` rather than overclaimed despite the "Chicago safety-net" label.
- Bellevue: `VSLO_US_MD_DO_ONLY` with verbatim "no observer category" — protects against IMG-friendly overclaim.
- HFH: international lane restricted to HFH-family-only — captured verbatim as `AFFILIATED_ONLY` sub-finding.
- MGH Surgery RES IMG language: correctly classified as `RESIDENCY_ONLY` (not USCE).
- UChicago intl lane: conditional on "US-affiliated foreign schools" — correctly noted as `POSSIBLE_USCE_NEEDS_REVIEW` sub-finding rather than open international.

## Quality concerns

One concern: **Boston cluster has only 1 of 4 hospitals running an independent visiting-student lane** (BMC). BWH, MGH, BIDMC all route through HMS — meaning they're essentially the same lane wearing three brand names. For dataset shape, future cards must NOT triple-count Boston-via-HMS as three separate USCE lanes; it's one lane (HMS Visiting Students Program) hosted at multiple sites.

Same pattern emerges with UPMC Presbyterian + UPMC Children's (both through Pitt SOM Global Health Dean review for intl). For data shape, the institution-packet-per-hospital approach captures both, but a future cross-institution analysis should normalize these as "one school-level lane covering N hospitals".

## Continue to 25?

**YES.** Discipline holds. The final 5 institutions (21-25):
21. IU Health University Hospital (IN)
22. IU Health Riley Children's (IN)
23. Northwell North Shore (NY)
24. Maimonides Medical Center (NY)
25. SUNY Downstate / University Hospital of Brooklyn (NY)

Expected: IN cluster (sibling expansion), NY depth (Long Island + Brooklyn).

## Updated percentages

- Discovery Engine Completion: **~28%** (up from 25% post-10-checkpoint; +3 pts cumulative this sprint)
- Public V1 Readiness: **~43%** (unchanged)

## Plain English

20 down, 5 to go. Seven international-confirmed lanes (+2 vs P101-1 cumulative of 3). Strong evidence quality on the Boston cluster (4 of 5 HMS-affiliated hospitals captured). PA depth quadrupled (1 → 4 packets). MI depth tripled (1 → 4 if we count Michigan from P101-1 bot-blocked). No drift. Important calibration finding on multi-hospital school-level lanes (HMS covers 4 Boston hospitals; UPMC covers Presbyterian + Children's via Pitt SOM) — future dataset shape decisions should not triple-count these.

Continuing to 21-25.
