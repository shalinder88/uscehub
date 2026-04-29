# USCEHub v2 — PR Breakdown

**Status:** v2 planning doc. Decomposes the v2 implementation into a sequence of small, reviewable PRs targeting `redesign/platform-v2` (sub-branches), with a final launch PR to `main`.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md).
**Authored:** 2026-04-29.

---

## 1. Purpose

Per [PLATFORM_V2_STRATEGY.md §6.2](PLATFORM_V2_STRATEGY.md), the v2 launch is **one squash commit** to `main`, but the v2 branch's content is assembled from many small PRs into the v2 branch. This doc enumerates that sequence so future sessions can pick up any single PR without re-deriving the whole plan.

### 1.1 Why decompose

- Each PR ≤ 1500 LOC: reviewable in a single session.
- Each PR has a single concern: easier to revert if needed.
- Each PR has its own preview deployment: visual review per piece.
- The launch event squash collapses the history; the per-PR history lives in the branch.

### 1.2 Branching model

```
main (production)
  └── redesign/platform-v2 (long-running base)
        ├── redesign/v2-feature-design-system
        ├── redesign/v2-feature-homepage-shell
        ├── redesign/v2-feature-nav-v2
        ├── redesign/v2-feature-listing-detail-v2
        ├── ... (one sub-branch per PR below)
        └── (eventual launch PR: redesign/platform-v2 → main)
```

Sub-branches PR into `redesign/platform-v2`. Never into `main` directly.

---

## 2. PR sequence

Numbered for clarity. Order matters for dependencies. Each section gives: title, scope, files, dependencies, estimated LOC.

### Phase A — Foundation (PRs 1-5)

#### PR 1 — Design system tokens

- **Branch:** `redesign/v2-feature-design-system`
- **Scope:** typography scale, color palette (light + dark), spacing, border radius, shadows, breakpoints, motion tokens
- **Files:** `src/styles/v2/tokens.css`, `tailwind.config.ts` (extend; don't replace), `src/components/v2/lib/tokens.ts`
- **Dependencies:** none (foundation PR)
- **LOC:** ~400

#### PR 2 — Component library primitives

- **Branch:** `redesign/v2-feature-component-primitives`
- **Scope:** Button, Link, Card, Input, Badge, Tabs, Modal, Tooltip primitives; consistent with design tokens
- **Files:** `src/components/v2/ui/{Button,Link,Card,Input,Badge,Tabs,Modal,Tooltip}.tsx`
- **Dependencies:** PR 1
- **LOC:** ~800

#### PR 3 — V2 nav (desktop + mobile)

- **Branch:** `redesign/v2-feature-nav-v2`
- **Scope:** PrimaryNavV2, MobileDrawerNavV2, UtilityNavV2 per [NAVIGATION_MODEL.md](NAVIGATION_MODEL.md)
- **Files:** `src/components/v2/nav/{PrimaryNav,MobileDrawerNav,UtilityNav,SearchOverlay,Breadcrumbs}.tsx`, `src/app/(v2)/layout.tsx`
- **Dependencies:** PR 1, PR 2
- **LOC:** ~900

#### PR 4 — V2 footer

- **Branch:** `redesign/v2-feature-footer-v2`
- **Scope:** FooterV2 per [NAVIGATION_MODEL.md §4](NAVIGATION_MODEL.md)
- **Files:** `src/components/v2/nav/Footer.tsx`
- **Dependencies:** PR 3
- **LOC:** ~250

#### PR 5 — V2 layout wrapper

- **Branch:** `redesign/v2-feature-layout`
- **Scope:** App router layout for `/v2/*` paths (initially) or full layout swap (decision deferred)
- **Files:** `src/app/(v2)/layout.tsx`, `src/app/v2/layout.tsx`
- **Dependencies:** PR 3, PR 4
- **LOC:** ~200

### Phase B — Page templates (PRs 6-15)

#### PR 6 — Homepage v2 shell

- **Branch:** `redesign/v2-feature-homepage-shell`
- **Scope:** New homepage page render with sections per [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md), behind `/v2/` prefix
- **Files:** `src/app/v2/page.tsx`, `src/components/v2/homepage/{Hero,AudienceTiles,TrustBlock,ToolsBlock,RecentlyVerified,StatsBlock}.tsx`
- **Dependencies:** PR 5, PR 2
- **LOC:** ~1200

#### PR 7 — Listing detail v2

- **Branch:** `redesign/v2-feature-listing-detail-v2`
- **Scope:** New listing detail page per [PAGE_TEMPLATE_INVENTORY.md §7](PAGE_TEMPLATE_INVENTORY.md), behind `/v2/listing/[slug]`
- **Files:** `src/app/v2/listing/[slug]/page.tsx`, `src/components/v2/listing/{TrustBadgeBar,KeyFacts,SourceLinkCTA,VerificationMetadata,RelatedPrograms}.tsx`
- **Dependencies:** PR 5, PR 2
- **LOC:** ~1000

#### PR 8 — Browse v2 (decision-engine layout)

- **Branch:** `redesign/v2-feature-browse-v2`
- **Scope:** New browse page per [PAGE_TEMPLATE_INVENTORY.md §6](PAGE_TEMPLATE_INVENTORY.md), behind `/v2/usce` and `/v2/usce/[type]`
- **Files:** `src/app/v2/usce/page.tsx`, `src/app/v2/usce/[type]/page.tsx`, `src/components/v2/browse/{FilterSidebar,FilterChips,SortOptions,ListingCardGrid,Pagination,EmptyState}.tsx`
- **Dependencies:** PR 5, PR 2
- **LOC:** ~1200

#### PR 9 — Tools hub v2

- **Branch:** `redesign/v2-feature-tools-hub`
- **Scope:** Tools landing + redesign of compare, recommend, saved (existing)
- **Files:** `src/app/v2/tools/page.tsx`, `src/app/v2/tools/{compare,recommend,saved}/page.tsx`
- **Dependencies:** PR 5
- **LOC:** ~1000

#### PR 10 — Vertical landings (Match, Fellowship, Visa, Jobs)

- **Branch:** `redesign/v2-feature-vertical-landings`
- **Scope:** Skeletal landings for verticals not built deep yet, with honest "Coming soon" treatment
- **Files:** `src/app/v2/{match,fellowship,visa,jobs}/page.tsx`
- **Dependencies:** PR 5
- **LOC:** ~600

#### PR 11 — Resources vertical

- **Branch:** `redesign/v2-feature-resources`
- **Scope:** Resources landing, blog migration to `/v2/resources/blog`
- **Files:** `src/app/v2/resources/{page,blog/page,blog/[slug]/page,methodology/page,faq/page,img/page,glossary/page}.tsx`
- **Dependencies:** PR 5
- **LOC:** ~800

#### PR 12 — Institutions vertical

- **Branch:** `redesign/v2-feature-institutions`
- **Scope:** Institutions landing + claim flow scaffold (form only; no DB yet)
- **Files:** `src/app/v2/institutions/{page,claim/page}.tsx`, `src/components/v2/institutions/ClaimForm.tsx`
- **Dependencies:** PR 5
- **LOC:** ~600

#### PR 13 — Audience landings

- **Branch:** `redesign/v2-feature-audience-landings`
- **Scope:** `/for-img`, `/for-us-students`, `/for-residents`, `/for-fellows`, `/for-attendings` per [INFORMATION_ARCHITECTURE.md §4](INFORMATION_ARCHITECTURE.md)
- **Files:** `src/app/v2/for-{img,us-students,residents,fellows,attendings,new-attendings}/page.tsx`, content per audience
- **Dependencies:** PR 5
- **LOC:** ~1500 (curated content per audience)

#### PR 14 — Curated state landings (top 10)

- **Branch:** `redesign/v2-feature-state-landings`
- **Scope:** `/v2/usce/observerships/california` (and 9 more top-volume states), each curated per [PAGE_TEMPLATE_INVENTORY.md §8](PAGE_TEMPLATE_INVENTORY.md)
- **Files:** `src/app/v2/usce/observerships/[state]/page.tsx`, `content/state-pages/*.md` (curated content)
- **Dependencies:** PR 5, PR 8
- **LOC:** ~1500

#### PR 15 — Pathway guides (first 3)

- **Branch:** `redesign/v2-feature-pathway-guides`
- **Scope:** `/match/strategy/img`, `/visa/conrad-30`, `/fellowship/visa-friendly` per [PAGE_TEMPLATE_INVENTORY.md §10](PAGE_TEMPLATE_INVENTORY.md)
- **Files:** `src/app/v2/{match/strategy/img,visa/conrad-30,fellowship/visa-friendly}/page.tsx`, `content/pathway-guides/*.md`
- **Dependencies:** PR 5
- **LOC:** ~1500

### Phase C — Tools (PRs 16-19)

#### PR 16 — Visa decision helper

- **Branch:** `redesign/v2-feature-visa-decision-helper`
- **Scope:** Decision tree tool per [PAGE_TEMPLATE_INVENTORY.md §11](PAGE_TEMPLATE_INVENTORY.md), `/v2/tools/visa-decision-helper`
- **Files:** `src/app/v2/tools/visa-decision-helper/page.tsx`, `src/components/v2/tools/VisaDecisionTree.tsx`, `src/lib/v2/visa-decision-rules.ts`
- **Dependencies:** PR 9
- **LOC:** ~800

#### PR 17 — Checklist tool

- **Branch:** `redesign/v2-feature-checklist-tool`
- **Scope:** Career-stage checklist tool, `/v2/tools/checklist`
- **Files:** `src/app/v2/tools/checklist/page.tsx`, `src/components/v2/tools/ChecklistBuilder.tsx`, `src/lib/v2/checklist-templates.ts`
- **Dependencies:** PR 9
- **LOC:** ~700

#### PR 18 — Alerts preview redesign

- **Branch:** `redesign/v2-feature-alerts-preview`
- **Scope:** Redesign of `/tools/alerts` per v2 visual system; still no-send per [MESSAGING_AND_ALERTS_POLICY.md §12.1](MESSAGING_AND_ALERTS_POLICY.md)
- **Files:** `src/app/v2/tools/alerts/page.tsx`, `src/components/v2/tools/AlertsPreview.tsx`
- **Dependencies:** PR 9
- **LOC:** ~500

#### PR 19 — Save / compare polish

- **Branch:** `redesign/v2-feature-save-compare-polish`
- **Scope:** UX polish on existing save / compare flows
- **Files:** updates to existing tool components, plus v2 dashboard at `/v2/dashboard/{saved,compare}`
- **Dependencies:** PR 9
- **LOC:** ~600

### Phase D — Schema additions (PRs 20-23, each separately authorized)

These PRs go to `main` directly per [PLATFORM_V2_STRATEGY.md §7.1](PLATFORM_V2_STRATEGY.md), additive backward-compatible only, each requires explicit user authorization.

#### PR 20 — Schema: audience tags + career stage tags

- **Branch:** `phase4/schema-audience-career-tags`
- **Target:** `main`
- **Scope:** `Listing.audienceTags String[]`, `Listing.careerStageTags String[]` (additive, both nullable / default empty)
- **Files:** `prisma/schema.prisma`, `prisma/migrations/...`
- **Dependencies:** explicit user authorization per [PLATFORM_V2_STRATEGY.md §7.1](PLATFORM_V2_STRATEGY.md)
- **LOC:** ~150

#### PR 21 — Schema: source authority tier + monetization disclosure

- **Branch:** `phase4/schema-tier-monetization`
- **Target:** `main`
- **Scope:** `Listing.sourceAuthorityTier SourceAuthorityTier?`, `Listing.monetizationDisclosure MonetizationDisclosure @default(FREE_NON_COMMERCIAL)`
- **Files:** `prisma/schema.prisma`, `prisma/migrations/...`
- **Dependencies:** explicit user authorization
- **LOC:** ~200

#### PR 22 — Schema: EmailSubscription + EmailSendLog

- **Branch:** `phase4/schema-email-subscriptions`
- **Target:** `main`
- **Scope:** Per [MESSAGING_AND_ALERTS_POLICY.md §13](MESSAGING_AND_ALERTS_POLICY.md)
- **Files:** `prisma/schema.prisma`, `prisma/migrations/...`
- **Dependencies:** explicit user authorization
- **LOC:** ~250

#### PR 23 — Schema: InstitutionClaim + SponsoredPlacement

- **Branch:** `phase4/schema-institution-monetization`
- **Target:** `main`
- **Scope:** Per [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md). Phase C+ — defer until institution claim flow is queued.
- **Files:** `prisma/schema.prisma`, `prisma/migrations/...`
- **Dependencies:** explicit user authorization (deferred)
- **LOC:** ~300

### Phase E — Backend wiring (PRs 24-27)

These PRs target `redesign/platform-v2` and consume the schema additions from Phase D once those land on main + are rebased into v2.

#### PR 24 — Audience-aware filtering

- **Branch:** `redesign/v2-backend-audience-filtering`
- **Scope:** Filter logic for `?audience=img` etc. on browse/vertical landings
- **Dependencies:** PR 20 merged on main + rebased into v2; PR 8
- **LOC:** ~400

#### PR 25 — Source-tier display

- **Branch:** `redesign/v2-backend-source-tier-display`
- **Scope:** Render `Listing.sourceAuthorityTier` in listing detail
- **Dependencies:** PR 21 merged on main + rebased; PR 7
- **LOC:** ~300

#### PR 26 — Email subscription scaffolding (no real send)

- **Branch:** `redesign/v2-backend-email-scaffolding`
- **Scope:** Subscription form + double-opt-in flow + preference center, all without real send wiring (preview-only digest endpoint stub)
- **Dependencies:** PR 22 merged on main + rebased; PR 18
- **LOC:** ~800

#### PR 27 — Sponsored placement skeleton

- **Branch:** `redesign/v2-backend-sponsored-skeleton`
- **Scope:** Sponsored badge + ranking protection + admin tooling for sponsorships (no actual sponsorship contracts yet)
- **Dependencies:** PR 23 merged on main + rebased (deferred); PR 8
- **LOC:** ~600

### Phase F — Pre-launch (PRs 28-30)

#### PR 28 — Sitemap + robots regeneration

- **Branch:** `redesign/v2-feature-sitemap-rebuild`
- **Scope:** New sitemap generator that includes the v2 URL set per [INDEXATION_AND_URL_POLICY.md §5](INDEXATION_AND_URL_POLICY.md)
- **Dependencies:** PR 6 through PR 15 (all v2 page templates)
- **LOC:** ~400

#### PR 29 — Redirect map

- **Branch:** `redesign/v2-feature-redirects`
- **Scope:** `next.config.ts` redirects for old URLs → new URLs per [INDEXATION_AND_URL_POLICY.md §9.2](INDEXATION_AND_URL_POLICY.md)
- **Dependencies:** PR 6 through PR 15 (URLs need to exist as redirect destinations)
- **LOC:** ~200

#### PR 30 — JSON-LD wiring

- **Branch:** `redesign/v2-feature-json-ld`
- **Scope:** Per-template JSON-LD per [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md) and [INDEXATION_AND_URL_POLICY.md §6](INDEXATION_AND_URL_POLICY.md)
- **Dependencies:** PR 6 through PR 15
- **LOC:** ~600

### Phase G — Launch event (PR 31)

#### PR 31 — V2 launch (the squash merge)

- **Branch:** `redesign/platform-v2` → `main`
- **Scope:** Single squash commit containing all v2 work (PRs 1-19, PRs 24-27, PRs 28-30 collapsed)
- **Dependencies:** all 7 readiness gates from [PLATFORM_V2_STRATEGY.md §17.3](PLATFORM_V2_STRATEGY.md) green
- **Deploy:** Vercel auto-deploys ~60-90 seconds after merge
- **Rollback:** `git revert <merge-sha> -m 1` per [PLATFORM_V2_STRATEGY.md §20.3](PLATFORM_V2_STRATEGY.md)

---

## 3. Total estimate

- 30 sub-PRs in `redesign/platform-v2-*` branches.
- 4 schema PRs to `main` (Phase D, each authorized separately).
- 1 launch PR (Phase G).
- Total estimated LOC: ~17,000 (split across ~32 PRs).

If we maintain the per-PR average of 500 LOC (manageable single-session review), the v2 build is ~32 sessions of focused implementation work — roughly aligns with the 35-day aggressive timeline at ~1 PR / day or the 10-week realistic timeline at 3-4 PRs / week.

---

## 4. Sequencing rules

### 4.1 Strict ordering

- PR 1 (design system) blocks all visual PRs.
- PR 5 (layout wrapper) blocks all page template PRs.
- Schema PRs (Phase D) must merge to main + rebase before Phase E backend wiring.
- Sitemap + redirects + JSON-LD (Phase F) must precede launch.

### 4.2 Parallel-safe

- After PR 5: PRs 6-15 (page templates) can proceed in parallel sub-branches (different files, no overlap).
- After PR 9: PRs 16-19 (tools) can proceed in parallel.
- After Phase E PRs land in v2: Phase F (pre-launch) can begin.

### 4.3 Schema timing

Phase D schema PRs to main are authorized one at a time. Default order:
1. PR 20 (audience tags) — earliest need (PR 24 audience filtering depends).
2. PR 21 (source tier + monetization) — needed for listing detail surface (PR 25).
3. PR 22 (email subscriptions) — only when alerts preview is queued for real-send authorization.
4. PR 23 (institution claim + sponsorship) — Phase D, deferred.

---

## 5. Open decisions

1. **`/v2/*` URL prefix during build vs domain swap at launch.** Current proposal: `/v2/*` prefix in branch (avoids URL collision with main); at launch, `/v2/*` is rewritten to root via `next.config.ts` redirects + new sitemap. Alternative: merge to feature-flagged routes. Recommend: `/v2/*` prefix.
2. **Per-PR Vercel preview vs branch-only preview.** Each sub-branch PR gets its own Vercel preview by default. Recommend: keep default (helpful for visual review).
3. **Whether to use feature flags.** A feature-flag library (e.g. GrowthBook) lets us merge v2 to main behind flags and ship gradually. Recommend: defer; the Lane 1 / Lane 2 separation already provides isolation.
4. **PR review process.** User reviews every PR (current default) vs auto-merge for some PR types (e.g. design system tokens). Recommend: user reviews every v2 PR; the `redesign/platform-v2` branch is the "stage" — merging into it is the cheap step; merging the launch PR is the expensive step.
5. **PR numbering.** This doc uses PR 1-31 internally. Actual GitHub PR numbers will be different (PR 30+ is reserved for the next opened PR). Recommend: use this doc's numbering as internal reference; cross-link to actual PR numbers as they open.
6. **Whether to split content PRs from layout PRs.** PR 13 (audience landings) bundles 5 audience landings + curated content. Could split to 5 PRs. Recommend: bundle (faster review for related work; fits the "single concern" rule because all 5 are audience landings).
7. **Whether to defer skeletal landings.** PR 10 (Match/Fellowship/Visa/Jobs landings, skeletal) is essential for the 8-vertical nav promise. Recommend: keep — required to honestly expose the eight verticals at launch.
8. **Whether to launch with audience landings.** PR 13 is significant content investment. Recommend: launch with 3 (img, us-students, residents); add fellows + attendings + new-attendings post-launch.
9. **Whether to launch with curated state pages.** PR 14 = 10 curated states. Significant content investment. Recommend: launch with top 5 (CA, NY, TX, FL, IL); add 5 more post-launch.
10. **Whether to launch with pathway guides.** PR 15 = 3 pathway guides. Recommend: launch with 1 (`/match/strategy/img` is the highest-leverage); add others post-launch.

---

## 6. Future PRs (Phase H+, post-launch)

Sketch only. Each requires its own planning cycle.

- Recruiter directory (Phase C+)
- Attorney directory (Phase C+)
- Contract review directory (Phase D)
- Financial professional directory (Phase D)
- Real send wiring (when [MESSAGING_AND_ALERTS_POLICY.md §13.5](MESSAGING_AND_ALERTS_POLICY.md) prerequisites met)
- First sponsorship implementation (when [TRUST_AND_MONETIZATION_POLICY.md §13](TRUST_AND_MONETIZATION_POLICY.md) launch process complete)
- First paid claim flow (Phase C+)
- Full marketplace (Phase D)
- Push notifications (Phase D+)
- SMS (Phase D+)
- i18n / Spanish (Phase D+)

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
- risk level:          ZERO — internal PR breakdown doc
```

## /career impact

None.

## Schema impact

None directly. PRs 20-23 surface schema needs; each requires explicit user authorization.

## Authorization impact

None. Documenting a PR sequence is not authorization to ship any of those PRs.
