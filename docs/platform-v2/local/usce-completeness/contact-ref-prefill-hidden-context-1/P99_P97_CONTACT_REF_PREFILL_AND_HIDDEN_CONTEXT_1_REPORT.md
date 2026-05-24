# P99-P97 Contact Ref-Prefill & Hidden Context — Sprint Report

**Sprint ID:** `P99-P97-CONTACT-REF-PREFILL-AND-HIDDEN-CONTEXT-1`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `638b0251efe51cb1ac2e81e11578a3b1eacc5e4f`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Surgical `/contact` change to read reserved query parameters (`listing_id`, `ref`, etc.), render a non-sensitive listing-context banner, attach hidden form fields, and submit safely against the existing disabled-by-default `/api/usce/corrections` endpoint.

---

## 1. Executive result

| Metric | Value |
|--------|-------|
| `/contact` parses `listing_id` / `ref` | **YES** (server-resolved before render) |
| Visible listing-context banner | **YES** (institution + city/state + reference line) |
| Hidden form fields | **5** (`listing_id`, `report_ref`, `runtime_set`, `evidence_join_key`, `honeypot_field`; optional `page_path`) |
| Submit handler wired to `/api/usce/corrections` | **YES** |
| Endpoint default disabled-by-default behavior | **UNCHANGED** — POST returns 404 unless `USCE_CORRECTION_INTAKE_ENABLED=true` |
| Active runtime card count | **5 — UNCHANGED** |
| Staged batch 3 card count | **14 — UNCHANGED** |
| Production public card count | **0 — UNCHANGED** |
| Validators run | All PASS (24 distinct checks across 11 validators + 9 preview tests) |
| `validate-no-secrets.ts` | 0 findings |
| Browser preview console errors / warnings | **0** |
| New validator | `scripts/validate-p99-contact-ref-prefill.ts` (in-process tests) |

## 2. Why this sprint matters

The previous sprint (`P99-P97-STAGED-RUNTIME-BATCH-3-REPORT-ISSUE-MAPPING`) reserved deterministic report URLs for all 14 staged cards, but `/contact` ignored the query parameters — meaning a user clicking a "Report an issue" link would lose every shred of card and evidence context. **That was the single hard activation blocker for any noindex pilot activation.** This sprint closes it for all 14 cards uniformly. It is not UI redesign; it is the minimum work that makes a future activation ethically defensible.

## 3. Implementation summary

| File | Status | Purpose |
|------|--------|---------|
| `src/lib/usce-contact-context.ts` | NEW | Client/server-safe resolver. Hardcodes `KNOWN_LISTINGS` (14 entries: 5 active + 2 prior staged + 7 batch-3 new). Each entry holds only `listingId / institutionName / city / state / runtimeSet` — public-safe summary, NOT the runtime card data and NOT any evidence path. Sanitizes 5 reserved query params (`listing_id`, `ref`, `runtime_source`, `evidence_join_key`, `page_path`); silently drops everything else. Returns a discriminated context object; never throws. |
| `src/app/contact/page.tsx` | UPDATED | Now an async server component. Reads `searchParams`, calls `resolveContactContext`, passes resolved context to a new client form. Static contact info column unchanged. |
| `src/app/contact/ContactReportForm.tsx` | NEW | `"use client"` form. Renders a banner + hidden inputs when context is valid. Replaces "Subject" dropdown with "Issue type" enum aligned to `ALLOWED_ISSUE_TYPES`. Submit handler POSTs to `/api/usce/corrections`; on any non-2xx response shows polite generic error; never echoes endpoint detail. |
| `scripts/validate-p99-contact-ref-prefill.ts` | NEW | Deterministic local validator. Imports the resolver and runs 15+ in-process test cases (active / staged / batch-3 / unknown / oversized / injection / `pilot-feedback` / no-params / `page_path` injection / page_path no-leading-slash / visible-context-no-leak / KNOWN_LISTINGS sanity / forbidden-token-in-output) plus grep-based import-safety checks (`/clerkships/pilot` and `/contact` must not import the staged batch-3 module). |

## 4. Context resolver behavior

| Status | Trigger | Effect |
|--------|---------|--------|
| `VALID_LISTING_CONTEXT` | `listing_id` matches `LISTING_ID_REGEX` AND is in `KNOWN_LISTINGS` | Banner + hidden inputs rendered. `runtimeSet` is **always derived from KNOWN_LISTINGS**, never from a URL-supplied `runtime_source` (defense in depth). |
| `GENERIC_FEEDBACK_NO_LISTING` | No params, OR only `ref=pilot-feedback` | No banner. Generic Subject dropdown. No hidden listing fields. |
| `INVALID_PARAMS_FALLBACK_GENERIC` | `listing_id` malformed or unknown, OR injection/oversized inputs | No banner. No hidden listing fields. Optional `warnings` set (`UNKNOWN_LISTING_ID_IGNORED` / `UNKNOWN_REF_DEFAULTED_TO_PILOT_LISTING` / etc.). NEVER throws. |

The resolver runs server-side for the page render and is also imported by the test validator. The client component receives only the structured result.

## 5. Payload contract

Client submit payload (for `VALID_LISTING_CONTEXT` only):

```
{
  "schema_version": "v2",
  "listing_id":   <resolved>,
  "report_ref":   <resolved>,
  "runtime_set":  <resolved from KNOWN_LISTINGS>,
  "page_url":     window.location.href,
  "issue_type":   <user-selected enum>,
  "user_message": <user-typed body>,
  "submitted_at": <client now ISO-Z>,
  "source_context": {},
  "institution_name_displayed": <resolved>,
  "client_timestamp": <client now ISO-Z>,
  "honeypot_field": ""
}
```

Notably **NOT** sent (kept as DOM hidden fields only, future expansion):
- `evidence_join_key` — not in `ALLOWED_PAYLOAD_KEYS` at the endpoint, so sending it would be rejected. Captured in DOM but stripped from payload until endpoint allow-list expands.
- `page_path` — same reason.

Detail in `contact_ref_prefill_payload_contract.csv`.

## 6. Privacy / safety audit

All 21 audited risks PASS. Highlights:
- **No upload field of any kind** in the form — validator-enforced.
- **No SSN / passport / visa-doc / MRN / payment-card input fields** — endpoint denylist provides defense-in-depth.
- **Endpoint and client error messages are opaque** — never echo which validator rule tripped.
- **Visible context excludes evidence paths** — validator deep-scans `displayInstitutionName` / `displayCityState` for path-looking strings.
- **Resolver only reads 5 reserved keys** — every other URL param (including any forbidden field name) is silently dropped before it can reach the form.
- **`runtime_set` cannot be controlled from the URL** — even if a user passes `runtime_source=active`, the canonical value comes from KNOWN_LISTINGS.

Detail in `contact_ref_prefill_privacy_audit.csv`.

## 7. Validator results

All 11 validators PASS. The new `validate-p99-contact-ref-prefill.ts` covers 15 in-process test cases and 4 grep-based import-safety checks. The 9 browser preview tests below all passed during the local QA run.

```
validate-no-secrets:                               PASS  (1148 files / 0 findings)
tsc --noEmit:                                       PASS
validate-p99-contact-ref-prefill (NEW):             PASS  (15 in-process tests + 4 grep checks)
validate-micro-pilot-runtime:                       PASS  (5 active)
validate-p99-staged-runtime-batch-2:                PASS  (data-only)
validate-p99-staged-runtime-batch-3:                PASS  (14 / data-only)
validate-p99-staged-runtime-batch-3-report-mapping: PASS  (7 / consistent)
validate-p99-report-issue-mapping (mapping-1):      PASS  (1 carry-forward warning)
validate-p99-correction-intake-payload:             PASS  (8 samples)
validate-p99-correction-queue-item:                 PASS  (4)
validate-p99-correction-audit-log:                  PASS  (4)
```

GitHub open alerts: NOT_VERIFIED_THIS_TURN (gh CLI logged out from the prior P0 token-rotation cleanup). Last verified state = 0 open / alert #1 resolved as `wont_fix`.

## 8. Browser QA — preview results

All 9 cases passed against `npm run dev` at `http://localhost:3000`. Detail in `contact_ref_prefill_browser_qa_checklist.md` and `contact_ref_prefill_validation_results.csv`.

| Case | Result |
|------|--------|
| `/contact` (no params) | Generic form. No banner. Subject dropdown. Status 200. |
| `/contact?listing_id=pilot-013-FL-jackson-memorial-hospital&ref=pilot-listing` | Banner: "Reporting an issue for: Jackson Memorial Hospital, Miami, FL"; "Reference: pilot-listing"; all 5 hidden inputs rendered; no banned phrase. |
| `/contact?listing_id=pilot-014-NC-duke-university-hospital&ref=pilot-listing` | Banner: "Duke University Hospital, Durham, NC". |
| `/contact?listing_id=pilot-019-IN-iu-health-methodist-hospital&ref=pilot-listing` | Banner: "Indiana University Health Methodist Hospital, Indianapolis, IN". |
| `/contact?listing_id=pilot-999-ZZ-fake-hospital&ref=pilot-listing` | Generic form fallback. No banner. No hidden listing fields. |
| `/contact?listing_id=<script>alert(1)</script>&ref=pilot-listing` | Generic form fallback. No injection rendered as executable HTML. |
| `/contact?listing_id=pilot-013-…&page_path=/foo<script>alert(1)` | Banner renders. `page_path` hidden input is **not** rendered (sanitizer stripped it). |
| `/contact?listing_id=pilot-013-…<oversized 500-char tail>&ref=pilot-listing` | Generic form fallback. Oversized rejected by MAX_LISTING_ID_LEN. |
| `/contact?ref=pilot-feedback` | Generic form mode. |
| Submit on disabled endpoint (POST → 404) | Client shows "Thanks — we could not submit this report right now. Please try again later." Endpoint behavior unchanged. |
| Browser console | **0 errors, 0 warnings.** |

## 9. Activation blocker delta

| Blocker | Before | After |
|---------|--------|-------|
| `/contact` parses `listing_id` / `ref` | NO | **YES** |
| Visible listing-context banner | NO | **YES** |
| Hidden context fields (5 incl. honeypot) | NO | **YES** |
| Submit handler with polite-generic error path | NO | **YES** |
| Endpoint default disabled-by-default behavior | YES | **YES** (unchanged) |
| Active runtime / staged / production-public counts | 5 / 14 / 0 | 5 / 14 / 0 |
| Remaining: endpoint env enable in preview/prod | YES | YES (deferred to a separate sprint after rate-limit + larger QA) |
| Remaining: promotion-candidate audit | YES | YES (next sprint) |

Detail in `contact_ref_prefill_activation_blocker_delta.csv`.

## 10. What this sprint did NOT do

- No active runtime mutation. No staged data mutation. No batch-3 import.
- No `/clerkships/pilot` route change.
- No homepage / nav / sitemap exposure.
- No production deploy. No `vercel --prod`. No PR. No merge to main.
- No DB / schema / Prisma / seed / cron.
- **No correction endpoint env-flag flip.** `USCE_CORRECTION_INTAKE_ENABLED` remains false-by-default.
- **No upload field added.** No file picker.
- **No email sending.** No SMTP wiring.
- No IP capture, no new cookies, no new analytics.
- No UI redesign.
- No new listing generation.
- No public copy expansion.
- No PUBLIC_NOW / IMPORT_READY token.

## 11. Recommended next sprint

**`P99-P97-STAGED-RUNTIME-BATCH-3-PROMOTION-CANDIDATE-AUDIT`.**

Pick 1–3 of the 14 staged cards that are safest for first noindex activation. Likely candidates:
- **pilot-014 Duke** — site-level Duke SOM visiting-students office; VSLO-required pathway; least system-level ambiguity.
- **pilot-016 HUP** or **pilot-015 Northwestern Memorial** — both have system-level Perelman/Feinberg SOM sources; defensible with the existing system-level caveat in `campus_name`.

Avoid first-activating Methodist San Antonio (`pilot-018`) — its source is rated `PARTIAL_AUDIENCE_PARTIAL_APPLICATION` and would benefit from a per-site source landed first.

The audit sprint produces a runtime-prep candidate package (still data-only, still local-only, still no production), not an activation. Activation itself would be a separate later sprint with explicit user authorization at each step.

## 12. Strategic checkpoint

> Are we moving toward big product?

Yes. The chain is now: `347 screened → 9 validated → 14 staged + mapped → /contact wired for all 14`. The only remaining gates are (a) final activation candidate selection and (b) explicit user authorization to flip the endpoint env-flag and active runtime.

> Did this reduce the 347 → 5 bottleneck?

Indirectly. The mapping/UI gate is no longer a no-op. Active runtime is unchanged today, but the path from "validated" to "noindex active" is now unblocked at the UI layer.

> Are we drifting?

No. This sprint touched 3 source files, added 1 client component, added 1 validator, and produced 7 docs in one named folder. No app code outside `/contact` was changed.

> What must stop?

Continued mapping or pre-activation infrastructure work past this point. The next sprint must be the candidate audit, then a separate activation decision.

> What must continue?

The "validate, stage, audit, then activate" discipline. We have validated → staged → mapped → wired. The next step is the audit, not yet activation.

## 13. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY token | CONFIRMED |
| No active runtime change | CONFIRMED |
| No staged batch 2 / batch 3 data change | CONFIRMED |
| No `/clerkships/pilot/*` change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No file upload / no email send | CONFIRMED |
| No IP capture / no new cookies / no new analytics | CONFIRMED |
| No UI redesign | CONFIRMED — banner is a single small slate-50 box; no theme change |
| No banned phrase | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No tokens / secrets printed | CONFIRMED |
| No weakening of existing validators | CONFIRMED — added new validator only |
| Browser preview verification run | CONFIRMED — 9 cases + console-errors check |
