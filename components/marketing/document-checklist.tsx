import { FileText } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type DocumentChecklistItem = {
  id: string;
  label: string;
  instructions: string | null;
  isRequired: boolean;
};

type DocumentChecklistProps = {
  title: string;
  items: DocumentChecklistItem[];
  requiredLabel: string;
  optionalLabel: string;
  emptyMessage: string;
};

export function DocumentChecklist({
  title,
  items,
  requiredLabel,
  optionalLabel,
  emptyMessage,
}: DocumentChecklistProps) {
  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <FileText
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <CardTitle className="text-base">{item.label}</CardTitle>
                  <CardDescription className="mt-1">
                    {item.isRequired ? requiredLabel : optionalLabel}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {item.instructions ? (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.instructions}
                </p>
              </CardContent>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
}
