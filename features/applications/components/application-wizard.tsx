"use client";

import { useEffect, useMemo, useState } from "react";
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
import { isBasicApplicantFieldKey } from "@/features/applications/lib/basic-field-keys";
import { useWizardStore } from "@/features/applications/store/wizard-store";
import type {
  ApplyServiceConfig,
  BasicApplicantDetails,
  SavedDocumentMeta,
  WizardStep,
} from "@/features/applications/types";
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
  };
  fields: {
    title: string;
    description: string;
    empty: string;
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
    back: string;
    submit: string;
    submitting: string;
    disclaimer: string;
  };
  resumeNotice: string;
  saveFailed: string;
  autoSaved: string;
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

export function ApplicationWizard({
  service,
  locale,
  labels,
  initialDraft,
  userDefaults,
}: ApplicationWizardProps) {
  const router = useRouter();
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
    () =>
      service.formFields.filter(
        (field) => !isBasicApplicantFieldKey(field.fieldKey),
      ),
    [service.formFields],
  );

  useEffect(() => {
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

  async function persistDraft(nextStep: WizardStep) {
    setSaving(true, null);

    const attribution = getStoredAttribution();
    const result = await saveApplicationDraftAction({
      applicationId: applicationId ?? undefined,
      serviceSlug: service.slug,
      currentStep: nextStep,
      locale,
      basic,
      fields,
      documents,
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
    setBasic(values);
    const saved = await persistDraft(2);

    if (!saved) {
      return;
    }

    setStep(2);
    trackApplicationEvent("complete_step", {
      service_slug: service.slug,
      step: 1,
    });
    setShowResumeNotice(false);
  }

  async function handleFieldsSubmit(
    values: Record<string, string | string[] | boolean>,
  ) {
    setFields(values);
    const saved = await persistDraft(3);

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

  async function handleSubmit() {
    if (!applicationId || !basic.fullName || !basic.email || !basic.phone || !basic.cnic) {
      setSubmitting(false, labels.saveFailed);
      return;
    }

    setSubmitting(true, null);

    const attribution = getStoredAttribution();
    const analyticsEventId = generateEventId();
    const result = await submitApplicationAction({
      applicationId,
      locale,
      basic: {
        fullName: basic.fullName,
        email: basic.email,
        phone: basic.phone,
        cnic: basic.cnic,
      },
      fields,
      attribution,
      analyticsEventId,
    });

    if (!result.success) {
      setSubmitting(false, result.error ?? labels.saveFailed);
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

      {currentStep === 2 ? (
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
          onBack={() => setStep(2)}
          onDocumentUploaded={(requirementId, document) =>
            setDocument(requirementId, document)
          }
          onDocumentRemoved={(requirementId) => removeDocument(requirementId)}
          onSubmit={handleDocumentsSubmit}
        />
      ) : null}

      {currentStep === 4 &&
      resolvedBasic.fullName &&
      resolvedBasic.email &&
      resolvedBasic.phone &&
      resolvedBasic.cnic ? (
        <ReviewStep
          basic={resolvedBasic}
          fields={serviceSpecificFields}
          fieldValues={fields}
          documentRequirements={service.documentRequirements}
          documents={documents}
          labels={labels.review}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onBack={() => setStep(3)}
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
