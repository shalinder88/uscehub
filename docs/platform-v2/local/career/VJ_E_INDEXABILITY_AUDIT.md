# VJ-E Indexability Safety Audit — /career/*

**Date:** May 2026  
**Branch:** main  
**Commit at audit start:** 008e4a7  
**Purpose:** Prove every indexable career page is safe before adding sitemap entries.

---

## Ground state

- Branch: `main`
- HEAD: `008e4a7c46af6aa3c2f09e3dfacfd6995a7c9d12`
- `npx tsc --noEmit`: clean (no output)
- No push. No deploy. No PR.

**What changed in 008e4a7:**
- Removed layout-level `robots: { index: false, follow: false }` from `career/layout.tsx`
- Changed residency `follow: false` → `follow: true` (residency still noindex)
- Pinned 5 HOLD pages individually: attorneys, employers, employers/post, sponsors, state-compare
- Created docs/ARCHITECTURE.md + docs/NOINDEX_MATRIX.md

---

## Bugs found and fixed during this audit

### Bug 1 — /career/community missing noindex pin (CRITICAL)
- **Problem:** After removing layout-level block, `/career/community` inherited `index: true` from root layout. Community is not active and must stay HOLD.
- **Fix:** Added `robots: { index: false, follow: false }` to `src/app/career/community/page.tsx`
- **Commit:** included in audit commit below

### Bug 2 — /career/jobs/[specialty] double title suffix
- **Problem:** `generateMetadata` returned `title: "J-1 Waiver X Jobs — ... — USCEHub"` as a plain string. The parent `career/layout.tsx` has `template: "%s — USCEHub"`. Next.js applies the template to non-absolute strings → title would render as "J-1 Waiver X Jobs — ... — USCEHub — USCEHub".
- **Fix:** Changed to `title: { absolute: "..." }` to bypass template.
- **Commit:** included in audit commit below

---

## Full route inventory

39 routes total across the career section.

### HOLD — noindex, follow:false (6 pages)

| Route | Robots set in | Reason |
|---|---|---|
| `/career/community` | page.tsx | Community not active/moderated |
| `/career/attorneys` | page.tsx | Monetization secondary page, needs disclosure audit |
| `/career/employers` | page.tsx | Employer portal, not a content page |
| `/career/employers/post` | page.tsx | Form page, not a content page |
| `/career/sponsors` | page.tsx | Thin employer data, not useful as indexed page |
| `/career/state-compare` | page.tsx | Redirect only → /career/compare-states |

### WAVE 1 — Indexable (33 pages)

All of the following inherit `index: true` from the root layout. None have a page-level robots block. Their titles flow through the career layout's `template: "%s — USCEHub"` unless they use `absolute:`.

| Route | Title | Description | Canonical | Copy risks | Status |
|---|---|---|---|---|---|
| `/career` | "Visa & Jobs — Physician Immigration Intelligence — USCEHub" (absolute) | Present | uscehub.com/career | None | SAFE |
| `/career/visa` | "Visa & Immigration for Physicians — J-1, H-1B, Green Card" | Present | /career/visa | None | SAFE |
| `/career/visa-journey` | "Physician Visa Journey Timeline — J-1 to Green Card" (sub-layout) | Present | None | No canonical | INFO |
| `/career/visa-bulletin` | "Visa Bulletin Tracker for Physicians — EB-2, EB-1 Priority Dates" (sub-layout) | Present | None | No canonical | INFO |
| `/career/alerts` | "Immigration Policy Alerts for Physicians" (sub-layout) | Present | None | No canonical | INFO |
| `/career/h1b` | "H-1B Visa Guide for Physicians — Cap-Exempt, Transfer, Fees" | Present | /career/h1b | None | SAFE |
| `/career/h4-spouse` | "H-4 Visa Spouse Guide — Work Authorization, EAD, Resources" | Present | /career/h4-spouse | None | SAFE |
| `/career/greencard` | "Green Card Pathway for Physicians — EB-2 NIW, EB-1, PERM" | Present | /career/greencard | None | SAFE |
| `/career/citizenship` | "Citizenship Pathways — Immigration Timeline for Physicians" | Present | /career/citizenship | None | SAFE |
| `/career/waiver` | "J-1 Waiver State Guide — Conrad 30 Intelligence" | Present | /career/waiver | None | SAFE |
| `/career/waiver/[state]` | Generated: "J-1 Waiver [State Name] — Conrad 30 Guide" (generateMetadata) | Generated | Per-state canonical | None | SAFE |
| `/career/waiver/pathways` | "J-1 Waiver Pathways Beyond Conrad 30 — HHS, ARC, DRA, SCRC, VA" | Present | /career/waiver/pathways | None | SAFE |
| `/career/waiver/process` | "J-1 Waiver Process Step-by-Step — All 6 Pathways" (sub-layout) | Present | None | No canonical | INFO |
| `/career/waiver/timeline` | "J-1 Waiver Timeline Calculator" (sub-layout) | Present | None | No canonical | INFO |
| `/career/waiver/tracker` | "Conrad 30 Slot Tracker — Real-Time Waiver Availability" (sub-layout) | Present | None | No canonical | INFO |
| `/career/waiver/map` | "J-1 Waiver Interactive Map — Conrad 30 by State" (sub-layout) | Present | None | No canonical | INFO |
| `/career/waiver/hpsa-lookup` | "HPSA Score Lookup Tool — Check Shortage Area Eligibility" (sub-layout) | Present | None | No canonical | INFO |
| `/career/waiver-problems` | "When Things Go Wrong During Your J-1 Waiver" | Present | /career/waiver-problems | None | SAFE |
| `/career/jobs` | "J-1 Waiver Physician Jobs — Verified Positions" | Present | /career/jobs | "Verified Positions" — sourced snapshot, OK | SAFE |
| `/career/jobs/[specialty]` | Generated: "J-1 Waiver [X] Jobs — Salary, Employers, Search — USCEHub" (absolute) | Generated | Per-specialty canonical | Fixed double-suffix (Bug 2) | SAFE |
| `/career/salary` | "Physician Salary Benchmarks 2026 — By Specialty and State" (sub-layout) | Present | None | Sources cited in page: Medscape 2025, MGMA DataDive 2025, Doximity 2025, AMN Healthcare. Disclaimer present. | SAFE |
| `/career/contract` | "J-1 Waiver Employment Contract Checklist — What Must Be Included" | Present | /career/contract | None | SAFE |
| `/career/malpractice` | "Malpractice Insurance Deep Dive — What Every New Attending Must Know" | Present | /career/malpractice | None | SAFE |
| `/career/licensing` | "State Medical Licensing Guide for Physicians" | Present | /career/licensing | None | SAFE |
| `/career/credentialing` | "Credentialing & Privileging Guide — Start 6 Months Early" | Present | /career/credentialing | None | SAFE |
| `/career/interview` | "Interview Prep for Attending Jobs" | Present | /career/interview | None | SAFE |
| `/career/offers` | "Physician Offer Comparison Tool — Compare Up to 4 Job Offers" (sub-layout) | Present | None | No canonical | INFO |
| `/career/taxes` | "Tax Planning for Physicians — W-2, 1099, Deductions & Retirement Strategies — USCEHub" (absolute) | Present | /career/taxes | Disclaimer present on page | SAFE |
| `/career/loan-repayment` | "Physician Loan Repayment Programs — NHSC, PSLF, State Programs" | Present | /career/loan-repayment | None | SAFE |
| `/career/locums` | "Locum Tenens Guide for New Attendings — Pay Rates, Agencies & Tax Tips" | Present | /career/locums | None | SAFE |
| `/career/compare-states` | "Compare States for Physician Relocation — Side by Side" (sub-layout) | Present | None | No canonical | INFO |
| `/career/ecfmg` | "ECFMG Certification Guide 2026 — Pathways, Fees, Timeline" | Present | /career/ecfmg | None | SAFE |
| `/career/practice` | "Offers & Practice Setup for Physicians — Salary, Contracts, Licensing" | Present | /career/practice | None | SAFE |

---

## Copy safety check

**Job claims:**
- `/career/jobs` title: "Verified Positions" — description says "Data snapshot last verified May 2026." Scoped correctly, not claiming completeness. PASS.
- No "all jobs" or "complete job board" language found in jobs pages.
- `/career/jobs/[specialty]` employer listings link to DOL public performance data and named society job boards (ATS, USACS, etc.). Not endorsing agencies — linking to public sources. PASS.

**Attorney pages:**
- `/career/attorneys` is HOLD (noindex). No endorsement language can reach search. PASS.

**Financial/legal advice:**
- `/career/taxes` has a disclaimer present on the page. PASS.
- `/career/malpractice` — content is educational/informational, no direct insurance recommendations.
- `/career/contract` — checklist format, clearly educational. No "this is legal advice" claim.
- `/career/loan-repayment` — government program data (NHSC, PSLF). All amounts from official sources.

**Source claims:**
- `/career/salary` (sub-layout meta): "Verified physician compensation data from Medscape, MGMA, and Doximity" — confirmed cited in page body (lines 29-30 code comment, line 177 UI label, line 253 footer note, line 587 section header, lines 738-739 disclaimer). PASS.

**No fake claim found:**
- No "all hospitals in America" type claims.
- No "guaranteed waiver" or "guaranteed visa" language (not checked inline but flagged for human review on deploy).
- No insurance quotes or investment advice.

---

## Missing canonicals (INFO — not blocking)

9 pages get metadata via sub-layouts that were created for client components. These sub-layouts define title + description but no `alternates.canonical`. Effect: Google may canonicalize these pages correctly via inference, but there's no explicit signal. This is not a Wave 1 blocker — canonicals can be added incrementally.

Pages affected:
- /career/visa-journey
- /career/visa-bulletin
- /career/alerts
- /career/waiver/process
- /career/waiver/timeline
- /career/waiver/tracker
- /career/waiver/map
- /career/waiver/hpsa-lookup
- /career/offers
- /career/salary
- /career/compare-states

Action: add canonicals to these sub-layouts before or alongside sitemap entry. Not required to unblock sitemap proposal.

---

## Analytics note (NOT verified in this audit)

The ARCHITECTURE.md Phase 1 prerequisite states: "Analytics instrumentation (prerequisite — measure before indexing)." This audit does not verify whether analytics events exist. That check must be done before deploying. Specific events needed:
- career page view
- Visa & Jobs nav click
- J-1 waiver page click
- source/job link click
- email signup
- future: attorney click, employer click

---

## Summary

| Category | Count |
|---|---|
| HOLD (noindex, confirmed) | 6 |
| Wave 1 SAFE (indexable, no issues) | 22 |
| Wave 1 INFO (indexable, missing canonical only) | 11 |
| Bugs fixed in this audit | 2 |

**Indexable after this audit:** 33 career pages  
**Held noindex:** 6 career pages  
**Blocking code bugs:** 0 remaining (2 fixed)  
**Sitemap edit status:** NOT YET — see below

---

## Sitemap readiness

Sitemap entries are NOT added in this commit.

**Before adding sitemap entries, the following must be true:**
1. Analytics instrumentation confirmed (Phase 1 prerequisite per ARCHITECTURE.md)
2. Canonicals added to the 11 INFO-flagged sub-layout pages (recommended before submission)
3. Human review of inline copy for visa/legal/insurance claims on at least: /career/malpractice, /career/contract, /career/taxes (all have disclaimers but human eyes before indexed)
4. Explicit "go" from project owner

See `VJ_E_SITEMAP_WAVE1_PROPOSAL.md` (created separately) for the proposed URL list.
