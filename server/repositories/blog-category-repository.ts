import "server-only";

import { Repository } from "@/server/repositories/base/repository";

export type BlogCategoryOption = {
  id: string;
  slug: string;
  nameEn: string;
  parentId: string | null;
};

export class BlogCategoryRepository extends Repository {
  async listActive(): Promise<BlogCategoryOption[]> {
    return this.db.blogCategory.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
      select: {
        id: true,
        slug: true,
        nameEn: true,
        parentId: true,
      },
    });
  }

  async findById(id: string) {
    return this.db.blogCategory.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        parentId: true,
      },
    });
  }

  async validateAssignment(categoryId: string | null, subCategoryId: string | null) {
    if (!categoryId && !subCategoryId) {
      return { ok: true as const };
    }

    if (subCategoryId && !categoryId) {
      return { ok: false as const, error: "Select a category before sub-category" };
    }

    const [category, subCategory] = await Promise.all([
      categoryId ? this.findById(categoryId) : Promise.resolve(null),
      subCategoryId ? this.findById(subCategoryId) : Promise.resolve(null),
    ]);

    if (categoryId && !category) {
      return { ok: false as const, error: "Selected category is invalid" };
    }

    if (subCategoryId && !subCategory) {
      return { ok: false as const, error: "Selected sub-category is invalid" };
    }

    if (category && category.parentId) {
      return { ok: false as const, error: "Selected category must be a top-level category" };
    }

    if (subCategory && subCategory.parentId !== categoryId) {
      return { ok: false as const, error: "Sub-category does not belong to the selected category" };
    }

    return { ok: true as const, category, subCategory };
  }
}

export const blogCategoryRepository = new BlogCategoryRepository();
