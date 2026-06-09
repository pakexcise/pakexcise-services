import "server-only";

import type { Prisma } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";

const customerInvoiceSelect = {
  id: true,
  invoiceNumber: true,
  status: true,
  subtotal: true,
  taxTotal: true,
  total: true,
  currency: true,
  notes: true,
  officialFeeNote: true,
  paymentMethod: true,
  paymentInstructions: true,
  locale: true,
  sentAt: true,
  dueAt: true,
  createdAt: true,
  pdfR2Key: true,
  lineItems: {
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      label: true,
      description: true,
      amount: true,
      isOfficialFee: true,
    },
  },
  payments: {
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      id: true,
      status: true,
      amount: true,
      rejectionReason: true,
      screenshotFileName: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const satisfies Prisma.InvoiceSelect;

export type CustomerInvoiceDetail = Prisma.InvoiceGetPayload<{
  select: typeof customerInvoiceSelect;
}>;

export class InvoiceRepository extends Repository {
  async findCustomerInvoiceByApplication(input: {
    applicationId: string;
    userId: string;
  }): Promise<CustomerInvoiceDetail | null> {
    return this.db.invoice.findFirst({
      where: {
        applicationId: input.applicationId,
        status: "SENT",
        application: { userId: input.userId },
      },
      orderBy: { sentAt: "desc" },
      select: customerInvoiceSelect,
    });
  }

  async findByIdForAccess(invoiceId: string) {
    return this.db.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        applicationId: true,
        invoiceNumber: true,
        pdfR2Key: true,
        status: true,
        application: {
          select: {
            userId: true,
            agentId: true,
            trackingId: true,
          },
        },
      },
    });
  }

  async hasActiveSentInvoice(applicationId: string): Promise<boolean> {
    const count = await this.db.invoice.count({
      where: {
        applicationId,
        status: "SENT",
      },
    });
    return count > 0;
  }
}

export const invoiceRepository = new InvoiceRepository();
