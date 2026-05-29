import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const rows = await prisma.listing.groupBy({
    by: ["listingType", "status"],
    _count: { id: true },
    orderBy: [{ listingType: "asc" }, { status: "asc" }],
  });
  console.log(`${'listingType'.padEnd(28)} ${'status'.padEnd(10)} count`);
  console.log("-".repeat(50));
  for (const r of rows) console.log(`${r.listingType.padEnd(28)} ${r.status.padEnd(10)} ${r._count.id}`);
  await prisma.$disconnect();
})();
