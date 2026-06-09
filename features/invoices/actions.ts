"use server";

import { buildInvoicePdfKey } from "@/config/uploads";
import { canTransitionApplicationStatus } from "@/features/applications/status-machine";
import { formatPkr, roundMoney } from "@/features/invoices/lib/format-pkr";
import { generateInvoiceNumber } from "@/features/invoices/lib/generate-invoice-number";
import { canCreateInvoiceForStatus } from "@/features/invoices/lib/invoice-eligibility";
import { invoicePdfLabels } from "@/features/invoices/lib/invoice-labels";
import { renderInvoicePdfBuffer } from "@/features/invoices/lib/render-invoice-pdf";
import { createInvoiceSchema } from "@/features/invoices/validators";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { queueInvoiceSentNotifications } from "@/server/notifications/queue-invoice-notification";
import { invoiceRepository } from "@/server/repositories/invoice-repository";
import { requirePermission } from "@/server/permissions/guards";
import { putR2Object } from "@/server/r2/put-object";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

export async function createAndSendInvoiceAction(
  input: unknown,
): Promise<
  ActionResult<{
    invoiceId: string;
    invoiceNumber: string;
    applicationStatus: string;
  }>
> {
  const user = await requirePermission("invoice:manage");
  await enforceRateLimit(serverActionRateLimit, `invoice:${user.id}`);

  const parsed = parseInput(createInvoiceSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const application = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      service: { select: { nameEn: true, nameUr: true } },
    },
  });

  if (!application) {
    return errorResult("Application not found");
  }

  if (!canCreateInvoiceForStatus(application.status)) {
    return errorResult(
      "Invoice can only be created after review when documents are acceptable",
    );
  }

  if (!canTransitionApplicationStatus(application.status, "INVOICE_SENT")) {
    return errorResult("Application cannot move to invoice sent from this status");
  }

  const hasActiveInvoice = await invoiceRepository.hasActiveSentInvoice(
    application.id,
  );

  if (hasActiveInvoice) {
    return errorResult("An active sent invoice already exists for this application");
  }

  const locale = parsed.data.locale;
  const serviceFeeLabel = invoicePdfLabels[locale].serviceFee;

  const allLineItems = [
    {
      label: serviceFeeLabel,
      description: null as string | null,
      amount: parsed.data.serviceFee,
      isOfficialFee: false,
    },
    ...parsed.data.lineItems,
  ];

  const subtotal = roundMoney(
    allLineItems.reduce((sum, item) => sum + item.amount, 0),
  );
  const taxTotal = roundMoney(parsed.data.taxTotal);
  const total = roundMoney(subtotal + taxTotal);

  if (total <= 0) {
    return errorResult("Invoice total must be greater than zero");
  }

  const invoiceNumber = generateInvoiceNumber();
  const dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  const serviceName =
    locale === "ur" ? application.service.nameUr : application.service.nameEn;

  const invoice = await prisma.invoice.create({
    data: {
      applicationId: application.id,
      invoiceNumber,
      status: "DRAFT",
      subtotal,
      taxTotal,
      total,
      currency: "PKR",
      notes: parsed.data.notes ?? null,
      officialFeeNote: parsed.data.officialFeeNote ?? null,
      paymentMethod: parsed.data.paymentMethod,
      paymentInstructions: parsed.data.paymentInstructions,
      locale,
      dueAt,
      lineItems: {
        create: allLineItems.map((item, index) => ({
          label: item.label,
          description: item.description ?? null,
          amount: item.amount,
          isOfficialFee: item.isOfficialFee,
          displayOrder: index,
        })),
      },
    },
    include: {
      lineItems: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  try {
    const pdfBuffer = await renderInvoicePdfBuffer({
      locale,
      invoiceNumber,
      trackingId: application.trackingId,
      serviceName,
      customerName: application.user.name ?? application.user.email,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: dueAt?.toISOString().slice(0, 10) ?? null,
      lineItems: invoice.lineItems.map((item) => ({
        label: item.label,
        description: item.description,
        amount: Number(item.amount),
        isOfficialFee: item.isOfficialFee,
      })),
      subtotal,
      taxTotal,
      total,
      paymentMethod: parsed.data.paymentMethod,
      paymentInstructions: parsed.data.paymentInstructions,
      officialFeeNote: parsed.data.officialFeeNote ?? null,
      notes: parsed.data.notes ?? null,
    });

    const pdfR2Key = buildInvoicePdfKey({
      applicationId: application.id,
      invoiceId: invoice.id,
    });

    await putR2Object({
      key: pdfR2Key,
      body: pdfBuffer,
      contentType: "application/pdf",
    });

    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "SENT",
          pdfR2Key,
          sentAt: new Date(),
        },
      });

      await tx.payment.create({
        data: {
          applicationId: application.id,
          invoiceId: invoice.id,
          amount: total,
          status: "PENDING",
        },
      });

      await tx.application.update({
        where: { id: application.id },
        data: { status: "INVOICE_SENT" },
      });

      await tx.statusHistory.create({
        data: {
          applicationId: application.id,
          fromStatus: application.status,
          toStatus: "INVOICE_SENT",
          note: parsed.data.statusNote,
          actorId: user.id,
        },
      });
    });

    await auditAdminAction({
      actorId: user.id,
      action: "CREATE",
      entityType: "invoice",
      entityId: invoice.id,
      after: {
        invoiceNumber,
        total,
        applicationId: application.id,
      },
    });

    await auditAdminAction({
      actorId: user.id,
      action: "STATUS_CHANGE",
      entityType: "application",
      entityId: application.id,
      before: { status: application.status },
      after: { status: "INVOICE_SENT", note: parsed.data.statusNote },
    });

    await queueInvoiceSentNotifications({
      applicationId: application.id,
      userId: application.user.id,
      trackingId: application.trackingId,
      invoiceNumber,
      serviceName: application.service.nameEn,
      total: formatPkr(total, locale),
      userEmail: application.user.email,
      userPhone: application.user.phone,
    });

    return successResult({
      invoiceId: invoice.id,
      invoiceNumber,
      applicationStatus: "INVOICE_SENT",
    });
  } catch {
    await prisma.invoice.delete({ where: { id: invoice.id } });
    return errorResult("Could not generate or store invoice PDF");
  }
}

export async function getCustomerInvoiceAction(
  applicationId: string,
): Promise<
  ActionResult<
    NonNullable<
      Awaited<
        ReturnType<typeof invoiceRepository.findCustomerInvoiceByApplication>
      >
    >
  >
> {
  const { requireUser } = await import("@/server/permissions/guards");
  const user = await requireUser();

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: user.id },
    select: { id: true },
  });

  if (!application) {
    return errorResult("Application not found");
  }

  const invoice = await invoiceRepository.findCustomerInvoiceByApplication({
    applicationId,
    userId: user.id,
  });

  if (!invoice) {
    return errorResult("Invoice not found");
  }

  return successResult(invoice);
}
