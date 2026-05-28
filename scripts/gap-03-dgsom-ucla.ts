/**
 * G0 final-sweep #4, gap #3: David Geffen School of Medicine at UCLA
 * Visiting Student Program (US LCME M4 / COCA DO M4 VSLO).
 *
 * Distinct from existing #cmo33855 "UCLA Health International Physician
 * Observership" (IMG observer track) — this row covers the M4 VSLO
 * pathway hosted by DGSOM.
 *
 * Source-page facts (audited 2026-05-27):
 *   - URL: medschool.ucla.edu/education/md-education/visiting-students
 *   - Audience quote: "Students in their fourth year at a U.S. medical
 *     school. VSLO applicants must be in good academic standing and
 *     actively progressing toward a Doctor of Medicine degree at an
 *     affiliated LCME-accredited institution, or a Doctor of Osteopathic
 *     Medicine degree at an affiliated COCA-accredited AACOM Member
 *     Institution."
 *   - INTL quote: "Due to limited course availability, our international
 *     VSLO elective program is now only open to pre-selected students
 *     from schools with which we have established reciprocal exchange
 *     agreements."
 *   - Application: VSLO platform.
 *   - Address: Geffen Hall, 885 Tiverton Drive, Los Angeles CA 90095.
 *   - Fee / duration / contact email not published on the visiting page.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SYSTEM_POSTER_ID = "cmn2110rm0001sb11op4cbmc9";

(async () => {
  const shortDescription =
    "DGSOM (David Geffen School of Medicine at UCLA) Visiting Student Program — VSLO. " +
    "Open to fourth-year students at US LCME-accredited MD programs and AOA COCA-accredited " +
    "DO programs, in good academic standing. International VSLO is RESTRICTED — only " +
    "pre-selected students from schools with established UCLA reciprocal exchange agreements " +
    "are eligible. Applications via the AAMC VSLO platform. Geffen Hall, Los Angeles, CA.";

  const fullDescription =
    "The David Geffen School of Medicine at UCLA (DGSOM) accepts visiting fourth-year medical " +
    "students for clinical elective rotations via the AAMC Visiting Student Learning " +
    "Opportunities (VSLO) program.\n\n" +
    "Eligibility (DGSOM source page): \"Students in their fourth year at a U.S. medical school. " +
    "VSLO applicants must be in good academic standing and actively progressing toward a Doctor " +
    "of Medicine degree at an affiliated LCME-accredited institution, or a Doctor of Osteopathic " +
    "Medicine degree at an affiliated COCA-accredited AACOM Member Institution.\"\n\n" +
    "International eligibility is narrow: \"Due to limited course availability, our international " +
    "VSLO elective program is now only open to pre-selected students from schools with which we " +
    "have established reciprocal exchange agreements.\" Open-access IMG applicants are NOT " +
    "eligible — UCLA's separate IMG pathway is the UCLA Health International Physician " +
    "Observership (hosted by UCLA Health, not DGSOM).\n\n" +
    "Applications go through the AAMC VSLO portal. UCLA's source page does not publish a " +
    "specific application fee, duration cap, contact email, or application deadline — " +
    "applicants should consult the VSLO catalog and contact the DGSOM Office of MD Education " +
    "for specifics.\n\n" +
    "Location: Geffen Hall, 885 Tiverton Drive, Los Angeles, CA 90095.";

  const newRow = await prisma.listing.create({
    data: {
      posterId: SYSTEM_POSTER_ID,
      title: "DGSOM UCLA Visiting Student Program",
      listingType: "MD_DO_VISITING_STUDENTS",
      specialty: "Multiple Specialties",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      shortDescription,
      fullDescription,
      duration: "Not published; see VSLO catalog",
      cost: "Not published; see VSLO catalog",
      applicationMethod: "VSLO",
      contactEmail: null,
      eligibilitySummary:
        "US LCME MD M4 + AOA COCA DO M4 in good academic standing. International " +
        "applicants RESTRICTED to pre-selected reciprocal-exchange schools only.",
      status: "APPROVED",
      certificateOffered: false,
      lorPossible: true,
      visaSupport: false,
      sourceUrl: "https://medschool.ucla.edu/education/md-education/visiting-students",
      applicationUrl: "https://students-residents.aamc.org/visiting-student-learning-opportunities/visiting-student-learning-opportunities-vslo",
      linkVerified: true,
      linkVerificationStatus: "VERIFIED",
      lastVerifiedAt: new Date(),
      audienceTag: "US-MD-DO-VISITING",
      featured: false,
      adminNotes:
        "G0 final-sweep #4, gap #3 (2026-05-27): added during gap-program walk. " +
        "Distinct from #cmo33855 (UCLA Health IMG observership) — this row covers " +
        "the DGSOM US M4/DO M4 VSLO elective pathway. Fee/duration/contact-email " +
        "not published on UCLA's visiting-students page. International access " +
        "explicitly restricted to pre-selected exchange schools (open IMG not eligible).",
    },
  });

  console.log("CREATED:", newRow.id, "|", newRow.title);
  await prisma.$disconnect();
})();
