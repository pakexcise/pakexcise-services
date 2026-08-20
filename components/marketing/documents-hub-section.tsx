import Link from "next/link";
import type { Route } from "next";

import {
  RegionGroupedDocumentChecklist,
  type DocumentChecklistGroup,
} from "@/components/marketing/region-grouped-document-checklist";
import type { PublicDocumentHubGroup } from "@/server/repositories/document-requirement-repository";

type DocumentsHubSectionProps = {
  groups: PublicDocumentHubGroup[];
  labels: {
    emptyMessage: string;
    requiredLabel: string;
    optionalLabel: string;
    viewServiceLabel: string;
    checklistTitle: string;
  };
};

export function DocumentsHubSection({
  groups,
  labels,
}: DocumentsHubSectionProps) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{labels.emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-12">
      {groups.map((group) => {
        const checklistGroups: DocumentChecklistGroup[] = group.regions.map(
          (region) => ({
            regionKey: region.regionKey,
            regionLabel: region.regionLabel,
            items: region.items.map((item) => ({
              id: item.id,
              label: item.labelEn,
              instructions: item.instructionsEn,
              isRequired: item.isRequired,
              kind: item.kind,
            })),
          }),
        );

        return (
          <section
            key={group.service.slug}
            id={group.service.slug}
            className="scroll-mt-24 space-y-4 rounded-2xl border bg-card p-5 shadow-sm md:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">
                  {group.service.nameEn}
                </h2>
              </div>
              <Link
                href={`/services/${group.service.slug}` as Route}
                prefetch={false}
                className="text-sm font-medium text-primary hover:underline"
              >
                {labels.viewServiceLabel}
              </Link>
            </div>
            <RegionGroupedDocumentChecklist
              title={labels.checklistTitle}
              groups={checklistGroups}
              requiredLabel={labels.requiredLabel}
              optionalLabel={labels.optionalLabel}
              emptyMessage={labels.emptyMessage}
            />
          </section>
        );
      })}
    </div>
  );
}
