# Micro-Pilot Browser QA 1 — Checklist

**Date:** 2026-05-08
**Route:** `http://localhost:3000/clerkships/pilot`
**Browsers:** Playwright headless Chromium 1.59.1 (Chrome for Testing 147.0.7727.15) at desktop 1440×900 + mobile 390×844 (iPhone-like with `isMobile: true`).
**Source commit at QA time:** `476000a` + small report-issue fix added in this sprint.

## A. Page load + indexing

| Item | Result | Evidence |
|------|--------|----------|
| Route loads HTTP 200 | ✅ | `curl -I` returns `HTTP/1.1 200 OK` |
| Page renders | ✅ | Desktop + mobile screenshots show full content |
| `<meta name="robots" content="noindex, nofollow">` in HTML head | ✅ | grep on rendered HTML matched |
| `X-Robots-Tag: noindex, nofollow` HTTP header | ✅ | `curl -I` confirmed (set by next.config.ts global header) |
| Route NOT in sitemap | ✅ | sitemap.xml unchanged from prior commit; pilot route never added |
| Route NOT linked from public nav | ✅ | Site nav screenshot shows no /clerkships/pilot link |
| Page does NOT say "complete directory" | ✅ | grep returned 0 |
| Page does NOT say "national" launch language | ✅ | grep returned 0 for "nationwide", "national directory" |
| Page does NOT say "hospital-approved" | ✅ | grep returned 0 |
| Page does NOT say "guaranteed placement" | ✅ | grep returned 0 |
| Page does NOT say "apply through USCEHub" | ✅ | grep returned 0 |
| Page does NOT say broad "IMG-friendly" | ✅ | grep returned 0 |

## B. Cards present / absent

| Institution | Expected | Result |
|-------------|----------|--------|
| Morristown Medical Center | Present | ✅ 1 occurrence |
| Overlook Medical Center | Present | ✅ 1 occurrence |
| Cleveland Clinic Mercy Hospital | Present | ✅ 1 occurrence |
| Cleveland Clinic Hillcrest Hospital | Present | ✅ 1 occurrence |
| Highland Hospital | Present | ✅ 1 occurrence |
| Mayo Mankato | Absent | ✅ 0 occurrences (as "Mankato") |
| Mayo Eau Claire | Absent | ✅ 0 occurrences |
| Bergen New Bridge | Absent | ✅ 0 occurrences |
| Saint Elizabeths | Absent | ✅ 0 occurrences |
| Hemet Global | Absent | ✅ 0 occurrences |
| TJUH | Absent | ✅ 0 occurrences |
| Manatee Memorial | Absent | ✅ 0 occurrences |
| UH San Antonio | Absent | ✅ 0 occurrences |
| UPMC Western Psychiatric | Absent | ✅ 0 occurrences |
| Lincoln Medical | Absent | ✅ 0 occurrences |

## C. Source links

| URL | Pilot rows it covers | Verified visible on cards |
|-----|----------------------|----------------------------|
| ahs.atlantichealth.org/professionals-medical-education/medical-students.html | Morristown + Overlook | ✅ |
| my.clevelandclinic.org/departments/elective-program/requirements | CCF Mercy + CC Hillcrest | ✅ |
| highlandmedicine.org/visiting-elective-scholarship | Highland | ✅ |

## D. Caveat display per card

Pilot uses tag-shaped caveats (per bridge contract — verbatim source quotes stay internal). Users click "Official source" link for verbatim text.

| Card | Tag-shaped caveats visible (fit_warnings + restriction_tags) |
|------|---------------------------------------------------------------|
| Morristown | NAMED_SCHOOLS_ONLY · HOUSING_NOT_PROVIDED · NO_BROAD_IMG_CLAIM (pills) + expandable restriction tags |
| Overlook | same as Morristown |
| CCF Mercy | LCME_AOA_ONLY · VISA_APPLICANT_OBTAINED_B1 · NO_J1_SPONSORSHIP · NO_H1B_SPONSORSHIP · FEE_REQUIRED (pills) |
| CC Hillcrest | same as Mercy + SYSTEM_PAGE_NO_SITE_SPECIFIC_GUARANTEE pill |
| Highland | DIVERSITY_ELIGIBILITY_REQUIRED · MS4_ONLY (pills) |

## E. Internal field leakage

| Field | Expected | Result |
|-------|----------|--------|
| `screenshot_path` | absent | ✅ 0 |
| `must_not_claim` | absent | ✅ 0 |
| `not_allowed_actions` | absent | ✅ 0 |
| `reviewer_notes` | absent | ✅ 0 |
| `bridge_row_id` | absent | ✅ 0 |
| `audience_public_caveat` (raw key) | absent | ✅ 0 |
| `visa_public_caveat` (raw key) | absent | ✅ 0 |
| `evidence_triple_complete` | absent | ✅ 0 |
| `p97_readiness_status` | absent | ✅ 0 |

## F. Report-issue path (was a release blocker)

| Item | Result |
|------|--------|
| Per-card "Report a listing issue" link | ✅ ADDED IN THIS SPRINT — 5 occurrences (one per card) |
| Footer "report incorrect eligibility / fee/deadline / wording" call-out | ✅ ADDED IN THIS SPRINT — 1 occurrence |
| Link target | `/contact?ref=pilot-listing&listing_id=<id>` per card; `/contact?ref=pilot-feedback` in footer |
| Backend system | Existing `/contact` route (was already in repo) — no new backend |

## G. Save / compare path

| Item | Result |
|------|--------|
| Save button per card | NOT WIRED |
| Compare panel | NOT WIRED |
| Severity | NON_BLOCKING_LIMITATION — pilot route is read-only and does not promise save/compare anywhere; existing P99 save-compare validator still PASSES against Maine route unchanged |

## H. Responsive layout

| Viewport | Result | Notes |
|----------|--------|-------|
| Desktop 1440×900 | ✅ | Hero + 5 cards stacked; pills wrap; no horizontal overflow |
| Mobile 390×844 | ✅ | Cards stack; pills wrap; no clipping; no horizontal scroll |

## I. Console

| Item | Result |
|------|--------|
| Console errors | **0** (across both viewports during full-page load) |
| Page errors / unhandled exceptions | **0** |
| Hydration warnings | **0** |
| Network failures | **0** (page itself; external source links not fetched) |

Console captured via Playwright `page.on('console')` + `page.on('pageerror')`. 9 entries on initial load (desktop) — all `log` / `info` / `warning` from Next.js dev tools, none rated error or pageerror.

## J. Accessibility quick check

| Item | Result |
|------|--------|
| Logical heading order (H1 → H2 per card) | ✅ |
| External source link has visible text + aria-hidden icon | ✅ |
| `<details>/<summary>` for restriction tags is keyboard-operable by default | ✅ |
| Color contrast on caveat pills (amber on dark) | ✅ visible |
| Tab navigation through primary elements | not exhaustively tested in headless QA — recommend manual pass at release-audit stage |
