# P102-0D — Model A1/A2 Reader Spec (SUPERSEDED)

> ⚠️ **SUPERSEDED by P102-0E (Claude CLI extractor orchestrator).**
> The SDK-based approach in this document required `ANTHROPIC_API_KEY`, which is not the desired architecture. The FDD pattern (local `claude` CLI, no API key) is the chosen path. See [`P102_0E_CLAUDE_CLI_EXTRACTOR_SPEC.md`](P102_0E_CLAUDE_CLI_EXTRACTOR_SPEC.md). The `@anthropic-ai/sdk` dependency has been removed from `package.json` and `scripts/p102-model-reader.ts` has been deleted. The original P102-0D commit `6a36813` remains in history for reference.

schemaVersion: p102-0r-1
status: SUPERSEDED (was BUILDING)
predecessor: P102-0C deterministic claim extraction (commit `a85838c`)
successor: P102-0E Claude CLI extractor (this sprint)
branch: `local/p102-claim-extraction-layer` (orphaned for SDK path; CLI path continues on `local/p102-cli-extractor-orchestrator`)
captured prompt: [`specs/P102_A1_A2_READER_PROMPT.md`](specs/P102_A1_A2_READER_PROMPT.md)

## 1. Why P102-0D exists

P102-0C produces deterministic, conservative claims using regex-based concept detectors. Across the 4 existing runs it produced 65 claims, all FUTURE_LANE_ONLY or HUMAN_REVIEW_REQUIRED, with 0 PUBLIC_SAFE_USCE — correct under the deterministic baseline but not the product.

The model reader is the unblock. It reads the same cleaned-text artifacts and emits claim candidates that the runner then validates against the same quote-verifier + visibility rules. Where the deterministic detector says "keyword match → CAUTION_SAFE", the model reader can disambiguate (e.g., "Houston Methodist offers a clinical observership program for international medical graduates" → PUBLIC_SAFE_USCE candidate) or honestly refuse (e.g., "We do not offer observerships to..." → PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY with quote).

## 2. Hard rules (inherited)

- **No new HTTP fetches.** Operates on already-captured cleaned-text and JSON-LD files on canonical T7.
- **No Agent / subagent.** The script is the single writer. The Anthropic API call is a programmatic HTTP request from the script — not the Claude Code Agent tool.
- **A3 stays network-free and agent-free.** A3 regate continues to read only run-folder files; the model reader is a separate, earlier stage.
- **Every model-emitted claim is quote-verified.** The runner re-checks the quote against cleaned text using the same `isQuoteVerifiable()` function the deterministic path uses. A claim whose quote is not literally findable in cleaned text is rejected.
- **PUBLIC_SAFE_USCE still gated by visibility classifier.** The model emits a candidate visibility; the runner applies `classifyVisibility()` rules (source family, scope, model confidence). PUBLIC_SAFE_USCE requires OBSERVERSHIP_PAGE / VISITING_STUDENT_PAGE / RESEARCH_PAGE source family + INSTITUTION_SPECIFIC / CAMPUS_SPECIFIC scope + model HIGH confidence.
- **Production main `739ab1e` UNCHANGED.** No PR, no push.

## 3. Dependency addition

This sprint adds ONE external dependency:

- **`@anthropic-ai/sdk`** — the official Anthropic Node SDK
  - Reason: the only sanctioned way to call the Claude API from a Node script (per the captured `claude-api` skill: "Always use the SDK for the project's language. Never use fetch/requests in a Python or TypeScript project").
  - Not a scraping framework.
  - Does not import into Next.js production runtime (scripts/ files are not bundled).
  - Reads `ANTHROPIC_API_KEY` from env; no credentials in repo.

Lockfile (`package-lock.json`) will gain entries for the SDK and its transitive dependencies. The change is intentional and documented in the commit message.

## 4. Architecture

```
   ┌──────────────────────────────────────────────────────────────┐
   │  Per run folder, per accepted source                         │
   │                                                              │
   │  cleanedText (T7) ──┐                                        │
   │  sourceUrl          ├──→ Anthropic Claude API (Opus 4.7)     │
   │  sourceFamily       │    - system prompt = captured reader   │
   │  sourceScope        │      prompt (CACHED 5-min ephemeral)   │
   │  institutionCtx     │    - user message = source meta + text │
   │                     │    - output_config.format = JSON       │
   │                     │      schema with claim array           │
   │                     │    - thinking = adaptive               │
   │                     └────────────────────┐                   │
   │                                          ▼                   │
   │                                  Claim candidates (JSON)     │
   │                                          │                   │
   │                                          ▼                   │
   │  For each candidate:                                         │
   │   1. Verify quote against cleanedText (isQuoteVerifiable)    │
   │   2. Apply classifyVisibility() rules                        │
   │   3. Drop if quote unverified                                │
   │                                                              │
   │  Write merged claims to 13_source_claims.json                │
   │  Write model-only mirror to 13_model_claims.json             │
   │  Write per-source response cache to T7 (sha-keyed)           │
   └──────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                       p102-regate-run.ts  (network-free A3)
                                  │
                                  ▼
                       validate-p102-discovery-runner.ts
```

## 5. Schemas

### Model output (per source call)

JSON array. Each entry:

```json
{
  "claimType": "OFFERS_OBSERVERSHIP" | "OFFERS_VSLO" | "ELIGIBILITY_REQUIREMENT" | "APPLICATION_FEE" | "DURATION" | "CONTACT_EMAIL" | "NEGATIVE_NO_OBSERVERSHIP" | "NEGATIVE_AFFILIATED_ONLY" | "FUTURE_LANE_RESIDENCY" | "FUTURE_LANE_FELLOWSHIP" | "FUTURE_LANE_GME_GENERAL" | "FUTURE_LANE_JOB" | "FUTURE_LANE_VISA" | "SCOPE_CONFLICT" | "MISSING_FIELD",
  "lane": "IMG_OBSERVERSHIP" | "VISITING_MEDICAL_STUDENT" | "CLINICAL_ELECTIVE" | "RESEARCH_OPPORTUNITY" | "RESIDENCY_PROGRAM_INFO" | "FELLOWSHIP_PROGRAM_INFO" | "CAREERS_PAGE" | "PHYSICIAN_SERVICES" | "NO_PUBLIC_OPPORTUNITY_FOUND",
  "quote": "string (verbatim from cleanedText, ≤500 chars)",
  "fieldName": "string | null",
  "visibility": "PUBLIC_SAFE_USCE" | "CAUTION_SAFE_INTERNAL_REVIEW" | "FUTURE_LANE_ONLY" | "HIDDEN_REJECTED" | "PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY" | "HUMAN_REVIEW_REQUIRED",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "notPublicReason": "string | null"
}
```

If no relevant claims exist, the model returns `[]`.

### Per-run output: `13_model_claims.json`

```json
{
  "schemaVersion": "p102-0r-1",
  "runId": "...",
  "institutionId": "...",
  "extractedBy": "p102-model-reader (claude-opus-4-7, adaptive thinking)",
  "extractedAt": "ISO-8601",
  "model": "claude-opus-4-7",
  "totalApiCalls": <number>,
  "totalInputTokens": <number>,
  "totalCachedTokens": <number>,
  "totalOutputTokens": <number>,
  "estimatedCostUsd": <number>,
  "claims": [ <ClaimRecord with extractionSource: "model"> ]
}
```

The claims are merged into `13_source_claims.json` after re-verification.

## 6. Prompt-caching strategy

Per source, request order is `tools → system → messages` (no tools used; just system + user). System prompt (the captured reader prompt) is identical across all calls, so cache it:

```ts
client.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 4096,
  thinking: { type: 'adaptive' },
  system: [{ type: 'text', text: READER_PROMPT, cache_control: { type: 'ephemeral' } }],
  messages: [{ role: 'user', content: SOURCE_PAYLOAD }],
  output_config: { format: { type: 'json_schema', schema: CLAIM_ARRAY_SCHEMA } },
});
```

Verification: `response.usage.cache_read_input_tokens` should be > 0 for the 2nd call onward. The first call pays a 1.25× write premium; subsequent calls (within 5 min TTL) read at ~0.1× normal price.

**Minimum cacheable prefix on Opus 4.7 is 4096 tokens.** The captured reader prompt is ~5K chars (~1.5K tokens). To hit the cache threshold, the system prompt block is padded with structured rules (visibility-rule reference table, example claims, schema description) bringing it above 4K tokens. Padding is **stable across calls** — never includes per-source variables.

## 7. Cost guardrails

- **Cap on initial run**: process the 4 existing runs only (~40 sources total). At ~5K input + ~1K output per call:
  - First call: ~$0.04 (uncached write)
  - Subsequent 39 calls: ~$0.014 each (cached)
  - Total estimate: ~$0.60–1.00
- **`--max-sources N` CLI flag**: hard limit per invocation.
- **`--dry-run` flag**: prints the request that would be made; does not call API.
- **`--max-cost-usd N` flag**: estimates running cost from `usage` deltas and halts when limit reached.

National scale (~60,000 calls) is explicitly NOT run by this sprint. Cost would be ~$1,500–2,000 with caching; operator must authorize separately.

## 8. Quote verification (defense-in-depth)

After the model returns claim candidates, the runner:

1. Loads cleanedText from T7
2. For each candidate's `quote`:
   - Normalize whitespace (collapse multi-space/newlines)
   - Check if normalized quote is a substring of normalized cleanedText
3. If verified: keep the claim with `quoteVerified: true`
4. If not verified: drop the claim and log to `13_model_claims_rejected.json` for review

This is the same `isQuoteVerifiable()` already in extraction-lib. No model claim is ever published without surviving this gate.

## 9. Visibility re-classification (defense-in-depth)

After quote verification, every surviving claim is re-classified via `classifyVisibility()`:

- Source family is GME_PAGE / RESIDENCY_PAGE / FELLOWSHIP_PAGE / CAREERS_PAGE → `FUTURE_LANE_ONLY` (regardless of what the model said)
- Source scope is HEALTH_SYSTEM_LEVEL / MEDICAL_SCHOOL_LEVEL without `campusApplicabilityProof` → `HUMAN_REVIEW_REQUIRED`
- Source family is OBSERVERSHIP_PAGE / VISITING_STUDENT_PAGE / RESEARCH_PAGE + INSTITUTION_SPECIFIC scope + model HIGH confidence → `PUBLIC_SAFE_USCE` ✓
- Otherwise → `CAUTION_SAFE_INTERNAL_REVIEW`

The model's `visibility` is treated as advisory. The runner's rules are authoritative.

## 10. CLI

```bash
# Dry run (no API calls; prints sample request)
npx tsx scripts/p102-model-reader.ts --run-id p102-1-trial-2-run-1 --dry-run

# Real run on one institution
ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/p102-model-reader.ts \
  --run-id p102-1-trial-2-run-1 \
  --max-sources 6 \
  --max-cost-usd 0.50

# Real run on all 4 existing runs
ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/p102-model-reader.ts \
  --all-existing-p102-runs \
  --max-cost-usd 2.00
```

If `ANTHROPIC_API_KEY` is not set, the script exits with a clear error and instructions.

## 11. Output side effects per run

After processing:
- `13_model_claims.json` — model-only mirror with usage statistics
- `13_model_claims_rejected.json` — rejected (quote unverified) candidates with reason
- `13_source_claims.json` — updated to include verified model claims merged with deterministic ones
- `RT_depth_*.json` — re-aggregated from merged claims
- `RT_depth_negative_evidence.json` — updated with model-detected explicit negatives
- T7 `model_response_cache/<source-hash>.json` — full API response cached (sha-keyed by cleanedText hash) so re-runs are free until cleanedText changes

Then the operator can run `p102-regate-run.ts` + `validate-p102-discovery-runner.ts` for the network-free A3 + validation pass.

## 12. Failure modes + handling

- **API key missing** → exit with instructions, no partial writes
- **Rate limited (429)** → SDK auto-retries up to 2× with exponential backoff (per the SDK skill); if still fails, halt
- **Schema parse failure** → log to rejected, skip that source, continue
- **Quote not verified** → log to rejected, skip that claim, keep other claims from same source
- **Cost cap reached** → halt mid-run, flush partial output, exit non-zero
- **Network failure** → log to rejected with reason; safe to re-run (cache hits free)

## 13. What this sprint produces

- This spec
- Updated `package.json` + `package-lock.json` (one new dep)
- `scripts/p102-model-reader.ts`
- Tests for the deterministic parts in `scripts/test-p102.ts`
- Re-extracted `13_source_claims.json` for each of the 4 existing runs (with model-merged claims)
- Updated `RT_depth_*.json`, `A3_gate.json`, `15_publish_gate.md` per run (via regate)
- T7 model response cache (cached responses keyed by cleanedText sha)
- Updated `P102_DASHBOARD.md` (auto-generated)
- Checkpoint report
- Local commit (no push)

## 14. What this sprint does NOT produce

- New institution runs (no new A0 fetches; only re-extraction over existing 4 runs)
- Gold-set run (requires separate authorization)
- State run (requires separate authorization)
- National run (requires separate authorization)
- Production push / merge / deploy
- UI changes / schema changes / DB writes
