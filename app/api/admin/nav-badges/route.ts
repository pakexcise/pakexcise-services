import { NextResponse } from "next/server";

import { getAdminNavBadgeCounts } from "@/server/repositories/admin-badge-repository";
import { getCurrentUser } from "@/server/auth/current-user";
import { canAccessInAppNotifications } from "@/server/permissions/in-app-notification-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canAccessInAppNotifications(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const counts = await getAdminNavBadgeCounts(user.id);

  return NextResponse.json(counts);
}
