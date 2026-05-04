import generatedData from "@/data/usce/public-listings.generated.json";

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
  campus_name: string;
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

export const USCE_MAINE_CARDS: UsceCard[] = (generatedData as { cards: unknown[] }).cards as UsceCard[];

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
