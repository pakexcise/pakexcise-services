import { NextResponse } from "next/server";

import {
  handleRemovePlateFormatImage,
  handleUploadPlateFormatImageBytes,
} from "@/features/regions/lib/upload-plate-format-image";
import { regionPlateFormatIdSchema } from "@/lib/validations/admin-region-plate-format";
import { requirePermission } from "@/server/permissions/guards";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await requirePermission("region:manage");

  try {
    await enforceRateLimit(serverActionRateLimit, `plate-format-image:${user.id}`);
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const idParsed = regionPlateFormatIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid format id" }, { status: 400 });
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
  const result = await handleUploadPlateFormatImageBytes(
    user.id,
    idParsed.data.id,
    buffer,
    fileEntry.name,
    fileEntry.type || "application/octet-stream",
  );

  if (!("ok" in result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await requirePermission("region:manage");

  const { id } = await context.params;
  const idParsed = regionPlateFormatIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid format id" }, { status: 400 });
  }

  const result = await handleRemovePlateFormatImage(user.id, idParsed.data.id);

  if (!("ok" in result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
