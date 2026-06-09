import { NextResponse } from "next/server";

import { canViewInvoicePdf } from "@/features/invoices/lib/invoice-access";
import { getCurrentUser } from "@/server/auth/current-user";
import { invoiceRepository } from "@/server/repositories/invoice-repository";
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
    await enforceRateLimit(serverActionRateLimit, `invoice-pdf:${user.id}`);
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const invoice = await invoiceRepository.findByIdForAccess(id);

  if (!invoice?.pdfR2Key || invoice.status !== "SENT") {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (!canViewInvoicePdf(user, invoice.application)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const presigned = await createPresignedDownloadUrl({
      key: invoice.pdfR2Key,
      fileName: `${invoice.invoiceNumber}.pdf`,
      mimeType: "application/pdf",
      purpose: "invoice",
    });

    return NextResponse.json({
      signedUrl: presigned.signedUrl,
      expiresInSeconds: presigned.expiresInSeconds,
      invoiceNumber: invoice.invoiceNumber,
    });
  } catch {
    return NextResponse.json({ error: "Could not create signed URL" }, { status: 503 });
  }
}
