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
    return labels.otpSentEmailSandbox
      .replace("__REQUESTED_EMAIL__", email)
      .replace("__OWNER_EMAIL__", delivery.forwardedTo);
  }

  return labels.otpSentEmail.replace("__EMAIL__", email);
}
