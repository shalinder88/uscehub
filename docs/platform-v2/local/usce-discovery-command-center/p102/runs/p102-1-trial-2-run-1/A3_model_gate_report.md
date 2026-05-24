# A3 model hostile-gate verdict — p102-1-trial-2-run-1

**Verdict:** PASS_PUBLISH_READY

No PUBLIC_SAFE_USCE claims emitted. The /observership URL was correctly re-classified by A1/A2 as a PharmD externship (not medical USCE) and held at HUMAN_REVIEW_REQUIRED. All GME/careers/education signals are confined to FUTURE_LANE_ONLY. No scope conflicts, no overclaims, no eligibility/duration/fee/contact promotions to public. Ledger is internally consistent and safe to publish as "no public USCE found" for this institution.

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
- totalClaimsReviewed: 53
- publicSafeUSCECount: 0
- publicSafeNoOpportunityCount: 0
- cautionSafeInternalReviewCount: 5
- futureLaneOnlyCount: 33
- humanReviewRequiredCount: 15
- hiddenRejectedCount: 0
- note: claimId namespace reuses short ids (c1..c6) across multiple sources; not a duplicate per A3 rules (different sourceUrls) but downstream id-uniqueness should be enforced at merge.