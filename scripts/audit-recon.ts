import { prisma } from "../src/lib/prisma";

(async () => {
  const all = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      title: true,
      listingType: true,
      city: true,
      state: true,
      shortDescription: true,
      fullDescription: true,
      websiteUrl: true,
      sourceUrl: true,
      duration: true,
      cost: true,
      specialty: true,
      eligibilitySummary: true,
      visaSupport: true,
      certificateOffered: true,
      lorPossible: true,
      linkVerified: true,
      linkVerificationStatus: true,
    },
    orderBy: [{ listingType: "asc" }, { title: "asc" }],
  });

  const byType: Record<string, typeof all> = {};
  for (const l of all) {
    if (!byType[l.listingType]) byType[l.listingType] = [];
    byType[l.listingType].push(l);
  }

  const summary: Record<string, { total: number; sample: string[]; shortDescAvg: number; fullDescAvg: number; missingShort: number; missingFull: number; noCost: number; noDuration: number; noUrl: number; }> = {};

  for (const [type, rows] of Object.entries(byType)) {
    const shortLens = rows.map(r => r.shortDescription?.length ?? 0);
    const fullLens = rows.map(r => r.fullDescription?.length ?? 0);
    summary[type] = {
      total: rows.length,
      sample: rows.slice(0, 5).map(r => `${r.id}|${r.title}`),
      shortDescAvg: Math.round(shortLens.reduce((a,b) => a+b, 0) / rows.length),
      fullDescAvg: Math.round(fullLens.reduce((a,b) => a+b, 0) / rows.length),
      missingShort: shortLens.filter(l => l < 50).length,
      missingFull: fullLens.filter(l => l < 100).length,
      noCost: rows.filter(r => !r.cost || r.cost.length < 3).length,
      noDuration: rows.filter(r => !r.duration || r.duration.length < 3).length,
      noUrl: rows.filter(r => !r.websiteUrl && !r.sourceUrl).length,
    };
  }

  console.log(JSON.stringify(summary, null, 2));
  await prisma.$disconnect();
})();
