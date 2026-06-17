import { FileText, Info } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DocumentRequirementKind } from "@prisma/client";

export type GroupedDocumentItem = {
  id: string;
  label: string;
  instructions: string | null;
  isRequired: boolean;
  kind: DocumentRequirementKind;
};

export type DocumentChecklistGroup = {
  regionKey: string;
  regionLabel: string;
  items: GroupedDocumentItem[];
};

type RegionGroupedDocumentChecklistProps = {
  title: string;
  groups: DocumentChecklistGroup[];
  requiredLabel: string;
  optionalLabel: string;
  emptyMessage: string;
  instructionLabel?: string;
};

function RequirementKindBadge({
  kind,
}: {
  kind: DocumentRequirementKind;
}) {
  if (kind === "FILE") {
    return null;
  }

  const labels: Record<Exclude<DocumentRequirementKind, "FILE">, string> = {
    NOTE: "Note",
    BIOMETRIC: "Biometric",
    INSPECTION: "Inspection",
    DELIVERY: "Delivery",
  };

  return (
    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {labels[kind as Exclude<DocumentRequirementKind, "FILE">]}
    </span>
  );
}

export function RegionGroupedDocumentChecklist({
  title,
  groups,
  requiredLabel,
  optionalLabel,
  emptyMessage,
}: RegionGroupedDocumentChecklistProps) {
  const totalItems = groups.reduce((count, group) => count + group.items.length, 0);

  if (totalItems === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.regionKey} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">{group.regionLabel}</h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {group.items.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-2">
                      {item.kind === "FILE" ? (
                        <FileText
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      ) : (
                        <Info
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      )}
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base">{item.label}</CardTitle>
                          <RequirementKindBadge kind={item.kind} />
                        </div>
                        <CardDescription>
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
          </div>
        ))}
      </div>
    </section>
  );
}
