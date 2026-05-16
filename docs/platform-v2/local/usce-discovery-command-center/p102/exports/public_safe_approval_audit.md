# P102 Public-Safe Approval Audit

Generated: 2026-05-16
Decisions file: `docs/platform-v2/local/usce-discovery-command-center/p102/exports/public_safe_review_decisions_top50.csv`

## Counts

| Bucket | Count |
|---|---:|
| Auto-approved (from p102-build-public-safe-opportunity-rows) | 14 |
| Reviewer-approved (this run) | 0 |
| Total APPROVED export | 13 |
| Rejected | 0 |
| Needs more evidence | 0 |
| Kept in review (KEEP_HUMAN_REVIEW) | 54 |
| Unknown sourceQueueId (validation skipped) | 0 |
| Validation failures | 0 |

## Validation failures

None — every non-KEEP_HUMAN_REVIEW decision passed the approval rule.

## What this means

- `public_safe_opportunity_rows_approved.json` is the launch-corpus candidate. It contains 13 rows (13 auto + 0 reviewer-approved).
- These are NOT yet public. The next sprint (minimal website ingestion / display) will build a display surface that reads this file.
- 54 entries remain in the review queue (`reviewerDecision=KEEP_HUMAN_REVIEW`). They will become eligible for promotion once a reviewer assigns a decision.
