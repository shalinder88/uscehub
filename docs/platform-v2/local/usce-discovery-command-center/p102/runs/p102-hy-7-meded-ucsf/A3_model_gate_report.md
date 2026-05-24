# A3 model hostile-gate verdict — p102-hy-7-meded-ucsf

**Verdict:** PASS_PUBLISH_READY

Zero PUBLIC_SAFE_USCE and zero PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY survived reclassification — all 80 merged claims sit in FUTURE_LANE_ONLY (17) or HUMAN_REVIEW_REQUIRED (63). No scope conflicts (all sources on meded.ucsf.edu), no quote-vs-claim semantic gaps in the safe lanes, no over-promotion. Tier 1 (Visiting Student Program), Tier 2 (GME/ACGME/Match), and Tier 3 (Careers/Benefits/CME) all covered. Ledger is internally consistent and safe to merge; visiting-student and IMG-refusal claims correctly held back for human disposition.

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
- totalClaimsReviewed: 80
- publicSafeUSCECount: 0
- publicSafeNoOpportunityCount: 0
- cautionSafeInternalReviewCount: 0
- futureLaneOnlyCount: 17
- humanReviewRequiredCount: 63
- hiddenRejectedCount: 0
- claimIdCollisionsObserved: Multiple sources reuse short claimIds (c1, c2, c3, a2_c1...) — non-globally-unique but disambiguated by sourceUrl; flagged as hygiene note, not a duplicate per spec.