export type DisplayBucket =
  | "READY_PUBLIC_IMG_RELEVANT"
  | "READY_PUBLIC_US_STUDENT_ONLY";

export type AudienceStatus =
  | "ELIGIBLE_EXPLICIT"
  | "EXCLUDED_EXPLICIT"
  | "UNKNOWN_NOT_STATED"
  | "ONLY_IF_AFFILIATED"
  | "ONLY_IF_LCME_COCA";

export interface UsceCard {
  listing_id: string;
  institution_name: string;
  state: string;
  county: string;
  specialty: string;
  opportunity_type: string;
  source_page_type: string;
  listing_role: string;
  display_bucket: DisplayBucket;
  eligible_audiences: string[];
  excluded_audiences: string[];
  unknown_audiences: string[];
  restriction_tags: string[];
  fit_warnings: string[];
  audience_detail: {
    us_md_do: AudienceStatus;
    international_student: AudienceStatus;
    img_graduate: AudienceStatus;
    caribbean_student: AudienceStatus;
  };
  application_url: string;
  official_source_url: string;
  source_status: string;
  last_reviewed_at: string;
}

export const USCE_MAINE_CARDS: UsceCard[] = [
  // ── CMHC — READY_PUBLIC_IMG_RELEVANT ─────────────────────────────
  {
    listing_id: "ME-015",
    institution_name: "Central Maine Medical Center / Family Medicine",
    state: "ME",
    county: "Androscoggin",
    specialty: "family_medicine",
    opportunity_type: "Sub-internship",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_IMG_RELEVANT",
    eligible_audiences: ["US_MD_DO", "INTERNATIONAL_STUDENT"],
    excluded_audiences: [],
    unknown_audiences: ["IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    restriction_tags: [],
    fit_warnings: [],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "ELIGIBLE_EXPLICIT",
      img_graduate: "UNKNOWN_NOT_STATED",
      caribbean_student: "UNKNOWN_NOT_STATED",
    },
    application_url: "https://app.smartsheet.com/b/form/8507f8981e874c2bab7a64404159f051",
    official_source_url: "https://www.cmhc.org/health-professionals/medical-students/elective-clerkships/",
    source_status: "OFFICIAL_PROGRAM_PAGE",
    last_reviewed_at: "2026-05-03",
  },
  {
    listing_id: "ME-016",
    institution_name: "Central Maine Medical Center / Emergency Medicine",
    state: "ME",
    county: "Androscoggin",
    specialty: "emergency_medicine",
    opportunity_type: "Elective",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_IMG_RELEVANT",
    eligible_audiences: ["US_MD_DO", "INTERNATIONAL_STUDENT"],
    excluded_audiences: [],
    unknown_audiences: ["IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    restriction_tags: [],
    fit_warnings: [],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "ELIGIBLE_EXPLICIT",
      img_graduate: "UNKNOWN_NOT_STATED",
      caribbean_student: "UNKNOWN_NOT_STATED",
    },
    application_url: "https://app.smartsheet.com/b/form/8507f8981e874c2bab7a64404159f051",
    official_source_url: "https://www.cmhc.org/health-professionals/medical-students/elective-clerkships/",
    source_status: "OFFICIAL_DEPARTMENT_PAGE",
    last_reviewed_at: "2026-05-03",
  },
  {
    listing_id: "ME-017",
    institution_name: "Central Maine Medical Center / OB-GYN",
    state: "ME",
    county: "Androscoggin",
    specialty: "obstetrics_gynecology",
    opportunity_type: "Elective",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_IMG_RELEVANT",
    eligible_audiences: ["US_MD_DO", "INTERNATIONAL_STUDENT"],
    excluded_audiences: [],
    unknown_audiences: ["IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    restriction_tags: [],
    fit_warnings: [],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "ELIGIBLE_EXPLICIT",
      img_graduate: "UNKNOWN_NOT_STATED",
      caribbean_student: "UNKNOWN_NOT_STATED",
    },
    application_url: "https://app.smartsheet.com/b/form/8507f8981e874c2bab7a64404159f051",
    official_source_url: "https://www.cmhc.org/health-professionals/medical-students/elective-clerkships/",
    source_status: "OFFICIAL_DEPARTMENT_PAGE",
    last_reviewed_at: "2026-05-03",
  },
  {
    listing_id: "ME-018",
    institution_name: "Central Maine Medical Center / Pediatrics",
    state: "ME",
    county: "Androscoggin",
    specialty: "pediatrics",
    opportunity_type: "Elective",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_IMG_RELEVANT",
    eligible_audiences: ["US_MD_DO", "INTERNATIONAL_STUDENT"],
    excluded_audiences: [],
    unknown_audiences: ["IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    restriction_tags: [],
    fit_warnings: [],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "ELIGIBLE_EXPLICIT",
      img_graduate: "UNKNOWN_NOT_STATED",
      caribbean_student: "UNKNOWN_NOT_STATED",
    },
    application_url: "https://app.smartsheet.com/b/form/8507f8981e874c2bab7a64404159f051",
    official_source_url: "https://www.cmhc.org/health-professionals/medical-students/elective-clerkships/",
    source_status: "OFFICIAL_DEPARTMENT_PAGE",
    last_reviewed_at: "2026-05-03",
  },
  {
    listing_id: "ME-019",
    institution_name: "Central Maine Medical Center / Surgery",
    state: "ME",
    county: "Androscoggin",
    specialty: "surgery",
    opportunity_type: "Elective",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_IMG_RELEVANT",
    eligible_audiences: ["US_MD_DO", "INTERNATIONAL_STUDENT"],
    excluded_audiences: [],
    unknown_audiences: ["IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    restriction_tags: [],
    fit_warnings: [],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "ELIGIBLE_EXPLICIT",
      img_graduate: "UNKNOWN_NOT_STATED",
      caribbean_student: "UNKNOWN_NOT_STATED",
    },
    application_url: "https://app.smartsheet.com/b/form/8507f8981e874c2bab7a64404159f051",
    official_source_url: "https://www.cmhc.org/health-professionals/medical-students/elective-clerkships/",
    source_status: "OFFICIAL_DEPARTMENT_PAGE",
    last_reviewed_at: "2026-05-03",
  },
  {
    listing_id: "ME-020",
    institution_name: "Central Maine Medical Center / Internal Medicine",
    state: "ME",
    county: "Androscoggin",
    specialty: "internal_medicine",
    opportunity_type: "Elective",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_IMG_RELEVANT",
    eligible_audiences: ["US_MD_DO", "INTERNATIONAL_STUDENT"],
    excluded_audiences: [],
    unknown_audiences: ["IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    restriction_tags: [],
    fit_warnings: [],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "ELIGIBLE_EXPLICIT",
      img_graduate: "UNKNOWN_NOT_STATED",
      caribbean_student: "UNKNOWN_NOT_STATED",
    },
    application_url: "https://app.smartsheet.com/b/form/8507f8981e874c2bab7a64404159f051",
    official_source_url: "https://www.cmhc.org/health-professionals/medical-students/elective-clerkships/",
    source_status: "OFFICIAL_DEPARTMENT_PAGE",
    last_reviewed_at: "2026-05-03",
  },
  {
    listing_id: "ME-021",
    institution_name: "Central Maine Medical Center / Rural Family Medicine",
    state: "ME",
    county: "Androscoggin",
    specialty: "family_medicine_rural",
    opportunity_type: "Elective",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_IMG_RELEVANT",
    eligible_audiences: ["US_MD_DO", "INTERNATIONAL_STUDENT"],
    excluded_audiences: [],
    unknown_audiences: ["IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    restriction_tags: [],
    fit_warnings: [],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "ELIGIBLE_EXPLICIT",
      img_graduate: "UNKNOWN_NOT_STATED",
      caribbean_student: "UNKNOWN_NOT_STATED",
    },
    application_url: "https://app.smartsheet.com/b/form/8507f8981e874c2bab7a64404159f051",
    official_source_url: "https://www.cmhc.org/health-professionals/medical-students/elective-clerkships/",
    source_status: "OFFICIAL_DEPARTMENT_PAGE",
    last_reviewed_at: "2026-05-03",
  },
  // ── MMC — READY_PUBLIC_US_STUDENT_ONLY ───────────────────────────
  {
    listing_id: "ME-004",
    institution_name: "Maine Medical Center / General Surgery",
    state: "ME",
    county: "Cumberland",
    specialty: "general_surgery",
    opportunity_type: "Sub-internship",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_US_STUDENT_ONLY",
    eligible_audiences: ["US_MD_DO"],
    excluded_audiences: ["INTERNATIONAL_STUDENT", "IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    unknown_audiences: [],
    restriction_tags: ["IMG_EXCLUDED"],
    fit_warnings: ["IMG_EXCLUDED"],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url: "https://www.mainehealth.org/maine-medical-center/education-research/students-residents-fellows/residencies/general-surgery/rotations-electives",
    source_status: "OFFICIAL_PROGRAM_PAGE",
    last_reviewed_at: "2026-05-03",
  },
  {
    listing_id: "ME-005",
    institution_name: "Maine Medical Center / Emergency Medicine",
    state: "ME",
    county: "Cumberland",
    specialty: "emergency_medicine",
    opportunity_type: "Elective",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_US_STUDENT_ONLY",
    eligible_audiences: ["US_MD_DO"],
    excluded_audiences: ["INTERNATIONAL_STUDENT", "IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    unknown_audiences: [],
    restriction_tags: ["VSLO_REQUIRED", "IMG_EXCLUDED"],
    fit_warnings: ["VSLO_REQUIRED", "IMG_EXCLUDED"],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url: "https://www.mainehealth.org/maine-medical-center/education-research/medical-education/residency-programs/emergency-medicine-residency/medical-student-elective-emergency-medicine-residency",
    source_status: "OFFICIAL_PROGRAM_PAGE",
    last_reviewed_at: "2026-05-03",
  },
  {
    listing_id: "ME-006",
    institution_name: "Maine Medical Center / Anesthesiology",
    state: "ME",
    county: "Cumberland",
    specialty: "anesthesiology",
    opportunity_type: "Elective",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_US_STUDENT_ONLY",
    eligible_audiences: ["US_MD_DO"],
    excluded_audiences: ["INTERNATIONAL_STUDENT", "IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    unknown_audiences: [],
    restriction_tags: ["VSLO_REQUIRED", "IMG_EXCLUDED"],
    fit_warnings: ["VSLO_REQUIRED", "IMG_EXCLUDED"],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url: "https://www.mainehealth.org/maine-medical-center/education-research/medical-education/residency-programs/anesthesiology-residency/medical-student-elective",
    source_status: "OFFICIAL_PROGRAM_PAGE",
    last_reviewed_at: "2026-05-03",
  },
  {
    listing_id: "ME-007",
    institution_name: "Maine Medical Center / Interventional Radiology",
    state: "ME",
    county: "Cumberland",
    specialty: "interventional_radiology",
    opportunity_type: "Elective",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_US_STUDENT_ONLY",
    eligible_audiences: ["US_MD_DO"],
    excluded_audiences: ["INTERNATIONAL_STUDENT", "IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    unknown_audiences: [],
    restriction_tags: ["IMG_EXCLUDED"],
    fit_warnings: ["IMG_EXCLUDED"],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url: "https://www.mainehealth.org/Maine-Medical-Center/Education-Research/Students-Residents-Fellows/Residencies/Interventional-Radiology/Medical-Student-Elective",
    source_status: "OFFICIAL_PROGRAM_PAGE",
    last_reviewed_at: "2026-05-03",
  },
  {
    listing_id: "ME-008",
    institution_name: "Maine Medical Center / Family Medicine",
    state: "ME",
    county: "Cumberland",
    specialty: "family_medicine",
    opportunity_type: "Elective",
    source_page_type: "SPECIALTY_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_US_STUDENT_ONLY",
    eligible_audiences: ["US_MD_DO"],
    excluded_audiences: ["INTERNATIONAL_STUDENT", "IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    unknown_audiences: [],
    restriction_tags: ["VSLO_REQUIRED", "IMG_EXCLUDED"],
    fit_warnings: ["VSLO_REQUIRED", "IMG_EXCLUDED"],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url: "https://www.mainehealth.org/maine-medical-center/education-research/medical-education/residency-programs/family-medicine-residency/medical-student-rotations",
    source_status: "OFFICIAL_PROGRAM_PAGE",
    last_reviewed_at: "2026-05-03",
  },
];

// Runtime guard: only public buckets may be in this module
const _nonPublic = USCE_MAINE_CARDS.filter(
  (c) =>
    c.display_bucket !== "READY_PUBLIC_IMG_RELEVANT" &&
    c.display_bucket !== "READY_PUBLIC_US_STUDENT_ONLY"
);
if (_nonPublic.length > 0) {
  throw new Error(
    `usce-maine-data: non-public buckets detected: ${_nonPublic.map((c) => c.listing_id).join(", ")}`
  );
}

export const SPECIALTY_LABELS: Record<string, string> = {
  family_medicine: "Family Medicine",
  family_medicine_rural: "Rural Family Medicine",
  emergency_medicine: "Emergency Medicine",
  obstetrics_gynecology: "OB-GYN",
  pediatrics: "Pediatrics",
  surgery: "Surgery",
  internal_medicine: "Internal Medicine",
  general_surgery: "General Surgery",
  anesthesiology: "Anesthesiology",
  interventional_radiology: "Interventional Radiology",
};

export const NEEDS_REVIEW_COUNT = 5;

export const IMG_RELEVANT_COUNT = USCE_MAINE_CARDS.filter(
  (c) => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT"
).length;

export const US_ONLY_COUNT = USCE_MAINE_CARDS.filter(
  (c) => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY"
).length;
