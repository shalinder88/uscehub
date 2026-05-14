# P102-0G — Single-Domain Deep Run + Bounded A4 Fetch Checkpoint

schemaVersion: p102-deep-0f-1
date: 2026-05-14
status: BUILT, SINGLE-DOMAIN DEEP-RUN DONE, A4 FETCH BUILT + EXERCISED ON ONE INSTITUTION
predecessor: P102-0F (commit `c19e684`, branch `local/p102-deep-institutional-extraction-mode`)
branch: `local/p102-single-domain-deep-and-a4-fetch`

## 1. Why P102-0G was needed

P102-0F proved the deep three-tier architecture on AdventHealth Orlando — a hard system-domain test that correctly produced zero `PUBLIC_SAFE_USCE` (the right outcome). But it left two open questions:

1. **Does deep mode also work on a single-domain institution** — i.e. an institution whose primary domain IS its institution-specific domain (`houstonmethodist.org`, `tbh.org`), so Tier 1 USCE pages, if they exist, would be `INSTITUTION_SPECIFIC` scope rather than `HEALTH_SYSTEM_LEVEL`?
2. **Can A3's deep recovery tasks actually be executed?** P102-0F generated 2 tasks (VSLO/clerkship + Loma Linda affiliation pages) but could not act on them — `--fetch-additional` was captured in the spec but not implemented.

P102-0G answers both. We run deep mode on **Houston Methodist Hospital** (single-domain), and we build a bounded, HEAD-first, institution-domain-only `--fetch-additional` that executes the exact A4 recovery URLs A3 named.

## 2. Confirmation: this is terminal automated Claude CLI, not manual chat

A new doctrine doc is added: [`P102_TERMINAL_AUTOMATION_MODEL.md`](P102_TERMINAL_AUTOMATION_MODEL.md). It records the operating model in one place:

- The runner is `scripts/p102-claude-cli-extractor.ts` plus `scripts/p102-deep-source-discovery.ts`, `scripts/p102-regate-run.ts`, `scripts/p102-quote-verify.ts`, `scripts/p102-a4-fetch-additional.ts`, `scripts/p102-validate-all.ts`.
- Each script invokes the local `claude` CLI in print mode (`claude -p --output-format json --json-schema ... --tools "" --no-session-persistence --system-prompt-file ...`).
- One institution per run folder. Per-call CLI stdout/stderr logs live under `docs/.../p102/runs/<run_id>/logs/`.
- No human paste. No manual chat. No SDK. No API key.
- State / national mode (when authorized) is a **serial queue**, not a bulk parallel sweep. One institution → process → validate → save → next.

## 3. Single-domain deep run

Institution: **Houston Methodist Hospital** (`inst_houston_methodist_hospital_tx`, single-domain `houstonmethodist.org`)
Run ID: **`p102-1-trial-2-run-1`**

> _Numbers filled in after Phase D._

| Metric | Value |
|---|---:|
| Source candidates discovered | 39 |
| Accepted sources | 6 (HTML 200) |
| Rejected sources | 33 (404s) |
| Tier 1 claims | 19 (lane: `CAUTION_SAFE_INTERNAL_REVIEW` — single-domain, eligibility unclear) |
| Tier 2 claims | 17 (all `FUTURE_LANE_ONLY`) |
| Tier 3 claims | 17 (all `FUTURE_LANE_ONLY`) |
| **PUBLIC_SAFE_USCE** | **0** — correct: `/observership` resolves to a Pharmacy P1/P2 externship, NOT a medical-student observership; the model correctly held it at HUMAN_REVIEW_REQUIRED |
| FUTURE_LANE_ONLY | 28 |
| HUMAN_REVIEW_REQUIRED | 22 |
| Quote-verified | **53 / 53 (100%)** |
| Rejected on quote re-verify | 0 |
| Model A3 verdict | **PASS_PUBLISH_READY** |
| Tier 1 coverage verdict | PASS_PARTIAL (no dedicated medical-student observership page exists on `houstonmethodist.org`) |
| Tier 2 coverage verdict | PASS_COMPLETE |
| Tier 3 coverage verdict | PASS_COMPLETE |
| Deterministic regate verdict | PASS_WITH_CAVEATS (publicSafe=false, futureLaneValue=HIGH, hallucinations=0) |
| A4 recovery tasks generated | 0 (A3 correctly concluded no Tier 1 medical-student observership page exists; nothing to recover) |

## 4. A4 `--fetch-additional` — bounded recovery

New script: [`scripts/p102-a4-fetch-additional.ts`](../../../../scripts/p102-a4-fetch-additional.ts).

Rules (all enforced in code):

- **Disabled by default** at the orchestrator level. Only fires when `--fetch-additional` is explicitly passed AND `--deep` is also passed.
- **Same institution / run folder only.** No cross-institution work.
- **Same official-domain set only**, sourced from `05_canonical_institution.json` → `officialDomains`. Off-domain redirects are rejected.
- **No third-party search.** No Google / Bing. No aggregator sites.
- **HEAD first.** GET only on 200 (after at most 5 same-domain redirects).
- **Budget caps:** `--max-additional-candidates` (default 20), `--max-additional-accepted` (default 10), `--max-additional-pdfs` (default 5).
- **1 s sleep between requests.** 10 s per-request timeout.
- **User-Agent:** `USCEHub-P102-Recovery/0.1`.
- **Every artifact is SHA-256 hashed** and saved to T7 under `additional/`.
- **`01_source_map.json` is appended** with new accepted sources.
- **`A4_fetch_additional_*.json` files** record plan, results, rejected, and per-artifact manifest.
- **Plan-only mode by default** (`--plan-only`); no network traffic without `--execute`.

### Candidate URL sources (in order)

1. Explicit URLs in the recovery task's `candidateUrls` array (if A3 emitted any).
2. Absolute URLs mined from the task's `suggestedNarrowAction` / `reason` prose, filtered to allowed domains.
3. Path-like substrings (e.g. `/medical-clerkship`, `/gme`) mined from the same prose, promoted onto each allowed domain.
4. Hand-curated path candidates per `missingFamily` (e.g. VISITING_STUDENT → `/medical-clerkship`, `/medical-students`, `/student-visit`).

The candidate set is the union of (1) + (2) + (3) + (4), then de-duped and capped at `--max-additional-candidates`.

### A4 fetch-additional execution

Run ID used: **`p102-1-trial-2-run-3`** (AdventHealth Orlando) — Houston produced zero A4 tasks, so AdventHealth's 2 tasks from the prior P102-0F run were the natural target.

- A4 tasks before fetch: **2** (VSLO/clerkship lookup + Loma Linda affiliation lookup)
- Candidate URLs (after mining task prose + path-family hints): **6** (3 per task)
- Candidates attempted: **4** (2 deduped as already in source map)
- Accepted: **1** (HTML 1, PDF 0) — `https://www.adventhealth.com/adventhealth-graduate-medical-education/medical-clerkship-redmond` (a redirect from `/medical-clerkship`)
- Rejected:
  - 2× "already in source map" (`/gme`, `/medical-education`)
  - 3× HEAD 404 (`/medical-school-affiliations`, `/affiliations`, `/affiliated-schools`)
- Cleaned-text length captured: ~4 KB; describes a real medical-student clerkship program at **AdventHealth Redmond (Georgia)**, not Orlando.

### Critical scope-discipline test (and bug found+fixed)

The captured Redmond clerkship page is rich Tier 1 USCE content but on the system-level domain `adventhealth.com`. A naive promotion would (incorrectly) attribute Redmond's clerkship to AdventHealth Orlando.

After the first re-deep, the model emitted 5 `PUBLIC_SAFE_USCE` claims from the Redmond page tagged with `sourceScope: INSTITUTION_SPECIFIC` (its own emission). The deterministic visibility classifier accepted them because the orchestrator was falling back to the model's emitted scope when the source-map scope was `UNKNOWN_SCOPE`. The Redmond claims explicitly quote "on the premises at AdventHealth Redmond" — clear scope conflict for an Orlando run.

**Fix:**
1. `scripts/p102-a4-fetch-additional.ts` now calls `inferSourceScope()` at fetch time so new sources land in `01_source_map.json` with the correct deterministic scope (`HEALTH_SYSTEM_LEVEL` for `adventhealth.com`).
2. `scripts/p102-claude-cli-extractor.ts` no longer trusts the model's emitted `sourceScope` to "upgrade" an unknown-scope source. When source-map scope is `UNKNOWN_SCOPE`, the orchestrator calls `inferSourceScope()` with the canonical institution context. The deterministic resolved scope is persisted into the verified-claim ledger so the standalone `p102-quote-verify` re-verification reaches the same conclusion.

**Post-fix result (AdventHealth Orlando, after fetch + scope-fix + ledger rebuild):**
- 85 verified claims (up from 70 in P102-0F initial; +1 source × deep three-tier read)
- **0 PUBLIC_SAFE_USCE** (correct — all Redmond claims downgraded to HUMAN_REVIEW_REQUIRED)
- 24 FUTURE_LANE_ONLY
- 61 HUMAN_REVIEW_REQUIRED
- 100% quote-verified (85 / 85)
- 0 scope conflicts on the regate
- Model A3 verdict: PASS_PUBLISH_READY
- Deterministic regate verdict: PASS_WITH_CAVEATS

This is the kind of bug the framework should and did catch. The fix preserves the scope discipline doctrine even when the model is confident in a wrong assignment.

## 5. Validator status

```
test-p102 (unit tests)                       PASS
validate-p102-discovery-runner               PASS
validate-no-secrets                          PASS
p102-anti-drift-validator                    PASS
p102-validate-concept-packs                  PASS
p102-validate-run-integrity                  PASS  (cleaned-text hashes now correct on additional sources)
p102-validate-identity-registry              PASS
p102-gold-set-verify                         PASS
p102-quote-verify (model ledgers)            PASS  (228 / 228 across 4 runs)
p102-validate-deep-packet (P102-0F)          PASS
validate-p101-discovery-command-center       PASS
```

Overall: **PASSED — 11 / 11 validators**.

## 6. Ready for P102-GOLD?

**Yes, conditionally.** P102-0G demonstrates the four discipline guarantees the gold-set deep benchmark needs:

1. **Single-domain Tier 1 read** works — Houston produced 19 Tier 1 candidates with proper scope classification and zero false PUBLIC_SAFE_USCE because the institution genuinely doesn't publish a medical-student observership page.
2. **System-domain scope discipline** holds — AdventHealth Orlando's 85 claims include 32 Tier 1 candidates from the Redmond clerkship page, all correctly held to HUMAN_REVIEW_REQUIRED rather than wrongly promoted.
3. **A4 bounded fetch** works end-to-end — 1 of 6 candidate URLs accepted after HEAD-first probe with budget caps; 5 correctly rejected (2 dedupe + 3 404s); zero off-domain traffic.
4. **The scope-discipline bug we found is fixed**. Without finding and fixing the UNKNOWN_SCOPE → model INSTITUTION_SPECIFIC slip, gold-set deep mode would have produced false-positive PUBLIC_SAFE_USCE attributions on every system-domain institution. Now the deterministic classifier is authoritative regardless of model emission.

**Caveat:** the gold-set deep benchmark needs at least one institution where a real PUBLIC_SAFE_USCE promotion can succeed (e.g., Mayo Clinic Rochester, Cleveland Clinic). Neither Houston nor AdventHealth Orlando is such an institution. If gold-set produces zero PUBLIC_SAFE_USCE across all 11 institutions, that's diagnostic and we re-evaluate the gold-set queue.

## 7. Still blocked?

- **No blockers for P102-GOLD deep benchmark.** The framework is ready.
- **Mild concern:** the model's emitted `sourceScope` field is now ignored entirely by the classifier. We may want to retire the field from the schema in a follow-up sprint to reduce confusion.
- **Future work:** `--fetch-additional` currently constructs candidate URLs from path-family hints when the task prose doesn't include explicit URLs. This is bounded and safe but limited — for richer recovery, A4 could be extended to do site-search of an institution's `/sitemap.xml` for the missing tier. Out of scope for P102-0G; captured for a future authorized sprint.

## 8. Hard rules confirmed

- ✓ No `ANTHROPIC_API_KEY`. No SDK. Terminal Claude CLI only.
- ✓ No Agent / subagent during A1/A2/A3.
- ✓ A4 `--fetch-additional` is the only authorized live-web path, HEAD-first, institution-domain-only, budget-capped, off by default.
- ✓ One institution at a time.
- ✓ Production main `739ab1e` UNCHANGED.
- ✓ No PR, no push, no deploy.
- ✓ No schema / DB / migration / seed / UI / SEO changes.
- ✓ Canonical T7 root only.
