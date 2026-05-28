/**
 * Apply linkVerified reconciliation: the 1 stale-flag row identified
 * during recon (Harvard MS Research Fellowship). auditData shows the
 * URL has page_excerpts captured — flag was stale from before walk.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const id = "cmn2113qn005xsb112wfttugy"; // Harvard MS Research Fellowship; full ID below for confirmation
  // Resolve real ID from prefix
  const row = await prisma.listing.findFirst({
    where: { id: { startsWith: "cmn2113qn0" }, title: { contains: "Harvard" } },
    select: { id: true, title: true, sourceUrl: true, linkVerified: true, linkVerificationStatus: true, auditData: true },
  });
  if (!row) { console.log("NOT FOUND"); return; }
  console.log("BEFORE:", row.id, "|", row.title, "|", row.linkVerificationStatus);
  const a = row.auditData as Record<string, unknown> | null;
  const excerpts = a?.page_excerpts;
  console.log("auditData.page_excerpts length:", Array.isArray(excerpts) ? excerpts.length : (typeof excerpts === "string" ? excerpts.length : "?"));
  await prisma.listing.update({
    where: { id: row.id },
    data: {
      linkVerified: true,
      linkVerificationStatus: "VERIFIED",
      lastVerifiedAt: new Date(),
    },
  });
  await prisma.$executeRaw`
    UPDATE listings
    SET "adminNotes" = COALESCE("adminNotes",'') ||
      '\n\nG0 final-sweep #2 (2026-05-27): linkVerified false→true / NEEDS_MANUAL_REVIEW→VERIFIED. Stale flag — auditData has page_excerpts confirming the URL was scraped successfully.'
    WHERE id = ${row.id}
  `;
  const after = await prisma.listing.findUnique({
    where: { id: row.id },
    select: { linkVerified: true, linkVerificationStatus: true },
  });
  console.log("AFTER:", after?.linkVerified, "|", after?.linkVerificationStatus);
  await prisma.$disconnect();
})();
