import "server-only";

import { randomBytes } from "node:crypto";

export function generateGuestLeadReferenceId(): string {
  const datePart = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const randomPart = randomBytes(3).toString("hex").toUpperCase();
  return `GL-${datePart}-${randomPart}`;
}
