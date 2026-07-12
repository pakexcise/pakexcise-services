import type { Metadata, Route } from "next";
import { notFound, redirect } from "next/navigation";

import { PageHero } from "@/components/marketing/page-hero";
import { ApplicationWizard } from "@/features/applications/components/application-wizard";
import { ApplyAccessDenied } from "@/features/applications/components/apply-access-denied";
import { ApplyPageShell } from "@/features/applications/components/apply-page-shell";
import {
  loadDraftDocuments,
  parseDraftJson} from "@/features/applications/lib/load-draft-state";
import { mapServiceApplyConfig } from "@/features/applications/lib/map-service-config";
import { mapServiceApplyOption } from "@/features/applications/lib/map-service-option";
import {
  resolveApplyRedirectHref} from "@/features/applications/lib/resolve-apply-redirect";
import { resolvePostLoginPath } from "@/features/auth/lib/redirect";
import { applicationWizardRepository } from "@/server/repositories/application-wizard-repository";
import { redirectRepository } from "@/server/repositories/redirect-repository";
import { serviceRepository } from "@/server/repositories/service-repository";
import { getApplyAccess } from "@/server/permissions/apply-access";

export const dynamic = "force-dynamic";

type ApplyPageProps = {
  params: Promise<{ serviceSlug: string }>;
};

export async function generateMetadata({
  params}: ApplyPageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const locale = "en";
  const service = await serviceRepository.findPublicApplyConfigBySlug(serviceSlug);

  if (!service) {
    return {};
  }

  const name = service.nameEn ?? "";

    return {
    title: `Apply for ${name} | PakExcise.com`,
    description: `Start your private excise facilitation application for ${name}. Not a government website.`,
    robots: { index: false, follow: false }};
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { serviceSlug } = await params;
  const locale = "en";
const serviceRecord = await serviceRepository.findPublicApplyConfigBySlug(
    serviceSlug,
  );

  if (!serviceRecord) {
    const slugRedirect = await redirectRepository.findActiveByOldSlug(serviceSlug);

    if (slugRedirect) {
      redirect(`/apply/${slugRedirect.newSlug}` as Route);
    }

    notFound();
  }

  const access = await getApplyAccess();
  const callbackPath = `/apply/${serviceSlug}`;

  if (!access.allowed) {
    const service = mapServiceApplyConfig(serviceRecord, locale);
            if (access.reason === "UNAUTHORIZED") {
      redirect(resolveApplyRedirectHref(access, callbackPath) as Route);
      notFound();
    }

    return (
      <>
        <PageHero
          title={`Apply for ${service.name}`}
          description={`Complete the steps below to submit your application for ${service.region}.`}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: service.name, href: `/services/${service.slug}` },
            { label: "Apply" }]}
        />

        <ApplyPageShell serviceName={service.name} regionLabel={service.region}>
          <ApplyAccessDenied
            access={access}
            serviceHref={`/services/${service.slug}`}
            dashboardHref={resolvePostLoginPath(access.user.role)}
            labels={{
              forbiddenTitle: "You cannot apply with this account",
              forbiddenDescription: "Only customer and approved agent accounts can submit applications.",
              agentNotApprovedTitle: "Agent account not approved",
              agentNotApprovedDescription: "Your agent account must be approved before you can submit applications for customers.",
              goToDashboard: "Go to dashboard",
              viewService: "Back to service page",
              staffAccountHint: "You are signed in with a staff account. Sign out and sign in with a customer account to apply, or use WhatsApp / Submit Request on the service page."}}
          />
        </ApplyPageShell>
      </>
    );
  }

  const user = access.user;
        const service = mapServiceApplyConfig(serviceRecord, locale);
  const { items: serviceRecords } = await serviceRepository.listPublicPaginated(
    1,
    100,
  );
  const availableServices = serviceRecords.map((item) =>
    mapServiceApplyOption(item, locale, {
      multiple: "Multiple provinces",
      allProvinces: "All Provinces"}),
  );
  const serviceName = service.name;

  const existingDraft = await applicationWizardRepository.findDraftByServiceForUser(
    {
      serviceId: service.id,
      userId: user.id},
  );

  let initialDraft = null;

  if (existingDraft) {
    const parsed = parseDraftJson(existingDraft);
    const draftDocuments = await loadDraftDocuments(existingDraft.id);

    const documentsForWizard: Record<
      string,
      {
        documentId: string;
        docType: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        requirementId: string;
      }
    > = {};

    for (const [requirementId, meta] of Object.entries(draftDocuments ?? {})) {
      const requirement = service.documentRequirements.find(
        (item) => item.id === requirementId,
      );

      documentsForWizard[requirementId] = {
        documentId: meta.documentId,
        docType: requirement?.docType ?? "document",
        fileName: meta.fileName,
        mimeType: meta.mimeType,
        fileSize: meta.fileSize,
        requirementId};
    }

    initialDraft = {
      ...parsed,
      selectedRegionId: parsed.selectedRegionId,
      documents: documentsForWizard};
  }

  const userDefaults = {
    fullName: user.name ?? undefined,
    email: user.email,
    phone: user.phone ?? undefined};

  const labels = {
    steps: {
      step1: "Your details",
      step2: "Service details",
      step3: "Documents",
      step4: "Review"},
    basic: {
      title: "Applicant details",
      description: "Enter the contact details we will use for updates about this application.",
      fullName: "Full name",
      email: "Email address (optional)",
      phone: "Mobile number",
      phonePlaceholder: "03XX-XXXXXXX",
      phoneHint: "Pakistani mobile number (e.g. 0300-1234567)",
      cnic: "CNIC",
      cnicHint: "Format: 12345-1234567-1",
      continue: "Continue",
      saving: "Saving...",
      validationSummary: "Please fix the following before continuing:",
      errors: {
        fullNameRequired: "Full name is required",
        fullNameTooLong: "Full name is too long",
        emailInvalid: "Enter a valid email address",
        phoneRequired: "Mobile number is required",
        phoneInvalid: "Enter a valid Pakistani mobile number (e.g. 0300-1234567)",
        cnicInvalid: "Invalid CNIC format"}},
    fields: {
      title: "Service details",
      description: "Confirm the service for this application or choose a different one.",
      serviceSection: "Select service",
      regionSection: "Select province / region",
      regionPlaceholder: "Choose your province",
      regionRequired: "Please select your province before continuing.",
      selectRegionForFields: "Select your province above to see the required vehicle registration number format.",
      selectedBadge: "Current",
      switchServiceNotice: "You selected __SERVICE__. Continue to load this service's requirements.",
      additionalSection: "Additional information",
      noAdditionalFields: "No extra fields are required for this service. Continue to documents.",
      emptyTitle: "No additional fields",
      back: "Back",
      continue: "Continue",
      saving: "Saving..."},
    documents: {
      title: "Required documents",
      description: "Upload clear scans or photos of each required document.",
      empty: "No documents are required for this service. Continue to review.",
      back: "Back",
      continue: "Continue",
      saving: "Saving...",
      missingRequired: "Please upload all required documents before continuing.",
      required: "Required",
      optional: "Optional",
      upload: "Upload file",
      uploading: "Uploading...",
      replace: "Replace",
      remove: "Remove",
      maxSize: "Max file size: __SIZE__",
      allowedTypes: "Allowed: JPG, PNG, WebP, PDF",
      uploadFailed: "Upload failed. Please try again.",
      invalidType: "This file type is not allowed.",
      tooLarge: "File is too large.",
      invalidName: "Invalid file name.",
      previewLoading: "Loading preview...",
      previewError: "Preview could not be loaded.",
      previewOpen: "Open document in new tab",
      uploadConstraintsSummary: "Accepted files: __TYPES__ · Maximum size: __SIZE__ per file"},
    review: {
      title: "Review and submit",
      description: "Check your details before submitting. You will receive a tracking ID after submission.",
      basicSection: "Applicant details",
      serviceSection: "Selected service",
      fieldsSection: "Service details",
      edit: "Edit",
      documentsSection: "Uploaded documents",
      fullName: "Full name",
      email: "Email address (optional)",
      phone: "Mobile number",
      cnic: "CNIC",
      noDocuments: "No documents uploaded.",
      incompleteDetails: "Some required details are missing. Go back and complete your applicant information.",
      back: "Back",
      submit: "Submit application",
      submitting: "Submitting..."},
    resumeNotice: "We found a saved draft for this service. You can continue where you left off.",
    saveFailed: "Could not save your progress. Please try again.",
    autoSaved: "Saving progress..."};

  return (
    <>
      <PageHero
        title={`Apply for ${serviceName}`}
        description={`Complete the steps below to submit your application for ${service.region}.`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: serviceName, href: `/services/${service.slug}` },
          { label: "Apply" }]}
      />

      <ApplyPageShell serviceName={serviceName} regionLabel={service.region}>
        <ApplicationWizard
          service={service}
          availableServices={availableServices}
          locale={locale}
          labels={labels}
          initialDraft={initialDraft}
          userDefaults={userDefaults}
        />
      </ApplyPageShell>
    </>
  );
}
