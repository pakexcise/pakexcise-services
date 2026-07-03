import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth/current-user";
import { inAppNotificationRepository } from "@/server/repositories/in-app-notification-repository";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "CUSTOMER" && user.role !== "AGENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const markedCount = await inAppNotificationRepository.markAllRead(user.id);

  return NextResponse.json({
    ok: true,
    markedCount,
    unreadCount: 0,
  });
}
