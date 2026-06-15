export function buildTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("92")) {
    return `tel:+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `tel:+92${digits.slice(1)}`;
  }

  return `tel:${digits}`;
}
