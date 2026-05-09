# P99-P97 Correction Intake File Queue Implementation — Sprint 1 Report

**Date:** 2026-05-09
**Sprint ID:** `P99-P97-CORRECTION-INTAKE-FILE-QUEUE-IMPLEMENTATION-1`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `b8510d2 P99: specify correction intake backsite workflow`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Implement the disabled-by-default server-side correction intake endpoint + file-based queue writer + redaction + 3 new validators. **No `/contact` UI change. No active runtime change. No staged runtime activation. No production. No DB. No email.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Endpoint implemented | YES — `POST /api/usce/corrections` |
| Endpoint default behavior | **404 `not_available`** unless `USCE_CORRECTION_INTAKE_ENABLED="true"` |
| Helper library | YES — `src/lib/usce-corrections/` (5 server-only files) |
| Queue writer | YES — atomic temp-file-then-rename |
| Audit log writer | YES — JSONL append, first event written on intake |
| New validators | **3** — `validate-p99-correction-intake-payload`, `validate-p99-correction-queue-item`, `validate-p99-correction-audit-log` |
| Existing validators | All 11 passing (tsc + 5 USCE/P99 + 5 prior-sprint validators) |
| Smoke driver | YES — `scripts/correction-intake-smoke.ts`; defaults to dry-run; sandboxed to sprint test-output |
| Sample payloads | 8 (3 valid + 1 valid-feedback + 4 reject variants) |
| Test-output fixtures | 4 queue items + 4 audit logs written under sprint folder; ALL validate cleanly |
| Real queue root populated | **NO** — sprint test root is the sprint's own `test-output/` sandbox; the canonical queue root `docs/platform-v2/local/usce-corrections/` is empty |
| Active runtime touched | **NO** ✅ |
| `/contact` UI touched | **NO** ✅ |
| `/clerkships/pilot` touched | **NO** ✅ |
| Production deploy | NOT TRIGGERED ✅ |

## 2. Files changed

| File | Kind | Purpose |
|------|------|---------|
| `src/app/api/usce/corrections/route.ts` | NEW | Disabled-by-default Next.js route handler. POST only; opaque rejection responses. |
| `src/lib/usce-corrections/correction-intake-types.ts` | NEW | TypeScript types + enums for payload, queue item, audit event. |
| `src/lib/usce-corrections/correction-intake-config.ts` | NEW | Forbidden field list, env-flag helper, queue-root resolver, max-size constants, regex constants. |
| `src/lib/usce-corrections/correction-intake-validate.ts` | NEW | Strict allow-list + enum + shape validation. Discriminated-union return; never throws. |
| `src/lib/usce-corrections/correction-intake-redact.ts` | NEW | SSN/CC/passport/email-pattern redaction; allow-list strip helper. |
| `src/lib/usce-corrections/correction-file-queue.ts` | NEW | Atomic write of queue item JSON + audit JSONL; refuses to write when env flag disabled. |
| `scripts/validate-p99-correction-intake-payload.ts` | NEW | Validator for sample payloads; classifies each as ACCEPT / REJECT_*. |
| `scripts/validate-p99-correction-queue-item.ts` | NEW | Validator for written queue items; recurses directory; checks redaction-leak shapes. |
| `scripts/validate-p99-correction-audit-log.ts` | NEW | Validator for JSONL audit logs; uniqueness, monotonicity, forbidden-field deep-scan. |
| `scripts/correction-intake-smoke.ts` | NEW | Smoke driver; defaults to dry-run; commit mode only writes to sprint test-output. |
| `docs/platform-v2/local/usce-completeness/correction-intake-file-queue-implementation-1/*` | NEW | Design note, sample payloads, test matrix, validation results, blockers, this report, test-output fixtures. |

**Files NOT changed:** `/contact/page.tsx`, `/clerkships/pilot/*`, `src/lib/usce-pilot-data.ts`, `src/data/usce/public-listings-pilot.generated.{json,ts}`, `src/data/usce/public-listings-pilot-staged-batch-2.generated.{json,ts}`, `next.config.ts`, `src/app/sitemap.ts`, `public/robots.txt`, any homepage / nav file. Verified by `git diff --name-only`.

## 3. Disabled-by-default behavior

The route returns HTTP 404 with body `{ ok: false, error: "not_available" }` unless `process.env.USCE_CORRECTION_INTAKE_ENABLED === "true"`. When disabled:

- No JSON parsing happens.
- No filesystem write happens.
- No directory is created.
- No env, header, or query parameter can override.

The flag check is evaluated on every request. The writer (`writeCorrectionToQueue`) ALSO checks the flag independently as defense in depth — even if a future caller forgets the route guard, the writer refuses with `{ ok: false, skipped_reason: "intake_disabled" }`.

The default Vercel deployment will NOT have the env flag set, so production behavior is automatically "not available" until an explicit deploy-time choice.

## 4. Payload validation / redaction

Validation rules (all enforced; opaque rejection):
- 16 KB payload size cap.
- Allow-list of 16 top-level keys; any other key → reject.
- Forbidden-field detection (case-insensitive, exact-key) against 38 names (passport / visa / immigration / medical / SSN / ECFMG / NRMP / AAMC / ACGME / banking / payment / credentials).
- `schema_version` must be `"v2"`.
- `report_ref` ∈ 10-value enum.
- `listing_id` either empty (only when `report_ref === "pilot-feedback"`) or `^pilot-\d{3}-[A-Z]{2}-[a-z0-9-]+$` (≤120 chars).
- `runtime_set` ∈ 5-value enum.
- `page_url` http(s):// (≤500 chars).
- `issue_type` ∈ 11-value enum.
- `user_message` length ∈ [5, 4000].
- `submitted_at` ISO-8601 with Z.
- `source_context` is an object whose every value is a string ≤500 chars; any forbidden-field key in `source_context` ALSO rejects.
- Optional fields validated only if present.
- `honeypot_field` must be empty/absent.

Redaction (server-side, before persistence):
- SSN-shape `\b\d{3}-?\d{2}-?\d{4}\b` → `[redacted]`
- Credit-card-shape (13–19 digits) → `[redacted]`
- Passport-shape `\b[A-Z][0-9]{7,9}\b` → `[redacted]`
- Email-pattern in free text → `[redacted-email]`
- Whitespace normalization
- Length cap at 4000 chars (with `…[truncated]` suffix if over)

The original raw `user_message` is **never written to disk**. The queue item carries `user_message_redacted` only.

## 5. File queue writer

Paths under `getQueueRoot()` (default: `docs/platform-v2/local/usce-corrections`, override via `USCE_CORRECTION_QUEUE_ROOT`):

- Queue item: `inbox/YYYY/MM/<correction_id>.json`
- Audit log: `audit/YYYY/MM/<correction_id>.jsonl`

Atomic write: writes to a `.<basename>.<pid>.<ts>.tmp` sibling, then `fs.renameSync` to the target path. POSIX-atomic when the FS is the same.

Default queue item shape (excerpt from a real test fixture):

```json
{
  "correction_id": "0e866084deb24d399bec21e1017fc7e6",
  "schema_version": "v1",
  "status": "RECEIVED",
  "priority": "P2_SOURCE_LINK_OR_FEE",
  "listing_id": "pilot-012-NY-nyc-health-hospitals-lincoln",
  "report_ref": "pilot-listing",
  "runtime_set": "staged",
  "issue_type": "cost_or_fee_incorrect",
  "submitted_at": "2026-05-09T18:35:00Z",
  "received_at": "2026-05-09T21:18:01Z",
  "received_channel": "web_form",
  "user_message_redacted": "Stipend amount may have changed; please verify against the live MOSAIC page.",
  "source_context": { "primary_source_url": "https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/" },
  "evidence_join_key": "pilot-012-NY-nyc-health-hospitals-lincoln",
  "assigned_reviewer": null,
  "review_due_date": null,
  "audit_log_path": "audit/2026/05/0e866084deb24d399bec21e1017fc7e6.jsonl",
  "user_email_present": false
}
```

Priority is derived deterministically from `issue_type`:
- `program_closed` → P0
- `eligibility_incorrect` / `visa_information_incorrect` / `application_process_incorrect` / `wrong_institution` / `source_does_not_support_claim` → P1
- `source_link_broken` / `cost_or_fee_incorrect` → P2
- `duplicate_listing` / `outdated_information` / `other` → P3

## 6. Audit log writer

First event (excerpt from a real test fixture, on a single JSONL line):

```json
{"audit_event_id":"02ea19615b404559a4f7c91e10aed55a","correction_id":"0e866084deb24d399bec21e1017fc7e6","timestamp":"2026-05-09T21:18:01Z","actor_role":"intake_endpoint","actor_id_or_placeholder":"system","action":"intake_received","previous_status":"NONE","new_status":"RECEIVED","evidence_checked":[],"source_urls_checked":[],"archive_urls_checked":[],"decision":"no_decision_yet","decision_reason":"Initial intake; awaiting triage.","changed_fields":{},"validator_results":{},"next_required_action":"triage"}
```

Subsequent events (from later sprints' reviewer CLI) will append additional lines; this sprint only writes the very first event. The audit-log validator enforces:
- Unique `audit_event_id` per file.
- Monotonic `timestamp` (within 60s tolerance for clock skew).
- All required fields present.
- Forbidden-field deep scan (e.g. would catch a future bug that puts a passport_number under `changed_fields`).
- `decision === "rejected_forbidden_field"` requires `changed_fields === {}`.

## 7. Test results

| Test phase | Result |
|------------|--------|
| Smoke driver (DRY-RUN) | **8/8 PASS** — all expected classifications match; zero filesystem writes |
| Smoke driver (COMMIT to test-output sandbox) | **8/8 PASS** — 4 valid samples wrote queue+audit pairs; 4 reject samples produced zero writes |
| `validate-p99-correction-intake-payload.ts` against samples | **PASS** — 8 samples classified |
| `validate-p99-correction-queue-item.ts` against `test-output/` | **PASS** — 4 items conform |
| `validate-p99-correction-audit-log.ts` against `test-output/` | **PASS** — 4 logs conform |

Zero forbidden-field VALUES were ever written anywhere. The single passport-bearing test fixture (`05_forbidden_passport_field_REJECT`) was rejected at the validator step before reaching the writer; the writer was never invoked for that sample.

Detail in `correction_intake_file_queue_implementation_1_test_matrix.csv` and `…_validation_results.csv`.

## 8. Privacy / sensitive-field handling

The implementation enforces the spec's privacy invariants:
- **Forbidden top-level keys** silently rejected with HTTP 400 (no leakage of which key tripped). `validate-p99-correction-intake-payload` confirms `passport_number` + `visa_document` payload returns `REJECT_FORBIDDEN_FIELD`.
- **Free-text redaction** before any storage; original raw never persisted.
- **No IP capture** in this sprint.
- **No user_agent capture** in this sprint.
- **No upload handling.**
- `user_email`, when present, lives in `user_email_present: boolean` flag only at the queue item level — the email itself is part of the payload but the queue item shape clearly tracks presence vs content for reviewer auditability.

The endpoint never echoes:
- The user's `user_message`.
- Any internal file path.
- Any evidence path.
- Any forbidden-field name.
- Which validation rule rejected the payload.

## 9. What this sprint did NOT do

- Did NOT modify `/contact/page.tsx` or any UI.
- Did NOT modify `/clerkships/pilot/*`.
- Did NOT modify `src/lib/usce-pilot-data.ts`.
- Did NOT modify any active runtime data file.
- Did NOT modify any staged runtime data file.
- Did NOT activate the staged 7-card runtime.
- Did NOT add a database table or migration.
- Did NOT add an external SaaS dependency.
- Did NOT add an email pathway.
- Did NOT add rate limiting (deferred per the implementation plan).
- Did NOT add Turnstile or any captcha (deferred).
- Did NOT add file-upload handling.
- Did NOT modify any existing validator script.
- Did NOT add any new npm dependency.
- Did NOT mark any row PUBLIC_NOW or IMPORT_READY.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT submit any form or contact request.
- Did NOT write to the canonical queue root (`docs/platform-v2/local/usce-corrections/`).
- Did NOT broaden audience eligibility.
- Did NOT remove any caveat.
- Did NOT mutate the bridge DRAFT or the T7 queue file.
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 10. Remaining blockers

| Blocker | Status |
|---------|--------|
| B-001 `/contact` ignores listing_id/ref | Still open — UI sprint deferred |
| B-002 form has no submit handler | Still open — UI sprint deferred |
| B-003 listing_id missing from form payload | Still open — UI sprint deferred |
| B-004 no intake backend endpoint | **RESOLVED** in this sprint (env-flag gated) |
| B-005 active 5 evidence on T7 lane | Still open — cosmetic, non-blocking |
| B-006 no rate limit / spam guard | New, low severity, deferred to a later spam-and-rate-limit sprint |

Detail in `correction_intake_file_queue_implementation_1_blockers.csv`.

## 11. Recommended next step

Two non-conflicting paths:

1. **`P99-P97-CORRECTION-QUEUE-VALIDATOR-1`** — extend the queue/audit validators with cross-validator joins (queue item ↔ audit log first-event match, missing-audit-file detection). Pure backsite; no UI. **Recommended if the user wants to keep building backsite trust before any UI sprint.**

2. **`P99-P97-CONTACT-REF-PREFILL-AND-HIDDEN-CONTEXT-1`** — wire `/contact/page.tsx` to read `searchParams.ref` + `searchParams.listing_id`, echo the listing being reported, and submit through the `POST /api/usce/corrections` endpoint that this sprint just landed. **Recommended if the user is ready to start the UI-adjacent work.** This sprint resolves B-001/B-002/B-003 and enables the first real end-to-end correction intake (still env-flag gated; still no production).

Per the user's standing "backsite/data/trust foundation first" doctrine, **Option 1 is the safer continuation**, but the endpoint is now ready for Option 2 whenever the user authorizes UI-adjacent work.

## 12. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `--prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / prisma / seed | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED |
| No runtime activation | CONFIRMED |
| No active runtime change | CONFIRMED |
| No staged runtime change | CONFIRMED |
| No `/clerkships/pilot/*` change | CONFIRMED |
| No `/contact/*` UI change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No new external service dependency | CONFIRMED |
| No new npm dependency | CONFIRMED |
| No email pathway added | CONFIRMED |
| No upload handling added | CONFIRMED |
| No forbidden-field VALUE ever stored | CONFIRMED — test fixtures + validators verify |
| No raw IP captured | CONFIRMED — IP capture intentionally deferred |
| No existing validator weakened | CONFIRMED — only AUTHORED new strict validators |
| No caveat removed | CONFIRMED |
| No audience broadened | CONFIRMED |
| No visa overclaim | CONFIRMED |
| No site-specific guarantee added | CONFIRMED |
| No fake source / fake evidence / fake PNG | CONFIRMED |
| No login / CAPTCHA / credentialed scraping | CONFIRMED |
| No staged runtime imported by app code | CONFIRMED — staged file still has zero src/ references |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force push | CONFIRMED |
| Endpoint disabled by default | CONFIRMED — env flag check at request entry; writer also checks; defense in depth |
| No real queue items written outside sandbox | CONFIRMED — only `test-output/` populated |
