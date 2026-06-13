import { NextResponse } from "next/server";

import {
  handleRemovePaymentMethodQr,
  handleUploadPaymentMethodQrBytes,
} from "@/features/payment-methods/lib/upload-payment-method-qr";
import { paymentMethodIdSchema } from "@/lib/validations/admin-payment-method";
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
  const user = await requirePermission("payment-method:manage");

  try {
    await enforceRateLimit(serverActionRateLimit, `payment-method-qr:${user.id}`);
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const idParsed = paymentMethodIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid payment method id" }, { status: 400 });
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

  const result = await handleUploadPaymentMethodQrBytes(
    user.id,
    idParsed.data.id,
    buffer,
    fileEntry.name,
    contentType,
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await requirePermission("payment-method:manage");

  const { id } = await context.params;
  const idParsed = paymentMethodIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid payment method id" }, { status: 400 });
  }

  const result = await handleRemovePaymentMethodQr(user.id, idParsed.data.id);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
