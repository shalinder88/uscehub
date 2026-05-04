# P99-5 Release Hardening Audit
Generated: 2026-05-04

---

## Current state

| Item | Value |
|------|-------|
| Branch | `local/p97-discovery-integrity-guardrails` |
| HEAD commit | `6bd323a` — P99-4 local report intake |
| Route | `/clerkships/maine` |
| Page file | `src/app/clerkships/maine/page.tsx` |
| Component | `src/app/clerkships/maine/ClerkshipListings.tsx` (1546 lines) |
| Adapter | `src/lib/usce-maine-data.ts` |
| Runtime data | `src/data/usce/public-listings.generated.json` |
| Public cards | 12 (7 IMG-relevant + 5 US MD/DO only) |
| NEEDS_REVIEW withheld | 5 |

---

## Current feature set

| Feature | Status |
|---------|--------|
| Card listing (12 cards) | P99-1 ✓ |
| Audience filter tabs (all / intl / US only) | P99-1 ✓ |
| Specialty + type dropdowns | P99-1 ✓ |
| VSLO-required toggle | P99-1 ✓ |
| Unknown-eligibility toggle | P99-1 ✓ |
| Details expand per card | P99-1 ✓ |
| Save/unsave (localStorage) | P99-2 ✓ |
| Save filter tabs (all / saved / unsaved) | P99-2B ✓ |
| Compare panel (up to 4) | P99-2 ✓ |
| JSON/CSV export of saved shortlist | P99-2B ✓ |
| Report-issue modal | P99-4 ✓ |
| Local reports hook + panel | P99-4 ✓ |
| JSON/CSV export of local reports | P99-4 ✓ |
| Generated runtime data pipeline | P99-3 ✓ |

---

## localStorage keys

| Key | Content | Set by |
|-----|---------|--------|
| `usce-saved-listings` | JSON array of listing_id strings | `useSavedListings` hook |
| `uscehub_local_issue_reports_v1` | JSON array of `LocalReport` objects | `useLocalReports` hook |

---

## Validators (all passing at P99-4)

| Script | Gates |
|--------|-------|
| `validate-usce-pilot-ui.ts` | 5 gates (P99-1) |
| `validate-usce-public-cards.ts` | card counts, buckets |
| `validate-usce-save-compare.ts` | 7 gates (P99-2B) |
| `validate-usce-report-intake.ts` | 8 gates (P99-4) |
| `usce-data/validate-public-runtime-data.ts` | 7 gates (P99-3) |

---

## Known limitations / items to harden

### CRITICAL

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| C1 | **noindex missing** — pilot page is currently indexable by search engines | `page.tsx` metadata | Add `robots: { index: false, follow: false }` |

### Copy

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| P1 | "Verified pilot" badge — "verified" could imply official certification | `page.tsx` | Change to "Source-reviewed pilot" |
| P2 | No explicit "saved listings stay on this device" copy visible without opening compare | FilterBar | Add inline hint near save-row |

### Empty states

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| E1 | `saveFilter="saved_only"` with 0 saved shows generic "No programs match" | Main empty state | Add tailored message when saveFilter=saved_only and savedCount=0 |
| E2 | Compare button hidden when savedCount=1 with no hint | FilterBar save-row | Add "Save 1 more to compare" hint when savedCount === 1 |

### localStorage resilience

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| L1 | `useSavedListings` hydrates without filtering stale IDs against current public cards | `useSavedListings` hook | Filter out IDs not in USCE_MAINE_CARDS on read |
| L2 | Duplicate saved IDs possible if localStorage corrupted | `useSavedListings` | Dedup on hydration |
| L3 | `useLocalReports` doesn't validate that parsed value is an array | `useLocalReports` hook | Add Array.isArray guard |

### Accessibility

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| A1 | "Report issue" button has no accessible label identifying the program | `ClerkshipCard` | Add `aria-label` with specialty + institution |
| A2 | VSLO / Unknown eligibility toggle buttons missing `aria-pressed` | `FilterBar` | Add `aria-pressed={filters.vsloOnly}` etc. |
| A3 | Details expand button missing `aria-expanded` | `ClerkshipCard` | Add `aria-expanded={showDetails}` |
| A4 | "Clear filters" button resets specialty/type/vslo/unknown/save but not audience tab | `FilterBar` | Add `audience: "all"` to clear, include audience in `hasSecondaryFilter` |

### Mobile / layout

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| M1 | Compare table column headers use fixed `max-w-[160px]` — may be tight on small screens | `CompareTable` | Add `min-w-[120px] max-w-[200px]` and ensure `overflow-x-auto` wrapper |
| M2 | Long institution names in compare table header may overflow | `CompareTable` | Add `break-words` |

---

## Files likely to change in P99-5

| File | Expected changes |
|------|-----------------|
| `src/app/clerkships/maine/page.tsx` | noindex, copy badge |
| `src/app/clerkships/maine/ClerkshipListings.tsx` | empty states, localStorage resilience, a11y, copy, filter fix |
| `scripts/validate-usce-pilot-release.ts` | NEW — release gate validator |
| `docs/platform-v2/local/usce-completeness/P99_5_RELEASE_HARDENING_QA_REPORT.md` | NEW |

---

## Do-not-change list

- Data model / LocalReport schema
- EXPORT_FIELDS / REPORT_EXPORT_FIELDS
- localStorage key names
- Generated runtime data
- Any validator that currently passes
- No new datasets, states, or features
