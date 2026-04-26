# Technical Debt Register

Issues found during the discovery pass. Ranked by impact, not effort.

Severity rubric:
- **P0** — dangerous in production: secrets, broken builds, data corruption, security holes, primary route broken, false public claims.
- **P1** — blocks clean future work: hardcoded counts, duplicate components, missing guardrails, big architectural splits that will compound debt as new pages land.
- **P2** — should clean soon: code that *looks* unused, duplicate routes, weak boundaries, naming. (Per [RULES.md](RULES.md), nothing here gets deleted in this cycle — every "looks unused" item is a Candidate for later review.)
- **P3** — cosmetic / polish.

> **Preservation rules apply.** This is a register, not a kill list. Per [RULES.md](RULES.md), nothing in the hard protection list (`/career/*`, jobs/sponsor/waiver/attorney data files, aspirational Prisma models, employer URL maps, city/state profile data) is to be deleted, renamed, or merged in this cleanup cycle. Where a "Suggested fix" below would have implied deletion, it has been re-scoped to **preserve in place + route new usage to a new helper**. Anything that genuinely belongs in a future delete pass is labeled **"Candidate for later review — do not delete now."**

---

## P0 — Dangerous

### P0-1. Hardcoded admin password in `prisma/seed.ts`
**File:** [prisma/seed.ts:110](prisma/seed.ts)
```ts
const passwordHash = await hash("admin2026", 12);
```
**Why it matters:** if `npm run prisma:seed` is ever run against production (or a staging mirror that gets promoted), this creates an admin user with a known, public-once-this-doc-exists password. The string lives in git history — assume it's compromised the moment you publish this audit doc.
**Suggested fix:** read the password from `process.env.ADMIN_SEED_PASSWORD` and require it to be set; throw if missing. Rotate the existing admin's password immediately if seed has been run against prod.

### P0-2. `prisma/seed.ts` depends on a sibling repo
**File:** [prisma/seed.ts:27](prisma/seed.ts)
```ts
const dataPath = path.resolve(__dirname, "../../usmle-observerships/data.js");
```
**Why it matters:** seeding requires `/Users/shelly/usmle-observerships/data.js` (a separate static-HTML repo) to exist as a sibling. CI / Vercel / fresh dev clones don't have this. Anyone running `npx prisma db seed` in a clean checkout fails. Also makes the schema a hidden dependency on a different project.
**Suggested fix:** copy the source data into `prisma/seed-data.json` (or split into `scripts/data/`, where new seed batches already live), and update the seed script to read from the local path. Then the sibling repo can be archived.

### P0-3. Seed creates the public admin account from this same script
**File:** [prisma/seed.ts](prisma/seed.ts) (top of file, around line 110)
**Why it matters:** combined with P0-1, the admin account is created automatically during any seed. There is no opt-out. Any `npx prisma db seed` against the live DB will overwrite or recreate the admin user.
**Suggested fix:** gate admin creation behind `process.env.SEED_CREATE_ADMIN === "1"` and require `ADMIN_SEED_PASSWORD` to be present. Make admin seeding an explicit, deliberate step.

---

## P1 — Blocks clean future work

### P1-1. Two coexisting data architectures (DB-backed vs TS-file-backed)
**Where:** Phase 1 listings use Prisma. Phase 3 jobs/sponsors/waiver/blog/img-resources use `src/lib/*.ts` arrays.
**Why it matters:** every new feature has to decide which world it lives in, and counts can't be centralized because the two worlds use different mechanics. The dirty stash I just preserved was the third hand-edit pass on Phase 3 counts (29 → 437 → 1,948).
**Suggested fix:** don't migrate the data, but write a `src/lib/counts.ts` adapter that exposes uniform `getListingCount()`, `getJobCount()`, `getSponsorCount()`, `getWaiverStateCount()` etc. — each backed by either Prisma or `array.length`. Then remove every hardcoded number in titles/copy and call the helper.

### P1-2. Hardcoded counts in metadata titles drift from source-of-truth
**Files:**
- [src/app/observerships/page.tsx:9](src/app/observerships/page.tsx) — title hardcodes "37 States & DC" while the page itself computes `totalStates` live
- [src/app/career/sponsors/page.tsx:5,7,11](src/app/career/sponsors/page.tsx) — "1,087 Verified Employers" baked into title + OG + body
- [src/app/career/page.tsx:194](src/app/career/page.tsx) — "29 jobs + 1,087 H-1B sponsors · 13 specialties" baked into card body
- [src/app/career/jobs/page.tsx](src/app/career/jobs/page.tsx) — title strings reference counts (the dirty stash already updates these to 1,900+)
- Many `Last verified: March 2026` strings across `career/state-compare`, `career/salary`, `career/waiver/process`, `career/visa-bulletin`, `residency/fellowship/guide`
- [src/components/seo/program-stats.tsx:188-190](src/components/seo/program-stats.tsx) — "Average observership cost: Free - $2,500" baked in
- [src/components/home/hero.tsx:54](src/components/home/hero.tsx) — "Verified Directory — Updated April 2026" baked in
**Why it matters:** Google sees stale titles, social cards say wrong numbers, the audit prompt's own Batch 1 calls out "count consistency" as the #1 cleanup. Today, fixing this requires hand-editing N files.
**Suggested fix:** use template literals reading from `getX()` helpers in `generateMetadata`. For dates, use `new Date()` formatted in the build, or read `LAST_VERIFIED` constants from a single `src/lib/freshness.ts`.

### P1-3. 1.3 MB of DOL job data ships to every browser visiting `/career/jobs`
**Files:** [src/lib/dol-jobs-data.ts](src/lib/dol-jobs-data.ts) (1.3 MB) → imported by [src/lib/waiver-jobs-data.ts:875](src/lib/waiver-jobs-data.ts) → imported by client component [src/app/career/jobs/jobs-search.tsx](src/app/career/jobs/jobs-search.tsx) (`"use client"` due to `useState`)
**Why it matters:** the entire DOL dataset becomes part of the JS bundle for `/career/jobs`. Mobile users on cellular wait seconds for a job board page. The dirty stash adds pagination but does not fix the underlying ship-it-all-then-paginate bug. Also makes `/career/jobs` the slowest-FCP page on the site.
**Suggested fix:** convert `/career/jobs` to a server component that does the filter+slice on the server, passes the page slice to a small client component for interactivity. Or move jobs to Prisma `WaiverJob` (model already exists, unused) and use server-side filtering with URL params.

### P1-4. Three duplicate "verification/trust" components
**Files:**
- [src/components/listings/trust-badges.tsx](src/components/listings/trust-badges.tsx) — `TrustBadges`
- [src/components/shared/verification-badge.tsx](src/components/shared/verification-badge.tsx) — `VerificationBadge`
- [src/components/ui/verified-badge.tsx](src/components/ui/verified-badge.tsx) — `VerifiedBadge`
- Plus inline `<Badge variant="success">Verified</Badge>` with inline SVG in [src/components/listings/listing-card.tsx:106-110](src/components/listings/listing-card.tsx) and [src/app/listing/[id]/page.tsx:478-487](src/app/listing/[id]/page.tsx)
**Why it matters:** five different visual treatments of "this thing is verified" send a confused trust signal to users, and Batch 1's "trust metadata block" has nowhere obvious to live.
**Suggested fix:** add **one new** `<TrustMetadata>` component with documented props (`sourceType`, `lastVerified`, `verifiedBy`, `linkVerified`, `adminReviewed`). Route all **new** usage through it. **Preserve the three existing components in place** — add a header comment to each: `// Candidate for later review — do not delete now. New code should use <TrustMetadata>.` Migrate existing call sites incrementally only when those files are touched for other reasons.

### P1-5. CTA wording is inline conditional logic, not a component
**File:** [src/app/listing/[id]/page.tsx:469](src/app/listing/[id]/page.tsx)
```tsx
{listing.listingType === "RESEARCH" ? "Learn More"
  : listing.linkVerified ? "Apply Now"
  : "Visit Website"}
```
**Why it matters:** Batch 1 calls for "safer CTA labels". With no `<ApplyButton>` component there's no chokepoint — every consumer (listing card, listing detail, career/jobs result, sponsor result) has its own version. CTA copy A/B tests are impossible.
**Suggested fix:** create `<ApplyCTA listing={listing} variant="card|detail" />` that owns the label-decision and the verification-status caption underneath.

### P1-6. Sitemap has duplicate `/career` entry
**File:** [src/app/sitemap.ts](src/app/sitemap.ts) lines 290 and 344
**Why it matters:** Search Console flags duplicate URLs and sometimes downranks one. Easy fix.
**Suggested fix:** remove one entry; keep the higher `priority` / more specific `changeFrequency`.

### P1-7. JSON-LD URL inconsistency: `uscehub.com` vs `www.uscehub.com`
**Files:**
- [src/app/layout.tsx:18,29](src/app/layout.tsx) — `metadataBase: new URL("https://uscehub.com")`, canonical `https://uscehub.com`
- [src/app/layout.tsx:97,100,113](src/app/layout.tsx) — JSON-LD uses `https://www.uscehub.com`
- [src/app/page.tsx:91,105](src/app/page.tsx) — JSON-LD uses `https://uscehub.com`
**Why it matters:** structured-data validators flag the mismatch, the canonical conflict can split PageRank, and Google may pick a different canonical than declared.
**Suggested fix:** declare a single `SITE_URL` constant in `src/lib/site.ts`, import everywhere. Pick one of www / non-www and stick with it (Vercel domain settings should redirect the other).

### P1-8. Google Search Console verification token is a placeholder
**File:** [src/app/layout.tsx:55](src/app/layout.tsx)
```ts
verification: { google: "GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE" }
```
**Why it matters:** site is not verified in Search Console (or verified by another mechanism — DNS / file). If the latter, this placeholder string still ships and confuses future maintainers. If the former, you can't see crawl errors.
**Suggested fix:** verify in Search Console (DNS or HTML file are fine), then either set the real token or remove the placeholder.

### P1-9. Cron config and route docstring disagree
**Files:** [vercel.json](vercel.json) says `0 8 * * *` (daily 08:00 UTC). [src/app/api/cron/verify-jobs/route.ts:11](src/app/api/cron/verify-jobs/route.ts) docstring says "3x daily at 8am, 2pm, 10pm UTC".
**Why it matters:** future engineer reads the docstring and assumes 3x runs. Or someone updated the schedule and forgot the comment. Either way it's drift.
**Suggested fix:** decide what cadence you want. If 3x: update `vercel.json`. If daily: update the comment.

### P1-10. No env validation — typos and missing values fail silently in prod
**Where:** every consumer reads `process.env.X` directly with `||` fallbacks ([src/lib/email.ts:12,32,42,106](src/lib/email.ts), [src/app/api/cron/verify-jobs/route.ts:20](src/app/api/cron/verify-jobs/route.ts))
**Why it matters:** if `NOTIFY_TO` is unset in prod, email sending silently no-ops with `console.warn`. If `CRON_SECRET` is unset, the auth header check becomes `Bearer undefined` (currently safe, but fragile to future edits). New env vars added later won't have a single place to register them.
**Suggested fix:** create `src/lib/env.ts` that validates required env vars with zod at module-load. Throw at startup if anything required is missing.

### P1-11. No tests at all
**Where:** no `package.json` test script, no `__tests__/`, no `*.test.ts(x)` files, no `playwright.config`.
**Why it matters:** every cleanup PR (especially count-related) ships blind. Even a smoke test that "homepage builds and contains a non-zero listing count" would catch a regression where Prisma queries silently fail.
**Suggested fix:** add Vitest + React Testing Library. Start with two tests: (1) homepage SSR returns expected props with seed data, (2) `getX()` count helpers return numbers. Don't over-invest yet.

### P1-12. Aspirational Prisma models for the unfinished `/career` backend — **Preserve — unfinished careers asset**
**Where:** `WaiverJob`, `WaiverState`, `Lawyer`, `FellowshipProgram`, `DataVerification` are defined in [prisma/schema.prisma](prisma/schema.prisma) but no code reads/writes them. The corresponding pages currently read from TS files.
**Why it matters:** schema reads as if these are live, leading future engineers (or you, in three months) to query empty tables. The naming overlap with the TS-file data also obscures the eventual migration path.
**Suggested fix (preservation):** **do not drop** these models. They are the eventual destination for the `/career` backend per the user's product roadmap. Add a labeled comment block above each:
```prisma
/// PRESERVE — unfinished careers asset.
/// Eventual home for src/lib/waiver-jobs-data.ts data once the /career backend lands.
/// Currently unread; do not drop in any migration without explicit user approval.
```
Per [RULES.md](RULES.md) hard protection list, dropping these in a Prisma migration requires explicit user authorization of the exact migration name.

### P1-13. Lint reports 18 errors that the build ignores
**Files:** mostly in `src/components/providers/*` and `src/app/listings/ssr-page-counter.tsx` (React 19 `react-hooks/set-state-in-effect`), plus 1 escaped-entity, 1 prefer-const.
**Why it matters:** errors in the lint report are not blocking the build. Any new code is shipping into a noisy lint output where genuine new errors will be missed.
**Suggested fix:** either fix the providers (small refactor — most are localStorage hydration patterns that have a documented React 19 pattern), or temporarily downgrade those rules to `warn` while you fix them, with a TODO. Don't leave in `error` unless they're blocking.

---

## P2 — Should clean soon

### P2-1. Two state-compare routes — **Preserve — unfinished careers asset**
**Files:** [src/app/career/state-compare/page.tsx](src/app/career/state-compare/page.tsx) and [src/app/career/compare-states/page.tsx](src/app/career/compare-states/page.tsx) — different paths, similar names. Both have layouts.
**Suggested action:** document the difference (or lack of it) in a comment at the top of each file. **Do not delete or merge** in this audit cycle — both URLs may be receiving traffic / be linked from blog posts. Candidate for later review once the user explicitly confirms which URL is canonical and a 308 redirect plan is approved.

### P2-2. 83 MB raw xlsx in `scripts/lca-fy2024-q4.xlsx` is not gitignored
**Why:** sitting in `scripts/`, currently untracked. A casual `git add scripts/` would commit 83 MB into history (irreversible without rewriting). Add `*.xlsx` to `.gitignore`.

### P2-3. `dol-jobs-data.ts` is data masquerading as code
**Why:** 1.3 MB of TypeScript that is really a JSON dump. Importing it as TS forces tsc to parse it on every type-check (slow). Renaming to `dol-jobs.json` and importing with `resolveJsonModule: true` (already on) is faster and signals "this is data, not logic." Pairs naturally with P1-3.

### P2-4. `src/lib/utils.ts` mixes constants (`US_STATES`, `SPECIALTIES`, `LISTING_TYPE_LABELS`) with helpers (`formatDate`, `truncate`)
**Why:** future imports become noisy and the file becomes a dumping ground. Split into `src/lib/constants.ts` and `src/lib/format.ts`.

### P2-5. No `src/middleware.ts`, but multiple admin route handlers manually check session+role
**Why:** repetition. A small `requireAdmin()` helper or `withAdmin()` wrapper would reduce drift across `src/app/api/admin/*/route.ts`.

### P2-6. `LAUNCH-CHECKLIST.md`, `PROJECT-STATUS.md`, `AGENTS.md`, `CLAUDE.md`, `README.md` at repo root
**Why:** repo root is cluttered. Consider `docs/launch-checklist.md`, `docs/project-status.md`. Skip if you don't care.

### P2-7. `src/components/providers.tsx` (file) and `src/components/providers/` (folder) coexist
**Why:** confusing collision. The file re-exports something; the folder has `journey-provider.tsx` and `theme-provider.tsx`.
**Suggested action:** document the collision in a header comment in `providers.tsx`. **Candidate for later review — do not rename or delete now.** Renames would invalidate `git blame` and could disturb import paths across the app; defer until a quieter window with explicit user approval of the new layout.

---

## P3 — Cosmetic

### P3-1. Tailwind class duplication: `border-slate-200 dark:border-slate-700 dark:border-slate-700`
**Where:** seen in [src/app/listing/[id]/page.tsx:161,217,361,...](src/app/listing/[id]/page.tsx) — `dark:border-slate-700` repeated. Probably a search-and-replace artifact.

### P3-2. Two homepage subhead facts could collide
**Where:** [src/app/page.tsx:54](src/app/page.tsx) "Updated April 2026" + Phase 3 "Last verified: March 2026" — month-specific strings will look stale within a quarter. Use computed or shared `LAST_VERIFIED` constant.

### P3-3. `usmle-platform/.DS_Store` files
Already in `.gitignore`. Mac-side noise only. **Do not delete in this pass** — leave to the OS / next checkout cycle.
