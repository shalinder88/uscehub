# P102 Public-Safe Review Queue — Summary

Generated: 2026-05-29
Branch: `local/p102-reviewer-workflow`

## Cumulative counts

- Total review-queue entries: **0**
- Total auto-approved opportunity rows (already public-safe): **0**
- Institutions in review queue: **0**
- Source domains: **0**

## By visibility lane

| Lane | Count |
|---|---:|

## By source scope

| Scope | Count |
|---|---:|

## By deep source family (top 15)

| Deep family | Count |
|---|---:|

## Top 10 institutions by priority score

Reviewers should consider these first — they have at least one entry with the highest priority score and the most reviewable entries overall.

| # | Institution | City, State | Top score | Entry count |
|---|---|---|---:|---:|

## Top 50 review-queue entries (machine-prioritized)

See `public_safe_review_queue_top50.csv` for the full machine-readable starter file.
All top-50 rows default to `reviewerDecision=KEEP_HUMAN_REVIEW`. The reviewer must explicitly change this per row.

| # | Score | Institution | Lane | Family | Source URL | Quote (truncated) |
|---|---:|---|---|---|---|---|

## How to use this

1. Open `public_safe_review_queue_top50.csv` in a spreadsheet.
2. For each row, decide one of: `APPROVE_PUBLIC_SAFE`, `REJECT_NOT_USCE`, `REJECT_SCOPE_MISMATCH`, `REJECT_OFF_DOMAIN_NO_APPLICABILITY`, `KEEP_HUMAN_REVIEW`, `NEEDS_MORE_EVIDENCE`, `FUTURE_LANE_ONLY`, or `DUPLICATE_OF_APPROVED_ROW`.
3. For `APPROVE_PUBLIC_SAFE` on system/school sources, fill `campusApplicabilityProof` with a ≥ 30-char verbatim quote or named-list reference (see `P102_REVIEWER_WORKFLOW_SPEC.md` §7).
4. Fill `decisionReason` (≥ 10 chars, not "TBD"/"TODO").
5. Fill `reviewer` with your name; `reviewedAt` with today's ISO date (YYYY-MM-DD).
6. Save as `public_safe_review_decisions_top50.csv`.
7. Run `npx tsx scripts/p102-build-approved-public-safe-export.ts` to generate the approved export.
8. Run `npx tsx scripts/p102-validate-approved-public-safe-export.ts` to confirm safety gates hold.

No row is auto-approved. The validator rejects fake placeholder values.
