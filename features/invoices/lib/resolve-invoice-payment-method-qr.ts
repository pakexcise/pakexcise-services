import "server-only";

import { getStoredImageDataUri } from "@/features/payment-methods/lib/payment-method-qr";
import { readPaymentMethodQrContent } from "@/features/payment-methods/lib/payment-method-qr-content";
import { adminPaymentMethodRepository } from "@/server/repositories/admin-payment-method-repository";

export type InvoicePaymentMethodQrSource = {
  qrCodeR2Key?: string | null;
  qrCodeMimeType?: string | null;
  paymentMethodId?: string | null;
};

async function collectQrCandidates(
  input: InvoicePaymentMethodQrSource,
): Promise<Array<{ key: string; mimeType: string }>> {
  const candidates: Array<{ key: string; mimeType: string }> = [];
  const seen = new Set<string>();

  function addCandidate(
    key: string | null | undefined,
    mimeType: string | null | undefined,
  ) {
    const trimmedKey = key?.trim();

    if (!trimmedKey || seen.has(trimmedKey)) {
      return;
    }

    seen.add(trimmedKey);
    candidates.push({
      key: trimmedKey,
      mimeType: mimeType?.trim() || "image/png",
    });
  }

  addCandidate(input.qrCodeR2Key, input.qrCodeMimeType);

  if (input.paymentMethodId) {
    const live = await adminPaymentMethodRepository.findById(input.paymentMethodId);
    addCandidate(live?.qrCodeR2Key, live?.qrCodeMimeType);
  }

  return candidates;
}

export async function resolveInvoicePaymentMethodQrDataUri(
  input: InvoicePaymentMethodQrSource,
): Promise<string | null> {
  const candidates = await collectQrCandidates(input);

  for (const candidate of candidates) {
    const dataUri = await getStoredImageDataUri(candidate);

    if (dataUri) {
      return dataUri;
    }
  }

  return null;
}

export async function resolveInvoicePaymentMethodQrContent(input: {
  source: InvoicePaymentMethodQrSource;
  fileName: string;
}) {
  const candidates = await collectQrCandidates(input.source);

  for (const candidate of candidates) {
    const result = await readPaymentMethodQrContent({
      qrCodeR2Key: candidate.key,
      qrCodeMimeType: candidate.mimeType,
      fileName: input.fileName,
    });

    if (!("error" in result)) {
      return result;
    }
  }

  return { status: 404, error: "QR code not found" } as const;
}
