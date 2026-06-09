import "server-only";

import type {
  AnalyticsEventName,
  SafeAnalyticsValue,
} from "@/features/analytics/events";
import { sanitizeAnalyticsPayload } from "@/features/analytics/sanitize-payload";
import type { AttributionData } from "@/lib/attribution";
import { toAttributionAnalyticsContext } from "@/lib/attribution";

export type ServerAnalyticsEventInput = {
  eventName: AnalyticsEventName;
  eventId: string;
  payload: Record<string, SafeAnalyticsValue>;
  attribution?: AttributionData;
  eventSourceUrl?: string;
};

export type ServerAnalyticsResult = {
  metaCapi: "sent" | "skipped" | "failed";
  tiktokEventsApi: "sent" | "skipped" | "failed";
};

function buildServerEventBody(input: ServerAnalyticsEventInput) {
  const sanitized = sanitizeAnalyticsPayload(input.payload);
  const attribution = input.attribution
    ? toAttributionAnalyticsContext(input.attribution)
    : {};

  return {
    event_name: input.eventName,
    event_id: input.eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: input.eventSourceUrl,
    custom_data: {
      ...attribution,
      ...sanitized,
    },
  };
}

async function sendMetaConversionsApi(
  body: ReturnType<typeof buildServerEventBody>,
): Promise<"sent" | "skipped" | "failed"> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN?.trim();

  if (!pixelId || !accessToken) {
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics:meta-capi:skipped]", body);
    }
    return "skipped";
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: body.event_name,
              event_time: body.event_time,
              event_id: body.event_id,
              event_source_url: body.event_source_url,
              action_source: "website",
              custom_data: body.custom_data,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[analytics:meta-capi:failed]", errorText.slice(0, 300));
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error(
      "[analytics:meta-capi:failed]",
      error instanceof Error ? error.message : error,
    );
    return "failed";
  }
}

async function sendTikTokEventsApi(
  body: ReturnType<typeof buildServerEventBody>,
): Promise<"sent" | "skipped" | "failed"> {
  const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim();
  const accessToken = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN?.trim();

  if (!pixelId || !accessToken) {
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics:tiktok-events-api:skipped]", body);
    }
    return "skipped";
  }

  try {
    const response = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/event/track/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": accessToken,
        },
        body: JSON.stringify({
          event_source: "web",
          event_source_id: pixelId,
          data: [
            {
              event: body.event_name,
              event_time: String(body.event_time),
              event_id: body.event_id,
              properties: body.custom_data,
              page: body.event_source_url
                ? { url: body.event_source_url }
                : undefined,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[analytics:tiktok-events-api:failed]",
        errorText.slice(0, 300),
      );
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error(
      "[analytics:tiktok-events-api:failed]",
      error instanceof Error ? error.message : error,
    );
    return "failed";
  }
}

export async function sendServerAnalyticsEvent(
  input: ServerAnalyticsEventInput,
): Promise<ServerAnalyticsResult> {
  const body = buildServerEventBody(input);

  const [metaCapi, tiktokEventsApi] = await Promise.all([
    sendMetaConversionsApi(body),
    sendTikTokEventsApi(body),
  ]);

  return { metaCapi, tiktokEventsApi };
}
