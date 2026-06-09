"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { buildDynamicFieldsSchema } from "@/features/applications/lib/build-field-schema";
import { DynamicFieldInput } from "@/features/applications/components/dynamic-field-input";
import type { ApplyFormFieldConfig } from "@/features/applications/types";

type DynamicFieldsStepProps = {
  fields: ApplyFormFieldConfig[];
  defaultValues: Record<string, string | string[] | boolean>;
  labels: {
    title: string;
    description: string;
    empty: string;
    back: string;
    continue: string;
    saving: string;
  };
  isSaving: boolean;
  onBack: () => void;
  onSubmit: (
    values: Record<string, string | string[] | boolean>,
  ) => Promise<void>;
};

export function DynamicFieldsStep({
  fields,
  defaultValues,
  labels,
  isSaving,
  onBack,
  onSubmit,
}: DynamicFieldsStepProps) {
  const schema = useMemo(() => buildDynamicFieldsSchema(fields), [fields]);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const values = watch();

  if (fields.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{labels.title}</h2>
          <p className="text-sm text-muted-foreground">{labels.description}</p>
        </div>
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          {labels.empty}
        </p>
        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            {labels.back}
          </Button>
          <Button
            type="button"
            onClick={() => onSubmit({})}
            disabled={isSaving}
          >
            {isSaving ? labels.saving : labels.continue}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{labels.title}</h2>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.id}
            className={
              field.fieldType === "TEXTAREA" ||
              field.fieldType === "MULTI_SELECT" ||
              field.fieldType === "CHECKBOX"
                ? "sm:col-span-2"
                : undefined
            }
          >
            <DynamicFieldInput
              field={field}
              value={values[field.fieldKey]}
              error={errors[field.fieldKey]?.message as string | undefined}
              onChange={(nextValue) =>
                setValue(field.fieldKey, nextValue, { shouldValidate: true })
              }
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          {labels.back}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? labels.saving : labels.continue}
        </Button>
      </div>
    </form>
  );
}
