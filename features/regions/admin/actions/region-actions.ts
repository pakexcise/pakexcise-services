"use server";

import { revalidatePath } from "next/cache";

import {
  createRegionSchema,
  deleteRegionSchema,
  reorderRegionsSchema,
  toggleRegionSchema,
  updateRegionSchema,
} from "@/lib/validations/admin-region";
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
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";

const ADMIN_REGIONS_PATH = "/admin/regions";

function revalidateRegionPaths(slug?: string) {
  revalidatePath(ADMIN_REGIONS_PATH);
  revalidatePath("/regions");
  if (slug) {
    revalidatePath(`/regions/${slug}`);
  }
}

function normalizeSeoInput(
  seo: NonNullable<
    Awaited<ReturnType<typeof createRegionSchema.parse>>["seo"]
  >,
) {
  return {
    metaTitleEn: seo.metaTitleEn || null,
    metaDescriptionEn: seo.metaDescriptionEn || null,
    h1En: seo.h1En || null,
    canonicalUrl: seo.canonicalUrl || null,
    ogTitleEn: seo.ogTitleEn || null,
    ogDescriptionEn: seo.ogDescriptionEn || null,
    ogImage: seo.ogImage || null,
    twitterCard: seo.twitterCard ?? "summary_large_image",
    robotsIndex: seo.robotsIndex,
    robotsFollow: seo.robotsFollow,
    faqSchemaJson: toPrismaNullableJson(seo.faqSchemaJson),
    breadcrumbJson: toPrismaNullableJson(seo.breadcrumbJson),
  };
}

async function upsertRegionSeo(
  regionId: string,
  slug: string,
  seo: ReturnType<typeof normalizeSeoInput>,
) {
  await prisma.seoMeta.upsert({
    where: { regionId },
    update: seo,
    create: {
      pageKey: `region:${slug}`,
      regionId,
      ...seo,
    },
  });
}

export async function createRegionAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(createRegionSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminRegionRepository.findBySlug(data.slug);

  if (existing) {
    return errorResult("Slug is already in use", { slug: ["Slug already exists"] });
  }

  const region = await prisma.region.create({
    data: {
      slug: data.slug,
      nameEn: data.nameEn,
      descriptionEn: data.descriptionEn,
      isActive: data.isActive,
      showInFooter: data.showInFooter,
      footerDisplayOrder: data.footerDisplayOrder,
      displayOrder: data.displayOrder,
    },
  });

  if (data.seo) {
    await upsertRegionSeo(region.id, region.slug, normalizeSeoInput(data.seo));
  } else {
    await prisma.seoMeta.create({
      data: {
        pageKey: `region:${region.slug}`,
        regionId: region.id,
        metaTitleEn: `${region.nameEn} Services | PakExcise.com`,
        metaDescriptionEn: region.descriptionEn,
        h1En: region.nameEn,
      },
    });
  }

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "region",
    entityId: region.id,
    after: { slug: region.slug, nameEn: region.nameEn },
  });

  revalidateRegionPaths(region.slug);
  return successResult({ id: region.id });
}

export async function updateRegionAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(updateRegionSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminRegionRepository.findById(data.id);

  if (!existing) {
    return errorResult("Region not found");
  }

  if (data.slug !== existing.slug) {
    const slugTaken = await adminRegionRepository.findBySlug(data.slug);

    if (slugTaken && slugTaken.id !== data.id) {
      return errorResult("Slug is already in use", {
        slug: ["Slug already exists"],
      });
    }
  }

  const region = await prisma.region.update({
    where: { id: data.id },
    data: {
      slug: data.slug,
      nameEn: data.nameEn,
      descriptionEn: data.descriptionEn,
      isActive: data.isActive,
      showInFooter: data.showInFooter,
      footerDisplayOrder: data.footerDisplayOrder,
      displayOrder: data.displayOrder,
    },
  });

  if (data.seo) {
    await upsertRegionSeo(region.id, region.slug, normalizeSeoInput(data.seo));
  }

  if (existing.slug !== region.slug) {
    await upsertAutoRedirects({
      kind: "region",
      oldSlug: existing.slug,
      newSlug: region.slug,
      actorId: user.id,
    });
    await prisma.seoMeta.updateMany({
      where: { regionId: region.id },
      data: { pageKey: `region:${region.slug}` },
    });
  }

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "region",
    entityId: region.id,
    before: { slug: existing.slug, nameEn: existing.nameEn },
    after: { slug: region.slug, nameEn: region.nameEn },
  });

  revalidateRegionPaths(region.slug);
  return successResult({ id: region.id });
}

export async function toggleRegionAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(toggleRegionSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const region = await prisma.region.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
    select: { id: true, slug: true },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "region",
    entityId: region.id,
    after: { isActive: parsed.data.isActive },
  });

  revalidateRegionPaths(region.slug);
  return successResult({ id: region.id });
}

export async function deleteRegionAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(deleteRegionSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminRegionRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Region not found");
  }

  await prisma.region.update({
    where: { id: parsed.data.id },
    data: { isActive: false, deletedAt: new Date() },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "region",
    entityId: parsed.data.id,
    before: { slug: existing.slug, nameEn: existing.nameEn },
  });

  revalidateRegionPaths(existing.slug);
  return successResult({ id: parsed.data.id });
}

export async function reorderRegionsAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(reorderRegionsSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  await Promise.all(
    parsed.data.orderedIds.map((id, index) =>
      prisma.region.update({
        where: { id },
        data: { displayOrder: index },
      }),
    ),
  );

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "region",
    entityId: "reorder",
    after: { orderedIds: parsed.data.orderedIds },
  });

  revalidateRegionPaths();
  return successResult({ ok: true });
}
