"use server";

import { headers } from "next/headers";

import { generateContactInquiryReferenceId } from "@/features/contact-inquiries/lib/reference-id";
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
import { submitContactInquirySchema } from "@/lib/validations/contact-inquiry";
import { formatPhoneForDisplay } from "@/lib/validations/phone";
import { getRequestMetaFromHeaders } from "@/server/auth/session";
import { contactInquiryRepository } from "@/server/repositories/contact-inquiry-repository";
import { hashIpAddress } from "@/server/security/hash";
import { sendFormSubmissionConfirmation } from "@/server/notifications/send-form-submission-confirmation";
import { trackActivityFromRequest } from "@/server/tracking/track-activity";
import {
  enforceRateLimit,
  publicFormRateLimit,
} from "@/server/security/rate-limit";

export type SubmitContactInquiryResult = {
  referenceId: string;
};

export async function submitContactInquiryAction(
  input: unknown,
): Promise<ActionResult<SubmitContactInquiryResult>> {
  const headerStore = await headers();
  const { ipAddress } = getRequestMetaFromHeaders(headerStore);
  const rateLimitKey = ipAddress ?? "anonymous";

  try {
    await enforceRateLimit(publicFormRateLimit, `contact-inquiry:${rateLimitKey}`);
  } catch {
    return errorResult("Too many requests. Please try again in a minute.");
  }

  const featureFlags = await getFeatureFlagSettings();

  if (!featureFlags.contactFormEnabled) {
    return errorResult("Contact form is currently unavailable.");
  }

  const parsed = parseInput(submitContactInquirySchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const inquiry = await contactInquiryRepository.create({
    referenceId: await generateContactInquiryReferenceId(),
    fullName: parsed.data.fullName.trim(),
    phone: formatPhoneForDisplay(parsed.data.phone.trim()),
    email: parsed.data.email?.trim() || null,
    serviceInterest: parsed.data.serviceInterest.trim(),
    regionName: parsed.data.regionName?.trim() || null,
    cityName: parsed.data.cityName?.trim() || null,
    message: parsed.data.message?.trim() || null,
    locale: parsed.data.locale,
    ipHash: ipAddress ? hashIpAddress(ipAddress) : null,
  });

  await trackActivityFromRequest({
    event: "contact_form_submit",
    metadata: {
      locale: parsed.data.locale,
      has_email: Boolean(parsed.data.email?.trim()),
    },
  });

  if (inquiry.email) {
    const forms = await getFormsSettings();

    if (
      featureFlags.emailNotificationsEnabled &&
      forms.contactAutoReplyEnabled
    ) {
      try {
        await sendFormSubmissionConfirmation({
          to: inquiry.email,
          customerName: inquiry.fullName,
          referenceId: inquiry.referenceId,
          submissionLabel: "Contact inquiry",
        });
      } catch {
        console.error("[email:contact-confirmation] delivery failed");
      }
    }
  }

  return successResult({
    referenceId: inquiry.referenceId,
  });
}
