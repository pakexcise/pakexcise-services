import type { GuestLeadStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

type ServiceOption = {
  id: string;
  nameEn: string;
  nameUr: string;
};

type SupportRequestFiltersProps = {
  currentStatus?: GuestLeadStatus;
  currentSearch?: string;
  currentServiceId?: string;
  currentSource?: string;
  currentDateFrom?: string;
  currentDateTo?: string;
  services: ServiceOption[];
  locale: string;
};

function buildFilterHref(input: {
  status?: GuestLeadStatus;
  search?: string;
  serviceId?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
}): string {
  const params = new URLSearchParams();

  if (input.status) params.set("status", input.status);
  if (input.search?.trim()) params.set("q", input.search.trim());
  if (input.serviceId) params.set("serviceId", input.serviceId);
  if (input.source) params.set("source", input.source);
  if (input.dateFrom) params.set("dateFrom", input.dateFrom);
  if (input.dateTo) params.set("dateTo", input.dateTo);

  const query = params.toString();
  return query ? `/admin/guest-leads?${query}` : "/admin/guest-leads";
}

export async function SupportRequestFilters({
  currentStatus,
  currentSearch,
  currentServiceId,
  currentSource,
  currentDateFrom,
  currentDateTo,
  services,
  locale,
}: SupportRequestFiltersProps) {
  const t = await getTranslations("admin.guestLeads");

  const shared = {
    status: currentStatus,
    serviceId: currentServiceId,
    source: currentSource,
    dateFrom: currentDateFrom,
    dateTo: currentDateTo,
  };

  return (
    <form
      method="get"
      className="rounded-xl border bg-card p-4"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="space-y-1.5 xl:col-span-2">
          <label htmlFor="sr-search" className="text-sm font-medium">
            {t("filters.search")}
          </label>
          <Input
            id="sr-search"
            name="q"
            defaultValue={currentSearch ?? ""}
            placeholder={t("searchPlaceholder")}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sr-status" className="text-sm font-medium">
            {t("columns.status")}
          </label>
          <select
            id="sr-status"
            name="status"
            defaultValue={currentStatus ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("allStatuses")}</option>
            {(
              [
                "NEW",
                "CONTACTED",
                "IN_PROGRESS",
                "CONVERTED",
                "CLOSED",
                "SPAM",
              ] as const
            ).map((value) => (
              <option key={value} value={value}>
                {t(`status.${value}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sr-service" className="text-sm font-medium">
            {t("columns.service")}
          </label>
          <select
            id="sr-service"
            name="serviceId"
            defaultValue={currentServiceId ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("filters.allServices")}</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {locale === "ur" ? service.nameUr : service.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sr-source" className="text-sm font-medium">
            {t("columns.source")}
          </label>
          <select
            id="sr-source"
            name="source"
            defaultValue={currentSource ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("filters.allSources")}</option>
            <option value="GUEST_FORM">{t("source.GUEST_FORM")}</option>
            <option value="WHATSAPP">{t("source.WHATSAPP")}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sr-date-from" className="text-sm font-medium">
            {t("filters.dateFrom")}
          </label>
          <Input
            id="sr-date-from"
            name="dateFrom"
            type="date"
            defaultValue={currentDateFrom ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sr-date-to" className="text-sm font-medium">
            {t("filters.dateTo")}
          </label>
          <Input
            id="sr-date-to"
            name="dateTo"
            type="date"
            defaultValue={currentDateTo ?? ""}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit">{t("filters.apply")}</Button>
        <Button asChild type="button" variant="outline">
          <Link href="/admin/guest-leads">{t("filters.reset")}</Link>
        </Button>
        {currentStatus ? (
          <Button asChild type="button" variant="ghost" size="sm">
            <Link href={buildFilterHref({ ...shared })}>
              {t("filters.clearStatus")}
            </Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
