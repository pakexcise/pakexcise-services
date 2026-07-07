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

  return labels.otpSentEmail.replace("__EMAIL__", email);
}
