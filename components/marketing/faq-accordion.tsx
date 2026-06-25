import { FaqCollapsibleList } from "@/components/marketing/faq-collapsible-item";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
  title?: string;
  emptyMessage?: string;
  defaultOpenFirst?: boolean;
  limit?: number;
};

export function FaqAccordion({
  items,
  title,
  emptyMessage,
  defaultOpenFirst = true,
  limit,
}: FaqAccordionProps) {
  const visibleItems = limit ? items.slice(0, limit) : items;

  if (visibleItems.length === 0) {
    if (!emptyMessage) {
      return null;
    }

    return (
      <section className="space-y-4">
        {title ? (
        <h2 className="text-bidi-auto text-2xl font-bold leading-relaxed tracking-normal">
          {title}
        </h2>
      ) : null}
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {title ? (
        <h2 className="text-bidi-auto text-2xl font-bold leading-relaxed tracking-normal">
          {title}
        </h2>
      ) : null}
      <FaqCollapsibleList
        items={visibleItems}
        defaultOpenFirst={defaultOpenFirst}
      />
    </section>
  );
}
