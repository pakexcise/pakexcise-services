import { z } from "zod";

export const requestPaymentScreenshotSchema = z.object({
  paymentId: z.string().cuid(),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  fileSize: z.number().int().positive(),
});

export const confirmPaymentScreenshotSchema = z.object({
  paymentId: z.string().cuid(),
  checksum: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{64}$/i)
    .optional(),
});

export const verifyPaymentSchema = z.object({
  paymentId: z.string().cuid(),
  note: z.string().trim().min(3).max(2000),
});

export const rejectPaymentSchema = z.object({
  paymentId: z.string().cuid(),
  reason: z.string().trim().min(3).max(500),
  note: z.string().trim().min(3).max(2000),
});
