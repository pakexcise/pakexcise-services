import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { redirect } from "@/i18n/navigation";

import { AgentApplicationDocumentsReadOnly } from "@/components/agent/AgentApplicationDocumentsReadOnly";
import { AgentApplicationGuidanceCard } from "@/components/agent/AgentApplicationGuidanceCard";
import { AgentCommissionStatusCard } from "@/components/agent/AgentCommissionStatusCard";
import { AgentNextActionBadge } from "@/components/agent/AgentNextActionBadge";
import { InvoiceView } from "@/components/customer/InvoiceView";
import { PaymentUpload } from "@/components/customer/PaymentUpload";
import { ProofDownload } from "@/components/customer/ProofDownload";
import { CustomerApplicationLiveTimeline } from "@/components/customer/customer-application-live-timeline";
import { SubmittedDataSummary } from "@/components/customer/SubmittedDataSummary";
import { ApplicationSummaryCard } from "@/components/shared/ApplicationSummaryCard";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import {
  resolveAgentNextAction,
} from "@/features/agents/lib/agent-next-action";
import { isApprovedActiveAgent } from "@/features/agents/lib/is-approved-agent";
import { buildDocumentStatusLabels } from "@/features/documents/lib/build-document-status-labels";
import { resolveAdminFieldDisplayValues } from "@/features/applications/lib/resolve-admin-display";
import { serializeCustomerInvoiceForView } from "@/features/invoices/lib/serialize-customer-invoice";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_ACCEPTED_MIME_TYPES,
  PAYMENT_SCREENSHOT_MAX_BYTES,
} from "@/config/uploads";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { agentApplicationRepository } from "@/server/repositories/agent-application-repository";
import { invoiceRepository } from "@/server/repositories/invoice-repository";

export const dynamic = "force-dynamic";

type AgentApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agent.application");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AgentApplicationDetailPage({
  params,
}: AgentApplicationDetailPageProps) {
  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const user = await getCurrentUser();

  if (!user || !isApprovedActiveAgent(user)) {
    redirect({ href: "/agent/dashboard", locale });
    return;
  }

  const t = await getTranslations("agent.application");
  const tStatus = await getTranslations("admin.statuses");
  const tNextAction = await getTranslations("agent.nextAction");
  const tDocStatus = await getTranslations("agent.application.documents.statuses");
  const tPayoutStatus = await getTranslations("agent.commissions.payoutStatus");
  const tReceiptStatus = await getTranslations("agent.commissions.receiptStatus");

  const application = await agentApplicationRepository.findAssignedById({
    id,
    agentId: user.id,
  });

  if (!application) {
    notFound();
  }

  const invoice = await invoiceRepository.findAgentInvoiceByApplication({
    applicationId: application.id,
    agentId: user.id,
  });

  const serializedInvoice = invoice
    ? await serializeCustomerInvoiceForView(invoice)
    : null;
  const payment = invoice?.payments[0] ?? null;
  const completionProof =
    application.status === "COMPLETED"
      ? await agentApplicationRepository.findCompletionProofForAssignedApplication({
          applicationId: application.id,
          agentId: user.id,
        })
      : null;

  const serviceName =
    locale === "ur"
      ? application.service.nameUr
      : application.service.nameEn;

  const regionName = application.service.region
    ? locale === "ur"
      ? application.service.region.nameUr
      : application.service.region.nameEn
    : null;

  const customerName = application.user.name ?? application.user.email;
  const commission = application.agentCommissions[0] ?? null;

  const nextAction = resolveAgentNextAction({
    status: application.status,
    hasCommission: Boolean(commission),
  });

  const fieldValues = resolveAdminFieldDisplayValues(application.fieldValues, {
    revealSensitive: false,
  }).map((field) => ({
    fieldId: field.fieldId,
    label: locale === "ur" ? field.labelUr : field.labelEn,
    displayValue: field.displayValue,
    isMasked: field.isMasked,
  }));

  const statusLabel = (status: Parameters<typeof getApplicationStatusLabelKey>[0]) =>
    tStatus(getApplicationStatusLabelKey(status));

  const documentStatusLabels = buildDocumentStatusLabels((key) => tDocStatus(key));

  const guidanceKey =
    nextAction === "none" || nextAction === "closed" || nextAction === "completed"
      ? null
      : (`guidance.${nextAction}` as const);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {application.trackingId}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/agent/applications">{t("backToList")}</Link>
        </Button>
      </div>

      <ApplicationSummaryCard
        status={application.status}
        statusLabel={statusLabel(application.status)}
        serviceName={serviceName}
        regionName={regionName}
        customerName={customerName}
        submittedAt={application.createdAt}
        updatedAt={application.updatedAt}
        locale={locale}
        labels={{
          status: t("status"),
          nextAction: t("nextAction"),
          service: t("service"),
          region: t("region"),
          customer: t("customer"),
          submitted: t("submitted"),
          updated: t("updated"),
        }}
        nextAction={
          <AgentNextActionBadge
            action={nextAction}
            label={tNextAction(nextAction)}
          />
        }
      />

      {guidanceKey ? (
        <AgentApplicationGuidanceCard
          action={nextAction}
          title={t(`${guidanceKey}.title`)}
          description={t(`${guidanceKey}.description`)}
        />
      ) : null}

      <CustomerApplicationLiveTimeline
        applicationId={application.id}
        initialEntries={application.statusHistory}
        initialCurrentStatus={application.status}
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

      <AgentApplicationDocumentsReadOnly
        locale={locale === "ur" ? "ur" : "en"}
        requirements={application.service.documentReqs}
        documents={application.documents}
        labels={{
          title: t("documents.title"),
          empty: t("documents.empty"),
          required: t("documents.required"),
          optional: t("documents.optional"),
          status: t("documents.status"),
          statusLabels: documentStatusLabels,
          rejectionReason: t("documents.rejectionReason"),
          readOnlyNote: t("documents.readOnlyNote"),
          missing: t("documents.missing"),
        }}
      />

      {serializedInvoice ? (
        <InvoiceView
          applicationId={application.id}
          invoice={serializedInvoice}
          locale={locale === "ur" ? "ur" : "en"}
          labels={{
            title: t("invoice.title"),
            invoiceNumber: t("invoice.invoiceNumber"),
            total: t("invoice.total"),
            subtotal: t("invoice.subtotal"),
            tax: t("invoice.tax"),
            officialFeeNote: t("invoice.officialFeeNote"),
            paymentMethods: t("invoice.paymentMethods"),
            paymentInstructions: t("invoice.paymentInstructions"),
            accountTitle: t("invoice.accountTitle"),
            accountNumber: t("invoice.accountNumber"),
            iban: t("invoice.iban"),
            bankName: t("invoice.bankName"),
            instructions: t("invoice.instructions"),
            scanQr: t("invoice.scanQr"),
            dueDate: t("invoice.dueDate"),
            notes: t("invoice.notes"),
            lineItems: t("invoice.lineItems"),
            description: t("invoice.description"),
            amount: t("invoice.amount"),
            officialFee: t("invoice.officialFee"),
            downloadPdf: t("invoice.downloadPdf"),
            loadingPdf: t("invoice.loadingPdf"),
            pdfError: t("invoice.pdfError"),
            retry: t("invoice.retry"),
            sentOn: t("invoice.sentOn"),
            exactPaymentTitle: t("invoice.exactPaymentTitle"),
            exactPaymentNotice: t("invoice.exactPaymentNotice"),
            disclaimer: t("invoice.disclaimer"),
          }}
        />
      ) : application.status !== "INVOICE_SENT" &&
        ![
          "PAYMENT_UPLOADED",
          "PAYMENT_VERIFIED",
          "IN_PROGRESS",
          "AT_OFFICE",
          "COMPLETED",
        ].includes(application.status) ? (
        <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          {t("invoice.notAvailable")}
        </div>
      ) : null}

      {payment ? (
        <PaymentUpload
          applicationId={application.id}
          applicationStatus={application.status}
          paymentId={payment.id}
          paymentStatus={payment.status}
          screenshotFileName={payment.screenshotFileName}
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
            replaceHint: t("payment.replaceHint"),
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
            viewer: {
              loading: t("payment.viewer.loading"),
              error: t("payment.viewer.error"),
              retry: t("payment.viewer.retry"),
              openNewTab: t("payment.viewer.openNewTab"),
              unsupported: t("payment.viewer.unsupported"),
            },
          }}
        />
      ) : null}

      {commission ? (
        <AgentCommissionStatusCard
          commission={{
            id: commission.id,
            label: commission.label,
            amount: commission.amount.toString(),
            payoutStatus: commission.payoutStatus,
            agentReceiptStatus: commission.agentReceiptStatus,
          }}
          locale={locale === "ur" ? "ur" : "en"}
          labels={{
            title: t("commission.title"),
            amount: t("commission.amount"),
            payoutStatus: t("commission.payoutStatus"),
            receiptStatus: t("commission.receiptStatus"),
            viewCommissions: t("commission.viewCommissions"),
            payoutStatusLabels: {
              PENDING: tPayoutStatus("PENDING"),
              PROCESSING: tPayoutStatus("PROCESSING"),
              PAID: tPayoutStatus("PAID"),
              CANCELLED: tPayoutStatus("CANCELLED"),
            },
            receiptStatusLabels: {
              AWAITING: tReceiptStatus("AWAITING"),
              RECEIVED: tReceiptStatus("RECEIVED"),
              NOT_RECEIVED: tReceiptStatus("NOT_RECEIVED"),
            },
          }}
        />
      ) : application.status === "COMPLETED" ? (
        <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          {t("commission.pendingAdmin")}
        </div>
      ) : null}

      {completionProof ? (
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
    </div>
  );
}
