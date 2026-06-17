import type { DocumentRequirementKind, FieldType } from "@prisma/client";

import type { AttributionData } from "@/lib/attribution";

export type LocalizedText = {
  en: string;
  ur: string;
};

export type ApplyRegionOption = {
  id: string;
  slug: string;
  name: string;
  supportNotes: string | null;
};

export type ApplyFormFieldConfig = {
  id: string;
  fieldKey: string;
  regionId: string | null;
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
  regionId: string | null;
  kind: DocumentRequirementKind;
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
  assignedRegions: ApplyRegionOption[];
  formFields: ApplyFormFieldConfig[];
  documentRequirements: ApplyDocumentRequirement[];
};

export type ApplyServiceOption = {
  id: string;
  slug: string;
  name: string;
  region: string;
  shortDescription: string | null;
};

export type BasicApplicantDetails = {
  fullName: string;
  email: string;
  phone: string;
  cnic: string;
};

export type ApplicationDraftJson = {
  basic?: Partial<BasicApplicantDetails>;
  selectedRegionId?: string | null;
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
