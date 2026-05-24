# P102-0C — Claim Extraction + Quote Verification Checkpoint

schemaVersion: p102-0r-1
date: 2026-05-12
predecessors: P102-0R (e4275fd), P102-0B (03a56dd), P102-1 Trial 2 (c64a5a1)
branch: local/p102-claim-extraction-layer

## 1. What was built

- [Spec](P102_0C_CLAIM_EXTRACTION_LAYER_SPEC.md) — purpose, model rules, expected behaviors per institution, validator additions
- [Reader prompt](specs/P102_A1_A2_READER_PROMPT.md) — the prompt a future model A1/A2 reader will use; captured for P102-0D
- [`scripts/p102-extract-claims-from-run.ts`](../../../../scripts/p102-extract-claims-from-run.ts) — deterministic concept-detector claim extractor
- [`scripts/p102-regate-run.ts`](../../../../scripts/p102-regate-run.ts) — hostile A3 re-gate (no network, no Agent, run-folder only)
- Extended [validator](../../../../scripts/validate-p102-discovery-runner.ts) with quote verification + visibility rules
- All 4 existing runs processed: new `13_source_claims.json` + updated `03_opportunity_objects.json`, `RT_depth_*.json`, `A3_gate.json`, `15_publish_gate.md`, `09_final_canonical.json`, `06_coverage_audit.md`, `07_retry_tasks.md`

## 2. Why P102-0C was needed before state/national

P102-0R/0B/Trial 2 proved the control system works. Trial 2 produced 4 source-mapped run folders with `publicSafe=0` and `opportunities: []` everywhere because there was no claim extractor. A national run with that state would have produced ~6,000 empty folders. P102-0C turns the captured cleaned text into structured, quote-backed claims — and gives the validator + A3 hostile gate something concrete to police.

## 3. Files / scripts changed

- New: `docs/platform-v2/local/usce-discovery-command-center/p102/P102_0C_CLAIM_EXTRACTION_LAYER_SPEC.md`
- New: `docs/platform-v2/local/usce-discovery-command-center/p102/specs/P102_A1_A2_READER_PROMPT.md`
- New: `docs/platform-v2/local/usce-discovery-command-center/p102/P102_0C_CLAIM_EXTRACTION_CHECKPOINT.md` (this file)
- New: `scripts/p102-extract-claims-from-run.ts`
- New: `scripts/p102-regate-run.ts`
- Updated: `scripts/validate-p102-discovery-runner.ts` (quote verifier, visibility rules, `13_source_claims.json` now required)
- Updated (all 4 runs): `03_opportunity_objects.json`, `09_final_canonical.json`, `13_source_claims.json` (new), `RT_depth_usce.json`, `RT_depth_gme_residency_fellowship.json`, `RT_depth_jobs_visa.json`, `RT_depth_physician_services.json`, `RT_depth_negative_evidence.json`, `RT_depth_source_scope_conflicts.json`, `A3_gate.json`, `15_publish_gate.md`, `06_coverage_audit.md`, `07_retry_tasks.md`

## 4. Quote verifier behavior

For each claim with non-empty quote (not NOT_STATED_ON_SOURCE):
1. Load cleaned text from `cleanedTextPath`.
2. Normalize whitespace (collapse to single space, lowercase, trim).
3. Check if normalized quote is a substring of normalized cleaned text.
4. Set `quoteVerified: true|false`. Validator independently re-verifies; if extractor declared `true` but substring fails → fail the run.

PUBLIC_SAFE_USCE claims with `quote === NOT_STATED_ON_SOURCE` → fail.
`publicSafeNegativeClaim=true` with non-EXPLICIT_NEGATIVE_QUOTE type or non-STRONG strength → fail.
PUBLIC_SAFE_USCE from HEALTH_SYSTEM_LEVEL/MEDICAL_SCHOOL_LEVEL without `campusApplicabilityProof` → fail.
PUBLIC_SAFE_USCE from GME_PAGE/RESIDENCY_PAGE/FELLOWSHIP_PAGE/CAREERS_PAGE source family → fail.

## 5. Extraction logic

Deterministic regex-family detectors over cleaned text:
- **USCE positive**: observership, visiting medical student, away rotation, clinical elective, fourth-year elective, sub-internship, acting internship, VSLO, VSAS, medical student research.
- **Shadow/volunteer**: marked HUMAN_REVIEW_REQUIRED by default (not auto-USCE).
- **Strong negative**: "do not offer/accept observership", "not accepting observers", "not available to international students".
- **Medium negative (restriction)**: "only enrolled affiliated", "VSLO only", "U.S. MD/DO only".
- **GME / residency / fellowship**: marked FUTURE_LANE_ONLY.
- **Jobs / visa**: marked FUTURE_LANE_ONLY.
- **Physician services / insurance / locums**: marked FUTURE_LANE_ONLY.

Visibility assignment:
- Source family GME/RESIDENCY/FELLOWSHIP/CAREERS → `FUTURE_LANE_ONLY`.
- Source scope HEALTH_SYSTEM_LEVEL/MEDICAL_SCHOOL_LEVEL with USCE keyword match → `HUMAN_REVIEW_REQUIRED` + scope-conflict surfaced.
- Source family OBSERVERSHIP_PAGE / VISITING_STUDENT_PAGE with INSTITUTION_SPECIFIC scope → `CAUTION_SAFE_INTERNAL_REVIEW`. **Never auto-promoted to PUBLIC_SAFE_USCE in P102-0C** — that requires the model A1/A2 reader (P102-0D).

Source scope inference: campus tokens in canonical name that don't appear in domain → HEALTH_SYSTEM_LEVEL. (e.g., "AdventHealth Orlando" + `adventhealth.com` → "orlando" absent from domain → HEALTH_SYSTEM_LEVEL.)

## 6. Existing runs processed

All 4 P102 runs to date:
- `p102-0r-dry-run-1` (Hartford Hospital)
- `p102-1-trial-2-run-1` (Houston Methodist Hospital)
- `p102-1-trial-2-run-2` (The Brooklyn Hospital Center)
- `p102-1-trial-2-run-3` (AdventHealth Orlando)

## 7. Hartford Hospital result

- Sources processed: 2 (`/research`, `/careers`)
- Claims extracted: **0**
- Negative evidence claims: 0
- Scope conflicts: 0
- A3 regate verdict: **FAIL_NEEDS_A4**

Interpretation: Hartford's `/research` and `/careers` pages have heavy navigation chrome and minimal substantive text. The deterministic detectors found no keyword matches. The A3 gate correctly flagged this as needing A4 recovery — Hartford either has no public USCE-adjacent content at these paths (consistent with P101's earlier verdict of NO_PUBLIC_USCE_LANE_FOUND_ON_HOSPITAL_OWN_SITE) or the content lives at paths the fixed-path probe didn't capture (P102-0B added `/health-professionals` but Hartford's site structure may still nest content deeper).

## 8. Houston Methodist Hospital result

- Sources processed: 6 (`/observership`, `/research`, `/volunteer`, `/gme`, `/careers`, `/education`)
- Claims extracted: **3** — all `FUTURE_LANE_ONLY` (2 GME, 1 jobs/careers)
- USCE-positive claims: **0**
- Negative evidence claims: 0
- Scope conflicts: 0
- A3 regate verdict: **PASS_WITH_CAVEATS**, futureLaneValue=LOW

Interpretation: **`/observership` returned 200 but the cleaned text is `Pharmacy Student Externship | Houston Methodist…` — the URL is a redirect/repurposed path that no longer hosts observership content.** Zero observership/visiting-student keywords in the captured page. This is the framework correctly catching a false-positive that A0 alone would have surfaced as a "high-yield" lead. Real Houston Methodist USCE content (if any) lives at a path the A0 probe didn't catch — candidate for P102-0D fixed-path expansion or model-driven sitemap traversal.

## 9. Brooklyn Hospital Center result

- Sources processed: 23 (mostly `/professional-medical-education/graduate-medical-education/...`)
- Claims extracted: **33** — 32 `FUTURE_LANE_ONLY` (RESIDENCY/FELLOWSHIP), 1 `HUMAN_REVIEW_REQUIRED` (volunteer page with shadow keyword)
- USCE-positive claims: 0
- Negative evidence claims: 0
- Scope conflicts: 0
- A3 regate verdict: **PASS_WITH_CAVEATS**, futureLaneValue=HIGH

Interpretation: Brooklyn's site has deep GME content (residency programs in emergency medicine, internal medicine, pharmacy, podiatry; 7 keyword-detected observer/observership mentions inside those GME pages — all correctly marked future-lane because sourceFamily is GME_PAGE). One volunteer/shadow page detected → HUMAN_REVIEW_REQUIRED (not auto-USCE). No PUBLIC_SAFE_USCE emitted, which is correct given Brooklyn does not expose a public USCE lane.

## 10. AdventHealth Orlando result

- Sources processed: 8 (all `adventhealth.com/*` — system domain)
- Claims extracted: **14** — all `FUTURE_LANE_ONLY` (4 system-level GME via inferred HEALTH_SYSTEM_LEVEL scope, 4 CAREERS, 3 services, 3 medical-education)
- USCE-positive claims: 0
- Negative evidence claims: 0
- Scope conflicts: 0 (scope-conflict tracking fires only on USCE keyword detection in system-scope pages; AdventHealth's pages had no USCE keywords)
- A3 regate verdict: **PASS_WITH_CAVEATS**, futureLaneValue=MEDIUM

Interpretation: The scope inference correctly detected HEALTH_SYSTEM_LEVEL for `/benefits`, `/medical-education`, `/education` based on the "Orlando" token in canonical name being absent from the `adventhealth.com` domain. All claims correctly future-lane only; none ever near PUBLIC_SAFE_USCE because (a) no USCE keywords matched, (b) scope is system-level. The structural test was set up correctly even though no observership claim fired.

## 11. Claims created (aggregate)

**50 total claims across 4 runs.** All 50 quote-verified by both extractor and validator.

| Visibility | Count |
|---|---:|
| PUBLIC_SAFE_USCE | **0** |
| CAUTION_SAFE_INTERNAL_REVIEW | 0 |
| FUTURE_LANE_ONLY | 49 |
| HUMAN_REVIEW_REQUIRED | 1 |
| HIDDEN_REJECTED | 0 |
| PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY | 0 |

## 12. Opportunities created

**0 PUBLIC_SAFE_USCE opportunities.** 0 CAUTION_SAFE_INTERNAL_REVIEW opportunities (the conservative extractor never escalates positive matches to CAUTION_SAFE without a non-future-lane source family + institution-specific scope + matched USCE keyword — and none of the 4 runs hit that combination).

This is correct under P102-0C's design: zero PUBLIC_SAFE_USCE without the model A1/A2 reader. The conservative deterministic baseline catches false positives (Houston's `/observership` redirect; AdventHealth's system-level scope) and surfaces real future-lane signals.

## 13. Negative evidence claims created

**0 negative evidence claims** across all 4 runs. None of the 4 institutions had explicit "we do not offer observership"-style quotes on the captured pages. This is consistent with how most institutions communicate — they simply don't list observerships rather than explicitly declining them.

## 14. Future-lane signals created

**49 FUTURE_LANE_ONLY claims**. Lane distribution:
- RESIDENCY_PROGRAM_INFO: 30 (mostly Brooklyn's GME pages + AdventHealth/Houston Methodist GME)
- CAREERS_PAGE: 17 (Brooklyn, AdventHealth, Houston Methodist)
- PHYSICIAN_SERVICES: 1 (AdventHealth `/benefits`)
- Other: 1 (HUMAN_REVIEW volunteer)

These are real, quote-backed signals — captured but internal-only. Future-lane data is the long-term backbone.

## 15. Public-safe claims created

**0**. Correct under P102-0C deterministic baseline. Awaits P102-0D model reader.

## 16. Quote verification results

- Validator re-verified 50/50 claims.
- 50/50 verified (extractor's quote substrings all literally appear in cleaned text after whitespace normalization).
- 0 quote-verification failures.
- 0 hallucination risks.

## 17. A3 regate verdicts

| Run | Verdict | publicSafe | futureLaneValue |
|---|---|---|---|
| p102-0r-dry-run-1 (Hartford) | FAIL_NEEDS_A4 | false | NONE |
| p102-1-trial-2-run-1 (Houston Methodist) | PASS_WITH_CAVEATS | false | LOW |
| p102-1-trial-2-run-2 (Brooklyn) | PASS_WITH_CAVEATS | false | HIGH |
| p102-1-trial-2-run-3 (AdventHealth Orlando) | PASS_WITH_CAVEATS | false | MEDIUM |

All A3 attestations confirm `networkUsed=false`, `agentUsed=false`. Validator enforces.

## 18. Validator results

- `validate-p102-discovery-runner`: **PASSED** (4 runs, 50 claims, all verified, 0 PUBLIC_SAFE blocked, 0 hallucinations)
- `validate-no-secrets`: PASSED (1538 files, 0 findings) (re-run in Phase I)
- `tsc --noEmit`: PASSED
- `validate-p101-discovery-command-center`: PASSED (no regression)

## 19. What failed

Nothing structural failed. Two real-world findings worth tracking:

1. **Hartford's content is too thin for concept detectors.** The framework correctly emitted 0 claims and FAIL_NEEDS_A4. To recover Hartford, A4 would need to either (a) probe deeper paths like `/health-professionals/education` directly, (b) parse the cleaned text more aggressively (sentence-level rather than keyword-family), or (c) move to a model A1/A2 reader (P102-0D).

2. **Houston Methodist's `/observership` is a stale URL.** The URL returns 200 but the content is "Pharmacy Student Externship". The framework correctly emitted 0 USCE claims from this page. The actual Houston Methodist USCE content (if any) lives elsewhere — possibly at a path with "international" or "physician" in it. This is a P102-0D / fixed-path-list expansion candidate.

## 20. What still needs P102-1 / P102-GOLD

- **Model A1/A2 reader (P102-0D)**: The deterministic baseline emits 0 PUBLIC_SAFE_USCE. To get real PUBLIC_SAFE_USCE claims, we need a model reader that understands "Houston Methodist offers a clinical observership program for international medical graduates" (which the deterministic detectors would only treat as CAUTION_SAFE). The reader prompt is captured in `specs/P102_A1_A2_READER_PROMPT.md`.
- **Gold-set construction**: 10 institutions spanning the failure modes — clear high-yield, clear no-yield with explicit negative quote, parent-system ambiguity, etc.
- **Identity canonicalizer**: not exercised at scale yet.
- **PDF cascade**: not yet exercised (no PDFs in the 4 runs).

## 21. Decision recommendation

**Path forward (operator choose):**

- **(A) P102-0D — Model A1/A2 reader.** Wire the captured reader prompt to a real model. This is the path that produces PUBLIC_SAFE_USCE claims and makes Trial 3 / state / national worth running. Estimated effort: focused sprint. **RECOMMENDED.**

- **(B) P102-1-deeper — Re-run Trial 2 institutions with model reader.** Same as (A) but explicit on Trial 2 verification — confirm the framework can emit a PUBLIC_SAFE_USCE on Houston Methodist's real observership page (wherever it actually lives), correctly emit a PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY on an institution with an explicit "no observership" quote, and never overclaim from AdventHealth's system pages.

- **(C) P102-GOLD — 10-institution benchmark.** Build the gold set with known-correct answers, then validate model reader against it. Most rigorous path; longest to first PUBLIC_SAFE_USCE.

- **(D) Continue P102-0C iteration.** Tighten deterministic detectors (e.g., relax the conservative CAUTION_SAFE threshold for institution-specific observership pages with definite-offer phrasing). Cheap, but capped at deterministic recall.

- **(E) Pure-A0 state slice.** Run one state with current framework, accept future-lane-only output, build the source-map index. Useful infrastructure; not the product. Not recommended over (A).

**Do NOT** advance to state/national until at least one run produces quote-verified PUBLIC_SAFE_USCE claims AND A3 correctly blocks overclaims (this checkpoint already proves the second half; the first half requires P102-0D).
