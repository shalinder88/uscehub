# P102-1 Trial 2 — Three-Institution Dry Run Checkpoint

schemaVersion: p102-0r-1
date: 2026-05-12
predecessors: P102-0R (Trial 1, Hartford Hospital), P102-0B (fixed-path patch)
runs: p102-1-trial-2-run-1, p102-1-trial-2-run-2, p102-1-trial-2-run-3
branch: local/p102-national-medical-opportunity-extractor

## Summary

| Institution | State | Type | Probes | Accepted | JSON-LD | Verdict |
|---|---|---|---:|---:|---:|---|
| Hartford Hospital (Trial 1 baseline) | CT | mid-size AMC | 34 | 2 | 1 | PASS_WITH_CAVEATS |
| Houston Methodist Hospital | TX | high-yield AMC | 39 | 6 | 1 | PASS_WITH_CAVEATS |
| The Brooklyn Hospital Center | NY | small standalone | 59 | 23 | 0 | PASS_WITH_CAVEATS |
| AdventHealth Orlando | FL | ambiguous multi-campus | 39 | 8 | 1 | PASS_WITH_CAVEATS |

All four runs: `networkUsed=false`, `agentUsed=false`, `publicSafe=false` (P102-0R/0B defer A2 model reader).

## What Trial 2 proved structurally

### 1. Fixed-path patch (P102-0B) works
Houston Methodist captured `/education` via the new fixed-path additions; AdventHealth captured `/education`, `/medical-education`, and `/benefits` — all from the P102-0B patch. The +5 path additions deliver real signal on real institutions.

### 2. Source-family classification correctly differentiates lanes
- Houston Methodist's `/observership` page (200 OK) classified as **OBSERVERSHIP_PAGE** — the high-yield signal the test was designed to find.
- Brooklyn's 23 accepted sources are predominantly `GME_PAGE` (residency/fellowship pages) and `VOLUNTEER_PAGE`. **Zero `OBSERVERSHIP_PAGE` or `VISITING_STUDENT_PAGE`** — correct: Brooklyn's site exposes deep GME content but no public USCE lane.
- AdventHealth's 8 accepted sources are `RESEARCH_PAGE`, `VOLUNTEER_PAGE`, `GME_PAGE`, `CAREERS_PAGE`, `CAREERS_PAGE`, and 3 `OTHER` — all SYSTEM-domain pages.

### 3. Scope-discipline foundation is sound
AdventHealth's `official_domain = adventhealth.com` is system-level. The 8 accepted sources are all at `adventhealth.com/*` — system-scope pages. The framework correctly captured them as sources but A1 source-family classification correctly defaults conservative source_scope; the A3 hostile gate (currently structural-only) plus the future A2 model reader will prevent system-level claims from being applied to "AdventHealth Orlando" specifically. **Scope discipline is plumbed; the model reader needs to enforce it.**

### 4. Per-institution sitemap behavior is variable, and the framework handles it
- Hartford: sitemap is empty `<sitemapindex/>` → 0 sitemap candidates
- Houston Methodist: sitemap mostly off-keyword → 0 sitemap candidates (only fixed paths fired)
- Brooklyn: sitemap rich in opportunity keywords → 20 sitemap candidates captured (the runner's cap), bringing total probes to 59
- AdventHealth: sitemap not opportunity-keyword-relevant → 0 sitemap candidates

This variance is real institutional behavior, not a framework defect.

### 5. JSON-LD opportunistic, present where it should be
JobPosting JSON-LD typically appears on careers pages. Houston Methodist and AdventHealth (both with `/careers` 200) captured one JSON-LD record each. Hartford also captured one. Brooklyn's careers page is structured differently and did not expose JSON-LD. All correct.

## Hostile gate self-attestation (all 4 runs)

For every run including Trial 1:
- `A3_gate.json` contains `"networkUsed": false`
- `A3_gate.json` contains `"agentUsed": false`
- `15_publish_gate.md` states "A3 read only run-folder files. No network. No Agent."
- Validator enforces all three.

## What Trial 2 did NOT prove

These remain explicitly deferred:
- **Model-driven claim extraction.** The framework writes structural skeletons for opportunity objects. No PUBLIC_SAFE_USCE claims emitted. Houston Methodist's `/observership` page (real high-yield) sits captured but unread.
- **Negative-evidence quote extraction end-to-end.** No `EXPLICIT_NEGATIVE_QUOTE` claims emitted. The schema/validator is in place; the reader is not.
- **Scope-conflict surfacing.** A2's `RT_depth_source_scope_conflicts.json` is a skeleton.
- **PDF cascade exercised.** None of the 4 institutions linked PDFs in the probed paths.
- **Identity canonicalizer at scale.** Three institutions in Trial 2; no dedupe decisions exercised.

## Validators (all green)

- `validate-p102-discovery-runner`: **PASSED** (4 runs validated, all `network=false`, `agent=false`, `publicSafe=0`)
- `validate-no-secrets`: **PASSED** (1536 files, 0 findings)
- `tsc --noEmit`: **PASSED**
- `validate-p101-discovery-command-center`: **PASSED** (no regression)

## Diff safety

Only P102 paths touched. Pre-existing dirty files (NPPES, redesign mockups, `.claude/launch.json`) untouched. No prisma / schema / migrations / seed / DB / noindex / UI / nav / sitemap / robots / metadata / JSON-LD / contact resolver / .vercel / package.json changes. Production main at `739ab1e` UNCHANGED.

## What the data tells us about scale

If we extrapolate Trial 2 patterns to a national run (~6,000 hospitals):
- Average accepted sources per institution: ~10 (Trial 2 average: 9.25)
- Per-institution wall time: ~2.5 minutes (HEAD+GET on 39 fixed paths + up to 20 sitemap candidates, at 1.5s min delay)
- **National total wall time: ~10–15 days continuous** at current cadence (single-instance serial). Could be sharded by state (run multiple processes, each handling one state) to reduce to ~24–36 hours, but that violates "no parallel institutional processing" within a state.
- Storage: ~50 KB cleaned text + ~150 KB raw HTML per source × 10 sources × 6,000 institutions ≈ **12 GB on T7**. Easily within T7 capacity.

## What's blocked before state/national

Two things, in order of importance:

### Blocker 1: A2 model reader is not built

P102-0R and P102-0B intentionally deferred the model-driven claim extraction pass. Without it:
- Every institution gets `opportunities: []` and `publicReadinessScore: 0`.
- Houston Methodist's real `/observership` page is captured as cleaned text but never read for claims.
- A national run produces 6,000 source-mapped folders with **zero extracted opportunities** — useful infrastructure, not a useful USCE product.

The fix is **P102-0C**: build a model A1/A2 reader pass that reads cleaned text per source and emits claims with `quote` + `sourceHash` + `quoteVerified`. The current schemas already accept this. Estimated effort: a focused sprint, not P102-0R-scale.

### Blocker 2: Scale of fetching needs explicit operator sign-off

A national run is ~600,000 HTTP requests across thousands of hospital websites over multiple days. The runner is polite (named UA, 1.5s rate limit, HEAD-first), but the cumulative footprint deserves operator awareness:
- Some institutions will issue 403 / rate-limit blocks; runner marks `BOT_BLOCKED_MANUAL_RETRY` and continues.
- Some institutions may interpret repeated probes as adversarial; the named UA + contact URL helps but doesn't guarantee.
- Resource cost: T7 storage, network bandwidth, multi-day session continuity.

This is not a doctrine violation per se (serial, single-institution-per-run, named UA, rate-limited) — but it's the kind of scale operator should explicitly authorize.

## Recommendation

**Pause Trial progression. Choose one:**

- **(α) Build P102-0C (A2 model reader)** — recommended. Turns A0 probes into actual claims. Then re-run Trial 2 with the model reader to verify end-to-end discipline (negative-evidence quote standard, scope conflict surfacing, PUBLIC_SAFE_USCE emission only with verified quote). After P102-0C verifies on Trial 2, then Trial 3 / gold-set / state / national become useful.

- **(β) Pure-A0 national index** — accept that the national run will produce source-mapped folders only, no claims. Defer extraction to a post-hoc model pass. Estimated ~10–15 days runtime. Useful as discovery infrastructure but not as USCE product.

- **(γ) Narrow scope** — run one state (e.g., CT or MA) end-to-end with the current framework. ~30–60 institutions, ~2–3 hours runtime. Tests the framework at small-state scale without committing to national.

## Run artifacts

- [run-1 Houston Methodist](runs/p102-1-trial-2-run-1/)
- [run-2 Brooklyn Hospital Center](runs/p102-1-trial-2-run-2/)
- [run-3 AdventHealth Orlando](runs/p102-1-trial-2-run-3/)

T7 artifacts: `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/artifacts/p102-1-trial-2-run-{1,2,3}/`.
