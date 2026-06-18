import { z } from "zod";

import { isValidPakistanPhone } from "@/lib/validations/phone";

export type BasicDetailsValidationMessages = {
  fullNameRequired: string;
  fullNameTooLong: string;
  emailInvalid: string;
  phoneRequired: string;
  phoneInvalid: string;
  cnicInvalid: string;
};

const defaultMessages: BasicDetailsValidationMessages = {
  fullNameRequired: "Full name is required",
  fullNameTooLong: "Full name is too long",
  emailInvalid: "Enter a valid email address",
  phoneRequired: "Mobile number is required",
  phoneInvalid: "Invalid Pakistani mobile number",
  cnicInvalid: "Invalid CNIC format",
};

export function createBasicApplicantDetailsSchema(
  messages: Partial<BasicDetailsValidationMessages> = {},
) {
  const m = { ...defaultMessages, ...messages };

  return z.object({
    fullName: z
      .string()
      .trim()
      .min(2, m.fullNameRequired)
      .max(120, m.fullNameTooLong),
    email: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || z.string().email().safeParse(value).success,
        m.emailInvalid,
      ),
    phone: z
      .string()
      .trim()
      .min(1, m.phoneRequired)
      .refine((value) => isValidPakistanPhone(value), m.phoneInvalid),
    cnic: z
      .string()
      .trim()
      .regex(/^\d{5}-\d{7}-\d$/, m.cnicInvalid),
  });
}

export const basicApplicantDetailsSchema = createBasicApplicantDetailsSchema();

export type BasicApplicantDetailsInput = z.infer<
  typeof basicApplicantDetailsSchema
>;
