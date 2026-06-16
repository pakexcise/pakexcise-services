import { z } from "zod";

import { localeSchema, optionalEmailSchema } from "@/lib/validations/common";
import { isValidPakistanPhone } from "@/lib/validations/phone";

export type ContactInquiryValidationMessages = {
  fullNameRequired: string;
  fullNameTooLong: string;
  phoneInvalid: string;
  emailInvalid: string;
  serviceRequired: string;
  messageTooLong: string;
};

export function createContactInquiryFormSchema(messages: ContactInquiryValidationMessages) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(2, messages.fullNameRequired)
      .max(120, messages.fullNameTooLong),
    phone: z
      .string()
      .trim()
      .min(1, messages.phoneInvalid)
      .refine((value) => isValidPakistanPhone(value), messages.phoneInvalid),
    email: optionalEmailSchema(messages.emailInvalid),
    serviceInterest: z.string().trim().min(1, messages.serviceRequired).max(120),
    regionName: z.string().trim().max(120),
    cityName: z.string().trim().max(120),
    message: z.string().trim().max(2000, messages.messageTooLong),
  });
}

export type ContactInquiryFormValues = z.infer<
  ReturnType<typeof createContactInquiryFormSchema>
>;

export const submitContactInquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .refine((value) => isValidPakistanPhone(value), "Invalid Pakistani mobile number"),
  email: optionalEmailSchema(),
  serviceInterest: z.string().trim().min(1).max(120),
  regionName: z.string().trim().max(120).optional().or(z.literal("")),
  cityName: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  locale: localeSchema,
});

export const updateContactInquiryStatusSchema = z.object({
  inquiryId: z.string().trim().min(1),
  status: z.enum(["NEW", "CONTACTED", "CLOSED", "SPAM"]),
  adminNotes: z.string().trim().max(5000).optional().or(z.literal("")),
});

const contactInquiryStatusSchema = z.enum(["NEW", "CONTACTED", "CLOSED", "SPAM"]);

export const adminCreateContactInquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .refine((value) => isValidPakistanPhone(value), "Invalid Pakistani mobile number"),
  email: optionalEmailSchema(),
  serviceInterest: z.string().trim().min(1).max(120),
  regionName: z.string().trim().max(120).optional().nullable(),
  cityName: z.string().trim().max(120).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  locale: localeSchema,
  status: contactInquiryStatusSchema.default("NEW"),
  adminNotes: z.string().trim().max(5000).optional().nullable(),
});

export const adminUpdateContactInquirySchema = adminCreateContactInquirySchema.extend({
  id: z.string().cuid(),
});

export const deleteContactInquirySchema = z.object({
  id: z.string().cuid(),
});
