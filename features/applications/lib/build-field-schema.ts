import type { FieldType } from "@prisma/client";
import { z } from "zod";

import { cnicSchema, phoneSchema } from "@/lib/validations/common";
import type { ApplyFormFieldConfig } from "@/features/applications/types";
import {
  getFieldPatternErrorMessage,
  valueMatchesFieldPatterns,
} from "@/features/applications/lib/field-validation";

function buildStringSchema(
  field: ApplyFormFieldConfig,
  validation: Record<string, unknown>,
): z.ZodTypeAny {
  let schema: z.ZodTypeAny = z.string().trim();

  if (typeof validation.minLength === "number") {
    schema = (schema as z.ZodString).min(
      validation.minLength,
      `${field.label} must be at least ${validation.minLength} characters`,
    );
  } else if (field.isRequired) {
    schema = (schema as z.ZodString).min(1, `${field.label} is required`);
  }

  if (typeof validation.maxLength === "number") {
    schema = (schema as z.ZodString).max(
      validation.maxLength,
      `${field.label} must be at most ${validation.maxLength} characters`,
    );
  }

  const hasPatterns =
    (Array.isArray(validation.patterns) &&
      validation.patterns.some((item) => typeof item === "string" && item.length > 0)) ||
    (typeof validation.pattern === "string" && validation.pattern.length > 0);

  if (hasPatterns) {
    schema = schema.refine(
      (value) => valueMatchesFieldPatterns(value, validation),
      getFieldPatternErrorMessage(field, validation),
    );
  }

  return field.isRequired ? schema : schema.optional().or(z.literal(""));
}

function buildFieldSchema(field: ApplyFormFieldConfig): z.ZodTypeAny {
  const validation = field.validation ?? {};

  switch (field.fieldType) {
    case "EMAIL":
      return field.isRequired
        ? z.string().trim().email(`${field.label} must be a valid email`)
        : z
            .string()
            .trim()
            .email(`${field.label} must be a valid email`)
            .optional()
            .or(z.literal(""));
    case "PHONE":
      return field.isRequired ? phoneSchema : phoneSchema.optional().or(z.literal(""));
    case "CNIC":
      return field.isRequired ? cnicSchema : cnicSchema.optional().or(z.literal(""));
    case "NUMBER": {
      let numberSchema = z.coerce.number();
      if (typeof validation.min === "number") {
        numberSchema = numberSchema.min(validation.min);
      }
      if (typeof validation.max === "number") {
        numberSchema = numberSchema.max(validation.max);
      }
      return field.isRequired
        ? numberSchema
        : z.union([numberSchema, z.literal(""), z.nan()]).optional();
    }
    case "DATE":
      return field.isRequired
        ? z.string().trim().min(1, `${field.label} is required`)
        : z.string().trim().optional().or(z.literal(""));
    case "CHECKBOX":
      return field.isRequired
        ? z.literal(true, {
            errorMap: () => ({ message: `${field.label} must be accepted` }),
          })
        : z.boolean().optional();
    case "MULTI_SELECT":
      return field.isRequired
        ? z.array(z.string()).min(1, `${field.label} is required`)
        : z.array(z.string()).optional();
    case "SELECT":
    case "RADIO":
      return field.isRequired
        ? z.string().trim().min(1, `${field.label} is required`)
        : z.string().trim().optional().or(z.literal(""));
    case "TEXTAREA":
    case "TEXT":
    case "FILE":
    default:
      return buildStringSchema(field, validation);
  }
}

export function buildDynamicFieldsSchema(
  fields: ApplyFormFieldConfig[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    shape[field.fieldKey] = buildFieldSchema(field);
  }

  return z.object(shape);
}

export function serializeFieldValue(
  fieldType: FieldType,
  value: unknown,
): { plain?: string; json?: unknown } {
  if (value === undefined || value === null || value === "") {
    return {};
  }

  if (fieldType === "MULTI_SELECT" && Array.isArray(value)) {
    return { json: value };
  }

  if (fieldType === "CHECKBOX") {
    return { plain: value ? "true" : "false" };
  }

  return { plain: String(value) };
}
