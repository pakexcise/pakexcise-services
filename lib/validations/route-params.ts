import { z } from "zod";

export const entityIdParamSchema = z.string().trim().min(1).max(64);

export const documentPurposeQuerySchema = z.enum(["view", "proof"]).default("view");

export const applicationIdParamSchema = entityIdParamSchema;

export const documentIdParamSchema = entityIdParamSchema;

export const invoiceIdParamSchema = entityIdParamSchema;

export const paymentIdParamSchema = entityIdParamSchema;

export const localeCookieSchema = z.literal("en");
