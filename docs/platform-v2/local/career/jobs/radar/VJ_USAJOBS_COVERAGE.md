# Does USAJobs Have the Physician Jobs We Want? — Coverage Reality

Date: 2026-06-10. Method: direct operator web research (the fan-out workflow hit a transient API
rate-limit; this was done with targeted searches instead). Every number tagged by source quality.

## 1. Short answer

**No — not close.** USAJobs is the federal government's hiring portal (VA, IHS, military/Defense Health,
Bureau of Prisons, USPHS). It contains **only federal employers** — no private hospitals, FQHCs, academic
medical centers, or private practices, which is where the **overwhelming majority** of J-1/H-1B physician
jobs actually are. USAJobs covers roughly **4–5% of all US physician jobs by headcount**, and an even
smaller share of the *visa-sponsoring* ones — and even that VA slice is statutory *eligibility* ("may
appoint a non-citizen"), not affirmative sponsorship. It is a clean, free, legal **starter** lane, not the
destination.

## 2. What USAJobs actually is

- The **official federal employment site**, run by OPM. ~**450,000 federal job announcements/year** across
  *all* occupations, ~22M applications [primary: OPM]. Strictly federal agencies — **no private employers**.
- Federal physician employers on it: **VHA** (largest), **IHS**, **DoD / Defense Health Agency** (350+
  military medical facilities), **Bureau of Prisons**, **USPHS Commissioned Corps**, NIH/HHS.
- Series **0602 (Medical Officer)** is the physician slice. Our own probe: ~**6,425** 0602 announcements
  in 12 months (~89% VHA), a large share later "canceled"; ~**1,000 "accepting" at a snapshot**.
- **API caveat:** even within federal, some VA Title-38 hybrid/direct-hire and USPHS Corps hiring runs
  through agency-specific portals (e.g. VAcareers) and may not fully surface in the public API. So USAJobs
  is not even a *complete* census of federal physician hiring.

## 3. The numbers — coverage in proportion

| Universe | Count | Source quality |
|---|---|---|
| Active US physicians (2024) | **~1,032,000** (866k direct patient care) | primary-gov (AAMC/AMA PPD) |
| VHA physicians (largest single federal employer) | **~14,000+** | primary (VA) |
| Federal physicians total (VA + DoD + IHS + BOP + USPHS), estimate | **~40,000–55,000 (~4–5%)** | inference |
| Live federal physician (0602) openings at a snapshot | **~1,000** | our probe + prior research |
| All federal job announcements/yr (every occupation) | ~450,000 | primary-gov (OPM) |
| J-1-waiver physicians placed/yr (mostly **non-federal**: FQHC / rural / private underserved) | **>1,000** via Conrad-30 + a smaller federal-IGA increment (~1,300–1,500 total) | primary (Conrad-30/RHIhub) + inference |
| H-1B physicians approved/yr (mostly **academic / private**, cap-exempt teaching hospitals) | **~8,500** (standing stock ~10,000) | advocacy/vendor (directional only) |
| PracticeLink / PracticeMatch physician listings | ~33,000 / ~24,000 | industry (prior research) |

**Coverage of "the jobs we want":** the visa-sponsoring physician job is overwhelmingly **non-federal** —
Conrad-30 places its >1,000/yr into HPSA/MUA private practices, FQHCs and rural hospitals (the physician
then works in **H-1B at that private facility**); cap-exempt H-1B sits at **academic/teaching hospitals**.
The federal share of visa-sponsoring physician openings is small (VA acts as an "interested government
agency" for a *minority* of J-1 waivers — states do ~90% — plus the VA non-citizen-**eligibility** lane).
**Net: USAJobs can reach on the order of ~5–10% of the visa-relevant physician jobs, and most of that is
eligibility, not advertised sponsorship.**

## 4. What USAJobs MISSES (the jobs we want that are NOT there)

- **Every private and non-profit hospital and health system**, **every FQHC/RHC**, **every academic
  medical center / teaching hospital** (the cap-exempt H-1B core), every **private group practice**, every
  **locum/staffing** posting.
- **All Conrad-30 placements** (private/underserved-area employers — the single biggest J-1-waiver channel).
- **All cap-exempt academic H-1B** roles (university-affiliated teaching hospitals).
- Even some **federal** hiring that bypasses the public API (VA Title-38 direct-hire, USPHS Corps).

## 5. What this means for the engine

- **USAJobs = the correct *first* lane, but a small one.** It is the one source with clean, free, legal,
  visa-relevant language at scale — which is why it yielded the engine's first 80 real signals. Keep it.
- **The strategic weight is non-federal.** ~90%+ of the target universe requires the harder channels we
  already scoped: rank visa-sponsoring employers from public DOL/USCIS data → **resolve each to its own
  careers page** → quote-gate; an **HRSA FQHC/rural employer registry**; the **employer-hosted-board
  resolver** (gated on the 100-job manual benchmark); a **3RNET** partnership (the one place with a real
  "J-1 eligible" tag across employer-direct rural listings).
- **Right scoreboard:** "verified visa-positive employer-origin openings," not raw listing count. On raw
  count we structurally cannot match PracticeLink/PracticeMatch (most of their 24–33k is non-visa
  private/locum reachable only by scraping, which we won't do).

## 6. Honest uncertainties

- **Federal physician total (~40–55k)** is an estimate; VHA "14,000+" varies by definition (part-time /
  fee-basis / residents can push VA alone toward ~25k). DoD active-duty physician headcount was **not**
  pinned to a primary source here (~10–12k is the working order of magnitude).
- **~8,500 H-1B physicians/yr** traces to AHA advocacy, not a primary USCIS table — treat as directional.
- **J-1 total ~1,300–1,500/yr** is Conrad-30 (>1,000, primary) plus an inferred federal-IGA increment; no
  single current source publishes an all-program sum.
- **~1,000 live federal 0602 openings** is a snapshot order-of-magnitude from our own probe + prior research.

## Appendix: cited sources

- US active physicians 2024 (~1,032,365): AAMC Physician Workforce Data Dashboard / 2025 Key Findings —
  `https://www.aamc.org/data-reports/data/2025-key-findings`
- VHA ~14,000+ physicians / VA workforce: `https://www.va.gov/health/ourdoctors.asp` ·
  `https://en.wikipedia.org/wiki/Veterans_Health_Administration`
- USAJobs = federal-only, ~450k announcements/yr (OPM): `https://www.usajobs.gov/` ·
  `https://www.opm.gov/services-for-agencies/talent-systems/usajobs/`
- Conrad-30 (>1,000 IMG physicians/yr; HPSA/MUA/MUP; FQHC/rural; H-1B status):
  `https://www.ruralhealthinfo.org/topics/j-1-visa-waiver` ·
  `https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/conrad-30-waiver-program`
- H-1B cap-exemption for academic/teaching hospitals: AMA `https://www.ama-assn.org/about/leadership/exempting-physicians-h-1b-visa-fee-protects-patients`
- IHS workforce + vacancy: `https://www.ihs.gov/careeropps/` · AMA `https://www.ama-assn.org/practice-management/sustainability/indian-health-service-must-act-lower-staff-physician-vacancies`
- DoD/DHA (350+ facilities): `https://careers.jamanetwork.com/employer/.../defense-health-agency-dha-`
