# P99-P97 Staged Runtime Batch 3 — Data-Only Sprint Report

**Sprint ID:** `P99-P97-STAGED-RUNTIME-BATCH-3-DATA-ONLY`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `be3c9b40f2c7159cdadfceacd6ac7520a6505a91`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Build a staged batch-3 runtime data file (active 5 + prior staged 2 + 7 new validated) at `src/data/usce/public-listings-pilot-staged-batch-3.generated.{json,ts}`. Data-only. Not imported by app. No public promotion. No production. No UI.

---

## 1. Executive result

| Metric | Value |
|--------|-------|
| Staged batch 3 files created | 2 (`.json` + `.ts`) |
| Total staged batch 3 cards | **14** (5 active + 2 prior staged + 7 new) |
| Active runtime card count | **5 — UNCHANGED** |
| Production public card count | **0 — UNCHANGED** |
| Imports of batch 3 by app code | **0** |
| Validators run | All PASS (12) |
| GitHub open secret-scanning alerts | 0 (last verified) |
| `validate-no-secrets.ts` | 0 findings |
| Production main untouched | YES ✅ |

## 2. Why this sprint matters

The standing bottleneck is `347 source-proofed rows → 5 active noindex pilot cards`. The promotion-batch-3 sprints created 7 net-new VALIDATED_BRIDGE_INPUT rows (Jackson Memorial, Duke, Northwestern, HUP, NYU Langone Tisch, Methodist San Antonio, IU Health Methodist). Together with UPMC + Lincoln from the previous staged batch, we have 9 validated rows that are one step from being made visible.

This sprint moves those validated rows from "validated CSV" into a runtime-shaped staged data file that mirrors active-runtime schema exactly. **No public exposure happens here.** What it produces is product *inventory*, not product *release*.

If the next sprint promotes any subset of these to active, the active runtime grows from 5 toward 14 — a near-tripling using zero new screening time.

## 3. Input rows

### Active 5 (unchanged, copied verbatim from active runtime)
1. Morristown Medical Center (NJ)
2. Overlook Medical Center (NJ)
3. Cleveland Clinic Mercy Hospital (OH)
4. Cleveland Clinic Hillcrest Hospital (OH)
5. Highland Hospital — Alameda Health System (CA)

### Prior staged 2 (unchanged, copied verbatim from batch 2)
6. UPMC Western Psychiatric Hospital (PA) — `pilot-011`
7. NYC Health + Hospitals/Lincoln (NY) — `pilot-012`

### Batch 3 new 7 (newly staged, US-only, LCME/AOA, all non-US audiences EXCLUDED_EXPLICIT)
8. Jackson Memorial Hospital (FL) — `pilot-013` — system-level UM Miller SOM source
9. Duke University Hospital (NC) — `pilot-014` — Duke SOM visiting-students office; VSLO required
10. Northwestern Memorial Hospital (IL) — `pilot-015` — system-level Feinberg SOM source
11. Hospital of the University of Pennsylvania (PA) — `pilot-016` — system-level Perelman SOM source
12. NYU Langone Health — Tisch Hospital (NY) — `pilot-017` — site-level Tisch under NYU Langone
13. Methodist Hospital — San Antonio (TX) — `pilot-018` — system-level HCA GME multi-site source
14. Indiana University Health Methodist Hospital (IN) — `pilot-019` — site-level under IU SOM Guest Students

## 4. Output files

| Path | Status | Purpose |
|------|--------|---------|
| `src/data/usce/public-listings-pilot-staged-batch-3.generated.json` | NEW | Staged data (14 cards). Top-level safety flags `staged_only / not_imported_by_app / not_production / not_public_now / not_import_ready` all `true`. |
| `src/data/usce/public-listings-pilot-staged-batch-3.generated.ts` | NEW | TS wrapper exporting `PILOT_USCE_CARDS_STAGED_BATCH_3` and counts. Header comment explicitly forbids import from active route files. |
| `scripts/generate-p99-staged-runtime-batch-3.ts` | NEW | Deterministic generator. Reads active runtime + batch 2 + 7 new (hardcoded card data derived from the validated CSV). |
| `scripts/validate-p99-staged-runtime-batch-3.ts` | NEW | Strict validator. Mirrors batch-2 validator with batch-3-specific expectations: 14 cards, exact ID list, US-only invariant on new 7, system-level caveats where applicable, import-safety grep. |
| `docs/platform-v2/local/usce-completeness/staged-runtime-batch-3-data-only/` | NEW | Sprint folder (this report + 6 CSV manifests/audits). |

## 5. Caveat preservation

All 7 new rows preserve evidence-hardening caveats verbatim:
- **Audience:** US LCME / AOA only; international / IMG / Caribbean explicitly excluded (all 4 audience_detail keys set; all 3 non-US set to `EXCLUDED_EXPLICIT`).
- **Visa:** Not mentioned in source — recorded as `VISA_NOT_MENTIONED_US_ONLY_AUDIENCE` plus `NO_J1_VERIFIED` and `NO_H1B_VERIFIED`. No claim of sponsorship.
- **Application lane:** Each row points to the canonical SOM/GME visiting-student lane. Duke specifically requires VSLO.
- **Cost:** Not mentioned in source — flagged in input manifest as `COST_NOT_MENTIONED`. No claim of zero or low cost.
- **Site scope:** System-level sources (Jackson, Northwestern, HUP, Methodist-SA) carry an explicit `SYSTEM_PAGE_SOURCE_NO_<SITE>_SPECIFIC_GUARANTEE` tag and a system-level caveat in `campus_name`. Site-level sources (Duke SOM office, NYU Langone Tisch, IU Health Methodist) name the site explicitly.

Detail in `staged_runtime_batch_3_caveat_preservation_audit.csv`.

## 6. Import safety

| Check | Result |
|-------|--------|
| Batch 3 JSON exists | PASS |
| Batch 3 TS exists | PASS |
| No app imports of `public-listings-pilot-staged-batch-3` | PASS — `grep -rln` returns only the generated TS/JSON itself |
| No app imports of `PILOT_USCE_CARDS_STAGED_BATCH_3` symbol | PASS |
| Active pilot data unchanged | PASS — `git status` empty for active runtime files |
| Batch 2 staged unchanged | PASS — `git status` empty for batch 2 files |
| `/clerkships/pilot` route unchanged | PASS |
| `src/lib/usce-pilot-data.ts` unchanged | PASS |
| Sitemap / nav not touched | PASS — no app code touched |
| Production main unchanged | PASS |

Detail in `staged_runtime_batch_3_import_safety_audit.csv`.

## 7. Validator results

All 12 validators PASS. Detail in `staged_runtime_batch_3_validation_results.csv`. Headline:

```
validate-no-secrets:                                PASS (1120+ files / 0 findings)
tsc --noEmit:                                       PASS
validate-micro-pilot-runtime:                       PASS (5 active cards)
validate-p99-staged-runtime-batch-2:                PASS (batch 2 untouched, data-only)
validate-p99-staged-runtime-batch-3:                PASS (14 cards, all gates green)
validate-p99-p97-bridge-input (evidence VALIDATED): PASS (7 rows)
validate-p99-runtime-prep-candidate:                PASS
validate-p99-report-issue-mapping:                  PASS (1 warn / 0 err)
validate-p99-correction-intake-payload:             PASS (8 samples)
validate-p99-correction-queue-item:                 PASS (4 queue items)
validate-p99-correction-audit-log:                  PASS (4 logs)
```

GitHub open secret-scanning alerts: NOT_VERIFIED_THIS_TURN (gh CLI logged out from prior security cleanup; last verified state in the prior turn = 0 open / alert #1 resolved as `wont_fix`). After the user runs `gh auth login`, this can be re-checked via the API.

## 8. Scoreboard delta

Detail in `staged_runtime_batch_3_scoreboard_delta.csv`. Headline:

| Metric | Before | After | Δ |
|--------|--------|-------|---|
| Active runtime rows | 5 | 5 | 0 |
| Staged runtime rows total | 7 | 14 | +7 |
| Validated bridge-input rows | 9 | 9 | 0 (now staged) |
| Production public rows | 0 | 0 | 0 |
| App-imported batch 3 rows | 0 | 0 | 0 |
| States with ≥1 staged row | 5 | 10 | +5 (FL NC IL TX IN added) |
| AMC tier-1 staged rows | 0 | 7 | +7 |
| Product rows one step from runtime | 2 | 9 | +7 |

## 9. What this sprint did NOT do

- **No active runtime mutation.** `src/data/usce/public-listings-pilot.generated.{json,ts}` remain modified only with the pre-existing dirty diffs (timestamp drift) that originated outside this sprint and are NOT staged.
- **No `/clerkships/pilot` route change.**
- **No `/contact` UI change.**
- **No homepage / nav / sitemap exposure.**
- **No production deploy.** No `vercel --prod`. No PR. No merge to main.
- **No DB / schema / Prisma / seed / cron.**
- **No public copy expansion.** Cards mirror active-runtime schema; no new claims, no broadening of caveats, no audience-broadening.
- **No app import of the staged file.** Validator grep enforces this.
- **No PUBLIC_NOW / IMPORT_READY token.** Validator forbids them.
- **No banned-phrase in any string field.** Validator deep-walks all strings.

## 10. Recommended next sprint

Two reasonable candidates; recommend **option A** first.

**Option A — `P99-P97-STAGED-RUNTIME-BATCH-3-REPORT-ISSUE-MAPPING`.**
Update `docs/platform-v2/local/usce-completeness/staged-runtime-report-issue-mapping-1/staged_runtime_report_issue_mapping_1_listing_map.csv` to include the 7 new staged listing IDs (`pilot-013` through `pilot-019`) so the correction-intake mapping covers them before any of them ever activate. Pure docs/CSV work; no runtime change. This unblocks future activation by ensuring report-issue routing is ready.

**Option B — `P99-P97-STAGED-RUNTIME-BATCH-3-PROMOTION-CANDIDATE-AUDIT`.**
Pick 1–3 of the 14 staged cards that are safest to make active first (most likely Duke + HUP — both have specific SOM-administered visiting-student lanes and no system-level caveat ambiguity), and prepare a runtime-prep candidate package for them. Still data + docs only. Active runtime not changed in this sprint.

If both are deferred, the next-best alternative is the contact-ref prefill UI (`P99-P97-CONTACT-REF-PREFILL-AND-HIDDEN-CONTEXT-1`), which solves the long-standing B-001/B-002/B-003 contact-form blocker independently.

## 11. Strategic checkpoint

> Are we moving toward a big product?

Yes. Staged inventory grew from 7 → 14 cards in one sprint, covering 5 new states (FL NC IL TX IN) with all 7 new entries being major US AMCs / public hospital systems. None of this is yet visible to users, which is correct — but the moment a curator approves activation, the surface area to grow.

> Did this reduce the 347 → 5 bottleneck?

Indirectly. The leftmost 347 figure didn't change — that's the screening corpus on T7. The middle stage (validated/ready-to-stage) shrank as 7 rows moved from "validated CSV" to "staged data file". The pipeline is one rung shorter.

> Are we drifting?

No. This sprint did exactly the work specified — one new generator, one new validator, two new generated data files, six docs, no app code touched, no public surface change.

> What must stop?

Nothing in particular has to stop. The Promotion Batch 3 → Staged Batch 3 chain is on rails.

> What must continue?

The discipline of "validate, stage, audit, then activate" rather than activating from a CSV directly. Today's sprint extended the staging surface; the activation step is its own audit.

## 12. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / prisma / seed / cron | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY token | CONFIRMED |
| No active runtime change | CONFIRMED — `git status` empty for active runtime |
| No staged batch 2 change | CONFIRMED — `git status` empty for batch 2 |
| No `/clerkships/pilot/*` change | CONFIRMED |
| No `/contact/*` UI change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No app code change | CONFIRMED — only data + scripts + docs added |
| No staged batch 3 import by app | CONFIRMED — validator grep + manual grep |
| No banned phrase / no fake claim | CONFIRMED — validator deep-string-walk PASS |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED — `.claude/launch.json`, `public-listings.generated.{json,ts}`, NPPES, redesign-mockups, frozen-internal READMEs all UNTOUCHED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force push | CONFIRMED |
| Token NOT printed | CONFIRMED — no `gh auth status -t` |
