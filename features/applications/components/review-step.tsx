"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/features/applications/lib/validate-upload";
import type {
  ApplyDocumentRequirement,
  ApplyFormFieldConfig,
  BasicApplicantDetails,
  SavedDocumentMeta,
} from "@/features/applications/types";
import { formatPhoneForDisplay } from "@/lib/validations/phone";

type ReviewStepProps = {
  serviceName: string;
  basic: BasicApplicantDetails;
  basicComplete: boolean;
  fields: ApplyFormFieldConfig[];
  fieldValues: Record<string, string | string[] | boolean>;
  documentRequirements: ApplyDocumentRequirement[];
  documents: Record<string, SavedDocumentMeta>;
  labels: {
    title: string;
    description: string;
    basicSection: string;
    serviceSection: string;
    fieldsSection: string;
    documentsSection: string;
    fullName: string;
    email: string;
    phone: string;
    cnic: string;
    noDocuments: string;
    incompleteDetails: string;
    back: string;
    submit: string;
    submitting: string;
    edit: string;
  };
  isSubmitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onEditDetails: () => void;
  onEditService: () => void;
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

  if (field.fieldType === "MULTI_SELECT" && Array.isArray(value)) {
    return value
      .map(
        (item) =>
          field.options.find((opt) => opt.value === item)?.label ?? item,
      )
      .join(", ");
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (field.fieldType === "SELECT" || field.fieldType === "RADIO") {
    const option = field.options.find((item) => item.value === value);
    return option?.label ?? String(value);
  }

  return String(value);
}

function displayValue(value: string): string {
  return value.trim() || "—";
}

export function ReviewStep({
  serviceName,
  basic,
  basicComplete,
  fields,
  fieldValues,
  documentRequirements,
  documents,
  labels,
  isSubmitting,
  submitError,
  onBack,
  onEditDetails,
  onEditService,
  onSubmit,
}: ReviewStepProps) {
  const uploadedDocuments = documentRequirements
    .map((req) => documents[req.id])
    .filter((doc): doc is SavedDocumentMeta => Boolean(doc));

  const requiredDocuments = documentRequirements.filter((doc) => doc.isRequired);
  const missingRequiredDocuments = requiredDocuments.filter(
    (doc) => !documents[doc.id],
  );

  const canSubmit =
    basicComplete && missingRequiredDocuments.length === 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{labels.title}</h2>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      {!basicComplete ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="space-y-2">
            <p>{labels.incompleteDetails}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onEditDetails}
            >
              {labels.back}
            </Button>
          </div>
        </div>
      ) : null}

      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium">{labels.serviceSection}</h3>
          <Button type="button" size="sm" variant="ghost" onClick={onEditService}>
            {labels.edit}
          </Button>
        </div>
        <p className="text-sm font-medium">{serviceName}</p>
      </section>

      <section className="space-y-3 rounded-lg border p-4">
        <h3 className="font-medium">{labels.basicSection}</h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{labels.fullName}</dt>
            <dd className="font-medium">{displayValue(basic.fullName)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.email}</dt>
            <dd className="font-medium">{displayValue(basic.email)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.phone}</dt>
            <dd className="font-medium">
              {basic.phone ? formatPhoneForDisplay(basic.phone) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.cnic}</dt>
            <dd className="font-medium">
              {basic.cnic ? displayValue(basic.cnic) : "—"}
            </dd>
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

      {submitError ? (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          {labels.back}
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? labels.submitting : labels.submit}
        </Button>
      </div>
    </div>
  );
}
