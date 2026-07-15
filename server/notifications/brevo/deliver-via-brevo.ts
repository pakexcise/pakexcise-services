import "server-only";

import {
  getBrevoEmailConfig,
  type BrevoEmailConfig,
} from "@/server/notifications/brevo/config";
import { BrevoDeliveryError } from "@/server/notifications/brevo/brevo-delivery-error";
import {
  isBrevoFallbackEligibleError,
  logBrevoDeliveryFailure,
} from "@/server/notifications/brevo/log-brevo-error";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const REQUEST_TIMEOUT_MS = 10_000;

type BrevoSendPayload = {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{ email: string }>;
  replyTo: {
    email: string;
  };
  subject: string;
  textContent: string;
  htmlContent: string;
};

type BrevoErrorResponse = {
  code?: string;
  message?: string;
};

function buildPayload(
  config: BrevoEmailConfig,
  input: {
    to: string;
    subject: string;
    text: string;
    html: string;
    replyTo: string;
  },
): BrevoSendPayload {
  return {
    sender: {
      name: config.fromName,
      email: config.fromEmail,
    },
    to: [{ email: input.to }],
    replyTo: {
      email: input.replyTo,
    },
    subject: input.subject,
    textContent: input.text,
    htmlContent: input.html,
  };
}

async function parseBrevoErrorResponse(
  response: Response,
): Promise<BrevoErrorResponse | null> {
  try {
    return (await response.json()) as BrevoErrorResponse;
  } catch {
    return null;
  }
}

export async function deliverViaBrevo(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo: string;
}): Promise<void> {
  const config = getBrevoEmailConfig();

  if (!config) {
    throw new Error("Brevo configuration is incomplete");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": config.apiKey,
      },
      body: JSON.stringify(buildPayload(config, input)),
      signal: controller.signal,
    });

    if (response.ok) {
      return;
    }

    const errorBody = await parseBrevoErrorResponse(response);
    const message =
      errorBody?.message?.trim() ||
      `Brevo API returned HTTP ${response.status}`;
    const fallbackEligible = isBrevoFallbackEligibleError(
      new Error(message),
      response.status,
    );

    logBrevoDeliveryFailure(new Error(message), response.status);

    throw new BrevoDeliveryError(message, {
      fallbackEligible,
      httpStatus: response.status,
      code: errorBody?.code,
    });
  } catch (error) {
    if (error instanceof BrevoDeliveryError) {
      throw error;
    }

    logBrevoDeliveryFailure(error);

    const fallbackEligible = isBrevoFallbackEligibleError(error);
    const message =
      error instanceof Error ? error.message : "Brevo delivery failed";

    throw new BrevoDeliveryError(message, { fallbackEligible });
  } finally {
    clearTimeout(timeout);
  }
}
