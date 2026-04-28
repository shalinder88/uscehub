import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { VERIFIED_LINKS } from "./verified-links";
import { getSeedAdminCredentials, shouldSeedCreateAdmin } from "../src/lib/env";

// ─────────────────────────────────────────────────────────────────
// SEED PRESERVATION NOTES — read before running.
//
// 1. ADMIN CREATION IS OPT-IN (audit P0-1 + P0-3, fully fixed in cleanup PR6):
//    Admin user creation is OFF by default. To create an admin during
//    seed, set BOTH:
//      SEED_CREATE_ADMIN=1
//      SEED_ADMIN_EMAIL=<your-email>
//      SEED_ADMIN_PASSWORD=<long-random-string>
//
//    When SEED_CREATE_ADMIN is unset (or != "1"), the admin block is
//    skipped and a log line announces it. The systemPoster account
//    (used to own seed-created listings) gets its own throwaway
//    random password every run — nobody logs in as it externally.
//
//    The previously hardcoded admin password literal has been removed
//    from source — see docs/codebase-audit/TECH_DEBT_REGISTER.md P0-1
//    and P0-3 for the historical context. NEVER reintroduce a
//    hardcoded password and NEVER make admin creation the default.
//
// 2. SIBLING-REPO DEPENDENCY (audit P0-2, NOT fixed here):
//    `parsePrograms()` below reads from
//      ../../usmle-observerships/data.js
//    which is a sibling repository on the local filesystem. This
//    means seed will FAIL in CI / fresh clones / Vercel — no warning,
//    just a "Could not parse PROGRAMS from data.js" error.
//
//    Cleanup PR3 deliberately does NOT fix this; the proper fix is
//    to copy the source data into this repo (e.g. into
//    `prisma/seed-data/observerships-bootstrap.json`) so seed is
//    self-contained, but that is a data-handling decision the user
//    must approve. Per docs/codebase-audit/RULES.md the sibling repo
//    is preserved and not touched here.
//
//    Future PR: move the data, drop the path.resolve, delete the
//    Function-eval shim. Until then: seed only works on shelly's
//    local machine where the sibling repo is checked out.
// ─────────────────────────────────────────────────────────────────

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

  // 1. Create admin user (OPT-IN, see header preservation note).
  if (shouldSeedCreateAdmin()) {
    // Throws MissingEnvError BEFORE any DB write if env vars unset.
    const seedAdmin = getSeedAdminCredentials();
    const adminHash = await hash(seedAdmin.password, 12);
    const admin = await prisma.user.create({
      data: {
        email: seedAdmin.email,
        password: adminHash,
        name: "Platform Admin",
        role: "ADMIN",
        emailVerified: true,
      },
    });
    // Do NOT log the password — only the email.
    console.log("Created admin user:", admin.email);
  } else {
    console.log(
      "Skipped admin user creation (SEED_CREATE_ADMIN != '1'). " +
        "Set SEED_CREATE_ADMIN=1 with SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to enable.",
    );
  }

  // 2. Create system poster (for seed listings — no fake people).
  // Uses an ephemeral random password every run — nobody logs in as
  // the system account externally; this keeps systemPoster decoupled
  // from the admin opt-in flag.
  const systemPasswordHash = await hash(randomBytes(32).toString("base64url"), 12);
  const systemPoster = await prisma.user.create({
    data: {
      email: "system@uscehub.com",
      password: systemPasswordHash,
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

  const listingIds: string[] = [];

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
        eligibilitySummary: (program.requirements || '') + (program.visa ? ' | Visa: ' + program.visa : ''),
        status: "APPROVED",
        applicationDeadline: program.deadline,
        visaSupport: !!(program.visa && program.visa.length > 0 && program.visa !== "N/A"),
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
