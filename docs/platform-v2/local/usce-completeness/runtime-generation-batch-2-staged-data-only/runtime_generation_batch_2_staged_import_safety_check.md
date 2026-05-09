# Staged Runtime Batch 2 — Import Safety Check

**Date:** 2026-05-09
**Sprint:** P99-P97-RUNTIME-GENERATION-BATCH-2-STAGED-DATA-ONLY

---

## 1. Search

```
grep -rln "public-listings-pilot-staged-batch-2|PILOT_USCE_CARDS_STAGED_BATCH_2|PILOT_STAGED_BATCH_2" src/ app/ components/
```

## 2. Result

The only `src/` match is the staged data file itself:

- `src/data/usce/public-listings-pilot-staged-batch-2.generated.ts` (the file declaring its own exports)

**No app code imports the staged module.** Specifically:

- `src/lib/usce-pilot-data.ts` — does **NOT** import the staged file (it imports the active `public-listings-pilot.generated.ts` only).
- `src/app/clerkships/pilot/page.tsx` — does **NOT** import the staged file.
- `src/app/clerkships/pilot/PilotClerkshipListings.tsx` — does **NOT** import the staged file.
- `src/data/usce/public-listings-pilot.generated.json` — UNCHANGED.
- `src/data/usce/public-listings-pilot.generated.ts` — UNCHANGED.

## 3. Allowed references

The staged file may be referenced by:
- `scripts/validate-p99-staged-runtime-batch-2.ts` (the strict validator authored in this sprint)
- `docs/platform-v2/local/usce-completeness/runtime-generation-batch-2-staged-data-only/*` (this sprint's docs)

These are out-of-app surfaces and do not affect the running pilot route.

## 4. Defenses against accidental future import

The staged file carries multiple layers of guard:

1. **TS file header comment:**
   ```
   // STAGED DATA ONLY — NOT IMPORTED BY APP CODE.
   // This file is intentionally not imported by:
   //   - src/lib/usce-pilot-data.ts
   //   - src/app/clerkships/pilot/page.tsx
   //   - src/app/clerkships/pilot/PilotClerkshipListings.tsx
   // Importing this from the active route is a release-blocking error.
   ```

2. **Different export names** from the active runtime (`PILOT_USCE_CARDS_STAGED_BATCH_2` vs active `PILOT_USCE_CARDS`) — accidental import would not satisfy the existing route's expected import shape.

3. **Top-level safety flags in the JSON** (`staged_only=true`, `not_imported_by_app=true`, `not_production=true`, `not_public_now=true`, `not_import_ready=true`) — checked by the staged validator and visible to anyone reading the file.

4. **Validator hard-fail rule** `STAGED_FILE_IS_IMPORTED` — the staged validator runs `grep -rln` against `src/` and fails if any non-self file references the staged module's basename or exported symbols.

## 5. Confirmation

The staged file is data-only and not imported by app code. Active route, active runtime, active validators all pass and remain unchanged.
