# Prisma Migration Baseline

## Why this exists

USCEHub previously had no `prisma/migrations/` history. Schema changes during the audit, cleanup, Phase 1, and Phase 2 work all reached production via `prisma db push` (direct schema sync, no migration history). Before adding Phase 3.2 verification fields, the repo needs a formal Prisma migration baseline so future migrations are clean, reviewable, and replayable in CI shadow databases.

## What this PR does

- Adds **one baseline migration** generated from the current `prisma/schema.prisma` via `prisma migrate diff --from-empty --to-schema-datamodel`. No DB connection used during generation.
- Establishes `prisma/migrations/<timestamp>_baseline_existing_schema/migration.sql` as the historical first migration.
- Does **not** change `prisma/schema.prisma`.
- Does **not** add Phase 3.2 verification fields (those land in a separate PR after this baseline merges).
- Does **not** touch the database.
- Does **not** run any production migration.
- Does **not** change UI, routes, SEO, sitemap, robots, canonical URLs, metadata, JSON-LD, or `/career`.

## Existing production database — apply once before `prisma migrate deploy`

The baseline migration's SQL contains `CREATE TYPE`, `CREATE TABLE`, `CREATE INDEX`, and `ALTER TABLE ADD CONSTRAINT` statements **for tables and types that already exist in production** (Supabase). Running the baseline directly against production would error with "type already exists" / "table already exists" the moment Prisma tries to apply it.

**Do not run this baseline directly against the existing production database.**

The correct one-time setup, performed by an operator with Supabase access, is to mark the baseline as already applied so Prisma's migration history matches the live DB state without re-running any DDL:

```bash
# From a local machine with DATABASE_URL + DIRECT_URL set to the production
# Supabase pooled + direct connections respectively (see .env.example):
npx prisma migrate resolve --applied 20260428171752_baseline_existing_schema
```

(Replace the timestamp with whatever `ls prisma/migrations/` shows after this PR merges. The folder name is the migration name Prisma uses internally.)

After that one-time `migrate resolve` call, future migrations can land safely with:

```bash
npx prisma migrate deploy
```

This is reversible — if the resolve was a mistake, `prisma migrate resolve --rolled-back <name>` undoes it without touching schema or data.

## New / fresh database

For a brand-new empty database (e.g. CI shadow DB, a contributor's local Postgres, or a fresh staging environment), this baseline migration **does** create the current schema from scratch when applied via `prisma migrate dev` or `prisma migrate deploy`. No special handling required.

## Why this approach (vs the alternatives)

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| Stay on `prisma db push` forever | Simplest; works today | No migration history; CI cannot replay schema; PR review of schema changes is just `prisma/schema.prisma` diff with no SQL visibility | Rejected — Phase 3.2+ needs reviewable SQL |
| Skip baseline; first migration is Phase 3.2 additive ALTER | One PR instead of two | Future `prisma migrate dev` will fail when shadow DB tries to replay history (the additive ALTER would target tables that don't exist in an empty shadow DB) | Rejected as unsafe |
| **Path C: Baseline now, Phase 3.2 next** | Migration history works in any environment; Phase 3.2's diff is small and reviewable; CI shadow DB workflow becomes possible | Requires the one-time `migrate resolve` step on existing production DB | Selected |

## Verification done in this PR

- `npx prisma validate` — schema is valid
- Migration SQL inspected for forbidden statements: `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, `DELETE FROM`, `DROP TYPE` — **all zero**
- 11 `CREATE TYPE`, 19 `CREATE TABLE`, 20 `CREATE INDEX`, 19 `ALTER TABLE ADD CONSTRAINT` — matches the 11 enums + 19 models in `prisma/schema.prisma`
- No DB connection was opened during migration generation (`--from-empty --to-schema-datamodel` is a pure file-to-file diff)
- `/career` files and `prisma/schema.prisma` unchanged

## Next PR

After this baseline PR is reviewed, merged, and the `prisma migrate resolve --applied` step is run against production:

**Phase 3.2 verification schema PR** adds:
- `LinkVerificationStatus` enum (UNKNOWN / VERIFIED / REVERIFYING / NEEDS_MANUAL_REVIEW / SOURCE_DEAD / PROGRAM_CLOSED / NO_OFFICIAL_SOURCE)
- `FlagKind` enum (BROKEN_LINK / WRONG_DEADLINE / PROGRAM_CLOSED / INCORRECT_INFO / DUPLICATE / SPAM / OTHER)
- `IN_REVIEW` value added to existing `FlagStatus` enum
- Listing fields: `sourceUrl`, `applicationUrl`, `linkVerificationStatus`, `lastVerifiedAt`, `lastVerificationAttemptAt`, `verificationFailureReason`
- FlagReport fields: `kind`, `sourceUrl`, `resolvedAt`, `resolvedBy`
- DataVerification extensions: `method`, `statusBefore`, `statusAfter`, `httpStatus`, `finalUrl`, `errorMessage`
- Conservative backfill: `linkVerified=true → linkVerificationStatus=VERIFIED`; `websiteUrl → sourceUrl AND applicationUrl`; no fake `lastVerifiedAt`

That PR will use `prisma migrate dev --create-only --name phase3_verification_fields` to generate a small additive migration on top of this baseline.

## SEO impact

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
- risk level:          ZERO — file-only PR, no DB writes, no public surface affected
```

## `/career` impact

None. `/career` files, jobs/waiver/sponsor/employer-urls data, `prisma/schema.prisma` Listing/FlagReport/DataVerification model definitions all unchanged.
