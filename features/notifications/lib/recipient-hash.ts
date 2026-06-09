import "server-only";

import { createHash } from "node:crypto";

function getRecipientPepper(): string | null {
  return (
    process.env.NOTIFICATION_RECIPIENT_PEPPER?.trim() ??
    process.env.IP_HASH_PEPPER?.trim() ??
    null
  );
}

export function hashNotificationRecipient(value: string): string | null {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const pepper = getRecipientPepper();

  if (!pepper) {
    if (process.env.NODE_ENV === "production") {
      return createHash("sha256").update(normalized).digest("hex");
    }

    return null;
  }

  return createHash("sha256")
    .update(`${normalized}:${pepper}`)
    .digest("hex");
}
