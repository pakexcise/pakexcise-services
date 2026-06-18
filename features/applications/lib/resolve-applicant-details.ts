import "server-only";

import type { FieldType } from "@prisma/client";

import { isBasicApplicantFieldKey } from "@/features/applications/lib/basic-field-keys";
import type { ApplicationDraftJson } from "@/features/applications/types";
import { formatPhoneForDisplay } from "@/lib/validations/phone";
import {
  decryptSensitiveValue,
  isEncryptedPayload,
} from "@/server/security/encryption";

export type ApplicantDetailsDisplay = {
  fullName: string;
  email: string;
  phone: string;
  cnic: string;
  hasData: boolean;
};

type ApplicantFieldValueRecord = {
  valuePlain: string | null;
  valueEncrypted: string | null;
  isEncrypted: boolean;
  field: {
    fieldKey: string;
    fieldType: FieldType;
  };
};

function displayOrDash(value: string): string {
  return value.trim() || "—";
}

function resolveStoredFieldValue(
  record: ApplicantFieldValueRecord,
  revealSensitive: boolean,
): string {
  if (record.isEncrypted && record.valueEncrypted) {
    if (revealSensitive && isEncryptedPayload(record.valueEncrypted)) {
      try {
        return decryptSensitiveValue(record.valueEncrypted);
      } catch {
        return "";
      }
    }

    return "";
  }

  return record.valuePlain ?? "";
}

function mapFieldKeyToApplicantKey(
  fieldKey: string,
): keyof Omit<ApplicantDetailsDisplay, "hasData"> | null {
  const key = fieldKey.toLowerCase();

  if (
    key.includes("name") &&
    !key.includes("father") &&
    !key.includes("engine") &&
    !key.includes("chassis")
  ) {
    return "fullName";
  }

  if (key.includes("email")) {
    return "email";
  }

  if (key.includes("phone") || key === "mobile") {
    return "phone";
  }

  if (key.includes("cnic")) {
    return "cnic";
  }

  return null;
}

export function resolveApplicantDetailsFromApplication(input: {
  draftJson: unknown;
  fieldValues?: ApplicantFieldValueRecord[];
  revealSensitive?: boolean;
}): ApplicantDetailsDisplay {
  const revealSensitive = input.revealSensitive ?? true;
  const draft = (input.draftJson ?? {}) as ApplicationDraftJson;
  const basic = draft.basic ?? {};

  let fullName = basic.fullName?.trim() ?? "";
  let email = basic.email?.trim() ?? "";
  let phone = basic.phone?.trim() ?? "";
  let cnic = basic.cnic?.trim() ?? "";

  if (input.fieldValues) {
    for (const record of input.fieldValues) {
      if (!isBasicApplicantFieldKey(record.field.fieldKey)) {
        continue;
      }

      const applicantKey = mapFieldKeyToApplicantKey(record.field.fieldKey);
      if (!applicantKey) {
        continue;
      }

      const value = resolveStoredFieldValue(record, revealSensitive);
      if (!value) {
        continue;
      }

      if (applicantKey === "fullName" && !fullName) {
        fullName = value;
      } else if (applicantKey === "email" && !email) {
        email = value;
      } else if (applicantKey === "phone" && !phone) {
        phone = value;
      } else if (applicantKey === "cnic" && !cnic) {
        cnic = value;
      }
    }
  }

  const formattedPhone = phone ? formatPhoneForDisplay(phone) : "";

  return {
    fullName: displayOrDash(fullName),
    email: displayOrDash(email),
    phone: displayOrDash(formattedPhone),
    cnic: displayOrDash(cnic),
    hasData: Boolean(fullName || email || phone || cnic),
  };
}
