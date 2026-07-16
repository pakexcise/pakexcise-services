import "server-only";

import { render } from "@react-email/render";

import { getEmailBranding } from "@/features/notifications/lib/email-branding";
import { OtpEmail } from "@/features/notifications/templates/emails/otp-email";
import en from "@/messages/en";
import { rememberOtpDelivery } from "@/server/notifications/otp-delivery-cache";
import { sendTransactionalEmail } from "@/server/notifications/send-email";
import { enforceRateLimit, otpRateLimit } from "@/server/security/rate-limit";

type EmailOtpType = "sign-in" | "email-verification" | "forget-password";
const copy = en.emailTemplates.otp;

function getSubject(type: EmailOtpType): string {
  switch (type) {
    case "sign-in":
      return copy.signInSubject;
    case "email-verification":
      return copy.emailVerificationSubject;
    case "forget-password":
      return copy.passwordResetSubject;
    default:
      return copy.emailVerificationSubject;
  }
}

function getTitle(type: EmailOtpType): string {
  switch (type) {
    case "sign-in":
      return copy.signInTitle;
    case "email-verification":
      return copy.emailVerificationTitle;
    case "forget-password":
      return copy.passwordResetTitle;
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
    if (process.env.APP_ENV === "development") {
      console.warn("[email-otp:dev] rate limit skipped", rateLimitError);
    } else {
      throw rateLimitError;
    }
  }

  const subject = getSubject(type);
  const branding = await getEmailBranding();
  const html = await render(
    OtpEmail({
      branding,
      otp,
      title: getTitle(type),
    }),
  );

  const delivery = await sendTransactionalEmail({
    to: email,
    subject,
    text: `Your ${branding.siteName} verification code is ${otp}. It expires in 5 minutes. Do not share this code. ${branding.disclaimer}`,
    html,
  });

  rememberOtpDelivery(email, delivery);
}
