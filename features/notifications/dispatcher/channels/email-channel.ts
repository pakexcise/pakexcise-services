import "server-only";

import { sendTransactionalEmail } from "@/server/notifications/send-email";

export type EmailChannelResult =
  | { ok: true }
  | { ok: false; error: string };

export async function sendEmailNotification(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<EmailChannelResult> {
  try {
    await sendTransactionalEmail({
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "email_send_failed";
    return { ok: false, error: message };
  }
}
