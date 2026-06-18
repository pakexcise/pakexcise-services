import "server-only";

import type { FieldType } from "@prisma/client";

import { isBasicApplicantFieldKey } from "@/features/applications/lib/basic-field-keys";
import {
  maskCnic,
  maskEmail,
  maskPhone,
} from "@/features/applications/lib/mask-sensitive";
import type { Locale } from "@/i18n/config";
import {
  decryptSensitiveValue,
  isEncryptedPayload,
} from "@/server/security/encryption";

export type AdminFieldDisplayValue = {
  fieldId: string;
  fieldKey: string;
  labelEn: string;
  labelUr: string;
  fieldType: FieldType;
  isEncrypted: boolean;
  displayValue: string;
  isMasked: boolean;
};

type FieldValueRecord = {
  fieldId: string;
  valuePlain: string | null;
  valueEncrypted: string | null;
  valueJson: unknown;
  isEncrypted: boolean;
  field: {
    fieldKey: string;
    labelEn: string;
    labelUr: string;
    fieldType: FieldType;
    isEncrypted: boolean;
    optionsJson?: unknown;
  };
};

function resolveOptionLabel(
  optionsJson: unknown,
  value: string,
  locale: Locale,
): string {
  if (!Array.isArray(optionsJson)) {
    return value;
  }

  for (const item of optionsJson) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as Record<string, unknown>;
    if (record.value !== value) {
      continue;
    }

    const labelEn =
      typeof record.labelEn === "string"
        ? record.labelEn
        : typeof record.label === "string"
          ? record.label
          : value;
    const labelUr =
      typeof record.labelUr === "string" ? record.labelUr : labelEn;

    return locale === "ur" ? labelUr : labelEn;
  }

  return value;
}

function formatSelectValue(
  fieldType: FieldType,
  optionsJson: unknown,
  rawValue: string,
  valueJson: unknown,
  locale: Locale,
): string {
  if (fieldType === "MULTI_SELECT" && Array.isArray(valueJson)) {
    return valueJson
      .map((item) => resolveOptionLabel(optionsJson, String(item), locale))
      .join(", ");
  }

  if (
    (fieldType === "SELECT" ||
      fieldType === "RADIO" ||
      fieldType === "MULTI_SELECT") &&
    rawValue
  ) {
    return resolveOptionLabel(optionsJson, rawValue, locale);
  }

  return rawValue;
}

function maskByFieldType(fieldType: FieldType, value: string): string {
  switch (fieldType) {
    case "CNIC":
      return maskCnic(value);
    case "PHONE":
      return maskPhone(value);
    case "EMAIL":
      return maskEmail(value);
    default:
      return "[PROTECTED]";
  }
}

function formatJsonValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value === null || value === undefined) {
    return "—";
  }

  return String(value);
}

export function filterApplicantFieldValues(
  fieldValues: FieldValueRecord[],
): FieldValueRecord[] {
  return fieldValues.filter(
    (record) => !isBasicApplicantFieldKey(record.field.fieldKey),
  );
}

export function resolveAdminFieldDisplayValues(
  fieldValues: FieldValueRecord[],
  options?: { revealSensitive?: boolean; locale?: Locale },
): AdminFieldDisplayValue[] {
  const revealSensitive = options?.revealSensitive ?? false;
  const locale = options?.locale ?? "en";

  return fieldValues.map((record) => {
    let rawValue = record.valuePlain ?? "";
    let isMasked = false;

    if (record.isEncrypted && record.valueEncrypted) {
      if (revealSensitive && isEncryptedPayload(record.valueEncrypted)) {
        try {
          rawValue = decryptSensitiveValue(record.valueEncrypted);
        } catch {
          rawValue = "[DECRYPT_ERROR]";
          isMasked = true;
        }
      } else {
        rawValue = record.valueEncrypted;
        isMasked = true;
      }
    } else if (record.valueJson !== null && record.valueJson !== undefined) {
      rawValue = formatJsonValue(record.valueJson);
    }

    rawValue = formatSelectValue(
      record.field.fieldType,
      record.field.optionsJson,
      rawValue,
      record.valueJson,
      locale,
    );

    const shouldMask =
      isMasked ||
      (!revealSensitive &&
        (record.field.isEncrypted ||
          record.isEncrypted ||
          record.field.fieldType === "CNIC" ||
          record.field.fieldType === "PHONE"));

    const displayValue = shouldMask
      ? maskByFieldType(record.field.fieldType, rawValue)
      : rawValue || "—";

    return {
      fieldId: record.fieldId,
      fieldKey: record.field.fieldKey,
      labelEn: record.field.labelEn,
      labelUr: record.field.labelUr,
      fieldType: record.field.fieldType,
      isEncrypted: record.field.isEncrypted || record.isEncrypted,
      displayValue,
      isMasked: shouldMask,
    };
  });
}

export function resolveCustomerContactDisplay(input: {
  name: string | null;
  email: string;
  phone: string | null;
  revealSensitive?: boolean;
}) {
  const reveal = input.revealSensitive ?? false;

  return {
    name: input.name ?? "—",
    email: reveal ? input.email : maskEmail(input.email),
    phone: input.phone ? (reveal ? input.phone : maskPhone(input.phone)) : "—",
    isMasked: !reveal,
  };
}
