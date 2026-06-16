# VJ (Visa Job Radar) — MASTER SIGN-OUT / FULL HANDOFF

**Written 2026-06-16. This is the definitive sign-out.** The operator's Claude subscription is ending,
so this file is written to be read COLD by any future agent (or the operator) with zero access to the
prior conversation, the `~/.claude` memory, or any chat history. Everything important is on disk and in
git. Nothing required to continue is lost.

> **READ ORDER for a cold start:**
> 1. This file (top to bottom) — the complete picture.
> 2. `HANDOFF.md` (same dir) — the deeper session-1-through-8 narrative (still accurate; this file
>    extends it with sessions 9+ that it does not cover).
> 3. Then run the green check in §10 before touching anything.

---

## 0. WHERE EVERYTHING LIVES (orientation)

- **Active repo:** `/Users/shelly/usmle-platform` — branch **`main`**, **local only, NEVER pushed**.
  (The shell often opens in `/Users/shelly/Downloads/franchiese` — that is a *different, unrelated*
  project. Always `cd /Users/shelly/usmle-platform` first.)
- **Engine + connector code:** `scripts/visa-job-radar/` (23 tracked `.ts`/`.sh`/`.plist` files).
- **Docs + scoreboards + handoffs:** `docs/platform-v2/local/career/jobs/radar/`.
- **Run artifacts (GITIGNORED, regenerable):** `docs/platform-v2/local/career/jobs/radar/runs/`
  (131 dated run dirs, ~2.5 GB; each `--live` run writes one).
- **The app surface this feeds:** `/career/sponsors` (the only `src/app/career/*` file this project
  may touch is `sponsors/sponsor-search.tsx`; everything else under `career/` belongs to other tasks).
- **T7 SHIELD BACKUP (this sign-out):**
  `/Volumes/T7Shield_Code/01_PROJECTS/Health_USMLE_Platform/02_DAILY_SNAPSHOTS/2026-06-16_*/`
  contains: a complete `git bundle` (all 550 commits, restorable anywhere), the working-tree copy
  (excl. `node_modules`/`.next`), this sign-out doc, and a copy of the `~/.claude` memory. See §17.

---

## 1. THE PRODUCT THESIS (and the pivot that defined it)

A **J-1-waiver / H-1B PHYSICIAN visa-sponsorship intelligence product** for USCEHub's `/career`
microsite.

**THE PIVOT (most important strategic fact):** It started as *"build a job board with the most visa
jobs — beat PracticeLink/PracticeMatch on count."* That goal was **abandoned as wrong.** We cannot and
should not out-list the commercial boards, and the operator's lived experience proved count is not the
unmet need. The validated thesis is:

> **Be the SPONSOR-TRUTH layer.** Answer the IMG's real question — *"who will actually sponsor me, near
> where, in my specialty, with proof?"* — by fusing three public, employer-or-government, **citable**
> evidence layers. Job listings are a feature; sponsor-truth is the product.

**The three layers (all built and live):**
1. **DOL sponsor HISTORY** — who has certified H-1B physician LCAs (7 years FY2019–FY2025, 5,834-employer
   universe). Answers "has this employer ever sponsored physicians, how consistently, how many."
2. **LIVE LCA-notice ACTIVITY** — who is filing an H-1B *right now*, role-level, scraped from the
   employer's own public LCA-notice page (20 CFR 655.734). Freshest legal signal — months ahead of the
   DOL disclosure files. This is **the moat**: a time-series no competitor maintains.
3. **CURRENT employer-direct OPENINGS** — physician reqs pulled from employers' own ATS (Workday,
   Jibe, Phenom JSON-LD, etc.), classified for explicit visa language.

---

## 2. THE USER (BINDING context — do NOT re-litigate)

The operator is **a physician who personally went through the J-1/H-1B job hunt.** Lived experience is
primary evidence and reshaped the strategy:
- 3RNET exists but had few useful jobs (its "885 pages" is not unique/current physician inventory).
- The one dedicated niche site (j1waiverpositions.com) is a **dead/parked domain**.
- PracticeLink/PracticeMatch had jobs but their **visa info was often wrong/confusing**; DocCafe is "horrible."
- The market runs on **word of mouth + recruiters**.
- **The job they actually got: a recruiter called; it was NOT on the big boards — but the hospital DID
  post it on its own website WITH an H-1B notice.** ← This single data point validates the entire
  employer-direct + LCA-notice architecture. It is the north star.

The operator **correctly calls out overconfidence.** Be honest, cite evidence, never inflate counts.
**Residents/fellows are explicitly OUT of scope** — J-1 clinical *training* is a different legal category
from J-1 *waiver* / H-1B *attending* sponsorship. Do not count fellow/resident reqs as PUBLISH.

Operator calibration (from global prefs): senior — skip basics, name tradeoffs, recommend. Phased work
runs in one turn; stop before any push. **"Push" only happens when the operator literally types the word.**

---

## 3. CURRENT STATE (as of 2026-06-16, HEAD `96619c9`)

- **PUBLISH: 252** (247 non-fixture + 5 gold fixtures). This is the headline number.
- **SPONSOR_LEAD: 3,126** (known DOL sponsor, visa-silent posting — surfaced as a lead WITH caveat).
- **VISA_SIGNAL_ONLY: 78**, **HOLD_REVIEW: 2**, **REJECT: 356**.
- **Connectors: 85 enabled.**
- **Live physician LCA notices: ~12** across 4 employers (KUMC, Pitt, UAMS, Emory).
- **DOL universe: 5,834** distinct physician H-1B filers (7 full years); **456 iron-core** (all 7 years).
- **Gold fixtures: 15/15 passing. tsc clean. Connector check passed.** (Last verified by run
  2026-06-15-1829: `gold: 15/15 passed`, `connector check: passed`, `quoteValidationFailures=0`.)
- **Last live run:** `2026-06-15-1829` (47 min wall-clock). **Last commit:** `96619c9` (2026-06-16 LCA
  cron auto-poll). **The committed app surface is the honest EMPTY state** — `--promote` has never run.

**Trajectory this project: 148 → 213 → 252 PUBLISH.** We have now hit a **structural ceiling** (see §13).

---

## 4. FULL SESSION HISTORY — every pivot, every failure, and WHY (do-not-miss section)

This is the chronological record the operator asked to preserve in full. Sessions 1–8 are summarized
from `HANDOFF.md`; sessions 9+ are new and appear nowhere else.

### Sessions 1–8 (2026-06-10 → 2026-06-12) — foundation, documented in `HANDOFF.md`
- **Pivot #1 (the big one):** "most-jobs job board" → "sponsor-truth layer." Reason: can't out-list the
  boards; operator's experience shows the unmet need is *trustworthy visa truth*, not volume.
- **Finding:** A Workday keyword search for "physician" is ~99% noise (Cleveland Clinic: 1,004 keyword
  hits → 10 real physician-family, all postdocs). **Fix:** filter by the **jobFamilyGroup facet**
  (Physician/Faculty/Provider), not keyword. Lives in `connectors.ts:fetchWorkday` → `physicianFacetIds()`.
- **Finding:** Big academic centers (Cleveland Clinic, Vanderbilt, Stanford) post **ZERO attending
  physicians** on their public ATS — only postdocs. *That's why PracticeLink exists.* We cannot reach
  those employer-direct, by design. Rural/community/FQHC systems carry the real physician reqs.
- **BUG (critical) — structured-denial polarity:** engine published 11 UAMS jobs as affirmative visa
  when the page said "Sponsorship Available: **No**" — the negator *follows* the phrase, so
  `precededByNegation` missed it. **Fix:** `followedByDenialValue()` in `engine.ts`; locked by fixture
  `fx-15`. (UAMS is a real sponsor that still posts "Sponsorship: No" on individual reqs — proof that
  employer history ≠ role-level guarantee; hence the mandatory caveat on every surface.)
- **BUG — physician-gate false positives:** "Pharmacy Reimbursement Specialist - Pediatric" matched
  "pediatric." **Fix:** hardened `NONPHYS_TOKENS` in `engine.ts`.
- **Built the LCA-notice layer** (`lca-notice-radar.ts`) — the new product half. First live catch:
  **KU Medical Center — Pulmonary/Critical Care Nocturnist, $435,000**, with citable notice PDF.
- **Built the DOL pipeline:** operator manually downloaded FY2019–FY2026Q2 xlsx from DOL OFLC;
  `process-dol-xlsx.py` → `by-year/FY20xx.json`; `repeat-rate.ts` 7-year analysis. **Finding:**
  position-weighted YoY repeat rate **83.6%** (77.6%→88.4%); 456 iron-core employers; Cleveland Clinic
  #1 (255 pos), Mayo #2 (249), Maimonides #3 (191). `persistence_index.json` = 5,834 employers.
- **Wired the sponsors page** (`/career/sponsors` + `[slug]` pages, ~1,087 pre-built) with live-notice
  badges, cap-exempt filter, JobPosting JSON-LD, and the caveat. `robots: noindex` until dense enough.
- **End of session 8:** ~202 SPONSOR_LEAD, 18 connectors (11 WD + 3 GH + 1 USAJobs + 3 JSON-LD),
  6 non-fixture PUBLISH.

### Session 9 (2026-06-13) — LCA cron hardening + connector widening
- **Pivot #2 (reliability):** The old Claude *scheduled-task* `lca-notice-radar-poll` only fired when the
  desktop app was open — it **silently missed 06-12 and 06-13.** Replaced with a **launchd agent**
  `com.uscehub.lca-notice-poll` (`scripts/visa-job-radar/com.uscehub.lca-notice-poll.plist` +
  `lca-poll-cron.sh`), modeled on the p102 research cron. Runs **8:05am daily, app-independent**, scoped
  local commit, never pushes. Check: `launchctl list | grep lca`; log
  `~/Library/Logs/uscehub-lca-poll.log`. **The old scheduled task is DISABLED.**
- **Widened LCA sources** to 4 productive: lca-kumc (filename-token), lca-pitt + lca-uams + lca-emory
  (all-pdf-titled). `parseNoticeText` handles 3 templates (numbered DOL / Pitt prose / UAMS label-colon).
  Emory's fillable form renders values ABOVE labels → salary/period suppressed via underscore guard,
  role from cleaned filename. NOT viable: Penn ISSS, Penn State, UF/Vanderbilt/OHSU (policy-only),
  UMich/UPenn (403).
- **New connectors:** jibe-novanthealth (categories=Physicians filter), avature-rss-aah (Advocate Aurora
  RSS), atom-uky (PeopleAdmin — became the single largest SPONSOR_LEAD contributor, ~200).
- **BUG — alias guard:** `sponsorHistoryIndex()` guard `if (!m.has(atsKey))` blocked an EMPLOYER_ALIASES
  override whenever ANY DOL entry existed, including weak shell entities (2yr/0pos). **Fix:** new guard
  `if (!existing || (existing.yearsActive ?? 0) < 3)` — strong aliases now override weak shells.
- **Workday 422 methodology CORRECTION:** earlier notes said "422 from CXS = tenant confirmed." That was
  **wrong.** A validated probe (`bannerhealth/wd108`=200, `sanford/wd5`=200) proved valid tenants return
  **200**. So **422 = the tenant is NOT on that CDN** (wrong handle guess). 404+S21 = CDN exists, wrong
  site path. To wire any Workday employer you MUST capture the real tenant+dc+site from the employer's
  live careers-page network trace (XHR to `*.myworkdayjobs.com/wday/cxs/...`). You cannot guess it.

### Session 10 (2026-06-15) — the `total=0` bug fix (+65 PUBLISH) and the cap-raise campaign (+39)
- **BUG (highest-impact of the whole project) — `total=0` early-break** (commit `3282920`): Workday CXS
  returns the correct `total` on page 0 but **`total=0` on every subsequent page** for ~14+ tenants
  (Sanford, Mercy, Benefis, KHS, Presbyterian HC, MultiCare…). Old code `if ((page+1)*20 >= total) break`
  evaluated `40 >= 0 = true` and **stopped after 2 pages (40 results).** **Fix:**
  `if (total > 0 && (page+1)*PAGE_SIZE >= total) break;` — only use `total` as an early-exit hint when
  positive. **Impact: +65 PUBLISH (148→213).** Sanford alone +35 (16→51). Also added a per-connector
  **`wdMaxPages`** override (set `wdMaxPages:35` on MultiCare to reach offset 620 where the Yakima GI
  jobs live).
  - CONFIRMED-but-zero-gain (real physician pools, but descriptions carry no J-1/H-1B language): LVHN,
    Banner, Nebraska Med, Saint Francis, UMMH, UVM, Baystate, BILH, KUMC, URMC, MGB, Brown Health.
- **Cap-raise campaign (commits `b7b414e` + `398a0ec`): +39 PUBLISH (213→252).** Raised `wdMaxDetails`
  on the three largest confirmed pools: workday-mercy 40→200 (pool 169, ~30% visa rate),
  workday-ochsner 40→120 (pool 103, ~15%), workday-corewellhealth 40→200 (pool 165, ~15%).
- **Pivot #3 (diminishing returns) — visa-rate FRONT-LOADING confirmed:** AHN, Sentara, Gundersen, KHS
  cluster their visa language in the **first 40–100 results**; the deeper pool has ~0% visa rate. So
  raising caps on *those* connectors yields nothing. Verified by sampling offsets 100–120. This is why
  the cap-raise campaign only helped Mercy/Ochsner/Corewell and stopped there.
- **New connector jibe-medstar (MedStar Health, DC/MD)** — wired but **net 0 PUBLISH.** The Jibe API
  returns 742 "physician keyword" matches, but only **2** are physician-*titled* in the first 100
  (the rest mention "physician" contextually, e.g. "works with a physician team"). Both surfaced as
  SPONSOR_LEAD (no explicit visa language in those two ED postings). **Lesson:** Chrome's rendered card
  titles mislead — always confirm the *titled* yield via `raw_candidates.json` from an actual run before
  assuming a connector is worth it.

### Session 11 (2026-06-15/16) — "keep finding until we run out" → confirmed ceiling
- Exhausted the remaining tractable paths. **All new Workday handle guesses returned 422** (= tenant not
  on that CDN): Christus, Ballad, Baylor Scott White, SSM, Vidant, MetroHealth, Covenant, Marshfield.
- **Marshfield Clinic = Sanford** (`careers.marshfieldclinic.org` 302-redirects to `sanfordcareers.com`)
  — already covered by workday-sanford. No new connector.
- **SSM Health** — Phenom tenant SHWSHLUS, only 8 physician-slugged URLs, 0 visa language → not worth it.
- **ECU Health** — Phenom tenant EBSEHSUS, 604 sitemaps but 0 physician-slugged URLs.
- **MetroHealth** = Talentegy ATS (no public API); **Bassett** = informational page, no ATS;
  **FMOLHS** = DNS resolves but content blocked.
- **Conclusion:** every remaining gain requires a *manual live Chrome network capture* per employer to
  discover the real Workday tenant handle. No more can be harvested by inference. **Ceiling reached.**
- 2026-06-16: the launchd LCA cron fired on schedule (commit `96619c9`, "13 physician notices") —
  proving the moat's automation works app-independently. This is the desired steady state.

---

## 5. ARCHITECTURE — every file in `scripts/visa-job-radar/`

**Engine core (the intelligence layer — NO REGEX in `engine.ts`, hard rule):**
- `types.ts` — shared types; `VisaLabel` incl. `FEDERAL_NONCITIZEN_ELIGIBLE`.
- `engine.ts` (27 KB) — the lexicon + `classify()`. Char-scanning only. Holds: physician gate
  (`PHYS_TOKENS`/`NONPHYS_TOKENS`), affirmative/denied polarity (`followedByDenialValue()` for the UAMS
  bug), eligibility-tier cap (`FEDERAL_NONCITIZEN_ELIGIBLE` can never exceed `VISA_SIGNAL_ONLY`), and the
  **quote-offset gate** (`validateQuote`) — the publish bar: a PUBLISH must carry an exact, char-offset-
  validated quote from employer/government text. **Do not introduce regex here.**
- `classifier.ts` — thin wrapper used by tests.
- `connectors.ts` (33 KB) — all fetchers: `fetchWorkday` (facet-based, honors `wdMaxDetails`/`wdMaxPages`),
  `fetchJibe` (`JIBE_MAX_PHYSICIAN=40`, `JIBE_PAGE_SIZE=100`, description inline in list), `fetchJsonLd`
  (Phenom sitemap fallback), `fetchUsajobs`/`fetchUsajobsHistoricJoa`, `fetchGreenhouse`, Findly/CTS,
  Atom/PeopleAdmin, Avature RSS, `stripHtml`.
- `source-registry.ts` (86 KB — the biggest file) — every `SourceDef`: `id`, `tier`, `connector`,
  `handle`, `employer`, `enabled`, per-connector overrides (`wdMaxDetails`, `wdMaxPages`, `jibeQuery`),
  and a verification `note`. **This is where you add/tune connectors.**
- `run.ts` (25 KB) — the pipeline: gather → classify → dedupe → quote-gate → `sponsorEnrich()`
  (SPONSOR_LEAD fusion) → `updateJobLeadsHistory()` → write run dir. `--live` does real fetches;
  `--promote` (NEVER run without explicit instruction) is the only thing that writes the app surface.
- `fixtures.ts` (13 KB) — 15 hand-labeled gold fixtures + connector samples. **Gold must stay 15/15.**

**Sponsor-universe + fusion:**
- `sponsor-universe.ts` (22 KB) — `buildSponsorUniverse()`, `normEmployer()`, `sponsorHistoryIndex()`,
  and **`EMPLOYER_ALIASES`** (maps ATS brand names → DOL normKeys; see §6).
- `build-sponsor-universe.ts`, `scale-sponsors.ts`, `repeat-rate.ts`, `process-dol-annual-csv.ts`,
  `process-dol-xlsx.py` (openpyxl streaming; handles SOC 2010/2018/apostrophe; CASE_NUMBER dedup).
- `sponsor-truth.ts` — joins layers 1+2+3 per employer; writes `sponsor_truth.json` + report; every
  record carries `truthSummary` with the caveat baked in.
- `build-sponsor-truth-overlay.ts` — codegen → `src/lib/sponsor-truth-overlay.ts` (regenerated by cron).
- `job-leads-history.ts` — `updateJobLeadsHistory()`: tracks `firstSeenAt`/`lastSeenAt` per canonicalKey
  across runs; `N_MISS_TO_CLOSE=3` marks `presumedClosed`. Output: `job-leads-history.json` (committed).

**LCA-notice layer (the moat):**
- `lca-notice-radar.ts` (28 KB) — polls public LCA-notice pages → notice PDFs → `pdftotext` → parse
  role/wage/period/worksite/case# → physician gate → accumulating index (`firstSeenAt`/`lastSeenAt`).
  Three `linkStrategy` modes: `filename-token`, `all-pdf-titled`, `html-row`. `isPhysicianSoc()` (SOC
  29-12). Output: `docs/.../radar/lca-notices/`.
- `com.uscehub.lca-notice-poll.plist` + `lca-poll-cron.sh` — the launchd daily-8:05am automation.

**ATS discovery / probes (dev tooling, not in the live pipeline):**
- `ats-resolver.ts` (17 KB) — `detectAts()` fingerprinting + JSON-LD/sitemap reader.
- `probe-sponsor-ats.ts`, `probe-jsonld.ts` — one-off probes for vetting a candidate employer.
- `audit.ts` (25 KB) — the scoreboard/audit generator.

---

## 6. THE CONNECTOR UNIVERSE (85 enabled) + EMPLOYER_ALIASES

**By platform (representative — full list in `source-registry.ts`):**
- **Workday (facet-based, the workhorse):** sanford, ochsner, mercy, corewellhealth, jeffersonhealth,
  presbyterianhealthcare, montefiore, kumc, urmc, rochestergeneral, bostonmedical, ahn, massgeneralbrigham,
  musc, brownhealth, lvhn, bannerhealth, christianacare, uhsbinghamton, nebraskamed, saintfrancis, ummh,
  msk, geisinger, houstonmethodist, baystatehealth, bilh, wustl, avera, chop, nationwidechildrens,
  sentara, prismahealth, baptisthealthky, multicare, gundersen, kansashealthsystem, benefis, alpine,
  hshs, lifespanri, oumedicine, umnphysicians, saintfrancistulsa, saintlukeskc, wellstar, mcw, uoflhealth,
  hmfp, pennmedicine, sluhn, altamed, uams, adventhealth, roswellpark (dormant), and more.
- **Jibe:** emory, maimonides, ynhhs, osf, novanthealth (categories=Physicians), carlehealth, medstar
  (0 yield — see §4 session 10).
- **Phenom JSON-LD/sitemap:** umms, wellstar, miami, tufts, uvahealth, uthhealthhouston, trinityhealth,
  froedtert, dukehealth, northwestern-medicine, corewellhealth, rrhealth, hartfordhealthcare,
  jacksonhealth, centracare.
- **Findly/Google CTS:** upmc, uhhospitals, adventhealth.
- **Atom/PeopleAdmin:** uky (largest single SPONSOR_LEAD contributor).
- **Avature RSS:** aah (Advocate Aurora — RSS bot-accessible; detail pages JS-rendered).
- **USAJobs historic VA:** usajobs-historic-va-0602 (80 candidates → SIGNAL/REJECT, no SL — VA "may
  appoint" boilerplate is statutory, NOT a sponsorship promise).
- **Greenhouse:** cerebral.

**Key EMPLOYER_ALIASES (ATS brand → DOL normKey) in `sponsor-universe.ts`:** "5000 wellstar medical"→
"wellstar medical"; "uomuomus"→"university of miami"; "allegheny health network"→"allegheny clinic";
"advocate aurora health"→"aurora medical"; "banner health"→"banner medical"; "novant health"→
"novant medical"; "medstar health"→"medstar medical ii". (Plus sanford/ochsner/umms/stanford/jefferson/
adventhealth/brown.) Add an alias whenever an ATS employer string doesn't match its DOL filer normKey.

---

## 7. ATS ARCHITECTURE PLAYBOOK (the hard-won decode rules)

- **Phenom-HOSTED** (`careers.wellstar.org`, `careers.miami.edu`): sitemapindex + `/job/<ID>/slug` URLs,
  JSON-LD served server-side to bots → **WIREABLE** via `fetchJsonLd`.
- **Phenom-WordPress-EMBEDDED** (`jobs.northwell.edu`, `jobs.bostonchildrens.org`): bot gets WordPress
  SEO sitemaps, not Phenom JSON-LD → **NOT WIREABLE.**
- **Phenom-Gatsby-EMBEDDED** (`careers.corewellhealth.org`): Gatsby SPA serves the same shell for all
  paths; sitemaps 200 but 0-byte body → **NOT WIREABLE** as Phenom (note: Corewell IS wired via Workday).
- **Workday CDN status codes:** 200 = valid tenant; 404+S21 = tenant exists, wrong site path; **422 =
  tenant NOT on this CDN (wrong handle)**; 500 = also "tenant not found" on some CDNs. **You cannot guess
  a Workday handle — capture it from the employer's live careers-page XHR to `*.myworkdayjobs.com/wday/
  cxs/...`.**
- **Jibe pinning:** default `keyword=physician` returns the same non-physician results at all offsets;
  per-tenant category filter varies — `tags=Physicians` (OSF), `categories=Physicians` (Novant; note
  `category=` singular returns ALL jobs). And even when it returns 742 matches, very few may be
  physician-*titled* (MedStar: 2/100). Always verify titled yield from a real run.
- **Workday keyword vs facet:** keyword "physician" is ~99% noise; filter by jobFamilyGroup facet.

---

## 8. DEFINITIVELY NOT WIREABLE (do NOT re-investigate — same no-bypass posture as WVU)

These were each probed and ruled out for a *structural* reason (not a temporary error). Re-investigating
them burns time and risks the no-bypass rule.

- **Iron-core academic giants — unreachable by design:** Cleveland Clinic, Mayo (Infor CloudSuite),
  Northwell (WordPress portal), NYC H+H (Radware WAF / perfdrive bot-block), Johns Hopkins (403),
  Mount Sinai/Icahn + UT Southwestern (Taleo SSO), NYU Langone, Henry Ford, IU Health, SUNY Upstate
  (Infor), UAB Medicine + OHSU + Beth Israel (iCIMS native SSO), Hartford HealthCare (Taleo SSO).
- **CRM/SPA with no public API:** USACS (Herefish; iCIMS 410 Gone), Sound Physicians (TalentBrew SPA),
  Cook County Health (Taleo classic), BronxCare (Infor, timeout), PAGNY (custom CMS), INTEGRIS (Oracle
  HCM, no server-side JSON-LD), CHI/CommonSpirit (TalentBrew+iCIMS), Piedmont (iCIMS SSO + Appcast),
  PeaceHealth (Talemetry/Jobvite + Cloudflare), MetroHealth (Talentegy), Mayo TalentBrew→Oracle CX.
- **Phenom-embedded (no server-side JSON-LD):** VCU Health, ECU Health, Northwell, Boston Children's,
  Corewell (as Phenom), SSM Health (8 phys URLs, 0 visa), Hackensack Meridian (Jibe pinned, no phys cat).
- **422 on every handle guess (need live capture):** Christus, Ballad, Baylor Scott White, Vidant,
  Covenant, Marshfield (=Sanford), Avera-guess, Gundersen-guess, Baystate-guess, Children's-National,
  Banner-Univ (likely already in workday-bannerhealth wd108).
- **Oracle HCM:** Mount Sinai/Icahn, WellSpan, Guthrie. **Bot-block 403:** WVU, Penn/UMich (LCA pages).
- **Zero attending physicians on public ATS (only postdocs/NP/PA):** Cleveland Clinic, Vanderbilt,
  Stanford (workday-stanfordhealth disabled), workday-vumccareers disabled.
- **Essentia Health:** Workday confirmed (212 phys jobs) but ZERO DOL H-1B history (rural MN, Conrad-30
  J-1 waivers only) — not worth wiring without DOL enrichment.

---

## 9. THE LCA-NOTICE MOAT + THE CRON (most defensible asset)

LCA notices (20 CFR 655.734) are posted on an employer's own site for ~10 business days when they file an
H-1B — role, wage, worksite, case#. They vanish fast, so a **maintained time-series** is something no
competitor has. This is the strategic moat.

- **4 productive sources:** lca-kumc, lca-pitt, lca-uams, lca-emory (~12 physician notices). lca-umd
  enabled but 0 physician (research scientists, SOC 19-xxxx).
- **The automation:** launchd agent `com.uscehub.lca-notice-poll` runs `lca-poll-cron.sh` at **8:05am
  daily**, app-independent. It polls → re-fuses `sponsor_truth.json` → regenerates the overlay →
  **scoped local commit (never pushes).** Verify: `launchctl list | grep lca`; log at
  `~/Library/Logs/uscehub-lca-poll.log`. Confirmed firing 2026-06-16 (commit `96619c9`).
- Most university HR LCA pages are 403, policy-only, inline-HTML, or posted physically — productive
  PDF-based physician-bearing pages are RARE. Widening this set (carefully, no bypass) is the #1 way to
  grow the moat.

---

## 10. HOW TO RUN (all from `/Users/shelly/usmle-platform`)

```bash
cd /Users/shelly/usmle-platform
export PATH="$HOME/homebrew/bin:$PATH"          # Homebrew is user-local; no /opt/homebrew on this Mac

npx tsc --noEmit                                 # must be clean
npx tsx scripts/visa-job-radar/run.ts            # OFFLINE: gold 15/15 + connector check (the green check)
npx tsx scripts/visa-job-radar/run.ts --live     # LIVE pull (~47 min, 85 connectors). NO --promote.
npx tsx scripts/visa-job-radar/lca-notice-radar.ts   # poll + accumulate LCA notices
npx tsx scripts/visa-job-radar/sponsor-truth.ts      # fuse the three layers
npx tsx scripts/visa-job-radar/build-sponsor-universe.ts   # rebuild universe from persistence_index
```

- **CWD RULE (critical):** `sponsorEnrich()` reads `persistence_index.json` via `process.cwd()`. **Always
  run from the repo root.** Wrong CWD → SPONSOR_LEAD=0 and the run dir lands in the wrong repo.
- **tsx, not ts-node** (project is ES modules; ts-node throws `ERR_MODULE_NOT_FOUND`).
- **Node buffers stdout to a file** until exit — a redirected log stays 0 bytes mid-run; that's normal.
- A `--live` run writes a new dir under `runs/`; read its `run_report.md` for the bucket counts and
  `raw_candidates.json` to check a connector's *titled* yield.

---

## 11. CONSTRAINTS (BINDING — verbatim; violating these breaks operator trust)

- **No commercial-board scraping ever** (PracticeLink, PracticeMatch, DocCafe, Indeed, LinkedIn). Never crawl/copy.
- **No bot/WAF/CSRF bypass.** If a page 403s a plain client, DISABLE it with a note — never spoof headers.
- **Evidence only from employer-owned pages or government sources**, with an exact char-offset-validated quote.
- **No regex in `engine.ts`** (the intelligence layer). Char-scanning only. (Data-prep files may use light regex.)
- **No `--promote`** unless explicitly told — the committed app surface stays the honest empty state.
- **Never fabricate a visa claim or inflate a count.** Always render the sponsor-history caveat.
- **DO NOT touch/stage `src/app/career/*`** (except `sponsors/sponsor-search.tsx`) **or p102/nav changes** —
  those are pre-existing uncommitted work owned by other tasks. There ARE such uncommitted changes in the
  tree right now (see §16); leave them alone.
- **Commits: local only. NEVER push / force-push / amend without the operator typing "push".**

---

## 12. THE CORE FINDING (the data thesis, validated)

- 7 years of DOL data (FY2019–FY2025 full): ~2,000–2,130 distinct physician H-1B sponsors per year;
  positions grew 8,978 → 14,183 (+58%).
- **456 iron-core employers** appear in all 7 full years. **Position-weighted YoY repeat rate = 83.6%.**
- This is the empirical backbone of the SPONSOR_LEAD layer: a known multi-year sponsor with a current
  physician opening is a *strong, honest* lead even when that specific posting is visa-silent — surfaced
  WITH the caveat, never as a guarantee.

---

## 13. WHY WE STOPPED — the structural ceiling (honest assessment)

**252 PUBLISH is at the ceiling of the current architecture.** The remaining universe splits into:
1. **Giants we cannot reach by design** (Infor/Phenom-embedded/SSO/WAF) — and which post zero attending
   physicians publicly anyway. No bypass is allowed and none would help.
2. **Regional systems whose Workday handle we can't guess** (every guess 422s). Each requires a *manual
   live Chrome network capture* to read the real tenant/dc/site. That is per-employer human-in-the-loop
   work, not something inference unlocks.
3. **Deep pools with no visa language** — front-loading means the visa-bearing reqs are already captured
   in the first 40–100 results; raising caps yields nothing (proven on AHN/Sentara/Gundersen/KHS).

So the high-leverage frontier is **NOT more openings connectors** — it's **the LCA-notice moat** (§9):
widen productive sources, keep the daily time-series alive. That is the defensible, compounding asset.

---

## 14. ROADMAP (highest-leverage first)

1. **Grow the LCA-notice moat** — find more employer LCA pages that post physician PDFs (carefully, no
   bypass). Only 4 productive sources today. This is the one frontier with real upside.
2. **Per-employer live Workday captures** — when the operator wants specific regional systems (FMOLHS,
   Dartmouth-Hitchcock, Christus, Ballad…), capture the real handle from the live careers-page XHR, then
   add a `SourceDef`. Human-in-the-loop; ~1 connector at a time.
3. **Revisit workday-roswellpark periodically** — iron-core 7yr/45pos, currently 0 open reqs.
4. **Presbyterian HC specialty facets** — 4 PUBLISH at 79 candidates; targeted facets may add a few.
5. **Consider a 3RNET partnership** rather than rebuilding rural J-1 inventory from scratch.
6. **Decide when to drop `robots: noindex`** and `--promote` the surface — only when content density and
   accuracy justify going public. That is an operator call, not an agent call.

---

## 15. KEY COMMITS (local `main`, never pushed)

- `96619c9` — LCA-notice radar: daily poll 2026-06-16 — 13 physician notices (cron auto-commit)
- `398a0ec` — run 2026-06-15-1829 — 252 PUBLISH steady (MedStar 0 visa-affirmative)
- `b7b414e` — Raise Workday caps, wire MedStar Jibe — 252 PUBLISH (+39 from 213)
- `61a9813` — live run 2026-06-15 — PUBLISH 148→213, bug fix + wdMaxPages
- `3282920` — Add wdMaxPages override + **fix total=0 early-break bug** (the +65 fix)
- `1875dda` — DOL 7-year persistence + repeat-rate (83.6%)
- (earlier session 1–8 commits enumerated in `HANDOFF.md` §9)

`git log --oneline` in the repo shows all 550. Tree had pre-existing uncommitted `src/app/career/*` +
p102/nav changes owned by OTHER tasks — left untouched, as required (§16).

---

## 16. UNCOMMITTED TREE STATE AT SIGN-OUT (do not touch)

`git status` at sign-out shows modified `src/app/career/{page,jobs,employers,alerts,waiver,visa-bulletin}`
and `docs/.../p102/*` plus untracked `docs/.../nav/` and p102 cron run dirs. **None of this is VJ work** —
it belongs to the p102 / career-nav tasks and is explicitly out of this project's scope. The next agent
should NOT stage or commit these as part of VJ work.

---

## 17. WHERE THIS IS BACKED UP ON T7 SHIELD

Snapshot root: `/Volumes/T7Shield_Code/01_PROJECTS/Health_USMLE_Platform/02_DAILY_SNAPSHOTS/2026-06-16_*/`
(also reachable via the `01_SOURCE_BACKUP_LATEST` symlink after this run). Contents:
- `usmle-platform.bundle` — **complete `git bundle`: all 550 commits, all branches.** Restore anywhere with
  `git clone usmle-platform.bundle usmle-platform`. This is the authoritative, self-contained backup.
- `usmle-platform/` — working-tree copy (excludes `node_modules` + `.next`, both regenerable via
  `npm install` / `next build`; **includes** `.git` and the gitignored `runs/`).
- `SIGNOUT_2026-06-16_MASTER.md` — a copy of this file at the snapshot root for immediate visibility.
- `claude-memory/` — a copy of the operator's `~/.claude` project memory (81 files + `MEMORY.md`) so a
  future agent without `~/.claude` access can still read the full cross-project context. The VJ-specific
  memory is `project_vj_sponsor_truth.md`.
- `RESTORE_README.md` — restore instructions (rsync/clone) at the snapshot root.

T7Shield_Code is **APFS** (the proper code drive). Do not confuse it with the ExFAT T7 (cold storage only).

---

## 18. ONE-PARAGRAPH TL;DR FOR THE NEXT AGENT

VJ is a J-1/H-1B **physician sponsor-truth** product in `/Users/shelly/usmle-platform` (branch `main`,
local only, never pushed). It fuses DOL 7-year sponsor history + live LCA-notice activity + employer-direct
ATS openings, and is honest by design (caveat on every surface, exact-quote publish gate, no count
inflation, no scraping, no bypass). It currently produces **252 PUBLISH / 3,126 SPONSOR_LEAD across 85
connectors**, gold 15/15, tsc clean. It has hit a **structural ceiling** on openings (giants unreachable,
regional handles need manual capture, deep pools are visa-silent), so the real frontier is **the LCA-notice
moat** (§9, §13). Run the green check (§10), respect the constraints (§11), and never push without the
operator typing "push." Everything is backed up on T7 (§17).
