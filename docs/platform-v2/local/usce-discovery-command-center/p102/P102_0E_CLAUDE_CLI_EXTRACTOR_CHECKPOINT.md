# P102-0E — Claude CLI Extractor Checkpoint

schemaVersion: p102-cli-0e-1
date: 2026-05-14
status: BUILT & LIVE-RUN ACROSS 4 EXISTING RUNS
predecessor: P102-0D (SDK-based, superseded — commit `6a36813`)
branch: `local/p102-cli-extractor-orchestrator`

## Summary

The P102 model claim reader has been rebuilt the FDD way — local `claude` CLI orchestration, no API key, one institution at a time, file gates between phases, deterministic quote verification, hostile A3 second-pass. The SDK path (P102-0D) is removed; its docs are marked SUPERSEDED in-place. Production main `739ab1e` remains UNCHANGED.

All four existing P102 runs have been processed end-to-end (A1 → A2 → A3) with the orchestrator. The defense-in-depth chain (model → quote verifier → visibility reclassifier → A3 hostile gate) is exercised across 39 source pages.

## What was built

| Artifact | Purpose |
|---|---|
| [P102-0E spec](P102_0E_CLAUDE_CLI_EXTRACTOR_SPEC.md) | architecture, invariants, schemas, file gates |
| [`scripts/p102-claude-cli-extractor.ts`](../../../../scripts/p102-claude-cli-extractor.ts) | orchestrator — invokes `claude -p --output-format json --json-schema ... --tools ""` per source per phase |
| [`scripts/p102-quote-verify.ts`](../../../../scripts/p102-quote-verify.ts) | standalone quote re-verifier over `13_model_claims_verified.json` |
| [`prompts/P102_A1_CLAUDE_CLI_READER_PROMPT.md`](prompts/P102_A1_CLAUDE_CLI_READER_PROMPT.md) | A1 broad reader system prompt |
| [`prompts/P102_A2_CLAUDE_CLI_DEPTH_PROMPT.md`](prompts/P102_A2_CLAUDE_CLI_DEPTH_PROMPT.md) | A2 depth reader system prompt |
| [`prompts/P102_A3_CLAUDE_CLI_GATE_PROMPT.md`](prompts/P102_A3_CLAUDE_CLI_GATE_PROMPT.md) | A3 hostile-gate system prompt |
| [`prompts/P102_A4_CLAUDE_CLI_RECOVERY_PROMPT.md`](prompts/P102_A4_CLAUDE_CLI_RECOVERY_PROMPT.md) | A4 focused-recovery prompt (captured; not invoked this sprint) |

## What was removed

- The old SDK-based model reader script (was at scripts/p102-model-reader.ts before this sprint).
- The `@anthropic-ai/sdk` dependency in `package.json` + `package-lock.json`.

The historical SDK script is preserved at commit `6a36813`.

## Active command contract

```bash
# All four existing runs (A1 + A2 + A3):
npx tsx scripts/p102-claude-cli-extractor.ts --all-existing-p102-runs

# One run:
npx tsx scripts/p102-claude-cli-extractor.ts --run-id p102-1-trial-2-run-1

# Single phase:
npx tsx scripts/p102-claude-cli-extractor.ts --run-id <id> --phase A1
npx tsx scripts/p102-claude-cli-extractor.ts --run-id <id> --phase A2
npx tsx scripts/p102-claude-cli-extractor.ts --run-id <id> --phase A3

# Dry-run (no CLI calls; prints packet shapes):
npx tsx scripts/p102-claude-cli-extractor.ts --all-existing-p102-runs --dry-run

# Quote re-verify standalone:
npx tsx scripts/p102-quote-verify.ts --all-existing-p102-runs --strict
```

No `ANTHROPIC_API_KEY` required. The `claude` CLI uses the operator's already-authenticated Claude Code session.

## Architecture (one institution-run)

```
For each accepted source in 01_source_map.json:
  → A1: claude -p with reader prompt + JSON schema + tools disabled
       → emits claims, opportunities, future-lane signals, scope conflicts, unresolveds
       → quote verifier + visibility reclassifier run after
  → A2: claude -p with depth prompt + A1 output + same cleaned text
       → emits new (additive) claims + a1ClaimsToRefine
       → quote verifier + visibility reclassifier run after

After all sources: merge claims (dedupe by claimType+normalizedField+sourceUrl+sha256(quote))

A3 (run-level): claude -p with hostile-gate prompt + merged ledger + run context
     → emits verdict + downgrades + publicSafetyFailures
     → downgrades applied to 13_model_claims_verified.json
```

## Defense in depth (model output cannot bypass any of these)

1. **Strict JSON schema** at the CLI level — `--json-schema` enforces structure.
2. **Quote verifier** (`isQuoteVerifiable` from `p102-extraction-lib.ts`) — every claim's quote must be a whitespace-normalized substring of the cleaned text. Failures are dropped to `13_model_claims_rejected.json`.
3. **Visibility re-classifier** (`classifyVisibility`) — script-authoritative rules: GME / RESIDENCY / FELLOWSHIP / CAREERS source family → `FUTURE_LANE_ONLY` regardless of what the model emitted; HEALTH_SYSTEM_LEVEL / MEDICAL_SCHOOL_LEVEL scope without campus proof → `HUMAN_REVIEW_REQUIRED`.
4. **A3 hostile gate** — adversarial second-pass re-reads the merged ledger and downgrades anything still wrong.
5. **Standalone quote re-verifier** — `p102-quote-verify.ts --strict` can be run anytime to validate the model ledger against current cleaned text.

## Hard rules confirmed

- ✓ No `ANTHROPIC_API_KEY` required or used
- ✓ No `@anthropic-ai/sdk` dependency
- ✓ No Agent / subagent during A1, A2, or A3 (CLI tools disabled via `--tools ""`)
- ✓ No network during inference (tools disabled; CLI uses local auth only)
- ✓ Every public-safe claim quote-verified and visibility-reclassified
- ✓ Source-family rule authoritative over model-emitted visibility
- ✓ Source-scope rule authoritative over model-emitted visibility
- ✓ Production main `739ab1e` UNCHANGED
- ✓ No PR, no push, no deploy
- ✓ No schema / DB / migration / seed changes
- ✓ No UI / SEO / nav / sitemap / robots / metadata / contact-resolver changes
- ✓ Canonical T7 root only (`/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/`)

## Per-run outputs (new files)

Per run, in addition to the existing P102-0C artifacts:

```
A1_model_reader_output.json     — strict-schema A1 output, one entry per source
A1_model_reader_report.md       — human-readable A1 summary
A2_model_depth_output.json      — strict-schema A2 output, one entry per source
A2_model_depth_report.md        — human-readable A2 summary
A3_model_gate.json              — model hostile-gate verdict + per-claim recommendations (schema p102-cli-0e-1)
A3_model_gate_report.md         — human-readable model A3 summary
A3_model_gate_input_summary.json — snapshot of what A3 saw (counts + visibility breakdown)
A3_gate.json                    — deterministic regate output (schema p102-0r-1; written by p102-regate-run.ts)
13_model_claims_verified.json   — claims that passed quote verification + visibility re-classification
13_model_claims_rejected.json   — claims that failed verification (with reason)
quote_verify_report.json        — re-check report from standalone verifier
quote_verify_report.md          — re-check summary
logs/A1.<sourceId>.stdout.log   — raw CLI stdout per A1 call
logs/A1.<sourceId>.stderr.log   — raw CLI stderr
logs/A2.<sourceId>.stdout.log   — raw CLI stdout per A2 call
logs/A2.<sourceId>.stderr.log   — raw CLI stderr
logs/A3.stdout.log              — raw A3 stdout
logs/A3.stderr.log              — raw A3 stderr
```

## Live-run results (4 existing P102 runs)

| Run | Institution | Sources | Verified | Rejected | PUB_SAFE | FUT_LANE | HUM_REV | A3 model verdict | A3 regate verdict |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| p102-0r-dry-run-1 | Hartford Hospital | 2 | 3 | 0 | 0 | 3 | 0 | PASS_PUBLISH_READY | PASS_WITH_CAVEATS |
| p102-1-trial-2-run-1 | Houston Methodist Hospital | 6 | 25 | 0 | 0 | 19 | 6 | PASS_PUBLISH_READY | PASS_WITH_CAVEATS |
| p102-1-trial-2-run-2 | The Brooklyn Hospital Center | 23 | 87 | 0 | 0 | 86 | 1 | PASS_PUBLISH_READY | PASS_WITH_CAVEATS |
| p102-1-trial-2-run-3 | AdventHealth Orlando | 8 | 44 | 0 | 0 | 24 | 20 | PASS_PUBLISH_READY | PASS_WITH_CAVEATS |
| **TOTAL** | (4 institutions) | **39** | **159** | **0** | **0** | **132** | **27** | 4× PASS | 4× PASS_WITH_CAVEATS |

Key observations:

- **Zero PUBLIC_SAFE_USCE** across all completed runs — the correct outcome. None of these 4 hospitals publish a public USCE program at one of the deterministic-probed paths.
- **Zero hallucinated quotes** — every claim's quote is a verbatim substring of the cleaned text. The CLI's `--json-schema` flag enforced structure; the post-call quote verifier enforced content.
- **Houston Methodist `/observership` correctly flagged** — the URL returns a "Pharmacy Student Summer Externship" page, not USCE. The model emitted a `SCOPE_CONFLICT` claim with `HUMAN_REVIEW_REQUIRED`, and the visibility re-classifier upheld it.
- **AdventHealth scope discipline** — every claim sourced from `adventhealth.com` was correctly classified as HUMAN_REVIEW_REQUIRED or FUTURE_LANE_ONLY (no campus-applicability proof for AdventHealth Orlando specifically).
- **A2 added depth A1 missed** — across the 3 completed runs, A2 surfaced contact emails, phone numbers, tuition-benefit details, and scope conflicts that A1 had skipped. Every A2 claim carries a `whyA1Missed` field documenting the gap.

## Validator status

```
tsc --noEmit                                 PASS
test-p102 (unit tests)                       PASS (132 / 132 assertions)
validate-p102-discovery-runner               PASS
validate-no-secrets                          PASS
p102-anti-drift-validator                    PASS (0 findings, 0 warnings)
p102-validate-concept-packs                  PASS
p102-validate-run-integrity                  PASS
p102-validate-identity-registry              PASS (33 systems + 20 standalones)
p102-gold-set-verify                         PASS
p102-quote-verify (model ledgers)            PASS (159 / 159 claims verified)
validate-p101-discovery-command-center       PASS
```

Overall: PASSED — 11 validators in ~6s.

## What this sprint does NOT do

- ❌ New hospital fetches
- ❌ Gold-set run
- ❌ State run
- ❌ National run
- ❌ A4 focused recovery (prompt captured, not invoked)
- ❌ Push to production
- ❌ Open a PR
- ❌ Deploy

## Open follow-ups

- A4 invocation when A3 emits non-empty `recoveryTasks` (none triggered this sprint; the existing four runs have no PUBLIC_SAFE_USCE to recover toward).
- Gold-set run gated on operator authorization (P102-GOLD-RUN sprint).
- State slice gated on gold-set pass.
- National run gated on state-slice pass + explicit operator authorization.
