# USCEHub v2 — Existing Surface Inventory

**Doc status:** Binding factual reference. Updated when `main` adds/removes a public surface.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md).
**Authored:** 2026-04-29 (per [V2_PLANNING_AUDIT.md](V2_PLANNING_AUDIT.md) §10.1).

---

## 1. Why this doc exists

PR #30's planning batch was drafted before fully inventorying the existing codebase. The audit ([V2_PLANNING_AUDIT.md](V2_PLANNING_AUDIT.md) §3.1, §5) found 22+ live routes, 32 schema models, two crons, and pre-built infrastructure that other v2 docs treated as "future."

This file is the **factual ground truth** about what exists today. Every other v2 planning doc must defer to this inventory when there is a conflict between "what we're proposing" and "what's already built."

**Rule:** before any v2 implementation PR, the implementer reads this file first, then [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md), then the relevant per-area doc. If a v2 doc says "future" for something this inventory marks "live," the inventory wins; the v2 doc has drifted.

---

## 2. Public routes (live on `main`)

### 2.1 Top-level public routes

| Route | Purpose | v2 disposition |
|---|---|---|
| `/` | Homepage (Verified U.S. Clinical Experience for IMGs framing today) | **Redesign** in v2 (per [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md)) |
| `/about` | About page (`AboutPage` JSON-LD) | **Audit before v2** — content quality + IMG framing |
| `/about/editorial-policy` | Editorial policy | **Audit before v2** |
| `/about/methodology` | About-page methodology variant | **Reconcile with `/methodology`** — likely duplicate |
| `/about/source-policy` | Source policy | **Audit before v2** |
| `/admin/*` | Admin tooling (auth-gated; brands/listings/users/messages/etc.) | **Keep as-is**; not in user IA |
| `/auth/{signin,signup}` | Auth flow | **Keep as-is** |
| `/blog` + `/blog/[slug]` | Blog index + post (`Article` JSON-LD) | **Redesign** in v2 (per [PAGE_TEMPLATE_INVENTORY.md §14](PAGE_TEMPLATE_INVENTORY.md)) |
| `/browse` | Browse all listings | **Redesign** in v2 to decision-engine layout |
| `/community` | Community page | **Audit before v2** — referenced by `/community/suggest-program`, links from `/admin` |
| `/community/suggest-program` | User-suggest-a-program flow | **Audit before v2** — confirm submission flow + moderation |
| `/compare` | Listing compare | **Redesign** as `/tools/compare` in v2 |
| `/contact` | Contact page (`ContactPage` JSON-LD) | **Keep as-is** at v2 launch; refresh post-launch |
| `/contact-admin` | Contact-admin variant | **Reconcile with `/contact`** — likely consolidate |
| `/dashboard/*` | Logged-in dashboard (saved/compare/applications/reviews/profile/settings) | **Redesign** in v2 |
| `/disclaimer` | Legal disclaimer ("Last updated: March 2026") | **Reconcile with proposed `/disclosure`** ([V2_PLANNING_AUDIT.md §10.8](V2_PLANNING_AUDIT.md)) — see §6 below |
| `/faq` | FAQ page | **Redesign** in v2 (under `/resources/faq` per IA proposal) |
| `/for-institutions` | Institution landing | **Redesign** as `/institutions` in v2; coordinate with `/poster/*` (§3.3) |
| `/how-it-works` | Explainer page | **Audit before v2** — content overlap with `/methodology` |
| `/img-resources` | IMG resources hub | **Redesign** as `/resources/img` in v2 |
| `/listing/[id]` | Listing detail | **Redesign** as `/usce/[listing-slug]` in v2 |
| `/methodology` | Methodology page (`BreadcrumbSchema`) | **Redesign** as `/resources/methodology` in v2 |
| `/observerships` + `/observerships/[state]` + `/observerships/specialty/[specialty]` | Observership index + state + specialty pages | **Redesign** as `/usce/observerships` + `/usce/observerships/[state]` + `/usce/[specialty]` in v2 (passing §9 quality gate) |
| `/poster/*` | **Whole institutional onboarding surface** (5 subroutes) — see §2.2 | **Reconcile** with proposed `/institutions/claim` ([V2_PLANNING_AUDIT.md §5.2](V2_PLANNING_AUDIT.md)) |
| `/privacy` | Privacy policy | **Audit + refresh before v2** |
| `/recommend` | Listing recommendation tool | **Redesign** as `/tools/recommend` in v2 |
| `/residency` + 11 subroutes (§2.3) | **Whole "Residency Command Center"** | **Reconcile** with proposed `/match` and `/fellowship` verticals (§4 below) |
| `/resources` | "Recommended Tools & Resources for IMGs" | **Reconcile** with proposed `/resources` vertical (URL collision; needs migration plan) |
| `/terms` | Terms of service | **Audit + refresh before v2** |
| `/tools` + `/tools/cost-calculator` | Tools landing + cost calculator (`WebApplication` JSON-LD on cost-calculator) | **Already partial** — IA proposes `/tools/{compare,recommend,saved,alerts,checklist,visa-decision-helper}` — reuse `/tools` URL prefix |

### 2.2 `/poster/*` (institutional onboarding flow)

```
/poster/applications      — institution view of applications received
/poster/listings          — institution-managed listings
/poster/organization      — organization profile
/poster/settings          — institution-side settings
/poster/verification      — institution verification flow
```

**Backed by Prisma:** `PosterProfile` model (existing) + `Organization` model + role check `UserRole.POSTER`.

**Implication for v2:** [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md) §6.3-6.5 propose "free claim flow" + "paid claim flow" + new `InstitutionClaim` model. **The `/poster/*` flow already serves the "free claim" use case.** Decision needed: extend `/poster/*` or replace with new `/institutions/claim` flow + new `InstitutionClaim` model? Replacement risks duplicating work; extension respects existing pattern.

### 2.3 `/residency/*` (Residency Command Center)

```
/residency                — vertical landing (live; "Residency Command Center" framing)
/residency/boards         — board exam prep
/residency/community      — community for residents
/residency/fellowship     — fellowship database (visa-sponsorship, match-participation data)
/residency/fellowship/guide — fellowship strategy guide
/residency/finances       — physician finance / disability / mortgage content
/residency/moonlighting   — moonlighting guidance
/residency/post-match     — post-match resources
/residency/procedures     — procedures content
/residency/research       — research content
/residency/resources      — resident-specific resources
/residency/salary         — salary content
/residency/survival       — survival guides
```

**Backed by:** custom layout (`src/app/residency/layout.tsx`) + custom nav (`residency-nav.tsx`). Self-contained sub-site within USCEHub.

**Implication for v2:** [INFORMATION_ARCHITECTURE.md §3.3](INFORMATION_ARCHITECTURE.md) proposes `/match`, `/fellowship`, `/jobs`, `/visa` as new top-nav verticals. **Significant overlap with `/residency/*`.** Decision needed:

- (a) Keep `/residency/*` as canonical resident-side surface; surface in v2 nav as "Residency"; defer `/match`/`/fellowship` URLs to post-launch.
- (b) Migrate `/residency/*` → `/match/*` + `/fellowship/*` with 301 redirects.
- (c) Keep both URL trees with cross-canonical link rels.

This is a **blocking decision** for the v2 IA.

### 2.4 `/career/*` (preserved per RULES.md §2)

```
/career                   — career hub
/career/alerts, /career/attorneys, /career/citizenship, /career/community, /career/compare-states,
/career/contract, /career/credentialing, /career/ecfmg, /career/employers, /career/greencard,
/career/h1b, /career/h4-spouse, /career/interview, /career/jobs, /career/licensing,
/career/loan-repayment, /career/locums, /career/malpractice, /career/offers, /career/salary,
/career/sponsors, /career/state-compare, /career/taxes, /career/visa-bulletin, /career/visa-journey,
/career/waiver, /career/waiver-problems
```

**Backed by:** `WaiverJob`, `WaiverState`, `Lawyer` Prisma models + `verify-jobs` cron + `WAIVER_JOBS` data + `EMPLOYER_URLS` (in stash) + `LCA_DATA`.

**Implication for v2:** [RULES.md §2](../codebase-audit/RULES.md) hard protection list — **never delete/rename/restructure without explicit user approval.** v2 IA proposes new `/jobs/*` + `/visa/*` URL trees; the documented plan is **coexistence** (new URLs alongside preserved `/career/*`). No 301s away from `/career/*`.

### 2.5 Sitemap-included routes (auto-generated)

[`src/app/sitemap.ts`](../../src/app/sitemap.ts) currently emits sitemap entries for:
- All static pages above
- All US states (per `src/lib/utils.US_STATES`) → `/observerships/[state]`
- All specialties (per `src/lib/utils.SPECIALTIES`) → `/observerships/specialty/[specialty]`
- All blog posts (per `src/lib/blog-data.BLOG_POSTS`) → `/blog/[slug]`
- All waiver states (per `src/lib/waiver-data.WAIVER_STATES`) → `/career/waiver/[state]`

**Implication for v2:** [INDEXATION_AND_URL_POLICY.md §9](INDEXATION_AND_URL_POLICY.md) proposes a "no template-only programmatic page in sitemap" quality gate. Currently:
- 50 state observership pages: quality unaudited
- N specialty pages: quality unaudited
- 50 waiver state pages: preserved per RULES.md but quality unaudited

[V2_PLANNING_AUDIT.md §8.3](V2_PLANNING_AUDIT.md) recommends grandfathering existing entries and applying §9 only to new ones.

---

## 3. API routes (live on `main`)

### 3.1 Public + auth API endpoints

```
/api/admin/{flags,listings,messages,posters,reviews,users,activity,verification-queue}
/api/applications
/api/auth/{signin,signup,reset,callback,...}
/api/compare
/api/compared
/api/cron/verify-jobs       — daily 0 8 * * * UTC
/api/cron/verify-listings   — daily 0 9 * * * UTC
/api/flags
/api/listings
/api/my-reviews
/api/organizations
/api/poster-applications
/api/poster-listings
/api/poster-profile
/api/profile
/api/programs/stats
/api/recommend
/api/reviews
/api/saved
```

### 3.2 Two crons (Hobby cap)

| Cron | Path | Schedule | Purpose | Doc coverage |
|---|---|---|---|---|
| Listings | `/api/cron/verify-listings` | `0 9 * * *` UTC | Verify program source URLs | ✅ [DATA_FRESHNESS_SLA.md](DATA_FRESHNESS_SLA.md) |
| Jobs | `/api/cron/verify-jobs` | `0 8 * * *` UTC | Verify `WAIVER_JOBS` source URLs | ❌ **Missing freshness story** ([V2_PLANNING_AUDIT.md §3.2](V2_PLANNING_AUDIT.md)) |

**Adding a 3rd cron requires Pro plan upgrade or replacing one of the existing crons.** Per [RULES.md](../codebase-audit/RULES.md) §4 + audit §10.6.

---

## 4. Schema models (live in `prisma/schema.prisma`)

### 4.1 Existing models (32)

```
User, ApplicantProfile, PosterProfile, Organization,
Listing, SavedListing, ComparedListing, Application, Review,
FlagReport, AdminMessage, AdminActionLog,
FellowshipProgram,
CommunityPost, CommunityComment,
WaiverState, WaiverJob, Lawyer,
DataVerification
```

(plus enums: `UserRole`, `ListingType`, `ListingStatus`, `ListingFormat`, `ApplicationStatus`, `VerificationStatus`, `ModerationStatus`, `FlagStatus`, `JourneyPhase`, `SourceType`, `WaiverType`, `LinkVerificationStatus`, `FlagKind`)

### 4.2 v2 proposes adding (per [V2_PR_BREAKDOWN.md](V2_PR_BREAKDOWN.md) Phase D)

| Proposed | Existing overlap | Audit-before-build conclusion |
|---|---|---|
| `Listing.audienceTags`, `Listing.careerStageTags` | none | Additive, can layer (PR 20) |
| `Listing.sourceAuthorityTier` | none | Additive (PR 21) |
| `Listing.monetizationDisclosure` | none | Additive (PR 21) |
| `EmailSubscription`, `EmailSendLog` | none | Additive (PR 22) — gated by [MESSAGING_AND_ALERTS_POLICY.md §2.1](MESSAGING_AND_ALERTS_POLICY.md) prerequisites |
| `InstitutionClaim` | **`PosterProfile` + `Organization` already exist** | **Reconcile first** — does claim flow extend `PosterProfile` or introduce a new model? |
| `SponsoredPlacement` | none | Additive (PR 23) — Phase D, deferred |

### 4.3 Reviews / Community / Application surfaces

[V2_PLANNING_AUDIT.md §K.5, §K.6, §K.7](V2_PLANNING_AUDIT.md) flagged: `Review`, `CommunityPost`, `CommunityComment`, `Application`, `AdminMessage`, `AdminActionLog` exist but are **not addressed** in any v2 doc.

**Implication:**
- `Review` model + `/dashboard/reviews` UI — FTC review-handling per [TRUST_AND_MONETIZATION_POLICY.md §4.5](TRUST_AND_MONETIZATION_POLICY.md) needs to map to existing review schema, not introduce a new one.
- `CommunityPost` + `/community/*` — moderation policy per Master Blueprint §6 has docs but actual flow exists; v2 must reconcile.
- `Application` model + `/api/applications` + `/dashboard/applications` — homepage wireframe says "soften 'submit your application through the platform' if not actually true" ([HOMEPAGE_V2_WIREFRAME.md §12](HOMEPAGE_V2_WIREFRAME.md)). The model exists; whether the flow is real-functional or aspirational is a **factual question that needs an audit**.

---

## 5. Pre-built infrastructure

### 5.1 [`next.config.ts`](../../next.config.ts)

Already implements:
- `X-Robots-Tag: noindex, nofollow` for non-`uscehub.com` hosts (preview noindex)
- HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains`)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- One redirect: `/freida` → `/img-resources` (301)

**Implication:** [INDEXATION_AND_URL_POLICY.md §8.4](INDEXATION_AND_URL_POLICY.md) "v2 must additionally emit preview noindex" — **already implemented**. v2 must **not regress** this.

### 5.2 [`public/robots.txt`](../../public/robots.txt)

Active rules:
- `User-agent: *` allow `/`, sitemap pointer
- Disallow: `/admin`, `/api/`, `/dashboard/`, `/poster/`, `/auth/`
- Block-list: `Scrapy`, `HTTrack`, `SiteSnagger`, `WebCopier`, `Wget`, **`Bytespider`** (TikTok/ByteDance), **`PetalBot`** (Huawei)

**Implication:** [INDEXATION_AND_URL_POLICY.md §12.4](INDEXATION_AND_URL_POLICY.md) proposed "allow all AI crawlers" — **conflicts** with the existing Bytespider/PetalBot blocks. **Open decision.**

### 5.3 [`src/app/sitemap.ts`](../../src/app/sitemap.ts)

Dynamic Next.js sitemap that pulls from:
- Static page list
- `US_STATES` (50 entries) + `SPECIALTIES`
- `BLOG_POSTS`
- `WAIVER_STATES`

**Implication:** more comprehensive than [INDEXATION_AND_URL_POLICY.md §5](INDEXATION_AND_URL_POLICY.md) assumed. Existing entries grandfathered per [V2_PLANNING_AUDIT.md §8.3](V2_PLANNING_AUDIT.md) recommendation.

### 5.4 [`src/lib/site-metrics.ts`](../../src/lib/site-metrics.ts) (post-PR #25 merged)

After PR #25 merge: `SITE_METRICS.listingsWithOfficialSource = 156`, `SITE_METRICS_DISPLAY.listingsWithOfficialSource = "156 programs with an official source on file"`. No "verified" claim in display strings.

### 5.5 Email infrastructure

- `Resend` SDK in `package.json` dependencies
- No real-send wiring to user-facing email yet
- `scripts/preview-verified-listings-digest.ts` (PR #21) — **no-send preview only**
- DNS (SPF/DKIM/DMARC) for sender domain: **not configured** (per [MESSAGING_AND_ALERTS_POLICY.md §8](MESSAGING_AND_ALERTS_POLICY.md) prerequisites)

### 5.6 Build / CI

- Vercel deploys `main` to production within ~60-90s
- Vercel deploys preview per PR (401-gated by SSO on Hobby)
- No GitHub Actions test gates (only Vercel checks)
- `npm run build`, `npm run lint`, `npx tsc --noEmit` available

### 5.7 Auth

- NextAuth (per existing `/api/auth` routes)
- `UserRole` enum: `APPLICANT`, `POSTER`, `ADMIN`
- Session check in admin layout + poster layout

---

## 6. Naming collisions / reconciliation list

These are routes / concepts where v2 docs introduce a new name conflicting with an existing surface:

| Existing | v2 proposed | Resolution |
|---|---|---|
| `/disclaimer` | `/disclosure` (per [TRUST_AND_MONETIZATION_POLICY.md §12](TRUST_AND_MONETIZATION_POLICY.md)) | **Open decision.** Recommend: keep `/disclaimer` for general legal disclaimer; add `/disclosure` only for monetization-state surface (different content, different purpose). |
| `/about/methodology` | `/methodology` (existing top-level) | **Open decision.** Recommend: 301 `/about/methodology` → `/methodology`. |
| `/contact` + `/contact-admin` | single contact surface | **Open decision.** Recommend: keep `/contact` (user); rename `/contact-admin` → `/admin/contact-tickets` or similar. |
| `/recommend` | `/tools/recommend` | Already in IA decisions — 301 plan. |
| `/compare` | `/tools/compare` | Already in IA decisions — 301 plan. |
| `/blog` | `/resources/blog` | Already in IA decisions — 301 with sitemap rebuild. |
| `/observerships/*` | `/usce/observerships/*` | Already in IA decisions — 301. |
| `/listing/[id]` | `/usce/[listing-slug]` | Already in IA decisions — 301 + slug derivation. |
| `/residency/fellowship` | `/fellowship/*` | **Blocking IA decision.** See §2.3. |
| `/residency/*` | `/match/*` (resident-stage match content) | **Blocking IA decision.** |
| `/for-institutions` | `/institutions` | Already in IA decisions — 301. |
| `/img-resources` | `/resources/img` | Already in IA decisions — 301. |
| `/faq` | `/resources/faq` | Already in IA decisions — 301. |

---

## 7. Surfaces v2 docs ignored entirely (by section)

Cross-reference to where each lives in this inventory:

| Surface | Inventory section | v2 docs missing | Severity |
|---|---|---|---|
| `/about` and 3 subroutes | §2.1 | IA, NAV, Templates, Wireframe | medium |
| `/community` + suggest-program | §2.1 | IA, NAV, Templates | high (user-generated content needs moderation policy) |
| `/contact-admin` | §2.1 | IA, NAV | low |
| `/disclaimer` | §2.1 | only mentioned in audit (§6 of this inventory) | medium (legal pages must be canonical) |
| `/how-it-works` | §2.1 | IA, NAV, Wireframe | low |
| `/poster/*` (5 routes) | §2.2 | TRUST_AND_MONETIZATION (proposes new InstitutionClaim) | high |
| `/residency/*` (12 routes) | §2.3 | IA proposes Match/Fellowship without acknowledging | high |
| `/tools/cost-calculator` | §2.1 | IA §5.6 says "future" | medium |
| `/recommend` | §2.1 | IA mentions but as future migration | low |
| `verify-jobs` cron | §3.2 | DATA_FRESHNESS_SLA only addresses listings | high |
| `Review` model + `/dashboard/reviews` | §4.3 | TRUST_AND_MONETIZATION § review-handling doesn't map | medium |
| `Application` model + `/api/applications` | §4.3 | HOMEPAGE flag without resolution | medium |
| Existing security headers + preview noindex | §5.1 | INDEXATION says v2 must add | low (just acknowledge) |

---

## 8. Audit-before-build classification (binding)

Per the audit's recommendation that "first implementation PR must audit existing routes/components before design tokens" ([V2_PLANNING_AUDIT.md §10](V2_PLANNING_AUDIT.md)):

### 8.1 MUST audit before any v2 implementation begins

1. `/poster/*` flow + `PosterProfile` model — does the existing flow satisfy our "free claim" intent or do we need a new flow?
2. `/residency/*` namespace — what's the relationship to v2 Match + Fellowship verticals?
3. `Application` model + `/api/applications` + `/dashboard/applications` — real-functional or aspirational? affects homepage copy.
4. `Review` model + `/dashboard/reviews` + review surfaces in listing detail — current state + FTC implications.
5. `CommunityPost` + `/community/*` + moderation policy alignment with Master Blueprint §6.
6. `/recommend` tool implementation — what algorithm? what data? methodology page exists?
7. `/tools/cost-calculator` — how does it derive cost? sources cited per [PAGE_TEMPLATE_INVENTORY.md §11](PAGE_TEMPLATE_INVENTORY.md)?

### 8.2 MUST audit before launch event

8. Sitemap entries against §9 quality gate (state, specialty, blog, waiver state pages — all auto-generated)
9. Stale "verified" / "largest" claims in `src/app/page.tsx`, `src/app/layout.tsx`, `/observerships/[state]/page.tsx`, `/observerships/specialty/[specialty]/page.tsx`
10. Privacy / Terms / Disclaimer pages — last-updated dates accurate?
11. JSON-LD coverage on listing detail pages (`EducationalOccupationalProgram` schema)

### 8.3 Can audit during build

12. Auth flow (signin/signup/reset) edge cases
13. `verify-jobs` cron behavior + audit trail
14. Admin tooling depth beyond `/admin/verification-queue`

### 8.4 Can audit post-launch

15. Bundle size + perf baseline
16. Accessibility (axe-core sweep)
17. Cross-browser parity

---

## 9. What this inventory does NOT do

- Does not authorize **any** v2 implementation — see [PLATFORM_V2_STRATEGY.md §5](PLATFORM_V2_STRATEGY.md).
- Does not modify any existing route, schema, cron, sitemap, robots, canonical, or metadata.
- Does not propose new routes — proposals live in [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md).
- Does not propose new schema — proposals live in [V2_PR_BREAKDOWN.md](V2_PR_BREAKDOWN.md) Phase D.
- Does not resolve naming collisions — those are open decisions in [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md).

---

## 10. Update protocol

This inventory must stay accurate. When `main` adds or removes a public surface:

1. The PR adding/removing the surface updates this inventory's relevant section.
2. The PR's body cross-references the inventory update.
3. If the change affects an open decision in [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md), update the register too.

If this inventory drifts from `main` (e.g. someone adds a new route without updating), future agents will redrift the v2 docs. The audit cycle is the cure; update the inventory is the preventive.

---

## SEO impact

```
SEO impact:
- URLs changed:        none (inventory doc only)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal inventory doc
```

## /career impact

None. `/career/*` and `/careers/*` preserved unchanged per [RULES.md](../codebase-audit/RULES.md) §2 — listed in §2.4 only as factual reference.

## Schema impact

None. §4 enumerates existing schema for cross-reference; no proposed changes.

## Authorization impact

None. Documenting reality is not authorization to change reality.
