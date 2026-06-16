import type { ContactInquiryStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

type ServiceOption = {
  slug: string;
  nameEn: string;
  nameUr: string;
};

type ContactInquiryFiltersProps = {
  currentStatus?: ContactInquiryStatus;
  currentSearch?: string;
  currentServiceInterest?: string;
  currentDateFrom?: string;
  currentDateTo?: string;
  services: ServiceOption[];
  locale: string;
};

export async function ContactInquiryFilters({
  currentStatus,
  currentSearch,
  currentServiceInterest,
  currentDateFrom,
  currentDateTo,
  services,
  locale,
}: ContactInquiryFiltersProps) {
  const t = await getTranslations("admin.contactInquiries");

  return (
    <form method="get" className="rounded-xl border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-1.5 xl:col-span-2">
          <label htmlFor="ci-search" className="text-sm font-medium">
            {t("filters.search")}
          </label>
          <Input
            id="ci-search"
            name="q"
            defaultValue={currentSearch ?? ""}
            placeholder={t("searchPlaceholder")}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ci-status" className="text-sm font-medium">
            {t("columns.status")}
          </label>
          <select
            id="ci-status"
            name="status"
            defaultValue={currentStatus ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("allStatuses")}</option>
            {(["NEW", "CONTACTED", "CLOSED", "SPAM"] as const).map((value) => (
              <option key={value} value={value}>
                {t(`status.${value}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ci-service" className="text-sm font-medium">
            {t("columns.service")}
          </label>
          <select
            id="ci-service"
            name="serviceInterest"
            defaultValue={currentServiceInterest ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("filters.allServices")}</option>
            <option value="other">{t("filters.otherService")}</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {locale === "ur" ? service.nameUr : service.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ci-date-from" className="text-sm font-medium">
            {t("filters.dateFrom")}
          </label>
          <Input
            id="ci-date-from"
            name="dateFrom"
            type="date"
            defaultValue={currentDateFrom ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ci-date-to" className="text-sm font-medium">
            {t("filters.dateTo")}
          </label>
          <Input
            id="ci-date-to"
            name="dateTo"
            type="date"
            defaultValue={currentDateTo ?? ""}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit">{t("filters.apply")}</Button>
        <Button asChild type="button" variant="outline">
          <Link href="/admin/contact-inquiries">{t("filters.reset")}</Link>
        </Button>
      </div>
    </form>
  );
}
