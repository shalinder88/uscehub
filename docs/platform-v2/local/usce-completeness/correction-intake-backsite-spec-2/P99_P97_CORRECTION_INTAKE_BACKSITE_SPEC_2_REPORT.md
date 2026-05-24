# P99-P97 Correction Intake Backsite Spec — Sprint 2 Report

**Date:** 2026-05-09
**Sprint ID:** `P99-P97-CORRECTION-INTAKE-BACKSITE-SPEC-2`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `b84bac8 P99: map staged runtime report issue flow`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Implementation-ready backsite specification for the future correction intake / queue / audit / review system. **Docs and JSON-schema only. No app code. No UI. No route. No production. No runtime activation.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Spec completed | YES — 9 spec files + 1 sample-payloads file + 1 final report |
| Production touched | **NO** ✅ |
| UI touched | **NO** ✅ |
| Active runtime files touched | **NO** ✅ |
| Staged runtime files touched | **NO** ✅ |
| App code touched | **NO** ✅ |
| Validators authored | 0 new (this sprint is spec-only); validator requirements documented for future sprints |
| Existing validators (5) | ALL PASSING |
| Production deploy | NOT TRIGGERED ✅ |

## 2. Why this sprint was needed

The prior sprint (`staged-runtime-report-issue-mapping-1`) audit caught a serious correction-trust gap:

- `/clerkships/pilot` has per-card "Report a listing issue" links that send users to `/contact?ref=pilot-listing&listing_id=…`.
- `/contact/page.tsx` does **NOT** read those URL params.
- The contact form's Send Message button is `type="button"` with **no submit handler**.
- The form payload (firstName/lastName/email/subject/message) does NOT include `listing_id` or `ref`.
- No backend intake endpoint exists.

If the staged 7-card runtime were activated today, every user-filed correction would lose its listing context — arriving as a generic contact message with no traceability. This sprint defines the architecture that will, once implemented in a later sprint, make corrections listing-specific, evidence-joinable, audit-logged, privacy-aware, and review-gated — all BEFORE any of the audited UI gaps gets fixed.

## 3. Files created

| File | Purpose |
|------|---------|
| `correction_intake_backsite_spec_2_intake_payload_schema.json` | v2 server-side payload schema; required + optional + forbidden field lists; rate-limit + transport-security spec |
| `correction_intake_backsite_spec_2_file_queue_schema.json` | On-disk JSON queue item schema; directory layout; status enum; transition rules; concurrency spec |
| `correction_intake_backsite_spec_2_audit_log_schema.json` | Append-only JSONL audit-event schema; immutability rules; no-overwrite invariants |
| `correction_intake_backsite_spec_2_queue_statuses.csv` | 12-status state machine with allowed transitions, default priorities, reviewer roles |
| `correction_intake_backsite_spec_2_issue_type_taxonomy.csv` | 11 issue_type definitions + per-issue priorities, evidence requirements, possible outcomes |
| `correction_intake_backsite_spec_2_privacy_and_retention_policy.md` | Minimum-necessary doctrine; forbidden-field list; IP hashing; spam handling; retention placeholders; future-security-review gating for any uploads |
| `correction_intake_backsite_spec_2_reviewer_auth_model.md` | 6 roles + permission matrix + dual-signoff rules + no-self-approval rules + auth-mechanism-agnostic invariants |
| `correction_intake_backsite_spec_2_implementation_plan.md` | 5-sprint sequencing plan with files-touched, validation commands, rollback plans |
| `correction_intake_backsite_spec_2_acceptance_criteria.csv` | 31 acceptance criteria across the 5 future sprints, each with validation method + blocking flags |
| `correction_intake_backsite_spec_2_blocker_resolution_matrix.csv` | Maps each prior sprint blocker (B-001 through B-005) to its resolution sprint + acceptance criteria + remaining-block flags |
| `correction_intake_backsite_spec_2_validator_requirements.md` | Specifies 3 future validator scripts + their hard-fail rules + cross-validator join checks |
| `correction_intake_backsite_spec_2_sample_payloads.json` | 6 synthetic test fixtures covering accept / spam / forbidden-field-rejection / generic-feedback cases |
| `P99_P97_CORRECTION_INTAKE_BACKSITE_SPEC_2_REPORT.md` | This report |

## 4. Intake payload schema summary

`usce_listing_correction_intake_v2`:

- **9 required fields** (`schema_version, listing_id, report_ref, runtime_set, page_url, issue_type, user_message, submitted_at, source_context`).
- **9 optional fields** (incl. `user_email`, `suggested_correction`, `source_url`, `honeypot_field`, `turnstile_token`).
- **30+ forbidden field names** explicitly listed (passport / visa / immigration / medical / SSN / ECFMG / NRMP / AAMC / ACGME / banking / payment / credentials).
- Payload max size 16384 bytes.
- Free-text `user_message` length-bounded (5–4000 chars) + server-side redaction pass for SSN/credit-card/passport patterns BEFORE storage.
- Top-level safety flags `not_db_migration: true`, `not_active_runtime: true`, `not_production: true`, `privacy_minimization_required: true`.

## 5. File queue schema summary

`usce_correction_file_queue_item_v1`:

- Queue root: `docs/platform-v2/local/usce-corrections/`
- Subdirectory layout: `inbox/`, `in_review/`, `needs_evidence/`, `decided/`, `staged_corrections/`, `closed/`, `archive/`
- Filename: `<correction_id>.json` (UUIDv4 hex no-dashes)
- 16 required queue-item fields including `audit_log_path`, `evidence_join_key`, `assigned_reviewer`, `review_due_date`
- 12-status enum (`RECEIVED → TRIAGED → SOURCE_RECHECK_PENDING → SOURCE_RECHECK_COMPLETE → NEEDS_*_UPDATE / NO_CHANGE → STAGED_CORRECTION → VALIDATED_CORRECTION → CLOSED`)
- 5-priority enum (`P0_SAFETY_OR_LEGAL` through `P4_SPAM_OR_UNACTIONABLE`)
- Allowed-state-transitions and forbidden-transitions tables documented
- Atomic write spec (temp-file-then-rename) and per-file lock pattern

## 6. Audit log schema summary

`usce_correction_audit_log_event_v1`:

- Format: JSONL, one event per line, **append-only**, never edited or deleted in place.
- Path: `docs/platform-v2/local/usce-corrections/audit/<correction_id>.jsonl`
- 16 required event fields including `previous_status`, `new_status`, `evidence_checked` (array), `decision`, `decision_reason`, `changed_fields` (object), `validator_results`, `next_required_action`.
- 8-action enum (intake_received, triaged, source_recheck_started/completed, evidence_captured, decision_made, correction_staged, validator_run, qa_review_started/completed, closed, reopened_with_audit).
- 9-decision enum (no_decision_yet, no_change, copy_correction, source_url_update, eligibility_caveat_update, delist_or_hide, needs_institution_confirmation_later, marked_spam, rejected_forbidden_field).
- Immutability rules explicit: no silent overwrites, no deletion without audit event, no public data update without validator pass, no caveat removal without reviewer reason.
- Forbidden-field rejection events are recorded with `changed_fields={}` — the forbidden field's value is **never logged anywhere**.

## 7. Privacy / retention summary

- **Minimum-necessary collection** doctrine — no sensitive documents accepted, ever.
- **30+ forbidden field names** server-rejected silently with HTTP 400 (no leakage of which forbidden field tripped).
- **IP storage:** sha256-truncated hash with per-deploy salt; 24-hour cache lifetime; never raw.
- **Retention placeholders:** confirmed spam = 0 days (silently rejected, no write); P4 borderline = 14 days; actionable open = 365 days; CLOSED = 180 days from `decision_at`; user deletion request honored within 30 days subject to legal hold.
- **No upload acceptance** until a separate security review signs off on filetype allow-list, scan, retention, public-link revocation, default `noindex`.
- All retention numbers are placeholders **to be ratified by counsel** before any implementation.

## 8. Reviewer / auth model summary

- 6 roles (`viewer`, `curator`, `source_reviewer`, `senior_reviewer`, `qa_reviewer`, `admin`) with explicit read/write permission matrix.
- **Dual sign-off** required for: eligibility/visa changes, delist/hide, validator overrides, active-runtime changes.
- **No self-approval** for high-risk transitions: validator enforces `actor_id_or_placeholder` differs between `decision_made` and the immediately following `qa_review_completed` (or `validator_run` for admin co-sign).
- Authentication mechanism deferred (this sprint is mechanism-agnostic). Whatever path is chosen, MFA mandatory, sessions ≤8h, audit logs by internal ID only (never raw email or OAuth subject).

## 9. Blocker resolution matrix

| Blocker | Resolution sprint | Still blocks runtime activation? |
|---------|-------------------|-----------------------------------|
| B-001 (`/contact` ignores listing_id/ref) | `P99-P97-CONTACT-REF-PREFILL-AND-HIDDEN-CONTEXT-1` | YES until implemented |
| B-002 (form has no submit handler) | `P99-P97-CORRECTION-INTAKE-FILE-QUEUE-IMPLEMENTATION-1` | YES until implemented |
| B-003 (listing_id missing from form payload) | `P99-P97-CONTACT-REF-PREFILL-AND-HIDDEN-CONTEXT-1` | YES until implemented |
| B-004 (no intake backend endpoint) | `P99-P97-CORRECTION-INTAKE-FILE-QUEUE-IMPLEMENTATION-1` | NO for DRAFT gate; YES for runtime activation |
| B-005 (active 5 evidence on T7 lane only) | `P99-P97-T7-EVIDENCE-MIGRATION-OR-RECONCILIATION-1` | NO (cosmetic data-locality cleanup) |

## 10. Future implementation sequence

1. `P99-P97-CORRECTION-INTAKE-FILE-QUEUE-IMPLEMENTATION-1` — backend intake + redaction + rate-limit + queue-write (env-flag gated).
2. `P99-P97-CONTACT-REF-PREFILL-AND-HIDDEN-CONTEXT-1` — `/contact` reads `searchParams`, echoes listing, submits real payload.
3. `P99-P97-CORRECTION-QUEUE-VALIDATOR-1` — author the 3 future validators (intake-payload / queue-item / audit-log).
4. `P99-P97-CORRECTION-REVIEW-CLI-1` — reviewer CLI with `--dry-run` default + dual-signoff enforcement.
5. (later) `P99-P97-CORRECTION-ADMIN-BACKSITE-INTERFACE-1` — auth-gated back-site UI; out of scope until 1–4 land.

## 11. What this sprint did NOT do

- Did NOT modify `/contact/page.tsx`.
- Did NOT modify `/clerkships/pilot/*`.
- Did NOT modify `src/lib/usce-pilot-data.ts`.
- Did NOT modify any active runtime data file (`src/data/usce/public-listings-pilot.generated.{json,ts}` UNCHANGED).
- Did NOT modify any staged runtime data file (`src/data/usce/public-listings-pilot-staged-batch-2.generated.{json,ts}` UNCHANGED).
- Did NOT add or modify any validator script (this sprint specifies validators; it does NOT author them).
- Did NOT add a new route, endpoint, server action, or UI surface.
- Did NOT add a database table or migration.
- Did NOT add an environment variable.
- Did NOT add a third-party SaaS dependency.
- Did NOT mark any row PUBLIC_NOW or IMPORT_READY.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT submit any form, login, contact request, or payment.
- Did NOT broaden audience eligibility.
- Did NOT remove any caveat.
- Did NOT mutate the bridge DRAFT.
- Did NOT mutate the T7 queue file.
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 12. Recommended next step

Two options, depending on the user's continuation preference:

1. **`P99-P97-CORRECTION-INTAKE-FILE-QUEUE-IMPLEMENTATION-1`** — start implementing Sprint 1 of the plan (server-side intake endpoint + file queue writer; env-flag gated; no UI). This is the most direct path forward and aligned with the user's "backsite-trust-first" doctrine.

2. **`P99-P97-CORRECTION-QUEUE-VALIDATOR-SPEC-3`** — if the user wants to stay docs-only one more sprint, deepen the queue-validator spec into pseudo-code-level detail (still no implementation). Useful if the user wants to keep gathering review/sign-off before committing to TS implementation.

**Recommended:** Option 1. The current spec set is implementation-ready, and further docs-only iteration would be diminishing returns. Option 1 is also non-public (env-flag gated) and reversible.

## 13. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `--prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / prisma / seed | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED |
| No runtime activation | CONFIRMED |
| No active runtime change | CONFIRMED |
| No staged runtime change | CONFIRMED |
| No `src/lib/usce-pilot-data.ts` change | CONFIRMED |
| No `/clerkships/pilot/*` change | CONFIRMED |
| No `/contact/*` UI change | CONFIRMED |
| No new route / endpoint / env-flag / server action | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No existing validator weakened | CONFIRMED — only specifies future validators |
| No caveat removed | CONFIRMED |
| No audience broadened | CONFIRMED |
| No visa overclaim | CONFIRMED |
| No site-specific guarantee added | CONFIRMED |
| No fake source / fake evidence / fake PNG | CONFIRMED |
| No login / CAPTCHA / credentialed scraping | CONFIRMED |
| No sensitive document collection authorized | CONFIRMED — explicit forbidden_fields list + future-security-review gating |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force push | CONFIRMED |
