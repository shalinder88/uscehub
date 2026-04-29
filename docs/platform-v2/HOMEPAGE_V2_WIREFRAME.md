# USCEHub v2 — Homepage Wireframe

**Doc status:** Draft recommendation. **12 open decisions extracted to [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md).** Hero framing (B2), primary CTA count (B3), audience-landing count (B1) all in register.

> **Revision notice (2026-04-29 audit):** §6 Tools block did not credit `/tools/cost-calculator` as already-live (per [EXISTING_SURFACE_INVENTORY.md §2.1](EXISTING_SURFACE_INVENTORY.md)). §11 Footer must include `/community`, `/how-it-works`, `/disclaimer`. §12 "Submit your application" softening — the `Application` Prisma model + `/api/applications` + `/dashboard/applications` exist; whether the flow is real-functional or aspirational is **decision A3** (audit first). §8 "Recently Verified" section currently has only ~20 listings with `lastVerifiedAt` set (per cron health) — implementation must fall back to "Recently updated" gracefully or hide the section until coverage grows.

**Status:** v2 planning doc. Defines the v2 homepage layout, hero pitch, primary paths, trust surface, tools surface, audience surface, and copy rules.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md), and [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md). Where conflict, those win.
**Authored:** 2026-04-29.
**Companion docs:** [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md), [NAVIGATION_MODEL.md](NAVIGATION_MODEL.md), [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md).

---

## 1. Goal

The v2 homepage replaces the current IMG/USCE-first directory hero with a **physician career-pathway platform** hero. It must:

- Reposition the brand from "verified IMG observership directory" to "verified physician career-pathway platform" without overclaiming verticals not yet built.
- Surface 3-5 primary user paths above the fold so the first interaction is a decision, not a scroll.
- Display the trust engine (verification, source tracking, reverify status, broken-link reporting, admin review) prominently — the trust engine is the moat.
- Surface the tools (compare, alerts, save, checklists) prominently — tools are the durable AI-search-resilient moat per [PLATFORM_V2_STRATEGY.md §10](PLATFORM_V2_STRATEGY.md).
- Offer audience-segment landing entry points without making the homepage a wall of audience tiles.
- Stay honest: the current wedge is verified-USCE; future verticals are surfaced as paths but framed honestly when content is thin.

---

## 2. Homepage layout (above-the-fold + scroll)

```
┌─────────────────────────────────────────────────────────────┐
│ Top nav: USCE | Match | Fellowship | Jobs | Visa | Tools |  │
│          Resources | [search] [account/sign-in]             │
│          [For Institutions] (utility nav, top-right small)  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Hero (above-fold):                                          │
│   H1: "Verified clinical training, match prep, visa,        │
│        and physician career pathways — in one place."       │
│   Sub: "Free for physicians and trainees. Trusted source    │
│        links, current verification status, and the tools    │
│        to plan every step."                                  │
│                                                             │
│   Primary paths (3-5 buttons):                              │
│     [Find USCE]  [Plan Match]  [Find Visa-Friendly Jobs]    │
│     [Build My Checklist]                                    │
│                                                             │
│   Trust microcopy:                                          │
│     "156 programs with an official source on file. Cron-    │
│      verified daily. Admin-triaged when sources break."     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Audience block (compact tiles):                             │
│   [I'm an IMG] [I'm a US student/grad] [I'm a resident]    │
│   [I'm a fellow] [I'm a new attending]                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Trust engine block:                                         │
│   "How verification works"                                  │
│   ┌─ Official source tracking ─────────────────────────┐    │
│   │ Every listing links to the program's own page.    │    │
│   │ We never list a program without a source.         │    │
│   └────────────────────────────────────────────────────┘    │
│   ┌─ Last verified dates ──────────────────────────────┐    │
│   │ Each listing shows when we last checked the link.  │    │
│   │ Older than 1 year? We mark it for reverification.  │    │
│   └────────────────────────────────────────────────────┘    │
│   ┌─ Broken-link reporting ────────────────────────────┐    │
│   │ Found a broken link? One click reports it.         │    │
│   │ Admin reviews within 7 days.                       │    │
│   └────────────────────────────────────────────────────┘    │
│   ┌─ Admin / human review ─────────────────────────────┐    │
│   │ When automated checks can't verify, a human does. │    │
│   │ See our [methodology] for the full process.       │    │
│   └────────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Tools block:                                                │
│   "Tools to plan every step"                                │
│   [Save listings] [Compare programs] [Get alerts]           │
│   [Build checklist] [Visa decision helper]                  │
│   (Each tile links to /tools/<tool>)                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Featured / recently verified:                               │
│   "Recently verified programs" (5-10 cards from cron-fresh) │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Stats block:                                                │
│   304 opportunities indexed │ 156 with official source     │
│   on file │ 37 states │ Updated April 2026                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Methodology / FAQ teaser:                                   │
│   [How USCEHub works] [FAQ] [Methodology]                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Footer:                                                     │
│   Resources | Tools | About | Privacy | Terms | Disclosure  │
│   For Institutions | Sitemap | Contact                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Hero — message options

The hero H1 is the single highest-leverage piece of copy on the entire site. AI search (Google AI Overview, Perplexity, ChatGPT search, Claude web tool) will index this string. Three candidate framings:

### 3.1 Framing A — Pipeline-platform (recommended)

**H1:** "Verified clinical training, match prep, visa, and physician career pathways — in one place."

**Sub:** "Free for physicians and trainees. Trusted source links, current verification status, and the tools to plan every step."

**Why:** Names the long-term thesis (whole-pipeline) without overclaiming; "in one place" implies aggregation, not authorship of every layer. "Free" is the §15 buyer/user separation signal up front. "Trusted source links" + "current verification status" surfaces the trust engine.

**Risk:** "Match prep, visa, and physician career pathways" is broader than current built content. Mitigated by honest empty-state pages on `/match`, `/visa`, `/jobs`. If audited, we can defend "in one place" because the source-of-record links and tools are real even where content is thin.

### 3.2 Framing B — Trust-engine-first

**H1:** "The trust engine for U.S. clinical training, match, and physician careers."

**Sub:** "Every listing links to the program's official source. Verified daily. Triaged by humans when machines can't tell."

**Why:** Leads with the moat. Narrower claim, harder to overclaim against.

**Risk:** "Trust engine" is industry-jargon; user readability lower. Less inviting for first-time visitors who haven't been burned by bad data yet.

### 3.3 Framing C — Wedge-first (current)

**H1:** "Verified U.S. Clinical Experience Programs for IMGs"

**Why:** Current live homepage. Honest about the wedge.

**Risk:** Anchors brand to the wedge forever. Master Blueprint §0 anti-narrowing rule rejects this for v2.

### 3.4 Recommendation

**Framing A.** Repositioning to pipeline-platform is the strategic point of v2; honest empty states on the unbuilt verticals close the overclaim risk; "free" + "trusted" + "in one place" maps to the brand thesis.

### 3.5 Sub-copy variants under Framing A

Different audiences need different sub-copy emphasis. Test these post-launch (one homepage, one sub-copy at a time — never A/B test the H1):

- **IMG-leaning:** "Free for IMGs and U.S.-trained physicians. Verified source links, visa-aware filters, and tools to plan every step from USCE through attending."
- **Trust-leaning:** "Free. Every listing links to the program's official source, with the last verified date on every card."
- **Tools-leaning:** "Free. Save, compare, get alerts, and build your career checklist — all in one place."

**Default sub-copy for v2 launch:** the trust-leaning variant. Maps to the strongest moat per [PLATFORM_V2_STRATEGY.md §10](PLATFORM_V2_STRATEGY.md).

---

## 4. Primary user paths (CTA buttons)

Five candidates, choose 3-5 for above-the-fold. Each maps to a vertical or tool.

### 4.1 Path candidates

| Button | Destination | Audience | Maps to |
|---|---|---|---|
| Find USCE | `/usce` | IMG, US student/grad | Vertical: USCE |
| Plan Match | `/match` | IMG, US student/grad | Vertical: Match |
| Explore Fellowship | `/fellowship` | resident, fellow | Vertical: Fellowship |
| Find Visa-Friendly Jobs | `/jobs/h1b-friendly` (or `/jobs`) | IMG attending, fellow, resident | Vertical: Jobs |
| Visa Decision Helper | `/tools/visa-decision-helper` | IMG resident/fellow/pre-attending | Tool |
| Build My Checklist | `/tools/checklist` | all stages | Tool |
| Compare Programs | `/tools/compare` | all | Tool |
| Save Listings | `/dashboard/saved` (or sign-in) | logged-in | Tool |

### 4.2 v2 launch primary set (recommended 4)

```
[Find USCE]  [Plan Match]  [Find Visa-Friendly Jobs]  [Build My Checklist]
```

**Why these four:**
- USCE is the current strongest surface — keep its primary entry above the fold.
- Match is the highest-volume residency-stage need.
- Visa-friendly Jobs is the most underserved attending-stage need + uniquely USCEHub's lane (FREIDA/Residency Explorer don't cover visa-friendly attending jobs).
- Checklist tool surfaces the "tool moat" per §10 of the strategy doc.

**Why not Fellowship in primary 4:** Fellowship is high-value but lower-volume; deserves its own nav slot but not primary above-fold real estate at v2 launch. Promote later if Fellowship usage signals demand.

**Why not Compare or Save in primary 4:** Tools are surfaced in the dedicated Tools block lower on the homepage; primary above-fold should be vertical entries that lead the user into a workflow.

### 4.3 Visual treatment

- Buttons render as 4 equal-width primary buttons on desktop (single row).
- On mobile, stack to 2x2 grid; never 4x1 vertical scroll.
- Each button has an icon + verb-noun label + microcopy ("Verified clinical training" under "Find USCE").
- Button colors map to vertical: USCE blue, Match emerald, Jobs purple, Checklist amber. (Final palette in DESIGN_SYSTEM.md, deferred.)

---

## 5. Trust engine block

This is the differentiator. Per [PLATFORM_V2_STRATEGY.md §10](PLATFORM_V2_STRATEGY.md), trust + structured data + tools is the moat against AI-summary scraping. The trust engine block must be visually prominent, not buried below a 4th scroll.

### 5.1 Block content

```
"How verification works"

┌─ Official source tracking ──────────────────────────┐
│ Every listing links to the program's own page.     │
│ We never list a program without a source.          │
└─────────────────────────────────────────────────────┘

┌─ Last verified dates ───────────────────────────────┐
│ Each listing shows when we last checked the link.   │
│ Older than 1 year? We mark it for reverification.   │
└─────────────────────────────────────────────────────┘

┌─ Broken-link reporting ─────────────────────────────┐
│ Found a broken link? One click reports it.          │
│ Admin reviews within 7 days.                        │
└─────────────────────────────────────────────────────┘

┌─ Admin / human review ──────────────────────────────┐
│ When automated checks can't verify, a human does.   │
│ See our [methodology] for the full process.         │
└─────────────────────────────────────────────────────┘
```

### 5.2 Trust legend (separate, on browse + listing pages)

The trust-state legend per [INFORMATION_ARCHITECTURE.md §14.1](INFORMATION_ARCHITECTURE.md) maps to the [PLATFORM_V2_STRATEGY.md §4.4](PLATFORM_V2_STRATEGY.md) `LinkVerificationStatus` enum:

| Badge | Color | Meaning |
|---|---|---|
| Verified | green | `VERIFIED` + `lastVerifiedAt` set, freshly checked |
| Official source on file | slate | `VERIFIED` (legacy) or `VERIFIED` without recent reverify |
| Source needs review | amber | `NEEDS_MANUAL_REVIEW` — admin queue |
| Reverifying | slate | `REVERIFYING` — cron picked it up |
| Source no longer responds | red | `SOURCE_DEAD` (admin-only) |
| Program closed | red | `PROGRAM_CLOSED` (admin-only) |
| No official source available | red | `NO_OFFICIAL_SOURCE` (admin-only) |

The legend itself is **not** on the homepage (too much detail). A "Learn how verification works →" link from the trust block points to `/resources/methodology` where the full legend lives.

### 5.3 Copy rules for trust block

- Never use the word "verified" without referring to the strict `VERIFIED + lastVerifiedAt` cohort.
- Never imply a guarantee ("100% accurate") — verification is "checked," not certified.
- Never imply real-time monitoring ("verified live every minute") — daily cron + admin-on-demand is the contract.
- Never overclaim coverage ("all 304 listings verified") — be specific about what's verified vs official-source-on-file.

---

## 6. Tools block

The Tools block sits below the Trust block. It surfaces the durable workflow moat per [PLATFORM_V2_STRATEGY.md §10](PLATFORM_V2_STRATEGY.md).

### 6.1 Tools to surface at v2 launch

| Tool | URL | Status | Homepage tile? |
|---|---|---|---|
| Save listings | `/tools/saved` (logged-in) | live | yes |
| Compare programs | `/tools/compare` | live | yes |
| Get alerts | `/tools/alerts` | preview-only per [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md) | yes (with "preview" label until real send authorized) |
| Build checklist | `/tools/checklist` | not built; v2 launch target | yes |
| Visa decision helper | `/tools/visa-decision-helper` | not built; v2 launch target | yes |

### 6.2 Tools deferred to Phase C+

- Fellowship competitiveness helper
- Cost calculator
- Timeline builder
- Email-gated PDF exports

These don't appear on the v2 launch homepage. Surface them on `/tools` index only.

### 6.3 Tools tile layout

5 equal-width tiles on desktop (single row); 2x3 grid (with one half-width) on mobile, or 1x5 vertical scroll if mobile width too narrow.

Each tile: icon + tool name + 1-line description + "Open tool →" link.

---

## 7. Audience block

The audience block lets first-time visitors self-route. It is **not** the primary CTA — primary CTAs are the vertical paths in §4. The audience block is a secondary surface for visitors who don't know where to start.

### 7.1 Audience tiles

```
[I'm an IMG]              → /for-img
[I'm a US student/grad]   → /for-us-students
[I'm a resident]          → /for-residents
[I'm a fellow]            → /for-fellows
[I'm a new attending]     → /for-new-attendings
```

**5 tiles total.** Each tile is small (icon + label only). On click, takes user to the curated audience landing page per [INFORMATION_ARCHITECTURE.md §4.1](INFORMATION_ARCHITECTURE.md).

### 7.2 Why 5, not 6

`/for-attendings` covers established attendings with broader needs. `/for-new-attendings` is the high-leverage subset (visa, contracts, insurance, financial setup). The general "attending" tile is omitted from the homepage to avoid splitting attention; established attendings are likely already navigating to `/jobs`, `/visa`, or `/institutions/contract-review` directly. Surface `/for-attendings` link in `/for-new-attendings` for users who want broader content.

### 7.3 Visual treatment

Compact, subdued styling — these are secondary CTAs. Below the trust block, above the tools block. Not a full hero treatment.

---

## 8. Featured / recently verified section

Pulls 5-10 listings from the live DB where:
- `LinkVerificationStatus = VERIFIED` AND `lastVerifiedAt` is within last 90 days (Current freshness tier per [DATA_FRESHNESS_SLA.md](DATA_FRESHNESS_SLA.md))
- `status = APPROVED`
- Diversified across specialty + state (no 5x cardiology or 5x California)

Display as listing cards with trust badge, source link, deadline, cost, location.

### 8.1 Why "Recently Verified" not "Featured"

"Featured" implies editorial selection. We don't pay for placement. "Recently Verified" is honest data signal: these are the listings the cron just confirmed.

### 8.2 Caveat

If the freshly-verified pool has < 5 listings, fall back to "Verified within last 6 months" (Aging tier). If still < 5, fall back to "Recently updated" (any field updated). Never hide the section if backed by current data; never include legacy backfilled listings here (those go in /browse).

---

## 9. Stats block

Per [PLATFORM_V2_STRATEGY.md §16.3](PLATFORM_V2_STRATEGY.md), public-facing metrics are conservative.

```
304 opportunities indexed │ 156 programs with official source on file │ 37 states │ Updated April 2026
```

These four claims map to `SITE_METRICS_DISPLAY` per [src/lib/site-metrics.ts](../../src/lib/site-metrics.ts) (post-PR #25 merge).

### 9.1 What the stats say (and don't)

- "304 opportunities indexed" — total, including historical. Includes everything tracked, not just current.
- "156 programs with official source on file" — broad official-source count (legacy `linkVerified=true`, equivalent to current `VERIFIED` regardless of `lastVerifiedAt`). Honest.
- "37 states" — distinct states with at least one indexed program.
- "Updated April 2026" — last refresh label.

### 9.2 What we don't show on homepage

- "{N} verified programs" — not until §17.3 readiness gate #1 + §11 freshness threshold per [DATA_FRESHNESS_SLA.md](DATA_FRESHNESS_SLA.md).
- "{N} active users" — privacy-sensitive, not necessary to surface.
- "{N} broken links resolved" — internal trust metric, not public.

---

## 10. Methodology / FAQ teaser

A small section near the bottom that links to depth content:

```
[How USCEHub works →]      → /resources/methodology
[FAQ →]                    → /resources/faq
[Verification methodology] → /resources/methodology#verification
```

These are linked from the trust block and the footer too; the homepage teaser is a third surface for users who scroll deep without engaging with primary CTAs.

---

## 11. Footer

```
┌─────────────────────────────────────────────────────────────┐
│ USCEHub                                                     │
│                                                             │
│ Resources              Tools                  Verticals     │
│   Blog                   Save                   USCE         │
│   Methodology            Compare                Match        │
│   IMG Resources          Alerts                 Fellowship   │
│   FAQ                    Visa decision helper   Jobs         │
│   Glossary               Checklist              Visa         │
│   Change log                                                 │
│                                                             │
│ About                  For Institutions       Legal         │
│   About us               Claim listing          Privacy      │
│   Contact                Sponsor                Terms        │
│   Methodology            Recruiters             Accessibility│
│                          Attorneys              Disclosure   │
│                                                              │
│ © 2026 USCEHub. Free for physicians and trainees.           │
│ [Sitemap]  [Disclosure]  [Contact]                           │
└─────────────────────────────────────────────────────────────┘
```

### 11.1 Footer rules

- Footer mirrors verticals + tools + resources + legal + buyer-side.
- For Institutions appears in footer **and** in the small utility nav (top-right).
- Sitemap link is in footer (not in main nav).
- Disclosure link surfaces all monetization disclosures per [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md).
- Contact link uses email (no contact form yet) until [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md) supports form-to-email cleanly.

---

## 12. What NOT to show on v2 homepage

- "Submit your application through the platform" — overclaim if not actually true. Removed from current copy.
- "Hand-picked strongest USMLE Match credibility" — no defined scoring rubric exists; remove.
- "100% accurate" or "Guaranteed verified" — never.
- Fake testimonials (we don't have testimonials yet; never fabricate).
- "Trusted by hospitals" — not until institutions actually claim listings.
- Skeleton listings or fake stat counts.
- Sponsored content above the fold (not until [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md) explicitly authorizes — never above the fold per §12.1).
- "AI-powered" badges (we use no AI in production today; if/when we do, label honestly and gate per a separate AI policy doc).
- Email signup CTA above the fold without explicit double-opt-in flow (per [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md)).

---

## 13. Mobile layout

### 13.1 Mobile above-the-fold

```
┌─────────────────┐
│ [☰] USCEHub  🔍 │
├─────────────────┤
│                 │
│ H1 (compact):   │
│ Verified        │
│ clinical        │
│ training, match │
│ prep, visa, and │
│ careers — in    │
│ one place.      │
│                 │
│ Sub: Free.      │
│ Trusted source  │
│ links.          │
│                 │
│ [Find USCE]     │
│ [Plan Match]    │
│ [Visa-friendly  │
│  Jobs]          │
│ [Checklist]     │
│                 │
│ "156 programs   │
│ with official   │
│ source on file" │
│                 │
└─────────────────┘
```

- Hamburger menu collapses 8 verticals.
- Search icon top-right.
- Hero stacks: H1 → sub → 4 buttons (full-width, stacked).
- Trust microcopy below buttons.

### 13.2 Mobile scroll order

1. Hero (above-fold)
2. Audience tiles (5, scrollable horizontal carousel)
3. Trust block (4 cards stacked vertical)
4. Tools block (5 tiles, 2x3 grid)
5. Recently Verified (5 listing cards stacked)
6. Stats (single horizontal stat strip)
7. Methodology teaser
8. Footer

### 13.3 Mobile-specific rules

- Sticky nav (8 verticals collapse into hamburger; "Find USCE" / "Search" / "Account" pin to top).
- One-tap to search from any homepage scroll position.
- Buttons sized for thumb (min 44pt tap target).
- No hover states; all CTAs visible-on-load.
- Verify mobile width breakpoints: 320px (oldest small mobile), 375px (iPhone mini), 414px (iPhone Plus/Pro Max), 768px (tablet).

---

## 14. CTA hierarchy

Top to bottom, the homepage offers these CTAs in priority order:

1. **Primary (above-fold):** 4 vertical-entry buttons.
2. **Secondary (audience):** 5 audience tiles.
3. **Tertiary (trust):** "Learn how verification works" link in trust block.
4. **Tools surfaces:** 5 tool tiles.
5. **Recently Verified:** browse-deep entry.
6. **Methodology / FAQ:** education entries.
7. **Footer:** wide menu.

CTA hierarchy is intentional: if a visitor reads only the hero, they should still know what USCEHub is + have 4 obvious next steps. If a visitor scrolls deep, the homepage should reward depth with progressively more specialized surfaces.

---

## 15. Copy rules

### 15.1 Verification language

Per [PLATFORM_V2_STRATEGY.md §4.4](PLATFORM_V2_STRATEGY.md) and PR #25 / #27 baseline:

- "Verified" only refers to `VERIFIED + lastVerifiedAt` cohort (currently ~20 listings).
- "Programs with official source on file" refers to broader cohort (currently 156).
- "Listed" or "indexed" refers to anything in the DB regardless of verification.
- Never use "checked," "approved," "vetted," "audited" interchangeably with "verified" — those have specific FDA/legal meaning we don't claim.

### 15.2 Audience language

- "Free for physicians and trainees" — not "for IMGs only" (anti-narrowing rule per Master Blueprint §0).
- "U.S. clinical experience" not "USCE for IMGs" in homepage hero (USCE applies to USMG visiting students too).
- "Match prep" not "IMG match prep" in homepage (IMG-specific framing lives on `/for-img` and `/match/strategy/img`).
- "Visa-friendly jobs" not "IMG jobs" — accurate, less narrow.

### 15.3 Forbidden words on homepage

- "Best" / "leading" / "premier" / "top" — undefendable superlatives.
- "Largest" — `SITE_METRICS.opportunitiesIndexed` is 304; that's not the largest by any objective measure (FREIDA has 13,000+ residency programs). "Largest verified IMG observership directory" might be defensible but invites scrutiny.
- "Trusted by thousands" / "millions" — no proof.
- "Fast-growing" / "viral" — vanity metric framing.
- "Revolutionary" / "disruptive" — physician trainees don't reward marketing copy.
- "AI-powered" — see §12.

### 15.4 Mandatory phrases

- "Free" appears at least once above the fold.
- "Source links" or "official source" appears at least once above the fold.
- "Verified" or "verification" appears in the trust block.
- "Updated {month year}" appears in stats block.
- USCEHub canonical positioning per [USCEHUB_MASTER_BLUEPRINT.md §3](../codebase-audit/USCEHUB_MASTER_BLUEPRINT.md): "USCEHub is a free physician training and career pathway platform for U.S. clinical experience, residency, fellowship, visa navigation, and attending transition." Variant of this in About / methodology page; full-fidelity not required on homepage.

---

## 16. JSON-LD on homepage

Per [INDEXATION_AND_URL_POLICY.md §6](INDEXATION_AND_URL_POLICY.md):

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "USCEHub",
  "url": "https://uscehub.com",
  "description": "Free physician career-pathway platform: verified clinical training, match prep, visa navigation, and physician careers.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://uscehub.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

Plus `Organization` schema for USCEHub itself (name, URL, logo, contact email, description).

---

## 17. Wireframe in text sections (detail)

### 17.1 Hero details

- Background: subtle gradient from cool slate to white (or dark mode equivalent). No imagery overlay (imagery often = stock-photo-look = trust-eroding).
- H1 typography: large, sans-serif, weight 700-800. ~48-64pt desktop, ~32-40pt mobile.
- Sub: weight 400, ~18pt desktop / ~16pt mobile, color slate-600.
- Buttons: pill or slightly rounded rectangle, weight 600 label.
- Trust microcopy: italics, slate-500, ~14pt.
- No animation on initial load (perf + a11y).

### 17.2 Audience tile details

- Tile background: light slate (#F8FAFC) / dark slate equivalent.
- Tile content: emoji-or-icon + label.
- Hover: slight scale + border accent.
- Touch (mobile): visible press state, ~50ms feedback.

### 17.3 Trust card details

- 2x2 grid on desktop, 1x4 stack on mobile.
- Each card: icon (Lucide icon — ShieldCheck, Clock, Flag, UserCheck) + heading + 2-line description.
- Card background: white/dark surface, subtle border.
- "Learn how verification works →" link below all four cards.

### 17.4 Tool tile details

- 5 tiles, equal width on desktop.
- Each tile: icon + name + description + "Open tool →" link.
- Tools currently in preview-only state (alerts) get a small "Preview" badge.

### 17.5 Recently Verified card details

- Listing card per [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md) §3.
- Trust badge top-right of each card.
- Source-link button distinct from "View details" button (source link → external; details → internal).

---

## 18. Open decisions for user review

1. **Hero framing A vs B.** Pipeline-platform (recommended) vs trust-engine-first.
2. **Number of primary CTAs.** 3, 4, or 5? Recommended 4. (Adding "Visa decision helper" or "Compare" as 5th may dilute decision.)
3. **Audience block placement.** Above trust block (current proposal) vs below trust block (audience self-routes after seeing trust signal). Recommend: above, audience is high-information-density sniff test.
4. **Stats block placement.** Below or above tools? Recommend: below tools (lets tools draw scroll-deep users; stats reinforce credibility for users still deciding).
5. **Recently Verified vs Featured.** Recommend: Recently Verified (honest data signal). User decides if "Featured" framing is allowed once curated featured listings exist (none today).
6. **Audience tile count.** 5 (current proposal) vs 6 (add `/for-attendings` general). Recommend: 5; established attendings have direct routes via `/jobs` and `/visa`.
7. **Logo + tagline above hero.** Some sites put a brand line above H1 ("USCEHub: physician careers, verified"). Recommend: skip — H1 is the hero; brand identity is in the top nav logo.
8. **Search bar above-fold.** Some sites surface a search box in the hero ("Search 304 programs..."). Recommend: skip on v2 launch; search icon in top nav is sufficient. Reconsider Phase C.
9. **Newsletter signup above-fold.** Recommend: no. Per [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md), email signup requires real prerequisites; surfacing it above fold without those is a dark pattern.
10. **Dark mode default.** Current site supports dark mode. Recommend: respect `prefers-color-scheme` (no default override).
11. **Animation on hero.** Recommend: none. Performance + a11y + readability win over delight here.
12. **Trust block — 4 cards vs 3 cards.** Could collapse "Admin / human review" into "Broken-link reporting" copy. Recommend: keep 4 cards — each is a distinct trust signal; 4 cards reads as more thorough.

---

## 19. Implementation note

This wireframe is a v2-branch implementation target. **Do not implement on `main`.** Per [PLATFORM_V2_STRATEGY.md §5.1](PLATFORM_V2_STRATEGY.md), homepage redesigns belong in Lane 2.

Implementation requires:

- New `src/app/page.tsx` (full v2 homepage) on `redesign/platform-v2` branch
- New components: `HeroV2`, `AudienceTiles`, `TrustEngineBlock`, `ToolsBlock`, `RecentlyVerifiedSection`
- Live data binding for "Recently Verified" via Prisma (existing `Listing` queries + freshness filter)
- New JSON-LD per §16
- New canonical URL handling (`/` is canonical for homepage)
- Mobile-first CSS per §13.3
- Accessibility audit (WCAG AA minimum, 4.5:1 contrast, keyboard nav, screen-reader landmark roles)
- Copy review for §15 compliance
- Per [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md) — homepage shares the global template (header, footer); only main content varies

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
- JSON-LD changed:     no
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal wireframe doc
```

## /career impact

None.

## Schema impact

None. The "Recently Verified" section uses existing `Listing` schema + existing freshness fields.

## Authorization impact

None. Documenting the homepage wireframe is not authorization to implement it. Implementation is gated per §19.
