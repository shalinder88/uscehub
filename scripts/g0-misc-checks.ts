import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  // (1) Moran Eye prod. subdomain check
  const moran = await prisma.listing.findFirst({
    where: { title: { contains: "Moran Eye" }, status: "APPROVED" },
    select: { id: true, title: true, sourceUrl: true },
  });
  console.log("MORAN EYE:");
  console.log("  id:", moran?.id);
  console.log("  url:", moran?.sourceUrl);
  console.log();

  // (2) UNC #174 fullDescription nav-text check
  const unc = await prisma.listing.findMany({
    where: { title: { contains: "UNC" }, status: "APPROVED" },
    select: { id: true, title: true, fullDescription: true },
  });
  for (const u of unc) {
    const len = u.fullDescription?.length ?? 0;
    const nav = (u.fullDescription ?? "").toLowerCase().includes("menu") ||
                (u.fullDescription ?? "").toLowerCase().includes("skip to") ||
                (u.fullDescription ?? "").toLowerCase().includes("breadcrumb");
    console.log(`UNC: ${u.title.slice(0,60)} | len=${len} | navNoise=${nav}`);
  }
  console.log();

  // (3) Vanderbilt VOE — was the scope-question flagged
  const voe = await prisma.listing.findFirst({
    where: { title: { contains: "Vanderbilt" }, status: "APPROVED" },
    select: { id: true, title: true, shortDescription: true, duration: true, adminNotes: true },
  });
  console.log("VANDERBILT VOE:");
  console.log("  id:", voe?.id);
  console.log("  title:", voe?.title);
  console.log("  duration:", voe?.duration);
  console.log("  shortDesc:", voe?.shortDescription?.slice(0,200));
  console.log();

  await prisma.$disconnect();
})();
