import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
p.listing.groupBy({ by: ["listingType"], where: { status: "APPROVED" }, _count: { _all: true } }).then(r => {
  r.sort((a,b) => b._count._all - a._count._all);
  for (const x of r) console.log(`  ${x.listingType}: ${x._count._all}`);
}).finally(() => p.$disconnect());
