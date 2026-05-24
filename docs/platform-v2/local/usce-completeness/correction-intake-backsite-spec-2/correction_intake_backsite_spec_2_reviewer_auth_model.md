# Correction Intake — Reviewer Auth Model

**Date:** 2026-05-09
**Sprint:** P99-P97-CORRECTION-INTAKE-BACKSITE-SPEC-2
**Status:** docs-only spec; not implemented; not active

---

## 1. Roles

| Role | Purpose |
|------|---------|
| `viewer` | Read-only read of redacted queue items and audit logs; useful for triage analysts who don't decide outcomes |
| `curator` | Owns triage, classification, source recheck, copy corrections, and most non-high-risk decisions |
| `source_reviewer` | Specialist who re-fetches sources and captures fresh evidence (HTML / Wayback / PNG); subset of curator |
| `senior_reviewer` | Required co-signer for high-risk decisions (delist/hide, eligibility/visa changes, mass-affecting reports) |
| `qa_reviewer` | Banned-phrase / audience-safety / forbidden-token sign-off before any active runtime change |
| `admin` | Retention enforcement, reviewer assignment, role grants |

`viewer` is a strict subset of `curator`'s read scope. `source_reviewer` is a curator who has had source-fetch tooling enabled. Each higher role inherits the previous role's read scope but does NOT inherit its write scope without an explicit grant.

## 2. Permission matrix (write side)

| Permission | viewer | curator | source_reviewer | senior_reviewer | qa_reviewer | admin |
|------------|:-----:|:------:|:--------------:|:--------------:|:----------:|:----:|
| view corrections (redacted) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| view corrections (full incl. user_email) | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| triage / change priority | – | ✓ | ✓ | ✓ | – | ✓ |
| edit draft correction (in `STAGED_CORRECTION` only) | – | ✓ | ✓ | ✓ | – | ✓ |
| approve copy correction | – | ✓ | ✓ | ✓ | – | ✓ |
| approve source URL update | – | ✓ | ✓ | ✓ | – | ✓ |
| approve eligibility / visa caveat update | – | ✓ + `senior_reviewer` co-sign | ✓ + `senior_reviewer` co-sign | ✓ co-sign | – | ✓ |
| mark NO_CHANGE | – | ✓ | ✓ | ✓ | – | ✓ |
| recommend delist / hide | – | ✓ | ✓ | ✓ | – | ✓ |
| **decide** delist / hide | – | – | – | ✓ | – | ✓ |
| override validator warning | – | – | – | ✓ + `admin` co-sign | – | ✓ + `senior_reviewer` co-sign |
| QA sign-off (banned-phrase / audience safety) | – | – | – | – | ✓ | ✓ |
| close correction | – | ✓ | ✓ | ✓ | ✓ (after QA) | ✓ |
| reopen closed correction | – | ✓ + audit_event | – | ✓ + audit_event | – | ✓ + audit_event |
| change retention | – | – | – | – | – | ✓ |
| grant role | – | – | – | – | – | ✓ |

## 3. Dual sign-off rules

- **Eligibility / visa / application-process changes (P1):** require curator decision + `senior_reviewer` co-sign before staging.
- **Delist / hide:** require `senior_reviewer` decision; admin notified.
- **Validator override:** requires `senior_reviewer` action + `admin` co-sign; both audit_event entries must reference the failing validator name.
- **Active runtime change:** requires `curator` (or higher) staging + `qa_reviewer` sign-off; `admin` notified post-change.

No role may self-approve a change they personally drafted in the same session for any P0 or P1 transition. The transition recorder MUST verify `audit_event[N-1].actor_id != audit_event[N].actor_id` for the dual-signoff transitions above and reject the transition otherwise.

## 4. No self-approval for high-risk changes

For these decisions, `decision_made` and the immediately following `qa_review_completed` (or `validator_run` when admin co-sign) audit events MUST have different `actor_id_or_placeholder`:

- `delist_or_hide`
- `eligibility_caveat_update`
- Any change touching `audience_detail.img_graduate` from `EXCLUDED_EXPLICIT` → anything else
- Any change touching `audience_detail.caribbean_student` from `EXCLUDED_EXPLICIT` → anything else
- Any change adding J-1 or H-1B sponsorship language
- Any change removing a `SYSTEM_PAGE_SOURCE_NO_*_SPECIFIC_GUARANTEE` token

## 5. Audit log requirement

Every state transition writes an audit event per `correction_intake_backsite_spec_2_audit_log_schema.json`. Including:

- Triage assignment.
- Source recheck start / complete.
- Decision made.
- Validator run.
- QA review.
- Close / reopen.

A correction item with status changes that have no corresponding audit_event is **invalid** and the future correction-queue validator must hard-fail.

## 6. Authentication mechanism (deferred)

This sprint does NOT specify the authentication mechanism. The future implementation sprint may choose:

- Local file-based credentials with bcrypt (simplest; OK for solo curator phase)
- SSO via a managed provider (Auth0 / Clerk / GitHub OAuth) — requires its own privacy + retention review
- mTLS + GitHub Actions environment-bound credentials (CLI-only access for early phase)

Whichever path is chosen, the audit log's `actor_id_or_placeholder` must be a stable internal identifier — never a raw email, never a raw OAuth subject claim. A mapping from internal IDs to real reviewers lives in a separate, more restricted file.

## 7. Auth-mechanism-agnostic invariants

Independent of how authentication is implemented:

- All writes require an authenticated session.
- All session establishments require MFA (TOTP / WebAuthn / equivalent).
- Sessions expire ≤8 hours.
- Audit events log only role + internal ID, never session token.
- No reviewer can edit their own past audit events.
- No reviewer can delete past audit events.

## 8. What this model does NOT do

- Does not implement authentication.
- Does not implement authorization checks in any route handler.
- Does not modify any UI.
- Does not modify any active runtime.
- Does not authorize any production change.
