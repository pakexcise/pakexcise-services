import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";

import { COMPLETION_PROOF_DOC_TYPE } from "@/config/uploads";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { resolveCustomerNextAction } from "@/features/customer/lib/next-action";
import { formatDateTime } from "@/lib/utils";
import { applicationIdParamSchema } from "@/lib/validations/route-params";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { agentApplicationRepository } from "@/server/repositories/agent-application-repository";
import { customerApplicationRepository } from "@/server/repositories/customer-application-repository";
import { invoiceRepository } from "@/server/repositories/invoice-repository";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const parsedId = applicationIdParamSchema.safeParse(id);

  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid application id" }, { status: 400 });
  }

  const applicationId = parsedId.data;
  const locale = await getCurrentLocale();
  const tStatus = await getTranslations("admin.statuses");
  const tNextAction = await getTranslations("customer.nextAction");

  if (user.role === "CUSTOMER") {
    const application = await customerApplicationRepository.findOwnedById({
      id: applicationId,
      userId: user.id,
    });

    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const invoice = await invoiceRepository.findCustomerInvoiceByApplication({
      applicationId: application.id,
      userId: user.id,
    });
    const payment = invoice?.payments[0] ?? null;
    const completionProof = application.documents.find(
      (doc) => doc.type === COMPLETION_PROOF_DOC_TYPE,
    );

    const nextAction = resolveCustomerNextAction({
      status: application.status,
      hasInvoice: Boolean(invoice),
      paymentStatus: payment?.status ?? null,
      hasCompletionProof: Boolean(completionProof),
    });

    return NextResponse.json({
      applicationId: application.id,
      trackingId: application.trackingId,
      status: application.status,
      updatedAt: application.updatedAt.toISOString(),
      nextAction,
      statusLabelText: tStatus(getApplicationStatusLabelKey(application.status)),
      nextActionLabelText: tNextAction(nextAction),
      formattedUpdatedAt: formatDateTime(application.updatedAt, locale),
      statusHistory: application.statusHistory.map((entry) => ({
        id: entry.id,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        createdAt: entry.createdAt.toISOString(),
      })),
    });
  }

  if (user.role === "AGENT") {
    const application = await agentApplicationRepository.findAssignedById({
      id: applicationId,
      agentId: user.id,
    });

    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      applicationId: application.id,
      trackingId: application.trackingId,
      status: application.status,
      updatedAt: application.updatedAt.toISOString(),
      nextAction: null,
      statusLabelText: tStatus(getApplicationStatusLabelKey(application.status)),
      nextActionLabelText: null,
      formattedUpdatedAt: formatDateTime(application.updatedAt, locale),
      statusHistory: application.statusHistory.map((entry) => ({
        id: entry.id,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        createdAt: entry.createdAt.toISOString(),
      })),
    });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
