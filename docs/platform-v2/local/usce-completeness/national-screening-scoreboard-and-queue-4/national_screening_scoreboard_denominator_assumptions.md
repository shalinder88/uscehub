# Denominator Assumptions

**Date:** 2026-05-09
**Sprint:** P97-NATIONAL-SCREENING-SCOREBOARD-AND-QUEUE-4

---

## 1. We do not have a perfect denominator for "all USCE opportunities"

USCEHub's product universe is "verified U.S. clinical experience opportunities for IMG / Caribbean / international medical students and graduates." That universe does NOT cleanly equal "all U.S. hospitals." The honest denominator is fuzzy along multiple axes:

- An institution may host clinical experiences but not document them publicly.
- A hospital system may document elective access at the system level only (e.g. CCF), making site-level coverage non-1:1.
- VSLO-only programs are a different universe than email-application programs.
- Caribbean-school-named-partnership programs have a closed denominator that USCEHub cannot fully enumerate without each Caribbean school's affiliate list.

So percentages here are **approximations**. We mark UNKNOWN whenever the source-of-truth cannot be cleanly counted from local data.

## 2. Candidate denominator categories

| # | Category | Denominator known? | Source needed | Building plan |
|---|----------|---------------------|----------------|----------------|
| 1 | U.S. hospitals / health systems | ROUGHLY (~6,200 AHA-registered hospitals) | American Hospital Association annual survey OR CMS hospital list (already partially in `docs/platform-v2/local/cms/cms_hospital_general_information.csv`) | Already accessible locally as a rough lead universe |
| 2 | Teaching hospitals / academic medical centers | ROUGHLY (~400-1,000 AMCs depending on definition) | AAMC member-institution list; LCME-accredited school affiliates | Need official AAMC list snapshot; not in repo |
| 3 | Medical schools and UME offices | KNOWN (LCME ≈ 158 MD-granting + COCA ≈ 38 DO schools = ~196) | LCME accreditation roster; COCA roster | Public lists; not yet in repo |
| 4 | VSLO-participating hosts | UNKNOWN denominator | AAMC publishes hosts to enrolled students only; public list is partial | Lead-source quality; cannot be canonical |
| 5 | Known IMG / Caribbean clinical networks | UNKNOWN (each Caribbean school has its own affiliate list) | Per-school: SGU / Ross / AUC / Saba / MUA / All Saints / Avalon / etc. | Manual per-school harvest; not yet started |
| 6 | Residency institutions with public UME / elective language | ROUGHLY (~750 ACGME-sponsoring institutions) | ACGME public sponsoring-institution list | Lead-source only; ACGME ≠ USCE |
| 7 | Observership / elective program pages | UNKNOWN | One-off institution discovery via Q3-style screening | Already partially captured in 348-row source-capture queue |

## 3. Working numbers (clearly tagged)

For scoreboard purposes the following placeholder denominators are used. None are authoritative; all are approximate:

| Denominator name | Rough value | Source | Use |
|------------------|-------------|--------|-----|
| US hospitals (AHA-registered) | ~6,200 | AHA 2024 annual survey, public summary | Floor for "all hospitals" — but most hospitals are NOT USCE-relevant |
| LCME + COCA medical schools | ~196 | LCME + COCA public rosters | Plausible USCE-host upper bound (each school's home institution + affiliates) |
| AAMC member institutions | ~400 | Approximate | Better proxy for AMCs |
| ACGME sponsoring institutions | ~750 | Approximate | Lead source only; ACGME residency ≠ USCE elective for visiting MS |
| Caribbean-school-affiliate clinical sites | UNKNOWN | Per-school | Critical for IMG/Caribbean lane; not yet enumerated |

## 4. Why % numbers in this scoreboard are approximate

Given the denominator uncertainty above, statements like "we have X% national coverage" are not honest without choosing a denominator. This scoreboard avoids those statements by reporting:

- **Absolute counts** (373 screened, 347 score-5, 25 ready, 5 active, 0 public).
- **State-by-state coverage** (zero-coverage and thin-coverage states explicitly named).
- **Funnel stage transitions** (where the project narrows sharply).
- **Pipeline bottleneck identification** (the 347 → 25 → 12 → 7 → 5 → 0 funnel is the truth).

Anywhere a percentage IS used, it is qualified as "approximate" or "of-stage-N" — never "of national coverage."

## 5. What we should NOT claim

- We do not claim "national completeness" anywhere.
- We do not claim "complete national directory."
- We do not claim "all USCE programs."
- We do not claim "verified by hospital" without per-row evidence.
- We do not claim a specific national-percentage figure without naming the denominator.

These prohibitions match the existing banned-phrase list enforced by `validate-p99-staged-runtime-batch-2.ts` and the bridge-input validator.

## 6. Future denominator-improvement work (NOT this sprint)

| Future sprint | What it would do |
|---------------|------------------|
| `P97-DENOMINATOR-AHA-SNAPSHOT-1` | Lock the AHA-registered hospital count + shape into a local CSV for "all hospitals" denominator |
| `P97-DENOMINATOR-AAMC-MEMBER-1` | Snapshot AAMC member institutions + URL pattern hosting |
| `P97-DENOMINATOR-LCME-COCA-1` | Snapshot LCME + COCA + AAMC's published school list with current URLs |
| `P97-CARIBBEAN-AFFILIATE-DENOMINATOR-1` | Per-school manual harvest of affiliate lists; one Caribbean school per sprint |
| `P97-NATIONAL-COVERAGE-PERCENT-VS-AMC-DENOMINATOR-1` | First sprint that may legitimately report a "% of AMCs" figure once #3 above is done |

None are authorized today. These are future TODOs.
