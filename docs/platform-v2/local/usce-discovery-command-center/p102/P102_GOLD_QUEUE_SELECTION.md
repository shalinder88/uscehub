# P102-GOLD — Queue Selection (11 institutions × 11 failure modes)

schemaVersion: p102-0r-1 (queue) / p102-deep-0f-1 (deep packets)
sprint: P102-GOLD deep benchmark
predecessor: P102-0G (commit `6453ddd`)
branch: `local/p102-gold-deep-benchmark`
status: ACTIVE

## Why each institution was chosen

The 11-entry gold-set queue at [`queues/p102_gold_set_queue.csv`](queues/p102_gold_set_queue.csv) was built during P102-0Q (sprint that locked the gold-set ground truth). Each entry exercises one specific failure mode from the master spec. The P102-GOLD deep benchmark runs the same 11 institutions through deep three-tier extraction, one at a time, with `--deep` enabled and bounded A4 `--fetch-additional` for any A3-emitted recovery tasks.

This sprint does **not** alter the gold-set queue. It activates it.

| # | Institution | Domain | Failure mode | Expected outcome | Prior P102 run |
|---|---|---|---|---|---|
| 1 | Cleveland Clinic Florida (Weston, FL) | `my.clevelandclinic.org` | Positive identification of an International Medical Student / Visiting Student program | ≥1 PUBLIC_SAFE_USCE in Tier 1 VISITING_MEDICAL_STUDENT lane | none — fresh A0 capture |
| 2 | Vanderbilt University Medical Center (Nashville, TN) | `vumc.org` | VSLO-only restriction (US LCME/COCA only, no IMGs) | ≥1 PUBLIC_SAFE_USCE for VSLO-only with appropriate Tier 1 lane + a negative claim for IMG access | none — fresh A0 capture |
| 3 | Houston Methodist Hospital (Houston, TX) | `houstonmethodist.org` | False-positive `/observership` URL (resolves to a Pharmacy P1/P2 externship); framework must NOT promote | 0 PUBLIC_SAFE_USCE; pharmacy externship correctly held at HUMAN_REVIEW_REQUIRED | **`p102-1-trial-2-run-1`** — P102-0G deep-run complete |
| 4 | Mayo Clinic Rochester (Rochester, MN) | `mayoclinic.org` | Explicit negative refusal language present on official policy pages | ≥1 EXPLICIT_NEGATIVE_QUOTE with STRONG strength → PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY | none — fresh A0 capture |
| 5 | Hartford Hospital (Hartford, CT) | `hartfordhospital.org` | No public lane by absence after broad search; correct "thorough search, zero PUBLIC_SAFE_USCE" outcome | 0 PUBLIC_SAFE_USCE; Tier 1 PASS_PARTIAL or PASS_NEGATIVE | **`p102-0r-dry-run-1`** — P102-0F deep-run complete |
| 6 | AdventHealth Orlando (Orlando, FL) | `adventhealth.com` | Parent-system / campus ambiguity; system-domain content must NOT auto-attribute to Orlando | 0 PUBLIC_SAFE_USCE; all system-domain claims held to HUMAN_REVIEW_REQUIRED | **`p102-1-trial-2-run-3`** — P102-0G deep-run + A4 fetch complete (Redmond clerkship correctly blocked) |
| 7 | Brigham and Women's Hospital (Boston, MA) | `brighamandwomens.org` | Medical-school-level source ambiguity (HMS affiliation); UME content can't auto-attribute to BWH | At most CAUTION_SAFE_INTERNAL_REVIEW or HUMAN_REVIEW_REQUIRED for HMS-sourced claims; only campus-named quotes promote | none — fresh A0 capture |
| 8 | The Brooklyn Hospital Center (Brooklyn, NY) | `tbh.org` | GME-rich but no USCE; framework must not promote any of 87+ GME claims to Tier 1 | 0 PUBLIC_SAFE_USCE; heavy Tier 2 (residency/fellowship); Tier 1 may be PARTIAL or WEAK | **`p102-1-trial-2-run-2`** — P102-0F deep-run complete |
| 9 | Northwell Staten Island UH (Staten Island, NY) | `northwell.edu` | Jobs/visa/careers-rich future-lane; high Tier 3 yield expected, zero Tier 1 promotion | 0 PUBLIC_SAFE_USCE; high futureLaneValue with J-1/H-1B signals captured as FUTURE_LANE_ONLY | none — fresh A0 capture |
| 10 | Boston Medical Center (Boston, MA) | `bmc.org` | PDF-heavy institution; exercises PDF cascade | PDFs captured if available; cleaned text via pdftotext; Tier classification on PDF content | none — fresh A0 capture |
| 11 | Michigan Medicine (Ann Arbor, MI) | `uofmhealth.org` | Bot-block / 403 / timeout test (P101-1 was bot-blocked) | A0 capture documents the bot-block honestly; deep extraction runs on what was captured; institution status reflects partial coverage | none — fresh A0 capture |

## Execution plan

For each institution, one at a time, in this order (existing-deep-run institutions first to verify regression; then fresh-capture institutions):

```
Phase 1 — already-deep-extracted (verify gold status against current ledger):
  Run #5  Hartford Hospital              p102-0r-dry-run-1
  Run #3  Houston Methodist Hospital     p102-1-trial-2-run-1
  Run #8  The Brooklyn Hospital Center   p102-1-trial-2-run-2
  Run #6  AdventHealth Orlando           p102-1-trial-2-run-3

Phase 2 — fresh A0 capture required (one at a time):
  Run #1  Cleveland Clinic Florida       (new run id)
  Run #2  Vanderbilt University Medical Center
  Run #4  Mayo Clinic Rochester
  Run #7  Brigham and Women's Hospital
  Run #9  Northwell Staten Island UH
  Run #10 Boston Medical Center
  Run #11 Michigan Medicine
```

The runner sequence per institution is the standard discipline:

1. A0 source capture (if no run folder yet) — `p102-discovery-runner.ts --queue <gold-queue.csv> --limit 1 --institution-id <id>`
2. Deep source discovery — `p102-deep-source-discovery.ts --run-id <id>`
3. Deep extraction — `p102-claude-cli-extractor.ts --run-id <id> --deep`
4. Regate — `p102-regate-run.ts --run-id <id>`
5. Quote re-verify — `p102-quote-verify.ts --run-id <id> --strict`
6. If A3 emits `deepRecoveryTasks` → bounded A4: `p102-claude-cli-extractor.ts --run-id <id> --deep --fetch-additional`
7. Re-deep on augmented capture (if A4 added sources)
8. Validators — `p102-validate-all.ts --fast`
9. Append result to `P102_GOLD_RUNNING_LOG.md`

## What this sprint does NOT do

- ❌ Run state slice.
- ❌ Run national.
- ❌ Push, PR, or deploy.
- ❌ Change schema / DB / migration / seed / UI / SEO.
- ❌ Parallelize institutions.
- ❌ Broad-crawl beyond bounded A4.

## Hard rules (always on)

- ✓ No `ANTHROPIC_API_KEY`. Local `claude` CLI only.
- ✓ No `@anthropic-ai/sdk` dependency.
- ✓ No Agent / subagent during A1/A2/A3.
- ✓ A4 `--fetch-additional` HEAD-first, institution-domain only, 20/10/5 budgets.
- ✓ One institution at a time.
- ✓ Production main `739ab1e` UNCHANGED.
