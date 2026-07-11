"use server";

import { revalidatePath } from "next/cache";

import {
  createCitySchema,
  deleteCitySchema,
  reorderCitiesSchema,
  toggleCitySchema,
  updateCitySchema,
} from "@/lib/validations/admin-city";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { upsertAutoRedirects } from "@/features/redirects/lib/upsert-auto-redirect";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { requirePermission } from "@/server/permissions/guards";
import { toPrismaNullableJson } from "@/lib/utils/prisma-json";
import { adminCityRepository } from "@/server/repositories/admin-city-repository";

function revalidateCityPaths(regionSlug: string, citySlug?: string) {
  revalidatePath("/admin/regions");
  revalidatePath("/admin/cities");
  revalidatePath("/regions");
  revalidatePath(`/regions/${regionSlug}`);
  if (citySlug) {
    revalidatePath(`/regions/${regionSlug}/${citySlug}`);
  }
}

function normalizeSeoInput(
  seo: NonNullable<Awaited<ReturnType<typeof createCitySchema.parse>>["seo"]>,
) {
  return {
    metaTitleEn: seo.metaTitleEn || null,
    metaTitleUr: seo.metaTitleUr || null,
    metaDescriptionEn: seo.metaDescriptionEn || null,
    metaDescriptionUr: seo.metaDescriptionUr || null,
    h1En: seo.h1En || null,
    h1Ur: seo.h1Ur || null,
    canonicalUrl: seo.canonicalUrl || null,
    ogTitleEn: seo.ogTitleEn || null,
    ogTitleUr: seo.ogTitleUr || null,
    ogDescriptionEn: seo.ogDescriptionEn || null,
    ogDescriptionUr: seo.ogDescriptionUr || null,
    ogImage: seo.ogImage || null,
    twitterCard: seo.twitterCard ?? "summary_large_image",
    robotsIndex: seo.robotsIndex,
    robotsFollow: seo.robotsFollow,
    faqSchemaJson: toPrismaNullableJson(seo.faqSchemaJson),
    breadcrumbJson: toPrismaNullableJson(seo.breadcrumbJson),
  };
}

async function upsertCitySeo(
  cityId: string,
  regionSlug: string,
  citySlug: string,
  seo: ReturnType<typeof normalizeSeoInput>,
) {
  await prisma.seoMeta.upsert({
    where: { cityId },
    update: seo,
    create: {
      pageKey: `city:${regionSlug}:${citySlug}`,
      cityId,
      ...seo,
    },
  });
}

export async function createCityAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(createCitySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const region = await prisma.region.findFirst({
    where: { id: data.regionId, deletedAt: null },
    select: { id: true, slug: true },
  });

  if (!region) {
    return errorResult("Region not found");
  }

  const existing = await prisma.city.findFirst({
    where: { regionId: data.regionId, slug: data.slug, deletedAt: null },
    select: { id: true },
  });

  if (existing) {
    return errorResult("City slug already exists in this region", {
      slug: ["Slug already exists"],
    });
  }

  const city = await prisma.city.create({
    data: {
      regionId: data.regionId,
      slug: data.slug,
      nameEn: data.nameEn,
      nameUr: data.nameUr,
      descriptionEn: data.descriptionEn,
      descriptionUr: data.descriptionUr,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
    },
  });

  if (data.seo) {
    await upsertCitySeo(
      city.id,
      region.slug,
      city.slug,
      normalizeSeoInput(data.seo),
    );
  } else {
    await prisma.seoMeta.create({
      data: {
        pageKey: `city:${region.slug}:${city.slug}`,
        cityId: city.id,
        metaTitleEn: `${city.nameEn} Excise Services | PakExcise.com`,
        metaTitleUr: `${city.nameUr} ایکسائز خدمات | PakExcise.com`,
        metaDescriptionEn: city.descriptionEn,
        metaDescriptionUr: city.descriptionUr,
        h1En: city.nameEn,
        h1Ur: city.nameUr,
      },
    });
  }

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "city",
    entityId: city.id,
    after: { slug: city.slug, regionId: city.regionId },
  });

  revalidateCityPaths(region.slug, city.slug);
  return successResult({ id: city.id });
}

export async function updateCityAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(updateCitySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminCityRepository.findById(data.id);

  if (!existing) {
    return errorResult("City not found");
  }

  const city = await prisma.city.update({
    where: { id: data.id },
    data: {
      slug: data.slug,
      nameEn: data.nameEn,
      nameUr: data.nameUr,
      descriptionEn: data.descriptionEn,
      descriptionUr: data.descriptionUr,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
    },
    include: {
      region: { select: { slug: true } },
    },
  });

  if (data.seo) {
    await upsertCitySeo(
      city.id,
      city.region.slug,
      city.slug,
      normalizeSeoInput(data.seo),
    );
  }

  if (existing.slug !== city.slug) {
    await upsertAutoRedirects({
      kind: "city",
      regionSlug: city.region.slug,
      oldSlug: existing.slug,
      newSlug: city.slug,
      actorId: user.id,
    });
  }

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "city",
    entityId: city.id,
    after: { slug: city.slug },
  });

  revalidateCityPaths(city.region.slug, city.slug);
  return successResult({ id: city.id });
}

export async function toggleCityAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(toggleCitySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const city = await prisma.city.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
    include: { region: { select: { slug: true } } },
  });

  revalidateCityPaths(city.region.slug, city.slug);
  return successResult({ id: city.id });
}

export async function deleteCityAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(deleteCitySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminCityRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("City not found");
  }

  await prisma.city.update({
    where: { id: parsed.data.id },
    data: { isActive: false, deletedAt: new Date() },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "city",
    entityId: parsed.data.id,
  });

  revalidateCityPaths(existing.region.slug, existing.slug);
  return successResult({ id: parsed.data.id });
}

export async function reorderCitiesAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  await requirePermission("region:manage");
  const parsed = parseInput(reorderCitiesSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const region = await prisma.region.findUnique({
    where: { id: parsed.data.regionId },
    select: { slug: true },
  });

  await Promise.all(
    parsed.data.orderedIds.map((id, index) =>
      prisma.city.update({
        where: { id },
        data: { displayOrder: index },
      }),
    ),
  );

  if (region) {
    revalidateCityPaths(region.slug);
  }

  return successResult({ ok: true });
}
