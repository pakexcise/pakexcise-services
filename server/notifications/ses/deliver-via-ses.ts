import "server-only";

import { SendEmailCommand } from "@aws-sdk/client-sesv2";

import { getSesClient } from "@/server/notifications/ses/client";
import {
  formatSesFromAddress,
  getSesEmailConfig,
} from "@/server/notifications/ses/config";

export async function deliverViaSes(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo: string;
}): Promise<void> {
  const config = getSesEmailConfig();

  if (!config) {
    throw new Error("AWS SES configuration is incomplete");
  }

  const client = getSesClient();

  await client.send(
    new SendEmailCommand({
      FromEmailAddress: formatSesFromAddress(config.fromEmail),
      Destination: {
        ToAddresses: [input.to],
      },
      ReplyToAddresses: [input.replyTo],
      Content: {
        Simple: {
          Subject: {
            Data: input.subject,
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data: input.text,
              Charset: "UTF-8",
            },
            Html: {
              Data: input.html,
              Charset: "UTF-8",
            },
          },
        },
      },
    }),
  );
}

export function resolveSesReplyTo(override?: string): string {
  const config = getSesEmailConfig();
  return override?.trim() || config?.replyToEmail || "info@pakexcise.com";
}
