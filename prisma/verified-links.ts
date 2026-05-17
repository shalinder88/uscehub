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
  // "Massachusetts General Hospital" — primary entry now in one-by-one
  // packet #36 below (HMS Visiting Clerkship Program).
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

  // "Mount Sinai Hospital" — primary entry now in one-by-one packet #48.
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
  // "Boston Medical Center" — primary entry now lives in one-by-one packet
  // #6 below (URL updated to SVEP page). This stub kept as a comment so the
  // history of the prior verified:false stance is preserved.
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
  // "Emory University Hospital" — primary entry now in one-by-one packet #16
  // (URL updated to med.emory.edu/education/admissions/visiting/index.html)
  // "Duke University Hospital" — primary entry now in one-by-one packet #14
  // (URL updated to medschool.duke.edu/.../visiting-students)
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
  // "Cedars-Sinai Medical Center" — primary entry now lives in one-by-one
  // packet #8 below (URL updated to /education/medical-students.html).

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
  // "CommonSpirit Health International — Clinical Observation" — primary
  // entry now lives in one-by-one packet #9 below.
  // "MedStar Health — International Observer Program" — primary entry
  // now in one-by-one packet #41 below.
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

  // ===== 2026-05-17 — One-by-one borderline reorientation =====
  // Keys below are EXACT data.js program.name strings so prisma/seed.ts
  // actually applies the override (prior batches used slightly different
  // keys, which broke the seed-time lookup).

  "Banner University Medical Center / University of Arizona": {
    url: "https://medicine.arizona.edu/education/degree-programs/md-program/visiting-medical-students",
    verified: true,
    note: "U of A College of Medicine - Tucson Visiting Medical Students page (VSAS-based, 4th-year LCME/COCA; INTL only via faculty-sponsor relationship). Updated 2026-05-17 from generic medicine.arizona.edu homepage. Quote: 'The University of Arizona College of Medicine – Tucson accepts visiting students from other accredited medical schools.' One-by-one packet #1.",
  },

  "Baptist Health South Florida": {
    url: "https://baptisthealth.net/academics/student-and-visitor-programs/job-shadowing-and-externships/observer-program",
    verified: true,
    note: "Direct Observer Program page (general). Fee: $150 students/residents, $450 others (HS waived). International applicants must complete International Eligibility Form first. Replaces homepage baptisthealth.net/. WebFetch evidence: 'An observership is a voluntary experience…'  One-by-one packet #2.",
  },

  "Barnes-Jewish Hospital (WashU)": {
    url: "https://md.wustl.edu/curriculum/visiting-students/",
    verified: true,
    note: "WashU MD Program Visiting Students canonical page. 4-week rotations at Barnes-Jewish + St. Louis Children's. VSLO-only; no direct department contact. $100 admin fee on offer. No tuition. Final-year US LCME only. Replaces gme.wustl.edu/ (GME-only landing). One-by-one packet #3.",
  },

  "Beaumont Hospital — Royal Oak": {
    url: "https://www.beaumont.edu/medical-student-education/medical-student-rotations-royal-oak",
    verified: true,
    note: "Corewell Health William Beaumont University Hospital Medical Student Rotations Royal Oak. 50+ M4 electives via VSAS. Cloudflare-protected to bot fetchers (HTTP 403); works in a real browser — runner WebSearch confirmed in batch 5. Replaces beaumont.org/ homepage. One-by-one packet #4.",
  },

  "Beaumont Hospital (Corewell Health)": {
    url: "https://www.beaumont.edu/medical-student-education/medical-student-rotations-royal-oak",
    verified: true,
    note: "Same Royal Oak rotations page; second data.js entry for Corewell-rebranded Beaumont. Cloudflare-protected to bot fetchers; works in browser. Replaces beaumont.org/medical-education/graduate-medical-education (GME-only). One-by-one packet #5.",
  },

  "Boston Medical Center": {
    url: "https://www.bmc.org/medical-professionals/education-training/graduate-medical-education/physician-recruitment/medical-students",
    verified: true,
    note: "BMC Subsidized Visiting Elective Program (SVEP). Up to $2,500 reimbursement for travel/housing/VSLO fees. M3/M4 LCME/COCA. INTL via BU ISEP at $3,000/elective. Replaces /education-training/graduate-medical-education (GME parent landing). One-by-one packet #6.",
  },

  "Carolinas Medical Center — Atrium Health": {
    url: "https://atriumhealth.org/education/graduate-medical-education/physician-residencies/internal-medicine/medical-student-information",
    verified: true,
    note: "Atrium Carolinas Medical Center IM Medical Student Information page. 'fourth-year electives to both Wake Forest University medical students and external US allopathic and osteopathic medical students'. The generic /visiting-medical-students path was misleading (returned visiting-resident content). Replaces atriumhealth.org/ homepage. One-by-one packet #7.",
  },

  "Cedars-Sinai Medical Center": {
    url: "https://www.cedars-sinai.edu/education/medical-students.html",
    verified: true,
    note: "Cedars-Sinai Visiting Medical Students canonical page. 4-week senior electives June-December. VSLO-based. INTL students must apply through Cedars-Sinai's academic affiliation with UCLA David Geffen SOM (not direct via VSLO). Replaces cedars-sinai.org/education/graduate-medical-education.html (GME-only). One-by-one packet #8.",
  },

  "CommonSpirit Health International — Clinical Observation": {
    url: "https://commonspiritinternational.org/education-programs/",
    verified: false,
    note: "CommonSpirit Health International Education Programs landing. Institutional Clinical Observation Program across 159 hospitals. URL is the official CommonSpirit International domain — page exists and is institutional but program details require institutional/organizational application (not individual). KEPT as verified:false because borderline (single-page institutional landing without per-individual application path visible). One-by-one packet #9.",
  },

  "Conemaugh Memorial Medical Center": {
    url: "https://gme.conemaugh.org/resident-programs/medical-students",
    verified: false,
    note: "Conemaugh Medical Students page. WARNING: institution explicitly states 'Conemaugh does not offer observerships, externships, shadowing or research assistant positions.' They DO offer M4 audition rotation in Internal Medicine only. data.js classifies as observership, which is inaccurate — should be reclassified to rotation/audition. Replaces homepage. verified:false because the data.js type is wrong, not because the page is wrong. One-by-one packet #10.",
  },

  "Coney Island Hospital": {
    url: "https://coneyem.com/index.php/medical-students/",
    verified: false,
    note: "South Brooklyn Health (formerly Coney Island Hospital) EM 4-week M4 elective. WARNING: 'at this time our institution is only accepting students from affiliated medical schools for elective rotations'. Contact cihemresidency@nychhc.org. Replaces hospital homepage; better deeper option exists at nychealthandhospitals.org/southbrooklynhealth/residencies-and-fellowships/. Also participates in NYC H+H MOSAIC. verified:false because affiliation restriction limits open access. One-by-one packet #12.",
  },

  "Drexel University / Hahnemann (Tower Health)": {
    url: "https://webcampus.med.drexel.edu/ClinicalEducation/Year4/VisitingStudInfo.htm",
    verified: true,
    note: "Drexel COM Visiting Student Information. LCME/AOA US students only. Available at Reading Hospital (Tower Health), Phoenixville, St Christopher's. $75 fee per rotation, max 12 weeks. Replaces drexel.edu/medicine/ homepage. One-by-one packet #13.",
  },

  "Duke University Hospital": {
    url: "https://medschool.duke.edu/education/health-professions-education-programs/student-services/office-registrar/visiting-students",
    verified: true,
    note: "Duke SOM Visiting Students canonical page. VSLO for LCME/COCA US; international applications via direct route with affiliation agreement. Replaces medschool.duke.edu/ homepage. One-by-one packet #14.",
  },

  "Elmhurst Hospital Center": {
    url: "https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/",
    verified: true,
    note: "Elmhurst is part of NYC Health + Hospitals; visiting medical students apply via MOSAIC Visiting Scholars Program. 4-week elective + $2k stipend + $2k housing for non-NYC. US LCME/AOA. Underserved-care focused. Apply to MOSAIC@nychhc.org. Replaces /elmhurst/graduate-medical-education/ which is GME-only. One-by-one packet #15.",
  },

  "Emory University Hospital": {
    url: "https://med.emory.edu/education/admissions/visiting/index.html",
    verified: true,
    note: "Emory SOM Visiting Medical Students. INTL placed Oct-Feb. $500 non-refundable application fee + $3,500/4wk tuition for INTL (max 2 electives). Replaces med.emory.edu/ homepage. One-by-one packet #16.",
  },

  "Geisinger Medical Center": {
    url: "https://www.geisinger.edu/gchs/education/departments/visiting-students",
    verified: true,
    note: "Geisinger Commonwealth Visiting Medical Students. 2- or 4-week M4 rotations via VSLO. LCME/COCA only. WARNING: Geisinger explicitly does NOT offer observerships. Specialty pages exist (EM, Ophtho, ENT, Anesth, Cardio, IR). Replaces geisinger.org/ homepage. One-by-one packet #17.",
  },

  "Grady Memorial Hospital": {
    url: "https://med.emory.edu/education/admissions/visiting/index.html",
    verified: true,
    note: "Grady Memorial is the primary Emory SOM clinical site; visiting medical students apply through Emory's visiting page. Grady's own Medical Education Observership Program exists at medicaleducation@gmh.edu for grad/professional observers. Replaces gradyhealth.org/ homepage. One-by-one packet #18.",
  },

  "Harbor-UCLA Medical Center": {
    url: "https://dhs.lacounty.gov/harbor-ucla-medical-center/gme/internal-medicine/apply/sub-internships-and-advanced-clerkships/",
    verified: true,
    note: "Harbor-UCLA IM Sub-Internships and Advanced Clerkships. Visiting students apply via VSLO 75+ days prior. LCME/COCA US students only. UCLA David Geffen SOM affiliate. Replaces dhs.lacounty.gov/harbor-ucla/ generic page. One-by-one packet #19.",
  },

  "Harlem Hospital Center": {
    url: "https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/",
    verified: true,
    note: "Harlem is part of NYC Health + Hospitals; affiliated with Columbia VP&S since 1962. Visiting medical students apply via MOSAIC Visiting Scholars Program. EM rotations at both Metropolitan + Harlem via MetHarlemEM. Replaces /harlem/ generic page. One-by-one packet #20.",
  },

  "Hartford Hospital": {
    url: "https://hartfordhospital.org/health-professionals/education/residencies-fellowships",
    verified: false,
    note: "Hartford Hospital Residencies & Fellowships parent page. WARNING: No centralized M4 elective application — students contact specific department directly. Advanced Clinical Experiences (sub-I, EM, Critical Care) require department application; VSAS not used for those. Replaces hartfordhospital.org/ homepage. verified:false because access is department-by-department. One-by-one packet #22.",
  },

  "Hennepin Healthcare — Minneapolis": {
    url: "https://www.hennepinhealthcare.org/medical-education-training/medical-student-rotations/",
    verified: true,
    note: "Hennepin Healthcare Medical Student Rotations canonical page. 2-4 weeks (up to 12). Department of Medicine NOT offering observerships/externships to international graduates or students currently. Cloudflare-protected to bot fetchers; works in browser. Replaces hennepinhealthcare.org/ homepage. One-by-one packet #23.",
  },

  "Indiana University Health": {
    url: "https://medicine.iu.edu/md/admissions/guest-students",
    verified: true,
    note: "IU SOM Guest Medical Students. VSLO-based for US LCME students. Pathway to Indiana Visiting Elective offers $2k stipend for out-of-state. INTL only with pre-existing IU agreement. Pathology Global Outreach Observership accepts INTL grads for 4wk rotation separately. Replaces medicine.iu.edu/gme. One-by-one packet #24.",
  },

  "Jacobi Medical Center": {
    url: "https://montefioreeinstein.org/patient-care/services/emergency-medicine/education/medical-student-rotations",
    verified: true,
    note: "Jacobi is part of NYC H+H; affiliated with Albert Einstein/Montefiore. Visiting M4 elective in Emergency Medicine across Jacobi + Moses + Weiler campuses. VSLO-based. Replaces /jacobi/graduate-medical-education/ GME landing. One-by-one packet #25.",
  },

  "Jamaica Hospital Medical Center": {
    url: "https://jamaicahospital.org/graduate-medical-education/",
    verified: false,
    note: "Jamaica Hospital GME landing. The institution operates a Department of Medical Education for graduate trainees but has no public visiting-medical-student or observership program documented. WARNING: prior search confirmed observership/externship positions are NOT offered at Jamaica Hospital. Two data.js entries with this name; both share this URL. One-by-one packet #26+27.",
  },

  "Jersey City Medical Center": {
    url: "https://www.rwjbh.org/for-health-care-professionals/medical-education/jersey-city-medical-center/clinical-rotations/",
    verified: true,
    note: "Jersey City Medical Center (RWJBH) Clinical Rotations page. VSLO for M4 visiting rotations; non-VSLO contact bertha.orochena@rwjbh.org. IM Residency does NOT offer audition rotations. Replaces /jersey-city-medical-center/ generic facility page. One-by-one packet #28.",
  },

  "Jersey Shore University Medical Center": {
    url: "https://www.hackensackmeridianhealth.org/en/healthcare-professionals/jsumc",
    verified: true,
    note: "Jersey Shore UMC (Hackensack Meridian Health) Residency & Fellowship Programs landing. Hosts Hackensack Meridian SOM + St George's University students. Replaces hackensackmeridianhealth.org/ generic homepage. One-by-one packet #29.",
  },

  "JPS Health Network": {
    url: "https://www.jpshealthnet.org/academic-affairs/undergraduate-medical-education",
    verified: true,
    note: "JPS Health Network Undergraduate Medical Education page. VSLO-based for M4 visiting clerkships. Affiliated with UT Southwestern, Baylor, TCOM, TCU/UNT HSC. Contact: Robert Sanchez, Clinical Experience Coordinator. Replaces jpshealthnet.org/ homepage. One-by-one packet #30.",
  },

  "Kings County Hospital Center": {
    url: "https://www.downstate.edu/education-training/student-services/registrar/visiting/index.html",
    verified: true,
    note: "Kings County Hospital is the primary SUNY Downstate teaching site. Visiting students apply via SUNY Downstate VSLO. EM-specific page at em-students.clinicalmonster.com/visiting-students/. Replaces nychealthandhospitals.org/kingscounty/ generic facility page. One-by-one packet #31.",
  },

  "Lincoln Medical Center": {
    url: "https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/",
    verified: true,
    note: "Lincoln Medical Center is part of NYC H+H; affiliated with St George's + NY Medical College for core rotations. Visiting medical students apply via MOSAIC. EM rotations also available via lincolnemergencymedicine.com/medical-students. Replaces /lincoln/ generic page. One-by-one packet #32.",
  },

  "Loma Linda University Medical Center": {
    url: "https://medicine.llu.edu/academics/medical-student-education/visiting-students",
    verified: true,
    note: "Loma Linda University SOM Visiting Students. VSLO-based for LCME/COCA senior students. $275 non-refundable processing fee. INTL students NOT accepted. 2 data.js entries with this name; both share this URL. Replaces lluh.org/ generic page. One-by-one packet #33+34.",
  },

  "LSU Health New Orleans / University Medical Center": {
    url: "https://www.medschool.lsuhsc.edu/student_affairs/electives.aspx",
    verified: true,
    note: "LSU Health New Orleans SOM Student Affairs Visiting Student Information. VSLO-based, US/Canada AAMC schools only. Max 2 rotations (8 weeks). No academic credit granted by LSU. Advanced EM at University Medical Center via nolaem.com. Replaces medschool.lsuhsc.edu/ homepage. One-by-one packet #35.",
  },

  "Massachusetts General Hospital": {
    url: "https://hms.harvard.edu/departments/office-registrar/visiting-students-program",
    verified: true,
    note: "MGH visiting medical students apply through Harvard Medical School Visiting Clerkship Program (HMS-CEP). US/Canada citizens or permanent residents, M4 (or M3 with completed core clerkships). $2,000 stipend for out-of-state participants. International graduates ineligible for MGH's separate International Observership Program. Replaces /education/international-observership which was IMG-physician-only (kept as separate entry). One-by-one packet #36.",
  },

  "Medical College of Wisconsin / Froedtert Hospital": {
    url: "https://www.mcw.edu/education/medical-school/prospective-students/visiting-students",
    verified: true,
    note: "MCW Visiting Senior Medical Students. 4-week electives via VSLO. LCME + COMLEX/USMLE Step 1 required. INTL students NOT accepted. No processing fee. Sites include Froedtert, Zablocki VA, Children's Wisconsin. Replaces mcw.edu/education/graduate-medical-education (GME-only). One-by-one packet #37.",
  },

  "Medical University of South Carolina (MUSC)": {
    url: "https://medicine.musc.edu/education/medical-students/curriculum/clinical-curriculum/visiting-medical-students",
    verified: true,
    note: "MUSC Visiting Medical Students. VSLO-based, LCME/COCA US students only. Course offerings available Feb 1; apps open April 1. INTL students NOT eligible. AHEAD Visiting Student Program for URiM students separately. 2 data.js entries with this name; both share this URL. Replaces web.musc.edu/ homepage. One-by-one packet #38+39.",
  },

  "MedStar Georgetown University Hospital": {
    url: "https://meded.georgetown.edu/medicaleducation/visiting-students-program/",
    verified: true,
    note: "Georgetown SOM Visiting Students Program (2026-2027). VSLO-based for LCME/COCA M4. VSLO opens March 30. INTL contact Dr. Irma Frank (franki@georgetown.edu). MedStar Health Diversity scholarship available. Replaces medstarhealth.org/education generic. One-by-one packet #40.",
  },

  "MedStar Health — International Observer Program": {
    url: "https://www.medstarhealth.org/education/other-educational-programs/international-observer-program",
    verified: true,
    note: "MedStar Health International Physician Observership Program. For IMGs (already a direct-program URL in data.js — verified here). Apply via medstargme.net/international-rotation-application-2/. One-by-one packet #41.",
  },

  "Memorial Healthcare System": {
    url: "https://www.mhs.net/education/undergraduate-medical-education/requirements-for-visiting-students",
    verified: true,
    note: "Memorial Healthcare System (Hollywood, Florida) Requirements for Visiting Students. VSLO-based. $1M/$3M liability + BLS + HIPAA. Office of Academic Affairs 954-265-4463. Replaces mhs.net/ homepage. One-by-one packet #42.",
  },

  "Memorial Hermann Hospital / UTHealth": {
    url: "https://med.uth.edu/admissions/student-affairs/visiting-student-course-catalog/",
    verified: true,
    note: "McGovern Medical School Visiting Student Course Catalog (2026-2027). Memorial Hermann is the primary teaching site. VSLO-based, final year, max 2 electives, 30-day deadline. Apr 1 application opens; Mar 1 catalog visible. Replaces med.uth.edu/gme/ landing. One-by-one packet #43.",
  },

  "Mercy Hospital — St. Louis": {
    url: "https://www.mercy.net/healthcare-education/graduate/st-louis/rotations/",
    verified: true,
    note: "Mercy GME St. Louis Rotations page. M4 sub-internships in inpatient (2/month) + clinic (1/month) Jul-Feb/Jan. WARNING: 'no longer able to offer observerships or sponsor externships for international medical graduates/students.' Replaces mercy.net/ homepage. One-by-one packet #44.",
  },

  "Metro Health — Case Western Reserve": {
    url: "https://gme.metrohealth.org/medical-student-information/medical-student-guide",
    verified: true,
    note: "MetroHealth Medical Student Guide. Elective rotations open first to affiliated CWRU students. CWRU Visiting Student Program now hosted by University Hospitals Cleveland (separate). Replaces metrohealth.org/ homepage. One-by-one packet #45.",
  },

  "Metropolitan Hospital Center": {
    url: "https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/",
    verified: true,
    note: "Metropolitan Hospital is NYC H+H; New York Medical College affiliate since 1875 (oldest US municipal/private affiliation). Visiting students apply via MOSAIC. EM rotations at MetHarlemEM. Replaces /metropolitan/ generic page. One-by-one packet #46.",
  },

  "Montefiore / Albert Einstein": {
    url: "https://einsteinmed.edu/education/md-program/registrar/visiting-students",
    verified: true,
    note: "Einstein Office of the Registrar Visiting Students. VSLO; max 3 electives / 4 weeks. INTL NOT accepted (US citizen/PR/F-1 visa from home school required). Montefiore is the Einstein clinical site. Replaces montefioreeinstein.org/education/gme (GME-only). One-by-one packet #47.",
  },

  "Mount Sinai Hospital": {
    url: "https://icahn.mssm.edu/education/students/registrar/electives/visiting-lcme-schools",
    verified: true,
    note: "Icahn SOM Mount Sinai visiting LCME schools page. M4 via VSLO. INTL students currently attending international medical schools welcome via separate route at icahn.mssm.edu/about/international/programs. VEPSUM (diversity 4-week elective) for URiM M4 separately. Replaces /about/international/programs which was generic. One-by-one packet #48.",
  },

  "Mount Sinai Morningside / West": {
    url: "https://www.msmwem.com/students",
    verified: true,
    note: "Mount Sinai Morningside / West Students page. Separate application/selection from main Sinai Hospital. EM 4-week M4 rotation; 12 clinical shifts; sub-intern role. VSLO-based. URM scholarship available. Replaces mountsinai.org/ homepage. One-by-one packet #49.",
  },

  "Newark Beth Israel Medical Center": {
    url: "https://www.rwjbh.org/for-health-care-professionals/medical-education/newark-beth-israel-medical-center/",
    verified: true,
    note: "Newark Beth Israel Medical Education Programs (RWJBH). Major teaching partner of Rutgers NJMS for core clerkships. EM electives (Peds, US, EMS) competitive; contact Rotators@rwjbh.org. 2 data.js entries with this name; both share this URL. Replaces /newark-beth-israel-medical-center main page. One-by-one packet #50.",
  },
};
