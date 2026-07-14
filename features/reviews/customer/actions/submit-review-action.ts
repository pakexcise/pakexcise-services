"use server";

import { revalidatePath } from "next/cache";

import { submitCustomerReviewSchema } from "@/lib/validations/customer-review";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { requireCustomerPortal } from "@/server/permissions/guards";
import { prisma } from "@/server/db/client";
import {
  enforceRateLimit,
  serverActionRateLimit,
} from "@/server/security/rate-limit";
import { writeAuditLog } from "@/server/security/audit";
import { getRequestMeta } from "@/server/auth/session";

export async function submitCustomerReviewAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireCustomerPortal();
  await enforceRateLimit(serverActionRateLimit, `review:${user.id}`);

  const parsed = parseInput(submitCustomerReviewSchema, input);
  if (!parsed.success) return parsed;

  const application = await prisma.application.findFirst({
    where: {
      id: parsed.data.applicationId,
      userId: user.id,
      status: "COMPLETED",
    },
    select: {
      id: true,
      trackingId: true,
      serviceId: true,
      service: {
        select: {
          nameEn: true,
          slug: true,
        },
      },
      review: {
        select: { id: true },
      },
    },
  });

  if (!application) {
    return errorResult("Choose a completed application that you own.");
  }

  if (application.review) {
    return errorResult("You already submitted a review for this application.");
  }

  const displayOrder =
    ((
      await prisma.review.findFirst({
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      })
    )?.displayOrder ?? 0) + 1;

  const review = await prisma.review.create({
    data: {
      authorNameEn: parsed.data.authorNameEn,
      authorRoleEn: application.service.nameEn,
      contentEn: parsed.data.contentEn,
      rating: parsed.data.rating,
      source: "CUSTOMER",
      status: "PENDING",
      isActive: false,
      customerConsent: true,
      displayOrder,
      userId: user.id,
      applicationId: application.id,
      serviceId: application.serviceId,
      submittedAt: new Date(),
    },
  });

  const meta = await getRequestMeta();
  await writeAuditLog({
    actorId: user.id,
    action: "CREATE",
    entityType: "review",
    entityId: review.id,
    after: {
      source: "CUSTOMER",
      rating: parsed.data.rating,
      applicationId: application.id,
      trackingId: application.trackingId,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  revalidatePath("/reviews");
  revalidatePath("/admin/reviews");
  return successResult({ id: review.id });
}
