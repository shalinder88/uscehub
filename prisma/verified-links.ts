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

  // "Brooklyn USCE — Clinical Rotations" — moved to listings-hidelist.ts in
  //   one-by-one packet #99 (third-party broker, not an institutional USCE
  //   source; physician-owned private-clinic placement service).
  // "AMG Medical Group — Clinical Rotations" — moved to listings-hidelist.ts
  //   in one-by-one packet #97 (Direct Primary Care membership clinic,
  //   $59-$129/month; not an USCE provider at all).
  // "ValueMD Clinical Rotations" — moved to listings-hidelist.ts in
  //   one-by-one packet #98 (forum + Caribbean med-school advertising site,
  //   not an institutional USCE provider).

  // ===== DEPARTMENT-SPECIFIC ONLY (not centralized — marked unverified) =====

  // "Mount Sinai Hospital" — primary entry now in one-by-one packet #48.
  // "NYU Langone Health" — primary entry now in one-by-one packet #54 below.
  // "NewYork-Presbyterian / Columbia" — primary entry now in packet #51.
  // "NewYork-Presbyterian / Weill Cornell" — primary entry now in packet #52.
  // "UCSF Medical Center" — primary entry now in one-by-one packet #74 below.
  // Original stub (verified:false homepage) replaced with the UCSF Visiting Student
  // Program canonical URL after manual reverification.
  "Brigham and Women's Hospital": {
    url: "https://www.brighamandwomens.org/radiology/education-and-training/observerships",
    verified: false,
    note: "Department-specific. Radiology: 1-2 weeks, earns CME credits. EM/Critical Care: 6-12 months, $5,000/month. Max 3 months general, requires faculty sponsor.",
    cost: "Radiology: CME fee. EM/Critical Care: $5,000/month",
  },
  // "Boston Medical Center" — primary entry now lives in one-by-one packet
  // #6 below (URL updated to SVEP page). This stub kept as a comment so the
  // history of the prior verified:false stance is preserved.
  // "Northwell Health System" — primary entry now in one-by-one packet #53 below.
  "Northwestern Memorial Hospital": {
    url: "https://www.feinberg.northwestern.edu/md-education/visiting-students/index.html",
    verified: true,
    note: "Feinberg School of Medicine visiting students canonical page. LCME/AOA fourth-year US medical students; INTL students from Global Partner universities only — see /md-education/visiting-students/international-visiting-students.html. Updated 2026-05-16 (was generic nm.org homepage).",
  },
  // "Rush University Medical Center" — primary entry now in one-by-one packet #62 below.
  // Original stub (verified:false homepage) replaced with the Rush Medical College
  // visiting medical students canonical URL.
  // "Emory University Hospital" — primary entry now in one-by-one packet #16
  // (URL updated to med.emory.edu/education/admissions/visiting/index.html)
  // "Duke University Hospital" — primary entry now in one-by-one packet #14
  // (URL updated to medschool.duke.edu/.../visiting-students)
  "Henry Ford Hospital": {
    url: "https://www.henryford.com/hcp/med-ed/ugme/students/visiting-students",
    verified: true,
    note: "Henry Ford UGME visiting students page (VSLO-based, $125 admin fee per rotation). Updated 2026-05-16 from generic henryford.com homepage. ENT/Microvascular Surgery also runs a separate international observer program; general observation limited to two 8-hour days/year is separate.",
  },
  // "University of Michigan Health" — primary entry now in one-by-one packet
  // #92 below. Original verified:false "only Ophthalmology" stub replaced
  // with the U-M Medical School's centralized Visiting MD Students page.
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

  // "Penn Medicine (UPenn)" — primary entry now in one-by-one packet #59 below.
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
  // "University of Kentucky Medical Center" — primary entry now in one-by-one
  // packet #88 below. Original verified:false stub replaced with the College
  // of Medicine visiting students canonical URL.

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
  // "Wake Forest Baptist / Atrium Health" — key did NOT match data.js
  // program.name ("Wake Forest Baptist Medical Center"). Primary entry now
  // in one-by-one packet #91 below with EXACT data.js key.
  "University Hospital Newark / Rutgers NJMS": {
    url: "https://njms.rutgers.edu/education/registrar/visitingstds.php",
    verified: true,
    note: "Rutgers NJMS visiting students page; 4-week electives at University Hospital Newark and East Orange VA. Multiple departments incl. EM.",
  },
  // "Robert Wood Johnson University Hospital / Rutgers RWJMS" — key did NOT
  // match data.js program.name ("Robert Wood Johnson University Hospital").
  // Primary entry now in one-by-one packet #83 below with EXACT data.js key.
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
  // "University Hospitals Cleveland Medical Center" — key did NOT match data.js
  // program.name ("University Hospitals Cleveland"). Primary entry now in
  // one-by-one packet #77 below with EXACT data.js key.
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

  // "CommonSpirit Health International — Clinical Observation" — upgraded
  // from packet #9 verified:false in one-by-one packet #94 below. Web
  // search confirmed legitimate 4-12 week clinical observation program
  // for international clinical professionals.

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

  // "Hartford Hospital" — primary entry now in one-by-one packet #84 below.
  // Reverified 2026-05-17: Hartford is a UConn SOM teaching affiliate; M4
  // visiting electives flow through UConn's central VSLO pathway. The prior
  // department-by-department guidance still holds for Advanced Clinical
  // Experiences (sub-I, EM, Critical Care).

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

  // "Jamaica Hospital Medical Center" — primary entry now in one-by-one packet
  // #72 below. Reverified 2026-05-17: prior "NOT offered" claim removed in
  // favor of BORDERLINE_KEEP_REVERIFY pending phone outreach. Two data.js
  // entries with this name; both resolve to the same URL.

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

  "NewYork-Presbyterian / Columbia": {
    url: "https://www.vagelos.columbia.edu/education/academic-programs/md-program/visiting-student-program",
    verified: true,
    note: "Columbia VP&S Visiting Student Program (canonical). VSLO for LCME/COCA; OASIS for INTL via /international-visiting-students subpath. Replaces nyp.org/ homepage. One-by-one packet #51.",
  },

  "NewYork-Presbyterian / Weill Cornell": {
    url: "https://medicaleducation.weill.cornell.edu/student-resources/visiting-students",
    verified: true,
    note: "Weill Cornell Medicine Visiting Student Electives (canonical). VSLO for US MD/DO. INTL via WCM Global Health Education (international.weill.cornell.edu/visiting-international-students). No observerships — only clinical electives. Replaces weill.cornell.edu/ root. One-by-one packet #52.",
  },

  "Northwell Health System": {
    url: "https://medicine.hofstra.edu/student-records/visiting",
    verified: true,
    note: "Zucker SOM at Hofstra/Northwell Visiting Medical Students elective info. VSLO for LCME/COCA US M4. INTL via Hofstra affiliation agreement schools only. Replaces northwell.edu generic. One-by-one packet #53.",
  },

  "NYU Langone Health": {
    url: "https://med.nyu.edu/education/md-degree/registration-student-records/information-visiting-md-students",
    verified: true,
    note: "NYU Grossman SOM Visiting MD Students info. VSLO; LCME-approved US schools only; Bellevue primary site. INTL students NOT processed (non-LCME). Replaces med.nyu.edu/ homepage. One-by-one packet #54.",
  },

  "Ochsner Health System": {
    url: "https://education.ochsner.org/clined/medical-student-electives/",
    verified: true,
    note: "Ochsner Health Medical Student Electives (New Orleans). INTL not accepted for clinical electives except via special affiliation agreements. Separate International Observership Program for foreign-employed physicians at /clined/global-is-local/ochsner-international-observership-program/. Replaces ochsner.org/ homepage. One-by-one packet #55.",
  },

  "Olive View-UCLA Medical Center": {
    url: "https://www.oliveviewim.org/people/students/",
    verified: true,
    note: "UCLA-Olive View Internal Medicine medical students page. Olive View-UCLA is a major DGSOM clinical affiliate. M4 sub-internships (general medicine wards + ICUs) + IM subspecialty electives. Applications via UCLA David Geffen SOM VSLO. Underserved-population academic county hospital. Replaces dhs.lacounty.gov/olive-view-ucla/ homepage. One-by-one packet #56.",
  },

  "Oregon Health & Science University (OHSU)": {
    url: "https://www.ohsu.edu/school-of-medicine/visiting-students",
    verified: true,
    note: "OHSU School of Medicine Visiting Students canonical page. VSLO-based. 2 data.js entries with this name; both share this URL. Replaces /school-of-medicine/graduate-medical-education (GME-only). One-by-one packet #57+58.",
  },

  "Penn Medicine (UPenn)": {
    url: "https://www.med.upenn.edu/student/visiting-clerkship-and-mentorship.html",
    verified: true,
    note: "Penn Visiting Clerkship and Mentorship Program. M4 rotations at CHOP, HUP, Penn Presbyterian, Pennsylvania Hospital. Sub-I + elective. INTL via med.upenn.edu/globalhealth/international-trainees-scholars.html (affiliation agreement required). Replaces pennmedicine.org/.../visiting-physicians (physician-observer-only) for student access. One-by-one packet #59.",
  },

  "Reading Hospital — Tower Health": {
    url: "https://towerhealth.org/academic-affairs/medical-student-rotations",
    verified: true,
    note: "Tower Health Academic Affairs Medical Student Rotations (Reading Hospital + Phoenixville + St Christopher's). Drexel COM partnership site. VSLO + Drexel-specific application process. $75 fee, max 12 weeks. Replaces towerhealth.org/ homepage. One-by-one packet #60.",
  },

  "Richmond University Medical Center": {
    url: "https://www.rumcsi.org/careers/graduate-medical-education/",
    verified: false,
    note: "RUMC (Staten Island) GME landing page lists residency programs only — no published M4 visiting student or observership program is visible on the institutional site. BORDERLINE_KEEP_REVERIFY: manual phone outreach to GME office at 844-934-2273 needed to confirm whether any departmental observership exists. Replaces rumcsi.org/ homepage. One-by-one packet #61.",
  },

  "Rush University Medical Center": {
    url: "https://www.rushu.rush.edu/rush-medical-college/visiting-medical-students",
    verified: true,
    note: "Rush Medical College Visiting Medical Students canonical page. US LCME/COCA M4 only; INTL not accepted via this pathway. Application via AAMC VSAS, due 8 weeks before rotation. M3 cores must be complete and student in good standing. Separate Rush Diversity & Inclusion Visiting Scholars Program offers stipend. Quote: 'Rush Medical College welcomes applications for visiting medical students from LCME-accredited or COCA-accredited medical schools only, who want to pursue clinical elective rotations at Rush University Medical Center.' Replaces rushu.rush.edu/ homepage and prior verified:false GME-office stub. One-by-one packet #62.",
  },

  "St. Barnabas Hospital": {
    url: "https://www.sbhny.org/healthcare-professionals/residency-programs/emergency-medicine-residency-program/",
    verified: true,
    note: "SBH Health System (Bronx) Emergency Medicine residency page documents the M4 EM sub-internship for visiting students. 4-week rotation, 10 shifts, primary-provider model. Direct application (not VSAS/VSLO): Leslie Roderick lroderick@sbhny.org / 718-960-6517. Open to any accredited medical school BUT no visa sponsorship — US LCME/COCA + IMGs already in the US in practice. Quote: 'This offering is open to qualified applicants from any medical school. At this time, we cannot accommodate applicants who require a U.S. visa.' 80+ visiting students annually system-wide. CUNY SOM major teaching hospital + NYIT-COM site. Replaces sbhny.org/ homepage. One-by-one packet #63.",
  },

  "St. John's Episcopal Hospital": {
    url: "https://www.ehs.org/medical-education/medical-student-elective/",
    verified: true,
    note: "Episcopal Health Services (St. John's Episcopal, Far Rockaway/Queens) Medical Student Elective page. Electives in Dermatology, OB/GYN, Ophthalmology, Pathology, Psychiatry, Surgery, Wound Care; 2-4 week duration. Affiliation-agreement schools only (US LCME + select INTL via partner relationships). Direct application via Faazia Baksh, Senior Medical Student Coordinator (fbaksh@ehs.org). Quote: 'Pathology: This elective provides exposure to the wide range of clinical services and research activities of the Department of Pathology and Laboratory Medicine. Two and four week rotations are available.' Replaces ehs.org/ homepage. One-by-one packet #64.",
  },

  "Stony Brook University Hospital": {
    url: "https://renaissance.stonybrookmedicine.edu/ugme/visiting_students",
    verified: true,
    note: "Stony Brook Renaissance School of Medicine Visiting Students canonical page. US LCME via AAMC VSLO. INTL accepted only through approved Stony Brook global health education partnerships. Affiliation agreement between SBUH and home medical school is mandatory (6-8 weeks to establish), no exceptions. Applications open early May. No housing provided. Quote: 'Before a student can be accepted for any elective, there must be a fully executed affiliation agreement between Stony Brook University Hospital and the student's home medical school. There are no exceptions.' Replaces renaissance.stonybrookmedicine.edu/gme (GME-only). One-by-one packet #65.",
  },

  "Summa Health System — Akron": {
    url: "https://www.summahealth.org/medicaleducation/elective-programs/senior-elective-information",
    verified: true,
    note: "Summa Health (Akron, OH) Senior Elective Information page. 50+ M4 electives via AAMC VSLO. US LCME/COCA only (M4 + good standing). NEOMED academic affiliation. Meal allowance, free parking, library access, on-call housing available; student supplies $1M/$3M malpractice. Quote: 'Summa Health System accepts visiting student applications through the Visiting Student Learning Opportunity (VSLO) website...Note that students must be an M-4 at the time of rotation and be in good standing at an LCME- or COCA-accredited medical school.' Replaces summahealth.org/ homepage. One-by-one packet #66.",
  },

  "SUNY Downstate Medical Center": {
    url: "https://www.downstate.edu/education-training/student-services/registrar/visiting/index.html",
    verified: true,
    note: "SUNY Downstate Visiting Medical Student program canonical page. US LCME-accredited M4 + Canadian + Puerto Rico medical students (some COCA exceptions). INTL CURRENTLY CLOSED. Apply via AAMC VSLO (formerly VSAS) at least 45 days before start. Step 1/COMLEX pass + BLS + NY infection control cert + background check + flu/COVID vaccination required. Same URL as Kings County Hospital Center (packet #31) — shared Downstate registrar pathway. Quote: 'International Medical Students: Rotation at SUNY Downstate Health Sciences University - College of Medicine are currently closed for international medical students.' Replaces downstate.edu/education-training/graduate-medical-education/index.html (GME-only). One-by-one packet #67.",
  },

  "Tampa General Hospital / USF Health": {
    url: "https://health.usf.edu/registrar/md-visiting-students",
    verified: true,
    note: "USF Health Morsani College of Medicine Visiting Students canonical page (Tampa General is the USF primary teaching hospital). US LCME or COCA-accredited M4 in good standing with required basic clerkships completed; electives only (no required rotations). VSLO application minimum 1 month before start. NO tuition/fee assessed. Student supplies health + malpractice insurance. Quote: 'students must attend an LCME or COCA accredited school' and 'The USF Morsani College of Medicine does not assess tuition or fees for visiting students.' Replaces health.usf.edu/medicine/gme (GME-only). One-by-one packet #68.",
  },

  "Temple University Hospital": {
    url: "https://medicine.temple.edu/education/md-program/visiting-students",
    verified: true,
    note: "Lewis Katz School of Medicine at Temple University Visiting Students canonical page. M4 from accredited medical schools, all required clerkships completed at home institution. BLS or ACLS + criminal background check (within 12 months) required. Application via AAMC VSAS; LKSOM annual elective catalog opens spring after Temple students' fourth year schedules finalized; space-available basis. Contact mdvsas@temple.edu. Quote: 'Applications are made through the Visiting Student Application Service (VSAS). LKSOM's annual elective catalog opens in the spring, after our own students' fourth year schedules have been finalized.' Replaces medicine.temple.edu/education/graduate-medical-education (GME-only). One-by-one packet #69.",
  },

  "Tulane Medical Center": {
    url: "https://medicine.tulane.edu/student-affairs/visiting-students",
    verified: true,
    note: "Tulane University School of Medicine Visiting Students canonical page. US medical schools only; INTL students explicitly NOT accommodated. Senior-year (M4) from US schools with core clerkships, Step 1 pass, and neurology completed before rotation. Application via AAMC VSLO. $225 non-refundable processing fee per rotation. Rotations do NOT carry Tulane MD credit. 2026 offerings publish on/around April 15, 2026. Quote: 'We are NOT able to accommodate students from medical schools located outside of the United States.' Replaces medicine.tulane.edu/ homepage. One-by-one packet #70.",
  },

  "Mount Sinai Beth Israel": {
    url: "https://icahn.mssm.edu/education/students/registrar/electives/visiting-lcme-schools",
    verified: true,
    note: "Icahn School of Medicine at Mount Sinai Visiting Students (LCME schools) canonical page. Same Icahn registrar pathway covers Mount Sinai Beth Israel and all Mount Sinai Health System sites. US LCME final-year M4 via VSAS. Electives primarily at Mount Sinai Hospital + James J. Peters VA + Elmhurst Hospital Center; Beth Israel campus rotations possible via departmental electives. INTL via separate icahn.mssm.edu/education/students/registrar/electives/visiting-abroad. CLASSIFIED PROTECTED_BROWSER_REQUIRED: WebFetch returns HTTP 403 (likely WAF/bot block) but URL is verified live by AAMC and direct browser. Quote from search snippet: 'Students in good standing who have not yet received their MD or DO degree are eligible to apply for an elective at the Icahn School of Medicine at Mount Sinai, and should be in their final year of medical school.' Replaces mountsinai.org/locations/beth-israel/education/graduate-medical-education (GME-only). One-by-one packet #71.",
  },

  "Jamaica Hospital Medical Center": {
    url: "https://jamaicahospital.org/graduate-medical-education/",
    verified: false,
    note: "Jamaica Hospital GME landing. Lists residency programs only; no public M4 visiting-student / observership pathway documented on the institutional site. Two data.js entries with this name; both resolve here. BORDERLINE_KEEP_REVERIFY: per operator policy, absence-of-page ≠ absence-of-program. Manual phone outreach to Department of Medical Education needed; community teaching hospital in Queens historically described as IMG-friendly. Reverified 2026-05-17; replaces prior 'NOT offered' note (couldn't re-confirm). One-by-one packet #72.",
  },

  "Wyckoff Heights Medical Center": {
    url: "https://whmcny.org/undergraduate-education/",
    verified: true,
    note: "Wyckoff Heights Medical Center Undergraduate Education page. 350-bed Brooklyn-Queens border teaching hospital approved by NY State Education Department as teaching site for medical students. 4-week M4 electives + sub-internships (Internal Medicine, OB/GYN, Pediatrics, Surgery + specialty areas). Direct application via Eileen T. Kruck, C-TAGME (EKruck@wyckoffhospital.org); core + sub-I scheduling via home school. Community hospital serving ethnically diverse population; historically IMG-friendly. Two data.js entries with this name; both share this URL. Quote: 'All electives are offered for 4 week blocks.' Replaces wyckoffhospital.org/ homepage. One-by-one packet #73.",
  },

  "UCSF Medical Center": {
    url: "https://meded.ucsf.edu/visiting-student-program",
    verified: true,
    note: "UCSF School of Medicine Visiting Student Program canonical page. US LCME/COCA M4 via AAMC VSLO; INTL students currently not accepted via this pathway. Max 3 months / 12 weeks elective time. $300 non-refundable processing fee per elective. Visiting Elective Scholarship Program (VESP) provides up to $2,000 for disadvantaged students or those committed to UCSF PRIDE values. 2026 application window opens Feb 9, 2026; approvals tentatively Apr 20, 2026. Quote: 'The UCSF School of Medicine uses the AAMC Visiting Student Learning Opportunities (VSLO) Application Service to receive applications from US medical and osteopathic students.' Replaces meded.ucsf.edu/ homepage and prior verified:false stub. One-by-one packet #74.",
  },

  "UC Davis Medical Center": {
    url: "https://health.ucdavis.edu/mdprogram/registrar/visiting.html",
    verified: true,
    note: "UC Davis School of Medicine Visiting Medical Students canonical page. US LCME M4 only (INTL not accepted for clinical experiences). 4-week electives (no required core clerkships). VSLO approval required no later than 60 days before start. Step 1/COMLEX pass + BLS/ACLS + $1M/$3M malpractice + immunizations + HIPAA training required. 2026-2027 cycle opens browsing Mar 16, 2026; applications start Apr 1, 2026. Direct faculty contact prohibited; all coordination through Visiting Medical Student Program. Quote: 'UC Davis School of Medicine welcomes eligible fourth year visiting medical students' participation in our fourth-year electives as space permits.' Replaces health.ucdavis.edu/gme/ (GME-only). One-by-one packet #75.",
  },

  "UC Irvine Medical Center": {
    url: "https://medschool.uci.edu/education/medical-education/medical-degree-program/curriculum/md-program-electives",
    verified: true,
    note: "UC Irvine School of Medicine MD Program Electives canonical page. US LCME via AAMC VSLO; INTL accepted ONLY from schools with established UCI exchange agreement (contact comextra@hs.uci.edu). $300 fee per course. M3 + M4 extramural electives across Emergency Medicine, Surgery, Orthopedics, Anesthesiology, and other clinical departments. Quote: 'Due to the high volume of requests, the extramural application process is done through the Association of American College's AAMC Visiting Student Learning Opportunities (VSLO).' Replaces ucihealth.org/ homepage. One-by-one packet #76.",
  },

  "University Hospitals Cleveland": {
    url: "https://www.uhhospitals.org/medical-education/undergraduate-medical-education/visiting-medical-student-program/visiting-medical-student-program-clevel",
    verified: true,
    note: "University Hospitals Cleveland Medical Center Visiting Medical Student Program canonical page. US LCME/AOA M4 via AAMC-VSLO; primary teaching hospital of Case Western Reserve University SOM (Case students get priority scheduling). Applications open mid-January, offers mid-March. Covers UH Rainbow Babies & Children's, MacDonald Women's, Seidman Cancer Center. Replaces uhhospitals.org/medical-education/graduate-medical-education (GME-only) and prior 'University Hospitals Cleveland Medical Center' key (suffix mismatch with data.js). Quote: 'Domestic students who have completed their core clinical training and will be in the fourth year of medical education at their LCME- or AOA- accredited medical schools can apply.' One-by-one packet #77.",
  },

  "UT Southwestern Medical Center": {
    url: "https://medschool.utsouthwestern.edu/admissions/visiting/",
    verified: true,
    note: "UT Southwestern Medical School Visiting Medical Students canonical page (replaces old utsouthwestern.edu/education/medical-school/admissions/visiting/ → 301 redirect). US LCME/COCA M4 via AAMC VSLO; INTL via separate VMS pathway at medschool.utsouthwestern.edu/admissions/visiting/international.html (custom application portal). Max 2 four-week electives per student. Rotation/malpractice fees apply. Must be 'Good Standing' verified via VSLO. BLS/ACLS within 12 months + Castle Branch background check after acceptance. Two data.js entries with this name; both resolve here. Replaces utsouthwestern.edu/education/graduate-medical-education/ (GME-only) and utsouthwestern.edu/ homepage. One-by-one packet #78.",
  },

  "UT Health San Antonio": {
    url: "https://uthscsa.edu/medicine/education/ume/student-affairs/student-wellness/visiting-students",
    verified: true,
    note: "Long School of Medicine (LSOM) at UT Health San Antonio Visiting Students canonical page. US LCME/COCA M4 via AAMC VSLO (institution filter: UT HSC San Antonio Long SOM). 4-week advanced electives. Department selections finalized 4 weeks before start. INTL explicitly NOT accepted. Affiliation agreement + immunizations required. Quote: 'The Long School of Medicine is currently not accepting students from Non-Accredited or International Medical Schools. Allopathic (LCME) and Osteopathic (COCA) medical schools are eligible to apply.' Replaces uthscsa.edu/ homepage. One-by-one packet #79.",
  },

  "UNC Hospitals": {
    url: "https://www.med.unc.edu/md/student-affairs/visiting-students/",
    verified: true,
    note: "UNC School of Medicine Visiting Student Program canonical page. US LCME M4 ('domestic students in their final year') via AAMC VSLO/VSAS. Affiliated sites across NC (Asheville, Chapel Hill, Charlotte, Greensboro, Raleigh, Wilmington). INTL via separate IVS pathway at med.unc.edu/oghe/visiting-international-students/ivs-application-requirements/ (Office of Global Health Education). 1 letter of recommendation + personal statement required. Contact visitingstudent@med.unc.edu (Lucas Ramsey). Quote: 'The University of North Carolina School of Medicine's Visiting Student Program offers domestic students in their final year of medical school the opportunity to participate in educational, engaging and challenging clinical elective experiences.' Replaces med.unc.edu/ homepage. One-by-one packet #80.",
  },

  "Mercy Hospital St. Louis": {
    url: "https://www.mercy.net/healthcare-education/graduate/st-louis/rotations/",
    verified: true,
    note: "Mercy GME St. Louis Rotations page (no-em-dash data.js variant; companion to 'Mercy Hospital — St. Louis' em-dash entry at packet #44). M4 visiting rotations in Critical Care, Family Medicine, Internal Medicine, OB/GYN. Direct application packet (form + school letter + $1-3M malpractice + immunizations + COVID/flu + PPD + confidentiality form); submit 6 months before rotation. WARNING: 'We are no longer able to offer observerships or sponsor externships for international medical graduates/students.' Replaces mercy.net/ homepage. One-by-one packet #81.",
  },

  "University of Missouri Health Care": {
    url: "https://medicine.missouri.edu/offices-programs/education/medical-education-curriculum/visiting-student-information",
    verified: true,
    note: "University of Missouri (Columbia) SOM Visiting Student Information canonical page. US LCME/COCA M4 only (must have completed M3 core clerkships); INTL explicitly NOT accepted. Application: VSLO. Background check + 7-panel drug screen + $1M/$3M malpractice + flu shot (Oct-Apr). No housing provided. No required core clerkships taken by visitors. Quote: 'We are only accepting visiting students from U.S. accredited LCME and COCA medical schools. Students must have completed the third-year core clerkships before their visiting rotation begins. We are not accepting international student applications.' Replaces medicine.missouri.edu/ homepage. One-by-one packet #82.",
  },

  "Robert Wood Johnson University Hospital": {
    url: "https://rwjms.rutgers.edu/education/md/visiting-students",
    verified: true,
    note: "Rutgers Robert Wood Johnson Medical School Visiting Students canonical page. US LCME/COCA M4 only via AAMC VSLO; M3/preclinical NOT accepted; INTL + Canadian students NOT accepted via VSLO (alternative observership program may exist). $75 non-refundable fee per accepted elective. Max 16 weeks total. 2026-2027 applications open February 2026; ~35-day decision turnaround. No travel/housing/living expenses provided. Replaces rwjms.rutgers.edu/ homepage and prior suffix-mismatch key. Quote: 'For the academic year 2026–2027, all visiting rotations are coordinated through the Association of American Medical Colleges' (AAMC) Visiting Student Learning Opportunities (VSLO).' One-by-one packet #83.",
  },

  "Hartford Hospital": {
    url: "https://medicine.uconn.edu/visiting-students/",
    verified: true,
    note: "Hartford Hospital is a UConn School of Medicine teaching affiliate; M4 visiting electives flow through UConn's central VSLO pathway (medicine.uconn.edu/visiting-students/). US LCME + AOA only; INTL explicitly NOT accepted. Applications open April–mid-July. Background check $75 if needed via UConn Public Safety. Advanced Clinical Experiences (sub-I, EM, Critical Care) require separate department application (NOT VSAS/VSLO) at the Hartford Hospital department directly. Contact visitingmed@uchc.edu. Reverify 2026-05-17 supersedes prior 'no centralized M4 application' packet #22 note — UConn IS the centralized application for non-advanced rotations. Quote: 'Students must apply through the Visiting Student Learning Opportunities (VSLO) software, to receive visiting student applications.' Replaces hartfordhospital.org/health-professionals/education/residencies-fellowships. One-by-one packet #84.",
  },

  "UT Health Memphis / Regional One Health": {
    url: "https://uthsc.edu/medicine/visiting-students.php",
    verified: true,
    note: "UT Health Science Center Memphis College of Medicine Visiting Students canonical page (Regional One Health is UTHSC primary public hospital affiliate). Elective opportunities across Memphis, Knoxville, Chattanooga, Nashville/Murfreesboro, Jackson. US LCME M4 via VSLO; D.O. accepted (must be 'candidate for the M.D. or D.O. degree in good standing in an accredited medical school'). Max 8 weeks total experience across the system. Must have completed Family Medicine, Medicine, Neurology, Pediatrics, Surgery, Psychiatry, OB-Gyn core clerkships. Contact Karen Coleman visiting@uthsc.edu / 901.448.3843. Quote: 'U.S. LCME medical students, please complete a VSLO application for your preferred electives and dates.' Replaces uthsc.edu/graduate-medical-education/ (GME-only). One-by-one packet #85.",
  },

  "University of Virginia Health System": {
    url: "https://med.virginia.edu/md-program/student-affairs/visiting-student-electives/",
    verified: true,
    note: "UVA School of Medicine Visiting Student Electives canonical page. LCME-accredited US schools ONLY — UVA does NOT accept osteopathic (COCA) or international medical students. AAMC VSLO application. Up to 4 weeks of electives across 21+ specialties. FREE tuition. Student must provide own malpractice insurance ('The malpractice insurance of the University of Virginia School of Medicine does not cover visiting students.'). 2026 rotation blocks: A 6/8-7/3, B 7/6-7/31, C 8/3-8/28, D 8/31-9/25, E 9/28-10/23. Quote: 'We only accept visiting students from LCME Accredited Medical Schools.' Replaces med.virginia.edu/ homepage. One-by-one packet #86.",
  },

  "VCU Health / MCV Hospitals": {
    url: "https://medschool.vcu.edu/md/m4_electives/visiting_students/",
    verified: true,
    note: "VCU School of Medicine (Medical College of Virginia / VCU Health) Visiting Students canonical page. CLASSIFIED PROTECTED_BROWSER_REQUIRED: WebFetch returns HTTP 404 due to anti-bot/redirect protection but URL is live in browser per VCU Surgery alternate page confirmation. AAMC VSLO required for non-VCU M4 applicants; positions allocated AFTER VCU students. 2026-2027 catalog opens February 2026. Contact Visiting Student Coordinator Jessica.Dymon@vcuhealth.org or somregistrar@vcuhealth.org. Quote (from surgery.vcu.edu confirmation): 'If you are seeking an M4 elective and NOT a student at VCU SOM you must go through AAMC's VSLO Application Service (VSLO) to apply for an elective at VCU.' Replaces vcuhealth.org/ homepage. One-by-one packet #87.",
  },

  "University of Kentucky Medical Center": {
    url: "https://medicine.uky.edu/sites/meded/visiting-students",
    verified: true,
    note: "University of Kentucky College of Medicine — Lexington Campus Visiting Students canonical page. US LCME/AOA M4 only via AAMC VSLO (M3+M4 accepted but M4 prioritized). Mandatory affiliation agreement between UK COM and home school (cancellation if not finalized by rotation date). $75 one-time placement fee. Quote: 'If you are enrolled as a fourth-year medical student at a school that is accredited by the United States Liaison Committee on Medical Education (LCME) or the American Osteopathic Association (AOA), we invite you to apply for an elective at the College of Medicine-Lexington Campus through VSLO.' Replaces med.uky.edu/graduate-medical-education (GME-only) and prior verified:false stub. One-by-one packet #88.",
  },

  "University of Nebraska Medical Center": {
    url: "https://catalog.unmc.edu/medicine/visiting-students/",
    verified: true,
    note: "UNMC College of Medicine Visiting Students catalog canonical page. US LCME/COCA M4 only — INTL explicitly NOT accepted. Application: AAMC VSLO. 4-week rotations only (no 2-week options), one rotation per student. Senior/final year. Background check + USMLE Step 1 or COMLEX scores + immunizations required. Contact VSLO@unmc.edu. Quote: 'The University of Nebraska Medical Center College of Medicine (COM) does not accept applications from students attending: foreign medical schools, non-LCME accredited M.D. institutions, non-COCA accredited D.O. institutions.' Replaces unmc.edu/ homepage. One-by-one packet #89.",
  },

  "University of Utah Health": {
    url: "https://medicine.utah.edu/students/visiting",
    verified: true,
    note: "University of Utah Spencer Fox Eccles School of Medicine (SFESOM) Visiting Students canonical page (covers BOTH data.js entries with this name: medicine.utah.edu/gme/ and healthcare.utah.edu/). CLASSIFIED PROTECTED_BROWSER_REQUIRED: WebFetch returns HTTP 403 (anti-bot block) but URL is live in browser per Google index. AAMC VSLO required. Must have completed 6 of CORE Clerkships (IM, Surgery, Peds, OB/GYN, Psych, FM; Neurology may be required). Application packet: transcript + Step 1 + letter of interest + background check + 5-panel drug test. Contact visitingstudents@hsc.utah.edu. Department Sponsored Visitors Program (medicine.utah.edu/global-health-education/department-sponsored-visitors-program) is separate INTL/global-health pathway. Replaces both data.js URLs. One-by-one packet #90.",
  },

  "Wake Forest Baptist Medical Center": {
    url: "https://school.wakehealth.edu/education-and-training/md-program/visiting-medical-students/",
    verified: true,
    note: "Wake Forest University School of Medicine Visiting Medical Students canonical page (covers both Winston-Salem and Charlotte, NC campuses via Atrium Health partnership). M4 MD/DO via AAMC VSLO, opens March 13, 2026. US LCME/COCA M4 + INTL accepted (INTL face significant limits: $100 application fee + $2,500 admin fee for 4-week rotation; 5-week cancellation policy). Must have completed M3 + passed USMLE Step 1 or COMLEX Level 1. Priority: Wake Forest students > visiting domestic > INTL. Quote: 'Wake Forest University School of Medicine and Atrium Health are considering applications for visiting 4th-year medical student clinical opportunities for both Charlotte, NC, and Winston-Salem, NC, locations. Visiting MD and DO applications through VSLO® will open March 13, 2026.' Replaces school.wakehealth.edu/ homepage and prior suffix-mismatch key. One-by-one packet #91.",
  },

  "University of Michigan Health": {
    url: "https://medschool.umich.edu/programs-admissions/visiting-md-students",
    verified: true,
    note: "University of Michigan Medical School Visiting MD Students canonical page (Michigan Medicine). CLASSIFIED PROTECTED_BROWSER_REQUIRED: WebFetch returns HTTP 403 (anti-bot block) but URL is live in browser per Google index. US LCME M4 only — must have completed 48 weeks of required rotations at home school. Application via AAMC VSLO Domestic Network ONLY (no out-of-VSLO applications). Max 8 weeks total. Research electives not permitted via this pathway. Only catalog electives accepted; periods set by VSLO. Replaces medicine.umich.edu/medschool/education/gme/visiting-observers (GME-only) + prior verified:false 'Ophthalmology-only' stub. One-by-one packet #92.",
  },

  "UAB Hospital (University of Alabama at Birmingham)": {
    url: "https://www.uab.edu/medicine/home/current-students/registrar-records/visiting-student-program",
    verified: true,
    note: "UAB Heersink School of Medicine Visiting Student Program canonical page. US LCME or AOA accredited only — must be US citizen or permanent resident. AAMC VSLO required. Visiting students scheduled on space-available basis after UAB students. Elective catalog browsing mid-Feb; applications open early March; offers April 1. 4-week electives (2-week option in urology). 3 regional campuses (Birmingham, Huntsville, Tuscaloosa). $150 fee to secure spot after offer. International students via separate pathway at uab.edu/medicine/international/international-programs/international-visiting-medical-students. Contact visiting@uab.edu. Quote: 'All students must be US citizens or permanent residents attending an LCME-accredited medical school or osteopathic school accredited by American Osteopathic Association (AOA). We only accept students applying through the AAMC Visiting Students Learning Opportunities (VSLO) program.' Replaces uab.edu/medicine/gme/ (GME-only). One-by-one packet #93.",
  },

  "CommonSpirit Health International — Clinical Observation": {
    url: "https://commonspiritinternational.org/education-programs/",
    verified: true,
    note: "CommonSpirit Health International Clinical Observation Program canonical page. Legitimate institutional INTL observation program across CommonSpirit's 159 US hospitals. 4-12 week observation, INTL physicians + nurses + allied health staff; designed to give 'international clinical professionals an informal opportunity to shadow their American colleagues in our affiliated facilities in the United States.' Federally compliant: NO patient care, NO volunteer research. Application requires institutional/organizational application (not individual student VSLO). Upgrades packet #9's verified:false. Quote (from CommonSpirit International search-confirmed): 'Observation Program participants are able to witness best practices and systems and processes in a variety of real-world settings over a 4- to 12-week period including patient care delivered in a variety of care settings (hospitals, clinics, surgery centers, etc.)' One-by-one packet #94.",
  },

  "Crozer-Chester Medical Center": {
    url: "https://crozerem.com/medical-students/",
    verified: false,
    note: "Crozer-Chester Emergency Medicine Residency Medical Students page (Drexel COM clerkship affiliate). Welcomes MS3 and 'auditioning MS4' students for EM rotations but no centralized institutional M4 visiting/observership program documented; access is via Drexel-Crozer clerkship pathway. Contact Pollianne Ward-Bianchi, MD (Drexel Clerkship Director) Pollianne.Ward@crozer.org or Shayna Caliman (EM Residency Coordinator) Shayna.Caliman@crozer.org. BORDERLINE_KEEP_REVERIFY: real M4 EM auditions exist but the broader institutional visiting-medical-student program is not separately documented; per operator policy, absence of dedicated institutional page ≠ absence of program. Replaces crozerhealth.org/ homepage. One-by-one packet #95.",
  },

  "University of Texas Medical Branch (UTMB)": {
    url: "https://www.utmb.edu/enrollmentservices/currentstudents/visiting-students",
    verified: true,
    note: "UTMB Office of Enrollment Services Visiting Medical Students canonical page (Galveston). US medical schools final-year M4 via AAMC VSLO; non-US students ONLY if home school has active affiliation + incoming program agreement with UTMB. Applications open mid-April or early May. $100 processing fee per course (due 10 days after acceptance). Malpractice $25K/$75K minimum. NO off-block rotations. Quote: 'Medical students from other U.S. institutions in their final year of medical school may apply to take an elective at UTMB through the VSLO Application Service.' Replaces utmb.edu/ homepage. One-by-one packet #96.",
  },

  "University of New Mexico Hospital": {
    url: "https://hsc.unm.edu/medicine/education/md/student-affairs/visiting-medical-students/",
    verified: true,
    note: "UNM School of Medicine Visiting Medical Students canonical page. US LCME/COCA + INTL (if home school participates in VSLO) M4 final-year. AAMC VSLO ONLY — direct faculty contact prohibited. 4-week elective clerkships for credit. NO observerships, shadowing, research electives, or pre-clinical experiences offered. USMLE Step 1 (or COMLEX for DO) required + affiliation agreement before rotation. Rotations at UNM Hospital primarily; outside clinic assignments not made. Quote: 'The University of New Mexico School of Medicine welcomes final-year visiting medical students to participate in four-week elective clerkships for credit.' Replaces hospitals.health.unm.edu/ homepage. One-by-one packet #100.",
  },
};
