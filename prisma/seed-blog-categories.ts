import type { PrismaClient } from "@prisma/client";

import { BLOG_CATEGORY_SEED } from "@/prisma/blog-category-seed";

export async function seedBlogCategories(prisma: PrismaClient) {
  const slugToId = new Map<string, string>();

  for (const parent of BLOG_CATEGORY_SEED) {
    const createdParent = await prisma.blogCategory.upsert({
      where: { slug: parent.slug },
      update: {
        nameEn: parent.nameEn,
        nameUr: parent.nameUr,
        displayOrder: parent.displayOrder,
        isActive: true,
        parentId: null,
      },
      create: {
        slug: parent.slug,
        nameEn: parent.nameEn,
        nameUr: parent.nameUr,
        displayOrder: parent.displayOrder,
        isActive: true,
      },
    });

    slugToId.set(parent.slug, createdParent.id);

    for (const child of parent.children) {
      const createdChild = await prisma.blogCategory.upsert({
        where: { slug: child.slug },
        update: {
          nameEn: child.nameEn,
          nameUr: child.nameUr,
          displayOrder: child.displayOrder,
          isActive: true,
          parentId: createdParent.id,
        },
        create: {
          slug: child.slug,
          nameEn: child.nameEn,
          nameUr: child.nameUr,
          displayOrder: child.displayOrder,
          isActive: true,
          parentId: createdParent.id,
        },
      });

      slugToId.set(child.slug, createdChild.id);
    }
  }

  return slugToId;
}
