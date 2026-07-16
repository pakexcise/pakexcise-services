import "server-only";

import { absoluteUrl } from "@/lib/utils";

import type { NotificationLocale } from "@/features/notifications/types";

export function buildCustomerApplicationPath(
  _locale: NotificationLocale,
  applicationId: string,
): string {
  void _locale;
  return `/customer/applications/${applicationId}`;
}

export function buildCustomerDashboardPath(_locale: NotificationLocale): string {
  void _locale;
  return `/customer/dashboard`;
}

export function buildTrackPath(_locale: NotificationLocale): string {
  void _locale;
  return `/track`;
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
    applicationUrl: absoluteUrl(
      buildCustomerApplicationPath(locale, applicationId),
    ),
    dashboardUrl: absoluteUrl(buildCustomerDashboardPath(locale)),
    trackUrl: absoluteUrl(buildTrackPath(locale)),
  };
}
