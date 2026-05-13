# Run Report — AdventHealth Orlando

**Run ID:** `p102-1-trial-2-run-3`
**Institution ID:** `inst_adventhealth_orlando_fl`
**Location:** Orlando, FL
**Parent system:** AdventHealth
**Official domains:** adventhealth.com
**Queue:** `p102_trial_2`
**Run window:** 2026-05-12T03:34:09.856Z → 2026-05-12T03:34:09.856Z

## A0 deterministic probe

- robots.txt: fetched (200) · advertised sitemaps: 1
- sitemap.xml: fetched (200) · URLs found: 15 · candidates kept: 0
- Fixed-path probes: 39 attempted, **8 accepted** (HTTP 200 with HTML body)
- JSON-LD records: 1

## A1 source map — 8 accepted sources

| Source family | Scope | URL |
|---|---|---|
| RESEARCH_PAGE | UNKNOWN_SCOPE | https://adventhealth.com/research |
| VOLUNTEER_PAGE | UNKNOWN_SCOPE | https://adventhealth.com/volunteer |
| GME_PAGE | DEPARTMENT_LEVEL | https://adventhealth.com/gme |
| CAREERS_PAGE | CAREERS_PORTAL | https://adventhealth.com/careers |
| CAREERS_PAGE | CAREERS_PORTAL | https://adventhealth.com/physician-careers |
| OTHER | UNKNOWN_SCOPE | https://adventhealth.com/benefits |
| OTHER | UNKNOWN_SCOPE | https://adventhealth.com/medical-education |
| OTHER | UNKNOWN_SCOPE | https://adventhealth.com/education |

## A1.5 source completeness

- searchCompletenessScore: **21%**
- robotsChecked: true · sitemapChecked: true · jsonLdChecked: true
- source families seen: RESEARCH_PAGE, VOLUNTEER_PAGE, GME_PAGE, CAREERS_PAGE, OTHER
- missing USCE source families: OBSERVERSHIP_PAGE, VISITING_STUDENT_PAGE
- canProceedToA2: true

## Claims (P102-0C deterministic extractor)

- Total claims: **15**, all quote-verified: true
  - FUTURE_LANE_ONLY: 15

| Visibility | Lane | Source | Quote (first 100 chars) |
|---|---|---|---|
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | GME_PAGE | Graduate Medical Education \| AdventHealth FoundationSkip to main contentSearchSearchDonateMenuCloseA… |
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | GME_PAGE | Through rigorous training, hands-on experience, and mission-driven service, our Graduate Medical Edu… |
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | GME_PAGE | To interact with these items, press Control-Option-Shift-Right Arrow.Graduate Medical Education Stra… |
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | CAREERS_PAGE | As a nurse at AdventHealth, you’ll be empowered to deliver exceptional care while growing in a suppo… |
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | CAREERS_PAGE | As a nurse at AdventHealth, you’ll be empowered to deliver exceptional care while growing in a suppo… |
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | CAREERS_PAGE | Through their journeys, you’ll see what it means to be part of a community that values compassion, g… |
| FUTURE_LANE_ONLY | CAREERS_PAGE | CAREERS_PAGE | Physician Careers \| AdventHealth GordonSkip to main contentLocation information for AdventHealth Gor… |
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | OTHER | Effective Academic Year 2026-2027
Post Graduate Year Annual Salary
PGY-1 $69,394
PGY-2 $72,188
PGY-3… |
| FUTURE_LANE_ONLY | CAREERS_PAGE | OTHER | government website at: Veterans Benefits Administration - Education and Training \| Veterans Benefits… |
| FUTURE_LANE_ONLY | CAREERS_PAGE | OTHER | H-1B visas are valid for up to three years, with the option to extend for another three (totaling 6 … |
| FUTURE_LANE_ONLY | CAREERS_PAGE | OTHER | H-1B visa holders can obtain permanent residency (green card) through AdventHealth once an offer of … |
| FUTURE_LANE_ONLY | PHYSICIAN_SERVICES | OTHER | To interact with these items, press Control-Option-Shift-Right ArrowProtecting What MattersLife insu… |
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | OTHER | AdventHealth Digestive Health Institute is a site for the University of South Florida College of Med… |
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | OTHER | For information, visit the Accreditation Council for Graduate Medical Education (ACGME) website. |
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | OTHER | To learn more about either of these fellowships, visit our Graduate Medical Education website . |

## JSON-LD claims (P102-0K)

- Total JSON-LD claims: 0

## Negative evidence

- Total negative claims: 0 (publicSafeNegative: 0)
_(no explicit negative quotes found; absence-only outcomes are NO_PUBLIC_OPPORTUNITY_FOUND, not PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY)_

## Scope conflicts

- Total: 0

## A2.5 semantic-miss flags

- **clean** student_rotation_present: student + rotation keywords detected; visiting-student object extraction deferred to P102-1.
- **clean** elective_m4_present: elective + M4 keywords detected; elective object extraction deferred to P102-1.
- **clean** observer_shadow_present: observer/shadow keywords detected; observership object extraction deferred.
- **TRIGGERED** volunteer_page_classification_pending: Volunteer page captured; positive/negative USCE classification deferred.
- **TRIGGERED** visa_signals_present: visa signals detected; visa object extraction deferred.
- **TRIGGERED** faculty_apply_present: faculty + apply keywords detected; future-lane job object extraction deferred.
- **clean** pdf_pending: PDF detected but text extraction pending; add pdf-parse in P102-0B if needed.
- **clean** jsonld_not_reflected_in_source_map: JSON-LD captured in source_map sidecar; reflected in source records.

## A3 hostile gate

- **Verdict:** PASS_WITH_CAVEATS
- publicSafe: false · futureLaneValue: MEDIUM
- networkUsed: false · agentUsed: false
- claims: PUBLIC_SAFE_USCE=0, CAUTION_SAFE=0, FUTURE_LANE_ONLY=15
- hallucinationRisks: 0
- quoteVerificationFailures: 0
- missingCriticalFields: 0
- requiredA4Tasks: 0
- **Recommendation:** Framework verdict; no public-safe claims (correct under P102-0C deterministic extraction; awaits P102-0D model reader).

## A4 focused-recovery tasks

- Total tasks: 0

## A5 continue-if-stuck decision

- overallStatus: **RUN_COMPLETE**
- recommendedAction: NONE_RUN_IS_COMPLETE

## Cleaned-text v2 diagnostic (P102-0F)

- v1 → v2 bytes: 49523 → 29815 (60% of v1)
- reclassifications (URL-family → content-family): 0

## Scores

- searchCompletenessScore: 21
- sourceConfidenceScore: 100
- artifactCompletenessScore: 100
- publicReadinessScore: 0
- futureLaneValueScore: 50
- hallucinationRiskScore: 0

---
_Report generated 2026-05-13T12:28:21.486Z by `scripts/p102-generate-run-report.ts`. Pure data transform; no network, no Agent._
