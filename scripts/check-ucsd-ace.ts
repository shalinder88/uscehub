import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const row = await prisma.listing.findUnique({
    where: { id: "cmn2114h800iisb11rkvfsfk6" },
    select: { id: true, title: true, status: true, sourceUrl: true, shortDescription: true, adminNotes: true },
  });
  // Try various id prefix forms
  if (!row) {
    const r2 = await prisma.listing.findFirst({
      where: { title: { contains: "ACE", mode: "insensitive" }, sourceUrl: { contains: "ucsd" } },
      select: { id: true, title: true, status: true, sourceUrl: true, shortDescription: true, adminNotes: true },
    });
    console.log(JSON.stringify(r2, null, 2));
  } else {
    console.log(JSON.stringify(row, null, 2));
  }
  await prisma.$disconnect();
})();
