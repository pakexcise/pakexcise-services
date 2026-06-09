import "server-only";

import { absoluteUrl } from "@/lib/utils";

import type { NotificationLocale } from "@/features/notifications/types";

export function buildCustomerApplicationPath(
  locale: NotificationLocale,
  applicationId: string,
): string {
  return `/${locale}/customer/applications/${applicationId}`;
}

export function buildCustomerDashboardPath(locale: NotificationLocale): string {
  return `/${locale}/customer/dashboard`;
}

export function buildTrackPath(locale: NotificationLocale): string {
  return `/${locale}/track`;
}

export function buildSignedCustomerLinks(
  locale: NotificationLocale,
  applicationId: string,
): {
  applicationUrl: string;
  dashboardUrl: string;
  trackUrl: string;
} {
  return {
    applicationUrl: absoluteUrl(buildCustomerApplicationPath(locale, applicationId)),
    dashboardUrl: absoluteUrl(buildCustomerDashboardPath(locale)),
    trackUrl: absoluteUrl(buildTrackPath(locale)),
  };
}
