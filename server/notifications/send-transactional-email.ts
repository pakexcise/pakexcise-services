import "server-only";

import { buildHtmlBody } from "@/server/notifications/email/build-html-body";
import type {
  SendEmailInput,
  SendEmailResult,
} from "@/server/notifications/email/types";
import { validateSendEmailInput } from "@/server/notifications/email/validate-send-input";
import { BrevoDeliveryError } from "@/server/notifications/brevo/brevo-delivery-error";
import { getBrevoEmailConfig, isBrevoConfigured } from "@/server/notifications/brevo/config";
import { deliverViaBrevo } from "@/server/notifications/brevo/deliver-via-brevo";
import {
  deliverViaSes,
  resolveSesReplyTo,
} from "@/server/notifications/ses/deliver-via-ses";
import {
  getSesEmailConfig,
  getSesSandboxForwardTo,
  isSesConfigured,
} from "@/server/notifications/ses/config";
import {
  isSesSandboxRecipientError,
  logSesDeliveryFailure,
} from "@/server/notifications/ses/log-ses-error";

export type { SendEmailInput, SendEmailResult } from "@/server/notifications/email/types";

function isLocalAppDevelopment(): boolean {
  return process.env.APP_ENV === "development";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function logDevEmail(input: SendEmailInput, reason: string): SendEmailResult {
  if (isLocalAppDevelopment()) {
    console.info(`[email:dev] ${reason}`, {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { channel: "dev_console" };
  }

  throw new Error(reason);
}

function resolveReplyTo(override?: string): string {
  const brevoConfig = getBrevoEmailConfig();
  if (brevoConfig) {
    return override?.trim() || brevoConfig.replyToEmail;
  }

  return resolveSesReplyTo(override);
}

async function sendViaSesWithSandboxForward(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo: string;
}): Promise<SendEmailResult> {
  try {
    await deliverViaSes(input);
    return { channel: "direct", provider: "ses" };
  } catch (error) {
    logSesDeliveryFailure(error);

    const message =
      error instanceof Error ? error.message : "Email delivery failed";

    const sandboxForwardTo = getSesSandboxForwardTo();

    if (sandboxForwardTo && isSesSandboxRecipientError(error)) {
      const forwardSubject = `[Staging OTP for ${input.to}] ${input.subject}`;
      const forwardText = [
        "PakExcise staging — AWS SES sandbox forward",
        `Requested recipient: ${input.to}`,
        "",
        input.text,
      ].join("\n");
      const forwardHtml = `
        <p><strong>PakExcise staging — AWS SES sandbox forward</strong></p>
        <p>Requested recipient: ${escapeHtml(input.to)}</p>
        ${buildHtmlBody({ ...input, text: input.text })}
      `;

      try {
        await deliverViaSes({
          to: sandboxForwardTo,
          subject: forwardSubject,
          text: forwardText,
          html: forwardHtml,
          replyTo: input.replyTo,
        });

        console.info("[email:ses:sandbox-forward]", {
          requestedFor: input.to,
          forwardedTo: sandboxForwardTo,
        });

        return {
          channel: "sandbox_forward",
          provider: "ses",
          requestedFor: input.to,
          forwardedTo: sandboxForwardTo,
        };
      } catch (forwardError) {
        logSesDeliveryFailure(forwardError);
      }
    }

    if (isLocalAppDevelopment()) {
      console.info("[email:dev:fallback]", {
        to: input.to,
        subject: input.subject,
        sesError: message,
      });
      return { channel: "dev_console" };
    }

    throw new Error(message);
  }
}

export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const validated = validateSendEmailInput(input);
  const htmlBody = buildHtmlBody(validated);
  const replyTo = resolveReplyTo(validated.replyTo);

  const deliveryInput = {
    to: validated.to,
    subject: validated.subject,
    text: validated.text,
    html: htmlBody,
    replyTo,
  };

  const hasBrevo = isBrevoConfigured();
  const hasSes = isSesConfigured();

  if (!hasBrevo && !hasSes) {
    return logDevEmail(input, "No email provider is configured (Brevo or AWS SES)");
  }

  if (hasBrevo) {
    try {
      await deliverViaBrevo(deliveryInput);
      return { channel: "direct", provider: "brevo" };
    } catch (error) {
      if (error instanceof BrevoDeliveryError && !error.fallbackEligible) {
        throw error;
      }

      if (!hasSes) {
        if (isLocalAppDevelopment()) {
          console.info("[email:dev:brevo-fallback-unavailable]", {
            to: validated.to,
            subject: validated.subject,
            brevoError:
              error instanceof Error ? error.message : "brevo_delivery_failed",
          });
          return { channel: "dev_console" };
        }

        throw new Error(
          error instanceof Error
            ? error.message
            : "Brevo delivery failed and AWS SES is not configured",
        );
      }

      console.warn("[email:brevo] falling back to AWS SES", {
        to: validated.to,
        reason:
          error instanceof Error ? error.message : "brevo_delivery_failed",
      });
    }
  }

  if (!hasSes) {
    return logDevEmail(input, "AWS SES credentials are not configured");
  }

  if (!getSesEmailConfig()) {
    return logDevEmail(input, "AWS SES configuration is incomplete");
  }

  return sendViaSesWithSandboxForward(deliveryInput);
}
