export function maskCnic(value: string): string {
  const parts = value.split("-");

  if (parts.length === 3) {
    return `${parts[0]}-*******-${parts[2]}`;
  }

  if (value.length >= 4) {
    return `${value.slice(0, 2)}${"*".repeat(Math.max(value.length - 4, 4))}${value.slice(-2)}`;
  }

  return "****";
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 4) {
    return "****";
  }

  return `${"*".repeat(Math.max(digits.length - 4, 4))}${digits.slice(-4)}`;
}

export function maskEmail(value: string): string {
  const [local, domain] = value.split("@");

  if (!local || !domain) {
    return "****@****";
  }

  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - visible.length, 2))}@${domain}`;
}
