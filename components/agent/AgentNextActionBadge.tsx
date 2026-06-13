import type { AgentNextAction } from "@/features/agents/lib/agent-next-action";
import { Badge } from "@/components/ui/badge";

type AgentNextActionBadgeProps = {
  action: AgentNextAction;
  label: string;
};

const actionVariantMap: Partial<
  Record<AgentNextAction, "default" | "secondary" | "warning" | "outline" | "destructive">
> = {
  wait_review: "secondary",
  customer_upload_docs: "warning",
  customer_payment: "warning",
  wait_payment_verification: "secondary",
  in_progress: "secondary",
  view_commission: "default",
  completed: "default",
  closed: "destructive",
  none: "outline",
};

export function AgentNextActionBadge({ action, label }: AgentNextActionBadgeProps) {
  if (action === "none") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <Badge variant={actionVariantMap[action] ?? "outline"}>{label}</Badge>
  );
}
