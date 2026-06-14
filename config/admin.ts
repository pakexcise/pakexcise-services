import type { ApplicationStatus } from "@prisma/client";

import type { Permission } from "@/server/permissions/roles";

export type AdminNavItem = {
  href: string;
  labelKey: string;
  icon: string;
  /** When set, the nav item is shown only if the user has this permission. */
  permission?: Permission;
};

export const dashboardStatusCards = [
  { key: "total", statuses: null },
  { key: "review", statuses: ["REVIEW"] as ApplicationStatus[] },
  { key: "docsRequired", statuses: ["DOCS_REQUIRED"] as ApplicationStatus[] },
  { key: "invoiceSent", statuses: ["INVOICE_SENT"] as ApplicationStatus[] },
  { key: "paymentUploaded", statuses: ["PAYMENT_UPLOADED"] as ApplicationStatus[] },
  { key: "paymentVerified", statuses: ["PAYMENT_VERIFIED"] as ApplicationStatus[] },
  { key: "inProgress", statuses: ["IN_PROGRESS", "AT_OFFICE"] as ApplicationStatus[] },
  { key: "completed", statuses: ["COMPLETED"] as ApplicationStatus[] },
  {
    key: "rejectedCancelled",
    statuses: ["REJECTED", "CANCELLED"] as ApplicationStatus[],
  },
] as const;

export const adminDefaultPageSize = 20;

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin/dashboard", labelKey: "dashboard", icon: "layout-dashboard" },
  {
    href: "/admin/applications",
    labelKey: "applications",
    icon: "file-stack",
    permission: "application:read",
  },
  {
    href: "/admin/services",
    labelKey: "services",
    icon: "briefcase",
    permission: "service:manage",
  },
  {
    href: "/admin/regions",
    labelKey: "regions",
    icon: "map-pin",
    permission: "region:manage",
  },
  {
    href: "/admin/faqs",
    labelKey: "faqs",
    icon: "help-circle",
    permission: "faq:manage",
  },
  {
    href: "/admin/social",
    labelKey: "social",
    icon: "share-2",
    permission: "social:manage",
  },
  {
    href: "/admin/payment-methods",
    labelKey: "paymentMethods",
    icon: "credit-card",
    permission: "payment-method:manage",
  },
  {
    href: "/admin/agents",
    labelKey: "agents",
    icon: "users",
    permission: "agents:manage",
  },
  {
    href: "/admin/agent-payouts",
    labelKey: "agentPayouts",
    icon: "wallet",
    permission: "agents:manage",
  },
  {
    href: "/admin/customers",
    labelKey: "customers",
    icon: "user-circle",
    permission: "application:read",
  },
  {
    href: "/admin/notifications",
    labelKey: "notifications",
    icon: "bell",
    permission: "application:read",
  },
  {
    href: "/admin/seo",
    labelKey: "seo",
    icon: "search",
    permission: "platform:manage",
  },
  {
    href: "/admin/redirects",
    labelKey: "redirects",
    icon: "arrow-right-left",
    permission: "platform:manage",
  },
  {
    href: "/admin/blog",
    labelKey: "blog",
    icon: "newspaper",
    permission: "content:manage",
  },
  {
    href: "/admin/guides",
    labelKey: "guides",
    icon: "book-open",
    permission: "platform:manage",
  },
  {
    href: "/admin/audit-logs",
    labelKey: "auditLogs",
    icon: "shield",
    permission: "audit:read",
  },
  {
    href: "/admin/users",
    labelKey: "users",
    icon: "user-cog",
    permission: "users:manage",
  },
  {
    href: "/admin/settings",
    labelKey: "settings",
    icon: "settings",
    permission: "settings:manage",
  },
];

export function getAdminNavForPermissions(
  effectivePermissions: readonly Permission[],
): AdminNavItem[] {
  const permissionSet = new Set(effectivePermissions);

  return adminNavItems.filter((item) => {
    if (!item.permission) {
      return true;
    }

    return permissionSet.has(item.permission);
  });
}
