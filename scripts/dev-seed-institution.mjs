// Dev-only seed for the institution dashboard. Runs ONLY against the local
// dev Postgres (guarded on host below). Creates one verified organization with
// an owner + two coordinators (memberships), several listings, and a realistic
// applicant pipeline so the premium dashboard renders against real data.
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const url = process.env.DATABASE_URL || "";
if (!url.includes("localhost") && !url.includes("127.0.0.1")) {
  console.error("REFUSING: DATABASE_URL is not local. Aborting dev seed.", url.replace(/:\/\/[^@]*@/, "://***@"));
  process.exit(1);
}

const prisma = new PrismaClient();

const COUNTRIES = ["India", "Pakistan", "Nigeria", "Egypt", "Philippines", "Brazil", "Iran", "Mexico"];
const SCHOOLS = ["King Edward Medical U", "Cairo U Faculty of Medicine", "AIIMS New Delhi", "U of Lagos", "UST Manila", "USP São Paulo"];
const SPECIALTIES = ["Internal Medicine", "Family Medicine", "Neurology", "Cardiology"];
const APP_STATES = ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED", "COMPLETED"];

async function main() {
  const pw = await hash("devpass123", 12);

  // Clean prior dev-seed rows (idempotent) by email domain
  await prisma.user.deleteMany({ where: { email: { endsWith: "@dev.uscehub.test" } } });

  const owner = await prisma.user.create({
    data: { email: "coordinator@dev.uscehub.test", password: pw, name: "Dr. Anita Rao", role: "POSTER", emailVerified: true,
      posterProfile: { create: { contactName: "Dr. Anita Rao", title: "GME Program Coordinator", npiNumber: "1902938475", institutionalEmail: "arao@riverside-med.org", verificationStatus: "APPROVED" } } },
  });

  const org = await prisma.organization.create({
    data: { ownerId: owner.id, name: "Riverside Medical Center", type: "Academic Medical Center",
      contactName: "Dr. Anita Rao", contactEmail: "gme@riverside-med.org", website: "https://riverside-med.org",
      city: "Columbus", state: "OH", description: "550-bed academic medical center with ACGME-accredited programs across 18 specialties.",
      institutionalEmail: true, verificationStatus: "APPROVED", badges: "npi_verified,institutional_email" },
  });

  // Coordinators (memberships)
  const coordEmails = [
    { email: "j.mensah@dev.uscehub.test", name: "James Mensah", role: "COORDINATOR", title: "IM Program Coordinator" },
    { email: "s.park@dev.uscehub.test", name: "Dr. Susan Park", role: "VIEWER", title: "DIO Office (read-only)" },
  ];
  await prisma.organizationMembership.create({ data: { organizationId: org.id, userId: owner.id, role: "OWNER", title: "GME Program Coordinator" } });
  for (const c of coordEmails) {
    const u = await prisma.user.create({ data: { email: c.email, password: pw, name: c.name, role: "POSTER", emailVerified: true } });
    await prisma.organizationMembership.create({ data: { organizationId: org.id, userId: u.id, role: c.role, title: c.title, invitedByEmail: owner.email } });
  }

  // Listings
  const listingDefs = [
    { title: "Internal Medicine Observership", listingType: "OBSERVERSHIP", specialty: "Internal Medicine", status: "APPROVED", views: 1284, lorPossible: true, certificateOffered: true },
    { title: "Neurology Clinical Externship", listingType: "EXTERNSHIP", specialty: "Neurology", status: "APPROVED", views: 742, lorPossible: true, certificateOffered: true },
    { title: "Cardiology Research Fellowship", listingType: "RESEARCH", specialty: "Cardiology", status: "APPROVED", views: 968, lorPossible: true, certificateOffered: false },
    { title: "Family Medicine Hands-on Clerkship", listingType: "CLERKSHIP", specialty: "Family Medicine", status: "PENDING", views: 41, lorPossible: true, certificateOffered: true },
  ];
  const listings = [];
  for (const l of listingDefs) {
    const created = await prisma.listing.create({ data: {
      organizationId: org.id, posterId: owner.id, title: l.title, listingType: l.listingType, specialty: l.specialty,
      city: "Columbus", state: "OH", format: "IN_PERSON", shortDescription: `${l.specialty} experience at Riverside Medical Center for IMGs.`,
      duration: "4 weeks", cost: "$1,200", status: l.status, views: l.views, lorPossible: l.lorPossible, certificateOffered: l.certificateOffered,
      visaSupport: false, linkVerified: true, linkVerificationStatus: "VERIFIED", numberOfSpots: "3",
    } });
    listings.push(created);
  }

  // Applicants + applications (pipeline) + saves (funnel)
  let ai = 0;
  for (const listing of listings) {
    const nApps = listing.status === "PENDING" ? 1 : 6 + (ai % 4);
    const nSaves = listing.status === "PENDING" ? 3 : 22 + (ai % 9);
    for (let s = 0; s < nSaves; s++) {
      const su = await prisma.user.create({ data: { email: `saver${ai}_${s}@dev.uscehub.test`, password: pw, name: `Saver ${ai}-${s}`, role: "APPLICANT", emailVerified: true } });
      await prisma.savedListing.create({ data: { userId: su.id, listingId: listing.id } });
    }
    for (let a = 0; a < nApps; a++) {
      const country = COUNTRIES[ai % COUNTRIES.length];
      const step1 = 220 + ((ai * 7 + a * 3) % 40);
      const step2 = 235 + ((ai * 5 + a * 4) % 30);
      const applicant = await prisma.user.create({ data: {
        email: `applicant${ai}_${a}@dev.uscehub.test`, password: pw, name: `${["Amir","Priya","Chidi","Fatima","Maria","Reza","Ana","Sofia"][(ai+a)%8]} ${["Khan","Patel","Okonkwo","Hassan","Silva","Ahmadi","Cruz","Reyes"][(ai*a)%8]}`,
        role: "APPLICANT", emailVerified: true,
        applicantProfile: { create: { country, medicalSchool: SCHOOLS[(ai+a) % SCHOOLS.length], graduationYear: `${2021 + ((ai+a)%4)}`,
          specialtyInterest: listing.specialty, visaStatus: (a % 3 === 0) ? "Needs J-1" : "No visa needed", usmleStep1: `${step1}`, usmleStep2: `${step2}`, ecfmgStatus: "Certified" } },
      } });
      const status = APP_STATES[(ai + a) % APP_STATES.length];
      await prisma.application.create({ data: { listingId: listing.id, applicantId: applicant.id, status,
        message: a % 2 === 0 ? `I am very interested in the ${listing.specialty} program and available to start next rotation block.` : null } });
    }
    ai++;
  }

  const counts = {
    org: org.name, listings: listings.length,
    memberships: await prisma.organizationMembership.count({ where: { organizationId: org.id } }),
    applications: await prisma.application.count({ where: { listing: { organizationId: org.id } } }),
    saves: await prisma.savedListing.count({ where: { listing: { organizationId: org.id } } }),
  };
  console.log("Seed complete:", JSON.stringify(counts, null, 2));
  console.log("Login: coordinator@dev.uscehub.test / devpass123 (OWNER of Riverside Medical Center)");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
