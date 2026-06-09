import "server-only";

import { getWhatsAppConfig } from "@/lib/whatsapp/config";

type WhatsAppSendResult = {
  delivered: boolean;
  reason?: string;
  metaErrorCode?: number;
  metaErrorMessage?: string;
};

type WhatsAppErrorResponse = {
  error?: {
    message?: string;
    code?: number;
    error_subcode?: number;
  };
};

const WHATSAPP_NOT_ON_WHATSAPP_CODES = new Set([
  131026,
  131047,
  133010,
  130472,
]);

const WHATSAPP_RECIPIENT_NOT_ALLOWED_CODES = new Set([131030, 131031]);

const WHATSAPP_TOKEN_ERROR_CODES = new Set([190, 102]);

const WHATSAPP_TEMPLATE_ERROR_CODES = new Set([132000, 132001, 132005, 132007]);

function isUndeliverableMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("not a whatsapp user") ||
    normalized.includes("not on whatsapp") ||
    normalized.includes("recipient phone number not in whatsapp") ||
    normalized.includes("undeliverable")
  );
}

function isRecipientNotAllowedMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("not in allowed list") ||
    normalized.includes("recipient phone number not in allowed")
  );
}

function buildTemplatePayload(
  config: NonNullable<ReturnType<typeof getWhatsAppConfig>>,
  code: string,
): Record<string, unknown> {
  const template: Record<string, unknown> = {
    name: config.templateName,
    language: { code: config.templateLanguage },
  };

  if (config.templateMode === "plain") {
    return template;
  }

  if (config.templateMode === "authentication") {
    template.components = [
      {
        type: "body",
        parameters: [{ type: "text", text: code }],
      },
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [{ type: "text", text: code }],
      },
    ];
    return template;
  }

  const parameters =
    config.templateParamCount === 3
      ? [
          { type: "text", text: "PakExcise" },
          { type: "text", text: code },
          { type: "text", text: "5 minutes" },
        ]
      : [{ type: "text", text: code }];

  template.components = [
    {
      type: "body",
      parameters,
    },
  ];

  return template;
}

function logWhatsAppFailure(details: {
  phoneNumber: string;
  status: number;
  errorCode?: number;
  errorMessage: string;
  templateName: string;
  templateMode: string;
}): void {
  console.error(
    `[whatsapp-otp] send failed status=${details.status} code=${details.errorCode ?? "n/a"} phone=${details.phoneNumber} template=${details.templateName} mode=${details.templateMode} message=${details.errorMessage}`,
  );
}

export async function sendWhatsAppOtp(
  phoneNumber: string,
  code: string,
): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig();

  if (!config) {
    if (process.env.NODE_ENV === "development") {
      console.info("[whatsapp-otp:dev] missing config, logging OTP", {
        phoneNumber,
        code,
      });
      return { delivered: true };
    }

    return { delivered: false, reason: "not_configured" };
  }

  const to = phoneNumber.replace(/\D/g, "");
  const requestBody = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: buildTemplatePayload(config, code),
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (response.ok) {
      return { delivered: true };
    }

    const rawBody = await response.text();
    let payload: WhatsAppErrorResponse = {};

    try {
      payload = JSON.parse(rawBody) as WhatsAppErrorResponse;
    } catch {
      payload = { error: { message: rawBody.slice(0, 500) } };
    }

    const errorCode = payload.error?.code;
    const errorMessage = payload.error?.message ?? "whatsapp_send_failed";

    logWhatsAppFailure({
      phoneNumber: to,
      status: response.status,
      errorCode,
      errorMessage,
      templateName: config.templateName,
      templateMode: config.templateMode,
    });

    if (config.devFallbackOnError) {
      console.warn("[whatsapp-otp:dev-fallback] OTP logged for local testing", {
        phoneNumber: to,
        code,
        errorCode,
        errorMessage,
      });
      return { delivered: true };
    }

    if (
      (errorCode && WHATSAPP_NOT_ON_WHATSAPP_CODES.has(errorCode)) ||
      isUndeliverableMessage(errorMessage)
    ) {
      return {
        delivered: false,
        reason: "not_on_whatsapp",
        metaErrorCode: errorCode,
        metaErrorMessage: errorMessage,
      };
    }

    if (
      (errorCode && WHATSAPP_RECIPIENT_NOT_ALLOWED_CODES.has(errorCode)) ||
      isRecipientNotAllowedMessage(errorMessage)
    ) {
      return {
        delivered: false,
        reason: "recipient_not_allowed",
        metaErrorCode: errorCode,
        metaErrorMessage: errorMessage,
      };
    }

    if (errorCode && WHATSAPP_TOKEN_ERROR_CODES.has(errorCode)) {
      return {
        delivered: false,
        reason: "token_error",
        metaErrorCode: errorCode,
        metaErrorMessage: errorMessage,
      };
    }

    if (errorCode && WHATSAPP_TEMPLATE_ERROR_CODES.has(errorCode)) {
      return {
        delivered: false,
        reason: "template_error",
        metaErrorCode: errorCode,
        metaErrorMessage: errorMessage,
      };
    }

    return {
      delivered: false,
      reason: "delivery_failed",
      metaErrorCode: errorCode,
      metaErrorMessage: errorMessage,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "network_error";

    console.error(
      `[whatsapp-otp] network error phone=${to} message=${errorMessage}`,
    );

    if (config.devFallbackOnError) {
      console.warn("[whatsapp-otp:dev-fallback] OTP logged for local testing", {
        phoneNumber: to,
        code,
        errorMessage,
      });
      return { delivered: true };
    }

    return { delivered: false, reason: "network_error" };
  }
}
