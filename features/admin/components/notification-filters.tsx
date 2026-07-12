import { copy, createT } from "@/messages";
import { getTranslations } from "@/lib/i18n/t";
import type {
  NotificationChannel,
  NotificationEventType,
  NotificationStatus,
} from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Route } from "next";
import Link from "next/link";

type NotificationFiltersProps = {
  currentStatus?: NotificationStatus;
  currentChannel?: NotificationChannel;
  currentEventType?: NotificationEventType;
  currentSearch?: string;
};

function buildHref(input: {
  status?: NotificationStatus;
  channel?: NotificationChannel;
  eventType?: NotificationEventType;
  search?: string;
}): string {
  const params = new URLSearchParams();

  if (input.status) {
    params.set("status", input.status);
  }

  if (input.channel) {
    params.set("channel", input.channel);
  }

  if (input.eventType) {
    params.set("eventType", input.eventType);
  }

  if (input.search?.trim()) {
    params.set("q", input.search.trim());
  }

  const query = params.toString();
  return query ? `/admin/notifications?${query}` : "/admin/notifications";
}

const statuses: NotificationStatus[] = [
  "PENDING",
  "RETRYING",
  "SENT",
  "FAILED",
];

const channels: NotificationChannel[] = ["EMAIL", "WHATSAPP", "SMS"];

const eventTypes: NotificationEventType[] = [
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
];

export async function NotificationFilters({
  currentStatus,
  currentChannel,
  currentEventType,
  currentSearch,
}: NotificationFiltersProps) {
  const t = createT(copy.admin.notifications);

  return (
    <form
      action="/admin/notifications"
      method="get"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium" htmlFor="q">
            {t("filters.search")}
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={currentSearch}
            placeholder={t("filters.searchPlaceholder")}
          />
        </div>
        <Button type="submit">{t("filters.apply")}</Button>
        <Button variant="outline" asChild>
          <Link href="/admin/notifications">{t("filters.reset")}</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="w-full text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("filters.status")}
        </span>
        {statuses.map((status) => (
          <Button
            key={status}
            variant={currentStatus === status ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link
              href={
                buildHref({
                  status,
                  channel: currentChannel,
                  eventType: currentEventType,
                  search: currentSearch,
                }) as Route
              }
            >
              {t(`status.${status}`)}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="w-full text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("filters.channel")}
        </span>
        {channels.map((channel) => (
          <Button
            key={channel}
            variant={currentChannel === channel ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link
              href={
                buildHref({
                  status: currentStatus,
                  channel,
                  eventType: currentEventType,
                  search: currentSearch,
                }) as Route
              }
            >
              {t(`channel.${channel}`)}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="w-full text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("filters.eventType")}
        </span>
        {eventTypes.map((eventType) => (
          <Button
            key={eventType}
            variant={currentEventType === eventType ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link
              href={
                buildHref({
                  status: currentStatus,
                  channel: currentChannel,
                  eventType,
                  search: currentSearch,
                }) as Route
              }
            >
              {t(`eventType.${eventType}`)}
            </Link>
          </Button>
        ))}
      </div>
    </form>
  );
}
