# VJ — Reaching PracticeMatch/PracticeLink-Level J-1/H-1B Physician Job Intelligence

> Scope: the `/career` "Visa & Jobs" microsite and the Visa Job Radar engine at
> `scripts/visa-job-radar/`. Goal: a sequenced, evidence-backed path to PracticeMatch/PracticeLink-level
> **quantity AND quality** of J-1/H-1B physician job intelligence using **only** legitimate channels.
> Every recommendation here respects the hard constraints (no commercial-board scraping, no WAF/CSRF
> bypass, no board-JS execution, robots/ToS honored, employer-origin-or-government evidence only,
> quote-offset gate unchanged, no `--promote`, no regex in the intelligence layer).

---

## 1. The answer in one paragraph (THE next step)

**Provision the free USAJobs API key, build the no-key USAJobs HistoricJoa connector, and add ONE
bounded "federal non-citizen eligibility (38 U.S.C. 7407)" lexicon entry → `VisaLabel`.** This is the
single highest-leverage move because it is the *only* path that converts the engine's current **zero
non-fixture, employer-origin, visa-positive PUBLISHes** into real ones this week, at scale, with
impeccable provenance and no new compliance risk. The USAJobs `historicjoa` + `historicjoa/announcementtext`
endpoint pair is verified live: **no API key, public-domain JSON, full job-body text** (summary, duties,
requirementsQualifications, otherInformation), **6,425 series-0602 physician announcements in the trailing
12 months, ~89% Veterans Health Administration**, of which **~100% of the series-0602 (physician) subset**
carry a quote-offset-sliceable non-citizen-eligibility clause (38 U.S.C. 7407(a)) — which our *current*
H-1B-keyed lexicon catches in **0.0%** of VA texts.

> **Operator verification (2026-06-10).** Probed the live endpoints directly (no API key, honest email
> User-Agent) against `data.usajobs.gov/api/historicjoa` + `/announcementtext`. Confirmed: no-key public
> JSON, full body fields, the clause is real and quote-offset-sliceable. **Magnitude, corrected to the right
> denominator:** across *all* VHA series the clause appears in ~69% of postings, but filtered to **series
> 0602 (physicians — what the connector fetches) it is ~100% (445/445 in a Feb-2026 VHA window)**, because
> 38 U.S.C. 7407 is the physician-appointment authority. The *exact full sentence* matches only ~15%
> (postings vary: "may be appointed" / "may **only** be appointed", "VA Policy" / "VA Handbook 5005"), which
> is exactly why the lexicon must **anchor on the invariant core phrase "appointed when it is not possible to
> recruit qualified citizens"** (matches all 445/445 of the 0602 set) rather than the full sentence. **0%**
> carried explicit J-1 / home-residency language — reinforcing this is statutory *eligibility* ("may
> appoint"), never advertised sponsorship.

Everything else in
this document (DOL/USCIS sponsor-history enrichment, HRSA HPSA crosswalk, the employer-hosted resolver,
the 100-job benchmark) is correct and sequenced below, but it is either *enrichment of history* (not live
openings) or *gated on a manual benchmark*. USAJobs is the one lever that is live, clean, large, and
buildable today against the engine we already have. **Critical honesty constraint baked into the build:**
the 7407 clause is statutory *eligibility* ("employer legally MAY appoint a non-citizen"), **not** an
affirmative sponsorship promise ("employer states it WILL sponsor"); it must map to a clearly-labeled
`FEDERAL_NONCITIZEN_ELIGIBLE` / `VA_7407` label and never be conflated with `H1B_SPONSORSHIP`.

---

## 2. How the incumbents actually get quantity + quality

The incumbents' advantage is **not a sourcing pipeline we can out-engineer by reading better** — it is a
closed, paid, two-sided marketplace plus a candidate-data moat. Decomposed:

**PracticeLink** is a paid two-sided marketplace, ~30 years old. Live physician search (June 2026,
verbatim-confirmed): **21,979 employer-direct + 10,818 search-firm = 32,797**; an employer-facing page
markets "35K+ active jobs, 50K+ active job seekers, 5.4K new jobs/30 days." Inventory exists because
**employers and recruiters PAY to post** (free to physicians since the 1994 founding), increasingly via
ATS/job-feed sync. Quality/structure (specialty, location, and an **"Immigration Assistance" / "Visa
Assistance"** filter facet) exists because **employers self-declare it inside PracticeLink's schema at
posting time**. The demand-side moat is a **150,000+ registered / 31,000+ active, 100%-opted-in candidate
database** + **twice-weekly** JobMessenger + weekly virtual career fairs. Almost nothing flows from
public/official sources underneath; it is proprietary, employer-submitted content under a ToS that bans
both automated AND **manual** systematic retrieval ("web robots, or otherwise"). It is a Tier-3
**never-crawl** source.

**PracticeMatch** is fundamentally a **candidate-data and recruiter-tooling company**, not a job board.
The board (**~24,000+ openings, varies daily**, free to physicians) is the loss-leader funnel. Revenue and
moat sit in two stacked data assets: a **licensed-aggregate tier** (MedTies ~1.1M physicians / 1,376,072
records, re-packaging the **AMA Physician Masterfile** + ABMS + state boards) and a **proprietary tier**
(Pinpoint: **490,147 telephone-interviewed physicians, 107,431 active job-seekers**, ~30,000 interviews/yr,
100% geographic-preference coverage). Owned by **M3 USA**. Decisively: **PracticeMatch does NOT structurally
tag jobs by visa-sponsorship type and does NOT algorithmically match visa-needing candidates to sponsoring
employers** — its visa content is *educational*, and matching is recruiter-driven keyword search.

**Three transferable conclusions:**

1. **Don't chase the mechanism.** Their quantity is a paid-supply + opted-in-demand marketplace, not a
   crawl. No amount of cleverness replicates it legitimately. This *validates* pursuing **visa-dense source
   classes** (gov + FQHC/rural employer-direct), not board-scale generic inventory.
2. **The highest-quality visa signal is an EMPLOYER DECLARATION in a structured field** (PracticeLink's
   "Immigration Assistance" facet). This is exactly why our ATS free-text scan produced a clean negative
   (33/33 `NO_VISA_MENTION`). It argues for channels where visa intent is *already structured*: USAJobs
   (statutory clause), Conrad-30/.gov program pages (the program itself declares the employer a shortage-area
   sponsor), and our DOL-LCA sponsor-history table as a discovery/prior layer.
3. **"Powered by PracticeLink" is a compliance trap and a resolver warning.** Board widgets render on
   employer domains — so an employer "Careers" page can be serving **board-origin bytes**. The resolver must
   treat any "Powered by PracticeLink"/board-widget career page as **BOARD content even on an employer URL**,
   and the benchmark's clean-resolution gate must count those as **UNRESOLVED**.

The incumbents' *real* edge over us is breadth of **employer coverage** and **freshness of live openings** —
not a larger true universe of visa events (see §6). Their visa-tagged subset is small: PracticeMatch
J-1-filtered specialty pages return **tens-to-low-hundreds** (e.g. ~171 internal medicine, ~65 hospitalist;
these integers drift session-to-session — treat as order-of-magnitude only).

---

## 3. The legitimate supply stack (QUANTITY)

Ranked by **near-term net visa-positive yield through a clean channel**. The unifying architecture:
**government + employer-direct origin bytes via plain fetch → clean() → extractPhraseHits() → classify()
→ quote-offset gate.** No board ingestion anywhere.

### The DOL OFLC + USCIS sponsor universe → employer-direct resolution path (lead with this)

This is the backbone, but its role must be stated precisely. **DOL OFLC LCA (and PERM) data and the USCIS
H-1B Employer Data Hub are SPONSOR HISTORY / sponsorship INTENT — they are categorically NOT a feed of
currently-open jobs.** A certified LCA is a pre-petition wage attestation; it does not guarantee a petition,
an approval, or a hire, one LCA can cover many workers, and counts are inflated by renewals/amendments and
cap-exempt filers. The USCIS Hub is petition **first-decision outcomes** (approvals/denials), has **no
occupation field** and **no wage**, and is keyed only by **last-4 of tax ID** (not a unique employer key).
**Neither closes the open-jobs quantity gap on its own.**

What they ARE: the **targeting and ranking spine** that tells the engine **which employer domains are worth
fetching** — fixing the "we fetched generic ATS tenants and got clean-negative yield" failure. The bridge
from history to live openings is a three-step join:

1. **Rank employers by real sponsorship volume.** Refresh `dol-jobs-data.ts` / `sponsor-data.ts` from the
   committed quarterly OFLC Excel, filtering the physician SOC **band** `29-121x` (physicians, incl.
   29-1215 Family Medicine / 29-1216 General Internal Medicine) **and** `29-124x` (surgeons). Cross-join to
   the USCIS Hub on **normalized employer name + NAICS-62 + state** (last-4 tax ID only as a weak
   disambiguator) to attach approval/denial volume. Output: a high-confidence, high-volume, currently-active
   physician-sponsor employer list. Our repo already holds the raw material — **1,905 rows / 1,798 employers**.
2. **Resolve each ranked employer to its OWN careers surface** (primary domain or employer-owned ATS tenant)
   and fetch *those* bytes for the quote-offset gate. The DOL row never publishes; it only points.
3. **Relabel the history rows honestly** as "sponsor history (FY/Q)" — never "jobs" — and band by
   certification decision date with an explicit staleness window.

| Rank | Channel | What it yields | Reachability | Compliance | Effort | Quantity impact (net visa-positive, live) |
|---|---|---|---|---|---|---|
| **1** | **USAJobs — HistoricJoa (no-key) + Search API (keyed)**, series 0602 | **6,425 physician announcements/12mo**, ~89% VHA; **~1,008 "accepting applications" at a snapshot** (note ~32% of the 12-mo corpus is "Job canceled" — the honest live number is the accepting count, not 6,425). **~100% of series-0602 (physician) VHA postings** carry the anchor clause (operator-verified 2026-06-10, 445/445; the ~69% all-VHA-series figure understates the physician subset); ECFMG/FMG language corroborates. | **Excellent.** No-key public-domain JSON (User-Agent header required — Akamai 403s a header-less client; an honest email UA is the documented method, not spoofing). Keyed Search API for guaranteed-live openings (free key, currently **unprovisioned → zero**). | **Cleanest lane.** Official government, employer-of-record, not a board. **Action item:** the API-delivered data carries an OPM ToU — *fetching* is clean; **commercial redistribution/publishing of API-delivered listings needs OPM ToU confirmation / likely written approval.** Resolve before any public publish. | Medium | **High** (the only live channel that yields today) |
| **2** | **DOL OFLC LCA/PERM disclosure** (refresh of existing assets) | Thousands of physician **sponsor-history** rows/yr (SOC 29-121x/124x). Backbone of employer ranking + resolver seed. | Bulk quarterly Excel, public-domain by federal-works law (DOL site 403s automated fetch → **manual operator download**, then deterministic local parse). **Quarterly with a one-quarter-plus reporting lag — NOT "near current."** | Clean (gov, public-domain, no copied descriptions). Surface as derived stat, never a published job with a visa quote. | Medium | **High for sponsor-intelligence; ZERO for open-job inventory** |
| **3** | **USCIS H-1B Employer Data Hub** | Per-employer approval/denial volume → ranking/cap-exempt prior. | Static CSV/Excel, FY2009–FY2026 Q2, public-domain. **Freshness caveat: a multi-day outage (~Mar 2026) and the bulk files reportedly still lag the search tool by recent fiscal years; pages labeled "Archived Content." Add a freshness check; prefer operator manual download.** | Clean (gov). Never a publish signal. | Medium | **Medium** (ranking spine, not openings) |
| **4** | **HRSA bulk downloads** (HPSA, MUA/P, FQHC site list, NHSC sites) | Visa-dense **geography + employer registry**: FQHC/rural site addresses → curated employer registry; HPSA scores → replace inferred `hpsa:false`. | **Excellent.** Public-domain, no login, CSV/XLSX/SHP/KML, **"Usage limitations: None," health-center list refreshes daily** (verified updated 6/9/2026). Plus an XML/SOAP web-services API (token via free registration; no fee stated). | Clean (gov). **Do NOT reverse-engineer the HRSA Health Workforce Connector** — it is a CSRF-token-protected SPA with no public jobs API; off-limits under no-CSRF-bypass. | Medium | **High for registry/targeting; not live openings itself** |
| **5** | **Employer-hosted-board resolver** (structured ATS + JSON-LD) | Clean ingestion **substrate** for the FQHC/rural registry — most FQHCs/rural systems run Greenhouse/Lever/Ashby/SuccessFactors/Workday. | Tier-A no-auth JSON (Greenhouse `?content=true`, Lever V0, Ashby — all first-party-confirmed) + in-page schema.org JSON-LD. Workday CXS = public JSON behind Akamai → keep the existing defensive connector (page size 20, 150ms delay), **never spoof headers**. | Clean **if** employer-direct origin only; **never execute board-origin JS**; throttle and don't republish feed data; re-check robots/ToS per host. iCIMS/Taleo/Cornerstone = OAuth/partnership-gated → out unless onboarded. | Medium | **Medium** (raises breadth/quality of ingestion, **not** visa-yield by itself) |
| **6** | **3RNET** (mission-aligned, by agreement) | The single richest legitimately **visa-tagged** channel: a per-listing **"J-1 visa eligible" badge + filter**, **885 pages** of employer-direct listings (live count, drifts), ~2,000 placements/yr (~90% in shortage areas). | No public feed. 501(c)(3); robots permits job pages but it is **aggregation** → **partnership/data-license target**, follow only outbound **employer-direct** links, **ToS review first**, manual benchmark only. Conrad-30 "slots filled" PDFs are ToS-restricted ("written permission required"). | Partner-gated. A 3RNET badge is **3RNET's/the employer's classification, not a verbatim employer quote** → enters as `VISA_SIGNAL_ONLY` / `HOLD_REVIEW` pending employer-origin verification; never auto-PUBLISH. | Medium | **High *if* a partnership lands** (else 0 in-engine) |
| **7** | **Conrad-30 / state DOH .gov pages** | Program rules + J-1 contact + the routing signal (which 3RNET/state portal a state points to). | **No state publishes an openings feed or approved-employer list** (verified across NY/OR/MN/MI + a 50-state matrix). `.gov` ALLOW-class but program docs, not feeds → manual seeding only. **State-government works are NOT 17 U.S.C. 105 public domain** → treat as employer-class, per-state ToS review. | Clean to read. Negative result that **saves effort**: do not build a Conrad-30 openings scraper. | Low | **Low** (targeting/contact intel, not openings) |
| **—** | **AMA Physician Masterfile license** (optional adjacency) | Credential/roster breadth to enrich a sponsoring employer's physician roster/specialties. | Licensable (gated DBL program + Data Use Agreement; **AMA-proprietary, NOT government/open** — buyable under restriction, not freely). | Clean to license; **zero job or visa signal** — do not chase as a moat. | Medium | **None for visa-yield** |

**The honest summary of §3:** the only **live** clean openings channel is **USAJobs (VA/IHS series 0602)**,
a public-sector slice — not board-scale private physician jobs. The federal *history* data (DOL/USCIS) is a
sponsor-intelligence layer; HRSA is a targeting/registry layer; the resolver is an ingestion substrate; 3RNET
is the one partner that could add live, visa-tagged, employer-direct breadth. **The path to more quantity is
visa-dense source CLASSES, not more generic ATS tenants** — empirically grounded by the clean-negative yield
(33/33 `NO_VISA_MENTION`).

---

## 4. The quality stack (QUALITY)

PracticeMatch-level *quality* is a chain of four independently-verifiable guarantees that the best job-data
products (Google for Jobs, LinkedIn) already enforce: **(1) every claim char-offset-grounded to source bytes;
(2) records canonicalized + deduped into one best-of record; (3) freshness as an active, decaying trust signal
with a hard expiry; (4) provenance + a calibrated confidence threshold routing into a three-way accept /
human-review / reject decision.** The engine's existing design already aligns with all four. The gaps:

**A. Visa-signal extraction — extend the lexicon, keep it bounded.** The current `LEXICON` (6 affirmative
entries, each requiring a visa object) is the right paradigm — it IS "anchor-constrained extraction" (closed
vocabulary → char-scan → `cleanedText.slice(start,end) === text`), the canonical hallucination defense. The
single required change: add the **`FEDERAL_NONCITIZEN_ELIGIBLE` / `VA_7407`** entry anchored on the
invariant core phrase *"appointed when it is not possible to recruit qualified citizens"* — which spans the
"may be appointed" / "may only be appointed" and "VA Policy" / "VA Handbook 5005" variants (the full
sentence matches only ~15%; the core phrase ~100% of series-0602 physician postings; see §1 verification
note) — to a new `VisaLabel`. Without
it the engine scores VA postings ~0. **Label honesty:** this is "employer legally MAY sponsor," a distinct,
lower tier than "employer states it WILL sponsor" — render it as such in the UI and never merge it into
`H1B_SPONSORSHIP`.

**B. Structured-field parsing (R2 §9).** Parse `Visas Accepted / Sponsorship / Work authorization /
Immigration assistance` labels into a typed enum `{none|yes|J1|H1B|unknown}`. Higher precision than free-text
because **the label IS the provenance string**. `N/A`/none ⇒ `SPONSORSHIP_DENIED` / `NO_VISA_SIGNAL`, **never**
a publish signal (Sanford showed `Visas Accepted: N/A`). `unknown` is first-class, distinct from `denied`.
Small standalone change.

**C. Dedup / canonicalization.** Keep `canonicalKey` (`norm(employer)|norm(title)|norm(state)|YYYY-MM`) for
live records. For the **sponsor-history** layer, adopt the **OFLC case number** as the true canonical key
(superior to the derived key) and add a stage-2 fuzzy best-of merge across sources (employer + title +
location), since one opening produces 5+ duplicates across channels and per-source IDs are useless for dedup.

**D. Freshness / last-verified.** Current 120-day staleness is **loose** vs the 30–45-day real-fill / 60-day
ghost-signal heuristics (treat those thresholds as heuristics, not validated constants — the widely-cited
"27% ghost jobs" figure is a vendor estimate with circular methodology). Add a **freshness-decay term to the
confidence score** and age `HOLD` items, so a 100-day-old affirmative no longer scores like a 5-day-old one.
Mirror Google for Jobs discipline (verbatim markup-to-content match; never re-date an unchanged posting;
expire via past `validThrough`).

**E. Provenance + quote-offset gate (unchanged — this is the specificity guard).** `validateQuote()` keeps
checking `cleanedText.slice(q.start,q.end) === q.text`; a PUBLISH whose quote fails re-match is downgraded to
`HOLD_REVIEW`. Because facts are not copyrightable (Feist) and we publish our **own** structured records
citing the source, the gate is what keeps every published claim a verifiable fact from a permissible origin
rather than copied board content. Repurpose its output as a **user-facing trust badge**: "evidence verified at
&lt;employer-origin URL&gt; on &lt;date&gt;."

**F. Confidence score — replace the binary Tier-1 gate with a calibrated, fused score.** Today's
"Tier-1 + employer-resolved ⇒ PUBLISH/HIGH" is a switch. Make it a knob: **confidence = signal-polarity-strength
× source-trust-tier × freshness-decay**, feeding a tunable precision threshold, with `HOLD_REVIEW` as the
first-class **abstain** bucket. This is textbook **Fellegi-Sunter dual-threshold** record linkage (above T_λ =
match/PUBLISH, below T_τ = non-match/REJECT, between = manual/HOLD) and **selective classification** — our
held-middle is the standard design, not an ad-hoc compromise.

**G. Sponsor-history scoring + pathway intelligence (the product edge the boards lack).** This is where we
**out-qualify both sides**: generic visa databases (MyVisaJobs, H1BGrader) score sponsor history from the same
public DOL+USCIS data but are **occupation-agnostic and physician-pathway-blind**; PracticeMatch/PracticeLink
have matching but **no transparent, source-verified sponsorship intelligence**. The unoccupied intersection:

- **Sponsor-History Score** per employer from physician-SOC LCA filing count + recency + `CASE_STATUS` mix,
  cross-checked against USCIS Hub NAICS-62 approval/denial volume. Replaces the flat
  `verificationStatus:"verified"` with a graded, source-cited credibility signal.
- **Pathway Engine** — a deterministic per-employer classifier of which J-1 waiver route(s) an employer can
  offer, keyed off facility type + HRSA HPSA score. **Correct the decision tree:** HHS clinical-care IGA needs
  **HPSA ≥ 7** (primary care / general psychiatry only); Conrad-30 = 30 slots/state/yr, **≥20 of 30 in
  HPSA/MUA/MUP + up to 10 flex**, 3-yr H-1B; **VA and DRA grant SPECIALIST waivers** (VA is *not* uniquely the
  specialist route — DRA also does; ARC and HHS do not); **IHS does NOT act as an IGA** for J-1/H-1B (a clean
  denial class, citizens-only, like USPHS Commissioned Corps and DoD MTFs).
- **HPSA-tier crosswalk** — replace the hard-coded `hpsa:false` on **all 1,905 rows** with a real
  HRSA-score lookup by worksite geography. Note this is a **geospatial join** (sub-county/population/facility
  designations need the facility-points file), **not a simple ZIP lookup** — deterministic but non-trivial.
- **Cap-exempt enrichment** — replace the current single-rule split (capExempt:true on exactly the **342**
  h1b-only rows; false on **1,563** — one rule masquerading as two facts) with an evidence-backed flag. But
  **scope it as a heuristic-with-evidence, not a clean deterministic join:** affiliated-nonprofit cap-exemption
  (INA 214(g)(5)) requires a **formal written affiliation agreement** with a higher-ed institution — a signal
  *not present* in 501(c)(3) status or any of the four datasets. University-affiliated teaching hospitals are
  "almost universally cap-exempt"; for-profit hospitals generally are not. **Do not auto-tag VA/IHS 0602
  postings as cap-exempt** — VA is currently cap-**subject** (cap-exemption is the subject of *pending*
  legislation, not current law); separate "J-1 waiver-eligible federal employer" (true) from "H-1B cap-exempt"
  (not automatic).
- **Leading-indicator alerting** — a new-LCA/PWD-for-physician-SOC watcher per saved employer. The 6-month
  rule (an LCA may be filed no earlier than 6 months before start) is the **maximum** lead, not typical; OFLC
  disclosure is **quarterly and lagged**, so this is a **coarse cohort-level intent signal, not a per-job early
  warning** (the "3–6 months before posting" figure is MyVisaJobs marketing copy, not measured fact).

**Moat honesty:** every input is public-domain, so there is **no data moat**. The edge is *execution* —
physician-SOC resolution, the waiver decision-tree, the HPSA geospatial join, and quote-offset provenance —
replicable by a competent competitor. It is an execution edge, not a defensible one.

---

## 5. Sequenced roadmap

Mapped to the existing engine (`scripts/visa-job-radar/`), the R2 spec, the resolver plan, and the 100-job
benchmark. **No `--promote`; committed app surface stays the honest empty state. No push/deploy/PR/DB/schema/
cron in these phases.** Each phase names its gating decision.

### Phase 0 — Provision keys + resolve the ToU question (this week, hours)
- Register the **free USAJobs API key** (`USAJOBS_API_KEY` + `USAJOBS_USER_AGENT`).
- **Gating decision (compliance):** confirm OPM USAJobs **ToU redistribution terms** before any future public
  publish of USAJobs-derived listings. Fetching is clean now; publishing may need written OPM approval. This
  does **not** block building/holding — only `--promote`, which we are not doing.
- Decide USAJobs-key-first **over** a search key (answers open question #1: **yes, USAJobs first**).

### Phase 1 — USAJobs connector + 7407 lexicon (this week)  ← THE next step
- Add a **USAJobs HistoricJoa connector** to `connectors.ts` (offline-safe; **no env-gate** for the no-key
  endpoints — it yields immediately, unlike the keyed Search path). Emit `{employer=hiringAgencyName,
  title=positionTitle, state=positionlocations[].state, postedAt=positionOpenDate,
  sourceUrl=usajobs.gov/job/{controlNumber}, cleanedText=join(body fields)}`. Post-filter to series 0602 on
  `jobcategories` client-side.
- Extend `LEXICON` with the bounded **`FEDERAL_NONCITIZEN_ELIGIBLE` / `VA_7407`** entry (§4-A). Register
  **VHA (VATA)** as a Tier-1 source (it already exists as `usajobs-va-0602`, `needsVerification:true`); mark
  **IHS / USPHS / DoD-MTF as known citizens-only denial** so the engine doesn't waste fetches.
- Run the engine. **Expected first result:** the first non-fixture, employer-origin, visa-positive PUBLISHes
  (or a clearly-labeled VA-eligibility tier) — current count is **0**. Verify the quote-offset gate slices the
  exact 7407 clause; verify the `FEDERAL_NONCITIZEN_ELIGIBLE` label is *not* presented as "will sponsor."
- **Gating decision:** if the keyed Search API is provisioned, prefer it for **guaranteed-live** openings;
  HistoricJoa includes some currently-open postings (future close dates) but is not a guaranteed real-time
  surface.

### Phase 2 — Structured visa-field parser (R2 §9) (small, standalone)
- Parse `Visas Accepted / Sponsorship / Work authorization / Immigration assistance` → `{none|yes|J1|H1B|
  unknown}` (§4-B). `N/A`/none ⇒ `SPONSORSHIP_DENIED` / `NO_VISA_SIGNAL`. Apply to the Workday detail-GET path
  first (Sanford `Visas Accepted: N/A`). **Gating decision:** approve as the standalone change R2 §9 already
  scoped.

### Phase 3 — Quality-stack hardening (parallelizable with 1–2)
- Confidence-score fusion + freshness decay (§4-D/F); OFLC-case-number canonical key + stage-2 best-of merge
  (§4-C); provenance trust badge from the quote-offset output (§4-E). **Gating decision:** keep `HOLD_REVIEW`
  first-class; the publish threshold becomes a calibrated knob, not a switch.

### Phase 4 — Government enrichment of the existing assets (deterministic, offline-safe)
- **HRSA HPSA crosswalk** → replace `hpsa:false` on all 1,905 rows with real scores by worksite geography
  (§4-G; geospatial, facility-points file where needed).
- **Refresh DOL assets** from the latest committed quarterly Excel (SOC 29-121x/124x), relabel as "sponsor
  history (FY/Q)," cross-join USCIS Hub (name + NAICS-62 + state; last-4 tax-ID disambiguator only) for the
  **Sponsor-History Score** + cap-exempt heuristic (§4-G). **Gating decision:** add a USCIS Hub **freshness
  check** — recent-year bulk files may be stale/missing; prefer operator manual download.
- Build the **Pathway Engine** (§4-G) with the corrected VA/DRA-specialist and IHS-not-an-IGA logic.

### Phase 5 — FQHC/rural employer registry + employer-hosted resolver
- Seed the **curated employer registry** (R2 discovery route #1, no search dependency) from the HRSA FQHC site
  list + the high-fill Conrad-30 states (**AZ, CA, IL, IN, IA, KY, MA, MI, MO, NY, TX, WA** — 90%+ slot-fill,
  where visa-positive employer surfaces concentrate) + the top-ranked DOL/USCIS sponsors. Graduate
  benchmark-confirmed employer-direct surfaces into `source-registry.ts` as ordinary Tier-1
  `needsVerification:true` entries (answers open question #4: a thin separate employer-hosted registry first is
  acceptable, but Tier-1 graduation is the target). Restrict any future search key to **site-scoped
  employer/allowed-domain queries only** — never board hosts (answers open question #5: **confirmed**).
- Build the **structured-data resolver** (§3 row 5) as the clean ingestion substrate: ATS JSON feeds + in-page
  JSON-LD, employer-direct origin only, never board-JS, throttled.

### Phase 6 — The 100-job manual benchmark (gates the resolver's scale)
- Staged **20 → review → 100**, **human-eyes-only**, ToS-checked (PracticeMatch ToS forbids data-capture/
  mining; PracticeLink ToS bans even *manual* systematic retrieval into a derived database — the defensible
  line is **one-off reachability facts** (employer-origin URL + yes/no reachable), **never** copied
  descriptions or a compiled collection). 18-column reachability CSV; even the visa-quote column is yes/no +
  employer-origin URL. **Count "Powered by PracticeLink"/board-widget career pages as UNRESOLVED.**
- **Go/no-go on clean-resolution rate (answers open question #3 — yes, size at 100, staged 20→100):**
  **≥40–50% ⇒ build the resolver at scale; 20–40% ⇒ expand to 100; <20% at the pilot ⇒ STOP and shift effort
  to USAJobs / state / FQHC / source partnerships.** Pilot 20 gates the 100.

### Phase 7 — 3RNET / Ivy Clinicians partnership conversations (parallel, slow)
- Open data-license/partnership talks with **3RNET** (visa-tagged, employer-direct, mission-aligned) and **Ivy
  Clinicians / ACEP Open Book** (turnkey **every-ED → employer + recruiter** resolution layer for emergency
  medicine). Both are partner-gated, not scrape targets; 3RNET badges enter as `VISA_SIGNAL_ONLY` / `HOLD`
  pending employer-origin verification.

### Phase 8 — Source-registry refinement (small, types.ts)
- Add a **STATE source tier** distinct from federal `.gov` (state works are not 17 U.S.C. 105 public domain →
  `needsVerification` + per-state ToS review).

---

## 6. Honest limits

**Where a legitimate engine CAN match the boards:** on the **visa-EVENT universe**, which is small, finite,
and concentrated in identifiable, reachable channels. The true annual flow of visa-tied physician hiring is
bounded:

- **J-1 waivers: ~1,300–1,500/yr total** — Conrad-30 placed **~1,010 in FY2024** (19 states maxed; ~61%
  national fill 2001–2020; theoretical ceiling ~1,560–1,650/yr = ~52–55 jurisdictions × 30) plus a smaller
  federal-IGA increment (states historically ~90% of requests). *The ~1,300–1,500 total is an inference from
  20-year-old GAO share data + the Conrad base; no single current source publishes an all-program sum.*
- **H-1B physicians:** **~8,500 physicians/surgeons APPROVED in FY2024** (USCIS) and **~9,000 CERTIFIED on
  LCAs** in 9 months of FY2025 (DOL) — **different metrics on different denominators; do not sum.** Standing
  stock ~10,000 on H-1B. *The 8,500 figure traces to an AHA advocacy citation, not a primary USCIS table —
  treat as directional.*
- **Pipeline cap:** ~6,653 non-citizen IMGs match to residency annually; Intealth sponsors ~15,900 J-1
  trainees. Each year's waiver cohort is drawn from this finishing pipeline.

So a clean engine can realistically surface **a few hundred to low-thousands of verifiable, visa-positive,
employer-direct/government physician openings** — which *is* matching the boards on the slice that matters
(verified J-1/H-1B intent), concentrated in shortage-area employers we already enumerate (~1,800).

**Where it structurally CANNOT match them:** on **raw listing count**. PracticeLink/PracticeMatch advertise
**24,000–42,000** physician listings, but most are **non-visa-specific private-practice/locum/specialist
openings that never state visa intent and are reachable only through the boards' aggregation** — which we will
not scrape. That remainder is the structurally-unreachable, low-quality tail. **"PracticeMatch-level quantity"
measured as listing count is the wrong target.** The right scoreboard is the **visa-positive employer-origin
opening count**, where a legitimate engine is competitive.

**The defensible quantity ceiling:** on the order of **~1,008 live VA/IHS series-0602 visa-eligibility
postings at any snapshot** (USAJobs, today, no partnership) **+ several thousand H-1B-sponsoring physician
openings live across the FQHC/rural/cap-exempt employer-direct registry** (gated on the resolver benchmark)
**+ 3RNET's visa-tagged corpus if a partnership lands**. Set user expectations to that — transparently NOT
matching raw board volume, decisively matching verified visa intent.

---

## 7. Immediate next actions (this week)

- [ ] **Register the free USAJobs API key** (`USAJOBS_API_KEY` + `USAJOBS_USER_AGENT`). *(open Q#1 → USAJobs first)*
- [ ] **Confirm OPM USAJobs ToU** redistribution terms (fetching is clean; publishing may need written approval). Does not block build/hold.
- [ ] **Build the USAJobs HistoricJoa connector** in `connectors.ts` (no env-gate for the no-key endpoints; series-0602 client-side post-filter; honest-email User-Agent).
- [ ] **Add the bounded `FEDERAL_NONCITIZEN_ELIGIBLE` / `VA_7407` lexicon entry** (verbatim 7407 clause); register VHA (VATA) Tier-1; mark IHS/USPHS/DoD-MTF as known citizens-only denial.
- [ ] **Run the engine; verify** the first non-fixture employer-origin visa-positive PUBLISHes, the quote-offset slice of the exact clause, and that the label reads "MAY sponsor," not "will sponsor." *(No `--promote`.)*
- [ ] **Approve the structured visa-field parser** (R2 §9) as the next standalone change (`N/A`/none ⇒ denial, never publish).
- [ ] **Approve the 100-job manual benchmark sizing** (staged 20→100, human-eyes, ToS-checked, board-widget pages = UNRESOLVED). *(open Q#3 → yes)*
- [ ] **Download** the latest DOL OFLC quarterly Excel + HRSA HPSA/FQHC bulk files (operator manual download) to stage Phase 4 enrichment.

---

## Appendix: cited sources

**Government / official (ALLOW-class, public-domain by federal-works law):**
- USAJobs HistoricJoa (no-key): `https://developer.usajobs.gov/API-Reference/GET-api-HistoricJoa` · announcement text endpoint `https://data.usajobs.gov/api/historicjoa/announcementtext` · series-0602 metadata `https://data.usajobs.gov/api/historicjoa?...PositionSeries=0602`
- USAJobs auth / ToU / rate limits: `https://developer.usajobs.gov/guides/authentication` · `https://developer.usajobs.gov/guides/terms-of-use` · `https://developer.usajobs.gov/guides/rate-limiting`
- 38 U.S.C. 7407(a): `https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title38-section7407`
- DOL OFLC performance / disclosure: `https://www.dol.gov/agencies/eta/foreign-labor/performance` · FLAG LCA `https://flag.dol.gov/programs/LCA` · PWD `https://flag.dol.gov/programs/prevailingwages`
- OFLC LCA dataset (data.gov, R/P3M cadence): `https://catalog.data.gov/dataset/labor-condition-application-for-nonimmigrant-workers-lca-program-historical-data`
- USCIS H-1B Employer Data Hub: `https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub` · glossary `https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub/understanding-our-h-1b-employer-data-hub` · files `https://www.uscis.gov/archive/h-1b-employer-data-hub-files`
- USCIS Conrad 30: `https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/conrad-30-waiver-program`
- HRSA bulk downloads ("Usage limitations: None," daily refresh): `https://data.hrsa.gov/data/download` · web services `https://data.hrsa.gov/tools/web-services`
- Rural Health Info Hub J-1 waiver (IGAs, HPSA≥7, VA/DRA specialist, regional commissions): `https://www.ruralhealthinfo.org/topics/j-1-visa-waiver`
- IHS not-an-IGA: `https://www.ihs.gov/physicians/faq/`
- Cap-exemption (INA 214(g)(5) / 2024 Modernization Rule eff. Jan 17 2025): NAFSA `https://www.nafsa.org/professional-resources/browse-by-interest/uscis-memo-h-1b-cap-exemption-under-ac21` · Fed. Register `https://www.federalregister.gov/documents/2024/12/18/2024-29354/...`
- LCA 6-month rule: `https://www.law.cornell.edu/cfr/text/20/655.730`

**Quantity-reality (peer-reviewed / authoritative):**
- Conrad-30 study (18,504 placed 2001–2020, ~61% fill): `https://pmc.ncbi.nlm.nih.gov/articles/PMC11364145/` · `https://academic.oup.com/healthaffairsscholar/article/2/9/qxae103/7735459`
- GAO-07-52 (states ~90% of waiver requests): `https://www.gao.gov/products/GAO-07-52`
- AHA letter (FY2024 ~8,500 physician H-1B approvals): `https://www.aha.org/lettercomment/2025-09-29-aha-urges-administration-exempt-health-care-personnel-h-1b-visa-program-changes`
- PolitiFact (6,653 non-citizen IMG matches, ~9,000 LCA-certified, ~10k stock): `https://www.politifact.com/factchecks/2025/oct/02/tweets/...`
- Intealth J-1 stock (~15,900): `https://www.intealth.org/data/`

**Incumbent model (public business pages — read for research, never ingested):**
- PracticeLink live physician search / recruiters / about / ToS: `https://jobs.practicelink.com/jobs/physician/` · `https://recruiters.practicelink.com/` · `https://www.practicelink.com/about/` · `https://www.practicelink.com/terms/`
- PracticeLink "Powered by PracticeLink" / FAQ: `https://www.practicelink.com/` · `https://www.practicelink.com/employers/faq`
- AAPPR PracticeLink profile (150k registered / 31k active / twice-weekly): `https://aappr.org/signature-partner-profile-practicelink/`
- PracticeMatch databases (Pinpoint 490,147 / MedTies 1.37M) / J-1 page / ToS: `https://www.practicematch.com/employers/databases/index.cfm` · `https://www.practicematch.com/employers/databases/pinpoint-profiles/index.cfm` · `https://www.practicematch.com/physicians/immigration-assistance/J-1-waivers.cfm` · `https://www.practicematch.com/TAC/MT.cfm`
- AMA Masterfile licensing: `https://www.ama-assn.org/topics/ama-masterfile-database-licensing` · `https://en.wikipedia.org/wiki/AMA_Physician_Masterfile`

**Legitimate aggregators / partners:**
- 3RNET J-1 jobs (badge + filter, 885 pp) / Conrad-30 PDFs / About: `https://www.3rnet.org/jobs/j1-visa-waiver-jobs` · `https://www.3rnet.org/j1-filled` · `https://www.3rnet.org/Resources/J1-Waiver/About` · robots `https://www.3rnet.org/robots.txt`
- Ivy Clinicians (every-ED → employer): `https://www.ivyclinicians.io/employers` · `https://www.ivyclinicians.io/salary`
- MyVisaJobs / H1BGrader (occupation-agnostic sponsor scoring — the whitespace): `https://www.myvisajobs.com/employers/search.aspx` · `https://h1bgrader.com/`

**Engineering / quality precedent:**
- Google for Jobs structured-data (freshness, leaf-page, verbatim match): `https://developers.google.com/search/docs/appearance/structured-data/job-posting`
- schema.org `eligibilityToWorkRequirement` (<1K domains): `https://schema.org/eligibilityToWorkRequirement`
- ATS public feeds (Greenhouse/Lever/Ashby first-party): `https://developers.greenhouse.io/job-board.html` · `https://github.com/lever/postings-api` · `https://developers.ashbyhq.com/docs/public-job-posting-api`
- SuccessFactors hidden RSS (canonical path `/sitemap.xml`): `https://cetteup.com/158/sap-successfactors-recruiting-marketings-hidden-rss-job-feed/`
- Fellegi-Sunter record linkage / dedup: `https://moj-analytical-services.github.io/splink/topic_guides/theory/fellegi_sunter.html` · `https://www.promptcloud.com/blog/job-posting-data-aggregation/`

**Legal frame:**
- 17 U.S.C. 105 / federal open-data: `https://www.law.cornell.edu/uscode/text/17/105` · `https://resources.data.gov/open-licenses/`
- Feist (facts not copyrightable): `https://fairuse.stanford.edu/case/feist-publications-inc-v-rural-telephone-service-co/`
- Van Buren / hiQ / Meta v. Bright Data (CFAA narrow; logged-off not bound): `https://www.supremecourt.gov/opinions/20pdf/19-783_k53l.pdf` · `https://www.fbm.com/publications/major-decision-affects-law-of-scraping-and-online-data-collection-meta-platforms-v-bright-data/`
- State works NOT 17 U.S.C. 105: `https://en.wikipedia.org/wiki/Copyright_status_of_works_by_the_federal_government_of_the_United_States`
