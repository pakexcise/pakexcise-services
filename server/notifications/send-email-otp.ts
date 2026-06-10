import "server-only";

import { rememberOtpDelivery } from "@/server/notifications/otp-delivery-cache";
import { sendTransactionalEmail } from "@/server/notifications/send-email";
import { enforceRateLimit, otpRateLimit } from "@/server/security/rate-limit";

type EmailOtpType = "sign-in" | "email-verification" | "forget-password";

function getSubject(type: EmailOtpType): string {
  switch (type) {
    case "sign-in":
      return "Your PakExcise.com sign-in code";
    case "email-verification":
      return "Verify your PakExcise.com email";
    case "forget-password":
      return "Your PakExcise.com password reset code";
    default:
      return "Your PakExcise.com verification code";
  }
}

export async function sendEmailOtp(
  email: string,
  otp: string,
  type: EmailOtpType,
): Promise<void> {
  try {
    await enforceRateLimit(otpRateLimit, `email:${email.toLowerCase()}`);
  } catch (rateLimitError) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[email-otp:dev] rate limit skipped", rateLimitError);
    } else {
      throw rateLimitError;
    }
  }

  const subject = getSubject(type);

  const delivery = await sendTransactionalEmail({
    to: email,
    subject,
    text: `Your PakExcise.com verification code is ${otp}. It expires in 5 minutes. Do not share this code. PakExcise.com is a private facilitation service — not a government website.`,
    html: `
      <p>Your PakExcise.com verification code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${otp}</p>
      <p>This code expires in 5 minutes. Do not share it with anyone.</p>
      <p>If you did not request this code, you can ignore this email.</p>
      <p><small>PakExcise.com is a private facilitation service — not a government website.</small></p>
    `,
  });

  rememberOtpDelivery(email, delivery);
}
