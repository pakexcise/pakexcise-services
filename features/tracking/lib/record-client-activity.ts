import { recordActivity } from "@/features/tracking/actions/record-activity";
import type { ClientActivityEventName } from "@/features/tracking/events";
import { getClientActivitySessionId } from "@/features/tracking/lib/client-session";
import { getTrafficMetadataForActivity } from "@/lib/analytics/traffic-context";

type RecordClientActivityInput = {
  event: ClientActivityEventName;
  path?: string;
  metadata?: Record<string, string | number | boolean>;
};

export function recordClientActivity(input: RecordClientActivityInput): void {
  if (typeof window === "undefined") {
    return;
  }

  const sessionId = getClientActivitySessionId();
  const path = input.path ?? `${window.location.pathname}${window.location.search}`;
  const referrer = document.referrer || undefined;

  void recordActivity({
    event: input.event,
    sessionId,
    path,
    referrer,
    metadata: {
      ...getTrafficMetadataForActivity(),
      ...input.metadata,
    },
  });
}
