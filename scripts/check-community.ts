import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const total = await prisma.user.count();
  const byRole = await prisma.user.groupBy({ by: ["role"], _count: { id: true }, orderBy: { role: "asc" } });
  console.log("Total users:", total);
  console.log("By role:");
  for (const r of byRole) console.log(`  ${r.role}: ${r._count.id}`);
  await prisma.$disconnect();
})();
