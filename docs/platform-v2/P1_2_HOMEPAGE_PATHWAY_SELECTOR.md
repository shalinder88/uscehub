# P1-2 Homepage Pathway Selector

**Status:** open as PR (stacked on PR #48 — `build/p1-foundation-tokens-primitives`)
**Branch:** `build/p1-homepage-pathway-selector` (base: `build/p1-foundation-tokens-primitives`, not `main`)
**Sources of truth:**
- [`PATHWAY_DASHBOARD_ARCHITECTURE.md`](PATHWAY_DASHBOARD_ARCHITECTURE.md)
- [`HOMEPAGE_V2_WIREFRAME.md`](HOMEPAGE_V2_WIREFRAME.md)
- [`SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md`](SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md)
- [`FOUNDATION_TOKENS_AND_PRIMITIVES.md`](FOUNDATION_TOKENS_AND_PRIMITIVES.md) (PR P1-1, dependency)

This is the **first user-facing v2 surface**. Manual interaction QA via the preview environment is required before merge.

---

## What changed

| File | Change |
|---|---|
| `src/components/home/pathway-selector-section.tsx` | **new** — client component, soft selector |
| `src/app/page.tsx` | **2-line edit** — adds the import and `<PathwaySelectorSection />` between `<Hero>` and `<ErasCountdown>` |
| `docs/platform-v2/P1_2_HOMEPAGE_PATHWAY_SELECTOR.md` | **new** — this doc |

No other files modified. No new routes. No schema. No API.

---

## Why the selector lives below the hero (not above, not as a modal)

The USCE-first hero is the load-bearing visual anchor of the homepage. Per [`PATHWAY_DASHBOARD_ARCHITECTURE.md`](PATHWAY_DASHBOARD_ARCHITECTURE.md) and the homepage-v2 wireframe, USCE & Match is the launch pathway, so the hero stays USCE-first and the selector is **optional** — labeled with an "Optional" eyebrow.

Three reasons NOT to use a modal or pre-hero selector:
1. **URL-wins doctrine** ([`SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md`](SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md)) — direct shared links must open exactly where they point, with no interstitial. A modal-style selector would block social/search visitors.
2. **No login wall** — the selector must work for unauthenticated visitors with no friction.
3. **No content gating** — the rest of the homepage stays visible to everyone regardless of selection.

So the selector is a quiet section between `<Hero>` and `<ErasCountdown>`. Visitors who scroll past it lose nothing.

---

## Why default is USCE & Match

Pathway #1 is the launch pathway — listings, recommend, compare, cost-estimator, and saved modules are all real-functional today. Pathways 2 (Residency & Fellowship) and 3 (Practice & Career) have content but lighter dashboard surface area at v2 launch. Defaulting to USCE & Match aligns the homepage with the real product center of gravity.

`DEFAULT_PATHWAY_KEY = "usce_match"` is exported from `src/lib/platform-v2/pathways.ts` (PR P1-1). If we ever change the launch pathway, only that constant needs to update.

---

## Behavior

### Selection lifecycle

1. **Initial render (server + first client paint):** the default `usce_match` is selected. Hydration matches.
2. **`useEffect` on mount:** read `localStorage[PATHWAY_LOCALSTORAGE_KEY]`. If a known pathway key is stored, switch to it. Errors swallowed silently (private mode, strict CSP).
3. **User clicks a card:** update local state immediately, then write to localStorage. Errors swallowed silently.
4. **Refresh:** reads from localStorage on next mount, restoring selection.

### What selection does

- Updates the visual `active` state of the cards.
- Updates the bottom-of-section helper line ("Future modules will emphasize ...").

### What selection does NOT do

| Action | Status |
|---|---|
| Navigate to a different route | ❌ never |
| Replace any URL via `router.replace`/`router.push` | ❌ never |
| Read or write a URL search param | ❌ never |
| Set a cookie | ❌ never |
| Send to the server | ❌ never |
| Force login | ❌ never |
| Open a modal | ❌ never |
| Hide other homepage sections | ❌ never |
| Change global theme / color tokens | ❌ never |
| Affect listing data, recommend results, or any current API call | ❌ never (P1-3 will start consuming `selected` for emphasis) |

The cards are pure UI. The localStorage write is the only side effect.

### Reset

The fourth card — **"Show All Pathways"** — saves `all_pathways` and shows the helper line "Showing everything across pathways." It serves as a soft reset.

---

## Accessibility

- Cards render as `<button type="button">` (via `<PathwayCard onSelect>`).
- `aria-pressed={active}` reflects current selection.
- Focus ring matches the rest of the design system (`focus-visible:ring-slate-400`).
- Section heading uses `id="pathway-selector-heading"` and `<section aria-labelledby>`.
- Keyboard: tab through cards in DOM order, `Enter`/`Space` selects.
- Screen reader: each card reads as `<button>` with title + description.

---

## Mobile / responsive

- 1-column on mobile (`grid-cols-1`)
- 2-column on small (`sm:grid-cols-2`)
- 4-column on large (`lg:grid-cols-4`)
- Cards `min-w-0` not required because the grid auto-sizes.
- Section padding scales: `py-12 sm:py-16`.

---

## QA checklist

Manual interaction QA on preview deployment **before merge**:

- [ ] **Fresh visitor** (clear localStorage / incognito): page loads with USCE & Match card active.
- [ ] **Click "Residency & Fellowship"**: that card becomes active, USCE & Match deactivates. Helper line updates to "Future modules will emphasize Residency & Fellowship."
- [ ] **Refresh the page**: Residency & Fellowship still active.
- [ ] **Click "Show All Pathways"**: that card becomes active, helper line says "Showing everything across pathways."
- [ ] **Open `/browse?state=NY` directly**: page opens at the listing browser unchanged. Selector preference does NOT redirect.
- [ ] **Open homepage in a different tab**: each tab maintains its own state until refresh; refresh restores localStorage value.
- [ ] **No login required** for any of the above.
- [ ] **No modal, popup, or full-screen overlay** appears at any point.
- [ ] **Mobile (375px wide)**: cards stack to 1 column, all four readable, tap targets large enough.
- [ ] **Keyboard nav**: Tab moves through cards, `Enter` selects, focus ring visible.
- [ ] **Disable JavaScript**: page still renders the section with the default card visually highlighted (server render does this); selection becomes static but not broken.
- [ ] **Private/incognito mode**: localStorage write may fail silently — selection still updates for the session, just not persisted. Verify no console errors.
- [ ] **Existing homepage sections** (`<Hero>`, `<ErasCountdown>`, `<ActivityFeed>`, `<TrustSection>`, `<FeaturedListings>`, `<ProgramSpotlight>`, `<HowItWorks>`, `<ProgramStats>`, `<MatchCounter>`) all still render in the same order with no visual regressions.
- [ ] **`<FloatingFinder>`** still floats correctly in the corner.

---

## What future PRs will consume

### PR P1-3 — USCE & Match dashboard shell

The dashboard shell at `/dashboard` will read `localStorage[PATHWAY_LOCALSTORAGE_KEY]` (via a small client hook, also added in P1-3) and emphasize modules accordingly:

- `usce_match`: surfaces saved listings, compare, recommend, cost estimator, checklist.
- `residency_fellowship`: surfaces a different module set (TBD; mostly placeholders today).
- `practice_career`: out of scope — see `/career/*` flows.
- `all_pathways`: shows everything.

Per URL-wins, **deep links to specific dashboard tabs override the pathway preference** for that page load.

### PR P1-4 → P1-7

These compose the same primitives further. None of them introduce a redirect or a route-replacement based on pathway. The selector remains a soft preference, never a navigation gate.

---

## Doctrine restated

This PR encodes three doctrines that future surfaces must respect:

1. **URL-wins.** A user's selected pathway is a hint, not a navigation. Direct links beat preferences.
2. **localStorage-only.** Pathway preference never goes to server, URL, or cookie. Anonymous = signed-in here.
3. **No fake.** No counts, no progress, no "X people chose USCE & Match this week" social proof.

---

## What this PR does NOT do

| Forbidden | Status |
|---|---|
| Add new routes | not done |
| Replace homepage | not done |
| Move USCE-first hero | not done |
| Add modal / popup / overlay | not done |
| Force login | not done |
| Block content based on pathway | not done |
| Redirect based on pathway | not done |
| Add cookies | not done |
| Add server-side pathway storage | not done |
| Touch `/career` or `/careers` | not touched |
| Modify schema / migrations / seed | not touched |
| Modify `sitemap.ts` / `robots` / canonical / JSON-LD / redirects / middleware | not touched |
| Add cron / send email / monetization | not touched |
| Modify auth / session logic | not touched |

---

*End of P1_2_HOMEPAGE_PATHWAY_SELECTOR.md. Next: PR P1-3 — USCE & Match dashboard shell.*
