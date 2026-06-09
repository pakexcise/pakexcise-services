const PAKISTAN_MOBILE_REGEX = /^(\+92|0)?3\d{9}$/;

export function normalizePakistanPhone(input: string): string | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.startsWith("92") && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.startsWith("03") && digits.length === 11) {
    return `+92${digits.slice(1)}`;
  }

  if (digits.startsWith("3") && digits.length === 10) {
    return `+92${digits}`;
  }

  if (trimmed.startsWith("+92") && digits.length === 12) {
    return `+${digits}`;
  }

  return null;
}

export function isValidPakistanPhone(input: string): boolean {
  const normalized = normalizePakistanPhone(input);
  if (!normalized) {
    return false;
  }

  const local = `0${normalized.slice(3)}`;
  return PAKISTAN_MOBILE_REGEX.test(local);
}

export function formatPhoneHint(input: string): string {
  const normalized = normalizePakistanPhone(input);
  return normalized ?? input;
}
