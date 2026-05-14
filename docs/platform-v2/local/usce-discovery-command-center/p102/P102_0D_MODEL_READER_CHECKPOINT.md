# P102-0D — Model Reader Checkpoint (SUPERSEDED)

> ⚠️ **SUPERSEDED by P102-0E (Claude CLI extractor orchestrator).**
> The SDK path required `ANTHROPIC_API_KEY`, which is not the desired architecture. Replaced with local `claude` CLI orchestration (FDD pattern). The `@anthropic-ai/sdk` dependency has been removed and `scripts/p102-model-reader.ts` has been deleted. See [`P102_0E_CLAUDE_CLI_EXTRACTOR_SPEC.md`](P102_0E_CLAUDE_CLI_EXTRACTOR_SPEC.md). Original P102-0D commit `6a36813` remains in history.

schemaVersion: p102-0r-1
date: 2026-05-14
status: **SUPERSEDED** (was BUILT & DRY-RUN VERIFIED). The build artifacts have been removed; the FDD-style CLI path is active.

## Summary

The model A1/A2 claim reader is built end-to-end. The pipeline is wired, the prompt is sized for caching, the request shape is verified across all 4 existing runs, and the entire downstream chain (quote re-verification, visibility re-classification, merge into `13_source_claims.json`, A3 regate, validator) is ready to consume model output.

The only remaining step is to provide an API key and invoke. **Nothing else needs to be built.**

## What was built

- [P102-0D spec](P102_0D_MODEL_READER_SPEC.md) — architecture, invariants, schemas, cost estimates
- [`scripts/p102-model-reader.ts`](../../../../scripts/p102-model-reader.ts) — the model reader
- **New dependency:** `@anthropic-ai/sdk@^0.96.0` (added to `package.json` + `package-lock.json`)

The script implements:
- One source per API call, serial
- System prompt cached via `cache_control: {type: "ephemeral"}` (5-min TTL)
- System prompt padded to ~5,245 tokens — comfortably above Opus 4.7's 4,096-token cache threshold
- Adaptive thinking (`thinking: {type: "adaptive"}`)
- Output constrained via `output_config.format` with a strict JSON schema for the claim array
- Per-source response cache on T7 (sha-keyed by cleaned-text hash) so re-runs are free until content changes
- Per-source quote re-verification using the same `isQuoteVerifiable()` the deterministic path uses
- Per-source visibility re-classification using the same `classifyVisibility()` rules
- `--max-cost-usd` budget cap (halts on budget breach)
- `--max-sources N` cap per run
- `--dry-run` flag that prints the request shape without calling the API
- Typed exception handling for `Anthropic.AuthenticationError` (clear "set API key" error) and `Anthropic.RateLimitError` (halts cleanly)

## Defense-in-depth

Three independent guards mean a hallucinated model response cannot produce a false `PUBLIC_SAFE_USCE`:

1. **Quote verification.** Every claim's quote must be a whitespace-normalized substring of the cleaned text. The model cannot make up the source of its claim — if the text doesn't say it, the claim is dropped to `13_model_claims_rejected.json`.
2. **Visibility re-classification.** The runner re-applies `classifyVisibility()` rules regardless of what visibility the model emitted. PUBLIC_SAFE_USCE requires OBSERVERSHIP_PAGE / VISITING_STUDENT_PAGE / RESEARCH_PAGE family + INSTITUTION_SPECIFIC / CAMPUS_SPECIFIC scope + HIGH model confidence. A GME page's claim is forced to FUTURE_LANE_ONLY regardless of what the model said.
3. **A3 hostile regate** (existing). Reads only run-folder files, no network, no Agent, attests `networkUsed: false`, `agentUsed: false`. The existing regate logic catches any claim with `quoteVerified: false` or scope conflicts.

## Hard rules confirmed

- ✓ No Agent / subagent used (the script makes a single HTTP request via the official SDK)
- ✓ A3 hostile gate remains network-free and agent-free
- ✓ Every claim is quote-backed and re-verified
- ✓ Visibility rules are authoritative; model output is advisory
- ✓ Production main `739ab1e` UNCHANGED
- ✓ No PR, no push, no deploy
- ✓ No schema / DB / migration / seed changes
- ✓ No UI / SEO / nav / sitemap / robots / metadata / contact-resolver changes
- ✓ Canonical T7 root only
- ✓ One dependency added (`@anthropic-ai/sdk`); rationale documented in commit message

## Dry-run verification

Confirmed across all 4 existing P102 runs (8 sources, max 2 per run):

```
[dry-run] would send for <each source>:
  system prompt length: 20982 chars (~5,245 tokens — above cache threshold)
  user message length:  3,000–12,000 chars (varies with cleaned-text size)
  model: claude-opus-4-7
  thinking: adaptive
  output_config: json_schema (claim array)
```

Each request:
- `system` block: cached, identical across all calls in a 5-min window
- `messages` (user role): includes sourceUrl, sourceFamily, sourceScope, institutionContext, cleanedText (truncated to 60K chars)
- `output_config.format`: strict JSON schema with claim-array shape
- `thinking: {type: "adaptive"}`: model decides whether and how much to reason

## Validator state at checkpoint

```
$ npx tsx scripts/p102-validate-all.ts --fast
  test-p102 (unit tests)                       PASS (132 / 132 assertions)
  validate-p102-discovery-runner               PASS (4 runs, 65 claims, all verified)
  validate-no-secrets                          PASS (1597+ files, 0 findings)
  p102-anti-drift-validator                    PASS (0 warnings)
  p102-validate-concept-packs                  PASS
  p102-validate-run-integrity                  PASS (hash chain intact)
  p102-validate-identity-registry              PASS (33 systems + 20 standalones in sync)
  p102-gold-set-verify                         PASS (all 11 entries AWAITING_RUN)
  validate-p101-discovery-command-center       PASS (no regression)
Overall: PASSED — 9 validators in ~4s
```

tsc clean. Production main untouched.

## To invoke the model reader

The script is built and validated. Set the API key, then run:

```bash
cd /Users/shelly/usmle-platform

# Set the key (this session only — does not persist):
export ANTHROPIC_API_KEY=sk-ant-...

# Test on one institution first (1 source, ~$0.05 expected):
npx tsx scripts/p102-model-reader.ts \
  --run-id p102-1-trial-2-run-1 \
  --max-sources 1 \
  --max-cost-usd 0.50

# Then run on all 4 existing institutions (cost estimate: ~$0.60–1.00):
npx tsx scripts/p102-model-reader.ts \
  --all-existing-p102-runs \
  --max-cost-usd 2.00

# Then regate + validate:
npx tsx scripts/p102-regate-run.ts --all-existing-p102-runs
npx tsx scripts/p102-validate-all.ts
```

After that, `P102_DASHBOARD.md` and per-run `RUN_REPORT.md` files can be regenerated:

```bash
npx tsx scripts/p102-generate-dashboard.ts
npx tsx scripts/p102-generate-run-report.ts --all-existing-p102-runs
```

## Cost estimates

| Workload | Calls | Est. cost (with cache) |
|---|---:|---:|
| One institution test (1 source) | 1 | ~$0.05 |
| Full 4-institution run (~40 sources) | 40 | ~$0.60–1.00 |
| Gold-set run (11 institutions, ~100 sources) | 100 | ~$2.50–4.00 |
| One state slice (50 institutions, ~500 sources) | 500 | ~$12–20 |
| National (~6000 institutions, ~60K sources) | 60,000 | ~$1,500–2,000 |

Costs assume the 5-min prompt cache stays warm (system prompt re-read at ~$0.50 / 1M tokens vs $5.00 / 1M for the first write). At ~5,245 tokens cached × 60K calls × $0.50/1M = ~$157 in savings from caching alone over the full national run.

Output token cost is roughly 10–25× input — the JSON-schema-constrained output is typically small (≤500 char quotes × N claims; rarely exceeds ~1K output tokens).

## Expected outcomes per institution

Based on the deterministic baseline and what we know about each source:

- **Hartford Hospital** (2 sources): expected 0 PUBLIC_SAFE_USCE (P101 verdict was NO_PUBLIC_USCE_LANE_FOUND). Some future-lane signals from /research and /careers.
- **Houston Methodist Hospital** (6 sources, including `/observership` redirect to pharmacy): expected 0 PUBLIC_SAFE_USCE from the captured pages (the real observership page was not captured). Future-lane signals from /gme, /careers.
- **The Brooklyn Hospital Center** (23 sources, GME-heavy): expected 0 PUBLIC_SAFE_USCE. Many FUTURE_LANE_ONLY claims, possibly some EXPLICIT_NEGATIVE_QUOTE if any volunteer/shadow page contains an explicit refusal.
- **AdventHealth Orlando** (8 sources, system-level domain): expected 0 PUBLIC_SAFE_USCE. Several HUMAN_REVIEW_REQUIRED or SCOPE_CONFLICT claims due to scope mismatch.

If the model reader produces a single quote-verified PUBLIC_SAFE_USCE on any institution, that unblocks the gold-set run. Otherwise the framework remains correct (returning zero PUBLIC_SAFE_USCE for an institution that doesn't publicly publish a USCE program is the right answer) and Trial 3 should add new institutions where USCE is more likely.

## What this sprint does NOT do (still on hold)

- Run new institutions (no new A0 fetches)
- Run the gold set (11 institutions) — needs operator authorization
- Run a state slice — needs gold-set pass + operator authorization
- Run national — needs state slice pass + operator authorization
- Push to production
- Open a PR
- Deploy

## Single command after API key is set

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npx tsx scripts/p102-model-reader.ts --all-existing-p102-runs --max-cost-usd 2.00 \
  && npx tsx scripts/p102-regate-run.ts --all-existing-p102-runs \
  && npx tsx scripts/p102-validate-all.ts
```

That single line runs the model reader, regates A3 on all runs, and runs all 9 validators. Expected wall time: ~5–10 minutes for the API calls + ~10 seconds for validators.
