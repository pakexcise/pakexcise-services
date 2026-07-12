import { ArrowRight, CircleDollarSign, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";
type AgentCommissionSummaryProps = {
  pendingTotal: string;
  paidTotal: string;
  awaitingCount?: number;
  payoutMethodMissing?: boolean;
  labels: {
    title: string;
    description: string;
    pendingLabel: string;
    paidLabel: string;
    awaitingLabel?: string;
    payoutMethodMissing?: string;
    setupPayoutMethod?: string;
    viewAll: string;
  };
};

export function AgentCommissionSummary({
  pendingTotal,
  paidTotal,
  awaitingCount = 0,
  payoutMethodMissing = false,
  labels,
}: AgentCommissionSummaryProps) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="font-semibold">{labels.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{labels.description}</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/agent/commissions">
            {labels.viewAll}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          className={cn(
            "rounded-xl border border-s-4 border-s-secondary bg-background/80 p-4",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {labels.pendingLabel}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
                {pendingTotal}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/15 p-2 text-secondary-foreground">
              <CircleDollarSign className="size-5" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-s-4 border-s-emerald-500 bg-background/80 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {labels.paidLabel}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
                {paidTotal}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300">
              <Wallet className="size-5" aria-hidden="true" />
            </div>
          </div>
        </div>

        {labels.awaitingLabel ? (
          <div className="rounded-xl border border-s-4 border-s-amber-500 bg-background/80 p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {labels.awaitingLabel}
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
                  {awaitingCount}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {payoutMethodMissing && labels.payoutMethodMissing ? (
        <div className="border-t px-5 py-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {labels.payoutMethodMissing}
          </p>
          {labels.setupPayoutMethod ? (
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href="/agent/commissions">{labels.setupPayoutMethod}</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
