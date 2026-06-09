import "server-only";

import { getWhatsAppConfig } from "@/lib/whatsapp/config";

export type WhatsAppChannelResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fallbackToSms?: boolean;
    };

export async function sendWhatsAppNotification(input: {
  phone: string;
  text: string;
}): Promise<WhatsAppChannelResult> {
  const config = getWhatsAppConfig();

  if (!config) {
    if (process.env.NODE_ENV === "development") {
      console.info("[whatsapp-notification:dev]", {
        phone: input.phone.replace(/\d(?=\d{4})/g, "*"),
        text: input.text,
      });
      return { ok: true };
    }

    return {
      ok: false,
      error: "whatsapp_not_configured",
      fallbackToSms: true,
    };
  }

  const to = input.phone.replace(/\D/g, "");

  try {
    const response = await fetch(
      `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: input.text },
        }),
      },
    );

    if (response.ok) {
      return { ok: true };
    }

    const rawBody = await response.text();
    let errorMessage = "whatsapp_send_failed";

    try {
      const payload = JSON.parse(rawBody) as {
        error?: { message?: string; code?: number };
      };
      errorMessage = payload.error?.message ?? errorMessage;
    } catch {
      errorMessage = rawBody.slice(0, 300);
    }

    if (config.devFallbackOnError) {
      console.warn("[whatsapp-notification:dev-fallback]", {
        phone: to,
        text: input.text,
        errorMessage,
      });
      return { ok: true };
    }

    const normalized = errorMessage.toLowerCase();
    const fallbackToSms =
      normalized.includes("not on whatsapp") ||
      normalized.includes("not a whatsapp user") ||
      normalized.includes("recipient phone number not in allowed");

    return { ok: false, error: errorMessage, fallbackToSms };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "whatsapp_network_error";

    if (config.devFallbackOnError) {
      console.warn("[whatsapp-notification:dev-fallback]", {
        phone: to,
        text: input.text,
        message,
      });
      return { ok: true };
    }

    return { ok: false, error: message, fallbackToSms: true };
  }
}
