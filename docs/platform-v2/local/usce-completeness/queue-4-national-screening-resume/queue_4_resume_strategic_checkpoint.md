# Queue 4 — Strategic Checkpoint

**Sprint:** `P97-QUEUE-4-NATIONAL-SCREENING-RESUME`
**Date:** 2026-05-10
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**HEAD:** `f4dca4a` (also at `origin/local/p97-discovery-integrity-guardrails-clean`)
**Production main:** `739ab1e2…` UNCHANGED

## Current scoreboard

| Metric | Value |
|--------|-------|
| Active noindex pilot | **10** (was 5 at project start) |
| Staged runtime batch 3 | 14 |
| Production-public | **0** |
| Validated bridge-input rows (cumulative) | 9 (UPMC + Lincoln + 7 batch-3) |
| Source-proofed corpus on T7 | ~347 |
| Open GitHub secret-scanning alerts | **0** |
| Clean branch backed up to GitHub | YES (HEAD `f4dca4a`) |

## 1. Are we on the main product path?

**Yes.** The last 10 sprints converted prep into 5 active cards' worth of new product inventory (60% growth in Slice 1, then 25% in Slice 2). Cumulative active growth: 5 → 10 (100%). All under noindex+nofollow with zero production deploys.

## 2. Did the last 10 prompts move product inventory or just process?

**Both — but the last two slices definitively moved inventory.** Slices 1+2 each appended new cards to `/clerkships/pilot` with full validators, browser preview, and trivial revertability. Earlier sprints in the chain were prep (audit / mapping / contact UI wiring) — necessary scaffolding that made the slices defensible.

## 3. What changed numerically?

| | Sprint start | Now |
|--|--|--|
| Active noindex pilot | 5 | 10 |
| Staged runtime | 7 | 14 |
| Validated bridge inputs | 2 | 9 |
| Production-public | 0 | 0 |

Production has been correctly held at 0 throughout. The active-runtime growth is real product, not synthetic.

## 4. What should stop now?

**Slice 3 should stop.** Jackson Memorial and Methodist San Antonio are the remaining batch-3 deferred rows. Activating them now would be diminishing returns — Jackson's brand-vs-source mismatch and Methodist San Antonio's PARTIAL source detail are real risks, and forcing them active just to push the active count to 11–12 is count-chasing, not product growth.

**Continued mapping/audit/UI sprints should also stop.** That work is done. The next leverage point is upstream: more validated rows entering the funnel.

## 5. What should continue?

**The validate → stage → audit → activate discipline.** Every product-growth sprint should produce evidence-on-disk and be trivially reversible. Queue 4 is upstream of that funnel; once Queue 4 yields new validated rows, they re-enter the existing pipeline.

## 6. Why Slice 3 is not first priority

- The remaining 2 deferred batch-3 rows have known-defensible deferral reasons (system-level brand mismatch / PARTIAL source).
- A Slice 3 would grow active 10 → 11 or 12 — modest gain at higher risk.
- Better Slice-3 candidates may emerge from Queue 4 with stronger source-scope clarity. Activating them later is cleaner than activating Jackson now.

## 7. Why Queue 4 is the right next move

- The screening corpus has ~347 source-proofed rows; only 9 reached "validated bridge input" — the funnel is wide upstream and narrow downstream.
- Coverage gaps are concrete: 4 zero-coverage states (AK / ID / MT / WY); ~14 thin-coverage states; major AMCs missing (UCSF / UCLA / Stanford / Vanderbilt / WashU / Michigan / MSK / BWH / MGH / OHSU); large public safety-net systems missing (Bellevue / LAC+USC / Cook County / Parkland / Harborview / ZSFG).
- A 100-row Queue 4 candidate file already exists from the prior scoreboard sprint. This sprint *resumes* and tightens it for Session 1, then plans the next 10 sprints around it.

## 8. What would be drift?

- Re-mapping the same 14 staged cards.
- Activating Jackson / Methodist San Antonio just to hit a count.
- Building a 5th validator on top of the same 14 rows.
- A new "platform polish" sprint that doesn't add inventory.
- Touching production / homepage / nav / sitemap.
- Resuming Queue 4 in a way that produces only a queue document and no future screening sessions.

## 9. What would be real product movement?

- Queue 4 Session 1 lands 25 official source URLs + screenshots + Wayback + audience verbatim quotes for 25 new candidates.
- A subset of those becomes a new validated bridge-input set.
- That set becomes staged batch 4.
- A subset of that batch 4 becomes Slice 3 (NOT Jackson / Methodist San Antonio).

## 10. What is the next checkpoint trigger?

After Queue 4 Session 1 + curator pass, re-evaluate:
- Did Session 1 yield ≥ 12 of 25 rows toward bridge readiness? If yes, continue with Session 2. If no, diagnose first.
- Have any "do not repeat" patterns reappeared? If yes, harden the candidate-generation rules.
- Is the funnel still narrow downstream? If yes, prioritize evidence-hardening.

This sprint produces docs only. It does not screen, does not promote, does not change runtime.
