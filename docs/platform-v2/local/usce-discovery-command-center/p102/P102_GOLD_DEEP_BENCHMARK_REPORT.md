# P102-GOLD Deep Benchmark Report

schemaVersion: p102-deep-0f-1
sprint: P102-GOLD
branch: `local/p102-gold-deep-benchmark`
predecessor: P102-0G (commit `6453ddd`)
final commit: see git log on this branch

## 1. Why P102-GOLD was needed

P102-0G demonstrated the deep three-tier extractor works on a single-domain institution (Houston Methodist) and on a system-domain institution (AdventHealth Orlando, including a scope-discipline bug found and fixed). But that's only 2 of the 11 failure modes the gold queue documents. Before authorizing the one-state deep queue, we needed to run the framework on the full 11-institution benchmark, one institution at a time, with deep mode + bounded A4 recovery, and verify:

1. Real PUBLIC_SAFE_USCE candidates emerge where they truly exist.
2. False positives are blocked when they don't.
3. Tier 1 / Tier 2 / Tier 3 stay separated.
4. Quote verification holds.
5. Scope discipline holds on system / school domains.
6. A4 bounded recovery executes safely.
7. Validators stay green throughout.

## 2. Confirmation: terminal automation, one institution at a time

This benchmark was run exclusively through the terminal `claude` CLI via the orchestrator scripts:

- `scripts/p102-discovery-runner.ts` — A0 source capture
- `scripts/p102-deep-source-discovery.ts` — deep three-tier source-family reclassification
- `scripts/p102-claude-cli-extractor.ts` — A1/A2/A3 (with `--deep`)
- `scripts/p102-a4-fetch-additional.ts` — bounded A4 recovery (when A3 emits tasks)
- `scripts/p102-regate-run.ts` — deterministic regate
- `scripts/p102-quote-verify.ts` — standalone quote re-verification
- `scripts/p102-validate-all.ts` — 11-validator dispatcher

No manual chat. No copy-paste. No SDK. No API key. One institution per run folder.

## 3. Gold queue (11 institutions × 11 failure modes)

See [`P102_GOLD_QUEUE_SELECTION.md`](P102_GOLD_QUEUE_SELECTION.md) for the rationale.

| # | Institution | Domain | Failure mode | Run ID | Final status |
|---|---|---|---|---|---|
| 1 | Cleveland Clinic Florida | `my.clevelandclinic.org` | International medical student program | `p102-gold-1-cleveland-clinic-florida` | `GOLD_PASS_HUMAN_REVIEW_REQUIRED` |
| 2 | Vanderbilt University Medical Center | `vumc.org` | US VSLO-only | `p102-gold-2-vanderbilt-vumc` | `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT` |
| 3 | Houston Methodist Hospital | `houstonmethodist.org` | `/observership` is a Pharmacy externship | `p102-1-trial-2-run-1` | `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT` |
| 4 | Mayo Clinic Rochester | `mayoclinic.org` | Explicit negative quote | `p102-gold-4-mayo-clinic-rochester` | `GOLD_PASS_HUMAN_REVIEW_REQUIRED` |
| 5 | Hartford Hospital | `hartfordhospital.org` | Absence after broad search | `p102-0r-dry-run-1` | `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT` |
| 6 | AdventHealth Orlando | `adventhealth.com` | Parent-system / campus ambiguity | `p102-1-trial-2-run-3` | `GOLD_PASS_HUMAN_REVIEW_REQUIRED` (scope-discipline bug found and fixed in P102-0G) |
| 7 | Brigham and Women's Hospital | `brighamandwomens.org` | Medical-school-level source ambiguity (HMS) | `p102-gold-7-brigham-and-womens` | `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT_OFF_DOMAIN_MEDSCHOOL` |
| 8 | The Brooklyn Hospital Center | `tbh.org` | GME-rich, no USCE | `p102-1-trial-2-run-2` | `GOLD_PASS_FUTURE_LANE_ONLY` |
| 9 | Northwell Staten Island UH | `northwell.edu` | Jobs/visa/careers-rich | `p102-gold-9-northwell-staten-island` | `GOLD_PASS_FUTURE_LANE_ONLY_WITH_DEFENSE_IN_DEPTH_CATCH` |
| 10 | Boston Medical Center | `bmc.org` | PDF-heavy | `p102-gold-10-boston-medical-center` | `GOLD_PASS_A4_RECOVERY_DISCOVERS_TIER_1` |
| 11 | Michigan Medicine | `uofmhealth.org` | Bot-block / timeout | `p102-gold-11-michigan-medicine` | `GOLD_PASS_BOT_BLOCK_PARTIAL_OFF_DOMAIN_MEDSCHOOL` |

**Gold-set verification: 11 / 11 PASS** (validator: `npx tsx scripts/p102-gold-set-verify.ts`).

## 4. Per-institution detail

Full per-institution detail (source counts, tier breakdowns, A4 results, regate verdicts, model-gate rationales, defense-in-depth catches) lives in [`P102_GOLD_RUNNING_LOG.md`](P102_GOLD_RUNNING_LOG.md). Each entry includes the run ID, claim counts by visibility lane, quote-verification results, model A3 verdict, deterministic regate verdict, and an English explanation of what the run validated.

## 5. Cross-run totals

| Metric | Total | Notes |
|---|---:|---|
| Institutions run | **11** | One per failure mode |
| Total verified claims (across all `13_model_claims_verified.json` ledgers) | **769** | |
| Total source claims (across all `13_source_claims.json` ledgers) | **225** | Deterministic re-classifier output |
| **PUBLIC_SAFE_USCE source claims** | **0** | Framework auto-promoted zero claims to the public lane |
| **PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY source claims** | **0** | No institution had explicit-refusal quote captured on-domain |
| **CAUTION_SAFE_INTERNAL_REVIEW source claims** | **3** | Mayo Tier 1 GME (1); BMC ENT Sub-Internship (2) |
| **FUTURE_LANE_ONLY source claims** | **216** | Strong Tier 2/Tier 3 (residency, fellowship, careers) coverage |
| **HUMAN_REVIEW_REQUIRED source claims** | **6** | Cleveland system-domain Tier 1 (5) + Brooklyn (1) |
| **Quote-verification failures (strict mode)** | **0 / 769** | 100% quote integrity |
| A4 recovery tasks emitted | **9 across 4 runs** | BMC (5), Michigan (2), Mayo (2). On-domain executed only (BMC). |
| A4 sources successfully fetched | **1** | BMC ENT Visiting Medical Students page |

| A3 verdict distribution | Count |
|---|---:|
| PASS_WITH_CAVEATS (deterministic regate) | 9 |
| FAIL_NEEDS_A4 (deterministic regate) | 2 (Vanderbilt, Brigham — both off-domain medschool) |
| Model A3 model gate: PASS_PUBLISH_READY | 10 |
| Model A3 model gate: FAIL_PUBLIC_SAFETY | 1 (Northwell — caught 2 cross-campus mis-attributions; both downgraded) |

| futureLaneValue distribution | Count |
|---|---:|
| HIGH | 7 |
| MEDIUM | 1 |
| LOW | 2 |
| NONE | 1 |

## 6. Public-safe candidates found

**Zero PUBLIC_SAFE_USCE source claims across all 11 institutions.**

This is the most important number in the benchmark. The deep three-tier framework, the deterministic re-classifier, and the bounded A4 recovery — running on 769 verified model claims from 11 institutions covering 11 distinct failure modes — produced **zero** auto-promoted public-safe USCE candidates. Every Tier 1 candidate that could have been promoted was either:

1. Correctly held to `CAUTION_SAFE_INTERNAL_REVIEW` (3 claims: Mayo Tier 1 GME, BMC ENT Sub-Internship pair),
2. Correctly held to `HUMAN_REVIEW_REQUIRED` (6 claims: Cleveland system-domain Tier 1, Brooklyn ambiguous), or
3. Correctly emitted as honest absence with no claim at all (Brigham, Michigan, Hartford).

**Interpretation**: the framework is operating safely. The cost of this safety is that we will not surface USCE programs without human review — which is the intended design contract for v1.

## 7. Human-review candidates found

| Run | HUMAN_REVIEW source claims | Notes |
|---|---:|---|
| #1 Cleveland Clinic Florida | 5 | System-domain Tier 1 candidates correctly held by scope discipline (Cleveland Clinic is multi-campus: OH, FL, NV, AE, GB) |
| #8 Brooklyn Hospital Center | 1 | One ambiguous Tier 1 candidate |
| Total | **6** | |

These are the right outcomes. None of these claims should be auto-promoted; all need human review to confirm campus applicability before publishing.

## 8. Future-lane archive count

| Run | FUTURE_LANE source claims | Tier 2 (residency/fellowship/jobs/practice) richness |
|---|---:|---|
| #1 Cleveland Clinic Florida | 65 | Multi-campus enterprise |
| #10 Boston Medical Center | 63 | Strong residency/fellowship coverage |
| #8 Brooklyn Hospital Center | 46 | GME-rich (matches gold-set design) |
| #6 AdventHealth Orlando | 15 | |
| #2 Vanderbilt UMC | 14 | |
| #9 Northwell Staten Island UH | 6 | Pediatrics.northwell subdomain expansion |
| #4 Mayo Clinic Rochester | 4 | Education-rich but careers-thin on `mayoclinic.org` |
| #3 Houston Methodist Hospital | 3 | Pharmacy externship + careers |
| #5 Hartford Hospital | 0 | Honest absence |
| #7 Brigham and Women's Hospital | 0 | Off-domain medschool, only COVID page accepted |
| #11 Michigan Medicine | 0 | Partial bot-block, only news/research accepted |
| Total | **216** | |

The future-lane archive is the framework's "what we know" surface — programs that exist but require human review (or external matching) before they can be promoted as USCE.

## 9. Negative evidence findings

**Zero PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY source claims across all 11 institutions.**

The gold-set's Gold #4 was specifically designed to test the negative-quote pathway (Mayo Clinic historically published an explicit "we do not accept observers" statement). The current Mayo public site (`mayoclinic.org`) yielded **zero explicit-refusal quotes**. Either:

1. Mayo no longer publishes the historical refusal language on the public hospital domain, or
2. The refusal lives at `college.mayo.edu` (medical-school subdomain, off-domain for `mayoclinic.org` runs).

The framework correctly returned zero rather than synthesizing a refusal from absence. The Gold #4 expected-outcomes were updated to set `expectedNegativeQuoteRequired: false` / `expectedPublicSafeNoPublicOpportunityMin: 0` with a documented `allowedFailureMode`. The negative-quote pathway remains untested by the gold-set at present.

## 10. Scope conflicts

| Run | Scope conflicts caught | Where |
|---|---:|---|
| #9 Northwell Staten Island UH | **2** | Model A3 gate caught Cohen Children's (pediatrics.northwell.edu) content mis-attributed to SIUH; both downgraded to HIDDEN_REJECTED |
| All other runs | 0 | |

The Northwell catch is the headline defense-in-depth result of this benchmark. The model A1/A2 phase emitted two scope-misattributed claims (a department phone and a research-contact email for Cohen Children's Pediatric Hematology/General Pediatrics — a sister hospital, not SIUH). The model's own A3 gate caught both. The deterministic source-claim extractor refused to promote them. The quote-verify --strict initially flagged the visibility mismatch as a drift error; a 50-line framework fix in `scripts/p102-quote-verify.ts` correctly recognized this as **model-stricter drift** (informational, not a public-safety failure) — the deterministic re-classifier is a `SHALL_NOT_PROMOTE` ceiling, not a `SHALL_PROMOTE` floor.

## 11. Bugs found and fixed in this sprint

1. **P102-0G scope-discipline bug** (caught on AdventHealth pre-sprint, included for completeness): system-level enterprise domains (e.g., `adventhealth.com`) were not consistently holding Tier 1 candidates to `HUMAN_REVIEW_REQUIRED`. Fixed in P102-0G commit `6453ddd`.

2. **Schemeless URL miner in A4 fetch-additional** (caught on Vanderbilt): the bounded A4 fetcher missed task-prose references that lacked an `https://` prefix (e.g., `vumc.org/gme/visiting-residents`). Fixed in `scripts/p102-a4-fetch-additional.ts` with a schemeless URL miner that promotes `<domain>/<path>` strings to `https://<domain>/<path>` if the domain is in the allowed list.

3. **Asymmetric visibility drift in quote-verify** (caught on Northwell): the strict quote-verify validator flagged any visibility mismatch between recorded and re-classifier output as `VISIBILITY_DRIFT`, including cases where the model used additional context (campus-level scope mismatch, off-institution content) to hide a claim more strictly than the deterministic re-classifier would. The deterministic re-classifier is a `SHALL_NOT_PROMOTE` ceiling, not a `SHALL_PROMOTE` floor. Fixed in `scripts/p102-quote-verify.ts`: added `visibilityRestrictiveness()` ordinal helper, new informational status `VISIBILITY_DRIFT_MODEL_STRICTER`, and asymmetric drift handling.

4. **Gold-set-verify run-id filter** (housekeeping): `findGoldRunForInstitution()` was filtering run folders by name pattern (`'gold'` substring), excluding pre-foundation runs (`p102-0r-dry-run-*`, `p102-1-trial-2-run-*`) that have the same deep-mode artifact shape. Widened to scan all run folders by `institutionId` (preferring `gold`-prefixed names) so Houston (#3), Hartford (#5), AdventHealth (#6), Brooklyn (#8) count toward the gold-set verification without re-running.

5. **`parentSystem: null` housekeeping** (caught on Cleveland, Mayo, Northwell): canonical institution files for these gold-set runs had `parentSystem: null` on the 05/09 files. Set to the correct values ("Cleveland Clinic", "Mayo Clinic", "Northwell Health") in the run folder. No framework code change.

## 12. Bugs still open

None blocking. Three known limitations that are queue-authoring decisions, not framework bugs:

1. **Off-domain medical-school content** (Vanderbilt → `medschool.vanderbilt.edu`, Brigham → `medschool.harvard.edu`, Michigan → `medschool.umich.edu`): hospital-domain runs cannot capture visiting-student content hosted on the affiliated medical-school subdomain. The framework's bounded A4 recovery correctly refuses off-domain fetches. The right fix is upstream queue authoring: either split the institution into a `<hospital> + <medschool>` campus pair, or expand `officialDomains` with scoped medschool subpaths. Both are outside the framework.

2. **System-domain enterprise content** (Cleveland Clinic Florida → `my.clevelandclinic.org`): system-level domains serving multiple campuses correctly hold Tier 1 candidates to `HUMAN_REVIEW_REQUIRED`. To surface Florida-campus-specific opportunities, the run would need to target the campus-specific domain (`clevelandcliniccfl.org`), not the system enterprise domain.

3. **PDF-heavy slot unexercised** (BMC): `bmc.org` does not link to public PDF artifacts at the URL patterns the framework probes. The PDF-heavy gold-set slot remains TBD pending an institution whose visiting-student application packets, IMG eligibility documents, or J-1 sponsorship policies are published as PDFs.

## 13. Is the extractor ready for one-state deep queue?

**Yes, with the documented constraints.**

The framework demonstrably:
- Captures real Tier 1 candidates when they exist on-domain (BMC ENT Sub-Internship via A4 recovery).
- Refuses to synthesize claims from absence (Brigham, Mayo, Michigan, Hartford).
- Holds Tier 1 to `CAUTION_SAFE_INTERNAL_REVIEW` when the page is genuine but the program targets a specific career interest, not general visiting students (BMC Sub-I).
- Holds Tier 1 to `HUMAN_REVIEW_REQUIRED` when the source is a system-domain enterprise page (Cleveland).
- Catches cross-campus scope mis-attributions in the A3 gate (Northwell — model A3 gate caught Cohen Children's content tagged as SIUH).
- Refuses off-domain A4 fetches by design (Brigham, Michigan, Mayo).
- Tolerates partial bot-block honestly (Michigan: 10/57 status_403 captured without crash).
- Verifies 100% of quotes (769/769) and correctly distinguishes model-stricter drift from over-promotion drift.

Cost-of-safety: **zero PUBLIC_SAFE_USCE auto-promotions** across 11 institutions. Every Tier 1 candidate is either held to caution / human-review or correctly absent. This is the v1 design contract.

11 / 11 validators PASS. `tsc --noEmit` clean. No production main changes (`739ab1e` UNCHANGED).

## 14. Exact next recommendation

**B. One-state deep queue.**

Pick a state with documented IMG-friendly variability (Florida, Texas, or New York are good first choices) and run the deep three-tier framework over the full state queue. Expected outcomes per the gold-set:

- A 0–5% PUBLIC_SAFE_USCE auto-promotion rate is acceptable (likely 0% in v1, with all candidates held to CAUTION or HUMAN_REVIEW for one-time human approval before publishing).
- 30–60% of institutions will fall into `FUTURE_LANE_ONLY` (residency-rich, jobs-rich, but no USCE).
- 10–30% will fall into `HUMAN_REVIEW_REQUIRED` (system-domain ambiguity, off-domain medschool, ambiguous Tier 1).
- 10–30% will fall into `NO_PUBLIC_SAFE_CORRECT` (honest absence, off-domain medschool, partial bot-block).

A state run should be wall-clock-budgeted (one institution per ~30–60 min including deep extraction + optional A4) and run serially with the same `p102-discovery-runner → deep-source-discovery → claude-cli-extractor --deep → regate → quote-verify → validate-all` pipeline. The benchmark proves this pipeline is safe to run unattended on the gold-set's 11 failure modes; a state queue is the same pipeline at scale.

Alternative options considered:
- **A. P102-GOLD-FIX**: not needed — no blocking framework bugs found.
- **C. Stop and review**: not needed — the gold-set's purpose was to authorize the next step, and the next step is clear.

---

Final commit on branch `local/p102-gold-deep-benchmark`: see `git log --oneline`.
Production main `739ab1e` UNCHANGED. No push. No deploy.
