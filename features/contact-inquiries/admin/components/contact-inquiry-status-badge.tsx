import type { ContactInquiryStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ContactInquiryStatusBadgeProps = {
  status: ContactInquiryStatus;
  label: string;
  className?: string;
};

export function ContactInquiryStatusBadge({
  status,
  label,
  className,
}: ContactInquiryStatusBadgeProps) {
  return (
    <Badge
      variant={status === "NEW" ? "default" : "secondary"}
      className={cn(
        status === "CONTACTED" &&
          "border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-100",
        status === "CLOSED" && "border-muted-foreground/30",
        status === "SPAM" && "border-destructive/30 bg-destructive/10",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
