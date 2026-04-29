# USCEHub Platform v2 — strategy

**Status:** strategy doc, foundational. Lane / sequencing / taxonomy doctrine for the v2 overhaul.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md) and [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md). Where this doc and either of those disagree, those win.
**Authored:** 2026-04-29.
**Companion:** [USCEHUB_MASTER_BLUEPRINT.md §0](../codebase-audit/USCEHUB_MASTER_BLUEPRINT.md) — the long-term whole-pipeline platform vision. This file operationalizes the §0 vision into a build / launch / measurement discipline.

This doc is the **single source of truth for v2 strategy**. Information architecture, homepage wireframe, navigation model, page template inventory, design system, content model, and launch plan are deliberately deferred to separate sessions because each requires product-level decisions that benefit from human input rather than a Claude first-draft. Those follow-up docs are listed in §19.

---

## 1. Purpose

### Why this doc exists

USCEHub is at a phase transition. Phase 3 (verification engine, admin queue, real public verification UI, conservative copy) shipped the **trust engine**. With that engine credible, the project moves from "narrow USCE wedge" toward the long-term whole-physician-pipeline platform described in Master Blueprint §0.

That move is not a single PR. It is a multi-month rebuild that has to happen **without breaking the live site, without overclaiming, without losing the SEO surface, and without diluting the trust language we just earned.**

This doc captures the discipline that makes the rebuild safe.

### What this doc binds

- The lane model (§5) and what each lane may ship.
- The schema-on-main authorization rule (§7).
- The URL / indexation doctrine that the v2 IA must honor (§8).
- The programmatic SEO quality gate (§9) that blocks low-quality template-only pages.
- The freshness SLA (§11) that determines what counts as a "current" listing.
- The trust / monetization policy (§12).
- The messaging / alerts policy (§13).
- The growth / SEO / Twitter readiness gates (§17).
- The non-goals list (§18) — what we are explicitly not building yet.
- The rollback rule (§20) — v2 must remain abandonable until launch.

### What this doc does NOT do

- It does **not** create the `redesign/platform-v2` long-running implementation branch. That gets created when the first v2 implementation PR opens.
- It does **not** modify `vercel.json`, schema, sitemap, robots, canonical URLs, JSON-LD, or any production page.
- It does **not** add any public-facing route, copy, or component.
- It does **not** start IA, wireframe, nav, template, design system, or launch plan work — those are explicitly deferred per §19.
- It does **not** authorize any monetization, email-send, or subscriber-table work — those are gated per §12 and §13.
- It does **not** override [RULES.md](../codebase-audit/RULES.md) or [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md). If any clause here drifts from those, those win.

### How to use it

When opening any v2 implementation session, the first read is this doc + Master Blueprint §0 + RULES.md + SEO_PRESERVATION_RULES.md. The session pitch should explicitly name which §-numbered section of this doc the work falls under, so drift is caught early.

When opening any Lane 1 (production `main`) PR during the v2 build, the PR body must state which §5 category the change belongs to, and confirm it does not violate §8, §9, §12, §13, or §18.

---

## 2. Current live-site contract

Before proposing what changes, document what production guarantees today. v2 must preserve every guarantee in this section unless an explicit migration plan replaces it.

### 2.1 Public pages

`uscehub.com` serves these public surfaces, all crawlable, all indexed, all with metadata + canonical + JSON-LD:

- Homepage (`/`)
- Browse (`/browse`)
- Listing detail (`/listing/[id]`)
- Observerships index + state pages (`/observerships`, `/observerships/[state]`)
- Specialty pages
- Compare (`/compare`)
- Recommend (`/recommend`)
- Methodology, FAQ, IMG resources, blog (`/blog`, `/blog/[slug]`)
- For-institutions landing
- `/career` and `/careers` route tree (preserved as unfinished asset per RULES.md §2)
- Sitemap (`/sitemap.xml`)
- Robots (`/robots.txt`)

### 2.2 Trust contract

- The verification engine (`LinkVerificationStatus` enum) is the source of truth for per-listing trust state.
- Cron writes only `VERIFIED`, `REVERIFYING`, `NEEDS_MANUAL_REVIEW`. It never writes `SOURCE_DEAD`, `PROGRAM_CLOSED`, or `NO_OFFICIAL_SOURCE` — those are admin-only.
- Cron never modifies `Listing.status`. It never rewrites URLs.
- `lastVerifiedAt` only advances on a `VERIFIED` outcome.
- Per-PR audit rows in `DataVerification` are atomic with the `Listing` write inside `prisma.$transaction`.
- The conservative-language doctrine (PR #25, PR #27) applies to every v2 vertical: the word "verified" is reserved for entries with both `LinkVerificationStatus = VERIFIED` and a non-null `lastVerifiedAt`. Programs with a checked URL but no recent reverify are "official source on file," not "verified."

### 2.3 Operational contract

- Two Vercel crons (Hobby plan cap is 2). Adding a third requires a Pro plan upgrade or replacing one of the existing crons. v2 cannot quietly add a third.
- `CRON_SECRET` is `type=sensitive` in Vercel and unreadable via API/CLI by design.
- Vercel previews are 401-gated by SSO (Hobby default). Preview URLs are usable hosted staging Google cannot index.
- `main` auto-deploys to production within ~60–90 seconds of any push.
- The PR queue cap is 7 per [BATCH_RELEASE_CHECKLIST.md](../codebase-audit/BATCH_RELEASE_CHECKLIST.md).

### 2.4 What v2 must preserve

Every URL listed in §2.1 stays live and indexable until the launch event explicitly migrates it (with redirects, sitemap rebuild, and the §20 rollback plan). The trust contract in §2.2 is non-negotiable — v2 must not weaken it to ship faster.

---

## 3. Long-term platform thesis

Reaffirmed verbatim from Master Blueprint §0 because v2 has to honor it as binding, not as inspiration.

### 3.1 Thesis

USCEHub is intended to become the **cleanest, most trusted physician career-pathway platform for the whole physician pipeline**, not an observership directory. The current verified-USCE wedge is the trust engine; the long-term product is the whole pathway: USCE → match → fellowship → attending jobs → visa → adult-life finance setup, with an institution / recruiter / attorney marketplace layered on top.

### 3.2 Audience (long-term, not just today's wedge)

- non-U.S. IMGs and U.S. IMGs (current deepest content investment)
- Caribbean IMGs, old-YOG IMGs, reapplicants
- visa-requiring applicants
- U.S. MD / DO medical students and graduates
- residents (USMG and IMG)
- fellows
- attendings, including new attendings entering jobs / contracts / insurance / relocation / financial setup
- visa-sponsored physicians at every career stage

### 3.3 Future verticals (eight)

Reaffirmed from Master Blueprint §0 and §13:

- **USCE** — observerships, externships, electives, research, postdoc
- **Match** — residency match prep, IMG strategy, SOAP, signaling, rank list, interviews
- **Fellowship** — subspecialty-by-subspecialty, visa-friendly fellowships
- **Jobs** — attending jobs, J1 waiver jobs, H1B-friendly physician jobs, locums / moonlighting, attending transition
- **Visa** — J1 vs H1B, Conrad 30, waiver guides, immigration attorney directory, state-by-state visa pathways
- **Tools** — saved programs, compare, alerts, deadline tracker, visa decision helper, fellowship competitiveness helper, cost calculator, email-gated PDF exports
- **Resources** — blog, methodology, IMG resources, FAQ
- **Institutions** — for-institutions onboarding, claim-listing flow, recruiter directory, attorney directory, contract review, future marketplace, future monetization

### 3.4 Anti-narrowing rule (binding)

Do not describe USCEHub as "an observership directory" or "an IMG observership site" in any commit message, PR body, internal doc, public copy, or session handoff. The current verified-USCE wedge is the trust engine for clinical-experience data; the long-term product is the whole physician career pathway.

If a draft (mine or another agent's) implies the product is only observerships, treat that as drift and flag it before writing more code.

### 3.5 What this thesis means for v2 IA

The information architecture must surface the eight verticals as first-class top-level navigation, even when only USCE is fully built. Skeletal verticals must be honest: they may say "Coming soon — be the first to know" but they must not pretend to have content they don't.

---

## 4. Canonical platform taxonomy

v2 IA, schema, search/filter, and SEO depend on a stable taxonomy. Every page, every listing, every URL, and every metric maps to a tuple along these six dimensions.

### 4.1 Audience

| Code | Audience |
|---|---|
| `img-non-us` | non-U.S. IMG (e.g. India, Pakistan, Nigeria, Egypt, Philippines) |
| `img-us` | U.S. IMG (Caribbean / SGU / Ross / etc.) |
| `usmg-md` | U.S. MD student / graduate |
| `usmg-do` | U.S. DO student / graduate |
| `resident` | resident in U.S. GME |
| `fellow` | fellow in U.S. GME |
| `attending` | attending physician |
| `institution` | hospital / GME / observership host / recruiter / attorney |

A page may target multiple audiences. Pages targeting **all** audiences are rare; if a page can't name 1–3 specific audiences from this list, it probably shouldn't exist.

### 4.2 Career stage

| Code | Stage |
|---|---|
| `pre-clinical` | pre-clinical / pre-USMLE |
| `clinical-experience` | seeking USCE (electives, observerships, externships, research) |
| `pre-match` | preparing for residency match |
| `intra-match` | in match cycle (signaling, interviews, rank list, SOAP) |
| `resident` | in residency |
| `pre-fellowship` | preparing for fellowship |
| `fellow` | in fellowship |
| `pre-attending` | exiting training, evaluating jobs / visa / contracts |
| `attending` | in attending practice |

A career-stage tag binds future v2 routes to a logical funnel. The **visa decision helper**, for example, lives at the intersection of `pre-attending` + audience `img-non-us`/`img-us`/`resident`/`fellow`.

### 4.3 Resource type

| Code | Type |
|---|---|
| `program-listing` | a verifiable program with a host institution + URL (USCE, match, fellowship, job) |
| `directory-entry` | a verifiable third-party (attorney, recruiter, contract reviewer, financial professional) |
| `pathway-guide` | long-form guide (visa, match strategy, contract review, finance setup) |
| `tool` | interactive tool (compare, recommend, alerts, deadline tracker, decision helper) |
| `dataset` | structured data surface (state-by-state stats, salary aggregations, sponsorship patterns) |
| `blog-post` | editorial / news / change log |
| `landing` | audience-segment or vertical landing page |
| `legal-doc` | privacy, terms, methodology, accessibility |

Every v2 page declares its type. The page-template inventory (§19) enumerates what each type's shared template must provide.

### 4.4 Trust state

Reuses the existing `LinkVerificationStatus` enum so v2 inherits Phase 3's trust engine without re-architecture:

| State | Cron may set | Admin may set | Public label |
|---|---|---|---|
| `UNKNOWN` | no | yes (back-compat) | "Unverified — official source not yet confirmed" |
| `VERIFIED` (with `lastVerifiedAt`) | yes | yes | "Verified — link checked {relative time}" |
| `VERIFIED` (no `lastVerifiedAt`, legacy) | no | yes (back-compat only) | "Official source on file" |
| `REVERIFYING` | yes | yes | "Reverifying — last successful check {relative time}" |
| `NEEDS_MANUAL_REVIEW` | yes (4xx/5xx) | yes | "Needs review — link returning errors" |
| `SOURCE_DEAD` | **no** | yes only | "Source no longer responds" |
| `PROGRAM_CLOSED` | **no** | yes only | "Program closed (admin-confirmed)" |
| `NO_OFFICIAL_SOURCE` | **no** | yes only | "No official source available" |

This binds v2 search, filters, and stat surfaces. v2 must not invent a parallel trust label scheme. New states require an additive enum migration per §7.

### 4.5 Source authority tier

For pathway guides, datasets, and blog posts, every claim must be tagged with the tier of its supporting source so the page's credibility is auditable and so AI-search engines (§10) prefer it over thin competitors.

| Tier | Examples |
|---|---|
| `T1-primary` | program website, ECFMG, USCIS, DOL, state medical board, hospital GME page, USMLE.org, NRMP |
| `T2-aggregator-with-attribution` | AAMC ERAS, ACGME accreditation database, FREIDA, ABMS, Conrad 30 state portals |
| `T3-secondary-but-credible` | peer-reviewed journals, established physician publications (KevinMD, JAMA, NEJM Career Center), AMA |
| `T4-uscehub-original-research` | our own structured data work (dataset pages, computed aggregates, surveys we ran) |
| `T5-anecdotal` | Reddit, forum posts, social media — **footnoted only, never the primary citation** |

Pages must declare the tier of their primary citation in metadata. v2 page templates must surface this so the user can see "Sources: T1 primary, T2 aggregator." This becomes the moat against AI-summary scraping (§10).

### 4.6 Monetization disclosure state

Every revenue surface, every directory entry, every link, every page must declare its monetization state. FTC compliance (§12) requires this; v2 doesn't get to be casual about it.

| State | Meaning | Required disclosure |
|---|---|---|
| `free-non-commercial` | core data, free for users | none |
| `free-with-ads` | display advertising | "This page contains advertisements" — top of page, before fold |
| `affiliate` | affiliate links | "We earn a commission on links marked Sponsored" — top of page; per-link "Sponsored" badge |
| `sponsored-listing` | paid placement of a directory entry | per-entry "Sponsored" badge in the listing card; entry never appears above unpaid `T1-primary`-verified entries when they would otherwise rank higher |
| `paid-claim` | institution-paid claim of own listing | per-entry "Verified by program" badge — distinct from cron `VERIFIED` |
| `marketplace` | full transactional marketplace | per-flow disclosure of fee structure |

§12 binds the rule: **sponsored / affiliate / paid-claim states never override or displace `VERIFIED` trust state in ordering or visual prominence.** Trust comes first; monetization labels are additive.

---

## 5. Lane model

The user-approved doctrine is **two structural lanes plus an emergency exception lane**, not three peer lanes.

### 5.1 Lane 1 — stable production (`main`)

`main` is the live `uscehub.com`. Every push to `main` deploys within ~60–90 seconds via Vercel.

**Allowed on `main`:**

- bug fixes (correctness, audit-trail discipline, schema-default population)
- trust / copy corrections (PR #25 / #27 are the canonical examples)
- approved small homepage CTA additions (newsletter signup, social links, etc. — only after explicit user authorization per [BATCH_RELEASE_CHECKLIST.md](../codebase-audit/BATCH_RELEASE_CHECKLIST.md))
- ops cleanup (Vercel duplicate project, Prisma deprecation, GSC, mobile QA)
- cron checks / runbooks / audit docs
- emergency data-integrity fixes — see §5.3
- additive backward-compatible schema migrations under §7

**Not allowed on `main`:**

- major redesign
- new top-nav verticals
- new homepage architecture
- new conversion / email / lead-capture system
- broad career / visa / fellowship public launch
- monetization flows
- subscriber tables (or any schema migration without explicit authorization — see §7)
- half-built public pages
- programmatic-SEO mass page generation that fails the §9 quality gate

Lane 1's job is to keep `uscehub.com` indexed, credible, and stable. Nothing more.

### 5.2 Lane 2 — background v2 overhaul (`redesign/platform-v2`)

Long-running branch off `main`. Multi-week or multi-month timeline. Vercel auto-creates a preview URL for the branch; Hobby's deployment-protection 401-gates the URL by default, so it's a usable hosted staging environment that Google can't index.

**Allowed in Lane 2:**

- new information architecture
- new homepage / new navigation
- new top-level verticals (USCE / Match / Fellowship / Jobs / Visa / Tools / Resources / Institutions)
- new design system + component library
- internal preview routes
- mock pages
- content architecture
- visual polish
- UX flows
- audience-segment landing pages
- skeletal "Coming soon — be the first to know" pages for verticals that have honest empty states

**Not allowed in Lane 2:**

- merge to `main` until launch-ready
- change production sitemap / canonicals / metadata (those follow at launch with a coordinated SEO migration plan)
- send real emails
- touch production schema unless explicitly planned (see §7)
- expose unfinished pages on production
- destructive operations against any DB (production or staging)
- generate programmatic pages that violate §9
- any content tagged `T5-anecdotal` as the primary citation

Lane 2's job is to build the bigger site without disturbing the live site.

### 5.3 Lane 3 — emergency exception path (NOT a peer lane)

A small set of incidents bypasses the batch cadence — but **never auto-merges**. Each requires explicit user authorization to merge same-day per [BATCH_RELEASE_CHECKLIST.md](../codebase-audit/BATCH_RELEASE_CHECKLIST.md):

1. **Cron health FAIL** — `scripts/check-verify-listings-cron.ts` exits 1 (forbidden cron-attributed transition, fake-date violation, etc.).
2. **Security issue** — public auth bypass, secret exposure, RCE class.
3. **Data-loss / data-corruption risk** — production write that violates the conservative cron / admin contract.
4. **Production 5xx** — a public route that previously returned 200 now returns 5xx.

Lane 3 is a process exception, not an architectural one. It operates on `main` (Lane 1) but with a tighter feedback loop: smallest-possible-fix PR, explicit user authorization with the literal word "merge it," then merge. No auto-merge, ever.

### 5.4 Launch — single batch event

When v2 is ready, it merges to `main` as one controlled release. That's a *moment*, not a fourth lane. The launch checklist is in [BATCH_RELEASE_CHECKLIST.md](../codebase-audit/BATCH_RELEASE_CHECKLIST.md) plus a future `LAUNCH_PLAN.md` (deferred — see §19).

---

## 6. v2 branch discipline

Long-running branches without rebases bit-rot. By month two, the v2 branch becomes unmergeable and the temptation to "just do v2 work in one giant PR on main" defeats the entire dual-track model.

### 6.1 Weekly Monday rebase ritual

```
Every Monday:
  git -C /Users/shelly/usmle-platform fetch origin
  git -C /Users/shelly/usmle-platform checkout redesign/platform-v2
  git -C /Users/shelly/usmle-platform rebase origin/main
  git -C /Users/shelly/usmle-platform push --force-with-lease
```

`--force-with-lease` (never plain `--force`) is the only force-push variant ever allowed in this project. It refuses if someone else pushed to the branch in the meantime.

**Diagnostic: if conflicts become painful, stop and report.** Painful conflicts mean `main` and v2 are drifting too much — usually because Lane 1 is doing more than bug fixes, or because v2 is touching files that `main` is also editing (expected for `src/lib/`, less expected for `src/app/listing/[id]/page.tsx` once Lane 2 starts replacing it). The signal: pause both lanes, decide which lane should own the contested file, then resume.

**Rebase the planning branch too.** This `redesign/platform-v2-planning` branch (which holds future strategy docs as they're written one at a time) follows the same Monday ritual.

### 6.2 No mega-PR rule

When `redesign/platform-v2` is ready to merge into `main`, the merge happens as **one squash commit** on the launch event. But the merge's content was assembled over weeks of small PRs into the v2 branch, each reviewable on its own. v2 must never accumulate to the point that the squash diff is incomprehensible.

If the v2 branch reaches +50,000 lines of net diff vs `main`, stop adding new vertical work and start the launch sequence. Merging more risks turning the launch into a leap-of-faith deploy.

### 6.3 Sub-branch off v2

For risky or experimental v2 work (new design system tokens, a new page template that needs visual review), create sub-branches off `redesign/platform-v2`:

```
redesign/platform-v2  ← long-running base
  ├── redesign/v2-feature-design-system
  ├── redesign/v2-feature-homepage-hero
  └── redesign/v2-feature-match-prep-landing
```

PRs target `redesign/platform-v2`, not `main`. The sub-branch pattern keeps the v2 branch's history readable.

### 6.4 No cherry-picking from v2 to main

A v2 component that "would also help the live site" is a temptation that erodes the model. If it really helps the live site, it's a Lane 1 PR — re-derive it from `main`, not from v2. Cherry-picks bypass the schema, design-system, and IA decisions still pending in v2.

The only exception: if the v2 work surfaces a bug also present in `main`, fix the bug as a separate small Lane 1 PR. Don't backport the v2 framing along with the bug fix.

---

## 7. Schema strategy

The hardest call in any long-running rebuild is when to land schema migrations. Two failed patterns:

- **Schema lands on the v2 branch, ships at launch.** Production DB doesn't carry unused tables, but v2 can't test against the real production DB until launch day. High risk at launch.
- **Schema lands on main automatically.** Unused tables sit in production for weeks. If v2 launches differently than planned, the leftover schema is technical debt.

### 7.1 Decision: schema-on-main only with explicit authorization

**Rules:**

- No schema migration lands automatically in either lane.
- If v2 needs schema (e.g. `EmailSubscription` for digests, `Subscriber` for alerts, new fields on `Listing`), I propose a small additive backward-compatible PR to `main` first.
- Only additive, backward-compatible changes are allowed. No `DROP COLUMN`, no `ALTER COLUMN ... NOT NULL` without a default, no `DROP TABLE`, no `prisma migrate reset`, no `prisma db push --accept-data-loss`.
- Migration PRs include a rollback plan and a "what queries change" note.
- The user authorizes each schema PR explicitly before I implement.
- Once authorized + merged on `main`, the v2 branch can develop against the real schema.

### 7.2 Pattern proven on this project

- PR #6 (`20260428171752_baseline_existing_schema`) — created the migration history with no behavior change.
- PR #7 (`20260428173738_phase3_verification_fields`) — added `LinkVerificationStatus`, `FlagKind`, the `Listing` verification fields, the `FlagReport` extensions, the `DataVerification` extensions. All additive. All consumed gradually by PR #9 (cron) → #11 (405 fallback) → #12 (admin queue) → #13 (UI) → #16 (cards) → #17 (ordering) → #21 (digest preview) → #24 (broken-link kind).

The v2 lane should follow the same model: small additive schema PRs on `main`, gradual consumption.

### 7.3 What schema additions v2 will likely need (not authorization to build)

Listed here so the eventual schema PRs are not surprises. Each requires its own explicit-authorization PR per §7.1.

- `EmailSubscription` — newsletter / digest subscribers; consent + double-opt-in fields; CAN-SPAM-required `unsubscribedAt`.
- `Subscriber` (or unified with `EmailSubscription`) — alerts subscriptions, deadline reminders, freshness alerts.
- `SavedListing.notes` and `SavedListing.tags` — user-side organization.
- `Listing.audienceTags`, `Listing.careerStageTags`, `Listing.sourceAuthorityTier` — per §4 taxonomy.
- `Listing.monetizationDisclosure` — per §4.6 / §12.
- `Listing.lastSeenInOfficialSource` — distinct from `lastVerifiedAt`; tracks freshness SLA per §11.
- `DirectoryEntry` (separate from `Listing`) — for attorneys, recruiters, contract reviewers; different lifecycle from program listings.
- `PathwayGuide` (probably markdown-on-disk, not Prisma) — pathway content lives under `content/pathway/*.md` to stay out of the DB and stay version-controlled.
- `InstitutionClaim` — claim flow for hospitals / programs claiming their own listing.
- `MonetizationLedger` (deferred to marketplace phase) — order/payment history, never built before user explicitly authorizes the marketplace phase.

### 7.4 Schema rules that bind even with authorization

- Every additive column is nullable or has a sensible default; no `NOT NULL` on existing tables.
- Every new enum starts with the existing values (back-compat) and adds new values; never reorder or remove.
- Every removal (eventual, post-launch) goes through a deprecation PR first that stops writing the column / stops querying the column, lets the next deploy run for ≥7 days, then a removal PR drops the column.
- Migration files are committed with a human-readable description prefixed (e.g. `20260601000000_add_audience_tags_to_listing`) so `prisma migrate status` reads clearly.

---

## 8. URL and indexation doctrine

v2 IA generates many candidate pages. The default of "let's index all of them" is wrong. URL and indexation policy must be explicit before the IA doc gets drafted.

### 8.1 Canonical URL policy

Every page has exactly one canonical URL. v2 must enforce this even under faceted navigation.

- Trailing slash: **no** — `/observerships/california`, not `/observerships/california/`.
- Case: lowercase path segments only.
- Multi-word segments: hyphens, never underscores.
- Slug stability: once a listing is published, its slug never changes. Renaming a listing changes the display title; slug stays.
- Listing slugs are `{listing-id}-{kebab-title}` so collisions are impossible.
- Vertical landings: `/match`, `/fellowship`, `/jobs`, `/visa`, `/tools`, `/institutions`, `/resources` (no plural, no `/s`, no `-prep` suffix on the URL itself).
- Audience segments live as filters / facets, not as URL prefixes (no `/img/observerships/...`). Adding audience to the URL fragments the index.

### 8.2 Faceted navigation

Browse pages support filters. Each filter is a query param, **not** a path segment, by default. E.g.:

- `/browse?type=observership&state=NY` — query params; no separate URL.
- `/observerships/new-york` — path; this is a curated landing with editorial value, not a generic filter result.

Rule: **a URL exists only when there is editorial value at that URL** — curated copy, hand-picked content order, a unique meta description, a justification beyond "the filter combination matched."

`/browse?type=X&state=Y` returns the same listing set as `/observerships/new-york` would for some combinations, but only `/observerships/new-york` is in the sitemap and only it has indexable metadata. The query-param page is `noindex, follow`.

### 8.3 Sitemap rules

Sitemap entries are programmatically generated from:

- Curated landing pages (manually authored)
- Approved listing detail pages (status `APPROVED`)
- Approved blog posts
- Vertical landing pages once the vertical has at least one curated piece of content
- Audience-segment landing pages once curated

Sitemap entries are **excluded** for:

- Query-param URLs
- Listings in non-`APPROVED` statuses
- Pages tagged `noindex` for any reason
- Skeletal "Coming soon" pages — those are `noindex, follow` and not in sitemap

### 8.4 Preview noindex

Vercel preview deployments are 401-gated by SSO on Hobby. That blocks crawlers regardless of any noindex directive, but v2 must additionally emit `X-Robots-Tag: noindex, nofollow` on preview deployments as defense-in-depth — defined by `process.env.VERCEL_ENV !== "production"`. Already wired for production, but v2 must not regress this.

If preview protection is ever disabled (e.g. for a public preview link to share with a stakeholder), the preview must still emit `noindex` headers.

### 8.5 What changes at launch

When v2 launches:

- The sitemap is rebuilt to include the new URL set.
- The robots.txt stays permissive (no `Disallow:` for crawlable surfaces).
- 301 redirects are added for any URL that v2 deprecates from the §2.1 list. We commit to **no broken inbound links** from a search-engine snapshot of `main` taken just before launch.
- Canonical URLs on every page are recomputed.
- `LAUNCH_PLAN.md` (deferred — §19) enumerates the SEO migration steps in detail.

### 8.6 No URL changes on `main` during v2 build

A URL change on `main` during v2 build forces an immediate re-rebuild of the v2 sitemap and risks redirect-chain confusion. Lane 1 does not change URLs during v2 build, period. If a URL is genuinely wrong (typo, casing, trailing-slash inconsistency), defer the fix to launch event and document it in the launch plan.

---

## 9. Programmatic SEO quality gate

The temptation in a directory product is to programmatically generate every `state × specialty × audience × resource-type` combination as a separate URL, push the sitemap from 207 entries to 50,000+, and watch organic traffic 100×. This is the playbook competitors use, and it's what AI-search engines (§10) are now actively penalizing.

### 9.1 Hard rule

**No template-only programmatic page may enter the sitemap.** A template-only page is one whose only differentiator from sibling pages is the variable filled in (state name, specialty name, audience tag).

A page enters the sitemap only if it has all of:

1. **At least one piece of unique editorial content** — a hand-written intro, a curated list of best programs at this intersection, a state-specific or specialty-specific note, a methodology callout that differs from sibling pages.
2. **At least one unique data point** — a count specific to this intersection (e.g. "12 programs in California with no fee," not just "n programs"), a stat that doesn't appear on sibling pages.
3. **A primary citation at tier `T1-primary` or `T2-aggregator-with-attribution`** — anecdotal or aggregator-only sources don't qualify for indexation.
4. **Pass the human review queue** — every new programmatic page goes into a review queue (status = `DRAFT_FOR_REVIEW`) before being marked `APPROVED` and entering the sitemap.

### 9.2 What this rules out

- "Observerships in {state}" pages where the only content is the listing list and a templated `<h1>{state} Observerships</h1>`.
- "{Specialty} observerships" pages with no hand-written specialty context.
- "{Specialty} {state} observerships for IMGs" combinatorial pages.
- "Visa-friendly residencies in {state}" pages with no curated information about that state's actual sponsorship patterns.

### 9.3 What this rules in

- A curated `/observerships/california` landing that opens with a handwritten paragraph ("California is one of the most competitive states for IMG observerships because of UCLA / UCSF / Cedars-Sinai…"), shows a curated top-12 list, surfaces state-specific cost / duration / language patterns, and cites a `T1` source for each pattern claim.
- A `/match/strategy/old-yog-img` page with a handwritten essay on old-YOG strategy, citation to NRMP `T2` data on old-YOG match rate, and curated links to programs known to consider old-YOG applicants.
- A `/visa/conrad-30/state-comparison` interactive table that synthesizes Conrad 30 program data across states with handwritten interpretive copy.

### 9.4 Quality-gate enforcement

- A v2 build script (`scripts/check-programmatic-seo-quality.ts`, to be written before any large programmatic surface ships) enforces gates 1–3 mechanically.
- Gate 4 is operator-side: every new programmatic page must pass review before its `status` flips from `DRAFT_FOR_REVIEW` to `APPROVED`.
- The sitemap generator queries `status = APPROVED` only.

### 9.5 Why this matters

Google's March 2024 helpful-content update + the 2025 AI-search shift have made template-only programmatic SEO an active liability, not just neutral. Sites that attempted "100K-page programmatic SEO playbooks" in 2023–2024 saw 60–90% organic traffic collapses through 2025. v2 must not optimize for an obsolete playbook.

---

## 10. AI-search / zero-click resilience

Most of USCEHub's organic search future runs through AI-summarized answers (Google AI Overviews, Perplexity, ChatGPT search, Claude's web tool). The blog-volume strategy that worked in 2018–2022 does not produce traffic to clicks anymore — AI summaries answer the user's question on the AI's surface, not ours.

### 10.1 Strategic implication

The moat for v2 is **tools, structured data, and verified primary-source citations**, not blog volume.

- Tools (compare, recommend, alerts, decision helpers) are by definition not summarizable into a paragraph; the user must come to USCEHub to use them.
- Structured data surfaces (state-by-state comparisons, salary aggregations, sponsorship patterns) are deeper than what an AI summary will inline. AI summaries can quote a number, but a user who wants to slice the data their way still has to come to the source.
- Verified primary-source citations make USCEHub the reference an AI summary cites — which directs a smaller but more engaged audience to the canonical source.

### 10.2 Tactical rules

- **Tool-first, blog-second.** A blog post is acceptable as a complement to a tool; a blog post in place of a tool is a strategic miss.
- **One paragraph that an AI summary will quote, then 5× more depth that only the human reader benefits from.** Pages should answer the headline question in the first paragraph (so AI inclines to cite us), then provide the structured data / interactive comparison / multi-source reconciliation that only the page can deliver.
- **Cite our sources visibly.** Every claim shows its `source authority tier` (§4.5). AI summaries that cite USCEHub get to inherit that credibility chain.
- **Markup primary-source citations with `schema.org/Citation` and `schema.org/Dataset` JSON-LD.** AI search prefers structured citation graphs.
- **Tool URLs are first-class, not query-param hacks.** `/tools/visa-decision-helper` is in the sitemap; `/tools?which=visa-decision-helper` isn't.

### 10.3 What we don't optimize for

- Generic informational content where 100 competitors already have the answer (e.g. "What is USMLE Step 1?"). AI summary will quote whoever wrote the most authoritative answer; we won't outrank ECFMG / USMLE.org / Wikipedia on this.
- Content that's redundant with `T1-primary` source (mirroring official policy text). Either cite + link out, or skip.
- SEO-bait listicles ("Top 10 X for Y"). Curated lists are fine; SEO-bait listicles fail §9.

### 10.4 Brand moat

The moat USCEHub builds in 2026 has to be defensible in 2027 when AI search is the default surface for "where do I find verified IMG observerships." That moat is **(a) tools that require interaction, (b) verified primary-source data nobody else has, and (c) the trust contract from §2.2 that makes us the source AI summaries prefer to cite.**

---

## 11. Freshness SLA

A directory's credibility decays with stale data faster than any other failure mode. v2 must commit to a measurable freshness SLA per listing.

### 11.1 Freshness tiers

Each program listing has a `lastVerifiedAt` timestamp from cron + admin verification. Tiers map age → display state → operator action:

| Age of `lastVerifiedAt` | Tier | Public display | Operator action |
|---|---|---|---|
| ≤ 90 days | **Current** | "Verified — link checked {N} days ago" | none |
| 91 – 180 days | **Aging** | "Verified — link checked {N} months ago" | passive: cron may pick it up; admin queue surfaces if cron fails |
| 181 – 365 days | **Stale** | "Verified — link checked {N} months ago, due for reverify" | active: admin queue prioritizes for manual reverify |
| > 365 days | **Reverify required** | downgrade to "Official source on file" (drop the green badge); show "Reverification due" amber soft notice | mandatory: admin must reverify or downgrade `LinkVerificationStatus` before the listing returns to "Verified" |
| `null` (legacy) | **Legacy backfill** | "Official source on file" | passive: admin queue surfaces these for backfill |

### 11.2 Enforcement

- The `/api/cron/verify-listings` cron already advances `lastVerifiedAt` only on `VERIFIED` outcomes — that semantic is binding for v2.
- Cron eligibility ordering (PR #17) already prefers older `lastVerifiedAt` first (NULLS FIRST). v2 inherits this.
- A future Lane 1 PR (call it Phase 3.10, not authorized yet) will add the **automated downgrade** for >365-day stale listings: status flips from `VERIFIED` to `UNKNOWN` (not `SOURCE_DEAD`) and badge silently drops. This requires schema-level work per §7.
- The freshness tier is computed at render time from `lastVerifiedAt` + `Date.now()` — no batch job needed, no extra column.

### 11.3 Public claim alignment

Public stat copy (homepage stat cards, OG metadata, blog references) must be consistent with the freshness SLA:

- "207 verified programs" claim is allowed only when ≥ 80% of `APPROVED` listings are in **Current** or **Aging** tier.
- If freshness drops below that, the claim downgrades to "207 programs with an official source on file" — the conservative-language doctrine from PR #25 / PR #27.
- The freshness threshold is checked by `scripts/check-public-claim-alignment.ts` (to be written before any v2 launch event).

### 11.4 Rationale

A directory that says "verified" but whose most recent reverify is 14 months old is lying by omission. The tier scheme is the operational discipline that prevents that drift.

---

## 12. Trust and monetization policy

Monetization happens last, and it never overrides trust. This is the line v2 must not cross.

### 12.1 Trust comes first, always

- `LinkVerificationStatus = VERIFIED` listings sort above non-verified listings within any ranking surface (browse, search, recommend, vertical landing).
- Sponsored / affiliate / paid-claim states (§4.6) **never** displace `VERIFIED` listings from the top of a ranking surface.
- Sponsored-state listings appear with a per-card "Sponsored" badge that is visually equivalent to or more prominent than the listing card itself.
- A user clicking a sponsored link sees the same level of source-tier transparency as any other listing.

### 12.2 FTC compliance (US baseline)

USCEHub's audience includes U.S. trainees and the FTC's "Endorsement Guides" + "Disclosure of Material Connections" rules apply. Operationally:

- Affiliate links are labeled "Sponsored" or "Affiliate" inline, before the link, in the same font size as surrounding text (no fine-print disclosure).
- Sponsored placements declare paid status in the listing card, not only on a far-away "About" page.
- Pages with affiliate / sponsored content carry a top-of-page banner: "This page contains [Sponsored / Affiliate / Sponsored and Affiliate] content."
- Email digests with sponsored content carry the same banner in the email body, not only in the footer.

### 12.3 No dark patterns

- No "you must subscribe to view this listing" gates on `T1-primary` content.
- No "free trial that auto-bills if not canceled" flows for any USCEHub-owned product.
- No "remove ads with subscription" — the free product is the product; if we ever monetize, it's via institutions and marketplace fees, not user upsells (§15).
- No urgency-manipulation copy ("Only 2 spots left!" when supply isn't actually constrained, "Verified by USCEHub" when it isn't, "Editor's pick" when nobody picked it).

### 12.4 What v2 may build under this policy

- **Sponsored listing slot** with the §4.6 badge and §12.1 ordering rules.
- **Paid claim flow** for institutions to claim their own listing — costs nothing to claim, costs to feature.
- **Affiliate links** to attorney / contract reviewer / financial professional services — must be labeled per §12.2.
- **Display ads** — only if the page passes all freshness, trust, and quality gates first; no ads on pages that are still in `DRAFT_FOR_REVIEW`.

### 12.5 What v2 may NOT build under this policy (until each is explicitly authorized)

- Subscription paywall.
- Tiered membership.
- "Pro" features that lock essential data.
- Affiliate-only directory (every directory entry must have an unsponsored, source-verified path).
- Sponsored content that mimics editorial content without disclosure.
- Cross-site pixel tracking for ad retargeting beyond what the user's own analytics setup uses.

### 12.6 Disclosure of monetization to users

A `/methodology` or `/disclosure` page enumerates every monetization state used on the site, what each looks like, and how to identify it. Updated whenever a new monetization mode launches.

---

## 13. Messaging and alerts policy

Email and notification systems are the area where new platforms most often violate trust without realizing it. v2 must be explicit about the rules before the first send.

### 13.1 CAN-SPAM compliance (US baseline)

Every commercial email USCEHub sends must include:

- A clear sender identity ("USCEHub" or a real human at USCEHub).
- A subject line that accurately describes the message (no clickbait / misleading subjects).
- A physical postal address for USCEHub.
- A clear, working unsubscribe link in every send.
- Honor of unsubscribes within 10 business days.

### 13.2 Consent ladder

Every email subscription has an explicit consent state:

| State | Allowed sends |
|---|---|
| `unsubscribed` | none |
| `not-yet-confirmed` (single-opt-in placeholder) | one confirmation email only |
| `confirmed` (double-opt-in) | full subscription category |
| `paused` (user requested pause without unsubscribing) | none until user reactivates |

USCEHub uses **double-opt-in by default** for all marketing / digest categories. Single-opt-in is allowed only for transactional emails (account confirmation, password reset, listing-claim approval).

### 13.3 Subscription categories

Each category is a separately consented subscription. Subscribing to one does not subscribe to others.

- **Verified-listings digest** (weekly): freshly verified listings, ranked by tier and audience tag.
- **Deadline reminders** (per saved listing): reminder N days before a deadline the user opted into.
- **New-vertical alert** (one-time per vertical): when a new vertical (Match / Fellowship / etc.) launches.
- **Editorial newsletter** (monthly): hand-curated essay + curated picks; lowest-frequency, highest-craft.
- **Institution communications** (separate): for institution accounts, kept fully separate from user-side categories.

### 13.4 Frequency caps

- Total emails per user per week ≤ 3 across all categories combined, except deadline reminders (which are user-triggered).
- Editorial newsletter is monthly; cannot be quietly turned weekly.
- Re-engagement campaigns ("we miss you") are limited to one per quarter per dormant user, then auto-unsubscribe after 6 months of no opens.

### 13.5 No real sends until prerequisites

The 8-prerequisite list from [PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md](../codebase-audit/PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md) §6 binds:

1. Schema for subscriptions (additive, per §7).
2. Confirmed double-opt-in flow.
3. Working unsubscribe link wired to actual unsubscription.
4. Postal-address footer.
5. Sender-identity verified at the email-provider level (Resend domain DNS).
6. Per-category preference center.
7. CAN-SPAM compliance audit pass.
8. Send-volume limits and bounce-handling configured at the provider.

The current state ships **a no-send digest preview only** (PR #21). Real sends require explicit user authorization with all 8 prerequisites green.

### 13.6 Other notification channels

- **Push notifications**: not built. When built, requires per-channel consent separate from email.
- **SMS**: not built. Higher trust bar than email; requires explicit double-opt-in via a TCPA-compliant flow.
- **In-app notifications**: allowed once the v2 logged-in surface exists; no consent prompt required because the user is in-product.

---

## 14. Audience expansion plan

Reaffirmed from Master Blueprint §0 hard sequencing rule. Lane 2 must respect the same order:

1. **Stabilize the USCE trust / data-quality engine** (Phase 3 — verification cron, admin queue, real public verification UI). **Done** modulo PR #25 / PR #27 batch review and §9.3 of the Phase 3 audit.
2. **Saved / compare / alerts on top of trustworthy data.** Saved + compare scaffolding exists (Prisma models, `/dashboard/saved`, `/dashboard/compare`, `/compare`); alerts pending. Lane 1 maintains; Lane 2 redesigns the surfaces if needed.
3. **Expand into career, visa, fellowship, and new-attending support.** Lane 2 builds the new top-level verticals.
4. **Marketplace / monetization.** Final tier; everything before it must be solid.

### 14.1 Audience expansion (granular)

Each step expands audience without abandoning previous audiences. The taxonomy from §4.1 holds.

**Phase A — Current state** (live today on `main`):
- Audience: `img-non-us`, `img-us`, with shallow content for other audiences.
- Career stage: `clinical-experience` (USCE-focused).
- Verticals exposed: USCE, Resources (blog).

**Phase B — v2 launch (target):**
- Audience: add `usmg-md`, `usmg-do`, `resident`, `fellow` as first-class targets.
- Career stage: add `pre-match`, `intra-match`, `pre-fellowship`, `pre-attending`.
- Verticals exposed: USCE (rebuilt), Match (initial), Fellowship (initial), Tools (compare/recommend/alerts), Resources, Institutions (initial).
- Verticals skeletal-only: Jobs, Visa.

**Phase C — Post-launch (6+ months after v2):**
- Audience: add `attending` as fully-served audience.
- Career stage: add `attending` (active attending support).
- Verticals: Jobs and Visa fleshed out; first sponsored / paid-claim implementations under §12.

**Phase D — Marketplace tier (deferred):**
- Audience: `institution` becomes a paying-customer audience.
- Verticals: full marketplace flows (claim, sponsor, recruiter, attorney, contract review, financial services).

### 14.2 Eight verticals scaffold (probable nav order)

Reaffirmed from Master Blueprint §0:

```
USCE | Match | Fellowship | Jobs | Visa | Tools | Resources | For Institutions
```

The detailed page hierarchy under each vertical is **deferred to `INFORMATION_ARCHITECTURE.md`** — a separate session that benefits from product-level decisions (e.g., do residents/fellows/attendings each get their own top-nav lane, or do they all live under "Career Path"?).

### 14.3 Honest empty states

A vertical that has no curated content yet shows an empty state:

- "Match Prep — coming soon. We're building structured match-strategy content for IMG and U.S. applicants. Be the first to know when it launches: [email signup, double-opt-in per §13]."
- "Fellowship — currently we list fellowship pages only at hospital-program level. Subspecialty pathway guides are in the build queue."

Empty states are honest; they never pretend content exists. They never include skeleton listings or placeholder data.

### 14.4 Build order rule

From Master Blueprint §13: start with USCE consolidation (the existing wedge re-skinned), then Match Prep, then Career Path (Jobs + Visa), then Tools, then Institutions. Don't ship all eight verticals on launch day if some are skeletal.

---

## 15. Buyer / user separation

USCEHub has two structurally different audiences with different incentives. The product must keep them separated cleanly.

### 15.1 The user side (free)

- All physician trainees and physicians who use USCEHub to find programs, navigate visa, prepare for match, etc.
- The product is **free for this audience forever**. The trust contract (§2.2) depends on this. Users who pay are users we're aligned with against scammers; free users are the audience whose trust we're earning.
- User-side accounts: optional. Anonymous browsing works. Logged-in users get saved listings, compare, alerts, dashboard.

### 15.2 The institutional side (paid eventually)

- Hospitals, GME programs, observership hosts, residency programs, fellowship programs, recruiters, attorneys, contract reviewers, physician financial services.
- This is where monetization happens. Institutions pay to:
  - Claim their listing (free to claim, paid to feature)
  - Sponsor placement (per §12, never overrides verified ranking)
  - Reach the audience (sponsored listings, sponsored newsletter slots)
  - Access aggregated audience analytics (anonymized, never per-user)
- Institution-side accounts: required. Separate sign-in. Separate data model.

### 15.3 Hard rule: never cross the streams

- No user-side feature is paid.
- No institution-side feature is free if it costs us to deliver.
- Institution-paid placements are **always disclosed to users** per §12.
- User data is never sold to institutions. Aggregated analytics only (e.g. "visa-decision-helper users from California, count = N"), never per-user data, never email lists.
- An institution that pays for sponsorship cannot pay to suppress a user-side flag report or remove a verified listing.

### 15.4 Why this matters

Sites that monetize the user side (paywalls, premium memberships) eventually choose between user trust and revenue, and the trust loses. USCEHub avoids the choice by structurally placing revenue on the institution side.

This means the marketplace tier (Phase D, §14.1) is what eventually pays for the platform. Until then, the cost of running USCEHub is borne by the founders.

---

## 16. Metrics and gates

What gets measured. What signals ship-readiness or trouble. v2 IA must surface these for the operator (us) and exclude them from public-facing pages unless explicitly approved.

### 16.1 Operator-side metrics (always tracked, never public)

**Trust health:**
- Cron health: `scripts/check-verify-listings-cron.ts` PASS / WARN / FAIL state
- Cron tick count over last 7 days (target: 7, no missed days)
- `LinkVerificationStatus` distribution (count by state, weekly)
- Median age of `lastVerifiedAt` for `VERIFIED` listings (target: < 90 days per §11)
- Count of `NEEDS_MANUAL_REVIEW` in admin queue (target: < 25 sustained)
- Count of `FlagReport` open (target: < 10 sustained)
- Median time-to-resolve a `FlagReport` (target: < 7 days)

**Site health:**
- Production 5xx rate per route per day (target: < 0.1%)
- Production p95 LCP / INP / CLS per route (target: LCP < 2.5s, INP < 200ms, CLS < 0.1)
- `next build` time (signal of bundle bloat)
- Sitemap entry count (signal of unintended programmatic explosion — see §9)

**Search Console:**
- Indexed page count (target: monotonically increasing or steady)
- Coverage errors (target: 0 sustained)
- Core Web Vitals — Pass rate (target: > 90% of URLs)
- Average position for top 20 query targets (signal, not goal)
- CTR for top 20 query targets (signal, not goal)

### 16.2 Product metrics (tracked, used for v2 decisions)

- Unique users per week
- Saved-listing count per user (engagement depth)
- Compare-flow completion rate
- Alert-subscription rate among logged-in users
- Tool usage by tool (which tools earn re-visits)
- Email-open / unsubscribe rate (digest quality signal)

### 16.3 Public-facing metrics (curated, conservative, explicitly approved)

- "{N} programs with an official source on file" (current PR #25 baseline)
- "{N} states covered"
- "{N} verified programs" — only when freshness SLA passes per §11.3
- "Updated {month year}"

Numbers are derived from `src/lib/site-metrics.ts` (current source of truth) plus live Prisma queries (`src/components/seo/program-stats.tsx`). v2 must continue this discipline: one file per claim category, never scatter.

### 16.4 Gates between phases

Moving from Phase A (current) to Phase B (v2 launch) requires:

- All seven readiness gates from §17 satisfied
- Cron health PASS for ≥ 7 consecutive days
- Sitemap entry count audit (no unintended explosion)
- `next build` clean, type-check clean, lint clean
- Mobile QA done per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md) Part 2
- The launch plan (deferred — §19) drafted and reviewed

Moving from Phase B to Phase C requires:

- v2 has been live ≥ 30 days
- No regressions in §16.1 trust-health metrics
- Search Console indexed-page count has not collapsed (target: ≥ 90% of pre-launch indexed URLs still indexed within 30 days)

Moving from Phase C to Phase D (marketplace) requires:

- Explicit user authorization
- Legal review of payment / contract / compliance surface
- Institution-side accounts data model in production for ≥ 90 days
- A separate BUSINESS_TERMS doc drafted

### 16.5 What we don't measure

- Per-user behavior tracking beyond what aggregate analytics requires (Vercel Analytics is fine; full-session replay is not).
- Heat maps of listing detail pages (privacy cost not justified).
- Engagement scoring of individual users (would creep toward the dark-pattern lines in §12.3).

---

## 17. Growth / SEO / Twitter readiness gates

USCEHub's reach strategy must wait for the v2 platform to actually exist as a coherent product. Aggressive growth on the current narrow wedge would either (a) make us look like an "IMG observership directory" forever, narrowing the brand against Master Blueprint §0, or (b) overclaim a "whole physician pipeline platform" while only the USCE wedge is built — also a credibility hit.

### 17.1 Allowed now

- Write future SEO/Twitter positioning principles in this strategy doc.
- Define audience map (later session).
- Define future content pillars (later session).
- Define readiness gates (this section).
- Define what must be true before public growth push.
- Watch GSC indexing for the existing USCE pages (per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md)).
- Maintain blog content discipline (PR #27 is the canonical example).

### 17.2 Not allowed yet

- Aggressive programmatic SEO publishing (state × specialty × audience matrix pages) — also blocked by §9.
- Broad Twitter/X campaign.
- Paid acquisition (Google Ads, Meta Ads, sponsored content).
- Brand claims beyond current product reality ("whole physician pipeline" marketing before pages exist).
- Weakening current USCE trust / data-quality work to chase reach.
- Linking from public pages to unfinished v2 verticals.
- Announcing v2 before it ships.

### 17.3 Readiness gates — all seven required before public growth push

1. **Trust system stable.** Cron has run cleanly for ≥ 4 consecutive scheduled ticks (~4 days) AND meets §11.3's freshness threshold. No FAIL from `scripts/check-verify-listings-cron.ts`. No mass `SOURCE_DEAD` / `PROGRAM_CLOSED` / `NO_OFFICIAL_SOURCE` from cron (those are admin-only).
2. **No stale public claims.** Stat counts, blog references, and metadata all reflect the current accurate state and don't overclaim verification (PR #25 + PR #27 close the current known gaps).
3. **Code/site architecture clean.** No half-built public pages. No top-nav links to dead routes. No broken internal links per `next build`. Programmatic-SEO surface (if any) passes §9 quality gate.
4. **v2 platform shipped or at minimum the "framing rebrand" shipped.** USCEHub publicly positioned as the physician career-pathway platform (Master Blueprint §0), not an "IMG observership directory."
5. **Mobile QA done** on real iOS + real Android per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md) Part 2.
6. **GSC + sitemap submission** completed per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md) Part 1.
7. **Data-quality story tellable in one paragraph.** "We list X programs with an official source on file across Y states; cron-verified daily; admin-triaged when the source breaks; users can report broken links." Concrete, defensible, no overclaiming.

Until all seven hold, growth stays in planning mode.

### 17.4 Twitter/X positioning principles

When growth opens up, X presence follows these rules (cross-references Master Blueprint §5):

- **Tactical, factual, no IMG-vs-AMG debates.**
- **Lead with tools and data, not hot takes.** A new tool launch is a thread; an opinion thread on residency hiring policy isn't.
- **Source every numerical claim** to a tier `T1` or `T2` source per §4.5.
- **Reply, don't subtweet.** If a competitor's data is wrong, don't subtweet — post our own data with citation.
- **No paid promotion of overclaimed content.** Promoted tweets must pass the same conservative-language test as PR #25 / PR #27.

---

## 18. What not to build yet

A non-goals list, restated as binding. Each item here is **explicitly not** authorized for v2 build until the user reverses the decision in writing.

### 18.1 Product non-goals

- **No new top-nav items on `main`.** Even one new top-level link (e.g. adding "Fellowship" to the nav) implies a public commitment to a vertical that doesn't exist yet. Belongs in v2 (Lane 2).
- **No new routes under any of the future-vertical paths** on `main` (`/match/*`, `/fellowship/*`, `/jobs/*`, `/visa/*`, `/tools/*`, `/institutions/*`). Same reason.
- **No real email sends.** Until §13.5's 8 prerequisites are met, no real send.
- **No subscriber tables on `main`** without explicit per-table authorization per §7.
- **No third Vercel cron.** The Hobby cap is 2; adding a third requires Pro-plan upgrade or replacing one of the existing crons. Either is a §7-level authorization decision.
- **No deletion or rename inside the `/career` hard protection list** per [RULES.md](../codebase-audit/RULES.md) §2. Aspirational Prisma models stay.
- **No SEO-risky page changes on `main`** during v2 build (sitemap, robots, canonical, metadata, JSON-LD, redirects all stay frozen on `main`; SEO migration is part of the launch event).
- **No large-UI overhaul on `main`.** That's literally the point of Lane 2.
- **No marketplace flows** until §14 Phase D explicitly authorized.
- **No subscription paywall, tiered membership, "Pro" features.** Per §15.
- **No removal of either stash** (`stash@{0}: cleanup/01-trust-counts-foundation`, `stash@{1}: jobs expansion`).

### 18.2 Schema non-goals

- No `DROP COLUMN` on any production table without an explicit deprecation PR + ≥ 7-day deploy window per §7.4.
- No `prisma migrate reset` against production.
- No `prisma db push --accept-data-loss` against any DB.
- No new Prisma model on `main` without §7 authorization.

### 18.3 Process non-goals

- No auto-merge of public-facing or code PRs per [BATCH_RELEASE_CHECKLIST.md](../codebase-audit/BATCH_RELEASE_CHECKLIST.md).
- No force-push to `main` (any flavor).
- No `--force-with-lease` push to any branch except v2 sub-branches during the Monday rebase ritual per §6.1.
- No `--no-verify` to skip pre-commit hooks.
- No silent merge of an emergency-exception PR per §5.3 — explicit user authorization required even when the bug is obvious.

### 18.4 Content non-goals

- No `T5-anecdotal` sources as primary citations on any page.
- No template-only programmatic SEO pages in the sitemap per §9.
- No clickbait blog headlines that fail PR #27's conservative-language test.
- No "Editor's pick" or "Featured" badges that aren't operationally true.

---

## 19. Future docs (deferred — separate sessions)

Each of these is a real product decision artifact, not a Claude first-draft. They are deferred to separate sessions where the user can react to one at a time.

| Doc | Why deferred | Trigger to write |
|---|---|---|
| `INFORMATION_ARCHITECTURE.md` | Decides whether residents/fellows/attendings each get top-nav lanes or share "Career Path." Decides URL structure for each vertical. | "Let's draft the IA doc." |
| `HOMEPAGE_V2_WIREFRAME.md` | Decides the homepage hero pitch (audience-first vs vertical-first), the stat surface (which numbers, which words), and the primary CTA (browse vs save vs alerts). | After IA approved. |
| `NAVIGATION_MODEL.md` | Decides the nav order, mobile collapsing, breadcrumbs, footer link map. Coupled to IA. | After IA approved. |
| `PAGE_TEMPLATE_INVENTORY.md` | Lists every page type v2 needs (vertical landing, listing detail, pathway guide, tool, blog post, etc.) and what their shared template needs. Component-library decision. | After IA + NAV approved. |
| `LAUNCH_PLAN.md` | The actual release-event plan: SEO migration steps, sitemap rebuild, redirects, communication, post-launch monitoring. Drafted near launch readiness. | When v2 is ≥ 80% done. |
| `INDEXATION_AND_URL_POLICY.md` | Operationalizes §8 into a per-route URL/canonical/sitemap matrix. Drafted alongside IA. | After IA approved. |
| `TRUST_AND_MONETIZATION_POLICY.md` | Operationalizes §12 into per-monetization-state implementation rules and disclosure templates. Drafted before first sponsored placement ships. | When sponsorship surface is queued. |
| `MESSAGING_AND_ALERTS_POLICY.md` | Operationalizes §13 into per-category send rules, double-opt-in flow, frequency caps, unsubscribe handling. Drafted before first real send. | Before §13.5's 8 prerequisites green. |
| `DATA_FRESHNESS_SLA.md` | Operationalizes §11 into the per-tier admin-queue prioritization, automated-downgrade rules, and public-claim alignment script. | Before automated downgrade ships. |

When a session opens with "let's draft the IA doc," that's the trigger to write `INFORMATION_ARCHITECTURE.md` next. Not before.

This list is closed for now. Adding a new deferred doc to it is itself a strategic decision that requires user approval.

---

## 20. Rollback / abandonability

v2 is a multi-month bet. Bets can fail. The rollback rule binds: **at any point before launch, v2 must be safely abandonable without loss to production.**

### 20.1 What abandonability means

If v2 is canceled tomorrow, before any v2 code merges to `main`:

- Production runs unchanged.
- All Phase 3 trust engine work stays.
- All Lane 1 PRs (PR #25 / #27 / etc.) stay merged or in their current OPEN state.
- The `redesign/platform-v2` and `redesign/platform-v2-planning` branches can be deleted with no production impact.
- The ~weeks of v2 effort are lost, but no live-site liability is created.

### 20.2 What enables abandonability

- §5.2's hard rule that v2 doesn't merge to `main` until launch-ready.
- §7's schema-on-main authorization rule — no v2-specific schema lands on `main` without explicit authorization, so v2 schema work doesn't pollute production.
- §8.6's no-URL-changes rule — v2 doesn't change production URLs until launch.
- §13.5's no-real-send rule — v2 doesn't acquire real subscribers until prerequisites met, so abandoning v2 doesn't create unsubscribe obligations.
- §6.4's no-cherry-picking rule — v2 features don't seep into `main` piecemeal; if v2 is abandoned, `main` is exactly where it would have been without v2.

### 20.3 What rollback looks like at launch

If v2 launches and immediately regresses (Search Console drops, trust complaints, mobile QA failure not caught pre-launch), rollback is:

1. `git -C /Users/shelly/usmle-platform checkout main`
2. `git -C /Users/shelly/usmle-platform revert <launch-merge-sha> -m 1`
3. `git -C /Users/shelly/usmle-platform push origin main`
4. Vercel re-deploys the pre-launch state within ~60–90 seconds.

The launch plan (deferred — §19) must enumerate the rollback runbook in detail and pre-test it on a preview deployment.

### 20.4 What rollback does NOT cover

- Schema migrations that landed on `main` before launch via §7. Those stay (additive, backward-compatible by rule).
- Lane 1 PRs that merged independently during the v2 build. Those stay.
- Search Console reindexing: even with revert, GSC will take days/weeks to re-recognize the prior URL set. The launch plan must mitigate this with a clean redirect map.
- User trust: a public launch that has to be rolled back is a credibility hit even when technical rollback is clean. Discipline beats rollback — the readiness gates in §17.3 exist to make rollback unnecessary.

### 20.5 The discipline rule

Every v2 work session ends with the question: "If we abandoned v2 right now, is `main` still safe?" If the answer is "no," we've drifted from §5.2 / §6.4 / §7. Stop, revert the drift, then resume.

---

## SEO impact of this doc

```
SEO impact:
- URLs changed:        none
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal strategy doc
```

## /career impact of this doc

None. `/career` is preserved per RULES.md §2.

## Schema impact of this doc

None. Schema-on-main rule (§7) requires explicit authorization for any future migration.

## Authorization impact of this doc

None. Documenting a future capability in §3, §4, §11, §12, §13, §14, or §15 is **not** authorization to build it. Each future build requires its own explicit authorization PR per the relevant section's gates.
