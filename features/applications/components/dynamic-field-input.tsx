"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ApplyFormFieldConfig } from "@/features/applications/types";
import { applyFieldInputTransform } from "@/features/applications/lib/field-validation";
import { formatPakistanPhoneInput } from "@/lib/validations/phone";

type DynamicFieldInputProps = {
  field: ApplyFormFieldConfig;
  value: string | string[] | boolean | undefined;
  error?: string;
  onChange: (value: string | string[] | boolean) => void;
};

export function DynamicFieldInput({
  field,
  value,
  error,
  onChange,
}: DynamicFieldInputProps) {
  const fieldId = `field-${field.fieldKey}`;

  const renderControl = () => {
    switch (field.fieldType) {
      case "TEXTAREA":
        return (
          <Textarea
            id={fieldId}
            name={field.fieldKey}
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder ?? undefined}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        );
      case "SELECT":
      case "RADIO":
        return (
          <select
            id={fieldId}
            name={field.fieldKey}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{field.placeholder ?? "Select an option"}</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "MULTI_SELECT":
        return (
          <div className="space-y-2 rounded-md border border-input p-3">
            {field.options.map((option) => {
              const selected = Array.isArray(value) ? value : [];
              const checked = selected.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      const next = new Set(selected);
                      if (event.target.checked) {
                        next.add(option.value);
                      } else {
                        next.delete(option.value);
                      }
                      onChange(Array.from(next));
                    }}
                    className="size-4 rounded border-input"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        );
      case "CHECKBOX":
        return (
          <label className="flex items-start gap-2 text-sm">
            <input
              id={fieldId}
              type="checkbox"
              checked={value === true}
              onChange={(event) => onChange(event.target.checked)}
              className="mt-0.5 size-4 rounded border-input"
              aria-invalid={Boolean(error)}
            />
            <span>{field.helpText ?? field.label}</span>
          </label>
        );
      case "NUMBER":
        return (
          <Input
            id={fieldId}
            name={field.fieldKey}
            type="number"
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder ?? undefined}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        );
      case "DATE":
        return (
          <Input
            id={fieldId}
            name={field.fieldKey}
            type="date"
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        );
      case "EMAIL":
        return (
          <Input
            id={fieldId}
            name={field.fieldKey}
            type="email"
            autoComplete="email"
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder ?? undefined}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        );
      case "PHONE":
        return (
          <Input
            id={fieldId}
            name={field.fieldKey}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={12}
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder ?? undefined}
            onChange={(event) =>
              onChange(formatPakistanPhoneInput(event.target.value))
            }
            aria-invalid={Boolean(error)}
          />
        );
      case "CNIC":
        return (
          <Input
            id={fieldId}
            name={field.fieldKey}
            type="text"
            inputMode="numeric"
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder ?? "12345-1234567-1"}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        );
      case "FILE":
        return (
          <p className="text-sm text-muted-foreground">
            {field.helpText ?? "Upload this document in the documents step."}
          </p>
        );
      case "TEXT":
      default:
        return (
          <Input
            id={fieldId}
            name={field.fieldKey}
            type="text"
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder ?? undefined}
            onChange={(event) =>
              onChange(
                applyFieldInputTransform(event.target.value, field.validation),
              )
            }
            aria-invalid={Boolean(error)}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {field.fieldType !== "CHECKBOX" ? (
        <Label htmlFor={fieldId}>
          {field.label}
          {field.isRequired ? (
            <span className="text-destructive"> *</span>
          ) : null}
        </Label>
      ) : null}
      {renderControl()}
      {field.fieldType !== "CHECKBOX" && field.helpText ? (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
