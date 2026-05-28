import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  // Find the most common posterId on existing rows
  const top = await prisma.listing.groupBy({
    by: ["posterId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 3,
  });
  for (const t of top) {
    const u = await prisma.user.findUnique({ where: { id: t.posterId }, select: { email: true, name: true, role: true } });
    console.log(`${t.posterId} | ${t._count.id} rows | ${u?.email} | ${u?.name} | ${u?.role}`);
  }
  await prisma.$disconnect();
})();
