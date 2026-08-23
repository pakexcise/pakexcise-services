import { prisma } from "@/server/db/client";
import {
  cleanupLegacyServiceSeo,
  syncAllActiveServiceRegionSeo,
} from "@/features/services/lib/sync-service-region-seo";

async function main() {
  await cleanupLegacyServiceSeo();
  const result = await syncAllActiveServiceRegionSeo();
  console.log("Service region SEO synced.");
  void result;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
