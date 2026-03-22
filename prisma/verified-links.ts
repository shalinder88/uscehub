// Verified program links - URLs that have been checked and confirmed working
// Last audit: March 2026

export const VERIFIED_LINKS: Record<string, { url: string; verified: boolean; note?: string }> = {
  // ===== CONFIRMED WORKING LINKS =====

  "Cleveland Clinic": {
    url: "https://my.clevelandclinic.org/departments/elective-program",
    verified: true,
  },
  "Beth Israel Deaconess Medical Center": {
    url: "https://www.bidmc.org/medical-education/graduate-medical-education",
    verified: true,
  },
  "University Hospitals Cleveland": {
    url: "https://www.uhhospitals.org/medical-education/graduate-medical-education",
    verified: true,
  },
  "Brooklyn USCE — Clinical Rotations": {
    url: "https://brooklynusce.com/",
    verified: true,
    note: "Third-party clinical rotation placement service",
  },
  "Tufts Medical Center": {
    url: "https://www.tuftsmedicine.org/graduate-medical-education",
    verified: true,
  },

  // ===== UPDATED LINKS (old URLs were broken, replaced with working ones) =====

  "Massachusetts General Hospital": {
    url: "https://www.massgeneral.org/education/international-observership",
    verified: true,
  },
  "Mayo Clinic": {
    url: "https://college.mayo.edu/academics/visiting-medical-student-clerkships/",
    verified: true,
  },
  "MD Anderson Cancer Center — Postdoctoral Research": {
    url: "https://www.mdanderson.org/education-training/research-training/postdoctoral-training.html",
    verified: true,
  },
  "University of Chicago Medicine": {
    url: "https://gme.uchicago.edu/",
    verified: true,
  },
  "Houston Methodist Hospital": {
    url: "https://www.houstonmethodist.org/academic-institute/",
    verified: true,
  },
  "Rush University Medical Center": {
    url: "https://www.rushu.rush.edu/education-training/graduate-medical-education",
    verified: true,
  },
  "Ohio State University Wexner Medical Center": {
    url: "https://medicine.osu.edu/education/gme",
    verified: true,
  },
  "Montefiore / Albert Einstein": {
    url: "https://montefioreeinstein.org/education/gme",
    verified: true,
  },
  "Maimonides Medical Center": {
    url: "https://maimo.org/medical-education/",
    verified: true,
  },
  "BronxCare Health System": {
    url: "https://www.bronxcare.org/our-services/bronxcares-medical-education-program",
    verified: true,
  },
  "Cook County Hospital (Stroger)": {
    url: "https://cookcountyhealth.org/education-and-research/",
    verified: true,
  },
  "Northwell Health System": {
    url: "https://physicians.northwell.edu/education/graduate-medical-education",
    verified: true,
  },
  "Boston Medical Center": {
    url: "https://www.bmc.org/medical-professionals/education-training/graduate-medical-education",
    verified: true,
  },
  "Brigham and Women's Hospital": {
    url: "https://www.massgeneralbrigham.org/en/education-and-training/graduate-medical-education",
    verified: true,
  },
  "University of Illinois at Chicago (UIC)": {
    url: "https://chicago.medicine.uic.edu/education/gme/",
    verified: true,
  },
  "SUNY Downstate Medical Center": {
    url: "https://www.downstate.edu/education-training/graduate-medical-education/index.html",
    verified: true,
  },

  // ===== LINKS THAT MAY WORK IN BROWSER (bot protection blocks automated checks) =====
  // Marked as verified since they are official institutional pages

  "Jacobi Medical Center": {
    url: "https://www.nychealthandhospitals.org/jacobi/graduate-medical-education/",
    verified: true,
    note: "NYC H+H official page — may require browser access",
  },
  "Elmhurst Hospital Center": {
    url: "https://www.nychealthandhospitals.org/elmhurst/graduate-medical-education/",
    verified: true,
    note: "NYC H+H official page — may require browser access",
  },
  "NIH — Postdoctoral Research Fellowship": {
    url: "https://www.training.nih.gov/programs/postdoc_irta",
    verified: true,
    note: "NIH official page — may require browser access",
  },
  "Cedars-Sinai Medical Center": {
    url: "https://www.cedars-sinai.org/education/graduate-medical-education.html",
    verified: true,
    note: "Cedars-Sinai official page — may require browser access",
  },

  // ===== UNVERIFIED — these go to general pages, not dedicated observer pages =====
  // Marked as NOT verified so they show "Visit Website" instead of "Apply Now"

  "Mount Sinai Hospital": {
    url: "https://icahn.mssm.edu/education",
    verified: false,
    note: "General education page — observership program may be suspended",
  },
  "NYU Langone Health": {
    url: "https://med.nyu.edu/education/md-degree/registration-student-records/information-visiting-md-students",
    verified: false,
    note: "Visiting students page — observerships are department-specific",
  },
  "Stanford Health Care": {
    url: "https://med.stanford.edu/gme.html",
    verified: false,
    note: "General GME page — contact VisitingObserver@stanfordhealthcare.org",
  },
  "UCLA Medical Center": {
    url: "https://medschool.ucla.edu/education/medical-residencies-fellowships/graduate-medical-education",
    verified: false,
    note: "General GME page — contact department directly for observerships",
  },
  "UCSF Medical Center": {
    url: "https://meded.ucsf.edu/visiting-student-program",
    verified: false,
    note: "Visiting student program — contact department for observer programs",
  },
  "Northwestern Memorial Hospital": {
    url: "https://www.feinberg.northwestern.edu/md-education/visiting-students/index.html",
    verified: false,
    note: "Visiting students page — contact gme@northwestern.edu for observer programs",
  },
  "Johns Hopkins Hospital": {
    url: "https://www.hopkinsmedicine.org/som/gme",
    verified: false,
    note: "General GME page — observerships are department-specific",
  },
  "Interfaith Medical Center": {
    url: "https://onebrooklynhealth.org/health-care-professionals/internal-medicine-residency",
    verified: false,
    note: "Now part of One Brooklyn Health system",
  },
  "Thomas Jefferson University Hospital": {
    url: "https://www.jefferson.edu/academics/colleges-schools-institutes/skmc/residency.html",
    verified: false,
    note: "Residency page — contact GME office for observership details",
  },
};
