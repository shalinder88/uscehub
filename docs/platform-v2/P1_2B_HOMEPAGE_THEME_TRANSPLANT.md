# P1-2B — Homepage Theme Transplant (#37 day)

> **Status:** local pre-stage only. No push, no PR, no merge, no Vercel, no production deploy.
> **Branch:** `local/p1-2b-homepage-theme-transplant` (cut from `build/p1-foundation-tokens-primitives` / PR #48).
> **Pairs with:** PR #50 (theme-lock doctrine), PR #51 (mockup archive), PR #48 (foundation primitives).
> **Scope discipline:** doctrine § 9 — homepage redesign guardrail. All 10 home sections preserved. SEO untouched.

---

## 1. What changed visually

A single component re-skin: `src/components/home/hero.tsx`.

The hero now renders the **#37 day visual language**:

| Element | Before | After |
|---|---|---|
| Background | `bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800` (dark slate) | `bg-[#fbfaf6]` warm paper + Stripe radial-gradient ambient + faint grid mask |
| Eyebrow | `Verified Directory — Updated April 2026` (slate-400) | `Verified directory · April 2026` (mono caps, teal `#0f766e` with chip dot) |
| Headline | `Verified U.S. Clinical Experience Programs for IMGs` (sans, white, gradient on "Programs for IMGs") | `Find verified U.S. clinical experience.` (Charter serif, navy `#0c2c4f`, italic teal on "verified") |
| Sub-copy | `Search 1,247+ clinical rotations…` | Audience-neutral: source-linked observerships / externships / electives / research with cost / eligibility / visa / last-reviewed |
| CTAs | `Browse All` outline, `Post a Listing` white | Primary teal `Browse opportunities`, outline `Estimate trip cost`, ghost link `How verification works` |
| Trust chips | (absent) | 4 conservative chips: Free to browse · Source status shown · Save and compare · Report broken links |
| Stats row | `2xl/4xl` white on `bg-slate-800/60` | Charter serif `3xl/4xl` navy on white card with thin border |
| Type tiles | dark backdrop with colored dot | white card with 3px colored left-border (blue / emerald / violet) — no neon |
| Map wrapper | `bg-slate-800/30` | white card with thin border, light USMap render |
| Search input | `bg-white` on dark hero | same `bg-white` on light hero with teal focus ring |
| Search button | default slate | teal `#0f766e` solid |

The hero deliberately uses **unmodified light Tailwind classes** (no `dark:` modifiers). This means it always renders the day theme regardless of the user's light/dark toggle. The night-hero is a later PR (P1-2F).

Other home sections (`<ErasCountdown>`, `<ActivityFeed>`, `<TrustSection>`, `<FeaturedListings>`, `<ProgramSpotlight>`, `<HowItWorks>`, `<ProgramStats>`, `<MatchCounter>`, `<FloatingFinder>`) **remain untouched**. They already carry their own light/dark variants today and continue to honor the toggle. Subsequent PRs (P1-2C / P1-2D / P1-2E) will skin them.

---

## 2. What product behavior was preserved

Every behavior is unchanged:

- All 5 props preserved: `listingCount`, `stateCount`, `specialtyCount`, `typeCounts`, `stateCounts`.
- Search functionality preserved: `parseSmartSearch(input)` + `buildSearchUrl(filters)` from `@/lib/smart-search`. Empty submit still routes to `/browse`.
- 3 stats preserved: Active listings · States covered · Specialties (real Prisma counts from `src/app/page.tsx`).
- 3 type tiles preserved: Clinical rotations · Research · Volunteer / Pre-Med (real Prisma counts).
- USMap preserved: `<USMap stateCounts={stateCounts} />` renders unchanged.
- All 10 home sections in `src/app/page.tsx` still rendered in the same order:
  1. `<FloatingFinder>`
  2. `<Hero>` (re-skinned)
  3. `<ErasCountdown>`
  4. `<ActivityFeed>`
  5. `<TrustSection>`
  6. `<FeaturedListings>`
  7. `<ProgramSpotlight>`
  8. `<HowItWorks>`
  9. `<ProgramStats>`
  10. `<MatchCounter>`

`src/app/page.tsx` was not edited.

---

## 3. Hero copy used

User-explicit, audience-neutral, no fake-claim language.

**Eyebrow:**
```
Verified directory · April 2026
```

**Headline (Charter serif, navy with italic teal "verified"):**
```
Find verified U.S. clinical experience.
```

**Sub-copy:**
```
Search source-linked observerships, externships, electives, and research opportunities — with cost, eligibility, visa notes, and last-reviewed status on every listing.
```

**Primary CTA:** `Browse opportunities` → `/browse`
**Secondary CTA:** `Estimate trip cost` → `/tools/cost-calculator`
**Tertiary link:** `How verification works` → `/methodology`

**Trust chips:**
- `Free to browse`
- `Source status shown`
- `Save and compare`
- `Report broken links` (links to `/contact-admin`)

**Forbidden phrases not used:** "for IMGs", "for every physician pathway", "Residency & Fellowship", "Practice & Career", "AI-powered", "best", "top-rated", "guaranteed", "officially verified". Verified by source diff.

---

## 4. SEO files untouched

- `public/robots.txt` — not modified
- `src/app/sitemap.ts` — not modified
- `src/lib/site-config.ts` — not modified
- `src/app/layout.tsx` — not modified (metadata, JSON-LD, theme toggle script all intact)
- `src/app/page.tsx` — not modified (3 JSON-LD blocks, page-level metadata, all 10 home sections all intact)
- All `metadata` / `generateMetadata` exports across the codebase — not modified
- All other JSON-LD components (`breadcrumb-schema`, `people-also-ask`, `program-stats`) — not modified

Verified by `git diff --name-only` and forbidden-path grep (§ 7).

---

## 5. Sections preserved

All 10 home sections in `src/app/page.tsx` still render in the same order. The hero re-skin does not delete or hide any section. Light-touch visual transitions between the new light-theme hero and the existing sections are intentionally deferred — subsequent PRs will harmonize the page.

---

## 6. Mockup data not copied

The mockup #37 carries placeholder strings ("1,247", "47 states", "187 California", activity-feed examples like "Someone from Ethiopia just browsed NYU Langone"). **None of these are imported.**

Hero stats use the live Prisma values already wired in `src/app/page.tsx` (`totalListings`, `stateData.length`, `specialtyCount`, `clinicalRotations`, `researchPositions`, `volunteer`). Type tiles use the same live values. The map uses live `stateCounts`.

No fabricated activity feed entries are added. The existing `<ActivityFeed>` component continues to provide whatever it provides today.

---

## 7. No pathway selector

`<PathwayCard>` from PR #48 is **not imported** into the homepage in this PR. The current direction (PR #50 doctrine § 1, § 5, § 14) explicitly forbids a pathway selector on USCE pages. The pathway primitive remains available in `src/components/platform-v2/` for any future build that explicitly needs it under a different doctrine.

---

## 8. No Residency/Fellowship or Practice/Career exposure

No copy mentions Residency, Fellowship, Practice, or Career. No links to any `/career/*` or `/residency/*` route. The hero is USCE-only as the visible wedge.

---

## 9. No `/career` touched

`git diff --name-only HEAD~1..HEAD | grep -E '/career'` is empty (verified in § 11).

---

## 10. No schema/migration

`git diff --name-only HEAD~1..HEAD | grep -E '^prisma/'` is empty (verified in § 11).
No `prisma db push`. No `prisma migrate`. No seed.

---

## 11. Forbidden-path verification (run before commit)

All commands run from `/Users/shelly/usmle-platform`. Each must produce empty output to be safe.

```bash
# files changed
git diff --name-only HEAD

# forbidden paths must be empty
git diff --name-only HEAD | grep -E '(public/robots\.txt|src/app/sitemap\.ts|src/lib/site-config\.ts|^src/app/career|^src/app/residency|^src/app/api|prisma/(schema|migrations))'

# metadata / JSON-LD edits must be empty
git diff HEAD -- 'src/app/**/page.tsx' 'src/app/**/layout.tsx' | grep -E '^[+-].*(export const metadata|generateMetadata|application/ld\+json|@context|@type|alternates:|canonical:|robots:|openGraph:|twitter:)'

# /career references must be empty
git diff HEAD | grep -E '/career'

# schema / migration changes must be empty
git diff --name-only HEAD | grep -E '^prisma/'

# layout / page edits forbidden
git diff --name-only HEAD | grep -E '^src/app/(layout|page|sitemap)\.tsx?$'
```

Expected diff: **two files only** —
- `src/components/home/hero.tsx`
- `docs/platform-v2/P1_2B_HOMEPAGE_THEME_TRANSPLANT.md` (this file)

---

## 12. Routes used (no new routes invented)

| CTA / link | Route | Exists today |
|---|---|---|
| Search submit | `/browse?<filters>` via `buildSearchUrl` | yes |
| Search submit (empty) | `/browse` | yes |
| Primary CTA | `/browse` | yes |
| Secondary CTA | `/tools/cost-calculator` | yes |
| Tertiary link | `/methodology` | yes |
| Trust chip "Report" | `/contact-admin` | yes |
| Type tiles | `/browse?category=clinical \| research \| volunteer` | yes |
| Map "Browse all" | `/browse` | yes |
| Map state click | (USMap component handles routing internally — unchanged) | unchanged |

Zero new routes. Zero route renames.

---

## 13. QA checklist (manual, before any push)

Before pushing this branch (after PR queue drops below 7) **and before any merge**, the following must be verified manually in a Vercel preview or local `npm run dev`:

- [ ] `/` loads
- [ ] All 10 home sections render in order
- [ ] Hero shows new copy `Find verified U.S. clinical experience.`
- [ ] Hero shows 3 CTAs and they navigate to `/browse`, `/tools/cost-calculator`, `/methodology`
- [ ] Search input accepts text and submits to `/browse?<filters>`
- [ ] Stats row shows real numbers (not 0, not placeholder)
- [ ] Type tiles show real numbers and link to `/browse?category=...`
- [ ] US map renders with real state densities and is clickable
- [ ] Trust chips render and "Report" links to `/contact-admin`
- [ ] No horizontal overflow on mobile (375px viewport)
- [ ] No console errors
- [ ] No broken images
- [ ] Hero renders as **light theme** even when system is in dark mode (no `dark:` modifiers used)
- [ ] All other home sections (ErasCountdown, ActivityFeed, TrustSection, FeaturedListings, ProgramSpotlight, HowItWorks, ProgramStats, MatchCounter, FloatingFinder) still render and respect light/dark toggle
- [ ] No pathway selector visible
- [ ] No "for IMGs", "Residency", "Fellowship", "Practice", "Career" text in hero
- [ ] No fake metric numbers (every number traces to live Prisma)
- [ ] `view-source` shows the same 3 JSON-LD blocks (Organization / WebSite / ItemList) and same `<head>` metadata as `main`
- [ ] `/sitemap.xml` byte-for-byte equal to `main`
- [ ] `/robots.txt` byte-for-byte equal to `main`
- [ ] Lighthouse SEO score on `/` ≥ current `main` baseline

---

## 14. Local checks (run before commit)

| Check | Expected |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | 0 new errors (warnings unchanged from baseline 144) |
| `npm run build` | clean, no new warnings |

Build / dev server are local only. No Vercel deploy triggered.

---

## 15. What is intentionally deferred

| Concept | Deferred to |
|---|---|
| Skin `<ErasCountdown>` to #37 | P1-2D |
| Skin `<ActivityFeed>` to #37 | P1-2D |
| Skin `<TrustSection>` to #37 4-cell trust grid (NPI / Admin / Community / Moderated) | P1-2D |
| Skin `<FeaturedListings>` cards to #37 compact gradient cards | P1-2C (alongside browse-page redesign) or P1-2E |
| Skin `<HowItWorks>`, `<ProgramStats>`, `<MatchCounter>` | P1-2E |
| Browse page redesign (#32 backup as fallback) | P1-2C |
| Listing detail redesign | P1-2D (separate scope) |
| Dark / night mode (#38 sasanova theme tokens) | P1-2F |
| Theme toggle default flip (currently dark-default) | P1-2F |
| Sharpen page-level `metadata` to match new hero copy | separate explicitly approved SEO PR |
| Add Charter serif font tokens to `tailwind.config.ts` | optional later — current implementation uses inline `style={{ fontFamily }}` for hero only |
| `<NumbersRibbon>` 6-cell primitive (mockup #37 uses 6 cells; current homepage has 3) | P1-2E |
| Activity feed real-data wiring beyond what already exists | P1-2G |
| Footer alignment to #37 | P1-2H |
| Lighthouse + snapshot tests | P1-2H release pass |

---

## 16. Rollback

This is a single-commit branch with one source-file change and one new doc. Reverting is one command:

```bash
git -C /Users/shelly/usmle-platform revert <commit-sha>
```

Or, before push, simply delete the local branch:

```bash
git -C /Users/shelly/usmle-platform checkout main
git -C /Users/shelly/usmle-platform branch -D local/p1-2b-homepage-theme-transplant
```

The mockup HTML files in `docs/platform-v2/redesign-mockups/` remain available on PR #51's branch as reference.

---

## 17. Confirmation log

- Branch: `local/p1-2b-homepage-theme-transplant` cut from `build/p1-foundation-tokens-primitives` (PR #48).
- Working tree was clean before any edit.
- Stashes preserved: `stash@{0}` cleanup wip · `stash@{1}` jobs expansion preserve.
- `prisma migrate status`: 2 migrations applied, schema up to date — not touched.
- Open PR queue at pre-stage time: 7 (cap reached). **No push, no new PR.** This branch sits locally only.
- Files changed in this PR:
  - `src/components/home/hero.tsx` (rewrite)
  - `docs/platform-v2/P1_2B_HOMEPAGE_THEME_TRANSPLANT.md` (new)

When the queue drops below 7 and the user explicitly approves push, this branch can be pushed and a PR opened against `main` (or `integration/usce-redesign` if that lands first).
