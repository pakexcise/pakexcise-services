import type { ApplyFormFieldConfig } from "@/features/applications/types";

export type FieldShowWhenRule = {
  fieldKey: string;
  operator: "equals" | "includes" | "not_equals" | "notEmpty";
  value?: string | boolean | number;
};

export type FieldConditionalRule = {
  showWhen?: FieldShowWhenRule;
};

const VALID_OPERATORS = [
  "equals",
  "includes",
  "not_equals",
  "notEmpty",
] as const;

function isValidOperator(
  value: string,
): value is FieldShowWhenRule["operator"] {
  return (VALID_OPERATORS as readonly string[]).includes(value);
}

export function parseFieldConditional(
  conditionalJson: unknown,
): FieldConditionalRule | null {
  if (!conditionalJson || typeof conditionalJson !== "object") {
    return null;
  }

  const record = conditionalJson as Record<string, unknown>;
  if (!record.showWhen || typeof record.showWhen !== "object") {
    return null;
  }

  const showWhen = record.showWhen as Record<string, unknown>;
  const fieldKey =
    typeof showWhen.fieldKey === "string" ? showWhen.fieldKey : null;

  if (!fieldKey) {
    return null;
  }

  const operatorRaw =
    typeof showWhen.operator === "string" ? showWhen.operator : "equals";
  const operator = isValidOperator(operatorRaw) ? operatorRaw : "equals";

  const value =
    typeof showWhen.value === "string" ||
    typeof showWhen.value === "boolean" ||
    typeof showWhen.value === "number"
      ? showWhen.value
      : undefined;

  return {
    showWhen: {
      fieldKey,
      operator,
      value,
    },
  };
}

function evaluateShowWhen(
  rule: FieldShowWhenRule,
  values: Record<string, unknown>,
): boolean {
  const raw = values[rule.fieldKey];

  switch (rule.operator) {
    case "includes": {
      if (!Array.isArray(raw)) {
        return false;
      }

      return raw.includes(String(rule.value));
    }
    case "equals":
      return raw === rule.value;
    case "not_equals":
      return raw !== rule.value;
    case "notEmpty": {
      if (raw === undefined || raw === null || raw === "") {
        return false;
      }

      if (Array.isArray(raw)) {
        return raw.length > 0;
      }

      return true;
    }
    default:
      return true;
  }
}

export function isFieldVisible(
  field: Pick<ApplyFormFieldConfig, "conditional">,
  values: Record<string, unknown>,
): boolean {
  if (!field.conditional?.showWhen) {
    return true;
  }

  return evaluateShowWhen(field.conditional.showWhen, values);
}

export function filterVisibleFields<
  T extends Pick<ApplyFormFieldConfig, "conditional" | "fieldKey">,
>(fields: T[], values: Record<string, unknown>): T[] {
  return fields.filter((field) => isFieldVisible(field, values));
}
