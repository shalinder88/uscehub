# USCEHub — Noindex Release Matrix

**Last updated:** May 2026  
**Purpose:** Per-page indexing decision. No global flips. Each row is an explicit decision.

Current state: `/career/layout.tsx` and `/residency/layout.tsx` both set `robots: { index: false, follow: false }` — blocking all pages in both sections at the layout level. This matrix drives the staged lift.

**Wave definitions:**
- **Wave 1** — Lift with Phase 2. Clean pages, verified content, source-linked.
- **Wave 2** — Lift with Phase 4. Good content but needs audit pass first.
- **HOLD** — Permanently noindex OR requires specific action before indexing.

---

## Visa & Jobs — `/career/*`

Currently blocked by `career/layout.tsx: { index: false, follow: false }`.  
Action: Remove layout-level block. Apply HOLD pages individually.

| URL | Wave | Index Ready | Blocking Issue |
|---|---|---|---|
| `/career` | Wave 1 | YES | None — clean hub |
| `/career/visa` | Wave 1 | YES | None |
| `/career/visa-journey` | Wave 1 | YES | None |
| `/career/visa-bulletin` | Wave 1 | YES | None |
| `/career/alerts` | Wave 1 | YES | None |
| `/career/h1b` | Wave 1 | YES | None |
| `/career/h4-spouse` | Wave 1 | YES | None |
| `/career/greencard` | Wave 1 | YES | None |
| `/career/citizenship` | Wave 1 | YES | None |
| `/career/waiver` | Wave 1 | YES | None — hub |
| `/career/waiver/[state]` | Wave 1 | YES | 50 state pages, all sourced |
| `/career/waiver/pathways` | Wave 1 | YES | None |
| `/career/waiver/process` | Wave 1 | YES | None |
| `/career/waiver/timeline` | Wave 1 | YES | None |
| `/career/waiver/tracker` | Wave 1 | YES | None |
| `/career/waiver/map` | Wave 1 | YES | None |
| `/career/waiver/hpsa-lookup` | Wave 1 | YES | None — links to HRSA |
| `/career/waiver-problems` | Wave 1 | YES | None |
| `/career/jobs` | Wave 1 | YES | None |
| `/career/jobs/[specialty]` | Wave 1 | YES | None |
| `/career/salary` | Wave 1 | YES | None |
| `/career/contract` | Wave 1 | YES | None |
| `/career/malpractice` | Wave 1 | YES | None |
| `/career/licensing` | Wave 1 | YES | None |
| `/career/credentialing` | Wave 1 | YES | None |
| `/career/interview` | Wave 1 | YES | None |
| `/career/offers` | Wave 1 | YES | Tool page, clean |
| `/career/taxes` | Wave 1 | YES | Disclaimer present |
| `/career/loan-repayment` | Wave 1 | YES | None |
| `/career/locums` | Wave 1 | YES | None |
| `/career/compare-states` | Wave 1 | YES | None |
| `/career/ecfmg` | Wave 1 | YES | None — may move to IMG Corner later |
| `/career/practice` | Wave 1 | YES | Hub/nav page, no own content |
| `/career/sponsors` | HOLD | NO | Thin employer data page, not useful as indexed page |
| `/career/attorneys` | HOLD | NO | Secondary/monetization — needs disclosure audit before indexing |
| `/career/employers` | HOLD | NO | Employer portal — not a content page |
| `/career/employers/post` | HOLD | NO | Form — not a content page |
| `/career/state-compare` | HOLD | NO | Redirect only (`redirect("/career/compare-states")`) |
| `/career/community` | HOLD | NO | Community not active |

---

## Residency — `/residency/*`

Currently blocked by `residency/layout.tsx: { index: false, follow: false }`.  
Action: Remove layout-level block in Phase 4. Apply HOLD pages individually.

| URL | Wave | Index Ready | Blocking Issue |
|---|---|---|---|
| `/residency` | Wave 2 | YES | None — hub with fresh data |
| `/residency/boards` | Wave 2 | YES | None — 6 board guides, sourced |
| `/residency/fellowship/guide` | Wave 2 | YES | None — deep fellowship guide |
| `/residency/fellowship` | Wave 2 | YES | Has FREIDA browser — add disclaimer note |
| `/residency/finances` | Wave 2 | YES | None |
| `/residency/moonlighting` | Wave 2 | YES | None |
| `/residency/post-match` | Wave 2 | YES | None |
| `/residency/procedures` | Wave 2 | YES | None |
| `/residency/research` | Wave 2 | YES | None |
| `/residency/resources` | Wave 2 | YES | None |
| `/residency/salary` | Wave 2 | YES | None |
| `/residency/survival` | Wave 2 | YES | None |
| `/residency/community` | HOLD | NO | Community not active |

---

## Already indexed (root layout — no change needed)

These pages are already indexed. Included for completeness.

| URL | Status |
|---|---|
| `/` | Indexed |
| `/browse` | Indexed |
| `/listing/[id]` | Indexed |
| `/observerships` | Indexed |
| `/observerships/[state]` | Indexed |
| `/observerships/specialty/[specialty]` | Indexed |
| `/img-corner` | Indexed |
| `/img-resources` | Indexed |
| `/blog` | Indexed |
| `/blog/[slug]` | Indexed |
| `/about` | Indexed |
| `/methodology` | Indexed |
| `/how-it-works` | Indexed |
| `/for-institutions` | Indexed |
| `/recommend` | Indexed |
| `/compare` | Indexed |
| `/tools/cost-calculator` | Indexed |
| `/resources` | Indexed |
| `/faq` | Indexed |
| `/privacy` | Indexed |
| `/disclaimer` | Indexed |
| `/terms` | Indexed |
| `/contact` | Indexed |
| `/contact-admin` | Indexed |

---

## Permanently noindex — correct, do not change

| URL | Reason |
|---|---|
| `/admin/*` | Admin portal |
| `/dashboard/*` | User dashboard |
| `/poster/*` | Poster/employer portal |
| `/auth/*` | Auth flows |
| `/usce/verified-preview/*` | Internal preview/staging |
| `/community/*` | Not active, not moderated |
| `/clerkships/maine` | Pilot, not public-ready |
| `/clerkships/pilot` | Pilot, not public-ready |

---

## Pre-indexing checklist (per page, before Wave 1)

Before removing the layout-level block, verify each Wave 1 page:

- [ ] Title is unique and accurate (no double suffix like "— USCEHub — USCEHub")
- [ ] Meta description is present and unique
- [ ] Canonical tag is correct
- [ ] No duplicate content with another indexed page
- [ ] Disclaimer present where needed (legal, financial, immigration advice)
- [ ] VerifiedBadge present with source attribution
- [ ] No broken outbound links in hero/critical CTAs
- [ ] Not a thin page (under 300 words of original content)

Wave 1 pages have all passed this checklist as of May 2026 audit.

---

## Sitemap

After Wave 1 lift: add all Wave 1 URLs to `sitemap.xml` / Next.js sitemap config.  
After Wave 2 lift: add Wave 2 URLs.  
HOLD pages: never in sitemap until explicitly moved to a wave.
