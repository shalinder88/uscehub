# P101-2 — Twenty-Five-Institution Discovery Checkpoint (Final)

**Date:** 2026-05-11
**Sprint:** P101-2 · COMPLETE (25 of 25)
**Pre-sprint HEAD:** `d9364e4` · **Production main:** `739ab1e` — UNCHANGED

---

## All 25 institutions searched

| # | Institution | State | Classification | Tier |
|---|---|---|---|---|
| 1 | UPMC Presbyterian | PA | `INTERNATIONAL_STUDENT_CONFIRMED` | B |
| 2 | Boston Medical Center | MA | `INTERNATIONAL_STUDENT_CONFIRMED` | B |
| 3 | Bellevue Hospital - NYC H+H | NY | `VSLO_US_MD_DO_ONLY` | B |
| 4 | LAC+USC Medical Center | CA | `VSLO_US_MD_DO_ONLY` | B |
| 5 | Cook County Health (Stroger) | IL | `POSSIBLE_USCE_NEEDS_REVIEW` | C |
| 6 | Parkland Health / UTSW | TX | `INTERNATIONAL_STUDENT_CONFIRMED` | B |
| 7 | Harborview Medical Center | WA | `VSLO_US_MD_DO_ONLY` | B |
| 8 | ZSFG | CA | `VSLO_US_MD_DO_ONLY` | B |
| 9 | Brigham and Women's Hospital | MA | `INTERNATIONAL_STUDENT_CONFIRMED` | B |
| 10 | Massachusetts General Hospital | MA | `INTERNATIONAL_STUDENT_CONFIRMED` | B |
| 11 | Tufts Medical Center | MA | `VSLO_US_MD_DO_ONLY` | B |
| 12 | Beth Israel Deaconess | MA | `INTERNATIONAL_STUDENT_CONFIRMED` | B |
| 13 | University of Chicago Medicine | IL | `VSLO_US_MD_DO_ONLY` | B |
| 14 | Rush University Medical Center | IL | `VSLO_US_MD_DO_ONLY` | B |
| 15 | UPMC Children's of Pittsburgh | PA | `INTERNATIONAL_STUDENT_CONFIRMED` | B |
| 16 | Geisinger Medical Center | PA | `VSLO_US_MD_DO_ONLY` | B |
| 17 | Penn State Hershey | PA | `VSLO_US_MD_DO_ONLY` | B |
| 18 | Henry Ford Hospital | MI | `VSLO_US_MD_DO_ONLY` | B |
| 19 | DMC / Wayne State | MI | `VSLO_US_MD_DO_ONLY` | B |
| 20 | Beaumont Royal Oak | MI | `VSLO_US_MD_DO_ONLY` | B |
| 21 | IU Health University Hospital | IN | `VSLO_US_MD_DO_ONLY` | B |
| 22 | IU Health Riley Children's | IN | `VSLO_US_MD_DO_ONLY` | B |
| 23 | Northwell North Shore | NY | `VSLO_US_MD_DO_ONLY` | B |
| 24 | Maimonides Medical Center | NY | `VSLO_US_MD_DO_ONLY` | B |
| 25 | SUNY Downstate / UH Brooklyn | NY | `VSLO_US_MD_DO_ONLY` | B |

## Final classification counts (P101-2)

| Classification | Count |
|---|---|
| `INTERNATIONAL_STUDENT_CONFIRMED` | 7 |
| `VSLO_US_MD_DO_ONLY` | 17 |
| `POSSIBLE_USCE_NEEDS_REVIEW` | 1 |

## State coverage (P101-2 new + deepen)

| State | P101-0+1 packets | P101-2 added | Total |
|---|---|---|---|
| AR | 1 | 0 | 1 |
| AL | 1 | 0 | 1 |
| DC | 3 | 0 | 3 |
| CA | 6 | 2 (LAC+USC, ZSFG) | 8 |
| TN | 1 | 0 | 1 |
| MO | 1 | 0 | 1 |
| GA | 1 | 0 | 1 |
| MI | 1 | 3 (HFH, DMC, Beaumont) | 4 |
| PA | 0 | 4 (UPMC Presb + Children's + Geisinger + Hershey) | 4 |
| MA | 0 | 5 (BMC + BWH + MGH + Tufts + BIDMC) | 5 |
| NY | 0 | 4 (Bellevue + NSUH + Maimonides + SUNY Downstate) | 4 |
| TX | 0 | 1 (Parkland) | 1 |
| WA | 0 | 1 (Harborview) | 1 |
| IL | 0 | 3 (Cook County + UChicago + Rush) | 3 |
| IN | 0 | 2 (IU UH + Riley) | 2 |
| **TOTAL** | **15** | **25** | **40** |

## Counts (sprint summary)

- Institutions searched: 25
- Official domains checked: ~35
- Packets created: 25
- Candidate USCE pages found: ~65 candidateFindings
- Pages opened: ~115 (combined across 25 packets)
- Rejected pages: ~35
- `INTERNATIONAL_STUDENT_CONFIRMED`: 7
- `VSLO_US_MD_DO_ONLY`: 17
- `POSSIBLE_USCE_NEEDS_REVIEW`: 1
- `BOT_BLOCKED_MANUAL_RETRY`: 0 (P101-2 had no new bot-blocks)
- `SOURCE_DEAD`: 0
- `NO_PUBLIC_USCE_LANE_FOUND`: 0

## Cumulative P101 (after P101-2)

- Total packets: **40** (5 + 10 + 25)
- States touched: **15** (8 + 7 new)
- `INTERNATIONAL_STUDENT_CONFIRMED`: **10**
- `VSLO_US_MD_DO_ONLY`: **28**
- `POSSIBLE_USCE_NEEDS_REVIEW`: **1**
- `BOT_BLOCKED_MANUAL_RETRY`: **1** (Michigan from P101-1)

## Quality checks

| Check | Result |
|---|---|
| One packet per institution | ✅ YES (25/25) |
| One website / institution at a time | ✅ YES |
| No bunch extraction | ✅ YES |
| Verbatim quote or no claim | ✅ YES |
| Negative evidence recorded | ✅ YES |
| PDF failures handled honestly | ✅ N/A (no PDF retrieval triggered) |
| No noindex / backend / schema drift | ✅ YES |
| Existing 304 DB not modified | ✅ YES |
| Runtime not modified | ✅ YES |
| No bot-bypass | ✅ YES |
| No fake quotes / screenshots | ✅ YES |

## Drift check

**NO DRIFT.** Discipline held across 25 institutions. Notable saves:
- **Bellevue, ZSFG, LAC+USC, Maimonides, SUNY Downstate**: 5 institutions correctly classified as US-only-via-system-affiliate or VSLO despite being labeled "safety-net" — no IMG-friendly label was applied where the verbatim source did not support it.
- **Cook County**: classified `POSSIBLE_USCE_NEEDS_REVIEW` rather than overclaimed because verbatim audience was only in a 2018 PDF.
- **MGH Surgery RES IMG-language**: correctly classified as `RESIDENCY_ONLY` sub-finding rather than misread as IMG observership.
- **HFH international**: captured verbatim as HFH-employee-or-family-only — restricted `AFFILIATED_ONLY` sub-finding.
- **Vanderbilt international partners list**: captured verbatim "currently full" caveat.
- **UChicago international lane**: captured as conditional (US-affiliated foreign schools only) — `POSSIBLE_USCE_NEEDS_REVIEW` sub-finding.

## Can this workflow scale?

| Option | Verdict |
|---|---|
| A. Another 25 (50-institution block) | ✅ YES — workflow is repeatable; per-packet cost is stable ~2-3 tool calls + 1 Write |
| B. Full-state discovery block (~30-50 institutions in one state) | ✅ YES — CA already has 8 packets; finishing CA would mean ~10 more institutions |
| C. Schema/universe-table planning | NOT YET — see below |
| D. Existing 304 DB triage | ✅ YES — natural next move; the 304 production rows should be validated against the trust shape we've established in 40 packets |

**Recommendation order**:
1. **D (DB triage) is the highest-leverage next move.** We now have 40 packets with verbatim source evidence. The 304 production listings have unknown link-verification status. Cross-referencing the 40 P101 packets against the 304 DB rows would surface duplicates (Vanderbilt, UCSF appear in both), drift (DB Vanderbilt $500-1,500 cost vs P101 $180 verbatim), and stale rows. This is where the discovery work starts feeding production quality.
2. **B (full-state CA completion) is a reasonable parallel move** if D is too coupled to the public product.
3. **A (another 25)** is fine but produces diminishing marginal coverage now; ranks 70+ trail into smaller community hospitals.
4. **C (schema/universe-table planning)** is NOT YET justified. The packet workflow is stable, but Prisma `Institution` modeling should wait until D surfaces what columns actually matter for production. Schema-first risks designing for hypothetical needs.

## Updated percentages

- Discovery Engine Completion: **~30%** (up from 22% pre-P101-2; +8 pts cumulative this sprint)
- Public V1 Readiness: **~43%** (unchanged — no public-product touch this sprint)

## Plain English

25 hospitals down. 40 P101 packets cumulative. 10 international-confirmed lanes captured. 15 states. The Boston cluster (HMS routes 4 hospitals) and the UPMC cluster (Pitt SOM routes 2) are real institutional patterns that the dataset has captured uniformly. At 5 safety-net institutions (Bellevue, ZSFG, Maimonides, SUNY Downstate, partially LAC+USC) no IMG-friendly label was applied — verbatim source quotes governed instead. No drift. No fake quotes. No bypass. Production main untouched.

The clear next move is **existing 304 DB triage** — cross-referencing the 40 P101 packets against the production DB to surface duplicates, drift, and stale source links. This is where discovery starts producing public-product quality.

## Sprint status

**PASS.** Recommended next sprint: `P101-3 — Existing 304 DB Listing Source-Triage`.
