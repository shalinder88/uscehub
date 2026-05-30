# Visa Job Radar — Phase 1D Source Discovery Plan

Status: PLAN ONLY (no connector code until explicitly approved)
Date: 2026-05-30
Author context: written after Greenhouse live test (Phase 1b/1c) concluded that
Greenhouse is low visa-yield. USAJobs (Phase 1D, Path A) is gated on operator
credentials that are not yet set, so this document is the Path B deliverable.

## 0. Decision context

Two Greenhouse live runs (≈590 real postings) established:

- Population A (One Medical, Oscar, Cerebral): physician postings, **0** visa
  phrase hits.
- Population-B-leaning Greenhouse (Strive, Upward + 14 employers not on
  Greenhouse at all): either no physician roles, or an explicit company-wide
  denial. Strive Health's "unable to provide work visa sponsorship" was
  correctly polarized DENIED across all 44 postings — first live proof of the
  denial layer.

Conclusion: the engine mechanics (connector, physician gate, polarity, quote
gate, `--promote` safety) are verified. Greenhouse is simply the wrong watering
hole for J-1/H-1B physician density. This plan identifies where that density
actually lives and which connector to build next.

## 1. Why these employers (the visa-density logic)

A J-1 waiver (Conrad 30 / HHS / ARC / DRA / USDA) requires the physician to
serve **3 years in a designated HPSA or MUA** (Health Professional Shortage Area
/ Medically Underserved Area). H-1B physician sponsorship clusters at the same
shortage-area employers plus **cap-exempt** institutions (universities and their
affiliated nonprofits). Therefore the visa-dense employers are, in rank order of
expected J-1/H-1B physician density:

1. **Government shortage-area employers** — VA, IHS, BoP, DoD MTFs. (USAJobs.)
2. **Federally Qualified Health Centers (FQHCs)** and Look-Alikes — HRSA-funded,
   HPSA by definition. Highest non-government J-1 waiver density.
3. **Rural hospitals / Critical Access Hospitals** and rural mission systems.
4. **Academic medical centers in underserved states** — H-1B cap-exempt, sponsor
   at volume.
5. **Community behavioral-health / state psychiatric systems** — psychiatry is
   the most acute shortage; J-1 waiver psychiatrists are common.

## 2. Target employer types

| Rank | Type | Why visa-dense | Typical ATS |
|---|---|---|---|
| 1 | VA / IHS / federal | Mandate to staff shortage areas; heavy IMG/J-1/H-1B | USAJobs (gov API) |
| 2 | Large multi-site FQHCs | HPSA by charter; J-1 Conrad/HHS waivers | Workday / iCIMS / Paylocity |
| 3 | Rural & CAH mission systems | Chronic rural physician shortage | Workday (large) / iCIMS / custom |
| 4 | Academic centers, underserved states | H-1B cap-exempt sponsors | Workday / iCIMS / Taleo |
| 5 | Community behavioral health | Psychiatry shortage → J-1 | iCIMS / Paylocity / custom |
| — | HRSA Health Workforce Connector | Government index of NHSC/HPSA-site vacancies | gov site (evaluate) |

## 3. ATS landscape and detection

Detection method: fetch the employer's own careers entry, follow redirects,
inspect the final hostname and the page HTML/network XHR for the fingerprints
below. For JS-rendered landing pages, follow the "search jobs" subdomain or read
the network request the page issues.

| ATS | URL fingerprint | Access model | Provenance | Connector risk |
|---|---|---|---|---|
| Greenhouse | `boards.greenhouse.io/{token}` | no-auth public JSON API | employer-direct (T1) | **BUILT** |
| Workday | `*.myworkdayjobs.com`, `/wday/cxs/` | no-auth CXS POST endpoint, **unofficial** | employer-direct (T1 provenance) | medium — unofficial, per-tenant site, must rate-limit |
| iCIMS | `*.icims.com` | **official** Job Portal API, needs partner/API key | employer-direct (T1) | high friction — credential dependency |
| Lever | `jobs.lever.co/{token}` | no-auth `api.lever.co/v0/postings/{token}` | employer-direct (T1) | low — but low healthcare density |
| SmartRecruiters | `careers.smartrecruiters.com/{co}` | no-auth Posting API | employer-direct (T1) | low |
| Ashby | `jobs.ashbyhq.com/{token}` | public posting API | employer-direct (T1) | low |
| Taleo (Oracle) | `*.taleo.net` | no clean public API | employer-direct | high — legacy |
| Paylocity / ADP / UKG | `recruiting.paylocity.com`, `workforcenow.adp.com` | no clean public API; HTML | employer-direct | high — HTML, conflicts with no-regex doctrine |
| Custom | employer domain | varies | employer-direct | case-by-case |

Access-model vs provenance distinction (important): an employer's **own** Workday
tenant is employer-direct (Tier-1 provenance), but the CXS endpoint is an
unofficial, undocumented interface. Register such sources as Tier 1 by provenance
yet `needsVerification: true`, and build the fetch defensively (per-tenant retry,
rate-limit, schema-shape assertions) — never treat it as a contract.

## 4. Employer-direct vs commercial (guardrail)

Crawl ONLY: employer-owned domains, employer-owned ATS tenants, and government
sources (USAJobs, HRSA Connector). Provenance is verified when the ATS
tenant/token resolves to the employer's own brand and is linked from the
employer's primary-domain "Careers" page.

Never crawl (hard denylist): Indeed, LinkedIn, Glassdoor, ZipRecruiter, Monster,
CareerBuilder, Google Jobs; and physician-specific aggregators PracticeLink,
PracticeMatch, DocCafe, HealtheCareers, CompHealth, Doximity, MDsearch. These
stay in the Tier-3 registry as explicit refusals.

3RNET note: the National Rural Recruitment & Retention Network is a *nonprofit*
rural-underserved board — mission-aligned, not commercial — but it is still an
aggregation surface. Prefer following its employer-direct outbound links to the
hiring employer's own ATS rather than crawling 3RNET itself; review its ToS
before any programmatic access.

## 5. Candidate employers (verify ATS before building)

ATS marked **[verified]** were fingerprinted live on 2026-05-30; others are
to-verify (careers landing was JS-rendered and did not expose the fingerprint in
first HTML — not evidence of absence).

### A. Government / quasi-government (Tier-1 provenance; evaluate first)
1. Veterans Health Administration — USAJobs series 0602 (connector built, gated)
2. Indian Health Service — USAJobs (federal)
3. Federal BoP / DoD military treatment facilities — USAJobs
4. HRSA Health Workforce Connector (`connector.hrsa.gov`) — evaluate structured access

### B. Rural & mission health systems (large, physician-heavy)
5. Sanford Health (ND/SD/MN) — **Workday [verified]**
6. Avera Health (SD/IA/MN/NE/ND) — to verify
7. Essentia Health (MN/WI/ND) — to verify
8. Marshfield Clinic Health System (rural WI) — to verify
9. Billings Clinic (MT) — to verify
10. Ballad Health (Appalachian TN/VA) — to verify
11. Bassett Healthcare Network (rural NY) — to verify
12. Guthrie Clinic (rural NY/PA) — to verify
13. Appalachian Regional Healthcare (KY/WV) — to verify
14. Carle Health (rural IL) — to verify

### C. Academic medical centers, underserved states (H-1B cap-exempt)
15. WVU Medicine / West Virginia University (WV) — **Workday [verified]**
16. University of Mississippi Medical Center (MS) — to verify
17. University of New Mexico Health (NM) — to verify
18. University of Arkansas for Medical Sciences (AR) — to verify
19. University of South Dakota / Sanford School of Medicine (SD) — to verify

### D. Large multi-site FQHCs / community health (highest J-1 density)
20. AltaMed Health Services (CA) — **Workday [verified]**
21. Sun River Health (NY) — to verify
22. Sea Mar Community Health Centers (WA) — to verify
23. El Rio Health (AZ) — to verify
24. Unity Health Care (DC) — to verify
25. Neighborhood Healthcare (CA) — to verify

### E. Community behavioral health (psychiatry shortage)
26. Centerstone (multi-state) — to verify
27. Burrell Behavioral Health (MO/AR) — to verify

Three independent live confirmations of Workday — a rural system (Sanford), an
underserved academic center (WVU), and a large FQHC (AltaMed) — indicate a single
Workday connector would reach categories B, C, and D simultaneously.

## 6. Recommended build order

1. **USAJobs (Path A)** — the moment `USAJOBS_API_KEY` + `USAJOBS_USER_AGENT`
   are exported. Connector already built and gated; Tier-1 government; cleanest
   ground truth. No new code required.
2. **HRSA Health Workforce Connector — evaluate (read-only, ~1-2 hrs)**: does it
   expose an API or structured export of HPSA-site vacancies? If yes, it is a
   Tier-1 government source with very high visa relevance and may need no new ATS
   connector at all. Evaluate before committing to Workday.
3. **Workday connector (next BUILD candidate)** — highest-value new ATS. Confirmed
   across rural + academic-underserved + FQHC. No-auth CXS endpoint. Reuses
   `clean()` / `isPhysician()` / `extractPhraseHits()` / `classify()` unchanged —
   the only new surface is a Workday fetch + parser + fixtures + self-check. Build
   defensively: per-tenant `{tenant, datacenter, site}` registry entries, POST
   pagination, rate-limiting, Tier-1 provenance with `needsVerification: true`.
4. **iCIMS connector** — defer until a partner/API key is obtainable. Official but
   credentialed; treat like USAJobs (operator-set credential).
5. **Lever / SmartRecruiters / Ashby** — easy no-auth wins but low healthcare-
   employer density; build opportunistically only if a target employer uses one.

## 7. Hard rules (binding for this phase)

- No push, no deploy, no PR.
- No DB / schema / seed changes.
- No cron, no public route, no published jobs.
- No `--promote` (app surface stays the committed honest empty state).
- No commercial-board crawling; no LinkedIn scraping; Tier-3 aggregators stay
  refused.
- No run artifacts committed (run dir is gitignored).
- **No connector code until explicitly approved.**

## 8. Open questions for operator

1. Set USAJobs credentials now (→ run Path A immediately), or proceed to build the
   Workday connector?
2. Approve **Workday** as the next connector to build (currently plan-only)?
3. OK to spend one read-only turn evaluating HRSA Health Workforce Connector and
   3RNET access (no crawling, ToS-checked) before choosing the build?
