# USCEHub v2 — Information Architecture

**Status:** v2 planning doc, foundational. Defines nav, page map, audience paths, and indexation candidacy for the v2 overhaul.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), and [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md). Where any conflict, those win.
**Authored:** 2026-04-29.
**Companion docs:** [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md) §3–§14, [USCEHUB_MASTER_BLUEPRINT.md §0](../codebase-audit/USCEHUB_MASTER_BLUEPRINT.md), [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md), [NAVIGATION_MODEL.md](NAVIGATION_MODEL.md), [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md), [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md).

This doc operationalizes the eight-vertical thesis from [PLATFORM_V2_STRATEGY.md §3.3](PLATFORM_V2_STRATEGY.md) and the canonical taxonomy from §4 into a concrete page map. It does **not** authorize implementation. Implementation only happens after the user approves the IA + nav + wireframe + template inventory together, and only inside `redesign/platform-v2` per [PLATFORM_V2_STRATEGY.md §5.2](PLATFORM_V2_STRATEGY.md).

---

## 1. Purpose

USCEHub today serves a verified-USCE wedge for IMGs. The long-term product is a whole-physician-pipeline platform — USCE → Match → Fellowship → Jobs → Visa → Tools → Resources → For Institutions. v2 IA must:

- expose all eight verticals as first-class nav items so the brand reads as a pipeline platform, not a directory
- never expose a vertical that has no real content behind it (the "honest empty state" rule from [PLATFORM_V2_STRATEGY.md §14.3](PLATFORM_V2_STRATEGY.md))
- preserve every URL, sitemap entry, and indexable page from the current live site (per [PLATFORM_V2_STRATEGY.md §2](PLATFORM_V2_STRATEGY.md))
- bind every page to the canonical taxonomy in [PLATFORM_V2_STRATEGY.md §4](PLATFORM_V2_STRATEGY.md) so future faceted navigation, search, and SEO inherits the same dimensions
- separate buyer-side (institution) IA from user-side IA per [PLATFORM_V2_STRATEGY.md §15](PLATFORM_V2_STRATEGY.md)

This doc is the source of truth for "what pages does v2 have, in what hierarchy, with what URL, indexed how." It is the prerequisite for [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md), [NAVIGATION_MODEL.md](NAVIGATION_MODEL.md), and [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md).

---

## 2. Current live site vs v2

### 2.1 Current live site (binding inventory)

These URLs are live on `uscehub.com` today. v2 must preserve every one (or migrate with 301 redirects + sitemap rebuild per [PLATFORM_V2_STRATEGY.md §8.5](PLATFORM_V2_STRATEGY.md)):

| URL | Purpose | Status |
|---|---|---|
| `/` | Homepage — IMG/USCE-first framing | preserve, redesign in v2 |
| `/browse` | Browse all listings | preserve, redesign in v2 |
| `/browse?type=...&state=...` | Filtered browse (query-param) | preserve, formalize as `noindex, follow` per [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md) |
| `/listing/[id]` | Listing detail | preserve, redesign in v2 |
| `/observerships` | Observerships index | preserve, becomes USCE/observerships in v2 |
| `/observerships/[state]` | State observership pages | preserve, must pass §9 quality gate |
| `/specialties/[specialty]` | Specialty pages | preserve, must pass §9 quality gate |
| `/compare` | Listing compare | preserve, becomes Tools/compare in v2 |
| `/recommend` | Listing recommend | preserve, becomes Tools/recommend in v2 |
| `/dashboard/saved` | Logged-in saved listings | preserve, becomes Tools/dashboard in v2 |
| `/dashboard/compare` | Logged-in compare | preserve |
| `/admin/verification-queue` | Admin queue | preserve, internal-only, not in user IA |
| `/blog` | Blog index | preserve, becomes Resources/blog in v2 |
| `/blog/[slug]` | Blog post | preserve, becomes Resources/blog/[slug] in v2 |
| `/methodology` | Methodology | preserve, becomes Resources/methodology in v2 |
| `/img-resources` | IMG resources | preserve, becomes Resources/img in v2 |
| `/faq` | FAQ | preserve, becomes Resources/faq in v2 |
| `/for-institutions` | Institution landing | preserve, becomes For Institutions root in v2 |
| `/career` and `/career/**` | **Protected per [RULES.md](../codebase-audit/RULES.md) §2** — unfinished asset | **preserve unchanged in v2; do NOT migrate or rename** |
| `/careers` | **Protected per [RULES.md](../codebase-audit/RULES.md) §2** | **preserve unchanged** |
| `/sitemap.xml` | Sitemap | preserve, regenerate at launch |
| `/robots.txt` | Robots | preserve unchanged |

### 2.2 What v2 changes vs preserves

**Changes (only in `redesign/platform-v2` branch, never on `main` until launch):**
- Nav structure: from current nav → eight-vertical nav per §3
- Homepage hero, primary CTA, audience surface
- Browse page: from listing-feed-first → decision-engine-first
- Listing detail: stronger trust elements, source-tier surface, freshness state
- New top-level routes: `/match`, `/fellowship`, `/jobs`, `/visa`, `/tools`, `/resources`, `/institutions`
- Audience-segment landing pages

**Preserves (on `main` always; v2 inherits unchanged):**
- All current URLs in §2.1
- Conservative trust language (PR #25 / #27 baseline)
- `/career` and `/careers` route trees in full
- Sitemap inclusion criteria for current pages
- robots.txt permissive baseline
- Vercel cron count (2)

---

## 3. Recommended top navigation (eight verticals)

Reaffirmed from [PLATFORM_V2_STRATEGY.md §3.3](PLATFORM_V2_STRATEGY.md) and [USCEHUB_MASTER_BLUEPRINT.md §0](../codebase-audit/USCEHUB_MASTER_BLUEPRINT.md):

```
USCE | Match | Fellowship | Jobs | Visa | Tools | Resources | For Institutions
```

### 3.1 Why eight verticals (not fewer)

Each vertical is a distinct user job-to-be-done with a distinct funnel. Collapsing them ("Career Path" wrapping Jobs + Visa + Match + Fellowship) is tempting for a smaller nav but costs us:

- The brand reads as a directory (USCE) plus a content blob, not a pipeline platform.
- AI-search can't disambiguate intent: "USCEHub fellowship pathways" vs "USCEHub residency match" need separate canonical landings.
- Each vertical eventually gets its own SEO content pillar (per [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md)) — wrapping them muddies the canonical URL story.

### 3.2 Why not more than eight

We considered separate nav items for `Pre-Med`, `MS3 Away Rotations`, `Step Prep`, `Residency Application Timeline`, `Locum Tenens`. Each of these belongs **inside** an existing vertical:

- `Pre-Med` → Resources (or out of scope; we are a physician-pathway platform, not pre-med)
- `MS3 Away Rotations` → USCE (away rotations are a USCE subtype)
- `Step Prep` → out of scope (USMLE study tools are a different product; we link to first-party sources, not compete)
- `Residency Application Timeline` → Match
- `Locum Tenens` → Jobs

### 3.3 Vertical-by-vertical rationale

| Vertical | Job-to-be-done | Audience tags (per [§4](PLATFORM_V2_STRATEGY.md)) | Wedge today | Future depth |
|---|---|---|---|---|
| USCE | "Find verified clinical experience that matches my visa, time, money, and audience constraints" | `img-non-us`, `img-us`, `usmg-md`, `usmg-do` | live, current strongest surface | observerships + externships + electives + research + postdoc, all with verified source links |
| Match | "Plan, prepare for, and survive the residency match cycle" | `img-non-us`, `img-us`, `usmg-md`, `usmg-do` | not built; FREIDA/Residency Explorer/NRMP own the official data; we bridge with IMG-aware strategy + visa-friendly program lists | strategy guides + program lists + signaling + SOAP + interview prep |
| Fellowship | "Plan, prepare for, and apply to fellowships, especially visa-friendly ones" | `resident`, `fellow` | not built | subspecialty guides + program lists + competitiveness data |
| Jobs | "Find an attending job that matches my visa status, location preference, specialty, and contract terms" | `pre-attending`, `attending`, `img-non-us`, `img-us` | unfinished `/career/jobs` work preserved per [RULES.md](../codebase-audit/RULES.md) §2 | J1 waiver jobs + H1B-friendly jobs + locums + attending transition |
| Visa | "Navigate J1, H1B, Conrad 30, waivers, green card pathway" | `img-non-us`, `img-us`, `resident`, `fellow`, `pre-attending`, `attending` | scattered across `/career/waiver`, `/career/h1b`, etc., per [RULES.md](../codebase-audit/RULES.md) §2 | unified visa hub + decision tools + attorney directory |
| Tools | "Use a tool that helps me decide / track / compare / get notified" | all | partial: `/compare`, `/recommend`, `/dashboard/saved` | compare + recommend + alerts + checklists + decision helpers + cost calculator |
| Resources | "Read structured guidance, methodology, FAQ, blog" | all | live: `/blog`, `/methodology`, `/img-resources`, `/faq` | blog + methodology + IMG resources + FAQ + glossary + change log |
| For Institutions | "Hospital / GME / observership host / recruiter / attorney can claim, sponsor, or partner" | `institution` | live: `/for-institutions` | claim flow + sponsorship + recruiter directory + attorney directory + contract review + financial services (Phase D, [§14.1](PLATFORM_V2_STRATEGY.md)) |

### 3.4 Nav order rationale

The order `USCE | Match | Fellowship | Jobs | Visa | Tools | Resources | For Institutions` mirrors the user's career timeline: clinical experience → residency → fellowship → attending job → visa support, then cross-cutting Tools + Resources, then the buyer-side surface last. Alternatives considered:

| Order | Rationale | Rejected because |
|---|---|---|
| Audience-first (`IMG | USMG | Resident | Fellow | Attending | Institutions`) | Matches taxonomy §4.1 cleanly | Requires every audience to navigate to the same content via different paths; bloats URL count; fails canonical URL policy |
| Tool-first (`Search | Compare | Alerts | Checklists | Browse | ...`) | Surfaces decision moats from §10 | Hides the eight-vertical positioning that anchors the brand thesis |
| Career-stage-first (`Pre-Match | Match | Pre-Attending | Attending`) | Maps to §4.2 stage taxonomy | Overlaps awkwardly with vertical (Match Prep ⊂ Pre-Match stage); duplicates URLs |
| Buyer-first (`For Institutions | For Trainees | ...`) | Surfaces monetization audience | Inverts buyer/user separation per [PLATFORM_V2_STRATEGY.md §15](PLATFORM_V2_STRATEGY.md); buyer surface should not lead nav |

**Recommendation: vertical-first nav, with audience and career-stage exposed as filters / facets inside each vertical, not as separate nav items.**

---

## 4. Audience paths

Audiences (per [§4.1](PLATFORM_V2_STRATEGY.md)) navigate the same vertical pages but with different default filters and different curated landing pages. Audience paths are **filters and curated landings**, not separate URL prefixes.

### 4.1 Audience landing pages

Each audience gets one curated landing under `/for-{audience}/`:

| URL | Audience | Default filter set | Primary CTA |
|---|---|---|---|
| `/for-img` | `img-non-us`, `img-us` | USCE for IMGs, visa-aware program filter | "Browse verified IMG-friendly programs" |
| `/for-us-students` | `usmg-md`, `usmg-do` | USCE for visiting MS3/MS4 + away rotations | "Find away rotations" |
| `/for-residents` | `resident` | Fellowship + Match (re-application) + Jobs preview | "Plan your fellowship" |
| `/for-fellows` | `fellow` | Jobs + Visa + attending transition | "Plan your attending year" |
| `/for-attendings` | `attending`, `pre-attending` | Jobs + Visa + contract review + insurance | "Plan your transition" |
| `/for-new-attendings` | `pre-attending`, `attending` (first-year) | Visa + contracts + insurance + financial setup | "Set up your first attending year" |

These pages are **curated**, not auto-generated. Each requires hand-written intro + audience-specific tone + curated content selection. Per [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md), audience landings without unique editorial content do not enter the sitemap.

### 4.2 Audience-aware filter inheritance

When a user lands on `/for-img` and clicks "Browse USCE," the URL navigates to `/usce?audience=img` (or `/usce/observerships?audience=img`). The audience filter persists as a query param across navigation within the visit. This is a **session preference**, not a personal account setting (which requires login + schema).

The audience query param is `noindex, follow` per [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md) §3.2 — only the unfiltered canonical URL is indexed.

### 4.3 Career-stage as filter

Career stages (`pre-clinical`, `clinical-experience`, `pre-match`, `intra-match`, `resident`, `pre-fellowship`, `fellow`, `pre-attending`, `attending` per [§4.2](PLATFORM_V2_STRATEGY.md)) are filters, not URL paths. Tools that are stage-specific (e.g. visa decision helper for `pre-attending`) live in their natural Tools URL with a stage-tag filter, not at `/pre-attending/tools/visa-helper`.

---

## 5. Page map per vertical

Detailed URL hierarchy per vertical. Bold = exists today. Italic = future-only, skeletal until built.

### 5.1 USCE

```
/usce                          (vertical landing — replaces /browse as the canonical USCE entry)
  /usce/observerships          (replaces /observerships)
    /usce/observerships/[state]  (replaces /observerships/[state]; curated only, must pass §9)
  /usce/externships
    /usce/externships/[state]    (curated only)
  /usce/electives
  /usce/research
  /usce/postdoc
  /usce/[listing-slug]         (replaces /listing/[id], slug = "{id}-{kebab-title}")
/browse                        (preserve as-is or 301 → /usce; decision pending in §13)
/observerships                 (preserve as-is or 301 → /usce/observerships; decision pending)
/listing/[id]                  (preserve as-is or 301 → /usce/[listing-slug]; decision pending)
```

**Today:** `/browse`, `/listing/[id]`, `/observerships`, `/observerships/[state]` are live and indexed.
**v2 launch:** new canonical URLs above; old URLs 301 with sitemap rebuild per [PLATFORM_V2_STRATEGY.md §8.5](PLATFORM_V2_STRATEGY.md).
**Open decision:** keep both URL trees vs aggressive 301 (§13).

### 5.2 Match

```
/match                         (vertical landing)
  /match/strategy
    /match/strategy/img         (curated audience-specific guide)
    /match/strategy/us-md       (curated)
    /match/strategy/us-do       (curated)
    /match/strategy/old-yog     (curated)
    /match/strategy/reapplicant (curated)
    /match/strategy/couples     (curated; future)
  /match/timeline               (residency app timeline)
  /match/signaling
  /match/soap
  /match/interviews
    /match/interviews/preparation
    /match/interviews/programs   (program-specific interview notes; curated, future)
  /match/rank-list
  /match/programs
    /match/programs/[specialty]  (residency programs by specialty; curated; defer to FREIDA where deeper)
    /match/programs/[specialty]/[state]  (curated only, must pass §9)
  /match/img-friendly           (curated list of IMG-friendly programs; flagship page for IMG audience)
```

**Today:** none live.
**v2 launch:** vertical landing + `/match/strategy/img` + `/match/img-friendly` + `/match/timeline` minimum. Other pages launch as curated.
**Honest empty state if not built:** "Match — coming soon. Be the first to know."

### 5.3 Fellowship

```
/fellowship                     (vertical landing)
  /fellowship/strategy
  /fellowship/timeline
  /fellowship/[specialty]       (subspecialty guides; curated)
    /fellowship/[specialty]/programs
    /fellowship/[specialty]/competitiveness
    /fellowship/[specialty]/img-friendly
  /fellowship/visa-friendly     (cross-cuts with Visa vertical; canonical here; deeplink from /visa)
```

**Today:** none live.
**v2 launch:** vertical landing + `/fellowship/visa-friendly` minimum.
**Note:** USCEHub does not replace ABMS / specialty board / fellowship match systems. We bridge: visa-friendly programs, IMG-friendly programs, audience-specific strategy.

### 5.4 Jobs

```
/jobs                           (vertical landing)
  /jobs/attending               (general attending job board — curated only; may stay sparse pre-launch)
  /jobs/j1-waiver               (cross-cuts with /career/waiver per [RULES.md](../codebase-audit/RULES.md))
  /jobs/h1b-friendly
  /jobs/locums
  /jobs/transition              (resident/fellow → attending)
  /jobs/[state]                 (state-specific job lists; curated only, must pass §9)
  /jobs/[specialty]             (specialty-specific job lists; curated only)
```

**Today:** unfinished `/career/jobs` work preserved per [RULES.md](../codebase-audit/RULES.md) §2.
**v2 launch decision:** new `/jobs` URL tree alongside preserved `/career/jobs`. The new tree is for v2 launch; the old tree stays untouched.
**Open decision:** at v2 launch, do we 301 from `/career/jobs` → `/jobs/...` (clean URL) or keep both? Per [RULES.md](../codebase-audit/RULES.md) §2, deletion / rename of `/career` requires explicit user approval. **Default: keep both, no auto-redirect, no auto-rename.**

### 5.5 Visa

```
/visa                           (vertical landing)
  /visa/j1
  /visa/h1b
  /visa/conrad-30
    /visa/conrad-30/[state]     (state-by-state Conrad 30 program info; curated only)
  /visa/waiver
    /visa/waiver/process
    /visa/waiver/timeline
    /visa/waiver/[state]        (state-by-state waiver info; curated only)
  /visa/green-card
  /visa/visa-bulletin           (cross-cuts with /career/visa-bulletin per [RULES.md](../codebase-audit/RULES.md))
  /visa/decision-helper         (interactive tool — lives here despite being a Tool, because primary user intent is visa-stage)
```

**Today:** scattered across `/career/waiver/**`, `/career/h1b/**`, `/career/conrad-tracker/**`, `/career/visa-bulletin/**` per [RULES.md](../codebase-audit/RULES.md) §2.
**v2 launch:** new `/visa` URL tree. Old `/career/...` tree preserved unchanged.
**Open decision:** same as Jobs — 301 vs keep both. **Default: keep both.**

### 5.6 Tools

```
/tools                          (vertical landing — index of all tools)
  /tools/compare                (replaces /compare; existing tool)
  /tools/recommend              (replaces /recommend; existing tool)
  /tools/saved                  (replaces /dashboard/saved; logged-in)
  /tools/alerts                 (digest + deadline reminders; gated by [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md))
  /tools/checklist              (career-stage checklist; future)
  /tools/visa-decision-helper   (alias / canonical with /visa/decision-helper TBD; see [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md))
  /tools/fellowship-competitiveness (future)
  /tools/cost-calculator        (USCE cost estimator; future)
  /tools/timeline-builder       (custom application timeline; future)
```

**Today:** `/compare`, `/recommend`, `/dashboard/saved` live.
**v2 launch:** `/tools` vertical landing + `/tools/compare`, `/tools/recommend`, `/tools/saved` minimum. Old URLs 301 to new.

### 5.7 Resources

```
/resources                      (vertical landing — index of all resources)
  /resources/blog               (replaces /blog; full blog index)
    /resources/blog/[slug]      (replaces /blog/[slug])
    /resources/blog/category/[category]  (curated category landings only, must pass §9)
  /resources/methodology        (replaces /methodology)
  /resources/img                (replaces /img-resources)
    /resources/img/getting-started
    /resources/img/usce-explained
    /resources/img/match-strategy  (cross-link to /match/strategy/img canonical)
  /resources/faq                (replaces /faq)
  /resources/glossary           (new — IMG-friendly glossary of USMLE/match/visa terms)
  /resources/change-log         (new — public-facing change log of platform updates, builds trust over time)
```

**Today:** `/blog`, `/blog/[slug]`, `/methodology`, `/img-resources`, `/faq` live.
**v2 launch:** preserve all live URLs, add `/resources` index, prefer new URLs as canonical, 301 old → new with sitemap rebuild.
**Open decision:** old URLs 301 vs keep both? Blog has the most SEO equity — recommend 301 with sitemap rebuild and submit to GSC.

### 5.8 For Institutions

```
/institutions                   (vertical landing — replaces /for-institutions)
  /institutions/claim           (claim flow for hospitals / programs to claim their listing)
  /institutions/sponsor         (sponsorship offering; gated by [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md))
  /institutions/recruiters      (recruiter directory; future, Phase C+)
  /institutions/attorneys       (immigration attorney directory; future, Phase C+)
  /institutions/contract-review (contract reviewer directory; future, Phase D)
  /institutions/financial       (financial professional directory; future, Phase D)
  /institutions/marketplace     (full marketplace; future, Phase D)
  /institutions/dashboard       (logged-in institution dashboard; future)
```

**Today:** `/for-institutions` live, mostly informational.
**v2 launch:** `/institutions` vertical landing + `/institutions/claim` minimum. Other pages defer.
**Note:** This vertical is the buyer-side surface. Per [PLATFORM_V2_STRATEGY.md §15.2](PLATFORM_V2_STRATEGY.md), it's structurally separate from user-side IA.

---

## 6. Cross-cutting page types

### 6.1 Audience-segment landings (curated)

Per §4.1: `/for-img`, `/for-us-students`, `/for-residents`, `/for-fellows`, `/for-attendings`, `/for-new-attendings`. Each is a curated landing with a hero pitch, an audience-specific intro paragraph, links to relevant verticals, and a primary CTA.

### 6.2 Career-stage hubs (deferred)

Hubs like `/pre-attending` could replace audience landings, but they're deferred until v2 ships and we see usage patterns. **Default: don't build career-stage URLs in v2 launch; revisit Phase C.**

### 6.3 Search

Global search lives at `/search` (currently does not exist) and accepts `q=...` query param. `/search` is `noindex, follow`. Search results are not indexable per [INDEXATION_AND_URL_POLICY.md §4.2](INDEXATION_AND_URL_POLICY.md).

### 6.4 Account / dashboard

Logged-in surface lives under `/dashboard` (current `/dashboard/saved`, `/dashboard/compare` migrate here). All `/dashboard/*` is `noindex, follow`. Auth-gated.

### 6.5 Admin (internal, not in user IA)

`/admin/verification-queue` and any future admin surfaces stay at `/admin/*`, `noindex, follow`, auth-gated. Not in user nav, not in sitemap.

### 6.6 Legal

```
/privacy
/terms
/accessibility
/disclosure       (per [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md))
/cookies          (if/when we use cookies beyond strictly-necessary)
```

In footer, not in top nav.

---

## 7. What exists now vs future

### 7.1 Built and live (Phase A baseline)

- USCE: `/browse`, `/listing/[id]`, `/observerships`, `/observerships/[state]`, partial specialty pages
- Tools: `/compare`, `/recommend`, `/dashboard/saved`, `/dashboard/compare`
- Resources: `/blog`, `/blog/[slug]`, `/methodology`, `/img-resources`, `/faq`
- For Institutions: `/for-institutions`
- Admin: `/admin/verification-queue`
- Career (preserved unchanged): `/career/**`, `/careers`

### 7.2 Built in v2 launch batch (Phase B target)

- USCE: vertical landing `/usce`, redesigned listing detail, redesigned browse-as-decision-engine, externships/electives/research subroutes
- Match: `/match` landing + `/match/strategy/img` + `/match/img-friendly` + `/match/timeline`
- Fellowship: `/fellowship` landing + `/fellowship/visa-friendly`
- Jobs: `/jobs` landing only (skeletal honest empty state)
- Visa: `/visa` landing + `/visa/j1` + `/visa/h1b` + `/visa/conrad-30` + `/visa/decision-helper` (tool)
- Tools: `/tools` landing + redesigned `/tools/compare` + `/tools/recommend` + `/tools/saved` + `/tools/alerts` (no-send preview only per [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md))
- Resources: `/resources` landing + migrated `/resources/blog`, `/resources/methodology`, `/resources/img`, `/resources/faq` + new `/resources/glossary`
- Institutions: `/institutions` landing + `/institutions/claim`
- Audience landings: `/for-img`, `/for-us-students`, `/for-residents`, `/for-fellows`, `/for-attendings`

### 7.3 Built post-launch (Phase C target, 6+ months after v2 launch)

- Match: full strategy hub, signaling, SOAP, interviews, rank list
- Fellowship: subspecialty pages, competitiveness, programs
- Jobs: J1 waiver, H1B-friendly, locums, transition, state/specialty curated landings
- Visa: full waiver tree, green card pathway
- Tools: alerts (real send post-prerequisites), checklist, fellowship competitiveness, cost calculator, timeline builder
- Resources: change log, glossary expansion
- Institutions: recruiters directory, attorneys directory

### 7.4 Built in Phase D (marketplace)

- Institutions: contract review, financial professionals, full marketplace, institution dashboard
- Tools: paid claim flow, sponsored placement system per [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md)

---

## 8. What stays hidden / unlaunched

### 8.1 Hidden until built (no nav exposure)

If a vertical's first useful page is not built, the vertical does **not** appear in nav until it is. Top-nav presence is a public commitment. The eight-vertical nav target ships only when each has at least one curated, useful page or an honest empty state.

| Vertical | Minimum page to expose in nav |
|---|---|
| USCE | already live |
| Match | `/match` landing + `/match/strategy/img` |
| Fellowship | `/fellowship` landing + `/fellowship/visa-friendly` |
| Jobs | `/jobs` landing with honest "Coming soon" + email signup |
| Visa | `/visa` landing + `/visa/j1` + `/visa/h1b` |
| Tools | `/tools` landing + at least 2 of: compare, recommend, saved |
| Resources | already live |
| For Institutions | `/institutions` landing |

### 8.2 Skeletal "Coming soon" allowed conditions

A skeletal vertical landing is acceptable in nav if and only if:
- The page exists and 200s
- The copy is honest ("Coming soon — we're building structured X content. Be the first to know: [email signup]")
- No skeleton listing data, no placeholder content, no fake stats
- The email signup is gated by [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md) double-opt-in
- The page is `noindex, follow` until real content lands

### 8.3 Forbidden until built

- Generic top-nav links to `/match`, `/fellowship`, `/jobs`, `/visa`, `/tools`, `/institutions` on `main` before v2 launch (would 404 or look broken).
- Sitemap entries for unbuilt verticals.
- Marketing claims that imply built verticals exist ("Plan your match" if `/match` is `404`).
- Press / Twitter / external linking to unbuilt URLs.

### 8.4 Internal preview routes (allowed)

`redesign/platform-v2` Vercel preview deployments may contain unbuilt routes — they are 401-gated by SSO. Operators (us) can preview. Not in production sitemap. Per [PLATFORM_V2_STRATEGY.md §8.4](PLATFORM_V2_STRATEGY.md), preview deployments emit `X-Robots-Tag: noindex, nofollow` for defense-in-depth.

---

## 9. Indexable vs noindex candidates

Per [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md). Summary table:

| Page type | Sitemap entry? | Robots/meta | Why |
|---|---|---|---|
| Vertical landings (`/usce`, `/match`, etc., once useful) | yes | indexable | unique editorial value |
| Listing detail (`/usce/[listing-slug]`) | yes | indexable | unique data per listing |
| Curated state pages (`/usce/observerships/california`) | yes if pass §9 | indexable if pass §9 | curated editorial + state-specific data |
| Audience landings (`/for-img`, etc.) | yes if curated | indexable | curated editorial |
| Blog posts | yes if approved | indexable | original editorial |
| Tools (`/tools/compare`, etc.) | yes | indexable | unique interactive surface |
| Faceted browse (`/browse?type=X&state=Y`) | no | `noindex, follow` | facet, not canonical |
| Search results (`/search?q=...`) | no | `noindex, follow` | session-specific, not canonical |
| Audience query param (`/usce?audience=img`) | no | `noindex, follow` | facet of vertical landing |
| Logged-in surface (`/dashboard/*`) | no | `noindex, nofollow` | auth-gated, no public value |
| Admin (`/admin/*`) | no | `noindex, nofollow` | internal |
| Legal pages (`/privacy`, etc.) | yes | indexable | required for trust + AI search |
| Skeletal "Coming soon" verticals | no | `noindex, follow` | no real content yet |
| Preview deployments | no | `noindex, nofollow` | not production |

---

## 10. Filters that must NOT create indexable pages

Per [INDEXATION_AND_URL_POLICY.md §4.2](INDEXATION_AND_URL_POLICY.md), the following filters must remain query-param only (not generate path segments, not enter sitemap):

- Audience filter (`?audience=img|us-md|...`)
- Career-stage filter (`?stage=pre-match|...`)
- Cost filter (`?cost=free|low|moderate|...`)
- Duration filter (`?duration=2w|4w|8w|...`)
- Visa-friendliness filter (`?visa=j1|h1b|both|...`)
- Sort order (`?sort=newest|verified|distance|...`)
- Page number (`?page=2`)
- Search query (`?q=...`)

The state filter and specialty filter have **two valid expressions:**

1. **Query-param** (`/usce?state=NY`) — `noindex, follow`, no editorial differentiation
2. **Path** (`/usce/observerships/new-york`) — only when curated with hand-written intro + state-specific data per [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md)

Path versions enter sitemap; query-param versions do not. Combinatorial faceting (`/usce/observerships/new-york/cardiology` etc.) requires per-combination editorial review and the §9 quality gate — recommend deferring this entirely to Phase C+.

---

## 11. Mobile-first navigation model

The detailed mobile nav is in [NAVIGATION_MODEL.md](NAVIGATION_MODEL.md). IA-relevant rules:

- Mobile nav collapses 8 verticals into a hamburger menu with audience-aware ordering.
- The mobile homepage hero exposes 3-5 primary paths (Find USCE / Plan Match / Find Visa-Friendly Jobs / Build My Checklist), not all 8 verticals.
- Mobile listing detail prioritizes: trust badge, source link, deadline, cost, location, then full content.
- Mobile browse uses sticky filter chips, not a sidebar.
- Mobile search is one tap from any page (search icon in top nav).

---

## 12. Launch sequencing

### 12.1 Pre-v2 (current state, ongoing)

- Stabilize Phase 3 trust engine (mostly done)
- Merge copy queue (PR #25, PR #27) when batch-reviewed
- GSC + sitemap monitoring
- Cron health daily check
- No new top-nav items on `main`
- v2 IA + wireframe + nav + template inventory drafted on `redesign/platform-v2-planning` (this batch)

### 12.2 v2 launch batch (target)

Single coherent release. Includes:

1. New nav with 8 verticals (every vertical has at least its honest-empty-state landing or real content)
2. Redesigned homepage per [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md)
3. Redesigned browse + listing detail
4. New `/usce`, `/match`, `/fellowship`, `/jobs`, `/visa`, `/tools`, `/resources`, `/institutions` URLs
5. Audience landings: `/for-img`, `/for-us-students`, `/for-residents`, `/for-fellows`, `/for-attendings`
6. 301 redirects for old → new URLs (sitemap rebuild)
7. Updated metadata + canonical + JSON-LD across all migrated pages
8. Preserved `/career/*` and `/careers/*` unchanged

### 12.3 Post-launch (Phase C, 6+ months)

- Build out Match strategy depth
- Build out Visa hub depth
- Launch Tools/alerts after [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md) prerequisites met
- Build out Jobs depth (cross-coordinating with `/career/*` preserved tree)
- First sponsored placements per [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md)

### 12.4 Marketplace (Phase D, deferred)

- Recruiter directory
- Attorney directory
- Contract review
- Financial professional directory
- Full marketplace flows

---

## 13. Open decisions for user review

These are decisions the IA work surfaces but does not resolve. Each requires explicit user choice before implementation.

1. **Old URL 301 vs keep-both for migrated content.** Does `/blog` 301 → `/resources/blog` at v2 launch, or do both URLs remain live with `/resources/blog` as canonical and `/blog` as alias? Recommendation: 301 for blog (clean canonical, GSC-resubmit-friendly); keep-both for `/career/*` and `/careers/*` per [RULES.md](../codebase-audit/RULES.md) §2.

2. **Old `/observerships/*` migration.** Same question: 301 to `/usce/observerships/*` or keep both? Recommendation: 301 (USCE vertical is the new canonical structure).

3. **`/listing/[id]` migration.** Slug change to `/usce/[listing-slug]` is more SEO-friendly but changes URL of every existing listing. Recommendation: 301 with permanent redirects, sitemap rebuild, GSC re-crawl.

4. **Audience landings — how many at v2 launch?** Six (one per audience) is comprehensive but 6 curated landings is significant content investment. Minimum viable: 2 (`/for-img`, `/for-us-students`). Recommendation: launch with `/for-img`, `/for-us-students`, `/for-residents` minimum; add others post-launch.

5. **Career-stage URLs.** `/pre-attending`, `/intra-match`, etc. — build at v2 launch or defer? Recommendation: defer entirely; audience landings cover the use case until usage signals demand.

6. **Visa decision helper canonical URL.** `/tools/visa-decision-helper` or `/visa/decision-helper`? They cannot both be canonical. Recommendation: `/tools/visa-decision-helper` is canonical (Tools is the vertical for decision-helper); `/visa/decision-helper` is alias / 301.

7. **Tool URLs vs query params for tool state.** `/tools/compare/[id1]-[id2]-[id3]` (path-based) vs `/tools/compare?ids=...` (query-param). Recommendation: query-param (compare state is ephemeral, not canonical content). `/tools/compare` is the canonical entry; query params are `noindex, follow`.

8. **`For Institutions` placement in nav.** Last in nav (after Resources) is correct per buyer/user separation but visually de-emphasizes the eventual revenue surface. Alternative: small "For Institutions" link in top-right utility nav, separate from user-side eight-vertical nav. Recommendation: utility-nav placement (small link, top-right), keep main nav user-focused.

9. **Search — global vs vertical-scoped?** `/search?q=X` searches across everything, or `/usce?q=X` searches within USCE? Recommendation: both. Global search lives at `/search`; per-vertical search uses query param.

10. **Empty-vertical behavior.** When `/match` exists but only has the landing + 1 page, should nav indicate "Match (preview)" with a soft visual marker, or just show "Match" as if fully built? Recommendation: just "Match" (no preview marker — adds visual noise; user discovers depth on click).

11. **USCE vs Browse as the canonical entry.** `/usce` becomes canonical; `/browse` either 301s or stays as alias. Recommendation: `/usce` canonical, `/browse` 301.

12. **Mobile nav behavior — sticky vs scroll-away.** Per [NAVIGATION_MODEL.md](NAVIGATION_MODEL.md). Recommendation: sticky on mobile to preserve nav access on long pages.

13. **Footer structure.** Should footer mirror the eight verticals, or be a more compact link map (Resources / Tools / Legal / About)? Recommendation: compact (full vertical list is in main nav; footer is for legal + low-traffic links).

14. **Logged-in vs logged-out IA differences.** Logged-in users should see saved-listings count in nav, dashboard link, etc. How prominent? Recommendation: minimal — small avatar with dropdown to dashboard / saved / sign out; same vertical nav otherwise.

15. **First-touch attribution.** Should the IA surface "How you found us" capture (referral source) for product analytics? Recommendation: defer; rely on Vercel Analytics aggregate; no per-user tracking.

---

## 14. Rules that bind every page

Reaffirmed for IA:

1. **Trust language consistency.** Every page that mentions verification uses the conservative language from [PLATFORM_V2_STRATEGY.md §4.4](PLATFORM_V2_STRATEGY.md) and PR #25 / #27 baseline.
2. **Honest empty states.** Skeletal pages say "Coming soon" honestly; never fake content.
3. **Source-tier disclosure.** Pages with claims show their source authority tier per [§4.5](PLATFORM_V2_STRATEGY.md).
4. **No `T5-anecdotal` as primary citation.**
5. **Monetization disclosure per [§4.6](PLATFORM_V2_STRATEGY.md).**
6. **Preview noindex per [§8.4](PLATFORM_V2_STRATEGY.md).**
7. **No top-nav item without a useful page behind it.**
8. **`/career` and `/careers` preserved unchanged.**
9. **No new top-level routes on `main` until v2 launch.**

---

## 15. SEO / indexation impact (this doc)

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
- risk level:          ZERO — internal IA planning doc
```

## /career impact

None. `/career` and `/careers` preserved unchanged.

## Schema impact

None. IA planning surfaces taxonomy needs (audience tags, career-stage tags, source-authority tier, monetization disclosure) per [PLATFORM_V2_STRATEGY.md §7.3](PLATFORM_V2_STRATEGY.md). No schema migration authorized by this doc.

## Authorization impact

None. Documenting an IA structure is not authorization to implement it. Implementation requires:
- User approval of this doc + [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md) + [NAVIGATION_MODEL.md](NAVIGATION_MODEL.md) + [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md) together
- Creation of `redesign/platform-v2` long-running branch per [PLATFORM_V2_STRATEGY.md §5.2](PLATFORM_V2_STRATEGY.md)
- All schema additions per [PLATFORM_V2_STRATEGY.md §7.1](PLATFORM_V2_STRATEGY.md) (additive, backward-compatible, individually authorized)
