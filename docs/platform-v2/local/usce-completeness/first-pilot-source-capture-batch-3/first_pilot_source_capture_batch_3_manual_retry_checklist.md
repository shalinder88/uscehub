# First Pilot Source Capture Batch 3 — Manual Retry Checklist

**Date:** 2026-05-08
**Sprint:** P99-P97-FIRST-PILOT-SOURCE-CAPTURE-BATCH-3
**Operator note:** This sprint did not run from a Wayback-enabled environment. WebFetch is blocked from `web.archive.org` in the agent runtime. Manual Wayback `Save Page Now` invocations are listed below as deferred items for the curator.

---

## 1. Manatee Memorial Hospital (FL)

- **Source URL attempted:** `https://manateememorial.com/graduate-medical-education/`
- **Live access:** SUCCESS via authenticated Chrome MCP
- **What succeeded:** Read full GME page; confirmed only ACGME residencies (Internal Medicine, Family Medicine, Pharmacy) documented. No visiting medical student / observership / elective text.
- **What failed:** WebFetch returned 403 (likely WAF). Switched to Chrome MCP successfully.
- **Specific text needing curator verification:** None — the absence is itself the finding. There is no visiting-student program text to verify.
- **Screenshot status:** Inline visual review only (Chrome MCP screenshot in conversation thread); not persisted to repo.
- **Wayback status:** NOT ATTEMPTED. Web.archive.org is blocked from agent WebFetch.
- **Manual browser retry needed:** **No** — source is unambiguous about residency-only.
- **Curator decision needed:** YES — pick `KEEP_INTERNAL_FRAMEWORK_ONLY` vs `REJECT_PUBLIC` for this row.
- **What NOT to do:** Do not infer a visiting-student program from the residency page. Do not list on `/clerkships/pilot`.

## 2. University Health San Antonio (TX)

- **Source URL attempted:** `https://www.universityhealth.com/healthcare-professionals/student-placement/affiliation-agreements`
- **Live access:** SUCCESS via WebFetch
- **What succeeded:** Read affiliation policy verbatim, including disqualifying criteria.
- **What failed:** Initial `uhealthsystem.com` URL timed out — rebrand to `universityhealth.com` confirmed by following links from the system home page.
- **Specific text needing curator verification:** Direct quote captured: *"School is proprietary (for-profit), School is not physically based in Texas, Seeking to establish an agreement for one student"* listed as disqualifying attributes.
- **Screenshot status:** Not captured (text-only WebFetch response).
- **Wayback status:** NOT ATTEMPTED.
- **Manual browser retry needed:** OPTIONAL — source text is unambiguous.
- **Curator decision needed:** YES — confirm KEEP_INTERNAL for the IMG-focused micro-pilot lane (recommended). Optional: explore READY_PUBLIC_US_ONLY_TEXAS_NONPROFIT in a future US-only lane.
- **What NOT to do:** Do not represent UH SA as IMG-friendly. Do not represent it as accepting one-off student applications.

## 3. UPMC Western Psychiatric Hospital (PA)

- **Source URL attempted:**
  - Site-specific: `https://www.upmc.com/locations/hospitals/western-psychiatric/training-education/graduate-medical-education` — RESIDENCY/FELLOWSHIP only; no visiting-student section.
  - System-level domestic: `https://www.medstudentaffairs.pitt.edu/visiting-students/domestic-visiting-students` — LCME/AOA only.
  - System-level international: `https://live-researchprograms-medschool-pitt.pantheonsite.io/international-visiting-student-program` — enrolled international students in final year only, $4,500 per elective, Step 2 required for psychiatry.
- **Live access:** SUCCESS via Chrome MCP for all three.
- **What succeeded:** Captured eligibility, fee, application method, visa documentation language for both domestic and international programs.
- **What failed:**
  - First WebFetch on `upmc.com/services/behavioral-health/services/western-psychiatric-hospital` returned 404 — corrected to `/locations/hospitals/western-psychiatric`.
  - Multiple `medschool.pitt.edu/...visiting-students` direct URLs returned 404 before the canonical `/education` page revealed the correct `medstudentaffairs.pitt.edu` host.
- **Specific text needing curator verification:**
  - International program: *"This program is ONLY for international students who have completed their core clinical training and are in their final year of medical education. This program does not offer observerships/externships to medical graduates."*
  - International program fee: *"$4,500 per clinical elective"*
  - Psychiatric elective: *"The USMLE Step 2 exam (not Step 1 scores) is a requirement to apply for a Psychiatric clinical elective."*
  - Domestic program: *"LCME- or AOA- accredited home institution in North America may apply for an elective experience at the University of Pittsburgh School of Medicine through the VSLO."*
- **Screenshot status:** Inline visual review only.
- **Wayback status:** NOT ATTEMPTED. URL is `pantheonsite.io` subdomain; canonical home may move — this raises archive priority for the curator.
- **Manual browser retry needed:** YES — recommend curator manually save the international program page to Wayback before any promotion attempt; the pantheonsite preview-style URL pattern suggests the page may move when UPSOM rebuilds the international site.
- **Curator decision needed:** YES — Caribbean eligibility for the international program is silent on the source; curator must decide whether to promote with an "international students enrolled in final year only — Caribbean status check on application" caveat or KEEP_INTERNAL pending direct confirmation.
- **What NOT to do:**
  - Do not claim Western Psychiatric site-specific guarantee.
  - Do not claim observership availability for graduates.
  - Do not claim J-1 or H-1B sponsorship — only B-1/B-2 acceptance/invoice documentation is mentioned.
  - Do not claim free — international fee is $4,500 per elective.

## 4. NYC Health + Hospitals/Lincoln (NY)

- **Source URL attempted:**
  - Lincoln-specific: `https://www.nychealthandhospitals.org/locations/lincoln/` — no visiting-student program documented at the site level.
  - System-level: `https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/` — full visiting-elective program documented.
- **Live access:** SUCCESS via Chrome MCP. Accordion sections required JS click to expand for full eligibility / logistics / application text.
- **What succeeded:** Read all four accordion sections after expansion (overview / elective options / eligibility / program logistics / application).
- **What failed:** Initial `/lincoln/medical-professional-education/` 404 redirected to home page. The visiting program is system-level under `/mosaic/visiting-scholars-program/`.
- **Specific text needing curator verification:**
  - Eligibility: *"Medical students must be attending a U.S. accredited allopathic medical school (i.e., are enrolled in Medical Degree-granting programs) or osteopathic medical schools (i.e., are enrolled in Doctor of Osteopathy-granting programs)."*
  - Stipend: *"$2,000 stipend for the rotation and an additional $2,000 housing stipend for participants that are not based in the New York City metro area."*
  - Application: *"Send all application materials to MOSAIC@nychhc.org by the application deadline of April 24, 2026."*
  - Site placement: *"Each VSP participant will be matched to a NYC H+H participating site"* — Lincoln is a participating site but specific placement is not guaranteed.
  - Specialties: *"Emergency Medicine, Internal Medicine, Gastroenterology, Pediatrics, Primary Care, Psychiatry, Obstetrics & Gynecology, Ophthalmology"* + "Additional elective options available"
- **Screenshot status:** Inline visual review only.
- **Wayback status:** NOT ATTEMPTED.
- **Manual browser retry needed:** OPTIONAL — Wayback save would be helpful.
- **Curator decision needed:** YES — promote as `READY_PUBLIC_US_ONLY` with `SYSTEM_PAGE_NO_LINCOLN_SPECIFIC_GUARANTEE` caveat (mirror CCF Mercy / CC Hillcrest pattern), OR KEEP_INTERNAL.
- **What NOT to do:**
  - Do not claim Lincoln site-specific guarantee.
  - Do not claim Caribbean / IMG accessibility — source eligibility excludes both via accreditation language.
  - Do not claim VSLO application path — application is direct PDF email.

## 5. Aggregate manual-retry queue for curator

| Action | Rows |
|--------|------|
| Wayback Save Page Now | UH SA · UPMC International Visiting Student Program · MOSAIC VSP |
| Decide KEEP_INTERNAL vs REJECT_PUBLIC | Manatee · UH SA |
| Decide promotion with carveout | UPMC Western Psychiatric · Lincoln Medical |
| Confirm Caribbean eligibility direct from program email | UPMC International Visiting Student Program (MSRIS@medschool.pitt.edu) |
| Confirm site-specific Lincoln rotation availability | NYC H+H MOSAIC (MOSAIC@nychhc.org) |

All curator-direct contact is **OUT OF SCOPE for this sprint** per the sprint's no-application / no-contact-form rule. Listed only for the curator's reference in the next re-audit sprint.
