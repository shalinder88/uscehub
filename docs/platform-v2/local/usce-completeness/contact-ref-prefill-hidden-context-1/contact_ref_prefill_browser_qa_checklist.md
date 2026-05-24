# Contact Ref-Prefill — Browser QA Checklist

**Scope:** local-preview verification of `/contact` after this sprint. No
deploy. The correction endpoint is disabled by default (`USCE_CORRECTION_INTAKE_ENABLED`
env flag), so live submission paths return 404 unless the flag is set.

## How to run preview

```sh
cd /Users/shelly/usmle-platform
npm run dev   # or your local dev command
# open http://localhost:3000/contact
```

## Test cases

| # | URL | Expected |
|---|-----|----------|
| 1 | `/contact` | Generic form. No "Reporting an issue for…" banner. Subject dropdown shows General/Listing/Account/Report/Partnership/Other. |
| 2 | `/contact?listing_id=pilot-013-FL-jackson-memorial-hospital&ref=pilot-listing` | Banner: "Reporting an issue for: Jackson Memorial Hospital, Miami, FL" + "Reference: pilot-listing". Issue-type dropdown replaces Subject. Form has hidden inputs `listing_id` / `report_ref` / `runtime_set=staged` / `evidence_join_key` / `honeypot_field`. |
| 3 | `/contact?listing_id=pilot-014-NC-duke-university-hospital&ref=pilot-listing` | Banner: "Duke University Hospital, Durham, NC". |
| 4 | `/contact?listing_id=pilot-019-IN-iu-health-methodist-hospital&ref=pilot-listing` | Banner: "Indiana University Health Methodist Hospital, Indianapolis, IN". |
| 5 | `/contact?listing_id=pilot-001-NJ-morristown-medical-center&ref=pilot-listing` | Banner: "Morristown Medical Center, Morristown, NJ", `runtime_set=active`. |
| 6 | `/contact?listing_id=pilot-999-ZZ-fake-hospital&ref=pilot-listing` | Generic form (fall back). NO banner. NO crash. |
| 7 | `/contact?listing_id=%3Cscript%3Ealert(1)%3C%2Fscript%3E&ref=pilot-listing` | Generic form. Page source MUST NOT contain `<script>alert(1)</script>`. NO crash. |
| 8 | `/contact?listing_id=pilot-013-FL-jackson-memorial-hospital&ref=pilot-listing&page_path=/clerkships/pilot` | Banner shows. Hidden field `page_path` value is `/clerkships/pilot`. |
| 9 | `/contact?listing_id=pilot-013-FL-jackson-memorial-hospital&ref=pilot-listing&page_path=%3Cscript%3E` | Banner shows. NO `page_path` hidden field rendered (sanitized away). |
| 10 | `/contact?ref=pilot-feedback` | Generic form (footer-feedback mode). Reference line not shown. |
| 11 | Submit a report on test-case 2 with body length ≥ 5 chars | With endpoint disabled (default): "Thanks — we could not submit this report right now. Please try again later." With endpoint enabled (`USCE_CORRECTION_INTAKE_ENABLED=true`): "Thanks — your report was received." A queue file lands at `docs/platform-v2/local/usce-corrections/inbox/YYYY/MM/<correction_id>.json`. |
| 12 | Mobile viewport (375×812) | Banner wraps cleanly; form fields stack; no overflow. |
| 13 | DevTools console while on test-case 2 | NO React hydration mismatch warnings. NO uncaught errors. |

## Hard rules during QA

- Do NOT run the dev server with `USCE_CORRECTION_INTAKE_ENABLED=true` against production data.
- Do NOT capture screenshots that include real personal info if you fill the form by hand.
- Do NOT push any commit that adds an upload field.
- Do NOT add IP capture, cookies, or analytics in this sprint.

## What's not in scope for this QA

- E2E submission against the production API.
- Dark-mode pixel-perfection (the page already inherits theme variables).
- The five active-route /clerkships/pilot cards (untouched in this sprint).
