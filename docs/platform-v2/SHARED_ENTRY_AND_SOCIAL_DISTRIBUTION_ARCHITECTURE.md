# USCEHub v2 — Shared-Entry and Social-Distribution Architecture

**Doc status:** Binding once approved. Sealed direct-link, cache, SEO, social-share, and pathway-context behavior.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md), and [PATHWAY_DASHBOARD_ARCHITECTURE.md](PATHWAY_DASHBOARD_ARCHITECTURE.md). Where conflict, those win.
**Authored:** 2026-04-29.
**Companion docs:** [PATHWAY_DASHBOARD_ARCHITECTURE.md](PATHWAY_DASHBOARD_ARCHITECTURE.md), [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md), [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md), [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md), [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md).

> **The single most important rule:** the URL the user clicked is the page the user gets. Pathway preference orients; it does NOT block, redirect, or replace.

---

## 1. Executive decision

**The URL wins. A shared URL is a promise.**

### 1.1 Locked rules

```
1.  Direct shared links always open the clicked page.
2.  Pathway cache personalizes secondary modules only.
3.  Pathway selector never blocks search/social/referral visitors.
4.  No modal before content.
5.  No redirect to dashboard from public pages.
6.  No forced account creation.
7.  Shared pages must be standalone landing pages.
8.  UTM parameters never create indexable duplicates.
9.  Canonical URL strips UTM and personalization state.
10. localStorage may show pathway cue/pill — never redirect.
11. Login redirects MUST preserve returnTo.
12. Expired pages MUST surface alternatives, not generic 404.
```

### 1.2 Core doctrine

```
Pathway preference may:
- show a pill
- reorder secondary related modules
- suggest a pathway switch
- personalize dashboard modules

Pathway preference may not:
- redirect
- block content
- replace destination
- change canonical URL
- force login
- force pathway selection
```

If a future PR violates any clause of §1.2, it is wrong by definition.

### 1.3 Why this matters

USCEHub plans heavy direct sharing on Twitter/X, Reddit, WhatsApp, LinkedIn, newsletters, and quoted in physician communities. Every shared link is a single chance:

- A new user clicking from Reddit r/IMG to a J1 waiver job listing
- A returning user clicking a Twitter thread about USCE programs in California
- A WhatsApp share of a fellowship strategy guide
- A LinkedIn post linking to a contract review checklist

If pathway preference (cached or otherwise) hijacks any of these clicks — by showing a modal, redirecting to `/dashboard`, or replacing the content — we lose the click, the trust, and the SEO value.

### 1.4 What this doc is NOT

- Not authorization to implement. Implementation requires explicit user approval.
- Not a UI specification. Visual design lives elsewhere.
- Not a schema specification. Pathway preference at v2 launch is anonymous-only via localStorage per [PATHWAY_DASHBOARD_ARCHITECTURE.md §14](PATHWAY_DASHBOARD_ARCHITECTURE.md).
- Not a launch plan. Sequencing per §23 below.

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

Levels 1 + 2 determine the destination. The clicked URL renders. The page's primary pathway tag determines framing. Levels 3-6 do NOT change the destination.

### 2.3 The personalization rule

Levels 3 + 4 + 5 + 6 determine framing only — cues, related content, sidebar modules.

### 2.4 Examples

**Example A — pathway-cache mismatch:** User has localStorage `usce_match`, clicks Reddit link to `/jobs/j1-waiver-hospitalist-ohio` → page renders the J1 job; cue: "Viewing Practice & Career content. Your saved pathway is USCE & Match." [Keep browsing] [Switch].

**Example B — pathway-cache match:** User has `practice_career`, clicks Twitter share of same J1 job → page renders; subtle cue "Viewing: Practice & Career."

**Example C — first-time visitor:** No cache, Google search to `/usce/new-york/internal-medicine` → USCE state-specialty page renders; no mismatch cue; gentle "Choose your path" pill at bottom.

**Example D — old cache, newly shared page:** Anonymous user's cache is from 6 months ago; clicks WhatsApp share of a brand-new fellowship guide → page renders; no redirect, no auto-prompt.

**Example E — logged-in profile mismatch (future):** User logged in; profile says `residency_fellowship`; clicks `/tools/visa-decision-helper` → tool renders at canonical URL; cue mentions cross-path relevance; tool result page generates per the actual decision-tree input, not pathway.

### 2.5 What localStorage NEVER does

- Never redirects the URL.
- Never changes the canonical URL.
- Never replaces page content.
- Never hides primary content behind a modal.
- Never forces a re-prompt before content loads.

---

## 3. Public vs private direct-link behavior

### 3.1 Public page (default)

- Content visible immediately.
- No login required.
- No pathway modal.
- Save / Compare / Apply / Save-checklist may require login later (per-action gate).
- Reading never requires sign-up.

### 3.2 Private page (auth-gated)

- Login gate allowed (e.g., `/dashboard/*`, `/poster/*`).
- MUST preserve `returnTo` query parameter.
- After successful login, redirect user to the exact requested URL.

### 3.3 The login returnTo rule

```
Clicked: /dashboard/saved
Without auth: → /auth/signin?returnTo=/dashboard/saved
After login:  → /dashboard/saved (the original target)

NEVER:
Clicked: /dashboard/saved
Without auth: → /auth/signin
After login:  → /dashboard (loses original intent)
```

### 3.4 Examples

**Public-direct example:**

```
User clicks Twitter link: /jobs/j1-waiver-hospitalist-ohio
→ Page renders immediately
→ Save button visible but click triggers /auth/signin?returnTo=/jobs/...
→ After login: returns to /jobs/j1-waiver-hospitalist-ohio with saved state
```

**Private-direct example:**

```
User clicks newsletter link: /dashboard/saved
→ Auth check fails
→ Redirect to /auth/signin?returnTo=/dashboard/saved
→ After login: lands on /dashboard/saved
→ NOT /dashboard or homepage
```

### 3.5 Public surfaces (login NOT required to read)

- All `/usce/*`, `/observerships/*`, `/listing/*`
- All `/career/*`, `/jobs/*`, `/visa/*`
- All `/residency/*`
- All `/blog/*`, `/resources/*`, `/methodology`, `/faq`
- All `/about/*`, `/contact`, `/disclaimer`, `/privacy`, `/terms`
- All `/tools/*` (tool result state may require login for save)
- Search results

### 3.6 Private surfaces (auth-gated)

- All `/dashboard/*` (logged-in user features)
- All `/poster/*` (institution-side, role-gated)
- All `/admin/*` (admin role)
- Any `/auth/*` flows

### 3.7 Per-action gating on public pages

Some actions on public pages legitimately require login:

- Save listing → `/auth/signin?returnTo=/listing/[id]&action=save`
- Compare → `/auth/signin?returnTo=...&action=compare`
- Apply → `/auth/signin?returnTo=...&action=apply`

After login, the page re-renders with the action completed (or surfaces the action button in success state). User does NOT lose their place on the listing page.

### 3.8 returnTo safety

`returnTo` MUST be:

- Same-origin URL (reject external redirects to prevent open-redirect)
- A URL whose path matches an actual route (reject malformed)
- Length-bounded (reject pathologically long inputs)

```
✅ /auth/signin?returnTo=/listing/abc123
✅ /auth/signin?returnTo=/dashboard/saved
❌ /auth/signin?returnTo=https://attacker.com (open-redirect)
❌ /auth/signin?returnTo=javascript:alert(1) (XSS)
```

---

## 4. Shared-entry UX

### 4.1 Direct shared page layout (desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] USCE | Match | Fellowship | Jobs | Visa | Tools | Resources │
│                          [Pathway: USCE & Match ▾] [Sign in]       │
├──────────────────────────────────────────────────────────────────┤
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
│                                                                    │
│  Main content (immediately visible)                                │
│                                                                    │
│  Right rail / below content:                                       │
│  Related in this pathway                                           │
│                                                                    │
│  Bottom:                                                           │
│  Save / Compare / Share                                            │
│  [Switch pathway] (small text link)                                │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Direct shared page layout (mobile)

```
┌──────────────────┐
│ [☰] USCEHub  🔍   │
│ Pathway pill     │ ← only if preference set
├──────────────────┤
│ Page title       │
│ "Who this is for"│
│ Trust strip      │
│ Pathway cue pill │
│ Main content     │
│ Save / Share CTA │
│ Related cards    │
│ Switch pathway   │
├──────────────────┤
│ Home│Browse│Saved│Account│
└──────────────────┘
```

### 4.3 What MUST be visible above the fold

- Page title (H1)
- One-line "who this is for"
- Trust/source strip (if applicable)
- First sentence of main content

### 4.4 What MUST NOT be above the fold (or anywhere blocking)

- Pathway selector modal
- "Choose your pathway before viewing" gate
- Forced sign-in
- Email subscription pop-up
- "Did you mean..." pathway redirect
- Cookie banner blocking content (no third-party tracking; minimal banner only if legally required)

### 4.5 Forced-redirect-after-cache scenario (FORBIDDEN)

```
❌ User has cache = usce_match
   User clicks /jobs/j1-waiver-hospitalist-ohio from Reddit
   → Site auto-redirects to /usce or /dashboard
   → User confused, hits back, leaves
   This is the failure mode this doc explicitly prevents.
```

---

## 5. Pathway cue behavior

### 5.1 Match cue (subtle)

```
┌────────────────────────────────────────────┐
│ Viewing: Practice & Career                  │
│ Jobs, contracts, visa, compensation,        │
│ insurance, and career transitions.          │
└────────────────────────────────────────────┘
```

Small, slate-text pill or banner. Non-intrusive.

### 5.2 Mismatch cue (slightly more prominent)

```
┌────────────────────────────────────────────┐
│ This topic is usually part of               │
│ Practice & Career.                          │
│ Your saved pathway is USCE & Match.         │
│                                              │
│ [Keep browsing]  [Switch to Practice & Career] │
└────────────────────────────────────────────┘
```

Default action if user does nothing: keep current pathway, keep browsing.

### 5.3 No-preference cue (gentle)

```
┌────────────────────────────────────────────┐
│ Make USCEHub yours                          │
│ Choose your path for personalized           │
│ resources and saved-program tracking.       │
│                                              │
│ [Choose your pathway →]                     │
└────────────────────────────────────────────┘
```

### 5.4 Rules

- **Never hides content.** Cue is annotation, not gate.
- **Never auto-redirects.** Switching pathway requires explicit click.
- **Switch is reversible.** Switching does NOT delete saved items, compare list, alerts, or checklist context.
- **Switch is local first.** Clicking [Switch to Practice & Career] updates localStorage; the page does not reload or redirect.
- **Mismatch cue dismissible.** sessionStorage flag (per-session, not localStorage).
- **Copy must not imply user is wrong.** Use "This topic is usually part of X" — never "You are in the wrong pathway."

### 5.5 Tone discipline

```
✅ Good: "This topic is usually part of Practice & Career."
✅ Good: "Your saved pathway is USCE & Match. Switch?"
❌ Bad:  "You are in the wrong pathway."
❌ Bad:  "Wrong pathway selected."
❌ Bad:  "This is not your pathway."
```

The mismatch cue must NEVER shame the user. They picked a pathway; they followed a link; both choices are legitimate.

### 5.6 Rendering

Cue renders **client-side** so it doesn't change the server-rendered HTML. The HTML Google indexes is the canonical content; the cue is JavaScript-injected post-load.

---

## 6. Page-type pathway tags

Every page declares one primary pathway tag in its metadata.

### 6.1 Tag mapping

| Page type | Primary pathway tag |
|---|---|
| USCE listing detail | `usce_match` |
| USCE state / specialty page | `usce_match` |
| Observership / externship / elective guide | `usce_match` |
| Match strategy article | `usce_match` |
| Match timeline | `usce_match` |
| IMG Match resources | `usce_match` |
| Document / CV / personal statement guide | `usce_match` |
| Interview prep guide | `usce_match` |
| Residency overview | `residency_fellowship` |
| Residency boards / survival / moonlighting / procedures / research / post-match / salary / finances | `residency_fellowship` |
| Fellowship database / guide | `residency_fellowship` |
| Boards content | `residency_fellowship` |
| Attending job listing (`/jobs/[id]`, `/career/jobs/*`) | `practice_career` |
| J1 waiver job | `practice_career` |
| H1B-friendly job | `practice_career` |
| Locums opportunity | `practice_career` |
| Visa guide (`/visa/*`, `/career/h1b`, `/career/waiver`) | `practice_career` |
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
| Audience landing (`/for-img`, etc.) | `all_pathways` |

### 6.2 Implementation note

```tsx
export const pathwayTag = "practice_career" as const;
```

A small helper reads the tag and passes it to the cue component.

### 6.3 Multi-pathway content

Pages spanning multiple pathways: pick the **stronger primary** per the topic's center of gravity. Mention the other pathway in the cue:

```
Viewing: Residency & Fellowship
This topic also relates to Practice & Career.
```

---

## 7. Page-type registry model

A future centralized registry — design now so all share-readiness work routes through it.

### 7.1 Registry shape (conceptual)

```
type PageTypeEntry = {
  pageType: string;                  // e.g., "USCE_LISTING", "J1_WAIVER_JOB"
  primaryPathway: PathwayKey;        // usce_match | residency_fellowship | practice_career | all_pathways
  canonicalTemplate: string;         // e.g., "/usce/[slug]"
  shareTemplate: ShareTemplate;      // OG / Twitter card defaults
  trustRequired: boolean;            // does this page need Phase 3 trust badge?
  indexationRule: IndexationRule;    // index | noindex_follow | noindex_nofollow
  relatedContentStrategy: string;    // how to compute related cards
  ogImageTemplate: string;           // image generator template id
};
```

### 7.2 Why a registry

- Single source of truth for share-readiness rules per page-type.
- Prevents drift across the codebase (each page implementing OG/Twitter differently).
- Centralizes future updates (e.g., new OG image template applies to all pages of a type).
- Audit script (§24) reads from this registry.

### 7.3 Phasing

- Phase 1 (this doc): document registry shape.
- Phase 3 (per §23): implement registry as a TypeScript constant. No runtime DB; build-time constant.
- Phase 5: OG image templates per registry entry.
- Phase 8: audit script verifies all live pages against registry.

### 7.4 Do NOT implement now

The registry is a future artifact. This doc binds the shape; implementation requires explicit authorization.

---

## 8. Canonical URL and UTM rules

### 8.1 The canonical rule

Each piece of content has exactly one canonical URL.

```
✅ Canonical: https://uscehub.com/jobs/j1-waiver-hospitalist-ohio
```

### 8.2 UTM parameters

```
✅ Shared: https://uscehub.com/jobs/j1-waiver-hospitalist-ohio?utm_source=twitter&utm_campaign=j1_jobs
```

### 8.3 Canonical strips UTM

```html
<link rel="canonical" href="https://uscehub.com/jobs/j1-waiver-hospitalist-ohio">
```

UTM URLs do NOT enter the index.

### 8.4 No duplicate pathway URLs

```
❌ /usce-match/visa/j1-waiver
❌ /residency-fellowship/visa/j1-waiver
❌ /practice-career/visa/j1-waiver
✅ /visa/j1-waiver — single canonical
```

### 8.5 One content object = one canonical URL

Same URL. Different framing per pathway. Same canonical.

### 8.6 Allowed tracking parameters

```
utm_source     = twitter | reddit | whatsapp | linkedin | newsletter | direct | other
utm_medium     = social | email | referral | direct | search
utm_campaign   = j1_jobs | usce_listings | match_strategy | fellowship_pathway | etc.
utm_content    = (optional) ad/post identifier
utm_term       = (optional) keyword
ref            = (optional) lightweight referral tracking
```

All UTM/ref URLs canonical to UTM-stripped form.

### 8.7 Functional parameters (different rules)

```
page          — pagination
sort          — sort order
filter        — filter combination
q             — search query
state         — state filter
specialty     — specialty filter
visa          — visa filter
```

Per [INDEXATION_AND_URL_POLICY.md §3](INDEXATION_AND_URL_POLICY.md): functional parameters generally produce `noindex, follow` URLs that canonical to base. Indexation rules per §9 below.

### 8.8 Pathway query parameter (FORBIDDEN as canonical-changer)

```
❌ /jobs/j1-waiver?pathway=practice_career → different canonical
❌ /usce-match/jobs/j1-waiver               → different canonical
```

Pathway state lives in localStorage, NOT URL. If a `?pathway=` query param is ever introduced to deep-link from a curated tweet, it MUST canonical to the base URL.

### 8.9 No JavaScript canonical rewriting

Per Google's canonicalization guidance: JavaScript that modifies `<link rel="canonical">` after page load is ambiguous to crawlers. The canonical tag must be server-rendered with the correct URL on first response.

### 8.10 No URL fragment canonicalization

```
❌ canonical: https://uscehub.com/jobs/j1-waiver#apply
✅ canonical: https://uscehub.com/jobs/j1-waiver
```

URL fragments are client-side state, not canonical content.

---

## 9. Filter / sort / search URL policy

### 9.1 Default rule

```
Filter and sort pages default to noindex, follow unless explicitly approved.
Search-result pages default to noindex, follow.
Thin combinations stay noindex, follow.
```

### 9.2 Indexable static landing routes

High-value combinations get clean canonical static URLs that meet [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md) quality gate (curated intro + unique data + T1/T2 source + admin approval).

```
Likely indexable later:
/usce/new-york/internal-medicine
/jobs/j1-waiver/ohio
/usce/observerships/california
```

These have hand-written intros, state/specialty-specific data, source citations, and admin approval.

### 9.3 Likely noindex

```
/browse?sort=cost_desc
/search?q=j1+jobs
/jobs?visa=J1&sort=newest&radius=50
/usce?audience=img&cost=free
```

These are session-state filter combinations — useful in-session, not indexable.

### 9.4 Pagination

```
/blog?page=2 → real URL, noindex, follow; rel="next"/"prev" link rels
```

Per Google's pagination guidance: real URLs for paginated content (not infinite scroll). For indexable paginated content: `rel="next"` / `rel="prev"` link rels. For noindex paginated content: just `noindex, follow`.

### 9.5 Search results

```
/search?q=anything → ALWAYS noindex, follow
```

Search results are session-specific and never canonical content.

### 9.6 What NOT to do

```
❌ Auto-create new URL trees for every filter combination
❌ Index thousands of `/browse?state=X&specialty=Y&visa=Z` URLs
❌ Mix indexable + noindex content under same path prefix without explicit logic
❌ Use robots.txt to noindex pages (use meta robots / X-Robots-Tag header)
```

### 9.7 Per Google's noindex guidance

`noindex` is implemented via `<meta name="robots" content="noindex, follow">` or `X-Robots-Tag: noindex, follow` HTTP header. **NOT robots.txt** — robots.txt prevents crawling, not indexing; pages blocked by robots.txt can still appear in results from external links.

---

## 10. Social metadata rules

### 10.1 Required social metadata

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

### 10.2 Rules

- **`og:url` MUST equal the canonical URL.** UTM-stripped, fragment-free.
- **`og:title` MUST match page intent.** Concise version of page H1.
- **`og:description` MUST say who the page is for.**
- **`og:image` MUST be a real, hosted, 1200×630 image.**
- **Twitter `summary_large_image` for content with images.** `summary` (small) for plain articles.
- **`twitter:site` for USCEHub's official handle** (when established).
- **No clickbait.** Match actual page content.
- **Social metadata MUST NOT contradict page metadata.**
- **Preview text MUST NOT overclaim verification or trust.**

### 10.3 No social metadata on noindex pages

Pages marked `noindex, follow` (search results, faceted filters) should NOT have rich OG metadata. Default OG metadata from layout is fine.

### 10.4 Examples

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

### 10.5 Preview overclaim discipline

```
✅ "Source-linked physician jobs with visa pathway notes."
✅ "Official-source clinical experience listings for IMGs."
✅ "Verified programs with last-checked dates."

❌ "100% verified guaranteed jobs."
❌ "The largest USCE database."
❌ "Trusted by thousands of IMGs."
❌ "Apply with confidence."
```

The conservative-language doctrine ([PLATFORM_V2_STRATEGY.md §4.4](PLATFORM_V2_STRATEGY.md), PR #25 baseline) applies to social previews too.

---

## 11. OG image template rules

### 11.1 Future image templates per page type

```
USCE & Match page                  (USCE blue palette)
Residency & Fellowship page        (Residency emerald palette)
Practice & Career page             (Practice purple palette)
Blog/resource page                 (neutral palette + topic tag)
Tool/checklist page                (Tools palette)
Methodology/FAQ page               (Resources palette)
Institution page later             (Institutions palette)
Attorney/recruiter page later      (Practice & Career palette + Sponsored badge)
```

### 11.2 Each image MUST include

- USCEHub logo (top-left or watermark)
- Page title (large, mobile-readable)
- Pathway tag (small, palette-colored chip)
- Source / trust cue when relevant ("Verified ✓" or "Last updated April 2026")
- Clean typography readable on small screens

### 11.3 Layout (1200×630)

```
┌──────────────────────────────────────────────────────────┐
│ [USCEHub logo]                  [Pathway: Practice & Career] │
│                                                            │
│  Page title (large, two lines max)                         │
│  J1 Waiver Hospitalist Jobs in Ohio                        │
│                                                            │
│  Subline (one line, who this is for)                       │
│  Source-linked · Verified · Visa-ready                     │
│                                                            │
│  [12 verified jobs] [Apply via official source]           │
└──────────────────────────────────────────────────────────┘
```

### 11.4 Implementation phasing

- v2 launch: plain branded fallback OG images (single template per pathway, page title rendered).
- Post-launch (Phase 5 of §23): full templated OG-image generator (e.g., serverless function rendering per page-type template).

### 11.5 Do NOT implement images now

Image generation is Phase 5. This doc defines templates conceptually so future implementation has a target.

### 11.6 Anti-patterns

```
❌ Generic OG image (logo + nothing else) — looks like spam in WhatsApp
❌ Stock photo of a doctor with a stethoscope — generic / untrustworthy
❌ Image that contradicts page content (image says "Verified" but page is unverified)
❌ Image that overclaims ("Largest USCE Database") when stats don't support it
```

---

## 12. Share-ready page checklist

Each page intended for sharing must satisfy:

| # | Item | Why |
|---|---|---|
| 1 | Clear page title (H1, ≤ 80 chars) | Above-fold immediate identification |
| 2 | One-line "who this is for" | Defends against bounce |
| 3 | Source / trust status (Phase 3 trust badge) where relevant | AI-search citation pull-through |
| 4 | Pathway cue (subtle, post-load) | User orientation |
| 5 | Same-path related content (3-5 cards) | Conversion to pathway dashboard |
| 6 | Canonical URL (no UTM, no fragment) | SEO + social preview alignment |
| 7 | OG / Twitter card metadata complete | Preview quality across platforms |
| 8 | No blocking modal | Direct-link respect |
| 9 | No forced sign-up | Anonymous-first |
| 10 | Save / compare / share / checklist CTA | Engagement hook |
| 11 | Mobile-readable above the fold | Mobile-first traffic |
| 12 | "Report broken link" / source-issue link if relevant | Trust contract |
| 13 | Graceful expired/unavailable state if applicable | See §13 |

### 12.1 Page-type priority for share-readiness

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

---

## 13. Expired / deleted / unavailable shared link behavior

### 13.1 Failure modes

A shared listing/job/program may later become:

- **Expired** (deadline passed, application window closed, position filled)
- **Source-dead** (program website 404; cron flagged via Phase 3)
- **Program-closed** (admin-confirmed close)
- **Rejected** (admin moderation removed)
- **Deleted** (poster deleted listing)

### 13.2 Graceful handling rule

```
❌ Generic 404 page "Page not found"
✅ Page title preserved + status notice + alternatives
```

### 13.3 Per-state behavior

| State | Indexable? | UI behavior |
|---|---|---|
| **Active** (`status: APPROVED`, `linkVerificationStatus: VERIFIED`) | yes (per §9 quality gate) | full content + apply CTAs |
| **Expired but useful** (deadline passed but historical context valuable) | yes if quality holds; consider noindex if thin | "This opportunity's deadline has passed. Here are similar verified opportunities." |
| **Expired and thin** (no historical value) | noindex | "This opportunity is no longer active. Browse current opportunities." |
| **Source-dead** (`linkVerificationStatus: SOURCE_DEAD`) | downgraded display per [DATA_FRESHNESS_SLA.md](DATA_FRESHNESS_SLA.md) | "Source no longer responds. We're investigating. Browse alternatives." |
| **Program-closed** (`linkVerificationStatus: PROGRAM_CLOSED`) | noindex | "This program has closed. Here are similar programs." |
| **Rejected** (`status: REJECTED`) | noindex; keep slug for inbound link continuity | 404 OR alternative-recommendation page (admin decision) |
| **Deleted** (poster deletion) | 410 Gone OR redirect to category landing | depends on scope; admin decision |

### 13.4 Expired-page UI template

```
┌────────────────────────────────────────────────┐
│ J1 Waiver Hospitalist Jobs in Ohio              │
│ ⚠ This opportunity is no longer active.         │
│ Application window closed March 15, 2026.        │
│                                                  │
│ Similar verified/source-linked opportunities:   │
│                                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ Job 1     │ │ Job 2     │ │ Job 3     │         │
│ │ Ohio J1   │ │ Indiana   │ │ Kentucky  │         │
│ └──────────┘ └──────────┘ └──────────┘         │
│                                                  │
│ See all J1 waiver jobs →                         │
└────────────────────────────────────────────────┘
```

### 13.5 Trust preservation during expiration

- Show last-verified date even on expired page.
- Keep source link (so user can verify "yes, this program is closed") even if it now redirects.
- Show admin-noted reason if available (`PROGRAM_CLOSED` with note).
- Never falsely re-mark expired listings as Active.

### 13.6 Indexation transitions

When a listing transitions Active → Expired:
- Page stays at same canonical URL.
- `<meta robots>` may flip from `index, follow` → `noindex, follow` (depending on §13.3 row).
- Sitemap entry may be removed (next sitemap regen).
- 301 NOT applied (URL still resolves).

When a listing transitions to Deleted:
- Page returns HTTP 410 Gone (preferred over 404 for explicit deletion).
- OR redirects to category landing if it makes UX sense.
- Sitemap entry removed.

### 13.7 Per Google's noindex guidance

Use `<meta name="robots" content="noindex, follow">` or `X-Robots-Tag` header — NOT `robots.txt`. Pages noindexed via robots.txt can still appear in search results from external links.

---

## 14. Social crawler / preview bot access

### 14.1 Why this matters

Social previews require crawler access to public pages and OG image URLs. If `robots.txt` or security headers accidentally block these crawlers, share previews fail and shared links look spammy / untrustworthy.

### 14.2 Future audit (not now)

A future audit pass should verify access for:

- **Twitter / X bot:** `Twitterbot`
- **Reddit bot:** `Reddit/`, `redditbot`
- **Facebook / Meta bot:** `facebookexternalhit/`, `Facebot`
- **LinkedIn bot:** `LinkedInBot`
- **WhatsApp preview fetcher:** `WhatsApp/`
- **Slack bot:** `Slackbot-LinkExpanding`
- **Discord bot:** `Discordbot`
- **Telegram bot:** `TelegramBot`

### 14.3 Rules

- **Public shareable pages and OG images MUST be accessible to these bots.**
- **Private pages (`/dashboard/*`, `/poster/*`, `/admin/*`) MUST stay inaccessible.**
- **Do NOT broadly weaken security to enable previews.**
- **Do NOT allow bots to hit admin/private surfaces.**

### 14.4 Current robots.txt assessment

Per current `public/robots.txt` (from [EXISTING_SURFACE_INVENTORY.md §5.2](EXISTING_SURFACE_INVENTORY.md)):

- `User-agent: *` allow `/` (public surfaces) ✓
- Disallow `/admin`, `/api/`, `/dashboard/`, `/poster/`, `/auth/` — preserved ✓
- Block-list: Bytespider, PetalBot, Scrapy, HTTrack, etc. — preserved ✓

**Pre-launch audit:** verify Twitterbot / facebookexternalhit / WhatsApp / Slackbot / Discord crawlers are not accidentally blocked. Defer the actual fix to a separate small PR if needed.

### 14.5 Decision A5 implications

Per [V2_DECISION_REGISTER.md A5](V2_DECISION_REGISTER.md): AI crawler policy. Social preview crawlers are a separate category from AI crawlers (GPTBot/ClaudeBot/PerplexityBot). The social preview crawler audit is independent of the AI crawler decision.

### 14.6 Audit script (deferred)

Future `scripts/check-social-crawler-access.ts` (per §24): simulates each bot's User-Agent against a sample page, verifies HTTP 200 + OG metadata returned. Not implemented now.

---

## 15. Reddit / Twitter / social behavior

### 15.1 Reddit

Reddit users are skeptical and low-patience.

**Page must satisfy in <5 seconds:**
- What is this?
- Why trust it?
- What source backs it?
- What can I do next?

**Forbidden:**
- Lead capture above the fold
- Forced sign-up
- "Choose a pathway" wall
- Vague claims
- Missing source citation
- Stock-photo physician hero

**Recommended:**
- Source-linked claims (T1 / T2)
- Explicit verification badge
- "Last updated" date
- Plain-text summary above fold
- Direct link to original source

### 15.2 Twitter / X

**Preview card MUST:**
- Title concise (≤ 60 chars ideal)
- Description specific (numbers, sources, audiences)
- OG image branded but readable on small screen
- Card type `summary_large_image` for visual content

**On-page MUST:**
- Page title matches OG title
- Above-fold summary mirrors OG description
- Quick CTA visible
- Mobile-first layout

### 15.3 WhatsApp

**Forbidden:**
- Generic OG image (looks spam)
- Unclear title
- Claims that don't match preview
- Long URLs without tracking-clean canonicals

**Recommended:**
- Page title matches preview
- Image content-relevant (not just logo)
- Description gives clear value

### 15.4 LinkedIn

**Recommended:**
- Professional title / description
- Useful for physician + institution audience
- Cite sources directly
- No clickbait

**Examples (LinkedIn-toned vs Twitter-toned):**

```
LinkedIn:
Physician Fellowship Match 2025: Complete Strategy
Timeline, IMG considerations, visa-friendly programs, and source-verified data for residents planning fellowship.

Twitter:
Fellowship Match 2025
Plan your fellowship — timeline, strategy, IMG-friendly programs, source-verified data.
```

### 15.5 Newsletter / email

When linking from email digest:

- UTM source `newsletter`
- UTM medium `email`
- UTM campaign per digest (e.g., `digest_apr_2026`)
- Per-link `utm_content` may identify CTA position
- All links 301-stable; no temporary redirects

### 15.6 Above-the-fold discipline (universal)

For any social-shared visit, first screen MUST answer:
- What is this?
- Who is it for?
- Why trust it?
- What can I do next?

No long brand intro. No dashboard selector wall.

---

## 16. SEO safeguards

### 16.1 Canonical preservation

Every page MUST emit `<link rel="canonical">` matching the URL-without-pathway-state, UTM-stripped form.

### 16.2 No duplicate pathway URLs

```
❌ Forbidden: /usce-match/visa/j1-waiver
✅ Required: /visa/j1-waiver
```

### 16.3 No uncontrolled faceted URLs

Per [INDEXATION_AND_URL_POLICY.md §3](INDEXATION_AND_URL_POLICY.md): query-param filter URLs are `noindex, follow`.

### 16.4 Noindex thin pages

Search results, filter combinations, audience-query pages, dashboard, admin: all `noindex` per [INDEXATION_AND_URL_POLICY.md §4.2](INDEXATION_AND_URL_POLICY.md).

### 16.5 Useful standalone content

Indexable pages must satisfy [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md) quality gate:
1. Hand-written editorial content
2. Unique data point
3. Primary citation tier T1 / T2 / T4
4. Pass human review queue (status APPROVED)

### 16.6 Social metadata MUST NOT contradict page metadata

`og:title` ≈ `<title>` (same intent; can differ in length).
`og:description` ≈ `<meta name="description">`.

### 16.7 Path personalization MUST NOT change canonical content

Pathway cues, related-content modules, sidebar reordering: all client-side. The HTML Google indexes is identical regardless of pathway preference.

### 16.8 Server-rendered content stays primary

Pathway-aware modules render client-side. The crawler-visible HTML contains:
- Page title
- Main content
- Pathway-tagged related content for the page's primary pathway (not the user's preference)
- Universal tools

### 16.9 No cloaking

Same HTML to bots and humans. No User-Agent-based content variation.

### 16.10 Structured data safety

Per Google's structured-data guidelines: structured data MUST represent the page's main visible content and NOT be misleading.

```
✅ Mark active job listings as JobPosting with valid datePosted, validThrough.
✅ Mark active programs as EducationalOccupationalProgram with verified data.

❌ Mark expired job listings as JobPosting still active.
❌ Mark unverified listings as having Verified status in JSON-LD.
❌ Hide structured-data claims from users (e.g., assert ratings users can't see).
```

### 16.11 Noindex implementation

Per Google's `noindex` guidance:

```
✅ <meta name="robots" content="noindex, follow">
✅ X-Robots-Tag: noindex, follow (HTTP header)
❌ Disallow in robots.txt (prevents crawling, not indexing)
```

### 16.12 Do NOT canonicalize with URL fragments

```
❌ <link rel="canonical" href="https://uscehub.com/jobs/j1-waiver#apply">
✅ <link rel="canonical" href="https://uscehub.com/jobs/j1-waiver">
```

### 16.13 Use canonical for duplication, not noindex

If two URLs serve the same content, use `<link rel="canonical">` to consolidate, not `noindex`. `noindex` removes the page from search results entirely; canonical consolidates ranking signal to the preferred URL while keeping both URLs accessible.

---

## 17. Cache / localStorage policy

### 17.1 Stored values

```
pathwayPreference         = usce_match | residency_fellowship | practice_career | all_pathways
pathwayPreferenceUpdatedAt = ISO date
pathwaySubState           = (optional) sub-state key
pathwaySubStateUpdatedAt  = (optional) ISO date
lastEntrySource           = (optional) "twitter" | "reddit" | "google" | etc.
mismatchDismissedThisSession = sessionStorage flag (per-session)
```

### 17.2 Strict rules

| Rule | Behavior |
|---|---|
| **Never redirects** | localStorage NEVER causes a URL change. |
| **Never changes canonical** | Canonical tag is server-rendered. |
| **May reorder secondary modules** | Related-content, sidebar order, default subscription category. |
| **May show cue/pill** | Per §5. |
| **May influence default route** | When user clicks "Open my pathway" from homepage, route to their preferred pathway dashboard. |
| **Direct URL always wins** | Path 1 cache + Path 3 URL = Path 3 URL renders. |
| **Re-prompt only after milestones** | 6 months OR behavior contradicts preference. |
| **User can reset preference** | Profile + dashboard pill dropdown both have "Clear pathway." |

### 17.3 sessionStorage vs localStorage

| Use case | Storage |
|---|---|
| Pathway preference (cross-session) | localStorage |
| Sub-state preference (cross-session) | localStorage |
| Mismatch cue dismissal (this visit only) | sessionStorage |
| Recent search query (this visit only) | sessionStorage |
| Skipped-selector flag (per-session) | sessionStorage |

### 17.4 Privacy posture

- Pathway preference is functional data. No third-party tracking.
- localStorage is browser-isolated; not synced via any third-party service.
- No cookie banner required for pathway preference (functional cookie).

### 17.5 First-party analytics only

Per [PLATFORM_V2_STRATEGY.md §16](PLATFORM_V2_STRATEGY.md) — Vercel Analytics aggregate only. No per-user cross-site tracking.

---

## 18. Logged-in future behavior

**No schema changes at v2 launch. Future-only section.**

### 18.1 Profile preference (when authorized)

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

### 18.2 Cross-device sync

Logged-in users with profile preference: pathway syncs across devices.

### 18.3 Conflict resolution

When localStorage and profile disagree:

```
Account preference (server) wins on read.
One-time prompt: "Your account says X; this device says Y. Which is current?"
[Use account preference] [Update account to device preference]
```

### 18.4 Direct URL still wins

Even with profile preference + logged-in:

```
User logged in; profile.pathwayPreference = practice_career
User clicks /usce/observerships/california from Twitter
→ USCE state page renders
→ Cue: "This topic usually belongs to USCE & Match."
→ NO redirect to /dashboard
```

### 18.5 Dashboard uses profile preference more strongly

On `/dashboard/*` (auth-gated), profile preference fully personalizes. Public pages: profile preference influences cue + related-content; URL still wins.

### 18.6 returnTo preserved through auth

Per §3.3:

```
Clicked: /dashboard/saved
→ /auth/signin?returnTo=/dashboard/saved
After login: → /dashboard/saved (profile preference applies on landing)
```

### 18.7 Profile sync gated

Per [PLATFORM_V2_STRATEGY.md §7.1](PLATFORM_V2_STRATEGY.md): future schema for `User.pathwayPreference` requires explicit user authorization. v2 launch ships with localStorage-only.

---

## 19. Related content strategy

### 19.1 Five-tier related content

```
Tier 1: Same object type (e.g., more J1 waiver jobs for a J1 job page)
Tier 2: Same pathway (e.g., other Practice & Career resources)
Tier 3: Same specialty / location (cross-cutting filter)
Tier 4: Canonical guide / tool (e.g., visa decision helper)
Tier 5 (fallback): All-pathways generic resource
```

### 19.2 Examples per page type

**J1 waiver job page (`/jobs/j1-waiver-hospitalist-ohio`):**

```
Tier 1 (same object type):
  - More J1 waiver jobs (Ohio, then expanding)
  - H1B-friendly jobs (similar visa vector)

Tier 2 (same pathway: Practice & Career):
  - Conrad 30 state guide
  - Contract checklist
  - Immigration attorney directory

Tier 3 (same specialty/location):
  - Internal Medicine attending jobs (specialty)
  - Other Ohio physician opportunities

Tier 4 (canonical guide/tool):
  - Visa decision helper
  - "Plan visa transition during training" (cross-path bridge to R&F)

Tier 5 (generic):
  - Methodology
  - Report broken link
```

**USCE listing page (`/listing/[id]`):**

```
Tier 1 (same object type):
  - Similar USCE programs (same specialty + state first)

Tier 2 (same pathway: USCE & Match):
  - State USCE browse
  - Document checklist (CV, personal statement)
  - Match strategy for IMGs

Tier 3 (same specialty/location):
  - All cardiology USCE programs
  - All NY physician programs

Tier 4 (canonical guide/tool):
  - "Preparing for residency intern year" (cross-path bridge)
  - Compare programs tool

Tier 5 (generic):
  - Methodology
  - Save / compare
```

**Expired J1 job page (special case per §13):**

```
Tier 1 (same object type, ACTIVE):
  - Active J1 waiver jobs

Tier 2 (visa pathway):
  - J1 waiver guide
  - Conrad 30 state info

Tier 3 (location):
  - Other Ohio physician jobs

Tier 4 (canonical guide):
  - Contract checklist
  - Immigration attorney directory

Tier 5: Practice & Career dashboard CTA
```

### 19.3 Anti-patterns

```
❌ Forced cross-path
   J1 waiver job page should NOT show:
   - USCE listings
   - Match strategy

❌ Pathway-preference override
   Same-path related content stays the same regardless of user's localStorage preference.
   The PAGE's pathway determines related content.

❌ "Recommended for you" without basis
   Don't show personalized recommendations to anonymous users.
```

### 19.4 Curation source

For each canonical page, hand-curate the related-content list. Don't auto-generate by tag matching alone — that produces noise.

---

## 20. Trust inheritance

### 20.1 Rule

Any shareable opportunity / program / job / service page MUST inherit:

- Source link (canonical to T1 source per [PLATFORM_V2_STRATEGY.md §4.5](PLATFORM_V2_STRATEGY.md))
- Last verified or "official source on file" date (per [DATA_FRESHNESS_SLA.md](DATA_FRESHNESS_SLA.md))
- Report issue / broken source link
- Review status if relevant
- No false verified claims

### 20.2 Why

Social-shared pages are the most-public surfaces. If they detach from the trust system (e.g., a beautifully designed J1 job page that doesn't show source link or verified date), they become trust shells that look credible without backing.

Per [PLATFORM_V2_STRATEGY.md §10.4](PLATFORM_V2_STRATEGY.md): "the moat USCEHub builds in 2026 has to be defensible in 2027 when AI search is the default surface."

### 20.3 What every shareable opportunity page MUST show

```
Trust strip:
  [Verified ✓] · Last verified Apr 14, 2026 · Source: [program website ↗]
  [Source on file] · Source URL on file · [program website ↗]
  [Needs review] · Source returning errors · [Report broken link]
  [Source no longer responds] · Last successful check Mar 8, 2026 · [Find alternatives]
```

### 20.4 Trust badge sourcing

Trust state derived from `Listing.linkVerificationStatus` + `lastVerifiedAt` per Phase 3 verification engine. The page renders the badge that matches DB state. No manually-overridable "Verified" badge on the page UI.

### 20.5 Anti-patterns

```
❌ Custom SEO/share page that hides verification status
❌ "Editor's pick" or "Featured" badges that aren't operationally true
❌ "Trusted by thousands" on listing pages without proof
❌ Removing source link to keep user on USCEHub
```

### 20.6 Trust inheritance in OG metadata

Social previews should reflect trust state where space allows:

```
og:description: "Source-linked physician jobs · Last verified April 2026 · Apply via official source"
```

NOT:
```
og:description: "Verified jobs trusted by IMGs"  ← overclaim
```

---

## 21. Save / share behavior

### 21.1 CTA inventory (per shareable page)

```
Copy link to clipboard
Share to X / Twitter
Share to WhatsApp
Share to LinkedIn
Save (logged-in)
Compare (where relevant)
Report issue
View source link
```

### 21.2 Rules

- **Reading never requires sign-up.** Anonymous users see content + cue + share/copy CTAs.
- **Saving may require login.** Per §3.7, login preserves `returnTo`.
- **Sharing never requires login.** Copy-to-clipboard works anonymously; share-to-X opens X composer with pre-filled URL/text.
- **Report issue available anonymously.** Anonymous user can report broken link / source issue.

### 21.3 Share copy patterns

Pre-filled share text varies by destination:

```
Twitter / X (≤ 280 chars):
"J1 waiver hospitalist jobs in Ohio — verified source links + visa pathway notes 🩺
{url}"

WhatsApp:
"USCEHub — J1 Waiver Hospitalist Jobs in Ohio
Source-linked physician jobs with visa pathway notes.
{url}"

LinkedIn:
"Sharing for IMG colleagues exploring J1 waiver options:
USCEHub maintains source-linked physician job listings with visa pathway notes and contract checklists.
{url}"

Email (mailto:):
Subject: J1 Waiver Hospitalist Jobs in Ohio
Body: I thought you might find this useful — {url}
```

### 21.4 Copy-link UX

Click "Copy link" → copies canonical URL (no UTM injected by user; UTM only attached if shared via "Share to X" with the X UTM template).

### 21.5 Save UX (anonymous)

```
Click Save → /auth/signin?returnTo={canonical}&action=save
After login → page re-renders with item saved
NO redirect away from the listing
```

### 21.6 No dark patterns

```
❌ "Sign up to read full content" gate after first paragraph
❌ "Sign up to share" requirement
❌ Pre-checked "subscribe to newsletter" on save action
❌ Modal interrupts after 30 seconds asking for email
❌ "Limited spots — sign up now" urgency manipulation
```

---

## 22. Analytics event model

### 22.1 Events to track (deferred implementation)

```
external_referral_landed       — first external visit to a page in this session
entry_source_detected          — UTM/referrer parsing result
pathway_context_shown          — match/mismatch/no-preference cue shown
pathway_mismatch_shown         — mismatch cue specifically (subset of above)
pathway_switch_clicked         — user clicked Switch in cue
pathway_switch_completed       — switch persisted to localStorage
pathway_skipped                — user skipped selector
share_cta_clicked              — Share button click (per platform)
share_link_copied              — Copy-link click
save_cta_clicked               — Save attempt (success or login redirect)
login_return_to_used           — Returned to original URL post-login
related_card_clicked           — Click on related content card
related_card_tier              — Which tier did the click come from (1-5)
expired_page_alternative_clicked — Click on expired-page alternative
report_issue_clicked           — Report broken link / source issue
trust_badge_clicked            — User clicks trust badge (curiosity signal)
source_link_clicked            — User clicks external source link (positive trust signal)
social_preview_validated       — Future: per-page preview health check passed
```

### 22.2 Per-event dimensions

```
{
  pathway_tag: "practice_career",       // page's primary pathway
  user_pathway_pref: "usce_match",      // user's localStorage preference (or null)
  utm_source: "twitter",
  utm_medium: "social",
  utm_campaign: "j1_jobs",
  page_type: "J1_WAIVER_JOB",
  page_url_canonical: "/jobs/j1-waiver-hospitalist-ohio",
  is_logged_in: false,
  is_mobile: true,
  device_type: "iOS",
  trust_state: "VERIFIED",
}
```

### 22.3 Goals of measurement

- **Per-source bounce rate.** Reddit vs Twitter vs WhatsApp vs Google.
- **Per-pathway conversion.** Saved/compared/applied per pathway.
- **Cue effectiveness.** Match cue vs mismatch cue vs no-preference cue: which drives engagement / switch / bounce?
- **returnTo success rate.** Did login flow preserve destination correctly?
- **Expired-page recovery.** Do users click alternatives or bounce?
- **Trust signal CTR.** Do verified-badge clicks correlate with positive engagement?

### 22.4 Aggregate-only

Per [PLATFORM_V2_STRATEGY.md §16](PLATFORM_V2_STRATEGY.md): no per-user behavior tracking beyond what aggregate analytics requires. Vercel Analytics is fine; full-session replay is not.

### 22.5 No analytics implementation in this PR

These events are documented for future build per a separate METRICS doc (deferred). Implementation in Phase 9 of §23.

---

## 23. Implementation phases

### Phase 1 — docs only

✅ This doc.

### Phase 2 — audit existing metadata + share previews

- Inventory current OG / Twitter metadata coverage across listing pages, blog posts, /residency/*, /career/*, etc.
- Identify pages missing share-ready metadata.
- Test current share previews on Twitter / Reddit / WhatsApp / LinkedIn / Discord using their respective debug tools.
- Verify social crawler access per §14 audit.

### Phase 3 — define page-type pathway tags + registry

- Implement `src/lib/page-type-registry.ts` per §7 shape.
- Add `pathwayTag` constant to each existing page (USCE, /residency/*, /career/*, blog, tools).
- No redirect logic; tag-only.

### Phase 4 — add non-blocking pathway cue

- Client-side cue component reads `pathwayTag` + localStorage preference.
- Renders match / mismatch / no-preference cue.
- Dismissible per session.

### Phase 5 — add share metadata templates + OG image generation

- Per-page-type OG / Twitter card defaults (registry-driven).
- Per-pathway OG image template (serverless image rendering or static templates).
- Standardize copy patterns.

### Phase 6 — add related-content modules

- Per-page curated related-content arrays (5-tier per §19).
- Tier 1-5 rendering.
- Mobile-first.

### Phase 7 — add expired/unavailable landing behavior

- Per §13: expired states surface alternatives.
- Trust preservation during expiration.
- Indexation transitions wired to `linkVerificationStatus` + `status`.

### Phase 8 — add share-readiness validation script

- Per §24: `scripts/check-share-readiness.ts`.
- Sample-route validation.
- Pre-launch / pre-distribution gate.

### Phase 9 — add analytics

- `pathway_cue_shown`, `pathway_cue_dismissed`, `pathway_switched_from_cue`, etc. per §22.
- `share_link_landed`, `utm_*` tracking.
- Per-source bounce rate, conversion rate dashboards.

---

## 24. Future audit script proposal

### 24.1 Script: `scripts/check-share-readiness.ts`

Future read-only script that validates representative routes for share-readiness.

### 24.2 Checks

For each sampled route:

```
✓ HTTP status 200 (not 404, 500, redirect-loop)
✓ <link rel="canonical"> present
✓ Canonical URL matches expected pattern (no UTM, no fragment)
✓ Canonical URL is same-origin
✓ <meta name="description"> present and ≤ 160 chars
✓ <title> present and ≤ 60 chars (or close)
✓ og:title present
✓ og:description present
✓ og:image present and 200-OK fetchable
✓ og:image is 1200×630 (or close to recommended ratio)
✓ og:url present and equals canonical
✓ og:type appropriate for page type (article / website / etc.)
✓ twitter:card present and matches og:type expectation
✓ twitter:title present
✓ twitter:description present
✓ twitter:image present
✓ No unexpected noindex on indexable page (per registry §7)
✓ No unexpected indexable on noindex page (search results, filter combos)
✓ No UTM canonical pollution (canonical doesn't carry UTM)
✓ Trust cue rendered if page-type registry says trustRequired = true
✓ Pathway tag matches page-type registry
✓ No blocking modal in initial HTML
✓ Page renders content without JavaScript (server-rendered)
```

### 24.3 Run cadence

```
Pre-launch: full sweep across registry-listed page types.
Pre-distribution: before Twitter/Reddit/WhatsApp campaign.
Weekly: smoke test on top 20 most-shared pages.
On-demand: by operator before pushing a high-volume share.
```

### 24.4 Failure handling

```
Critical fails (no canonical, no OG, broken image):
  exit code 1, block deploy/distribution.

Warning fails (description too long, image not ideal aspect ratio):
  exit code 0, log to operator review.
```

### 24.5 Exit code discipline

Match the existing `scripts/check-verify-listings-cron.ts` pattern: PASS / WARN / FAIL summary; exit code 1 only on critical violations.

### 24.6 Dependencies

- Read-only HTTP fetcher (against deployed preview or production)
- HTML parser (built-in or lightweight library)
- No DB access (script runs against rendered HTML, not data layer)

### 24.7 Do NOT implement now

Phase 8 of §23. Defer until pathway cue + share metadata + page-type registry are live.

---

## 25. Open decisions

### 25.1 Cue copy

1. **Match cue copy.** Recommend: "Viewing: {pathway label}. {short description}."
2. **Mismatch cue copy.** Recommend: "This topic is usually part of {page pathway}. Your saved pathway is {user preference}."
3. **No-preference cue copy.** Recommend: "Make USCEHub yours. Choose your path for personalized resources."

### 25.2 Cue display

4. **Show cue on every page or only on mismatches.** Recommend: every page, but match-cue much more subtle.
5. **Pathway pill always visible vs preference-only.** Per [PATHWAY_DASHBOARD_ARCHITECTURE.md §6.4](PATHWAY_DASHBOARD_ARCHITECTURE.md): pill visible only when preference is set. Confirmed.

### 25.3 Social metadata

6. **Pathway-specific OG image templates at launch?** Recommend: defer to Phase 5; v2 launch uses generic branded fallback.
7. **UTM naming convention.** Recommend: lowercase, snake_case. Document in playbook.
8. **Reddit-specific copy style.** Recommend: yes — more direct, less marketing. LinkedIn: more professional.

### 25.4 SEO + personalization

9. **How much personalization is safe for SEO.** Recommend: client-side only (cue + related). Server-rendered HTML stays canonical.
10. **Whether social-shared pages should hide homepage selector entirely.** Recommend: no — selector lives only on homepage. Other pages use small pathway pill.

### 25.5 Filter / sort indexability

11. **Which filter combinations become clean indexable landing pages?** Recommend: state + specialty + listing-type combinations that pass §9 quality gate. Default all others to noindex.

### 25.6 Expired page indexation

12. **When expired pages stay indexable vs noindex?** Recommend: expired-but-useful (historical context) stays indexable with downgraded freshness state; expired-and-thin goes noindex; deleted goes 410 Gone.

### 25.7 Bot access policy

13. **Social preview crawler allowlist.** Recommend audit per §14.2; explicit-allow Twitter/Facebook/LinkedIn/WhatsApp/Slack/Discord; preserve Bytespider/PetalBot/scraper blocks.
14. **AI crawler policy.** Per [V2_DECISION_REGISTER.md A5](V2_DECISION_REGISTER.md): unresolved. Independent of social preview crawler decision.

### 25.8 Pathway query param

15. **Whether `?pathway=` query param is allowed at all.** Recommend: NO. Pathway state stays in localStorage. If a future feature wants deep-linkable pathway-state, use a different mechanism.

### 25.9 Phase D schema

16. **`User.pathwayPreference` schema PR timing.** Defer per [PLATFORM_V2_STRATEGY.md §7.1](PLATFORM_V2_STRATEGY.md). Pathway preference stays anonymous-only at v2 launch.

### 25.10 Phase 0 audit dependencies

17. **Reconcile with Phase 0 audits.** This doc may need revision after PR 0c-0g audits surface application-flow / review-flow / community-flow / recommend-tool / cost-calculator implications.

### 25.11 returnTo mechanism

18. **returnTo cookie vs URL parameter.** Recommend URL parameter. Easier to debug, no cross-tab leakage.

### 25.12 Login redirect on per-action gate

19. **Per-action gate re-render vs server-redirect after login.** Recommend: after login + returnTo, page re-renders with action completed.

### 25.13 OG image fallback

20. **Default OG image when page-type-specific image is missing.** Recommend: site-wide default with USCEHub logo + pathway color (per page's tag).

---

## 26. SEO impact

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

## 27. /career impact

None directly. `/career/*` and `/careers/*` preserved unchanged per [RULES.md](../codebase-audit/RULES.md) §2.

`/career/*` pages will inherit the pathway tag `practice_career` and gain share-ready metadata + related-content modules per the page-type checklist. No URL change. No content rewrite. Just metadata + cue layered on top.

## 28. Schema impact

None at v2 launch. §18 enumerates future possible fields; each requires explicit authorization per [PLATFORM_V2_STRATEGY.md §7](PLATFORM_V2_STRATEGY.md).

## 29. Authorization impact

None. This doc binds future implementation but authorizes nothing on its own. Each phase (per §23) requires its own authorization PR.

---

## 30. The single rule to remember

```
The page they clicked is the page they get.
Pathway preference helps orient them.
It never blocks, redirects, or replaces the destination.

Login preserves returnTo.
Expired pages surface alternatives.
Trust state inherits to every shareable page.
```

If any future PR or feature violates these rules, it is wrong by definition. The cost of breaking these rules once is permanent SEO damage + user trust loss; the cost of preserving them is one extra layer of architectural discipline.
