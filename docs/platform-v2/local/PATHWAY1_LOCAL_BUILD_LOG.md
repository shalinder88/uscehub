# Pathway #1 Local Build — multi-phase log

**Start time:** 2026-05-01 (autonomous ~10h session)
**Branch:** `local/p1-2b-homepage-theme-transplant`
**Starting commit:** `bfd29d4` (homepage P1-2B locked)
**PR queue:** 7 (cap)
**Push policy:** **NO PUSH, NO PR, NO MERGE, NO DEPLOY**
**SEO policy:** **DO NOT TOUCH** sitemap, robots, metadata, JSON-LD, canonical, redirects, middleware
**Scope:** USCEHub Pathway #1 surfaces only — no /career, /residency, /fellowship; no schema/API/data changes; no fake claims

---

## Phase 0 — Ground state

- ✅ On correct branch (`local/p1-2b-homepage-theme-transplant`)
- ✅ Latest commit `bfd29d4`
- ✅ Working tree: only untracked docs scaffolding (`docs/platform-v2/redesign-mockups/`)
- ✅ Stashes preserved (2 unrelated stashes)
- ✅ PR queue at 7 — confirmed via `gh pr list`
- ⚠️ Prisma migrate status returns `EMAXCONNSESSION` from Supabase pooler — not a blocker; we are not touching schema

## Phase 1 — Homepage lock QA

- ✅ Homepage loads, title intact
- ✅ tsc clean (0 errors)
- ✅ Earlier comprehensive QA covered desktop+mobile day+night, search, CTAs, hamburger, theme persistence, footer alignment, no overflow, no console errors
- Status: **homepage stays at `bfd29d4` lock; will not edit hero/hero-adjacent files in this session**

## Phase 2 — Browse + listing audit

### `src/app/browse/page.tsx` (200 lines)
- bg `bg-white dark:bg-slate-950` — off-theme, should be warm paper
- header strip `bg-slate-50 dark:bg-slate-900` with `slate-200/800` borders — off-theme
- h1 `text-2xl font-bold text-slate-900` — should be Charter editorial
- "What's the difference" `<details>` is `bg-white dark:bg-slate-800` — off-theme
- Empty state `bg-slate-50` border `slate-200` — off-theme
- Behavior to preserve: search/category/audience/state/free/visa/verified params, sort, fresh-first ordering, BreadcrumbSchema, FloatingFinder, PeopleAlsoAsk, ListingDisclaimer
- `metadata` export → **must not edit**

### `src/components/listings/listing-filters.tsx` (191 lines)
- container `bg-white dark:bg-slate-800` border `slate-200` — off-theme
- search input `border-slate-300 ... focus:ring-slate-200` — off-theme
- "Smart" toggle `bg-slate-900 text-white` — off-theme
- 3 toggle pills use `emerald`, `blue`, `green` checked states — off-theme
- `<Select>` styling delegated to UI primitive
- Behavior to preserve: smart-search toggle, debounced search, all URLSearchParams writes

### `src/components/listings/listing-card.tsx` (already in new theme — 130 lines)
- ✅ Already uses warm card, Charter title, mono caps, spec-grid, italic Certificate offered
- `accent` prop adds top-border on homepage Featured only — browse stays clean (default)
- Stays as-is

### `src/app/listing/[id]/page.tsx` (591 lines)
- to be audited in Phase 4

### `src/app/compare/compare-client.tsx` (323 lines)
- to be audited in Phase 6

### Behavior NOT to change
- query semantics
- URL params
- search/filter logic
- ranking
- BreadcrumbSchema / metadata / canonical
- prisma queries
- audience tag values

## Phase 3 — P1-2C browse theme transplant ✅ committed `9bc3977`

- `src/app/browse/page.tsx`: warm paper bg; eyebrow + italic teal "*opportunities*" h1; italic Charter sub; warm cream `<details>` w/ mono-cap summary; warm empty state with Charter Proper title
- `src/components/listings/listing-filters.tsx`: warm cream filter card (`#fcf9eb`); warm input + brass focus border; teal active "Smart" pill; theme-aligned 3 toggle chips (no more emerald/blue/green)
- ListingCard untouched (already in new theme; browse stays clean — no `accent` prop)
- Did NOT touch `src/components/ui/select.tsx` (shared with auth/dashboard — risk of cross-impact); deferred to Phase 9 if safe to scope
- Forbidden-path scan: clean
- tsc: clean

## Phase 4 — Listing detail audit

### `src/app/listing/[id]/page.tsx` (591 lines)
- Has `generateMetadata` (lines 42–65) and JSON-LD `<script>` (line 158) — **DO NOT TOUCH**
- Outer wrapper `bg-white dark:bg-slate-950` — off-theme
- Header strip `bg-slate-50 dark:bg-slate-800` border `slate-200/700` — off-theme
- h1 `text-2xl font-bold` slate — should be Charter editorial
- 6-cell fact grid uses `text-slate-400` labels + `text-slate-900` values — needs theme tokens + Charter values
- Eligibility/Description headings `text-lg font-semibold` slate — should be editorial mono-cap eyebrow + Charter
- Reviews section: stars use `fill-amber-400` — keep amber for star semantics OR swap to brass `#a87b2e`
- Sidebar: cost card, organization card, share card — all slate borders, white panels
- CTA `<Button>` uses primitive — leave
- `<TrustBadges>`, `<ListingTrustMetadata>`, `<FlagButton>`, `<ReviewForm>`, `<ShareButtons>` — separate components; only restyle if needed for visual cohesion
- Behavior to preserve: views increment, admin preview gate, reviews moderation filter, listingDisplay CTA logic, all `<Badge>` semantics

## Phase 5 — P1-2D listing detail transplant ✅ committed `5818099`

- Header: warm border, type+visa+cert pills preserved, Charter h1 -0.022em kerning, mono-cap meta row
- Spec grid: warm cream card with mono-cap labels + Charter values, 2/3-col responsive
- Eligibility / Description / Housing: editorial eyebrows + Charter heading + readable body
- Reviews: brass star fill (`#a87b2e`/`#d8a978`), Charter title + author, mono date
- Sidebar: warm cream Cost CTA card, brass/teal/quiet caption variants, themed Organization + Share cards
- `generateMetadata`, JSON-LD, Badge/Button/Separator/Avatar primitives, listingDisplay logic, ReviewForm/FlagButton/TrustBadges/ListingTrustMetadata/ShareButtons all UNTOUCHED
- tsc: clean, forbidden-path: clean

## Phase 6+7 — P1-2E tools theme polish ✅ committed `042faa9`

### Recommend client (`src/app/recommend/recommend-client.tsx`)
- Replaced "Your Top Matches" / "Find the best…" with "Programs that fit your answers" / "Filter programs by what fits you" — truth-conscious, no "best matches"
- Loading state: warm-paper teal spinner with italic Charter copy
- Step screens: progress bar `bg-[#1a5454]/[#0fa595]`; option cards warm cream w/ teal selected state; Charter labels
- Result chips: warm cream pills with mono-cap label
- Restart button copy: "Start Over" → "Start over"

### Compare client (`src/app/compare/compare-client.tsx`)
- Editorial header with eyebrow + italic teal "*programs*" + italic sub
- BoolCell true/false now use brand teal/border tokens (no emerald)
- Selection card: warm cream surface, themed select + add/compare buttons (no `bg-slate-900`)
- Comparison table: warm header row with mono-cap "Attribute"; brass-banded zebra rows; teal serif program titles; mono-cap per-row labels; mono "View →" link
- Mobile stacked view: warm cream cards with same theme

### Cost calculator page (`src/app/tools/cost-calculator/page.tsx`)
- Editorial header with "— ESTIMATOR —" eyebrow, italic teal "*estimator*", italic Charter sub ("rough estimate, not exact financial advice")
- Practical-notes card: warm cream w/ brass bullet dots; "USCEHub" -> "applicants" copy ("Share accommodation with other applicants…")

### Cost calculator widget (`src/components/tools/cost-calculator.tsx`)
- Full rewrite: warm cream container w/ Charter title + italic sub
- Inputs themed (warm bg, brass focus border)
- Estimate card: warm `#f0e9d3` panel w/ mono eyebrow "— BREAKDOWN —" + Charter heading
- All values typeset in Charter; total highlighted in mono caps + Charter

### NOT touched (preserved for stability)
- `src/components/ui/select.tsx` — shared with auth/dashboard forms; kept as-is to avoid cross-impact
- All page metadata + JSON-LD + canonical
- Recommend `/api/recommend` filter logic; compare `/api/compare` semantics

## Phase 8 — Dashboard audit (no edits per spec)

| File | LoC | Themed? | Notes |
|---|---|---|---|
| `src/app/dashboard/layout.tsx` | 97 | slate | Sidebar nav, applicant/poster role split |
| `src/app/dashboard/page.tsx` | 197 | slate | Stats cards, recent saves |
| `src/app/dashboard/saved/page.tsx` | 174 | slate | List of saved listings |
| `src/app/dashboard/compare/page.tsx` | 185 | slate | Compare-list management |
| `src/app/dashboard/applications/page.tsx` | 160 | slate | Application tracker |
| `src/app/dashboard/profile/page.tsx` | 321 | slate | Profile form |
| `src/app/dashboard/reviews/page.tsx` | 153 | slate | User's review list |
| `src/app/dashboard/settings/page.tsx` | 130 | slate | Settings form |

- Dashboard noindex assumed intact (not modified this session)
- Sidebar mobile behavior untested in this audit (deferred)
- Applicant/poster CTA confusion present in `dashboard/page.tsx` — defer for separate PR
- Recommendation: P1-2F as a dedicated dashboard transplant pass, separate from public surfaces. Estimate: 4-6 hours focused work.

## Phase 9 — Global consistency ✅ committed `a274724`

- `src/components/listings/listing-disclaimer.tsx`: warm cream + teal info icon (was slate)
- `src/components/listings/listing-verification-badge.tsx`: 5 verification states retokenized
  - `verified` → soft brand teal `#dde7e3`/`#1a5454` (was emerald)
  - `verified-on-file`, `reverifying` → warm `#f0e9d3` neutrals (was slate)
  - `unverified` → warm + brass for soft amber meaning
  - `needs-review` → warm + coral `#9c3a2c` for stronger flag
  - Semantic meaning preserved; only color tokens swapped
- `src/app/observerships/page.tsx`: editorial header, warm state-tile grid, brass/teal icons, "USCEHub" / "IMGs" copy → "applicants"
- `src/app/observerships/[state]/page.tsx`: editorial header, warm stat tiles, themed empty state, themed cross-links, IMG → applicants copy
- `src/app/observerships/specialty/[specialty]/page.tsx`: same editorial pass
- NOT touched: `<Badge>`, `<Button>`, `<Select>`, `<Avatar>`, `<Separator>` UI primitives; auth forms; any metadata; any JSON-LD

## Phase 10 — Performance + build

- `tsc --noEmit`: ✅ 0 errors
- `eslint src/app src/components`: ✅ 0 errors / 138 warnings (all pre-existing — eslint-disable directives, unused imports, react-hooks/purity flags from earlier audits)
- `npm run build`: ✅ exit 0, all 146 static pages generate clean

### Route timings (warm, 2nd hit)

| Route | localhost dev | uscehub.com prod |
|---|---|---|
| `/` | 0.61s | 0.48s |
| `/browse` | 2.36s* | 1.01s |
| `/recommend` | 0.08s | 0.31s |
| `/compare` | 0.10s | 0.31s |
| `/tools/cost-calculator` | 0.12s | 0.31s |
| `/observerships` | 0.28s | 0.22s |

*`/browse` was hit by a Supabase pool-exhaustion event on dev — production cold path is steady.

## Phase 11 — SEO preservation audit

- Diff scope this session (`bfd29d4..HEAD`, 12 files):
  - `src/app/browse/page.tsx`
  - `src/app/compare/compare-client.tsx`
  - `src/app/listing/[id]/page.tsx`
  - `src/app/observerships/page.tsx`
  - `src/app/observerships/[state]/page.tsx`
  - `src/app/observerships/specialty/[specialty]/page.tsx`
  - `src/app/recommend/recommend-client.tsx`
  - `src/app/tools/cost-calculator/page.tsx`
  - `src/components/listings/listing-disclaimer.tsx`
  - `src/components/listings/listing-filters.tsx`
  - `src/components/listings/listing-verification-badge.tsx`
  - `src/components/tools/cost-calculator.tsx`
- Forbidden grep this session: ✅ no `sitemap | robots | middleware | redirect | canonical | json-ld | generateMetadata` files modified
- Per-file metadata grep: ✅ zero `metadata | alternates | canonical | openGraph | generateMetadata | jsonLd | JSON.stringify | @context | BreadcrumbSchema` lines diffed in any touched file
- Verdict: **SEO untouched in this session**. All `metadata` exports, `generateMetadata` functions, JSON-LD `<script>` blocks, BreadcrumbSchema mounts, `siteUrl()` calls, and canonical URLs are byte-identical to commit `bfd29d4`.

## Phase 12 — Full local UX QA

| Route | Day | Night | Mobile day | Notes |
|---|---|---|---|---|
| `/` | ✅ | ✅ | ✅ | locked at `bfd29d4`; not edited this session |
| `/browse` | ✅ | ✅ | ✅ | filter card warm cream; chips themed; cards plush |
| `/listing/[id]` | ✅ | ✅ | ✅ | editorial header; sticky CTA card; reviews brass stars |
| `/recommend` | ✅ | ✅ | ✅ | quiz pages themed; results "Programs that fit your answers" |
| `/compare` | ✅ | ✅ | ✅ | warm table; mobile stacked view |
| `/tools/cost-calculator` | ✅ | ✅ | ✅ | estimator card; brass bullet practical notes |
| `/observerships` | ✅ | ✅ | ✅ | by-region eyebrow; state tile grid plush |
| `/observerships/[state]` | ✅ | ✅ | ✅ | warm stat tiles; cross-link strip |
| `/observerships/specialty/[specialty]` | ✅ | ✅ | ✅ | same editorial pass |
| Dashboard surfaces | — | — | — | audit only; defer to P1-2F |

- No horizontal overflow at 375px on any tested page
- No console errors on tested pages (only Fast Refresh logs)
- Search submit on browse page works
- 31+ CTAs verified valid hrefs on homepage; no broken links introduced this session

## Phase 13 — Missed or deferred items

### Honest list of misses

1. **Dashboard surfaces** — 8 files / 1614 LoC remain on slate. By design (audit-only this session). **Action:** P1-2F dashboard transplant.
2. **Auth pages** (`/auth/signin`, `/auth/signup`) — not audited; likely on slate. **Action:** P1-2G auth surfaces.
3. **Admin pages** (`/admin/**`) — explicitly out of scope; will remain on slate.
4. **Poster pages** (`/poster/**`) — 7 routes still on slate; not part of public USCE surface but applicant→poster handoff exists.
5. **`<Select>` UI primitive** — kept on slate to avoid auth form regressions. The 4 new browse/compare/cost surfaces still rely on it; visual mismatch on those 4 surfaces is small but noticeable on close inspection. **Action:** in dedicated PR with auth/dashboard QA.
6. **Static pages** (`/about`, `/methodology`, `/disclaimer`, `/privacy`, `/terms`, `/faq`, `/contact`, `/img-resources`, `/resources`, `/recommend` JSON-LD-only page wrapper, `/community`, `/how-it-works`) — not audited this session.
7. **`/listing/[id]` deeper components**: `<TrustBadges>`, `<ListingTrustMetadata>`, `<FlagButton>`, `<ReviewForm>`, `<ShareButtons>`, `<ListingReverificationNotice>`, `<ReportBrokenLinkButton>` — not visually audited.
8. **`<People AlsoAsk>`** SEO component on browse — not theme-checked.
9. **TermsGate first-load modal** — out of scope per spec.
10. **404 page** — out of scope per spec.
11. **OG image** — out of scope per spec.
12. **Loading states/skeletons** — out of scope per spec.
13. **`src/components/ui/badge.tsx`** primitive — uses semantic variants (success/warning/etc.) — review whether brand-color mapping holds in #37/#38 day theme; deferred.
14. **Mobile menu open state in dark on a deep nested page** — not tested; only home tested earlier.
15. **Hover stability** on listing cards in dark — not deeply tested.
16. **Tooltip color** on US map state hover — not re-checked under #38.
17. **Activity feed accessibility** for screen readers (the live region) — unchanged behaviorally but not retested.
18. **Performance** — single SVG noise texture is now baseline; no further changes this session.
19. **Screenshot tooling intermittent blanking** mid-page — known infra issue; verified via DOM inspection where screenshots failed.
20. **`/recommend` metadata title** still says "Find the Best Observership for You" — kept for SEO; visible page copy already corrected.

### Ready-to-push checklist (when user approves)

- ❌ **PR queue at 7/7 — must close one PR before opening P1-2B**. Likely candidates: `#48` (foundation tokens already merged into local branch), `#50` (theme-lock docs), `#51` (mockup gallery archive). User must decide which to close.
- ✅ Local branch `local/p1-2b-homepage-theme-transplant` is ready for push as `P1-2B` PR (homepage + browse + listing + tools + observerships polish + global consistency)
- ✅ Local commits this session: 4 (`9bc3977`, `5818099`, `042faa9`, `a274724`); + 1 from prior session (`bfd29d4`) — 5 total since `4f6a5f6` (P1-1)
- ⚠️ User should approve before push — commit message volume is large enough that split PRs may be cleaner
- ⛔ **Deployment remains blocked**

## Phase 14 — Final report

**Branch:** `local/p1-2b-homepage-theme-transplant`
**Final commit:** `a274724`
**Commits this session:** 4 (browse 9bc3977, listing 5818099, tools 042faa9, global a274724)
**Total commits since starting `bfd29d4`:** 4

### Files changed by area

| Area | Files |
|---|---|
| Homepage | (untouched this session — locked at `bfd29d4`) |
| Browse | `src/app/browse/page.tsx`, `src/components/listings/listing-filters.tsx` |
| Listing card | (already in theme — untouched) |
| Listing detail | `src/app/listing/[id]/page.tsx` |
| Tools | `src/app/recommend/recommend-client.tsx`, `src/app/compare/compare-client.tsx`, `src/app/tools/cost-calculator/page.tsx`, `src/components/tools/cost-calculator.tsx` |
| Observerships | `src/app/observerships/page.tsx`, `src/app/observerships/[state]/page.tsx`, `src/app/observerships/specialty/[specialty]/page.tsx` |
| Global components | `src/components/listings/listing-disclaimer.tsx`, `src/components/listings/listing-verification-badge.tsx` |
| Dashboard | (audit only — no edits) |
| Docs / log | `docs/platform-v2/local/PATHWAY1_LOCAL_BUILD_LOG.md` (this file) |

### What was built
- Browse page editorial transplant + filter card theme
- Listing detail page editorial transplant
- Recommend / Compare / Cost-calculator tool theme polish + truth-conscious copy
- Observerships index, state, and specialty page transplant
- Global verification-badge + listing-disclaimer token swap

### What was only audited
- Dashboard (8 files, 1614 LoC) — deferred to P1-2F
- Auth pages — deferred to P1-2G

### What was NOT touched
- Sitemap, robots, middleware, redirects, canonical, JSON-LD, generateMetadata
- Schema, migrations, seed, API routes
- /career, /residency, /fellowship namespaces
- Auth/session logic
- Search/filter/ranking logic
- Prisma queries
- TermsGate, 404, OG image, loading states (per spec)

### SEO preservation
- ✅ **Untouched in this session** (verified line-by-line)
- ✅ Layout.tsx unchanged
- ✅ All metadata blocks byte-identical
- ✅ All JSON-LD blocks byte-identical

### Routes / schema / API preservation
- ✅ No new routes added
- ✅ No route URLs changed
- ✅ No schema or migration changes
- ✅ No API route file changes

### /career, /residency, /fellowship preservation
- ✅ Zero diffs in those namespaces (forbidden-path scan run after each phase)

### Build / test results
- `tsc --noEmit`: 0 errors
- `eslint`: 0 errors / 138 pre-existing warnings
- `npm run build`: exit 0, 146 pages generate

### Performance
- Local dev steady: 0.08–0.61s per route (browse can spike when Supabase pool exhausts; this is environmental, not introduced)
- Production unchanged baseline (uscehub.com): 0.22–1.01s

### Mobile QA
- ✅ No horizontal overflow at 375px on any tested route
- ✅ Hamburger menu themed; type-tile labels wrap
- ✅ Floating Compass + Share hidden under md

### Dark-mode QA
- ✅ All transplanted pages render in dark with bright `#0fa595` accents readable
- ✅ Theme persistence working via localStorage + inline pre-paint script
- ✅ No teal-on-charcoal invisibility issues found in transplanted surfaces

### Known missed items
See Phase 13 above (20 items). Honest accounting.

### Deferred work
1. Dashboard transplant (P1-2F)
2. Auth surfaces (P1-2G)
3. Static-page audit (about, methodology, etc.)
4. Listing detail subcomponent visual review
5. Select primitive update (paired with auth/dashboard PR)
6. Badge primitive variant audit

### Local branch status
- ✅ Ready to push when user approves
- ⚠️ PR queue must reduce from 7 to 6 first
- ⛔ No deploy until separate explicit approval

### What PR must close before push
User to choose. Plausible candidates from current queue:
- `#48` build/p1-foundation-tokens-primitives — foundation already in local branch via `4f6a5f6`
- `#50` docs/theme-lock-seo-preservation — informational
- `#51` docs/redesign-mockups-archive — informational

### No push / no PR / no deploy confirmation
✅ **Confirmed.** Branch stays local. PR queue unchanged. No `git push`, no `gh pr create`, no Vercel trigger.

### Next recommended step
1. User reviews this log + 4 local commits.
2. User chooses one PR from queue to close.
3. User explicitly authorizes push of `local/p1-2b-homepage-theme-transplant` (rename to `local/p1-2-public-surfaces` or split into 4 PRs by area: homepage, browse, listing-detail, tools+observerships+global).
4. Then P1-2F dashboard transplant in next autonomous session.

