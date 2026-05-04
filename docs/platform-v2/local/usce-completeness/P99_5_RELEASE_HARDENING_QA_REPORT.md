# P99-5 Release Hardening QA Report
Generated: 2026-05-04

---

## Overall result: PASSED

All browser QA scenarios passed. All validators pass. Zero console errors throughout.

---

## Validator gate results

| Validator | Result |
|-----------|--------|
| `scripts/usce-data/validate-public-runtime-data.ts` | **PASS** |
| `scripts/validate-usce-public-cards.ts` | **PASS** |
| `scripts/validate-usce-save-compare.ts` | **PASS** |
| `scripts/validate-usce-report-intake.ts` | **PASS** |
| `scripts/validate-usce-pilot-release.ts` | **PASS** (new — P99-5) |
| `npx tsc --noEmit` | **PASS** |

---

## P99-5 changes verified

| Change | Location | Result |
|--------|----------|--------|
| `robots: { index: false, follow: false }` in page metadata | `page.tsx` | PASS |
| Hero badge copy: "Source-reviewed pilot · Maine" | `page.tsx` | PASS |
| `aria-pressed={filters.vsloOnly}` on VSLO toggle | `ClerkshipListings.tsx` | PASS |
| `aria-pressed={filters.unknownOnly}` on Unknown toggle | `ClerkshipListings.tsx` | PASS |
| `aria-expanded={showDetails}` on Details button | `ClerkshipListings.tsx` | PASS |
| `aria-label` with specialty + institution on card Report button | `ClerkshipListings.tsx` | PASS |
| `aria-label="Compare saved programs"` on ComparePanel | `ClerkshipListings.tsx` | PASS |
| `aria-label="Local issue reports"` on LocalReportsPanel | `ClerkshipListings.tsx` | PASS |
| `aria-label="Report an issue"` on ReportIssueModal | `ClerkshipListings.tsx` | PASS |
| "Save 1 more to compare" hint when savedCount === 1 | `ClerkshipListings.tsx` | PASS |
| "Saved listings stay on this device" copy in save row | `ClerkshipListings.tsx` | PASS |
| Tailored empty state when saveFilter=saved_only + savedCount=0 | `ClerkshipListings.tsx` | PASS |
| `hasSecondaryFilter` includes `audience !== "all"` | `ClerkshipListings.tsx` | PASS |
| Clear filters resets audience tab to "all" | `ClerkshipListings.tsx` | PASS |
| `VALID_LISTING_IDS` stale ID filter in `useSavedListings` | `ClerkshipListings.tsx` | PASS |
| Dedup on hydration in `useSavedListings` | `ClerkshipListings.tsx` | PASS |
| `Array.isArray` guard in `useLocalReports` | `ClerkshipListings.tsx` | PASS |
| `overflow-x-auto` wrapper + `min-w`/`max-w` on compare table columns | `ClerkshipListings.tsx` | PASS |
| `break-words` on compare table institution name header | `ClerkshipListings.tsx` | PASS |

---

## Browser QA scenarios

### Scenario 1 — Desktop: All 12 cards

| Check | Result |
|-------|--------|
| Hero badge: "Source-reviewed pilot · Maine" | PASS |
| Hero badge: "12 listings · source-reviewed" | PASS |
| "7 programs open to international students · 5 US MD/DO only" | PASS |
| Pilot disclaimer: "not a complete national database" | PASS |
| Audience tabs: All programs 12 / International-eligible 7 / US MD/DO only 5 | PASS |
| VSLO required + Unknown eligibility toggle buttons present | PASS |
| CMHC section (7 cards) + MMC section (5 cards) both visible | PASS |
| "5 additional programs under eligibility review" footer | PASS |

### Scenario 2 — Filter tabs

| Check | Result |
|-------|--------|
| International-eligible tab: shows 7 cards | PASS |
| US MD/DO only tab: shows 5 cards | PASS |
| All programs tab: shows 12 cards | PASS |
| Audience tabs are active/highlighted correctly | PASS |

### Scenario 3 — VSLO required toggle (aria-pressed)

| Check | Result |
|-------|--------|
| `aria-pressed="false"` when inactive | PASS |
| `aria-pressed="true"` when active | PASS |
| Active button has amber styling | PASS |
| Filtered to 3 VSLO-required cards (MMC cards with VSLO badge) | PASS |
| "Clear filters" button appears when VSLO active | PASS |

### Scenario 4 — Save 1 item

| Check | Result |
|-------|--------|
| Save row appears after first save | PASS |
| "Saved listings stay on this device" copy visible | PASS |
| "Save 1 more to compare" hint visible when savedCount === 1 | PASS |
| localStorage key `usce-saved-listings` updated | PASS — `["ME-015"]` |
| "Remove from saved" aria-label on saved card button | PASS |

### Scenario 5 — Save 2 items (compare button)

| Check | Result |
|-------|--------|
| "Compare 2 →" button appears when savedCount >= 2 | PASS |
| "Save 1 more to compare" hint disappears | PASS |
| localStorage updated to `["ME-015", "ME-016"]` | PASS |

### Scenario 6 — Saved-only / Unsaved-only filter tabs

| Check | Result |
|-------|--------|
| "Saved only" tab present in save row | PASS |
| "Unsaved only" tab present in save row | PASS |
| Saved only: shows only saved cards | PASS |
| Unsaved only: shows only unsaved cards | PASS |
| JSON export button present in save row | PASS |
| CSV export button present in save row | PASS |
| JSON export fires without console errors | PASS |

### Scenario 7 — Saved-only empty state (P99-5 new)

| Check | Result |
|-------|--------|
| Navigate to "Saved only" with 1 saved → unsave → check message | PASS |
| "No saved programs yet. Use the bookmark icon on any card to save a listing." | PASS |
| Generic "No programs match" message absent | PASS |

### Scenario 8 — Compare panel

| Check | Result |
|-------|--------|
| `aria-label="Compare saved programs"` present | PASS |
| Panel visible and rendering content | PASS |
| "Comparing 2 programs" title | PASS |
| Pilot disclaimer in panel | PASS |
| Report issue buttons per column | PASS |
| "Clear all saved" button present | PASS |
| "Close compare panel" button present | PASS |

### Scenario 9 — Compare > 4 behavior

| Check | Result |
|-------|--------|
| 5 saved → Compare button shows "Compare 4 →" (capped) | PASS |
| Panel title: "Comparing 4 programs" | PASS |
| Panel subtitle: "Showing first 4 of 5 saved. Remove some to compare others." | PASS |
| No crash or overflow with 5th saved item | PASS |

### Scenario 10 — Compare table mobile layout

| Check | Result |
|-------|--------|
| Compare panel opens on mobile (375px) | PASS |
| Table is horizontally scrollable (`overflow-x-auto` wrapper) | PASS |
| Institution names in header wrap without overflow (`break-words`) | PASS |
| Label column visible at `w-24` | PASS |

### Scenario 11 — Corrupted localStorage recovery (P99-5 new)

| Check | Result |
|-------|--------|
| Set `usce-saved-listings` to `"NOT_VALID_JSON{{{{"` | — |
| Set `uscehub_local_issue_reports_v1` to `"also broken"` | — |
| Reload page | — |
| All 12 cards still visible (no crash) | PASS |
| Save row absent (0 saved parsed from corrupt data) | PASS |
| Reports badge absent (0 reports parsed from corrupt data) | PASS |
| No console errors | PASS |

### Scenario 12 — Stale saved ID recovery (P99-5 new)

| Check | Result |
|-------|--------|
| Inject `["ME-015", "ME-999-STALE", "ME-DELETED"]` into `usce-saved-listings` | — |
| Reload page | — |
| Only 1 "Remove from saved" button (ME-015 only) | PASS |
| "1 saved" label | PASS |
| localStorage rewritten to `["ME-015"]` — stale IDs dropped | PASS |
| "Save 1 more to compare" hint shows | PASS |

### Scenario 13 — Details expand (aria-expanded)

| Check | Result |
|-------|--------|
| `aria-expanded="false"` when collapsed | PASS |
| `aria-expanded="true"` after click | PASS |
| Button text changes to "Less" when expanded | PASS |
| Source metadata visible: source type, last reviewed, listing ID | PASS |
| Other cards remain collapsed | PASS |

### Scenario 14 — Report issue modal

| Check | Result |
|-------|--------|
| Card "Report issue" button has `aria-label` with specialty + institution | PASS — "Report an issue with Family Medicine at Central Maine Medical Center" |
| Modal opens with `aria-label="Report an issue"` + `role="dialog"` | PASS |
| Institution + specialty in modal header | PASS — "Central Maine Medical Center — Family Medicine" |
| Issue type dropdown: 8 options | PASS |
| Official source URL shown read-only | PASS |
| Application link shown read-only | PASS |
| Privacy copy: "Do not include patient information" | PASS |
| Local-only copy: "saved on this device" / "no data is sent" | PASS |
| Pilot copy present | PASS |
| Confirmation state on "Save report locally" | PASS |
| "no data was sent" in confirmation | PASS |
| `uscehub_local_issue_reports_v1` written to localStorage | PASS |
| report.listing_id = "ME-015" | PASS |
| report.issue_type = "BROKEN_LINK" | PASS |
| report.status = "LOCAL_DRAFT" | PASS |
| report.page_context = "CARD" | PASS |
| "1 local report" badge appears in filter bar | PASS |

### Scenario 15 — Local reports panel

| Check | Result |
|-------|--------|
| Badge button opens `[aria-label="Local issue reports"]` panel | PASS |
| Panel title: "Local reports 1" | PASS |
| Subtitle: "Stored on this device only. Export to share with reviewers." | PASS |
| Report entry: institution, issue type badge, date, listing ID | PASS |
| JSON export button present | PASS |
| CSV export button present | PASS |
| Clear all button present | PASS |

### Scenario 16 — Persistence across reload

| Check | Result |
|-------|--------|
| Reload page with saved IDs + 1 report in localStorage | — |
| Saved IDs intact after reload | PASS — `["ME-015"]` |
| Report count intact: 1 | PASS |
| "Remove from saved" button on saved card | PASS |
| "1 local report" badge restored | PASS |

### Scenario 17 — Clear filters resets audience (A4)

| Check | Result |
|-------|--------|
| Switch to International-eligible (7 cards) | PASS |
| "Clear filters" button appears | PASS |
| Click Clear filters → 12 cards visible | PASS |
| Audience tab resets to "All programs" | PASS |
| "Clear filters" button disappears | PASS |

### Scenario 18 — Mobile layout (375px)

| Check | Result |
|-------|--------|
| Hero section renders without overflow | PASS |
| Filter tabs wrap correctly on narrow viewport | PASS |
| "Source-reviewed pilot · Maine" badge visible | PASS |
| Save row + "1 local report" badge visible | PASS |
| "Compare 4 →" button visible in save row | PASS |
| Cards single-column, eligibility rows wrapping cleanly | PASS |
| Apply / Program page buttons fit without overflow | PASS |
| Details / Report issue links visible in card footer | PASS |

---

## Accessibility spot-check

| Attribute | Element | Value Confirmed |
|-----------|---------|-----------------|
| `aria-pressed` | VSLO required button | "false" / "true" toggle ✓ |
| `aria-pressed` | Unknown eligibility button | "false" ✓ |
| `aria-expanded` | Details button | "false" → "true" on click ✓ |
| `aria-label` | Card report button | specialty + institution ✓ |
| `aria-label` | ReportIssueModal | "Report an issue" ✓ |
| `aria-label` | ComparePanel | "Compare saved programs" ✓ |
| `aria-label` | LocalReportsPanel | "Local issue reports" ✓ |

---

## localStorage behavior summary

| Key | Corrupt input | Post-reload result |
|-----|--------------|-------------------|
| `usce-saved-listings` | `NOT_VALID_JSON{{{{` | Empty array — no crash |
| `usce-saved-listings` | `["ME-015","ME-999-STALE","ME-DELETED"]` | `["ME-015"]` — stale IDs dropped, rewritten |
| `uscehub_local_issue_reports_v1` | `"also broken"` | Empty array — no crash |

---

## No console errors

Zero JavaScript errors in browser console throughout all 18 QA scenarios.

---

## Known testing artifact

The ToS consent modal appeared once during QA when clicking "Unknown eligibility" toggle while VSLO filter was active. This was a first-visit consent gate triggered by an earlier programmatic card interaction (modal checks consent on first external link navigation attempt). Dismissed via "I Agree"; did not recur. Not a product bug — consent gate functions correctly.

---

## P99-5 feature summary

| Feature | Status |
|---------|--------|
| noindex set (`robots: { index: false, follow: false }`) | PASS |
| "Source-reviewed pilot" badge (not "Verified") | PASS |
| "Saved listings stay on this device" copy in save row | PASS |
| "Save 1 more to compare" hint at savedCount === 1 | PASS |
| Tailored empty state for saved_only + 0 saved | PASS |
| Corrupted localStorage: silent recovery, no crash | PASS |
| Stale saved ID: filtered on hydration, localStorage rewritten | PASS |
| aria-pressed on VSLO/Unknown toggles | PASS |
| aria-expanded on Details button | PASS |
| aria-label on card Report issue button | PASS |
| aria-label on ReportIssueModal / ComparePanel / LocalReportsPanel | PASS |
| Clear filters resets audience tab | PASS |
| Compare table: overflow-x-auto + min/max-w + break-words | PASS |

---

## Files created/modified in P99-5

| File | Action |
|------|--------|
| `src/app/clerkships/maine/page.tsx` | Updated — noindex, "Source-reviewed pilot" badge |
| `src/app/clerkships/maine/ClerkshipListings.tsx` | Updated — empty states, localStorage resilience, a11y, copy, filter fix, mobile table |
| `scripts/validate-usce-pilot-release.ts` | Created — 10 hard gates |
| `docs/platform-v2/local/usce-completeness/P99_5_RELEASE_HARDENING_AUDIT.md` | Created (Phase A) |
| `docs/platform-v2/local/usce-completeness/P99_5_RELEASE_HARDENING_QA_REPORT.md` | Created (this file) |
