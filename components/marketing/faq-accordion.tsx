import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
  title?: string;
  emptyMessage?: string;
};

export function FaqAccordion({ items, title, emptyMessage }: FaqAccordionProps) {
  if (items.length === 0) {
    if (!emptyMessage) {
      return null;
    }

    return (
      <section className="space-y-4">
        {title ? <h2 className="text-2xl font-bold">{title}</h2> : null}
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {title ? <h2 className="text-2xl font-bold">{title}</h2> : null}
      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {item.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {item.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
