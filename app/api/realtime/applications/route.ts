import { NextResponse } from "next/server";

import { listApplicationEventsSince } from "@/server/realtime/application-events";
import { getCurrentUser } from "@/server/auth/current-user";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const since = Number(searchParams.get("since") ?? "0");
  const applicationId = searchParams.get("applicationId");

  const result = await listApplicationEventsSince(
    Number.isFinite(since) ? since : 0,
    {
      role: user.role,
      userId: user.id,
    },
    applicationId,
  );

  return NextResponse.json(result);
}
