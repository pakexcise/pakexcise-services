/**
 * One-shot: wipe redirects and install the recommended legacy service map.
 * Usage: pnpm exec tsx scripts/reset-recommended-redirects.ts
 */
import {
  LEGACY_SERVICE_SLUGS_TO_DEACTIVATE,
  RECOMMENDED_SERVICE_REDIRECTS,
} from "../config/recommended-redirects";
import { prisma } from "../server/db/client";

async function main() {
  const before = await prisma.redirect.count();

  await prisma.redirect.deleteMany({});

  await prisma.service.updateMany({
    where: { slug: { in: [...LEGACY_SERVICE_SLUGS_TO_DEACTIVATE] } },
    data: { isActive: false },
  });

  await prisma.redirect.createMany({
    data: RECOMMENDED_SERVICE_REDIRECTS.map((item) => ({
      oldSlug: item.oldSlug,
      newSlug: item.newSlug,
      statusCode: 301,
      isActive: true,
    })),
  });

  const after = await prisma.redirect.count();
  console.log(
    `Redirects reset: deleted ${before}, created ${after} recommended service redirects.`,
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
