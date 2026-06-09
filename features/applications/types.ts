import type { FieldType } from "@prisma/client";

import type { AttributionData } from "@/lib/attribution";

export type LocalizedText = {
  en: string;
  ur: string;
};

export type ApplyFormFieldConfig = {
  id: string;
  fieldKey: string;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  fieldType: FieldType;
  isRequired: boolean;
  isEncrypted: boolean;
  options: Array<{ value: string; label: string }>;
  validation: Record<string, unknown> | null;
  displayOrder: number;
};

export type ApplyDocumentRequirement = {
  id: string;
  docType: string;
  label: string;
  instructions: string | null;
  isRequired: boolean;
  maxSizeBytes: number;
  acceptedMimeTypes: string[];
  displayOrder: number;
};

export type ApplyServiceConfig = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  requiresProof: boolean;
  region: string;
  formFields: ApplyFormFieldConfig[];
  documentRequirements: ApplyDocumentRequirement[];
};

export type BasicApplicantDetails = {
  fullName: string;
  email: string;
  phone: string;
  cnic: string;
};

export type ApplicationDraftJson = {
  basic?: Partial<BasicApplicantDetails>;
  fields?: Record<string, string | string[] | boolean>;
  documents?: Record<
    string,
    {
      documentId: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
    }
  >;
  attribution?: AttributionData;
};

export type { AttributionData as ApplicationAttributionInput } from "@/lib/attribution";

export type WizardStep = 1 | 2 | 3 | 4;

export type SavedDocumentMeta = {
  documentId: string;
  docType: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  requirementId: string;
};
