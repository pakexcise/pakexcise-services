"use client";

import { copy, createT } from "@/messages";

import { Bell, CheckCheck } from "lucide-react";
import { useTranslations } from "@/lib/i18n/t";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRealtimeNotifications } from "@/features/realtime/hooks/use-realtime-notifications";
import { cn } from "@/lib/utils";

import type { Route } from "next";
import Link from "next/link";

type NotificationBellProps = {
  applicationBasePath:
    | "/customer/applications"
    | "/agent/applications"
    | "/admin/applications";
  className?: string;
};

export function NotificationBell({
  applicationBasePath,
  className,
}: NotificationBellProps) {
  const t = createT(copy.realtime.notifications);
  const [open, setOpen] = useState(false);
  const {
    unreadCount,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useRealtimeNotifications();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn("relative", className)}
          aria-label={t("bellAria", { count: unreadCount })}
        >
          <Bell className="size-4" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute -end-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>{t("title")}</span>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => void markAllNotificationsRead()}
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              {t("markAllRead")}
            </Button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                "flex cursor-default flex-col items-start gap-1 whitespace-normal p-3",
                !notification.isRead && "bg-primary/5",
              )}
              onSelect={(event) => event.preventDefault()}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <p className="text-sm font-medium leading-snug">
                  {notification.title}
                </p>
                {!notification.isRead ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto shrink-0 px-2 py-1 text-xs"
                    onClick={() => void markNotificationRead(notification.id)}
                  >
                    {t("markRead")}
                  </Button>
                ) : null}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {notification.message}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
              {notification.applicationId ? (
                <Link
                  href={
                    `${applicationBasePath}/${notification.applicationId}` as Route
                  }
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => {
                    if (!notification.isRead) {
                      void markNotificationRead(notification.id);
                    }

                    setOpen(false);
                  }}
                >
                  {t("viewApplication")}
                </Link>
              ) : null}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
