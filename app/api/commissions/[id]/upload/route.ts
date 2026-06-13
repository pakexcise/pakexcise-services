import { NextResponse } from "next/server";
import { z } from "zod";

import { handleUploadCommissionProofBytes } from "@/features/commissions/lib/upload-commission-proof";
import { getCurrentUser } from "@/server/auth/current-user";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

export const maxDuration = 60;

const commissionIdParamSchema = z.string().cuid();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await getCurrentUser();

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await enforceRateLimit(serverActionRateLimit, `commission-proof-upload:${user.id}`);
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const idParsed = commissionIdParamSchema.safeParse(id);

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid commission id" }, { status: 400 });
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
  const contentType = fileEntry.type.trim() || "application/octet-stream";

  const result = await handleUploadCommissionProofBytes(
    user,
    idParsed.data,
    buffer,
    contentType,
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
