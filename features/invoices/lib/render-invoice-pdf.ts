import "server-only";

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";

import {
  InvoicePdfDocument,
  type InvoicePdfData,
} from "@/features/invoices/lib/invoice-pdf-document";

export async function renderInvoicePdfBuffer(
  data: InvoicePdfData,
): Promise<Buffer> {
  const element = React.createElement(InvoicePdfDocument, { data });
  const buffer = await renderToBuffer(
    element as Parameters<typeof renderToBuffer>[0],
  );
  return Buffer.from(buffer);
}
