import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/marketing/page-hero";
import { ApplicationWizard } from "@/features/applications/components/application-wizard";
import { ApplyAccessDenied } from "@/features/applications/components/apply-access-denied";
import { ApplyPageShell } from "@/features/applications/components/apply-page-shell";
import {
  loadDraftDocuments,
  parseDraftJson,
} from "@/features/applications/lib/load-draft-state";
import { mapServiceApplyConfig } from "@/features/applications/lib/map-service-config";
import { mapServiceApplyOption } from "@/features/applications/lib/map-service-option";
import {
  resolveApplyRedirectHref,
} from "@/features/applications/lib/resolve-apply-redirect";
import { resolvePostLoginPath } from "@/features/auth/lib/redirect";
import { redirect } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { applicationWizardRepository } from "@/server/repositories/application-wizard-repository";
import { serviceRepository } from "@/server/repositories/service-repository";
import { getApplyAccess } from "@/server/permissions/apply-access";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const dynamic = "force-dynamic";

type ApplyPageProps = {
  params: Promise<{ serviceSlug: string }>;
};

export async function generateMetadata({
  params,
}: ApplyPageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const locale = await getCurrentLocale();
  const service = await serviceRepository.findPublicApplyConfigBySlug(serviceSlug);

  if (!service) {
    return {};
  }

  const name = pickLocalized(locale, {
    en: service.nameEn,
    ur: service.nameUr,
  });

  const t = await getTranslations({ locale, namespace: "apply" });

  return {
    title: t("metaTitle", { service: name }),
    description: t("metaDescription", { service: name }),
    robots: { index: false, follow: false },
  };
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { serviceSlug } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const serviceRecord = await serviceRepository.findPublicApplyConfigBySlug(
    serviceSlug,
  );

  if (!serviceRecord) {
    notFound();
  }

  const access = await getApplyAccess();
  const callbackPath = `/apply/${serviceSlug}`;

  if (!access.allowed) {
    const service = mapServiceApplyConfig(serviceRecord, locale);
    const t = await getTranslations("apply");
    const tNav = await getTranslations("nav");

    if (access.reason === "UNAUTHORIZED") {
      redirect({
        href: resolveApplyRedirectHref(access, callbackPath),
        locale,
      });
      notFound();
    }

    return (
      <>
        <PageHero
          title={t("pageTitle", { service: service.name })}
          description={t("pageDescription", { region: service.region })}
          breadcrumbs={[
            { label: tNav("home"), href: "/" },
            { label: tNav("services"), href: "/services" },
            { label: service.name, href: `/services/${service.slug}` },
            { label: t("breadcrumbApply") },
          ]}
        />

        <ApplyPageShell serviceName={service.name} regionLabel={service.region}>
          <ApplyAccessDenied
            access={access}
            serviceHref={`/services/${service.slug}`}
            dashboardHref={resolvePostLoginPath(access.user.role)}
            labels={{
              forbiddenTitle: t("forbiddenTitle"),
              forbiddenDescription: t("forbiddenDescription"),
              agentNotApprovedTitle: t("agentNotApprovedTitle"),
              agentNotApprovedDescription: t("agentNotApprovedDescription"),
              goToDashboard: t("goToDashboard"),
              viewService: t("viewService"),
              staffAccountHint: t("staffAccountHint"),
            }}
          />
        </ApplyPageShell>
      </>
    );
  }

  const user = access.user;
  const t = await getTranslations("apply");
  const tNav = await getTranslations("nav");
  const tMarketing = await getTranslations("marketing");

  const service = mapServiceApplyConfig(serviceRecord, locale);
  const { items: serviceRecords } = await serviceRepository.listPublicPaginated(
    1,
    100,
  );
  const availableServices = serviceRecords.map((item) =>
    mapServiceApplyOption(item, locale, {
      multiple: tMarketing("services.multipleRegions"),
      allProvinces: tMarketing("services.allProvinces"),
    }),
  );
  const serviceName = service.name;

  const existingDraft = await applicationWizardRepository.findDraftByServiceForUser(
    {
      serviceId: service.id,
      userId: user.id,
    },
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
        requirementId,
      };
    }

    initialDraft = {
      ...parsed,
      selectedRegionId: parsed.selectedRegionId,
      documents: documentsForWizard,
    };
  }

  const userDefaults = {
    fullName: user.name ?? undefined,
    email: user.email,
    phone: user.phone ?? undefined,
  };

  const labels = {
    steps: {
      step1: t("steps.basic"),
      step2: t("steps.fields"),
      step3: t("steps.documents"),
      step4: t("steps.review"),
    },
    basic: {
      title: t("basic.title"),
      description: t("basic.description"),
      fullName: t("basic.fullName"),
      email: t("basic.email"),
      phone: t("basic.phone"),
      phonePlaceholder: t("basic.phonePlaceholder"),
      phoneHint: t("basic.phoneHint"),
      cnic: t("basic.cnic"),
      cnicHint: t("basic.cnicHint"),
      continue: t("actions.continue"),
      saving: t("actions.saving"),
      validationSummary: t("basic.validationSummary"),
      errors: {
        fullNameRequired: t("basic.errors.fullNameRequired"),
        fullNameTooLong: t("basic.errors.fullNameTooLong"),
        emailInvalid: t("basic.errors.emailInvalid"),
        phoneRequired: t("basic.errors.phoneRequired"),
        phoneInvalid: t("basic.errors.phoneInvalid"),
        cnicInvalid: t("basic.errors.cnicInvalid"),
      },
    },
    fields: {
      title: t("fields.title"),
      description: t("fields.description"),
      serviceSection: t("fields.serviceSection"),
      regionSection: t("fields.regionSection"),
      regionPlaceholder: t("fields.regionPlaceholder"),
      regionRequired: t("fields.regionRequired"),
      selectRegionForFields: t("fields.selectRegionForFields"),
      selectedBadge: t("fields.selectedBadge"),
      switchServiceNotice: t("fields.switchServiceNotice"),
      additionalSection: t("fields.additionalSection"),
      noAdditionalFields: t("fields.noAdditionalFields"),
      emptyTitle: t("fields.emptyTitle"),
      back: t("actions.back"),
      continue: t("actions.continue"),
      saving: t("actions.saving"),
    },
    documents: {
      title: t("documents.title"),
      description: t("documents.description"),
      empty: t("documents.empty"),
      back: t("actions.back"),
      continue: t("actions.continue"),
      saving: t("actions.saving"),
      missingRequired: t("documents.missingRequired"),
      required: t("documents.required"),
      optional: t("documents.optional"),
      upload: t("documents.upload"),
      uploading: t("documents.uploading"),
      replace: t("documents.replace"),
      remove: t("documents.remove"),
      maxSize: t("documents.maxSize"),
      allowedTypes: t("documents.allowedTypes"),
      uploadFailed: t("documents.uploadFailed"),
      invalidType: t("documents.invalidType"),
      tooLarge: t("documents.tooLarge"),
      invalidName: t("documents.invalidName"),
      previewLoading: t("documents.previewLoading"),
      previewError: t("documents.previewError"),
      previewOpen: t("documents.previewOpen"),
    },
    review: {
      title: t("review.title"),
      description: t("review.description"),
      basicSection: t("review.basicSection"),
      serviceSection: t("review.serviceSection"),
      fieldsSection: t("review.fieldsSection"),
      edit: t("review.edit"),
      documentsSection: t("review.documentsSection"),
      fullName: t("basic.fullName"),
      email: t("basic.email"),
      phone: t("basic.phone"),
      cnic: t("basic.cnic"),
      noDocuments: t("review.noDocuments"),
      incompleteDetails: t("review.incompleteDetails"),
      back: t("actions.back"),
      submit: t("actions.submit"),
      submitting: t("actions.submitting"),
    },
    resumeNotice: t("resumeNotice"),
    saveFailed: t("saveFailed"),
    autoSaved: t("autoSaved"),
  };

  return (
    <>
      <PageHero
        title={t("pageTitle", { service: serviceName })}
        description={t("pageDescription", { region: service.region })}
        breadcrumbs={[
          { label: tNav("home"), href: "/" },
          { label: tNav("services"), href: "/services" },
          { label: serviceName, href: `/services/${service.slug}` },
          { label: t("breadcrumbApply") },
        ]}
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
