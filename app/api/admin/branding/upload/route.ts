import { NextResponse } from "next/server";

import { saveBrandingPublicImage } from "@/features/settings/lib/upload-branding-image";
import { auditAdminAction } from "@/server/admin/audit-action";
import { requirePermission } from "@/server/permissions/guards";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

export const maxDuration = 60;

export async function POST(request: Request): Promise<NextResponse> {
  const user = await requirePermission("settings:manage");

  try {
    await enforceRateLimit(serverActionRateLimit, `branding-image-upload:${user.id}`);
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload payload" }, { status: 400 });
  }

  const fileEntry = formData.get("file");

  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await fileEntry.arrayBuffer());
  const result = await saveBrandingPublicImage(
    buffer,
    fileEntry.name,
    fileEntry.type || "application/octet-stream",
  );

  if (!("ok" in result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "branding_image",
    entityId: result.publicPath,
    after: { path: result.publicPath },
  });

  return NextResponse.json({
    success: true,
    path: result.publicPath,
  });
}
