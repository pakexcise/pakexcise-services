import { cnicSchema } from "@/lib/validations/common";
import {
  isValidPakistanPhone,
  normalizePakistanPhone,
} from "@/lib/validations/phone";

export function normalizeCnic(input: string): string | null {
  const trimmed = input.trim();

  if (/^\d{5}-\d{7}-\d$/.test(trimmed)) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length !== 13) {
    return null;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function isValidCnicInput(input: string): boolean {
  const normalized = normalizeCnic(input);
  if (!normalized) {
    return false;
  }

  return cnicSchema.safeParse(normalized).success;
}

export type PhoneOrCnicInput =
  | { type: "phone"; value: string }
  | { type: "cnic"; value: string }
  | { type: "invalid" };

export function parsePhoneOrCnicInput(input: string): PhoneOrCnicInput {
  const normalizedCnic = normalizeCnic(input);
  if (normalizedCnic && cnicSchema.safeParse(normalizedCnic).success) {
    return { type: "cnic", value: normalizedCnic };
  }

  const normalizedPhone = normalizePakistanPhone(input);
  if (normalizedPhone && isValidPakistanPhone(input)) {
    return { type: "phone", value: normalizedPhone };
  }

  return { type: "invalid" };
}
