# Visa Job Radar — Engine Spec

**Status:** APPROVED (2026-05-29) with 4 confirmations — (1) fix the false "3x daily" claim immediately [done: `src/lib/waiver-jobs-data.ts` header], (2) one source-bounded AI classifier (interface-only in R1), (3) negation/polarity layer mandatory, (4) no cron yet. **Phase 1 deterministic engine BUILT + verified offline** — see `scripts/visa-job-radar/` and run dir `docs/platform-v2/local/career/jobs/radar/runs/`. Gold self-check 12/12, connector parsers pass, 0 quote-validation failures, 0 fixtures emitted to the app. No DB, no cron, no public jobs yet.
**Parent:** `VJ_IA_REORG_BLUEPRINT.md` (this is the R2 engine deliverable).
**Builds on (already in repo):** `src/lib/job-source-compliance.ts` (4-tier legal framework), `src/lib/waiver-jobs-data.ts` (the manual discover→verify→source-employer workflow this automates), `prisma` `WaiverJob` + `DataVerification` models (target homes, **unwired in R1**), `vercel.json` crons, deps `fast-xml-parser` / `playwright` / `zod` / `tsx`.

---

## 0. Premise

Build the jobs layer like a **diagnostic test**, not a job board:

- **High-sensitivity intake** — cast wide, miss nothing.
- **High-specificity publish gate** — publish only what's provably real.
- **Everything in between is held, never deleted.**
- **Deterministic code owns all I/O and ground truth. AI only classifies bounded text it is handed. A deterministic validator re-checks every AI claim against source.**

The product is **intelligence, not inventory.** We never claim complete or majority coverage of J-1 jobs. A smaller, 100%-verifiable, fresh, source-linked list beats a larger partly-stale one.

### Non-goals
- Not a generic job board.
- No crawling commercial boards (PracticeLink, PracticeMatch, LinkedIn, DocCafe, HealtheCareers) in R1.
- No publishing low-confidence or recruiter-hidden-employer jobs.
- No "guaranteed visa / guaranteed waiver" language. No "complete coverage" claim.
- No "this employer will post soon" predictions (the immigration system is lagging, not leading).
- No locums in R1.

---

## 1. Two products

| Product | Publishes? | Contents |
|---|---|---|
| **Open Visa Job Radar** | Yes (eventually) | Current open jobs with a verbatim affirmative visa quote, resolved employer/facility, active source URL. |
| **Sponsor-Propensity Enrichment** | No — never as jobs | DOL LCA + PERM disclosure data → "who sponsors physicians habitually." Used to prioritize crawling and (R2+) power employer profiles. |

**Legal reality that forces this split:** open H-1B / J-1 jobs carry *no* public-posting mandate; the LCA is a worksite notice to existing staff, usually post-selection. PERM *does* mandate public recruitment — but for an already-filled role. So a filing signal can never be published as an open job. Enrichment is a **quarterly static dataset**, not a live "radar."

---

## 2. Source hierarchy

**Tier 1 — clean, use first**
- USAJobs API (federal series **0602 Medical Officer**; VA + IHS agencies).
- HRSA Health Workforce Connector.
- 3RNET — **partnership/feed only**, never crawl (best J-1 tagging; mission-aligned nonprofit).
- Employer-direct ATS (Workday / Greenhouse / Lever / Taleo RSS / iCIMS / ORC).
- Employer career pages emitting schema.org `JobPosting` JSON-LD (employers publish this *to be* aggregated).
- DOL LCA + PERM disclosure data — **enrichment only**.

**Tier 2 — experimental, low priority**
- Official Search APIs (Google Programmable Search / Bing Web Search). **Both are in flux — treat as a fragile add-on, never the backbone. No SERP HTML scraping.**
- State Primary Care Offices / Conrad 30 pages; state FQHC/PCA job pages; hospital-system sitemaps.
- State workforce boards — **flag PERM-phantom risk**; a SWA "job order" may be a compliance ad for a filled role.

**Tier 3 — never crawl (R1)**
- PracticeLink, PracticeMatch, LinkedIn, DocCafe, HealtheCareers. Partnership or manual benchmarking only.

**Coverage logic (why this is enough):** Population A (large/structured employers) → reached employer-direct, fresher than the boards. Population B (small rural/underserved — where J-1 density is *highest*) → reached via 3RNET + HRSA + state PCOs, **not** by crawling boards. Residual "PracticeLink-only, no ATS, not on 3RNET" is real but a minority, and the slice most polluted by recruiter reposts. **Measure the residual empirically** (human eyeballs a board sample, checks what fraction we independently found) — don't assert coverage rhetorically.

---

## 3. Pipeline

```
source_registry           (config, version-controlled)
  → scheduled/on-demand runner        [deterministic]
  → raw_candidates                    [deterministic]
  → fetch + clean (store cleaned text + char offsets)   [deterministic]
  → visa phrase engine (lexicon + polarity)             [deterministic]
  → AI classifier  (one bounded structured-output call) [AI, source-bounded]
  → validator (verbatim-offset + gates)                 [deterministic, HARD]
  → dedupe (canonical key)            [deterministic]
  → exports: publish / hold / signal / reject + run_report.md
  → src/data/career/visa-jobs-radar.generated.ts        (R1 publish surface)
```

AI appears at exactly one step. Everything around it is deterministic and auditable.

---

## 4. Deterministic phrase engine (no regex for intelligence)

Per the binding no-regex rule. Regex permitted only for boring cleanup (dates, ZIP, salary, URL/HTML normalization), never for visa evidence.

1. Lowercase; normalize punctuation and variants (`j1`/`j-1`/`j 1`, `h1b`/`h-1b`/`h 1b`).
2. Window around candidate phrases; capture the **exact source substring + its `(start,end)` char offsets** into the stored cleaned text. (Avoid naive sentence-splitting — abbreviations like `M.D.`, `U.S.` break it; expand to boundaries but keep verbatim offsets.)
3. **Polarity tag — mandatory, the biggest precision lever:**
   - `AFFIRMATIVE` — "J-1 waiver candidates welcome", "H-1B sponsorship available".
   - `DENIED` — "we do not sponsor", "U.S. citizens only", "authorization without sponsorship", "no J-1". → its own reject reason **and** employer intelligence.
   - `BOILERPLATE` — generic EEO/visa-policy text not tied to this req.

Affirmative phrase lexicon (seed): `J-1 waiver`, `J1 waiver`, `H-1B sponsorship`, `visa sponsorship`, `Conrad 30`, `HHS waiver`, `cap-exempt`, `immigration assistance`, `J-1/H-1B welcome`. Lexicon is version-controlled and grows from false-negative review.

---

## 5. The one AI step

**Reuse the P102 model-reader pattern** (documented; SDK currently only on the `local/p102-claim-extraction-layer` branch — R1 adds `@anthropic-ai/sdk` to main):

- Model `claude-opus-4-7`, adaptive thinking.
- **Cached system prompt** = lexicon + classification rules + bucket definitions (stable prefix → cache hit).
- **Volatile suffix** = the bounded candidate (cleaned text + phrase hits + offsets).
- **Structured output** via JSON schema (`messages.parse`), `strict: true`.
- `ANTHROPIC_API_KEY`-gated; dry-run path for no-key dev.

**Input the runner hands the AI:** source URL, cleaned text, page title, job title, employer, location, candidate spans (with offsets).
**Output the AI returns:** `isPhysicianRole`, visa classification label, employer/facility, specialty, location, **quote as `(start,end)` offsets** (not free text), reason, uncertainty, recommend publish/hold/reject.

The AI may **not** fetch, browse, loop, paraphrase the quote, or assert any fact not present in the bounded text.

**Single-pass first.** Do not add the adversarial Verifier B on faith — it doubles cost. Measure single-pass precision on the gold set; add B only if it misses target. (Calibration logic applied to the architecture itself.)

---

## 6. Deterministic validator (hard gate)

Every AI output passes or the output is rejected:

- `cleaned.slice(start,end) === quote` **(verbatim offset check — 100%, non-negotiable).**
- Polarity is `AFFIRMATIVE` for any publish.
- Source URL resolves (HEAD/GET ok).
- Job title maps to a physician role.
- Employer/facility appears in source text or matches source domain.
- Classification ∈ allowed labels.
- Dedupe key unique.
- Source ∈ allowed tier.

Missing quote or failed check → drop to reject/hold; never publish.

---

## 7. Classification: status + reason (not flat buckets)

`status`: `PUBLISH` | `HOLD_REVIEW` | `VISA_SIGNAL_ONLY` | `REJECT`
`reason` (when reject): `NO_VISA_MENTION` (silence) · `SPONSORSHIP_DENIED` (explicit no — keep as intelligence) · `NOT_PHYSICIAN` · `RECRUITER_ONLY` · `STALE` · `DUPLICATE` · `SOURCE_NOT_ALLOWED`

- **PUBLISH** — active job + verbatim affirmative quote + resolved employer + physician + fresh + deduped.
- **HOLD_REVIEW** — affirmative quote but facility/date/source unclear.
- **VISA_SIGNAL_ONLY** — known sponsor / HPSA / VA / IHS / LCA history but no explicit current quote. **Captured and stored from day one** (this is the Population-B / future surface), never published as a job in R1.

---

## 8. Confidence

Coarse buckets only (`PUBLISH` / `HOLD` / `SIGNAL` / `REJECT`). **No 100-point score in R1** — fake precision before we have data to calibrate it. Earn granularity later from real outcomes.

---

## 9. Dedupe

Canonical key: `normalized(employer) + normalized(facility) + normalized(title) + specialty + city/state + posted-date-window + apply-URL-domain`.
Source precedence: **employer-direct > gov/HRSA/USAJobs > 3RNET (if partnered) > licensed board (later) > recruiter (never canonical in R1).** Public card shows one canonical job; other sightings kept internally with "last seen across sources."

---

## 10. Change detection (freshness moat)

- **Structured (ATS JSON/RSS):** diff job-ID set → added/removed/updated.
- **JSON-LD:** diff `JobPosting` URL/title/date.
- **Raw HTML:** hash the listings region → change is a **signal to re-fetch/classify, never proof, never auto-publish.**

---

## 11. Sponsor-propensity enrichment (never publishes jobs)

- Download DOL **LCA + PERM disclosure** bulk files (quarterly cadence — this is the only "schedule" the signal layer has).
- Filter to physician **SOC 29-12xx** codes.
- Build an employer `sponsorPropensity` table (employer · worksite · title · SOC · wage · filing recency · status).
- Use as: (a) crawl-priority input, (b) confidence lift on held signals, (c) R2+ employer immigration profiles.
- **Drop from R1:** crawling public LCA notice pages (unindexed, transient — rabbit hole) and PERM/SWA job orders as a discovery source (filled roles — net-negative).

---

## 12. Sensitivity vs specificity — two gates

- **Stage 1 (intake, loose):** any affirmative phrase OR known-sponsor OR HPSA/MUA/FQHC/VA/IHS/rural. Goal: miss nothing. Everything → candidate buckets.
- **Stage 2 (publish, strict):** the §6 gate. Goal: publish nothing fake.
- The negation layer (§4) is what keeps Stage 1 loose *without* leaking false positives into Stage 2.
- **Review budget: you review only** high-value holds, A/B conflicts (if B is enabled), new source types, and a daily quality sample. **Alarm: >15% of candidates needing manual review = engine mis-tuned → fix rules, not headcount.**

---

## 13. Gold set & calibration

- **Human-labeled, frozen, version-controlled. Never AI-labeled** (grading AI against AI is the contamination trap).
- Seed (~200): 50 explicit J-1/H-1B · 50 signal-only · 50 non-visa physician · 25 recruiter/fake/hidden-employer · 25 non-physician/stale/dup.
- **Chicken-egg fix:** connectors fetch real pages *first*; seed the gold set from that first real pull; then tune the classifier against it. **Calibration is the inner loop of building the classifier, not a late phase.**
- Metrics: candidate sensitivity, publish precision, false-publish, false-reject, manual-review rate, quote-validation-failure, dedupe accuracy.
- Targets: **quote validation 100%; non-physician published 0; recruiter-hidden published 0; dup published <2%; manual review <15%; publish precision ≥98%.**
- **Stats honesty:** 200 items tunes the engine but cannot *prove* 98% (CI too wide on ~50 positives). Claiming 98% needs a larger held-out set accrued over time. Optimize for trust before recall.

---

## 14. R1 artifacts (static, no DB, no cron)

```
docs/platform-v2/local/career/jobs/radar/runs/YYYY-MM-DD-HHMM/
  source_registry_snapshot.json
  raw_candidates.json
  fetched_pages_manifest.json
  cleaned_jobs.json
  visa_phrase_hits.json
  ai_classifier_outputs.json
  validated_jobs.json
  deduped_jobs.json
  publish.json  hold.json  signal_only.json  rejected.json
  run_report.md

src/data/career/visa-jobs-radar.generated.ts   (publish surface; honest "lastRun" timestamp — retires the false "3x daily" header in waiver-jobs-data.ts)
```

Full per-stage audit trail. Preview at a **noindex** `/career/jobs/radar-preview` — no public route in R1.

---

## 15. Scheduler (Phase 7 / go-live only)

GitHub Actions for heavy crawl (no Vercel function time limit, no request dependency); Vercel for serving + light dead-link verification (existing `verify-jobs` / `verify-listings` cron pattern, `getCronSecret` auth). Eventual cadence: ~6h USAJobs + high-yield ATS + published-job recheck; 2×/day employer refresh + JSON-LD; quarterly DOL enrichment; weekly source expansion. Every run emits a report.

---

## 16. Connectors

1. **USAJobs** — series 0602, VA + IHS, physician keywords (API key required). *Spine for plumbing; visa yield modest — pair with visa-dense sources below.*
2. **ATS detector** — Workday `/wday/cxs/{tenant}/{site}/jobs`, Greenhouse `boards-api`, Lever `api.lever.co/v0/postings`, Taleo RSS, ORC, JSON-LD fallback.
3. **JSON-LD extractor** — universal `JobPosting` fallback for career pages.
4. **LCA/PERM enrichment** — disclosure-data join (§11).
5. **Career-page monitor** — sitemap → career links → job pages → JSON-LD/links (allowed public pages only).

---

## 17. Phases

```
0  Spec (this) + seed gold set from first real pull + source registry
1  Connectors: USAJobs VA/IHS + 10–20 employer-ATS seeds from known sponsors  ← R1-core, not USAJobs-alone
2  Deterministic phrase+polarity engine + one AI classifier + validator (tuned against gold, inner loop)
3  Static exports + generated TS
4  Noindex preview route
5  Calibrate to targets
6  Add HRSA / 3RNET partnership / state PCO sources
7  GitHub Actions schedule (go-live cadence)
8  DB migration (WaiverJob) — only if signal quality is proven
```

---

## 18. Failure modes & guards

| Risk | Guard |
|---|---|
| AI overcalls visa | verbatim-offset quote required; polarity must be AFFIRMATIVE |
| Employer/facility hallucination | must appear in source text or match source domain |
| Recruiter fake / hidden employer | hidden-employer → reject; recruiter-only never canonical |
| Stale | lastChecked; 404/no-apply → expire; no-date + old source → hold |
| Duplicate spam | canonical dedupe; employer-direct wins |
| Too strict (missed jobs) | SIGNAL_ONLY bucket; daily reject sample; lexicon growth |
| Too loose (review overload) | coarse deterministic rules; >15% alarm; add Verifier B only if measured-needed |

---

## 19. Hard rules

No code beyond this spec until sign-off · no push · no deploy · no PR · no DB/schema/seed in R1 · no commercial-board crawling · no LinkedIn scraping · no CAPTCHA bypass · no SERP HTML scraping · no public jobs yet · no low-confidence publish · no "guaranteed visa" · no "complete coverage" · no "will post soon" predictions.

---

## 20. Deferred decisions

1. WaiverJob DB migration — deferred to Phase 8 (prove quality on static first).
2. Vercel Hobby vs Pro — irrelevant to R1 (GitHub Actions runs the crawler regardless).
3. 3RNET / HRSA partnership outreach — parallel track, gates Phase 6.
