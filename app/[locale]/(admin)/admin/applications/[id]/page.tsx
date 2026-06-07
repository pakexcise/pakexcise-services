import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { adminMetadata } from "@/features/admin/lib/metadata";
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
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { applicationRepository } from "@/server/repositories/application-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

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

  const application = await applicationRepository.findAdminById(id);

  if (!application) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("applications.detailTitle")}
        description={application.trackingId}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/applications">{t("applications.backToList")}</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("applications.overview")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t("applications.columns.status")}</span>
              <ApplicationStatusBadge
                status={application.status}
                label={t(getApplicationStatusLabelKey(application.status))}
              />
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t("applications.columns.service")}</span>
              <span>
                {locale === "ur"
                  ? application.service.nameUr
                  : application.service.nameEn}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t("applications.columns.customer")}</span>
              <span>{application.user.name ?? application.user.email}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t("applications.columns.created")}</span>
              <span>{formatDate(application.createdAt, locale)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("applications.notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {application.adminNotes ?? t("applications.noNotes")}
            </p>
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
                    <TableCell>{formatDate(entry.createdAt, locale)}</TableCell>
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
