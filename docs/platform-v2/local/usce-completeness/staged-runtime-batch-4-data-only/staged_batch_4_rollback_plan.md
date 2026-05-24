# Staged Batch 4 — Rollback Plan

The sprint adds new files; no existing files were modified. A `git revert` of the sprint commit cleanly removes everything.

## Files added by this sprint

| Path | Purpose |
|------|---------|
| `src/data/usce/public-listings-pilot-staged-batch-4.generated.json` | Staged 12-card data file (NOT imported by app) |
| `src/data/usce/public-listings-pilot-staged-batch-4.generated.ts` | TS wrapper exporting `PILOT_USCE_CARDS_STAGED_BATCH_4` and counts |
| `scripts/generate-p99-staged-runtime-batch-4.ts` | Deterministic generator |
| `scripts/validate-p99-staged-runtime-batch-4.ts` | Strict validator |
| `docs/platform-v2/local/usce-completeness/staged-runtime-batch-4-data-only/` | Sprint folder (manifests, audits, reports) |

## Files NOT touched

- `src/data/usce/public-listings-pilot.generated.{json,ts}` (active 10 — UNCHANGED)
- `src/data/usce/public-listings-pilot-staged-batch-2.generated.{json,ts}` (UNCHANGED)
- `src/data/usce/public-listings-pilot-staged-batch-3.generated.{json,ts}` (UNCHANGED)
- `src/app/clerkships/pilot/*`
- `src/app/contact/*`
- `src/lib/usce-contact-context.ts`

## Rollback procedure

### Option A — `git revert` (recommended)

```sh
cd /Users/shelly/usmle-platform
git revert --no-edit <staged-batch-4-commit-sha>
```

This removes every file the sprint added in one commit. No force-push, no history rewrite.

### Option B — explicit file removal (if needed)

```sh
rm -rf docs/platform-v2/local/usce-completeness/staged-runtime-batch-4-data-only/
rm src/data/usce/public-listings-pilot-staged-batch-4.generated.json
rm src/data/usce/public-listings-pilot-staged-batch-4.generated.ts
rm scripts/generate-p99-staged-runtime-batch-4.ts
rm scripts/validate-p99-staged-runtime-batch-4.ts
git add -A
git commit -m "revert: staged batch 4"
```

## Expected post-rollback state

| Metric | After rollback |
|--------|----------------|
| Active runtime card count | **10** (unchanged either way) |
| Staged batch 3 card count | **14** (unchanged either way) |
| Staged batch 4 card count | **N/A** (file removed) |
| Production main | `739ab1e2…` (unchanged either way) |

## What rollback does NOT touch

- **No DB rollback needed** — no DB writes were made.
- **No production rollback needed** — the sprint was never deployed.
- **No remote ref change needed** — the sprint was not pushed at the time of this plan.
- **No GitHub secret-scanning alert change needed** — none was created.
