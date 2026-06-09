import { NextResponse } from "next/server";

import { canViewPaymentScreenshot } from "@/features/payments/lib/payment-access";
import { paymentIdParamSchema } from "@/lib/validations/route-params";
import { getCurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/client";
import { createPresignedDownloadUrl } from "@/server/r2/presign-download";
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

  const payment = await prisma.payment.findUnique({
    where: { id: idParsed.data },
    select: {
      id: true,
      screenshotR2Key: true,
      screenshotFileName: true,
      screenshotMimeType: true,
      status: true,
      application: {
        select: {
          userId: true,
          agentId: true,
        },
      },
    },
  });

  if (!payment?.screenshotR2Key) {
    return NextResponse.json({ error: "Payment screenshot not found" }, { status: 404 });
  }

  if (!canViewPaymentScreenshot(user, payment.application)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const presigned = await createPresignedDownloadUrl({
      key: payment.screenshotR2Key,
      fileName: payment.screenshotFileName ?? "payment-screenshot",
      mimeType: payment.screenshotMimeType ?? "image/jpeg",
      purpose: "view",
    });

    return NextResponse.json({
      signedUrl: presigned.signedUrl,
      expiresInSeconds: presigned.expiresInSeconds,
      mimeType: payment.screenshotMimeType,
      fileName: payment.screenshotFileName,
    });
  } catch {
    return NextResponse.json({ error: "Could not create signed URL" }, { status: 503 });
  }
}
