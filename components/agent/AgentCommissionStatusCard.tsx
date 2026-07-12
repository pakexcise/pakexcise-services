import { Coins } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
type AgentCommissionStatusCardProps = {
  commission: {
    id: string;
    label: string;
    amount: string;
    payoutStatus: string;
    agentReceiptStatus: string;
  };
  locale: "en";
  labels: {
    title: string;
    amount: string;
    payoutStatus: string;
    receiptStatus: string;
    viewCommissions: string;
    payoutStatusLabels: Record<string, string>;
    receiptStatusLabels: Record<string, string>;
  };
};

function payoutBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PAID":
      return "default";
    case "PENDING":
      return "secondary";
    case "PROCESSING":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

function receiptBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "RECEIVED":
      return "default";
    case "NOT_RECEIVED":
      return "destructive";
    case "AWAITING":
      return "secondary";
    default:
      return "outline";
  }
}

export function AgentCommissionStatusCard({
  commission,
  locale,
  labels,
}: AgentCommissionStatusCardProps) {
  const formattedAmount = new Intl.NumberFormat(
    "en-PK",
    { style: "currency", currency: "PKR" },
  ).format(Number(commission.amount));

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Coins className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{labels.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{commission.label}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
          <dt className="text-muted-foreground">{labels.amount}</dt>
          <dd className="font-semibold tabular-nums text-primary">{formattedAmount}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
          <dt className="text-muted-foreground">{labels.payoutStatus}</dt>
          <dd>
            <Badge variant={payoutBadgeVariant(commission.payoutStatus)}>
              {labels.payoutStatusLabels[commission.payoutStatus] ??
                commission.payoutStatus}
            </Badge>
          </dd>
        </div>
        {commission.payoutStatus === "PAID" ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2.5 sm:col-span-2">
            <dt className="text-muted-foreground">{labels.receiptStatus}</dt>
            <dd>
              <Badge variant={receiptBadgeVariant(commission.agentReceiptStatus)}>
                {labels.receiptStatusLabels[commission.agentReceiptStatus] ??
                  commission.agentReceiptStatus}
              </Badge>
            </dd>
          </div>
        ) : null}
      </dl>

      <Button asChild size="sm" variant="outline" className="mt-4">
        <Link href="/agent/commissions">{labels.viewCommissions}</Link>
      </Button>
    </div>
  );
}
