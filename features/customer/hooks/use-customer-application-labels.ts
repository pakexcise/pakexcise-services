"use client";

import { copy, createT } from "@/messages";

import type { ApplicationStatus } from "@prisma/client";

import { useTranslations } from "@/lib/i18n/t";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import type { CustomerNextAction } from "@/features/customer/lib/next-action";
import { formatDateTime } from "@/lib/utils";

export function useCustomerApplicationLabels() {
  const tStatus = createT(copy.admin.statuses);
  const tNextAction = createT(copy.customer.nextAction);

  const resolveStatusLabel = (status: ApplicationStatus | string): string => {
    try {
      return tStatus(getApplicationStatusLabelKey(status as ApplicationStatus));
    } catch {
      return String(status);
    }
  };

  const resolveNextActionLabel = (action: CustomerNextAction | string): string => {
    try {
      return tNextAction(action as CustomerNextAction);
    } catch {
      return String(action);
    }
  };

  const formatUpdatedAt = (iso: string): string => {
    try {
      return formatDateTime(iso, "en");
    } catch {
      return iso;
    }
  };

  return {
    locale: "en" as const,
    resolveStatusLabel,
    resolveNextActionLabel,
    formatUpdatedAt,
  };
}
