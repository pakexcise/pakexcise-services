import { getTranslations } from "next-intl/server";

import { applicationStatusOrder } from "@/features/admin/lib/application-status";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import type { ApplicationStatus } from "@prisma/client";

type ApplicationFiltersProps = {
  currentStatus?: ApplicationStatus;
  currentSearch?: string;
};

function buildFilterHref(
  status?: ApplicationStatus,
  search?: string,
): string {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (search?.trim()) {
    params.set("q", search.trim());
  }

  const query = params.toString();
  return query ? `/admin/applications?${query}` : "/admin/applications";
}

export async function ApplicationFilters({
  currentStatus,
  currentSearch,
}: ApplicationFiltersProps) {
  const t = await getTranslations("admin");

  return (
    <div className="space-y-4">
      <form action="/admin/applications" method="get" className="flex gap-2">
        <Input
          name="q"
          defaultValue={currentSearch ?? ""}
          placeholder={t("applications.searchPlaceholder")}
          className="max-w-md"
        />
        {currentStatus ? (
          <input type="hidden" name="status" value={currentStatus} />
        ) : null}
        <Button type="submit" variant="secondary">
          {t("search")}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Button
          asChild
          size="sm"
          variant={currentStatus ? "outline" : "default"}
        >
          <Link href={buildFilterHref(undefined, currentSearch)}>
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
            <Link href={buildFilterHref(status, currentSearch)}>
              {t(getApplicationStatusLabelKey(status))}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
