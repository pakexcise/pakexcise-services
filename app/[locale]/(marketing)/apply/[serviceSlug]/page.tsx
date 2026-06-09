import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/marketing/page-hero";
import { ApplicationWizard } from "@/features/applications/components/application-wizard";
import { ApplyAccessDenied } from "@/features/applications/components/apply-access-denied";
import {
  loadDraftDocuments,
  parseDraftJson,
} from "@/features/applications/lib/load-draft-state";
import { mapServiceApplyConfig } from "@/features/applications/lib/map-service-config";
import { buildLoginRedirectUrl } from "@/config/auth";
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
  const t = await getTranslations("apply");
  const tNav = await getTranslations("nav");
  const callbackPath = `/apply/${serviceSlug}`;

  if (!access.allowed) {
    if (access.reason === "UNAUTHORIZED") {
      redirect({
        href: buildLoginRedirectUrl(callbackPath),
        locale,
      });
    }

    const loginHref =
      access.reason === "AGENT_NOT_APPROVED"
        ? "/login"
        : buildLoginRedirectUrl(callbackPath);

    return (
      <div className="container-site py-10 md:py-14">
        <ApplyAccessDenied
          title={
            access.reason === "AGENT_NOT_APPROVED"
              ? t("agentNotApprovedTitle")
              : t("forbiddenTitle")
          }
          description={
            access.reason === "AGENT_NOT_APPROVED"
              ? t("agentNotApprovedDescription")
              : t("forbiddenDescription")
          }
          loginLabel={tNav("login")}
          dashboardLabel={t("goToDashboard")}
          loginHref={loginHref}
          dashboardHref={
            access.reason === "AGENT_NOT_APPROVED"
              ? "/agent/dashboard"
              : "/customer/dashboard"
          }
        />
      </div>
    );
  }

  const service = mapServiceApplyConfig(serviceRecord, locale);
  const serviceName = service.name;

  const existingDraft = await applicationWizardRepository.findDraftByServiceForUser(
    {
      serviceId: service.id,
      userId: access.user.id,
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
      documents: documentsForWizard,
    };
  }

  const userDefaults = {
    fullName: access.user.name ?? undefined,
    email: access.user.email,
    phone: access.user.phone ?? undefined,
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
      phoneHint: t("basic.phoneHint"),
      cnic: t("basic.cnic"),
      cnicHint: t("basic.cnicHint"),
      continue: t("actions.continue"),
      saving: t("actions.saving"),
    },
    fields: {
      title: t("fields.title"),
      description: t("fields.description"),
      empty: t("fields.empty"),
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
    },
    review: {
      title: t("review.title"),
      description: t("review.description"),
      basicSection: t("review.basicSection"),
      fieldsSection: t("review.fieldsSection"),
      documentsSection: t("review.documentsSection"),
      fullName: t("basic.fullName"),
      email: t("basic.email"),
      phone: t("basic.phone"),
      cnic: t("basic.cnic"),
      noDocuments: t("review.noDocuments"),
      back: t("actions.back"),
      submit: t("actions.submit"),
      submitting: t("actions.submitting"),
      disclaimer: t("review.disclaimer", { service: serviceName }),
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

      <div className="container-site py-8 md:py-12">
        <ApplicationWizard
          service={service}
          locale={locale}
          labels={labels}
          initialDraft={initialDraft}
          userDefaults={userDefaults}
        />
      </div>
    </>
  );
}
