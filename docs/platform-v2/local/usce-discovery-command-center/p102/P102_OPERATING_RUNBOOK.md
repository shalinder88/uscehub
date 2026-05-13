# P102 Operating Runbook

schemaVersion: p102-0r-1
status: BINDING (operational reference for running P102 sprints)
last-updated: 2026-05-12

This runbook covers how to operate the P102 framework end-to-end. It is intended for operators / Claude sessions resuming USCEHub work.

## Quick orientation

The P102 framework discovers source-linked medical-opportunity content one institution at a time. Pipeline:

```
A0 deterministic probe → A1 broad capture → A1.5 audit →
A2 depth → A2.5 semantic miss → A3 hostile gate → optional A4 / A5
       (then P102-0C deterministic claim extraction + P102-0D model reader)
```

Each stage has scripts, file outputs, and validation rules. The runbook below covers the operational flow.

## Pre-flight checklist (before any run)

Before running any P102 institution, verify:

1. **Repo state**
   - Working directory: `/Users/shelly/usmle-platform`
   - Current branch: `local/p102-claim-extraction-layer` (or a P102-0D successor)
   - HEAD includes the latest P102 sprint commit
   - `git status --short` shows only expected dirty/untracked files (NPPES, redesign mockups, `.claude/launch.json` are pre-existing and OK)

2. **T7 state**
   - `/Volumes/T7Shield_Code/` mounted and writable
   - `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/` exists with sub-dirs `queues/`, `runs/`, `artifacts/`, `indexes/`, `logs/`, `tmp/`
   - Legacy root `/Volumes/T7Shield_Code/USCEHubEvidence/` is NOT used

3. **Tooling**
   - `pdftoppm` available (PDF cascade): `which pdftoppm` should resolve
   - `tesseract` optional (PDF OCR cascade): if missing, framework marks `PDF_OCR_UNAVAILABLE` honestly
   - Node version supports `node:fetch`, `node:test`, `node:timers/promises`

4. **Validators**
   Run these and confirm PASS before starting a new institution:
   ```
   npx tsx scripts/validate-p102-discovery-runner.ts
   npx tsx scripts/validate-no-secrets.ts
   npx tsc --noEmit
   npx tsx scripts/test-p102.ts
   ```

5. **Production safety**
   - Production main is at `739ab1e` (the operator-confirmed pre-pivot state). It must remain UNCHANGED.
   - `git log --oneline -1 main 2>/dev/null` — confirm main is unchanged.
   - We are working on a `local/p102-*` branch.

## Running one institution

### Step 1: Add the institution to a queue

Create or edit `docs/platform-v2/local/usce-discovery-command-center/p102/queues/<queue_id>.csv`. Use `p102_queue_template.csv` as the header. Required columns:
- `institution_id` (stable, e.g. `inst_houston_methodist_hospital_tx`)
- `canonical_name`
- `state`, `city` (county optional)
- `official_domain` (the institution's primary public domain — NOT a third-party aggregator)
- `target_lanes` (pipe-separated, e.g. `IMG_OBSERVERSHIP|VISITING_MEDICAL_STUDENT`)
- `priority` (HIGH | MEDIUM | LOW)
- `why_included` (short rationale)
- `status` = `NOT_STARTED`

### Step 2: Run the A0 → A1 → A2 → A2.5 → A3 pipeline

```
npx tsx scripts/p102-discovery-runner.ts \
  --queue docs/.../queues/<queue_id>.csv \
  --limit 1 \
  --run-id p102-<sprint>-<institution-slug>-<n> \
  --institution-id inst_<...>
```

Expect ~2–5 minutes per institution at 1.5s/request rate. Watch for:
- `[p102] A0: <n> probes, <m> accepted, <k> JSON-LD records` — confirms A0 captured sources
- `[p102] A3 hostile gate (no network, no Agent, run-folder only)…` — confirms A3 is reading run-folder only
- `[p102] DONE. verdict=<...> accepted=<m> runId=<id>`

If anything errors, the run lock at `/Volumes/T7Shield_Code/.../p102-national-runner/runs/<run_id>/.run.lock` may be left behind. Inspect with `cat`; if the PID is dead, delete manually and re-run.

### Step 3: Run deterministic claim extraction

```
npx tsx scripts/p102-extract-claims-from-run.ts --run-id p102-<...>
```

Produces `13_source_claims.json` + updates `03_opportunity_objects.json`, `RT_depth_*.json`, `09_final_canonical.json`.

### Step 4: Re-gate with A3

```
npx tsx scripts/p102-regate-run.ts --run-id p102-<...>
```

Produces fresh `A3_gate.json` + `15_publish_gate.md` reflecting the new claims.

### Step 5: Validate

```
npx tsx scripts/validate-p102-discovery-runner.ts
```

Must PASS. If FAIL, do not proceed; investigate the specific finding.

### Step 6: Identity backfill + dedupe (one-time per institution)

```
npx tsx scripts/p102-backfill-canonical-institution.ts --run-id p102-<...>
```

Updates the run's `05_canonical_institution.json` with inferred parent_system + populates the T7 dedupe index.

### Step 7: A4 task enumeration (if needed)

If A3 emitted `requiredA4Tasks` or there are failed fetches:

```
npx tsx scripts/p102-a4-focused-recovery.ts --run-id p102-<...>
```

Reads A3_gate + source_map; writes structured A4 tasks marked PENDING_OPERATOR or PENDING_EXECUTION. Execute network-bound tasks only when extraction is authorized.

### Step 8: Run check via A5

```
npx tsx scripts/p102-a5-continue-if-stuck.ts --run-id p102-<...>
```

Confirms the run reached completion or identifies the stuck stage.

## Interpreting A3 verdicts

| Verdict | Meaning | Action |
|---|---|---|
| `PASS` | All claims verified, public-safe candidates with full quote backing | Optional manual review before publishing |
| `PASS_WITH_CAVEATS` | Run completed; either no PUBLIC_SAFE_USCE emitted (deterministic baseline) or some claims need review | Move to next institution; or run P102-0D for promotion |
| `FAIL_NEEDS_A4` | A0 captured zero usable sources OR critical fields missing | Generate A4 tasks; investigate domain reachability or path coverage |
| `FAIL_FATAL` | Hallucination risk OR unsupported claim with declared quoteVerified | Stop; investigate immediately. This means extraction logic is broken |

## Adding a new institution to the queue

For an arbitrary new institution (not in P101/P102 evidence yet):
1. Pick `institution_id`: `inst_<canonical-lowercase-slug>_<state>`. Use snake_case. Make it stable.
2. `canonical_name`: official public name. Avoid acronyms unless that IS the official name (e.g., "TBH Center" no — "The Brooklyn Hospital Center" yes).
3. `official_domain`: institution's primary domain, NOT a parent system's domain. If the institution only lives on a system domain (e.g., AdventHealth Orlando on adventhealth.com), accept the system domain — the framework will detect scope and flag accordingly.
4. `target_lanes`: include the lanes you EXPECT to find. Don't over-include.
5. Run `npx tsx scripts/p102-suggest-candidate-paths.ts --canonical-name "<name>" --official-domain <domain> --medical-school <som>` (see P102-0J) to get a recommended path list before A0. Add institution-specific paths to a side queue if needed.

## Debugging common failure modes

### A0 returns 0 accepted sources

Causes (in order of likelihood):
1. **Wrong official_domain.** Verify the institution's primary public site. Don't use academic-affiliate or parent-system domain unless that's literally the only public-facing site.
2. **Bot-blocked.** Look at `00_fixed_path_probe.json`: if many sources are `FETCH_403`, the institution is blocking. Mark `BOT_BLOCKED_MANUAL_RETRY` and move on.
3. **Domain redirects everything to a marketing page.** Check `finalUrl` in probe results; if all redirect to `/contact` or `/home`, the fixed-path probe is futile. Use sitemap (if non-empty) or expand fixed paths.
4. **Sitemap empty (`<sitemapindex/>`).** Hartford-style. Lean on fixed-path probes; consider adding institution-specific paths.

### Quote-verification failure

Causes:
1. **Cleaned text changed since extraction.** Source-hash mismatch — re-fetch or re-extract.
2. **HTML structure broke the v1 text extractor.** Try v2 (`scripts/p102-recleantext.ts`) and re-run extractor against `cleaned_text_v2/` (manual: copy v2 path into source_map and re-extract).
3. **Extractor over-extracted (bug).** Validator will catch any `quoteVerified=true` claim where the substring fails. Investigate and patch the extractor.

### PUBLIC_SAFE_USCE blocked by visibility rules

Causes:
1. Source family is future-lane (GME_PAGE, RESIDENCY_PAGE, FELLOWSHIP_PAGE, CAREERS_PAGE) — claim correctly stays FUTURE_LANE_ONLY.
2. Source scope is HEALTH_SYSTEM_LEVEL or MEDICAL_SCHOOL_LEVEL — claim needs explicit `campusApplicabilityProof`. Add the proof to the claim (a quote that names the campus).
3. Quote is NOT_STATED_ON_SOURCE — claim cannot be public-safe.
4. Model A1/A2 reader not yet wired (P102-0D pending) — deterministic baseline never auto-promotes. Wait for P102-0D.

### Run lock blocks new runs

The T7 run folder contains `.run.lock` if a run is in progress. If a crashed run left a stale lock:
```
ls -la /Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/runs/<run_id>/.run.lock
```
Inspect, confirm the recorded PID is not running, then delete manually.

## Maintaining T7 + indexes

T7 indexes at `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/indexes/`:
- `institution_index.csv` — every institution ever processed
- `run_index.csv` — every run
- `source_url_index.csv` — every source URL fetched
- `claim_index.csv` — every claim emitted (P102-0C wired this in)
- `opportunity_index.csv` — every opportunity object
- `artifact_index.csv` — every artifact file
- `dedupe_index.csv` — pairwise institution comparisons

All are append-only. The runner appends per institution. The backfill script appends pairwise comparisons.

## Backup & rollback

- Repo: standard git history. `git log` for any P102 run.
- T7: every run folder is write-once (the runner refuses to overwrite without `--resume`). To "rollback" a run, just stop using its run_id; do not delete the folder.
- Indexes: append-only CSVs. Don't truncate. If a row is wrong, append a corrective row.

## Pre-publish gate (for future PUBLIC_SAFE_USCE)

Before any PUBLIC_SAFE_USCE claim reaches the live USCEHub site:
1. A3 verdict must be `PASS` or `PASS_WITH_CAVEATS`.
2. `validate-p102` must PASS.
3. Manual review must sign off (the framework alone is not authority to publish).
4. Cross-check: does this exact claim already exist on a competing source (FRANdata equivalent)? If yes, OK (we cite our own source); if our claim contradicts public knowledge, hold for review.

## When in doubt

- More conservative is better.
- NOT_STATED_ON_SOURCE is a valid answer.
- A FAIL verdict is better than a hallucinated PASS.
- Cite the doctrine (`P102_OPERATING_DOCTRINE.md`). The 30 rules are binding.

## Sprint history (commits)

- `e4275fd` — P102-0R: initial framework + Hartford dry run
- `03a56dd` — P102-0B: +5 fixed paths
- `c64a5a1` — P102-1: 3-institution Trial 2
- `a85838c` — P102-0C: claim extraction + quote verification
- `d8e70df` — P102-0E: test suite + scope-inference bug fix
- `c8dbe97` — P102-0F: cleaned-text v2 + content-based reclassifier
- `071549b` — P102-0G: A4 / A5 scripts
- `4001ebc` — P102-0H: gold-set spec + identity canonicalizer + dedupe
- `66e0edc` — P102-0I: concept-pack expansion + sitemap-index recursion
- (this sprint) — P102-0J: runbook + candidate-path generator
- (future) — P102-0D: model A1/A2 reader

## Pending sprints (blocked on operator)

- **P102-0D** — model A1/A2 reader using captured prompt at `specs/P102_A1_A2_READER_PROMPT.md`. **Required before** state/national.
- **P102-GOLD-RUN** — execute the gold-set queue after P102-0D online. Requires operator authorization.
- **P102-STATE** — single-state slice. Requires P102-GOLD pass.
- **P102-NATIONAL** — full national run. Requires P102-STATE pass + explicit operator authorization.
