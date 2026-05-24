# Correction Intake — Privacy & Retention Policy

**Date:** 2026-05-09
**Sprint:** P99-P97-CORRECTION-INTAKE-BACKSITE-SPEC-2
**Status:** docs-only spec; not implemented; not active
**Sibling artifacts:** `correction_intake_backsite_spec_2_intake_payload_schema.json`, `correction_intake_backsite_spec_2_file_queue_schema.json`, `correction_intake_backsite_spec_2_audit_log_schema.json`

---

## 1. Doctrine

**Minimum necessary collection.** The correction intake collects only what is required to (a) identify the listing being reported, (b) understand the issue, and (c) follow up if the user opted in. No more.

USCEHub serves IMG / Caribbean medical students, who often have heightened sensitivity around immigration and credential documents. **The intake must never become a place where users feel pressured to upload sensitive documents.** That trust is more valuable than any individual correction.

## 2. What MUST NOT be collected

The intake schema's `forbidden_fields` list is normative. The endpoint MUST reject (silently, with HTTP 400 and no leakage of which forbidden field tripped) any payload containing keys matching:

- Passport number / passport document / passport image
- Visa number / visa document / visa image
- I-20 / DS-2019 / immigration documents of any kind
- ECFMG ID / ECFMG document
- USMLE ID / NRMP ID / AAMC ID / ACGME ID
- SSN / Social Security Number / Tax ID / EIN
- Date of birth / DOB
- Medical record / MRN / PHI / Patient identifier
- Hospital credential document / diploma image / transcript image
- CV upload / resume upload
- Photo ID / headshot / driver's license
- Card number / credit card / bank account / IBAN / payment token

If a user attempts to paste sensitive content into the free-text `user_message` field, the **server-side redaction pass** rewrites SSN-shaped, credit-card-shaped, passport-shaped, and full-email-other-than-user_email patterns to `[redacted]` BEFORE the queue item is written. The original is never persisted.

## 3. What MAY be collected (minimum-necessary set)

- `listing_id` — purely structural; not personal.
- `report_ref` — class label.
- `issue_type` — class label.
- `user_message` — free text, length-bounded, redacted.
- `page_url` — listing page only.
- `submitted_at` / `received_at` — timestamps.
- `source_context` — echoed-back card fields (specialty / audience / visa / fee / site-specificity strings the user saw).
- `source_url` — optional user-provided source URL supporting the correction.
- `suggested_correction` — optional free text.
- `user_email` — **optional, opt-in only.** Used solely for follow-up. Never displayed publicly. Never sold. Never used for marketing. Never enriched against any external dataset.
- `browser_user_agent` — optional spam signal, **stored hashed (sha256-truncated, 16 chars), never raw**.
- `client_timestamp` — drift signal.
- `honeypot_field` — hidden bot-trap, must be empty.
- `turnstile_token_or_future_spam_token` — verified server-side and not stored.

## 4. IP handling

The future endpoint inspects request IP for rate-limit purposes only. IP is **never stored as plaintext**:

- Hash: `sha256(ip + per-deploy-secret-salt)[:16]`
- Storage: in a small ephemeral rate-limit cache with **24-hour retention**.
- Never written to the queue item or audit log.
- Never used to identify the user beyond rate-limit enforcement.

## 5. Spam handling

Three layers:

1. **Honeypot field** — hidden form input. If non-empty, request is silently rejected with HTTP 200 and no queue item written. No audit-log entry.
2. **Turnstile (or equivalent) token** — server-verified. Failed verification: silent rejection.
3. **Pattern heuristics** — extreme keyword-density / known link-farm domains in `user_message`. Borderline cases get `priority=P4_SPAM_OR_UNACTIONABLE` and skip immediate triage.

Confirmed spam never enters the inbox. Borderline P4 items get retained briefly per Section 6 then deleted.

## 6. Retention placeholders

These are placeholders to be ratified by counsel before any implementation. Implementation may not deploy without explicit retention sign-off.

| Class | Retention | Rationale |
|-------|-----------|-----------|
| Confirmed spam | 0 days (silently rejected, no write) | No content to retain |
| P4 unactionable / borderline-spam | 14 days then auto-delete | Allows reviewer reclassification window |
| Actionable correction in any non-CLOSED state | 365 days from `received_at` | Working window |
| Actionable correction CLOSED | 180 days from terminal `decision_at` | Audit window |
| Audit log JSONL files | retained alongside queue item; same window | Trail integrity |
| Archived (cold storage) | indefinite, but redacted | Audit-only; no PII beyond hashed IP and optional opted-in user_email |
| User-deletion request | honored within 30 days, subject to legal hold | Standard data-rights handling |

## 7. Access limitations

| Role | What they can read | What they can write |
|------|---------------------|---------------------|
| `viewer` | metadata, redacted message, evidence URLs | (nothing) |
| `curator` | full redacted queue item + audit log | triage decisions, status transitions |
| `source_reviewer` | full + can attach fresh evidence | source-recheck audit entries |
| `senior_reviewer` | full | delist/hide decisions; high-risk override |
| `qa_reviewer` | full | QA sign-off entry only |
| `admin` | full + retention controls | retention enforcement |

`user_email` is shown only to roles that genuinely need follow-up capability. Logging an audit event does NOT include `user_email` in `changed_fields`.

## 8. Future security review requirement

**Before any uploads are ever accepted** (e.g. user-supplied screenshot URL → file upload), a separate security review is mandatory and must cover:

- Storage location and access policy
- Antivirus / malware scan
- Filetype allow-list
- Filesize cap
- Public-link revocation guarantee
- Default `noindex` on any served URL
- Documentation as a separate sprint

**Until that review is signed off, the intake schema's `screenshot_url` field stays advisory only — the v2 endpoint accepts a URL string but does not host uploads.**

## 9. User communication

The future contact UI must, when listing context is present:

- Visibly echo the listing being reported (institution name + listing_id).
- State that the report will not result in an application path through USCEHub.
- State that the user's email is optional and used only for follow-up.
- Link to a public privacy summary (existing `/privacy` page).
- NOT offer document-upload language.
- NOT promise a response time SLA more aggressive than "we read every message."

## 10. What this policy does NOT do

- Does not replace counsel review.
- Does not authorize implementation.
- Does not modify any UI.
- Does not authorize any production deploy.
- Does not authorize any DB or external SaaS dependency.
