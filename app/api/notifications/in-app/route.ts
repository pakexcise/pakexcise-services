import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth/current-user";
import { inAppNotificationRepository } from "@/server/repositories/in-app-notification-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "CUSTOMER" && user.role !== "AGENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "20");
  const cursor = searchParams.get("cursor");

  const [list, unreadCount] = await Promise.all([
    inAppNotificationRepository.listForUser({
      userId: user.id,
      limit: Number.isFinite(limit) ? limit : 20,
      cursor,
    }),
    inAppNotificationRepository.countUnread(user.id),
  ]);

  return NextResponse.json({
    items: list.items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    nextCursor: list.nextCursor,
    unreadCount,
  });
}
