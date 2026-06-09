import type { ApplicationStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

const statusVariantMap: Partial<
  Record<ApplicationStatus, "default" | "secondary" | "warning" | "success" | "destructive" | "outline">
> = {
  DRAFT: "outline",
  SUBMITTED: "secondary",
  REVIEW: "warning",
  DOCS_REQUIRED: "warning",
  INVOICE_SENT: "outline",
  PAYMENT_UPLOADED: "outline",
  PAYMENT_VERIFIED: "default",
  IN_PROGRESS: "default",
  AT_OFFICE: "default",
  COMPLETED: "success",
  REJECTED: "destructive",
  CANCELLED: "destructive",
};

type ApplicationStatusBadgeProps = {
  status: ApplicationStatus;
  label: string;
};

export function ApplicationStatusBadge({
  status,
  label,
}: ApplicationStatusBadgeProps) {
  return (
    <Badge variant={statusVariantMap[status] ?? "outline"}>{label}</Badge>
  );
}
