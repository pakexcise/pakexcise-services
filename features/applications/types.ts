import type { FieldType } from "@prisma/client";

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
  attribution?: ApplicationAttributionInput;
};

export type ApplicationAttributionInput = {
  firstTouchSource?: string;
  firstTouchMedium?: string;
  firstTouchCampaign?: string;
  lastTouchSource?: string;
  lastTouchCampaign?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  landingPage?: string;
  referrer?: string;
  deviceType?: string;
};

export type WizardStep = 1 | 2 | 3 | 4;

export type SavedDocumentMeta = {
  documentId: string;
  docType: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  requirementId: string;
};
