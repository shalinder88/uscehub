# Correction Intake — Validator Requirements

**Date:** 2026-05-09
**Sprint:** P99-P97-CORRECTION-INTAKE-BACKSITE-SPEC-2
**Status:** docs-only requirements; not implemented; not active

---

## 1. Validator inventory expected after future implementation

| Validator | File path | Run | Hard-fails on |
|-----------|-----------|-----|---------------|
| `validate-p99-correction-intake-payload.ts` | `scripts/` | `npx tsx … <payload.json>` | Schema-violating intake payloads |
| `validate-p99-correction-queue-item.ts` | `scripts/` | `npx tsx … <queue-item.json>` (or directory) | Schema-violating queue items, forbidden fields, invalid status transitions |
| `validate-p99-correction-audit-log.ts` | `scripts/` | `npx tsx … <jsonl-file>` (or directory) | Append-only invariants; duplicate event IDs; unauthorized state regressions |

The first three each MUST be deterministic, dependency-free (no npm install), and writable in TypeScript-only.

## 2. `validate-p99-correction-intake-payload.ts` — required hard-fails

- Missing any required field (`schema_version`, `listing_id`, `report_ref`, `runtime_set`, `page_url`, `issue_type`, `user_message`, `submitted_at`, `source_context`).
- `schema_version` not exactly `"v2"`.
- `listing_id` regex mismatch AND `report_ref != "pilot-feedback"`.
- `report_ref` not in declared enum.
- `issue_type` not in declared enum.
- `user_message` length < 5 or > 4000 chars.
- `page_url` not http(s)://.
- `submitted_at` not ISO-Z.
- ANY key present matching the `forbidden_fields` list (case-insensitive substring check) — silently rejected.
- `honeypot_field` present and non-empty — silently rejected.
- Payload size > 16384 bytes — rejected.
- `user_email` present but not RFC-5322-shaped.
- `user_message` contains a link to a known-bad domain (deferred — list maintained separately).
- `user_message` contains an inlined SSN-shape, credit-card-shape, or passport-shape pattern that survives the redaction pass — log a follow-up event.

## 3. `validate-p99-correction-queue-item.ts` — required hard-fails

- File parses as JSON.
- Required queue-item fields all present.
- `correction_id` matches `^[0-9a-f]{32}$`.
- `status` in declared enum.
- `priority` in declared enum.
- `received_at` ISO-Z.
- `received_at` >= `submitted_at`.
- `runtime_set` is one of `active` / `staged` / `bridge_draft` / `maine` / `unknown`.
- For `runtime_set != "unknown"`: `listing_id` resolves against the corresponding runtime map.
- `evidence_join_key` equals `listing_id`.
- `audit_log_path` matches the documented pattern.
- ANY forbidden field name from the intake schema appears as a key.
- The on-disk `audit_log_path` exists and contains at least one event.

## 4. `validate-p99-correction-audit-log.ts` — required hard-fails

- File parses as JSONL (one event per line).
- Each event has all required fields.
- `audit_event_id` unique within the file.
- `audit_event_id` matches `^[0-9a-f]{32}$`.
- `timestamp` is monotonically non-decreasing across the file (later events have ≥ earlier `timestamp`).
- Status transitions follow the allowed transition table from the queue schema.
- A state regression (later event's `new_status` rolling back) MUST be paired with `action="reopened_with_audit"`.
- No event modifies prior events (the validator confirms this by re-reading file with byte-offset stability — though the truer guarantee comes from filesystem permissions, the validator can warn if mtime suggests rewrites).
- `decision="rejected_forbidden_field"` events MUST NOT carry any value in `changed_fields`.
- `actor_id_or_placeholder` for `decision_made` and the immediately following `qa_review_completed` (or `validator_run` with override) for high-risk decisions MUST differ.

## 5. Cross-validator joins

A future composite validator (optional, name TBD) should:

- Join queue item to its audit log file.
- Confirm the queue item's `status` equals the most recent audit event's `new_status`.
- Confirm the queue item's `assigned_reviewer` equals the most recent triage event's actor when present.
- Confirm no orphan audit log files (audit_log_path references must resolve to existing queue items).

## 6. Validators that MUST keep passing throughout

These are existing validators that MUST continue to pass once the correction system lands:

- `tsc --noEmit`
- `validate-micro-pilot-runtime.ts`
- `validate-public-runtime-data.ts`
- `validate-usce-public-cards.ts`
- `validate-usce-save-compare.ts`
- `validate-usce-report-intake.ts` (Maine-route)
- `validate-usce-pilot-release.ts`
- `validate-p99-p97-bridge-input.ts`
- `validate-p99-runtime-prep-candidate.ts`
- `validate-p99-staged-runtime-batch-2.ts`
- `validate-p99-report-issue-mapping.ts`

Any future implementation sprint that fails one of the above must NOT merge to the preview branch without an explicit fix-or-escalate decision documented in its sprint folder.

## 7. What this requirements file does NOT do

- Implement any validator.
- Modify any UI.
- Modify any runtime.
- Authorize any production change.
