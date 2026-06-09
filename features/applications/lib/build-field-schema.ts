import type { FieldType } from "@prisma/client";
import { z } from "zod";

import { cnicSchema, phoneSchema } from "@/lib/validations/common";
import type { ApplyFormFieldConfig } from "@/features/applications/types";

function buildStringSchema(
  field: ApplyFormFieldConfig,
  validation: Record<string, unknown>,
): z.ZodTypeAny {
  let schema = z.string().trim();

  if (typeof validation.minLength === "number") {
    schema = schema.min(
      validation.minLength,
      `${field.label} must be at least ${validation.minLength} characters`,
    );
  } else if (field.isRequired) {
    schema = schema.min(1, `${field.label} is required`);
  }

  if (typeof validation.maxLength === "number") {
    schema = schema.max(
      validation.maxLength,
      `${field.label} must be at most ${validation.maxLength} characters`,
    );
  }

  if (typeof validation.pattern === "string") {
    schema = schema.regex(
      new RegExp(validation.pattern),
      `${field.label} format is invalid`,
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
