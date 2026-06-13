"use client";

const APPLICATION_UPDATE_CHANNEL = "pakexcise-application-updates";

export function broadcastApplicationUpdate(): void {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return;
  }

  const channel = new BroadcastChannel(APPLICATION_UPDATE_CHANNEL);
  channel.postMessage({ updatedAt: Date.now() });
  channel.close();
}

export function subscribeToApplicationUpdates(
  onUpdate: () => void,
): () => void {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return () => undefined;
  }

  const channel = new BroadcastChannel(APPLICATION_UPDATE_CHANNEL);
  channel.onmessage = () => {
    onUpdate();
  };

  return () => {
    channel.close();
  };
}
