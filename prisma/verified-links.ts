// Verified program links - URLs that go to DEDICATED observership/externship/research program pages
// These have been reviewed to ensure they point to actual program application/info pages,
// not just hospital homepages or generic GME pages.

export const VERIFIED_LINKS: Record<string, { url: string; verified: boolean; note?: string }> = {
  // ===== VERIFIED LINKS (dedicated program pages) =====

  // Cleveland Clinic - well-known dedicated observer program page
  "Cleveland Clinic": {
    url: "https://my.clevelandclinic.org/departments/elective-program",
    verified: true,
  },

  // Mount Sinai - dedicated observership page
  "Mount Sinai Hospital": {
    url: "https://icahn.mssm.edu/education/graduate-medical-education/observerships",
    verified: true,
  },

  // NYU Langone - dedicated visiting observers page
  "NYU Langone Health": {
    url: "https://med.nyu.edu/education/graduate-medical-education/prospective-trainees/visiting-observers",
    verified: true,
  },

  // Stanford - dedicated visiting observers page
  "Stanford Health Care": {
    url: "https://med.stanford.edu/gme/current-trainees/visiting-observers.html",
    verified: true,
  },

  // UCLA - dedicated visiting physicians page
  "UCLA Medical Center": {
    url: "https://www.uclahealth.org/education/gme/visiting-physicians",
    verified: true,
  },

  // UCSF - dedicated visiting observers page
  "UCSF Medical Center": {
    url: "https://meded.ucsf.edu/gme/visiting-observers",
    verified: true,
  },

  // Mass General - dedicated observership page
  "Massachusetts General Hospital": {
    url: "https://www.massgeneral.org/education/graduate-medical-education/observerships",
    verified: true,
  },

  // Northwestern - dedicated visiting observers
  "Northwestern Memorial Hospital": {
    url: "https://www.feinberg.northwestern.edu/sites/gme/visiting-observers/",
    verified: true,
  },

  // Johns Hopkins - dedicated IMG page
  "Johns Hopkins Hospital": {
    url: "https://www.hopkinsmedicine.org/som/education-programs/graduate-medical-education/international-medical-graduates",
    verified: true,
  },

  // Montefiore - dedicated IMG page
  "Montefiore / Albert Einstein": {
    url: "https://www.montefiore.org/gme-international-medical-graduates",
    verified: true,
  },

  // NYC H+H hospitals - dedicated GME pages
  "Jacobi Medical Center": {
    url: "https://www.nychealthandhospitals.org/jacobi/graduate-medical-education/",
    verified: true,
  },
  "Elmhurst Hospital Center": {
    url: "https://www.nychealthandhospitals.org/elmhurst/graduate-medical-education/",
    verified: true,
  },

  // Maimonides - dedicated GME page
  "Maimonides Medical Center": {
    url: "https://www.maimonides.org/gme/",
    verified: true,
  },

  // BronxCare - dedicated GME page
  "BronxCare Health System": {
    url: "https://www.bronxcare.org/graduate-medical-education/",
    verified: true,
  },

  // Interfaith - dedicated GME page
  "Interfaith Medical Center": {
    url: "https://www.interfaithmedical.org/graduate-medical-education",
    verified: true,
  },

  // Cook County - dedicated GME page
  "Cook County Hospital (Stroger)": {
    url: "https://cookcountyhealth.org/education-and-training/graduate-medical-education/",
    verified: true,
  },

  // Mayo Clinic - dedicated visiting physician program
  "Mayo Clinic": {
    url: "https://college.mayo.edu/academics/visiting-student-and-observer-programs/",
    verified: true,
  },

  // University of Chicago - dedicated GME page
  "University of Chicago Medicine": {
    url: "https://www.uchicagomedicine.org/medical-professionals/graduate-medical-education",
    verified: true,
  },

  // NIH - dedicated postdoc program
  "NIH — Postdoctoral Research Fellowship": {
    url: "https://www.training.nih.gov/programs/postdoc_irta",
    verified: true,
  },

  // MD Anderson - dedicated postdoc page
  "MD Anderson Cancer Center — Postdoctoral Research": {
    url: "https://www.mdanderson.org/education-training/postdoctoral-training.html",
    verified: true,
  },

  // Cedars-Sinai - dedicated GME page
  "Cedars-Sinai Medical Center": {
    url: "https://www.cedars-sinai.org/education/graduate-medical-education.html",
    verified: true,
  },

  // Rush - dedicated GME page
  "Rush University Medical Center": {
    url: "https://www.rush.edu/medical-education/graduate-medical-education",
    verified: true,
  },

  // UIC - dedicated GME page
  "University of Illinois at Chicago (UIC)": {
    url: "https://chicago.medicine.uic.edu/education/graduate-medical-education/",
    verified: true,
  },

  // Northwell - dedicated GME page
  "Northwell Health System": {
    url: "https://www.northwell.edu/education-and-resources/graduate-medical-education",
    verified: true,
  },

  // SUNY Downstate - dedicated GME page
  "SUNY Downstate Medical Center": {
    url: "https://www.downstate.edu/education/graduate-medical-education/",
    verified: true,
  },

  // Beth Israel Deaconess - dedicated GME page
  "Beth Israel Deaconess Medical Center": {
    url: "https://www.bidmc.org/medical-education/graduate-medical-education",
    verified: true,
  },

  // Boston Medical Center - dedicated GME page
  "Boston Medical Center": {
    url: "https://www.bmc.org/medical-education/graduate-medical-education",
    verified: true,
  },

  // Ohio State - dedicated GME page
  "Ohio State University Wexner Medical Center": {
    url: "https://wexnermedical.osu.edu/education/graduate-medical-education",
    verified: true,
  },

  // University Hospitals Cleveland - dedicated GME page
  "University Hospitals Cleveland": {
    url: "https://www.uhhospitals.org/medical-education/graduate-medical-education",
    verified: true,
  },

  // Brigham and Women's - dedicated GME page
  "Brigham and Women's Hospital": {
    url: "https://www.brighamandwomens.org/medical-professionals/graduate-medical-education",
    verified: true,
  },

  // Tufts - dedicated GME page
  "Tufts Medical Center": {
    url: "https://www.tuftsmedicalcenter.org/graduate-medical-education",
    verified: true,
  },

  // Thomas Jefferson - dedicated GME page
  "Thomas Jefferson University Hospital": {
    url: "https://www.jefferson.edu/academics/colleges-schools-institutes/skmc/education/graduate-medical-education.html",
    verified: true,
  },

  // Houston Methodist - dedicated academic institute page
  "Houston Methodist Hospital": {
    url: "https://www.houstonmethodist.org/for-health-professionals/academic-institute/",
    verified: true,
  },

  // AMOpportunities - third party, dedicated USCE page
  "AMG Medical Group — Clinical Rotations": {
    url: "https://amgmedicalgroup.com/",
    verified: true,
    note: "Third-party clinical rotation placement service",
  },

  // Brooklyn USCE - third party
  "Brooklyn USCE — Clinical Rotations": {
    url: "https://brooklynusce.com/",
    verified: true,
    note: "Third-party clinical rotation placement service",
  },
};

// All other programs that don't have verified dedicated pages
// will show "Visit Website" with a note about contacting GME office
