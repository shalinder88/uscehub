# USCE UI Theme Lock and SEO Preservation

> **Status:** binding doctrine for the round-4 redesign.
> **Scope:** USCE path only (no Residency / no Fellowship / no Practice / no Career exposure).
> **Build target:** docs-only PR (P1-2A). No source / UI / route / schema / metadata changes in this PR.
> **Direction lock:** the redesign is a **theme/interface transplant**, not a product rewrite.

---

## 1. Executive decision

The redesign is a theme/interface transplant. The current USCEHub product stays intact. Only the visual skin changes, except hero wording where we explicitly choose to sharpen it.

- Chosen visual direction:
  - **#37 Day** — chosen day theme. `docs/platform-v2/redesign-mockups/37-day-merged.html`
  - **#38 Night** — chosen night theme. `docs/platform-v2/redesign-mockups/38-night-merged.html`
  - **#36** — backup home (decision-card variant, dark navy). `docs/platform-v2/redesign-mockups/36-five-star-blue-night.html`
  - **#32** — backup browse (filter sidebar + grid + sticky compare dock). `docs/platform-v2/redesign-mockups/32-browse-dark.html`
- All four are no-neon (verified: 0 `drop-shadow`, 0 `box-shadow.*0 0 14px`, 0 `animation:pulse` glow residue at lock time).
- The user likes the current uscehub.com product; nothing should be lost when importing the visual themes (except hero wording).
- The redesign must preserve the current product and SEO.
- No Fellowship / no Practice / no Career expansion. No pathway selector.
- No deployment until the USCE path is >95% complete and the user explicitly approves.

---

## 2. Current product surfaces to preserve

Inventory captured at branch `docs/theme-lock-seo-preservation` (head `63815dc`).

### 2.1 Public USCE routes (must keep working, same URLs, same behavior)

```
/                                         home
/browse                                   listing search/filter
/observerships                            observerships hub
/observerships/[state]                    observerships by state (dynamic)
/observerships/specialty/[specialty]      observerships by specialty (dynamic)
/listing/[id]                             listing detail page (dynamic)
/compare                                  compare programs
/recommend                                recommend a program
/tools/cost-calculator                    cost calculator
/community                                community
/community/suggest-program                suggest-program
/contact                                  contact
/contact-admin                            contact admin
/methodology                              methodology
/how-it-works                             how it works
/for-institutions                         institutions landing
/img-resources                            IMG resources
/resources                                resources
/faq                                      FAQ
/about                                    about
/blog                                     blog index
/blog/[slug]                              blog post (dynamic)
/disclaimer                               disclaimer
/privacy                                  privacy
/terms                                    terms
```

### 2.2 Authenticated USCE surfaces (preserve as-is)

```
/auth/signin                              sign-in
/auth/signup                              sign-up
/dashboard                                user dashboard
/dashboard/applications                   user applications
/dashboard/compare                        user compare
/dashboard/profile                        user profile
/dashboard/reviews                        user reviews
/dashboard/saved                          user saved
/dashboard/settings                       user settings
/poster                                   poster home
/poster/applications                      poster applications
/poster/listings                          poster listings
/poster/listings/new                      new listing
/poster/listings/[id]/edit                edit listing
/poster/organization                      poster org
/poster/settings                          poster settings
/poster/verification                      poster verification
/admin                                    admin home
/admin/activity                           admin activity
/admin/flags                              admin flags
/admin/listings                           admin listings
/admin/messages                           admin messages
/admin/posters                            admin posters
/admin/reviews                            admin reviews
/admin/users                              admin users
/admin/verification-queue                 admin verification queue
```

### 2.3 API surfaces (preserve as-is)

```
/api/auth/*                               next-auth + signup
/api/listings                             listing CRUD
/api/listings/[id]                        listing detail
/api/admin/*                              admin endpoints
/api/admin-messages
/api/applications, /api/applications/[id]
/api/compare, /api/compared
/api/cron/verify-listings, /api/cron/verify-jobs
/api/flags
/api/my-reviews, /api/reviews
/api/organizations
/api/poster-applications, /api/poster-listings, /api/poster-profile
/api/profile
/api/programs, /api/programs/stats
/api/recommend
/api/saved
```

### 2.4 Home page sections (currently rendered by `src/app/page.tsx`)

In current order on production:

1. `<Hero>` — `src/components/home/hero.tsx`
2. `<MatchCounter>` — `src/components/home/match-counter.tsx`
3. `<ProgramStats>` — `src/components/seo/program-stats.tsx`
4. `<FeaturedListings>` — `src/components/home/featured-listings.tsx`
5. `<ProgramSpotlight>` — `src/components/home/program-spotlight.tsx`
6. `<ActivityFeed>` — `src/components/home/activity-feed.tsx`
7. `<ErasCountdown>` — `src/components/home/eras-countdown.tsx`
8. `<HowItWorks>` — `src/components/home/how-it-works.tsx`
9. `<TrustSection>` — `src/components/home/trust-section.tsx`
10. `<FloatingFinder>` — `src/components/tools/floating-finder.tsx`

> **Theme transplant rule:** every one of these sections must remain rendered (or its content visually merged into another section without data loss) after any UI PR. Removing a section = product change, not a theme transplant. Requires a separate, explicitly approved PR.

### 2.5 Tools to preserve

- Cost calculator (`/tools/cost-calculator` + `<CostCalculator>`)
- Compare drawer / page (`/compare`, `/dashboard/compare`)
- Floating finder (homepage)
- Save listing
- Recommend a program
- Report a broken link / report issue
- Suggest a program
- ERAS countdown
- Activity feed (real data — never fake)

### 2.6 Trust / source model to preserve (PR #42 / #44 / #47 doctrine)

- "Source on file" / "Source-linked" / "Last reviewed" — these phrases are conservative and intentional.
- Reviews (community opinions) shown **separately** from source-link verification (audit signal).
- No "Verified program" / "Officially verified" / "Trusted" / "Top-rated" / "Best".
- No fake `AggregateRating`, no fake `FinanceApplication`, no fake `Review` JSON-LD.
- The cron's `last_verified_at` and `source_link_status` fields are the only live truth signals.

---

## 3. SEO surface to preserve

### 3.1 Files (must not change in any UI PR)

| File | Purpose | Change rule |
|---|---|---|
| `public/robots.txt` | scraper allow/deny + sitemap pointer | UI PRs must not touch |
| `src/app/sitemap.ts` | dynamic sitemap (Prisma-driven) | UI PRs must not touch |
| `src/app/layout.tsx` | root `metadata` export (title template, OG, canonical, robots, twitter) | UI PRs must not change `metadata` export; visual refactor of body/`<html>` className OK |
| `src/lib/site-config.ts` | `SITE_URL` single source of truth | Locked by cleanup PR1 / PR6 / P1-7. UI PRs must not touch |

### 3.2 Per-page metadata (must not change in any UI PR)

Every page that exports `metadata` or `generateMetadata` keeps the current values. Confirmed by inventory: `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/page.tsx`, `src/app/browse/page.tsx`, and others. The full list is captured in this branch's git history; UI PRs must include a diff guard that fails if any of these `metadata`/`generateMetadata` exports change.

### 3.3 JSON-LD blocks (must not change in any UI PR)

Inventory found JSON-LD in:

```
src/app/layout.tsx                          (Organization-level potentially via head)
src/app/page.tsx                            organizationJsonLd, websiteJsonLd, itemListJsonLd (3 blocks)
src/app/career/*                            career-only JSON-LD (DO NOT TOUCH; out of scope)
src/app/residency/*                         residency-only JSON-LD (DO NOT TOUCH; out of scope)
src/app/contact/page.tsx                    contact JSON-LD
src/components/seo/breadcrumb-schema.tsx    breadcrumb component
src/components/seo/people-also-ask.tsx      FAQ component
src/components/seo/program-stats.tsx        program stats component
```

UI PRs may not add, remove, or modify any of these blocks. A separate explicitly approved SEO PR is required.

### 3.4 Routing / redirects / middleware

- No `src/middleware.ts` exists today. UI PRs must not introduce one.
- No `next.config.*` redirects or rewrites that affect USCE routes are to be changed.
- The `/career`, `/residency`, `/blog`, `/api`, `/dashboard`, `/poster`, `/admin`, `/auth` namespaces are out of scope for any USCE redesign PR.

### 3.5 OG image

- `public/og-default.html` and the `/og-default.png` reference in `layout.tsx` stay as-is unless a separate OG-asset PR is opened.

### 3.6 Robots/index decisions

- `metadata.robots = { index: true, follow: true }` on the root layout — preserve.
- `noindex` on auth/dashboard/poster/admin pages — preserve.
- Any page-level `robots.noindex` is preserved.

---

## 4. What can change

UI PRs are allowed to change **only** the following:

- Color tokens (Tailwind config, `globals.css` CSS custom properties)
- Typography stack (Charter serif, Inter, mono — added as font tokens)
- Spacing scale and section padding
- Border-radius, border-color, border-width values
- Card shape (radius, image aspect, padding)
- Button styles (size, color, hover)
- Visual hierarchy via typography sizes and weights
- Layout density (gap, grid template, breakpoints)
- Section presentation order — if and only if the same data and the same components are still rendered (visual reorder = OK; section deletion = NOT OK)
- Hover / focus / active states
- Mobile spacing
- Dark / night theme tokens (later PR — not P1-2B)
- **Hero wording on `/` only** — proposed change: `"Verified U.S. clinical experience."` (sharpen). Any other copy change requires separate approval.

---

## 5. What cannot change in a theme/interface PR

Forbidden in any UI PR (each line is a separate hard rule):

- Routes, route segment names, dynamic segment shapes
- File names of `page.tsx`, `layout.tsx`, `sitemap.ts`, `robots.ts` (none exists), `middleware.ts` (none exists)
- `public/robots.txt` content
- `src/app/sitemap.ts` content (or sitemap output)
- `src/lib/site-config.ts`
- Any `metadata` / `generateMetadata` export
- Any JSON-LD block (organization, website, itemList, breadcrumb, FAQ, etc.)
- `<head>` injections via `Script` / `next/script`
- `<html lang="en">` and theme-toggle root attribute scheme
- Prisma schema, migrations, `prisma db push`, seed data
- API route handlers, server actions, request/response shapes
- Authentication flow, NextAuth config, middleware
- Cron behavior or `/api/cron/*` endpoints
- Listing data semantics (status enum values, `source_link_status`, `last_verified_at`, `audience` fields)
- Trust/source language semantics — no introduction of "Verified program", "Top-rated", "Best", "Trusted", or any AggregateRating-style claims
- Other pathways — no Residency / no Fellowship / no Practice / no Career exposure on USCE pages
- The `/career/*` namespace
- The `/residency/*` namespace
- `/blog/*` (out of scope for USCE redesign)
- Production deployment

---

## 6. #37 / #38 import rules

When P1-2B and later PRs import the visual DNA of #37 / #38, the following rules apply:

1. **Visual DNA only.** Tokens, spacing, typography, card shape, gradient banners, blue map color scale, restrained dark mode. The mockup HTML files are **not** to be copied into source.
2. **No mockup-only fake counts.** The mockups carry placeholder strings like "1,247", "47 states", "187 California". Source code must read live values from Prisma (`prisma.listing.count(...)`) — already wired in `src/app/page.tsx`. UI PRs must not hard-code mockup numbers.
3. **No mockup-only sections.** Activity feed entries like "Someone from Ethiopia just browsed NYU Langone" are **mockup-only**. The live `<ActivityFeed>` component must show real data or its current placeholder behavior — not the mockup strings.
4. **Use current site data and current components as source of truth.** If a section in `src/app/page.tsx` exists today (e.g. `<MatchCounter>`), the redesign skins it; it does not get replaced by a different mockup section unless explicitly approved.
5. **#37 = day, #38 = night.** Light is shipped first; dark is a later PR (P1-2F). The dark-mode pass uses #38 tokens, not #34.
6. **#36 / #32 are visual references only.** They are not the primary import. Use them only if the day/night pair fails QA.
7. **No neon.** Specifically: no `drop-shadow(... rgba(...,.4))`, no `box-shadow: 0 0 14px rgba(...,.4)` glow on cards, no animated `pulse` glow keyframes. Single solid emerald accent on active state only — already proven safe in #37 / #38.
8. **Compact featured-opportunity cards.** The locked card spec (16/7 image, 18px h3, 14/16/10 body padding, 11.5px specsheet, 12px footer) applies to both day and night. Night uses dim muted gradient banners (`#241d10 → #4a3a1c`, `#121a30 → #243a64`, `#11231a → #1f4233`).
9. **Hero is JUST `Verified U.S. clinical experience.`** No subhead paragraph. CTAs: primary "Browse verified USCE", secondary "Estimate trip cost", tertiary "Methodology". Trust chips only: Free / No account needed / Source status shown / Report a broken link.

---

## 7. SEO-preserving PR pattern

Every UI PR (P1-2B and later) follows this pattern:

1. **Pre-diff inventory.** Capture `git diff --name-only` and `git diff --stat` before any commit.
2. **Source files changed list.** Enumerate every changed source file in the PR description.
3. **Forbidden-path grep.** PR description must include the output of:
   ```
   git diff --name-only main..HEAD | grep -E '(robots\.txt|sitemap\.ts|site-config\.ts|^src/app/career|^src/app/residency|^src/app/api|prisma/(schema|migrations))'
   ```
   Output must be empty. If non-empty, the PR is rejected.
4. **Route / metadata diff check.** PR description must include the output of:
   ```
   git diff main..HEAD -- 'src/app/**/page.tsx' 'src/app/**/layout.tsx' | grep -E '^[+-].*(export const metadata|generateMetadata|application/ld\+json|@context|@type|alternates:|canonical:|robots:|openGraph:|twitter:)'
   ```
   Output must be empty (no metadata changes from a UI PR).
5. **Build / lint / tsc.** All three must pass:
   - `npm run build` (no warnings worse than current main)
   - `npm run lint`
   - `npx tsc --noEmit`
6. **Manual preview QA.** Open `/`, `/browse`, `/listing/[sample]`, `/compare`, `/recommend`, `/tools/cost-calculator`, `/methodology`, `/about`, `/community`, `/observerships`, `/observerships/[sample-state]`, `/observerships/specialty/[sample-specialty]` in a Vercel preview. Each page renders, no console errors, no broken images, no broken links to `/career` or `/residency` from USCE pages.
7. **No production deploy.** Vercel preview only. Production deploy requires explicit approval and only after USCE path >95% complete.
8. **Rollback note.** PR description includes the exact `git revert <sha>` command for the merge commit.

---

## 8. Required diff checks for every UI PR

Run before every commit and paste output into the PR description:

```bash
# files changed
git -C /Users/shelly/usmle-platform diff --name-only main..HEAD

# forbidden paths must produce empty output
git -C /Users/shelly/usmle-platform diff --name-only main..HEAD \
  | grep -E '(public/robots\.txt|src/app/sitemap\.ts|src/lib/site-config\.ts|^src/app/career|^src/app/residency|^src/app/api|prisma/(schema|migrations))'

# metadata / JSON-LD edits must produce empty output
git -C /Users/shelly/usmle-platform diff main..HEAD -- 'src/app/**/page.tsx' 'src/app/**/layout.tsx' \
  | grep -E '^[+-].*(export const metadata|generateMetadata|application/ld\+json|@context|@type|alternates:|canonical:|robots:|openGraph:|twitter:)'

# /career references must produce empty output
git -C /Users/shelly/usmle-platform diff main..HEAD | grep -E '/career'

# schema / migration changes must produce empty output
git -C /Users/shelly/usmle-platform diff --name-only main..HEAD | grep -E '^prisma/'

# sitemap.ts byte-equal check (warning if non-zero)
git -C /Users/shelly/usmle-platform diff --stat main..HEAD -- src/app/sitemap.ts

# robots.txt byte-equal check (warning if non-zero)
git -C /Users/shelly/usmle-platform diff --stat main..HEAD -- public/robots.txt
```

Any non-empty output from any of the first five = reject the PR before opening.

---

## 9. Homepage redesign guardrail

P1-2B (homepage theme transplant) must:

- Keep all 10 home sections (§ 2.4) rendered.
- Keep search/finder behavior. The `<FloatingFinder>` continues to filter the live listing data.
- Keep working links to `/browse`, `/listing/[id]`, `/compare`, `/recommend`, `/tools/cost-calculator`, `/methodology`, `/community`.
- Keep the trust/source language: "Source on file" / "Last reviewed" / "Source-linked". Never "Verified program".
- Keep all current homepage data fetches in `src/app/page.tsx` (the 10-row `Promise.all` of Prisma counts and `findMany`s). Do not replace any with mock data.
- Hero wording **may** be sharpened to `"Verified U.S. clinical experience."` if the user explicitly approves at PR review time. Default: keep current hero copy.
- Hero must remain USCE-only. No Fellowship / Practice / Match references in copy.
- The 3 JSON-LD blocks in `src/app/page.tsx` (`organizationJsonLd`, `websiteJsonLd`, `itemListJsonLd`) must not change.
- The `metadata` export with `alternates.canonical = "https://uscehub.com"` must not change.

P1-2B is allowed to:

- Replace the className on existing JSX (Tailwind utility swap) to skin sections in #37 day theme.
- Add new visual primitives (e.g. `<NumbersRibbon>`, `<TypeBorderedCard>`) under `src/components/ui/` or `src/components/home/`.
- Adjust the color tokens in `tailwind.config.ts` and `app/globals.css`.
- Wire `<MatchCounter>` / `<ProgramStats>` data into the new 6-cell numbers ribbon **if** the data already exists; otherwise show only what the page already fetches.

---

## 10. Browse / listing redesign guardrail

P1-2C (browse) and any listing-card PR must:

- Preserve every current real field on the listing card: type (audience), institution, specialty, city/state, cost, duration, visa note, LOR possibility, source-link status, last reviewed, save action, compare action, view source action.
- Preserve `/browse` filter behavior end-to-end. URL query params behave the same.
- Preserve save/compare server actions and dashboard linkage.
- Preserve the trust/source visual distinction — community reviews shown separately from source-link verification.
- No fake reviews. No fake ratings. No fake availability counts.
- No `AggregateRating` JSON-LD added to listing cards.
- Type-coded card top-border: 2–3px solid, single color per type. No glow on the border (no neon).

---

## 11. Merge / deploy guardrail

- Every UI PR may be opened against `main` and reviewed in a Vercel preview.
- No public-facing UI PR is merged to `main` without explicit user approval ("merge" must be typed by the user).
- Production deployment requires explicit user approval **and** only after USCE path is >95% complete.
- If `main` auto-deploys to production via Vercel and a UI PR is not yet approved for live release, do **not** merge the PR into `main`. Instead:
  - Open the PR against an integration branch (e.g. `integration/usce-redesign`).
  - Merge PRs into the integration branch.
  - Hold the integration → main merge until the user explicitly approves.
- Open PR queue cap: 7 simultaneous open PRs. If the queue is at 6, either close a superseded PR first (with explanation) or stop and report to the user before opening a new one.
- No `git push --force`, no `--force-with-lease`, no rebase of pushed branches without explicit approval.
- No `--no-verify`, no `--no-gpg-sign`, no skip of pre-commit/pre-push hooks.

---

## 12. Next build PR

**P1-2B — Homepage theme transplant (#37 day).**

Scope (binding):

- Skin the existing homepage (`src/app/page.tsx` + 10 home components) using #37 visual language.
- Add `<NumbersRibbon>` (6-cell) component if the homepage data supports it; otherwise reuse existing `<ProgramStats>` skinned.
- Add `<TypeBorderedCard>` primitive for the featured-listings grid; preserve existing card data fields.
- Add Charter serif font tokens to `tailwind.config.ts` and `app/globals.css`.
- Swap the warm-paper background and Stripe-gradient hero shell.
- Sharpen hero wording **only if** the user explicitly approves at PR review.
- All other hero / section copy stays as-is.

Scope (excluded — separate later PRs):

- Dark / night mode (P1-2F)
- Browse-page redesign (P1-2C)
- Listing-detail redesign (P1-2D)
- Tools redesign (P1-2E)
- Activity feed real-data wiring beyond what already exists (P1-2G)

The P1-2B PR must:

1. Be small (≤ 400 lines diff, excluding lockfile / token files).
2. Pass all 5 forbidden-path grep checks (§ 8).
3. Open against `main` (or `integration/usce-redesign` if active) — never deploy.
4. Include rollback `git revert` command in the PR body.
5. Include manual QA checklist for the 12 USCE pages (§ 7 step 6).

---

## 13. Theme memory (for future requests)

So future asks can reference these by name without re-explaining:

| Name | Purpose | Key tokens |
|---|---|---|
| **#22 base DNA** | Production base, preserved | `--bg:#fbfaf6` warm paper · Charter serif · `--emerald:#0e7c66` · `--ink:#0c2c4f` · Stripe gradient hero · 4-cell numbers ribbon · gradient cards (yellow/blue/green) |
| **#37 Day** | Chosen home day | #22 + uscehub structure + 6-cell ribbon + blue map (`#dbeafe → #1e3a8a`) + activity feed + 4-cell trust grid (NPI / Admin / Community / Moderated) + #22 cards (compact: 16/7 image, 18px h3) + teal `#0f766e` CTA |
| **#38 Night** | Chosen home night | sasanova-style near-black `#0a0a0f` warm undertone · `--ink:#f5f4ec` · same structure as #37 · **dim** muted card banners (`#241d10 → #4a3a1c`, `#121a30 → #243a64`, `#11231a → #1f4233`) · solid emerald `#0e7c66` CTA · NO neon |
| **#36 Night backup** | Backup home | dark navy `#0b1322` · blue map · decision cards (no gradient banners) · solid emerald accent · NO neon (post-fix: pulse animation removed, drop-shadow removed) |
| **#32 Browse backup** | Backup browse | dark navy · type-bordered listing grid · sidebar filters · sticky compare dock · NO neon (post-fix: card top-border glow removed, compare-dock emerald ring removed) |

Mockup files live at `docs/platform-v2/redesign-mockups/` and are not deployed (the directory is untracked at the time of this lock; preserved as research-only).

---

## 14. Out of scope

- Residency, Fellowship, Practice, Career pathways.
- Pathway selector.
- Multi-pathway navigation.
- Monetization surfaces (subscription, payments, Stripe checkout).
- Email sending (transactional, marketing).
- New cron jobs.
- New SEO files (additional sitemap, FAQ schema, etc.) unless a separate explicitly approved SEO PR.
- Analytics events beyond what is already wired (`@vercel/analytics`).
- Any change that increases page weight by more than 50 KB compressed without explicit approval.

---

## 15. Confirmation log

- Branch: `docs/theme-lock-seo-preservation` cut from `main` at `63815dc`.
- This PR is docs-only. No source code changed. Verified by `git diff --stat`.
- Stashes preserved (`stash@{0}` cleanup wip, `stash@{1}` jobs expansion preserve).
- `/career` not touched.
- `prisma migrate status` clean.
- Open PR queue at lock time: 5 (#48, #47, #46, #45, #44). Cap: 7.
- PR #49 (pathway selector) confirmed already closed.
- `npx tsc --noEmit` and `npm run lint` outcomes: see PR body.
