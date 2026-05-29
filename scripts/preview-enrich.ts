import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const r = await p.listing.findUnique({
    where: { id: "cmn21111q000csb1163kfm97r" },
    select: { title: true, fullDescription: true, shortDescription: true },
  });
  const audit: any = (await p.$queryRaw<any[]>`SELECT "auditData" FROM listings WHERE id = ${'cmn21111q000csb1163kfm97r'}`)[0]?.auditData;
  console.log("=== NYP-Columbia ===");
  console.log("Current fullDescription (", (r?.fullDescription || "").length, "chars):");
  console.log("  ", r?.fullDescription);
  console.log("\nWould enrich to (first 2 audit page_excerpts):");
  if (audit?.page_excerpts?.length) {
    for (let i = 0; i < Math.min(2, audit.page_excerpts.length); i++) {
      console.log(`  [${audit.page_excerpts[i].section_heading || 'no heading'}]`);
      console.log(`  ${audit.page_excerpts[i].text.slice(0, 400)}`);
    }
  }
  await p.$disconnect();
})();
