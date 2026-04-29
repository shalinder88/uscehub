# USCEHub v2 — Pre-Launch QA Checklist

**Doc status:** Binding rule (once approved). **5 open decisions in [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md).**

> **Revision notice (2026-04-29 audit):** Original checklist missed coverage for several existing surfaces. Added below in §16-§24: auth flow QA, `/poster/*` flow QA, `Application` flow QA, `Review` flow QA, `/community/*` flow QA, deeper `/admin/*` QA beyond verification queue, **verify-jobs cron** QA, `/disclaimer` + `/privacy` + `/terms` "Last updated" freshness, and `/accessibility` page existence (currently missing — must be created before launch per §15).

**Status:** v2 planning doc. Comprehensive QA checklist for before the v2 launch event (PR 31 in [V2_PR_BREAKDOWN.md](V2_PR_BREAKDOWN.md)).
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md).
**Authored:** 2026-04-29.

---

## 1. Purpose

A single, exhaustive QA checklist to run before the v2 launch event. Every section is a hard gate — if any item fails, launch defers until resolved. This is not an aspirational nice-to-have list; this is the binding pre-launch criteria.

### 1.1 How to use

- Run on the `redesign/platform-v2` branch's preview deployment, not production.
- Each item: status (PASS / FAIL / N/A), notes, evidence (screenshot / link / output).
- Save the completed checklist to `docs/platform-v2/launches/v2-launch-{date}.md` as the launch record.

---

## 2. Trust & verification

- [ ] Cron health check (`scripts/check-verify-listings-cron.ts`) PASS for ≥ 4 consecutive days
- [ ] No cron-attributed `SOURCE_DEAD` / `PROGRAM_CLOSED` / `NO_OFFICIAL_SOURCE` writes (per [PLATFORM_V2_STRATEGY.md §2.2](PLATFORM_V2_STRATEGY.md))
- [ ] Public claim alignment per [DATA_FRESHNESS_SLA.md §6](DATA_FRESHNESS_SLA.md): if homepage says "verified," ≥ 80% of listings are Current+Aging
- [ ] Trust badge legend matches taxonomy in [PLATFORM_V2_STRATEGY.md §4.4](PLATFORM_V2_STRATEGY.md)
- [ ] Listing detail surfaces full verification metadata per [PAGE_TEMPLATE_INVENTORY.md §7.3](PAGE_TEMPLATE_INVENTORY.md)
- [ ] "Report broken link" button visible on every listing card and detail page
- [ ] Admin queue (`/admin/verification-queue`) functional + accessible to admin

---

## 3. Public copy

- [ ] No "Verified Programs" overclaim (use "Programs with Official Source" if freshness threshold not met)
- [ ] No "best" / "leading" / "premier" / "top" undefendable superlatives
- [ ] No "trusted by thousands" without proof
- [ ] No "submit your application through the platform" if app-tracking not real
- [ ] No fake testimonials
- [ ] No "AI-powered" badges (if no AI in production)
- [ ] All blog body references to "207+ verified programs" replaced with conservative language (PR #27 baseline)
- [ ] All metadata descriptions match conservative trust language
- [ ] Footer copyright + tagline accurate ("Free for physicians and trainees.")

---

## 4. Information architecture

- [ ] All 8 nav items resolve to 200 pages (USCE, Match, Fellowship, Jobs, Visa, Tools, Resources, For Institutions)
- [ ] Skeletal verticals (per [INFORMATION_ARCHITECTURE.md §8.2](INFORMATION_ARCHITECTURE.md)) display honest "Coming soon" framing
- [ ] No nav item links to a 404 or 500
- [ ] Audience landings (`/for-img`, `/for-us-students`, `/for-residents`, `/for-fellows`, `/for-attendings`) all resolve and have ≥ 200 words curated content
- [ ] Listing detail URLs use new slug format (`/usce/{id}-{kebab-title}`)
- [ ] Old URLs redirect to new URLs (test top 20 from GSC)
- [ ] All redirect chains resolve in ≤ 1 hop (no A→B→C)
- [ ] `/career` and `/careers` route trees unchanged (per [RULES.md](../codebase-audit/RULES.md) §2)

---

## 5. URL & indexation

- [ ] Sitemap generated, well-formed XML, contains every page from [INDEXATION_AND_URL_POLICY.md §4.1](INDEXATION_AND_URL_POLICY.md)
- [ ] Sitemap excludes every page from [INDEXATION_AND_URL_POLICY.md §4.2](INDEXATION_AND_URL_POLICY.md)
- [ ] Robots.txt is permissive (allows all crawlers, blocks `/admin/`, `/api/`, `/dashboard/`, `/search?`)
- [ ] Every indexable page has a `<link rel="canonical">` pointing to its canonical URL
- [ ] Faceted filter URLs (`?state=X`, `?audience=img`, etc.) emit `<meta robots content="noindex, follow">`
- [ ] Search results page emits `noindex, follow`
- [ ] Logged-in `/dashboard/*` emits `noindex, nofollow`
- [ ] Admin `/admin/*` emits `noindex, nofollow`
- [ ] Preview deployments (any URL on `*.vercel.app` or `*-preview.uscehub.com`) emit `X-Robots-Tag: noindex, nofollow`
- [ ] No URL contains uppercase or trailing slash
- [ ] All URLs use https only (no mixed content)

---

## 6. JSON-LD

- [ ] Homepage emits `Organization` schema
- [ ] Homepage emits `WebSite` schema with `SearchAction`
- [ ] Every page level 2+ emits `BreadcrumbList`
- [ ] Listing detail emits `EducationalOccupationalProgram` schema
- [ ] Pathway guide / blog post emits `Article` (or `MedicalScholarlyArticle`)
- [ ] FAQ pages emit `FAQPage` schema
- [ ] Tool pages emit `WebApplication` or `SoftwareApplication`
- [ ] All JSON-LD blocks validate (run `npx schema-dts-gen --validate` or equivalent)
- [ ] No false citations (every `Citation` block actually used in page content)

---

## 7. Performance

- [ ] Homepage LCP < 2.5s on simulated mobile (Chrome DevTools throttling: Slow 3G)
- [ ] Homepage INP < 200ms
- [ ] Homepage CLS < 0.1
- [ ] Listing detail LCP < 2.5s
- [ ] Browse page LCP < 2.5s (with default filter set)
- [ ] No render-blocking client JS in critical path
- [ ] All images use Next.js `<Image>` with explicit dimensions
- [ ] Fonts subsetted, `font-display: swap`
- [ ] First-party JS bundle < 200kb gzipped (homepage)
- [ ] Lighthouse Performance score ≥ 90 (mobile + desktop)

---

## 8. Accessibility (WCAG AA)

- [ ] All interactive elements keyboard-navigable
- [ ] Tab order logical
- [ ] Skip-to-main-content link present + functional
- [ ] All text contrast ≥ 4.5:1 against background
- [ ] All form inputs have associated labels
- [ ] All images have `alt` text (or `alt=""` for decorative)
- [ ] Heading order: one H1 per page, no skipped levels
- [ ] All ARIA usage justified (semantic HTML preferred)
- [ ] Mobile touch targets ≥ 44pt × 44pt
- [ ] Drawer / modal `aria-modal="true"` when open
- [ ] Active nav state `aria-current="page"`
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] axe-core scan: 0 critical / serious issues

---

## 9. Mobile QA

Per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md) Part 2:

- [ ] Tested on real iOS device (iPhone, iOS 17+)
- [ ] Tested on real Android device (Android 14+)
- [ ] Hamburger menu opens / closes smoothly
- [ ] Search overlay opens / closes smoothly
- [ ] All primary CTAs tappable (no overlap, no missed taps)
- [ ] Listing card grid scrolls smoothly
- [ ] Filter chips horizontal scroll smooth
- [ ] No horizontal page scroll (content fits viewport)
- [ ] Form inputs zoom-trigger correctly (font-size ≥ 16px to prevent iOS zoom)
- [ ] Tested at 320px width (oldest iPhone SE)
- [ ] Tested at 375px width (iPhone 13 mini)
- [ ] Tested at 414px width (iPhone Pro Max)
- [ ] Tested at 768px width (iPad portrait)
- [ ] Dark mode works at all widths
- [ ] PWA-like behavior reasonable (no required service worker, but no broken offline)

---

## 10. Cross-browser

- [ ] Chrome (latest stable)
- [ ] Safari (latest stable, macOS)
- [ ] Safari (latest stable, iOS)
- [ ] Firefox (latest stable)
- [ ] Edge (latest stable)
- [ ] No console errors on any page on any browser
- [ ] CSS `backdrop-filter` fallback for older Safari (per [NAVIGATION_MODEL.md §15](NAVIGATION_MODEL.md))

---

## 11. SEO migration

- [ ] All redirect map entries from [INDEXATION_AND_URL_POLICY.md §9.2](INDEXATION_AND_URL_POLICY.md) tested (curl old URL → expect 301 → new URL → expect 200)
- [ ] Redirects use 301 (permanent), not 302 / 307
- [ ] Sitemap submitted to GSC
- [ ] Sitemap accepted (no errors in GSC)
- [ ] Inbound links from external sites (Reddit, Twitter, blog posts) tested for top 10 sources — verify they resolve via 301 to correct destinations
- [ ] No orphaned URLs (every page reachable from at least one internal link)
- [ ] No broken internal links (`next build` reports clean)
- [ ] Internal anchor links (#section-X) resolve correctly

---

## 12. Functional testing

### 12.1 Browse flow

- [ ] Browse page loads with default filter set
- [ ] Each filter chip toggles correctly
- [ ] Filter combinations URL-update with query params
- [ ] Sort options work (verified first, recently verified, newest, deadline)
- [ ] Pagination works (next, previous, jump-to-page)
- [ ] Empty state appears when no listings match
- [ ] Listing card "Save" works for logged-in user
- [ ] Listing card "Compare" adds to compare drawer
- [ ] Listing card "Report broken link" opens flag modal

### 12.2 Listing detail flow

- [ ] Listing detail page loads correctly
- [ ] Trust badge bar displays correct state
- [ ] "Last verified" relative time correct
- [ ] Source link opens in new tab with `rel="noopener noreferrer"`
- [ ] Save button works (logged-in)
- [ ] Compare button adds to compare
- [ ] Report broken link works (POST `/api/flags`)
- [ ] Related programs section populated

### 12.3 Tool: compare

- [ ] Add 2 listings → compare table renders
- [ ] Remove a listing → table updates
- [ ] Compare page URL persists state (shareable)
- [ ] Empty compare state graceful

### 12.4 Tool: visa decision helper

- [ ] Decision tree starts at root question
- [ ] Each answer advances to next question
- [ ] Final answer renders recommendation + cited sources
- [ ] Methodology section visible

### 12.5 Tool: checklist

- [ ] Career-stage selector works
- [ ] Checklist items render
- [ ] Check / uncheck persists (localStorage for logged-out, DB for logged-in)
- [ ] Print / export functional (if implemented)

### 12.6 Account flow

- [ ] Sign-in works
- [ ] Sign-up works
- [ ] Password reset works (transactional email)
- [ ] Sign-out works
- [ ] Saved listings persist across sessions

### 12.7 Search

- [ ] Search overlay opens from any page
- [ ] Suggestions populate as user types
- [ ] Enter navigates to `/search?q={query}`
- [ ] Search results render across categories
- [ ] Esc closes overlay

---

## 13. Forms & inputs

- [ ] All form labels visible
- [ ] Required field validation works
- [ ] Error messages clear + actionable
- [ ] Email validation accepts plus-addressed (e.g. user+tag@example.com)
- [ ] Email validation rejects obviously-bad input
- [ ] CSRF protection in place for all POST endpoints
- [ ] Rate limiting in place for `/api/flags`, `/api/auth/*`, `/api/email-subscriptions`
- [ ] No XSS in user-entered fields (test with `<script>alert(1)</script>` input)

---

## 14. API / backend

- [ ] All API endpoints return correct HTTP status codes
- [ ] All API endpoints validate input
- [ ] All API endpoints handle missing / invalid auth gracefully
- [ ] `/api/cron/verify-listings` returns 401 without `Authorization: Bearer ${CRON_SECRET}`
- [ ] `/api/admin/*` returns 401/403 without admin auth
- [ ] No SQL injection in any query (Prisma protects, but verify any raw queries)
- [ ] No mass assignment vulnerabilities (Prisma `select` lists explicit, no spread of user input)
- [ ] Logging in place for errors (Vercel logs)

---

## 15. Privacy

- [ ] `/privacy` page exists and accurate
- [ ] `/disclosure` page exists per [TRUST_AND_MONETIZATION_POLICY.md §12](TRUST_AND_MONETIZATION_POLICY.md)
- [ ] `/terms` page exists
- [ ] `/accessibility` page exists
- [ ] Cookie usage documented (if any)
- [ ] No third-party tracking pixels (no Google Analytics, no Facebook Pixel, no Hotjar)
- [ ] Vercel Analytics aggregate-only (no per-user tracking)
- [ ] User data deletion path documented (per [MESSAGING_AND_ALERTS_POLICY.md §9.4](MESSAGING_AND_ALERTS_POLICY.md))

---

## 16. Email (if any sending at launch)

If email sending is **not** authorized at launch (recommended): skip this section.

If email sending **is** authorized at launch:

- [ ] All 8 prerequisites from [MESSAGING_AND_ALERTS_POLICY.md §2.1](MESSAGING_AND_ALERTS_POLICY.md) green
- [ ] DNS records (SPF, DKIM, DMARC) verified passing
- [ ] Test email sent to admin: renders correctly in Gmail / Outlook / Apple Mail
- [ ] Unsubscribe link tested: works without login, reflects in DB within 1 minute
- [ ] Postal address in email footer
- [ ] CAN-SPAM compliance audit passes
- [ ] Send-volume limits configured

---

## 17. Monetization (if any active at launch)

If no monetization at launch (recommended): skip this section.

If sponsored listings or affiliate links are **active** at launch:

- [ ] Per-element disclosure visible per [TRUST_AND_MONETIZATION_POLICY.md §4](TRUST_AND_MONETIZATION_POLICY.md)
- [ ] Top-of-page banner on pages with affiliate / sponsored content
- [ ] `rel="sponsored"` on all affiliate links
- [ ] Sponsored listings do not displace `VERIFIED` listings in ranking (per §3 of trust/monetization)
- [ ] Above-the-fold position never sponsored
- [ ] `/disclosure` page updated with current sponsor list
- [ ] No deceptive copy

---

## 18. Operational readiness

- [ ] Vercel project configured for production deploy on `main` push
- [ ] CRON_SECRET set in Vercel environment (sensitive)
- [ ] DATABASE_URL set in Vercel environment (sensitive)
- [ ] All non-sensitive env vars documented in `.env.example`
- [ ] Vercel cron count = 2 (Hobby cap — no third)
- [ ] Vercel deployment protection: production = `none` (default), preview = `sso` (default)
- [ ] On-call / monitoring plan: who watches errors first 24 hours?
- [ ] Rollback runbook ready (per [PLATFORM_V2_STRATEGY.md §20.3](PLATFORM_V2_STRATEGY.md))

---

## 19. Documentation

- [ ] [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md) on main
- [ ] [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) on main
- [ ] [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md) on main
- [ ] [NAVIGATION_MODEL.md](NAVIGATION_MODEL.md) on main
- [ ] [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md) on main
- [ ] [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md) on main
- [ ] [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md) on main
- [ ] [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md) on main
- [ ] [DATA_FRESHNESS_SLA.md](DATA_FRESHNESS_SLA.md) on main
- [ ] LAUNCH_PLAN.md drafted (deferred — separate doc per [PLATFORM_V2_STRATEGY.md §19](PLATFORM_V2_STRATEGY.md))
- [ ] `/resources/methodology` page accurate + comprehensive
- [ ] `/resources/faq` page accurate
- [ ] CHANGELOG.md or `/resources/change-log` page entry for v2 launch

---

## 20. Stash & branch hygiene

- [ ] `stash@{0}` (cleanup/01-trust-counts-foundation) preserved
- [ ] `stash@{1}` (jobs expansion) preserved
- [ ] No branches deleted in launch event
- [ ] `redesign/platform-v2-planning` branch preserved
- [ ] All planning docs (this batch + earlier) on main

---

## 21. Readiness gates final check

Per [PLATFORM_V2_STRATEGY.md §17.3](PLATFORM_V2_STRATEGY.md), all 7 must be green:

- [ ] **Gate 1:** Trust system stable (cron clean ≥ 4 days, no FAIL, freshness threshold)
- [ ] **Gate 2:** No stale public claims (PR #25 + PR #27 merged)
- [ ] **Gate 3:** Code/site architecture clean (no half-built pages, no broken links, no programmatic-SEO violations)
- [ ] **Gate 4:** v2 platform shipped (this is what we're verifying)
- [ ] **Gate 5:** Mobile QA done (per §9 above)
- [ ] **Gate 6:** GSC + sitemap submission completed
- [ ] **Gate 7:** Data-quality story tellable in one paragraph

---

## 22. Post-launch first 24 hours

After launch event merge:

- [ ] Vercel deployment succeeded (no failed deploy)
- [ ] Production homepage loads correctly
- [ ] Production listing detail (top 5 listings) loads correctly
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots accessible at `/robots.txt`
- [ ] Top 20 redirect entries return 301 → 200
- [ ] No 5xx errors in Vercel logs (sustained)
- [ ] Cron run within 24 hours of launch: PASS
- [ ] First social post / Reddit post (Phase 6 distribution start)
- [ ] No user-reported critical bugs (monitoring `support@uscehub.com`)
- [ ] GSC URL inspection on 5 representative URLs: indexable

If any of the above fails: rollback per [PLATFORM_V2_STRATEGY.md §20.3](PLATFORM_V2_STRATEGY.md).

---

## 23. Post-launch first 30 days

- [ ] Daily cron health check
- [ ] Daily 5xx rate check
- [ ] Weekly GSC indexed page count (target: ≥ 90% of pre-launch indexed URLs)
- [ ] Weekly Core Web Vitals (target: > 90% URLs in good)
- [ ] Weekly user-flag-report resolution time (target: median < 7 days)
- [ ] Monthly trust health distribution (Current / Aging / Stale tiers)
- [ ] First 30-day post-launch retro doc

---

## 24. Sign-off

- [ ] Self-review completed by founder/operator
- [ ] All gates green
- [ ] User explicit "merge it" authorization for launch PR
- [ ] Rollback runbook open and ready
- [ ] On-call window scheduled for first 24 hours

**Launch authorized:** [date / sign-off]

---

## 24a. Existing-surface QA (added per audit)

The following live surfaces must be exercised before launch:

### 24a.1 Auth flow

- [ ] `/auth/signin` works for existing user
- [ ] `/auth/signup` creates `User` with correct role default
- [ ] Password reset flow works end-to-end
- [ ] OAuth providers (if any) work
- [ ] `UserRole.APPLICANT` / `POSTER` / `ADMIN` redirects work
- [ ] Session persistence + logout

### 24a.2 `/poster/*` flow

- [ ] Sign in as `POSTER` → land at `/poster`
- [ ] Create / edit listing via `/poster/listings`
- [ ] Edit organization profile via `/poster/organization`
- [ ] Submit verification via `/poster/verification`
- [ ] View applications via `/poster/applications`

### 24a.3 `Application` flow

- [ ] User submits application from listing detail (if implemented)
- [ ] Application appears in `/dashboard/applications`
- [ ] Poster sees application in `/poster/applications`
- [ ] Status updates flow (per `ApplicationStatus` enum)
- [ ] **If aspirational only:** verify homepage copy doesn't claim flow works

### 24a.4 `Review` flow

- [ ] User submits review on a listing
- [ ] Review appears in `/dashboard/reviews`
- [ ] Review surfaces on listing detail with moderation gate
- [ ] FTC compliance per [TRUST_AND_MONETIZATION_POLICY.md §4.5](TRUST_AND_MONETIZATION_POLICY.md)

### 24a.5 `/community/*` flow

- [ ] `/community` page loads
- [ ] `/community/suggest-program` form submits
- [ ] User submissions appear in admin queue (or wherever they go)
- [ ] Moderation policy alignment with Master Blueprint §6

### 24a.6 Deeper admin surface

- [ ] `/admin/flags` (flag triage)
- [ ] `/admin/listings` (listing admin)
- [ ] `/admin/messages`
- [ ] `/admin/posters`
- [ ] `/admin/reviews`
- [ ] `/admin/users`
- [ ] `/admin/activity`
- [ ] `/admin/verification-queue` (PR #12 surface)

### 24a.7 verify-jobs cron

- [ ] Cron health for verify-jobs over ≥4 days clean
- [ ] No cron-attributed dangerous transitions
- [ ] Job listings on `/career/jobs/*` reflect verified-jobs cron output
- [ ] Stale job entries surface in admin queue

### 24a.8 Legal pages freshness

- [ ] `/privacy` "Last updated" within 90 days of launch
- [ ] `/terms` "Last updated" within 90 days
- [ ] `/disclaimer` "Last updated" current
- [ ] `/disclosure` (if created per A8) drafted
- [ ] `/accessibility` page **created and reviewed** — currently missing

---

## 25. Open decisions for QA process

1. **Self-QA vs external QA.** At v2 launch, recommend self-QA (founder runs the checklist). Phase D consider external QA if budget allows.
2. **Automated vs manual QA.** Automated where possible (lighthouse, axe, build, type-check, lint). Manual where judgment required (mobile QA, copy review, trust language).
3. **QA recording.** Save completed checklist as `docs/platform-v2/launches/v2-launch-{date}.md` for audit trail.
4. **Re-QA after rollback.** If launch is rolled back, re-run full QA before re-launch attempt.
5. **Quarterly QA cadence post-launch.** Run subset of this checklist quarterly to catch drift.

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
- risk level:          ZERO — internal QA checklist
```

## /career impact

None.

## Schema impact

None.

## Authorization impact

None.
