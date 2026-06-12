"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";

import { saveApplicationDraftAction } from "@/features/applications/actions/save-application-draft";
import { submitApplicationAction } from "@/features/applications/actions/submit-application";
import { BasicDetailsStep } from "@/features/applications/components/basic-details-step";
import { DocumentsStep } from "@/features/applications/components/documents-step";
import { DynamicFieldsStep } from "@/features/applications/components/dynamic-fields-step";
import { ReviewStep } from "@/features/applications/components/review-step";
import { WizardStepIndicator } from "@/features/applications/components/wizard-step-indicator";
import { generateEventId } from "@/features/analytics/data-layer";
import { trackApplicationEvent } from "@/features/applications/lib/analytics";
import {
  captureAttributionFromUrl,
  getStoredAttribution,
} from "@/features/applications/lib/attribution";
import { filterServiceSpecificFields } from "@/features/applications/lib/basic-field-keys";
import { formatActionErrorMessage } from "@/features/applications/lib/format-action-error";
import { useWizardStore } from "@/features/applications/store/wizard-store";
import type {
  ApplyServiceConfig,
  BasicApplicantDetails,
  SavedDocumentMeta,
  WizardStep,
} from "@/features/applications/types";
import { normalizePakistanPhone } from "@/lib/validations/phone";

type ApplicationWizardLabels = {
  steps: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  basic: {
    title: string;
    description: string;
    fullName: string;
    email: string;
    phone: string;
    phoneHint: string;
    cnic: string;
    cnicHint: string;
    continue: string;
    saving: string;
    validationSummary: string;
    errors: {
      fullNameRequired: string;
      fullNameTooLong: string;
      emailInvalid: string;
      phoneInvalid: string;
      cnicInvalid: string;
    };
  };
  fields: {
    title: string;
    description: string;
    empty: string;
    emptyTitle: string;
    back: string;
    continue: string;
    saving: string;
  };
  documents: {
    title: string;
    description: string;
    empty: string;
    back: string;
    continue: string;
    saving: string;
    missingRequired: string;
    required: string;
    optional: string;
    upload: string;
    uploading: string;
    replace: string;
    remove: string;
    maxSize: string;
    allowedTypes: string;
    uploadFailed: string;
    invalidType: string;
    tooLarge: string;
    invalidName: string;
    previewLoading: string;
    previewError: string;
    previewOpen: string;
  };
  review: {
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
    incompleteDetails: string;
    back: string;
    submit: string;
    submitting: string;
    disclaimer: string;
  };
  resumeNotice: string;
  saveFailed: string;
  autoSaved: string;
};

type DraftSnapshot = {
  basic?: Partial<BasicApplicantDetails>;
  fields?: Record<string, string | string[] | boolean>;
  documents?: Record<string, SavedDocumentMeta>;
};

type ApplicationWizardProps = {
  service: ApplyServiceConfig;
  locale: "en" | "ur";
  labels: ApplicationWizardLabels;
  initialDraft?: {
    applicationId: string;
    trackingId: string;
    currentStep: WizardStep;
    basic?: Partial<BasicApplicantDetails>;
    fields?: Record<string, string | string[] | boolean>;
    documents?: Record<string, SavedDocumentMeta>;
  } | null;
  userDefaults?: Partial<BasicApplicantDetails>;
};

function hasCompleteBasic(basic: Partial<BasicApplicantDetails>): boolean {
  return Boolean(
    basic.fullName?.trim() &&
      basic.email?.trim() &&
      basic.phone?.trim() &&
      basic.cnic?.trim(),
  );
}

export function ApplicationWizard({
  service,
  locale,
  labels,
  initialDraft,
  userDefaults,
}: ApplicationWizardProps) {
  const router = useRouter();
  const initKeyRef = useRef<string | null>(null);
  const [documentsValidationError, setDocumentsValidationError] = useState<
    string | null
  >(null);
  const [showResumeNotice, setShowResumeNotice] = useState(
    Boolean(initialDraft && initialDraft.currentStep > 1),
  );

  const {
    applicationId,
    trackingId,
    currentStep,
    basic,
    fields,
    documents,
    isSaving,
    saveError,
    isSubmitting,
    submitError,
    hasTrackedStart,
    initialize,
    setStep,
    setBasic,
    setFields,
    setDocument,
    removeDocument,
    setApplicationMeta,
    setSaving,
    setSubmitting,
    markStartTracked,
  } = useWizardStore();

  const serviceSpecificFields = useMemo(
    () => filterServiceSpecificFields(service.formFields),
    [service.formFields],
  );

  const fieldsStepNumber = serviceSpecificFields.length === 0 ? null : 2;
  const documentsBackStep: WizardStep =
    serviceSpecificFields.length === 0 ? 1 : 2;

  const initKey = `${service.id}:${initialDraft?.applicationId ?? "new"}`;

  useEffect(() => {
    if (initKeyRef.current === initKey) {
      return;
    }

    initKeyRef.current = initKey;
    initialize({
      service,
      locale,
      applicationId: initialDraft?.applicationId,
      trackingId: initialDraft?.trackingId,
      currentStep: initialDraft?.currentStep,
      basic: initialDraft?.basic,
      fields: initialDraft?.fields,
      documents: initialDraft?.documents,
      userDefaults,
    });
  }, [
    initKey,
    initialize,
    service,
    locale,
    initialDraft,
    userDefaults,
  ]);

  useEffect(() => {
    captureAttributionFromUrl();
  }, []);

  useEffect(() => {
    if (hasTrackedStart) {
      return;
    }

    trackApplicationEvent("start_application", {
      service_slug: service.slug,
      service_id: service.id,
      step: 1,
    });
    markStartTracked();
  }, [hasTrackedStart, markStartTracked, service.id, service.slug]);

  async function persistDraft(
    nextStep: WizardStep,
    snapshot: DraftSnapshot = {},
  ) {
    setSaving(true, null);

    const attribution = getStoredAttribution();
    const result = await saveApplicationDraftAction({
      applicationId: applicationId ?? undefined,
      serviceSlug: service.slug,
      currentStep: nextStep,
      locale,
      basic: snapshot.basic ?? basic,
      fields: snapshot.fields ?? fields,
      documents: snapshot.documents ?? documents,
      attribution,
    });

    if (!result.success) {
      setSaving(false, result.error ?? labels.saveFailed);
      return false;
    }

    setApplicationMeta({
      applicationId: result.data.applicationId,
      trackingId: result.data.trackingId,
      currentStep: result.data.currentStep as WizardStep,
    });
    setSaving(false, null);
    return true;
  }

  async function handleBasicSubmit(values: BasicApplicantDetails) {
    const normalizedPhone = normalizePakistanPhone(values.phone);
    const normalized: BasicApplicantDetails = {
      ...values,
      phone: normalizedPhone ?? values.phone.trim(),
    };

    setBasic(normalized);

    const nextStep: WizardStep =
      serviceSpecificFields.length === 0 ? 3 : 2;

    const saved = await persistDraft(nextStep, { basic: normalized });

    if (!saved) {
      return;
    }

    setStep(nextStep);
    trackApplicationEvent("complete_step", {
      service_slug: service.slug,
      step: 1,
    });

    if (nextStep === 3) {
      trackApplicationEvent("complete_step", {
        service_slug: service.slug,
        step: 2,
      });
    }

    setShowResumeNotice(false);
  }

  async function handleFieldsSubmit(
    values: Record<string, string | string[] | boolean>,
  ) {
    setFields(values);
    const saved = await persistDraft(3, { fields: values });

    if (!saved) {
      return;
    }

    setStep(3);
    trackApplicationEvent("complete_step", {
      service_slug: service.slug,
      step: 2,
    });
  }

  async function handleDocumentsSubmit() {
    const required = service.documentRequirements.filter((doc) => doc.isRequired);
    const missing = required.filter((doc) => !documents[doc.id]);

    if (missing.length > 0) {
      setDocumentsValidationError(labels.documents.missingRequired);
      return;
    }

    setDocumentsValidationError(null);
    const saved = await persistDraft(4);

    if (!saved) {
      return;
    }

    setStep(4);
    trackApplicationEvent("complete_step", {
      service_slug: service.slug,
      step: 3,
    });
  }

  function handleDocumentUploaded(
    requirementId: string,
    document: SavedDocumentMeta,
  ) {
    setDocument(requirementId, document);
    setDocumentsValidationError(null);
  }

  async function handleSubmit() {
    if (!applicationId || !hasCompleteBasic(basic)) {
      setSubmitting(false, labels.review.incompleteDetails);
      return;
    }

    setSubmitting(true, null);

    const attribution = getStoredAttribution();
    const analyticsEventId = generateEventId();
    const normalizedPhone = normalizePakistanPhone(basic.phone!.trim());

    const result = await submitApplicationAction({
      applicationId,
      locale,
      basic: {
        fullName: basic.fullName!.trim(),
        email: basic.email!.trim(),
        phone: normalizedPhone ?? basic.phone!.trim(),
        cnic: basic.cnic!.trim(),
      },
      fields,
      attribution,
      analyticsEventId,
    });

    if (!result.success) {
      setSubmitting(
        false,
        formatActionErrorMessage(result, labels.saveFailed),
      );
      return;
    }

    trackApplicationEvent(
      "submit_application",
      {
        service_slug: service.slug,
        application_id: applicationId,
      },
      { eventId: analyticsEventId },
    );

    router.push(
      `/apply/${service.slug}/success?trackingId=${encodeURIComponent(result.data.trackingId)}`,
    );
  }

  const resolvedBasic = {
    fullName: basic.fullName ?? "",
    email: basic.email ?? "",
    phone: basic.phone ?? "",
    cnic: basic.cnic ?? "",
  };

  const basicComplete = hasCompleteBasic(resolvedBasic);

  return (
    <div className="space-y-8">
      <WizardStepIndicator currentStep={currentStep} labels={labels.steps} />

      {showResumeNotice ? (
        <p className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          {labels.resumeNotice}
        </p>
      ) : null}

      {saveError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {saveError}
        </p>
      ) : null}

      {isSaving ? (
        <p className="text-xs text-muted-foreground">{labels.autoSaved}</p>
      ) : null}

      {currentStep === 1 ? (
        <BasicDetailsStep
          defaultValues={resolvedBasic}
          labels={labels.basic}
          isSaving={isSaving}
          onSubmit={handleBasicSubmit}
        />
      ) : null}

      {currentStep === 2 && fieldsStepNumber === 2 ? (
        <DynamicFieldsStep
          fields={serviceSpecificFields}
          defaultValues={fields}
          labels={labels.fields}
          isSaving={isSaving}
          onBack={() => setStep(1)}
          onSubmit={handleFieldsSubmit}
        />
      ) : null}

      {currentStep === 3 && applicationId ? (
        <DocumentsStep
          applicationId={applicationId}
          requirements={service.documentRequirements}
          documents={documents}
          labels={labels.documents}
          isSaving={isSaving}
          validationError={documentsValidationError}
          onBack={() => setStep(documentsBackStep)}
          onDocumentUploaded={handleDocumentUploaded}
          onDocumentRemoved={(requirementId) => removeDocument(requirementId)}
          onSubmit={handleDocumentsSubmit}
        />
      ) : null}

      {currentStep === 4 ? (
        <ReviewStep
          basic={resolvedBasic}
          basicComplete={basicComplete}
          fields={serviceSpecificFields}
          fieldValues={fields}
          documentRequirements={service.documentRequirements}
          documents={documents}
          labels={labels.review}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onBack={() => setStep(3)}
          onEditDetails={() => setStep(1)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {trackingId ? (
        <p className="text-center text-xs text-muted-foreground">
          Draft ref: {trackingId}
        </p>
      ) : null}
    </div>
  );
}
