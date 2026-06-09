"use client";

import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/features/applications/lib/validate-upload";
import type {
  ApplyDocumentRequirement,
  ApplyFormFieldConfig,
  BasicApplicantDetails,
  SavedDocumentMeta,
} from "@/features/applications/types";

type ReviewStepProps = {
  basic: BasicApplicantDetails;
  fields: ApplyFormFieldConfig[];
  fieldValues: Record<string, string | string[] | boolean>;
  documentRequirements: ApplyDocumentRequirement[];
  documents: Record<string, SavedDocumentMeta>;
  labels: {
    title: string;
    description: string;
    basicSection: string;
    fieldsSection: string;
    documentsSection: string;
    fullName: string;
    email: string;
    phone: string;
    cnic: string;
    noDocuments: string;
    back: string;
    submit: string;
    submitting: string;
    disclaimer: string;
  };
  isSubmitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onSubmit: () => Promise<void>;
};

function formatFieldValue(
  field: ApplyFormFieldConfig,
  value: string | string[] | boolean | undefined,
): string {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  if (field.fieldType === "CHECKBOX") {
    return value === true ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (field.fieldType === "SELECT" || field.fieldType === "RADIO") {
    const option = field.options.find((item) => item.value === value);
    return option?.label ?? String(value);
  }

  if (field.fieldType === "MULTI_SELECT" && Array.isArray(value)) {
    return value
      .map((item) => field.options.find((opt) => opt.value === item)?.label ?? item)
      .join(", ");
  }

  return String(value);
}

function maskCnic(cnic: string): string {
  const parts = cnic.split("-");
  if (parts.length !== 3) {
    return "•••••-•••••••-•";
  }

  return `${parts[0]}-*******-${parts[2]}`;
}

export function ReviewStep({
  basic,
  fields,
  fieldValues,
  documentRequirements,
  documents,
  labels,
  isSubmitting,
  submitError,
  onBack,
  onSubmit,
}: ReviewStepProps) {
  const uploadedDocuments = documentRequirements
    .map((req) => documents[req.id])
    .filter((doc): doc is SavedDocumentMeta => Boolean(doc));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{labels.title}</h2>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      <section className="space-y-3 rounded-lg border p-4">
        <h3 className="font-medium">{labels.basicSection}</h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{labels.fullName}</dt>
            <dd className="font-medium">{basic.fullName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.email}</dt>
            <dd className="font-medium">{basic.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.phone}</dt>
            <dd className="font-medium">{basic.phone}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.cnic}</dt>
            <dd className="font-medium">{maskCnic(basic.cnic)}</dd>
          </div>
        </dl>
      </section>

      {fields.length > 0 ? (
        <section className="space-y-3 rounded-lg border p-4">
          <h3 className="font-medium">{labels.fieldsSection}</h3>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.id}>
                <dt className="text-muted-foreground">{field.label}</dt>
                <dd className="font-medium">
                  {formatFieldValue(field, fieldValues[field.fieldKey])}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="space-y-3 rounded-lg border p-4">
        <h3 className="font-medium">{labels.documentsSection}</h3>
        {uploadedDocuments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{labels.noDocuments}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {documentRequirements.map((req) => {
              const doc = documents[req.id];
              if (!doc) {
                return null;
              }

              return (
                <li
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2"
                >
                  <span>{req.label}</span>
                  <span className="text-muted-foreground">
                    {doc.fileName} ({formatFileSize(doc.fileSize)})
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        {labels.disclaimer}
      </p>

      {submitError ? (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          {labels.back}
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? labels.submitting : labels.submit}
        </Button>
      </div>
    </div>
  );
}
