/**
 * Shared badge palette for the local browse preview surface.
 * Kept in its own file so the list page, detail page, and card all
 * pull from the same tokens without circular client/server imports.
 */

export type SourceBadge = "DIRECT" | "REORIENTED" | "PROTECTED" | "RESEARCH";

export const SOURCE_BADGE_CLASS: Record<SourceBadge, string> = {
  DIRECT:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700",
  REORIENTED:
    "bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100 border-sky-300 dark:border-sky-700",
  PROTECTED:
    "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100 border-amber-300 dark:border-amber-700",
  RESEARCH:
    "bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100 border-violet-300 dark:border-violet-700",
};

export const SOURCE_BADGE_LABEL: Record<SourceBadge, string> = {
  DIRECT: "Direct official source",
  REORIENTED: "Reoriented to official source",
  PROTECTED: "Live in browser (bot-protected)",
  RESEARCH: "Research / postdoctoral",
};

export const SUBTYPE_LABEL: Record<string, string> = {
  observership: "Observership",
  "visiting-student-elective": "Visiting student elective",
  "visiting-student-clerkship": "Visiting student clerkship",
  "sub-internship": "Sub-internship",
  externship: "Externship",
  "international-visiting-student": "International visiting student",
  "multi-rotation": "Multi-site rotation",
  "research-postdoc": "Research / postdoc",
};

export const AUDIENCE_LABEL: Record<string, string> = {
  "us-md-do": "US LCME/COCA M4",
  "international-medical-student": "International medical student",
  "international-medical-graduate": "International medical graduate",
  "img-physician": "IMG physician (post-graduate)",
  "any-accredited-no-visa": "Any accredited school (no visa sponsorship)",
  "audience-unspecified": "Audience: verify on source",
};
