"use server";

import { headers } from "next/headers";

import { generateGuestLeadReferenceId } from "@/features/guest-leads/lib/reference-id";
import {
  getFeatureFlagSettings,
  getFormsSettings,
} from "@/features/settings/lib/public-settings-cache";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { submitGuestLeadSchema } from "@/lib/validations/guest-lead";
import { formatPhoneForDisplay } from "@/lib/validations/phone";
import { getRequestMetaFromHeaders } from "@/server/auth/session";
import { guestLeadRepository } from "@/server/repositories/guest-lead-repository";
import { serviceRepository } from "@/server/repositories/service-repository";
import { hashIpAddress } from "@/server/security/hash";
import { sendFormSubmissionConfirmation } from "@/server/notifications/send-form-submission-confirmation";
import {
  enforceRateLimit,
  publicFormRateLimit,
} from "@/server/security/rate-limit";
import { trackActivityFromRequest } from "@/server/tracking/track-activity";

export type SubmitGuestLeadResult = {
  referenceId: string;
};

export async function submitGuestLeadAction(
  input: unknown,
): Promise<ActionResult<SubmitGuestLeadResult>> {
  const headerStore = await headers();
  const { ipAddress } = getRequestMetaFromHeaders(headerStore);
  const rateLimitKey = ipAddress ?? "anonymous";

  try {
    await enforceRateLimit(publicFormRateLimit, `guest-lead:${rateLimitKey}`);
  } catch {
    return errorResult("Too many requests. Please try again in a minute.");
  }

  const featureFlags = await getFeatureFlagSettings();

  if (!featureFlags.submitRequestEnabled) {
    return errorResult("Service requests are currently unavailable.");
  }

  const parsed = parseInput(submitGuestLeadSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const service = await serviceRepository.findPublicDetailBySlug(
    parsed.data.serviceSlug,
  );

  if (!service) {
    return errorResult("Service not found or unavailable.");
  }

  const regionInput = parsed.data.regionName?.trim() || null;

  const lead = await guestLeadRepository.create({
    referenceId: await generateGuestLeadReferenceId(),
    serviceId: service.id,
    serviceNameEn: service.nameEn,
    regionNameEn: regionInput,
    cityName: parsed.data.cityName?.trim() || null,
    fullName: parsed.data.fullName.trim(),
    phone: formatPhoneForDisplay(parsed.data.phone.trim()),
    email: parsed.data.email?.trim() || null,
    vehicleInfo: parsed.data.vehicleInfo?.trim() || null,
    licenseInfo: parsed.data.licenseInfo?.trim() || null,
    message: parsed.data.message?.trim() || null,
    locale: parsed.data.locale,
    ipHash: ipAddress ? hashIpAddress(ipAddress) : null,
  });

  await trackActivityFromRequest({
    event: "contact_form_submit",
    metadata: {
      locale: parsed.data.locale,
      source: "guest_lead",
      service_slug: service.slug,
    },
  });

  if (lead.email) {
    const forms = await getFormsSettings();

    if (
      featureFlags.emailNotificationsEnabled &&
      forms.submitRequestAutoReplyEnabled
    ) {
      try {
        await sendFormSubmissionConfirmation({
          to: lead.email,
          customerName: lead.fullName,
          referenceId: lead.referenceId,
          submissionLabel: "Service request",
        });
      } catch {
        console.error("[email:service-request-confirmation] delivery failed");
      }
    }
  }

  return successResult({
    referenceId: lead.referenceId,
  });
}
