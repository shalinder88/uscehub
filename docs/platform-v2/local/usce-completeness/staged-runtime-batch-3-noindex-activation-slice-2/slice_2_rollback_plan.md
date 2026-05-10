# Slice 2 — Rollback Plan

The slice is trivially reversible. A single `git revert` of the slice commit returns active runtime to the 8-card state from end of Slice 1.

## Files modified by Slice 2

| File | Change |
|------|--------|
| `src/data/usce/public-listings-pilot.generated.json` | 8 → 10 cards (HUP + Northwestern appended) + `promoted_at` + `source` annotation |
| `src/data/usce/public-listings-pilot.generated.ts` | 8 → 10 cards + `PILOT_TOTAL_COUNT` + `PILOT_US_ONLY_COUNT` |
| `scripts/validate-micro-pilot-runtime.ts` | Expected count cap 8 → 10; new `SLICE_2_NEW_IDS` set; deferred set narrowed to Jackson + Methodist San Antonio |
| `src/lib/usce-contact-context.ts` | HUP + Northwestern in `KNOWN_LISTINGS` flipped from `runtimeSet: "staged"` to `"active"` |
| `scripts/validate-p99-contact-ref-prefill.ts` | Test cases regrouped: 5 activated → `runtime_set=active`; 2 staged → `"staged"` |
| `scripts/validate-p99-batch-3-promotion-candidate-audit.ts` | Deferred-IDs-not-in-active list narrowed to Jackson + Methodist San Antonio |
| `docs/platform-v2/local/usce-completeness/staged-runtime-batch-3-noindex-activation-slice-2/` | New folder (this sprint's docs) |

## Rollback procedure

### Option A — `git revert` (preferred)

```sh
cd /Users/shelly/usmle-platform
git revert --no-edit <slice-2-commit-sha>
# Re-run validators
npx tsx scripts/validate-no-secrets.ts
npx tsx scripts/validate-micro-pilot-runtime.ts   # expects 8 again after revert
```

This reverts every change atomically. No force-push, no history rewrite.

## Expected post-rollback state

| Metric | After rollback |
|--------|----------------|
| Active card count | 8 (Slice-1 baseline) |
| `PILOT_TOTAL_COUNT` | 8 |
| `PILOT_US_ONLY_COUNT` | 6 |
| `PILOT_IMG_RELEVANT_COUNT` | 2 |
| Staged batch 3 count | 14 (unchanged either way) |
| Production main | `739ab1e2…` (unchanged either way) |
| HUP / Northwestern resolver state | `runtimeSet: "staged"` |

## Validators to re-run after rollback

```sh
npx tsx scripts/validate-no-secrets.ts
npx tsc --noEmit
npx tsx scripts/validate-micro-pilot-runtime.ts
npx tsx scripts/validate-p99-staged-runtime-batch-2.ts src/data/usce/public-listings-pilot-staged-batch-2.generated.json
npx tsx scripts/validate-p99-staged-runtime-batch-3.ts src/data/usce/public-listings-pilot-staged-batch-3.generated.json
npx tsx scripts/validate-p99-staged-runtime-batch-3-report-mapping.ts
npx tsx scripts/validate-p99-batch-3-promotion-candidate-audit.ts
npx tsx scripts/validate-p99-contact-ref-prefill.ts
```

All should PASS.

## What rollback does NOT touch

- **No DB rollback needed** — no DB writes were made.
- **No production rollback needed** — the slice was never deployed.
- **No remote ref change needed** — the slice was not pushed at the time of this plan.
- **No GitHub secret-scanning alert change needed** — none was created by this slice.
