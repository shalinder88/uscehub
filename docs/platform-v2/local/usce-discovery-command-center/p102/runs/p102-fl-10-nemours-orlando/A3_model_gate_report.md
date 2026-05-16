# A3 model hostile-gate verdict — p102-fl-10-nemours-orlando

**Verdict:** PASS_PUBLISH_READY

Ledger is internally consistent and publish-safe: zero PUBLIC_SAFE_USCE claims, all USCE-flavored signals are either FUTURE_LANE_ONLY or HUMAN_REVIEW_REQUIRED, and scope conflicts (Delaware-Valley vs. Orlando) are properly flagged. However, Tier 1 USCE coverage for the Orlando campus is FAIL_WEAK — no Orlando-specific USCE page was found; negative evidence is Delaware-scoped. Recommend A4 recovery tasks for Orlando-specific USCE and UCF-Nemours pathway. Multiple A1/A2 duplicates between nemours.org/careers (src_28) and www.nemours.org/careers.html (src_70 — identical hash) should be deduped downstream.

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
- totalClaimsReviewed: 189
- publicSafeUSCECount: 0
- publicSafeNoOpportunityCount: 0
- cautionSafeInternalReviewCount: 0
- futureLaneOnlyCount: 142
- humanReviewRequiredCount: 47
- hiddenRejectedCount: 0
- note: Counts approximate; ledger contains 0 PUBLIC_SAFE_USCE — nothing publishes as USCE.