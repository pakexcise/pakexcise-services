"use server";

import { getEmailOtpDeliveryMeta as runGetEmailOtpDeliveryMeta } from "@/features/auth/lib/otp-flow-service";
import type { SendEmailResult } from "@/server/notifications/send-email";

export async function getEmailOtpDeliveryMeta(
  email: string,
): Promise<SendEmailResult | null> {
  return runGetEmailOtpDeliveryMeta(email);
}
