// Verified program links — ONLY URLs confirmed to go to dedicated observership/externship/observer program pages
// A generic "GME" page does NOT count as verified
// Last audit: March 22, 2026
// Source: Direct web verification of each URL

export const VERIFIED_LINKS: Record<string, { url: string; verified: boolean; note?: string; cost?: string }> = {

  // ===== CONFIRMED DEDICATED OBSERVERSHIP/OBSERVER PROGRAM PAGES =====

  "Cleveland Clinic": {
    url: "https://my.clevelandclinic.org/departments/international-medical-education/international-programs/physician-observer",
    verified: true,
    cost: "$500 ($200 non-refundable + $300 balance)",
    note: "International Physician Observer Program. 1 month. Open to international physicians practicing abroad, residents, fellows, and medical students.",
  },
  "Cleveland Clinic Florida": {
    url: "https://my.clevelandclinic.org/florida/medical-professionals/education/observerships",
    verified: true,
  },
  "Johns Hopkins Hospital": {
    url: "https://www.hopkinsmedicine.org/volunteer-services/observerships",
    verified: true,
    cost: "Free — must find own JHM physician sponsor",
    note: "Max 100 hours over 12 months. Application portal at volunteerservices.jhmi.edu. Cannot provide visa documentation.",
  },
  "Houston Methodist Hospital": {
    url: "https://www.houstonmethodist.org/for-health-professionals/global-health-care-services/global-health-care-education/observerships/",
    verified: true,
    cost: "Contact program",
    note: "2-4 weeks. Must be initiated by a Houston Methodist physician. Certificate of completion available. No direct patient care.",
  },
  "MD Anderson Cancer Center": {
    url: "https://www.mdanderson.org/education-training/outreach-programs/observer-programs/other-observership-opportunities-at-md-anderson.html",
    verified: true,
  },
  "Memorial Sloan Kettering — Research Fellowship": {
    url: "https://www.mskcc.org/hcp-education-training/international/observership",
    verified: true,
  },
  "UPMC (University of Pittsburgh Medical Center)": {
    url: "https://dom.pitt.edu/education/eop/",
    verified: true,
    note: "Enhanced Observership Program (EOP) — specifically for IMGs planning to apply to internal medicine residency. Requires USMLE Step 2 CK. 75% match rate for participants.",
  },
  "University of Chicago Medicine": {
    url: "https://www.uchicagomedicine.org/international/international-collaboration/education-and-training",
    verified: true,
    note: "Global Education & Training page for international physicians. Requires UChicago faculty sponsor. Max 30 days. No hands-on patient care.",
  },
  "University of Illinois at Chicago (UIC)": {
    url: "https://medicine.uic.edu/education/international-education/observership-program/",
    verified: true,
    note: "Limited to full-time medical students with prior professional relationship with UIC COM faculty. Not available to medical graduates.",
  },

  // ===== CONFIRMED FROM USER-PROVIDED EXAMPLES =====

  // Allegheny Health Network — not in our database yet, add if desired
  // https://www.alleghenyinternational.org/observerships.html

  // Mount Sinai Medical Center Miami Beach — not in our database yet
  // https://www.msmc.com/education/educational-courses-and-events/international-observership-courses/

  // UNMC — department-specific observer info
  // https://www.unmc.edu/intmed/divisions/onchem/education/index.html

  // ===== THIRD-PARTY PLACEMENT SERVICES =====

  "Brooklyn USCE — Clinical Rotations": {
    url: "https://brooklynusce.com/",
    verified: true,
    note: "Third-party clinical rotation placement service",
  },
  "AMG Medical Group — Clinical Rotations": {
    url: "https://amgmedicalgroup.com/",
    verified: true,
    note: "Third-party clinical rotation placement service",
  },
  "ValueMD Clinical Rotations": {
    url: "https://www.valuemd.com/clinical-rotations/",
    verified: true,
    note: "Third-party clinical rotation placement service",
  },

  // ===== DEPARTMENT-SPECIFIC OBSERVERSHIP PAGES (verified but not centralized) =====
  // These hospitals don't have hospital-wide observership programs but specific departments do

  "Emory University Hospital": {
    url: "https://med.emory.edu/departments/radiology/education/observer-program/index.html",
    verified: false,
    note: "Radiology department observer program only. General observerships require credentialing office. Fee: $15 + $10 badge. Must find own sponsor.",
  },
  "Duke University Hospital": {
    url: "https://medschool.duke.edu/",
    verified: false,
    note: "No centralized observership program. Department-specific only. Ophthalmology and Radiology ($1,900/week) have dedicated pages.",
  },
  "Henry Ford Hospital": {
    url: "https://www.henryford.com/",
    verified: false,
    note: "Department-specific observer programs only. ENT/Microvascular Surgery has dedicated page. General observation limited to two 8-hour days per year.",
  },
  "University of Michigan Health": {
    url: "https://medicine.umich.edu/",
    verified: false,
    note: "Only Ophthalmology (Kellogg Eye Center) has visible observership application. Fee: $250. No centralized hospital-wide program.",
  },
  "Northwestern Memorial Hospital": {
    url: "https://www.nm.org/",
    verified: false,
    note: "No centralized observership for IMGs. Department-by-department basis only. Pathology had one but currently NOT accepting applications.",
  },
  "Rush University Medical Center": {
    url: "https://www.rushu.rush.edu/",
    verified: false,
    note: "GME office does NOT manage observerships. Department-level only. Neurosurgery has dedicated observership page.",
  },
  "Ohio State University Wexner Medical Center": {
    url: "https://medicine.osu.edu/departments/office-of-global-health/international-visiting-scholars",
    verified: false,
    note: "International Visiting Scholars only — requires invitation from OSU faculty. No unsolicited applications.",
  },
  "Baylor College of Medicine": {
    url: "https://www.bcm.edu/",
    verified: false,
    note: "Department-specific only. $25 processing fee. Max 90 days. Insurance required ($100K min). No centralized observership portal.",
  },
  "Vanderbilt University Medical Center": {
    url: "https://www.vumc.org/observational-services/welcome-vanderbilt-observational-experience-voe-program",
    verified: false,
    note: "Vanderbilt Observational Experience (VOE) limited to one 8-hour session per year. IM residency does NOT offer observerships.",
  },
  "Mayo Clinic": {
    url: "https://college.mayo.edu/academics/visiting-medical-student-clerkships/",
    verified: false,
    note: "Visiting Medical Student Clerkships for enrolled students only ($350 application fee). No centralized IMG observership program. Contact physician directly.",
  },

  // ===== PROGRAMS WITH NO OBSERVERSHIP =====

  "Cook County Hospital (Stroger)": {
    url: "https://cookcountyhealth.org/",
    verified: false,
    note: "Cook County Health explicitly does NOT offer observership or shadowing experiences. Firm policy.",
  },
};
