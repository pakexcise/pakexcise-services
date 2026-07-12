import { ArrowRight } from "lucide-react";

import { CustomerGettingStarted } from "@/components/customer/customer-getting-started";
import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { NextActionBadge } from "@/components/customer/NextActionBadge";
import type { CustomerNextAction } from "@/features/customer/lib/next-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
export type CustomerApplicationRow = {
  id: string;
  trackingId: string;
  serviceName: string;
  status: Parameters<typeof ApplicationStatusBadge>[0]["status"];
  statusLabel: string;
  nextAction: CustomerNextAction;
  nextActionLabel: string;
  updatedAt: string;
};

type GettingStartedStep = {
  title: string;
  description: string;
};

type CustomerApplicationsPanelProps = {
  applications: CustomerApplicationRow[];
  title: string;
  countLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyCta: string;
  emptyCtaHref: string;
  gettingStartedSteps: GettingStartedStep[];
  labels: {
    trackingId: string;
    service: string;
    status: string;
    nextAction: string;
    updated: string;
    actions: string;
    viewApplication: string;
  };
};

export function CustomerApplicationsPanel({
  applications,
  title,
  countLabel,
  emptyTitle,
  emptyDescription,
  emptyCta,
  emptyCtaHref,
  gettingStartedSteps,
  labels,
}: CustomerApplicationsPanelProps) {
  if (applications.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="font-semibold">{title}</h2>
          <Badge variant="secondary">{countLabel}</Badge>
        </div>
        <CustomerGettingStarted
          title={emptyTitle}
          description={emptyDescription}
          cta={emptyCta}
          ctaHref={emptyCtaHref}
          steps={gettingStartedSteps}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <h2 className="font-semibold">{title}</h2>
        <Badge variant="secondary">{countLabel}</Badge>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{labels.trackingId}</TableHead>
              <TableHead>{labels.service}</TableHead>
              <TableHead>{labels.status}</TableHead>
              <TableHead>{labels.nextAction}</TableHead>
              <TableHead>{labels.updated}</TableHead>
              <TableHead className="text-end">{labels.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium font-mono text-sm">
                  {application.trackingId}
                </TableCell>
                <TableCell>{application.serviceName}</TableCell>
                <TableCell>
                  <ApplicationStatusBadge
                    status={application.status}
                    label={application.statusLabel}
                  />
                </TableCell>
                <TableCell>
                  <NextActionBadge
                    action={application.nextAction}
                    label={application.nextActionLabel}
                  />
                </TableCell>
                <TableCell>{application.updatedAt}</TableCell>
                <TableCell className="text-end">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/customer/applications/${application.id}`}>
                      {labels.viewApplication}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {applications.map((application) => (
          <article
            key={application.id}
            className="rounded-lg border bg-background p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold">
                  {application.trackingId}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {application.serviceName}
                </p>
              </div>
              <ApplicationStatusBadge
                status={application.status}
                label={application.statusLabel}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <NextActionBadge
                action={application.nextAction}
                label={application.nextActionLabel}
              />
              <span>{application.updatedAt}</span>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-4 w-full">
              <Link href={`/customer/applications/${application.id}`}>
                {labels.viewApplication}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
