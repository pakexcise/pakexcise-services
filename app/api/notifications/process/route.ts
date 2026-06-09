import { NextResponse } from "next/server";

import {
  drainNotificationQueue,
  processPendingNotifications,
} from "@/features/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.NOTIFICATION_DISPATCH_SECRET?.trim();

  if (!secret) {
    return process.env.NODE_ENV === "development";
  }

  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = new URL(request.url).searchParams.get("secret");

  return bearer === secret || query === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await drainNotificationQueue(50);
  const result = await processPendingNotifications({ limit: 50 });

  return NextResponse.json({ ok: true, ...result });
}

export async function GET(request: Request) {
  return POST(request);
}
