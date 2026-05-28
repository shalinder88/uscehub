/**
 * G0 final-sweep #4, gap #11: University of Pittsburgh School of
 * Medicine International Visiting Student Program (separate from the
 * domestic VSLO row #cmo34f3q).
 *
 * Source-page facts (audited 2026-05-27):
 *   - Front URL: medstudentaffairs.pitt.edu/visiting-students/
 *               visiting-international-applicants-through-office-medical-student-research-and
 *   - Detail URL: live-researchprograms-medschool-pitt.pantheonsite.io/
 *                 international-visiting-student-program
 *   - Audience: international students who have completed core clinical
 *     training and are in their final year.
 *   - Application: merged-PDF email to MSRIS@medschool.pitt.edu
 *     (preferred); VSLO platform also accepted.
 *   - Duration: 4-week electives; up to two electives per applicant.
 *   - Fee: $4,500 per elective via Flywire post-acceptance.
 *   - Visa: acceptance letter + invoice provided for visa applications.
 *   - Slot priority: UPSOM > domestic VSLO > international.
 *   - Specialty-specific: Psychiatry requires Step 2 score (not Step 1).
 *   - Deadline: applications due 3 months before start date.
 *   - Address: Scaife Hall, 3550 Terrace St, Pittsburgh PA 15261.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SYSTEM_POSTER_ID = "cmn2110rm0001sb11op4cbmc9";

(async () => {
  const shortDescription =
    "University of Pittsburgh SOM International Visiting Student Program — separate from the " +
    "domestic VSLO pathway. ONLY for international students who have completed core clinical " +
    "training and are in their final year. 4-week clinical electives ($4,500 per elective, " +
    "Flywire payment). Up to 2 electives. Merged-PDF application emailed to " +
    "MSRIS@medschool.pitt.edu (preferred over VSLO). Slot priority: UPSOM > domestic > " +
    "international. Apply ≥3 months before start. Acceptance letter + invoice provided for visa.";

  const fullDescription =
    "The University of Pittsburgh School of Medicine (UPSOM) operates a SEPARATE International " +
    "Visiting Student Program distinct from its domestic LCME/AOA VSLO pathway (#cmo34f3q).\n\n" +
    "Eligibility (source page, verbatim): \"This program is ONLY for international students " +
    "who have completed their core clinical training and are in their final year of medical " +
    "education.\"\n\n" +
    "Application is by merged-PDF email to MSRIS@medschool.pitt.edu (preferred). The AAMC VSLO " +
    "platform is also accepted, but the paper-application paper-PDF route is the path UPSOM " +
    "recommends. All materials must arrive at least 3 months before the elective start date.\n\n" +
    "Duration is 4 weeks per elective; students may apply for up to TWO experiences total.\n\n" +
    "Cost: $4,500 per clinical elective, paid via Flywire after acceptance.\n\n" +
    "Visa: UPSOM provides an acceptance letter and invoice for B-1/B-2 or J-1 visa applications.\n\n" +
    "Slot allocation priority: (1) UPSOM students fill slots first; (2) domestic visiting " +
    "students next; (3) international visiting students last. Availability \"changes on a daily " +
    "and weekly basis\" per UPSOM.\n\n" +
    "Specialty-specific: Psychiatric clinical electives require a USMLE Step 2 score (not Step 1).\n\n" +
    "Contact: MSRIS@medschool.pitt.edu — Office of Medical Student Research and International " +
    "Studies, S594 Scaife Hall, 3550 Terrace Street, Pittsburgh, PA 15261. Phone 412-648-9040.";

  const newRow = await prisma.listing.create({
    data: {
      posterId: SYSTEM_POSTER_ID,
      title: "University of Pittsburgh SOM International Visiting Student Program",
      listingType: "CLERKSHIP",
      specialty: "Multiple Specialties",
      city: "Pittsburgh",
      state: "PA",
      country: "USA",
      shortDescription,
      fullDescription,
      duration: "4-week electives (up to 2 per applicant)",
      cost: "$4,500 per clinical elective (Flywire, post-acceptance)",
      applicationMethod: "Email (merged PDF) to MSRIS@medschool.pitt.edu (preferred); VSLO also accepted",
      contactEmail: "MSRIS@medschool.pitt.edu",
      eligibilitySummary:
        "International students who have completed core clinical training and are in their " +
        "FINAL year of medical education. Domestic LCME/AOA M4s should use the separate " +
        "domestic VSLO row instead.",
      status: "APPROVED",
      applicationDeadline: "Applications due ≥3 months before elective start date",
      certificateOffered: false,
      lorPossible: true,
      visaSupport: true,
      sourceUrl: "https://www.medstudentaffairs.pitt.edu/visiting-students/visiting-international-applicants-through-office-medical-student-research-and",
      applicationUrl: "https://live-researchprograms-medschool-pitt.pantheonsite.io/international-visiting-student-program",
      linkVerified: true,
      linkVerificationStatus: "VERIFIED",
      lastVerifiedAt: new Date(),
      stepRequirements: "Psychiatry requires USMLE Step 2 (not Step 1). Other specialties: not specified on source page.",
      audienceTag: "INTL-FINAL-YEAR-VISITING",
      featured: false,
      adminNotes:
        "G0 final-sweep #4, gap #11 (2026-05-27): added during gap-program walk. " +
        "Distinct from #cmo34f3q (UPSOM domestic VSLO) — this row covers UPSOM's " +
        "separate INTL pathway. Final-year-only restriction; merged-PDF email " +
        "application preferred over VSLO; $4,500/elective; Flywire payment. " +
        "Pitt explicitly ranks slot priority UPSOM > domestic > international.",
    },
  });

  console.log("CREATED:", newRow.id, "|", newRow.title);
  await prisma.$disconnect();
})();
