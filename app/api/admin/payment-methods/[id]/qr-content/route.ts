import { NextResponse } from "next/server";

import { readPaymentMethodQrContent } from "@/features/payment-methods/lib/payment-method-qr-content";
import { paymentMethodIdSchema } from "@/lib/validations/admin-payment-method";
import { adminPaymentMethodRepository } from "@/server/repositories/admin-payment-method-repository";
import { requirePermission } from "@/server/permissions/guards";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await requirePermission("payment-method:manage");

  try {
    await enforceRateLimit(serverActionRateLimit, `payment-method-qr-view:${user.id}`);
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const idParsed = paymentMethodIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid payment method id" }, { status: 400 });
  }

  const method = await adminPaymentMethodRepository.findById(idParsed.data.id);

  if (!method) {
    return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
  }

  const result = await readPaymentMethodQrContent({
    qrCodeR2Key: method.qrCodeR2Key,
    qrCodeMimeType: method.qrCodeMimeType,
    fileName: `${method.code}-qr.png`,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return new NextResponse(new Uint8Array(result.body), {
    status: 200,
    headers: {
      "Content-Type": result.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(result.fileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
