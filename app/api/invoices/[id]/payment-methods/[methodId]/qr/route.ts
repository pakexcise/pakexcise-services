import { NextResponse } from "next/server";

import { handleInvoicePaymentMethodQrContent } from "@/features/invoices/lib/invoice-payment-method-qr-content";
import { invoiceIdParamSchema } from "@/lib/validations/route-params";
import { getCurrentUser } from "@/server/auth/current-user";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

type RouteContext = {
  params: Promise<{ id: string; methodId: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await getCurrentUser();

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await enforceRateLimit(serverActionRateLimit, `invoice-qr:${user.id}`);
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id, methodId } = await context.params;
  const invoiceIdParsed = invoiceIdParamSchema.safeParse(id);

  if (!invoiceIdParsed.success || !methodId.trim()) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await handleInvoicePaymentMethodQrContent(
    user,
    invoiceIdParsed.data,
    methodId.trim(),
  );

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
