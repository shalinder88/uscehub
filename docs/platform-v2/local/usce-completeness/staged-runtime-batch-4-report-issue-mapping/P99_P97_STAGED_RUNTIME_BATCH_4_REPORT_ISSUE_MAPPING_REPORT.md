# P99-P97 Staged Runtime Batch 4 — Report-Issue Mapping

**Sprint:** Overnight Sprint 1
**Pre-sprint HEAD:** `847fb9b`
**Production main:** `739ab1e2…` UNCHANGED

## Result

| Item | Value |
|------|-------|
| New mapped rows | 2 (Vanderbilt + UCSF) |
| Resolver KNOWN_LISTINGS count | 14 → **16** |
| Resolver runtimeSet for pilot-020 | `staged` |
| Resolver runtimeSet for pilot-021 | `staged` |
| Active runtime card count | 10 (UNCHANGED) |
| Staged batch 4 card count | 12 (UNCHANGED) |
| Production-public | 0 (UNCHANGED) |
| Validators | 9 PASS |

## Files added

- `staged_runtime_batch_4_report_issue_listing_map.csv` (2 rows)
- `staged_runtime_batch_4_evidence_join_map.csv` (2 rows)
- `staged_runtime_batch_4_correction_payload_map.csv` (2 rows)
- `staged_runtime_batch_4_contact_resolver_audit.csv`
- `staged_runtime_batch_4_validation_results.csv`
- `scripts/validate-p99-staged-runtime-batch-4-report-mapping.ts`

## Resolver change

`src/lib/usce-contact-context.ts` — added 2 entries to `KNOWN_LISTINGS`:
- `pilot-020-TN-vanderbilt-university-medical-center` / runtimeSet=`staged`
- `pilot-021-CA-ucsf-medical-center` / runtimeSet=`staged`

`scripts/validate-p99-contact-ref-prefill.ts` — `STAGED_ONLY_IDS` expanded to 4 IDs; `KNOWN_LISTINGS_COUNT` bumped 14 → 16; success message updated.

## What this didn't do

- No active runtime change.
- No staged batch 4 data change.
- No `/clerkships/pilot` / `/contact` UI change.
- No app import of staged batch 4.
- No PNG / Wayback / production / PR / merge.

## Next sprint

Sprint 2 — `P99-P97-BATCH-4-PROMOTION-CANDIDATE-AUDIT`. Decide whether Vanderbilt + UCSF are safe to activate (expected: both promote with caveat, mirroring HUP / Northwestern in Slice 2).

## Progress

~38% → **~39%** (small, honest step — resolver now knows the 2 new IDs but they are still staged-only).
