"use client";

import type { ApplicationStatus } from "@prisma/client";

import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

import type { Route } from "next";
import Link from "next/link";

type SupportApplicationRow = {
  id: string;
  trackingId: string;
  status: ApplicationStatus;
  createdAt: Date;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  statusLabel: string;
};

type SupportApplicationsTableProps = {
  applications: SupportApplicationRow[];
  locale: string;
  detailBasePath: string;
  labels: {
    trackingId: string;
    service: string;
    customer: string;
    status: string;
    created: string;
    actions: string;
    view: string;
  };
};

export function SupportApplicationsTable({
  applications,
  locale,
  detailBasePath,
  labels,
}: SupportApplicationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{labels.trackingId}</TableHead>
          <TableHead>{labels.service}</TableHead>
          <TableHead>{labels.customer}</TableHead>
          <TableHead>{labels.status}</TableHead>
          <TableHead>{labels.created}</TableHead>
          <TableHead className="text-end">{labels.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => (
          <TableRow key={application.id}>
            <TableCell className="font-mono text-xs font-medium">
              {application.trackingId}
            </TableCell>
            <TableCell>{application.serviceName}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{application.customerName}</span>
                <span className="text-xs text-muted-foreground">
                  {application.customerEmail}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <ApplicationStatusBadge
                status={application.status}
                label={application.statusLabel}
              />
            </TableCell>
            <TableCell>{formatDate(application.createdAt, locale)}</TableCell>
            <TableCell className="text-end">
              <Button asChild variant="ghost" size="sm">
                <Link href={`${detailBasePath}/${application.id}` as Route}>
                  {labels.view}
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
