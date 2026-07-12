import { copy, createT } from "@/messages";
import type { AgentApprovalStatus } from "@prisma/client";
import { getTranslations } from "@/lib/i18n/t";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
type AgentFiltersProps = {
  currentStatus?: AgentApprovalStatus;
  currentSearch?: string;
};

function buildHref(input: {
  status?: AgentApprovalStatus;
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
  return query ? `/admin/agents?${query}` : "/admin/agents";
}

const statuses: AgentApprovalStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export async function AgentFilters({
  currentStatus,
  currentSearch,
}: AgentFiltersProps) {
  const t = createT(copy.admin.agents);

  return (
    <form
      action="/admin/agents"
      method="get"
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:flex-wrap md:items-end"
    >
      <div className="min-w-[220px] flex-1 space-y-2">
        <label htmlFor="agent-search" className="text-sm font-medium">
          {t("filters.search")}
        </label>
        <Input
          id="agent-search"
          name="q"
          defaultValue={currentSearch ?? ""}
          placeholder={t("filters.searchPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="agent-status" className="text-sm font-medium">
          {t("filters.approvalStatus")}
        </label>
        <select
          id="agent-status"
          name="status"
          defaultValue={currentStatus ?? ""}
          className="flex h-10 w-full min-w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("filters.allStatuses")}</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {t(`approvalStatus.${status}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit">{t("filters.apply")}</Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/agents">{t("filters.reset")}</Link>
        </Button>
      </div>
    </form>
  );
}
