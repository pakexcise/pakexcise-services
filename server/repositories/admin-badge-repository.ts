import "server-only";

import type { ApplicationStatus } from "@prisma/client";

import type { AdminNavBadgeCounts } from "@/features/admin/types/nav-badges";
import { inAppNotificationRepository } from "@/server/repositories/in-app-notification-repository";
import { applicationRepository } from "@/server/repositories/application-repository";

const pendingApplicationStatuses: ApplicationStatus[] = [
  "SUBMITTED",
  "REVIEW",
  "PAYMENT_UPLOADED",
];

export type { AdminNavBadgeCounts };

export async function getAdminNavBadgeCounts(
  userId: string,
): Promise<AdminNavBadgeCounts> {
  const [unreadNotifications, pendingApplications] = await Promise.all([
    inAppNotificationRepository.countUnread(userId),
    applicationRepository.countByStatuses(pendingApplicationStatuses),
  ]);

  return {
    unreadNotifications,
    pendingApplications,
  };
}
