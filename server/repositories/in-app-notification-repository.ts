import "server-only";

import type {
  NotificationEventType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/server/db/client";

export type InAppNotificationItem = {
  id: string;
  applicationId: string | null;
  eventType: NotificationEventType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  trackingId: string | null;
};

export const inAppNotificationRepository = {
  async create(input: {
    userId: string;
    applicationId: string | null;
    eventType: NotificationEventType;
    locale: string;
    title: string;
    body: string;
    payloadJson?: Prisma.InputJsonValue;
  }) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        applicationId: input.applicationId,
        channel: "IN_APP",
        eventType: input.eventType,
        locale: input.locale,
        status: "SENT",
        title: input.title,
        body: input.body,
        payloadJson: input.payloadJson,
        sentAt: new Date(),
        isRead: false,
      },
      select: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
      },
    });
  },

  async listForUser(input: {
    userId: string;
    limit?: number;
    cursor?: string | null;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);

    const rows = await prisma.notification.findMany({
      where: {
        userId: input.userId,
        channel: "IN_APP",
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(input.cursor
        ? {
            cursor: { id: input.cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        applicationId: true,
        eventType: true,
        title: true,
        body: true,
        isRead: true,
        createdAt: true,
        application: {
          select: {
            trackingId: true,
          },
        },
      },
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return {
      items: items.map(
        (row): InAppNotificationItem => ({
          id: row.id,
          applicationId: row.applicationId,
          eventType: row.eventType,
          title: row.title,
          message: row.body,
          isRead: row.isRead,
          createdAt: row.createdAt,
          trackingId: row.application?.trackingId ?? null,
        }),
      ),
      nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
    };
  },

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        channel: "IN_APP",
        isRead: false,
      },
    });
  },

  async countUnseenApplications(userId: string): Promise<number> {
    const rows = await prisma.notification.findMany({
      where: {
        userId,
        channel: "IN_APP",
        isRead: false,
        applicationId: { not: null },
      },
      distinct: ["applicationId"],
      select: {
        applicationId: true,
      },
    });

    return rows.length;
  },

  async markApplicationNotificationsRead(input: {
    userId: string;
    applicationId: string;
  }) {
    const result = await prisma.notification.updateMany({
      where: {
        userId: input.userId,
        channel: "IN_APP",
        applicationId: input.applicationId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return result.count;
  },

  async markRead(input: { userId: string; notificationId: string }) {
    const result = await prisma.notification.updateMany({
      where: {
        id: input.notificationId,
        userId: input.userId,
        channel: "IN_APP",
      },
      data: {
        isRead: true,
      },
    });

    return result.count > 0;
  },

  async markAllRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        channel: "IN_APP",
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return result.count;
  },
};
