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
    url: "https://dom.pitt.edu/education/eop/",
    verified: true,
    note: "Enhanced Observership Program (EOP) for IMGs applying to IM residency. Requires Step 2 CK. 75% match rate.",
  },
  "Massachusetts General Hospital": {
    url: "https://www.massgeneral.org/education/international-observership",
    verified: true,
    note: "WARNING: NOT for medical students or recent graduates. Only for currently practicing physicians with MD/PhD/MBBS. Requires IELTS/TOEFL. Some countries ineligible.",
  },
  "UCLA Medical Center": {
    url: "https://www.uclahealth.org/international-services/medical-education-training/physicians/physician-observerships",
    verified: true,
    cost: "Fee required — contact program for amount",
    note: "International Physician Observership. 1-3 months. Certificate of Participation. Requires B-1 visa (UCLA cannot assist with visas).",
  },
  "Stanford Health Care": {
    url: "https://med.stanford.edu/shctv/education/observership.html",
    verified: true,
    cost: "$1,500 for practicing physicians (some departments); varies by department",
    note: "Visiting Observer Program. Max 30 days in 12 months. Requires faculty host. Processing ~8 weeks. No visa sponsorship.",
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
  "University of Washington Medical Center": {
    url: "https://medicine.uw.edu/education/observerships",
    verified: true,
    note: "UW does NOT generally offer IMG observerships. Exceptions: Pathology Global Observership (1 month, up to $2,500 stipend), Radiology (1 day to 4 weeks).",
  },
  "University of Florida Health / Shands Hospital": {
    url: "https://hr.med.ufl.edu/volunteers/onserving-shadowing-application-process/",
    verified: true,
    note: "General observer program — up to 6 months. Must find own sponsoring clinician. Anesthesiology $25 app fee.",
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
    url: "https://www.nm.org/",
    verified: false,
    note: "No centralized observership for IMGs. Department-by-department basis only. Pathology program currently NOT accepting applications.",
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
    url: "https://www.henryford.com/",
    verified: false,
    note: "Department-specific only. ENT/Microvascular Surgery has international observer program. General observation limited to two 8-hour days/year.",
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
    url: "https://www.bcm.edu/",
    verified: false,
    note: "Department-specific only. $25 processing fee. Max 90 days. Insurance required ($100K min). No centralized observership portal.",
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
    url: "https://www.med.wayne.edu/",
    verified: false,
    note: "Multiple departments explicitly state they do NOT offer observerships. No public-facing program page exists.",
  },
  "Yale-New Haven Hospital": {
    url: "https://medicine.yale.edu/",
    verified: false,
    note: "Yale explicitly does NOT offer observerships or externships. Only visiting student elective rotations for final-year medical students.",
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
  "Penn Medicine (UPenn)": {
    url: "https://www.pennmedicine.org/",
    verified: false,
    note: "Perelman School of Medicine does NOT sanction observerships, shadowing, or internships. No centralized program.",
  },
  "Yale-New Haven Hospital": {
    url: "https://medicine.yale.edu/",
    verified: false,
    note: "Yale explicitly does NOT offer observerships or externships.",
  },
  "Wayne State University / Detroit Medical Center": {
    url: "https://www.med.wayne.edu/",
    verified: false,
    note: "Multiple departments explicitly do NOT offer observerships.",
  },
  // Spectrum Health / Corewell - explicitly no observerships
  // Beaumont Hospital - now Corewell, no observerships
  // HCA Healthcare - no centralized observership across 72 hospitals
  // Tenet Healthcare - no observership found
  // CommonSpirit Health - no observership found
  // Mercy Health St. Louis - no longer offers observerships
};
