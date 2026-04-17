// Seeds 60 verified 2026 observership listings into the production DB.
// Run once with: npx tsx scripts/seed-2026-observerships.ts
// All records use the system poster and are set APPROVED + linkVerified.
// Top 6 flagged `featured: true` surface on the homepage via FeaturedListings.

import { PrismaClient } from "@prisma/client";
import { batch1 } from "./data/observerships-2026-b1";
import { batch2 } from "./data/observerships-2026-b2";
import { batch3 } from "./data/observerships-2026-b3";
import { batch4 } from "./data/observerships-2026-b4";
import { clerkshipsA } from "./data/clerkships-2026-a";
import { clerkshipsB } from "./data/clerkships-2026-b";

const SYSTEM_POSTER_ID = "cmn2110rm0001sb11op4cbmc9"; // system@uscehub.com

const prisma = new PrismaClient();

async function main() {
  const allRecords = [
    ...batch1, ...batch2, ...batch3, ...batch4,
    ...clerkshipsA, ...clerkshipsB,
  ];
  console.log(`Seeding ${allRecords.length} records...`);

  let featured = 0;
  for (const r of allRecords) if (r.featured) featured++;
  console.log(`${featured} flagged as featured for homepage.`);

  let inserted = 0;
  let skipped = 0;
  for (const r of allRecords) {
    // Skip if a listing with this exact title + city + state already exists
    // (idempotent re-run safety).
    const existing = await prisma.listing.findFirst({
      where: { title: r.title, city: r.city, state: r.state },
      select: { id: true },
    });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.listing.create({
      data: {
        title: r.title,
        listingType: r.listingType,
        specialty: r.specialty,
        city: r.city,
        state: r.state,
        country: "USA",
        format: r.format,
        cost: r.cost,
        duration: r.duration,
        websiteUrl: r.websiteUrl,
        contactEmail: r.contactEmail,
        shortDescription: r.shortDescription,
        fullDescription: r.fullDescription,
        eligibilitySummary: r.eligibilitySummary,
        certificateOffered: r.certificateOffered,
        lorPossible: r.lorPossible,
        visaSupport: r.visaSupport,
        ecfmgRequired: r.ecfmgRequired,
        stepRequirements: r.stepRequirements,
        graduationYearPref: r.graduationYearPref,
        applicationMethod: "external",
        status: "APPROVED",
        linkVerified: true,
        featured: r.featured,
        audienceTag: r.audienceTag,
        usmleTier: r.usmleTier,
        adminNotes: r.adminNotes,
        posterId: SYSTEM_POSTER_ID,
      },
    });
    inserted++;
  }

  console.log(`Done. Inserted: ${inserted}, skipped existing: ${skipped}.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
