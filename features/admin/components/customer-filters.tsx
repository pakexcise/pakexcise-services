import type { UserStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

type CustomerFiltersProps = {
  currentStatus?: UserStatus;
  currentSearch?: string;
};

function buildHref(input: {
  status?: UserStatus;
  search?: string;
}): string {
  const params = new URLSearchParams();

  if (input.status) {
    params.set("status", input.status);
  }

  if (input.search?.trim()) {
    params.set("q", input.search.trim());
  }

  const query = params.toString();
  return query ? `/admin/customers?${query}` : "/admin/customers";
}

const statuses: UserStatus[] = ["ACTIVE", "PENDING", "DISABLED", "SUSPENDED"];

export async function CustomerFilters({
  currentStatus,
  currentSearch,
}: CustomerFiltersProps) {
  const t = await getTranslations("admin.customers");

  return (
    <form
      action="/admin/customers"
      method="get"
      className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:flex-wrap md:items-end"
    >
      <div className="min-w-[220px] flex-1 space-y-2">
        <label htmlFor="customer-search" className="text-sm font-medium">
          {t("filters.search")}
        </label>
        <Input
          id="customer-search"
          name="q"
          defaultValue={currentSearch ?? ""}
          placeholder={t("filters.searchPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="customer-status" className="text-sm font-medium">
          {t("filters.status")}
        </label>
        <select
          id="customer-status"
          name="status"
          defaultValue={currentStatus ?? ""}
          className="flex h-10 w-full min-w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("filters.allStatuses")}</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {t(`status.${status}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit">{t("filters.apply")}</Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/customers">{t("filters.reset")}</Link>
        </Button>
      </div>
    </form>
  );
}
