"use server";

import { revalidatePath } from "next/cache";

import { handleContentSlugRedirect } from "@/features/cms/lib/handle-content-redirect";
import { normalizeLocalizedContent } from "@/features/cms/lib/normalize-content-input";
import { upsertBlogSeo } from "@/features/cms/lib/upsert-seo";
import { normalizeBlogPostInput } from "@/features/blog/lib/normalize-blog-input";
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

async function validateRelations(serviceIds: string[], faqIds: string[]) {
  if (serviceIds.length > 0) {
    const count = await prisma.service.count({
      where: { id: { in: serviceIds }, deletedAt: null },
    });
    if (count !== serviceIds.length) {
      return errorResult("One or more related services are invalid");
    }
  }

  if (faqIds.length > 0) {
    const count = await prisma.fAQ.count({
      where: { id: { in: faqIds }, isActive: true },
    });
    if (count !== faqIds.length) {
      return errorResult("One or more attached FAQs are invalid");
    }
  }

  return null;
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

  const relationError = await validateRelations(
    data.relatedServiceIds,
    data.attachedFaqIds,
  );
  if (relationError) return relationError;

  const content = normalizeLocalizedContent(data);
  const blogFields = normalizeBlogPostInput(data);
  const publishedAt = data.isPublished ? new Date() : null;

  const post = await prisma.blogPost.create({
    data: {
      slug: data.slug,
      ...content,
      ...blogFields,
      contentFaqs: blogFields.contentFaqs,
      relatedServiceIds: data.relatedServiceIds,
      attachedFaqIds: data.attachedFaqIds,
      isPublished: data.isPublished,
      publishedAt,
    },
  });

  await upsertBlogSeo(post.id, post.slug, data.seo);

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

  const relationError = await validateRelations(
    data.relatedServiceIds,
    data.attachedFaqIds,
  );
  if (relationError) return relationError;

  const content = normalizeLocalizedContent(data);
  const blogFields = normalizeBlogPostInput(data);
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
      contentFaqs: blogFields.contentFaqs,
      relatedServiceIds: data.relatedServiceIds,
      attachedFaqIds: data.attachedFaqIds,
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

  await upsertBlogSeo(post.id, post.slug, data.seo);

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
