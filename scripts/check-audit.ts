import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  // Raw query to bypass Prisma client
  const result: any[] = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'auditData'`;
  console.log("auditData column exists in DB:", result.length > 0);
  await p.$disconnect();
})();
