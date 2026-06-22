import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const featuredServiceSlugs = [
  "vehicle-transfer",
  "token-tax-payment",
  "new-vehicle-registration",
  "driving-license-renewal",
  "learner-license",
  "e-challan",
  "route-permit",
  "vehicle-data-correction",
];

async function main() {
  for (const [index, slug] of featuredServiceSlugs.entries()) {
    await prisma.service.updateMany({
      where: { slug, deletedAt: null },
      data: {
        showInFooter: true,
        footerDisplayOrder: index + 1,
      },
    });
  }

  const featuredServices = await prisma.service.findMany({
    where: { isFeatured: true, deletedAt: null, showInFooter: false },
    select: { id: true, featuredDisplayOrder: true },
  });

  for (const service of featuredServices) {
    await prisma.service.update({
      where: { id: service.id },
      data: {
        showInFooter: true,
        footerDisplayOrder: service.featuredDisplayOrder,
      },
    });
  }

  const regions = await prisma.region.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, displayOrder: true },
  });

  for (const region of regions) {
    await prisma.region.update({
      where: { id: region.id },
      data: {
        showInFooter: true,
        footerDisplayOrder: region.displayOrder,
      },
    });
  }

  const [serviceCount, regionCount] = await Promise.all([
    prisma.service.count({ where: { showInFooter: true, deletedAt: null } }),
    prisma.region.count({ where: { showInFooter: true, deletedAt: null } }),
  ]);

  console.log(
    `[sync-footer-navigation] Enabled footer links for ${serviceCount} services and ${regionCount} regions.`,
  );
}

main()
  .catch((error) => {
    console.error("[sync-footer-navigation] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
