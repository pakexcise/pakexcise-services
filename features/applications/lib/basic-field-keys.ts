const BASIC_FIELD_KEYS = new Set([
  "applicant_name",
  "full_name",
  "name",
  "applicant_email",
  "email",
  "applicant_phone",
  "phone",
  "mobile",
  "applicant_cnic",
  "cnic",
]);

export function isBasicApplicantFieldKey(fieldKey: string): boolean {
  return BASIC_FIELD_KEYS.has(fieldKey.toLowerCase());
}

export const BASIC_FIELD_MATCHERS = [
  "applicant_name",
  "full_name",
  "name",
  "applicant_email",
  "email",
  "applicant_phone",
  "phone",
  "mobile",
  "applicant_cnic",
  "cnic",
] as const;
