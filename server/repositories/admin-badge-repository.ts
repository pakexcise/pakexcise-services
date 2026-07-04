import "server-only";

import type { AdminNavBadgeCounts } from "@/features/admin/types/nav-badges";
import { inAppNotificationRepository } from "@/server/repositories/in-app-notification-repository";

export type { AdminNavBadgeCounts };

export async function getAdminNavBadgeCounts(
  userId: string,
): Promise<AdminNavBadgeCounts> {
  const [unreadNotifications, unseenApplications] = await Promise.all([
    inAppNotificationRepository.countUnread(userId),
    inAppNotificationRepository.countUnseenApplications(userId),
  ]);

  return {
    unreadNotifications,
    pendingApplications: unseenApplications,
  };
}
