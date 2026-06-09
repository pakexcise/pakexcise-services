import { randomBytes } from "node:crypto";

export function generateInvoiceNumber(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `PAX-INV-${y}${m}${d}-${suffix}`;
}
