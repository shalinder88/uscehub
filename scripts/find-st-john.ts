import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const rows = await prisma.listing.findMany({
    where: {
      OR: [
        { title: { contains: "St John", mode: "insensitive" } },
        { title: { contains: "Episcopal", mode: "insensitive" } },
        { fullDescription: { contains: "Dermatology\nOB/GYN", mode: "insensitive" } },
        { fullDescription: { contains: "OB/GYN Elective", mode: "insensitive" } },
      ],
      status: "APPROVED",
    },
    select: { id: true, title: true, fullDescription: true },
    take: 5,
  });
  for (const r of rows) {
    console.log(`=== ${r.title}`);
    console.log(`id: ${r.id}`);
    console.log(`fullDescription[:500]: ${(r.fullDescription || "").slice(0, 500)}`);
    console.log("---");
  }
  await prisma.$disconnect();
})();
