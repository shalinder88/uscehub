# Slice 1 — Rollback Plan

The slice is trivially reversible. A single `git revert` of the slice commit returns active runtime to the 5-card baseline.

## Files modified by the slice

| File | Change |
|------|--------|
| `src/data/usce/public-listings-pilot.generated.json` | 5 → 8 cards (3 appended) + `promoted_at` + `source` annotation |
| `src/data/usce/public-listings-pilot.generated.ts` | 5 → 8 cards + `PILOT_TOTAL_COUNT` + `PILOT_US_ONLY_COUNT` |
| `scripts/validate-micro-pilot-runtime.ts` | Expected count cap 5 → 8; original-5 preservation check; slice-1 IDs present check; deferred-IDs-absent check |
| `src/lib/usce-contact-context.ts` | 3 newly-active rows in `KNOWN_LISTINGS` flipped from `runtimeSet: "staged"` to `"active"` (data-only metadata; no schema change) |
| `scripts/validate-p99-contact-ref-prefill.ts` | Test-case expectations split: 3 activated → `runtimeSet === "active"`; 4 staged → `"staged"` |
| `scripts/validate-p99-staged-runtime-batch-2.ts` | Active-card cross-check restricted to original-5 IDs (so the validator doesn't break when active grows in later slices) |
| `scripts/validate-p99-batch-3-promotion-candidate-audit.ts` | Replaces "active runtime not changed in git" with "deferred batch-3 IDs not in active runtime" (data-level invariant survives slices) |
| `docs/platform-v2/local/usce-completeness/staged-runtime-batch-3-noindex-activation-slice-1/` | New folder (this sprint's docs) |

## Rollback procedure

### Option A — `git revert` (preferred)

```sh
cd /Users/shelly/usmle-platform
git revert --no-edit <slice-commit-sha>
# Re-run validators
npx tsx scripts/validate-no-secrets.ts
npx tsx scripts/validate-micro-pilot-runtime.ts   # expects 5 again after revert (validator was reverted too)
```

This is the recommended path: it preserves the slice commit in history (auditable) and adds a revert commit that undoes every change. No force-push, no history rewrite.

### Option B — Manual file revert (if you only want to roll back the data, keeping validator improvements)

Not recommended without a separate sprint, because the validator's expected-count and ID-set checks would then assert 8 cards while the data file holds 5 → validator would fail.

If absolutely needed:
```sh
git checkout HEAD~1 -- \
  src/data/usce/public-listings-pilot.generated.json \
  src/data/usce/public-listings-pilot.generated.ts \
  scripts/validate-micro-pilot-runtime.ts \
  src/lib/usce-contact-context.ts \
  scripts/validate-p99-contact-ref-prefill.ts \
  scripts/validate-p99-staged-runtime-batch-2.ts \
  scripts/validate-p99-batch-3-promotion-candidate-audit.ts
git commit -m "revert slice 1 manually"
```

## Expected post-rollback state

| Metric | After rollback |
|--------|----------------|
| Active card count | 5 |
| `PILOT_TOTAL_COUNT` | 5 |
| `PILOT_US_ONLY_COUNT` | 3 |
| `PILOT_IMG_RELEVANT_COUNT` | 2 |
| Staged batch 3 count | 14 (unchanged either way) |
| Production main | 739ab1e2… (unchanged either way) |

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
- **No production rollback needed** — the slice was never deployed. `origin/main` is byte-identical to its pre-slice value.
- **No remote ref change needed** — the slice was never pushed.
- **No GitHub secret-scanning alert change needed** — none was created by this slice.
