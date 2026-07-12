import "server-only";

import { blogCategoryRepository } from "@/server/repositories/blog-category-repository";

export async function loadBlogCategoryOptions(locale = "en") {
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

  const labelFor = (category: (typeof categories)[number]) =>
    category.nameEn;

  return {
    parents: parents.map((category) => ({
      id: category.id,
      label: labelFor(category),
    })),
    childrenByParent: Object.fromEntries(
      [...childrenByParent.entries()].map(([parentId, items]) => [
        parentId,
        items.map((item) => ({ id: item.id, label: labelFor(item) })),
      ]),
    ),
    all: categories,
  };
}
