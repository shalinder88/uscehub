# USCEHub v2 — Page Template Inventory

**Status:** v2 planning doc. Defines every page template type, its data requirements, trust elements, indexation rule, and depth-before-breadth standards.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md), [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md).
**Authored:** 2026-04-29.

---

## 1. Purpose

Define every page template type v2 needs, its data requirements, what trust elements it must surface, how it cites primary sources, what data authenticity bar it must meet, and how it's indexed. This is the prerequisite for the v2 component library and the schema additions in [PLATFORM_V2_STRATEGY.md §7.3](PLATFORM_V2_STRATEGY.md).

### 1.1 Depth-before-breadth principle

Every template carries a depth requirement. A template that ships with thin / templated / non-traceable content fails the [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md) quality gate. **Build one template fully (with real, traceable, primary-source data) before launching another at half-quality.**

### 1.2 Authentic data principle

Every claim, listing, statistic, and citation on every template must trace to an authentic primary source per [PLATFORM_V2_STRATEGY.md §4.5](PLATFORM_V2_STRATEGY.md). Forbidden:
- Scraping / republishing paid third-party data providers' content without license.
- Aggregating Reddit / forum threads as primary citation (T5 only as footnote).
- Synthesizing program details from inference when the program's own page is silent.
- Templated stat pages where the underlying number isn't directly observable from a T1 / T2 source.

Every template's "Data requirements" section names the authentic sources allowed for that template type.

---

## 2. Template inventory (top level)

| Template | URL pattern | Status | Indexable | Section |
|---|---|---|---|---|
| Homepage | `/` | live, redesign in v2 | yes | §3 |
| Vertical landing | `/usce`, `/match`, `/fellowship`, `/jobs`, `/visa`, `/tools`, `/resources`, `/institutions` | partial; build in v2 | yes | §4 |
| Audience landing | `/for-img`, `/for-us-students`, `/for-residents`, `/for-fellows`, `/for-attendings`, `/for-new-attendings` | new in v2 | yes (curated only) | §5 |
| Directory page (browse) | `/usce`, `/usce/observerships`, etc. | live, redesign in v2 | yes | §6 |
| Listing detail | `/usce/[listing-slug]` (replaces `/listing/[id]`) | live, redesign in v2 | yes | §7 |
| Curated state page | `/usce/observerships/[state]`, `/jobs/[state]` | live (partial), redesign in v2 | yes if pass §9 quality gate | §8 |
| Curated specialty page | `/usce/[specialty]`, `/match/programs/[specialty]` | live (partial) | yes if pass §9 | §9 |
| Pathway guide / article | `/match/strategy/img`, `/visa/conrad-30`, etc. | new in v2 | yes | §10 |
| Tool / interactive | `/tools/compare`, `/tools/recommend`, `/tools/visa-decision-helper`, etc. | live (partial) | yes (tool URL); state is `noindex` | §11 |
| Tool result page | `/tools/compare?ids=...`, `/tools/visa-decision-helper?...` | live | `noindex, follow` | §12 |
| Comparison page (curated) | `/match/programs/[specialty]/visa-friendly`, etc. | new in v2 | yes if curated | §13 |
| Blog post | `/resources/blog/[slug]` | live | yes (approved only) | §14 |
| Blog index | `/resources/blog`, `/resources/blog/category/[category]` | live | yes (index); category yes if curated | §15 |
| Methodology / FAQ / IMG resources / glossary | `/resources/methodology`, `/resources/faq`, `/resources/img/*`, `/resources/glossary` | live (partial) | yes | §16 |
| Job listing | `/jobs/[job-id]` | future (Phase C+) | yes if from authentic source | §17 |
| Directory entry — attorney | `/institutions/attorneys/[slug]` | future (Phase C+) | yes if curated | §18 |
| Directory entry — recruiter | `/institutions/recruiters/[slug]` | future (Phase C+) | yes if curated | §18 |
| Institution profile | `/institutions/profile/[slug]` (claimed listings) | future (Phase C+) | yes if claimed | §19 |
| Alert / digest preview | `/tools/alerts/preview/[id]` | live (no-send only) | `noindex, nofollow` | §20 |
| Search results | `/search?q=*` | future | `noindex, follow` | §21 |
| Account / dashboard | `/dashboard/*` | live | `noindex, nofollow` | §22 |
| Admin internal | `/admin/*` | live | `noindex, nofollow` | §23 |
| Legal | `/privacy`, `/terms`, `/accessibility`, `/disclosure`, `/cookies` | live | yes | §24 |
| Skeletal "Coming soon" landing | per vertical | new in v2 | `noindex, follow` | §25 |
| Sitemap | `/sitemap.xml` | live | n/a | §26 |
| Robots | `/robots.txt` | live | n/a | §26 |

---

## 3. Homepage template

**URL:** `/`. **Indexable:** yes. **Authority:** [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md) is the source of truth.

### 3.1 Required sections

Per [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md): hero, audience tiles, trust engine block, tools block, recently verified, stats, methodology teaser, footer.

### 3.2 Data requirements (authentic)

- Stats: from `src/lib/site-metrics.ts` (manually curated) + live Prisma queries (`src/components/seo/program-stats.tsx`). Every public number traces to either the curated metrics file or a live DB query.
- Recently verified: live Prisma query, `LinkVerificationStatus = VERIFIED` AND `lastVerifiedAt` within 90 days. No mock data, no hand-picked "featured."
- Trust engine block: descriptive only; no claim that requires citation.

### 3.3 Trust elements

- Trust microcopy under primary CTAs (specific count, specific contract).
- Trust engine block (4 cards explaining verification).
- Stats block with conservative language.
- Methodology link in trust block + footer.

### 3.4 JSON-LD

- `WebSite` schema with `SearchAction` per [HOMEPAGE_V2_WIREFRAME.md §16](HOMEPAGE_V2_WIREFRAME.md).
- `Organization` schema for USCEHub.

---

## 4. Vertical landing template

**URLs:** `/usce`, `/match`, `/fellowship`, `/jobs`, `/visa`, `/tools`, `/resources`, `/institutions`.

### 4.1 Required sections

| Section | Purpose |
|---|---|
| Hero | Vertical-specific H1, sub, primary CTA (e.g. for `/usce`: "Find verified USCE programs" + "Browse 156 programs with official source on file") |
| Audience-specific intro | 2-3 paragraphs of curated content explaining what this vertical covers + how it works |
| Sub-vertical tiles | Cards linking to sub-routes (e.g. `/usce/observerships`, `/usce/externships`, etc.) |
| Featured / curated content | 5-10 picks (listings, guides, tools) curated for this vertical |
| Trust block (compact) | Verification + source-link + last-verified disclosure |
| Audience cross-link | "I'm an IMG" / "I'm a US student" filtered entries |
| Tool surface | Vertical-specific tool CTAs (e.g. on `/usce`: "Compare USCE programs") |
| FAQ teaser | Top 3-5 vertical-specific FAQs |

### 4.2 Data requirements (authentic)

- Curated content: hand-written editorial. NEVER auto-generated.
- Sub-vertical counts: live Prisma queries (e.g. `/usce` shows count of observerships, externships, electives, research, postdoc).
- Featured content: hand-curated, refreshed quarterly minimum, every featured listing must be `VERIFIED + lastVerifiedAt` current.

### 4.3 Quality gate

A vertical landing enters the sitemap only if it has:
1. Real curated intro (no Lorem-ipsum placeholders, no "Coming soon" headers).
2. At least one curated sub-section with real, traceable links.
3. Trust block with current data (not stale stat).
4. Updated `lastReviewedAt` within 90 days.

### 4.4 JSON-LD

- `WebPage` with `breadcrumb` + `description` + `inLanguage: "en"`.
- `BreadcrumbList` (level 1: Home > [Vertical]).

---

## 5. Audience landing template

**URLs:** `/for-img`, `/for-us-students`, `/for-residents`, `/for-fellows`, `/for-attendings`, `/for-new-attendings`.

### 5.1 Required sections

| Section | Purpose |
|---|---|
| Hero | Audience-specific H1 (e.g. "Built for IMGs — verified data, visa-aware filters, free.") |
| Audience-specific intro | Curated paragraph explaining how USCEHub addresses this audience |
| Featured verticals (3-5) | Tiles linking to relevant verticals filtered by audience (e.g. `/for-img` features `/usce?audience=img`, `/match/strategy/img`, `/visa/j1`, `/jobs/h1b-friendly`) |
| Audience-specific guide list | Hand-curated list of 5-10 deep guides for this audience |
| Trust + tools block | Generic trust + 2-3 audience-relevant tools |

### 5.2 Data requirements (authentic)

- Curated intro: hand-written, audience-specific.
- Featured verticals: hand-picked.
- Guide list: hand-curated, every link in-product (no third-party redirects).
- No fake testimonials, no fabricated audience stats.

### 5.3 Quality gate

Per [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md):
1. Hand-written intro (≥ 200 words audience-specific).
2. ≥ 5 curated links to in-product content (no template-only).
3. ≥ 1 unique data point (e.g. on `/for-img`: "12 of the 156 programs on USCEHub explicitly note IMG-friendly admission policies — see [list]").
4. Primary citation tier T1 / T2 / T4 (USCEHub original research).

### 5.4 JSON-LD

- `WebPage` with `audience` schema property (`{"@type": "Audience", "audienceType": "International Medical Graduates"}` etc.).

---

## 6. Directory page (browse) template

**URLs:** `/usce`, `/usce/observerships`, `/usce/externships`, `/usce/electives`, `/usce/research`, `/usce/postdoc`, `/jobs/attending`, etc.

### 6.1 Required sections

| Section | Purpose |
|---|---|
| Header | Vertical / sub-vertical title + count + filter chips |
| Filter sidebar (desktop) / chips (mobile) | State, specialty, cost, duration, audience, visa, trust state, freshness |
| Sort options | By trust state (verified first), recently verified, newest, deadline soonest |
| Listing card grid | 20-50 listings per page; trust badge per card; source-link per card; deadline + cost per card |
| Pagination | Page N of M; `rel="next"`, `rel="prev"` link rels for SEO |
| Empty state | "No programs match your filters" + suggested filter relaxations |

### 6.2 Data requirements (authentic)

- Listings: live Prisma query, `status = APPROVED`. Every listing traces to its `sourceUrl` (the program's own page, T1).
- Filter options derived from actual data (no hardcoded "Cardiology, Neurology, ..." list — pull distinct specialties from live `Listing` table).
- Counts: live, never cached / stale.

### 6.3 Trust elements per listing card

Per [HOMEPAGE_V2_WIREFRAME.md §5.2](HOMEPAGE_V2_WIREFRAME.md) trust legend:
- Trust badge (Verified / Official source on file / Needs review / Reverifying / Source no longer responds / Program closed / No official source).
- "Last verified {N} days ago" microcopy when `VERIFIED + lastVerifiedAt`.
- Source-link icon (external link to program's own page).
- "Report broken link" tooltip (one-click, no modal).

### 6.4 Quality gate (filter combinations)

Per [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md):
- Canonical URL: `/usce/observerships` (no params).
- Filter combinations (`?state=NY&type=observership`) are `noindex, follow`.
- Path-form curated landings (`/usce/observerships/california`) only enter sitemap if they pass §9 quality gate.

### 6.5 JSON-LD

- `WebPage` + `BreadcrumbList`.
- `ItemList` for the listing grid (positions 1-N).

---

## 7. Listing detail template

**URL:** `/usce/[listing-slug]` (slug = `{id}-{kebab-title}`). Migrated from `/listing/[id]` with 301.

### 7.1 Required sections

| Section | Purpose |
|---|---|
| Trust badge bar (top) | Primary trust state + last-verified relative time + freshness tier |
| Title + program name + host institution | Above the fold |
| Source link CTA | Prominent "View on official program page →" button (external) |
| Key facts | Type, duration, cost, deadline, location, specialty, audience eligibility, visa notes |
| Verification metadata | "Last verified: 2026-04-15. Verified by: cron-verify-listings. Method: HTTP HEAD." (or admin attribution) |
| Audience eligibility | Who can apply (IMG / US-MD / US-DO / both / unspecified) |
| Visa notes | Any J1 / H1B / OPT / sponsor information from authentic source |
| Cost breakdown | Free / fee / range, with currency and notes |
| Application info | How to apply, link to official application page |
| Save / compare / report-broken-link CTAs | User actions |
| Related programs | 3-5 similar programs (same state / specialty / type) |
| Source disclosure | "Source: <program-website-url>. Last fetched: <date>. Source authority tier: T1 (program's own page)." |

### 7.2 Data requirements (authentic)

- Every field traces to either the program's own page (T1), an aggregator with attribution (T2), or an admin-entered note (with audit trail in `DataVerification`).
- No synthesized claims. If the program's page doesn't say "duration: 4 weeks," we don't say it on USCEHub.
- Cost: literal from source. If source says "Contact for fees," we say "Contact for fees" — never "Free" by inference.
- Deadline: literal from source. If source says "Rolling," we say "Rolling."

### 7.3 Trust elements

- Per §6.3 trust badge.
- Verification metadata block (full transparency: who verified, when, how, why).
- Source disclosure block (T1 / T2 / T3 tier label per [PLATFORM_V2_STRATEGY.md §4.5](PLATFORM_V2_STRATEGY.md)).
- "Report broken link" button surfaced even when verified (encourage user feedback).

### 7.4 JSON-LD

- `WebPage` + `BreadcrumbList`.
- `EducationalOccupationalProgram` schema for USCE listings:
  ```json
  {
    "@type": "EducationalOccupationalProgram",
    "name": "...",
    "provider": { "@type": "EducationalOrganization", "name": "..." },
    "educationalProgramMode": "onsite | online | hybrid",
    "termDuration": "P4W",
    "applicationDeadline": "...",
    "url": "<program-source-url>",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  }
  ```

---

## 8. Curated state page template

**URLs:** `/usce/observerships/[state]`, `/jobs/[state]`, `/visa/conrad-30/[state]`, etc.

### 8.1 Required sections

| Section | Purpose |
|---|---|
| Curated intro | Hand-written paragraph (≥ 150 words) about THIS state + THIS vertical (e.g. "California USCE: competitive due to UCLA / UCSF; expect $1k-$3k fees; visa-friendly programs concentrate at...") |
| Stat block | Count, cost range, common specialties, audience patterns — all from live data |
| Top picks (curated) | 5-10 hand-picked programs in this state, with reasoning per pick |
| Full listing grid | All programs in this state, with same filters as §6 |
| Cross-vertical links | "Visa info for {state}" → `/visa/conrad-30/[state]` (if exists) |
| FAQ specific to state | 3-5 state-specific FAQs |

### 8.2 Data requirements (authentic)

- Intro: hand-written. Every claim has citation (Conrad 30 program url, hospital website, peer-reviewed article, or USCEHub original research with methodology).
- Stat block: live data, not cached.
- Top picks: hand-curated, reviewed quarterly minimum.
- Cross-vertical: only include links to pages that pass §9 quality gate.

### 8.3 Quality gate

Per [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md):
1. Hand-written intro ≥ 150 words.
2. ≥ 1 unique data point per state (not just "12 programs").
3. Primary citation tier T1 / T2.
4. Pass human review queue (`status = APPROVED`).

If a state lacks enough data / authentic intro / picks: page does NOT enter sitemap. Filter results still serve via `/usce/observerships?state=X` (query-param, `noindex`).

---

## 9. Curated specialty page template

**URLs:** `/usce/[specialty]`, `/match/programs/[specialty]`, `/jobs/[specialty]`, `/fellowship/[specialty]`.

Similar structure to §8 (curated state) with specialty-specific intro + curated picks + live grid. Same quality gate applies.

### 9.1 Specialty-specific data requirements

- Specialty taxonomy: from a reviewed list (e.g. ABMS specialties), not free-form. Reference: `https://www.abms.org/specialties/` or `https://www.acgme.org/specialties/` for the canonical list.
- Subspecialties: under fellowship; may use ACGME subspecialty list.
- "Visa-friendly" specialties: requires explicit data point (program offers visa sponsorship per its own page, not inferred).

---

## 10. Pathway guide / article template

**URLs:** `/match/strategy/img`, `/visa/conrad-30`, `/fellowship/visa-friendly`, `/resources/img/getting-started`, etc.

### 10.1 Required sections

| Section | Purpose |
|---|---|
| Title + author / reviewer | Author byline (where applicable) + reviewer (medical professional or USCEHub editorial team) |
| Last updated | Date + "Reviewed: <date>" (separate from "Updated") |
| Summary box | TL;DR (3-5 sentence summary that AI search will quote per [PLATFORM_V2_STRATEGY.md §10.2](PLATFORM_V2_STRATEGY.md)) |
| Body (markdown content) | Long-form curated content with headings, lists, tables, callouts, references |
| Citations block | Every claim cited inline + a numbered references list at the bottom (T1 / T2 / T3 / T4 per [PLATFORM_V2_STRATEGY.md §4.5](PLATFORM_V2_STRATEGY.md); T5 only as "additional reading") |
| Related guides | 3-5 cross-linked guides |
| FAQ block (per guide) | 3-5 guide-specific FAQs |
| CTA | Where the user goes next (e.g. on `/match/strategy/img`: "Browse IMG-friendly residency programs →") |

### 10.2 Data requirements (authentic)

- Body content: hand-written or expert-reviewed; never auto-generated.
- Every numerical claim cited (e.g. "30% of IMGs match in IM" links to NRMP press release).
- Visa / immigration claims cited to USCIS / DOL / state portal.
- Medical / clinical claims cited to peer-reviewed source (T3) or board / association (T2).
- No "trust me bro" statements; every load-bearing claim has a footnote.

### 10.3 Authenticity bar

| Claim type | Required tier |
|---|---|
| Numerical (match rate, salary, sponsorship rate) | T1 (NRMP / DOL / USCIS) or T2 (AAMC / FREIDA / ECFMG) |
| Visa / legal | T1 (USCIS / DOS / state) only |
| Medical / clinical | T3 (peer-reviewed) or T2 (board / association) |
| Strategy / opinion | USCEHub editorial; opinion-labeled |
| Anecdotal | T5 footnote only; never primary citation |

### 10.4 JSON-LD

- `Article` or `MedicalScholarlyArticle` schema:
  ```json
  {
    "@type": "Article",
    "headline": "...",
    "datePublished": "...",
    "dateModified": "...",
    "author": { "@type": "Organization", "name": "USCEHub" },
    "publisher": { "@type": "Organization", "name": "USCEHub" },
    "citation": [ ... per §10.2 ... ]
  }
  ```

---

## 11. Tool / interactive template

**URLs:** `/tools/compare`, `/tools/recommend`, `/tools/saved`, `/tools/alerts`, `/tools/checklist`, `/tools/visa-decision-helper`, etc.

### 11.1 Required sections

| Section | Purpose |
|---|---|
| Tool intro | What this tool does + what data it uses |
| Tool UI | Interactive component (compare table, recommendation form, decision tree, etc.) |
| Tool result / state | The output of user interaction |
| Methodology | How the tool works + what data sources it uses |
| Save / share / export | If applicable, allow user to save / share / export |
| Privacy disclosure | What data the tool collects / stores; cross-link to `/privacy` |
| Cross-link | Related vertical pages |

### 11.2 Data requirements (authentic)

- Tool data: live Prisma queries (compare uses `Listing` data, etc.).
- Recommendation algorithm: documented in methodology section. No black-box "AI-powered" claim without an actual AI model in the loop.
- Visa decision helper: decision tree based on T1 USCIS / DOS rules, with citations to specific regulations.
- Cost calculator: input ranges from authentic source (e.g. "Average observership cost: $1,500-$2,500" cites USCEHub original research with methodology).

### 11.3 Quality gate

A tool template enters the sitemap only if:
1. Tool actually works (no broken UI, no silent failures).
2. Tool data is current (live, not stale).
3. Methodology section explains how the tool works.
4. Privacy disclosure complete.

### 11.4 JSON-LD

- `WebApplication` or `SoftwareApplication`:
  ```json
  {
    "@type": "SoftwareApplication",
    "name": "USCEHub Visa Decision Helper",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "url": "https://uscehub.com/tools/visa-decision-helper"
  }
  ```

---

## 12. Tool result page template

**URLs:** `/tools/compare?ids=...`, `/tools/visa-decision-helper?...`.

- `noindex, follow` per [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md).
- Same UI as tool template (§11) but with a result state hydrated from query params.
- Save / share buttons — share generates a shareable URL with the same query params.
- Methodology + privacy still visible.

---

## 13. Comparison page (curated) template

**URLs:** `/match/programs/[specialty]/visa-friendly`, etc. (curated, hand-picked comparisons; not user-generated).

Similar to §8 (curated state) but the curation is along a non-state axis: specialty + audience, specialty + visa-friendliness, audience + cost, etc.

Same quality gate as §8 / §9. Hand-written intro, hand-curated picks, live data backing, T1 / T2 citations.

---

## 14. Blog post template

**URL:** `/resources/blog/[slug]`.

### 14.1 Required sections

| Section | Purpose |
|---|---|
| Header | Title, category, read time, published date, author |
| Author byline | Author name + (where applicable) credentials + (where applicable) "Reviewed by" |
| Featured image (optional) | If used, attribute source; never stock-photo physician shot ("looks like a doctor"); prefer no image |
| Body (markdown) | Long-form content per §10 |
| Tags | Topic tags from a reviewed taxonomy |
| Related posts | 3-5 cross-linked posts |
| Footer CTA | "Find Your Clinical Experience" → `/usce` (current; per PR #27 wording) |

### 14.2 Data requirements (authentic)

Same as §10.2 / §10.3 (pathway guide). Every numerical / clinical / visa / legal claim cited.

### 14.3 Quality gate

A blog post enters the sitemap only if:
1. Content ≥ 500 words.
2. Citations present for every load-bearing claim.
3. Author / reviewer named (no anonymous "USCEHub team" posts on medical / legal topics).
4. `status = APPROVED` after review.

### 14.4 JSON-LD

`Article` or `MedicalScholarlyArticle` per §10.4.

---

## 15. Blog index template

**URL:** `/resources/blog`, `/resources/blog/category/[category]`.

### 15.1 Required sections

| Section | Purpose |
|---|---|
| Header | Blog title + category title (if filtered) |
| Filter chips | Categories, tags, audience |
| Post grid | 10-20 posts per page, with title + description + author + date + read time |
| Pagination | `rel="next"`, `rel="prev"` |
| Search within blog | (optional) |

### 15.2 Indexable behavior

- `/resources/blog`: indexable.
- `/resources/blog/category/[category]`: indexable only if the category has ≥ 3 posts AND a curated category-specific intro paragraph.
- `/resources/blog?tag=X`: query-param filter, `noindex, follow`.

---

## 16. Methodology / FAQ / IMG resources / glossary template

**URLs:** `/resources/methodology`, `/resources/faq`, `/resources/img/*`, `/resources/glossary`.

### 16.1 Methodology page

- How USCEHub gathers data
- How verification works (full process, not the homepage teaser)
- Source authority tier explained
- Trust legend per [HOMEPAGE_V2_WIREFRAME.md §5.2](HOMEPAGE_V2_WIREFRAME.md)
- Conservative-language doctrine (why "verified" means what it means)
- Cron behavior + admin queue process
- How to report a broken link
- How to claim a listing (cross-link to `/institutions/claim`)
- Disclosures (cross-link to `/disclosure`)

### 16.2 FAQ page

- 20-50 hand-written FAQs grouped by topic
- Each Q has unique answer (no copy-paste templates)
- JSON-LD: `FAQPage` schema for SEO + AI search

### 16.3 IMG resources hub

- Curated resource list for IMGs: ECFMG / USMLE / NRMP / J1 / H1B / Conrad 30 etc.
- Every resource link cited
- "Getting started" pathway page

### 16.4 Glossary

- Hand-curated definitions of USMLE / match / visa / fellowship / IMG-specific terminology
- Each term has an authoritative source link (USMLE.org, ECFMG, NRMP, USCIS, AAMC, etc.)

---

## 17. Job listing template (Phase C+)

**URL:** `/jobs/[job-id]`.

Similar structure to §7 (listing detail) but for job postings. Data requirements:

- Source: only authentic sources (employer's own page, DOL LCA database for H1B-friendly, FBI Conrad 30 portal for waiver jobs).
- Never scrape / republish from paid job boards (Indeed, Glassdoor, ZipRecruiter, etc.) — that's content licensing violation per [PLATFORM_V2_STRATEGY.md §10.3](PLATFORM_V2_STRATEGY.md).
- Only post jobs with employer's own URL OR DOL / public visa-program registry.
- LCA data (preserved in `scripts/lca-fy2024-q4.xlsx` + `import-lca-data.ts` per [RULES.md](../codebase-audit/RULES.md)) is T2 (DOL primary).

Quality gate: job listing enters sitemap only if it has employer's own URL + LCA / Conrad 30 / similar T1 / T2 backing + within 90-day freshness window (jobs go stale fast).

---

## 18. Directory entry — attorney / recruiter (Phase C+)

**URLs:** `/institutions/attorneys/[slug]`, `/institutions/recruiters/[slug]`.

Required sections:

| Section | Purpose |
|---|---|
| Profile header | Name, firm / company, location, primary practice area |
| Credentials | Bar admission (attorneys), licensing, professional memberships — with links to public registry |
| Specialization | Visa types served, practice areas, languages spoken |
| Disclosure block | Sponsored / paid claim / unclaimed status per [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md) |
| Contact | Email / phone / website (sourced from public registry first; claim flow allows update) |
| Reviews / endorsements | Future; not at v2 launch (gated by trust/monetization disclosure) |

### 18.1 Data requirements (authentic)

- Attorneys: traceable to state bar admission registry (T1).
- Recruiters: traceable to company website + (where applicable) state recruiting / employment-agency registry.
- Never imply endorsement without the entity claiming + verifying their own profile.

---

## 19. Institution profile template (Phase C+)

**URL:** `/institutions/profile/[slug]` (claimed listings only).

When a hospital / GME program claims their listing via `/institutions/claim`, they get a profile page where they can:
- Edit their own description (subject to USCEHub editorial review)
- Add multiple programs (USCE + residency + fellowship)
- Add contact info, FAQ
- Add "verified by program" badge

Forbidden:
- Claim cannot displace verification — claimed status is additive to (not replacing) `LinkVerificationStatus`.
- Sponsored / featured placement requires separate disclosure per [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md).
- Institution-edited descriptions go through review queue before publishing.

---

## 20. Alert / digest preview template

**URL:** `/tools/alerts/preview/[id]`.

- `noindex, nofollow` per [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md).
- Pre-render of digest email content.
- No real send (per [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md) — preview only until prerequisites met).

---

## 21. Search results template

**URL:** `/search?q=*`.

Per [NAVIGATION_MODEL.md §11.3](NAVIGATION_MODEL.md). `noindex, follow`. Sectioned results across verticals.

---

## 22. Account / dashboard template

**URLs:** `/dashboard/saved`, `/dashboard/compare`, `/dashboard/alerts`, `/dashboard/settings`, etc.

- All `/dashboard/*` is `noindex, nofollow`, auth-gated.
- Sidebar nav (saved / compare / alerts / settings).
- Personal data only (no cross-user data exposure).
- Per [PLATFORM_V2_STRATEGY.md §15.1](PLATFORM_V2_STRATEGY.md): user-side is free; no upsells in dashboard.

---

## 23. Admin internal template

**URLs:** `/admin/verification-queue`, future `/admin/flag-queue`, etc.

- All `/admin/*` is `noindex, nofollow`, auth-gated.
- Per [ADMIN_VERIFICATION_QUEUE_RUNBOOK.md](../codebase-audit/ADMIN_VERIFICATION_QUEUE_RUNBOOK.md).
- Audit trail (every admin write logged in `DataVerification` or equivalent).

---

## 24. Legal page template

**URLs:** `/privacy`, `/terms`, `/accessibility`, `/disclosure`, `/cookies`.

- Plain markdown content rendered with the standard guide template.
- "Last updated: <date>" at top.
- `lang="en"` explicit.
- WCAG AA accessibility minimum.
- `/disclosure` enumerates every monetization state per [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md).
- Indexable (legal pages should be findable for trust + AI search).

---

## 25. Skeletal "Coming soon" landing template

**URLs:** any vertical landing without curated content yet.

### 25.1 Required sections

| Section | Purpose |
|---|---|
| Hero | Vertical name + "Coming soon" framing |
| Honest description | "We're building structured X content. Here's what we're working on:" |
| Bullet list of planned subroutes | Honest preview of the depth coming |
| Email signup CTA | Double-opt-in per [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md); category = "New-vertical alert" |
| What you can do meanwhile | Cross-link to relevant existing content (e.g. on `/match` skeletal: link to `/usce` for now) |

### 25.2 Indexable behavior

- `noindex, follow` until real content lands.
- Not in sitemap.
- Honest empty-state — never fake content.

### 25.3 Forbidden on Coming Soon pages

- Skeleton listings or placeholder cards.
- Fake stats ("Coming soon: 1000+ programs").
- "Sign up for early access" implying preferential access (we don't gate; signup is just notification).
- Any monetization element.

---

## 26. Sitemap + robots template

`/sitemap.xml` is auto-generated from `status = APPROVED` content per [INDEXATION_AND_URL_POLICY.md §5](INDEXATION_AND_URL_POLICY.md).

`/robots.txt` is permissive: allows all crawlers, points to sitemap.

---

## 27. Shared template requirements

Every template inherits these:

### 27.1 Header

- Primary nav per [NAVIGATION_MODEL.md §2](NAVIGATION_MODEL.md).
- Utility nav (For Institutions) per §2.2.
- Search icon, account icon.

### 27.2 Footer

- Per [NAVIGATION_MODEL.md §4](NAVIGATION_MODEL.md).

### 27.3 Metadata

- `<title>` unique per page, ≤ 60 chars.
- `<meta description>` unique per page, 150-160 chars.
- `<link rel="canonical">` per [INDEXATION_AND_URL_POLICY.md §5](INDEXATION_AND_URL_POLICY.md).
- `<meta robots>` per indexability.
- Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type`, `og:image` if used).
- Twitter card (`twitter:card="summary"` or `summary_large_image`).
- `<html lang="en">`.

### 27.4 Performance

- Server-side rendered (Next.js App Router default).
- No render-blocking client JS in critical path.
- Images: Next.js `<Image>` with explicit dimensions, lazy by default.
- Fonts: subsetted, `font-display: swap`.

### 27.5 Accessibility

- WCAG AA minimum (4.5:1 contrast, keyboard nav, screen-reader landmarks).
- Skip-link to main content.
- Heading order (one H1 per page, no skipped levels).
- ARIA only when necessary (semantic HTML first).

### 27.6 Schema cross-cutting

- `BreadcrumbList` on every page level 2+.
- `Organization` and `WebSite` only on homepage.
- Page-specific schema per template section above.

---

## 28. Template build status (current)

| Template | Status today | Needs in v2 redesign |
|---|---|---|
| Homepage | live, IMG/USCE-first framing | full v2 wireframe per [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md) |
| Vertical landing | partial (browse, observerships) | new for Match / Fellowship / Jobs / Visa / Tools / Resources / Institutions |
| Audience landing | none | new for all 6 audiences |
| Directory page | live | redesign (decision-engine first, not feed first) |
| Listing detail | live | redesign (stronger trust + source-tier surface) |
| Curated state page | live (partial, mostly templated) | quality-gate audit + curation pass |
| Curated specialty page | live (partial) | quality-gate audit + curation pass |
| Pathway guide | none | new for `/match/strategy/img`, `/visa/conrad-30`, etc. |
| Tool / interactive | live (compare, recommend, saved) | redesign (consistent template), new tools (visa decision helper, checklist) |
| Tool result | live | redesign |
| Comparison curated | none | new for `/match/programs/[specialty]/visa-friendly` etc. |
| Blog post | live | minor redesign for v2 visual system |
| Blog index | live | minor redesign |
| Methodology / FAQ / IMG / glossary | live (FAQ, methodology, IMG) | new glossary; expand existing |
| Job listing | none | future Phase C+ |
| Directory entry — attorney / recruiter | none | future Phase C+ |
| Institution profile | none | future Phase C+ |
| Alert / digest preview | live (no-send) | redesign for v2 visual system |
| Search results | none | new |
| Account / dashboard | live (saved, compare) | redesign |
| Admin | live | minor — primarily functional, low visual investment |
| Legal | live (privacy, terms) | add disclosure, add accessibility statement |
| Skeletal "Coming soon" | none | new for any vertical not built at v2 launch |
| Sitemap / robots | live | regenerate at v2 launch |

---

## 29. Open decisions

1. **Listing detail layout — single-column vs two-column.** Single-column reads better on mobile + simpler responsive. Two-column lets trust block + key facts sit side-by-side on desktop. Recommend: single-column, with trust badge bar at top + key facts as a horizontal row of pills.
2. **Source disclosure depth on listing card vs detail.** Card shows tier badge ("T1 source"); detail shows full URL + last fetch date + fetch method. Recommend yes — full transparency on detail; abbreviated on card.
3. **JSON-LD generator.** Hand-write per template vs use library (`schema-dts`)? Recommend: schema-dts for type safety; hand-write for simple cases (homepage, methodology).
4. **Image strategy.** No images (text-only) vs select hero images per vertical. Recommend: text-only at v2 launch; selective images post-launch with clear sourcing (no stock-photo-physician shots).
5. **Featured image on blog posts.** Recommend: optional; if used, must be original or attributed; never stock photo of "doctor with stethoscope."
6. **Tool methodology depth.** How much of the visa decision helper's logic is exposed in the methodology section? Recommend: full decision tree exposed (transparency = trust); user can audit reasoning.
7. **Reviews / endorsements on directory entries.** Defer to Phase D; requires anti-fraud + moderation infrastructure.
8. **Audience taxonomy proliferation.** Should we add `attending-rural` / `attending-academic` / etc. sub-tags? Recommend: defer; current 8-audience taxonomy from [PLATFORM_V2_STRATEGY.md §4.1](PLATFORM_V2_STRATEGY.md) is enough.
9. **Schema cross-cutting `audience` annotation on every listing.** Adds to `EducationalOccupationalProgram` schema per `audience` property. Recommend: yes — reinforces audience taxonomy + helps AI search disambiguate intent.
10. **Currency on cost.** USD assumed for U.S. programs. International / non-U.S. fellowship programs may use other currencies. Recommend: explicit currency per listing field; default "USD" only where verified.

---

## 30. Authenticity bar — summary table

For quick reference, the authentic-source bar by template type:

| Template | Required source tier | Allowed |
|---|---|---|
| Homepage stats | T1 (live DB query) or T4 (USCEHub original metrics file) | curated metrics, live counts |
| Listing detail | T1 (program's own page) for primary; T2 (aggregator) acceptable for secondary | program URL, hospital URL, GME page |
| Curated state page | T1 / T2 / T4 for stats; T1 for cited programs | state portal, USCIS, NRMP, AAMC |
| Pathway guide | T1 / T2 for legal/visa; T2 / T3 for clinical/strategy | USCIS, DOS, NRMP, ECFMG, peer-reviewed |
| Blog post | T1 / T2 / T3 per claim; T5 footnote-only | per-claim sourcing |
| FAQ / methodology | T1 / T2 / T4 | per-claim sourcing |
| Tool methodology | T1 / T2 / T4 | per-rule sourcing |
| Job listing | T1 (employer URL); T2 (DOL LCA, Conrad 30 portal) | NEVER scraped from paid boards |
| Attorney directory | T1 (state bar registry); T2 (firm website) | bar admission verification required |
| Recruiter directory | T1 (company URL); T2 (employment-agency registry) | company verification required |
| Institution profile | T1 (institution claim with verification) | claim flow + admin review |

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
- risk level:          ZERO — internal template inventory doc
```

## /career impact

None.

## Schema impact

None. Template inventory surfaces schema needs (audience tags, source-authority tier, monetization disclosure, freshness fields) — these become future schema PRs per [PLATFORM_V2_STRATEGY.md §7.3](PLATFORM_V2_STRATEGY.md).

## Authorization impact

None.
