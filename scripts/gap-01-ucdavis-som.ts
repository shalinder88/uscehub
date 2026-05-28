/**
 * G0 final-sweep #4, gap #1: UC Davis School of Medicine Visiting
 * Student Program (US LCME M4 VSLO elective).
 *
 * Distinct from existing #cmn2114d "UC Davis Health — International
 * Observership" (IMG-only). This row covers the US M4 VSLO pathway.
 *
 * Source-page facts (audited 2026-05-27):
 *   - URL: health.ucdavis.edu/mdprogram/registrar/visiting.html
 *   - Audience: US LCME M4 only. Explicit: "We do not accept
 *     international students for clinical experiences."
 *   - Application: VSLO. 2026-2027 cycle: browse Mar 16, submit Apr 1,
 *     decisions May 1.
 *   - Cost (fees page): $300 per elective application, non-refundable.
 *     Malpractice $1M/$3M required. Personal health insurance + ACLS/BLS
 *     + Step 1 or COMLEX pass + immunization + HIPAA training.
 *   - Duration: up to 8 weeks (per fees page).
 *   - Core clerkships at home institution: "comparable to UC Davis M3
 *     curriculum" required.
 *   - No core clerkships hosted; electives only.
 *   - No phone-and-email contact published; phone 916-734-4110.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SYSTEM_POSTER_ID = "cmn2110rm0001sb11op4cbmc9"; // system@uscehub.com

(async () => {
  const shortDescription =
    "UC Davis School of Medicine Visiting Student Program — fourth-year electives via VSLO. " +
    "US LCME M4 only — UC Davis explicitly does NOT accept international students for clinical " +
    "experiences. $300 application fee per elective (non-refundable once accepted). Up to 8 weeks " +
    "total. Required: comparable M3 coursework at home institution, USMLE Step 1 or COMLEX pass, " +
    "$1M/$3M malpractice, ACLS/BLS, immunizations, HIPAA training. 2026-2027 cycle: browse opens " +
    "Mar 16, submissions Apr 1, decisions May 1. Sacramento, CA.";

  const fullDescription =
    "UC Davis School of Medicine accepts visiting fourth-year medical students for clinical " +
    "elective rotations via the AAMC Visiting Student Learning Opportunities (VSLO) catalog. " +
    "The program is restricted to US LCME M4 students — the registrar page states explicitly: " +
    "\"We do not accept international students for clinical experiences\" and \"We do not accept " +
    "visiting students for any required core clerkship.\"\n\n" +
    "Application is through VSLO only. For the 2026-2027 cycle the catalog opens for browsing on " +
    "March 16, 2026, submissions begin April 1, 2026, and decisions begin May 1, 2026.\n\n" +
    "Visiting students must have completed coursework comparable to the UC Davis School of " +
    "Medicine third-year curriculum and must hold a passing score on USMLE Step 1 or COMLEX. " +
    "Required documentation includes $1M-per-occurrence / $3M-aggregate malpractice insurance, " +
    "personal health insurance, valid ACLS or BLS certification, complete immunization records, " +
    "and HIPAA training completion.\n\n" +
    "The fee is $300 per elective application, non-refundable once an offer is accepted unless " +
    "the department cancels. Maximum total duration is 8 weeks. UC Davis School of Medicine's " +
    "Office of Medical Pathways indicates limited financial assistance may be available to " +
    "qualified candidates.\n\n" +
    "Contact: UC Davis School of Medicine Office of Medical Education, 916-734-4110.";

  const newRow = await prisma.listing.create({
    data: {
      posterId: SYSTEM_POSTER_ID,
      title: "UC Davis School of Medicine Visiting Student Program",
      listingType: "MD_DO_VISITING_STUDENTS",
      specialty: "Multiple Specialties",
      city: "Sacramento",
      state: "CA",
      country: "USA",
      shortDescription,
      fullDescription,
      duration: "Up to 8 weeks (4-week blocks via VSLO)",
      cost: "$300 per elective application (non-refundable)",
      applicationMethod: "VSLO",
      contactEmail: null,
      eligibilitySummary:
        "US LCME M4 only — international students explicitly ineligible. " +
        "Comparable M3 coursework + USMLE Step 1 or COMLEX pass + $1M/$3M malpractice + " +
        "ACLS/BLS + immunizations + HIPAA training required.",
      status: "APPROVED",
      applicationDeadline: "VSLO 2026-2027: browse Mar 16, submit Apr 1, decisions May 1",
      certificateOffered: false,
      lorPossible: true,
      visaSupport: false,
      sourceUrl: "https://health.ucdavis.edu/mdprogram/registrar/visiting.html",
      applicationUrl: "https://students-residents.aamc.org/visiting-student-learning-opportunities/visiting-student-learning-opportunities-vslo",
      linkVerified: true,
      linkVerificationStatus: "VERIFIED",
      lastVerifiedAt: new Date(),
      stepRequirements: "USMLE Step 1 or COMLEX passing score required",
      audienceTag: "US-MD-DO-VISITING",
      featured: false,
      adminNotes:
        "G0 final-sweep #4, gap #1 (2026-05-27): added during gap-program walk. " +
        "Distinct from #cmn2114d (UC Davis IMG observership) — this row is the US " +
        "LCME M4 VSLO elective pathway. Source page audited via WebFetch; fees page " +
        "audited separately. Phone-only contact (no published admin email).",
    },
  });

  console.log("CREATED:");
  console.log("  id:", newRow.id);
  console.log("  title:", newRow.title);
  console.log("  type:", newRow.listingType);
  console.log("  audience:", newRow.audienceTag);
  console.log("  url:", newRow.sourceUrl);
  await prisma.$disconnect();
})();
