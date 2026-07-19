// Dev-only: adds an admin, a fresh claimant, and an unowned (Mode A) listing
// to exercise the claim flow. Local DB only.
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const url = process.env.DATABASE_URL || "";
if (!url.includes("localhost") && !url.includes("127.0.0.1")) {
  console.error("REFUSING: DATABASE_URL not local.");
  process.exit(1);
}
const prisma = new PrismaClient();

async function main() {
  const pw = await hash("devpass123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@dev.uscehub.test" },
    update: { role: "ADMIN" },
    create: { email: "admin@dev.uscehub.test", password: pw, name: "USCEHub Admin", role: "ADMIN", emailVerified: true },
  });

  const system = await prisma.user.upsert({
    where: { email: "directory@dev.uscehub.test" },
    update: {},
    create: { email: "directory@dev.uscehub.test", password: pw, name: "USCEHub Directory", role: "ADMIN", emailVerified: true },
  });

  await prisma.user.upsert({
    where: { email: "newcoord@dev.uscehub.test" },
    update: { role: "APPLICANT" },
    create: { email: "newcoord@dev.uscehub.test", password: pw, name: "Dr. Omar Haddad", role: "APPLICANT", emailVerified: true },
  });

  // Unowned Mode A listing (no organization), with a website for domain match.
  const existing = await prisma.listing.findFirst({ where: { title: "Pediatrics Observership (St. Mary's)" } });
  const listing = existing ?? await prisma.listing.create({
    data: {
      posterId: system.id,
      organizationId: null,
      title: "Pediatrics Observership (St. Mary's)",
      listingType: "OBSERVERSHIP",
      specialty: "Pediatrics",
      city: "Cleveland",
      state: "OH",
      format: "IN_PERSON",
      shortDescription: "Pediatrics observership at St. Mary's Hospital for IMGs.",
      duration: "4 weeks",
      cost: "$900",
      status: "APPROVED",
      views: 512,
      lorPossible: true,
      certificateOffered: true,
      websiteUrl: "https://stmarys-hospital.org/gme",
      linkVerified: true,
      linkVerificationStatus: "VERIFIED",
    },
  });

  console.log(JSON.stringify({
    adminLogin: "admin@dev.uscehub.test / devpass123",
    claimantLogin: "newcoord@dev.uscehub.test / devpass123",
    unclaimedListingId: listing.id,
    claimUrl: `/claim/${listing.id}`,
    matchingEmail: "coord@stmarys-hospital.org (domain matches website → domainMatch true)",
  }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
