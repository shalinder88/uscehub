import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  // Overall counts by status
  const byStatus = await prisma.listing.groupBy({
    by: ["status"],
    _count: { id: true },
    orderBy: { status: "asc" },
  });
  console.log("BY STATUS:");
  for (const r of byStatus) console.log(`  ${r.status.padEnd(10)} ${r._count.id}`);
  console.log();

  // APPROVED breakdown by listingType
  const byType = await prisma.listing.groupBy({
    by: ["listingType"],
    where: { status: "APPROVED" },
    _count: { id: true },
    orderBy: { listingType: "asc" },
  });
  console.log("APPROVED BY listingType:");
  let total = 0;
  for (const r of byType) {
    console.log(`  ${r.listingType.padEnd(30)} ${r._count.id}`);
    total += r._count.id;
  }
  console.log(`  ${"TOTAL".padEnd(30)} ${total}`);
  console.log();

  // APPROVED unique specialties count
  const specialties = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    select: { specialty: true },
  });
  const uniqueSpec = new Set(specialties.map(s => s.specialty).filter(Boolean));
  console.log(`APPROVED unique 'specialty' field values: ${uniqueSpec.size}`);
  // Show top 10
  const counts = new Map<string, number>();
  for (const s of specialties) counts.set(s.specialty, (counts.get(s.specialty) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a,b) => b[1] - a[1]);
  console.log("Top 10 specialty values:");
  for (const [name, n] of sorted.slice(0, 10)) console.log(`  ${n.toString().padStart(3)} ${name.slice(0,60)}`);

  await prisma.$disconnect();
})();
