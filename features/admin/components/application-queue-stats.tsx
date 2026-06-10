import type { ApplicationStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";

import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { applicationRepository } from "@/server/repositories/application-repository";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ApplicationQueueStatsProps = {
  currentStatus?: ApplicationStatus;
  searchParams?: Record<string, string | undefined>;
  applicationsBasePath?: string;
};

function buildStatusHref(
  status: ApplicationStatus | undefined,
  searchParams?: Record<string, string | undefined>,
  applicationsBasePath = "/admin/applications",
): string {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (searchParams?.q) {
    params.set("q", searchParams.q);
  }

  if (searchParams?.serviceId) {
    params.set("serviceId", searchParams.serviceId);
  }

  if (searchParams?.dateFrom) {
    params.set("dateFrom", searchParams.dateFrom);
  }

  if (searchParams?.dateTo) {
    params.set("dateTo", searchParams.dateTo);
  }

  const query = params.toString();
  return query
    ? `${applicationsBasePath}?${query}`
    : applicationsBasePath;
}

const statStatuses: ApplicationStatus[] = [
  "SUBMITTED",
  "REVIEW",
  "DOCS_REQUIRED",
  "INVOICE_SENT",
  "PAYMENT_UPLOADED",
  "PAYMENT_VERIFIED",
  "IN_PROGRESS",
  "AT_OFFICE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
];

export async function ApplicationQueueStats({
  currentStatus,
  searchParams,
  applicationsBasePath = "/admin/applications",
}: ApplicationQueueStatsProps) {
  const t = await getTranslations("admin");
  const counts = await applicationRepository.getAdminPipelineStatusCounts();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <Link
        href={buildStatusHref(undefined, searchParams, applicationsBasePath)}
        className={cn(
          "rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50",
          !currentStatus && "border-primary bg-primary/5",
        )}
      >
        <p className="text-xs text-muted-foreground">
          {t("applications.stats.all")}
        </p>
        <p className="text-lg font-semibold">
          {statStatuses.reduce(
            (sum, status) => sum + (counts[status] ?? 0),
            0,
          )}
        </p>
      </Link>

      {statStatuses.map((status) => (
        <Link
          key={status}
          href={buildStatusHref(status, searchParams, applicationsBasePath)}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50",
            currentStatus === status && "border-primary bg-primary/5",
          )}
        >
          <p className="truncate text-xs text-muted-foreground">
            {t(getApplicationStatusLabelKey(status))}
          </p>
          <p className="text-lg font-semibold">{counts[status] ?? 0}</p>
        </Link>
      ))}
    </div>
  );
}
