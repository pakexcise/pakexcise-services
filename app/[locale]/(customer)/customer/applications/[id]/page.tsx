import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ApplicationCompletedTracker } from "@/components/analytics/ApplicationCompletedTracker";
import { ApplicationDocumentsPanel } from "@/components/customer/ApplicationDocumentsPanel";
import { InvoiceView } from "@/components/customer/InvoiceView";
import { NextActionBadge } from "@/components/customer/NextActionBadge";
import { PaymentUpload } from "@/components/customer/PaymentUpload";
import { ProofDownload } from "@/components/customer/ProofDownload";
import { StatusTimeline } from "@/components/customer/StatusTimeline";
import { SubmittedDataSummary } from "@/components/customer/SubmittedDataSummary";
import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { resolveAdminFieldDisplayValues } from "@/features/applications/lib/resolve-admin-display";
import { resolveCustomerNextAction } from "@/features/customer/lib/next-action";
import { Button } from "@/components/ui/button";
import {
  COMPLETION_PROOF_DOC_TYPE,
  DEFAULT_ACCEPTED_MIME_TYPES,
  PAYMENT_SCREENSHOT_MAX_BYTES,
} from "@/config/uploads";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { customerApplicationRepository } from "@/server/repositories/customer-application-repository";
import { invoiceRepository } from "@/server/repositories/invoice-repository";

type CustomerApplicationPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customer.application");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function CustomerApplicationPage({
  params,
}: CustomerApplicationPageProps) {
  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  const t = await getTranslations("customer.application");
  const tStatus = await getTranslations("admin.statuses");
  const tNextAction = await getTranslations("customer.nextAction");

  const application = await customerApplicationRepository.findOwnedById({
    id,
    userId: user.id,
  });

  if (!application) {
    notFound();
  }

  const invoice = await invoiceRepository.findCustomerInvoiceByApplication({
    applicationId: application.id,
    userId: user.id,
  });

  const serviceName =
    locale === "ur"
      ? application.service.nameUr
      : application.service.nameEn;

  const payment = invoice?.payments[0] ?? null;
  const completionProof = application.documents.find(
    (doc) => doc.type === COMPLETION_PROOF_DOC_TYPE,
  );

  const nextAction = resolveCustomerNextAction({
    status: application.status,
    hasInvoice: Boolean(invoice),
    paymentStatus: payment?.status ?? null,
    hasCompletionProof: Boolean(completionProof),
  });

  const fieldValues = resolveAdminFieldDisplayValues(application.fieldValues, {
    revealSensitive: true,
  }).map((field) => ({
    fieldId: field.fieldId,
    label: locale === "ur" ? field.labelUr : field.labelEn,
    displayValue: field.displayValue,
    isMasked: field.isMasked,
  }));

  const statusLabel = (status: Parameters<typeof getApplicationStatusLabelKey>[0]) =>
    tStatus(getApplicationStatusLabelKey(status));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {application.trackingId}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/customer/dashboard">{t("backToDashboard")}</Link>
        </Button>
      </div>

      <div className="rounded-xl border p-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <dt className="text-muted-foreground">{t("status")}</dt>
            <dd>
              <ApplicationStatusBadge
                status={application.status}
                label={statusLabel(application.status)}
              />
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("nextAction")}</dt>
            <dd>
              <NextActionBadge
                action={nextAction}
                label={tNextAction(nextAction)}
              />
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("service")}</dt>
            <dd>{serviceName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("submitted")}</dt>
            <dd>{formatDate(application.createdAt, locale)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("updated")}</dt>
            <dd>{formatDate(application.updatedAt, locale)}</dd>
          </div>
        </dl>
      </div>

      <StatusTimeline
        entries={application.statusHistory}
        currentStatus={application.status}
        locale={locale}
        labels={{
          title: t("timeline.title"),
          empty: t("timeline.empty"),
          current: t("timeline.current"),
        }}
        statusLabel={statusLabel}
      />

      <SubmittedDataSummary
        fields={fieldValues}
        labels={{
          title: t("submittedData.title"),
          empty: t("submittedData.empty"),
          protected: t("submittedData.protected"),
        }}
      />

      <ApplicationDocumentsPanel
        applicationId={application.id}
        applicationStatus={application.status}
        locale={locale === "ur" ? "ur" : "en"}
        requirements={application.service.documentRequirements}
        documents={application.documents}
        labels={{
          title: t("documents.title"),
          empty: t("documents.empty"),
          status: t("documents.status"),
          rejectionReason: t("documents.rejectionReason"),
          uploadSection: t("documents.uploadSection"),
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
        }}
      />

      {application.status === "COMPLETED" ? (
        <ApplicationCompletedTracker
          applicationId={application.id}
          serviceSlug={application.service.slug}
        />
      ) : null}

      {invoice ? (
        <InvoiceView
          applicationId={application.id}
          invoice={invoice}
          locale={locale === "ur" ? "ur" : "en"}
          labels={{
            title: t("invoice.title"),
            invoiceNumber: t("invoice.invoiceNumber"),
            total: t("invoice.total"),
            subtotal: t("invoice.subtotal"),
            tax: t("invoice.tax"),
            officialFeeNote: t("invoice.officialFeeNote"),
            paymentMethod: t("invoice.paymentMethod"),
            paymentInstructions: t("invoice.paymentInstructions"),
            dueDate: t("invoice.dueDate"),
            notes: t("invoice.notes"),
            lineItems: t("invoice.lineItems"),
            officialFee: t("invoice.officialFee"),
            downloadPdf: t("invoice.downloadPdf"),
            loadingPdf: t("invoice.loadingPdf"),
            pdfError: t("invoice.pdfError"),
            retry: t("invoice.retry"),
            sentOn: t("invoice.sentOn"),
          }}
        />
      ) : application.status !== "INVOICE_SENT" &&
        !["PAYMENT_UPLOADED", "PAYMENT_VERIFIED", "IN_PROGRESS", "AT_OFFICE", "COMPLETED"].includes(
          application.status,
        ) ? (
        <div className="rounded-xl border p-5 text-sm text-muted-foreground">
          {t("invoice.notAvailable")}
        </div>
      ) : null}

      {payment ? (
        <PaymentUpload
          applicationId={application.id}
          paymentId={payment.id}
          paymentStatus={payment.status}
          rejectionReason={payment.rejectionReason}
          maxSizeBytes={PAYMENT_SCREENSHOT_MAX_BYTES}
          acceptedMimeTypes={[...DEFAULT_ACCEPTED_MIME_TYPES]}
          labels={{
            title: t("payment.title"),
            description: t("payment.description"),
            upload: t("payment.upload"),
            uploading: t("payment.uploading"),
            uploaded: t("payment.uploaded"),
            replace: t("payment.replace"),
            maxSize: t("payment.maxSize"),
            allowedTypes: t("payment.allowedTypes"),
            uploadFailed: t("payment.uploadFailed"),
            invalidType: t("payment.invalidType"),
            tooLarge: t("payment.tooLarge"),
            invalidName: t("payment.invalidName"),
            waitingVerification: t("payment.waitingVerification"),
            verified: t("payment.verified"),
            rejected: t("payment.rejected"),
            rejectionReason: t("payment.rejectionReason"),
          }}
        />
      ) : null}

      {application.status === "COMPLETED" && completionProof ? (
        <ProofDownload
          documentId={completionProof.id}
          fileName={completionProof.fileName}
          labels={{
            title: t("proof.title"),
            description: t("proof.description"),
            download: t("proof.download"),
            loading: t("proof.loading"),
            error: t("proof.error"),
            retry: t("proof.retry"),
          }}
        />
      ) : null}

      {!invoice && application.status === "INVOICE_SENT" ? (
        <p className="text-sm text-muted-foreground">{t("invoicePending")}</p>
      ) : null}
    </div>
  );
}
