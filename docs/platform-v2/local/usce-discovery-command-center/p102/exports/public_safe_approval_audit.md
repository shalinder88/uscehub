# P102 Public-Safe Approval Audit

Generated: 2026-05-16
Decisions file: `docs/platform-v2/local/usce-discovery-command-center/p102/exports/public_safe_review_decisions.csv`

## Counts

| Bucket | Count |
|---|---:|
| Auto-approved (from p102-build-public-safe-opportunity-rows) | 14 |
| Reviewer-approved (this run) | 0 |
| Total APPROVED export | 13 |
| Rejected | 0 |
| Needs more evidence | 0 |
| Kept in review (KEEP_HUMAN_REVIEW) | 41 |
| Unknown sourceQueueId (validation skipped) | 0 |
| Validation failures | 13 |

## Validation failures (reviewer should fix these in the decisions CSV)

| reviewId | institution | decision | reason |
|---|---|---|---|
| rev_0001 | Houston Methodist Hospital | REJECT_NOT_USCE | REJECT_NOT_USCE requires decisionReason ≥10 chars |
| rev_0002 | Houston Methodist Hospital | REJECT_NOT_USCE | REJECT_NOT_USCE requires decisionReason ≥10 chars |
| rev_0003 | Houston Methodist Hospital | REJECT_NOT_USCE | REJECT_NOT_USCE requires decisionReason ≥10 chars |
| rev_0004 | Houston Methodist Hospital | REJECT_NOT_USCE | REJECT_NOT_USCE requires decisionReason ≥10 chars |
| rev_0005 | Emory University Hospital | REJECT_SCOPE_MISMATCH | reviewer must be a human name for REJECT_SCOPE_MISMATCH |
| rev_0006 | Houston Methodist Hospital | REJECT_NOT_USCE | REJECT_NOT_USCE requires decisionReason ≥10 chars |
| rev_0007 | Houston Methodist Hospital | REJECT_NOT_USCE | REJECT_NOT_USCE requires decisionReason ≥10 chars |
| rev_0015 | Emory University Hospital | REJECT_NOT_USCE | REJECT_NOT_USCE requires decisionReason ≥10 chars |
| rev_0031 | Keck School of Medicine at USC | APPROVE_PUBLIC_SAFE | missing or too-short proposedOpportunityName |
| rev_0044 | UCSF School of Medicine | DUPLICATE_OF_APPROVED_ROW | DUPLICATE_OF_APPROVED_ROW requires duplicateOfRowId |
| rev_0045 | UCSF School of Medicine | REJECT_NOT_USCE | REJECT_NOT_USCE requires decisionReason ≥10 chars |
| rev_0046 | UCSF School of Medicine | DUPLICATE_OF_APPROVED_ROW | decisionReason must be ≥10 chars |
| rev_0047 | UCSF School of Medicine | APPROVE_PUBLIC_SAFE | missing or too-short proposedOpportunityName |

## What this means

- `public_safe_opportunity_rows_approved.json` is the launch-corpus candidate. It contains 13 rows (13 auto + 0 reviewer-approved).
- These are NOT yet public. The next sprint (minimal website ingestion / display) will build a display surface that reads this file.
- 41 entries remain in the review queue (`reviewerDecision=KEEP_HUMAN_REVIEW`). They will become eligible for promotion once a reviewer assigns a decision.
