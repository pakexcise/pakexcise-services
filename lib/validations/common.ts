import "server-only";

import { z } from "zod";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export function successResult<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function errorResult(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return { success: false, error, fieldErrors };
}

export function parseInput<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
):
  | { success: true; data: z.infer<TSchema> }
  | { success: false; error: string; fieldErrors: Record<string, string[]> } {
  const result = schema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  return { success: true, data: result.data };
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const localeSchema = z.enum(["en", "ur"]);

export const trackingIdSchema = z
  .string()
  .trim()
  .min(6)
  .max(32)
  .regex(/^[A-Z0-9-]+$/);

export const cnicSchema = z
  .string()
  .trim()
  .regex(/^\d{5}-\d{7}-\d$/, "Invalid CNIC format");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+92|0)?3\d{9}$/, "Invalid Pakistani mobile number");
