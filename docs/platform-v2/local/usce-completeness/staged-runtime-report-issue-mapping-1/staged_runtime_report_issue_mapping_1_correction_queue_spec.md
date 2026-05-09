# USCE Listing Correction Queue — Spec v1

**Date:** 2026-05-09
**Sprint:** P99-P97-STAGED-RUNTIME-REPORT-ISSUE-MAPPING-1
**Status:** docs-only spec; not implemented; not active
**Schema companion:** `staged_runtime_report_issue_mapping_1_future_intake_payload_schema.json`

---

## 1. Purpose

Define the internal back-site workflow that will eventually receive user-submitted corrections from the report-issue links on USCE listing cards, route them to a reviewer, and produce a safe, auditable correction outcome before any runtime data update.

This spec covers the workflow only. It does not authorize implementation of:
- A `/contact` page rewrite
- A backend API or DB
- A staged-runtime activation
- A production deploy
- A UI change to the pilot or any other route

## 2. Workflow stages

```
[1] Intake received
       │
       ▼
[2] Listing ID resolved
       │
       ▼
[3] Evidence pack loaded
       │
       ▼
[4] Issue classified
       │
       ▼
[5] Source re-check performed
       │
       ▼
[6] Correction decision
       │
       ▼
[7] Reviewer records evidence
       │
       ▼
[8] Validator runs
       │
       ▼
[9] Runtime data update staged (NOT live)
       │
       ▼
[10] Public copy updated only after curator+QA review
```

### Stage 1 — Intake received
Trigger: the future intake endpoint receives a payload conforming to `usce_listing_correction_intake_v1`.

Status enum: `RECEIVED`

Required fields validated against the schema. Forbidden fields rejected silently with a generic 400 (no leakage of which forbidden field tripped). Rate limit applied.

### Stage 2 — Listing ID resolved
Status enum: `LISTING_RESOLVED` / `LISTING_UNRECOGNIZED` / `LISTING_FEEDBACK_NO_LISTING`

The reviewer (or a future automated step) joins `listing_id` against:
1. The active runtime (`src/data/usce/public-listings-pilot.generated.json`) — current 5 cards.
2. The staged runtime (`src/data/usce/public-listings-pilot-staged-batch-2.generated.json`) — current 7 cards including UPMC + Lincoln.
3. The Maine route runtime if the page_url indicates Maine.

If `ref=pilot-feedback` and `listing_id` is empty, the report is treated as a generic-pilot-page feedback item (not tied to a specific row).

If listing_id is unrecognized (e.g. user filed a report from a now-removed listing), the report is preserved with `LISTING_UNRECOGNIZED` status and routed to the curator queue for triage rather than auto-rejected.

### Stage 3 — Evidence pack loaded
Status enum: `EVIDENCE_LOADED`

The reviewer pulls the row's evidence join row from `staged_runtime_report_issue_mapping_1_evidence_join_map.csv` (or its successor) and reviews:
- Primary source URL
- Wayback archive URL
- HTML snapshot
- PNG screenshot
- Verbatim source quote
- Existing caveats (audience / visa / fee / site-specificity)
- T7-lane curator history if applicable

### Stage 4 — Issue classified
Status enum: `ISSUE_CLASSIFIED`

Reviewer assigns an `issue_type` from the canonical set. User-supplied `issue_type` is advisory; reviewer may reclassify.

Priority levels:
- **P0_PROGRAM_CLOSED_OR_LISTING_REMOVED** — affects audience trust; re-check within 1 business day.
- **P1_AUDIENCE_OR_VISA_MISCLAIM** — affects audience eligibility / visa policy correctness.
- **P2_COST_OR_APPLICATION_INACCURACY** — affects user effort but not eligibility.
- **P3_SOURCE_LINK_BROKEN** — affects archival but not active correctness.
- **P4_OTHER** — non-blocking.

### Stage 5 — Source re-check performed
Status enum: `SOURCE_RECHECKED`

Reviewer:
- Re-fetches the live source page (with the same fallback discipline as P99-P97-MANUAL-PNG-LANDING-1: live → HTML snapshot → Wayback).
- Compares the live page text to the verbatim quote stored in the evidence pack.
- Captures a fresh Wayback snapshot.
- Updates the screenshot if the page rendering changed materially.

### Stage 6 — Correction decision
Status enum (one of):
- `NO_CHANGE` — claim was already correct; document the verification.
- `COPY_CORRECTION` — surface text update only (e.g. typo, ambiguous wording).
- `SOURCE_URL_UPDATE` — primary source URL changed; update + re-archive.
- `ELIGIBILITY_CAVEAT_UPDATE` — audience / visa / fee caveat needs adjustment per source.
- `DELIST_OR_HIDE` — program closed or no longer source-supported; remove from runtime.
- `NEEDS_INSTITUTION_CONFIRMATION_LATER` — claim is unclear; flag for slower review with optional curator email to institution coordinator (out of band; not via this intake).

### Stage 7 — Reviewer records evidence
Status enum: `EVIDENCE_RECORDED`

Reviewer writes:
- Outcome decision and rationale.
- Updated evidence join entry (new Wayback URL, new screenshot path, new verbatim quote).
- Audit log entry containing:
  - `report_id`
  - `listing_id`
  - `reviewer_id`
  - `decision`
  - `previous_caveats`
  - `new_caveats`
  - `previous_source_url`
  - `new_source_url`
  - `decision_at`
  - `notes`

The audit log is append-only; previous entries are never modified.

### Stage 8 — Validator runs
Status enum: `VALIDATORS_RUN`

The reviewer triggers (in order):
- `validate-p99-p97-bridge-input.ts` if the row is in DRAFT bridge input.
- `validate-p99-staged-runtime-batch-2.ts` if the row is in the staged 7-card runtime.
- `validate-micro-pilot-runtime.ts` if the row is in the active 5-card runtime.
- Any future correction-aware validator.

If any validator fails: status becomes `VALIDATION_FAILED` and the correction is rolled back. No runtime update.

### Stage 9 — Runtime data update staged (NOT live)
Status enum: `RUNTIME_STAGED`

Updated row content is written into the appropriate runtime artifact:
- For DRAFT-stage rows: the bridge DRAFT CSV.
- For staged-runtime rows (UPMC, Lincoln): the staged JSON (`public-listings-pilot-staged-batch-2.generated.json`).
- For active rows: a NEW staged JSON, NOT the live JSON. Active runtime is updated only via a separate authorized sprint.

### Stage 10 — Public copy updated only after curator + QA review
Status enum: `PUBLISHED` (or `BLOCKED_AT_QA` / `WITHDRAWN`)

Two sign-offs required:
1. Curator confirms the correction matches the source.
2. QA confirms no banned phrases, no audience broadening, no visa overclaim, no site-specific guarantee added.

Only then does the active runtime change ship to the live route. Even then, the change goes through preview-only first per the existing micro-pilot release pattern (noindex preview → smoke test → curator approval → production).

## 3. Reviewer roles

| Role | Responsibilities |
|------|------------------|
| Curator | Stages 2–7. Owns evidence integrity and source-claim alignment. |
| QA reviewer | Stages 8 + 10. Owns banned-phrase / audience-safety check. |
| Engineering | Stage 9 mechanics only. Cannot decide content correctness. |
| Product owner | Final sign-off for Stage 10 PUBLISHED transition. |

## 4. Audit log fields (append-only)

```
audit_log_id            — UUIDv4 string (out-of-scope generation method here)
report_id               — links to the original intake payload
listing_id              — joined row ID
listing_runtime_set     — active | staged | bridge_draft | maine
issue_type              — final reviewer classification
decision                — Stage 6 enum value
reviewer_id             — internal ID
qa_reviewer_id          — for Stage 10 only
decision_at             — ISO-8601 timestamp
previous_caveats        — JSON snapshot of the row's caveats before correction
new_caveats             — JSON snapshot after correction
previous_source_url     — primary source URL pre-correction
new_source_url          — primary source URL post-correction
new_archive_url         — fresh Wayback URL captured during re-check
new_screenshot_path     — path to the fresh PNG captured during re-check
notes                   — reviewer free text, max 4000 chars
```

## 5. What this workflow does NOT collect

- Patient identifiers, MRN, DOB, SSN.
- Passport / visa / immigration documents.
- ECFMG / USMLE / NRMP / AAMC / ACGME credential numbers.
- Bank account or payment info.
- Browser fingerprint or IP for tracking purposes (rate-limit IP is hashed and not retained beyond 24h).

## 6. What this workflow does NOT promise

- That every report will receive an individual response.
- That a correction will be applied within a fixed SLA.
- That a hospital is "USCEHub-approved" or "verified by hospital."
- That a listing represents an application path through USCEHub.
- That a listing is open to all IMG/Caribbean students unless source supports it.

## 7. Escalation criteria

A report is escalated to a senior curator + product owner if any of:
- Affects ≥3 listings (mass change).
- Touches visa / immigration claims.
- Comes from a hospital coordinator / official institution channel (validation required first).
- Touches an audience-broadening request.
- Asserts a program is closed.
- Repeated reports about the same listing within 7 days.

## 8. Retention / deletion policy placeholders

- Default retention: 365 days from report submission.
- Resolved (decision != NEEDS_INSTITUTION_CONFIRMATION_LATER) reports: retained 180 days from `decision_at` then archived to a cold backup.
- User deletion request: honored within 30 days subject to legal hold.

(All numbers are placeholders to be ratified by counsel before implementation.)

## 9. What this spec is NOT

- A DB schema migration.
- A server-side intake endpoint.
- A `/contact` page rewrite.
- An authorization to activate staged runtime data.
- A production change.
- A UI change.

## 10. Bridge to existing artifacts

This spec sits between two existing back-site layers:

- **Upstream (intake):** `staged_runtime_report_issue_mapping_1_future_intake_payload_schema.json` defines the payload that arrives at Stage 1.
- **Downstream (runtime data):** the existing staged + active runtime artifacts under `src/data/usce/` accept the stage-9 staged update only via their respective generation/promotion sprints.

No code changes implied by this spec.
