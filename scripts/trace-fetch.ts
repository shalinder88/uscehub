import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  // Same call shape as page.tsx
  const listing = await prisma.listing.findUnique({
    where: { id: "cmo3386xy00371ny93hmww5rk" },
    include: {
      organization: true,
      poster: { select: { name: true, posterProfile: true } },
      reviews: {
        where: { moderationStatus: "APPROVED" },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!listing) { console.log("MISSING"); return; }
  console.log("extractedSignals keys:", Object.keys((listing as any).extractedSignals ?? {}));
  console.log("strong[0]:", JSON.stringify(((listing as any).extractedSignals?.strong?.[0]) ?? null));
  console.log("auditData?", !!(listing as any).auditData);
  await prisma.$disconnect();
})();
