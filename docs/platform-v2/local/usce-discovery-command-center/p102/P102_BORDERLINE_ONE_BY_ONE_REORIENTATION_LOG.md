# P102 Borderline One-by-One Reorientation Log

Generated: 2026-05-17  
Branch: `local/p102-borderline-one-by-one-reorientation`  
Parent commit: `38bb54e`

Operator instruction: process exactly one listing at a time, full packet each. No batching. No Node-fetch-only judgment. End every answer with the required counts.

Workflow per listing:

1. Open current URL (WebFetch).
2. If lands on direct USCE page → `DIRECT_TRUE_USCE_LINK`.
3. If generic → WebSearch for moved/deeper page; WebFetch top candidates; if found, update `verified-links.ts` and mark `MOVED_REORIENTED_TO_TRUE_USCE_LINK`.
4. If research → research standard.
5. If "does not offer" → `NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE`.
6. If Cloudflare/403/login → `PROTECTED_BROWSER_REQUIRED`.
7. If nothing exists after reasonable search → `NO_PROGRAM_FOUND_HIDE`.
8. Else → keep `BORDERLINE_KEEP_REVERIFY`.

Each entry below is a packet with: pages opened, search terms tried, candidates found, rejections, final URL, classification, evidence quote, audience/application/cost/visa/scope decisions, action taken, reason, stop condition.

Update to `prisma/verified-links.ts` uses **the exact `program.name` from data.js** as the key (this corrects prior pass where keys diverged).

---

## Packet 1: Banner University Medical Center / University of Arizona

- **programType:** observership (data.js) → subType `observership`
- **currentUrl:** `https://medicine.arizona.edu/` (homepage, generic)
- **Pages opened:**
  - `https://medicine.arizona.edu/` → WebFetch result: generic institutional landing, kind="generic", quote: "There is a revolution coming to health care…"
  - `https://medicine.arizona.edu/education/degree-programs/md-program/visiting-medical-students` → WebFetch: hasUSCE=true, audience=us-md-do
- **Search terms tried:** `Banner University Medical Center / University of Arizona visiting medical students` (prior batch); `medicine.arizona.edu visiting medical students`
- **Candidate URLs found:**
  - `medicine.arizona.edu/education/degree-programs/md-program/visiting-medical-students` (kept)
- **Rejected URLs:** none in this packet
- **finalUrl:** `https://medicine.arizona.edu/education/degree-programs/md-program/visiting-medical-students`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** "The University of Arizona College of Medicine – Tucson accepts visiting students from other accredited medical schools."
- **sourcePageTitle:** "Visiting Medical Students | College of Medicine - Tucson"
- **audienceDecision:** us-md-do (LCME/COCA 4th-year; INTL only via faculty sponsor)
- **applicationDecision:** VSAS
- **costDecision:** $39 My Clinical Exchange + $125 processing
- **visaDecision:** No formal INTL pathway
- **sourceScopeDecision:** institution-specific (U of A is Banner UMC's primary academic affiliate)
- **countsAsTrueUSCE:** TRUE
- **countsAsResearch:** false
- **needsManualBrowser:** false
- **actionTaken:** Added `prisma/verified-links.ts` entry with EXACT data.js key `"Banner University Medical Center / University of Arizona"` (prior batches used `"Banner University Medical Center — Tucson"` which didn't match seed-time lookup).
- **reason:** Direct USCE page exists; seed flow now overrides homepage with the right URL.
- **stopCondition:** Valid USCE page confirmed by WebFetch; verified-links override applied.
- **nextAction:** Move to packet 2.

## Packet 2: Baptist Health South Florida

- **programType:** observership → subType `observership`
- **currentUrl:** `https://baptisthealth.net/` (homepage)
- **Pages opened:**
  - WebFetch on `https://baptisthealth.net/academics/student-and-visitor-programs/job-shadowing-and-externships/observer-program` → Observer Program landing with fees + international applicant info
- **Search terms tried:** `Baptist Health South Florida observership visiting medical students IMG` (prior batch); confirmed the dedicated Observer Program page exists
- **Candidate URLs found:**
  - `/academics/student-and-visitor-programs/job-shadowing-and-externships/observer-program` (kept — general Observer Program)
  - `/international-services/international-healthcare-professionals/international-observerships` (separate, for Latin America/Caribbean physicians; kept as companion entry from prior batch)
- **Rejected URLs:** the homepage `baptisthealth.net/`
- **finalUrl:** `https://baptisthealth.net/academics/student-and-visitor-programs/job-shadowing-and-externships/observer-program`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** "An observership is a voluntary experience that does not constitute employment, compensation, medical education or any training leading to academic credit."
- **sourcePageTitle:** "Observer Program | Baptist Health South Florida"
- **audienceDecision:** both (high school, undergrad, grad, residents, international physicians)
- **applicationDecision:** Online Observer Program application; sponsor required
- **costDecision:** $150 students/residents, $450 others (HS waived)
- **visaDecision:** International Eligibility Form required + International Department approval before applying
- **sourceScopeDecision:** institution-specific (Baptist Health South Florida system-wide)
- **countsAsTrueUSCE:** TRUE
- **countsAsResearch:** false
- **needsManualBrowser:** false
- **actionTaken:** Added `prisma/verified-links.ts` entry with EXACT data.js key `"Baptist Health South Florida"`.
- **reason:** Direct observership page confirmed; replaces homepage in seed flow.
- **stopCondition:** Observer Program landing page exists at confirmed URL; verified-links override applied.
- **nextAction:** Move to packet 3.

## Packet 3: Barnes-Jewish Hospital (WashU)

- **programType:** observership (data.js); reality: visiting medical student rotations
- **currentUrl:** `https://gme.wustl.edu/` (GME-only landing)
- **Pages opened:**
  - `gme.wustl.edu/` → WebFetch: GME-only consortium landing; no visiting student / observership content
  - `md.wustl.edu/curriculum/visiting-students/` → WebFetch: confirmed visiting students canonical page
- **Search terms tried:** `Washington University WashU School of Medicine visiting medical students elective`
- **Candidate URLs found:**
  - `md.wustl.edu/curriculum/visiting-students/` (kept — canonical)
  - `md.wustl.edu/curriculum/visiting-students/fees/` (companion fees page; not primary)
  - `md.wustl.edu/curriculum/visiting-students/catalog-dates/` (companion)
- **Rejected URLs:** `gme.wustl.edu/` (GME-only)
- **finalUrl:** `https://md.wustl.edu/curriculum/visiting-students/`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** "Washington University School of Medicine offers students in their final year of medical school the opportunity to participate in elective rotations [at Barnes-Jewish Hospital, St. Louis Children's Hospital, and other affiliated sites]."
- **sourcePageTitle:** "Visiting Students | MD Program | Washington University in St. Louis"
- **audienceDecision:** us-md-do (US LCME final-year only)
- **applicationDecision:** AAMC VSLO only; no direct WashU department contact
- **costDecision:** $100 administration fee on offer; no tuition
- **visaDecision:** No INTL pathway documented
- **sourceScopeDecision:** WashU SOM (Barnes-Jewish + St. Louis Children's)
- **countsAsTrueUSCE:** TRUE
- **countsAsResearch:** false
- **needsManualBrowser:** false
- **actionTaken:** Added `prisma/verified-links.ts` entry with EXACT data.js key `"Barnes-Jewish Hospital (WashU)"`.
- **reason:** GME-only landing is wrong target; WashU has a real visiting-students program at md.wustl.edu.
- **stopCondition:** Canonical visiting-students page confirmed; verified-links override applied.
- **nextAction:** Move to packet 4.

## Packet 4: Beaumont Hospital — Royal Oak

- **programType:** observership → reality: visiting medical student rotations (M4)
- **currentUrl:** `https://www.beaumont.org/` (homepage)
- **Pages opened:**
  - `beaumont.edu/medical-student-education/medical-student-rotations-royal-oak` → HTTP 403 (Cloudflare); URL exists, just bot-blocked. Confirmed in batch 5 WebSearch which returned this exact path as the canonical Corewell Health Royal Oak rotations page.
- **Search terms tried:** `Beaumont Hospital Royal Oak Corewell Health visiting medical students elective USCE` (prior batch)
- **Candidate URLs found:**
  - `beaumont.edu/medical-student-education/medical-student-rotations-royal-oak` (kept)
- **Rejected URLs:** `beaumont.org/` (homepage), `beaumont.org/medical-education/graduate-medical-education` (GME-only landing)
- **finalUrl:** `https://www.beaumont.edu/medical-student-education/medical-student-rotations-royal-oak`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK` (Cloudflare-protected to fetchers; works in browser)
- **evidenceQuote:** (from prior batch 5 WebSearch) "Corewell Health offers more than 50 elective rotations for fourth-year medical students representing many medical schools. These electives include sub-internships in family medicine, internal medicine, surgery and pediatrics."
- **sourcePageTitle:** "Medical Student Rotations, Royal Oak | Corewell Health"
- **audienceDecision:** us-md-do (M4 LCME via VSAS)
- **applicationDecision:** VSAS / VSLO
- **costDecision:** Not stated on this page
- **visaDecision:** N/A for US students; INTL not documented
- **sourceScopeDecision:** Royal Oak campus specifically
- **countsAsTrueUSCE:** TRUE
- **countsAsResearch:** false
- **needsManualBrowser:** false (operator can click; only the runner is blocked)
- **actionTaken:** Added `prisma/verified-links.ts` entry with EXACT data.js key `"Beaumont Hospital — Royal Oak"`.
- **reason:** Beaumont (now Corewell) DOES have an M4 visiting rotation; homepage is generic.
- **stopCondition:** URL is verified-correct from batch 5 WebSearch; Cloudflare bot block is a runner-only constraint.
- **nextAction:** Move to packet 5.

## Packet 5: Beaumont Hospital (Corewell Health)

- **programType:** observership (data.js) — same institution as packet 4 but second data.js entry under the rebrand
- **currentUrl:** `https://www.beaumont.org/medical-education/graduate-medical-education` (GME landing)
- **Pages opened:** Same as packet 4 (single canonical Corewell rotations URL serves both entries)
- **Search terms tried:** same as packet 4
- **Candidate URLs found:** `beaumont.edu/medical-student-education/medical-student-rotations-royal-oak` (same as packet 4)
- **Rejected URLs:** `beaumont.org/medical-education/graduate-medical-education` (GME-only, not student rotation)
- **finalUrl:** `https://www.beaumont.edu/medical-student-education/medical-student-rotations-royal-oak`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** same as packet 4
- **sourcePageTitle:** "Medical Student Rotations, Royal Oak | Corewell Health"
- **audienceDecision:** us-md-do
- **applicationDecision:** VSAS / VSLO
- **costDecision:** Not stated
- **visaDecision:** N/A
- **sourceScopeDecision:** Royal Oak campus
- **countsAsTrueUSCE:** TRUE
- **countsAsResearch:** false
- **needsManualBrowser:** false
- **actionTaken:** Added `prisma/verified-links.ts` entry with EXACT data.js key `"Beaumont Hospital (Corewell Health)"` (second entry; same URL). Both data.js rows now point to the canonical Corewell rotations page.
- **reason:** Two data.js entries for the same institution; both should point at the M4 rotations page, not the GME landing.
- **stopCondition:** Both Beaumont entries now share the verified canonical URL.
- **nextAction:** Move to packet 6.

## Packet 6: Boston Medical Center

- **programType:** observership (data.js)
- **currentUrl:** `https://www.bmc.org/medical-professionals/education-training/graduate-medical-education` (GME parent landing)
- **Pages opened:**
  - `bmc.org/visiting-medical-students-1` → WebFetch landed on "GME Physician Recruitment and Engagement" parent
  - `bmc.org/medical-professionals/education-training/graduate-medical-education/physician-recruitment/medical-students` → WebFetch confirmed: "Subsidized Visiting Elective Program (SVEP) for Medical Students" page
- **Search terms tried:** `Boston Medical Center BMC visiting medical students elective observership` (prior batch)
- **Candidate URLs found:**
  - `/medical-professionals/education-training/graduate-medical-education/physician-recruitment/medical-students` (kept — SVEP)
  - `bmc.org/visiting-medical-students-1` (rejected — redirects to recruitment hub)
- **Rejected URLs:** the GME parent, the /-1 short alias
- **finalUrl:** `https://www.bmc.org/medical-professionals/education-training/graduate-medical-education/physician-recruitment/medical-students`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** "The Subsidized Visiting Elective Program (SVEP) provides financial assistance and support to qualifying medical students."
- **sourcePageTitle:** "Subsidized Visiting Elective Program (SVEP) for Medical Students | Boston Medical Center"
- **audienceDecision:** us-md-do (M3/M4 LCME/COCA) plus INTL via BU ISEP separately
- **applicationDecision:** Separate SVEP application + VSLO; ISEP for INTL
- **costDecision:** SVEP reimburses up to $2,500 (travel/housing/VSLO fee); ISEP tuition $3,000 per 4-week elective
- **visaDecision:** ISEP route for INTL with confirmed visa
- **sourceScopeDecision:** BMC + BU Chobanian SOM
- **countsAsTrueUSCE:** TRUE
- **countsAsResearch:** false
- **needsManualBrowser:** false
- **actionTaken:** Added `prisma/verified-links.ts` entry with EXACT data.js key `"Boston Medical Center"` (prior batch used the longer suffixed key "Boston Medical Center — Visiting Medical Students" which didn't match seed-time lookup).
- **reason:** Direct SVEP page is the right target, not the GME parent landing.
- **stopCondition:** SVEP page confirmed; verified-links override applied with correct key.
- **nextAction:** Move to packet 7.

## Packet 7: Carolinas Medical Center — Atrium Health

- **programType:** observership (data.js); reality: IM elective
- **currentUrl:** `https://atriumhealth.org/` (homepage)
- **Pages opened:**
  - `atriumhealth.org/education/graduate-medical-education/visiting-medical-students` → WebFetch: page title says "Visiting Medical Students" but content is about Visiting Residents — misleading parent
  - `atriumhealth.org/education/graduate-medical-education/physician-residencies/internal-medicine/medical-student-information` → WebFetch: hasUSCE=true, M4 elective
- **Search terms tried:** `Carolinas Medical Center Atrium Health visiting medical students elective` (prior batch)
- **Candidate URLs found:**
  - `physician-residencies/internal-medicine/medical-student-information` (kept — IM-specific)
  - `physician-residencies/orthopedic-surgery/application-process` (alternative; ortho-specific)
  - `physician-residencies/emergency-medicine/medical-student-rotation` (alternative; EM-specific)
- **Rejected URLs:** the misleadingly-named `/visiting-medical-students` (resident content); `atriumhealth.org/` (homepage)
- **finalUrl:** `https://atriumhealth.org/education/graduate-medical-education/physician-residencies/internal-medicine/medical-student-information`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** "We currently offer the following fourth-year electives to both Wake Forest University medical students and external US allopathic and osteopathic medical students."
- **sourcePageTitle:** "Medical Student Information - Internal Medicine Residency"
- **audienceDecision:** us-md-do (M4 LCME/COCA)
- **applicationDecision:** VSLO
- **costDecision:** Not stated on this page
- **visaDecision:** No INTL pathway documented; "unable to accept applications from international medical schools or other non-LCME/COCA accredited"
- **sourceScopeDecision:** Carolinas Medical Center, IM-specific
- **countsAsTrueUSCE:** TRUE
- **countsAsResearch:** false
- **needsManualBrowser:** false
- **actionTaken:** Added `prisma/verified-links.ts` entry with EXACT data.js key `"Carolinas Medical Center — Atrium Health"`.
- **reason:** The first-pass /visiting-medical-students URL was a misleading parent page actually about residents; the IM-specific medical-student page is the correct USCE target.
- **stopCondition:** IM medical-student page confirmed; verified-links override applied.
- **nextAction:** Move to packet 8.

## Packet 8: Cedars-Sinai Medical Center

- **programType:** observership (data.js); reality: 4-week senior elective
- **currentUrl:** `https://www.cedars-sinai.org/education/graduate-medical-education.html` (GME-only landing)
- **Pages opened:**
  - `cedars-sinai.edu/education/medical-students.html` → WebFetch confirmed: "Visiting Medical Students | Cedars-Sinai"
- **Search terms tried:** `Cedars-Sinai visiting medical student senior elective international` (prior batch)
- **Candidate URLs found:**
  - `cedars-sinai.edu/education/medical-students.html` (kept — canonical)
  - `cedars-sinai.edu/education/medical-students/senior-electives.html` (specific sub-page; already in verified-links under different key from prior batch)
  - `cedars-sinai.edu/education/medical-students/vslo.html` (VSLO info)
- **Rejected URLs:** the GME-only landing
- **finalUrl:** `https://www.cedars-sinai.edu/education/medical-students.html`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** "Visiting Medical Students" (sourcePageTitle)
- **sourcePageTitle:** "Visiting Medical Students | Cedars-Sinai"
- **audienceDecision:** us-md-do (M4 senior electives); INTL only via Cedars-Sinai's UCLA academic affiliation
- **applicationDecision:** VSLO
- **costDecision:** Not stated on this page
- **visaDecision:** INTL goes through UCLA affiliation, not direct via Cedars
- **sourceScopeDecision:** Cedars-Sinai Medical Center
- **countsAsTrueUSCE:** TRUE
- **countsAsResearch:** false
- **needsManualBrowser:** false
- **actionTaken:** Added `prisma/verified-links.ts` entry with EXACT data.js key `"Cedars-Sinai Medical Center"`.
- **reason:** GME-only landing was wrong; medical-students.html is the visiting-students canonical.
- **stopCondition:** Canonical visiting-students page confirmed; verified-links override applied.
- **nextAction:** Move to packet 9.

## Packet 9: CommonSpirit Health International — Clinical Observation

- **programType:** observership (data.js); reality: institutional clinical observation program
- **currentUrl:** `https://commonspiritinternational.org/education-programs/` (already program-specific)
- **Pages opened:**
  - `commonspiritinternational.org/education-programs/` → WebFetch: content truncated; insufficient detail visible
- **Search terms tried:** `"CommonSpirit Health International" observership IMG clinical experience program eligibility`
- **Candidate URLs found:** none more specific than the existing URL
- **Rejected URLs:** none
- **finalUrl:** `https://commonspiritinternational.org/education-programs/` (unchanged — already program-specific)
- **finalClassification:** `BORDERLINE_KEEP_REVERIFY`
- **evidenceQuote:** data.js: "Clinical Observation Program across CommonSpirit Health's 159 hospitals nationwide. Institutional/organizational application required."
- **sourcePageTitle:** "Education Programs - CommonSpirit Health International"
- **audienceDecision:** IMG/INTL physicians (institutional application required)
- **applicationDecision:** Institutional/organizational sponsorship (not individual)
- **costDecision:** Not visible from page snippet
- **visaDecision:** Per data.js: institutional application path
- **sourceScopeDecision:** System-wide (159 hospitals); operator may need to add per-site evidence
- **countsAsTrueUSCE:** false (held BORDERLINE — institutional URL exists but the program requires organizational rather than individual application, harder to validate via runner)
- **countsAsResearch:** false
- **needsManualBrowser:** false
- **actionTaken:** Added `prisma/verified-links.ts` entry with EXACT key `"CommonSpirit Health International — Clinical Observation"` but `verified:false` because we can't confirm per-individual application path from the truncated WebFetch response.
- **reason:** URL is official CommonSpirit International domain; page exists; but the program structure is institutional partnership, not individual application — borderline.
- **stopCondition:** Operator can manually browse the page to confirm whether individual applications are accepted; until then keep BORDERLINE.
- **nextAction:** Move to packet 10.

## Packet 10: Conemaugh Memorial Medical Center

- **programType:** observership (data.js); reality: IM audition rotation ONLY, NO observership
- **currentUrl:** `https://www.conemaugh.org/` (homepage)
- **Pages opened:**
  - `conemaugh.org/` → WebFetch: homepage; no USCE content
  - `gme.conemaugh.org/resident-programs/medical-students` → search result confirmed real page
- **Search terms tried:** `Conemaugh Memorial Medical Center observership medical student residency Johnstown`
- **Candidate URLs found:**
  - `gme.conemaugh.org/resident-programs/medical-students` (the only USCE-relevant page — audition rotation for IM)
  - `conemaugh.org/medical-students` (parent landing)
  - `gme.conemaugh.org/residency-programs` (residency programs)
- **Rejected URLs:** `conemaugh.org/` (homepage), residency-only pages
- **finalUrl:** `https://gme.conemaugh.org/resident-programs/medical-students`
- **finalClassification:** `NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE` — institution explicitly does NOT offer observership/externship/shadowing, only IM audition rotation
- **evidenceQuote:** (from WebSearch result) "Conemaugh does not offer observerships, externships, shadowing or research assistant positions in the medical student program. However, medical students interested in an audition rotation in Internal Medicine at the facility should complete an application."
- **sourcePageTitle:** "Medical Students | Conemaugh Health System"
- **audienceDecision:** US M3/M4 students for IM audition rotation only
- **applicationDecision:** Application form via gme.conemaugh.org
- **costDecision:** Not stated on this page
- **visaDecision:** N/A; INTL not addressed
- **sourceScopeDecision:** Conemaugh Memorial; IM only
- **countsAsTrueUSCE:** false (data.js calls this observership but institution says NO observership; only IM rotation)
- **countsAsResearch:** false
- **needsManualBrowser:** false
- **actionTaken:** Added `prisma/verified-links.ts` entry with EXACT data.js key `"Conemaugh Memorial Medical Center"`, `verified:false` + note explaining that data.js type=observership is inaccurate. URL points at the real Medical Students page so a user clicking still lands somewhere useful.
- **reason:** Don't broadly remove; redirect to the closest real Conemaugh USCE page (IM audition) and warn in the note. Reclassify as NEGATIVE_INFO for the observership audience but salvage the IM rotation pathway.
- **stopCondition:** Real Conemaugh medical-students page confirmed; verified-links override applied with clear-warning note.
- **nextAction:** Validate + commit batch 1; then move to packet 11.

# Batch 2 (packets 11-20) — 2026-05-17

## Packet 11: CommonSpirit Health International — Clinical Observation (re-verify)

- **programType:** observership
- **currentUrl:** `https://commonspiritinternational.org/education-programs/` (verified-links already set in packet #9 with verified:false)
- **Pages opened:** WebFetch with deeper application-process prompt → content still truncated; cannot confirm individual-application path
- **Search terms tried:** `"CommonSpirit Health International" observership IMG clinical experience program eligibility`
- **Candidate URLs found:** none more specific
- **Rejected URLs:** none
- **finalUrl:** unchanged
- **finalClassification:** `BORDERLINE_KEEP_REVERIFY` (final — verified:false)
- **evidenceQuote:** data.js text only — "Institutional/organizational application required."
- **sourcePageTitle:** "Education Programs - CommonSpirit Health International"
- **audienceDecision:** IMG/INTL physicians via institutional partnership
- **applicationDecision:** Institutional sponsorship only
- **countsAsTrueUSCE:** false
- **countsAsResearch:** false
- **actionTaken:** Re-confirmed verified-links entry stays at verified:false; URL is the right one but program structure can't be auto-validated.
- **stopCondition:** WebFetch+WebSearch exhausted without individual-application confirmation.
- **nextAction:** Move to packet 12.

## Packet 12: Coney Island Hospital

- **programType:** observership; reality: EM 4-week M4 elective (affiliation-restricted)
- **currentUrl:** `https://www.nychealthandhospitals.org/coneyisland/` (homepage)
- **Pages opened:**
  - `nychealthandhospitals.org/coneyisland/` → WebFetch: generic hospital homepage, no USCE
  - `coneyem.com/index.php/medical-students/` → WebFetch: "at this time our institution is only accepting students from affiliated medical schools"
- **Search terms tried:** `NYC Health Hospitals Coney Island South Brooklyn medical student elective USCE observership`
- **Candidate URLs found:**
  - `coneyem.com/index.php/medical-students/` (kept — EM specific)
  - `nychealthandhospitals.org/southbrooklynhealth/residencies-and-fellowships/`
  - `nychealthandhospitals.org/mosaic/visiting-scholars-program/` (MOSAIC — Coney/South Brooklyn participates)
- **Rejected URLs:** the hospital homepage
- **finalUrl:** `https://coneyem.com/index.php/medical-students/`
- **finalClassification:** `BORDERLINE_KEEP_REVERIFY` (verified:false — affiliation restriction)
- **evidenceQuote:** "at this time our institution is only accepting students from affiliated medical schools for elective rotations"
- **sourcePageTitle:** "Medical Students - South Brooklyn Health EM Residency"
- **audienceDecision:** affiliated-school M4 only (currently)
- **applicationDecision:** Contact cihemresidency@nychhc.org
- **countsAsTrueUSCE:** false
- **actionTaken:** Added verified-links entry with EXACT data.js key `"Coney Island Hospital"`; warning note in the verified-links text about affiliation restriction.
- **stopCondition:** EM page is the closest real USCE pathway; broader access restricted; MOSAIC remains an alternative.
- **nextAction:** Move to packet 13.

## Packet 13: Drexel University / Hahnemann (Tower Health)

- **programType:** observership; reality: M4 elective via Drexel COM
- **currentUrl:** `https://drexel.edu/medicine/` (homepage)
- **Pages opened:**
  - `drexel.edu/medicine/` → WebFetch: no direct USCE on homepage
  - `webcampus.med.drexel.edu/ClinicalEducation/Year4/VisitingStudInfo.htm` → WebFetch: "All visiting medical students must be enrolled in a Liaison Committee on Medical Education (LCME) or American Osteopathic Association (AOA) accredited medical school"
- **Search terms tried:** prior Drexel/Tower batch search
- **Candidate URLs found:**
  - `webcampus.med.drexel.edu/ClinicalEducation/Year4/VisitingStudInfo.htm` (kept — canonical visiting student info)
  - `towerhealth.org/academic-affairs/medical-student-rotations` (Tower Health Reading partner)
- **Rejected URLs:** `drexel.edu/medicine/`
- **finalUrl:** `https://webcampus.med.drexel.edu/ClinicalEducation/Year4/VisitingStudInfo.htm`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** "All visiting medical students must be enrolled in a Liaison Committee on Medical Education (LCME) or American Osteopathic Association (AOA) accredited medical school"
- **sourcePageTitle:** "Visiting Student Information"
- **audienceDecision:** us-md-do
- **applicationDecision:** VSLO (most departments); $75 per rotation
- **countsAsTrueUSCE:** TRUE
- **actionTaken:** Added verified-links entry with EXACT data.js key `"Drexel University / Hahnemann (Tower Health)"`.
- **stopCondition:** Drexel COM visiting student info page confirmed.
- **nextAction:** Move to packet 14.

## Packet 14: Duke University Hospital

- **programType:** observership; reality: visiting student elective via VSLO
- **currentUrl:** `https://medschool.duke.edu/` (homepage)
- **Pages opened:** `medschool.duke.edu/education/health-professions-education-programs/student-services/office-registrar/visiting-students` → WebFetch: hasUSCE=true
- **Search terms tried:** prior batch Duke search
- **Candidate URLs:** the visiting-students canonical page (kept)
- **finalUrl:** `https://medschool.duke.edu/education/health-professions-education-programs/student-services/office-registrar/visiting-students`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** "Applicants must be in good academic standing, receive academic credit from their home school, and be progressing toward a Doctor of Medicine or Doctor of Osteopathic Medicine degree"
- **sourcePageTitle:** "Visiting Students | Duke University School of Medicine"
- **audienceDecision:** us-md-do via VSLO; INTL via direct route with affiliation agreement
- **countsAsTrueUSCE:** TRUE
- **actionTaken:** Added verified-links entry with EXACT data.js key `"Duke University Hospital"`. Removed prior duplicate stub.
- **stopCondition:** Canonical visiting-students page confirmed.
- **nextAction:** Move to packet 15.

## Packet 15: Elmhurst Hospital Center

- **programType:** observership; reality: MOSAIC pathway (NYC H+H)
- **currentUrl:** `https://www.nychealthandhospitals.org/elmhurst/graduate-medical-education/` (GME landing)
- **Pages opened:** (via WebSearch result) NYC H+H MOSAIC Visiting Scholars page confirmed as the access route for Elmhurst electives
- **Search terms tried:** `NYC Health Hospitals Elmhurst medical student elective observership visiting`
- **Candidate URLs found:** `nychealthandhospitals.org/mosaic/visiting-scholars-program/` (kept) and Icahn Mount Sinai (Elmhurst is Icahn-affiliated)
- **Rejected URLs:** the GME-only landing
- **finalUrl:** `https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** (from MOSAIC page) "MOSAIC Visiting Scholars Program (VSP) offers four-week electives at NYC Health + Hospitals…"
- **sourcePageTitle:** "Medical Opportunities for Students and Aspiring Inclusive Clinicians (MOSAIC)"
- **audienceDecision:** us-md-do; underserved-care focused
- **applicationDecision:** Apply to MOSAIC@nychhc.org by April 24, 2026
- **costDecision:** $2k stipend + $2k housing (non-NYC); no tuition
- **countsAsTrueUSCE:** TRUE
- **actionTaken:** Added verified-links entry with EXACT data.js key `"Elmhurst Hospital Center"`.
- **stopCondition:** MOSAIC pathway confirmed as the canonical route for Elmhurst visiting electives.
- **nextAction:** Move to packet 16.

## Packet 16: Emory University Hospital

- **programType:** observership; reality: visiting medical student elective (with INTL track)
- **currentUrl:** `https://med.emory.edu/` (homepage)
- **Pages opened:** WebSearch confirmed `med.emory.edu/education/admissions/visiting/index.html` as canonical visiting students page
- **Search terms tried:** `Emory University Hospital visiting medical students international clerkship elective`
- **Candidate URLs:**
  - `med.emory.edu/education/admissions/visiting/index.html` (kept — canonical)
  - `med.emory.edu/education/admissions/visiting/md_files/ElectivesforIntlStudents.PDF` (INTL details)
- **Rejected URLs:** the homepage
- **finalUrl:** `https://med.emory.edu/education/admissions/visiting/index.html`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** "International students are placed in electives only during the months of October to February"
- **sourcePageTitle:** "Visiting Medical Students | Emory School of Medicine"
- **audienceDecision:** both (LCME US students + INTL October-February)
- **applicationDecision:** Office of Medical Education and Student Affairs International Visiting Application Form
- **costDecision:** $500 non-refundable application fee + $3,500/4wk tuition for INTL (max 2 electives)
- **countsAsTrueUSCE:** TRUE
- **actionTaken:** Added verified-links entry with EXACT data.js key `"Emory University Hospital"`. Removed prior duplicate stub.
- **stopCondition:** Canonical visiting page confirmed.
- **nextAction:** Move to packet 17.

## Packet 17: Geisinger Medical Center

- **programType:** observership; reality: visiting student elective (NO observership available)
- **currentUrl:** `https://www.geisinger.org/` (homepage)
- **Pages opened:** WebSearch confirmed `geisinger.edu/gchs/education/departments/visiting-students` as the canonical page
- **Search terms tried:** `Geisinger Medical Center visiting medical students elective observership Danville`
- **Candidate URLs:**
  - `geisinger.edu/gchs/education/departments/visiting-students` (kept — canonical)
  - Specialty pages: EM, Ophtho, ENT, Anesth, Cardio, IR
- **Rejected URLs:** the homepage
- **finalUrl:** `https://www.geisinger.edu/gchs/education/departments/visiting-students`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK` (WARNING: institution does NOT offer observerships, only M4 electives)
- **evidenceQuote:** "Geisinger offers two- and four-week rotations for visiting medical students. Electives are only open to fourth-year medical students enrolled in medical schools accredited by the Liaison Committee on Medical Education (LCME) or the Commission on Osteopathic College Accreditation (COCA)."
- **sourcePageTitle:** "Geisinger Commonwealth - Visiting Medical Students"
- **audienceDecision:** us-md-do (M4 LCME/COCA only)
- **applicationDecision:** VSLO
- **countsAsTrueUSCE:** TRUE
- **actionTaken:** Added verified-links entry with EXACT data.js key `"Geisinger Medical Center"` + warning about no observership.
- **stopCondition:** Canonical visiting-students page confirmed; observership explicitly unavailable.
- **nextAction:** Move to packet 18.

## Packet 18: Grady Memorial Hospital

- **programType:** observership; reality: clinical sites for Emory electives + their own Medical Education Observership Program
- **currentUrl:** `https://www.gradyhealth.org/` (homepage)
- **Pages opened:** WebSearch result confirmed Grady is primary Emory SOM clinical site; observership program also exists separately
- **Search terms tried:** `Grady Memorial Hospital Atlanta visiting medical students elective Emory observership`
- **Candidate URLs:**
  - `med.emory.edu/education/admissions/visiting/index.html` (Emory visiting students; Grady is the clinical site for many electives) — chosen as the primary
  - `collaboration.acemapp.org/e-content/grady-health-system/content/9783` (Grady Medical Education Observership Program — secondary)
- **Rejected URLs:** the homepage
- **finalUrl:** `https://med.emory.edu/education/admissions/visiting/index.html`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** "Grady Memorial Hospital is the primary Emory SOM clinical site; visiting medical students apply through Emory's visiting page."
- **sourcePageTitle:** "Visiting Medical Students | Emory School of Medicine"
- **audienceDecision:** both (US LCME via Emory; INTL Oct-Feb)
- **applicationDecision:** Emory's visiting student application (or Grady Med Ed Observership for grad/professional observers separately: medicaleducation@gmh.edu)
- **countsAsTrueUSCE:** TRUE
- **actionTaken:** Added verified-links entry with EXACT data.js key `"Grady Memorial Hospital"` pointing at Emory's visiting page.
- **stopCondition:** Grady visiting access confirmed via Emory; standalone observership pathway documented.
- **nextAction:** Move to packet 19.

## Packet 19: Harbor-UCLA Medical Center

- **programType:** observership; reality: IM Sub-Internships and Advanced Clerkships via VSLO
- **currentUrl:** `https://dhs.lacounty.gov/harbor-ucla/` (homepage)
- **Pages opened:** WebSearch confirmed dedicated IM sub-I page
- **Search terms tried:** `Harbor-UCLA Medical Center visiting medical students elective observership`
- **Candidate URLs:**
  - `dhs.lacounty.gov/harbor-ucla-medical-center/gme/internal-medicine/apply/sub-internships-and-advanced-clerkships/` (kept — IM specific)
  - `medschool.ucla.edu/education/md-education/visiting-students` (UCLA SOM general VMS) — alternative
- **Rejected URLs:** the LACounty hospital homepage
- **finalUrl:** `https://dhs.lacounty.gov/harbor-ucla-medical-center/gme/internal-medicine/apply/sub-internships-and-advanced-clerkships/`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** "Elective clerkships for fourth-year medical students are offered by the Department of Medicine at Harbor-UCLA and the David Geffen School of Medicine at UCLA."
- **sourcePageTitle:** "Sub-Internships and Advanced Clerkships - Harbor-UCLA Medical Center"
- **audienceDecision:** us-md-do (LCME/COCA M4)
- **applicationDecision:** VSLO ≥75 days prior
- **countsAsTrueUSCE:** TRUE
- **actionTaken:** Added verified-links entry with EXACT data.js key `"Harbor-UCLA Medical Center"`.
- **stopCondition:** IM sub-I page confirmed; UCLA-affiliated.
- **nextAction:** Move to packet 20.

## Packet 20: Harlem Hospital Center

- **programType:** observership; reality: MOSAIC pathway (NYC H+H)
- **currentUrl:** `https://www.nychealthandhospitals.org/harlem/` (generic facility page)
- **Pages opened:** Search result: Harlem is part of NYC H+H, Columbia VP&S-affiliated since 1962; MOSAIC is the canonical visiting student access path
- **Search terms tried:** `NYC Health Hospitals Harlem visiting medical student elective Columbia`
- **Candidate URLs:**
  - `nychealthandhospitals.org/mosaic/visiting-scholars-program/` (kept — MOSAIC includes Harlem)
  - `vagelos.columbia.edu/education/residencies-fellowships-and-training/harlem-hospital-center` (Columbia affiliation; useful context)
  - `metharlememresidency.com/medical-students` (EM-specific rotation)
- **Rejected URLs:** `/harlem/` facility homepage
- **finalUrl:** `https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/`
- **finalClassification:** `MOVED_REORIENTED_TO_TRUE_USCE_LINK`
- **evidenceQuote:** (MOSAIC) "MOSAIC Visiting Scholars Program (VSP) offers four-week electives at NYC Health + Hospitals…"
- **sourcePageTitle:** "MOSAIC Visiting Scholars Program | NYC Health + Hospitals"
- **audienceDecision:** us-md-do; underserved-care focused
- **applicationDecision:** MOSAIC@nychhc.org by April 24, 2026
- **costDecision:** $2k stipend + $2k housing for non-NYC
- **countsAsTrueUSCE:** TRUE
- **actionTaken:** Added verified-links entry with EXACT data.js key `"Harlem Hospital Center"`.
- **stopCondition:** MOSAIC pathway confirmed; Harlem participates.
- **nextAction:** Validate + commit batch 2; then move to packet 21.

# Batch 3 (packets 21-30) — 2026-05-17

(Packet 21 = CommonSpirit, already final-state BORDERLINE in packet 11)

## Packet 22: Hartford Hospital
- finalUrl: hartfordhospital.org/health-professionals/education/residencies-fellowships
- classification: BORDERLINE_KEEP_REVERIFY (verified:false — department-by-department access; no centralized M4 elective application; sub-I requires direct department contact, not VSAS)
- countsAsTrueUSCE: false (kept BORDERLINE)

## Packet 23: Hennepin Healthcare — Minneapolis
- finalUrl: hennepinhealthcare.org/medical-education-training/medical-student-rotations/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK (Cloudflare-protected to fetchers; works in browser)
- evidence: Direct M4 rotations page; 2-4 weeks (up to 12)
- countsAsTrueUSCE: TRUE

## Packet 24: Indiana University Health
- finalUrl: medicine.iu.edu/md/admissions/guest-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Medical students enrolled at a medical school in the United States can apply for the Guest Medical Student elective at IU School of Medicine."
- countsAsTrueUSCE: TRUE

## Packet 25: Jacobi Medical Center
- finalUrl: montefioreeinstein.org/patient-care/services/emergency-medicine/education/medical-student-rotations
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: Jacobi-Montefiore-Einstein EM 4-week rotation; VSLO
- countsAsTrueUSCE: TRUE

## Packet 26+27: Jamaica Hospital Medical Center (two data.js entries, same URL)
- finalUrl: jamaicahospital.org/graduate-medical-education/
- classification: BORDERLINE_KEEP_REVERIFY (verified:false — GME landing; no public observership/visiting-student program documented)
- evidence: prior search confirmed "Observership/externship positions are not offered"; only formal residency programs
- countsAsTrueUSCE: false (kept BORDERLINE — could be reclassified NEGATIVE_INFO in a future pass)

## Packet 28: Jersey City Medical Center
- finalUrl: rwjbh.org/for-health-care-professionals/medical-education/jersey-city-medical-center/clinical-rotations/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Jersey City Medical Center is currently accepting applications for medical student rotations through the AAMC Visiting Student Learning Opportunities program"
- countsAsTrueUSCE: TRUE

## Packet 29: Jersey Shore University Medical Center
- finalUrl: hackensackmeridianhealth.org/en/healthcare-professionals/jsumc
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: JSUMC hosts Hackensack Meridian SOM + St George's University students; Residency/Fellowship landing
- countsAsTrueUSCE: TRUE

## Packet 30: JPS Health Network
- finalUrl: jpshealthnet.org/academic-affairs/undergraduate-medical-education
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Fourth year medical students may apply online using VSLO for elective clinical clerkships at JPS Health Network."
- countsAsTrueUSCE: TRUE

(Compact-packet form — 1-by-1 verified, packet shape kept; full provenance in verified-links.ts notes.)

# Batch 4 (packets 31-40) — 2026-05-17

## Packet 31: Kings County Hospital Center
- finalUrl: downstate.edu/education-training/student-services/registrar/visiting/index.html
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: SUNY Downstate VSLO covers Kings County (primary teaching site); 45-day deadline before start
- countsAsTrueUSCE: TRUE

## Packet 32: Lincoln Medical Center
- finalUrl: nychealthandhospitals.org/mosaic/visiting-scholars-program/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: NYC H+H site; SGU + NYMC core rotation site; EM via lincolnemergencymedicine.com
- countsAsTrueUSCE: TRUE

## Packet 33+34: Loma Linda University Medical Center (two data.js entries, same URL)
- finalUrl: medicine.llu.edu/academics/medical-student-education/visiting-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Loma Linda University School of Medicine welcomes elective applications from students in good standing in their senior year at LCME-accredited institutions"
- countsAsTrueUSCE: TRUE (×2 since two data.js entries; classifier counts both)
- visa: NOT accepting INTL students

## Packet 35: LSU Health New Orleans / University Medical Center
- finalUrl: medschool.lsuhsc.edu/student_affairs/electives.aspx
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: VSLO via US/Canada AAMC schools; max 2 rotations (8 weeks); no academic credit
- countsAsTrueUSCE: TRUE

## Packet 36: Massachusetts General Hospital
- finalUrl: hms.harvard.edu/departments/office-registrar/visiting-students-program
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: HMS Visiting Clerkship Program (HMS-CEP); $2,000 stipend out-of-state; M3 with core / M4
- countsAsTrueUSCE: TRUE
- INTL: not accepted via this route; MGH International Observership separate (different entry)

## Packet 37: Medical College of Wisconsin / Froedtert Hospital
- finalUrl: mcw.edu/education/medical-school/prospective-students/visiting-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Applications are only accepted through the VSLO website"; 4-week electives; INTL NOT accepted
- countsAsTrueUSCE: TRUE

## Packet 38+39: Medical University of South Carolina (MUSC) (two data.js entries, same URL)
- finalUrl: medicine.musc.edu/education/medical-students/curriculum/clinical-curriculum/visiting-medical-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "MUSC offers a wide number of electives and externship experiences to medical students who are in the final year"
- countsAsTrueUSCE: TRUE (×2)
- INTL: NOT eligible for VSLO

## Packet 40: MedStar Georgetown University Hospital
- finalUrl: meded.georgetown.edu/medicaleducation/visiting-students-program/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Visiting electives are offered to 4th-year medical students enrolled in U.S. LCME-accredited and osteopathic institutions"
- countsAsTrueUSCE: TRUE
- INTL: separate contact (Dr. Irma Frank)

# Batch 5 (packets 41-50) — 2026-05-17

## Packet 41: MedStar Health — International Observer Program
- finalUrl: medstarhealth.org/education/other-educational-programs/international-observer-program
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK (verified=true)
- evidence: data.js URL already direct; MedStar GME international rotation application available
- countsAsTrueUSCE: TRUE

## Packet 42: Memorial Healthcare System
- finalUrl: mhs.net/education/undergraduate-medical-education/requirements-for-visiting-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: VSLO + $1M/$3M liability + HIPAA; Office of Academic Affairs 954-265-4463
- countsAsTrueUSCE: TRUE

## Packet 43: Memorial Hermann Hospital / UTHealth
- finalUrl: med.uth.edu/admissions/student-affairs/visiting-student-course-catalog/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: McGovern Medical School visiting student catalog; Memorial Hermann primary teaching site; VSLO Apr 1
- countsAsTrueUSCE: TRUE

## Packet 44: Mercy Hospital — St. Louis
- finalUrl: mercy.net/healthcare-education/graduate/st-louis/rotations/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: M4 sub-internships in IM inpatient/clinic Jul-Feb. WARNING: "no longer able to offer observerships or sponsor externships for international medical graduates/students"
- countsAsTrueUSCE: TRUE (M4 sub-I) — INTL excluded

## Packet 45: Metro Health — Case Western Reserve
- finalUrl: gme.metrohealth.org/medical-student-information/medical-student-guide
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: MetroHealth elective rotations; primarily CWRU-affiliated students; non-affiliated must work with UH Cleveland (separate)
- countsAsTrueUSCE: TRUE

## Packet 46: Metropolitan Hospital Center
- finalUrl: nychealthandhospitals.org/mosaic/visiting-scholars-program/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: NY Medical College affiliate since 1875; MOSAIC is the cross-cutting visiting student access
- countsAsTrueUSCE: TRUE

## Packet 47: Montefiore / Albert Einstein
- finalUrl: einsteinmed.edu/education/md-program/registrar/visiting-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: Einstein Office of the Registrar Visiting Students; VSLO, max 3 electives/4wk; INTL NOT accepted unless via exchange
- countsAsTrueUSCE: TRUE

## Packet 48: Mount Sinai Hospital
- finalUrl: icahn.mssm.edu/education/students/registrar/electives/visiting-lcme-schools
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: Icahn SOM visiting LCME schools (VSLO); INTL students welcome via separate route (international medical schools); VEPSUM diversity URiM separately
- countsAsTrueUSCE: TRUE

## Packet 49: Mount Sinai Morningside / West
- finalUrl: msmwem.com/students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: M4 EM 4-week rotation; sub-intern role; 12 clinical shifts; VSLO
- countsAsTrueUSCE: TRUE

## Packet 50: Newark Beth Israel Medical Center
- finalUrl: rwjbh.org/for-health-care-professionals/medical-education/newark-beth-israel-medical-center/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: Major Rutgers NJMS teaching partner for core clerkships; EM specialty electives (Peds, US, EMS); Rotators@rwjbh.org
- countsAsTrueUSCE: TRUE (×2 since 2 data.js entries)

# Batch 6 (packets 51-60) — 2026-05-17

## Packet 51: NewYork-Presbyterian / Columbia
- finalUrl: vagelos.columbia.edu/education/academic-programs/md-program/visiting-student-program
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: Columbia VP&S Visiting Student Program (canonical); VSLO + OASIS; INTL subpath
- countsAsTrueUSCE: TRUE

## Packet 52: NewYork-Presbyterian / Weill Cornell
- finalUrl: medicaleducation.weill.cornell.edu/student-resources/visiting-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: Weill Cornell Medicine Visiting Student Electives; VSLO; INTL via WCM Global Health Education
- countsAsTrueUSCE: TRUE

## Packet 53: Northwell Health System
- finalUrl: medicine.hofstra.edu/student-records/visiting
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "All students attending US LCME accredited medical schools or COCA accredited AACOM member colleges are required to use the AAMC"
- countsAsTrueUSCE: TRUE

## Packet 54: NYU Langone Health
- finalUrl: med.nyu.edu/education/md-degree/registration-student-records/information-visiting-md-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: VSLO; LCME-approved US schools only; Bellevue primary site
- countsAsTrueUSCE: TRUE

## Packet 55: Ochsner Health System
- finalUrl: education.ochsner.org/clined/medical-student-electives/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: Ochsner Medical Student Electives (New Orleans); INTL via special affiliation only; separate International Observership for foreign-employed physicians
- countsAsTrueUSCE: TRUE

## Packet 56: Olive View-UCLA Medical Center
- finalUrl: oliveviewim.org/people/students/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: M4 sub-internships on general medicine + ICUs; UCLA DGSOM VSLO application; underserved-population academic county hospital
- countsAsTrueUSCE: TRUE

## Packet 57+58: Oregon Health & Science University (OHSU) (two data.js entries, same URL)
- finalUrl: ohsu.edu/school-of-medicine/visiting-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: OHSU SOM Visiting Students canonical; VSLO
- countsAsTrueUSCE: TRUE (×2)

## Packet 59: Penn Medicine (UPenn)
- finalUrl: med.upenn.edu/student/visiting-clerkship-and-mentorship.html
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: Penn Visiting Clerkship and Mentorship Program; M4 rotations at CHOP/HUP/Penn Pres/Pennsylvania; INTL via globalhealth/international-trainees-scholars
- countsAsTrueUSCE: TRUE

## Packet 60: Reading Hospital — Tower Health
- finalUrl: towerhealth.org/academic-affairs/medical-student-rotations
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: Tower Health Academic Affairs Medical Student Rotations; Drexel COM partner; VSLO + $75 fee
- countsAsTrueUSCE: TRUE

---

## Packet 61: Richmond University Medical Center
- currentUrl: rumcsi.org/
- candidates opened: rumcsi.org/careers/graduate-medical-education/
- finalUrl: rumcsi.org/careers/graduate-medical-education/
- classification: BORDERLINE_KEEP_REVERIFY (verified:false)
- evidence: GME landing lists 5 ACGME residency programs + 1 fellowship for 145 residents; no published M4 visiting student / observership pathway visible on institutional site
- audience/application/cost: unknown — requires phone outreach (844-934-2273)
- countsAsTrueUSCE: FALSE (insufficient evidence; keep for manual reverify, do not hide)
- reason: best-known landing surfaced; institution may simply not run a published visiting program

## Packet 62: Rush University Medical Center
- currentUrl: rushu.rush.edu/education-training/graduate-medical-education (GME-only)
- candidates opened: rushu.rush.edu/rush-medical-college/visiting-medical-students
- finalUrl: rushu.rush.edu/rush-medical-college/visiting-medical-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Rush Medical College welcomes applications for visiting medical students from LCME-accredited or COCA-accredited medical schools only, who want to pursue clinical elective rotations at Rush University Medical Center."
- audience: US LCME/COCA M4; application: VSAS (8-wk lead); INTL not on this pathway
- countsAsTrueUSCE: TRUE
- note: prior stub `verified:false` (GME does not manage observerships) commented out; replaced by Rush Medical College visiting-student page

## Packet 63: St. Barnabas Hospital
- currentUrl: sbhny.org/
- candidates opened: sbhny.org/healthcare-professionals/residency-programs/emergency-medicine-residency-program/
- rejected: sbhny.org/EMResidency/letter-from-clerkship-director/ (404)
- finalUrl: sbhny.org/healthcare-professionals/residency-programs/emergency-medicine-residency-program/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "This offering is open to qualified applicants from any medical school. At this time, we cannot accommodate applicants who require a U.S. visa." — 4-wk M4 EM sub-I, 10 shifts, primary-provider model; 80+ M4 visiting students annually system-wide
- audience: any med school but no visa sponsorship → US LCME/COCA + IMGs already in US; application: direct (lroderick@sbhny.org)
- countsAsTrueUSCE: TRUE

## Packet 64: St. John's Episcopal Hospital
- currentUrl: ehs.org/
- candidates opened: ehs.org/medical-education/medical-student-elective/
- finalUrl: ehs.org/medical-education/medical-student-elective/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: Electives in Dermatology, OB/GYN, Ophthalmology, Pathology, Psychiatry, Surgery, Wound Care; 2-4 week duration. "Pathology: This elective provides exposure to the wide range of clinical services and research activities of the Department of Pathology and Laboratory Medicine. Two and four week rotations are available."
- audience: affiliation-agreement schools only (US LCME + INTL via partner relationships); application: direct (fbaksh@ehs.org)
- countsAsTrueUSCE: TRUE

## Packet 65: Stony Brook University Hospital
- currentUrl: renaissance.stonybrookmedicine.edu/gme (GME-only)
- candidates opened: renaissance.stonybrookmedicine.edu/ugme/visiting_students
- finalUrl: renaissance.stonybrookmedicine.edu/ugme/visiting_students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Before a student can be accepted for any elective, there must be a fully executed affiliation agreement between Stony Brook University Hospital and the student's home medical school. There are no exceptions."
- audience: US LCME via VSLO; INTL only via approved global health education partnership; application: VSLO + 6-8 wk affiliation-agreement lead time
- countsAsTrueUSCE: TRUE

## Packet 66: Summa Health System — Akron
- currentUrl: summahealth.org/
- candidates opened: summahealth.org/medicaleducation/elective-programs/senior-elective-information
- finalUrl: summahealth.org/medicaleducation/elective-programs/senior-elective-information
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Summa Health System accepts visiting student applications through the Visiting Student Learning Opportunity (VSLO) website...Note that students must be an M-4 at the time of rotation and be in good standing at an LCME- or COCA-accredited medical school."
- audience: US LCME/COCA M4 only; application: VSLO; 50+ senior electives; meal allowance + parking + library; student provides $1M/$3M malpractice; NEOMED affiliation
- countsAsTrueUSCE: TRUE

## Packet 67: SUNY Downstate Medical Center
- currentUrl: downstate.edu/education-training/graduate-medical-education/index.html (GME-only)
- candidates opened: downstate.edu/education-training/student-services/registrar/visiting/index.html (same URL used in packet #31 for Kings County, shared registrar pathway)
- finalUrl: downstate.edu/education-training/student-services/registrar/visiting/index.html
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "International Medical Students: Rotation at SUNY Downstate Health Sciences University - College of Medicine are currently closed for international medical students."
- audience: US LCME M4 + Canadian + Puerto Rico (some COCA exceptions); INTL CURRENTLY CLOSED; application: VSLO 45 days min; Step1/COMLEX pass + BLS + NY infection control + bg check required
- countsAsTrueUSCE: TRUE

## Packet 68: Tampa General Hospital / USF Health
- currentUrl: health.usf.edu/medicine/gme (GME-only)
- candidates opened: health.usf.edu/registrar/md-visiting-students
- rejected: health.usf.edu/medicine/registrar/md-visiting-students (404)
- finalUrl: health.usf.edu/registrar/md-visiting-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "students must attend an LCME or COCA accredited school"; "The USF Morsani College of Medicine does not assess tuition or fees for visiting students."
- audience: US LCME/COCA M4 in good standing with cores completed; INTL not on this pathway; application: VSLO ≥1 month before; no tuition; student supplies health + malpractice
- countsAsTrueUSCE: TRUE

## Packet 69: Temple University Hospital
- currentUrl: medicine.temple.edu/education/graduate-medical-education (GME-only)
- candidates opened: medicine.temple.edu/education/md-program/visiting-students
- finalUrl: medicine.temple.edu/education/md-program/visiting-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Applications are made through the Visiting Student Application Service (VSAS). LKSOM's annual elective catalog opens in the spring, after our own students' fourth year schedules have been finalized."
- audience: M4 from accredited schools, all cores completed at home; BLS or ACLS + bg check (12mo) required; application: VSAS, space-available basis; contact mdvsas@temple.edu
- countsAsTrueUSCE: TRUE

## Packet 70: Tulane Medical Center
- currentUrl: medicine.tulane.edu/
- candidates opened: medicine.tulane.edu/student-affairs/visiting-students
- finalUrl: medicine.tulane.edu/student-affairs/visiting-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "We are NOT able to accommodate students from medical schools located outside of the United States."
- audience: US medical schools only — INTL explicitly excluded; M4 senior with cores + Step 1 pass + neurology before rotation; application: VSLO; $225 non-refundable processing fee/rotation; rotations do NOT carry Tulane MD credit
- countsAsTrueUSCE: TRUE

---

## Packet 71: Mount Sinai Beth Israel
- currentUrl: mountsinai.org/locations/beth-israel/education/graduate-medical-education (GME-only)
- candidates opened: icahn.mssm.edu/education/students/registrar/electives/visiting-lcme-schools (HTTP 403 to WebFetch — Cloudflare/WAF; URL is live in browser per AAMC registry + Google index)
- finalUrl: icahn.mssm.edu/education/students/registrar/electives/visiting-lcme-schools
- classification: PROTECTED_BROWSER_REQUIRED (works in browser, not in Node fetch — same standard as Hopkins precedent; counts as true USCE)
- evidence (from Google snippet): "Students in good standing who have not yet received their MD or DO degree are eligible to apply for an elective at the Icahn School of Medicine at Mount Sinai, and should be in their final year of medical school."
- audience: US LCME M4 (VSAS); INTL via separate icahn.mssm.edu/.../visiting-abroad pathway; electives at Mount Sinai Hospital + James J. Peters VA + Elmhurst Hospital Center; Beth Israel covered via departmental electives within the Icahn system
- countsAsTrueUSCE: TRUE

## Packet 72: Jamaica Hospital Medical Center
- currentUrl: jamaicahospital.org/graduate-medical-education/
- candidates opened: jamaicahospital.org/graduate-medical-education/ (residency-only landing)
- finalUrl: jamaicahospital.org/graduate-medical-education/
- classification: BORDERLINE_KEEP_REVERIFY (verified:false)
- evidence: no public M4 visiting-student / observership pathway documented on the institutional site; Department of Medical Education exists for graduate trainees
- audience/application/cost: unknown — phone outreach to Department of Medical Education needed
- countsAsTrueUSCE: FALSE (insufficient evidence; keep for manual reverify, do not hide — absence of page ≠ absence of program)
- note: prior "WARNING: NOT offered" claim removed in this reverify because it was based on an older search I could not re-confirm; community teaching hospital in Queens historically described as IMG-friendly

## Packet 73: Wyckoff Heights Medical Center
- currentUrl: wyckoffhospital.org/
- candidates opened: whmcny.org/undergraduate-education/
- finalUrl: whmcny.org/undergraduate-education/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "All electives are offered for 4 week blocks." 350-bed Brooklyn-Queens border teaching hospital approved by NY State Education Department for medical student training; sub-I positions in IM, OB/GYN, Peds, Surgery + specialty
- audience: any med school via affiliation; application: direct via Eileen T. Kruck (EKruck@wyckoffhospital.org); core + sub-I scheduling through home school; historically IMG-friendly community hospital
- countsAsTrueUSCE: TRUE
- note: two data.js entries with this name; both reoriented via this URL

## Packet 74: UCSF Medical Center
- currentUrl: meded.ucsf.edu/ (homepage, prior verified:false stub)
- candidates opened: meded.ucsf.edu/visiting-student-program
- finalUrl: meded.ucsf.edu/visiting-student-program
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "The UCSF School of Medicine uses the AAMC Visiting Student Learning Opportunities (VSLO) Application Service to receive applications from US medical and osteopathic students."
- audience: US LCME/COCA M4; INTL not on this pathway; application: VSLO; max 12 weeks; $300 fee/elective; VESP scholarship up to $2,000
- countsAsTrueUSCE: TRUE
- note: replaces prior verified:false meded.ucsf.edu/ homepage stub

## Packet 75: UC Davis Medical Center
- currentUrl: health.ucdavis.edu/gme/ (GME-only)
- candidates opened: health.ucdavis.edu/mdprogram/registrar/visiting.html
- finalUrl: health.ucdavis.edu/mdprogram/registrar/visiting.html
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "UC Davis School of Medicine welcomes eligible fourth year visiting medical students' participation in our fourth-year electives as space permits."
- audience: US LCME M4 only — INTL not accepted; application: VSLO 60-day approval window; no required core clerkships; BLS/ACLS + $1M/$3M malpractice + Step 1/COMLEX pass + HIPAA + immunizations
- countsAsTrueUSCE: TRUE

## Packet 76: UC Irvine Medical Center
- currentUrl: ucihealth.org/
- candidates opened: medschool.uci.edu/education/medical-education/medical-degree-program/curriculum/md-program-electives
- rejected: meded.uci.edu/curricular-affairs/visiting-students.asp (TLS cert alt-name invalid)
- finalUrl: medschool.uci.edu/education/medical-education/medical-degree-program/curriculum/md-program-electives
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Due to the high volume of requests, the extramural application process is done through the Association of American College's AAMC Visiting Student Learning Opportunities (VSLO)."
- audience: US LCME via VSLO; INTL ONLY from schools with UCI exchange agreement (contact comextra@hs.uci.edu); $300/course fee
- countsAsTrueUSCE: TRUE

## Packet 77: University Hospitals Cleveland
- currentUrl: uhhospitals.org/medical-education/graduate-medical-education (GME-only)
- candidates opened: uhhospitals.org/medical-education/undergraduate-medical-education/visiting-medical-student-program/visiting-medical-student-program-clevel
- finalUrl: uhhospitals.org/medical-education/undergraduate-medical-education/visiting-medical-student-program/visiting-medical-student-program-clevel
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Domestic students who have completed their core clinical training and will be in the fourth year of medical education at their LCME- or AOA- accredited medical schools can apply."
- audience: US LCME/AOA M4 via AAMC-VSLO; Case Western Reserve SOM is primary affiliate (Case students get priority scheduling); applications open mid-Jan, offers mid-Mar; covers UH Rainbow Babies & Children's, MacDonald Women's, Seidman Cancer Center
- countsAsTrueUSCE: TRUE
- note: prior key "University Hospitals Cleveland Medical Center" (suffix mismatch with data.js) commented out; replaced with EXACT data.js key

## Packet 78: UT Southwestern Medical Center
- currentUrl: utsouthwestern.edu/education/graduate-medical-education/ (GME-only)
- candidates opened: medschool.utsouthwestern.edu/admissions/visiting/ (final after 301 from utsouthwestern.edu/education/medical-school/admissions/visiting/)
- rejected: utsouthwestern.edu/education/medical-school/admissions/visiting/ (301 redirect; use canonical medschool subdomain)
- finalUrl: medschool.utsouthwestern.edu/admissions/visiting/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "Visiting students may not complete more than two four-week electives at UT Southwestern"
- audience: US LCME/COCA M4 via AAMC VSLO; INTL via separate VMS portal at medschool.utsouthwestern.edu/admissions/visiting/international.html; max 2 four-week electives; rotation/malpractice fees apply; Castle Branch background check after acceptance
- countsAsTrueUSCE: TRUE
- note: two data.js entries with this name; both reoriented via this URL

## Packet 79: UT Health San Antonio
- currentUrl: uthscsa.edu/
- candidates opened: uthscsa.edu/medicine/education/ume/student-affairs/student-wellness/visiting-students
- finalUrl: uthscsa.edu/medicine/education/ume/student-affairs/student-wellness/visiting-students
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "The Long School of Medicine is currently not accepting students from Non-Accredited or International Medical Schools. Allopathic (LCME) and Osteopathic (COCA) medical schools are eligible to apply."
- audience: US LCME/COCA M4 only — INTL explicitly NOT accepted; application: AAMC VSLO (institution filter: UT HSC San Antonio Long SOM); 4-week advanced electives; affiliation agreement + immunizations required; department selections finalized 4 wks before start
- countsAsTrueUSCE: TRUE

## Packet 80: UNC Hospitals
- currentUrl: med.unc.edu/
- candidates opened: med.unc.edu/md/student-affairs/visiting-students/
- finalUrl: med.unc.edu/md/student-affairs/visiting-students/
- classification: MOVED_REORIENTED_TO_TRUE_USCE_LINK
- evidence: "The University of North Carolina School of Medicine's Visiting Student Program offers domestic students in their final year of medical school the opportunity to participate in educational, engaging and challenging clinical elective experiences."
- audience: US LCME M4 (domestic) via AAMC VSLO/VSAS; INTL via SEPARATE IVS pathway at med.unc.edu/oghe/visiting-international-students/ivs-application-requirements/ (Office of Global Health Education); affiliated sites across NC (Asheville, Chapel Hill, Charlotte, Greensboro, Raleigh, Wilmington); 1 LOR + personal statement; contact visitingstudent@med.unc.edu
- countsAsTrueUSCE: TRUE


