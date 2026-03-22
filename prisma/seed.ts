import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import { VERIFIED_LINKS } from "./verified-links";

const prisma = new PrismaClient();

interface Program {
  name: string;
  location: string;
  state: string;
  type: string;
  fee: string;
  feeAmount: string;
  duration: string;
  specialties: string;
  visa: string;
  description: string;
  requirements: string;
  link: string;
  deadline: string;
  featured: boolean;
}

function parsePrograms(): Program[] {
  const dataPath = path.resolve(__dirname, "../../usmle-observerships/data.js");
  const content = fs.readFileSync(dataPath, "utf8");
  const match = content.match(/const PROGRAMS = \[([\s\S]*?)\];/);
  if (!match) {
    throw new Error("Could not parse PROGRAMS from data.js");
  }
  // Use Function constructor to safely evaluate the array
  const fn = new Function(`return [${match[1]}];`);
  return fn() as Program[];
}

function mapListingType(type: string): "OBSERVERSHIP" | "EXTERNSHIP" | "RESEARCH" {
  switch (type.toLowerCase()) {
    case "observership":
      return "OBSERVERSHIP";
    case "externship":
      return "EXTERNSHIP";
    case "rotation":
      return "EXTERNSHIP";
    case "research":
      return "RESEARCH";
    case "postdoc":
      return "RESEARCH";
    default:
      return "OBSERVERSHIP";
  }
}

function isPureBenchScience(specialties: string): boolean {
  const benchTerms = [
    "immunology", "genetics", "immunotherapy", "genomics", "vaccine development",
    "cancer biology", "gene therapy", "car-t", "immunobiology", "molecular biology",
    "virology", "bioengineering", "neuroscience", "regenerative medicine",
    "vaccine research", "translational science",
  ];
  const clinicalTerms = [
    "internal medicine", "surgery", "pediatrics", "family medicine", "emergency medicine",
    "cardiology", "oncology", "psychiatry", "neurology", "radiology", "pathology",
    "ob/gyn", "orthopedics", "dermatology", "ophthalmology", "anesthesiology",
    "critical care", "pulmonology", "nephrology", "gastroenterology", "endocrinology",
    "infectious disease", "hematology", "rheumatology", "urology", "geriatrics",
    "clinical trials", "clinical research", "outcomes research", "health services",
    "public health", "global health", "health equity", "ai in medicine",
    "data science", "biomedical informatics",
  ];
  const lower = specialties.toLowerCase();
  const parts = lower.split(",").map((s) => s.trim());
  const hasClinical = parts.some((p) =>
    clinicalTerms.some((ct) => p.includes(ct))
  );
  const hasBench = parts.some((p) =>
    benchTerms.some((bt) => p.includes(bt))
  );
  // Pure bench = has bench terms but no clinical terms
  return hasBench && !hasClinical;
}

function parseCityState(location: string): { city: string; stateOrRegion: string } {
  const parts = location.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    return { city: parts[0], stateOrRegion: parts[parts.length - 1] };
  }
  return { city: location, stateOrRegion: "" };
}

async function main() {
  console.log("Seeding database...");

  // Clean existing data in correct order (respecting foreign keys)
  await prisma.adminActionLog.deleteMany();
  await prisma.flagReport.deleteMany();
  await prisma.review.deleteMany();
  await prisma.savedListing.deleteMany();
  await prisma.comparedListing.deleteMany();
  await prisma.application.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.posterProfile.deleteMany();
  await prisma.applicantProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data.");

  const passwordHash = await hash("admin2026", 12);
  const posterPasswordHash = await hash("poster2026", 12);
  const applicantPasswordHash = await hash("applicant2026", 12);

  // 1. Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@uscehub.com",
      password: passwordHash,
      name: "Platform Admin",
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log("Created admin user:", admin.email);

  // 2. Create poster users with organizations
  const poster1 = await prisma.user.create({
    data: {
      email: "poster1@mountsinai.edu",
      password: posterPasswordHash,
      name: "Dr. Sarah Chen",
      role: "POSTER",
      emailVerified: true,
      posterProfile: {
        create: {
          contactName: "Dr. Sarah Chen",
          phone: "212-555-0101",
          title: "Program Director",
          institutionalEmail: "sarah.chen@mountsinai.edu",
          verificationStatus: "APPROVED",
        },
      },
    },
  });

  const org1 = await prisma.organization.create({
    data: {
      ownerId: poster1.id,
      name: "Mount Sinai Health System",
      type: "Academic Medical Center",
      contactName: "Dr. Sarah Chen",
      contactEmail: "gme@mountsinai.edu",
      phone: "212-555-0101",
      website: "https://www.mountsinai.org",
      city: "New York",
      state: "NY",
      description: "Mount Sinai Health System is one of the largest academic medical systems in the New York metropolitan area.",
      institutionalEmail: true,
      verificationStatus: "APPROVED",
      badges: "verified,academic",
    },
  });

  const poster2 = await prisma.user.create({
    data: {
      email: "poster2@clevelandclinic.org",
      password: posterPasswordHash,
      name: "Dr. James Wilson",
      role: "POSTER",
      emailVerified: true,
      posterProfile: {
        create: {
          contactName: "Dr. James Wilson",
          phone: "216-555-0201",
          title: "Associate Program Director",
          institutionalEmail: "james.wilson@clevelandclinic.org",
          verificationStatus: "APPROVED",
        },
      },
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      ownerId: poster2.id,
      name: "Cleveland Clinic",
      type: "Academic Medical Center",
      contactName: "Dr. James Wilson",
      contactEmail: "gme@clevelandclinic.org",
      phone: "216-555-0201",
      website: "https://my.clevelandclinic.org",
      city: "Cleveland",
      state: "OH",
      description: "Cleveland Clinic is a nonprofit multispecialty academic medical center.",
      institutionalEmail: true,
      verificationStatus: "APPROVED",
      badges: "verified,academic",
    },
  });

  console.log("Created 2 poster users with organizations.");

  // 3. Create applicant users
  const applicant1 = await prisma.user.create({
    data: {
      email: "applicant1@gmail.com",
      password: applicantPasswordHash,
      name: "Dr. Amir Patel",
      role: "APPLICANT",
      emailVerified: true,
      applicantProfile: {
        create: {
          country: "India",
          currentLocation: "Mumbai, India",
          medicalSchool: "Seth GS Medical College",
          graduationYear: "2023",
          currentRole: "Medical Graduate",
          specialtyInterest: "Internal Medicine",
          visaStatus: "B1/B2",
          usmleStep1: "Passed",
          usmleStep2: "249",
          ecfmgStatus: "Certified",
          shortBio: "Passionate about internal medicine with strong research background.",
        },
      },
    },
  });

  const applicant2 = await prisma.user.create({
    data: {
      email: "applicant2@gmail.com",
      password: applicantPasswordHash,
      name: "Dr. Maria Santos",
      role: "APPLICANT",
      emailVerified: true,
      applicantProfile: {
        create: {
          country: "Philippines",
          currentLocation: "Manila, Philippines",
          medicalSchool: "University of the Philippines College of Medicine",
          graduationYear: "2022",
          currentRole: "Medical Graduate",
          specialtyInterest: "Surgery",
          visaStatus: "B1/B2",
          usmleStep1: "Passed",
          usmleStep2: "255",
          ecfmgStatus: "Certified",
          shortBio: "Aspiring surgeon with clinical research experience in trauma surgery.",
        },
      },
    },
  });

  const applicant3 = await prisma.user.create({
    data: {
      email: "applicant3@gmail.com",
      password: applicantPasswordHash,
      name: "Dr. Ahmed Hassan",
      role: "APPLICANT",
      emailVerified: true,
      applicantProfile: {
        create: {
          country: "Egypt",
          currentLocation: "Cairo, Egypt",
          medicalSchool: "Cairo University Faculty of Medicine",
          graduationYear: "2024",
          currentRole: "Medical Graduate",
          specialtyInterest: "Cardiology",
          visaStatus: "None",
          usmleStep1: "Passed",
          usmleStep2: "In Progress",
          ecfmgStatus: "Not Yet",
          shortBio: "Interested in cardiovascular medicine and preventive cardiology research.",
        },
      },
    },
  });

  console.log("Created 3 applicant users.");

  // 4. Import programs from data.js as listings
  const programs = parsePrograms();
  console.log(`Parsed ${programs.length} programs from data.js`);

  // Track organizations we create for seed programs by a dedup key
  const orgMap = new Map<string, string>(); // key -> orgId

  // We'll assign programs in a round-robin to the two poster users
  const posterIds = [poster1.id, poster2.id];
  const orgIds = [org1.id, org2.id];

  let listingIds: string[] = [];

  let skipped = 0;
  for (let i = 0; i < programs.length; i++) {
    const program = programs[i];

    // Skip pure bench science programs (not relevant for IMG clinical research)
    if (isPureBenchScience(program.specialties)) {
      skipped++;
      continue;
    }

    const { city } = parseCityState(program.location);
    const posterIndex = i % 2;

    // Check if this program has a verified link
    const verifiedEntry = VERIFIED_LINKS[program.name];
    const finalUrl = verifiedEntry ? verifiedEntry.url : program.link;
    const isVerified = verifiedEntry ? verifiedEntry.verified : false;

    const listing = await prisma.listing.create({
      data: {
        title: program.name,
        listingType: mapListingType(program.type),
        specialty: program.specialties,
        city,
        state: program.state,
        country: "USA",
        format: "IN_PERSON",
        shortDescription: program.description.substring(0, 300),
        fullDescription: program.description,
        duration: program.duration,
        cost: program.feeAmount,
        applicationMethod: finalUrl ? "external" : "platform",
        eligibilitySummary: program.requirements,
        status: "APPROVED",
        applicationDeadline: program.deadline,
        visaSupport: program.visa.includes("J1"),
        websiteUrl: finalUrl,
        linkVerified: isVerified,
        posterId: posterIds[posterIndex],
        organizationId: orgIds[posterIndex],
      },
    });

    listingIds.push(listing.id);
  }

  console.log(`Created ${listingIds.length} listings from program data (skipped ${skipped} pure bench science programs).`);

  // 5. Create sample reviews
  const reviewListingIds = listingIds.slice(0, 5);
  const reviewers = [applicant1.id, applicant2.id, applicant3.id, applicant1.id, applicant2.id];
  const reviewData = [
    {
      overallRating: 5,
      wasReal: true,
      worthCost: true,
      actualExposure: 5,
      wouldRecommend: true,
      comment: "Excellent observership program. The attendings were incredibly welcoming and made sure I had meaningful clinical exposure every day. Highly recommend for IMGs looking for strong US clinical experience.",
      anonymous: false,
      moderationStatus: "APPROVED" as const,
    },
    {
      overallRating: 4,
      wasReal: true,
      worthCost: true,
      actualExposure: 4,
      wouldRecommend: true,
      comment: "Very well-organized program with great teaching. The only downside was the short duration. I wish I could have stayed longer. The letter of recommendation was strong and detailed.",
      anonymous: false,
      moderationStatus: "APPROVED" as const,
    },
    {
      overallRating: 3,
      wasReal: true,
      worthCost: false,
      actualExposure: 3,
      wouldRecommend: true,
      comment: "Decent experience overall. The clinical exposure was good but the fee was a bit high for what was offered. Still, the networking opportunities made it worthwhile.",
      anonymous: true,
      moderationStatus: "APPROVED" as const,
    },
    {
      overallRating: 5,
      wasReal: true,
      worthCost: true,
      actualExposure: 5,
      wouldRecommend: true,
      comment: "One of the best externship programs I have participated in. Hands-on experience with excellent supervision. The program coordinator was extremely helpful with logistics.",
      anonymous: false,
      moderationStatus: "APPROVED" as const,
    },
    {
      overallRating: 4,
      wasReal: true,
      worthCost: true,
      actualExposure: 4,
      wouldRecommend: true,
      comment: "Great research fellowship opportunity. Published two papers during my time here. The PI was very supportive and the lab environment was collaborative.",
      anonymous: false,
      moderationStatus: "APPROVED" as const,
    },
  ];

  for (let i = 0; i < 5; i++) {
    await prisma.review.create({
      data: {
        listingId: reviewListingIds[i],
        userId: reviewers[i],
        ...reviewData[i],
      },
    });
  }

  console.log("Created 5 sample reviews.");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
