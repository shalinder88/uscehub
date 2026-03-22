// Verified program links — ONLY URLs confirmed to go to dedicated observership/externship/observer program pages
// A generic "GME" page does NOT count as verified
// Last audit: March 22, 2026

export const VERIFIED_LINKS: Record<string, { url: string; verified: boolean; note?: string }> = {

  // ===== CONFIRMED DEDICATED OBSERVERSHIP/EXTERNSHIP PAGES =====

  "Cleveland Clinic": {
    url: "https://my.clevelandclinic.org/departments/elective-program",
    verified: true,
  },
  "Memorial Sloan Kettering — Research Fellowship": {
    url: "https://www.mskcc.org/hcp-education-training/international/observership",
    verified: true,
  },
  "Houston Methodist Hospital": {
    url: "https://www.houstonmethodist.org/for-health-professionals/global-health-care-services/global-health-care-education/",
    verified: true,
  },
  "MD Anderson Cancer Center": {
    url: "https://www.mdanderson.org/education-training/outreach-programs/observer-programs/other-observership-opportunities-at-md-anderson.html",
    verified: true,
  },
  "MD Anderson Cancer Center — Postdoc Research": {
    url: "https://www.mdanderson.org/education-training/outreach-programs/observer-programs/other-observership-opportunities-at-md-anderson.html",
    verified: true,
  },

  // Third-party placement services (dedicated USCE pages)
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

  // ===== ALL OTHER PROGRAMS — NOT VERIFIED =====
  // These link to hospital homepages or general GME pages
  // They show "Visit Website" with a disclaimer, not "Apply Now"

  // Will be updated as research agents find dedicated observership pages
};
