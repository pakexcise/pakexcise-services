import { ListChecks } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ServiceFieldItem } from "@/features/services/lib/map-service-requirements";

type ServiceFieldsPreviewProps = {
  title: string;
  description: string;
  fields: ServiceFieldItem[];
  requiredLabel: string;
  optionalLabel: string;
  emptyMessage: string;
};

export function ServiceFieldsPreview({
  title,
  description,
  fields,
  requiredLabel,
  optionalLabel,
  emptyMessage,
}: ServiceFieldsPreviewProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <Card key={field.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <ListChecks
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <CardTitle className="text-base">{field.label}</CardTitle>
                  <CardDescription>
                    {field.isRequired ? requiredLabel : optionalLabel}
                    {field.scopeLabel ? ` · ${field.scopeLabel}` : null}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {field.helpText ? (
              <CardContent>
                <p className="text-sm text-muted-foreground">{field.helpText}</p>
              </CardContent>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
}
