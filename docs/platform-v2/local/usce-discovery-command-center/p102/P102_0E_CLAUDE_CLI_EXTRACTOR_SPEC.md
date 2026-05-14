# P102-0E — Claude CLI Claim Extractor Spec

schemaVersion: p102-cli-0e-1
status: BUILDING (this sprint)
predecessor: P102-0C deterministic extractor (commit `a85838c`)
supersedes: P102-0D SDK path (commit `6a36813`, archived)
branch: `local/p102-cli-extractor-orchestrator`

## 1. Why P102-0E exists

P102-0D built an `@anthropic-ai/sdk`-based extractor that required `ANTHROPIC_API_KEY` to invoke. That's not the desired architecture.

The FDD extractor that worked successfully on McDonald's, Jiffy Lube, Cruise Planners, Ivybrook Academy, and The Joint Chiropractic did NOT require an API key. It used local terminal `claude` CLI automation (Claude Code, the same tool already on the operator's machine). The pattern: one source unit per run, `command -v claude`, `claude -p "$PROMPT" --output-format json`, strict file gates, deterministic quote verification, hostile A3.

P102-0E rebuilds the USCEHub extractor the FDD way. The SDK path is removed: the `@anthropic-ai/sdk` dependency is uninstalled and the old model-reader script (then at scripts/p102-model-reader.ts) has been deleted from the working tree. The P102-0D spec + checkpoint docs are marked SUPERSEDED in-place. History at commit `6a36813` is preserved.

## 2. FDD pattern copied (what stays the same)

- **One source unit per run.** In FDD, a "run" was one PDF. In USCEHub, a "run" is one institution's full source-capture folder.
- **`command -v claude` to discover the CLI**, fail loudly if absent. No SDK fallback.
- **`claude -p "$PROMPT" --output-format json`** as the invocation core.
- **Strict allowed-tools list** (`--allowedTools` or `--tools ""` to disable tools entirely). The A1/A2 reader takes input via prompt and returns JSON via stdout. No browsing, no network, no Agent.
- **File gates between phases.** A1 must produce parseable JSON before A2 runs. A2 must produce parseable JSON before A3. A3 must read only run-folder files.
- **Deterministic quote verifier** runs after each model phase. No public-safe claim escapes without `quoteVerified=true` + scope check.
- **NOT_STATED_ON_SOURCE is honest.** No invention.
- **Targeted A4 retries**, not broad re-reading.

## 3. USCEHub differences (what's new)

- **Source unit is one institution run folder, not one PDF.** The folder contains multiple captured source URLs (cleaned text + raw HTML + JSON-LD). The CLI extractor passes per-source excerpts in the prompt packet.
- **A0 source capture already exists.** P102-0R / 0B / Trial 2 / 0C built the A0 deterministic probe (robots, sitemap, fixed paths, JSON-LD). P102-0E only reads the captured artifacts; it does NOT fetch new sources.
- **A1/A2 reads captured cleaned text only.** No tool use needed during inference. `--tools ""` (no tools) is the safest setting.
- **A3 reads run folder only.** A3 attestation: `networkUsed: false`, `agentUsed: false`. Existing `scripts/p102-regate-run.ts` already enforces this.
- **Source scope / campus applicability rules are stricter** than FDD's per-PDF source attribution. AdventHealth Orlando on `adventhealth.com` cannot inherit system-level claims; Brigham and Women's content on `hms.harvard.edu` cannot inherit medical-school-level claims.
- **Future-lane separation is mandatory.** GME / RESIDENCY / FELLOWSHIP / CAREERS content is captured but never public USCE.

## 4. Active command contract

The single canonical invocation for the existing four runs:

```bash
npx tsx scripts/p102-claude-cli-extractor.ts --all-existing-p102-runs --max-runs 4
```

Per-run:

```bash
npx tsx scripts/p102-claude-cli-extractor.ts --run-id p102-1-trial-2-run-1
```

Per-phase:

```bash
npx tsx scripts/p102-claude-cli-extractor.ts --phase A1 --run-id <run>
npx tsx scripts/p102-claude-cli-extractor.ts --phase A2 --run-id <run>
npx tsx scripts/p102-claude-cli-extractor.ts --phase A3 --run-id <run>
```

Dry run (no Claude CLI calls; prints prompt packet shapes):

```bash
npx tsx scripts/p102-claude-cli-extractor.ts --all-existing-p102-runs --max-runs 4 --dry-run
```

**`ANTHROPIC_API_KEY` is NOT required.** The `claude` CLI uses the local authenticated session (Claude Code login). No SDK, no SDK fallback, no env-key check.

## 5. Per-run outputs

For each run, P102-0E writes (in addition to whatever the deterministic P102-0C path already produced):

| File | Contents |
|---|---|
| `A1_model_reader_output.json` | Raw JSON parse of the A1 CLI call's stdout. The strict schema is enforced via `--json-schema` flag, so this is already validated structurally. |
| `A1_model_reader_report.md` | Human-readable summary of A1 (claims, opportunities, future-lane signals, unresolveds, scope conflicts). |
| `A2_model_depth_output.json` | A2 deep-pass JSON output. |
| `A2_model_depth_report.md` | Human-readable A2 summary. |
| `A3_model_gate.json` | A3 hostile-gate JSON output (verdict + per-claim recommendations). Schema `p102-cli-0e-1`. Distinct from `A3_gate.json` which the deterministic regate writes (schema `p102-0r-1`). |
| `A3_model_gate_report.md` | Human-readable A3 model summary. |
| `A3_model_gate_input_summary.json` | Snapshot of what A3 read (claim counts, file list). |
| `13_model_claims_verified.json` | Claims that survived quote verification + visibility re-classification. |
| `13_model_claims_rejected.json` | Claims that failed verification (quote not in cleaned text, or visibility downgrade fatal). |
| (updated) `03_opportunity_objects.json` | Includes model-emitted PUBLIC_SAFE_USCE / CAUTION_SAFE_INTERNAL_REVIEW opportunities (if any). |
| (updated) `09_final_canonical.json` | Reflects merged claim count + score updates. |
| (updated) `RT_depth_usce.json` | Lane-specific USCE depth merged with model claims. |
| (updated) `RT_depth_gme_residency_fellowship.json` | Future-lane GME merged. |
| (updated) `RT_depth_jobs_visa.json` | Future-lane jobs/visa merged. |
| (updated) `RT_depth_physician_services.json` | Future-lane services merged. |
| (updated) `RT_depth_negative_evidence.json` | EXPLICIT_NEGATIVE_QUOTE claims if any. |
| (updated) `RT_depth_source_scope_conflicts.json` | SCOPE_CONFLICT claims. |

Plus per-run logs:

| Path | Contents |
|---|---|
| `docs/.../runs/<run_id>/logs/A1.stdout.log` | Raw CLI stdout |
| `docs/.../runs/<run_id>/logs/A1.stderr.log` | Raw CLI stderr |
| `docs/.../runs/<run_id>/logs/A2.stdout.log` | |
| `docs/.../runs/<run_id>/logs/A2.stderr.log` | |
| T7 `.../p102-national-runner/logs/<run_id>/` | Mirror copy |

## 6. File gates

The extractor enforces these gates between phases. A failed gate halts the run for that institution (other institutions in the batch continue).

**A1 gate:**
- Exit code 0
- stdout parses as JSON (strict schema validation by `--json-schema` is already enforced)
- Top-level keys present: `schemaVersion`, `runId`, `institutionId`, `networkUsed: false`, `agentUsed: false`, `claims`
- Every claim has: `claimId`, `claimType`, `lane`, `sourceUrl`, `sourceHash`, `cleanedTextPath`, `sourceScope`, `quote`, `confidence`
- No public-safe claim has bypassed the deterministic quote verifier (verifier runs after A1 gate passes)

**A2 gate:**
- Exit code 0
- stdout parses as JSON
- `unresolveds` array present
- Future-lane separation applied (no PUBLIC_SAFE_USCE on FUTURE_LANE source families)

**A3 gate (existing `p102-regate-run.ts`):**
- `networkUsed: false`
- `agentUsed: false`
- Reads only files in the run folder
- No unsupported public-safe claims
- All quote-verified or rejected

## 7. Quote verification

Every quote must be a whitespace-normalized substring of the corresponding cleaned-text file. Re-uses `isQuoteVerifiable()` from `scripts/p102-extraction-lib.ts`. A claim with `quoteVerified=false` is dropped from `13_model_claims_verified.json` and recorded in `13_model_claims_rejected.json` with reason.

A claim where `quote === "NOT_STATED_ON_SOURCE"` is accepted only for `claimType: "MISSING_FIELD"` and cannot be PUBLIC_SAFE_USCE.

The verification can also be re-run standalone (e.g., after a cleaned-text re-extraction) via `scripts/p102-quote-verify.ts` — same `isQuoteVerifiable()` + `classifyVisibility()` calls, no model involvement. Output is `quote_verify_report.json` + `.md` per run, with a `--strict` flag that returns non-zero on any re-verification failure.

## 8. Visibility re-classification (defense-in-depth)

After the model emits a candidate visibility, the script re-applies `classifyVisibility()` rules from `p102-extraction-lib.ts`. These are authoritative:

| Condition | Final visibility |
|---|---|
| Source family in {GME_PAGE, RESIDENCY_PAGE, FELLOWSHIP_PAGE, CAREERS_PAGE, JOBS_PAGE} | `FUTURE_LANE_ONLY` |
| Source scope in {HEALTH_SYSTEM_LEVEL, MEDICAL_SCHOOL_LEVEL} without `campusApplicabilityProof` | `HUMAN_REVIEW_REQUIRED` |
| Lane is CAREERS_PAGE/RESIDENCY_PROGRAM_INFO/FELLOWSHIP_PROGRAM_INFO/PHYSICIAN_SERVICES | `FUTURE_LANE_ONLY` |
| Lane is NO_PUBLIC_OPPORTUNITY_FOUND (shadow/volunteer) | `HUMAN_REVIEW_REQUIRED` |
| Source family in {OBSERVERSHIP_PAGE, VISITING_STUDENT_PAGE, RESEARCH_PAGE} + scope INSTITUTION_SPECIFIC/CAMPUS_SPECIFIC + model HIGH confidence | `PUBLIC_SAFE_USCE` |
| Otherwise on appropriate page family | `CAUTION_SAFE_INTERNAL_REVIEW` |

The model's emitted visibility is advisory. The script's classifier is authoritative.

## 9. Existing four-run benchmark — expected behavior

Based on the deterministic baseline and what we know about each source:

- **Hartford Hospital (2 sources):** `/research` + `/careers` only. Both pages have heavy navigation chrome and minimal real content. Expected: **0 PUBLIC_SAFE_USCE**, possibly some future-lane career/research signals, no false positives. P101 verdict was NO_PUBLIC_USCE_LANE_FOUND.

- **Houston Methodist Hospital (6 sources):** `/observership` returned 200 but the content is "Pharmacy Student Externship" (a redirect). Expected: the CLI extractor must **not** falsely promote this to USCE. If the cleaned text doesn't contain USCE keywords, no PUBLIC_SAFE_USCE. Future-lane GME / careers signals from `/gme` and `/careers`.

- **Brooklyn Hospital Center (23 sources):** Deep GME content (residency programs, pharmacy, podiatry). Expected: many `FUTURE_LANE_ONLY` claims (correctly classified as residency/fellowship), **0 PUBLIC_SAFE_USCE**, possibly some `HUMAN_REVIEW_REQUIRED` for the volunteer/shadow page.

- **AdventHealth Orlando (8 sources):** All on `adventhealth.com` (system-level domain). Expected: **0 PUBLIC_SAFE_USCE** (scope-conflict on every claim — system page can't be applied to Orlando specifically without campus proof). Possibly several `HUMAN_REVIEW_REQUIRED` or `SCOPE_CONFLICT` entries.

If the CLI extractor produces even one quote-verified `PUBLIC_SAFE_USCE` on any of these, that's a discovery (and the corresponding cleaned text should contain a clear definite-offer statement). If it produces zero, that's also the correct outcome — these 4 institutions weren't picked for USCE yield; they were picked to exercise framework discipline.

## 10. Architecture

```
For each institution run:

   ┌──────────────────────────────────────────────────────────┐
   │ Existing P102 source-capture artifacts on T7:            │
   │  • cleaned_text/*.txt (one file per accepted source)     │
   │  • raw_html/*.html                                       │
   │  • jsonld/*.json                                         │
   │  • SHA-256 hashes per file                               │
   └─────────────────────────┬────────────────────────────────┘
                             │ read only
                             ▼
              ┌───────────────────────────────┐
              │ P102-0E orchestrator script   │
              │ scripts/p102-claude-cli-      │
              │   extractor.ts                │
              └─┬──────────────┬──────────────┘
                │              │
       packet 1 │              │ packet 2…
                ▼              ▼
     ┌─────────────────┐   ┌─────────────────┐
     │ claude -p \     │   │ claude -p \     │   one CLI call per source per phase
     │   --output-     │   │   --output-     │   no API key
     │     format json │   │     format json │   no Agent
     │   --json-schema │   │   --json-schema │   no fetch
     │   --tools "" \  │   │   --tools "" \  │
     │   --system-     │   │   --system-     │
     │     prompt-     │   │     prompt-     │
     │     file A1.md  │   │     file A2.md  │
     │   <packet>      │   │   <packet>      │
     └────────┬────────┘   └────────┬────────┘
              │                     │
              ▼                     ▼
        JSON stdout            JSON stdout
              │                     │
              └─────────┬───────────┘
                        ▼
         ┌────────────────────────────────┐
         │ Quote verifier                 │
         │ (isQuoteVerifiable, lib)       │
         │ Visibility re-classifier       │
         │ (classifyVisibility, lib)      │
         └──────────────┬─────────────────┘
                        │
                        ▼
   13_model_claims_verified.json
   13_model_claims_rejected.json
   merged into 13_source_claims.json
   merged into RT_depth_*.json
                        │
                        ▼
         scripts/p102-regate-run.ts (existing, network-free, agent-free)
                        │
                        ▼
         scripts/p102-validate-all.ts (existing, 9 validators)
```

## 11. Prompt files

Five prompt files, one per phase, live in:

```
docs/platform-v2/local/usce-discovery-command-center/p102/prompts/
  P102_A1_CLAUDE_CLI_READER_PROMPT.md
  P102_A2_CLAUDE_CLI_DEPTH_PROMPT.md
  P102_A3_CLAUDE_CLI_GATE_PROMPT.md
  P102_A4_CLAUDE_CLI_RECOVERY_PROMPT.md
```

A1 (broad reader): given source metadata + cleaned text excerpts, emit JSON with claims, opportunities, negative-evidence, future-lane signals, scope conflicts, unresolveds.

A2 (depth): given A1 verified output + source excerpts, look for missed concepts (synonyms, edge cases) and emit additional structured claims.

A3 (hostile gate): given the merged claim ledger + run-folder context, identify unsupported claims, scope conflicts, overclaims. Output verdict.

A4 (focused recovery): not executed in P102-0E. Captured for future use when A3 names specific recovery tasks.

## 12. What this sprint does NOT do

- No state run, no national run.
- No new hospital fetching.
- No public import / DB / schema / UI changes.
- No PR, no push, no deploy.
- No `ANTHROPIC_API_KEY` requirement (existing `claude auth` login is used).
- No SDK calls (`@anthropic-ai/sdk` removed).

## 13. Success criteria

After P102-0E completes on the 4 existing runs:

- All 4 runs have `A1_model_reader_output.json`, `A2_model_depth_output.json`, `13_model_claims_verified.json`, `13_model_claims_rejected.json`
- A3 regate has run on each, attestations `networkUsed: false` / `agentUsed: false`
- Validators all pass: tsc, test-p102, validate-p102, no-secrets, anti-drift, concept-packs, run-integrity, identity-registry, gold-set-verify, p101 no-regression
- No false-positive `PUBLIC_SAFE_USCE` (Houston's `/observership` redirect stays unclaimed; AdventHealth's system-scope stays unclaimed; Brooklyn's GME stays future-lane; Hartford stays empty)
- Any genuine `PUBLIC_SAFE_USCE` produced has quote-verified evidence
- Production main `739ab1e` UNCHANGED
- Single local commit with the extractor + spec + prompts + outputs (no push)
