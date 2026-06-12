import { z } from "zod";

export type BasicDetailsValidationMessages = {
  fullNameRequired: string;
  fullNameTooLong: string;
  emailInvalid: string;
  phoneInvalid: string;
  cnicInvalid: string;
};

const defaultMessages: BasicDetailsValidationMessages = {
  fullNameRequired: "Full name is required",
  fullNameTooLong: "Full name is too long",
  emailInvalid: "Enter a valid email address",
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
    email: z.string().trim().email(m.emailInvalid),
    phone: z
      .string()
      .trim()
      .regex(/^(\+92|0)?3\d{9}$/, m.phoneInvalid),
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
