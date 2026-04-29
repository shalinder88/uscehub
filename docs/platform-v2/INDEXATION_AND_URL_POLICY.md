# USCEHub v2 — Indexation and URL Policy

**Doc status:** Draft recommendation. **14 open decisions extracted to [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md).** AI crawler policy = blocking decision A5.

> **Revision notice (2026-04-29 audit):** §8.4 "v2 must additionally emit `X-Robots-Tag: noindex, nofollow`" — **already implemented** in [next.config.ts](../../next.config.ts) for non-`uscehub.com` hosts. v2 must not regress; not new work. §12.4 "AI crawlers allowed by default" — **conflicts with existing [public/robots.txt](../../public/robots.txt)** which blocks Bytespider + PetalBot. Status: **open decision A5** in [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md). Recommendation: keep existing anti-scraper blocks + add explicit allows for GPTBot/ClaudeBot/PerplexityBot/anthropic-ai/ChatGPT-User. §5 sitemap criteria: existing [src/app/sitemap.ts](../../src/app/sitemap.ts) auto-generates entries for all 50 US states + all specialties + all blog posts + all 50 waiver states — **§9 quality gate is grandfathered** for these existing entries (decision B9), applies only to new entries.

**Status:** v2 planning doc. Defines canonical URL rules, sitemap inclusion criteria, indexability per page type, faceted-navigation handling, and crawler discipline.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md).
**Authored:** 2026-04-29.

---

## 1. Purpose

USCEHub v2 generates many candidate URLs (vertical landings × audiences × states × specialties × tools × content). The default of "let's index all of them" is wrong — Google's helpful-content guidance and faceted-navigation guidance both penalize the indexation of low-value template combinations.

This doc operationalizes [PLATFORM_V2_STRATEGY.md §8 (URL/indexation doctrine)](PLATFORM_V2_STRATEGY.md) and §9 (programmatic SEO quality gate) into per-route enforcement rules.

### 1.1 Two anchoring principles

1. **Depth before breadth.** Every indexable URL has hand-curated content + traceable primary-source data. Template-only programmatic combinations stay out of the sitemap.
2. **One canonical per resource.** Faceted filters, audience query params, sort orders, and pagination never replace the canonical URL — they are explicitly `noindex, follow`.

---

## 2. Canonical URL rules

### 2.1 Path conventions

- Lowercase only. `/usce/observerships/california`, never `/USCE/Observerships/California`.
- Hyphens between words. `/jobs/h1b-friendly`, not `/jobs/h1b_friendly` or `/jobs/h1bfriendly`.
- No trailing slash. `/usce/observerships`, not `/usce/observerships/`.
- Plurals match the noun's natural form: `/jobs` (plural), `/visa` (singular as a vertical name; but `/visa/visas-bulletin` if needed).
- No file extensions (no `.html`, `.php`).
- No `?` query params in canonical URL — query params modify the canonical, never replace it.

### 2.2 Slug stability

- Once a listing is published, its slug never changes.
- Listing slugs: `{listing-id}-{kebab-title}`. Renaming a listing changes display title; slug stays.
- Blog slugs: `{kebab-title}` (no ID prefix); never edit slug after publish (would orphan inbound links).
- Pathway guide slugs: hand-picked `{kebab-title}`; never edit.

### 2.3 Canonical hierarchy

Each indexable URL has exactly one canonical form. Aliases (if any) 301 to the canonical:

| Resource | Canonical | Aliases (301 → canonical) |
|---|---|---|
| Homepage | `/` | `/index`, `/index.html`, `/home` |
| USCE vertical | `/usce` | `/browse` (TBD; see [INFORMATION_ARCHITECTURE.md §13](INFORMATION_ARCHITECTURE.md) open decision #1) |
| Observerships | `/usce/observerships` | `/observerships` |
| State page | `/usce/observerships/california` | `/observerships/california` (if migrating) |
| Listing detail | `/usce/12345-johns-hopkins-cardiology-observership` | `/listing/12345` |
| Tool | `/tools/compare` | `/compare` |
| Tool | `/tools/recommend` | `/recommend` |
| Blog post | `/resources/blog/usce-vs-externship` | `/blog/usce-vs-externship` |
| Methodology | `/resources/methodology` | `/methodology` |

### 2.4 `<link rel="canonical">` rule

Every indexable page emits `<link rel="canonical" href="https://uscehub.com{canonical-path}">` where `{canonical-path}` is the resource's canonical URL with no query params.

For pages with query-param filters (e.g. `/usce?audience=img`), the canonical points to the unfiltered URL (`/usce`).

For pages with pagination (e.g. `/resources/blog?page=2`), the canonical points to the unparameterized form (`/resources/blog`); pagination uses `<link rel="next">` / `<link rel="prev">`.

For preview deployments, canonical still points to `https://uscehub.com{path}` (production canonical), not the preview URL — this prevents preview URLs from accidentally getting indexed if SSO protection is misconfigured.

---

## 3. Faceted navigation handling

Per Google's faceted-navigation guidance, URL spaces explode quickly when filter combinations generate paths. Three failed patterns:

- **All combinations indexable** — millions of low-value pages, crawl budget exhausted, helpful-content penalty.
- **Cookie-only filters (no URL state)** — user can't share filtered views; back button breaks.
- **Path-segment filters** — `/usce/observerships/california/cardiology/free` looks tidy but combinatorially explodes.

### 3.1 USCEHub v2 rule

Filter state lives in **query params**, not path segments. Query-param URLs are `noindex, follow`.

```
/usce/observerships                      ← canonical, indexable, in sitemap
/usce/observerships?state=NY             ← noindex, follow (state filter via query)
/usce/observerships?state=NY&type=elective ← noindex, follow
/usce/observerships?audience=img         ← noindex, follow (audience filter)
/usce/observerships?cost=free            ← noindex, follow
/usce/observerships?sort=verified        ← noindex, follow
```

### 3.2 Path-segment versions of state and specialty (curated only)

State pages and specialty pages have a path-segment form **only** when curated. The path version is canonical and indexable; the query-param version is `noindex, follow` and emits `<link rel="canonical">` to the path version (when one exists):

```
/usce/observerships/california           ← canonical, indexable (if passes §9)
/usce/observerships?state=california     ← canonical → /usce/observerships/california; noindex, follow
```

If no curated path version exists for a state, the query-param version is `noindex, follow` and canonicals to the unfiltered `/usce/observerships`.

### 3.3 Combinatorial explosion limits

We do **not** generate paths for state × specialty, state × type, audience × specialty, etc. Each additional dimension multiplies the URL space; without a hand-curated, traceable, T1/T2-cited intro per combination, the page fails the [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md) quality gate.

If a combination becomes high-value (e.g. "California cardiology observerships for IMGs"), it can graduate to a path-segment URL **only after** a curator writes a hand-written intro and the page passes review — not before.

### 3.4 Filter list (per [INFORMATION_ARCHITECTURE.md §10](INFORMATION_ARCHITECTURE.md))

These filters are query-param-only, never path:

- Audience (`?audience=img-non-us|img-us|usmg-md|usmg-do|resident|fellow|attending`)
- Career stage (`?stage=...`)
- Cost (`?cost=free|low|moderate|high`)
- Duration (`?duration=2w|4w|8w|...`)
- Visa-friendliness (`?visa=j1|h1b|both|sponsor`)
- Sort (`?sort=newest|verified|deadline|distance`)
- Page (`?page=2`)
- Search query (`?q=...`)

These filters have a path-segment form (curated only) AND a query-param form (always):

- State (path: `/usce/observerships/[state]`; query: `?state=`)
- Specialty (path: `/usce/[specialty]`; query: `?specialty=`)

### 3.5 URL parameter handling specification

For machine readability, here is the parameter-handling table:

| Param | Purpose | Indexable when alone? | Persistent across nav within session? |
|---|---|---|---|
| `state` | filter by state | path version yes (curated); query-param no | yes |
| `specialty` | filter by specialty | path version yes (curated); query-param no | yes |
| `type` | filter by listing type | no | yes |
| `audience` | filter by audience | no | yes |
| `stage` | filter by career stage | no | yes |
| `cost` | filter by cost | no | yes |
| `duration` | filter by duration | no | yes |
| `visa` | filter by visa-friendliness | no | yes |
| `sort` | sort order | no | yes (within vertical) |
| `page` | pagination | no | no |
| `q` | search query | no | no |
| `from` | tracking source | no | no |
| `utm_*` | UTM tracking | no | yes (analytics only, not propagated) |

---

## 4. Indexability per page type

Reaffirmed from [INFORMATION_ARCHITECTURE.md §9](INFORMATION_ARCHITECTURE.md). Cross-referenced with [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md).

### 4.1 Indexable pages

| Page type | Sitemap | `<meta robots>` |
|---|---|---|
| Homepage (`/`) | yes | `index, follow` |
| Vertical landing (built or skeletal-launched) | yes if curated | `index, follow` |
| Audience landing (curated) | yes | `index, follow` |
| Directory page (canonical, no params) | yes | `index, follow` |
| Listing detail (`/usce/[slug]`, status APPROVED) | yes | `index, follow` |
| Curated state page (passes §9 gate) | yes | `index, follow` |
| Curated specialty page (passes §9 gate) | yes | `index, follow` |
| Pathway guide (status APPROVED) | yes | `index, follow` |
| Tool URL (canonical, no state) | yes | `index, follow` |
| Comparison page (curated) | yes | `index, follow` |
| Blog post (status APPROVED) | yes | `index, follow` |
| Blog index | yes | `index, follow` |
| Blog category index (curated, ≥ 3 posts + intro) | yes | `index, follow` |
| Methodology / FAQ / IMG resources / glossary | yes | `index, follow` |
| Legal pages (`/privacy`, `/terms`, `/accessibility`, `/disclosure`) | yes | `index, follow` |

### 4.2 Non-indexable pages

| Page type | Sitemap | `<meta robots>` | Why |
|---|---|---|---|
| Faceted browse (`?state=X&type=Y`) | no | `noindex, follow` | facet, not canonical |
| Audience query-param (`?audience=img`) | no | `noindex, follow` | facet of vertical landing |
| Sort / page query-params | no | `noindex, follow` | session state |
| Search results (`/search?q=*`) | no | `noindex, follow` | session-specific |
| Tool result (`/tools/compare?ids=...`) | no | `noindex, follow` | session state |
| Logged-in dashboard (`/dashboard/*`) | no | `noindex, nofollow` | auth-gated |
| Admin (`/admin/*`) | no | `noindex, nofollow` | internal |
| Skeletal "Coming soon" landing | no | `noindex, follow` | content not built yet |
| Alert / digest preview (`/tools/alerts/preview/[id]`) | no | `noindex, nofollow` | preview only |
| Preview deployments (any URL) | no | `noindex, nofollow` (header `X-Robots-Tag`) | not production |
| Curated state page that fails §9 quality gate | no | `noindex, follow` | doesn't meet quality bar |
| Listing in non-`APPROVED` status (`DRAFT`, `REJECTED`, `PENDING`) | no | `noindex, follow` | not yet approved |

### 4.3 Why `nofollow` vs `follow` distinction matters

- `noindex, follow`: the page is not indexed but its links flow PageRank to the destinations. Use for facets, search results, sort variants.
- `noindex, nofollow`: the page is not indexed and its links don't flow PageRank. Use for auth-gated, admin, preview, internal.

The default for non-indexable user-facing surfaces is `noindex, follow` — we still want crawlers to discover the canonical URLs from those pages.

---

## 5. Sitemap inclusion criteria

`/sitemap.xml` is auto-generated from the database + content registry.

### 5.1 What enters the sitemap

A URL enters the sitemap if and only if:

1. It is indexable per §4.1.
2. Its content has `status = APPROVED` (for DB-backed pages).
3. Its `lastReviewedAt` is within the freshness window per [DATA_FRESHNESS_SLA.md](DATA_FRESHNESS_SLA.md) (Current or Aging tier; not Stale or Reverify-required).
4. It passes the [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md) quality gate (for programmatic surfaces).
5. It is not blocked by `robots.txt`.

### 5.2 Sitemap structure

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://uscehub.com/</loc>
    <lastmod>2026-04-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://uscehub.com/usce</loc>
    <lastmod>2026-04-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- ... -->
</urlset>
```

### 5.3 Sitemap update cadence

- Listing additions / status changes: included in next sitemap regeneration (within 24 hours).
- Curated content updates: included in next sitemap regeneration.
- Sitemap regeneration runs on every successful `main` deploy + once-per-day fallback cron (re-uses the existing cron — does not require third cron).

### 5.4 Sitemap size limits

Google's sitemap limit is 50,000 URLs / 50 MB uncompressed per file. USCEHub at v2 launch will have:

- ~10 vertical landings + audience landings + tools + methodology = ~25 pages
- ~300 listing detail pages
- ~50 curated state / specialty pages (only those passing §9)
- ~50 blog posts + 5 blog category landings + 1 blog index
- 5 legal pages

Total ~440 URLs. Well under the 50K limit. Single sitemap file is sufficient.

If the sitemap exceeds 50K (Phase C+), split into a sitemap index (`/sitemap-index.xml` referencing `/sitemap-listings.xml`, `/sitemap-content.xml`, `/sitemap-tools.xml`, etc.).

### 5.5 What does NOT enter the sitemap

- Faceted URLs (per §4.2).
- Search results.
- Logged-in dashboard.
- Admin.
- Skeletal "Coming soon" pages.
- Preview deployments.
- Pages failing the §9 quality gate.
- Listings in `DRAFT`, `REJECTED`, `PENDING` status.

---

## 6. JSON-LD requirements

Per-template JSON-LD is in [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md). Cross-cutting:

### 6.1 `Organization` schema

On homepage only:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "USCEHub",
  "url": "https://uscehub.com",
  "logo": "https://uscehub.com/logo.svg",
  "description": "Free physician career-pathway platform: verified clinical training, match prep, visa navigation, physician careers.",
  "sameAs": [
    "https://twitter.com/uscehub",
    "https://www.linkedin.com/company/uscehub"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@uscehub.com"
  }
}
```

### 6.2 `WebSite` schema with `SearchAction`

On homepage only:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "USCEHub",
  "url": "https://uscehub.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://uscehub.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### 6.3 `BreadcrumbList`

On every page level 2+. Per [NAVIGATION_MODEL.md §5.3](NAVIGATION_MODEL.md).

### 6.4 Page-specific schema

Per [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md):

- Listing detail: `EducationalOccupationalProgram`
- Pathway guide / blog post (medical): `MedicalScholarlyArticle` or `Article`
- Pathway guide / blog post (general): `Article`
- Tool: `WebApplication` or `SoftwareApplication`
- FAQ page: `FAQPage`
- Methodology: `WebPage` with `description` + `lastReviewed`
- Audience landing: `WebPage` with `audience` property

### 6.5 JSON-LD validation

Before each release, run schema-validator on all JSON-LD blocks:

```bash
npx schema-dts-gen --validate src/lib/json-ld/*
```

(Schema validator implementation deferred; recommend integrating into CI before v2 launch.)

---

## 7. Robots.txt

`/robots.txt` stays permissive. Default:

```
User-agent: *
Allow: /

# Block internal surfaces
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/

# Block search results
Disallow: /search?

# Block faceted query params (defense-in-depth; meta robots is primary)
# Disallow: /*?audience=*  — too aggressive; meta robots is sufficient

Sitemap: https://uscehub.com/sitemap.xml
```

### 7.1 Why we don't block faceted query params in robots.txt

Robots.txt is a coarse tool. Blocking `/usce?*` would block the canonical `/usce` page (because Google may visit `/usce?ref=foo` from inbound links). Use `<meta robots>` for facet exclusion instead — finer-grained, and Google honors it correctly.

### 7.2 Why we block `/api/`

API endpoints aren't pages — there's no value in indexing them, and they can have side effects on visit (e.g. `/api/cron/verify-listings` is auth-gated but blocking in robots.txt is defense-in-depth).

---

## 8. Preview deployment handling

Per [PLATFORM_V2_STRATEGY.md §8.4](PLATFORM_V2_STRATEGY.md):

- Vercel previews are 401-gated by SSO on Hobby. That blocks crawlers regardless of meta robots.
- v2 must **additionally** emit `X-Robots-Tag: noindex, nofollow` header on preview deployments (defense-in-depth).
- Preview detection: `process.env.VERCEL_ENV !== "production"`.
- Already wired for production today; v2 must not regress.

If preview protection is ever disabled (e.g. for a public preview link to share with stakeholder):

- The preview must still emit `noindex, nofollow` headers.
- The canonical URL on every preview page points to `https://uscehub.com{path}` (production), so even if the preview gets indexed by accident, Google folds it into the production page's signal.

---

## 9. URL changes during v2 build

### 9.1 No URL changes on `main` during v2 build

Per [PLATFORM_V2_STRATEGY.md §8.6](PLATFORM_V2_STRATEGY.md): a URL change on `main` during v2 build forces an immediate re-rebuild of the v2 sitemap and risks redirect-chain confusion. Lane 1 does not change URLs during v2 build, period.

### 9.2 URL changes at v2 launch

At v2 launch, the URL set changes. Per [INFORMATION_ARCHITECTURE.md §13](INFORMATION_ARCHITECTURE.md) open decisions:

| Old URL | New URL | Migration |
|---|---|---|
| `/browse` | `/usce` | 301 (recommended) |
| `/observerships` | `/usce/observerships` | 301 |
| `/observerships/[state]` | `/usce/observerships/[state]` | 301 |
| `/listing/[id]` | `/usce/[listing-slug]` | 301 (slug derived from id + title) |
| `/compare` | `/tools/compare` | 301 |
| `/recommend` | `/tools/recommend` | 301 |
| `/dashboard/saved` | `/tools/saved` | 301 |
| `/blog` | `/resources/blog` | 301 |
| `/blog/[slug]` | `/resources/blog/[slug]` | 301 |
| `/methodology` | `/resources/methodology` | 301 |
| `/img-resources` | `/resources/img` | 301 |
| `/faq` | `/resources/faq` | 301 |
| `/for-institutions` | `/institutions` | 301 |
| `/career/*` | `/career/*` (unchanged per [RULES.md](../codebase-audit/RULES.md) §2) | no change |
| `/careers` | `/careers` (unchanged per [RULES.md](../codebase-audit/RULES.md) §2) | no change |

### 9.3 Redirect implementation

In `next.config.ts`'s `redirects()` array. Each redirect:

```ts
{
  source: '/blog/:slug',
  destination: '/resources/blog/:slug',
  permanent: true, // 301
}
```

301 (permanent) — passes link equity; Google folds the old URL's signal into the new URL.

### 9.4 Sitemap rebuild at launch

At launch:
1. Old sitemap removed.
2. New sitemap generated with new URL set.
3. Sitemap submitted to GSC manually.
4. Re-crawl request issued via GSC URL inspection for top 20 URLs.

### 9.5 Inbound link preservation

Every redirect must preserve inbound link value. If we miss a 301, Google sees a 404 from inbound links and degrades the destination's authority over time.

Pre-launch checklist (subset of `LAUNCH_PLAN.md`, deferred):

- [ ] Run `next build` with the redirect map; verify all old URLs 301 to new URLs (no 404s).
- [ ] Spot-check inbound links from GSC top-20 query targets.
- [ ] Verify external linkers (Reddit, Twitter, blog posts) still resolve via 301.
- [ ] No redirect chains (A → B → C); always direct A → C.

---

## 10. AI search and citation discoverability

Per [PLATFORM_V2_STRATEGY.md §10](PLATFORM_V2_STRATEGY.md), the moat is tools + structured data + verified primary-source citations. Indexation policy supports this:

### 10.1 Citation graph markup

Pathway guides and blog posts mark up citations using `schema.org/Citation`:

```json
{
  "@type": "MedicalScholarlyArticle",
  "headline": "...",
  "citation": [
    {
      "@type": "Citation",
      "name": "USCIS J-1 Waiver Eligibility",
      "url": "https://www.uscis.gov/...",
      "publisher": "U.S. Citizenship and Immigration Services"
    }
  ]
}
```

This helps AI search engines (Google AI Overview, Perplexity, Claude) build the citation graph: USCEHub → cites USCIS (T1 source) → user trust transferred.

### 10.2 Dataset markup

Curated comparison pages and stat-driven pages mark up datasets:

```json
{
  "@type": "Dataset",
  "name": "Conrad 30 Programs by State",
  "description": "...",
  "url": "https://uscehub.com/visa/conrad-30",
  "creator": { "@type": "Organization", "name": "USCEHub" },
  "license": "https://uscehub.com/disclosure",
  "isAccessibleForFree": true
}
```

### 10.3 No false citations

Don't cite a source we haven't actually verified or used. Don't cite "Wikipedia" if the underlying claim came from the linked NRMP press release (cite NRMP).

### 10.4 Dating citations

Every citation includes a `datePublished` and (where applicable) `dateRetrieved`:

```json
{ "@type": "Citation", "name": "...", "url": "...", "datePublished": "2025-09-15", "dateModified": "2026-04-15" }
```

This is what makes USCEHub the "source AI summaries prefer to cite" per [PLATFORM_V2_STRATEGY.md §10.4](PLATFORM_V2_STRATEGY.md).

---

## 11. GSC monitoring

Per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md):

### 11.1 Pre-launch GSC tasks

- [ ] Property verified (current state — verify completion per runbook).
- [ ] Sitemap submitted.
- [ ] No coverage errors.
- [ ] Mobile usability score green.

### 11.2 Post-launch GSC monitoring

Daily for first 30 days:
- Coverage errors (target: 0 sustained).
- Indexed page count (target: monotonically increasing or steady).
- Mobile usability (target: 100% pass).
- Core Web Vitals (target: > 90% URLs in good).

Weekly thereafter:
- Average position for top 20 query targets.
- CTR for top 20 query targets.
- New "discovered but not indexed" URLs (signal of crawl-budget exhaustion).

### 11.3 Watch for

- "Crawled but not indexed" count > 100 (signal that we're publishing low-quality pages and Google is choosing not to index them).
- "Discovered but not indexed" count > 100 (signal of crawl-budget exhaustion; consider sitemap split).
- Index coverage errors > 0 (resolve immediately).

---

## 12. Anti-cloaking and per-bot rules

### 12.1 No cloaking

USCEHub serves the same HTML to bots and humans. No User-Agent-based content variation. No JavaScript-rendered content that bots can't read (Next.js SSR by default ensures this).

### 12.2 No bot-specific blocking (beyond robots.txt)

We do not block GoogleBot or BingBot or any major crawler explicitly. We do not redirect bots to a different page. Per Google's spam policies, this would be cloaking.

### 12.3 Rate limiting

We do not rate-limit GoogleBot or BingBot at the application level. Vercel's edge layer handles abusive traffic. Per Google's guidance, blocking GoogleBot to "save crawl budget" backfires — it removes pages from the index.

### 12.4 AI crawler handling

AI crawlers (GPTBot, ClaudeBot, PerplexityBot, anthropic-ai, ChatGPT-User, Applebot-Extended, etc.) are **allowed** by default. Reasons:

- USCEHub's strategy is to be the source AI summaries cite (per [PLATFORM_V2_STRATEGY.md §10](PLATFORM_V2_STRATEGY.md)).
- Blocking AI crawlers reduces our discoverability in AI-search surfaces.
- Our content is licensed to be cited (with attribution) per `/disclosure` (TBD).

If we ever observe AI crawlers misrepresenting our content (e.g. hallucinating program details that contradict our verified data), revisit this policy. Default for v2 launch: **allow all AI crawlers**.

---

## 13. URL parameter conventions for analytics + UTM

### 13.1 UTM handling

UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) are session parameters. They:
- Are visible to Vercel Analytics for attribution.
- Are stripped from the canonical URL (canonical points to no-UTM version).
- Do not affect content rendered.
- Pages with UTMs are still `index, follow` (canonical takes care of duplicate-content concern).

### 13.2 Internal `?from=` tracking

For internal click tracking (e.g. "user came from /for-img tile to /usce"), use a `?from=` param with a curated taxonomy of allowed values. `?from=*` URLs are `noindex, follow` and canonical to no-from version.

### 13.3 No third-party tracking pixels

USCEHub uses Vercel Analytics only (server-side, no client-side cross-site tracking). No Facebook Pixel, no Google Analytics + Ads remarketing pixels, no third-party retargeting tags.

If/when paid acquisition starts (gated per [PLATFORM_V2_STRATEGY.md §17.3](PLATFORM_V2_STRATEGY.md)), tracking pixels become a separate explicit-authorization decision documented in `TRUST_AND_MONETIZATION_POLICY.md`.

---

## 14. International / `hreflang` (deferred)

Not a v2 launch target. USCEHub is English-only. Future i18n requires:

- `<link rel="alternate" hreflang="en">` per page.
- `hreflang` JSON-LD entries.
- Sitemap with `<xhtml:link>` per locale.

Defer to Phase D+.

---

## 15. URL audit checklist (pre-launch)

Before v2 launch, run:

- [ ] Every page in §4.1 (indexable list) returns 200 in production.
- [ ] Every page in §4.1 emits the expected `<meta robots>` tag.
- [ ] Every page in §4.2 (non-indexable) emits `noindex` correctly.
- [ ] Every page emits a `<link rel="canonical">` to its canonical URL.
- [ ] Every redirect in §9.2 returns 301 (not 302, not 307).
- [ ] No redirect chain longer than 1 hop.
- [ ] Sitemap includes every page in §4.1 and excludes every page in §4.2.
- [ ] Sitemap is well-formed XML.
- [ ] Robots.txt is the §7 default plus any overrides.
- [ ] All JSON-LD blocks validate.
- [ ] No mixed content (https only).
- [ ] Preview deployments emit `X-Robots-Tag: noindex, nofollow` header.
- [ ] No URL contains uppercase or trailing slash.
- [ ] No URL is a duplicate (homepage `/` and `/index` both serve same content with one canonical).

---

## 16. Open decisions

1. **Old URL 301 vs keep-both for migrated content.** Per [INFORMATION_ARCHITECTURE.md §13](INFORMATION_ARCHITECTURE.md) #1: 301 for blog (clean canonical); keep-both for `/career/*` per [RULES.md](../codebase-audit/RULES.md) §2.
2. **`/browse` aliasing.** Recommend: 301 → `/usce`.
3. **`/listing/[id]` migration with slug.** Recommend: 301 with `${id}-${slugify(title)}` slug.
4. **Trailing slash policy.** Recommend: no trailing slash (current behavior).
5. **AI crawler allowlist.** Recommend: allow all (per §12.4).
6. **Sitemap split threshold.** Recommend: split at 25K URLs (well below 50K limit).
7. **Sitemap `<lastmod>` source.** Recommend: derive from `Listing.updatedAt` for listings; from Git commit date for content pages.
8. **`changefreq` per page type.** Recommend: `weekly` for vertical landings, `monthly` for guides + blog, `daily` for tool URLs.
9. **`priority` per page type.** Recommend: 1.0 homepage, 0.9 vertical landings, 0.8 listing detail, 0.7 audience landings, 0.6 blog/methodology, 0.5 legal.
10. **Blog category indexability threshold.** Recommend: ≥ 3 posts in category + curated intro = indexable; otherwise `noindex, follow`.
11. **`/search` indexability of empty results.** Recommend: always `noindex, follow` regardless of result count.
12. **Pagination canonical strategy.** Recommend: `<link rel="next">`/`<link rel="prev">`; canonical points to unparameterized page.
13. **JSON-LD `inLanguage`.** Recommend: `"en"` on every page.
14. **`Organization` `sameAs` social links.** Recommend: include only verified, official accounts; never speculative ("we plan to be on TikTok").

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
- risk level:          ZERO — internal indexation policy doc
```

## /career impact

None. `/career/*` and `/careers` URLs preserved unchanged per [RULES.md](../codebase-audit/RULES.md) §2.

## Schema impact

None.

## Authorization impact

None. This doc specifies indexation policy; implementation is gated per per-page authorization in v2 launch sequencing.
