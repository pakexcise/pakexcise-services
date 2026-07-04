"use client";

import { useState } from "react";
import type { ApplicationStatus } from "@prisma/client";

import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { BulkAssignPlaceholder } from "@/features/admin/components/bulk-assign-placeholder";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";

type ApplicationRow = {
  id: string;
  trackingId: string;
  status: ApplicationStatus;
  createdAt: Date;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  statusLabel: string;
  sourceLabel: string;
};

type ApplicationsBulkSelectTableProps = {
  applications: ApplicationRow[];
  locale: string;
  showEdit?: boolean;
  labels: {
    trackingId: string;
    service: string;
    customer: string;
    source: string;
    status: string;
    created: string;
    actions: string;
    view: string;
    edit: string;
    select: string;
    bulkAssign: string;
    bulkPending: string;
    bulkPlaceholder: string;
    bulkClear: string;
  };
};

export function ApplicationsBulkSelectTable({
  applications,
  locale,
  showEdit = false,
  labels,
}: ApplicationsBulkSelectTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleOne(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleAll() {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(applications.map((item) => item.id));
  }

  return (
    <div className="space-y-4">
      <BulkAssignPlaceholder
        selectedIds={selectedIds}
        labels={{
          button: labels.bulkAssign,
          pending: labels.bulkPending,
          placeholderMessage: labels.bulkPlaceholder,
          clear: labels.bulkClear,
        }}
        onClear={() => setSelectedIds([])}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input
                type="checkbox"
                aria-label={labels.select}
                checked={
                  applications.length > 0 &&
                  selectedIds.length === applications.length
                }
                onChange={toggleAll}
                className="size-4 rounded border-input"
              />
            </TableHead>
            <TableHead>{labels.trackingId}</TableHead>
            <TableHead>{labels.service}</TableHead>
            <TableHead>{labels.customer}</TableHead>
            <TableHead>{labels.source}</TableHead>
            <TableHead>{labels.status}</TableHead>
            <TableHead>{labels.created}</TableHead>
            <TableHead className="text-right">{labels.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(application.id)}
                  onChange={() => toggleOne(application.id)}
                  className="size-4 rounded border-input"
                />
              </TableCell>
              <TableCell className="font-mono text-xs">
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
              <TableCell>{application.sourceLabel}</TableCell>
              <TableCell>
                <ApplicationStatusBadge
                  status={application.status}
                  label={application.statusLabel}
                />
              </TableCell>
              <TableCell>{formatDate(application.createdAt, locale)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/applications/${application.id}`}>
                      {labels.view}
                    </Link>
                  </Button>
                  {showEdit ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/applications/${application.id}/edit`}>
                        {labels.edit}
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
