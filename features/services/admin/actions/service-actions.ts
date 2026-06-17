"use server";

import { revalidatePath } from "next/cache";

import {
  createServiceSchema,
  deleteDocumentRequirementSchema,
  deleteServiceFormFieldSchema,
  documentRequirementSchema,
  reorderServicesSchema,
  serviceFormFieldSchema,
  serviceIdSchema,
  toggleServiceSchema,
  updateServiceSchema,
} from "@/lib/validations/admin-service";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import {
  documentAuditSnapshot,
  formFieldAuditSnapshot,
  serviceAuditSnapshot,
} from "@/features/services/admin/lib/service-snapshots";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { requirePermission } from "@/server/permissions/guards";
import { toPrismaNullableJson } from "@/lib/utils/prisma-json";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { serviceRegionRepository } from "@/server/repositories/service-region-repository";

const ADMIN_SERVICES_PATH = "/admin/services";

function revalidateServicePaths(slug?: string) {
  revalidatePath(ADMIN_SERVICES_PATH);
  revalidatePath("/services");
  if (slug) {
    revalidatePath(`/services/${slug}`);
  }
}

function normalizeSeoInput(
  seo: NonNullable<
    Awaited<ReturnType<typeof createServiceSchema.parse>>["seo"]
  >,
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

async function upsertServiceSeo(
  serviceId: string,
  slug: string,
  seo: ReturnType<typeof normalizeSeoInput>,
) {
  await prisma.seoMeta.upsert({
    where: { serviceId },
    update: seo,
    create: {
      pageKey: `service:${slug}`,
      serviceId,
      ...seo,
    },
  });
}

async function handleSlugRedirect(
  oldSlug: string,
  newSlug: string,
  actorId: string,
) {
  if (oldSlug === newSlug) {
    return;
  }

  await prisma.redirect.upsert({
    where: { oldSlug },
    update: {
      newSlug,
      statusCode: 301,
      isActive: true,
    },
    create: {
      oldSlug,
      newSlug,
      statusCode: 301,
      isActive: true,
    },
  });

  await auditAdminAction({
    actorId,
    action: "CREATE",
    entityType: "redirect",
    entityId: oldSlug,
    before: { oldSlug },
    after: { oldSlug, newSlug, statusCode: 301 },
  });
}

export async function createServiceAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(createServiceSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existingSlug = await adminServiceRepository.findBySlug(data.slug);

  if (existingSlug) {
    return errorResult("Slug is already in use", { slug: ["Slug already exists"] });
  }

  const displayOrder =
    data.displayOrder || (await adminServiceRepository.getNextDisplayOrder());

  const service = await prisma.service.create({
    data: {
      slug: data.slug,
      categoryId: data.categoryId,
      parentServiceId: data.parentServiceId,
      regionId: data.regionIds[0],
      nameEn: data.nameEn,
      nameUr: data.nameUr,
      shortDescriptionEn: data.shortDescriptionEn,
      shortDescriptionUr: data.shortDescriptionUr,
      contentEn: data.contentEn,
      contentUr: data.contentUr,
      ctaTextEn: data.ctaTextEn,
      ctaTextUr: data.ctaTextUr,
      processingNotesEn: data.processingNotesEn,
      processingNotesUr: data.processingNotesUr,
      internalNotes: data.internalNotes,
      referenceLinksJson: toPrismaNullableJson(data.referenceLinksJson),
      requiresProof: data.requiresProof,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      featuredDisplayOrder: data.featuredDisplayOrder,
      displayOrder,
    },
  });

  await serviceRegionRepository.syncForService(service.id, data.regionIds);

  if (data.seo) {
    await upsertServiceSeo(service.id, service.slug, normalizeSeoInput(data.seo));
  } else {
    await prisma.seoMeta.create({
      data: {
        pageKey: `service:${service.slug}`,
        serviceId: service.id,
        metaTitleEn: `${service.nameEn} | PakExcise.com`,
        metaTitleUr: `${service.nameUr} | PakExcise.com`,
        metaDescriptionEn: service.shortDescriptionEn,
        metaDescriptionUr: service.shortDescriptionUr,
        h1En: service.nameEn,
        h1Ur: service.nameUr,
      },
    });
  }

  const created = await adminServiceRepository.findById(service.id);

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "service",
    entityId: service.id,
    after: serviceAuditSnapshot(created),
  });

  revalidateServicePaths(service.slug);
  return successResult({ id: service.id });
}

export async function updateServiceAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(updateServiceSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminServiceRepository.findById(data.id);

  if (!existing) {
    return errorResult("Service not found");
  }

  if (data.slug !== existing.slug) {
    const slugTaken = await adminServiceRepository.findBySlug(data.slug);

    if (slugTaken && slugTaken.id !== data.id) {
      return errorResult("Slug is already in use", {
        slug: ["Slug already exists"],
      });
    }
  }

  const before = serviceAuditSnapshot(existing);

  const service = await prisma.service.update({
    where: { id: data.id },
    data: {
      slug: data.slug,
      categoryId: data.categoryId,
      parentServiceId: data.parentServiceId,
      regionId: data.regionIds[0],
      nameEn: data.nameEn,
      nameUr: data.nameUr,
      shortDescriptionEn: data.shortDescriptionEn,
      shortDescriptionUr: data.shortDescriptionUr,
      contentEn: data.contentEn,
      contentUr: data.contentUr,
      ctaTextEn: data.ctaTextEn,
      ctaTextUr: data.ctaTextUr,
      processingNotesEn: data.processingNotesEn,
      processingNotesUr: data.processingNotesUr,
      internalNotes: data.internalNotes,
      referenceLinksJson: toPrismaNullableJson(data.referenceLinksJson),
      requiresProof: data.requiresProof,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      featuredDisplayOrder: data.featuredDisplayOrder,
      displayOrder: data.displayOrder,
    },
  });

  await serviceRegionRepository.syncForService(service.id, data.regionIds);

  if (data.seo) {
    await upsertServiceSeo(service.id, service.slug, normalizeSeoInput(data.seo));
  }

  if (existing.slug !== service.slug) {
    await handleSlugRedirect(existing.slug, service.slug, user.id);
    await prisma.seoMeta.updateMany({
      where: { serviceId: service.id },
      data: { pageKey: `service:${service.slug}` },
    });
  }

  const updated = await adminServiceRepository.findById(service.id);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "service",
    entityId: service.id,
    before,
    after: serviceAuditSnapshot(updated),
  });

  revalidateServicePaths(existing.slug);
  revalidateServicePaths(service.slug);
  return successResult({ id: service.id });
}

export async function deleteServiceAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(serviceIdSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminServiceRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Service not found");
  }

  const before = serviceAuditSnapshot(existing);

  await prisma.service.update({
    where: { id: parsed.data.id },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "service",
    entityId: parsed.data.id,
    before,
    after: { deletedAt: new Date().toISOString(), isActive: false },
  });

  revalidateServicePaths(existing.slug);
  return successResult({ id: parsed.data.id });
}

export async function toggleServiceActiveAction(
  input: unknown,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(toggleServiceSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminServiceRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Service not found");
  }

  const service = await prisma.service.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
    select: { id: true, isActive: true, slug: true },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "service",
    entityId: service.id,
    before: { isActive: existing.isActive },
    after: { isActive: service.isActive },
  });

  revalidateServicePaths(service.slug);
  return successResult({ id: service.id, isActive: service.isActive });
}

export async function reorderServicesAction(
  input: unknown,
): Promise<ActionResult<{ updated: number }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(reorderServicesSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.service.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      }),
    ),
  );

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "service",
    entityId: null,
    after: { reordered: parsed.data.items },
  });

  revalidateServicePaths();
  return successResult({ updated: parsed.data.items.length });
}

export async function upsertDocumentRequirementAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(documentRequirementSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const service = await adminServiceRepository.findById(data.serviceId);

  if (!service) {
    return errorResult("Service not found");
  }

  const payload = {
    regionId: data.regionId ?? null,
    checklistItemId: data.checklistItemId ?? null,
    docType: data.docType,
    kind: data.kind,
    labelEn: data.labelEn,
    labelUr: data.labelUr,
    instructionsEn: data.instructionsEn,
    instructionsUr: data.instructionsUr,
    isRequired: data.isRequired,
    maxSizeBytes: data.maxSizeBytes,
    acceptedMimeTypes: data.acceptedMimeTypes,
    displayOrder: data.displayOrder,
    isActive: data.isActive,
  };

  const duplicate = await prisma.documentRequirement.findFirst({
    where: {
      serviceId: data.serviceId,
      docType: data.docType,
      regionId: data.regionId ?? null,
      ...(data.id ? { NOT: { id: data.id } } : {}),
    },
    select: { id: true },
  });

  if (duplicate) {
    return errorResult("A document with this type already exists for this scope", {
      docType: ["Duplicate document type for this region scope"],
    });
  }

  let documentId = data.id;
  let before = null;

  if (data.id) {
    const existing = service.documentReqs.find((item) => item.id === data.id);
    before = documentAuditSnapshot(existing ?? null);

    await prisma.documentRequirement.update({
      where: { id: data.id },
      data: payload,
    });
  } else {
    const created = await prisma.documentRequirement.create({
      data: {
        serviceId: data.serviceId,
        ...payload,
      },
    });
    documentId = created.id;
  }

  const updated = await adminServiceRepository.findById(data.serviceId);
  const afterDoc =
    updated?.documentReqs.find((item) => item.id === documentId) ?? null;

  await auditAdminAction({
    actorId: user.id,
    action: data.id ? "UPDATE" : "CREATE",
    entityType: "document_requirement",
    entityId: documentId,
    before,
    after: documentAuditSnapshot(afterDoc),
  });

  revalidateServicePaths(service.slug);
  revalidatePath(`${ADMIN_SERVICES_PATH}/${service.id}/edit`);
  return successResult({ id: documentId! });
}

export async function deleteDocumentRequirementAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(deleteDocumentRequirementSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const service = await adminServiceRepository.findById(parsed.data.serviceId);

  if (!service) {
    return errorResult("Service not found");
  }

  const existing = service.documentReqs.find(
    (item) => item.id === parsed.data.id,
  );

  if (!existing) {
    return errorResult("Document requirement not found");
  }

  await prisma.documentRequirement.delete({
    where: { id: parsed.data.id },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "document_requirement",
    entityId: parsed.data.id,
    before: documentAuditSnapshot(existing),
  });

  revalidateServicePaths(service.slug);
  revalidatePath(`${ADMIN_SERVICES_PATH}/${service.id}/edit`);
  return successResult({ id: parsed.data.id });
}

export async function upsertServiceFormFieldAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(serviceFormFieldSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const service = await adminServiceRepository.findById(data.serviceId);

  if (!service) {
    return errorResult("Service not found");
  }

  const payload = {
    regionId: data.regionId ?? null,
    fieldKey: data.fieldKey,
    labelEn: data.labelEn,
    labelUr: data.labelUr,
    placeholderEn: data.placeholderEn,
    placeholderUr: data.placeholderUr,
    helpTextEn: data.helpTextEn,
    helpTextUr: data.helpTextUr,
    fieldType: data.fieldType,
    isRequired: data.isRequired,
    isEncrypted: data.isEncrypted,
    optionsJson: toPrismaNullableJson(data.optionsJson),
    validationJson: toPrismaNullableJson(data.validationJson),
    conditionalJson: toPrismaNullableJson(data.conditionalJson),
    displayOrder: data.displayOrder,
    isActive: data.isActive,
  };

  let fieldId = data.id;
  let before = null;

  if (data.id) {
    const existing = service.formFields.find((item) => item.id === data.id);
    before = formFieldAuditSnapshot(existing ?? null);

    await prisma.serviceFormField.update({
      where: { id: data.id },
      data: payload,
    });
  } else {
    const created = await prisma.serviceFormField.create({
      data: {
        serviceId: data.serviceId,
        ...payload,
      },
    });
    fieldId = created.id;
  }

  const updated = await adminServiceRepository.findById(data.serviceId);
  const afterField =
    updated?.formFields.find((item) => item.id === fieldId) ?? null;

  await auditAdminAction({
    actorId: user.id,
    action: data.id ? "UPDATE" : "CREATE",
    entityType: "service_form_field",
    entityId: fieldId,
    before,
    after: formFieldAuditSnapshot(afterField),
  });

  revalidatePath(`${ADMIN_SERVICES_PATH}/${service.id}/edit`);
  return successResult({ id: fieldId! });
}

export async function deleteServiceFormFieldAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(deleteServiceFormFieldSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const service = await adminServiceRepository.findById(parsed.data.serviceId);

  if (!service) {
    return errorResult("Service not found");
  }

  const existing = service.formFields.find(
    (item) => item.id === parsed.data.id,
  );

  if (!existing) {
    return errorResult("Form field not found");
  }

  await prisma.serviceFormField.delete({
    where: { id: parsed.data.id },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "service_form_field",
    entityId: parsed.data.id,
    before: formFieldAuditSnapshot(existing),
  });

  revalidatePath(`${ADMIN_SERVICES_PATH}/${service.id}/edit`);
  return successResult({ id: parsed.data.id });
}
