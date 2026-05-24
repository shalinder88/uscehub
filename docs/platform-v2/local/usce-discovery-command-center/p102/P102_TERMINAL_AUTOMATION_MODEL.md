# P102 — Terminal Automation Operating Model

status: BINDING
schemaVersion: p102-deep-0f-1

## 1. P102 is terminal automation, not manual chat extraction

P102 is a **terminal data factory**. Extraction runs through a local
shell-orchestrated pipeline that invokes the `claude` CLI in non-interactive
print mode (`claude -p --output-format json --json-schema ... --tools ""
--no-session-persistence --system-prompt-file ...`). Prompts and packets are
files on disk; outputs are files on disk; logs are files on disk.

Extraction is **not**:

- a human pasting institution names into a chat,
- a human asking "tell me about Houston Methodist's observership,"
- a human screenshotting a page and asking the model to summarize,
- a model reasoning from training data about which hospitals offer USCE.

Manual chat is useful for *designing prompts and reviewing decisions*. It is
not the extraction surface.

## 2. One institution at a time

The runner processes exactly **one** institution per run. For each
institution:

1. **A0 capture** — fetch / re-fetch official institution sources within the
   institution's own domain. Save cleaned text, raw HTML, JSON-LD, PDFs, and
   per-file SHA-256 hashes to T7. Write a `01_source_map.json` and an
   `00_artifact_manifest.csv` listing every captured artifact and its hash.
2. **Deep source discovery** — re-classify captured sources into the deep
   source-family taxonomy (`scripts/p102-deep-source-discovery.ts`). Write
   `00_deep_source_discovery.json` and `01_deep_source_family_coverage.json`.
3. **A1 broad reader** — the CLI extractor invokes `claude -p` per source
   with the deep A1 prompt. Each call emits a JSON object validated by
   `--json-schema`. Output: `A1_model_reader_output.json` + per-call logs.
4. **A2 depth reader** — per source, A1 output + cleaned text become the A2
   packet. A2 catches what A1 missed across all three tiers and flags A1
   claims to refine. Output: `A2_model_depth_output.json`.
5. **Quote verifier + visibility reclassifier** — every claim's quote is
   re-verified as a whitespace-normalized substring of the cleaned text; the
   deterministic visibility classifier reassigns the visibility lane.
   Failures go to `13_model_claims_rejected.json`; survivors to
   `13_model_claims_verified.json`.
6. **A3 hostile gate** — the CLI extractor invokes `claude -p` once at the
   run level with the merged verified ledger + run context + deep source
   coverage. A3 returns verdict + tier coverage + unfollowed signals +
   `deepRecoveryTasks`. Output: `A3_model_gate.json`.
7. **A4 targeted recovery (optional, `--fetch-additional`)** — for each
   recovery task in `deepRecoveryTasks`, the runner performs a bounded
   HEAD-first fetch on the institution's own domain only, with budgets
   capped (default 20 candidates / 10 accepted / 5 PDFs). New sources are
   appended to the run folder and the deep pipeline can be re-run on the
   augmented capture. Disabled by default; never broad-crawls.
8. **Deterministic regate** — `scripts/p102-regate-run.ts` reads only run
   folder files, merges deterministic + model claim ledgers, applies the
   visibility rules a second time, writes the canonical `A3_gate.json` and
   `15_publish_gate.md`. Attestations: `networkUsed=false`, `agentUsed=false`.
9. **Three-tier packet writer** — assembles `16_three_tier_institution_packet.json`
   + per-tier `RT_depth_tier*.json` + `A4_deep_recovery_tasks.json` from the
   verified ledger and the deep coverage report.
10. **Validator sweep** — `scripts/p102-validate-all.ts` runs every validator
    (unit tests, run integrity, anti-drift, concept-pack parity, identity
    registry parity, gold-set verifier, quote re-verify, deep-packet
    validator, P101 no-regression).

Only after step 10 reports PASS does the runner consider the institution
**done**. Then it moves to the next.

## 3. Failures are honest, not papered over

If an institution fails any step, the runner:

- writes a failure record to the run folder (`A5_continue_decision.json`),
- queues the institution for retry / human review (depending on failure type),
- **does not** synthesize claims to "fill" missing fields,
- **does not** infer eligibility from absence,
- **does not** broaden the crawl to compensate.

Common failure modes and their disposition:

| Failure | Disposition |
|---|---|
| A0 cleaned text empty or 404 | mark source rejected; if all sources fail → institution NEEDS_RECAPTURE |
| A1 schema validation fails | log + retry once; persistent failure → manual review |
| Quote verification fails for >5% of claims | run-folder integrity issue; halt this institution |
| A3 verdict = FAIL_PUBLIC_SAFETY | rerun A2 + A3 once; persistent fail → human review |
| A3 verdict = FAIL_REVIEW_REQUIRED | mark institution as REQUIRES_HUMAN_REVIEW |
| Tier 1 coverage WEAK + no negative-evidence | A4 recovery task generated (operator authorization needed for `--fetch-additional`) |
| Scope conflict surfaced on PUBLIC_SAFE_USCE candidate | claim downgraded to HUMAN_REVIEW_REQUIRED |

## 4. The serial queue (state / national)

Future state-slice and national runs are **not** "throw N hospitals at the
model at once." They are a **serial queue**:

```
queue:
  institution 1
  institution 2
  institution 3
  ...

for each institution in queue:
  process → validate → save → record outcome
  if fail in a way that needs recapture or auth: pause queue, log
  next
```

No two institutions are processed in parallel during a queue run. There is
no batched API call across hospitals. There is no shared in-memory state
between institutions other than the registry / identity caches.

The same per-institution discipline applies whether the queue is 1 or
6,000 institutions long.

## 5. What this gives us

- **Repeatability** — every step is a script invocation with deterministic
  inputs and outputs on disk.
- **Audit trail** — per-call CLI stdout/stderr, the schema-validated JSON
  output, the quote verifier report, the regate verdict, all the validator
  outputs — all stored under `docs/.../p102/runs/<run_id>/`.
- **T7 storage** — all heavy artifacts (raw HTML, cleaned text, PDFs,
  per-call CLI logs) live under
  `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/`.
- **No mixing** — one run folder per institution; no chance of attributing
  one hospital's claims to another.
- **Resume / retry** — `--phase A2`, `--phase A3`, `--rebuild-ledger-from-disk`
  let an operator re-enter a run at any step without re-paying for prior
  work.
- **No copy-paste chaos** — no humans selecting text from chat and pasting
  it into JSON.

## 6. What the operator does

- Authorizes new institution fetches.
- Authorizes `--fetch-additional` for A4 recovery.
- Reviews HUMAN_REVIEW_REQUIRED claims and decides whether to promote.
- Authorizes advancing from one stage to the next (existing 4 → gold set →
  state → national).
- Reviews the checkpoint docs after each sprint.

The operator does not paste claims into the system. The operator does not
write quotes by hand. The operator decides what to authorize next.

## 7. Hard rules (always on, never violated)

- No `ANTHROPIC_API_KEY`. No SDK. Claude CLI only.
- No Agent / subagent during A1, A2, A3 (`--tools ""`).
- No network during inference (tools disabled at the CLI level).
- A4 `--fetch-additional` is the ONLY authorized live-web touchpoint, and it
  is HEAD-first, institution-domain only, budget-capped, off by default.
- One institution per run folder; no cross-institution merging.
- Production main UNCHANGED; no PR, no push, no deploy from this codebase.
- All claims quote-verified; no inferred public-safe.
