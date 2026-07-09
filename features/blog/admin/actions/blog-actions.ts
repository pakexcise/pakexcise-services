"use server";

import { revalidatePath } from "next/cache";

import { handleContentSlugRedirect } from "@/features/cms/lib/handle-content-redirect";
import { sanitizeContentRelationIds } from "@/features/cms/lib/sanitize-content-relations";
import { normalizeLocalizedContent } from "@/features/cms/lib/normalize-content-input";
import { upsertBlogSeo } from "@/features/cms/lib/upsert-seo";
import { normalizeBlogPostInput } from "@/features/blog/lib/normalize-blog-input";
import { normalizeUrduBrandText } from "@/features/blog/lib/blog-brand";
import { resolveLogoIconPath } from "@/features/settings/lib/branding-resolvers";
import { getBrandingSettings } from "@/features/settings/lib/public-settings-cache";
import { seoAbsoluteUrl } from "@/lib/seo-url";
import type { SeoMetaInput } from "@/lib/validations/admin-seo";
import {
  blogPostIdSchema,
  createBlogPostSchema,
  toggleBlogPostSchema,
  updateBlogPostSchema,
} from "@/lib/validations/admin-blog";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminBlogRepository } from "@/server/repositories/admin-blog-repository";
import { blogCategoryRepository } from "@/server/repositories/blog-category-repository";
import { requirePermission } from "@/server/permissions/guards";

const ADMIN_PATH = "/admin/blog";

function revalidateBlogPaths(slug?: string) {
  revalidatePath(ADMIN_PATH);
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

function blogSnapshot(post: {
  id: string;
  slug: string;
  titleEn: string;
  isPublished: boolean;
}) {
  return {
    id: post.id,
    slug: post.slug,
    titleEn: post.titleEn,
    isPublished: post.isPublished,
  };
}

async function resolveBlogRelations(serviceIds: string[], faqIds: string[]) {
  return sanitizeContentRelationIds(serviceIds, faqIds);
}

async function resolveBlogCategoryFields(
  categoryId?: string | null,
  subCategoryId?: string | null,
): Promise<
  | {
      ok: true;
      categoryId: string | null;
      subCategoryId: string | null;
      categoryEn: string | null;
      categoryUr: string | null;
    }
  | { ok: false; error: string }
> {
  const validation = await blogCategoryRepository.validateAssignment(
    categoryId?.trim() || null,
    subCategoryId?.trim() || null,
  );

  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  return {
    ok: true,
    categoryId: validation.category?.id ?? null,
    subCategoryId: validation.subCategory?.id ?? null,
    categoryEn: validation.category?.nameEn ?? null,
    categoryUr: validation.category
      ? normalizeUrduBrandText(validation.category.nameUr)
      : null,
  };
}

async function prepareBlogSeoInput(
  slug: string,
  seo: SeoMetaInput | undefined,
  featuredImagePath?: string | null,
): Promise<SeoMetaInput | undefined> {
  if (!seo) {
    return undefined;
  }

  const branding = await getBrandingSettings();
  const canonicalUrl = seo.canonicalUrl?.trim() || seoAbsoluteUrl(`/blog/${slug}`);
  const ogImage = featuredImagePath?.trim() || resolveLogoIconPath(branding);

  return {
    ...seo,
    canonicalUrl,
    ogImage,
  };
}

export async function createBlogPostAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(createBlogPostSchema, input);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const existing = await adminBlogRepository.findBySlug(data.slug);
  if (existing) {
    return errorResult("Slug already exists", { slug: ["Slug is taken"] });
  }

  const relations = await resolveBlogRelations(
    data.relatedServiceIds,
    data.attachedFaqIds,
  );
  const categoryFields = await resolveBlogCategoryFields(
    data.categoryId,
    data.subCategoryId,
  );
  if (!categoryFields.ok) {
    return errorResult(categoryFields.error);
  }

  const content = normalizeLocalizedContent(data);
  const blogFields = normalizeBlogPostInput({
    ...data,
    categoryEn: categoryFields.categoryEn,
    categoryUr: categoryFields.categoryUr,
  });
  const publishedAt = data.isPublished ? new Date() : null;

  const post = await prisma.blogPost.create({
    data: {
      slug: data.slug,
      ...content,
      ...blogFields,
      categoryId: categoryFields.categoryId,
      subCategoryId: categoryFields.subCategoryId,
      contentFaqs: blogFields.contentFaqs,
      relatedServiceIds: relations.relatedServiceIds,
      attachedFaqIds: relations.attachedFaqIds,
      isPublished: data.isPublished,
      publishedAt,
    },
  });

  await upsertBlogSeo(
    post.id,
    post.slug,
    await prepareBlogSeoInput(post.slug, data.seo, blogFields.featuredImagePath),
  );

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "blog_post",
    entityId: post.id,
    after: blogSnapshot(post),
  });

  revalidateBlogPaths(post.slug);
  return successResult({ id: post.id });
}

export async function updateBlogPostAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(updateBlogPostSchema, input);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const existing = await adminBlogRepository.findById(data.id);
  if (!existing) return errorResult("Blog post not found");

  if (data.slug !== existing.slug) {
    const slugTaken = await adminBlogRepository.findBySlug(data.slug);
    if (slugTaken && slugTaken.id !== data.id) {
      return errorResult("Slug already exists", { slug: ["Slug is taken"] });
    }
  }

  const relations = await resolveBlogRelations(
    data.relatedServiceIds,
    data.attachedFaqIds,
  );
  const categoryFields = await resolveBlogCategoryFields(
    data.categoryId,
    data.subCategoryId,
  );
  if (!categoryFields.ok) {
    return errorResult(categoryFields.error);
  }

  const content = normalizeLocalizedContent(data);
  const blogFields = normalizeBlogPostInput({
    ...data,
    categoryEn: categoryFields.categoryEn,
    categoryUr: categoryFields.categoryUr,
  });
  const publishedAt =
    data.isPublished && !existing.publishedAt
      ? new Date()
      : data.isPublished
        ? existing.publishedAt
        : null;

  const post = await prisma.blogPost.update({
    where: { id: data.id },
    data: {
      slug: data.slug,
      ...content,
      ...blogFields,
      categoryId: categoryFields.categoryId,
      subCategoryId: categoryFields.subCategoryId,
      contentFaqs: blogFields.contentFaqs,
      relatedServiceIds: relations.relatedServiceIds,
      attachedFaqIds: relations.attachedFaqIds,
      isPublished: data.isPublished,
      publishedAt,
    },
  });

  if (data.slug !== existing.slug) {
    await handleContentSlugRedirect({
      prefix: "blog",
      oldSlug: existing.slug,
      newSlug: data.slug,
      actorId: user.id,
    });
  }

  await upsertBlogSeo(
    post.id,
    post.slug,
    await prepareBlogSeoInput(post.slug, data.seo, blogFields.featuredImagePath),
  );

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "blog_post",
    entityId: post.id,
    before: blogSnapshot(existing),
    after: blogSnapshot(post),
  });

  revalidateBlogPaths(existing.slug);
  revalidateBlogPaths(post.slug);
  return successResult({ id: post.id });
}

export async function toggleBlogPostAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(toggleBlogPostSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminBlogRepository.findById(parsed.data.id);
  if (!existing) return errorResult("Blog post not found");

  const post = await prisma.blogPost.update({
    where: { id: parsed.data.id },
    data: {
      isPublished: parsed.data.isPublished,
      publishedAt: parsed.data.isPublished
        ? (existing.publishedAt ?? new Date())
        : null,
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "STATUS_CHANGE",
    entityType: "blog_post",
    entityId: post.id,
    before: { isPublished: existing.isPublished },
    after: { isPublished: post.isPublished },
  });

  revalidateBlogPaths(post.slug);
  return successResult({ id: post.id });
}

export async function deleteBlogPostAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(blogPostIdSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminBlogRepository.findById(parsed.data.id);
  if (!existing) return errorResult("Blog post not found");

  await prisma.blogPost.delete({ where: { id: parsed.data.id } });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "blog_post",
    entityId: existing.id,
    before: blogSnapshot(existing),
  });

  revalidateBlogPaths(existing.slug);
  return successResult({ id: existing.id });
}
