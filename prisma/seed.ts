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

  // 2. Create system poster (for seed listings — no fake people)
  const systemPoster = await prisma.user.create({
    data: {
      email: "system@uscehub.com",
      password: passwordHash,
      name: "USCEHub System",
      role: "POSTER",
      emailVerified: true,
      posterProfile: {
        create: {
          contactName: "USCEHub Platform",
          title: "System Account",
          verificationStatus: "APPROVED",
        },
      },
    },
  });

  const systemOrg = await prisma.organization.create({
    data: {
      ownerId: systemPoster.id,
      name: "USCEHub Directory",
      type: "Platform",
      contactName: "USCEHub",
      contactEmail: "admin@uscehub.com",
      website: "https://uscehub.com",
      city: "N/A",
      state: "N/A",
      description: "Programs listed by USCEHub from publicly available information. Details should be verified directly with each institution.",
      institutionalEmail: false,
      verificationStatus: "APPROVED",
      badges: "platform",
    },
  });

  console.log("Created system poster for seed listings.");

  // 4. Import programs from data.js as listings
  const programs = parsePrograms();
  console.log(`Parsed ${programs.length} programs from data.js`);

  // All seed listings are posted by the system account
  const posterId = systemPoster.id;
  const orgId = systemOrg.id;

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
        posterId: posterId,
        organizationId: orgId,
      },
    });

    listingIds.push(listing.id);
  }

  console.log(`Created ${listingIds.length} listings from program data (skipped ${skipped} pure bench science programs).`);

  // No fake reviews — reviews will come from real users only
  console.log("No sample reviews created — reviews will come from real users.");
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
