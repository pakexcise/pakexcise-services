import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth/current-user";
import { inAppNotificationRepository } from "@/server/repositories/in-app-notification-repository";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "CUSTOMER" && user.role !== "AGENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const updated = await inAppNotificationRepository.markRead({
    userId: user.id,
    notificationId: id,
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const unreadCount = await inAppNotificationRepository.countUnread(user.id);

  return NextResponse.json({ ok: true, unreadCount });
}
