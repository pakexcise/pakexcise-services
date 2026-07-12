import type { PrismaClient } from "@prisma/client";

import { seedBlogCategories } from "./seed-blog-categories";
import {
  PRIMARY_BLOG_CATEGORY_SLUG,
  PRIMARY_BLOG_SUBCATEGORY_SLUG,
} from "./blog-category-seed";
import {
  PRIMARY_BLOG_CONTENT_EN,
  PRIMARY_BLOG_CONTENT_FAQS,
  PRIMARY_BLOG_RELATED_SERVICE_SLUGS,
  PRIMARY_BLOG_SEED,
  PRIMARY_BLOG_SLUG,
} from "./primary-blog-seed";

/**
 * Upserts the primary featured blog post and removes other published stubs.
 * Safe to run on production when staging content should be mirrored.
 */
export async function seedPrimaryBlogPost(
  prisma: PrismaClient,
  options: { replaceOtherPosts?: boolean } = {},
) {
  const replaceOtherPosts = options.replaceOtherPosts ?? true;

  const blogCategoryIds = await seedBlogCategories(prisma);
  const primaryBlogCategoryId =
    blogCategoryIds.get(PRIMARY_BLOG_CATEGORY_SLUG) ?? null;
  const primaryBlogSubCategoryId =
    blogCategoryIds.get(PRIMARY_BLOG_SUBCATEGORY_SLUG) ?? null;

  const primaryBlogRelatedServiceIds = (
    await prisma.service.findMany({
      where: {
        slug: { in: [...PRIMARY_BLOG_RELATED_SERVICE_SLUGS] },
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((service) => service.id);

  if (replaceOtherPosts) {
    await prisma.seoMeta.deleteMany({
      where: {
        pageKey: { startsWith: "blog:" },
        NOT: { pageKey: `blog:${PRIMARY_BLOG_SLUG}` },
      },
    });

    await prisma.blogPost.deleteMany({
      where: { slug: { not: PRIMARY_BLOG_SLUG } },
    });
  }

  const data = {
    titleEn: PRIMARY_BLOG_SEED.titleEn,
    excerptEn: PRIMARY_BLOG_SEED.excerptEn,
    contentEn: PRIMARY_BLOG_CONTENT_EN,
    categoryEn: PRIMARY_BLOG_SEED.categoryEn,
    categoryId: primaryBlogCategoryId,
    subCategoryId: primaryBlogSubCategoryId,
    tags: [...PRIMARY_BLOG_SEED.tags],
    authorNameEn: PRIMARY_BLOG_SEED.authorNameEn,
    readingTimeMinutes: 8,
    featuredImagePath: PRIMARY_BLOG_SEED.featuredImagePath,
    featuredImageTitleEn: PRIMARY_BLOG_SEED.featuredImageTitleEn,
    featuredImageAltEn: PRIMARY_BLOG_SEED.featuredImageAltEn,
    focusKeywords: PRIMARY_BLOG_SEED.focusKeywords,
    isFeatured: PRIMARY_BLOG_SEED.isFeatured,
    showTableOfContents: PRIMARY_BLOG_SEED.showTableOfContents,
    contentFaqs: [...PRIMARY_BLOG_CONTENT_FAQS],
    isPublished: true,
    publishedAt: new Date(),
    relatedServiceIds: primaryBlogRelatedServiceIds,
  };

  const primaryBlog = await prisma.blogPost.upsert({
    where: { slug: PRIMARY_BLOG_SLUG },
    update: data,
    create: {
      slug: PRIMARY_BLOG_SLUG,
      ...data,
    },
  });

  await prisma.seoMeta.upsert({
    where: { pageKey: `blog:${PRIMARY_BLOG_SLUG}` },
    update: {
      blogPostId: primaryBlog.id,
      ...PRIMARY_BLOG_SEED.seo,
    },
    create: {
      pageKey: `blog:${PRIMARY_BLOG_SLUG}`,
      blogPostId: primaryBlog.id,
      ...PRIMARY_BLOG_SEED.seo,
    },
  });

  return primaryBlog;
}
