/**
 * Gap-walk duplicate guard. Given a search phrase, returns all matching
 * rows so we can confirm we aren't re-inserting an existing program.
 * Run: npx tsx scripts/gap-dup-check.ts "UC Davis"
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const phrase = process.argv[2];
  if (!phrase) { console.log("usage: tsx scripts/gap-dup-check.ts <phrase>"); return; }
  const rows = await prisma.listing.findMany({
    where: {
      OR: [
        { title: { contains: phrase, mode: "insensitive" } },
        { fullDescription: { contains: phrase, mode: "insensitive" } },
        { sourceUrl: { contains: phrase, mode: "insensitive" } },
      ],
    },
    select: { id: true, title: true, status: true, sourceUrl: true, listingType: true, audienceTag: true },
    orderBy: { title: "asc" },
  });
  console.log(`Matches for "${phrase}" (${rows.length}):`);
  for (const r of rows) {
    console.log(`  ${r.status.padEnd(8)} ${r.listingType.padEnd(28)} ${r.id.slice(0,8)} | ${r.title.slice(0,70)}`);
    console.log(`           ${r.sourceUrl?.slice(0,100) ?? "(no url)"}`);
  }
  await prisma.$disconnect();
})();
