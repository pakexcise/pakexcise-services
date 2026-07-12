import { PrismaClient } from "@prisma/client";

import { seedServiceConfig } from "./seed-service-config";

const TARGET_SERVICE_SLUGS = ["driving-license-renewal", "e-challan"] as const;

async function main() {
  const prisma = new PrismaClient();

  try {
    const [regions, services] = await Promise.all([
      prisma.region.findMany({
        where: { deletedAt: null },
        select: { id: true, slug: true }}),
      prisma.service.findMany({
        where: {
          slug: { in: [...TARGET_SERVICE_SLUGS] },
          deletedAt: null},
        select: { id: true, slug: true }})]);

    const regionMap = Object.fromEntries(regions.map((region) => [region.slug, region.id]));
    const serviceMap = Object.fromEntries(services.map((service) => [service.slug, service.id]));

    const missing = TARGET_SERVICE_SLUGS.filter((slug) => !serviceMap[slug]);
    if (missing.length > 0) {
      throw new Error(`Missing services in database: ${missing.join(", ")}`);
    }

    console.log("Updating service form fields and document requirements...");
    await seedServiceConfig(prisma, regionMap, serviceMap, {
      serviceSlugs: [...TARGET_SERVICE_SLUGS]});
    console.log("Service form fields and document requirements updated.");

    const globalFaqUpdate = await prisma.fAQ.updateMany({
      where: {
        serviceId: null,
        questionEn: "Does PakExcise support e-challan services?"},
      data: {
        answerEn:
          "Yes. PakExcise provides private guidance and support for e-challan/Safe City-related queries. Users may need to upload a clear smart card or registration book depending on the request."}});
    console.log(`Updated ${globalFaqUpdate.count} global e-challan FAQ answer(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
