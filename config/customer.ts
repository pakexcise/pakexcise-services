import type { ApplicationStatus } from "@prisma/client";

export const customerDashboardStatusCards = [
  { key: "total", statuses: null },
  {
    key: "actionRequired",
    statuses: ["DOCS_REQUIRED", "INVOICE_SENT"] as ApplicationStatus[],
  },
  {
    key: "inProgress",
    statuses: [
      "SUBMITTED",
      "REVIEW",
      "PAYMENT_UPLOADED",
      "PAYMENT_VERIFIED",
      "IN_PROGRESS",
      "AT_OFFICE",
    ] as ApplicationStatus[],
  },
  { key: "completed", statuses: ["COMPLETED"] as ApplicationStatus[] },
  {
    key: "closed",
    statuses: ["REJECTED", "CANCELLED"] as ApplicationStatus[],
  },
] as const;

export type CustomerDashboardStatusCardKey =
  (typeof customerDashboardStatusCards)[number]["key"];
