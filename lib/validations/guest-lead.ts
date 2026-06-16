import { z } from "zod";

import { localeSchema, optionalEmailSchema, phoneSchema } from "@/lib/validations/common";
import { isValidPakistanPhone } from "@/lib/validations/phone";

export type GuestRequestValidationMessages = {
  fullNameRequired: string;
  fullNameTooLong: string;
  phoneInvalid: string;
  emailInvalid: string;
};

export function createGuestRequestFormSchema(messages: GuestRequestValidationMessages) {
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
    regionName: z.string().trim().max(120),
    cityName: z.string().trim().max(120),
    vehicleInfo: z.string().trim().max(500),
    licenseInfo: z.string().trim().max(500),
    message: z.string().trim().max(2000),
  });
}

export type GuestRequestFormValues = z.infer<
  ReturnType<typeof createGuestRequestFormSchema>
>;

export const submitGuestLeadSchema = z.object({
  serviceSlug: z.string().trim().min(1).max(120),
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  phone: phoneSchema,
  email: optionalEmailSchema(),
  regionName: z.string().trim().max(120).optional().or(z.literal("")),
  cityName: z.string().trim().max(120).optional().or(z.literal("")),
  vehicleInfo: z.string().trim().max(500).optional().or(z.literal("")),
  licenseInfo: z.string().trim().max(500).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  locale: localeSchema,
});

export const updateGuestLeadStatusSchema = z.object({
  leadId: z.string().trim().min(1),
  status: z.enum([
    "NEW",
    "CONTACTED",
    "IN_PROGRESS",
    "CONVERTED",
    "CLOSED",
    "SPAM",
  ]),
  adminNotes: z.string().trim().max(5000).optional().or(z.literal("")),
});

const guestLeadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
  "SPAM",
]);

const guestLeadSourceSchema = z.enum(["WHATSAPP", "GUEST_FORM"]);

export const adminCreateGuestLeadSchema = z.object({
  serviceId: z.string().cuid().optional().nullable(),
  serviceNameEn: z.string().trim().min(2).max(200),
  serviceNameUr: z.string().trim().min(2).max(200),
  source: guestLeadSourceSchema.default("GUEST_FORM"),
  status: guestLeadStatusSchema.default("NEW"),
  fullName: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  email: optionalEmailSchema(),
  regionNameEn: z.string().trim().max(120).optional().nullable(),
  regionNameUr: z.string().trim().max(120).optional().nullable(),
  cityName: z.string().trim().max(120).optional().nullable(),
  vehicleInfo: z.string().trim().max(500).optional().nullable(),
  licenseInfo: z.string().trim().max(500).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  adminNotes: z.string().trim().max(5000).optional().nullable(),
  locale: localeSchema,
});

export const adminUpdateGuestLeadSchema = adminCreateGuestLeadSchema.extend({
  id: z.string().cuid(),
});

export const deleteGuestLeadSchema = z.object({
  id: z.string().cuid(),
});

export type SubmitGuestLeadInput = z.infer<typeof submitGuestLeadSchema>;
