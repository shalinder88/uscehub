# USCEHub v2 — Navigation Model

**Status:** v2 planning doc. Defines desktop nav, mobile nav, footer, breadcrumbs, search placement, and stable-vs-future nav structure.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md), [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md). Where conflict, those win.
**Authored:** 2026-04-29.
**Companion docs:** [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md), [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md), [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md).

---

## 1. Purpose

Define the navigation model that makes the eight-vertical IA from [INFORMATION_ARCHITECTURE.md §3](INFORMATION_ARCHITECTURE.md) usable on desktop and mobile, without introducing nav items that 404 or that lead to skeletal stub pages. Navigation is the most-touched surface on the site — it must be coherent, fast, and honest.

---

## 2. Desktop nav

### 2.1 Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [USCEHub logo]   USCE  Match  Fellowship  Jobs  Visa  Tools  Resources       │
│                                                       [search] [account]     │
│                                                       [For Institutions ↗]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Left:** USCEHub logo + wordmark, links to `/`.
- **Center:** seven primary verticals (USCE, Match, Fellowship, Jobs, Visa, Tools, Resources).
- **Right:** search icon, account / sign-in.
- **Top-right utility:** "For Institutions" small link, separated visually from main nav.

### 2.2 Why "For Institutions" lives in utility nav

Per [INFORMATION_ARCHITECTURE.md §13](INFORMATION_ARCHITECTURE.md) open decision #8 + [PLATFORM_V2_STRATEGY.md §15.2](PLATFORM_V2_STRATEGY.md): the buyer-side surface should not lead user-side nav. Utility-nav placement (top-right, smaller, separated) signals: "this exists for hospitals / recruiters / attorneys" without splitting user attention.

### 2.3 Nav item style

- Active vertical (matches current path): visible underline + bolder weight.
- Hover: subtle underline + darker weight.
- Touch (laptop trackpad / tablet): same as hover.
- Color: slate-700 on white, slate-200 on dark-mode.
- No drop-down menus on initial v2 launch — see §2.4.

### 2.4 No drop-downs at v2 launch

Drop-down nav menus (hover to expand sub-pages) are deferred. Reasons:
- Adds complexity (a11y, keyboard nav, screen reader, mobile parity).
- Surfaces sub-page count = pressure to fill every nav entry with sub-items.
- Slows time-to-click for users who know where they're going.

**Phase C reconsider:** if usage data shows users drop off at vertical landings without engaging deeper, add mega-menu drop-downs that surface key sub-pages.

### 2.5 Nav width and overflow

- Desktop nav assumed minimum width 1024px. At narrower widths, transition to mobile nav at 768px breakpoint.
- If 7 verticals + utility nav overflows at narrower laptop widths (1024-1279px), collapse "Resources" into a "More" dropdown. Verticals priority order if collapsing: USCE, Match, Fellowship, Jobs, Visa, Tools, [Resources collapses first].
- Logo + wordmark may collapse to logo-only at narrow widths.

### 2.6 Sticky behavior

Desktop nav is **sticky** on scroll (always visible at top). Listing detail and long-form blog pages benefit most. Sticky nav has a max-height of 56px to preserve content viewport. Background uses `backdrop-filter: blur(8px)` for legibility over scrolled content.

---

## 3. Mobile nav

### 3.1 Layout — collapsed state

```
┌─────────────────┐
│ [☰]  USCEHub  🔍 │
└─────────────────┘
```

- Hamburger left (opens drawer), wordmark center, search icon right.
- Account icon visible only when logged in (right of search, replaces sign-in CTA).

### 3.2 Layout — expanded drawer (hamburger tap)

```
┌─────────────────┐
│ [×] Close       │
├─────────────────┤
│ USCE            │
│ Match           │
│ Fellowship      │
│ Jobs            │
│ Visa            │
│ Tools           │
│ Resources       │
├─────────────────┤
│ For Institutions│
├─────────────────┤
│ Sign in / Saved │
├─────────────────┤
│ Search          │
│ FAQ             │
│ Methodology     │
│ Contact         │
└─────────────────┘
```

- Drawer slides from left, pushes content right (or full-screen overlay at narrowest widths).
- 7 verticals listed top.
- For Institutions visually separated below verticals.
- Account / sign-in below.
- Quick links to Search, FAQ, Methodology, Contact at bottom.

### 3.3 Mobile sticky behavior

Mobile nav is **sticky on scroll**. The 56px nav stays at top. On scroll-down (away from top), nav can compress to 44px (logo + hamburger only, search icon still visible). On scroll-up gesture, nav re-expands.

### 3.4 Mobile bottom-bar (deferred)

Some mobile sites use a bottom navigation bar (3-5 icons). For v2 launch, **no bottom bar**. Reasons:
- Bottom bar competes with mobile keyboard (interview-mode interaction).
- Eight verticals don't compress cleanly into 5 bottom-bar icons.
- Sticky top nav + hamburger is sufficient.

**Phase C reconsider:** if mobile usage shows scroll fatigue and low return-to-top, add bottom bar with: Home / Search / Saved / Account.

### 3.5 Touch targets

Minimum 44pt × 44pt per Apple HIG / Material guidelines. Hamburger icon, search icon, account icon all meet. Vertical list items in drawer: 48pt height each.

---

## 4. Footer architecture

### 4.1 Desktop footer

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ USCEHub                                                                      │
│                                                                              │
│ Verticals          Tools                  Resources         Legal            │
│   USCE               Save                   Blog              Privacy        │
│   Match              Compare                Methodology       Terms          │
│   Fellowship         Alerts                 IMG Resources     Accessibility  │
│   Jobs               Visa decision helper   FAQ               Disclosure     │
│   Visa               Checklist              Glossary          Cookies (if)   │
│                                             Change log                       │
│                                                                              │
│ About              For Institutions                                          │
│   About us           Claim listing                                           │
│   Contact            Sponsor                                                 │
│   Methodology        Recruiters (Phase C+)                                   │
│                      Attorneys (Phase C+)                                    │
│                                                                              │
│ © 2026 USCEHub. Free for physicians and trainees.                           │
│ Sitemap  ·  Disclosure  ·  Contact                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Footer rules

- Footer mirrors Verticals + Tools + Resources + Legal + About + For Institutions sections.
- Sitemap link in footer (not in main nav).
- Disclosure link surfaces all monetization disclosures per [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md).
- Footer is a real link map, not a sitemap dump — only links to indexable pages per [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md).
- Footer adapts to mobile: stack columns vertically, full-width links.
- Footer is not sticky.

### 4.3 What NOT to put in footer

- Newsletter signup — surfaces a CAN-SPAM-required UX pattern; if/when implemented, must follow [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md) double-opt-in.
- Social proof badges ("As seen in X") — none today, never fabricate.
- Stat counts — those live on homepage stats block per [HOMEPAGE_V2_WIREFRAME.md §9](HOMEPAGE_V2_WIREFRAME.md).
- Marketing taglines — keep footer informational.

### 4.4 Footer copyright + tagline

```
© 2026 USCEHub. Free for physicians and trainees.
```

Reaffirms the buyer/user separation per [PLATFORM_V2_STRATEGY.md §15.1](PLATFORM_V2_STRATEGY.md). "Free" appears in homepage hero AND footer.

---

## 5. Breadcrumbs

### 5.1 When to show

Breadcrumbs appear on pages 2+ levels deep. Not on:
- Homepage (no crumbs needed).
- Top-level vertical landings (`/usce`, `/match`, etc. — these are level 1, no crumbs).
- Audience landings (`/for-img`, etc. — these are siblings of homepage, no crumbs).

Show on:
- Sub-vertical pages (`/usce/observerships`, `/match/strategy`, etc. — level 2+).
- Listing detail (`/usce/[listing-slug]` — level 2).
- Curated state pages (`/usce/observerships/california` — level 3).
- Blog posts (`/resources/blog/[slug]` — level 3).
- Tool detail pages (`/tools/compare` — level 2).

### 5.2 Format

```
Home > USCE > Observerships > California
```

- "Home" links to `/`.
- Each segment links to its own canonical URL.
- Last segment (current page) is **not** a link — visually indicated as current.
- Use `>` or `/` separator — settle in DESIGN_SYSTEM.md.

### 5.3 JSON-LD breadcrumbs

Per [INDEXATION_AND_URL_POLICY.md §6](INDEXATION_AND_URL_POLICY.md), breadcrumbs emit `BreadcrumbList` JSON-LD on all pages where they appear:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://uscehub.com/" },
    { "@type": "ListItem", "position": 2, "name": "USCE", "item": "https://uscehub.com/usce" },
    { "@type": "ListItem", "position": 3, "name": "Observerships", "item": "https://uscehub.com/usce/observerships" },
    { "@type": "ListItem", "position": 4, "name": "California", "item": "https://uscehub.com/usce/observerships/california" }
  ]
}
```

### 5.4 Breadcrumbs and audience filter

If a user lands on `/usce?audience=img`, breadcrumb is still `Home > USCE` (audience is a query param, not a path segment per [INFORMATION_ARCHITECTURE.md §10](INFORMATION_ARCHITECTURE.md)).

---

## 6. Stable current-site nav vs v2 future nav

### 6.1 Current `main` nav (preserve unchanged until v2 launch)

The current live nav stays as-is on `main` during v2 build. Per [PLATFORM_V2_STRATEGY.md §5.1](PLATFORM_V2_STRATEGY.md):

- No new top-nav items on `main`.
- No removal of existing nav items.
- No reordering.
- No styling overhaul.
- Trust copy in nav (if any) follows PR #25 / #27 baseline.

### 6.2 v2 nav (in `redesign/platform-v2` branch only)

The eight-vertical nav lives only in the v2 branch until the launch event. v2 branch's preview deployment is 401-gated by SSO so Google can't index unfinished nav per [PLATFORM_V2_STRATEGY.md §8.4](PLATFORM_V2_STRATEGY.md).

### 6.3 Migration at launch

Single batch event. Nav swaps from current to v2 in one deploy. The `LAUNCH_PLAN.md` (deferred per [PLATFORM_V2_STRATEGY.md §19](PLATFORM_V2_STRATEGY.md)) details the swap process.

---

## 7. Hidden / unlaunched vertical rules

Per [INFORMATION_ARCHITECTURE.md §8](INFORMATION_ARCHITECTURE.md):

### 7.1 Vertical exposure conditions

A vertical appears in nav only if **at least one of**:
- It has a fully built landing page with curated content.
- It has an honest "Coming soon — be the first to know" landing with email signup (per [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md) double-opt-in).

### 7.2 v2 launch exposure plan

Per [INFORMATION_ARCHITECTURE.md §7.2](INFORMATION_ARCHITECTURE.md):

| Vertical | v2 launch status | Nav exposure |
|---|---|---|
| USCE | fully redesigned | yes |
| Match | landing + 1+ guide + IMG-friendly list | yes |
| Fellowship | landing + visa-friendly only | yes (with honest "early" framing in landing copy) |
| Jobs | landing only (skeletal honest empty state) | yes (with honest "Coming soon" framing) |
| Visa | landing + J1 + H1B + Conrad 30 + decision helper | yes |
| Tools | landing + at least 2 tools | yes |
| Resources | live | yes |
| For Institutions | landing + claim flow | yes (utility nav placement) |

### 7.3 What never goes in nav

- Routes that 404.
- Routes that redirect (301 destination should be the nav item, not the source).
- Internal admin routes (`/admin/*`).
- Logged-in dashboard (`/dashboard/*`) — replaced by account icon when logged in.
- Search results (`/search?q=*`) — replaced by search icon.

---

## 8. For Institutions placement

Per §2.2: utility nav, top-right, small, separated. Why:

- User-side nav stays focused on user verticals.
- Hospital / GME / recruiter / attorney users will look for "For Institutions" or "For Hospitals" anyway.
- Utility-nav placement signals: "this is here for buyers, not the main user flow."
- Footer also surfaces full For Institutions link map.

### 8.1 For Institutions sub-nav

When a user lands on `/institutions/*`, the top nav switches to a buyer-side nav:

```
┌──────────────────────────────────────────────────────────────────┐
│ [USCEHub logo]   Claim  Sponsor  Recruiters  Attorneys  Pricing  │
│                                          [back to user site ↗]   │
└──────────────────────────────────────────────────────────────────┘
```

This is a separate nav. Buyer-side nav lives only under `/institutions/*`. Returning to user-side restores the eight-vertical nav.

### 8.2 No mixed-mode nav

Don't mix user-side and buyer-side nav items in a single bar. The audiences are structurally separate per [PLATFORM_V2_STRATEGY.md §15](PLATFORM_V2_STRATEGY.md).

---

## 9. Tools placement

Tools are both a vertical (in nav as `/tools`) AND surfaced contextually in other verticals. Examples:

- USCE listing detail surfaces "Save to compare" + "Add to checklist" buttons.
- Visa hub surfaces "Try the visa decision helper" CTA.
- Match strategy surfaces "Build your timeline" CTA.

Contextual surfaces are page-level CTAs, not nav items. They link to `/tools/<tool>` (canonical) so the destination is consistent.

### 9.1 Why Tools deserves its own vertical

Per [PLATFORM_V2_STRATEGY.md §10](PLATFORM_V2_STRATEGY.md), tools are the durable AI-search-resilient moat. Tools deserve a top-nav item so:
- Returning users can re-find their tools fast.
- AI-search summaries can cite "USCEHub Tools" as a category.
- Tools are discoverable independent of which vertical the user is in.

---

## 10. Jobs / Visa relationship

Jobs and Visa are separate verticals but heavily cross-cut. Examples:

- "J1 waiver jobs" lives at `/jobs/j1-waiver` (canonical) and is deeplinked from `/visa/waiver`.
- "H1B-friendly jobs" lives at `/jobs/h1b-friendly` (canonical) and is deeplinked from `/visa/h1b`.
- Visa decision helper (`/tools/visa-decision-helper`) suggests both visa pathways AND visa-friendly jobs.

### 10.1 Canonical placement rule

When a piece of content fits in two verticals, **canonical lives where the user's primary intent is**. Visa-friendly jobs: user intent is finding a job (Jobs vertical canonical), with visa as a filter. Conrad 30 program info: user intent is understanding the visa pathway (Visa vertical canonical), with state-by-state Jobs as a deeplink from there.

### 10.2 No duplicate URLs

Don't have both `/jobs/j1-waiver` and `/visa/j1-waiver-jobs` — that splits SEO and confuses users. Pick one canonical URL; link to it from the other vertical.

---

## 11. Search

### 11.1 Search placement

- Top nav (desktop): search icon (right side, before account).
- Top nav (mobile): search icon (right side, between hamburger and account).

### 11.2 Search interaction

- Click / tap search icon: opens search overlay (full-screen on mobile, modal-with-blurred-backdrop on desktop).
- Search input is auto-focused.
- As user types, surface 3-5 suggestions: program names, vertical landings, tool names.
- Press Enter: navigate to `/search?q=<term>`.
- Press Esc: close overlay.

### 11.3 Search result page

`/search?q=<term>` returns a results page:
- Header: "Results for: '<term>'"
- Sections: USCE programs (top 5), Match content (top 3), Visa content (top 3), Resources (top 3), Tools (top 2).
- "See all USCE results →" link if more than 5.

### 11.4 Search indexability

`/search?q=*` is `noindex, follow` per [INDEXATION_AND_URL_POLICY.md §4.2](INDEXATION_AND_URL_POLICY.md). Search results are session-specific, not canonical content.

### 11.5 Search implementation

Initially: client-side filter over hydrated listing data + static Match/Visa/Resources content index. Phase C: full-text server-side search via Postgres full-text or external (Algolia / Meilisearch) — schema decision deferred.

---

## 12. No live nav item without a complete page

Reaffirmed (also in [INFORMATION_ARCHITECTURE.md §8.2](INFORMATION_ARCHITECTURE.md)):

A nav item appears if and only if its destination meets ONE of:
- Fully built landing with curated content.
- Honest "Coming soon" landing with double-opt-in email signup.

Forbidden:
- Nav item linking to 404.
- Nav item linking to a half-built page with placeholder content.
- Nav item linking to a sitemap-excluded URL.

If a vertical's content slips during the v2 build, the nav item gets the "Coming soon" treatment OR is removed from nav until ready. Never a broken link.

---

## 13. Dark mode

Current site supports dark mode via `prefers-color-scheme` and a manual toggle. v2 nav inherits:

- Logo: light variant on dark, dark variant on light.
- Nav text: slate-200 on dark, slate-700 on light.
- Active state: blue-300 on dark, blue-700 on light.
- Search icon, account icon: `currentColor` (auto-adapts).
- Drawer: slate-900 on dark, white on light.

Dark mode is not a v2 launch target — it already works. v2 inherits.

---

## 14. Accessibility (a11y)

Nav must meet WCAG AA minimum.

### 14.1 Keyboard nav

- Tab order: logo → nav items (left to right) → search → account → utility.
- Drawer (mobile): Tab cycles through drawer items; Esc closes drawer.
- Search overlay: Tab cycles through suggestions; Esc closes; Enter selects.
- Skip link: "Skip to main content" hidden link visible on focus, jumps past nav.

### 14.2 Screen reader landmarks

- `<nav role="navigation" aria-label="Primary">` for main nav.
- `<nav role="navigation" aria-label="Utility">` for utility nav (For Institutions).
- `<nav role="navigation" aria-label="Footer">` for footer.
- Active nav item: `aria-current="page"`.
- Drawer: `aria-modal="true"` when open.

### 14.3 Color contrast

- All nav text: 4.5:1 minimum vs background.
- Active state: also 4.5:1.
- Hover state: contrast not required to be different (but should be visually distinguishable for sighted users).

### 14.4 Focus visible

All interactive elements show a visible focus ring (browser default or styled). Never `outline: none` without a replacement.

### 14.5 Touch target size

Mobile nav touch targets: 44pt × 44pt minimum. Drawer items: 48pt height.

---

## 15. Performance budget

Nav-specific budget (part of overall homepage perf budget):

| Metric | Target |
|---|---|
| Nav initial render | < 100ms (CSS-rendered, no JS-blocking) |
| Hamburger drawer open animation | < 200ms |
| Search overlay open | < 100ms |
| Search suggestion fetch | < 150ms (client-side) |
| Sticky nav scroll-react | 0ms (CSS-only `position: sticky`) |

Nav is server-rendered HTML + Tailwind-compiled CSS. Drawer state and search overlay state use minimal client JS (React state, no heavy framework).

---

## 16. Internationalization (i18n)

Not a v2 launch target. USCEHub is English-only. Nav assumes English text widths. No `dir="rtl"` support.

If/when i18n is added (Phase D+):
- Nav text becomes a translation key, not a literal string.
- Drawer accommodates wider translations (e.g. German verticals are longer than English).
- `lang` attribute on `<html>` switches per locale.
- `hreflang` JSON-LD for indexable cross-locale URLs.

---

## 17. Implementation note

This nav model is a v2-branch implementation target. **Do not implement on `main`.** Per [PLATFORM_V2_STRATEGY.md §5.1](PLATFORM_V2_STRATEGY.md), nav redesigns belong in Lane 2.

Implementation requires:
- New `src/components/nav/PrimaryNavV2.tsx` and `MobileDrawerNavV2.tsx` and `UtilityNavV2.tsx` and `FooterV2.tsx`.
- New `BreadcrumbsV2.tsx` component used on level 2+ pages.
- New `SearchOverlayV2.tsx` for search.
- Replacement of current `Header` and `Footer` components in `src/app/layout.tsx`.
- Sticky CSS, backdrop-filter, drawer animations.
- a11y audit (axe or Lighthouse) before launch.
- Mobile QA per [PLATFORM_V2_STRATEGY.md §17.3](PLATFORM_V2_STRATEGY.md) gate #5.

---

## 18. Open decisions

1. **Drop-down sub-menus on hover.** Recommend: defer to Phase C.
2. **Bottom mobile bar.** Recommend: defer to Phase C.
3. **For Institutions placement.** Utility nav (recommended) vs main nav (rejected — splits user attention).
4. **Search bar inline vs icon-with-overlay.** Recommend: icon-with-overlay (preserves nav real estate).
5. **Sticky nav opacity / blur.** `backdrop-filter: blur(8px)` recommended; Safari old versions may need fallback.
6. **Logo on mobile — wordmark or icon.** Recommend: wordmark "USCEHub" (matches brand recognition); icon-only at very narrow widths.
7. **Account icon — show always or only when logged in.** Recommend: show "Sign in" when logged out, account avatar when logged in.
8. **Skip-link target.** Recommend: `<main id="main">` as the target.
9. **Footer column count on tablet.** 3 columns at 768-1023px, 4 columns at 1024px+. Recommend: confirm in DESIGN_SYSTEM.md (deferred).
10. **Vertical landing back-to-vertical-index behavior.** When user is on `/usce/observerships`, does nav indicate USCE is active OR Observerships is active? Recommend: USCE active in main nav; sub-nav (separate sticky bar below main nav) shows USCE sub-pages with "Observerships" active.

---

## SEO impact (this doc)

```
SEO impact:
- URLs changed:        none (planning doc only)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no (specs JSON-LD for breadcrumbs, doesn't add)
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal nav planning doc
```

## /career impact

None.

## Schema impact

None.

## Authorization impact

None. Documenting nav is not authorization to implement.
