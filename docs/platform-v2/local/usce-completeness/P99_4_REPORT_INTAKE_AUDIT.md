# P99-4 Report Intake Audit
Generated: 2026-05-04

---

## Report issue locations (current)

| Location | Component | State | Behavior |
|----------|-----------|-------|----------|
| Card footer | `ClerkshipCard` | `showReport: boolean` local state | Button toggles inline `ReportIssuePlaceholder` |
| Compare table Report row | `CompareTable` | `openReportId: string \| null` local state | Per-column button toggles inline placeholder |

Both use the same `ReportIssuePlaceholder` component (lines 235–269).

---

## Current placeholder behavior

```typescript
function ReportIssuePlaceholder({ onClose }: { onClose: () => void }) {
  // Disabled radio buttons, no submission
  // Copy: "Pilot placeholder — no submission is sent yet. Verify directly..."
  // Close button
}
```

- All radio inputs are `disabled`
- No state collected
- No localStorage access
- No server call
- Pure visual placeholder

---

## Data available per card (`UsceCard`)

```
listing_id, institution_name, campus_name, state, county,
specialty, opportunity_type, source_page_type, listing_role, display_bucket,
eligible_audiences, excluded_audiences, unknown_audiences,
restriction_tags, fit_warnings, audience_detail,
application_url, official_source_url, source_status, last_reviewed_at
```

No NPI, CCN, CMS, NPPES, AAMC, NRMP, ACGME, NUCC fields.
These are correctly absent from the generated runtime data.

---

## Planned localStorage key

```
uscehub_local_issue_reports_v1
```

Format: `LocalReport[]` — JSON array of report objects.

---

## No-auth / no-DB confirmation

- No user authentication in scope
- No database tables
- No server API calls
- No email sending
- All reports stored in `localStorage` only
- Exports produce local JSON/CSV file downloads
- Status field: `LOCAL_DRAFT` (fixed for all P99-4 reports)

---

## Files to change / create in P99-4

| File | Action |
|------|--------|
| `src/app/clerkships/maine/ClerkshipListings.tsx` | Replace placeholder + add modal, reports hook, panel |
| `scripts/validate-usce-report-intake.ts` | Create (Phase G) |
| `docs/platform-v2/local/usce-completeness/P99_4_REPORT_INTAKE_QA_REPORT.md` | Create (Phase H) |

---

## Report model fields

| Field | Type | Notes |
|-------|------|-------|
| report_id | string | Generated client-side (timestamp + random) |
| listing_id | string | From card |
| institution_name | string | From card |
| specialty | string | From card |
| opportunity_type | string | From card |
| issue_type | IssueType | User selects |
| issue_detail | string | User textarea |
| user_email_optional | string | User input, optional |
| source_url_seen | string | window.location.href at time of report |
| official_source_url | string | From card — read-only in form |
| application_url | string | From card — read-only if present |
| created_at | string | ISO-8601 |
| status | "LOCAL_DRAFT" | Fixed |
| page_context | PageContext | CARD \| COMPARE \| SAVED_VIEW |

No PHI fields. No forbidden identity fields. No medical record data.

---

## Export-only fields (Phase D)

Subset shown on export (strip `source_url_seen`, `status` from exports):
```
report_id, listing_id, institution_name, specialty, opportunity_type,
issue_type, issue_detail, user_email_optional, official_source_url,
application_url, created_at, page_context
```
