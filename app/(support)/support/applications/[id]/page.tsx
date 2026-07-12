import { copy, createT } from "@/messages";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { notFound } from "next/navigation";

import { SecureDocViewer } from "@/components/admin/SecureDocViewer";
import { supportApplicationsBasePath } from "@/config/support";
import { AdminNotesForm } from "@/features/admin/components/admin-notes-form";
import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { getAdminApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import {
  resolveAdminFieldDisplayValues,
  resolveCustomerContactDisplay,
} from "@/features/applications/lib/resolve-admin-display";
import { COMPLETION_PROOF_DOC_TYPE } from "@/config/uploads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatDate } from "@/lib/utils";
import { applicationRepository } from "@/server/repositories/application-repository";

import { getCurrentUser } from "@/server/auth/current-user";
import { roleHasPermission } from "@/server/permissions/roles";

import Link from "next/link";
type SupportApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SupportApplicationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = createT(copy.support.application);
  return {
    title: `${t("metaTitle")} ${id.slice(0, 8)}`,
    robots: { index: false, follow: false },
  };
}

export default async function SupportApplicationDetailPage({
  params,
}: SupportApplicationDetailPageProps) {
  const { id } = await params;
  const locale = "en";
  const t = createT(copy.support.application);
  const tAdmin = createT(copy.admin);

  const [application, user] = await Promise.all([
    applicationRepository.findAdminById(id),
    getCurrentUser(),
  ]);

  if (!application) {
    notFound();
  }

  const canManageNotes =
    user !== null && roleHasPermission(user.role, "application:notes");
  const canViewDocuments =
    user !== null && roleHasPermission(user.role, "documents:read");

  const customer = resolveCustomerContactDisplay({
    name: application.user.name,
    email: application.user.email,
    phone: application.user.phone,
    revealSensitive: false,
  });

  const fieldValues = resolveAdminFieldDisplayValues(application.fieldValues);
  const serviceName =
    application.service.nameEn;
  const regionName = application.service.region
    ? application.service.region.nameEn
    : "—";

  const applicantDocuments = application.documents.filter(
    (doc) => doc.type !== COMPLETION_PROOF_DOC_TYPE,
  );

  const viewerLabels = {
    loading: tAdmin("applications.detail.viewer.loading"),
    error: tAdmin("applications.detail.viewer.error"),
    retry: tAdmin("applications.detail.viewer.retry"),
    expiresIn: tAdmin("applications.detail.viewer.expiresIn"),
    unsupported: tAdmin("applications.detail.viewer.unsupported"),
    openNewTab: tAdmin("applications.detail.viewer.openNewTab"),
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            {application.trackingId}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={supportApplicationsBasePath}>{t("backToList")}</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{tAdmin("applications.detail.overview")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 sm:col-span-2">
              <span className="text-muted-foreground">
                {tAdmin("applications.columns.status")}
              </span>
              <ApplicationStatusBadge
                status={application.status}
                label={tAdmin(getAdminApplicationStatusLabelKey(application.status))}
              />
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {tAdmin("applications.columns.service")}
              </span>
              <span>{serviceName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {tAdmin("applications.detail.region")}
              </span>
              <span>{regionName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {tAdmin("applications.columns.created")}
              </span>
              <span>{formatDate(application.createdAt, locale)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t("updated")}</span>
              <span>{formatDate(application.updatedAt, locale)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tAdmin("applications.detail.customer")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {tAdmin("applications.detail.customerName")}
              </span>
              <span>{customer.name}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {tAdmin("applications.detail.customerEmail")}
              </span>
              <span>{customer.email}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {tAdmin("applications.detail.customerPhone")}
              </span>
              <span>{customer.phone}</span>
            </div>
            {customer.isMasked ? (
              <p className="text-xs text-muted-foreground">
                {tAdmin("applications.detail.sensitiveMasked")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tAdmin("applications.notes")}</CardTitle>
        </CardHeader>
        <CardContent>
          {canManageNotes ? (
            <AdminNotesForm
              applicationId={application.id}
              initialNotes={application.adminNotes ?? ""}
              labels={{
                save: tAdmin("applications.detail.notesSave"),
                saving: tAdmin("applications.detail.notesSaving"),
                saved: tAdmin("applications.detail.notesSaved"),
                error: tAdmin("applications.detail.notesError"),
                placeholder: tAdmin("applications.detail.notesPlaceholder"),
              }}
            />
          ) : (
            <p className="text-sm whitespace-pre-line text-muted-foreground">
              {application.adminNotes ?? tAdmin("applications.noNotes")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tAdmin("applications.detail.fieldValues")}</CardTitle>
        </CardHeader>
        <CardContent>
          {fieldValues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tAdmin("applications.detail.noFieldValues")}
            </p>
          ) : (
            <dl className="grid gap-3 sm:grid-cols-2">
              {fieldValues.map((field) => (
                <div key={field.fieldId} className="rounded-lg border p-3">
                  <dt className="text-xs text-muted-foreground">
                    {field.labelEn}
                  </dt>
                  <dd className="mt-1 text-sm font-medium">
                    {field.displayValue}
                  </dd>
                  {field.isMasked ? (
                    <Badge variant="outline" className="mt-2">
                      {tAdmin("applications.detail.protected")}
                    </Badge>
                  ) : null}
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      {canViewDocuments ? (
        <Card>
          <CardHeader>
            <CardTitle>{tAdmin("applications.detail.documents")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {applicantDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {tAdmin("applications.detail.noDocuments")}
              </p>
            ) : (
              applicantDocuments.map((document) => (
                <div key={document.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {document.requirement
                          ? document.requirement.labelEn
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
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{tAdmin("applications.statusHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {application.statusHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tAdmin("applications.noStatusHistory")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tAdmin("applications.columns.status")}</TableHead>
                  <TableHead>{tAdmin("applications.history.note")}</TableHead>
                  <TableHead>{tAdmin("applications.history.changedBy")}</TableHead>
                  <TableHead>{tAdmin("applications.columns.created")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {application.statusHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <ApplicationStatusBadge
                        status={entry.toStatus}
                        label={tAdmin(getAdminApplicationStatusLabelKey(entry.toStatus))}
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

      <p className="text-sm text-muted-foreground">{t("limitedAccessNote")}</p>
    </div>
  );
}
