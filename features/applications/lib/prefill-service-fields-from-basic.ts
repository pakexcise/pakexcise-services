import type {
  ApplyFormFieldConfig,
  BasicApplicantDetails,
} from "@/features/applications/types";
import { formatPhoneForDisplay } from "@/lib/validations/phone";

const BASIC_FIELD_PREFILL_MATCHERS: Array<{
  basicKey: keyof BasicApplicantDetails;
  matchers: string[];
  format?: (value: string) => string;
}> = [
  { basicKey: "fullName", matchers: ["applicant_name"] },
  { basicKey: "email", matchers: ["applicant_email"] },
  {
    basicKey: "phone",
    matchers: ["phone_number", "applicant_phone"],
    format: formatPhoneForDisplay,
  },
  { basicKey: "cnic", matchers: ["applicant_cnic"] },
];

function matchesPrefillFieldKey(fieldKey: string, matchers: string[]): boolean {
  const normalized = fieldKey.toLowerCase();

  return matchers.some(
    (matcher) =>
      normalized === matcher ||
      normalized.startsWith(`${matcher}_`) ||
      normalized.endsWith(`_${matcher}`),
  );
}

export function prefillServiceFieldsFromBasic(
  formFields: ApplyFormFieldConfig[],
  basic: Partial<BasicApplicantDetails>,
  currentFields: Record<string, string | string[] | boolean>,
): Record<string, string | string[] | boolean> {
  const next = { ...currentFields };

  for (const field of formFields) {
    const existing = next[field.fieldKey];
    const hasValue =
      existing !== undefined &&
      existing !== null &&
      existing !== "" &&
      !(Array.isArray(existing) && existing.length === 0);

    if (hasValue) {
      continue;
    }

    for (const mapping of BASIC_FIELD_PREFILL_MATCHERS) {
      if (!matchesPrefillFieldKey(field.fieldKey, mapping.matchers)) {
        continue;
      }

      const rawValue = basic[mapping.basicKey]?.trim();
      if (!rawValue) {
        continue;
      }

      next[field.fieldKey] = mapping.format
        ? mapping.format(rawValue)
        : rawValue;
      break;
    }
  }

  return next;
}
