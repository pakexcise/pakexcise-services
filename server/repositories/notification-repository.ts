import "server-only";

import type {
  NotificationChannel,
  NotificationEventType,
  NotificationStatus,
  Prisma,
} from "@prisma/client";

import { adminDefaultPageSize } from "@/config/admin";
import { prisma } from "@/server/db/client";

export type NotificationListFilters = {
  page?: number;
  pageSize?: number;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  eventType?: NotificationEventType;
  search?: string;
};

export type NotificationListItem = {
  id: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  locale: string;
  status: NotificationStatus;
  title: string;
  recipientHash: string | null;
  retryCount: number;
  lastError: string | null;
  sentAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  trackingId: string | null;
  applicationId: string | null;
  userEmail: string | null;
};

export const notificationRepository = {
  async listForAdmin(filters: NotificationListFilters = {}) {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = filters.pageSize ?? adminDefaultPageSize;
    const skip = (page - 1) * pageSize;

    const where: Prisma.NotificationWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.channel) {
      where.channel = filters.channel;
    }

    if (filters.eventType) {
      where.eventType = filters.eventType;
    }

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
        {
          application: {
            trackingId: { contains: q, mode: "insensitive" },
          },
        },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          channel: true,
          eventType: true,
          locale: true,
          status: true,
          title: true,
          recipientHash: true,
          retryCount: true,
          lastError: true,
          sentAt: true,
          failedAt: true,
          createdAt: true,
          applicationId: true,
          application: { select: { trackingId: true } },
          user: { select: { email: true } },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    const items: NotificationListItem[] = rows.map((row) => ({
      id: row.id,
      channel: row.channel,
      eventType: row.eventType,
      locale: row.locale,
      status: row.status,
      title: row.title,
      recipientHash: row.recipientHash,
      retryCount: row.retryCount,
      lastError: row.lastError,
      sentAt: row.sentAt,
      failedAt: row.failedAt,
      createdAt: row.createdAt,
      trackingId: row.application?.trackingId ?? null,
      applicationId: row.applicationId,
      userEmail: row.user?.email ?? null,
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },
};
