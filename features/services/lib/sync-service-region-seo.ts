import "server-only";

import { LEGACY_SERVICE_SLUGS_TO_DEACTIVATE } from "@/config/legacy-url-redirects";
import {
  buildDefaultServiceRegionSeo,
  buildServiceRegionPageKey,
} from "@/features/services/lib/service-region-pages";
import { prisma } from "@/server/db/client";

export async function syncServiceRegionSeoForService(
  serviceId: string,
): Promise<void> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      shortDescriptionEn: true,
      isActive: true,
      serviceRegions: {
        where: { isActive: true, region: { isActive: true, deletedAt: null } },
        orderBy: { displayOrder: "asc" },
        select: {
          region: {
            select: {
              slug: true,
              nameEn: true,
            },
          },
        },
      },
    },
  });

  if (!service || !service.isActive) {
    await prisma.seoMeta.deleteMany({
      where: {
        pageKey: { startsWith: `service:${service?.slug ?? ""}:` },
      },
    });
    return;
  }

  const activePageKeys = new Set<string>();

  for (const assignment of service.serviceRegions) {
    const region = assignment.region;
    if (!region) continue;

    const pageKey = buildServiceRegionPageKey(service.slug, region.slug);
    activePageKeys.add(pageKey);

    const defaults = buildDefaultServiceRegionSeo({
      serviceName: service.nameEn,
      serviceShortDescription: service.shortDescriptionEn,
      regionName: region.nameEn,
    });

    await prisma.seoMeta.upsert({
      where: { pageKey },
      update: {
        metaTitleEn: defaults.metaTitleEn,
        metaDescriptionEn: defaults.metaDescriptionEn,
        h1En: defaults.h1En,
      },
      create: {
        pageKey,
        ...defaults,
      },
    });
  }

  const existingSubPages = await prisma.seoMeta.findMany({
    where: {
      pageKey: { startsWith: `service:${service.slug}:` },
    },
    select: { pageKey: true },
  });

  const stalePageKeys = existingSubPages
    .map((row) => row.pageKey)
    .filter((pageKey) => !activePageKeys.has(pageKey));

  if (stalePageKeys.length > 0) {
    await prisma.seoMeta.deleteMany({
      where: { pageKey: { in: stalePageKeys } },
    });
  }
}

export async function cleanupLegacyServiceSeo(): Promise<void> {
  for (const slug of LEGACY_SERVICE_SLUGS_TO_DEACTIVATE) {
    await prisma.seoMeta.deleteMany({
      where: { pageKey: `service:${slug}` },
    });
  }

  const inactiveServices = await prisma.service.findMany({
    where: { isActive: false },
    select: { id: true, slug: true },
  });

  for (const service of inactiveServices) {
    await prisma.seoMeta.deleteMany({
      where: {
        OR: [{ serviceId: service.id }, { pageKey: `service:${service.slug}` }],
      },
    });
  }
}

export async function syncAllActiveServiceRegionSeo(): Promise<void> {
  const services = await prisma.service.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true },
  });

  for (const service of services) {
    await syncServiceRegionSeoForService(service.id);
  }
}
