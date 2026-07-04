"use server";

import { getCurrentUser } from "@/server/auth/current-user";
import { canAccessInAppNotifications } from "@/server/permissions/in-app-notification-access";
import { inAppNotificationRepository } from "@/server/repositories/in-app-notification-repository";

export async function markAdminApplicationSeenAction(
  applicationId: string,
): Promise<void> {
  const user = await getCurrentUser();

  if (!user || !canAccessInAppNotifications(user.role)) {
    return;
  }

  await inAppNotificationRepository.markApplicationNotificationsRead({
    userId: user.id,
    applicationId,
  });
}

export async function markAllAdminInAppNotificationsReadAction(): Promise<void> {
  const user = await getCurrentUser();

  if (!user || !canAccessInAppNotifications(user.role)) {
    return;
  }

  await inAppNotificationRepository.markAllRead(user.id);
}
