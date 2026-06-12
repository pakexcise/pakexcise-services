import { NextResponse } from "next/server";

import { handlePaymentScreenshotContent } from "@/features/payments/lib/payment-screenshot-view";
import { paymentIdParamSchema } from "@/lib/validations/route-params";
import { getCurrentUser } from "@/server/auth/current-user";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

type RouteContext = {
  params: Promise<{ id: string }>;
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
    await enforceRateLimit(serverActionRateLimit, `pay-view:${user.id}`);
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const idParsed = paymentIdParamSchema.safeParse(id);

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid payment id" }, { status: 400 });
  }

  const result = await handlePaymentScreenshotContent(user, idParsed.data);

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
