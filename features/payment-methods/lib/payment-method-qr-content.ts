import "server-only";

import { readStoredObject } from "@/server/storage/object-storage";

export type PaymentMethodQrContentResult =
  | {
      body: Buffer;
      mimeType: string;
      fileName: string;
    }
  | {
      status: number;
      error: string;
    };

export async function readPaymentMethodQrContent(input: {
  qrCodeR2Key: string | null | undefined;
  qrCodeMimeType: string | null | undefined;
  fileName: string;
}): Promise<PaymentMethodQrContentResult> {
  if (!input.qrCodeR2Key?.trim()) {
    return { status: 404, error: "QR code not found" };
  }

  try {
    const body = await readStoredObject(input.qrCodeR2Key);
    const mimeType = input.qrCodeMimeType?.trim() || "image/png";

    return {
      body,
      mimeType,
      fileName: input.fileName,
    };
  } catch {
    return { status: 404, error: "QR code not found" };
  }
}
