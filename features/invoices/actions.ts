"use server";

import { z } from "zod";

import { canTransitionApplicationStatus } from "@/features/applications/status-machine";
import { canEditSentInvoice } from "@/features/invoices/lib/can-edit-invoice";
import { composeInvoiceTotals } from "@/features/invoices/lib/compose-invoice-totals";
import { formatPkr } from "@/features/invoices/lib/format-pkr";
import { generateInvoiceNumber } from "@/features/invoices/lib/generate-invoice-number";
import { canCreateInvoiceForStatus } from "@/features/invoices/lib/invoice-eligibility";
import { persistInvoicePdf } from "@/features/invoices/lib/persist-invoice-pdf";
import {
  buildPaymentMethodSnapshot,
  formatPaymentMethodsSummary,
} from "@/features/payment-methods/lib/format-payment-method";
import { createInvoiceSchema, updateInvoiceSchema } from "@/features/invoices/validators";
import { applicationIdParamSchema } from "@/lib/validations/route-params";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { emitApplicationChange } from "@/server/realtime/application-events";
import { prisma } from "@/server/db/client";
import { queueInvoiceSentNotifications } from "@/server/notifications/queue-invoice-notification";
import { adminPaymentMethodRepository } from "@/server/repositories/admin-payment-method-repository";
import { invoiceRepository } from "@/server/repositories/invoice-repository";
import { requirePermission } from "@/server/permissions/guards";
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
  const { allLineItems, subtotal, taxTotal, total } = composeInvoiceTotals({
    locale,
    serviceFee: parsed.data.serviceFee,
    lineItems: parsed.data.lineItems,
    taxTotal: parsed.data.taxTotal,
  });

  if (total <= 0) {
    return errorResult("Invoice total must be greater than zero");
  }

  const selectedMethods = await adminPaymentMethodRepository.findActiveByIds(
    parsed.data.paymentMethodIds,
  );

  if (selectedMethods.length !== parsed.data.paymentMethodIds.length) {
    return errorResult("One or more selected payment methods are invalid or inactive");
  }

  const orderedMethods = parsed.data.paymentMethodIds
    .map((id) => selectedMethods.find((method) => method.id === id))
    .filter((method): method is NonNullable<typeof method> => Boolean(method));

  const paymentMethodSummary = formatPaymentMethodsSummary(orderedMethods, locale);
  const paymentInstructions = parsed.data.paymentInstructions ?? null;
  const officialFeeNote = parsed.data.officialFeeNote ?? null;
  const invoiceNotes = parsed.data.notes ?? null;

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
      notes: invoiceNotes,
      officialFeeNote,
      paymentMethod: paymentMethodSummary,
      paymentInstructions,
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
      paymentMethods: {
        create: orderedMethods.map((method, index) =>
          buildPaymentMethodSnapshot(method, index),
        ),
      },
    },
    include: {
      lineItems: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  try {
    const pdfR2Key = await persistInvoicePdf({
      applicationId: application.id,
      invoiceId: invoice.id,
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
      paymentMethods: orderedMethods.map((method) => ({
        type: method.type,
        nameEn: method.nameEn,
        nameUr: method.nameUr,
        accountTitleEn: method.accountTitleEn,
        accountTitleUr: method.accountTitleUr,
        accountNumber: method.accountNumber,
        iban: method.iban,
        bankNameEn: method.bankNameEn,
        bankNameUr: method.bankNameUr,
        instructionsEn: method.instructionsEn,
        instructionsUr: method.instructionsUr,
        qrCodeR2Key: method.qrCodeR2Key,
        qrCodeMimeType: method.qrCodeMimeType,
      })),
      paymentInstructions,
      officialFeeNote,
      notes: invoiceNotes,
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
      serviceNameUr: application.service.nameUr,
      locale: application.locale,
      total: formatPkr(total, locale),
      userEmail: application.user.email,
      userPhone: application.user.phone,
    });

    await emitApplicationChange({
      applicationId: application.id,
      userId: application.userId,
      agentId: application.agentId,
      status: "INVOICE_SENT",
      changeType: "invoice",
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

export async function updateSentInvoiceAction(
  input: unknown,
): Promise<
  ActionResult<{
    invoiceId: string;
    invoiceNumber: string;
    total: number;
  }>
> {
  const user = await requirePermission("invoice:manage");
  await enforceRateLimit(serverActionRateLimit, `invoice-edit:${user.id}`);

  const parsed = parseInput(updateInvoiceSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: parsed.data.invoiceId },
    include: {
      application: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { nameEn: true, nameUr: true } },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!invoice) {
    return errorResult("Invoice not found");
  }

  const latestPayment = invoice.payments[0] ?? null;

  if (
    !canEditSentInvoice({
      invoiceStatus: invoice.status,
      paymentStatus: latestPayment?.status,
    })
  ) {
    if (latestPayment?.status === "UPLOADED") {
      return errorResult(
        "Cannot edit invoice while a payment screenshot is awaiting verification. Reject the payment first if changes are required.",
      );
    }

    if (latestPayment?.status === "VERIFIED") {
      return errorResult("Cannot edit invoice after payment has been verified");
    }

    return errorResult("Only sent invoices awaiting payment can be edited");
  }

  const locale = parsed.data.locale;
  const { allLineItems, subtotal, taxTotal, total } = composeInvoiceTotals({
    locale,
    serviceFee: parsed.data.serviceFee,
    lineItems: parsed.data.lineItems,
    taxTotal: parsed.data.taxTotal,
  });

  if (total <= 0) {
    return errorResult("Invoice total must be greater than zero");
  }

  const selectedMethods = await adminPaymentMethodRepository.findActiveByIds(
    parsed.data.paymentMethodIds,
  );

  if (selectedMethods.length !== parsed.data.paymentMethodIds.length) {
    return errorResult("One or more selected payment methods are invalid or inactive");
  }

  const orderedMethods = parsed.data.paymentMethodIds
    .map((id) => selectedMethods.find((method) => method.id === id))
    .filter((method): method is NonNullable<typeof method> => Boolean(method));

  const paymentMethodSummary = formatPaymentMethodsSummary(orderedMethods, locale);
  const paymentInstructions = parsed.data.paymentInstructions ?? null;
  const officialFeeNote = parsed.data.officialFeeNote ?? null;
  const invoiceNotes = parsed.data.notes ?? null;
  const dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  const serviceName =
    locale === "ur"
      ? invoice.application.service.nameUr
      : invoice.application.service.nameEn;

  const beforeSnapshot = {
    subtotal: Number(invoice.subtotal),
    taxTotal: Number(invoice.taxTotal),
    total: Number(invoice.total),
    notes: invoice.notes,
    officialFeeNote: invoice.officialFeeNote,
    paymentMethod: invoice.paymentMethod,
    paymentInstructions: invoice.paymentInstructions,
    dueAt: invoice.dueAt?.toISOString() ?? null,
  };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.invoiceLineItem.deleteMany({
        where: { invoiceId: invoice.id },
      });
      await tx.invoicePaymentMethod.deleteMany({
        where: { invoiceId: invoice.id },
      });

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          subtotal,
          taxTotal,
          total,
          notes: invoiceNotes,
          officialFeeNote,
          paymentMethod: paymentMethodSummary,
          paymentInstructions,
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
          paymentMethods: {
            create: orderedMethods.map((method, index) =>
              buildPaymentMethodSnapshot(method, index),
            ),
          },
        },
      });

      if (latestPayment) {
        await tx.payment.update({
          where: { id: latestPayment.id },
          data: {
            amount: total,
            ...(latestPayment.status === "REJECTED"
              ? {
                  status: "PENDING",
                  screenshotR2Key: null,
                  screenshotFileName: null,
                  screenshotMimeType: null,
                  screenshotFileSize: null,
                  rejectionReason: null,
                  verifiedById: null,
                  verifiedAt: null,
                }
              : {}),
          },
        });
      }
    });

    const pdfR2Key = await persistInvoicePdf({
      applicationId: invoice.applicationId,
      invoiceId: invoice.id,
      locale,
      invoiceNumber: invoice.invoiceNumber,
      trackingId: invoice.application.trackingId,
      serviceName,
      customerName:
        invoice.application.user.name ?? invoice.application.user.email,
      issueDate: (invoice.sentAt ?? invoice.createdAt).toISOString().slice(0, 10),
      dueDate: dueAt?.toISOString().slice(0, 10) ?? null,
      lineItems: allLineItems,
      subtotal,
      taxTotal,
      total,
      paymentMethods: orderedMethods.map((method) => ({
        type: method.type,
        nameEn: method.nameEn,
        nameUr: method.nameUr,
        accountTitleEn: method.accountTitleEn,
        accountTitleUr: method.accountTitleUr,
        accountNumber: method.accountNumber,
        iban: method.iban,
        bankNameEn: method.bankNameEn,
        bankNameUr: method.bankNameUr,
        instructionsEn: method.instructionsEn,
        instructionsUr: method.instructionsUr,
        qrCodeR2Key: method.qrCodeR2Key,
        qrCodeMimeType: method.qrCodeMimeType,
      })),
      paymentInstructions,
      officialFeeNote,
      notes: invoiceNotes,
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfR2Key },
    });

    await auditAdminAction({
      actorId: user.id,
      action: "UPDATE",
      entityType: "invoice",
      entityId: invoice.id,
      before: beforeSnapshot,
      after: {
        subtotal,
        taxTotal,
        total,
        notes: invoiceNotes,
        officialFeeNote,
        paymentMethod: paymentMethodSummary,
        paymentInstructions,
        dueAt: dueAt?.toISOString() ?? null,
        editNote: parsed.data.editNote,
      },
    });

    await emitApplicationChange({
      applicationId: invoice.applicationId,
      userId: invoice.application.userId,
      agentId: invoice.application.agentId,
      status: invoice.application.status,
      changeType: "invoice",
    });

    return successResult({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      total,
    });
  } catch {
    return errorResult("Could not update invoice PDF or invoice data");
  }
}

export async function getCustomerInvoiceAction(
  input: unknown,
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

  const parsed = parseInput(
    z.object({ applicationId: applicationIdParamSchema }),
    input,
  );

  if (!parsed.success) {
    return parsed;
  }

  const applicationId = parsed.data.applicationId;

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
