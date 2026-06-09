import { getTranslations } from "next-intl/server";
import type { ApplicationStatus } from "@prisma/client";

import { applicationStatusOrder } from "@/features/admin/lib/application-status";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

type ServiceOption = {
  id: string;
  nameEn: string;
  nameUr: string;
};

type ApplicationFiltersProps = {
  currentStatus?: ApplicationStatus;
  currentSearch?: string;
  currentServiceId?: string;
  currentDateFrom?: string;
  currentDateTo?: string;
  services: ServiceOption[];
  locale: string;
};

function buildFilterHref(input: {
  status?: ApplicationStatus;
  search?: string;
  serviceId?: string;
  dateFrom?: string;
  dateTo?: string;
}): string {
  const params = new URLSearchParams();

  if (input.status) {
    params.set("status", input.status);
  }

  if (input.search?.trim()) {
    params.set("q", input.search.trim());
  }

  if (input.serviceId) {
    params.set("serviceId", input.serviceId);
  }

  if (input.dateFrom) {
    params.set("dateFrom", input.dateFrom);
  }

  if (input.dateTo) {
    params.set("dateTo", input.dateTo);
  }

  const query = params.toString();
  return query ? `/admin/applications?${query}` : "/admin/applications";
}

export async function ApplicationFilters({
  currentStatus,
  currentSearch,
  currentServiceId,
  currentDateFrom,
  currentDateTo,
  services,
  locale,
}: ApplicationFiltersProps) {
  const t = await getTranslations("admin");

  const sharedParams = {
    search: currentSearch,
    serviceId: currentServiceId,
    dateFrom: currentDateFrom,
    dateTo: currentDateTo,
  };

  return (
    <div className="space-y-4">
      <form action="/admin/applications" method="get" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          name="q"
          defaultValue={currentSearch ?? ""}
          placeholder={t("applications.searchPlaceholder")}
        />
        <select
          name="serviceId"
          defaultValue={currentServiceId ?? ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">{t("applications.filters.allServices")}</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {locale === "ur" ? service.nameUr : service.nameEn}
            </option>
          ))}
        </select>
        <Input
          type="date"
          name="dateFrom"
          defaultValue={currentDateFrom ?? ""}
          aria-label={t("applications.filters.dateFrom")}
        />
        <Input
          type="date"
          name="dateTo"
          defaultValue={currentDateTo ?? ""}
          aria-label={t("applications.filters.dateTo")}
        />
        {currentStatus ? (
          <input type="hidden" name="status" value={currentStatus} />
        ) : null}
        <div className="flex gap-2 md:col-span-2 xl:col-span-4">
          <Button type="submit" variant="secondary">
            {t("search")}
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/applications">{t("applications.filters.reset")}</Link>
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <Button
          asChild
          size="sm"
          variant={currentStatus ? "outline" : "default"}
        >
          <Link href={buildFilterHref(sharedParams)}>
            {t("applications.filters.all")}
          </Link>
        </Button>
        {applicationStatusOrder.map((status) => (
          <Button
            key={status}
            asChild
            size="sm"
            variant={currentStatus === status ? "default" : "outline"}
          >
            <Link
              href={buildFilterHref({
                ...sharedParams,
                status,
              })}
            >
              {t(getApplicationStatusLabelKey(status))}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
