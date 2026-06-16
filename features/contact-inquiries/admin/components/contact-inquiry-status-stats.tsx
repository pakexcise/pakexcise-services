import type { ContactInquiryStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";

import { contactInquiryRepository } from "@/server/repositories/contact-inquiry-repository";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const statStatuses = [
  "NEW",
  "CONTACTED",
  "CLOSED",
  "SPAM",
] as const satisfies readonly ContactInquiryStatus[];

type ContactInquiryStatusStatsProps = {
  currentStatus?: ContactInquiryStatus;
  searchParams?: Record<string, string | undefined>;
};

function buildHref(
  status: ContactInquiryStatus | undefined,
  searchParams?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.serviceInterest) {
    params.set("serviceInterest", searchParams.serviceInterest);
  }
  if (searchParams?.dateFrom) params.set("dateFrom", searchParams.dateFrom);
  if (searchParams?.dateTo) params.set("dateTo", searchParams.dateTo);

  const query = params.toString();
  return query ? `/admin/contact-inquiries?${query}` : "/admin/contact-inquiries";
}

export async function ContactInquiryStatusStats({
  currentStatus,
  searchParams,
}: ContactInquiryStatusStatsProps) {
  const t = await getTranslations("admin.contactInquiries");
  const counts = await contactInquiryRepository.countByStatus();
  const total = statStatuses.reduce(
    (sum, status) => sum + (counts[status] ?? 0),
    0,
  );

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
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
