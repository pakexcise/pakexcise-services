"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";

import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import type { CustomerNextAction } from "@/features/customer/lib/next-action";
import { formatDateTime } from "@/lib/utils";

export function useCustomerApplicationLabels() {
  const locale = useLocale();
  const tStatus = useTranslations("admin.statuses");
  const tNextAction = useTranslations("customer.nextAction");

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
      return formatDateTime(iso, locale);
    } catch {
      return iso;
    }
  };

  return {
    locale,
    resolveStatusLabel,
    resolveNextActionLabel,
    formatUpdatedAt,
  };
}
