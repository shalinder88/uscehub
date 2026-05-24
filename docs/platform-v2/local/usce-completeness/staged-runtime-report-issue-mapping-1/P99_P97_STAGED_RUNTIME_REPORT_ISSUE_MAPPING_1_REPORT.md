# P99-P97 Staged Runtime Report-Issue Mapping — Sprint Report

**Date:** 2026-05-09
**Sprint ID:** `P99-P97-STAGED-RUNTIME-REPORT-ISSUE-MAPPING-1`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `9bc960d P99: generate staged batch two runtime data`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Document the report-issue / correction-workflow mapping for the staged 7-card USCE runtime (5 active + 2 staged: `pilot-011` UPMC, `pilot-012` Lincoln). **No UI. No route. No production. No runtime activation. No active runtime change.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Rows mapped | 7 (5 active + 2 staged) + 1 generic feedback row |
| Report refs validated | YES — listing_id-bearing URL pattern verified for all 7 |
| Evidence joins created | YES — per-row source/archive/screenshot/snapshot/quote join CSV |
| Future intake payload schema | YES — `usce_listing_correction_intake_v1` (docs-only) |
| Correction queue spec | YES — 10-stage workflow + audit log fields + privacy exclusions |
| Mapping validator | **AUTHORED** — `scripts/validate-p99-report-issue-mapping.ts`; PASSED with 1 advisory warning |
| Active runtime touched | **NO** ✅ |
| Pilot route touched | **NO** ✅ |
| Contact UI touched | **NO** ✅ |
| Production deploy | NOT TRIGGERED ✅ |

## 2. Existing contact/report flow audit

### Current state
- `/clerkships/pilot/PilotClerkshipListings.tsx` line 132: per-card report link points to `/contact?ref=pilot-listing&listing_id=${encodeURIComponent(c.listing_id)}`.
- `/clerkships/pilot/PilotClerkshipListings.tsx` line 147: footer feedback link points to `/contact?ref=pilot-feedback`.
- `/contact/page.tsx`:
  - Does **NOT** read `searchParams` for `ref` or `listing_id`.
  - Form fields collected: `firstName`, `lastName`, `email`, `subject`, `message`.
  - Send Message button is `type="button"` with **no `onClick` or `onSubmit` handler**. The form is decorative.
  - No `/api/contact` route handler or server action exists in the repo.
- `scripts/validate-usce-report-intake.ts` exists but validates the **Maine** route's local-report-intake feature (a separate, more mature path) — NOT the Pilot route's contact link path.

### Gaps (becoming blockers for runtime activation)
- **B-001 HIGH:** Contact page ignores listing_id and ref params.
- **B-002 HIGH:** Contact form has no submit handler.
- **B-003 MEDIUM:** Even if wired up, the current form payload omits listing_id and ref.
- **B-004 LOW:** No intake backend endpoint exists.
- **B-005 LOW:** Active 5 evidence files live on T7 lane (pre-existing).

Detail in `staged_runtime_report_issue_mapping_1_blockers.csv`. **No UI changes were made in this sprint** — these are deferred to a future contact-page sprint.

## 3. Active 5 mapping result

All 5 active listing IDs:
- `pilot-001-NJ-morristown-medical-center`
- `pilot-002-NJ-overlook-medical-center`
- `pilot-003-OH-cleveland-clinic-mercy-hospital`
- `pilot-004-OH-cleveland-clinic-hillcrest-hospital`
- `pilot-007-CA-highland-hospital-alameda-health-system`

For each:
- Report ref reserved: `/contact?ref=pilot-listing&listing_id=<listing_id>` (URL-safe, listing-specific, deterministic).
- Evidence join: pointer to T7 lane curator queue (Mac-local does not carry the active 5 evidence files; B-005).
- Correction queue join key: `listing_id` (1:1).
- Status: `APPROVED_AND_ACTIVE` — no immediate review action needed for active 5; corrections, when received, would flow through stages 2–10 of the queue spec.

## 4. UPMC + Lincoln mapping result

`pilot-011-PA-upmc-western-psychiatric-hospital` (UPMC Western Psychiatric):
- Report ref reserved: `/contact?ref=pilot-listing&listing_id=pilot-011-PA-upmc-western-psychiatric-hospital`
- Evidence join: 3 source pages (parent + domestic + international) with Tier-A+ evidence (URL + Wayback + HTML snapshot + PNG + verbatim quote).
- Correction queue: ready for Stage 2 join.
- Status: `STAGED_NOT_PUBLIC` — no public route currently exposes this row, so reports cannot yet be filed against it from a real user UI.

`pilot-012-NY-nyc-health-hospitals-lincoln` (Lincoln Medical):
- Report ref reserved: `/contact?ref=pilot-listing&listing_id=pilot-012-NY-nyc-health-hospitals-lincoln`
- Evidence join: 2 sources (MOSAIC system-level + Lincoln EM site-specific) with Tier-A+ evidence.
- Correction queue: ready for Stage 2 join.
- Status: `STAGED_NOT_PUBLIC`.

Both staged rows have correction-readiness parity with the active 5 at the data layer.

## 5. Future intake payload schema

File: `staged_runtime_report_issue_mapping_1_future_intake_payload_schema.json`

- Schema name: `usce_listing_correction_intake_v1`
- Status: `DOCS_ONLY_SPEC_NOT_IMPLEMENTED`
- Required fields (6): `listing_id, ref, issue_type, user_message, page_url, submitted_at`
- Optional fields (10): includes `source_url, user_email, suggested_correction, screenshot_url, evidence_url, *_context`
- Allowed `issue_type` values: 8 canonical types (source_link_broken, eligibility_incorrect, visa_information_incorrect, cost_or_fee_incorrect, application_process_incorrect, program_closed, duplicate_listing, other)
- Privacy notes: 10 explicit prohibitions (no passport / visa / immigration / medical / SSN / bank / ECFMG / USMLE / NRMP / AAMC / ACGME / patient identifiers / DOB)
- Forbidden in payload: 13 explicit field names that the future intake endpoint must reject
- Rate-limit + transport-security + retention spec placeholders included

The schema explicitly does NOT include any DB migration, server endpoint, or UI change.

## 6. Correction queue spec

File: `staged_runtime_report_issue_mapping_1_correction_queue_spec.md`

10-stage workflow:
1. Intake received
2. Listing ID resolved
3. Evidence pack loaded
4. Issue classified (4 priority levels P0–P4)
5. Source re-check performed
6. Correction decision (6 outcomes: NO_CHANGE / COPY_CORRECTION / SOURCE_URL_UPDATE / ELIGIBILITY_CAVEAT_UPDATE / DELIST_OR_HIDE / NEEDS_INSTITUTION_CONFIRMATION_LATER)
7. Reviewer records evidence (append-only audit log with 14 fields)
8. Validator runs (bridge / staged / micro-pilot / correction-aware)
9. Runtime data update staged (NOT live)
10. Public copy updated only after curator + QA dual sign-off

Reviewer roles: Curator / QA reviewer / Engineering / Product owner.

What this spec does NOT do: implement any code, modify any UI, activate staged runtime, change production.

## 7. Validator result

File: `scripts/validate-p99-report-issue-mapping.ts` (AUTHORED in this sprint).

Run command:
```
npx tsx scripts/validate-p99-report-issue-mapping.ts docs/platform-v2/local/usce-completeness/staged-runtime-report-issue-mapping-1/staged_runtime_report_issue_mapping_1_listing_map.csv
```

Result: **PASSED** with 1 advisory warning.

Hard-fail rules covered:
- Listing-map CSV exists and parses
- All 5 active listing IDs present
- All 2 staged listing IDs present (UPMC + Lincoln)
- Each report URL contains either `?ref=pilot-listing&listing_id=…` or `?ref=pilot-feedback`
- No report URL leaks internal screenshot / sprint-folder paths
- No banned word ("apply through USCEHub", "USCEHub-approved", "verified by hospital", "hospital-approved") in any field
- Future intake schema has all 6 required fields
- Schema's privacy_notes mention all 5 prohibitions (passport, visa, immigration, medical, SSN)
- Schema is flagged `not_active_runtime: true`
- Evidence join map exists and shares the same listing_id set
- Correction queue spec exists

Advisory warning:
- `CONTACT_PAGE_DOES_NOT_PARSE_LISTING_ID_TODAY` — explicit acknowledgment that the audited contact-page gap (B-001) is documented but not fixed in this sprint.

## 8. What this sprint did NOT do

- Did NOT modify any app code (`src/app/contact/*`, `src/app/clerkships/pilot/*`, `src/lib/usce-pilot-data.ts`, `src/data/usce/*` all UNCHANGED).
- Did NOT generate runtime data files.
- Did NOT activate staged runtime data.
- Did NOT add a new route, endpoint, server action, or UI surface.
- Did NOT modify the existing report-intake validator.
- Did NOT mark any row PUBLIC_NOW or IMPORT_READY.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT submit any form, login, contact request, or payment.
- Did NOT broaden audience eligibility.
- Did NOT remove any caveat.
- Did NOT mutate the bridge DRAFT.
- Did NOT mutate the T7 queue file.
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 9. Recommended next step

Two paths, depending on priority:

1. **`P99-P97-CORRECTION-INTAKE-BACKSITE-SPEC-2`** — turn the v1 schema + queue spec into a deeper backsite implementation spec (still docs-only / pre-code), defining the file-based intake queue, retention policy details, reviewer auth model, and CSV/JSON format for the audit log. This is the most aligned with the "backsite-trust-first" doctrine.

2. **`P99-P97-STAGED-RUNTIME-ACTIVATION-READINESS-AUDIT-1`** — survey what would be required to convert the staged runtime into an active candidate later (still no UI exposure), accounting for the B-001/B-002/B-003 contact-page blockers identified in this sprint as hard prerequisites.

Recommended choice: **Option 1.** The contact-page UI work (B-001/B-002/B-003) is not yet authorized, and per the user's standing doctrine ("backsite/data/trust foundation first; UI later"), staying on the spec/data path is the safer continuation.

## 10. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `--prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / prisma / seed | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED |
| No runtime activation | CONFIRMED |
| No active runtime replacement | CONFIRMED |
| No `src/data/usce/public-listings-pilot.generated.{json,ts}` change | CONFIRMED |
| No `src/data/usce/public-listings-pilot-staged-batch-2.generated.{json,ts}` change | CONFIRMED |
| No `src/lib/usce-pilot-data.ts` change | CONFIRMED |
| No `/clerkships/pilot/*` change | CONFIRMED |
| No `/contact/*` UI change | CONFIRMED |
| No new route / env-flag / alternate public exposure | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No existing validator weakened | CONFIRMED — only AUTHORED a new strict validator |
| No caveat removed | CONFIRMED |
| No audience broadened | CONFIRMED |
| No visa overclaim | CONFIRMED |
| No site-specific guarantee added | CONFIRMED |
| No fake source / fake evidence / fake PNG | CONFIRMED |
| No login / CAPTCHA / credentialed scraping | CONFIRMED |
| No contact-form submission test in production | CONFIRMED — read-only audit only |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force push | CONFIRMED |
