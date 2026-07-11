"use server";

import { revalidatePath } from "next/cache";

import { normalizeLocalizedContent } from "@/features/cms/lib/normalize-content-input";
import { upsertLegalPageSeo } from "@/features/cms/lib/upsert-seo";
import { isCanonicalLegalPageSlug, legalPagePath } from "@/features/legal-pages/lib/constants";
import {
  createLegalPageSchema,
  legalPageIdSchema,
  toggleLegalPageActiveSchema,
  toggleLegalPagePublishSchema,
  updateLegalPageSchema,
} from "@/lib/validations/admin-legal-page";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { upsertAutoRedirects } from "@/features/redirects/lib/upsert-auto-redirect";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminLegalPageRepository } from "@/server/repositories/admin-legal-page-repository";
import { requireSuperAdmin } from "@/server/permissions/guards";

const ADMIN_PATH = "/admin/legal-pages";

function revalidateLegalPagePaths(slug?: string) {
  revalidatePath(ADMIN_PATH);
  revalidatePath("/sitemap.xml");
  revalidatePath("/", "layout");
  if (slug) {
    revalidatePath(legalPagePath(slug));
  }
}

function legalPageSnapshot(page: {
  id: string;
  slug: string;
  titleEn: string;
  isPublished: boolean;
  isActive: boolean;
}) {
  return {
    id: page.id,
    slug: page.slug,
    titleEn: page.titleEn,
    isPublished: page.isPublished,
    isActive: page.isActive,
  };
}

export async function createLegalPageAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireSuperAdmin();
  const parsed = parseInput(createLegalPageSchema, input);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const existing = await adminLegalPageRepository.findBySlug(data.slug);
  if (existing) {
    return errorResult("A legal page with this slug already exists");
  }

  const content = normalizeLocalizedContent(data);
  const page = await prisma.legalPage.create({
    data: {
      slug: data.slug,
      titleEn: content.titleEn,
      titleUr: content.titleUr,
      excerptEn: content.excerptEn,
      excerptUr: content.excerptUr,
      contentEn: content.contentEn,
      contentUr: content.contentUr,
      isPublished: data.isPublished,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
      publishedAt: data.isPublished ? new Date() : null,
    },
    select: { id: true, slug: true, titleEn: true, isPublished: true, isActive: true },
  });

  await upsertLegalPageSeo(page.id, page.slug, data.seo);

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "legal_page",
    entityId: page.id,
    before: null,
    after: legalPageSnapshot(page),
  });

  revalidateLegalPagePaths(page.slug);
  return successResult({ id: page.id });
}

export async function updateLegalPageAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireSuperAdmin();
  const parsed = parseInput(updateLegalPageSchema, input);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const existing = await adminLegalPageRepository.findById(data.id);
  if (!existing) {
    return errorResult("Legal page not found");
  }

  const nextSlug = data.slug ?? existing.slug;
  if (nextSlug !== existing.slug && isCanonicalLegalPageSlug(existing.slug)) {
    return errorResult("Canonical legal page URLs cannot be changed");
  }

  if (nextSlug !== existing.slug) {
    const slugTaken = await adminLegalPageRepository.findBySlug(nextSlug);
    if (slugTaken && slugTaken.id !== existing.id) {
      return errorResult("A legal page with this slug already exists");
    }
  }

  const content = normalizeLocalizedContent(data);
  const publishedAt =
    data.isPublished && !existing.isPublished
      ? new Date()
      : data.isPublished
        ? existing.publishedAt
        : null;

  const page = await prisma.legalPage.update({
    where: { id: data.id },
    data: {
      slug: nextSlug,
      titleEn: content.titleEn,
      titleUr: content.titleUr,
      excerptEn: content.excerptEn,
      excerptUr: content.excerptUr,
      contentEn: content.contentEn,
      contentUr: content.contentUr,
      isPublished: data.isPublished,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
      publishedAt,
    },
    select: { id: true, slug: true, titleEn: true, isPublished: true, isActive: true },
  });

  await upsertLegalPageSeo(page.id, page.slug, data.seo);

  if (page.slug !== existing.slug) {
    await upsertAutoRedirects({
      kind: "legal",
      oldSlug: existing.slug,
      newSlug: page.slug,
      actorId: user.id,
    });
  }

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "legal_page",
    entityId: page.id,
    before: legalPageSnapshot(existing),
    after: legalPageSnapshot(page),
  });

  revalidateLegalPagePaths(existing.slug);
  if (page.slug !== existing.slug) {
    revalidateLegalPagePaths(page.slug);
  }

  return successResult({ id: page.id });
}

export async function toggleLegalPagePublishAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireSuperAdmin();
  const parsed = parseInput(toggleLegalPagePublishSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminLegalPageRepository.findById(parsed.data.id);
  if (!existing) {
    return errorResult("Legal page not found");
  }

  const page = await prisma.legalPage.update({
    where: { id: parsed.data.id },
    data: {
      isPublished: parsed.data.isPublished,
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
    select: { id: true, slug: true, titleEn: true, isPublished: true, isActive: true },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "legal_page",
    entityId: page.id,
    before: legalPageSnapshot(existing),
    after: legalPageSnapshot(page),
  });

  revalidateLegalPagePaths(page.slug);
  return successResult({ id: page.id });
}

export async function toggleLegalPageActiveAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireSuperAdmin();
  const parsed = parseInput(toggleLegalPageActiveSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminLegalPageRepository.findById(parsed.data.id);
  if (!existing) {
    return errorResult("Legal page not found");
  }

  const page = await prisma.legalPage.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
    select: { id: true, slug: true, titleEn: true, isPublished: true, isActive: true },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "legal_page",
    entityId: page.id,
    before: legalPageSnapshot(existing),
    after: legalPageSnapshot(page),
  });

  revalidateLegalPagePaths(page.slug);
  return successResult({ id: page.id });
}

export async function deleteLegalPageAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireSuperAdmin();
  const parsed = parseInput(legalPageIdSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminLegalPageRepository.findById(parsed.data.id);
  if (!existing) {
    return errorResult("Legal page not found");
  }

  if (isCanonicalLegalPageSlug(existing.slug)) {
    return errorResult("Canonical legal pages cannot be deleted. Unpublish or deactivate instead.");
  }

  await prisma.legalPage.delete({
    where: { id: parsed.data.id },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "legal_page",
    entityId: existing.id,
    before: legalPageSnapshot(existing),
    after: null,
  });

  revalidateLegalPagePaths(existing.slug);
  return successResult({ id: existing.id });
}
