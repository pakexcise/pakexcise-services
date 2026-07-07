import "server-only";

import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { z } from "zod";

import { getSesClient } from "@/server/notifications/ses/client";
import {
  isSesSandboxRecipientError,
  logSesDeliveryFailure,
} from "@/server/notifications/ses/log-ses-error";
import {
  formatSesFromAddress,
  getSesEmailConfig,
  getSesSandboxForwardTo,
  isSesConfigured,
} from "@/server/notifications/ses/config";

const recipientSchema = z.string().trim().email();

function isLocalAppDevelopment(): boolean {
  return process.env.APP_ENV === "development";
}

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { channel: "direct" }
  | { channel: "dev_console" }
  | {
      channel: "sandbox_forward";
      requestedFor: string;
      forwardedTo: string;
    };

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtmlBody(input: SendEmailInput): string {
  if (input.html?.trim()) {
    return input.html;
  }

  const paragraphs = input.text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  return paragraphs || `<p>${escapeHtml(input.text)}</p>`;
}

async function deliverViaSes(
  to: string,
  subject: string,
  text: string,
  html: string,
  replyTo: string,
): Promise<void> {
  const config = getSesEmailConfig();

  if (!config) {
    throw new Error("AWS SES configuration is incomplete");
  }

  const client = getSesClient();

  await client.send(
    new SendEmailCommand({
      FromEmailAddress: formatSesFromAddress(config.fromEmail),
      Destination: {
        ToAddresses: [to],
      },
      ReplyToAddresses: [replyTo],
      Content: {
        Simple: {
          Subject: {
            Data: subject,
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data: text,
              Charset: "UTF-8",
            },
            Html: {
              Data: html,
              Charset: "UTF-8",
            },
          },
        },
      },
    }),
  );
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

export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const parsedRecipient = recipientSchema.safeParse(input.to);

  if (!parsedRecipient.success) {
    throw new Error("Invalid recipient email address");
  }

  const to = parsedRecipient.data;
  const subject = input.subject.trim();

  if (!subject) {
    throw new Error("Email subject is required");
  }

  if (!isSesConfigured()) {
    return logDevEmail(input, "AWS SES credentials are not configured");
  }

  const config = getSesEmailConfig();

  if (!config) {
    return logDevEmail(input, "AWS SES configuration is incomplete");
  }

  const replyTo = input.replyTo?.trim() || config.replyToEmail;
  const htmlBody = buildHtmlBody(input);

  try {
    await deliverViaSes(to, subject, input.text, htmlBody, replyTo);

    return { channel: "direct" };
  } catch (error) {
    logSesDeliveryFailure(error);

    const message =
      error instanceof Error ? error.message : "Email delivery failed";

    const sandboxForwardTo = getSesSandboxForwardTo();

    if (sandboxForwardTo && isSesSandboxRecipientError(error)) {
      const forwardSubject = `[Staging OTP for ${to}] ${subject}`;
      const forwardText = [
        "PakExcise staging — AWS SES sandbox forward",
        `Requested recipient: ${to}`,
        "",
        input.text,
      ].join("\n");
      const forwardHtml = `
        <p><strong>PakExcise staging — AWS SES sandbox forward</strong></p>
        <p>Requested recipient: ${escapeHtml(to)}</p>
        ${buildHtmlBody({ ...input, text: input.text })}
      `;

      try {
        await deliverViaSes(
          sandboxForwardTo,
          forwardSubject,
          forwardText,
          forwardHtml,
          replyTo,
        );

        console.info("[email:ses:sandbox-forward]", {
          requestedFor: to,
          forwardedTo: sandboxForwardTo,
        });

        return {
          channel: "sandbox_forward",
          requestedFor: to,
          forwardedTo: sandboxForwardTo,
        };
      } catch (forwardError) {
        logSesDeliveryFailure(forwardError);
      }
    }

    if (isLocalAppDevelopment()) {
      console.info("[email:dev:fallback]", {
        to,
        subject,
        sesError: message,
      });
      return { channel: "dev_console" };
    }

    throw new Error(message);
  }
}
