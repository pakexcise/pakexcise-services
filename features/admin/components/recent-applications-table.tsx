import { getTranslations } from "next-intl/server";

import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
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
import type { AdminApplicationListItem } from "@/server/repositories/application-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type RecentApplicationsTableProps = {
  applications: AdminApplicationListItem[];
  title: string;
  emptyMessage: string;
  viewLabel: string;
};

export async function RecentApplicationsTable({
  applications,
  title,
  emptyMessage,
  viewLabel,
}: RecentApplicationsTableProps) {
  const locale = await getCurrentLocale();
  const t = await getTranslations("admin");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/applications">{viewLabel}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("applications.columns.trackingId")}</TableHead>
                <TableHead>{t("applications.columns.service")}</TableHead>
                <TableHead>{t("applications.columns.customer")}</TableHead>
                <TableHead>{t("applications.columns.status")}</TableHead>
                <TableHead>{t("applications.columns.created")}</TableHead>
                <TableHead className="text-right">{t("applications.columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-mono text-xs">
                    {application.trackingId}
                  </TableCell>
                  <TableCell>
                    {locale === "ur"
                      ? application.service.nameUr
                      : application.service.nameEn}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{application.user.name ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">
                        {application.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ApplicationStatusBadge
                      status={application.status}
                      label={t(getApplicationStatusLabelKey(application.status))}
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(application.createdAt, locale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/applications/${application.id}`}>
                        {t("applications.view")}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
