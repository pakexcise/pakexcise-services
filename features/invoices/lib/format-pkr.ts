export function formatPkr(
  amount: number | string,
  locale: "en" | "ur" = "en",
): string {
  const numeric =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;

  if (!Number.isFinite(numeric)) {
    return locale === "ur" ? "PKR 0" : "PKR 0.00";
  }

  return new Intl.NumberFormat(locale === "ur" ? "ur-PK" : "en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function parseMoneyAmount(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
