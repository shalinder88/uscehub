# Cleanup Plan

Staged sequence. The principle: each PR ships an architectural primitive that several future PRs will use. No PR adds a product feature. No PR rewrites a route.

> **Preservation rules apply.** Read [RULES.md](RULES.md) before opening any of the PRs below. The `/career/**` directory tree, the jobs/sponsor/waiver/attorney TS data files, the aspirational Prisma models, and the employer URL map are on the **hard protection list** — no deletes, no renames, no merges into other routes. Where a PR below previously implied deletion, it has been re-scoped to **add new + preserve old**. Any PR that ends up needing to break that rule has to be re-approved by the user before the branch is opened.

The hardest constraint: **the dirty work I stashed (jobs expansion + search refactor + employer-urls.ts) needs to be unstashed and shipped on its own branch in parallel**, without colliding with these PRs. PR1 below is deliberately scoped to surfaces the stash does not touch.

---

## PR 1 — Trust + count primitives (smallest safe foundation)

**Branch:** `cleanup/01-trust-and-counts`

**Adds:**
- `src/lib/site.ts` — single `SITE_URL` constant + `siteUrl()` helper. Used by every JSON-LD + canonical.
- `src/lib/counts.ts` — uniform `getListingCount()`, `getStateCount()`, `getSpecialtyCount()`, `getJobCount()`, `getSponsorCount()`, `getWaiverStateCount()`. Each is a thin wrapper over Prisma or `array.length` (sourced from the existing `src/lib/*.ts` files — no data migration). Plus `LAST_VERIFIED` constants per dataset.
- `src/lib/freshness.ts` — single source for "Last verified" strings, keyed by dataset. Removes the scattered "March 2026" / "April 2026" hardcoded strings.
- `src/components/shared/trust-metadata.tsx` — one consolidated `<TrustMetadata>` component. Wraps `lastVerified`, `sourceType`, optional `report` link. Documented props.
- `src/components/shared/disclaimer-banner.tsx` — generic dismissible banner: "We verify listings as of {date}; programs may close availability without notice. Confirm directly before applying."
- `src/components/shared/report-broken-link.tsx` — placeholder button with form posting to `/api/flags` (route already exists). Wire-only — UI placeholder until lead-magnet PR.

**Changes (no behavior changes):**
- Replace hardcoded "1,087" / "37 States" / "29 jobs" strings in [src/app/observerships/page.tsx](src/app/observerships/page.tsx), [src/app/career/sponsors/page.tsx](src/app/career/sponsors/page.tsx), [src/app/career/page.tsx](src/app/career/page.tsx), [src/app/career/jobs/page.tsx](src/app/career/jobs/page.tsx), [src/app/career/jobs/jobs-search.tsx](src/app/career/jobs/jobs-search.tsx) with `getJobCount()` etc. ⚠ **Coordinate with the stashed jobs branch** — easier to do this AFTER the stash is unstashed-and-merged elsewhere, then PR1 lands on top.
- Replace `https://www.uscehub.com` JSON-LD strings with `siteUrl()` to fix the www/non-www split.
- Mount `<DisclaimerBanner />` once in the listings layout (NOT in `src/app/layout.tsx` — only in `/browse`, `/listing/[id]`, `/observerships/*`).
- Remove duplicate `/career` entry in [src/app/sitemap.ts](src/app/sitemap.ts).
- Fix `verification.google` placeholder in [src/app/layout.tsx:55](src/app/layout.tsx) — either set real token or remove the field entirely.

**Does NOT:**
- Touch jobs-search UI (avoid stash conflict)
- Touch CTA wording yet (PR2)
- Move data into Prisma
- Add features

**Acceptance:**
- `npm run build` passes
- `npx tsc --noEmit` clean
- Manual: visit `/`, `/browse`, `/observerships`, `/career`, `/career/jobs`, `/career/sponsors` and confirm counts match `array.length` / DB count
- Search the codebase for `\b1,?087\b`, `\b37 [Ss]tates\b`, `\b29 jobs\b`, `\bMarch 2026\b` and confirm none remain in `src/app/`

**Estimated diff size:** ~150 lines added (helpers), ~30 lines changed across pages. Reviewable in one sitting.

---

## PR 2 — One CTA component + listing card cleanup

**Branch:** `cleanup/02-cta-and-listing-card`

**Adds:**
- `src/components/listings/apply-cta.tsx` — `<ApplyCTA listing={...} variant="card"|"detail" />`. Owns the label decision (Apply Now / Visit Website / Learn More / Contact to Apply / Apply Through Platform), the trailing verification caption, the unverified warning. Centralizes the inline conditionals in [src/app/listing/[id]/page.tsx:460-501](src/app/listing/[id]/page.tsx).
- Smoke test for the label-decision matrix (small unit test, sets up Vitest as a side effect).

**Changes:**
- Replace inline CTA logic in [src/app/listing/[id]/page.tsx](src/app/listing/[id]/page.tsx) with `<ApplyCTA variant="detail">`.
- Replace inline `<Badge>Verified</Badge>` + SVG in [src/components/listings/listing-card.tsx](src/components/listings/listing-card.tsx) with `<TrustMetadata compact>` from PR1.
- Replace `<TrustBadges>` usage in listing detail with `<TrustMetadata>` (single component).
- **Preserve** `src/components/shared/verification-badge.tsx` and `src/components/ui/verified-badge.tsx` in place. Add a header comment to each: `// Candidate for later review — do not delete now. New code should use <TrustMetadata>.` Per [RULES.md](RULES.md), no deletes in this cleanup cycle.

**Does NOT:**
- Change CTA *labels* yet (the operating plan calls for "safer" labels later — wait until lead-magnet PR is in flight so the label-text decisions are made together).
- Touch career/jobs CTAs (those use a different pattern — one PR per surface).

**Acceptance:**
- All listing pages render the same as before
- Lighthouse a11y score unchanged
- `grep -r "Apply Now\b" src/app` shows references only inside `apply-cta.tsx`

---

## PR 3 — Phase 3 client-bundle fix (biggest perf win) — **REQUIRES EXPLICIT USER APPROVAL**

**Branch:** `cleanup/03-jobs-server-rendered`

> ⚠ This PR touches the **`/career` protected area** ([RULES.md](RULES.md)). It does **not** delete, rename, or merge any route — it changes which side of the wire the filter logic runs on — but because the area is protected, the user must explicitly authorize the exact set of files this PR will modify before the branch is opened. The unfinished `/career` backend work the user is preserving may want this restructure to be coordinated with their planned backend, not reshaped now.

**Proposed changes (subject to approval):**
- Convert `src/app/career/jobs/page.tsx` to do filter+slice+sort on the server based on URL search params.
- Reduce `src/app/career/jobs/jobs-search.tsx` to a small client component that owns only the filter UI state and submits via URL params (`useRouter().push`).
- This would stop shipping the 1.3 MB DOL dataset to browsers.
- Same approach considered for `/career/sponsors` (132 KB) and `/career/jobs/[specialty]`.

**Things this PR does NOT do (preservation guarantees):**
- Does not delete `src/lib/dol-jobs-data.ts`, `src/lib/waiver-jobs-data.ts`, `src/lib/sponsor-data.ts`, or `src/lib/employer-urls.ts`.
- Does not rename `/career/jobs`, `/career/sponsors`, or any other career route.
- Does not migrate data from TS files into Prisma `WaiverJob` / `WaiverState` (those models stay aspirational — see TECH_DEBT_REGISTER P1-12).
- Does not change the public URL contract — every existing inbound link keeps working.

**Caveats:**
- Coordinate with the stashed jobs branch — PR3 must land **after** the stash is unstashed-and-merged on its own branch. Otherwise the structural reshape collides with the in-flight feature work.
- The biggest user-visible win in the entire plan: TTI on `/career/jobs` would drop from "1.3 MB JS download" to "tens of KB." Worth the protected-area conversation.

**Acceptance (if approved):**
- `next build` output for `/career/jobs` route shows < 100 KB First Load JS
- Filtering + pagination work the same
- URL is shareable (e.g. `?specialty=cardiology&state=TX&visa=j1`)
- Every existing `/career/*` URL still resolves
- All TS data files remain in place

---

## PR 4 — Env validation + preserve & label aspirational models

**Branch:** `cleanup/04-env-and-schema-hygiene`

**Adds:**
- `src/lib/env.ts` — zod schema for required + optional env vars. Throws at module load if required missing. Imports replace `process.env.X` reads.

**Changes:**
- All consumers of `process.env.*` import from `env.ts` instead.
- For aspirational Prisma models (`WaiverJob`, `WaiverState`, `Lawyer`, `FellowshipProgram`, `DataVerification`): **preserve as-is**. Add a `/// PRESERVE — unfinished careers asset.` doc comment to each per TECH_DEBT_REGISTER P1-12. **Do not drop in a migration.** Per [RULES.md](RULES.md), dropping models in the protected list requires explicit user authorization of the exact migration name.
- Fix the seed script P0-1 and P0-3 (admin password): require `ADMIN_SEED_PASSWORD` env. **Preserve** the existing seed flow.
- Fix P0-2 (sibling repo dependency): copy the source data INTO this repo (e.g. `prisma/seed-data/observerships-bootstrap.json`) so seeding works in CI. **Do not delete the sibling `usmle-observerships/` repo** — that is the user's own decision, not the audit's.

**Acceptance:**
- Seed runs in a fresh clone (no `usmle-observerships/` parent needed)
- Missing required env causes startup error instead of silent failure

---

## PR 5 — Lint cleanup + smoke tests

**Branch:** `cleanup/05-lint-and-tests`

**Changes:**
- Fix the 18 lint errors (mostly `react-hooks/set-state-in-effect` in providers — there's a known React 19 pattern using `useSyncExternalStore` for localStorage hydration).
- Wire up Vitest with two smoke tests: (1) homepage SSR returns non-zero listing count, (2) `getX()` count helpers return numbers from sample data.
- Add `npm run typecheck` script (just `tsc --noEmit`) so CI can call it explicitly.
- Optionally add Husky pre-commit hook to run lint+typecheck on staged files.

**Acceptance:**
- `npm run lint` exits 0
- `npm run typecheck` exits 0
- `npm test` runs and passes

---

## What we are NOT touching in this audit cycle

These are explicitly out of scope for the cleanup PRs above:

1. **Anything on the [RULES.md](RULES.md) hard protection list** — `/career/**`, jobs/sponsor/waiver/attorney TS data files, aspirational Prisma models, employer URL maps, city/state/job profile data. Preservation overrides cleanliness in this cycle.
2. **Lead magnet, email capture, save/compare** — Batch 2 of the operating plan. Wait until PR1-PR2 land so the trust/CTA primitives are already there.
3. **Institution pricing page, Featured/Premium tiers, outbound tracking** — Batch 3, depends on Batch 2.
4. **Programmatic SEO pages** — Batch 4. Wait for clean count + sitemap hygiene first.
5. **Migrating jobs/sponsors/waiver data into Prisma** — needs its own multi-PR plan AND explicit user approval per the protection rules. PR3 (server-side rendering) is the only PR that even proposes touching the protected area, and it's gated on user sign-off.
6. **Deleting any "duplicate" or "unused" file** — including the three trust components, the two state-compare routes, the `providers.tsx`/`providers/` collision, the aspirational Prisma models, the unread `WaiverJob` table. All preserved this cycle. Documented in TECH_DEBT_REGISTER as candidates for later review.
7. **Visual redesigns** — none needed.
8. **Renaming the `usmle-platform` directory to `uscehub`** — the GitHub remote is already `uscehub`, but the local folder is `usmle-platform`. Mechanical, not load-bearing, **defer**.
9. **The stashed jobs work** — that lives on its own branch, not on the audit branch. Pop and ship separately. **Never** drop the stash via `git stash drop` without the user explicitly authorizing it after seeing what would be lost.
10. **Dropping the `vercel/vercel-speed-insights-to-proje-vxknxk` remote branch** or any other unfamiliar branch — investigate first.

---

## Suggested ordering

```
[stash pop on its own branch] ─┬─→ ship the jobs expansion
                               │
PR1 ─→ PR2 ─→ PR3 ─→ PR4 ─→ PR5
(trust/counts)  (CTA)  (perf)  (env)  (lint/tests)
```

PR1 + PR2 can land in either order. PR3 is technically independent but easier after the stashed jobs work is in.

PR4 + PR5 are independent of everything else; they could go in parallel with PR1-PR3.

Each PR should be < 500 lines of diff and reviewable in one sitting.
