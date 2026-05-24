# Micro-Pilot Runtime Generation 1 — Source Manifest

**Date:** 2026-05-08
**Source repo:** T7 — `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/08_ACTIVE_ON_SHIELD_LATER/uscehub-active-2026-05-02`
**Source commit:** `3b9d0fa P99: prepare five-row micro pilot runtime package`

## Source files read (read-only)

1. `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-prep-1/micro_pilot_runtime_prep_1_input.csv` — primary 5-row prep input consumed by the generation script
2. `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-prep-1/micro_pilot_runtime_prep_1_runtime_mapping.csv` — field mapping reference
3. `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-prep-1/micro_pilot_runtime_prep_1_public_copy_review.csv` — public copy hospital-safe wording reference
4. `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-prep-1/micro_pilot_runtime_prep_1_noindex_release_checklist.md` — release checklist reference
5. `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-prep-1/micro_pilot_runtime_prep_1_next_runtime_generation_plan.md` — task instructions
6. `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-prep-1/P99_P97_MICRO_PILOT_RUNTIME_PREP_1_REPORT.md` — prep report

## T7 read-only validators run from this sprint

```
npx tsx scripts/validate-p99-micro-pilot-runtime-prep.ts \
    docs/platform-v2/local/usce-completeness/micro-pilot-runtime-prep-1/micro_pilot_runtime_prep_1_input.csv
→ PASSED 5 rows

npx tsx scripts/validate-p99-p97-bridge-input.ts \
    docs/platform-v2/local/usce-completeness/p99_p97_first_pilot_human_curator_approved_bridge_input_DRAFT.csv
→ PASSED 5 rows
```

T7 was NOT modified by this sprint.

## Mac-local files read (read-only baseline)

1. `src/data/usce/public-listings.generated.json` — Maine runtime (12 cards) — used to confirm 20-field card shape
2. `src/lib/usce-maine-data.ts` — `UsceCard` type definition
3. `src/app/clerkships/maine/page.tsx` — Maine route metadata + structure pattern (noindex pattern reused)
4. `src/app/clerkships/maine/ClerkshipListings.tsx` — 1598-line Maine UI component (read-only inspection; NOT modified or imported into pilot)
5. `package.json` — to confirm `dev` script (next dev)
6. `next.config.ts` — to confirm Vercel-preview noindex header pattern

## Mac-local files modified by this sprint

| Path | Reason |
|------|--------|
| `scripts/generate-micro-pilot-runtime.ts` (NEW) | Reads T7 prep CSV + writes pilot runtime JSON+TS |
| `scripts/validate-micro-pilot-runtime.ts` (NEW) | Validates pilot runtime + route metadata |
| `src/data/usce/public-listings-pilot.generated.json` (NEW) | 5-card pilot runtime |
| `src/data/usce/public-listings-pilot.generated.ts` (NEW) | Typed export of pilot cards |
| `src/lib/usce-pilot-data.ts` (NEW) | Wrapper module — runtime guard + re-export |
| `src/app/clerkships/pilot/page.tsx` (NEW) | New noindex pilot route |
| `src/app/clerkships/pilot/PilotClerkshipListings.tsx` (NEW) | Minimal read-only listings component |
| `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-generation-1/...` (NEW) | Generation docs (this folder) |

## Mac-local files NOT touched

- `src/data/usce/public-listings.generated.json` — Maine runtime (left modified-from-prior-work; this sprint did NOT stage or alter it)
- `src/data/usce/public-listings.generated.ts` — same
- `src/lib/usce-maine-data.ts` — Maine wrapper (used as type source only)
- `src/app/clerkships/maine/*` — Maine route + UI (unchanged)
- `scripts/usce-data/promote-reviewed-usce-data.ts` — Maine promotion script (unchanged)
- `scripts/usce-data/validate-public-runtime-data.ts` — runtime validator (unchanged; still PASSes against Maine)
- `scripts/validate-usce-public-cards.ts` — unchanged
- `scripts/validate-usce-save-compare.ts` — unchanged
- `scripts/validate-usce-report-intake.ts` — unchanged
- `scripts/validate-usce-pilot-release.ts` — unchanged
- `next.config.ts` — unchanged
- `prisma/*` — unchanged
- `vercel.json` — unchanged
- Sitemap config — unchanged

## Pre-existing dirty files left untouched

These were dirty in Mac-local BEFORE this sprint started (from work that pre-dates the bridge audit). This sprint did NOT stage them and will NOT include them in the commit:

- `M .claude/launch.json`
- `M src/data/usce/public-listings.generated.json`
- `M src/data/usce/public-listings.generated.ts`

These remain modified-but-not-staged after this sprint completes. They are out of scope.
