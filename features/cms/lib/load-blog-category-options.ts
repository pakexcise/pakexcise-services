import "server-only";

import { blogCategoryRepository } from "@/server/repositories/blog-category-repository";

export async function loadBlogCategoryOptions() {
  const categories = await blogCategoryRepository.listActive();
  const parents = categories.filter((category) => !category.parentId);
  const childrenByParent = new Map<string, typeof categories>();

  for (const category of categories) {
    if (!category.parentId) {
      continue;
    }

    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parentId, siblings);
  }

  return {
    parents: parents.map((category) => ({
      id: category.id,
      label: category.nameEn,
    })),
    childrenByParent: Object.fromEntries(
      [...childrenByParent.entries()].map(([parentId, items]) => [
        parentId,
        items.map((item) => ({ id: item.id, label: item.nameEn })),
      ]),
    ),
    all: categories,
  };
}
