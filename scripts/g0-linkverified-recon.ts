/**
 * G0 deferred task #2: find rows with linkVerified=false but auditData
 * shows the URL was successfully scraped (status 200). Report only.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const rows = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      linkVerified: false,
      auditData: { not: undefined as never },
    },
    select: { id: true, title: true, sourceUrl: true, linkVerificationStatus: true, auditData: true },
  });
  let stale = 0;
  const candidates: string[] = [];
  for (const r of rows) {
    const a = r.auditData as Record<string, unknown> | null;
    if (!a) continue;
    // Look for indicators that the scrape succeeded
    const httpStatus = a.http_status ?? a.status ?? a.statusCode;
    const excerpts = a.page_excerpts ?? a.excerpts ?? a.content;
    const ok = (typeof httpStatus === "number" && httpStatus >= 200 && httpStatus < 400) ||
               (Array.isArray(excerpts) && excerpts.length > 0) ||
               (typeof excerpts === "string" && excerpts.length > 100);
    if (ok) {
      stale++;
      candidates.push(`${r.id.slice(0,10)} | ${r.linkVerificationStatus ?? "?"} | ${r.title.slice(0,55)}`);
    }
  }
  console.log(`Surveyed: ${rows.length} APPROVED rows with linkVerified=false + auditData not null`);
  console.log(`Stale-flag candidates (auditData shows WORKING): ${stale}`);
  console.log("---");
  for (const c of candidates) console.log(c);
  await prisma.$disconnect();
})();
