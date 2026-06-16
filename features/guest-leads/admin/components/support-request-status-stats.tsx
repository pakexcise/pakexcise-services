import type { GuestLeadStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";

import { guestLeadRepository } from "@/server/repositories/guest-lead-repository";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const statStatuses = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
  "SPAM",
] as const satisfies readonly GuestLeadStatus[];

type SupportRequestStatusStatsProps = {
  currentStatus?: GuestLeadStatus;
  searchParams?: Record<string, string | undefined>;
};

function buildHref(
  status: GuestLeadStatus | undefined,
  searchParams?: Record<string, string | undefined>,
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

  if (searchParams?.source) {
    params.set("source", searchParams.source);
  }

  if (searchParams?.dateFrom) {
    params.set("dateFrom", searchParams.dateFrom);
  }

  if (searchParams?.dateTo) {
    params.set("dateTo", searchParams.dateTo);
  }

  const query = params.toString();
  return query ? `/admin/guest-leads?${query}` : "/admin/guest-leads";
}

export async function SupportRequestStatusStats({
  currentStatus,
  searchParams,
}: SupportRequestStatusStatsProps) {
  const t = await getTranslations("admin.guestLeads");
  const counts = await guestLeadRepository.countByStatus();
  const total = statStatuses.reduce(
    (sum, status) => sum + (counts[status] ?? 0),
    0,
  );

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
      <Link
        href={buildHref(undefined, searchParams)}
        className={cn(
          "rounded-xl border bg-card px-3 py-2.5 transition-colors hover:bg-muted/40",
          !currentStatus && "border-primary/50 bg-primary/5",
        )}
      >
        <p className="text-xs text-muted-foreground">{t("stats.all")}</p>
        <p className="text-xl font-semibold tabular-nums">{total}</p>
      </Link>

      {statStatuses.map((status) => (
        <Link
          key={status}
          href={buildHref(status, searchParams)}
          className={cn(
            "rounded-xl border bg-card px-3 py-2.5 transition-colors hover:bg-muted/40",
            currentStatus === status && "border-primary/50 bg-primary/5",
          )}
        >
          <p className="truncate text-xs text-muted-foreground">
            {t(`status.${status}`)}
          </p>
          <p className="text-xl font-semibold tabular-nums">
            {counts[status] ?? 0}
          </p>
        </Link>
      ))}
    </div>
  );
}
