import "server-only";

import type { UserRole } from "@prisma/client";

import type { AdminNavBadgeCounts } from "@/features/admin/types/nav-badges";
import { userHasPermission } from "@/server/permissions/effective-permissions";
import { inAppNotificationRepository } from "@/server/repositories/in-app-notification-repository";
import { adminReviewRepository } from "@/server/repositories/admin-review-repository";

export type { AdminNavBadgeCounts };

export async function getAdminNavBadgeCounts(
  userId: string,
  role?: UserRole,
): Promise<AdminNavBadgeCounts> {
  const canCountPendingReviews =
    role != null ? await userHasPermission(userId, role, "content:manage") : false;

  const [unreadNotifications, unseenApplications, pendingReviews] =
    await Promise.all([
      inAppNotificationRepository.countUnread(userId),
      inAppNotificationRepository.countUnseenApplications(userId),
      canCountPendingReviews
        ? adminReviewRepository.countByStatus("PENDING")
        : Promise.resolve(0),
    ]);

  return {
    unreadNotifications,
    pendingApplications: unseenApplications,
    pendingReviews,
  };
}
