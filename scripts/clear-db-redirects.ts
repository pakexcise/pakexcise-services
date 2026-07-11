/**
 * Wipe all admin DB redirects. Built-in SEO aliases stay in next.config.ts.
 * Usage: pnpm db:clear-redirects
 */
import { PrismaClient } from "@prisma/client";

import { LEGACY_SERVICE_SLUGS_TO_DEACTIVATE } from "../config/legacy-url-redirects";

const prisma = new PrismaClient();

async function main() {
  const before = await prisma.redirect.count();

  const deleted = await prisma.redirect.deleteMany({});

  await prisma.service.updateMany({
    where: { slug: { in: [...LEGACY_SERVICE_SLUGS_TO_DEACTIVATE] } },
    data: { isActive: false },
  });

  console.log(
    `Cleared ${deleted.count} DB redirects (was ${before}). Built-in next.config aliases unchanged.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
