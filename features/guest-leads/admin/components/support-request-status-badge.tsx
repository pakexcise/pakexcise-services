import type { GuestLeadStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SupportRequestStatusBadgeProps = {
  status: GuestLeadStatus;
  label: string;
  className?: string;
};

export function SupportRequestStatusBadge({
  status,
  label,
  className,
}: SupportRequestStatusBadgeProps) {
  const variant =
    status === "NEW"
      ? "default"
      : status === "CONVERTED"
        ? "outline"
        : status === "SPAM" || status === "CLOSED"
          ? "secondary"
          : "secondary";

  return (
    <Badge
      variant={variant}
      className={cn(
        status === "IN_PROGRESS" && "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
        status === "CONTACTED" && "border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-100",
        status === "CONVERTED" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
