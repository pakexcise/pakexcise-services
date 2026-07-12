import type { AgentPayoutStatus, AgentReceiptStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import Link from "next/link";
type AdminPayoutRow = {
  id: string;
  label: string;
  amount: string;
  source: string;
  payoutStatus: string;
  agentReceiptStatus: string;
  agentDisputeReason: string | null;
  trackingId: string | null;
  agentName: string;
  agentEmail: string;
  hasProof: boolean;
  agentConfirmedAt: string | null;
  createdAt: string;
};

type AdminPayoutsWorkspaceProps = {
  rows: AdminPayoutRow[];
  currentSearch?: string;
  currentStatus?: AgentPayoutStatus;
  currentReceiptStatus?: AgentReceiptStatus;
  labels: Record<string, string>;
};

const payoutStatuses: AgentPayoutStatus[] = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "CANCELLED",
];

const receiptStatuses: AgentReceiptStatus[] = [
  "AWAITING",
  "RECEIVED",
  "NOT_RECEIVED",
];

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

export function AdminPayoutsWorkspace({
  rows,
  currentSearch,
  currentStatus,
  currentReceiptStatus,
  labels,
}: AdminPayoutsWorkspaceProps) {
  return (
    <div className="space-y-4">
      <form
        action="/admin/agent-payouts"
        method="get"
        className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:flex-wrap md:items-end"
      >
        <div className="min-w-[220px] flex-1 space-y-2">
          <label htmlFor="payout-search" className="text-sm font-medium">
            {labels.filters_search}
          </label>
          <Input
            id="payout-search"
            name="q"
            defaultValue={currentSearch ?? ""}
            placeholder={labels.filters_searchPlaceholder}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="payout-status" className="text-sm font-medium">
            {labels.filters_status}
          </label>
          <select
            id="payout-status"
            name="status"
            defaultValue={currentStatus ?? ""}
            className="flex h-10 w-full min-w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{labels.filters_allStatuses}</option>
            {payoutStatuses.map((status) => (
              <option key={status} value={status}>
                {labels[`status_${status}`]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="receipt-status" className="text-sm font-medium">
            {labels.filters_receiptStatus}
          </label>
          <select
            id="receipt-status"
            name="receipt"
            defaultValue={currentReceiptStatus ?? ""}
            className="flex h-10 w-full min-w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{labels.filters_allReceiptStatuses}</option>
            {receiptStatuses.map((status) => (
              <option key={status} value={status}>
                {labels[`receipt_${status}`]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit">{labels.filters_apply}</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/agent-payouts">{labels.filters_reset}</Link>
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>{labels.columns_agent}</TableHead>
              <TableHead>{labels.columns_label}</TableHead>
              <TableHead>{labels.columns_application}</TableHead>
              <TableHead>{labels.columns_amount}</TableHead>
              <TableHead>{labels.columns_source}</TableHead>
              <TableHead>{labels.columns_status}</TableHead>
              <TableHead>{labels.columns_date}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  row.agentReceiptStatus === "NOT_RECEIVED" &&
                    "bg-destructive/5 hover:bg-destructive/10",
                )}
              >
                <TableCell>
                  <div className="font-medium">{row.agentName}</div>
                  <div className="text-xs text-muted-foreground">{row.agentEmail}</div>
                </TableCell>
                <TableCell>{row.label}</TableCell>
                <TableCell className="font-mono text-xs">
                  {row.trackingId ?? "—"}
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("en-PK", {
                    style: "currency",
                    currency: "PKR",
                  }).format(Number(row.amount))}
                </TableCell>
                <TableCell>{labels[`source_${row.source}`]}</TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    <Badge variant="outline">
                      {labels[`status_${row.payoutStatus}`]}
                    </Badge>
                    {row.payoutStatus === "PAID" ? (
                      <Badge variant={receiptBadgeVariant(row.agentReceiptStatus)}>
                        {labels[`receipt_${row.agentReceiptStatus}`]}
                      </Badge>
                    ) : null}
                    {row.hasProof ? (
                      <p className="text-xs text-muted-foreground">{labels.hasProof}</p>
                    ) : null}
                    {row.agentReceiptStatus === "RECEIVED" && row.agentConfirmedAt ? (
                      <p className="text-xs text-primary">{labels.agentConfirmed}</p>
                    ) : row.payoutStatus === "PAID" &&
                      row.agentReceiptStatus === "AWAITING" ? (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {labels.awaitingConfirm}
                      </p>
                    ) : null}
                    {row.agentReceiptStatus === "NOT_RECEIVED" &&
                    row.agentDisputeReason ? (
                      <p className="max-w-xs text-xs text-destructive">
                        {row.agentDisputeReason}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("en-PK", {
                    dateStyle: "medium",
                  }).format(new Date(row.createdAt))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
