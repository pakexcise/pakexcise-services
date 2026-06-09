import { NextResponse } from "next/server";

import { handlePresignUpload } from "@/features/documents/lib/handlers";
import { getCurrentUser } from "@/server/auth/current-user";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser();

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await enforceRateLimit(serverActionRateLimit, `upload:${user.id}`);
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await handlePresignUpload(user, body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    documentId: result.documentId,
    uploadUrl: result.uploadUrl,
    expiresInSeconds: result.expiresInSeconds,
  });
}
