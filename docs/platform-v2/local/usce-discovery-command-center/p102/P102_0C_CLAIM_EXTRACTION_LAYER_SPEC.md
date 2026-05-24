# P102-0C — Claim Extraction + Quote Verification Layer Spec

schemaVersion: p102-0r-1
status: P102-0C (claim extraction over existing 4 runs; no new institutions)
predecessors: P102-0R (commit e4275fd), P102-0B (commit 03a56dd), P102-1 Trial 2 (commit c64a5a1)
branch: local/p102-claim-extraction-layer

## 1. Why P102-0C exists

P102-0R and P102-0B built the deterministic control system (A0 probe → source map → A1.5 audit → A2 skeleton → A3 hostile gate). P102-1 Trial 2 confirmed the control system works on 3 institutions. But every Trial-2 run emitted `publicSafe=0` and `opportunities: []` because the model A1/A2 reader was intentionally deferred.

P102-0C closes that gap. It turns the captured cleaned text into structured claims with quote + sourceHash + quoteVerified, using deterministic concept detectors over already-captured text. This unblocks Trial 3 (gold set) and the eventual state/national progression — without which a national run produces source-mapped folders with zero claims.

## 2. Difference between A0 source-map and A1/A2 claim extraction

| Stage | What it produces | What it does NOT produce |
|---|---|---|
| A0 (P102-0R/0B) | Deterministic source map: robots, sitemap, fixed-path probes, JSON-LD, cleaned text, hashes | No claims, no opportunities, no quote-backed statements |
| A1/A2 (P102-0C) | Quote-backed claims: positive opportunity claims, negative evidence claims, future-lane signals, source-scope conflicts, missing-field unresolveds | No new HTTP fetches, no new institutions, no Agent |

A1/A2 reads only the cleaned text and raw HTML files already captured during A0. No network. No subagents.

## 3. Existing 4-run benchmark (ground truth from Trial 1 + Trial 2)

| Run | Institution | Accepted sources | Key signal | Expected outcome with P102-0C |
|---|---|---|---|---|
| p102-0r-dry-run-1 | Hartford Hospital | 2 (`/research`, `/careers`) | Both future-lane | 0 PUBLIC_SAFE_USCE; possibly 1 future-lane CAREERS signal |
| p102-1-trial-2-run-1 | Houston Methodist | 6 (incl. **`/observership`**, `/gme`, `/volunteer`, `/research`, `/careers`, `/education`) | Real `/observership` page captured | Candidate OBSERVERSHIP opportunity if quote-backed; future-lane GME/jobs signals |
| p102-1-trial-2-run-2 | Brooklyn Hospital Center | 23 (mostly GME residency/fellowship/pharmacy + volunteer) | Deep GME content, zero USCE-specific pages | 0 PUBLIC_SAFE_USCE; many future-lane GME signals; possibly volunteer signals as low-confidence USCE leads or rejection evidence |
| p102-1-trial-2-run-3 | AdventHealth Orlando | 8 (all system-level adventhealth.com/*) | System-scope content | 0 PUBLIC_SAFE_USCE (scope mismatch — system pages cannot prove Orlando-specific claims); future-lane GME/jobs signals; source-scope conflicts surfaced |

## 4. Model reader rules

The claim extractor must obey:

1. **Read only artifacts already captured.** Cleaned text files at `T7/.../p102-national-runner/artifacts/<run_id>/cleaned_text/*.txt` and raw HTML at `.../raw_html/*.html`. No network.
2. **No Agent.** Single reader, single writer. The extractor script is the writer; the deterministic concept detectors are the reader.
3. **No guessing.** A keyword match is not a claim — only a candidate. A claim requires (a) a keyword family match AND (b) an extractable quote that contains the keyword AND (c) source URL + hash + cleaned-text path.
4. **Every claim needs `quote` + `sourceUrl` + `sourceHash` + `cleanedTextPath`.** Quote text must literally appear in cleaned text (whitespace-normalized).
5. **NOT_STATED_ON_SOURCE is honest.** If a field is absent from source text, the claim uses `NOT_STATED_ON_SOURCE` rather than fabricating.
6. **Future-lane is separated from public USCE.** Residency, fellowship, careers, visa, services pages produce `FUTURE_LANE_ONLY` claims, never `PUBLIC_SAFE_USCE`.

## 5. Claim types

The extractor emits one or more of these per source:

- **Positive opportunity claim** — a USCE/observership/visiting-student/elective signal with quote + source. Goes into `03_opportunity_objects.json` and `RT_depth_usce.json`.
- **Negative evidence claim** — explicit "we do not offer X" quote. Goes into `RT_depth_negative_evidence.json` with `publicSafeNegativeClaim` rules per the schema.
- **Future-lane signal** — GME/residency/fellowship/careers/visa/services content. Goes into `RT_depth_gme_residency_fellowship.json`, `RT_depth_jobs_visa.json`, or `RT_depth_physician_services.json`.
- **Source-scope conflict** — claim whose scope (e.g., system-level) does not match what would be needed for a public-safe institution-specific claim. Goes into `RT_depth_source_scope_conflicts.json`.
- **Missing-field unresolved** — fields the source could have answered but didn't (e.g., observership page exists but doesn't state IMG eligibility). Goes into `07_retry_tasks.md` for human review (not auto-retry; that's a P102-0D concern).

## 6. Houston Methodist expected behavior

`https://houstonmethodist.org/observership` returned 200 with a real page. The extractor should:
- Detect "observership" keyword family on the cleaned text of `/observership`.
- Extract the surrounding sentence/paragraph as a quote candidate.
- Build a candidate `IMG_OBSERVERSHIP` opportunity if the quote contains a definite-offer statement.
- Mark it `CAUTION_SAFE_INTERNAL_REVIEW` initially (not PUBLIC_SAFE_USCE) until A3 verifies quote and scope.
- Source scope: probably `INSTITUTION_SPECIFIC` (single primary domain hostmethodist.org), so PUBLIC_SAFE_USCE is reachable in principle — but only if the quote-verifier and scope rules confirm.

The framework should NOT auto-promote to PUBLIC_SAFE_USCE without these checks.

## 7. Brooklyn expected behavior

`tbh.org` captured 23 sources, all GME/fellowship/volunteer. The extractor should:
- Mark all `/professional-medical-education/graduate-medical-education/.../*` pages as `FUTURE_LANE_ONLY` (lane: RESIDENCY_PROGRAM_INFO / FELLOWSHIP_PROGRAM_INFO).
- Detect volunteer pages but NOT auto-classify as USCE — volunteer is its own category (rejection evidence, future lead, or low-confidence possible USCE).
- Produce 0 PUBLIC_SAFE_USCE.
- Possibly produce 0 negative-evidence claims (absence of "we do not offer observerships" quote means absence-based finding, not PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY).

## 8. AdventHealth Orlando expected behavior

`adventhealth.com/*` is system-scope. The extractor should:
- Mark all captured pages as `HEALTH_SYSTEM_LEVEL` source scope (the domain itself signals this).
- Emit `RT_depth_source_scope_conflicts.json` entries indicating that any USCE claim from a system page cannot be applied to AdventHealth Orlando specifically without campus-applicability proof.
- Produce 0 PUBLIC_SAFE_USCE for Orlando.
- Emit future-lane signals for the system, not for Orlando.

## 9. Hartford expected behavior

Hartford captured `/research` and `/careers` only. The extractor should:
- Mark `/research` as `RESEARCH_OPPORTUNITY` future-lane (could be USCE-adjacent for med students; needs explicit quote about med-student access to be USCE).
- Mark `/careers` as `CAREERS_PAGE` future-lane.
- Produce 0 PUBLIC_SAFE_USCE.
- Produce 0 PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY (no explicit negative quote; absence-only).

## 10. Quote verifier requirements

For every claim with a non-empty `quote` (i.e., not NOT_STATED_ON_SOURCE):
1. Load the cleaned text file at `cleanedTextPath`.
2. Normalize whitespace in both the quote and the cleaned text (collapse multi-space/newlines to single spaces; trim).
3. Check the normalized quote is a substring of the normalized cleaned text.
4. Set `quoteVerified: true/false` on the claim.

If `quoteVerified=false` for any claim with `visibilityLane: PUBLIC_SAFE_USCE`, the validator fails the run.

## 11. A3 re-gate after claim extraction

A3 must re-run after extraction emits claims. The regate script reads only run-folder files and produces fresh `A3_gate.json` and `15_publish_gate.md`. It must:
- Recompute `unsupportedClaims` (claims missing source URL/hash/path)
- Recompute `quoteVerificationFailures` (claims with `quoteVerified=false`)
- Recompute `sourceScopeConflicts` (e.g., HEALTH_SYSTEM_LEVEL claims aspiring to PUBLIC_SAFE_USCE)
- Recompute `publicSafe` (true iff at least one claim is PUBLIC_SAFE_USCE with all gates passed)
- Recompute `verdict` (PASS / PASS_WITH_CAVEATS / FAIL_NEEDS_A4 / FAIL_FATAL)
- Attest `networkUsed: false`, `agentUsed: false`

## 12. Validators to add

The P102 validator (`scripts/validate-p102-discovery-runner.ts`) gains:
- For each claim file in each run, verify every claim has `sourceUrl`, `sourceHash`, `cleanedTextPath`, `quote`, `quoteVerified`.
- Reject any `PUBLIC_SAFE_USCE` claim with `quoteVerified=false`.
- Reject any `publicSafeNegativeClaim=true` claim with `quote === "NOT_STATED_ON_SOURCE"`.
- Reject any `PUBLIC_SAFE_USCE` from HEALTH_SYSTEM_LEVEL source without `campusApplicabilityProof`.
- Reject any `PUBLIC_SAFE_USCE` from a future-lane source family (GME_PAGE, CAREERS_PAGE, etc.).
- Confirm A3_gate.json has `networkUsed: false` and `agentUsed: false`.

## 13. What's deferred to P102-0D / P102-1 / P102-GOLD

P102-0C is deliberately conservative. These extension points stay open:
- True model-driven extraction (the extractor is deterministic pattern matching for now; the actual A1/A2 model reader prompt is captured in `specs/P102_A1_A2_READER_PROMPT.md` for future use).
- Sub-section parsing within cleaned text (e.g., parsing eligibility tables).
- Cross-source corroboration.
- Identity dedupe across institutions.
- PDF cascade exercise (no PDFs encountered in the 4 runs).
- Sitemap-index recursion.

## 14. Scope of this sprint

In scope:
- Spec doc (this file).
- Reader prompt doc.
- Extended validator with quote verifier.
- New `scripts/p102-extract-claims-from-run.ts` (the extractor).
- New `scripts/p102-regate-run.ts` (the regate).
- Run extractor + regate over all 4 existing runs.
- Checkpoint report.
- All validators green.
- Local commit.

Out of scope:
- New institutions.
- State run.
- National run.
- Public import.
- DB / schema / migration.
- UI / SEO.
- Production push.
