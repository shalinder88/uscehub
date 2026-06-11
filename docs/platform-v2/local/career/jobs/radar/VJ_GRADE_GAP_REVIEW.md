# To PracticeLink/PracticeMatch Grade — Gap Review & Roadmap

## 1. Plain-language verdict

We are **one wiring job away from a real product, not one rebuild away.** The hard, defensible part is done: a deterministic, char-offset quote-gated engine (`scripts/visa-job-radar/`) that tags physician openings by *evidence-cited* visa-sponsorship signal from employer-direct/government sources only — the exact thing neither PracticeLink nor PracticeMatch structurally does. But that engine's output (153 leads in a live run: 80 VA `VISA_SIGNAL_ONLY` + 73 DOL `SPONSOR_LEAD`) never reaches a candidate, because the published radar file is `jobCount: 0` and the live `/career/jobs` page still reads a hand-curated 43-job static file from March. We are not at grade on **coverage, freshness-as-a-loop, matching, or distribution** — but we already out-rank both incumbents on the one axis that matters to a visa physician (verified, typed, cited sponsorship), and most of the connective tissue (dedup, staleness gate, JSON-LD reader, 9 live ATS sources, transactional email) is *already in the repo, just unwired.* The job is to connect what we built, not build it again.

## 2. What "grade" actually means

"Grade" for a physician job product is six axes. We are uneven across them — strong where it's hard, absent where it's plumbing.

| Axis | What grade looks like | Incumbent who owns it | Where we stand |
|---|---|---|---|
| **Coverage (liquidity)** | Tens of thousands of live, real openings; both sides of the marketplace non-empty | PracticeLink (~22–33k physician listings) | ~9 live ATS sources of a 1,465-sponsor universe; published surface empty. **Far below grade.** |
| **Freshness (liveness contract)** | <48h discovery, dead jobs removed on re-crawl, `validThrough` set, "verified live as of" | All aggregators; Google penalizes stale | Dedup + a 120-day staleness *gate* exist (`engine.ts`), but **no re-fetch / closed-on-absence loop.** Below grade. |
| **Matching** | Candidate profile → ranked, explained employer fit | PracticeMatch Pinpoint (AI candidate-side match) | Four primitives exist (sponsorScore, HPSA/Conrad, capExempt, SPONSOR_LEAD) but **never combined; no candidate input model.** Below grade — but this is our wedge. |
| **Trust** | Per-listing credibility a buyer/candidate can act on | PracticeLink (AAPPR partner, brand) | Our char-offset quote gate + DOL provenance is **structurally the most trustworthy** — but computed and discarded at the UI. **Above grade in substance, below in visibility.** |
| **Distribution** | Push to inboxes (JobMessenger to 150k), Google for Jobs presence, association reach | PracticeLink (JobMessenger, career fairs); Ivy (ACEP) | **Zero JobPosting schema → invisible to Google for Jobs.** Resend installed but not wired to candidate alerts. Far below grade. |
| **UX** | Searchable/filterable surface, saved searches, clear apply flow | Both | `/career/sponsors` + `/career/jobs` are live and filterable; apply-on-employer-site exists for the static corpus. **Closer to grade than the gap audit claimed.** |

The lesson: we don't need to win every axis. We need to clear the *baseline* on coverage/freshness/distribution and **dominate** trust + matching, which is where the niche is won.

## 3. The wedge — where we BEAT them, not match them

We will lose a volume war against 33k listings and a 1.37M-physician Masterfile. We win by being **structured visa intelligence over public data, with the evidence shown** — a category neither incumbent occupies and both are disincentivized (PracticeMatch) or simply haven't bothered (PracticeLink) to build.

Four concrete advantages, all already half-built:

1. **Typed, evidence-cited visa tagging.** PracticeLink's "Immigration Assistance" filter is verifiably a *single binary, employer-self-declared flag* — no J-1-waiver vs cap-exempt H-1B vs cap-subject distinction. PracticeMatch's J-1 page is educational content + attorney referrals with zero job tagging. Our engine emits typed signals (`VISA_SIGNAL_ONLY`, `SPONSOR_LEAD`) with a verbatim, char-offset-validated quote behind each. **No competitor can show the sentence that proves sponsorship.**

2. **Sponsor-history fusion → SPONSOR_LEAD.** A visa-silent posting from a known DOL sponsor (Cleveland Clinic, AltaMed, MSK) surfaced as a *cited lead* — "this employer certified N H-1B physician positions; lead, not confirmed sponsorship." `run.ts:sponsorEnrich()` already does this honestly. This is "intelligence not inventory" made literal.

3. **The J-1-waiver dimension nobody structures.** Conrad-30 (per-state 30-slot HPSA/MUA programs) and 3RNET are the canonical J-1-waiver demand market — the highest-intent IMG cohort. PracticeLink's filter is H-1B-only; 3RNET is an unstructured state contact directory. HPSA/MUA designations and Conrad slots are **public government facts**, fully inside our no-scraping constraint. We can compute "can *this* job waive your home-residency requirement, via which route" — the deepest matching IQ a J-1 physician needs and the exact thing no one offers.

4. **Verified-live as a trust weapon.** In a 2026 market where ~1-in-5 listings are ghost jobs and aggregators run 24–72h stale, our architecture is *already employer-origin-only.* A "verified live at the source on [date]" stamp is a claim PracticeLink and Indeed structurally cannot make — and we are one freshness loop away from it.

**The positioning line:** *fewer-but-verified, visa-structured, cited.* Name the limit (public inputs, no scraping) — in a ghost-jobs market, the honesty is itself the differentiator.

## 4. What we are missing — honest gap audit

Grouped by axis. I've corrected the over-stated gaps from the raw audit against what's actually on disk.

### Data / coverage
- **iCIMS/Oracle live FETCH path unbuilt.** The universal schema.org JSON-LD reader *is* built (`ats-resolver.ts:extractJobPostingJsonLd()` + `jobPostingToRawCandidate()`) and self-tested in `probe-sponsor-ats.ts` — but it is only ever run against `SAMPLE_POSTING_HTML`, never a live fetch, and `ats-resolver.ts` is **not imported into `run.ts`**. This is the single biggest coverage blocker: the iCIMS/Oracle majority is detected but cannot be pulled. *(Corrected: not "detection only" — the reader exists; only the live wiring is missing.)*
- **Coverage is ~9 live ATS sources, not 3.** `source-registry.ts` enables 9 (5 Workday incl. Cleveland Clinic/UAMS/MSK, 3 Greenhouse, 1 USAJobs-VA). Still a tiny fraction of the 1,465-sponsor universe; the published surface is empty because `--promote` was never run against a live run.
- **Repeat-sponsor-rate validation blocked.** `repeat-rate.ts` is built but exits "AWAITING DATA" — the repo holds a single combined FY2024-Q4+FY2025-Q3 snapshot with no per-record year tag. DOL 403s automated fetches, so this is a **manual download** of per-year LCA files, filtered to physician SOC codes (real friction, not "free/frictionless").

### Intelligence / matching
- **No unified FitScore.** The four ingredients all exist and are never combined: `sponsorScore()` (volume+breadth+J-1+cap, 0–100, `sponsor-universe.ts:67–81`), HPSA/`capExempt`/`waiverPathways` fields, Conrad-30 slot data (`conrad-tracker-data.ts`), SPONSOR_LEAD fusion. There is no `FitScore(candidate, sponsor)`.
- **No candidate input model.** No `/career/profile`, no `candidateProfile`/`fitScore` anywhere in `src/` or `scripts/`. A fit score with no candidate side is just a sponsor leaderboard. *(Note: `/career/sponsors` already filters by specialty/state — so a candidate **context** exists for the sponsor DB; what's missing is a saved physician profile to rank against.)*
- **Cap-exempt is hand-entered, not inferred.** `capExempt` is a literal boolean on every record; no classifier infers it from employer type (university-affiliated / 501(c)(3) nonprofit / government). Can't scale to 1,465.
- **Waiver-pathway routing is hand-typed.** `waiverPathways` is a static string array per job. No engine derives open J-1 routes from HPSA status + state + Conrad slot availability — even though all inputs sit in `conrad-tracker-data.ts`.

### Product / UX
- **Engine output not wired to the surface.** `visa-jobs-radar.generated.ts` is `jobCount: 0`; `/career/jobs/page.tsx` imports from `@/lib/waiver-jobs-data` (43-job static file, "last manual update March 27 2026"). The two halves are disconnected. *(Corrected: this is the gap, NOT "no candidate-facing product." `/career/jobs`, `/career/sponsors`, `/career/alerts` all ship and are filterable.)*
- **Zero JobPosting JSON-LD anywhere in `src/`.** Grep confirms only `CollectionPage`/`Organization`/`ItemList` schema. → **invisible to Google for Jobs**, the dominant discovery channel.
- **No per-job indexable `[id]` route.** `/career/jobs/` has only `page.tsx`, `jobs-search.tsx`, `[specialty]/`. Google requires one-job-per-page markup; a search UI can't be indexed as jobs.
- **The engine's evidence is computed and discarded at the UI.** The verbatim quote, SPONSOR_LEAD provenance, and per-job `fetchedAt` never render to a candidate. Our moat is invisible.

### Distribution
- **No candidate email/alert loop.** Resend ^6.12.0 *is* installed (`src/lib/email.ts`, wired to listing/admin notifications) — but there is **no per-candidate saved-search or new-lead alert.** *(Corrected: the send primitive exists; only the candidate-alert trigger is missing — cheaper than the audit implied.)*
- **No Google for Jobs path + excluded from the restricted Indexing API.** As a new non-whitelisted board, our only path in is clean crawlable JobPosting pages + sitemaps + email. None live for jobs.
- **No association/society distribution.** No Ivy+ACEP analog. No IMG/AMA-IMG, state Conrad-30 office, or specialty-society partnership.

### Ops
- **No re-fetch / closed-on-absence loop.** Dedup (`canonicalKey()`) and a 120-day staleness *gate* (`isStale()`, `STALE_DAYS=120`) exist, but **nothing re-polls a feed and marks a vanished job CLOSED.** No `last_seen_at`, no `validThrough` management. *(Corrected: "ZERO liveness layer" is refuted — dedup + staleness exist; the re-visit loop does not.)* A `verify-jobs` cron exists but checks static-file URL liveness, not the engine.
- **No data-quality telemetry.** No stale-rate, dedup-collapse ratio, or discovery-lag metrics — the exact numbers a buyer (and Google) judge on.

## 5. What to do better on what we already built

These are upgrades to existing code, not new systems.

1. **Wire `ats-resolver.ts` into `run.ts:gather()`.** The JSON-LD reader is built and self-tested; it's standalone. Importing and calling it on live-fetched employer career pages is the highest-leverage single change — it converts the 9 enabled sources + the iCIMS/Oracle majority from "detected" to "pulled."
2. **Run `--promote` and point `/career/jobs` at the generated file.** Replace (or augment, keeping static as fallback) `waiver-jobs-data` with `visa-jobs-radar.generated.ts`. One run + one import swap turns a March snapshot into a self-refreshing surface.
3. **Render the evidence we already compute.** Add a "Why this is a visa signal" panel showing the char-offset-validated quote + source URL + `fetchedAt`; for SPONSOR_LEAD, an explicit "Known DOL H-1B sponsor (N certified positions) — lead, not confirmed sponsorship" badge. Zero new computation — it's in the classifier output and `run.ts` notes already.
4. **Harden dedup with fuzzy/shingle matching.** Current `canonicalKey()` is exact-normalized (employer+title+state+posted-month). Cross-source fusion (ATS + SPONSOR_LEAD + VA signal for one role) needs title+employer+location fuzzy collapse so one job = one record with *stacked* evidence — which makes our leads *stronger*, not noisier.
5. **Promote `capExempt` and `waiverPathways` from hand-entered fields to derived ones.** Infer cap-exempt from employer type; derive open waiver routes from HPSA + state + Conrad slots already in `conrad-tracker-data.ts`. Both are public-data classifiers, both scale to 1,465, both upgrade every downstream score.
6. **Wire Resend to a candidate alert** instead of only listing/admin notifications. The transport is done; the trigger ("new SPONSOR_LEAD matching your saved search") is the new part.

## 6. Prioritized roadmap

Sequencing principle: **surface what exists → widen coverage → make it live → deepen the wedge → add the candidate loop → AI last.** AI amplifies a working pipeline; it never substitutes for one.

| # | Ship | Why now | Impact | Effort | Touches |
|---|---|---|---|---|---|
| **1** | **Wire engine → surface + render evidence.** `--promote` a live run; point `/career/jobs` at `visa-jobs-radar.generated.ts`; render the quote + SPONSOR_LEAD provenance + `fetchedAt` per job. | Turns a backend run into a usable product and exposes the one thing incumbents lack. Mostly an import swap + a UI panel. | High | **Low–Med** | `run.ts`, `jobs/page.tsx`, new evidence component |
| **2** | **Build the iCIMS/Oracle live FETCH path** by wiring `ats-resolver.ts` into `run.ts:gather()`. Add Ashby/Lever/Workable no-auth JSON while there. LLM only as JSON-LD fallback. | THE coverage rate-limiter. Reader is built; only wiring missing. Top-100 sponsors = ~50% of positions → bounded build. | High | **Med** | `ats-resolver.ts`, `run.ts`, `connectors.ts` |
| **3** | **Freshness/expiry loop.** `last_seen_at` + `validThrough` per lead; re-poll resolved sources on a cadence; mark vanished jobs CLOSED; show "verified <date>". | A stale "sponsoring" job is the worst failure for our honesty brand; Google penalizes stale. We're employer-origin-only → one loop from a claim incumbents can't make. | High | **Med** | `run.ts`, new cron, generated schema |
| **4** | **Per-job `[id]` pages + JobPosting JSON-LD** (title, datePosted, validThrough, hiringOrganization, jobLocation, directApply). Verify in Rich Results Test; confirm sitemap + noindex-lift live. | Only path into Google for Jobs (we're excluded from the Indexing API). Even 50 verified jobs beat 33k unverified for our positioning. | High | **Med** | new `jobs/[id]/`, sitemap, layout |
| **5** | **FitScore + minimal candidate profile.** One deterministic `FitScore(candidate, sponsor)` fusing sponsorScore + HPSA/Conrad openness + specialty + SPONSOR_LEAD, with a per-factor "why." Profile: specialty, visa status, J-1 home country, target states, timeline. | The wedge in one file — verified visa matching neither incumbent does. All factors already computed; the build is the combiner + explanation. | High | **Med** | new `fit-score.ts`, `/career/profile` |
| **6** | **Email alerts / saved search.** Subscribe by specialty+state+visa-type; trigger on new-lead detection from the freshness loop. Reuse Resend. | PracticeLink's JobMessenger is the retention mechanic that creates daily return. A visa-tagged alert is something no incumbent can send. Cheap once 3+6 exist. | High | **Low** | `email.ts`, saved-search store |
| **7** | **J-1 / cap-exempt / waiver-route derivation.** Programmatic cap-exempt classifier; derive open Conrad-30/3RNET/VA waiver routes from HPSA+state+slots; ingest 3RNET as gov-origin inventory. | The defensible wedge no one occupies; highest-intent IMG cohort; all inputs are public gov data. | High | **Med–High** | `engine.ts`, `conrad-tracker-data.ts`, new 3RNET connector |
| **8** | **Unblock repeat-sponsor-rate.** Manually download multi-year DOL LCA files, filter to physician SOC, year-tag into `by-year/`, run the built analyzer; tier SPONSOR_LEAD confidence. | Turns "sponsored once" into "sponsors every year" — upgrades our core trust signal. Analyzer built; data is public (manual). | Med | **Low** (data acq.) | `repeat-rate.ts` |
| **9** | **Bounded AI classifier — LAST.** Normalize messy JSON-LD titles → specialty/role; flag visa-relevant language in employer-origin text. Strictly post-deterministic, still char-offset quote-gated, never fabricates a visa claim. | Amplifies a working pipeline; sequencing it last prevents masking coverage/freshness gaps behind model output. | Med | **Med** | `engine.ts` post-pass |
| **—** | **Defer: employer side, profiles-at-scale, application flow, CV editor, compensation tool, association partnership.** | Table-stakes gravity features, not moat; commoditized. De-scope to avoid feature-parity drift. Pursue one society partnership *after* MVP traction. | Low (now) | — | — |

**The MVP an IMG uses daily = items 1–6.** Surface the leads, pull the iCIMS/Oracle majority, keep them live, get into Google for Jobs, match to a saved profile, and alert on new matching sponsors. Items 7–9 deepen the moat once the loop turns.

## 7. Honest limits

Where we **structurally cannot match them**, and shouldn't try:

- **Liquidity.** We will not have 33k listings or a non-empty two-sided marketplace on day one. Our ceiling is the *resolvable* public sponsor universe (top-250 ≈ 70% of positions), not the whole job market. Pretending otherwise invites a fatal apples-to-apples comparison.
- **Proprietary candidate data.** PracticeMatch's 490k phone-interviewed Pinpoint profiles and 1.37M-row MedTies Masterfile are human-collected intent we have *correctly, per our constraints* chosen not to replicate via scraping. Our only compliant substitute is physician-initiated profile capture (item 5) — thinner, but ours.
- **Brand / procurement trust.** No AAPPR partnership, no 30-year recruiter relationships. A hospital GME buyer reaches for the familiar vendor. We close this with *visible verifiability*, not brand spend.
- **Distribution reach.** No 150k opted-in inbox list. We grow one from zero (item 6) and borrow reach from one society partnership — slower, but compounding.

**What "good enough to win the niche" looks like:** an IMG visa physician opens our site, filters by their specialty + state + visa type, and sees a short list of openings where **every result shows the exact government/employer evidence that it sponsors their visa type**, stamped "verified live as of [date]," with a fit score that explains *why* and a Conrad-30/cap-exempt route when one applies — and gets an email the moment a new matching sponsor posts. That is a product PracticeLink and PracticeMatch structurally cannot ship, even though they have 100x our inventory. We don't beat the board. We make the board irrelevant for the one question an IMG physician actually has: *"who will sponsor me?"*

## Appendix: sources

**Codebase (`/Users/shelly/usmle-platform/`)**
- `scripts/visa-job-radar/engine.ts` — deterministic classifier, visa lexicon, `isStale()` (STALE_DAYS=120), `canonicalKey()` dedup
- `scripts/visa-job-radar/run.ts` — gather→classify→write; `sponsorEnrich()` SPONSOR_LEAD promotion; `--promote` path; char-offset quote gate
- `scripts/visa-job-radar/sponsor-universe.ts` — `sponsorScore()` (volume+breadth+J-1+cap, 0–100); `buildSponsorUniverse()` (1,465)
- `scripts/visa-job-radar/ats-resolver.ts` — `extractJobPostingJsonLd()` + `jobPostingToRawCandidate()` (built, **not imported into `run.ts`**)
- `scripts/visa-job-radar/connectors.ts` — live `fetchUsajobs`/`fetchGreenhouse`/`fetchWorkday` (no iCIMS/Oracle/JSON-LD fetch)
- `scripts/visa-job-radar/source-registry.ts` — 9 enabled live sources
- `scripts/visa-job-radar/repeat-rate.ts` — built, exits "AWAITING DATA" (single combined snapshot, no per-year tag)
- `scripts/visa-job-radar/probe-sponsor-ats.ts` — JSON-LD reader self-test on `SAMPLE_POSTING_HTML`
- `src/data/career/visa-jobs-radar.generated.ts` — `jobCount: 0`, honest empty state
- `src/app/career/jobs/page.tsx` + `jobs-search.tsx` — live filtered UI over `@/lib/waiver-jobs-data` (43 jobs, structured `visaTypes`, employer-posted salary on 11)
- `src/app/career/sponsors/page.tsx` + `sponsor-search.tsx` — live searchable surface over 1,087 verified H-1B sponsors, specialty/state/salary filters
- `src/lib/waiver-jobs-data.ts` — static, "last manual update March 27 2026"; `conrad-tracker-data.ts` — Conrad-30 per-state slots; `policy-alerts-data.ts` — editorial alerts
- `src/lib/email.ts` + Resend ^6.12.0 — transactional send (listing/admin only, not candidate alerts)
- `src/app/api/cron/verify-jobs/route.ts` — static-file URL liveness (not engine-driven)
- `VJ_COVERAGE_ENGINE_BUILD_STATE.md` (2026-06-10) — 153 leads (80 VISA_SIGNAL_ONLY + 73 SPONSOR_LEAD: Cleveland Clinic 40, AltaMed 24, MSK 9)

**External (incumbents — figures are vendor-stated/unaudited unless noted)**
- PracticeLink: `practicelink.com`, AAPPR signature partner — paid marketplace, "Immigration Assistance" filter (verified: single binary self-declared flag), JobMessenger, career fairs; live UI showed ~22k physician jobs (the ~33k figure is stale/high)
- PracticeMatch (M3): `practicematch.com` — Pinpoint (490k phone-interviewed), MedTies (1.37M AMA Masterfile), WorkTies; J-1 page verified educational-only, no job tagging
- Ivy Clinicians: `ivyclinicians.io` — free-for-clinicians, 1.9%-on-signed-contract (verified); ACEP "Open Book" partnership (unconfirmed)
- ResidencyMatch.ai: `residencymatch.ai/img-friendly/visa-sponsorship` — 4,853 programs (verified), residency-only, no per-program source citations (verified)
- MyVisaJobs / h1bdata.info / h1bgrader — DOL LCA research tools, no live openings
- Google for Jobs: `developers.google.com/search/docs/appearance/structured-data/job-posting` (JobPosting/validThrough/one-job-per-page); 2025 Indexing API restricted to authorized partners (sitemaps/RSS/email the alternatives)
- Ghost-jobs / freshness: Greenhouse 2025 (~1-in-5 US postings ghost); LinkUp employer-direct-only moat
- Government J-1 data (public, in-constraint): USCIS Conrad-30, HHS HPSA/MUA designations, 3RNET, DOL OFLC multi-year LCA disclosure files