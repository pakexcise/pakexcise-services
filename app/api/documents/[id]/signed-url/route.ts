import { NextResponse } from "next/server";

import { handleSignedUrl } from "@/features/documents/lib/handlers";
import { getCurrentUser } from "@/server/auth/current-user";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await getCurrentUser();

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await enforceRateLimit(serverActionRateLimit, `doc-view:${user.id}`);
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const purpose = searchParams.get("purpose");

  const result = await handleSignedUrl(user, id, purpose);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    signedUrl: result.signedUrl,
    expiresInSeconds: result.expiresInSeconds,
    mimeType: result.mimeType,
    fileName: result.fileName,
  });
}
