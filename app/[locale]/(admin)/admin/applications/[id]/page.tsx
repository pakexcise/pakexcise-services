import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { AdminInvoicePdfButton } from "@/components/admin/AdminInvoicePdfButton";
import { InvoiceEditor } from "@/components/admin/InvoiceEditor";
import { InvoiceGenerator } from "@/components/admin/InvoiceGenerator";
import { PaymentVerification } from "@/components/admin/PaymentVerification";
import { InvoicePaymentMethodsDisplay } from "@/components/shared/InvoicePaymentMethodsDisplay";
import { SecurePaymentViewer } from "@/components/shared/SecurePaymentViewer";
import { SecureDocViewer } from "@/components/admin/SecureDocViewer";
import { StatusManager } from "@/components/admin/StatusManager";
import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { AdminNotesForm } from "@/features/admin/components/admin-notes-form";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { ProofUploadSection } from "@/features/admin/components/proof-upload-section";
import { getAdminApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { isUploadedCompletionProof } from "@/features/applications/lib/completion-proof";
import { getAllowedNextStatuses } from "@/features/applications/status-machine";
import { getInvoiceEditBlockReason } from "@/features/invoices/lib/can-edit-invoice";
import { serializeInvoiceForEditor } from "@/features/invoices/lib/serialize-invoice-for-editor";
import { canCreateInvoiceForStatus } from "@/features/invoices/lib/invoice-eligibility";
import { formatPkr } from "@/features/invoices/lib/format-pkr";
import { buildFileContentVersion } from "@/lib/utils/file-content-version";
import { ApplicantDetailsSummary } from "@/components/shared/ApplicantDetailsSummary";
import {
  filterApplicantFieldValues,
  resolveAdminFieldDisplayValues,
  resolveCustomerContactDisplay,
} from "@/features/applications/lib/resolve-admin-display";
import { resolveApplicantDetailsFromApplication } from "@/features/applications/lib/resolve-applicant-details";
import { COMPLETION_PROOF_DOC_TYPE } from "@/config/uploads";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { DeleteApplicationButton } from "@/features/applications/admin/components/delete-application-button";
import {
  getApplicationSubmissionSourceLabelKey,
  resolveApplicationSubmissionSource,
} from "@/features/applications/lib/resolve-submission-source";
import { AdminApplicationSeenMarker } from "@/components/admin/admin-application-seen-marker";
import { adminPaymentMethodRepository } from "@/server/repositories/admin-payment-method-repository";
import { applicationRepository } from "@/server/repositories/application-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { getCurrentUser } from "@/server/auth/current-user";
import { isSuperAdminRole } from "@/server/permissions/admin-scope";
import { roleHasPermission } from "@/server/permissions/roles";

type ApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ApplicationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("admin");
  return adminMetadata(`${t("applications.detailTitle")} ${id.slice(0, 8)}`);
}

export default async function AdminApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const [application, user, activePaymentMethods] = await Promise.all([
    applicationRepository.findAdminById(id),
    getCurrentUser(),
    adminPaymentMethodRepository.listActive(),
  ]);

  if (!application) {
    notFound();
  }

  const canManageStatus =
    user !== null && roleHasPermission(user.role, "application:status");
  const canManageNotes =
    user !== null && roleHasPermission(user.role, "application:notes");
  const canUploadProof =
    user !== null && roleHasPermission(user.role, "application:write");
  const canManageInvoice =
    user !== null && roleHasPermission(user.role, "invoice:manage");
  const canVerifyPayment =
    user !== null && roleHasPermission(user.role, "payment:verify");
  const isSuperAdmin = user !== null && isSuperAdminRole(user.role);

  const hasActiveSentInvoice = application.invoices.some(
    (invoice) => invoice.status === "SENT",
  );
  const showInvoiceGenerator =
    canManageInvoice &&
    canCreateInvoiceForStatus(application.status) &&
    !hasActiveSentInvoice;

  const pendingVerificationPayment = application.payments.find(
    (payment) => payment.status === "UPLOADED",
  );

  const statusLabels = Object.fromEntries(
    application.statusHistory
      .flatMap((entry) => [entry.fromStatus, entry.toStatus])
      .filter(Boolean)
      .map((status) => [status, t(getAdminApplicationStatusLabelKey(status!))]),
  ) as Record<string, string>;

  for (const status of getAllowedNextStatuses(application.status)) {
    statusLabels[status] = t(getAdminApplicationStatusLabelKey(status));
  }
  statusLabels[application.status] = t(
    getAdminApplicationStatusLabelKey(application.status),
  );

  const customer = resolveCustomerContactDisplay({
    name: application.user.name,
    email: application.user.email,
    phone: application.user.phone,
    revealSensitive: false,
  });

  const applicantDetails = resolveApplicantDetailsFromApplication({
    draftJson: application.draftJson,
    fieldValues: application.fieldValues,
    revealSensitive: true,
  });

  const fieldValues = resolveAdminFieldDisplayValues(
    filterApplicantFieldValues(application.fieldValues),
    {
      revealSensitive: true,
      locale: locale === "ur" ? "ur" : "en",
    },
  );
  const serviceName =
    locale === "ur"
      ? application.service.nameUr
      : application.service.nameEn;
  const regionName = application.service.region
    ? locale === "ur"
      ? application.service.region.nameUr
      : application.service.region.nameEn
    : "—";

  const submissionSource = resolveApplicationSubmissionSource({
    agentId: application.agent?.id,
    draftJson: application.draftJson,
    initialStatusNote: application.statusHistory.at(-1)?.note,
  });

  const completionProof = application.documents.find(
    (doc) => doc.type === COMPLETION_PROOF_DOC_TYPE,
  );

  const applicantDocuments = application.documents.filter(
    (doc) => doc.type !== COMPLETION_PROOF_DOC_TYPE,
  );

  const viewerLabels = {
    loading: t("applications.detail.viewer.loading"),
    error: t("applications.detail.viewer.error"),
    retry: t("applications.detail.viewer.retry"),
    expiresIn: t("applications.detail.viewer.expiresIn"),
    unsupported: t("applications.detail.viewer.unsupported"),
    openNewTab: t("applications.detail.viewer.openNewTab"),
  };

  return (
    <div className="space-y-6">
      <AdminApplicationSeenMarker applicationId={application.id} />
      <AdminPageHeader
        title={t("applications.detailTitle")}
        description={application.trackingId}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/applications">
                {t("applications.backToList")}
              </Link>
            </Button>
            {isSuperAdmin ? (
              <Button asChild size="sm">
                <Link href={`/admin/applications/${application.id}/edit`}>
                  <Pencil className="size-4" aria-hidden="true" />
                  {t("applications.edit")}
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("applications.detail.overview")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 sm:col-span-2">
              <span className="text-muted-foreground">
                {t("applications.columns.status")}
              </span>
              <ApplicationStatusBadge
                status={application.status}
                label={t(getAdminApplicationStatusLabelKey(application.status))}
              />
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {t("applications.columns.service")}
              </span>
              <span>{serviceName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {t("applications.detail.region")}
              </span>
              <span>{regionName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {t("applications.columns.created")}
              </span>
              <span>{formatDate(application.createdAt, locale)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {t("applications.detail.locale")}
              </span>
              <span>{application.locale}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {t("applications.detail.submissionSource")}
              </span>
              <span>
                {t(getApplicationSubmissionSourceLabelKey(submissionSource))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("applications.detail.customer")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {t("applications.detail.customerName")}
              </span>
              <span>{customer.name}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {t("applications.detail.customerEmail")}
              </span>
              <span>{customer.email}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {t("applications.detail.customerPhone")}
              </span>
              <span>{customer.phone}</span>
            </div>
            {customer.isMasked ? (
              <p className="text-xs text-muted-foreground">
                {t("applications.detail.sensitiveMasked")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <ApplicantDetailsSummary
        details={applicantDetails}
        labels={{
          title: t("applications.detail.applicantDetailsTitle"),
          fullName: t("applications.detail.applicantFullName"),
          email: t("applications.detail.applicantEmail"),
          phone: t("applications.detail.applicantPhone"),
          cnic: t("applications.detail.applicantCnic"),
          empty: t("applications.detail.noApplicantDetails"),
        }}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {canManageStatus ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("applications.detail.statusManager")}</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusManager
                applicationId={application.id}
                currentStatus={application.status}
                allowedStatuses={getAllowedNextStatuses(application.status)}
                statusLabels={statusLabels}
                requiresProof={application.service.requiresProof}
                hasProof={isUploadedCompletionProof(completionProof)}
                labels={{
                  title: t("applications.detail.statusManager"),
                  description: t("applications.detail.statusManagerDescription"),
                  currentStatus: t("applications.detail.currentStatus"),
                  nextStatus: t("applications.detail.nextStatus"),
                  note: t("applications.detail.statusNote"),
                  notePlaceholder: t("applications.detail.statusNotePlaceholder"),
                  submit: t("applications.detail.statusSubmit"),
                  submitting: t("applications.detail.statusSubmitting"),
                  noTransitions: t("applications.detail.noTransitions"),
                  success: t("applications.detail.statusSuccess"),
                  error: t("applications.detail.statusError"),
                  requiresProof: t("applications.detail.requiresProof"),
                }}
              />
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t("applications.notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            {canManageNotes ? (
              <AdminNotesForm
                applicationId={application.id}
                initialNotes={application.adminNotes ?? ""}
                labels={{
                  save: t("applications.detail.notesSave"),
                  saving: t("applications.detail.notesSaving"),
                  saved: t("applications.detail.notesSaved"),
                  error: t("applications.detail.notesError"),
                  placeholder: t("applications.detail.notesPlaceholder"),
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {application.adminNotes ?? t("applications.noNotes")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("applications.detail.fieldValues")}</CardTitle>
        </CardHeader>
        <CardContent>
          {fieldValues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("applications.detail.noFieldValues")}
            </p>
          ) : (
            <dl className="grid gap-3 sm:grid-cols-2">
              {fieldValues.map((field) => (
                <div key={field.fieldId} className="rounded-lg border p-3">
                  <dt className="text-xs text-muted-foreground">
                    {locale === "ur" ? field.labelUr : field.labelEn}
                  </dt>
                  <dd className="mt-1 text-sm font-medium">
                    {field.displayValue}
                  </dd>
                  {field.isMasked ? (
                    <Badge variant="outline" className="mt-2">
                      {t("applications.detail.protected")}
                    </Badge>
                  ) : null}
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("applications.detail.documents")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {applicantDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("applications.detail.noDocuments")}
            </p>
          ) : (
            applicantDocuments.map((document) => (
              <div key={document.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {document.requirement
                        ? locale === "ur"
                          ? document.requirement.labelUr
                          : document.requirement.labelEn
                        : document.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {document.fileName} · {document.status}
                    </p>
                  </div>
                  <Badge variant="secondary">{document.status}</Badge>
                </div>
                <SecureDocViewer
                  documentId={document.id}
                  fileName={document.fileName}
                  contentVersion={buildFileContentVersion(
                    document.fileName,
                    document.updatedAt,
                  )}
                  labels={viewerLabels}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {canUploadProof ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("applications.detail.proofSection")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProofUploadSection
              applicationId={application.id}
              existingProof={
                completionProof
                  ? {
                      id: completionProof.id,
                      fileName: completionProof.fileName,
                      fileSize: completionProof.fileSize,
                      status: completionProof.status,
                    }
                  : null
              }
              labels={{
                title: t("applications.detail.proofTitle"),
                description: t("applications.detail.proofDescription"),
                upload: t("applications.detail.proofUpload"),
                replace: t("applications.detail.proofReplace"),
                uploading: t("applications.detail.proofUploading"),
                uploaded: t("applications.detail.proofUploaded"),
                required: t("applications.detail.proofRequired"),
                uploadFailed: t("applications.detail.proofUploadFailed"),
                invalidType: t("applications.detail.proofInvalidType"),
                tooLarge: t("applications.detail.proofTooLarge"),
                invalidName: t("applications.detail.proofInvalidName"),
              }}
            />
            {completionProof ? (
              <div className="mt-6">
                <SecureDocViewer
                  documentId={completionProof.id}
                  fileName={completionProof.fileName}
                  contentVersion={buildFileContentVersion(
                    completionProof.fileName,
                    completionProof.updatedAt,
                  )}
                  purpose="view"
                  labels={viewerLabels}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {showInvoiceGenerator ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("invoices.generator.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceGenerator
              applicationId={application.id}
              locale={application.locale === "ur" ? "ur" : "en"}
              paymentMethods={activePaymentMethods}
              labels={{
                title: t("invoices.generator.title"),
                description: t("invoices.generator.description"),
                serviceFee: t("invoices.generator.serviceFee"),
                officialFeeNote: t("invoices.generator.officialFeeNote"),
                paymentMethods: t("invoices.generator.paymentMethods"),
                paymentMethodsHint: t("invoices.generator.paymentMethodsHint"),
                noPaymentMethods: t("invoices.generator.noPaymentMethods"),
                paymentInstructions: t("invoices.generator.paymentInstructions"),
                paymentInstructionsHint: t("invoices.generator.paymentInstructionsHint"),
                dueDate: t("invoices.generator.dueDate"),
                notes: t("invoices.generator.notes"),
                taxTotal: t("invoices.generator.taxTotal"),
                statusNote: t("invoices.generator.statusNote"),
                lineItems: t("invoices.generator.lineItems"),
                itemLabel: t("invoices.generator.itemLabel"),
                itemDescription: t("invoices.generator.itemDescription"),
                itemAmount: t("invoices.generator.itemAmount"),
                officialFee: t("invoices.generator.officialFee"),
                addLineItem: t("invoices.generator.addLineItem"),
                removeLineItem: t("invoices.generator.removeLineItem"),
                submit: t("invoices.generator.submit"),
                submitting: t("invoices.generator.submitting"),
                success: t("invoices.generator.success"),
                error: t("invoices.generator.error"),
                accountTitle: t("invoices.generator.accountTitle"),
                accountNumber: t("invoices.generator.accountNumber"),
                iban: t("invoices.generator.iban"),
                bankName: t("invoices.generator.bankName"),
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("applications.detail.invoices")}</CardTitle>
          </CardHeader>
          <CardContent>
            {application.invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("applications.detail.noInvoices")}
              </p>
            ) : (
              <div className="space-y-4">
                {application.invoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-lg border p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <Badge variant="outline">{invoice.status}</Badge>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      {t("applications.detail.invoiceTotal")}:{" "}
                      {formatPkr(invoice.total.toString(), locale === "ur" ? "ur" : "en")}
                    </p>
                    {invoice.paymentMethods.length > 0 ? (
                      <div className="mt-4">
                        <InvoicePaymentMethodsDisplay
                          methods={invoice.paymentMethods}
                          locale={locale === "ur" ? "ur" : "en"}
                          labels={{
                            title: t("invoices.generator.paymentMethods"),
                            accountTitle: t("invoices.generator.accountTitle"),
                            accountNumber: t("invoices.generator.accountNumber"),
                            iban: t("invoices.generator.iban"),
                            bankName: t("invoices.generator.bankName"),
                            instructions: t("invoices.generator.instructions"),
                          }}
                        />
                      </div>
                    ) : invoice.paymentMethod ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("invoices.generator.paymentMethods")}: {invoice.paymentMethod}
                      </p>
                    ) : null}
                    {invoice.officialFeeNote ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {invoice.officialFeeNote}
                      </p>
                    ) : null}
                    {invoice.lineItems.length > 0 ? (
                      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {invoice.lineItems.map((item) => (
                          <li key={item.id}>
                            {item.label} —{" "}
                            {formatPkr(item.amount.toString(), locale === "ur" ? "ur" : "en")}
                            {item.isOfficialFee
                              ? ` (${t("applications.detail.officialFee")})`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {invoice.pdfR2Key && canManageInvoice ? (
                      <AdminInvoicePdfButton
                        invoiceId={invoice.id}
                        label={t("invoices.viewPdf")}
                        loadingLabel={t("invoices.loadingPdf")}
                        errorLabel={t("invoices.pdfError")}
                      />
                    ) : null}
                    {canManageInvoice && invoice.status === "SENT" ? (
                      <InvoiceEditor
                        invoice={serializeInvoiceForEditor(invoice)}
                        paymentMethods={activePaymentMethods}
                        blockReason={(() => {
                          const reason = getInvoiceEditBlockReason({
                            invoiceStatus: invoice.status,
                            paymentStatus: application.payments.find(
                              (payment) => payment.invoiceId === invoice.id,
                            )?.status,
                          });

                          return reason === "payment_uploaded" ||
                            reason === "payment_verified"
                            ? reason
                            : null;
                        })()}
                        labels={{
                          edit: t("invoices.editor.edit"),
                          editing: t("invoices.editor.editing"),
                          description: t("invoices.editor.description"),
                          serviceFee: t("invoices.generator.serviceFee"),
                          officialFeeNote: t("invoices.generator.officialFeeNote"),
                          paymentMethods: t("invoices.generator.paymentMethods"),
                          paymentMethodsHint: t("invoices.generator.paymentMethodsHint"),
                          noPaymentMethods: t("invoices.generator.noPaymentMethods"),
                          paymentInstructions: t("invoices.generator.paymentInstructions"),
                          paymentInstructionsHint:
                            t("invoices.generator.paymentInstructionsHint"),
                          dueDate: t("invoices.generator.dueDate"),
                          notes: t("invoices.generator.notes"),
                          taxTotal: t("invoices.generator.taxTotal"),
                          editNote: t("invoices.editor.editNote"),
                          lineItems: t("invoices.generator.lineItems"),
                          itemLabel: t("invoices.generator.itemLabel"),
                          itemDescription: t("invoices.generator.itemDescription"),
                          itemAmount: t("invoices.generator.itemAmount"),
                          officialFee: t("invoices.generator.officialFee"),
                          addLineItem: t("invoices.generator.addLineItem"),
                          removeLineItem: t("invoices.generator.removeLineItem"),
                          submit: t("invoices.editor.submit"),
                          submitting: t("invoices.editor.submitting"),
                          success: t("invoices.editor.success"),
                          error: t("invoices.editor.error"),
                          accountTitle: t("invoices.generator.accountTitle"),
                          accountNumber: t("invoices.generator.accountNumber"),
                          iban: t("invoices.generator.iban"),
                          bankName: t("invoices.generator.bankName"),
                          blockedPaymentUploaded: t("invoices.editor.blockedPaymentUploaded"),
                          blockedPaymentVerified: t("invoices.editor.blockedPaymentVerified"),
                          cancel: t("invoices.editor.cancel"),
                        }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("applications.detail.payments")}</CardTitle>
          </CardHeader>
          <CardContent>
            {application.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("applications.detail.noPayments")}
              </p>
            ) : (
              <div className="space-y-4">
                {application.payments.map((payment) => (
                  <div key={payment.id} className="rounded-lg border p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">
                        {payment.invoice.invoiceNumber}
                      </p>
                      <Badge variant="outline">{payment.status}</Badge>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      {t("applications.detail.paymentAmount")}:{" "}
                      {formatPkr(payment.amount.toString(), locale === "ur" ? "ur" : "en")}
                    </p>
                    {payment.screenshotR2Key ? (
                      <div className="mt-4">
                        <SecurePaymentViewer
                          paymentId={payment.id}
                          fileName={payment.screenshotFileName}
                          contentVersion={buildFileContentVersion(
                            payment.screenshotFileName,
                            payment.updatedAt,
                          )}
                          labels={{
                            loading: t("payments.verification.viewerLoading"),
                            error: t("payments.verification.viewerError"),
                            retry: t("payments.verification.viewerRetry"),
                            openNewTab: t("payments.verification.viewerOpen"),
                            unsupported: t("payments.verification.viewerUnsupported"),
                          }}
                        />
                      </div>
                    ) : payment.screenshotFileName ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {payment.screenshotFileName}
                      </p>
                    ) : null}
                    {payment.rejectionReason ? (
                      <p className="mt-2 text-xs text-destructive">
                        {payment.rejectionReason}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {canVerifyPayment && pendingVerificationPayment ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("payments.verification.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentVerification
              payment={{
                id: pendingVerificationPayment.id,
                status: pendingVerificationPayment.status,
                amount: pendingVerificationPayment.amount.toString(),
                fileName: pendingVerificationPayment.screenshotFileName,
                contentVersion: buildFileContentVersion(
                  pendingVerificationPayment.screenshotFileName,
                  pendingVerificationPayment.updatedAt,
                ),
                rejectionReason: pendingVerificationPayment.rejectionReason,
              }}
              labels={{
                title: t("payments.verification.title"),
                description: t("payments.verification.description"),
                amount: t("payments.verification.amount"),
                approve: t("payments.verification.approve"),
                approving: t("payments.verification.approving"),
                reject: t("payments.verification.reject"),
                rejecting: t("payments.verification.rejecting"),
                verifyNote: t("payments.verification.verifyNote"),
                rejectReason: t("payments.verification.rejectReason"),
                rejectNote: t("payments.verification.rejectNote"),
                successApprove: t("payments.verification.successApprove"),
                successReject: t("payments.verification.successReject"),
                error: t("payments.verification.error"),
                viewerLoading: t("payments.verification.viewerLoading"),
                viewerError: t("payments.verification.viewerError"),
                viewerRetry: t("payments.verification.viewerRetry"),
                viewerOpen: t("payments.verification.viewerOpen"),
                viewerUnsupported: t("payments.verification.viewerUnsupported"),
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("applications.statusHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {application.statusHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("applications.noStatusHistory")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("applications.columns.status")}</TableHead>
                  <TableHead>{t("applications.history.note")}</TableHead>
                  <TableHead>{t("applications.history.changedBy")}</TableHead>
                  <TableHead>{t("applications.columns.created")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {application.statusHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <ApplicationStatusBadge
                        status={entry.toStatus}
                        label={t(getAdminApplicationStatusLabelKey(entry.toStatus))}
                      />
                    </TableCell>
                    <TableCell>{entry.note}</TableCell>
                    <TableCell>
                      {entry.actor?.name ?? entry.actor?.email ?? "—"}
                    </TableCell>
                    <TableCell>
                      {formatDate(entry.createdAt, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isSuperAdmin ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("applications.delete.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("applications.delete.description")}
            </p>
            <DeleteApplicationButton
              applicationId={application.id}
              labels={{
                trigger: t("applications.delete.trigger"),
                confirm: t("applications.delete.confirm", {
                  reference: application.trackingId,
                }),
                deleting: t("applications.delete.deleting"),
                error: t("applications.delete.error"),
              }}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
