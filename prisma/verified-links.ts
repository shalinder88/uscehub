// Verified program links — ONLY URLs confirmed to go to dedicated observership/externship/observer program pages
// A generic "GME" page does NOT count as verified
// Last audit: March 22, 2026
// Source: Direct web verification of each URL

export const VERIFIED_LINKS: Record<string, { url: string; verified: boolean; note?: string; cost?: string }> = {

  // ===== CONFIRMED DEDICATED OBSERVERSHIP PROGRAM PAGES =====

  "Cleveland Clinic": {
    url: "https://my.clevelandclinic.org/departments/international-medical-education/international-programs/physician-observer",
    verified: true,
    cost: "$500 ($200 non-refundable + $300 balance)",
    note: "WARNING: NOT for IMGs seeking US residency — applications from residency-seeking IMGs will not be considered. For international physicians practicing abroad, residents, fellows, and medical students only.",
  },
  "Cleveland Clinic Florida": {
    url: "https://my.clevelandclinic.org/florida/medical-professionals/education/observerships",
    verified: true,
  },
  "Johns Hopkins Hospital": {
    url: "https://www.hopkinsmedicine.org/volunteer-services/observerships",
    verified: true,
    cost: "Free — must find own JHM physician sponsor",
    note: "Max 100 hours over 12 months. Cannot provide visa documentation.",
  },
  "Houston Methodist Hospital": {
    url: "https://www.houstonmethodist.org/for-health-professionals/global-health-care-services/global-health-care-education/observerships/",
    verified: true,
    cost: "Contact program",
    note: "2-4 weeks. Must be initiated by a Houston Methodist physician. Certificate of completion. No direct patient care.",
  },
  "MD Anderson Cancer Center": {
    url: "https://www.mdanderson.org/education-training/outreach-programs/observer-programs/other-observership-opportunities-at-md-anderson.html",
    verified: true,
    note: "Observer Programs page — clinical observership, NOT postdoc research.",
  },
  "MD Anderson Cancer Center — Observer Program": {
    url: "https://www.mdanderson.org/education-training/outreach-programs/observer-programs/other-observership-opportunities-at-md-anderson.html",
    verified: true,
  },
  "Memorial Sloan Kettering — Observership": {
    url: "https://www.mskcc.org/hcp-education-training/international/observership",
    verified: true,
    note: "WARNING: NOT for IMGs seeking US residency. Recent graduates and junior residents (PGY-1/2) not eligible. Medical students not eligible. Only for internationally employed physicians.",
  },
  "UPMC (University of Pittsburgh Medical Center)": {
    url: "https://www.medstudentaffairs.pitt.edu/visiting-students",
    verified: true,
    note: "Visiting students program through Office of Student Affairs. The dom.pitt.edu/education/eop/ URL returned 404 on 2026-05-16; the Office of Student Affairs visiting-students page is the current canonical entry point. For INTL students see researchprograms.medschool.pitt.edu/international-visiting-student-program.",
  },
  "Massachusetts General Hospital": {
    url: "https://www.massgeneral.org/education",
    verified: false,
    note: "International observership page no longer accessible. Redirects to generic education page. Contact MGH International Patient Center directly.",
  },
  "UCLA Medical Center": {
    url: "https://www.uclahealth.org/international-services/medical-education-training/physicians/physician-observerships",
    verified: true,
    cost: "$750",
    note: "International Physician Observership. 1-3 months. $750 fee. Certificate of Participation. Requires B-1 visa (UCLA cannot assist with visas).",
  },
  "Stanford Health Care": {
    url: "https://med.stanford.edu/visiting-clerkships/visitingclerkships.html",
    verified: true,
    cost: "$1,500 for practicing physicians (some departments); $300 IVS application fee for medical students; varies by department",
    note: "Visiting Clerkships canonical entry. Direct USCE program page. For INTL medical students see med.stanford.edu/visiting-clerkships/international.html. The /shctv/education/observership.html page redirected to a less-specific landing on 2026-05-16.",
  },
  "USC Keck Medical Center": {
    url: "https://sites.usc.edu/healthcare-edu/observership/",
    verified: true,
    cost: "$300 application fee + tuition based on resources",
    note: "International Physician Observership. Requires foreign medical license and employment by foreign health organization. Apply 30+ days before start. Contact: observership@med.usc.edu",
  },
  "University of Chicago Medicine": {
    url: "https://www.uchicagomedicine.org/international/international-collaboration/education-and-training",
    verified: true,
    note: "Global Education & Training for international physicians. Requires faculty sponsor. Max 30 days. No hands-on patient care.",
  },
  "University of Illinois at Chicago (UIC)": {
    url: "https://medicine.uic.edu/education/international-education/observership-program/",
    verified: true,
    note: "LIMITED: Only for full-time medical students with prior professional relationship with UIC COM faculty. Not available to graduates.",
  },
  "BronxCare Health System": {
    url: "https://www.bronxcare.org/our-services/psychiatry/residency-program/volunteer-and-observership-opportunities",
    verified: true,
    note: "Psychiatry-focused observership. 8-12 weeks, min 3 days/week. Application fee required. Covers Adult Inpatient, Addiction, C-L, Child & Adolescent.",
  },

  // ===== BATCH 3 VERIFIED PROGRAMS =====

  "Thomas Jefferson University Hospital": {
    url: "https://www.jefferson.edu/international-services/visa-categories/short-term-visitors/clinical-observerships.html",
    verified: true,
    note: "Clinical observership for international visitors. Student, Resident, Physician tracks. Up to 90 days. 3-month onboarding lead time. NOTE: Internal Medicine no longer offers observerships.",
  },
  "Jackson Memorial Hospital (UMiami)": {
    url: "https://med.miami.edu/centers-and-institutes/international-medicine-institute/education-and-training/global-observership",
    verified: true,
    note: "Global Observership via International Medicine Institute. 1-3 month rotations. 850+ participants since 2008. Requires faculty sponsor. Separate JHS track also available.",
  },
  "University of Colorado Hospital": {
    url: "https://medschool.cuanschutz.edu/pediatrics/education/international-trainee-observership-program",
    verified: true,
    cost: "$100 registration fee (Pediatrics)",
    note: "UCHealth 30-day observational experience + Pediatrics International Trainee Observership. No observers in July/December.",
  },
  "Allegheny Health Network": {
    url: "https://www.alleghenyinternational.org/observerships.html",
    verified: true,
    note: "Allegheny International Services manages observerships. Strictly shadowing, no patient contact.",
  },
  // University of Washington — moved to "no observership" section (does NOT offer for IMGs)
  "University of Florida Health / Shands Hospital": {
    url: "https://osa.med.ufl.edu/students/visiting-medical-student-clerkships/",
    verified: true,
    note: "Office of Student Affairs visiting medical student clerkships. VSLO-based VMS program. The previous /hr.med.ufl.edu/volunteers/onserving-shadowing-application-process/ URL had a typo (onserving instead of observing) and returned 404 on 2026-05-16. For INTL students see osa.med.ufl.edu/students/visiting-medical-student-clerkships/international-visiting-student-program/.",
  },

  // ===== NEW VERIFIED PROGRAMS (from gomco/web research) =====

  "University of Kansas Medical Center (KUMC)": {
    url: "https://www.kumc.edu/academic-and-student-affairs/departments/office-of-international-programs/inbound-programs/information-for-irsd-observers-and-visitors/international-observership-program.html",
    verified: true,
    cost: "$3,000/month",
  },
  "UAB Hospital — International Medical Observers": {
    url: "https://www.uab.edu/medicine/international/international-programs/observership",
    verified: true,
    cost: "$4,250 per 4-week slot",
  },
  "Children's Hospital of Philadelphia (CHOP)": {
    url: "https://www.chop.edu/services/international-observership-program",
    verified: true,
    cost: "$750 admin fee + background screening",
  },
  "Griffin Hospital": {
    url: "https://meded.griffinhealth.org/clinical-observership/",
    verified: true,
    cost: "$900/month (non-refundable)",
  },
  "St. Mary Medical Center (Trinity Health)": {
    url: "https://www.trinityhealthma.org/healthcare-professionals/gme/st-mary/clinical-observership-program",
    verified: true,
  },
  "UC Davis Health — International Observership": {
    url: "https://health.ucdavis.edu/international-affiliations/observerships/index.html",
    verified: true,
    note: "WARNING: NOT for students, recent graduates (within 5 years), or those seeking residency/LORs.",
  },
  "USF Health — International Training": {
    url: "https://health.usf.edu/medicine/ia/international-training-programs",
    verified: true,
  },
  "Mount Sinai Medical Center — Miami Beach": {
    url: "https://www.msmc.com/education/educational-courses-and-events/international-observership-courses/",
    verified: true,
    note: "International Post Graduate Observership. 4 weeks. Separate from Mount Sinai NYC.",
  },
  "Allegheny Health Network — Observership": {
    url: "https://www.alleghenyinternational.org/observerships.html",
    verified: true,
  },
  "Drexel University — International Observership": {
    url: "https://drexel.edu/medicine/academics/continuing-education/physician-refresher-re-entry-program/for-prospective-students/international-students-observerships/",
    verified: true,
  },

  // ===== NEW VERIFIED PROGRAMS (March 2026 research round 2) =====

  "Nazareth Hospital (Trinity Health) — Observership": {
    url: "https://www.trinityhealthma.org/healthcare-professionals/gme/nazareth/clinical-observership-program",
    verified: true,
    note: "ECFMG certification required. Graduated within 5 years preferred. IM only.",
  },
  "Mercy Catholic Medical Center — Observership": {
    url: "https://www.trinityhealthma.org/healthcare-professionals/gme/mcmc/clinical-observership-program",
    verified: true,
    note: "ECFMG certification required. IM focus.",
  },
  "UC San Diego — ACE Program": {
    url: "https://hsi.ucsd.edu/education/physicians/enhanced-clinical-skills",
    verified: true,
    note: "Accelerated Clinical Experience for IMGs preparing for ERAS. 2-6 months. No hands-on (CA regulation).",
  },
  "Mobile Infirmary — Observer Program": {
    url: "https://www.infirmaryhealth.org/careers/graduate-education/mobile-infirmary-internal-medicine-residency/visiting-observer-learning-opportunity-program/",
    verified: true,
    cost: "$100 non-refundable",
    note: "2 or 4 weeks. USMLE Step 1 required. TOEFL 100+.",
  },
  "Hurley Medical Center (MSU) — Observership": {
    url: "https://education.hurleymc.com/gme/residencies-and-fellowships/combined-internal-medicine-pediatrics/observerships/",
    verified: true,
    note: "Med/Peds only. Apps April 1 - June 30. 1-2 weeks outpatient. No LOR.",
  },
  "Ochsner Health — International Observership": {
    url: "https://education.ochsner.org/clined/global-is-local/ochsner-international-observership-program/",
    verified: true,
    cost: "$500 non-refundable",
    note: "Up to 90 days. Must have Ochsner faculty sponsor. Must be employed abroad. Apply 90+ days ahead.",
  },
  "Providence Swedish Medical Center — Observer Program": {
    url: "https://gme.providence.org/washington/puget-sound/for-observers/observers-international-invited-guests/",
    verified: true,
    note: "Must have relationship with preceptor. Apply 6+ months ahead.",
  },
  "MSU Institute for Global Health — Observership": {
    url: "https://ighealth.msu.edu/education/global-externship-program/",
    verified: true,
    note: "Multiple MI sites. Schedule 9+ months ahead.",
  },

  // ===== THIRD-PARTY PLACEMENT SERVICES (NOT hospitals — demoted from verified) =====
  // These are paid services that place IMGs at partner hospitals
  // NOT verified as hospital programs — marked unverified so they don't appear as "verified" listings

  "Brooklyn USCE — Clinical Rotations": {
    url: "https://brooklynusce.com/",
    verified: false,
    note: "THIRD-PARTY PLACEMENT SERVICE — not a hospital. Paid service that places IMGs at community hospitals.",
  },
  "AMG Medical Group — Clinical Rotations": {
    url: "https://amgmedicalgroup.com/",
    verified: false,
    note: "THIRD-PARTY PLACEMENT SERVICE — not a hospital. Paid service. Verify quality independently.",
  },
  "ValueMD Clinical Rotations": {
    url: "https://www.valuemd.com/clinical-rotations/",
    verified: false,
    note: "THIRD-PARTY PLACEMENT SERVICE — not a hospital. Paid service. Has active IMG forum.",
  },

  // ===== DEPARTMENT-SPECIFIC ONLY (not centralized — marked unverified) =====

  "Mount Sinai Hospital": {
    url: "https://www.mountsinai.org/about/international/programs",
    verified: false,
    note: "International Observer Program currently SUSPENDED. Department-level observerships may be arranged with faculty sponsor.",
  },
  "NYU Langone Health": {
    url: "https://med.nyu.edu/",
    verified: false,
    note: "No centralized observership page. Department-specific only: Dermatology, Surgery (Long Island), Ortho, Plastic Surgery, ENT, Rusk Rehab each have own pages. Faculty sponsor required.",
  },
  "NewYork-Presbyterian / Columbia": {
    url: "https://www.nyp.org/",
    verified: false,
    note: "NYP no longer accepts individual observerships institution-wide. Select Columbia departments still run programs (Psychiatry, Neurology $250-1000, General Surgery — some closed).",
  },
  "NewYork-Presbyterian / Weill Cornell": {
    url: "https://www.nyp.org/",
    verified: false,
    note: "Same NYP-wide policy — no individual observerships. Select departments (Pediatrics, ENT) still coordinate. Faculty sponsor required.",
  },
  "UCSF Medical Center": {
    url: "https://meded.ucsf.edu/",
    verified: false,
    note: "No centralized observership page. Department-specific only: Neuropathology, Dermatopathology, Neurosurgery, BCH Oakland each have own pages.",
  },
  "Brigham and Women's Hospital": {
    url: "https://www.brighamandwomens.org/radiology/education-and-training/observerships",
    verified: false,
    note: "Department-specific. Radiology: 1-2 weeks, earns CME credits. EM/Critical Care: 6-12 months, $5,000/month. Max 3 months general, requires faculty sponsor.",
    cost: "Radiology: CME fee. EM/Critical Care: $5,000/month",
  },
  "Boston Medical Center": {
    url: "https://www.bmc.org/",
    verified: false,
    note: "Has clinical observer policy but no dedicated program page. OMFS and Hematology/Oncology accept observers by department. No patient contact.",
  },
  "Northwell Health System": {
    url: "https://international.northwell.edu/consulting-advisory-services",
    verified: false,
    note: "2-week or 4-week observership rotations through International Services. Contact international@northwell.edu. Fees not listed publicly.",
  },
  "Northwestern Memorial Hospital": {
    url: "https://www.feinberg.northwestern.edu/md-education/visiting-students/index.html",
    verified: true,
    note: "Feinberg School of Medicine visiting students canonical page. LCME/AOA fourth-year US medical students; INTL students from Global Partner universities only — see /md-education/visiting-students/international-visiting-students.html. Updated 2026-05-16 (was generic nm.org homepage).",
  },
  "Rush University Medical Center": {
    url: "https://www.rushu.rush.edu/",
    verified: false,
    note: "GME office does NOT manage observerships. Department-level only. Neurosurgery has dedicated page.",
  },
  "Emory University Hospital": {
    url: "https://med.emory.edu/",
    verified: false,
    note: "Radiology has observer program. General observerships require credentialing office (observership.credentialing@emoryhealthcare.org). Fee: $15 + $10 badge.",
  },
  "Duke University Hospital": {
    url: "https://medschool.duke.edu/",
    verified: false,
    note: "No centralized observership. Ophthalmology and Radiology ($1,900/week, CME credit) have dedicated pages. 6 months notice for international applicants.",
  },
  "Henry Ford Hospital": {
    url: "https://www.henryford.com/hcp/med-ed/ugme/students/visiting-students",
    verified: true,
    note: "Henry Ford UGME visiting students page (VSLO-based, $125 admin fee per rotation). Updated 2026-05-16 from generic henryford.com homepage. ENT/Microvascular Surgery also runs a separate international observer program; general observation limited to two 8-hour days/year is separate.",
  },
  "University of Michigan Health": {
    url: "https://medicine.umich.edu/",
    verified: false,
    note: "Only Ophthalmology (Kellogg Eye Center) has visible observership application ($250 fee). No centralized hospital-wide program.",
  },
  "Ohio State University Wexner Medical Center": {
    url: "https://medicine.osu.edu/departments/office-of-global-health/international-visiting-scholars",
    verified: false,
    note: "International Visiting Scholars only — requires invitation from OSU faculty. No unsolicited applications accepted.",
  },
  "Vanderbilt University Medical Center": {
    url: "https://www.vumc.org/observational-services/welcome-vanderbilt-observational-experience-voe-program",
    verified: false,
    note: "VOE program limited to one 8-hour session per year. IM residency does NOT offer observerships.",
  },
  "Mayo Clinic": {
    url: "https://college.mayo.edu/academics/visiting-medical-student-clerkships/",
    verified: false,
    cost: "$350 non-refundable application fee (for clerkships)",
    note: "Visiting Medical Student Clerkships for enrolled students only. No centralized IMG observership program. Contact physician directly for observerships.",
  },
  "Baylor College of Medicine": {
    url: "https://www.bcm.edu/education/school-of-medicine/m-d-program/curriculum/elective-program/visiting-medical-student",
    verified: true,
    note: "BCM Visiting Medical Student program (VSLO host school for both US and international students, final-year only). Houston + Temple campuses; Temple does not accept international visiting students. Updated 2026-05-16 from generic bcm.edu homepage.",
  },
  "Cedars-Sinai Medical Center": {
    url: "https://www.cedars-sinai.org/",
    verified: false,
    note: "No publicly listed observership program page found. Contact GME office or individual departments.",
  },

  "Penn Medicine (UPenn)": {
    url: "https://www.pennmedicine.org/",
    verified: false,
    note: "No centralized observership. Department-specific only. Dermatopathology: $10,000/year. Radiology has visiting observers. Penn does NOT sponsor observerships system-wide.",
  },
  "George Washington University Hospital": {
    url: "https://imp.smhs.gwu.edu/observer-training-program-not-accepting-applications",
    verified: false,
    note: "Observer Training Program exists but currently NOT ACCEPTING APPLICATIONS. Contact impinfo@gwu.edu for updates.",
  },
  "Wayne State University / Detroit Medical Center": {
    url: "https://www.dmc.org/health-professionals/gme-at-dmc/dmc-clinical-campus/elective-visiting-students",
    verified: true,
    note: "DMC Clinical Campus Elective Visiting Students page. Wayne State SOM itself does not run observerships, but the affiliated Detroit Medical Center does run a visiting-students program. Updated 2026-05-16 from generic med.wayne.edu homepage. (URL is Cloudflare-protected to bot fetchers; works in a real browser.)",
  },
  "Yale-New Haven Hospital": {
    url: "https://medicine.yale.edu/md-program/visiting-students/",
    verified: true,
    note: "Yale SOM Visiting Students canonical page. VSLO-based, four-week rotations only, final-year US LCME or COCA students. INTL students see medicine.yale.edu/md-program/visiting-students/international/ — Yale does NOT offer observerships/externships, only clinical electives. Updated 2026-05-16 from generic medicine.yale.edu homepage.",
  },
  "University of Kentucky Medical Center": {
    url: "https://medicine.uky.edu/",
    verified: false,
    note: "Department-specific only (Radiology, Neurology, IM Visiting Scholar). Observerships limited to 2 weeks. International observers via J-1 visa.",
  },

  // ===== PROGRAMS THAT DO NOT OFFER OBSERVERSHIPS FOR IMGs =====
  // These should show clear warnings on the listing page

  "Cook County Hospital (Stroger)": {
    url: "https://cookcountyhealth.org/",
    verified: false,
    note: "DOES NOT offer observership or shadowing. Firm institutional policy.",
  },
  "University of Washington Medical Center": {
    url: "https://medicine.uw.edu/education/observerships",
    verified: false,
    note: "Explicitly states: does NOT offer observerships for international medical graduates. Exceptions: Pathology Global Observership and Radiology only.",
  },
  // ===== NEW VERIFIED PROGRAMS (round 3) =====
  "Boston Children's Hospital — Observership": {
    url: "https://bchapps.childrenshospital.org/observership/",
    verified: true,
  },
  "Cincinnati Children's Hospital — International Visitor Program": {
    url: "https://www.cincinnatichildrens.org/professional/resources/international-visitor-program",
    verified: true,
  },
  "Texas Tech University HSC — Observership": {
    url: "https://www.ttuhsc.edu/medicine/internal/observership/observership.aspx",
    verified: true,
    cost: "$250 + background check",
  },
  "University of Louisville — Medical Observership Program": {
    url: "https://uoflhealth.org/careers/medical-observership-program-mop/",
    verified: true,
    cost: "$250",
  },
  "UTHealth Houston — Observer Program": {
    url: "https://med.uth.edu/gme/trainee-resources/visiting-trainees/observers/",
    verified: true,
    cost: "$100 US / $775 foreign nationals",
  },
  "SAMS — Clinical Observership (Nonprofit)": {
    url: "https://society.sams-usa.net/observership-program/",
    verified: true,
    note: "Nonprofit — free or minimal cost. Multiple states.",
  },
  "CommonSpirit Health International — Clinical Observation": {
    url: "https://commonspiritinternational.org/education-programs/",
    verified: false,
    note: "Generic education page — no observership content found. Contact directly for clinical observation programs.",
  },
  "MedStar Health — International Observer Program": {
    url: "https://www.medstarhealth.org/education",
    verified: false,
    note: "Observer program page may have been removed or restructured. Contact MedStar education office directly.",
  },
  "Georgetown / Ruesch Center — International GI Observership": {
    url: "https://ruesch.georgetown.edu/internationalobservership/",
    verified: true,
  },
  "UW Pathology — Global Observership (PAID STIPEND)": {
    url: "https://dlmp.uw.edu/education/global-observership",
    verified: true,
    note: "FREE + up to $2,500 stipend. 1 position per cycle.",
  },
  "UCSD — Bridge to Residency Program": {
    url: "https://hsi.ucsd.edu/education/physicians/bridge-to-residency-program-for-physicians",
    verified: true,
  },
  "MSK MSO — Observership (San Diego)": {
    url: "https://www.musculoskeletalmso.com/education/observership",
    verified: true,
    cost: "$1,000/month",
  },

  // Penn Medicine, Yale, Wayne State already listed above — no duplicates
  // Spectrum Health / Corewell - explicitly no observerships
  // Beaumont Hospital - now Corewell, no observerships
  // HCA Healthcare - no centralized observership across 72 hospitals
  // Tenet Healthcare - no observership found
  // CommonSpirit Health - no observership found
  // Mercy Health St. Louis - no longer offers observerships

  // ===== ADDED 2026-05-16 via Phase Live-Crosscheck reorientation pass =====
  // Each URL: WebSearch + WebFetch + p102-run-exact-usce-seed-links runner
  // confirmed it lands on a USCE-specific page (VALID_DIRECT_USCE_SOURCE).

  "Maimonides Medical Center": {
    url: "https://maimo.org/medical-education/internships-undergraduate-medical-education/",
    verified: true,
    note: "Maimonides Health Undergraduate Medical Education — elective rotations for 4th-year medical students. Domain moved from maimonides.org to maimo.org (the old maimonides.org/gme/ URL returned 404 on 2026-05-16). Page accepts both US (LCME/COCA) and international medical students.",
  },

  "Loyola University Medical Center": {
    url: "https://www.luc.edu/stritch/regrec/students/visitingstudents/",
    verified: true,
    note: "Loyola Stritch SOM Visiting Students. VSLO-based, 4-week electives, final-year LCME/COCA students; max 12 weeks. INTL students see /visitingstudents/internationalstudents/ (4-week max). The old ssom.luc.edu/gme/ URL returned 404 on 2026-05-16.",
  },

  "Beth Israel Deaconess Medical Center": {
    url: "https://bidmc.org/education-training/medical-education",
    verified: true,
    note: "BIDMC Undergraduate & Medical Student Education (Harvard Medical School-affiliated). VSLO via HMS Office of Registrar, 90 days before start. Applies to multiple departments — Radiology, Emergency Medicine, Otolaryngology, Anesthesia (the latter offers $2,500 scholarship).",
  },

  "Hackensack University Medical Center": {
    url: "https://www.hackensackmeridianhealth.org/en/healthcare-professionals/humc/internal-medicine-residency/elective-rotations",
    verified: true,
    note: "HUMC Internal Medicine elective rotations (Hackensack Meridian Health). VSAS-based applications. Approx 100 medical students train at HUMC at any given time. Updated 2026-05-16 from generic hackensackmeridianhealth.org homepage.",
  },

  // ===== ADDED 2026-05-16 via second-pass reorientation (WebSearch + runner-validated) =====
  // Each URL: WebSearch found a real direct USCE page at the institution,
  // WebFetch verified USCE content, runner confirmed VALID_DIRECT_USCE_SOURCE
  // before adding. 1-by-1 sweep per the operator's "every click should
  // directly open to a page containing USCE" requirement.

  "Abington Hospital — Jefferson Health": {
    url: "https://www.jefferson.edu/registrar/visiting-student-clinical-electives/international-visiting-medical-students.html",
    verified: true,
    note: "Jefferson registrar international visiting students page; includes Abington campus. Student observership up to 12 weeks; clinical electives via clinical departments.",
  },
  "Advocate Christ Medical Center": {
    url: "https://www.advocatehealth.com/education/medical-education/medical-students",
    verified: true,
    note: "Advocate Health Care medical students page. Explicit policy: no observerships, but offers electives for M4 and eligible M3 students from non-affiliated schools at primary teaching hospitals. EM elective offers $2,000 scholarships.",
  },
  "Banner University Medical Center — Tucson": {
    url: "https://medicine.arizona.edu/education/degree-programs/md-program/visiting-medical-students",
    verified: true,
    note: "University of Arizona SOM Tucson visiting students page (Banner is the affiliate hospital). VSAS-based. 4th-year LCME/COCA only; international students need faculty sponsor.",
  },
  "Baptist Health South Florida — International Observerships": {
    url: "https://baptisthealth.net/international-services/international-healthcare-professionals/international-observerships",
    verified: true,
    note: "International Observership Program for Latin America/Caribbean physicians.",
  },
  "Baptist Health South Florida — Observer Program": {
    url: "https://baptisthealth.net/academics/student-and-visitor-programs/job-shadowing-and-externships/observer-program",
    verified: true,
    note: "General Observer Program (1 day - 4 weeks). Sponsor required (Baptist employee or medical staff). Non-citizens need International Eligibility Form.",
  },
  "Beaumont Hospital — Royal Oak (Corewell)": {
    url: "https://www.beaumont.edu/medical-student-education/medical-student-rotations-royal-oak",
    verified: true,
    note: "Corewell Health William Beaumont University Hospital Medical Student Rotations. 50+ electives for M4 students via VSAS. Replaces generic beaumont.org/medical-education/graduate-medical-education.",
  },
  "Boston Medical Center — Visiting Medical Students": {
    url: "https://www.bmc.org/visiting-medical-students-1",
    verified: true,
    note: "Direct BMC visiting medical students page. SVEP provides up to $2,500 reimbursement for travel/housing/VSLO fees. INTL via Boston U ISEP ($3,000/elective).",
  },
  "Augusta University Medical Center (MCG)": {
    url: "https://www.augusta.edu/mcg/coffice/curriculum/incoming-vslo-students.php",
    verified: true,
    note: "Medical College of Georgia VSLO incoming students page. LCME-only 4th year; INTL students not accepted; max 2x 4-week (8 weeks total).",
  },
  "University of Cincinnati Medical Center": {
    url: "https://med.uc.edu/education/medical-student-education/office-of-medical-education/visiting-students",
    verified: true,
    note: "UC College of Medicine visiting students. Max 2 electives (8 weeks). $166 fee. INTL only via existing Activity Agreement schools (specific list).",
  },
  "NewYork-Presbyterian / Columbia — International": {
    url: "https://www.vagelos.columbia.edu/education/academic-programs/md-program/visiting-student-program/international-visiting-students",
    verified: true,
    note: "Columbia VP&S International Visiting Students. Application via OASIS portal; Sackler NY Program students use VSLO.",
  },
  "NewYork-Presbyterian / Weill Cornell — International": {
    url: "https://international.weill.cornell.edu/visiting-international-students",
    verified: true,
    note: "WCM Office of International Medical Student Education. Up to 2 months of clinical electives. INTL via WCM Global Health Education; office does NOT coordinate observerships, only clinical electives.",
  },
  "Albert Einstein College of Medicine": {
    url: "https://einsteinmed.edu/education/md-program/registrar/visiting-students",
    verified: true,
    note: "Einstein Office of the Registrar Visiting Students. Replaces einsteinmed.edu/ homepage. INTL only via established exchange program affiliation.",
  },
  "University of Maryland Medical Center": {
    url: "https://www.medschool.umaryland.edu/osa/visiting-students/",
    verified: true,
    note: "UMSOM Office of Student Affairs visiting students. LCME/COCA 4th-year only. Critical Care/Trauma has separate observer program. 26-27 catalog opens Mar 13.",
  },
  "University of Iowa Hospitals & Clinics": {
    url: "https://md.medicine.uiowa.edu/student-and-program-resources/visiting-students",
    verified: true,
    note: "Carver College of Medicine MD Program visiting students. LCME-only 4th-year; $75 fee. Most departments accept; 2026 visiting opens April 1.",
  },
  "University of Minnesota Medical Center": {
    url: "https://med.umn.edu/md-students/academics/clinical-experiences/visiting-students",
    verified: true,
    note: "UMN Medical School visiting students. Max 2 electives. INTL only via formal institutional agreement.",
  },
  "University of Minnesota — GME Observers": {
    url: "https://med.umn.edu/gme/education/visiting-trainees",
    verified: true,
    note: "GME Visiting Trainees / Observers. For LCME-accredited medical school graduates or international equivalent. Typically less than 1 month. Current medical students NOT eligible.",
  },
  "Wake Forest Baptist / Atrium Health": {
    url: "https://school.wakehealth.edu/education-and-training/md-program/visiting-medical-students/",
    verified: true,
    note: "Wake Forest SOM visiting medical students. LCME/COCA 4th-year; passed USMLE Step 1/COMLEX Level 1. INTL very limited.",
  },
  "University Hospital Newark / Rutgers NJMS": {
    url: "https://njms.rutgers.edu/education/registrar/visitingstds.php",
    verified: true,
    note: "Rutgers NJMS visiting students page; 4-week electives at University Hospital Newark and East Orange VA. Multiple departments incl. EM.",
  },
  "Robert Wood Johnson University Hospital / Rutgers RWJMS": {
    url: "https://rwjms.rutgers.edu/education/md/visiting-students",
    verified: true,
    note: "Rutgers RWJMS visiting students; VSLO-based for LCME/COCA. $75 fee per elective. Family Medicine and OB/GYN may not be accepting for 2026-27.",
  },
  "Hospital of the University of Pennsylvania (HUP) / Penn Medicine": {
    url: "https://www.med.upenn.edu/student/visiting-clerkship-and-mentorship.html",
    verified: true,
    note: "Penn Visiting Clerkship and Mentorship Program. M4 rotations at CHOP, HUP, Penn Presbyterian, Pennsylvania Hospital. Sub-I and elective options.",
  },
  "Penn Medicine — International Trainees & Scholars": {
    url: "https://www.med.upenn.edu/globalhealth/international-trainees-scholars.html",
    verified: true,
    note: "Penn Center for Global Health INTL trainees. Affiliation agreement required; up to 2 consecutive electives; pediatric electives not available for INTL.",
  },
  "Texas Tech Health El Paso — Visiting Students": {
    url: "https://www.elpaso.ttuhsc.edu/som/studentaffairs/visitingstudents.aspx",
    verified: true,
    note: "TTUHSC El Paso SOM Student Affairs visiting students. UMC El Paso is the teaching affiliate. Multiple specialty subinternships incl. orthopedics.",
  },
  "Texas Tech HSC — Internal Medicine Observership": {
    url: "https://www.ttuhsc.edu/medicine/internal/observership/observership.aspx",
    verified: true,
    note: "TTUHSC Internal Medicine observership program. Application fee + background check + onboarding. CBC clearance report required.",
  },
  "University Hospitals Cleveland Medical Center": {
    url: "https://www.uhhospitals.org/medical-education/undergraduate-medical-education/visiting-medical-student-program",
    verified: true,
    note: "UH Cleveland Visiting Medical Student Program. VSLO-based; INTL students may use IFOM-BSE in place of Step 1. Includes UH Rainbow, MacDonald, Seidman.",
  },
  "Ochsner International Observership Program": {
    url: "https://education.ochsner.org/clined/global-is-local/ochsner-international-observership-program/",
    verified: true,
    note: "Ochsner Health direct International Observership Program. Requires faculty sponsor + foreign institutional sponsorship + evidence of financial support.",
  },
  "Ochsner Health — Medical Student Electives": {
    url: "https://education.ochsner.org/clined/medical-student-electives/",
    verified: true,
    note: "Ochsner Health New Orleans direct medical student electives page. Per policy, Ochsner does NOT accept INTL students for visiting electives except via special affiliation agreements.",
  },
  "Mayo Clinic — Visiting Medical Student Clerkships": {
    url: "https://college.mayo.edu/academics/visiting-medical-student-clerkships/",
    verified: true,
    note: "Mayo Clinic VMS Clerkship Program (canonical). ~600 students/year. Replaces mayoclinic.org/education. VSLO-based; accepts ALL international medical schools (USMLE Step 1 required for INTL). 1-month rotations. No tuition for US students.",
  },
  "UCLA Ronald Reagan Medical Center — VSLO": {
    url: "https://medschool.ucla.edu/education/md-education/visiting-students",
    verified: true,
    note: "UCLA David Geffen SOM visiting students canonical page. INTL only via pre-selected reciprocal exchange agreement.",
  },
  "USC Keck — International Physician Observership": {
    url: "https://sites.usc.edu/healthcare-edu/observership/",
    verified: true,
    note: "Keck Medicine of USC International Physician Observership. For practicing foreign-licensed physicians; requires faculty sponsor + foreign health org employer.",
  },

  // ===== ADDED 2026-05-16 third-pass: INTL pathways + departmental observerships =====
  // These are companion entries to the primary verified-links rows above.
  // Each was WebSearch-found and runner-validated.

  "Loyola University Medical Center International": {
    url: "https://www.luc.edu/stritch/regrec/students/visitingstudents/internationalstudents/",
    verified: true,
    note: "Loyola Stritch INTL Visiting Students subpath. Max 4-week electives for international final-year students.",
  },
  "University of Florida Health / Shands Hospital — International": {
    url: "https://osa.med.ufl.edu/students/visiting-medical-student-clerkships/international-visiting-student-program/",
    verified: true,
    note: "UF Office of Student Affairs International Visiting Student Program. Limited departments accept non-LCME schools.",
  },
  "UPMC — International Visiting Student Program": {
    url: "https://www.researchprograms.medschool.pitt.edu/international-visiting-student-program",
    verified: true,
    note: "Pitt Medical Student Research and International Studies INTL program. Final-year international medical students.",
  },
  "Northwestern Memorial Hospital — International": {
    url: "https://www.feinberg.northwestern.edu/md-education/visiting-students/international-visiting-students.html",
    verified: true,
    note: "Feinberg INTL Visiting Students. Open ONLY to students from Northwestern Global Partner universities.",
  },
  "Yale-New Haven Hospital — International": {
    url: "https://medicine.yale.edu/md-program/visiting-students/international/",
    verified: true,
    note: "Yale SOM Visiting International Student Elective Program. Four-week rotations only. No observerships at Yale.",
  },
  "Stanford Health Care — International": {
    url: "https://med.stanford.edu/visiting-clerkships/international.html",
    verified: true,
    note: "Stanford International Visiting Student (IVS) Program. 2-week or 4-week (up to 8 weeks max). $300 application fee.",
  },
  "Texas Tech HSC — Observership Program": {
    url: "https://www.ttuhsc.edu/medicine/internal/observership/observership.aspx",
    verified: true,
    note: "TTUHSC Internal Medicine observership. Background check + observer fee + onboarding required.",
  },
  "Children's Hospital of Philadelphia (CHOP) — International Observership": {
    url: "https://www.chop.edu/services/international-observership-program",
    verified: true,
    note: "CHOP International Observership Program. 2-8 weeks (4 weeks max for INTL students). $750 admin fee + background screening.",
  },
  "Memorial Sloan Kettering — International Observership": {
    url: "https://www.mskcc.org/hcp-education-training/international/observership",
    verified: true,
    note: "MSK International Observer Program. NOT for IMGs residing in US — only for foreign-employed practicing physicians. Max 30 days.",
  },
  "Cleveland Clinic — Elective Program": {
    url: "https://my.clevelandclinic.org/departments/elective-program",
    verified: true,
    note: "Cleveland Clinic 4-week elective program for final-year medical students. $200 US / $400 INTL processing fee.",
  },
  "NYU Langone / Bellevue Hospital": {
    url: "https://med.nyu.edu/education/md-degree/registration-student-records/information-visiting-md-students",
    verified: true,
    note: "NYU Grossman SOM Visiting MD Students info. LCME-approved US schools only. Bellevue is a primary clinical site.",
  },
  "NYU Langone Orthopedic Surgery — Visiting International Physicians": {
    url: "https://med.nyu.edu/departments-institutes/orthopedic-surgery/education/visiting-international-physicians-program",
    verified: true,
    note: "NYU Orthopedic Surgery Visiting International Physicians program — department-specific INTL observership.",
  },
  "MD Anderson Cancer Center — Observer Programs": {
    url: "https://www.mdanderson.org/education-training/outreach-programs/observer-programs.html",
    verified: true,
    note: "MD Anderson Observer Programs landing. STEP (<=5 days) or up to 90-day observerships across multiple specialties. $500 deposit. Faculty sponsor required.",
  },
  "Houston Methodist — Global Observership": {
    url: "https://www.houstonmethodist.org/for-health-professionals/global-health-care-services/global-health-care-education/observerships/",
    verified: true,
    note: "Houston Methodist Global Observership. 2-4 weeks. Must be initiated by a Houston Methodist physician. No direct patient care.",
  },
  "Rush University Medical Center — Visiting Physicians": {
    url: "https://www.rushu.rush.edu/education-training/graduate-medical-education/visiting-physicians",
    verified: true,
    note: "Rush GME Visiting Physicians program (formal observership office). Department-dependent acceptance.",
  },
  "University of Illinois Chicago — Observership Program": {
    url: "https://medicine.uic.edu/education/international-education/observership-program/",
    verified: true,
    note: "UIC College of Medicine Observership Program for IMGs. Direct observership entry point.",
  },

  // === Batch 8 add ===
  "Drexel University / Tower Health": {
    url: "https://towerhealth.org/academic-affairs/medical-student-rotations",
    verified: true,
    note: "Tower Health Academic Affairs medical student rotations (Reading Hospital, St Christopher's, Phoenixville). Drexel partnership. VSLO-based; $75 per rotation; max 12 weeks.",
  },
  "University of Chicago Pritzker — Visiting Students": {
    url: "https://pritzker.uchicago.edu/academics/visiting-students",
    verified: true,
    note: "Pritzker SOM visiting students page. 4th year LCME/COCA only via VSLO. INTL only via Ben Gurion or Sackler schools.",
  },
  "Tufts Medical Center": {
    url: "https://medicine.tufts.edu/all-administrative-offices/registrar/away-rotations",
    verified: true,
    note: "TUSM away rotations / visiting students. VSLO-based for LCME/AOA only; INTL not eligible; no observerships.",
  },
  "Banner University Medical Center Phoenix": {
    url: "https://phoenixmed.arizona.edu/visiting-students",
    verified: true,
    note: "University of Arizona College of Medicine Phoenix visiting students. Annual catalog opens April 15. No INTL students.",
  },
  "Mayo Clinic — Arizona Campus": {
    url: "https://college.mayo.edu/academics/visiting-medical-student-clerkships/",
    verified: true,
    note: "Mayo VMS clerkship — Arizona (Scottsdale) campus. Same canonical page as Rochester + Jacksonville. Accepts ALL international medical schools.",
  },
  "NYU Grossman Long Island School of Medicine": {
    url: "https://medli.nyu.edu/education/md-degree/registration-student-records/information-visiting-md-students",
    verified: true,
    note: "NYU LI SOM visiting MD students info. LCME-accredited only.",
  },
  "NYC Health + Hospitals — MOSAIC Visiting Scholars": {
    url: "https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/",
    verified: true,
    note: "NYC H+H MOSAIC Visiting Scholars Program. 4-week electives. $2k stipend + $2k housing for non-NYC. US LCME/AOA only; underserved-care focused.",
  },
};
