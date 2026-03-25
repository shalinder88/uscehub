/**
 * GME Outreach Script
 *
 * Generates:
 * 1. CSV file of all listings for Google Sheets (outreach tracking)
 * 2. Individual email templates for each listing
 * 3. Twitter/X post templates
 * 4. Facebook post templates
 *
 * Run: npx tsx scripts/gme-outreach.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const LISTING_TYPE_LABELS: Record<string, string> = {
  OBSERVERSHIP: "Clinical Observership",
  EXTERNSHIP: "Clinical Externship",
  RESEARCH: "Research Fellowship",
  POSTDOC: "Research Fellowship",
  ELECTIVE: "Elective Rotation",
  VOLUNTEER: "Volunteer Program",
};

async function main() {
  const listings = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ state: "asc" }, { title: "asc" }],
  });

  console.log(`Found ${listings.length} approved listings\n`);

  const outDir = path.join(process.cwd(), "scripts", "outreach-output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // ─── 1. CSV for Google Sheets ──────────────────────────────────────────────
  const csvHeader = [
    "Hospital/Program",
    "Type",
    "Specialty",
    "City",
    "State",
    "Duration",
    "Cost",
    "Website URL",
    "Listing URL",
    "Contact Email",
    "Outreach Status",
    "Date Emailed",
    "Response",
    "Notes",
  ].join(",");

  const csvRows = listings.map((l) => {
    const listingUrl = `https://uscehub.com/listing/${l.id}`;
    return [
      `"${l.title.replace(/"/g, '""')}"`,
      LISTING_TYPE_LABELS[l.listingType] || l.listingType,
      `"${l.specialty}"`,
      `"${l.city}"`,
      l.state,
      `"${l.duration}"`,
      `"${l.cost}"`,
      l.websiteUrl || "",
      listingUrl,
      l.contactEmail || "",
      "Not Started",
      "",
      "",
      "",
    ].join(",");
  });

  const csv = [csvHeader, ...csvRows].join("\n");
  fs.writeFileSync(path.join(outDir, "gme-outreach-list.csv"), csv);
  console.log(`✓ CSV saved: outreach-output/gme-outreach-list.csv (${listings.length} rows)`);

  // ─── 2. Email Templates ───────────────────────────────────────────────────
  const emails: string[] = [];

  // Group by state for organized outreach
  const byState: Record<string, typeof listings> = {};
  listings.forEach((l) => {
    if (!byState[l.state]) byState[l.state] = [];
    byState[l.state].push(l);
  });

  const stateNames: Record<string, string> = {
    AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
    CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"Washington DC",FL:"Florida",
    GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",
    IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",
    MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",
    MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",
    NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",
    OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",
    SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",
    VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
  };

  for (const [state, stateListings] of Object.entries(byState)) {
    emails.push(`\n${"=".repeat(60)}`);
    emails.push(`STATE: ${stateNames[state] || state} (${stateListings.length} programs)`);
    emails.push(`${"=".repeat(60)}\n`);

    for (const l of stateListings) {
      const listingUrl = `https://uscehub.com/listing/${l.id}`;
      const typeLabel = LISTING_TYPE_LABELS[l.listingType] || l.listingType;

      emails.push(`─── ${l.title} ───`);
      emails.push(``);
      emails.push(`SUBJECT: Verification request — ${l.title} listing`);
      emails.push(``);
      emails.push(`Hi,`);
      emails.push(``);
      emails.push(`I'm reaching out from USCEHub.com — a free directory of clinical observership and externship opportunities for International Medical Graduates.`);
      emails.push(``);
      emails.push(`We currently list the following information about your program:`);
      emails.push(``);
      emails.push(`  • Program: ${l.title}`);
      emails.push(`  • Type: ${typeLabel}`);
      emails.push(`  • Specialty: ${l.specialty}`);
      emails.push(`  • Location: ${l.city}, ${stateNames[l.state] || l.state}`);
      emails.push(`  • Duration: ${l.duration}`);
      emails.push(`  • Cost: ${l.cost}`);
      if (l.websiteUrl) emails.push(`  • Website: ${l.websiteUrl}`);
      emails.push(``);
      emails.push(`Could you confirm this is accurate? If anything needs updating, we're happy to correct it immediately.`);
      emails.push(``);
      emails.push(`Your listing is live at: ${listingUrl}`);
      emails.push(``);
      emails.push(`This is completely free — we don't charge institutions or students. USCEHub is built to help IMGs find legitimate clinical opportunities.`);
      emails.push(``);
      emails.push(`Best regards,`);
      emails.push(`USCEHub Team`);
      emails.push(`https://uscehub.com`);
      emails.push(``);
      emails.push(``);
    }
  }

  fs.writeFileSync(path.join(outDir, "email-templates.txt"), emails.join("\n"));
  console.log(`✓ Email templates saved: outreach-output/email-templates.txt (${listings.length} emails)`);

  // ─── 3. Twitter/X Posts ────────────────────────────────────────────────────
  const tweets: string[] = [];
  tweets.push("TWITTER/X POST TEMPLATES");
  tweets.push("Post 2-3 per day. Space them out. Don't spam.\n");

  for (const l of listings) {
    const listingUrl = `https://uscehub.com/listing/${l.id}`;
    const typeLabel = LISTING_TYPE_LABELS[l.listingType] || l.listingType;
    const stateName = stateNames[l.state] || l.state;

    // Variation 1: Program announcement
    tweets.push(`─── Tweet Option A ───`);
    tweets.push(`📋 ${typeLabel} available in ${l.specialty} at ${l.title} (${l.city}, ${stateName})`);
    tweets.push(`Duration: ${l.duration} | Cost: ${l.cost}`);
    tweets.push(`Full details → ${listingUrl}`);
    tweets.push(`#IMG #USCE #Observership #MedTwitter #Residency`);
    tweets.push(``);

    // Variation 2: Question style
    tweets.push(`─── Tweet Option B ───`);
    tweets.push(`Looking for a ${l.specialty.toLowerCase()} ${typeLabel.toLowerCase()} in ${stateName}? 🏥`);
    tweets.push(`${l.title} has openings.`);
    tweets.push(`${listingUrl}`);
    tweets.push(`#IMG #USMLE #ClinicalExperience`);
    tweets.push(``);
  }

  fs.writeFileSync(path.join(outDir, "twitter-posts.txt"), tweets.join("\n"));
  console.log(`✓ Twitter templates saved: outreach-output/twitter-posts.txt (${listings.length * 2} tweets)`);

  // ─── 4. Facebook Posts ─────────────────────────────────────────────────────
  const fbPosts: string[] = [];
  fbPosts.push("FACEBOOK GROUP POST TEMPLATES");
  fbPosts.push("Post in IMG groups. 1-2 posts per day. Rotate groups.\n");

  // Batch posts by state (more natural for Facebook)
  for (const [state, stateListings] of Object.entries(byState)) {
    const stateName = stateNames[state] || state;
    fbPosts.push(`─── ${stateName} Batch Post ───`);
    fbPosts.push(``);
    fbPosts.push(`🏥 ${stateListings.length} clinical opportunities for IMGs in ${stateName}`);
    fbPosts.push(``);
    fbPosts.push(`Just updated our database with verified programs:`);
    fbPosts.push(``);

    for (const l of stateListings.slice(0, 5)) {
      const typeLabel = LISTING_TYPE_LABELS[l.listingType] || l.listingType;
      fbPosts.push(`• ${l.title} — ${typeLabel} in ${l.specialty} (${l.cost})`);
    }

    if (stateListings.length > 5) {
      fbPosts.push(`• ...and ${stateListings.length - 5} more`);
    }

    fbPosts.push(``);
    fbPosts.push(`All free to browse. No login required.`);
    fbPosts.push(`🔗 https://uscehub.com/observerships/${stateName.toLowerCase().replace(/\s+/g, "-")}`);
    fbPosts.push(``);
    fbPosts.push(`#IMG #Observership #USCE #Residency #MedicalGraduate`);
    fbPosts.push(``);
    fbPosts.push(``);
  }

  // Weekly highlight post
  fbPosts.push(`─── Weekly Highlight Post ───`);
  fbPosts.push(``);
  fbPosts.push(`USCEHub now has ${listings.length}+ verified clinical opportunities for IMGs across the United States.`);
  fbPosts.push(``);
  fbPosts.push(`✅ Observerships, externships, and research positions`);
  fbPosts.push(`✅ Filter by state, specialty, cost, and visa support`);
  fbPosts.push(`✅ Community reviews from past participants`);
  fbPosts.push(`✅ 100% free — no paywalls, no hidden fees`);
  fbPosts.push(``);
  fbPosts.push(`Built by a physician who went through the IMG process.`);
  fbPosts.push(``);
  fbPosts.push(`🔗 https://uscehub.com/browse`);
  fbPosts.push(``);
  fbPosts.push(``);

  // New listing announcement template
  fbPosts.push(`─── New Listing Announcement Template ───`);
  fbPosts.push(``);
  fbPosts.push(`🆕 New listing just verified on USCEHub:`);
  fbPosts.push(``);
  fbPosts.push(`[Program Name] — [Type] in [Specialty]`);
  fbPosts.push(`📍 [City, State]`);
  fbPosts.push(`⏱ Duration: [X weeks]`);
  fbPosts.push(`💰 Cost: [Free / $X]`);
  fbPosts.push(``);
  fbPosts.push(`Details → [listing URL]`);
  fbPosts.push(``);

  fs.writeFileSync(path.join(outDir, "facebook-posts.txt"), fbPosts.join("\n"));
  console.log(`✓ Facebook templates saved: outreach-output/facebook-posts.txt`);

  // ─── 5. Summary Stats ─────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log(`OUTREACH SUMMARY`);
  console.log(`${"─".repeat(50)}`);
  console.log(`Total listings: ${listings.length}`);
  console.log(`States covered: ${Object.keys(byState).length}`);
  console.log(`\nTop states:`);

  Object.entries(byState)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10)
    .forEach(([state, list]) => {
      console.log(`  ${stateNames[state] || state}: ${list.length} programs`);
    });

  console.log(`\nFiles saved to: scripts/outreach-output/`);
  console.log(`\nNEXT STEPS:`);
  console.log(`1. Import gme-outreach-list.csv into Google Sheets`);
  console.log(`2. Add "GME Email" column — Google each hospital's GME office email`);
  console.log(`3. Use email-templates.txt — copy/paste personalized emails`);
  console.log(`4. Send 10-15 emails per day (start with NY, IL, MI, OH, PA)`);
  console.log(`5. Track responses in the Google Sheet`);
  console.log(`6. Schedule twitter-posts.txt in Buffer (2-3 per day)`);
  console.log(`7. Post facebook-posts.txt in IMG groups (1-2 per day)\n`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
