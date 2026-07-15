"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { submitCustomerReviewSchema } from "@/lib/validations/customer-review";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { getCurrentUser } from "@/server/auth/current-user";
import { getRequestMeta } from "@/server/auth/session";
import { prisma } from "@/server/db/client";
import {
  checkRateLimit,
  reviewSubmissionRateLimit,
} from "@/server/security/rate-limit";
import { writeAuditLog } from "@/server/security/audit";
import { verifyTurnstileToken } from "@/server/security/turnstile";

export async function submitCustomerReviewAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(submitCustomerReviewSchema, input);
  if (!parsed.success) return parsed;

  const [user, meta] = await Promise.all([getCurrentUser(), getRequestMeta()]);
  const identifier = meta.ipAddress ?? user?.id ?? "unknown";

  if (!reviewSubmissionRateLimit && process.env.NODE_ENV === "production") {
    return errorResult("Review submission is temporarily unavailable.");
  }

  const rateLimit = await checkRateLimit(
    reviewSubmissionRateLimit,
    identifier,
  ).catch(() => null);
  if (!rateLimit) {
    return errorResult("Review verification is temporarily unavailable. Please try again.");
  }

  if (!rateLimit.success) {
    return errorResult("Too many review attempts. Please try again later.");
  }

  const elapsed = Date.now() - parsed.data.formStartedAt;
  if (parsed.data.website || elapsed < 3_000 || elapsed > 7_200_000) {
    return errorResult("Review verification failed. Refresh the page and try again.");
  }

  const turnstileValid = await verifyTurnstileToken(
    parsed.data.turnstileToken,
    meta.ipAddress,
  );
  if (!turnstileValid) {
    return errorResult("Please complete the anti-spam check and try again.");
  }

  const service = await prisma.service.findFirst({
    where: {
      id: parsed.data.serviceId,
      isActive: true,
      deletedAt: null,
    },
    select: { id: true, nameEn: true },
  });
  if (!service) {
    return errorResult("Choose an available service.");
  }

  let application: {
    id: string;
    trackingId: string;
    serviceId: string;
    review: { id: string } | null;
  } | null = null;

  if (parsed.data.applicationId) {
    if (!user || user.role !== "CUSTOMER" || user.status !== "ACTIVE") {
      return errorResult("Log in to link feedback to a completed application.");
    }

    application = await prisma.application.findFirst({
      where: {
        id: parsed.data.applicationId,
        userId: user.id,
        serviceId: service.id,
        status: "COMPLETED",
      },
      select: {
        id: true,
        trackingId: true,
        serviceId: true,
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
  }

  const duplicate = await prisma.review.findFirst({
    where: {
      authorNameEn: parsed.data.authorNameEn,
      contentEn: parsed.data.contentEn,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: { id: true },
  });
  if (duplicate) {
    return errorResult("This review has already been submitted.");
  }

  const displayOrder =
    ((
      await prisma.review.findFirst({
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      })
    )?.displayOrder ?? 0) + 1;
  const reviewAuthorId =
    user?.role === "CUSTOMER" && user.status === "ACTIVE" ? user.id : null;

  let review: { id: string };
  try {
    review = await prisma.review.create({
      data: {
        authorNameEn: parsed.data.authorNameEn,
        authorRoleEn: service.nameEn,
        contentEn: parsed.data.contentEn,
        rating: parsed.data.rating,
        source: "CUSTOMER",
        status: "PENDING",
        isActive: false,
        customerConsent: true,
        displayOrder,
        userId: reviewAuthorId,
        applicationId: application?.id ?? null,
        serviceId: service.id,
        submittedAt: new Date(),
      },
      select: { id: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResult("This application already has a review.");
    }
    throw error;
  }

  await writeAuditLog({
    actorId: user?.status === "ACTIVE" ? user.id : null,
    action: "CREATE",
    entityType: "review",
    entityId: review.id,
    after: {
      source: "CUSTOMER",
      rating: parsed.data.rating,
      applicationId: application?.id ?? null,
      trackingId: application?.trackingId ?? null,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  revalidatePath("/reviews");
  revalidatePath("/admin/reviews");
  return successResult({ id: review.id });
}
