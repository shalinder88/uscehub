# A3 model hostile-gate verdict — p102-fl-3-tampa-general

**Verdict:** PASS_PUBLISH_READY

Ledger contains zero PUBLIC_SAFE_USCE claims, which is the correct outcome given evidence: TGH's public surfaces show a non-medical volunteer program, careers/GME content, and a navigation-only observer pathway hint correctly held at CAUTION_SAFE_INTERNAL_REVIEW. No scope conflicts, no overclaims, no family/lane mismatches. Two non-safety issues noted: claimId 'c1' collision and an unfollowed observer-application signal warranting A4 narrow recovery, not a publish blocker.

- publicSafetyFailures: 0
- claimsToDowngrade:    0
- scopeConflicts:       0
- duplicates:           0

## Attestations
- networkUsed: false
- agentUsed: false
- readOnlyRunFolder: true
- everyPublicSafeClaimQuoteVerified: true
- everyPublicSafeClaimSourceFamilyChecked: true
- everyPublicSafeClaimSourceScopeChecked: true

## Metadata
- totalClaimsReviewed: 42
- publicSafeUSCECount: 0
- publicSafeNoOpportunityCount: 0
- cautionSafeInternalReviewCount: 1
- futureLaneOnlyCount: 35
- humanReviewRequiredCount: 6
- hiddenRejectedCount: 0
- claimIdCollision: claimId 'c1' is used by two distinct claims (volunteer ELIGIBILITY_REQUIREMENT and health-professionals OFFERS_OBSERVERSHIP). Downstream dedupe must disambiguate.