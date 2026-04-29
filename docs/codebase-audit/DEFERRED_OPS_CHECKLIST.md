# Deferred Operational Checklist

**Status:** operational doc. No source, schema, route, SEO, or `/career` changes.
**Authority:** lower than [RULES.md](RULES.md) and [SEO_PRESERVATION_RULES.md](SEO_PRESERVATION_RULES.md).
**Audience:** the next operator (human or agent) picking up where Phase 3 left off.

This file consolidates the "deferred" operational items that have been mentioned across the session handoff and the Phase 3 plan but never had a single home. Each item is small enough that the next operator can pick one up in isolation. None are urgent; all are quality improvements that should land in a quiet window.

---

## Snapshot at the time this doc was written

- `main`: `857bb93` (PR #11 / Phase 3.3a merged).
- Production: live; `/api/cron/verify-listings` returns 401 unauthenticated.
- Cron has executed at least once (manual trigger, 2026-04-28 20:47 UTC) — 25 `DataVerification` rows landed, no `SOURCE_DEAD`/`PROGRAM_CLOSED`/`NO_OFFICIAL_SOURCE`, no hidden listings.
- Migrations: 2 applied, schema up to date.
- Stashes: both preserved.
- Open PRs:
  - **#12** Phase 3.4 admin verification queue (admin-only routes; do not merge without review).
  - **#13** Phase 3.5 real verification UI (listing detail trust block reads real fields; do not merge without review).
  - **#1** Vercel Speed Insights bot PR — DRAFT, never reviewed; leave alone.

---

## 1. Vercel duplicate project audit

**What:** the Vercel team `shalinder88s-projects` contains both `uscehub` (production) and `usmle-platform` (duplicate). Both projects build on every PR, doubling preview compute.

**Why deferred:** the duplicate is harmless from a production-routing perspective — `uscehub.com` is served by the `uscehub` project, which is where `CRON_SECRET` and the production env vars live. The `usmle-platform` project does not own any production traffic but still builds preview deploys.

**Repo state:** `.vercel/project.json` is currently linked to `usmle-platform` (the duplicate, not the production project). Linking to `uscehub` would change the env-pull behavior of the local CLI but does not affect production routing.

**How to act:**
1. In the Vercel dashboard, confirm `uscehub` is the production project (it is — `uscehub.com` aliases to it).
2. Decide whether `usmle-platform` should be paused, deleted, or kept as a sandbox.
3. If paused/deleted, also remove the orphan PR check rows that the duplicate project posts on every PR.
4. If you want the local CLI linked to the production project, run from a fresh directory: `mkdir -p /tmp/uscehub-link && cd /tmp/uscehub-link && vercel link --project=uscehub --yes` and use that workspace for env pulls. Do not modify the repo's `.vercel/project.json` without an explicit decision (it would change the GitHub-Actions/Vercel project association across all clones).

**Effort:** 15 minutes.

**Owner:** project owner (requires Vercel dashboard access).

---

## 2. Prisma `package.json#prisma` deprecation

**What:** running any `prisma` command emits:

> warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7.

**Why deferred:** Prisma 6.19.x is current; Prisma 7 is not yet released. The deprecation is non-blocking and the migration is a small one-liner.

**How to act:**
1. Create `prisma.config.ts` at the repo root.
2. Move the `seed` configuration from `package.json#prisma.seed` into the new file.
3. Remove the `prisma` block from `package.json`.
4. Verify with `npx prisma migrate status` (no warning) and `npx prisma db seed --preview-feature` if you exercise the seed path.
5. CI build script in `package.json#scripts.build` still works — it runs `npx prisma migrate deploy` directly and does not depend on the deprecated config block.

**Effort:** 15–20 minutes including verification.

**Risk:** very low. No schema/data change. Reversible by restoring the `package.json` block.

---

## 3. Search Console domain property + sitemap submission

**What:** Google Search Console verification + `sitemap.xml` submission for `uscehub.com`.

**Why deferred:** GSC was an open item before the verification engine work began. Now that PR 3.3 / 3.3a are deployed and PR 3.4 / 3.5 are in flight, the data quality story is strong enough that GSC submission won't immediately surface bad signals.

**How to act:**
1. Add `uscehub.com` as a Domain property (not just URL prefix) in Search Console — uses DNS verification, covers both apex and `www`.
2. Add a TXT record with the verification value to the DNS provider that owns `uscehub.com`.
3. Once verified, submit `https://uscehub.com/sitemap.xml`.
4. Watch the Coverage report for unexpected 404s or noindex entries; the listing detail pages should index normally.
5. The sitemap is dynamically generated — confirm in `src/app/sitemap.xml/route.ts` (or equivalent) that it filters out `linkVerificationStatus IN (PROGRAM_CLOSED, SOURCE_DEAD)` once those states see real admin use. Currently both are at zero, so sitemap output is unchanged.

**Effort:** 30 minutes if DNS provider is at hand.

**Risk:** low. SEO-positive when done correctly.

---

## 4. Mobile spot-check (Phase 1 + Phase 2)

**What:** Phase 1 (trust rollout across USCE listing surfaces) and Phase 2 (listing detail trust metadata) shipped without an explicit mobile QA pass. Phase 3.5 (PR #13) further wires real verification metadata into the listing detail page — also unverified on small viewports.

**Why deferred:** desktop QA was sufficient to ship. Mobile is the long tail.

**How to act:**
1. Open the production site on a real iOS or Android device (not just devtools emulation).
2. Hit at least:
   - `/` (homepage)
   - `/browse`
   - one `/observerships/<state>` page
   - one `/listing/<id>` page
   - the listing detail trust metadata block (verification badge + "Last verified …" line)
3. Confirm: no horizontal scroll, no text overflow, no clipped tap targets, badges remain readable.
4. File any issues as separate small PRs. Do not bundle UI fixes with feature PRs.

**Effort:** 20 minutes.

**Risk:** zero (read-only verification).

---

## 5. Stash hygiene

**Both stashes must be preserved until the user explicitly authorizes dropping each one by name.**

Current stashes:

- `stash@{0}: On cleanup/01-trust-counts-foundation: wip cleanup PR1 — pause for blueprint doc update`
- `stash@{1}: On main: preserve jobs expansion before USCEHub codebase audit`

**Why preserved:** the user has noted both as "redundant" in conversation but has never explicitly authorized dropping either one. Per [RULES.md §3](RULES.md) and §4 (git safety), `git stash drop` and `git stash clear` are forbidden without explicit instruction. The cost of an accidental drop (lost in-progress work that may reference protected `/career` files like `employer-urls.ts`) is much higher than the cost of leaving them around.

**How to retire them safely (only when explicitly authorized):**
1. The user names the specific stash by index ("drop stash@{0}").
2. Optional but recommended: `git stash branch wip/<name> stash@{N}` first, which materializes the stash as a branch — gives a recoverable artifact before dropping.
3. Then `git stash drop stash@{N}`.

**Do not** run `git stash clear`, ever.

---

## 6. Cleanup branch deletion

**What:** many merged feature branches still exist on `origin`:

- `cleanup/01-trust-counts-foundation`, `cleanup/02-listing-trust-ui-boundaries`, `cleanup/03-env-seed-safety`, `cleanup/04-api-url-env-wiring`, `cleanup/05-react19-lint-fixes`, `cleanup/06-leftover-safety-fixes`, `cleanup/07-production-migration-build-guard`
- `phase1/trust-rollout-usce-surfaces`, `phase2/listing-detail-trust-metadata`
- `phase3/01-analytics-events`, `phase3/02-verification-schema`, `phase3/02a-prisma-migration-baseline`, `phase3/03-verification-cron`, `phase3/data-quality-verification-plan`
- `audit/uscehub-codebase-foundation`

**Why deferred:** all are merged via squash, but their original commits remain reachable through the branch refs. Leaving them around is harmless but visually noisy in the GitHub branches view.

**How to act:**
1. Wait at least 2 weeks after each branch's PR was merged. The pause gives time for any rollback/forensics.
2. For each branch confirmed merged: `git push origin --delete <branch>` AND locally `git branch -d <branch>` (lowercase `-d`, never `-D`, so Git refuses if the branch isn't already merged).
3. Do **not** delete:
   - `wip/preserve-careers-jobs-expansion` — references protected `/career` work; never delete without explicit user authorization.
   - The Vercel Speed Insights bot branch (`vercel/vercel-speed-insights-to-proje-vxknxk`) — leave for the bot to manage.
   - Any branch you cannot trace to a merged PR.

**Effort:** 5 minutes once the quiet period has passed.

**Risk:** medium if `-D` is used by mistake (loses unmerged work). Use `-d` only.

---

## 7. Watching first scheduled cron tick

**What:** the manual trigger on 2026-04-28 20:47 UTC produced 25 valid `DataVerification` rows. The next scheduled tick is `0 9 * * *` UTC, daily.

**How to act each morning (or however often):**
1. Run `node --env-file=.env /tmp/cron-check.mjs` from the repo root to read row counts and listing distributions. (See PR #11 description for the full criteria.)
2. Confirm the new run added 25 rows since the prior tick.
3. Confirm `SOURCE_DEAD`, `PROGRAM_CLOSED`, `NO_OFFICIAL_SOURCE` counts remain at the cron-impossible value (only admin can set those).
4. If `NEEDS_MANUAL_REVIEW` is non-zero, those listings appear in the admin queue (PR #12 surface) for triage.

**Effort:** 1 minute per day.

---

## 8. Phase 3 wrap-up checklist (when PR #12 + PR #13 merge)

Do not merge yet — but when ready, the merge order should be:

1. **PR #12** (Phase 3.4 admin verification queue) — admin-internal only; safe to land first.
2. **PR #13** (Phase 3.5 real verification UI) — public-visible; requires preview review.
3. After both merge:
   - Add a sidebar link in `/admin/layout.tsx` to the new queue if not already present.
   - Sweep `linkVerificationStatus IN (PROGRAM_CLOSED, SOURCE_DEAD)` from `/browse` and sitemap queries when admin actually uses those states (currently both are at zero, so the sweep is a no-op).
   - File a small follow-up PR (`phase3/06-listing-card-real-status`) to extend the listing-card grid surfaces to read the same fields as the listing-detail page does in PR #13.

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
- risk level:          ZERO — internal docs file, never crawled
```

## /career impact of this doc

None.
