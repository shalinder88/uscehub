# A3 model hostile-gate verdict — p102-fl-1-mayo-clinic-florida

**Verdict:** PASS_PUBLISH_READY

Zero PUBLIC_SAFE_USCE claims emitted. The vast majority of candidate Mayo Clinic Florida USCE URLs resolved to system-level 404 pages and were correctly routed to HUMAN_REVIEW_REQUIRED; remaining substantive claims are from mayoclinic.org/education and /medical-professionals (system/college scope) and were correctly held at HUMAN_REVIEW_REQUIRED or FUTURE_LANE_ONLY rather than promoted to the Florida campus. Ledger is internally consistent; several A1/A2 duplicates noted for downstream dedupe.

- publicSafetyFailures: 0
- claimsToDowngrade:    0
- scopeConflicts:       0
- duplicates:           7

## Attestations
- networkUsed: false
- agentUsed: false
- readOnlyRunFolder: true
- everyPublicSafeClaimQuoteVerified: true
- everyPublicSafeClaimSourceFamilyChecked: true
- everyPublicSafeClaimSourceScopeChecked: true

## Metadata
- totalClaimsReviewed: 61
- publicSafeUSCECount: 0
- publicSafeNoOpportunityCount: 0
- cautionSafeInternalReviewCount: 0
- futureLaneOnlyCount: 6
- humanReviewRequiredCount: 55
- hiddenRejectedCount: 0