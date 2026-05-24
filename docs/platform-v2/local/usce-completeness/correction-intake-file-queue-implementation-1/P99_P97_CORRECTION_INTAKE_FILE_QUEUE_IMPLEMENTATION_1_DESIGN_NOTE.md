# Correction Intake File Queue — Design Note

**Date:** 2026-05-09
**Sprint:** P99-P97-CORRECTION-INTAKE-FILE-QUEUE-IMPLEMENTATION-1

---

## Goals

- Server-side intake endpoint that accepts a correction payload, validates it strictly, redacts/sanitizes, and writes a queue item + an audit event to local on-disk files.
- Disabled-by-default: returns an opaque "not_available" response unless `USCE_CORRECTION_INTAKE_ENABLED=true`.
- No DB. No email. No external service. No upload handling. No UI exposure.
- Active runtime, staged runtime, `/contact`, and `/clerkships/pilot` ALL untouched.

## Endpoint

`POST /api/usce/corrections`

- File: `src/app/api/usce/corrections/route.ts`
- `export const dynamic = "force-dynamic"` (matches repo convention).
- POST only. Other methods return 405.
- When env flag disabled (default): returns 404 `{ ok: false, error: "not_available" }`.
- When enabled + valid payload: returns 200 `{ ok: true, correction_id }`.
- When enabled + invalid payload: returns 400 `{ ok: false, error: "invalid_request" }` (no leakage of which field tripped).
- Never echoes user_message, internal paths, evidence paths, or forbidden field names.

## Env flag + queue root

- `USCE_CORRECTION_INTAKE_ENABLED` — must be exactly the string `"true"` (anything else = disabled).
- `USCE_CORRECTION_QUEUE_ROOT` — optional override; defaults to `docs/platform-v2/local/usce-corrections` relative to repo root.

When disabled, NO file writes happen and NO directories are created.

## Helper files

| File | Purpose |
|------|---------|
| `src/lib/usce-corrections/correction-intake-types.ts` | TypeScript types for payload, queue item, audit event; allowed enums. |
| `src/lib/usce-corrections/correction-intake-config.ts` | Forbidden field list, max payload size, env-flag helper, queue root resolver. |
| `src/lib/usce-corrections/correction-intake-validate.ts` | Schema validation: required fields, enum membership, URL shape, length bounds, forbidden-field detection. Returns `{ ok: true, ... }` or `{ ok: false }` (no leakage). |
| `src/lib/usce-corrections/correction-intake-redact.ts` | Strip forbidden keys; trim + cap user_message; redact SSN-shaped / credit-card-shaped / passport-shaped patterns. |
| `src/lib/usce-corrections/correction-file-queue.ts` | Atomic write of queue item JSON + audit JSONL; per-month subdirs; temp-file-then-rename. |

All five files are server-only (Node `fs` + `crypto`). None are imported by any UI component or by the `usce-pilot-data` runtime guard.

## Validators (3 new scripts)

| Validator | Validates |
|-----------|-----------|
| `scripts/validate-p99-correction-intake-payload.ts` | Sample/test payloads against the v2 intake schema. |
| `scripts/validate-p99-correction-queue-item.ts` | Queue item JSON files against the file-queue schema. |
| `scripts/validate-p99-correction-audit-log.ts` | Audit JSONL files against the audit-log schema (append-only invariants). |

Each runs in isolation, has zero new npm dependencies, and is deterministic.

## Test strategy

- `correction_intake_file_queue_implementation_1_sample_payloads.json` — synthetic payloads (valid + invalid + forbidden-field-bearing).
- `test-output/` directory under the sprint folder — used as the queue root for a CLI test, NOT the real queue root. Test artifacts are committed as fixtures so the new validators have something concrete to validate.
- Test driver: a small inline `npx tsx -e` snippet OR a dedicated `scripts/correction-intake-smoke.ts` if the in-line approach is awkward. **Default to `--dry-run`-equivalent**: the smoke test sets `USCE_CORRECTION_QUEUE_ROOT` to the test-output subdir, runs validation against the sample payloads, and confirms the writer produces the expected files in the test sandbox.
- The real queue root (`docs/platform-v2/local/usce-corrections/`) is **NOT** populated by this sprint. Real correction files would only appear after the contact-page UI sprint plus a real user submission.

## Privacy / redaction strategy

- Reject ANY payload key matching the forbidden_fields list (case-insensitive, exact-key match) — silently with HTTP 400.
- Strip all unknown top-level keys (allow-list approach).
- Apply user_message redaction: SSN-shape `\b\d{3}-?\d{2}-?\d{4}\b`, credit-card-shape `\b\d{13,19}\b`, passport-shape `\b[A-Z][0-9]{7,9}\b`, full-email pattern (other than user_email field).
- Trim, normalize whitespace, cap at 4000 chars.
- Original raw user_message is never stored.
- No IP capture in v1. (Future rate-limit layer will hash IPs; intentionally out of scope here.)
- No user_agent capture in v1.

## Disabled-by-default behavior

The route is the canonical guard. Both helpers and route check `isCorrectionIntakeEnabled()` before doing anything destructive. When disabled, the helpers return validation results but never write to disk. This means even if a future sprint accidentally calls the writer without the route, the writer ALSO refuses silently when the env flag is not set.

## Rollback plan

- Revert this sprint's commit; the file-queue artifacts under `docs/platform-v2/local/usce-corrections/inbox/` and `audit/` will be untouched (this sprint never writes to the real queue root).
- The route is gated behind a flag that defaults to off — no behavior change for any user.
- The active runtime, route, contact UI all stay 1:1 with pre-sprint state.

## Out of scope

- `/contact` UI changes (B-001/B-002/B-003 deferred to a later sprint).
- Email digest / notification.
- Real auth or admin UI.
- DB / Prisma.
- Rate limiting (planned for a later sprint per the implementation plan).
- Turnstile / spam token (planned for a later sprint).
- File uploads.
