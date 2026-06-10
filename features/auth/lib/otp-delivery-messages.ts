import {
  formatResendSandboxMessage,
  getResendSandboxOwnerEmail,
  isResendSandboxRecipient,
} from "@/lib/email/resend-sandbox";
import type { SendEmailResult } from "@/server/notifications/send-email";

type OtpDeliveryLabels = {
  otpSentEmail: string;
  otpSentEmailSandbox: string;
  otpSentEmailDevConsole: string;
};

export function resolveEmailOtpSentMessage(
  email: string,
  labels: OtpDeliveryLabels,
  delivery?: SendEmailResult | null,
): string {
  if (delivery?.channel === "dev_console") {
    return labels.otpSentEmailDevConsole;
  }

  if (delivery?.channel === "sandbox_forward") {
    const owner =
      delivery.forwardedTo ?? getResendSandboxOwnerEmail() ?? "your Resend account email";
    return formatResendSandboxMessage(
      labels.otpSentEmailSandbox,
      owner,
      email,
    );
  }

  const sandboxOwner = getResendSandboxOwnerEmail();
  if (sandboxOwner && isResendSandboxRecipient(email)) {
    return formatResendSandboxMessage(
      labels.otpSentEmailSandbox,
      sandboxOwner,
      email,
    );
  }

  return labels.otpSentEmail.replace("__EMAIL__", email);
}
