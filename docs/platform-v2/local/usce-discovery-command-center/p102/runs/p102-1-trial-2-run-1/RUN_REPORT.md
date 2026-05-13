# Run Report — Houston Methodist Hospital

**Run ID:** `p102-1-trial-2-run-1`
**Institution ID:** `inst_houston_methodist_hospital_tx`
**Location:** Houston, TX
**Parent system:** standalone
**Official domains:** houstonmethodist.org
**Queue:** `p102_trial_2`
**Run window:** 2026-05-12T03:18:54.874Z → 2026-05-12T03:18:54.874Z

## A0 deterministic probe

- robots.txt: fetched (200) · advertised sitemaps: 1
- sitemap.xml: fetched (200) · URLs found: 10 · candidates kept: 1
- Fixed-path probes: 39 attempted, **6 accepted** (HTTP 200 with HTML body)
- JSON-LD records: 1

## A1 source map — 6 accepted sources

| Source family | Scope | URL |
|---|---|---|
| OBSERVERSHIP_PAGE | UNKNOWN_SCOPE | https://houstonmethodist.org/observership |
| RESEARCH_PAGE | UNKNOWN_SCOPE | https://houstonmethodist.org/research |
| VOLUNTEER_PAGE | UNKNOWN_SCOPE | https://houstonmethodist.org/volunteer |
| GME_PAGE | DEPARTMENT_LEVEL | https://houstonmethodist.org/gme |
| CAREERS_PAGE | CAREERS_PORTAL | https://houstonmethodist.org/careers |
| OTHER | UNKNOWN_SCOPE | https://houstonmethodist.org/education |

## A1.5 source completeness

- searchCompletenessScore: **15%**
- robotsChecked: true · sitemapChecked: true · jsonLdChecked: true
- source families seen: OBSERVERSHIP_PAGE, RESEARCH_PAGE, VOLUNTEER_PAGE, GME_PAGE, CAREERS_PAGE, OTHER
- missing USCE source families: VISITING_STUDENT_PAGE
- canProceedToA2: true

## Claims (P102-0C deterministic extractor)

- Total claims: **3**, all quote-verified: true
  - FUTURE_LANE_ONLY: 3

| Visibility | Lane | Source | Quote (first 100 chars) |
|---|---|---|---|
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | GME_PAGE | Graduate Medical Education \| Houston MethodistHouston Methodist Main SiteAcademic InstituteGivingInt… |
| FUTURE_LANE_ONLY | RESIDENCY_PROGRAM_INFO | GME_PAGE | Watch what makes Houston Methodist a great place to continue your education.Mission StatementThe Hou… |
| FUTURE_LANE_ONLY | CAREERS_PAGE | CAREERS_PAGE | - 2 P.M.Learn MoreHOUSTON METHODIST CYPRESS HOSPITALOnsite RN Career EventJune 1, 10 A.M - 2 P.MLear… |

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
- **clean** visa_signals_present: visa signals detected; visa object extraction deferred.
- **TRIGGERED** faculty_apply_present: faculty + apply keywords detected; future-lane job object extraction deferred.
- **clean** pdf_pending: PDF detected but text extraction pending; add pdf-parse in P102-0B if needed.
- **clean** jsonld_not_reflected_in_source_map: JSON-LD captured in source_map sidecar; reflected in source records.

## A3 hostile gate

- **Verdict:** PASS_WITH_CAVEATS
- publicSafe: false · futureLaneValue: LOW
- networkUsed: false · agentUsed: false
- claims: PUBLIC_SAFE_USCE=0, CAUTION_SAFE=0, FUTURE_LANE_ONLY=3
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

- v1 → v2 bytes: 39803 → 18284 (46% of v1)
- reclassifications (URL-family → content-family): 1

## Scores

- searchCompletenessScore: 15
- sourceConfidenceScore: 100
- artifactCompletenessScore: 100
- publicReadinessScore: 0
- futureLaneValueScore: 50
- hallucinationRiskScore: 0

---
_Report generated 2026-05-13T12:28:21.457Z by `scripts/p102-generate-run-report.ts`. Pure data transform; no network, no Agent._
