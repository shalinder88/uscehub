# Run Report — Hartford Hospital

**Run ID:** `p102-0r-dry-run-1`
**Institution ID:** `inst_hartford_hospital_ct`
**Location:** Hartford, CT
**Parent system:** Hartford HealthCare
**Official domains:** hartfordhospital.org, hartfordhealthcare.org
**Queue:** `p102_dry_run_1`
**Run window:** 2026-05-12T02:28:31.769Z → 2026-05-12T02:28:31.769Z

## A0 deterministic probe

- robots.txt: fetched (200) · advertised sitemaps: 2
- sitemap.xml: fetched (200) · URLs found: 0 · candidates kept: 0
- Fixed-path probes: 34 attempted, **2 accepted** (HTTP 200 with HTML body)
- JSON-LD records: 2

## A1 source map — 2 accepted sources

| Source family | Scope | URL |
|---|---|---|
| RESEARCH_PAGE | UNKNOWN_SCOPE | https://hartfordhospital.org/research |
| CAREERS_PAGE | CAREERS_PORTAL | https://hartfordhospital.org/careers |

## A1.5 source completeness

- searchCompletenessScore: **6%**
- robotsChecked: true · sitemapChecked: true · jsonLdChecked: true
- source families seen: RESEARCH_PAGE, CAREERS_PAGE
- missing USCE source families: OBSERVERSHIP_PAGE, VISITING_STUDENT_PAGE, VOLUNTEER_PAGE
- canProceedToA2: true

## Claims (P102-0C deterministic extractor)

- Total claims: **0**, all quote-verified: true

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
- **clean** volunteer_page_classification_pending: Volunteer page captured; positive/negative USCE classification deferred.
- **clean** visa_signals_present: visa signals detected; visa object extraction deferred.
- **clean** faculty_apply_present: faculty + apply keywords detected; future-lane job object extraction deferred.
- **clean** pdf_pending: PDF detected but text extraction pending; add pdf-parse in P102-0B if needed.
- **clean** jsonld_not_reflected_in_source_map: JSON-LD captured in source_map sidecar; reflected in source records.

## A3 hostile gate

- **Verdict:** FAIL_NEEDS_A4
- publicSafe: false · futureLaneValue: NONE
- networkUsed: false · agentUsed: false
- claims: PUBLIC_SAFE_USCE=0, CAUTION_SAFE=0, FUTURE_LANE_ONLY=0
- hallucinationRisks: 0
- quoteVerificationFailures: 0
- missingCriticalFields: 0
- requiredA4Tasks: 0
- **Recommendation:** A4 recovery required; investigate missing critical fields.

## A4 focused-recovery tasks

- Total tasks: 1
  - **EXPAND_FIXED_PATHS** (status: PENDING_OPERATOR, blockedBy: NETWORK_ON_HOLD): Sitemap empty: 200 OK with 0 <loc> entries

## A5 continue-if-stuck decision

- overallStatus: **RUN_COMPLETE**
- recommendedAction: NONE_RUN_IS_COMPLETE

## Cleaned-text v2 diagnostic (P102-0F)

- v1 → v2 bytes: 11725 → 5030 (43% of v1)
- reclassifications (URL-family → content-family): 0

## Scores

- searchCompletenessScore: 6
- sourceConfidenceScore: 100
- artifactCompletenessScore: 100
- publicReadinessScore: 0
- futureLaneValueScore: 50
- hallucinationRiskScore: 0

---
_Report generated 2026-05-13T12:28:21.440Z by `scripts/p102-generate-run-report.ts`. Pure data transform; no network, no Agent._
