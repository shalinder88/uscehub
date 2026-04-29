# USCEHub v2 — Shared-Entry and Social-Distribution Architecture

**Doc status:** Binding once approved. Defines how direct shared links, pathway preference, social previews, canonical URLs, UTMs, and social/referral landing behavior interact.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md), and [PATHWAY_DASHBOARD_ARCHITECTURE.md](PATHWAY_DASHBOARD_ARCHITECTURE.md). Where conflict, those win.
**Authored:** 2026-04-29.
**Companion docs:** [PATHWAY_DASHBOARD_ARCHITECTURE.md](PATHWAY_DASHBOARD_ARCHITECTURE.md), [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md), [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md), [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md).

> **The single most important rule in this doc:** the URL the user clicked is the page the user gets. Pathway preference orients; it does NOT block, redirect, or replace.

---

## 1. Executive decision

**The URL wins. Pathway cache personalizes secondary modules only. The pathway selector never blocks search/social/referral visitors.**

### 1.1 Locked rules

```
1. Direct shared links always open the clicked page.
2. Pathway cache personalizes secondary modules only.
3. Pathway selector never blocks search/social/referral visitors.
4. No modal before content.
5. No redirect to dashboard from public pages.
6. No forced account creation.
7. Shared pages must be standalone landing pages.
8. UTM parameters never create indexable duplicates.
9. Canonical URL strips UTM and personalization state.
10. localStorage may show pathway cue/pill — never redirect.
```

### 1.2 Why this matters

USCEHub plans heavy direct sharing on Twitter/X, Reddit, WhatsApp, LinkedIn, newsletters, and quoted in physician communities. Every shared link is a single chance:

- A new user clicking from Reddit r/IMG to a J1 waiver job listing
- A returning user clicking a Twitter thread about USCE programs in California
- A WhatsApp share of a fellowship strategy guide
- A LinkedIn post linking to a contract review checklist

If pathway preference (cached or otherwise) hijacks any of these clicks — by showing a modal, redirecting to `/dashboard`, or replacing the content — we lose the click, the trust, and the SEO value.

### 1.3 What this doc is NOT

- Not authorization to implement. Implementation requires explicit user approval.
- Not a UI specification. Visual design lives elsewhere.
- Not a schema specification. Pathway preference at v2 launch is anonymous-only via localStorage per [PATHWAY_DASHBOARD_ARCHITECTURE.md §14](PATHWAY_DASHBOARD_ARCHITECTURE.md).
- Not a launch plan. Sequencing per §14 below.

---

## 2. Entry precedence model

### 2.1 Priority order (binding)

When determining what content to show + how to frame it, evaluate in this order:

```
1. Explicit URL intent       — what URL did the user click?
2. Page type / content pathway — which pathway does this URL belong to?
3. UTM/share campaign context — what referral context did the URL carry?
4. Logged-in profile preference — future only; requires authorized schema PR
5. localStorage pathway preference — anonymous v2-launch state
6. All Pathways default     — fallback for first-time visitors
```

### 2.2 The destination rule

**Levels 1 + 2 determine the destination (the page rendered).**

```
Level 1 wins. Level 2 supports.
The clicked URL renders. The page's primary pathway tag determines framing.
Levels 3-6 do NOT change the destination.
```

### 2.3 The personalization rule

**Levels 3 + 4 + 5 + 6 determine the framing (cues, related content, sidebar modules).**

```
Level 3 (UTM): may alter analytics tagging + alert subscription default.
Level 4 (profile): may alter related-content order + cue copy. Future only.
Level 5 (localStorage): may alter related-content order + cue copy + sidebar modules.
Level 6 (default): no personalization; show pathway-tagged content per Level 2.
```

### 2.4 Examples

**Example A — pathway-cache mismatch (anonymous):**

```
User has localStorage pathwayPreference = usce_match
User clicks Reddit thread linking to /jobs/j1-waiver-hospitalist-ohio
→ Page renders /jobs/j1-waiver-hospitalist-ohio (URL wins)
→ Page's primary pathway tag = practice_career
→ Cue shown: "Viewing Practice & Career content. Your saved pathway is USCE & Match."
→ Buttons: [Keep browsing] [Switch to Practice & Career]
→ NO redirect to /usce or /dashboard
→ NO modal
```

**Example B — pathway-cache match (anonymous):**

```
User has localStorage pathwayPreference = practice_career
User clicks Twitter share of /jobs/j1-waiver-hospitalist-ohio
→ Page renders the J1 job
→ Page's primary pathway tag = practice_career
→ Cue shown (subtle): "Viewing Practice & Career content."
→ No mismatch warning
→ Related content prioritized for Practice & Career
```

**Example C — first-time visitor (no cache):**

```
User has no localStorage preference
User clicks Google search result for /usce/new-york/internal-medicine
→ Page renders the USCE state-specialty page
→ Page's primary pathway tag = usce_match
→ No mismatch cue (no preference to mismatch with)
→ Related content prioritized for USCE & Match
→ Optional small "Choose your path" pill at bottom of page
```

**Example D — logged-in user with profile mismatch (future):**

```
User logged in; profile.pathwayPreference = residency_fellowship
User clicks newsletter link to /tools/visa-decision-helper
→ Tool renders at /tools/visa-decision-helper
→ Page's primary pathway tag = practice_career (sub-state visa_dependent)
→ Cue: "This tool is most useful for the Practice & Career pathway."
→ User's saved Path 2 preference unchanged
→ Tool result page generates per the actual decision-tree input, not pathway
```

### 2.5 What localStorage NEVER does

- Never redirects the URL.
- Never changes the canonical URL.
- Never replaces page content.
- Never hides primary content behind a modal.
- Never forces a re-prompt before content loads.

---

## 3. Shared-entry UX

### 3.1 Direct shared page layout (desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] USCE | Match | Fellowship | Jobs | Visa | Tools | Resources │
│                          [Pathway: USCE & Match ▾] [Sign in]       │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Page title (H1, large, immediate)                                 │
│  J1 Waiver Hospitalist Jobs in Ohio                                │
│                                                                    │
│  One-line "who this is for"                                        │
│  Source-linked physician jobs with visa pathway notes.             │
│                                                                    │
│  Trust strip (if applicable)                                       │
│  ✓ Verified · Last updated April 2026 · Source: DOL LCA + program │
│                                                                    │
│  Optional small pathway cue (NOT modal)                            │
│  Viewing: Practice & Career                                        │
│  ─                                                                 │
│                                                                    │
│  Main content (immediately visible)                                │
│  - Job listings (Verified per Phase 3 trust contract)              │
│  - Apply links                                                     │
│  - Visa pathway notes                                              │
│                                                                    │
│  Right rail / below content:                                       │
│  Related in this pathway                                           │
│  - More J1 waiver jobs                                             │
│  - H1B-friendly jobs                                               │
│  - Conrad 30 state guide                                           │
│  - Contract checklist                                              │
│  - Immigration attorney resources                                  │
│                                                                    │
│  Bottom:                                                           │
│  Save / Compare / Share                                            │
│  [Switch pathway] (small text link)                                │
│  [Explore all pathways] (small text link)                          │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Direct shared page layout (mobile)

```
┌──────────────────┐
│ [☰] USCEHub  🔍   │
│ Pathway pill     │ ← only if preference set
├──────────────────┤
│                   │
│ Page title       │
│                   │
│ "Who this is for"│
│                   │
│ Trust strip      │
│                   │
│ Pathway cue pill │ ← small, dismissible
│                   │
│ Main content     │
│                   │
│ Save / Share CTA │
│                   │
│ Related cards    │
│                   │
│ Switch pathway   │ ← small text link
│                   │
├──────────────────┤
│ Home│Browse│Saved│Account│
└──────────────────┘
```

### 3.3 What MUST be visible above the fold

- Page title (H1)
- One-line "who this is for"
- Trust/source strip (if applicable)
- First sentence of main content

### 3.4 What MUST NOT be above the fold (or anywhere blocking)

- Pathway selector modal
- "Choose your pathway before viewing" gate
- Forced sign-in
- Email subscription pop-up
- "Did you mean..." pathway redirect
- Cookie banner blocking content (we use no third-party tracking; minimal cookie banner only if legally required)

### 3.5 Forced-redirect-after-cache scenario (FORBIDDEN)

```
❌ User has cache = usce_match
   User clicks /jobs/j1-waiver-hospitalist-ohio from Reddit
   → Site auto-redirects to /usce or /dashboard
   → User confused, hits back, leaves
   This is the failure mode this doc explicitly prevents.
```

---

## 4. Pathway cue behavior

### 4.1 Match cue (subtle)

When the user's localStorage preference matches the page's pathway:

```
┌────────────────────────────────────────────┐
│ Viewing: Practice & Career                  │
│ Jobs, contracts, visa, compensation,        │
│ insurance, and career transitions.          │
└────────────────────────────────────────────┘
```

Small, slate-text pill or banner. Non-intrusive. Never blocks content.

### 4.2 Mismatch cue (slightly more prominent)

When the user's localStorage preference does NOT match the page's pathway:

```
┌────────────────────────────────────────────┐
│ This topic usually belongs to               │
│ Practice & Career.                          │
│ Your saved pathway is USCE & Match.         │
│                                              │
│ [Keep browsing]  [Switch to Practice & Career] │
└────────────────────────────────────────────┘
```

Slightly more visible (amber accent). Two explicit choices. Default action if user does nothing: keep current pathway, keep browsing the page.

### 4.3 No-preference cue (gentle)

When the user has no localStorage preference yet:

```
┌────────────────────────────────────────────┐
│ Make USCEHub yours                          │
│ Choose your path for personalized           │
│ resources and saved-program tracking.       │
│                                              │
│ [Choose your pathway →]                     │
└────────────────────────────────────────────┘
```

Bottom of page or sidebar. Never blocks content. Click takes user to homepage selector.

### 4.4 Rules

- **Never hides content.** Cue is annotation, not gate.
- **Never auto-redirects.** Switching pathway requires explicit click.
- **Switch is reversible.** Switching pathway does NOT delete saved items, compare list, alerts, or checklist context (per [PATHWAY_DASHBOARD_ARCHITECTURE.md §13.2](PATHWAY_DASHBOARD_ARCHITECTURE.md)).
- **Switch is local first.** Clicking [Switch to Practice & Career] updates localStorage; the page does not reload or redirect.
- **Mismatch cue dismissible.** User can dismiss the mismatch warning for the session. Stored in sessionStorage (not localStorage); reappears next session.
- **Confidence-low cue acceptable.** If the page's primary pathway is `all_pathways` (e.g., a generic blog post), cue may show "Useful across all pathways."

### 4.5 Rendering

Cue renders **client-side** so it doesn't change the server-rendered HTML. The HTML Google indexes is the canonical content; the cue is JavaScript-injected post-load.

---

## 5. Page-type pathway tags

Every page declares one primary pathway tag in its metadata. The tag drives:
- Cue display logic (§4)
- Related-content selection (§13)
- Notification subscription defaults
- Analytics segmentation

### 5.1 Tag mapping

| Page type | Primary pathway tag |
|---|---|
| USCE listing detail (`/listing/[id]`, future `/usce/[slug]`) | `usce_match` |
| USCE state page (`/observerships/[state]`, future `/usce/observerships/[state]`) | `usce_match` |
| USCE specialty page | `usce_match` |
| Observership / externship / elective guide | `usce_match` |
| Match strategy article | `usce_match` |
| Match timeline | `usce_match` |
| IMG Match resources | `usce_match` |
| Document / CV / personal statement guide | `usce_match` |
| Interview prep guide | `usce_match` |
| Residency overview (`/residency`) | `residency_fellowship` |
| Residency boards (`/residency/boards`) | `residency_fellowship` |
| Residency survival (`/residency/survival`) | `residency_fellowship` |
| Residency moonlighting (`/residency/moonlighting`) | `residency_fellowship` |
| Residency procedures / research / post-match | `residency_fellowship` |
| Residency salary / finances | `residency_fellowship` |
| Fellowship database / guide (`/residency/fellowship*`) | `residency_fellowship` |
| Boards content | `residency_fellowship` |
| Attending job listing (future `/jobs/[id]`) | `practice_career` |
| J1 waiver job (`/career/jobs/j1-waiver/...`) | `practice_career` |
| H1B-friendly job | `practice_career` |
| Locums opportunity | `practice_career` |
| Visa guide (`/visa/*`, `/career/h1b`, `/career/waiver`, etc.) | `practice_career` |
| Conrad 30 / state visa guides | `practice_career` |
| Green card / H1B / J1 guides | `practice_career` |
| Contract review guide | `practice_career` |
| Compensation / RVU / negotiation guide | `practice_career` |
| Disability / life insurance guide | `practice_career` |
| Physician mortgage / financial advisor guide | `practice_career` |
| Immigration attorney directory | `practice_career` |
| Recruiter directory | `practice_career` |
| Locums companies directory | `practice_career` |
| Nonclinical roles guide | `practice_career` |
| Partnership / equity / retirement guide | `practice_career` |
| General blog post | inherit topic's primary pathway, OR `all_pathways` if cross-cutting |
| Methodology / FAQ / disclaimer | `all_pathways` |
| Tool URL canonical (`/tools/compare`, etc.) | `all_pathways` |
| Tool result state | `all_pathways` |
| Homepage `/` | `all_pathways` |
| Audience landing (`/for-img`, etc.) | `all_pathways` (audiences span pathways) |

### 5.2 Implementation note

Tag is set in page metadata or component prop:

```tsx
// per-page
export const pathwayTag = "practice_career" as const;
```

A small helper reads the tag and passes it to the cue component.

### 5.3 Multi-pathway content

Some pages span multiple pathways (e.g., a blog post about "Visa transition during residency" relates to both `residency_fellowship` and `practice_career`). Default rule: pick the **stronger primary** pathway per the topic's center of gravity. Mention the other pathway in the cue:

```
Viewing: Residency & Fellowship
This topic also relates to Practice & Career.
```

---

## 6. Canonical URL and UTM rules

### 6.1 The canonical rule

Each piece of content has exactly one canonical URL.

```
✅ Canonical: https://uscehub.com/jobs/j1-waiver-hospitalist-ohio
```

### 6.2 UTM parameters

Shared links may carry UTM parameters for analytics:

```
✅ Shared: https://uscehub.com/jobs/j1-waiver-hospitalist-ohio?utm_source=twitter&utm_campaign=j1_jobs
✅ Shared: https://uscehub.com/jobs/j1-waiver-hospitalist-ohio?utm_source=reddit&utm_medium=organic&utm_campaign=img_community
```

### 6.3 Canonical strips UTM

The page's `<link rel="canonical">` always points to the UTM-stripped URL:

```html
<link rel="canonical" href="https://uscehub.com/jobs/j1-waiver-hospitalist-ohio">
```

This signals to Google that the UTM-bearing URL is a duplicate of the canonical; UTM URLs do NOT enter the index.

### 6.4 No duplicate pathway URLs

```
❌ /usce-match/visa/j1-waiver
❌ /residency-fellowship/visa/j1-waiver
❌ /practice-career/visa/j1-waiver
```

These would create three competing canonical URLs for the same content. Forbidden per [INDEXATION_AND_URL_POLICY.md §3.1](INDEXATION_AND_URL_POLICY.md).

### 6.5 One content object = one canonical URL

```
✅ /visa/j1-waiver — single canonical
   Dashboards link to it with path-aware framing
   USCE & Match cue: "Visa basics: J1 waiver"
   Residency & Fellowship cue: "Visa transition: J1 to waiver"
   Practice & Career cue: "J1 waiver job pathway"
```

Same URL. Different framing per pathway. Same canonical.

### 6.6 UTM naming convention

Use lowercase, snake_case:

```
utm_source     = twitter | reddit | whatsapp | linkedin | newsletter | direct | other
utm_medium     = social | email | referral | direct | search
utm_campaign   = j1_jobs | usce_listings | match_strategy | fellowship_pathway | etc.
utm_content    = (optional) ad/post identifier
utm_term       = (optional) keyword
```

Document the conventions in a future `SOCIAL_DISTRIBUTION_PLAYBOOK.md` (deferred).

### 6.7 Pathway state in URL (FORBIDDEN)

Do NOT include pathway state in URLs:

```
❌ /jobs/j1-waiver?pathway=practice_career
❌ /jobs/j1-waiver?via=usce_match
❌ /usce-match/jobs/j1-waiver
```

Pathway state lives in localStorage, NOT URL.

### 6.8 Allowed query params

```
?utm_source=...        — analytics tracking
?utm_medium=...        — analytics tracking
?utm_campaign=...      — analytics tracking
?utm_content=...       — analytics tracking
?utm_term=...          — analytics tracking
?from=...              — internal tracking (lightweight; never propagated)
?ref=...               — referral tracking (lightweight)
?q=...                 — search query (search results page only; noindex)
?page=...              — pagination
?state=...             — listing-state filter (noindex per INDEXATION_AND_URL_POLICY)
?specialty=...         — listing-specialty filter (noindex)
?type=...              — listing-type filter (noindex)
?audience=...          — audience filter (noindex)
?cost=...              — cost filter (noindex)
```

All query-param URLs canonical to the unfiltered base URL.

---

## 7. Social metadata rules

Every shareable page MUST emit these meta tags. The Open Graph protocol uses `og:url` as the canonical permanent ID for the shared object.

### 7.1 Required social metadata

```html
<title>J1 Waiver Hospitalist Jobs in Ohio — USCEHub</title>
<meta name="description" content="Source-linked physician jobs with visa pathway notes, contract checklist, and attorney resources.">
<link rel="canonical" href="https://uscehub.com/jobs/j1-waiver-hospitalist-ohio">

<!-- Open Graph -->
<meta property="og:title" content="J1 Waiver Hospitalist Jobs in Ohio">
<meta property="og:description" content="Source-linked physician jobs with visa pathway notes, contract checklist, and attorney resources.">
<meta property="og:image" content="https://uscehub.com/og/jobs-j1-waiver-hospitalist-ohio.png">
<meta property="og:url" content="https://uscehub.com/jobs/j1-waiver-hospitalist-ohio">
<meta property="og:type" content="article">
<meta property="og:site_name" content="USCEHub">
<meta property="og:locale" content="en_US">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="J1 Waiver Hospitalist Jobs in Ohio">
<meta name="twitter:description" content="Source-linked physician jobs with visa pathway notes.">
<meta name="twitter:image" content="https://uscehub.com/og/jobs-j1-waiver-hospitalist-ohio.png">
<meta name="twitter:site" content="@uscehub">
```

### 7.2 Rules

- **`og:url` MUST equal the canonical URL.** UTM-stripped, fragment-free.
- **`og:title` MUST match page intent.** Not the page H1 verbatim if the H1 is too long; concise version.
- **`og:description` MUST say who the page is for.** "For IMG residents seeking..." or "Source-linked physician jobs with..."
- **`og:image` MUST be a real, hosted, 1200×630 image.** Not a 404, not a default-blank.
- **Twitter `summary_large_image` for content with images.** `summary` (small) for plain articles.
- **`twitter:site` for USCEHub's official handle** (if exists).
- **No clickbait.** No "You won't believe..." Match the actual page content.

### 7.3 Pathway-branded OG image template (future)

For v2 launch, use plain branded OG images. Post-launch, build a templated OG-image generator:

```
[USCEHub logo]                          [Pathway: Practice & Career]

J1 Waiver Hospitalist Jobs in Ohio

Source-linked · Verified · Visa-ready

[12 verified jobs] [Apply via official source]
```

Three OG image variants per pathway color (USCE blue / Residency emerald / Practice & Career purple) so Twitter/Reddit users can recognize the pathway at a glance.

### 7.4 Examples per page type

**J1 waiver job listing:**
```
og:title:       J1 Waiver Hospitalist Jobs in Ohio
og:description: Source-linked physician jobs with visa pathway notes, contract checklist, and attorney resources.
og:type:        article
twitter:card:   summary_large_image
```

**USCE state page:**
```
og:title:       USCE Observerships in New York
og:description: Official-source clinical experience listings for IMGs and residency applicants. 47 verified programs.
og:type:        website
twitter:card:   summary_large_image
```

**Fellowship guide:**
```
og:title:       Cardiology Fellowship Pathway
og:description: Training timeline, fellowship planning, research, boards, and visa transition resources for residents.
og:type:        article
twitter:card:   summary_large_image
```

**Tool page:**
```
og:title:       Visa Decision Helper for Physicians
og:description: J1, H1B, Conrad 30, green card timeline — interactive tool with citations to USCIS and DOL.
og:type:        website
twitter:card:   summary
```

**Methodology page:**
```
og:title:       How USCEHub Verifies Programs
og:description: Cron + admin verification, source authority tiers, broken-link reporting. Read our full methodology.
og:type:        website
twitter:card:   summary
```

### 7.5 Social metadata + canonical alignment

`og:url` and `<link rel="canonical">` MUST point to the same URL. Any drift between them confuses Twitter/Facebook/LinkedIn previews and Google indexing.

### 7.6 No social metadata on noindex pages

Pages marked `noindex, follow` (e.g., search results, faceted filters) should NOT have rich OG metadata. Rationale: those pages are not intended to be shared as canonical content. Default OG metadata from layout is fine.

---

## 8. Share-ready page checklist

Every page intended for sharing must satisfy:

| # | Item | Why |
|---|---|---|
| 1 | Clear page title (H1, ≤ 80 chars) | Above-fold immediate identification |
| 2 | One-line "who this is for" | Defends against bounce |
| 3 | Source / trust status where relevant (Phase 3 trust badge) | AI-search citation pull-through |
| 4 | Pathway cue (subtle, post-load) | User orientation |
| 5 | Same-path related content (3-5 cards) | Conversion to pathway dashboard |
| 6 | Canonical URL (no UTM, no fragment) | SEO + social preview alignment |
| 7 | OG / Twitter card metadata complete | Preview quality across platforms |
| 8 | No blocking modal | Direct-link respect |
| 9 | No forced sign-up | Anonymous-first |
| 10 | Save / compare / share / checklist CTA | Engagement hook |
| 11 | Mobile-readable above the fold | Mobile-first traffic |
| 12 | Visible "Report broken link" / source-issue if relevant | Trust contract |

### 8.1 Page-type priority for share-readiness

Build share quality for these first (v2 launch / immediate priority):

```
1. USCE listing pages (single program detail)
2. USCE state pages (curated)
3. USCE specialty pages (curated)
4. J1 waiver job pages (preserved /career/* tree)
5. Visa guides
6. Residency / fellowship guides (existing /residency/*)
7. Blog posts
8. Tool pages
9. Checklist pages (when built)
```

Defer to post-launch:

```
10. Audience landings (/for-img, etc.)
11. Institution profile pages (when built)
12. Attorney / recruiter pages (when built)
```

### 8.2 Deferred share-readiness items

- Pathway-specific OG image templates (text-rendered images)
- Open-graph preview testing automation
- Reddit-specific link-flair recommendations
- Twitter thread starter library
- WhatsApp / Telegram share-button A/B test

---

## 9. Reddit / Twitter / social behavior

### 9.1 Reddit

Reddit users are skeptical and low-patience. They scrutinize claims and bounce on marketing.

**Page must satisfy in <5 seconds of read:**
- What is this?
- Why trust it?
- What source backs it?
- What can I do next?

**Forbidden:**
- Lead capture above the fold
- Forced sign-up
- "Choose a pathway" wall
- Vague claims ("the best resource for X")
- Missing source citation
- Stock-photo physician hero

**Recommended:**
- Source-linked claims (T1 / T2 per [PLATFORM_V2_STRATEGY.md §4.5](PLATFORM_V2_STRATEGY.md))
- Explicit verification badge (Phase 3 trust)
- "Last updated" date
- Plain-text summary above fold
- Direct link to original source (DOL, USCIS, NRMP, etc.)

### 9.2 Twitter / X

Twitter users skim. Preview card is the primary touchpoint.

**Preview card MUST:**
- Title concise (≤ 60 chars ideal)
- Description specific (mention numbers, sources, audiences)
- OG image branded but readable on small screen
- Card type `summary_large_image` for visual content

**On-page MUST:**
- Page title matches OG title (or close)
- Above-fold summary mirrors OG description
- Quick CTA visible
- Mobile-first layout (most Twitter clicks come from mobile)

### 9.3 WhatsApp

WhatsApp pulls OG metadata for previews. Title and image MUST clearly state content; otherwise it looks spammy.

**Forbidden:**
- Generic OG image (USCEHub logo only — looks like spam)
- Unclear title
- Claims that don't match preview
- Long URLs without tracking-clean canonicals

**Recommended:**
- Page title matches preview title
- Image is content-relevant (not just logo)
- Description gives clear value

### 9.4 LinkedIn

LinkedIn audience: physicians, recruiters, healthcare professionals. More professional tone.

**Recommended:**
- Professional title / description
- Useful for physician audience and institution-side users
- Cite sources directly
- No clickbait

**Examples (LinkedIn-toned):**

```
Title:       Physician Fellowship Match 2025: Complete Strategy
Description: Timeline, IMG considerations, visa-friendly programs, and source-verified data for residents
             planning fellowship.
```

vs. Twitter:

```
Title:       Fellowship Match 2025
Description: Plan your fellowship — timeline, strategy, IMG-friendly programs, source-verified data.
```

### 9.5 Newsletter / email

When linking from an email digest:

- Use UTM source `newsletter`
- Use UTM medium `email`
- Use UTM campaign per digest (e.g., `digest_apr_2026`)
- Per-link: `utm_content` may identify which CTA in the digest
- All links 301-stable; no temporary redirects

---

## 10. SEO safeguards

### 10.1 Canonical preservation

Every page MUST emit `<link rel="canonical">` matching the URL-without-pathway-state, UTM-stripped form. Per [INDEXATION_AND_URL_POLICY.md §2.4](INDEXATION_AND_URL_POLICY.md).

### 10.2 No duplicate pathway URLs

```
❌ Forbidden: /usce-match/visa/j1-waiver
✅ Required: /visa/j1-waiver (canonical, single)
```

### 10.3 No uncontrolled faceted URLs

Per [INDEXATION_AND_URL_POLICY.md §3](INDEXATION_AND_URL_POLICY.md): query-param filter URLs are `noindex, follow`. Per [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md): combinatorial faceted URLs that don't pass the quality gate stay out of sitemap.

### 10.4 Noindex thin pages

Search results, filter combinations, audience-query pages, dashboard, admin: all `noindex` per [INDEXATION_AND_URL_POLICY.md §4.2](INDEXATION_AND_URL_POLICY.md).

### 10.5 Useful standalone content

Indexable pages must satisfy [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md) quality gate:
1. Hand-written editorial content
2. Unique data point
3. Primary citation tier T1 / T2 / T4
4. Pass human review queue (status APPROVED)

### 10.6 Social metadata MUST NOT contradict page metadata

`og:title` ≈ `<title>` (same intent; can differ in length).
`og:description` ≈ `<meta name="description">`.
Drift confuses crawlers and previews.

### 10.7 Path personalization MUST NOT change canonical content

Pathway cues, related-content modules, sidebar reordering: all client-side. The HTML Google indexes is identical regardless of pathway preference. Server-rendered HTML is canonical.

### 10.8 Server-rendered content stays primary

Pathway-aware modules (cue, related cards) render client-side. The crawler-visible HTML contains:
- Page title
- Main content
- Pathway-tagged related content for the page's primary pathway (not the user's preference)
- Universal tools

Pathway preference is layered ON TOP of this baseline. The baseline is what Google indexes.

### 10.9 No cloaking

USCEHub serves the same HTML to bots and humans. No User-Agent-based content variation per [INDEXATION_AND_URL_POLICY.md §12.1](INDEXATION_AND_URL_POLICY.md). Per Google's spam policies, this would be cloaking.

---

## 11. Cache / localStorage policy

### 11.1 Stored values

```
pathwayPreference         = usce_match | residency_fellowship | practice_career | all_pathways
pathwayPreferenceUpdatedAt = ISO date
pathwaySubState           = (optional) sub-state key
pathwaySubStateUpdatedAt  = (optional) ISO date
lastEntrySource           = (optional) "twitter" | "reddit" | "google" | etc.
mismatchDismissedThisSession = sessionStorage flag (per-session, not localStorage)
```

### 11.2 Strict rules

| Rule | Behavior |
|---|---|
| **Never redirects** | localStorage NEVER causes a URL change. Period. |
| **Never changes canonical** | The canonical tag is server-rendered; localStorage cannot affect it. |
| **May reorder secondary modules** | Related-content cards, sidebar order, default subscription category. |
| **May show cue/pill** | Per §4. |
| **May influence default route** | When user clicks "Open my pathway" from homepage, route to their preferred pathway dashboard. |
| **Direct URL always wins** | If user has Path 1 cache + clicks Path 3 URL → Path 3 URL renders. |
| **Re-prompt only after milestones** | 6 months OR behavior contradicts preference (per [PATHWAY_DASHBOARD_ARCHITECTURE.md §14.2](PATHWAY_DASHBOARD_ARCHITECTURE.md)). |
| **User can reset preference** | Profile settings + dashboard pill dropdown both have "Clear pathway." |
| **Clear pathway → no preference state** | Doesn't auto-route to All Pathways unless user explicitly picks. |

### 11.3 sessionStorage vs localStorage

| Use case | Storage |
|---|---|
| Pathway preference (cross-session) | localStorage |
| Sub-state preference (cross-session) | localStorage |
| Mismatch cue dismissal (this visit only) | sessionStorage |
| Recent search query (this visit only) | sessionStorage |
| Skipped-selector flag (per-session) | sessionStorage |

### 11.4 Privacy posture

- Pathway preference is functional data (used to render UI). No third-party tracking.
- Pathway preference is NOT shared with any third party.
- localStorage is browser-isolated; not synced via any third-party service.
- No cookie banner required for pathway preference itself (functional cookie).

### 11.5 First-party analytics

Pathway events emit to first-party analytics (Vercel Analytics — per [PLATFORM_V2_STRATEGY.md §16](PLATFORM_V2_STRATEGY.md)) — server-side aggregate only. No per-user tracking.

---

## 12. Logged-in future behavior

**No schema changes at v2 launch. Future-only section.**

### 12.1 Profile preference (when authorized)

Future schema additions per [PLATFORM_V2_STRATEGY.md §7.3](PLATFORM_V2_STRATEGY.md):

```prisma
model User {
  // existing fields
  pathwayPreference         PathwayPreference?
  pathwayPreferenceUpdatedAt DateTime?
  pathwaySubState           String?
  pathwaySubStateUpdatedAt  DateTime?
}
```

### 12.2 Cross-device sync

Logged-in users with profile preference: pathway syncs across devices.

### 12.3 Conflict resolution

When localStorage and profile disagree (e.g., user logged in on phone with pathway X, switched on laptop to pathway Y):

```
Account preference (server) wins on read.
One-time prompt: "Your account says X; this device says Y. Which is current?"
[Use account preference] [Update account to device preference]
```

### 12.4 Direct URL still wins

Even with profile preference + logged-in:

```
User logged in; profile.pathwayPreference = practice_career
User clicks /usce/observerships/california from Twitter
→ Page renders the USCE state page
→ Cue: "This topic usually belongs to USCE & Match."
→ NO redirect to /dashboard
```

### 12.5 Dashboard uses profile preference more strongly

On `/dashboard/*` (auth-gated), profile preference fully personalizes the UI. Public pages: profile preference influences cue + related-content; URL still wins.

### 12.6 Profile sync is gated

Per [PLATFORM_V2_STRATEGY.md §7.1](PLATFORM_V2_STRATEGY.md): future schema for `User.pathwayPreference` requires explicit user authorization. v2 launch ships with localStorage-only.

---

## 13. Related content strategy

For direct shared pages, related content is curated to support the page's pathway and adjacent pathways.

### 13.1 Three-tier related content

```
Tier 1: Same-path related (3-5 cards)
Tier 2: Cross-path bridge (1-2 cards)
Tier 3: Generic resources (1-2 cards)
```

### 13.2 Examples

**J1 waiver job page (`/jobs/j1-waiver-hospitalist-ohio`):**

```
Tier 1 (same-path: Practice & Career):
  - More J1 waiver jobs
  - H1B-friendly jobs
  - Conrad 30 state guide
  - Contract checklist
  - Immigration attorney resources

Tier 2 (cross-path bridge → Residency & Fellowship):
  - "Plan visa transition during training"

Tier 3 (generic):
  - Methodology
  - Report broken link
```

**USCE listing page (`/listing/abc123-johns-hopkins-cardiology`):**

```
Tier 1 (same-path: USCE & Match):
  - Similar USCE programs (same specialty, same state)
  - State USCE browse
  - Document checklist (CV, personal statement)
  - Match strategy for IMGs

Tier 2 (cross-path bridge → Residency & Fellowship):
  - "Preparing for residency intern year"

Tier 3 (generic):
  - Methodology
  - Save / compare
```

**Fellowship guide page (`/residency/fellowship/guide`):**

```
Tier 1 (same-path: Residency & Fellowship):
  - Fellowship database (sample-only currently)
  - Boards timeline
  - Research / CV building
  - Moonlighting resources

Tier 2 (cross-path bridge → Practice & Career):
  - "Preparing for attending life: jobs, contracts, visa, insurance"

Tier 3 (generic):
  - Methodology
  - FAQ
```

### 13.3 Anti-patterns

```
❌ Forced cross-path
   J1 waiver job page should NOT show:
   - USCE listings (way out of audience)
   - Match strategy guides (way out of stage)

❌ Pathway-preference override
   Same-path related content stays the same regardless of user's localStorage preference.
   The PAGE's pathway determines related content.

❌ "Recommended for you" without basis
   Don't show personalized recommendations to anonymous users; just pathway-tagged content.
```

### 13.4 Curation source

For each canonical page, hand-curate the related-content list. Don't auto-generate by tag matching alone — that produces noise.

---

## 14. Implementation phases

### Phase 1 — docs only

✅ This doc.

### Phase 2 — audit existing metadata + share previews

- Inventory current OG / Twitter metadata coverage across listing pages, blog posts, /residency/*, /career/*, etc.
- Identify pages missing share-ready metadata.
- Test current share previews on Twitter / Reddit / WhatsApp / LinkedIn / Discord using their respective debug tools.

### Phase 3 — define page-type pathway tags in code

- Add `pathwayTag` constant to each page.
- Centralized mapping in `src/lib/pathway-tags.ts` (or similar).
- No redirect logic; tag-only.

### Phase 4 — add non-blocking pathway cue

- Client-side cue component reads `pathwayTag` + localStorage preference.
- Renders match / mismatch / no-preference cue.
- Dismissible per session.

### Phase 5 — add share metadata templates

- Per-page-type OG / Twitter card defaults.
- Per-pathway OG image template (deferred to post-launch).
- Standardize copy patterns.

### Phase 6 — add related-content modules

- Per-page curated related-content arrays.
- Tier 1 / 2 / 3 rendering.
- Mobile-first.

### Phase 7 — add analytics

- `pathway_cue_shown`, `pathway_cue_dismissed`, `pathway_switched_from_cue` events.
- `share_link_landed`, `utm_*` tracking.
- Per-source bounce rate, conversion rate.

---

## 15. Open decisions

These need user resolution before implementation:

### 15.1 Cue copy

1. **Match cue copy.** Recommend: "Viewing: {pathway label}. {short description}." Alternative: omit description, just label.
2. **Mismatch cue copy.** Recommend: "This topic usually belongs to {page pathway}. Your saved pathway is {user preference}." Alternative: shorter "Different pathway from your saved one."
3. **No-preference cue copy.** Recommend: "Make USCEHub yours. Choose your path for personalized resources." Alternative: silent on no-preference (no cue at all).

### 15.2 Cue display

4. **Show cue on every page or only on mismatches.** Recommend: every page, but match-cue is much more subtle. Alternative: only show on mismatches.
5. **Pathway pill always visible vs preference-only.** Per [PATHWAY_DASHBOARD_ARCHITECTURE.md §6.4](PATHWAY_DASHBOARD_ARCHITECTURE.md): pill visible only when preference is set. Confirmed.

### 15.3 Social metadata

6. **Pathway-specific OG image templates at launch?** Recommend defer to Phase 5; v2 launch uses generic branded images.
7. **UTM naming convention** (per §6.6). Recommend: lowercase, snake_case. Document in playbook.
8. **Reddit-specific copy style?** Recommend: yes — more direct, less marketing. LinkedIn: more professional. Per §9.1, §9.4.

### 15.4 SEO + personalization

9. **How much personalization is safe for SEO?** Recommend: client-side only (cue + related). Server-rendered HTML stays canonical (same for all users).
10. **Whether social-shared pages should hide homepage selector entirely.** Recommend: no — selector lives only on homepage. Other pages use small pathway pill (when preference set).

### 15.5 Phase D schema

11. **`User.pathwayPreference` schema PR timing.** Defer per [PLATFORM_V2_STRATEGY.md §7.1](PLATFORM_V2_STRATEGY.md). Pathway preference stays anonymous-only at v2 launch.

### 15.6 Phase 0 audit dependencies

12. **Reconcile with Phase 0 audits.** This doc may need revision after PR 0c-0g audits surface application-flow / review-flow / community-flow / recommend-tool / cost-calculator implications. Mark as "may revise post-Phase-0."

---

## 16. SEO impact

```
SEO impact:
- URLs changed:        none (architecture doc only)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no (this doc INSTRUCTS that canonical never changes)
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal architecture doc; rules in this doc PROTECT canonical/SEO
```

## 17. /career impact

None directly. `/career/*` and `/careers/*` preserved unchanged per [RULES.md](../codebase-audit/RULES.md) §2.

`/career/*` pages will inherit the pathway tag `practice_career` and gain share-ready metadata + related-content modules per the page-type checklist (§5, §8). No URL change. No content rewrite. Just metadata + cue layered on top.

## 18. Schema impact

None at v2 launch. §12 enumerates future possible fields; each requires explicit authorization per [PLATFORM_V2_STRATEGY.md §7](PLATFORM_V2_STRATEGY.md).

## 19. Authorization impact

None. This doc binds future implementation but authorizes nothing on its own. Each phase (per §14) requires its own authorization PR.

---

## 20. The single rule to remember

```
The page they clicked is the page they get.
Pathway preference helps orient them.
It never blocks, redirects, or replaces the destination.
```

If any future PR or feature violates this rule, it is wrong by definition. The cost of breaking this rule once is permanent SEO damage + user trust loss; the cost of preserving it is one extra layer of architectural discipline.
