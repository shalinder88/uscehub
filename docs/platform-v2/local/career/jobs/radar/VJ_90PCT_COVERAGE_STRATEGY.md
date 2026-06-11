# Reaching ≥90% of J-1/H-1B Physician Jobs — Strategy

Date: 2026-06-10. Method: direct operator research (the fan-out workflow rate-limited twice; finished with
targeted searches + a JAMA/DOL primary source). Hard constraints honored: no commercial-board scraping, no
bot/WAF/CSRF bypass, evidence only from government or employer-owned pages with a char-offset-validated quote.

## 1. The answer in plain language

**Yes — ~90% is achievable, but only if you measure the right thing and change the unit of work from
*jobs* to *employers*.** You cannot aggregate 90% of physician *postings* (they live on boards we won't
scrape). But the universe of visa-**sponsoring physician employers** is **public and small**: in 2016 the
*entire* H-1B physician flow — **10,491 certified LCAs — came from just 2,156 distinct employers** (JAMA,
DOL data). Enumerate ~100% of that employer universe from public DOL data, resolve each to its **own**
careers page, and monitor those continuously. Because an H-1B legally **cannot exist without a public LCA**,
and because the sponsor base is institutional and repeats year over year, monitoring the known-sponsor
universe captures ~90% of where next year's sponsored jobs appear.

> **Denominator discipline:** "90%" means ~90% of the **sponsored-physician-job flow** (~10–12k/yr H-1B +
> ~1.3–1.5k/yr J-1). It does **not** mean 90% of every physician listing on PracticeLink/PracticeMatch —
> most of those never sponsor, and that is the wrong target.

## 2. Why this works: the public sponsor universe + repeat rate

- **LCA is mandatory and public.** Every H-1B petition requires a certified Labor Condition Application
  filed with DOL; OFLC discloses them in bulk quarterly. So DOL LCA data is a **near-100% census of H-1B
  physician sponsors** (SOC 29-12xx). [primary-gov]
- **Tiny, concentrated universe.** 2,156 employers in 2016; top 4 (Beaumont, Bronx-Lebanon, Cleveland
  Clinic, Presence Saint Francis) = 10% of all filings. The head is large hospitals + academic medical
  centers that sponsor **structurally every year**. [peer-reviewed: JAMA 2017]
- **J-1 ⊆ H-1B.** A J-1 waiver converts the physician to **H-1B status**, so J-1-waiver employers also
  appear in LCA data. The J-1 set is essentially a subset of the H-1B sponsor universe (plus enumerable
  Conrad-30 / federal-IGA programs). [primary-gov]
- **Repeat-sponsor rate is the crux — and we can MEASURE it ourselves.** No published physician-specific
  persistence %, but institutional concentration implies the volume-weighted head is highly persistent.
  **Validation step (cheap, do it first): compute the actual year-over-year employer-repeat rate from 3–5
  years of DOL LCA files** (public; partly in the repo already). If repeat ≥ ~80% on the volume-weighted
  head, the 90% target is sound. This converts the key assumption into a measured number.

## 3. The concrete ways to FIND the jobs (the how)

Ranked by share of the universe reached, employer-direct, no board scraping:

| # | Method | What it yields | Reach | Compliance |
|---|---|---|---|---|
| 1 | **DOL OFLC LCA bulk (multi-year), SOC 29-12xx** | The sponsor universe: employer, worksite, wage, volume, recency (~2.2–3k employers cumulative) | **~100% of H-1B sponsors** | public-domain |
| 2 | **USCIS H-1B Employer Data Hub join** (name + NAICS-62 + state) | Confirms approvals vs mere filings; separates real hirers | ranking layer | public-domain |
| 3 | **PERM (ETA-9089) physician sponsors** | Adds green-card sponsors not in recent H-1B | tail extension | public-domain |
| 4 | **Employer → ATS resolution** via URL fingerprint | The actual current openings at each sponsor | ~80–90% of employers | employer-direct |
| 5 | **schema.org JobPosting JSON-LD + sitemap.xml** | Universal fallback for non-API ATSs (iCIMS/Taleo/SuccessFactors) | most career pages | employer-direct |
| 6 | **3RNET partnership** | J-1-**tagged**, employer-direct rural listings (the one real visa tag) | J-1 rural tail | by agreement |
| 7 | **Conrad-30 (state) + HRSA HPSA/FQHC** | J-1 program intel + underserved-area employer registry | J-1 + targeting | public/gov |
| 8 | **New-LCA / PWD filing alerts per watched employer** | Leading indicator a sponsor is about to hire | freshness | public-domain |

**ATS detection (method 4), concretely** — fingerprint the employer's careers URL:
- `*.myworkdayjobs.com` → **Workday CXS** JSON (engine already supports — no auth)
- `boards.greenhouse.io` / `*.greenhouse.io` → **Greenhouse** boards-api (supported — no auth)
- `jobs.lever.co` → **Lever** postings-api · `jobs.ashbyhq.com` → **Ashby** (no auth)
- `*.icims.com` → **iCIMS** (dominant in healthcare; no clean public API) → use **JSON-LD/sitemap** on the public posting pages
- `*.taleo.net` / Oracle / `*.successfactors.com` → SAP/Oracle → **JSON-LD/sitemap** fallback
- none detected → parse career-page JSON-LD; else flag "dark" (small minority)

The dominant healthcare ATSs (iCIMS, Taleo) are partnership-gated for APIs — but their **public career pages
emit structured JobPosting data**, so the postings stay readable employer-direct via method 5. That is the
key engineering nuance: Workday/Greenhouse give us a clean API; iCIMS/Taleo give us structured HTML.

## 4. The coverage math to ~90%

```
H-1B physician sponsor universe (DOL LCA, multi-year)      ~100%  enumerable (LCA mandatory)
  × employers that re-sponsor next year (repeat rate)       ~80–90% volume-weighted (MEASURE IT)
  × employers reachable employer-direct (ATS API + JSON-LD) ~80–90%
  + J-1 channels (3RNET + Conrad-30 + same LCA set)         covers the J-1 subset
  + quarterly LCA refresh                                   closes the new-sponsor lag
= achievable employer-direct coverage of the sponsored-job flow   ~85–90%
```

**The residual ~10–15% (structurally hard, mostly out of scope):**
- **Brand-new first-time sponsors** inside the DOL disclosure lag (1–2 quarters) — caught on the next refresh.
- **Tiny practices / locum** that post only via a **recruiter** and never on their own site — the employer
  is still known (LCA), but the live opening may only exist on a board we won't scrape.
- **Employers with no public ATS and no JSON-LD** — a small, shrinking minority (structured data is now
  near-universal for institutional employers due to Google for Jobs).

Reaching the *last* 10% would require board scraping (off-limits) — so the honest target is **~85–90%
employer-direct**, which is the meaningful number.

## 5. Sequenced build (mapped to the engine + prior docs)

- **Phase A — Measure the assumption.** Compute the year-over-year employer-repeat rate from 3–5 years of
  DOL LCA files (public). **Gate:** if volume-weighted repeat ≥ ~80%, proceed; if not, re-scope. *(One
  analysis, no new infra.)*
- **Phase B — Build the sponsor universe.** Refresh/expand `dol-jobs-data.ts` + `sponsor-data.ts` from
  multi-year OFLC Excel (SOC 29-12xx) + USCIS Hub join + PERM. Output: the ranked master sponsor list
  (~2.2–3k employers) with volume + recency + a **Sponsor-History Score**. *(The repo already holds ~1,800.)*
- **Phase C — Employer→careers resolver.** For each sponsor, detect ATS (method 4) and resolve to its own
  openings; JSON-LD/sitemap fallback (method 5). Reuse the engine + quote-gate. This is the
  **employer-hosted-board resolver** already planned — now driven by the *DOL sponsor list*, not random
  ATS tenants. **Gate:** the 100-job manual benchmark's clean-resolution rate (≥40–50% → build at scale).
- **Phase D — Monitor + score.** Poll each employer's surface on a cadence; dedup within employer; fuse the
  posting's visa text (or silence) with the employer's **LCA sponsor-history prior** (a Bayesian-style
  confidence: a silent posting from a 50-LCA/yr sponsor is still a strong lead). Quote-gate every published
  claim. New-LCA alerting for freshness.
- **Phase E — J-1 channels.** 3RNET partnership (J-1 tag), Conrad-30 state data, HRSA HPSA enrichment.
- **Phase F — Refresh loop.** Quarterly DOL pull catches new sponsors; the universe self-updates.

## 6. Honest limits + uncertainties

- **The repeat-sponsor rate is inferred, not yet measured.** Everything hinges on it; Phase A measures it
  from data we already have. Treat the ~90% as *conditional* on that result.
- **The 10,491 / 2,156 figures are 2016** (the cleanest peer-reviewed physician-specific cut). The universe
  is larger now; directionally the structure (small, concentrated, institutional) holds.
- **iCIMS/Taleo reachability via JSON-LD** is high but not 100% — some career pages omit structured data.
- **"Sponsored-job flow" ≠ "live postings at any instant."** We surface openings; not every sponsor has an
  open physician role at every moment. Coverage is of the flow over a cycle, not an instantaneous snapshot.
- **No data moat:** every input is public; the edge is execution (physician-SOC resolution, the resolver,
  sponsor-history scoring, the quote-gate).

## Appendix: cited sources

- **Physician H-1B universe (10,491 LCAs / 2,156 employers / top-4=10% / by state, 2016 DOL data):**
  JAMA 2017 — `https://pmc.ncbi.nlm.nih.gov/articles/PMC5815043/`
- Hospitals/AMCs depend on H-1B physicians: AAMC — `https://www.aamc.org/news/hospitals-and-health-systems-depend-h-1b-visa-sponsored-physicians-so-what-happens-now`
- LCA required for every H-1B (mandatory, public): DOL OFLC — `https://www.dol.gov/agencies/eta/foreign-labor/performance` · `https://flag.dol.gov/programs/LCA`
- USCIS H-1B Employer Data Hub: `https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub`
- Conrad-30 (>1,000 physicians/yr; J-1→H-1B; FQHC/rural): `https://www.ruralhealthinfo.org/topics/j-1-visa-waiver`
- US active physicians ~1,032,365 (denominator): AAMC — `https://www.aamc.org/data-reports/data/2025-key-findings`
- Healthcare ATS landscape (iCIMS dominant; Workday large systems; Taleo declining): `https://www.icims.com/blog/top-ats-systems-healthcare-recruiting/` · `https://www.jobscan.co/blog/fortune-500-use-applicant-tracking-systems/`
- ATS public feeds (Workday CXS, Greenhouse, Lever, Ashby): `https://developers.greenhouse.io/job-board.html` · `https://github.com/lever/postings-api` · `https://developers.ashbyhq.com/docs/public-job-posting-api`
- schema.org JobPosting / Google for Jobs (structured-data fallback): `https://developers.google.com/search/docs/appearance/structured-data/job-posting`
