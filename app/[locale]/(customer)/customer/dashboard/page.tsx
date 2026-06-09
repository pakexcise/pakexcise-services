import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { StatCard } from "@/features/admin/components/stat-card";
import { NextActionBadge } from "@/components/customer/NextActionBadge";
import {
  resolveCustomerNextAction,
} from "@/features/customer/lib/next-action";
import { customerDashboardStatusCards } from "@/config/customer";
import { Button } from "@/components/ui/button";
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
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { customerApplicationRepository } from "@/server/repositories/customer-application-repository";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customer.dashboard");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function CustomerDashboardPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("customer.dashboard");
  const tStatus = await getTranslations("admin.statuses");
  const tNextAction = await getTranslations("customer.nextAction");
  const user = await getCurrentUser();

  const [applications, statusCounts] = user
    ? await Promise.all([
        customerApplicationRepository.listForUser(user.id),
        customerApplicationRepository.getStatusCountsForUser(user.id),
      ])
    : [[], { total: 0, actionRequired: 0, inProgress: 0, completed: 0, closed: 0 }];

  const statusCardValues: Record<string, number> = {
    total: statusCounts.total,
    actionRequired: statusCounts.actionRequired,
    inProgress: statusCounts.inProgress,
    completed: statusCounts.completed,
    closed: statusCounts.closed,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("welcome", { name: user?.name ?? user?.email ?? "" })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {customerDashboardStatusCards.map((card) => (
          <StatCard
            key={card.key}
            title={t(`statusCards.${card.key}`)}
            value={statusCardValues[card.key] ?? 0}
          />
        ))}
      </div>

      <div className="rounded-xl border">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="font-semibold">{t("applicationsTitle")}</h2>
        </div>
        {applications.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            {t("applicationsEmpty")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.trackingId")}</TableHead>
                <TableHead>{t("columns.service")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.nextAction")}</TableHead>
                <TableHead>{t("columns.updated")}</TableHead>
                <TableHead className="text-end">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => {
                const serviceName =
                  locale === "ur"
                    ? application.service.nameUr
                    : application.service.nameEn;

                const payment = application.payments[0] ?? null;
                const nextAction = resolveCustomerNextAction({
                  status: application.status,
                  hasInvoice: application.invoices.length > 0,
                  paymentStatus: payment?.status ?? null,
                  hasCompletionProof: application.documents.length > 0,
                });

                return (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium font-mono text-sm">
                      {application.trackingId}
                    </TableCell>
                    <TableCell>{serviceName}</TableCell>
                    <TableCell>
                      <ApplicationStatusBadge
                        status={application.status}
                        label={tStatus(
                          getApplicationStatusLabelKey(application.status),
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <NextActionBadge
                        action={nextAction}
                        label={tNextAction(nextAction)}
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(application.updatedAt, locale)}
                    </TableCell>
                    <TableCell className="text-end">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/customer/applications/${application.id}`}>
                          {t("viewApplication")}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">{t("trackTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("trackDescription")}
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/track">{t("trackCta")}</Link>
          </Button>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">{t("servicesTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("servicesDescription")}
          </p>
          <Button asChild className="mt-4">
            <Link href="/services">{t("servicesCta")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
