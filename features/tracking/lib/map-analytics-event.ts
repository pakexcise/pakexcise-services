import type { AnalyticsEventName } from "@/features/analytics/events";
import type { ClientActivityEventName } from "@/features/tracking/events";

export function mapAnalyticsEventToActivity(
  event: AnalyticsEventName,
): ClientActivityEventName | null {
  switch (event) {
    case "view_service":
      return "service_view";
    case "click_whatsapp":
      return "whatsapp_click";
    case "start_application":
      return "application_started";
    default:
      return null;
  }
}
