import "server-only";

import { SESv2Client } from "@aws-sdk/client-sesv2";

import {
  getSesEmailConfig,
  type SesEmailConfig,
} from "@/server/notifications/ses/config";

const globalForSes = globalThis as unknown as {
  sesClient: SESv2Client | undefined;
  sesClientKey: string | undefined;
};

function buildClientKey(config: SesEmailConfig): string {
  return `${config.region}:${config.accessKeyId}`;
}

export function getSesClient(): SESv2Client {
  const config = getSesEmailConfig();

  if (!config) {
    throw new Error(
      "AWS SES is not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.",
    );
  }

  const clientKey = buildClientKey(config);

  if (
    !globalForSes.sesClient ||
    globalForSes.sesClientKey !== clientKey
  ) {
    globalForSes.sesClient = new SESv2Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    globalForSes.sesClientKey = clientKey;
  }

  return globalForSes.sesClient;
}
