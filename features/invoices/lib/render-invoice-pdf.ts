import "server-only";

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";

import {
  getBrandingAssetDataUri,
  getBrandingAssetDataUriFromPath,
} from "@/features/invoices/lib/branding-asset-path";
import {
  resolveLogoIconPath,
} from "@/features/settings/lib/branding-resolvers";
import { getBrandingSettings } from "@/features/settings/lib/public-settings-cache";
import {
  InvoicePdfDocument,
  type InvoicePdfData,
  type InvoicePdfPaymentMethod,
} from "@/features/invoices/lib/invoice-pdf-document";
import { getStoredImageDataUri } from "@/features/payment-methods/lib/payment-method-qr";
import type { PaymentMethodDisplayFields } from "@/features/payment-methods/lib/format-payment-method";

type RenderInvoicePdfInput = Omit<InvoicePdfData, "brandMarkSrc" | "paymentMethods"> & {
  paymentMethods?: Array<
    PaymentMethodDisplayFields & {
      qrCodeR2Key?: string | null;
      qrCodeMimeType?: string | null;
    }
  >;
};

async function enrichPaymentMethodsForPdf(
  methods: RenderInvoicePdfInput["paymentMethods"],
): Promise<InvoicePdfPaymentMethod[]> {
  if (!methods || methods.length === 0) {
    return [];
  }

  return Promise.all(
    methods.map(async (method) => {
      const qrCodeDataUri =
        method.qrCodeR2Key && method.qrCodeMimeType
          ? await getStoredImageDataUri({
              key: method.qrCodeR2Key,
              mimeType: method.qrCodeMimeType,
            })
          : null;

      return {
        ...method,
        qrCodeDataUri,
      };
    }),
  );
}

export async function renderInvoicePdfBuffer(
  data: RenderInvoicePdfInput,
): Promise<Buffer> {
  const paymentMethods = await enrichPaymentMethodsForPdf(data.paymentMethods);
  const branding = await getBrandingSettings();
  const logoIconPath = resolveLogoIconPath(branding);
  const brandMarkSrc =
    getBrandingAssetDataUriFromPath(logoIconPath) ??
    getBrandingAssetDataUri("logoIcon");

  const element = React.createElement(InvoicePdfDocument, {
    data: {
      ...data,
      paymentMethods,
      brandMarkSrc,
    },
  });
  const buffer = await renderToBuffer(
    element as Parameters<typeof renderToBuffer>[0],
  );
  return Buffer.from(buffer);
}
