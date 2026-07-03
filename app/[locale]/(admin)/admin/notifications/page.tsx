import type {
  NotificationChannel,
  NotificationEventType,
  NotificationStatus,
} from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminInAppNotificationsPanel } from "@/components/admin/admin-in-app-notifications-panel";
import { EmptyState } from "@/features/admin/components/empty-state";
import { NotificationFilters } from "@/features/admin/components/notification-filters";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminDefaultPageSize } from "@/config/admin";
import { Badge } from "@/components/ui/badge";
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
import { requireAdminPortal } from "@/server/permissions/guards";
import { notificationRepository } from "@/server/repositories/notification-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { AdminScopeNotice } from "@/features/admin/components/admin-scope-notice";

const validStatuses = new Set<string>([
  "PENDING",
  "RETRYING",
  "SENT",
  "FAILED",
]);

const validChannels = new Set<string>(["EMAIL", "WHATSAPP", "SMS"]);

const validEventTypes = new Set<string>([
  "APPLICATION_SUBMITTED",
  "DOCS_REQUIRED",
  "INVOICE_SENT",
  "PAYMENT_UPLOADED",
  "PAYMENT_VERIFIED",
  "STATUS_CHANGED",
  "APPLICATION_COMPLETED",
  "APPLICATION_REJECTED",
  "APPLICATION_CANCELLED",
  "PAYMENT_REJECTED",
]);

type NotificationsPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    channel?: string;
    eventType?: string;
    q?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.notifications"));
}

function statusVariant(
  status: NotificationStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "SENT":
      return "default";
    case "FAILED":
      return "destructive";
    case "RETRYING":
      return "secondary";
    default:
      return "outline";
  }
}

function truncateHash(hash: string | null): string {
  if (!hash) {
    return "—";
  }

  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export default async function AdminNotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const user = await requireAdminPortal();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.q?.trim() || undefined;
  const status =
    params.status && validStatuses.has(params.status)
      ? (params.status as NotificationStatus)
      : undefined;
  const channel =
    params.channel && validChannels.has(params.channel)
      ? (params.channel as NotificationChannel)
      : undefined;
  const eventType =
    params.eventType && validEventTypes.has(params.eventType)
      ? (params.eventType as NotificationEventType)
      : undefined;

  const result = await notificationRepository.listForAdmin({
    page,
    pageSize: adminDefaultPageSize,
    search,
    status,
    channel,
    eventType,
    viewerRole: user.role,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("notifications.title")}
        description={t("notifications.description")}
      />

      <AdminInAppNotificationsPanel />

      <AdminPageHeader
        title={t("notifications.deliveryLogsTitle")}
        description={t("notifications.deliveryLogsDescription")}
      />

      {user.role === "ADMIN" ? (
        <AdminScopeNotice message={t("notifications.scopeNotice")} />
      ) : null}

      <NotificationFilters
        currentStatus={status}
        currentChannel={channel}
        currentEventType={eventType}
        currentSearch={search}
      />

      {result.items.length === 0 ? (
        <EmptyState
          title={t("notifications.emptyTitle")}
          description={t("notifications.emptyDescription")}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("notifications.table.createdAt")}</TableHead>
                  <TableHead>{t("notifications.table.event")}</TableHead>
                  <TableHead>{t("notifications.table.channel")}</TableHead>
                  <TableHead>{t("notifications.table.status")}</TableHead>
                  <TableHead>{t("notifications.table.tracking")}</TableHead>
                  <TableHead>{t("notifications.table.locale")}</TableHead>
                  <TableHead>{t("notifications.table.recipient")}</TableHead>
                  <TableHead>{t("notifications.table.retries")}</TableHead>
                  <TableHead>{t("notifications.table.lastError")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(item.createdAt, locale, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {t(`notifications.eventType.${item.eventType}`)}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.title}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`notifications.channel.${item.channel}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(item.status)}>
                        {t(`notifications.status.${item.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.applicationId && item.trackingId ? (
                        <Link
                          href={`/admin/applications/${item.applicationId}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {item.trackingId}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="uppercase">{item.locale}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {truncateHash(item.recipientHash)}
                    </TableCell>
                    <TableCell>{item.retryCount}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-xs text-muted-foreground">
                      {item.lastError ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/notifications"
            searchParams={{
              ...(status ? { status } : {}),
              ...(channel ? { channel } : {}),
              ...(eventType ? { eventType } : {}),
              ...(search ? { q: search } : {}),
            }}
          />
        </>
      )}
    </div>
  );
}
