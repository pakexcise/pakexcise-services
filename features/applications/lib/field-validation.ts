import type { ApplyFormFieldConfig } from "@/features/applications/types";

function getValidationMessage(
  field: ApplyFormFieldConfig,
  validation: Record<string, unknown>,
  fallback: string,
): string {
  if (typeof validation.patternMessage === "string" && validation.patternMessage.trim()) {
    return validation.patternMessage;
  }

  return fallback;
}

function compilePattern(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern, "i");
  } catch {
    return null;
  }
}

export function valueMatchesFieldPatterns(
  value: string,
  validation: Record<string, unknown>,
): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  const normalized = trimmed.toUpperCase();

  if (Array.isArray(validation.patterns)) {
    const patterns = validation.patterns.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );

    if (patterns.length === 0) {
      return true;
    }

    return patterns.some((pattern) => {
      const regex = compilePattern(pattern);
      return regex?.test(normalized) ?? false;
    });
  }

  if (typeof validation.pattern === "string" && validation.pattern.length > 0) {
    const regex = compilePattern(validation.pattern);
    return regex?.test(normalized) ?? false;
  }

  return true;
}

export function applyFieldInputTransform(
  value: string,
  validation: Record<string, unknown> | null | undefined,
): string {
  if (validation?.normalize === "uppercase") {
    return value.toUpperCase();
  }

  return value;
}

export function getFieldPatternErrorMessage(
  field: ApplyFormFieldConfig,
  validation: Record<string, unknown>,
): string {
  return getValidationMessage(
    field,
    validation,
    `${field.label} format is invalid`,
  );
}
