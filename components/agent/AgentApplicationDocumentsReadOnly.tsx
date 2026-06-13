import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { COMPLETION_PROOF_DOC_TYPE } from "@/config/uploads";

type DocumentRequirement = {
  id: string;
  docType: string;
  labelEn: string;
  labelUr: string;
  isRequired: boolean;
};

type ApplicationDocument = {
  id: string;
  type: string;
  fileName: string;
  status: string;
  rejectionReason: string | null;
  requirementId: string | null;
};

type AgentApplicationDocumentsReadOnlyProps = {
  locale: "en" | "ur";
  requirements: DocumentRequirement[];
  documents: ApplicationDocument[];
  labels: {
    title: string;
    empty: string;
    required: string;
    optional: string;
    status: string;
    statusLabels: Record<string, string>;
    rejectionReason: string;
    readOnlyNote: string;
    missing: string;
  };
};

export function AgentApplicationDocumentsReadOnly({
  locale,
  requirements,
  documents,
  labels,
}: AgentApplicationDocumentsReadOnlyProps) {
  const applicantDocuments = documents.filter(
    (doc) => doc.type !== COMPLETION_PROOF_DOC_TYPE,
  );

  const requirementRows =
    requirements.length > 0
      ? requirements.map((requirement) => {
          const uploaded = applicantDocuments.find(
            (doc) =>
              doc.requirementId === requirement.id ||
              doc.type === requirement.docType,
          );

          return {
            id: requirement.id,
            label: locale === "ur" ? requirement.labelUr : requirement.labelEn,
            isRequired: requirement.isRequired,
            uploaded,
          };
        })
      : applicantDocuments.map((doc) => ({
          id: doc.id,
          label: doc.fileName,
          isRequired: true,
          uploaded: doc,
        }));

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-semibold">{labels.title}</h2>
        <p className="max-w-md text-xs text-muted-foreground">{labels.readOnlyNote}</p>
      </div>

      {requirementRows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {requirementRows.map((row) => {
            const status = row.uploaded?.status ?? "MISSING";
            const statusLabel = labels.statusLabels[status] ?? labels.missing;

            return (
              <li
                key={row.id}
                className="rounded-lg border bg-background p-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <p className="text-sm font-medium">{row.label}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {row.isRequired ? labels.required : labels.optional}
                      </Badge>
                    </div>
                    {row.uploaded ? (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {row.uploaded.fileName}
                      </p>
                    ) : null}
                  </div>
                  <Badge
                    variant={
                      status === "APPROVED"
                        ? "default"
                        : status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                    }
                    className="shrink-0 text-[11px]"
                  >
                    {statusLabel}
                  </Badge>
                </div>
                {row.uploaded?.rejectionReason ? (
                  <p className="mt-2 text-xs text-destructive">
                    {labels.rejectionReason}: {row.uploaded.rejectionReason}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
