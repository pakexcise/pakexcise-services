import type { FaqItem } from "@/components/marketing/faq-accordion";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";

export type PublicFaqRecord = {
  id: string;
  questionEn: string;
  answerEn: string;
  displayOrder: number;
  categoryId: string;
  faqCategory: {
    id: string;
    slug: string;
    nameEn: string;
    displayOrder: number;
  } | null;
};

export type FaqCategoryGroup = {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  displayOrder: number;
  items: FaqItem[];
};

export function groupFaqsByCategory(
  faqs: PublicFaqRecord[],
  locale: string,
): FaqCategoryGroup[] {
  const grouped = new Map<string, FaqCategoryGroup>();

  for (const faq of faqs) {
    const category = faq.faqCategory;
    const categoryId = category?.id ?? faq.categoryId;
    const categorySlug = category?.slug ?? "general";
    const categoryName = category
      ? category.nameEn ?? ""
      : categorySlug;
    const displayOrder = category?.displayOrder ?? 999;

    const existing = grouped.get(categoryId);

    if (existing) {
      existing.items.push(...mapFaqsForLocale([faq], locale));
      continue;
    }

    grouped.set(categoryId, {
      categoryId,
      categorySlug,
      categoryName,
      displayOrder,
      items: mapFaqsForLocale([faq], locale)});
  }

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      items: group.items.sort((a, b) => {
        const faqA = faqs.find((item) => item.id === a.id);
        const faqB = faqs.find((item) => item.id === b.id);
        return (faqA?.displayOrder ?? 0) - (faqB?.displayOrder ?? 0);
      })}))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
