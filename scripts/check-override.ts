import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const ids = [
    "cmo3386pc002v1ny92dflv0b9",
    "cmo3386sa002z1ny9arnxr27u",
    "cmo3386xy00371ny93hmww5rk",
    "cmo33852p000p1ny92siexq0s",
    "cmn2113e6005qsb114hstszfc",
  ];
  for (const id of ids) {
    const row = await prisma.listing.findUnique({
      where: { id },
      select: { title: true, extractedSignals: true },
    });
    if (!row) { console.log(`MISSING: ${id}`); continue; }
    const ext = row.extractedSignals as any;
    const keys = ext ? Object.keys(ext) : [];
    const counts = keys.map(k => `${k}=${Array.isArray(ext[k]) ? ext[k].length : "?"}`).join(", ");
    console.log(`${id.slice(0,8)} | ${row.title.slice(0,50)} | [${counts}]`);
  }
  await prisma.$disconnect();
})();
