"use client";

import { create } from "zustand";

import type {
  ApplyServiceConfig,
  BasicApplicantDetails,
  SavedDocumentMeta,
  WizardStep,
} from "@/features/applications/types";

type WizardInitInput = {
  service: ApplyServiceConfig;
  locale: "en";
  applicationId?: string | null;
  trackingId?: string | null;
  currentStep?: WizardStep;
  basic?: Partial<BasicApplicantDetails>;
  selectedRegionId?: string | null;
  fields?: Record<string, string | string[] | boolean>;
  documents?: Record<string, SavedDocumentMeta>;
  userDefaults?: Partial<BasicApplicantDetails>;
};

type WizardState = {
  service: ApplyServiceConfig | null;
  locale: "en";
  applicationId: string | null;
  trackingId: string | null;
  currentStep: WizardStep;
  selectedRegionId: string | null;
  basic: Partial<BasicApplicantDetails>;
  fields: Record<string, string | string[] | boolean>;
  documents: Record<string, SavedDocumentMeta>;
  isSaving: boolean;
  saveError: string | null;
  isSubmitting: boolean;
  submitError: string | null;
  hasTrackedStart: boolean;
  initialize: (input: WizardInitInput) => void;
  setStep: (step: WizardStep) => void;
  setBasic: (basic: Partial<BasicApplicantDetails>) => void;
  setSelectedRegionId: (regionId: string | null) => void;
  setFields: (fields: Record<string, string | string[] | boolean>) => void;
  setDocument: (requirementId: string, document: SavedDocumentMeta) => void;
  removeDocument: (requirementId: string) => void;
  setApplicationMeta: (input: {
    applicationId: string;
    trackingId: string;
    currentStep?: WizardStep;
  }) => void;
  setSaving: (isSaving: boolean, saveError?: string | null) => void;
  setSubmitting: (isSubmitting: boolean, submitError?: string | null) => void;
  markStartTracked: () => void;
  reset: () => void;
};

const initialState = {
  service: null,
  locale: "en" as const,
  applicationId: null,
  trackingId: null,
  currentStep: 1 as WizardStep,
  selectedRegionId: null,
  basic: {},
  fields: {},
  documents: {},
  isSaving: false,
  saveError: null,
  isSubmitting: false,
  submitError: null,
  hasTrackedStart: false,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,
  initialize: (input) => {
    const basic = {
      ...input.userDefaults,
      ...input.basic,
    };

    const hasCompleteBasic = Boolean(
      basic.fullName?.trim() &&
        basic.phone?.trim() &&
        basic.cnic?.trim(),
    );

    let currentStep = input.currentStep ?? 1;

    if (currentStep > 1 && !hasCompleteBasic) {
      currentStep = 1;
    }

    return set({
      service: input.service,
      locale: input.locale,
      applicationId: input.applicationId ?? null,
      trackingId: input.trackingId ?? null,
      currentStep,
      selectedRegionId: input.selectedRegionId ?? null,
      basic,
      fields: input.fields ?? {},
      documents: input.documents ?? {},
      isSaving: false,
      saveError: null,
      isSubmitting: false,
      submitError: null,
      hasTrackedStart: false,
    });
  },
  setStep: (step) => set({ currentStep: step }),
  setBasic: (basic) =>
    set((state) => ({
      basic: { ...state.basic, ...basic },
    })),
  setSelectedRegionId: (selectedRegionId) => set({ selectedRegionId }),
  setFields: (fields) => set({ fields }),
  setDocument: (requirementId, document) =>
    set((state) => ({
      documents: { ...state.documents, [requirementId]: document },
    })),
  removeDocument: (requirementId) =>
    set((state) => {
      const next = { ...state.documents };
      delete next[requirementId];
      return { documents: next };
    }),
  setApplicationMeta: (input) =>
    set({
      applicationId: input.applicationId,
      trackingId: input.trackingId,
      currentStep: input.currentStep ?? undefined,
    }),
  setSaving: (isSaving, saveError = null) => set({ isSaving, saveError }),
  setSubmitting: (isSubmitting, submitError = null) =>
    set({ isSubmitting, submitError }),
  markStartTracked: () => set({ hasTrackedStart: true }),
  reset: () => set(initialState),
}));
