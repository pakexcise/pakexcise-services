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
  return normalized ? formatPhoneForDisplay(normalized) : input;
}

/**
 * Formats Pakistani mobile input as 03XX-XXXXXXX while typing.
 */
export function formatPakistanPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");

  if (digits.length === 0) {
    return "";
  }

  if (digits.startsWith("92")) {
    digits = `0${digits.slice(2)}`;
  } else if (digits.startsWith("3") && !digits.startsWith("03")) {
    digits = `0${digits}`;
  } else if (!digits.startsWith("0")) {
    digits = `0${digits}`;
  }

  digits = digits.slice(0, 11);

  if (digits.length <= 4) {
    return digits;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

export function formatPhoneForDisplay(input: string): string {
  const normalized = normalizePakistanPhone(input);
  if (!normalized) {
    return input;
  }

  const local = `0${normalized.slice(3)}`;
  if (local.length !== 11) {
    return local;
  }

  return `${local.slice(0, 4)}-${local.slice(4)}`;
}
