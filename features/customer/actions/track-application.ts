"use server";

import { headers } from "next/headers";

import { trackApplicationSchema } from "@/features/customer/validators";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult} from "@/lib/validations/common";
import { getRequestMetaFromHeaders } from "@/server/auth/session";
import { customerApplicationRepository } from "@/server/repositories/customer-application-repository";
import {
  enforceRateLimit,
  trackLookupRateLimit} from "@/server/security/rate-limit";

export type PublicTrackResult = {
  trackingId: string;
  status: string;
  serviceNameEn: string;
  updatedAt: string;
};

export async function trackApplicationAction(
  input: unknown,
): Promise<ActionResult<PublicTrackResult>> {
  const headerStore = await headers();
  const { ipAddress } = getRequestMetaFromHeaders(headerStore);
  const rateLimitKey = ipAddress ?? "anonymous";

  try {
    await enforceRateLimit(trackLookupRateLimit, `track:${rateLimitKey}`);
  } catch {
    return errorResult("Too many lookup attempts. Please try again later.");
  }

  const parsed = parseInput(trackApplicationSchema, input);

  if (!parsed.success) {
    return errorResult("Invalid tracking ID format.");
  }

  const application =
    await customerApplicationRepository.findPublicByTrackingId(
      parsed.data.trackingId,
    );

  if (!application) {
    return errorResult(
      "No application found for this tracking ID. Check the ID and try again.",
    );
  }

  return successResult({
    trackingId: application.trackingId,
    status: application.status,
    serviceNameEn: application.service.nameEn,
    updatedAt: application.updatedAt.toISOString()});
}
