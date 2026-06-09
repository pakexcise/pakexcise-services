import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { SecureDocViewer } from "@/components/admin/SecureDocViewer";
import { StatusManager } from "@/components/admin/StatusManager";
import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { AdminNotesForm } from "@/features/admin/components/admin-notes-form";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { ProofUploadSection } from "@/features/admin/components/proof-upload-section";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { getAllowedNextStatuses } from "@/features/applications/status-machine";
import {
  resolveAdminFieldDisplayValues,
  resolveCustomerContactDisplay,
} from "@/features/applications/lib/resolve-admin-display";
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
import { applicationRepository } from "@/server/repositories/application-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { getCurrentUser } from "@/server/auth/current-user";
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

  const [application, user] = await Promise.all([
    applicationRepository.findAdminById(id),
    getCurrentUser(),
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

  const statusLabels = Object.fromEntries(
    application.statusHistory
      .flatMap((entry) => [entry.fromStatus, entry.toStatus])
      .filter(Boolean)
      .map((status) => [status, t(getApplicationStatusLabelKey(status!))]),
  ) as Record<string, string>;

  for (const status of getAllowedNextStatuses(application.status)) {
    statusLabels[status] = t(getApplicationStatusLabelKey(status));
  }
  statusLabels[application.status] = t(
    getApplicationStatusLabelKey(application.status),
  );

  const customer = resolveCustomerContactDisplay({
    name: application.user.name,
    email: application.user.email,
    phone: application.user.phone,
    revealSensitive: false,
  });

  const fieldValues = resolveAdminFieldDisplayValues(application.fieldValues);
  const serviceName =
    locale === "ur"
      ? application.service.nameUr
      : application.service.nameEn;
  const regionName =
    locale === "ur"
      ? application.service.region.nameUr
      : application.service.region.nameEn;

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
      <AdminPageHeader
        title={t("applications.detailTitle")}
        description={application.trackingId}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/applications">
              {t("applications.backToList")}
            </Link>
          </Button>
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
                label={t(getApplicationStatusLabelKey(application.status))}
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
                hasProof={Boolean(completionProof)}
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
                  purpose="view"
                  labels={viewerLabels}
                />
              </div>
            ) : null}
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
                      {t("applications.detail.invoiceTotal")}: {invoice.currency}{" "}
                      {invoice.total.toString()}
                    </p>
                    {invoice.lineItems.length > 0 ? (
                      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {invoice.lineItems.map((item) => (
                          <li key={item.id}>
                            {item.label} — {invoice.currency} {item.amount.toString()}
                            {item.isOfficialFee
                              ? ` (${t("applications.detail.officialFee")})`
                              : ""}
                          </li>
                        ))}
                      </ul>
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
                      {t("applications.detail.paymentAmount")}: PKR{" "}
                      {payment.amount.toString()}
                    </p>
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
                        label={t(getApplicationStatusLabelKey(entry.toStatus))}
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
    </div>
  );
}
