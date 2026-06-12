# VJ (Visa Job Radar) — Session Handoff / Sign-out

**READ THIS FIRST.** This is a full context dump after a long build session (2026-06-10/11). The
conversation that produced it was `/clear`ed; nothing in it is lost because everything important is on
disk and committed. Active work lives in **`/Users/shelly/usmle-platform`** (NOT the franchiese repo the
shell may open in). Branch **`main`**. All engine code is in **`scripts/visa-job-radar/`**; all docs in
**`docs/platform-v2/local/career/jobs/radar/`**.

---

## 1. What this is (the product thesis — it EVOLVED this session)

A **J-1-waiver / H-1B PHYSICIAN visa-sponsorship intelligence product** for USCEHub's `/career` microsite.
It started as "build a job board with the most visa jobs." It is NOT that. The honest, validated thesis is:

> **Be the SPONSOR-TRUTH layer.** Answer the IMG's real question — *"who will actually sponsor me, near
> where, in my specialty, with proof?"* — by fusing three public, employer-or-government, citable evidence
> layers. Job listings are a feature; the sponsor-truth layer is the product. We do NOT try to out-list
> PracticeLink (we can't and shouldn't).

The three layers (all built):
1. **DOL sponsor HISTORY** — who has certified H-1B physician LCAs (the ~1,465-employer universe).
2. **LIVE LCA-notice ACTIVITY** — who is filing an H-1B *right now*, role-level, from the employer's own
   public LCA-notice page (the freshest legal signal; months ahead of DOL disclosure files).
3. **CURRENT employer-direct OPENINGS** — physician reqs pulled from employers' own ATS, classified.

---

## 2. The user (BINDING context — do not re-litigate)

The operator is **a physician who personally went through the J-1/H-1B job hunt.** Their lived experience
is primary evidence and reshaped the strategy:
- 3RNET exists but had few useful jobs (the "885 pages" is not unique/current physician inventory).
- The one dedicated niche site (j1waiverpositions.com) is now a **dead/parked domain**.
- PracticeLink/PracticeMatch had jobs but their **visa info was often wrong/confusing**; DocCafe is "horrible."
- The market runs on **word of mouth + recruiters**.
- **The job they actually got: a recruiter called; it was NOT on the big boards — but the hospital DID
  post it on its own website WITH an H-1B notice.** ← This validates the employer-direct + LCA-notice
  architecture. It is the most important single data point in the project.

The operator (correctly) calls out overconfidence. **Be honest, cite evidence, never inflate counts.**

---

## 3. Honest scorecard (what's REAL vs what was OVERCONFIDENT)

Full detail in `VJ_PROMISE_AUDIT_VERDICT.md`. Summary:
- "More jobs than PracticeLink/PracticeMatch" — **WRONG goal.** We win on *correct, cited visa truth*, not count.
- "Rural/community/FQHC post physicians on their own ATS" — **TRUE for large systems** (Sanford ~457,
  Ochsner ~409 physician-family reqs, AltaMed). **Overconfident on scale** — small Conrad-30 practices
  hire via recruiters / have no reachable ATS. Realistic employer-direct inventory: **hundreds–low-thousands**.
- "Big academic centers" (Cleveland Clinic, Vanderbilt, Stanford) post **ZERO attending physicians** on
  their public ATS (only postdocs). That's *why* PracticeLink exists. We cannot reach those employer-direct.
- "SPONSOR_LEAD (DOL history)" — **sound WITH the mandatory caveat** "employer-level history does not
  guarantee any specific role sponsors" (proven: UAMS, a real sponsor, posts "Sponsorship Available: No").
- "81 VA eligibility signals" — **weak** (statutory boilerplate "may appoint", not "will sponsor").

---

## 4. The six findings that drove the build (verified by running it)

1. A Workday keyword search for "physician" is **~99% noise** (Cleveland Clinic: 1,004 keyword hits vs 10
   real physician-family, all postdocs). FIX: filter by the **jobFamilyGroup facet** (Physician/Faculty/
   Provider), not keyword. Built into `connectors.ts:fetchWorkday`.
2. Big academic attending jobs are NOT on the public ATS; **rural/community/FQHC systems** carry the real
   physician reqs — and they ARE the J-1/HPSA segment.
3. **Physician-gate false positives** ("Pharmacy Reimbursement Specialist - Pediatric" matched "pediatric").
   FIX: hardened `NONPHYS_TOKENS` in `engine.ts`.
4. **Structured-denial polarity bug** (CRITICAL): engine published 11 UAMS jobs as affirmative visa when
   they said "Sponsorship Available: **No**" — the negator FOLLOWS the phrase; `precededByNegation` missed it.
   FIX: `followedByDenialValue()` in `engine.ts`; locked by fixture `fx-15`.
5. **Public LCA-notice pages** are the freshest legal signal (20 CFR 655.734): role/wage/worksite, on the
   employer's own site, ~10-business-day window. Built `lca-notice-radar.ts`. First live catch: **KU Medical
   Center — Pulmonary/Critical Care Nocturnist Physician, $435,000** (with citable notice PDF).
6. Employer sponsorship history ≠ role-level guarantee → every surface MUST carry the caveat.

---

## 5. Files / architecture (everything in `scripts/visa-job-radar/`)

**Engine core (modified this session):**
- `types.ts` — added `FEDERAL_NONCITIZEN_ELIGIBLE` VisaLabel.
- `engine.ts` — lexicon + `classify()`. Added: eligibility-tier (caps `FEDERAL_NONCITIZEN_ELIGIBLE` at
  `VISA_SIGNAL_ONLY`, never PUBLISH); hardened physician gate; `followedByDenialValue()` structured-denial
  polarity fix. **No regex in this file — hard rule.** Quote-offset gate (`validateQuote`) is the publish bar.
- `connectors.ts` — `fetchUsajobs` (keyed), `fetchUsajobsHistoricJoa` (NO-KEY VA), `fetchGreenhouse`,
  `fetchWorkday` (now **facet-based** + `physicianFacetIds()`), `stripHtml`.
- `source-registry.ts` — enabled sources (5 Workday incl. Cleveland Clinic/UAMS/MSK/Ochsner/VUMC/Stanford,
  3 Greenhouse, 1 USAJobs-historic). WVU disabled (bot-protection — never bypass). Tier-3 = never-crawl.
- `run.ts` — pipeline: gather → classify → dedupe → quote-gate → `sponsorEnrich()` (SPONSOR_LEAD) → run dir.
  `--promote` is the ONLY way the app file is written; without it the committed surface stays empty (honest).
- `fixtures.ts` — 15 hand-labeled gold fixtures + connector samples. Gold MUST stay green (`gold: 15/15`).

**New modules (built this session):**
- `sponsor-universe.ts` — `buildSponsorUniverse()` (1,465 employers from DOL data, ranked, `sponsorScore`),
  `normEmployer()`, `sponsorHistoryIndex()`.
- `build-sponsor-universe.ts` — runner for the above.
- `ats-resolver.ts` — `detectAts()` (Workday/Greenhouse/Lever/Ashby/iCIMS/Oracle fingerprint),
  `extractJobPostingJsonLd()` + `jobPostingToRawCandidate()` (JSON-LD reader — **built, self-tested, NOT yet
  wired into a live fetch in run.ts** — this is the #1 coverage gap).
- `scale-sponsors.ts` — batch-resolves the sponsor head to ATS + counts reachable physician openings.
- `lca-notice-radar.ts` — **the new product half.** Polls public LCA-notice pages → notice PDFs →
  `pdftotext` → parse role/wage/period/worksite/case# → physician gate → accumulating index
  (`firstSeenAt`/`lastSeenAt`). Output: `docs/.../radar/lca-notices/`. **Scaled 2026-06-11:**
  - Two per-source link strategies (`LcaNoticeSource.linkStrategy`): `filename-token` (KUMC — PDF hrefs
    contain "lca"/"notice", role inside the numbered DOL body) and `all-pdf-titled` (Pitt — every PDF is a
    notice, the FILENAME is the job title, physician-gated BEFORE fetch). Pitt's filename carries the dept
    in a trailing paren ("(Ophthalmology)") which is stripped before the gate, else clinical-dept postdocs
    false-positive.
  - `parseNoticeText` now tolerates two templates: numbered DOL ("being sought as a"/"salary of"/"period
    of employment…") and Pitt OIS prose ("for the position of"/"salary … is $X per hour"/"validity dates
    from"). Salary keeps its unit ("$156.25 per hour" — an hourly-filed physician LCA is NOT a low wage).
  - Content-gate: a fetched PDF only enters the index if its text contains "labor condition application"
    (lets `all-pdf-titled` harvest broadly without indexing instruction/policy PDFs).
  - Registry `LCA_NOTICE_SOURCES`: **KUMC + Pitt enabled**; Penn/UMich 403-disabled; Vanderbilt + Temple +
    Berkeley policy-only; Maryland disabled (inline-HTML rows, no PDFs — would need an `html-row` strategy).
  - Live state 2026-06-11: index = 3 notices, **2 physician** (KUMC Pulm/CC $435k; Pitt Adult Cardiology
    $156.25/hr). Honest finding: public PDF-based, physician-bearing LCA pages are RARE — most employers
    post physically (Ohio State), bot-block, use inline HTML, or are policy-only.
- `sponsor-truth.ts` — **the fusion.** Joins layers 1+2+3 per employer (by `normEmployer`), ranks live-
  activity → openings → history, writes `sponsor_truth.json` + report. Every record has a `truthSummary`
  with the honest caveat baked in.
- `repeat-rate.ts` — built but exits "AWAITING DATA" (needs multi-year DOL files, see §7).
- `probe-sponsor-ats.ts` — JSON-LD reader self-test.

---

## 6. How to run (all from `/Users/shelly/usmle-platform`, PATH needs `~/homebrew/bin`)

```
export PATH="$HOME/homebrew/bin:$PATH"
npx tsc --noEmit                                        # must be clean
npx tsx scripts/visa-job-radar/run.ts                  # offline: gold 15/15, connector check
npx tsx scripts/visa-job-radar/run.ts --live           # live pull (NO --promote; surface stays empty)
npx tsx scripts/visa-job-radar/build-sponsor-universe.ts
npx tsx scripts/visa-job-radar/scale-sponsors.ts       # measure reachable inventory
npx tsx scripts/visa-job-radar/lca-notice-radar.ts     # poll + accumulate LCA notices
npx tsx scripts/visa-job-radar/sponsor-truth.ts        # fuse the three layers
```

Latest verified state: gold **15/15**, tsc clean, live run = 0 false PUBLISH · 32 SPONSOR_LEAD · 81 VA
eligibility · denials correctly caught. Sponsor-truth: 1,465 employers, KUMC ranked #1 (live LCA activity).

---

## 7. What's NEXT (roadmap, highest-leverage first)

1. **Wire `ats-resolver.ts` into `run.ts:gather()`** — the JSON-LD reader is built but never live-fetched.
   NOTE: evidence review showed this is low-yield for attending physicians (big academic ATSs post zero
   attendings publicly). Deprioritized. Worth revisiting only for community/rural/FQHC systems.
2. **LCA-notice registry** — DONE (sessions 2026-06-11): KUMC + Pitt enabled, parser generalized to two
   templates, per-source link strategy, content-gate. Daily cron polling at 8am.
3. **LCA cron** — DONE (session 2026-06-11): `lca-notice-radar-poll` scheduled task running daily.
4. **Wire `sponsor_truth.json` → `/career/sponsors` page** — DONE (session 2026-06-11): live notice
   badges, cap-exempt filter, "Sort: Active Notices First", per-card notice PDF links and caveat.
   Codegen: `build-sponsor-truth-overlay.ts` → `src/lib/sponsor-truth-overlay.ts` (auto-regenerated
   by cron each day).
5. **Add `html-row` link strategy** — unlock inline-HTML LCA notice pages. University of Maryland iTerp
   (`iterp.umd.edu/.../lcaPostings.cfm`) is the reference. Currently has 0 physician notices but
   worth monitoring. Would need a new `LcaNoticeSource.linkStrategy: "html-row"` branch in lca-notice-radar.ts.
6. **Per-employer `[slug]` pages + JobPosting JSON-LD** — DONE (session 2026-06-11): `/career/sponsors/[slug]`
   server component with `generateStaticParams()` (pre-builds ~1,087 pages), DOL history panel, live-notice
   panel (amber, role/salary/period/PDF link), cap-exempt explainer, JobPosting JSON-LD on active-filing
   employers. Prefix-match resolves org variants. `robots: noindex` until content is dense enough. Employer
   names in search list now link to their detail pages.
7. **Freshness/closed-on-absence loop** for engine job leads (LCA index has first/last-seen; jobs don't).
8. Unblock **repeat-rate** — needs multi-year DOL LCA files (operator manual download; DOL 403s bots).
9. Explore a **3RNET partnership** rather than rebuilding rural J-1 inventory.

Earlier strategy docs (all in this dir): `VJ_STRATEGY_PRACTICEMATCH_LEVEL.md`, `VJ_USAJOBS_COVERAGE.md`,
`VJ_90PCT_COVERAGE_STRATEGY.md`, `VJ_GRADE_GAP_REVIEW.md`, `VJ_PROMISE_AUDIT_VERDICT.md`, plus the R2 spec
+ employer-hosted resolver plan + benchmark (one level up in `.../career/`).

---

## 8. CONSTRAINTS (BINDING — violating these breaks trust)

- **No commercial-board scraping ever** (PracticeLink, PracticeMatch, DocCafe, Indeed, LinkedIn). Never crawl/copy.
- **No bot/WAF/CSRF bypass.** If a page 403s a plain client, DISABLE it with a note — never spoof headers
  (WVU + Penn/UMich are disabled for exactly this).
- **Evidence only from employer-owned pages or government sources**, with an exact char-offset-validated quote.
- **No regex in `engine.ts`** (the intelligence layer). Char-scanning only. (Data-prep files may use light regex.)
- **No `--promote`** unless explicitly told — the committed app surface stays the honest empty state.
- **Never fabricate a visa claim or inflate a count.** Always render the sponsor-history caveat.
- **DO NOT touch / stage `src/app/career/*` or p102/nav changes** — those are pre-existing uncommitted work
  owned by other tasks. This session committed ONLY `scripts/visa-job-radar/` + `docs/.../career/jobs/`.
- **Commits:** local only. **Never push / force-push / amend without the operator typing "push".**

---

## 9. Git state at sign-out

All session work is committed to `main` (local, NOT pushed). Commits in order:
- `25abcb5` — LCA-notice radar: two-template parser + Pitt source + per-source link strategy
- `7dc1391` — Sponsors page: live LCA notice badges + cap-exempt filter + truth fusion
- `7894ae4` — Per-employer sponsor pages with JobPosting JSON-LD

The pre-existing `src/app/career/*` (except `sponsors/sponsor-search.tsx`) and p102 modifications
remain uncommitted and untouched, as required.

**Daily cron running:** `lca-notice-radar-poll` scheduled task (8am daily) polls LCA sources →
re-fuses sponsor_truth.json → regenerates sponsor-truth-overlay.ts → commits. Notices vanish in
~10 business days; the cron is what makes the time-series valuable.

To resume: read this file, run the green check (§6), then pick up §7.
