# USCEHub Strategic Checkpoint #1

**Date:** 2026-05-09
**Sprint:** P97-NATIONAL-SCREENING-SCOREBOARD-AND-QUEUE-4

---

## 1. Are we moving toward the main product goal?

**Mixed.** Front-end coverage growth (screening) was strong. Back-end trust infrastructure (correction intake, validators) is now solid. But the middle of the funnel — **promotion of screened rows into staged and active runtime** — has barely moved in many sprints.

The truth, in numbers:

```
373  institutions screened (Q1+Q2+Q3)
347  sourceProofScore=5 (Tier-A truth)
247  HIGH_USCE_YIELD
 25  READY_FOR_HUMAN_APPROVAL  ← waiting on a curator pass
 12  evidence-action queue (T7)
  7  staged runtime (active 5 + UPMC + Lincoln)
  5  active runtime (preview only, noindex)
  0  production-public listings
```

The 25 waiting rows include Yale New Haven, Mayo Saint Marys, Cleveland Clinic Main Campus, NewYork-Presbyterian (Columbia + Cornell), Johns Hopkins, Mount Sinai, Duke, Northwestern, Penn, NYU Langone Tisch, Mayo Phoenix + Jacksonville, Westchester, Methodist (TX), Newark Beth Israel, Saint Barnabas, BronxCare, Englewood, Carilion, Grady Memorial, Indiana University Health Methodist, ChristianaCare. **These are the most-credentialed institutions in the country, already source-verified, sitting unused.**

## 2. What have we done that mattered?

- 373 institutions screened with 347 source-proof-score=5.
- Maine 16-of-16 county sweep complete (a real geography proof).
- 5-card noindex preview shipped (Morristown / Overlook / CCF Mercy + Hillcrest / Highland) with hydration-fix and a working preview URL.
- 2 additional rows (UPMC + Lincoln) carried through Tier-A+ evidence + bridge-input validation + staged runtime + report-issue mapping.
- Correction-intake endpoint (`/api/usce/corrections`) implemented disabled-by-default with file-queue writer, audit log, redaction, 4 strict validators including a cross-join validator.
- Bridge-input + staged-runtime + report-issue-mapping schemas formalized and validator-enforced.
- Production main `739ab1e2...` UNCHANGED across the entire sequence.

## 3. What have we done that risks being process limbo?

- **Correction-intake spec sprints stacked too deep.** Sprint 1 implementation, Sprint 1 validator, Sprint 2 spec, Sprint 3 implementation, Sprint 1 cross-validator — five sprints on one feature whose UI is not even wired up yet. The product goal is not "perfect correction infrastructure"; it's "trusted, broad national coverage."
- **Active runtime has stayed at 5 cards across the last 8+ sprints.** Even after UPMC and Lincoln cleared every gate, they have not been activated; staged-batch-2 was created but never imported.
- **The 25 READY_FOR_HUMAN_APPROVAL set on T7 has not been touched in any of the last 10 sprints.** That is the largest single coverage opportunity in the project and it has been ignored while we built more validators.
- **No runtime-activation sprint has been authorized.** Every sprint has reaffirmed "production untouched" — which is correct as a hard rule, but at some point the staged set must move forward or the work compounds in storage rather than in product.

## 4. What should stop?

- **Stop building more validator/spec sprints unless they directly unblock a row's promotion.** The current validator set (12+ scripts) already covers the entire chain: payload → queue → audit → cross-join → bridge → staged → active. More validators are diminishing returns.
- **Stop net-new screening sprints UNTIL the 25 ready rows are processed** — or process them in parallel, but do NOT skip them.
- **Stop deferring `/contact` UI wiring** as if it's a separable later task. It IS a blocker for the entire correction loop, and the intake endpoint has been built and tested for a sprint already.
- **Stop accumulating "staged but not imported" files**. If a staged file is created, the next sprint should import it (gated, behind a flag, on a non-default route) — not create yet another staged file.

## 5. What should continue?

- **Continue not deploying production.** That has been correct.
- **Continue requiring user-typed "push" before any production-side action.** That has been correct.
- **Continue Tier-A+ evidence discipline** (URL + HTML + Wayback + PNG + verbatim quote). It works.
- **Continue the strict banned-phrase / forbidden-token / forbidden-key enforcement.** Catches real bugs.
- **Continue the queue-by-queue screening pattern** for net-new institutions (Queue 4 will be the next).

## 6. Current scoreboard

See `national_screening_scoreboard_current_state.csv` and `national_screening_scoreboard_pipeline_funnel.csv`.

Headline:

| Stage | Count | % of 373 screened |
|-------|-------|-------------------|
| Lead rows processed | 373 | 100.0 |
| Source-review complete | 370 | 99.2 |
| sourceProofScore=5 | 347 | 93.0 |
| HIGH_USCE_YIELD | 247 | 66.2 |
| Ready for human approval | 25 | 6.7 |
| First-pilot evidence-action queue | 12 | 3.2 |
| Bridge-input VALIDATED | 2 | 0.5 |
| Staged runtime | 7 | 1.9 |
| Active noindex runtime | 5 | 1.3 |
| **Production public** | **0** | **0.0** |

The funnel is upside-down: the data is fine; the activation is bottlenecked.

## 7. What is the next highest-leverage step?

**Option A — `P97-PROMOTION-BATCH-3-CURATOR-PASS`** (highest leverage):
Run a curator pass on the 25 READY_FOR_HUMAN_APPROVAL rows. Even if only 5 clear, that's a 70% jump in active runtime size — far more than any net-new screening sprint would deliver in the same time.

**Option B — `P97-QUEUE-4-SCREENING-SESSION-1`** (broader coverage growth):
Begin screening the 100 Queue 4 candidate rows; fill the 4 zero-coverage states (AK / ID / MT / WY) and add ~30 missing AMCs / public-hospital safety-nets.

**Option C — Both, in parallel** (recommended):
Promotion-Batch-3 is small per row but high yield. Queue-4 screening is parallelizable. Both should run, with Promotion-Batch-3 first.

The 10-sprint plan in `national_screening_next_10_sprint_plan.csv` reflects Option C with promotion-first ordering.

## 8. The 10-prompt checkpoint rule

**Going forward, every 10 substantive product sprints must end with a `P97-NATIONAL-SCREENING-SCOREBOARD-AND-QUEUE-N` re-run.**

The scoreboard re-run must answer:
- Has active runtime grown? (target: ≥10 active cards by next checkpoint)
- Has staged runtime grown? (target: ≥30 staged cards by next checkpoint)
- Has the 25-row ready set been processed?
- Have the 4 zero-coverage states been filled?
- Have new blockers appeared?

If a sprint sequence advances coverage growth without the user ever asking, that's correct. If a sprint sequence advances validator/spec depth without coverage growth, the next sprint must be a checkpoint.

## 9. What are we missing?

- **A canonical denominator** for "all USCE opportunities." We have rough numbers (AHA hospitals, AAMC members, LCME schools) but not a fixed master list. Future denominator sprint can lock this.
- **A formal Caribbean-school affiliate map.** Only SGU partners (Atlantic Health → Morristown + Overlook) are implicitly visible; Ross / AUC / Saba / MUA / Avalon affiliates are not enumerated.
- **A functioning end-to-end correction loop.** Endpoint exists; UI does not parse listing_id; rate limit not built. B-001/B-002/B-003 + B-006 still open.
- **The active 5 cards' evidence files on Mac-local.** Currently canonical only on T7 lane (B-005 cosmetic).
- **A live runtime that includes more than 5 rows.** Staged-batch-2 has been waiting since Sprint Q1 of this batch.

## 10. What would be a bad next sprint?

- **Bad:** another correction-intake sub-spec sprint (e.g. "P97-CORRECTION-AUDIT-LOG-SCHEMA-VALIDATOR-2"). The schema is now fully specified and validator-enforced; further refinement is process limbo.
- **Bad:** another "audit" sprint that produces only docs without unblocking promotion or screening.
- **Bad:** a 1-row "promote one institution" pilot when the same effort could promote 5-10 from the 25-row ready set.
- **Bad:** a UI-redesign sprint when the active runtime is still 5 cards.
- **Bad:** a production-merge audit sprint until at least 15-20 staged cards exist.
- **Bad:** any sprint that adds a new validator script without removing or merging an existing one.

## 11. Bottom line

We are NOT drifting on safety — production is untouched, validators are strict, no caveats removed, no audience broadened. We ARE drifting on visible product growth. The single highest-leverage next sprint is **promotion of the 25 READY_FOR_HUMAN_APPROVAL rows** (Yale / Mayo / Cleveland Clinic Main / NYP / Hopkins / Mount Sinai / Duke / Northwestern / Penn / NYU Langone / etc.) into staged-runtime, before any net-new Queue 4 screening.

If we promote 10 of those 25 in the next 3 sprints, the active runtime grows from 5 to potentially 15 — a tripling — using zero new screening time.
