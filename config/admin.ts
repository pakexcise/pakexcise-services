import type { ApplicationStatus } from "@prisma/client";

import type { Permission } from "@/server/permissions/roles";

export type AdminNavSection =
  | "overview"
  | "operations"
  | "catalog"
  | "content"
  | "people"
  | "platform"
  | "system";

export type AdminNavItem = {
  href: string;
  labelKey: string;
  icon: string;
  section?: AdminNavSection;
  /** When set, the nav item is shown only if the user has this permission. */
  permission?: Permission;
  /** When true, only Super Admin users see this nav item. */
  superAdminOnly?: boolean;
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
  {
    href: "/admin/dashboard",
    labelKey: "dashboard",
    icon: "layout-dashboard",
    section: "overview",
  },
  {
    href: "/admin/applications",
    labelKey: "applications",
    icon: "file-stack",
    section: "operations",
    permission: "application:read",
  },
  {
    href: "/admin/guest-leads",
    labelKey: "supportRequests",
    icon: "message-square",
    section: "operations",
    permission: "application:read",
  },
  {
    href: "/admin/contact-inquiries",
    labelKey: "contactInquiries",
    icon: "mail",
    section: "operations",
    permission: "application:read",
  },
  {
    href: "/admin/customers",
    labelKey: "customers",
    icon: "user-circle",
    section: "operations",
    permission: "application:read",
  },
  {
    href: "/admin/notifications",
    labelKey: "notifications",
    icon: "bell",
    section: "operations",
    permission: "application:read",
  },
  {
    href: "/admin/services",
    labelKey: "services",
    icon: "briefcase",
    section: "catalog",
    permission: "service:manage",
  },
  {
    href: "/admin/service-categories",
    labelKey: "serviceCategories",
    icon: "layers",
    section: "catalog",
    permission: "service:manage",
  },
  {
    href: "/admin/regions",
    labelKey: "regions",
    icon: "map-pin",
    section: "catalog",
    permission: "region:manage",
  },
  {
    href: "/admin/cities",
    labelKey: "cities",
    icon: "building-2",
    section: "catalog",
    permission: "region:manage",
  },
  {
    href: "/admin/document-requirements",
    labelKey: "documentRequirements",
    icon: "file-text",
    section: "catalog",
    permission: "service:manage",
  },
  {
    href: "/admin/service-availability",
    labelKey: "serviceAvailability",
    icon: "globe",
    section: "catalog",
    permission: "service:manage",
  },
  {
    href: "/admin/faqs",
    labelKey: "faqs",
    icon: "help-circle",
    section: "content",
    permission: "faq:manage",
  },
  {
    href: "/admin/social",
    labelKey: "social",
    icon: "share-2",
    section: "content",
    permission: "social:manage",
  },
  {
    href: "/admin/blog",
    labelKey: "blog",
    icon: "newspaper",
    section: "content",
    permission: "content:manage",
  },
  {
    href: "/admin/guides",
    labelKey: "guides",
    icon: "book-open",
    section: "content",
    permission: "platform:manage",
  },
  {
    href: "/admin/home-page",
    labelKey: "homePage",
    icon: "home",
    section: "content",
    permission: "settings:manage",
  },
  {
    href: "/admin/contact-page",
    labelKey: "contactPage",
    icon: "contact",
    section: "content",
    permission: "settings:manage",
  },
  {
    href: "/admin/agents",
    labelKey: "agents",
    icon: "users",
    section: "people",
    permission: "agents:manage",
  },
  {
    href: "/admin/agent-payouts",
    labelKey: "agentPayouts",
    icon: "wallet",
    section: "people",
    permission: "agents:manage",
  },
  {
    href: "/admin/payment-methods",
    labelKey: "paymentMethods",
    icon: "credit-card",
    section: "platform",
    permission: "payment-method:manage",
  },
  {
    href: "/admin/seo",
    labelKey: "seo",
    icon: "search",
    section: "platform",
    permission: "platform:manage",
  },
  {
    href: "/admin/redirects",
    labelKey: "redirects",
    icon: "arrow-right-left",
    section: "platform",
    permission: "platform:manage",
  },
  {
    href: "/admin/audit-logs",
    labelKey: "auditLogs",
    icon: "shield",
    section: "system",
    permission: "audit:read",
  },
  {
    href: "/admin/users",
    labelKey: "users",
    icon: "user-cog",
    section: "system",
    permission: "users:manage",
  },
  {
    href: "/admin/site-settings",
    labelKey: "siteSettings",
    icon: "globe",
    section: "system",
    permission: "settings:manage",
    superAdminOnly: true,
  },
  {
    href: "/admin/settings",
    labelKey: "settings",
    icon: "settings",
    section: "system",
    permission: "settings:manage",
  },
];

export const adminNavSectionOrder: AdminNavSection[] = [
  "overview",
  "operations",
  "catalog",
  "content",
  "people",
  "platform",
  "system",
];

export function getAdminNavForPermissions(
  effectivePermissions: readonly Permission[],
  options?: { isSuperAdmin?: boolean },
): AdminNavItem[] {
  const permissionSet = new Set(effectivePermissions);
  const isSuperAdmin = options?.isSuperAdmin ?? false;

  return adminNavItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) {
      return false;
    }

    if (!item.permission) {
      return true;
    }

    return permissionSet.has(item.permission);
  });
}
