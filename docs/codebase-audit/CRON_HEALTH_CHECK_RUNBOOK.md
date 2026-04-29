# verify-listings cron health check — runbook

**Status:** operational doc.
**Authority:** lower than [RULES.md](RULES.md) and [SEO_PRESERVATION_RULES.md](SEO_PRESERVATION_RULES.md).
**When to use:** any time you want to confirm the Phase 3.3 / 3.3a verify-listings cron is behaving inside its conservative contract — typically the morning after a scheduled tick, or any time a new audit row appears suspicious.

## TL;DR

```
cd /Users/shelly/usmle-platform && npx tsx scripts/check-verify-listings-cron.ts
```

- Exit `0` + `PASS` → cron contract intact, no action needed.
- Exit `0` + `WARN` → still healthy, but flagged something to watch (e.g. zero cron rows yet because the scheduled tick hasn't fired).
- Exit `1` + `FAIL` → discipline violation. **Do not run another cron tick until the cause is understood.** See "Triage when FAIL" below.

The script is read-only: no `create` / `update` / `delete` / `upsert`, no raw write SQL. It does not read or print any secret. It does not require `CRON_SECRET`.

## What the script reports

The output has eight numbered sections plus a summary:

1. **Cron audit row counts** — total `DataVerification` rows attributable to the cron sentinel `verifiedBy = "system:cron-verify-listings"` (with `method = "CRON"`), and how many landed in the last 24 hours.
2. **Latest 10 audit rows** — most recent cron-driven attempts. Format: `<timestamp> <listingId> <statusBefore> → <statusAfter> http=<code> reason=<errorMessage>`.
3. **Latest 10 rows again** (numbered 3 in the script for readability).
4. **`Listing.linkVerificationStatus` distribution** — the public-trust spectrum.
5. **`Listing.status` distribution** — `APPROVED` / `PENDING` / `REJECTED` / `HIDDEN`. The cron must never modify this field; this row is here so a sudden mass `HIDDEN` jump would be visible.
6. **Cron-attributed dangerous transitions** (must be 0):
   - `SOURCE_DEAD`
   - `PROGRAM_CLOSED`
   - `NO_OFFICIAL_SOURCE`

   Plus an informational count of *admin-attributed* rows in those statuses (allowed via `/admin/verification-queue` from PR #12; printed for visibility, not as a violation).
7. **`lastVerifiedAt` discipline** — count of listings where `lastVerifiedAt` is set but `linkVerificationStatus` is not `VERIFIED`. Must be 0 ("no fake dates" rule, [RULES.md](RULES.md) / [PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md](PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md) §4).
8. **Verification timestamps** — total listings, count with `lastVerifiedAt` set, count with `lastVerificationAttemptAt` set. Useful for "is the cron actually walking through the inventory" sanity.

## What good output looks like

A clean run looks like:

```
=== verify-listings cron health check ===
Run at: 2026-04-29T09:30:00.000Z

1. DataVerification rows from cron sentinel:
     total: 50
     last 24h: 25

3. Latest 10 cron audit rows:
   2026-04-29T09:00:42.123Z cmn21157p009ysb11lhl9d9fe UNKNOWN → VERIFIED http=200
   2026-04-29T09:00:42.045Z cmn2115cs00acsb11onyobib8 VERIFIED → VERIFIED http=200
   ...

4. Listing.linkVerificationStatus distribution:
   UNKNOWN              120
   VERIFIED             170
   REVERIFYING            1
   NEEDS_MANUAL_REVIEW   15

5. Listing.status distribution:
   APPROVED             304
   REJECTED               2

6. Cron-attributed dangerous transitions (must be 0):
   cron-attributed SOURCE_DEAD: 0
   cron-attributed PROGRAM_CLOSED: 0
   cron-attributed NO_OFFICIAL_SOURCE: 0

   admin-attributed counts (allowed; informational):
   admin SOURCE_DEAD: 0
   admin PROGRAM_CLOSED: 0
   admin NO_OFFICIAL_SOURCE: 0

7. lastVerifiedAt discipline:
   Listings with lastVerifiedAt set but linkVerificationStatus != VERIFIED: 0

8. Verification timestamps:
   total listings:                  306
   with lastVerifiedAt set:         45
   with lastVerificationAttemptAt:  50

=== summary ===
PASS — cron contract appears intact.
```

## Triage when WARN

The only `WARN` the script emits today is **"No cron audit rows yet."** This means either:

- The scheduled tick hasn't fired in this DB yet (e.g. you ran the check before 09:00 UTC on the day after deploy).
- The cron route is unauthenticated or 500ing in production. Check the Vercel dashboard logs (path below).
- You're running against a fresh / staging DB where the cron has never run.

Action: not urgent; re-run after the next tick or check the Vercel dashboard.

## Triage when FAIL

The script emits FAIL on two specific violations:

### `cron sentinel produced N <STATUS> row(s)`

The cron set `SOURCE_DEAD`, `PROGRAM_CLOSED`, or `NO_OFFICIAL_SOURCE` on at least one listing. Per the contract these are admin-only states. The cron's classifier (`src/lib/link-verification.ts`) and probe (`src/app/api/cron/verify-listings/route.ts`) must not produce them.

**Do not run another tick until the cause is fixed.**

Triage:
1. Read the listed `id` / `targetId` / `createdAt` from the script output.
2. Inspect that audit row directly:
   ```
   cd /Users/shelly/usmle-platform && node --env-file=.env -e "
   import('@prisma/client').then(async ({ PrismaClient }) => {
     const p = new PrismaClient();
     const row = await p.dataVerification.findUnique({ where: { id: '<ID>' } });
     console.log(JSON.stringify(row, null, 2));
     await p.\$disconnect();
   });"
   ```
3. Check whether the contract regressed in `src/lib/link-verification.ts` or whether the route bypassed the classifier somewhere.
4. Open a fix PR before allowing the next tick.

### `N listing(s) have a non-null lastVerifiedAt but their current linkVerificationStatus is not VERIFIED`

The "no fake dates" rule was violated. Either:

- A code path advanced `lastVerifiedAt` for a non-VERIFIED status (regression in `src/app/api/cron/verify-listings/route.ts` `applyClassification`, or in `src/app/api/admin/verification-queue/route.ts` `buildListingPatch`).
- An admin/user manually set the status without clearing `lastVerifiedAt`.

Action: fix the offending code path, then run a one-shot script to null out the bad `lastVerifiedAt` values **after explicit user authorization** (do not auto-fix).

## Vercel dashboard cross-check

Independent of the DB, you can watch the cron from Vercel:

> **Vercel → uscehub → Cron Jobs → `/api/cron/verify-listings` → Logs**

Filter by `requestPath = /api/cron/verify-listings`.

Confirm:

- HTTP status `200` (not `401` / `500`)
- response body `{ checked, verified, needs_manual_review, reverifying, skipped_no_url, errors, details }`
- `checked` ≈ 25 (the per-run cap)
- no `errors > 0`
- no `MissingEnvError`

**Schedule reminder:** the cron is configured at `0 9 * * *` UTC. On Vercel Hobby, daily crons fire **anywhere within the scheduled hour**, so the actual run time can be 09:00–09:59 UTC. If the audit rows haven't shown up by 10:00 UTC, that is when to start looking.

## When NOT to use this script

- If you want to *force* a cron tick — this script does not call the route. It only reads the DB. Use the [authorized manual-trigger flow](SESSION_HANDOFF_2026_04_28.md#4-immediate-next-gate-do-this-first-in-the-new-session) instead, with the user's explicit per-tick authorization and `CRON_SECRET` already in shell.
- If you want to fix data — this script will not. It is read-only by design. Any cleanup must be its own PR.
- If you want to review the *admin* queue — that's `/admin/verification-queue` from PR #12. This script reports admin-attributed dangerous-status counts informationally but is not a substitute for the admin UI.

## Cross-references

- [PHASE_3_3_VERIFICATION_CRON_DESIGN.md](PHASE_3_3_VERIFICATION_CRON_DESIGN.md) — full classification table the cron implements (post-PR-#11 HEAD→GET fallback for 405).
- [PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md](PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md) §4 — verification principles, especially the "no fake dates" rule.
- [DEFERRED_OPS_CHECKLIST.md](DEFERRED_OPS_CHECKLIST.md) §7 — ongoing daily-tick monitoring guidance.

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
- risk level:          ZERO — internal docs + read-only diagnostic script
```

## /career impact of this doc

None.
