import { FaqAccordion } from "@/components/marketing/faq-accordion";

type BlogFaqSectionProps = {
  items: Array<{ question: string; answer: string }>;
  title: string;
};

export function BlogFaqSection({ items, title }: BlogFaqSectionProps) {
  if (items.length === 0) {
    return null;
  }

  const accordionItems = items.map((item, index) => ({
    id: `blog-faq-${index + 1}`,
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
      <FaqAccordion items={accordionItems} title={title} />
    </section>
  );
}
