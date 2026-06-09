import type { CustomerNextAction } from "@/features/customer/lib/next-action";
import { Badge } from "@/components/ui/badge";

type NextActionBadgeProps = {
  action: CustomerNextAction;
  label: string;
};

const actionVariantMap: Partial<
  Record<CustomerNextAction, "default" | "secondary" | "warning" | "outline">
> = {
  upload_docs: "warning",
  view_invoice: "default",
  upload_payment: "warning",
  wait_verification: "secondary",
  download_proof: "default",
  wait_review: "secondary",
  in_progress: "secondary",
  none: "outline",
};

export function NextActionBadge({ action, label }: NextActionBadgeProps) {
  if (action === "none") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <Badge variant={actionVariantMap[action] ?? "outline"}>{label}</Badge>
  );
}
