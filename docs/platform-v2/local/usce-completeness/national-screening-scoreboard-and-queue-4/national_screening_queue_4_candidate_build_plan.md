# Queue 4 Candidate Build Plan

**Date:** 2026-05-09
**Sprint:** P97-NATIONAL-SCREENING-SCOREBOARD-AND-QUEUE-4

---

## 1. Goal

Define the next national screening queue. Queue 4 should:

- Cover the 4 zero-coverage states (AK / ID / MT / WY).
- Strengthen the ~14 thin-coverage states (1-2 rows in the high-yield set today).
- Add ≥10 major public-hospital safety-net systems from large metros (high IMG-relevance).
- Add ≥6 academic medical centers known to be missing from Q1-Q3 (per coverage_gap_analysis G-015).
- Avoid duplicating any institution already in the high-yield review master.

## 2. Target size

- **Floor:** 60 rows. (Below this, Queue 4 isn't worth a screening sprint — better to push the 25-row ready set first.)
- **Target:** 80-120 rows. Practical for one or two screening sessions.
- **Ceiling:** 150 rows. Beyond this, the queue starts overlapping the existing workbench.

This sprint produces 100 rows: 60-80 net-new + 20-30 thin-coverage state-fills.

## 3. Selection rules

Queue 4 row must satisfy ALL of:
- Institution name resolves to a real U.S. medical institution.
- Institution is NOT already in the high-yield review master (`high_yield_review_master.csv`) or in queues Q1-Q3.
- Institution has a plausible URL pattern for a visiting-medical-student / observership / elective page (URL pattern alone is enough at queue-build time; verification is a later sprint).
- Institution is in one of the candidate types listed in `candidate_rows.csv`.
- Audience hypothesis is non-empty (specifies whether the row is expected to be `US_MD_DO`, `IMG_INTERNATIONAL`, `CARIBBEAN_NAMED_PARTNER`, or `MIXED`).

Queue 4 row should ideally satisfy:
- Located in a zero-coverage state OR a thin-coverage state OR a known IMG-relevant metro.
- Connects to a hospital system that is already partially screened (sibling expansion is a high-yield path).
- Has a plausible specialty fit (multispecialty visiting > single-specialty).

## 4. Exclusion rules

Queue 4 row MUST NOT be:
- Already in `high_yield_review_master.csv`.
- A residency-only institution with no visiting-medical-student program (per Manatee precedent → REJECT_PUBLIC).
- A closed-network school-level affiliation only (per UH SA precedent → KEEP_INTERNAL for IMG lane).
- A Caribbean / offshore school itself (we list U.S. clinical sites, not the school).
- A non-U.S. clinical site.
- A federal health system that requires special clearance (e.g. military medical centers without a public visiting-student program).
- Already rejected in Batch 3 (Manatee, UH SA).

## 5. Source-priority rules

Future screening sprints (Q4 screening session 1 / 2 / 3) MUST use sources in this order:

1. The institution's own public visiting-students / electives / observership page (canonical).
2. The institution's GME or UME affiliate's visiting-students page.
3. Wayback archive of either of the above.
4. The hospital-system parent page (must explicitly reference the site).
5. Public press / institutional news that mentions visiting-student access.

Sources NOT allowed:
- Paid catalogs (FRANdata, vetted.bz, etc.).
- Scraped IMG forums.
- Social-media reposts.
- Caribbean-school affiliate-list as the only source (must be paired with the institution's own page).
- ACGME residency listings as truth source (lead source only).

## 6. Per-institution future evidence packet

When Queue 4 is screened in a later sprint, each PROCESSED row must produce:

- Live URL (or honestly-flagged blocker).
- Wayback archive URL (live → save → verify HTTP 200).
- Verbatim source quote (≤280 chars).
- Audience matrix (us_md_do / international_student / img_graduate / caribbean_student each ELIGIBLE_EXPLICIT / EXCLUDED_EXPLICIT / UNKNOWN_NOT_STATED / ONLY_IF_AFFILIATED).
- yieldTier classification.
- yieldClass classification.
- sourceProofScore (1-5).
- Public-copy risk note.

This matches the existing high-yield workbench schema. New rows should slot directly into `high_yield_review_master.csv` (or its successor).

## 7. Commit cadence (for the FUTURE screening sprints)

- Each future Queue 4 screening session commits after each batch of ~10 institutions.
- No autonomous overnight runs; user is the human-in-the-loop curator.
- Each commit message names the institutions screened and the sourceProofScore distribution for the batch.

## 8. What this sprint does NOT do

- Does NOT screen any Queue 4 row.
- Does NOT fetch any source URL.
- Does NOT promote any row.
- Does NOT replace or modify the high-yield workbench.
- Does NOT modify the active runtime, staged runtime, or any UI.

## 9. Important strategic note

Queue 4 is being built per user instruction. **However, the scoreboard reveals that the highest-leverage next action is NOT Queue 4 screening but promotion of the 25 READY_FOR_HUMAN_APPROVAL rows already on T7** (Yale / Mayo Saint Marys / Cleveland Clinic Main / NYP / Hopkins / Mount Sinai / Duke / Northwestern / Penn / NYU Langone / Mayo Phoenix + Jacksonville / Westchester / Methodist TX / Newark Beth Israel / Saint Barnabas / BronxCare / Englewood / Carilion / Grady / IU Methodist / ChristianaCare).

The strategic-checkpoint document (`national_screening_strategic_checkpoint_1.md`) will name this trade-off explicitly so the user can choose:

- **Option A:** Run Queue 4 screening session 1 (net-new coverage growth).
- **Option B:** Run a `P97-PROMOTION-BATCH-3` sprint to push the 25 ready rows into staged-runtime (existing-data activation growth).
- **Option C:** Both, in sequence — promotion-batch-3 first because it's faster to a visible win.

This plan supports Option A directly and Option C indirectly.
