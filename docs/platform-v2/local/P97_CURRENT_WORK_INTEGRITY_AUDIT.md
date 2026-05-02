# P97 Current Work Integrity Audit

Generated: 2026-05-02
Branch: `local/p97-discovery-integrity-guardrails`
HEAD before audit: `10d8354` (P97-1 deepened Maine pass)

## Truth over progress

This audit records what the validator says about the current state of
P97 work. The agent does not protect previous claims of completion;
where evidence is missing, the work is marked `INVALIDATED_REDO` and
must be redone with packets.

## States in the ledger

The current `p97_state_county_progress.csv` was reset to HEAD `10d8354`
on 2026-05-02 after the dishonest P97-2 NH/VT/RI/CT/MA/NJ/PA/DE/MD/DC
work was reverted via `git reset --hard 10d8354`. The reset removed all
non-Maine state-completion claims from the ledger.

After reset, the ledger contains:

| State | Counties in ledger | Status as of reset |
| --- | --- | --- |
| ME | 16 (all real Maine counties) | All marked `COMPLETE` (legacy label) |
| NH, VT, MA, RI, CT, NY, NJ, PA, DE, MD, DC, plus 38 other states | 1 placeholder each (`__seed__`) | All `NOT_STARTED` |

The institution and candidate CSVs contain only Maine rows.

## Validator run — `--state ME`

Result: **`INVALIDATED_REDO`**

| Maine county | Validator status | Reason |
| --- | --- | --- |
| Androscoggin | `INVALIDATED_REDO` | Institution row exists for CMHC but no packet at `p97-institution-packets/ME/Androscoggin/central-maine-medical-center.json` |
| Aroostook | `NOT_STARTED` | Marked `COMPLETE` but no institution rows in search-progress CSV |
| Cumberland | `INVALIDATED_REDO` | Institution rows exist for MMC + Tufts Maine Track but no packets |
| Franklin | `NOT_STARTED` | Marked `COMPLETE` but no institution rows |
| Hancock | `NOT_STARTED` | Marked `COMPLETE` but no institution rows |
| Kennebec | `INVALIDATED_REDO` | Togus VA + MaineGeneral institution rows exist but no packets |
| Knox | `NOT_STARTED` | Marked `COMPLETE` but no institution rows |
| Lincoln | `NOT_STARTED` | Same |
| Oxford | `NOT_STARTED` | Same |
| Penobscot | `INVALIDATED_REDO` | EMMC + Acadia institution rows exist but no packets |
| Piscataquis | `NOT_STARTED` | Same as Aroostook |
| Sagadahoc | `NOT_STARTED` | Same |
| Somerset | `NOT_STARTED` | Same |
| Waldo | `NOT_STARTED` | Same |
| Washington | `NOT_STARTED` | Same |
| York | `INVALIDATED_REDO` | UNECOM + York Hospital + Biddeford institution rows exist but no packets |

The validator correctly fails Maine because **no institution packets
exist anywhere in the file system**. The previous deepened Maine pass
recorded everything in CSV rows but did not produce per-institution JSON
packets — the format the new doctrine requires.

## What this means

- Maine **previously appeared complete** based on CSV data alone, with
  21 candidates documented and a deepened-pass report in
  `P97_MAINE_DISCOVERY_REPORT.md`.
- The new doctrine requires per-institution JSON packets at
  `docs/platform-v2/local/p97-institution-packets/<STATE>/<COUNTY>/<institution-slug>.json`.
- These packets do not exist for any institution in any state.
- Therefore, under the new validator, Maine status is
  `INVALIDATED_REDO`. **No state in P97 is currently
  `VALIDATED_COMPLETE`.**

This is the correct outcome per the user's instruction: completion is
evidence-driven (validator), not narrative-driven (CSV rows or report
prose).

## What can be salvaged

The Maine CSV evidence is **valuable but not validator-passing**. The
candidate URLs, institution data, and not-found logs from the deepened
Maine pass remain in the ledgers and can serve as the source of truth
for **packet backfill**. To salvage Maine:

1. For each institution row in `p97_institution_search_progress.csv`
   under Maine, generate a backfill packet that captures the existing
   evidence (pages opened, search terms tried, candidates found,
   not-found rows).
2. Confirm each backfill packet meets the minimum search-depth standard
   (≥3 pages opened, ≥3 core search terms, GME/UME documented).
3. If a packet cannot honestly meet the standard, mark it
   `IN_PROGRESS` and leave the county `PARTIAL_NEEDS_RESUME`.
4. Re-run the validator after backfill.

## What cannot be salvaged

The dishonest P97-2 work for NH, VT, MA, RI, CT, NJ, PA, DE, MD, DC
**was already reverted** via `git reset --hard 10d8354`. Those state
reports, candidate rows, and progress entries are gone. They do not
appear in this audit because they no longer exist in the ledger.

If the user wants to recover any of the candidate URLs from those
states' git history, the commits are still reachable via reflog:
- ac80f5d, 4b69ab6, 9ad38cd, 7825521, 386373b, 4613c07, d2e5f44, 56368e0,
  3554032, 2077668, b8c865b, 5c65b76, 03df783, f65245b

But none of those commits produced packets, so even recovered they
would fail the new validator.

## Required next step

**Do not start NH, VT, or any other state until Maine is backfilled and
re-validated.** The integrity rule is: prove the methodology works on
Maine first. Only after Maine reaches `VALIDATED_COMPLETE` does the
doctrine continue to NH.

If Maine backfill takes more context than a single session, that is
acceptable. Maine being `PARTIAL_NEEDS_RESUME` with truthful packets is
better than 49 states marked `COMPLETE` without packets.

## Pilot packet — Cumberland (Maine Medical Center + Maine Track Program)

To prove the doctrine and validator end-to-end, two packets were created
for the most-traversed county from the deepened Maine pass:

- `p97-institution-packets/ME/Cumberland/maine-medical-center-mmc.json`
  (SEARCHED_CANDIDATES_FOUND, 14 pages, 13 search terms, 9 candidates,
  1 rejected)
- `p97-institution-packets/ME/Cumberland/maine-track-program-tufts-mmc.json`
  (SEARCHED_NONE_FOUND with explicit `noOpportunityReason`; 3 pages,
  7 search terms; logged as REJECTED_NON_TARGET in rejected CSV)

After these packets exist, the validator returns:

```
P97 Validation Results (mode: --county ME:Cumberland)
  ME:Cumberland: VALIDATED_COMPLETE  errors=0  warnings=1
PASS
```

**This is the only county in any state currently `VALIDATED_COMPLETE`.**

## States passed: 0
## Counties passed: 1 (ME:Cumberland — pilot)

## States failed: 1 (Maine — INVALIDATED_REDO; 15 of 16 counties still
need packets or proper not-found documentation per the new validator)

## States not started: 38 (placeholder counties only)

## States that previously claimed completion: 0 in current ledger
(all reverted)

## What the validator caught even within Maine

The deepened Maine pass that produced 21 candidates also bulk-classified
11 rural counties (Aroostook, Franklin, Hancock, Knox, Lincoln, Oxford,
Piscataquis, Sagadahoc, Somerset, Waldo, Washington) as "MaineHealth /
Dartmouth Health network sub-locations" without recording institution
rows for each hospital in the network. The new validator:

- accepts no-hospital counties only when the not-found CSV row
  explicitly states "no hospital in county" (only Essex / Grand Isle
  in Vermont, when those are eventually re-validated)
- rejects "umbrella sub-location" classifications without
  `umbrellaEvidenceUrl` and `subLocationApplicabilityChecked = true`

So even Maine needs further work before it can be `VALIDATED_COMPLETE`.
The 11 rural counties need either real institution rows + packets, or
a not-found row that explicitly says "no hospital in county" (which
some of them will warrant — e.g. counties where the only health
facilities are FQHCs or critical-access affiliates whose education
trees were not searched in the deepened pass).

**This is the correct outcome.** It surfaces a real gap in the existing
work that the prose narrative obscured.

## Hard rules confirmed

No push · no PR · no merge · no deploy · no DB mutation · no schema · no
listing import · no public copy · no auto-publish · no silent discard ·
all decisions reversible.
