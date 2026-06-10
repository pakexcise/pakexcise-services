import type { ApplicationStatus } from "@prisma/client";

export type SupportNavItem = {
  href: string;
  labelKey: string;
  icon: string;
};

export const supportNavItems: SupportNavItem[] = [
  { href: "/support/dashboard", labelKey: "dashboard", icon: "layout-dashboard" },
  { href: "/support/applications", labelKey: "applications", icon: "file-stack" },
  { href: "/contact", labelKey: "contact", icon: "headphones" },
];

export const supportDashboardStatusCards = [
  { key: "total", statuses: null },
  { key: "review", statuses: ["REVIEW", "SUBMITTED"] as ApplicationStatus[] },
  { key: "docsRequired", statuses: ["DOCS_REQUIRED"] as ApplicationStatus[] },
  {
    key: "needsAttention",
    statuses: ["INVOICE_SENT", "PAYMENT_UPLOADED"] as ApplicationStatus[],
  },
  {
    key: "inProgress",
    statuses: ["PAYMENT_VERIFIED", "IN_PROGRESS", "AT_OFFICE"] as ApplicationStatus[],
  },
  { key: "completed", statuses: ["COMPLETED"] as ApplicationStatus[] },
] as const;

export const supportApplicationsBasePath = "/support/applications";
