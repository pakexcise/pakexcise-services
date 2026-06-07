import type { ApplicationStatus, UserRole } from "@prisma/client";

export type AdminNavItem = {
  href: string;
  labelKey: string;
  icon: string;
  superAdminOnly?: boolean;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin/dashboard", labelKey: "dashboard", icon: "layout-dashboard" },
  { href: "/admin/applications", labelKey: "applications", icon: "file-stack" },
  { href: "/admin/services", labelKey: "services", icon: "briefcase" },
  { href: "/admin/regions", labelKey: "regions", icon: "map-pin" },
  { href: "/admin/faqs", labelKey: "faqs", icon: "help-circle" },
  { href: "/admin/social", labelKey: "social", icon: "share-2" },
  { href: "/admin/agents", labelKey: "agents", icon: "users" },
  { href: "/admin/customers", labelKey: "customers", icon: "user-circle" },
  { href: "/admin/notifications", labelKey: "notifications", icon: "bell" },
  { href: "/admin/seo", labelKey: "seo", icon: "search" },
  { href: "/admin/redirects", labelKey: "redirects", icon: "arrow-right-left" },
  { href: "/admin/blog", labelKey: "blog", icon: "newspaper" },
  { href: "/admin/guides", labelKey: "guides", icon: "book-open" },
  { href: "/admin/audit-logs", labelKey: "auditLogs", icon: "shield" },
  { href: "/admin/settings", labelKey: "settings", icon: "settings", superAdminOnly: true },
];

export function getAdminNavForRole(role: UserRole): AdminNavItem[] {
  return adminNavItems.filter(
    (item) => !item.superAdminOnly || role === "SUPER_ADMIN",
  );
}

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
