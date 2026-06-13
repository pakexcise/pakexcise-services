"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { DynamicFieldInput } from "@/features/applications/components/dynamic-field-input";
import { buildDynamicFieldsSchema } from "@/features/applications/lib/build-field-schema";
import type {
  ApplyFormFieldConfig,
  ApplyServiceConfig,
  ApplyServiceOption,
} from "@/features/applications/types";
import { cn } from "@/lib/utils";

type ServiceDetailsStepProps = {
  service: ApplyServiceConfig;
  availableServices: ApplyServiceOption[];
  serviceFields: ApplyFormFieldConfig[];
  defaultValues: Record<string, string | string[] | boolean>;
  labels: {
    title: string;
    description: string;
    serviceSection: string;
    selectedBadge: string;
    switchServiceNotice: string;
    additionalSection: string;
    noAdditionalFields: string;
    emptyTitle: string;
    back: string;
    continue: string;
    saving: string;
  };
  isSaving: boolean;
  onBack: () => void;
  onContinueSameService: (
    values: Record<string, string | string[] | boolean>,
  ) => Promise<void>;
  onSwitchService: (nextServiceSlug: string) => Promise<void>;
};

export function ServiceDetailsStep({
  service,
  availableServices,
  serviceFields,
  defaultValues,
  labels,
  isSaving,
  onBack,
  onContinueSameService,
  onSwitchService,
}: ServiceDetailsStepProps) {
  const [selectedSlug, setSelectedSlug] = useState(service.slug);
  const isSwitchingService = selectedSlug !== service.slug;

  const schema = useMemo(
    () => buildDynamicFieldsSchema(serviceFields),
    [serviceFields],
  );

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
  const selectedService =
    availableServices.find((item) => item.slug === selectedSlug) ?? null;

  async function handleContinue() {
    if (isSwitchingService) {
      await onSwitchService(selectedSlug);
      return;
    }

    if (serviceFields.length === 0) {
      await onContinueSameService({});
      return;
    }

    await handleSubmit(onContinueSameService)();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{labels.title}</h2>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">{labels.serviceSection}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {availableServices.map((option) => {
            const isSelected = option.slug === selectedSlug;
            const isCurrent = option.slug === service.slug;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedSlug(option.slug)}
                className={cn(
                  "rounded-lg border p-4 text-start transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-primary/40 hover:bg-muted/30",
                )}
                aria-pressed={isSelected}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    {option.region ? (
                      <p className="text-xs text-muted-foreground">
                        {option.region}
                      </p>
                    ) : null}
                    <p className="font-medium leading-snug">{option.name}</p>
                    {option.shortDescription ? (
                      <p className="text-sm text-muted-foreground">
                        {option.shortDescription}
                      </p>
                    ) : null}
                  </div>
                  {isCurrent && isSelected ? (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {labels.selectedBadge}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {isSwitchingService && selectedService ? (
        <p className="rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-foreground">
          {labels.switchServiceNotice.replace("__SERVICE__", selectedService.name)}
        </p>
      ) : null}

      {!isSwitchingService ? (
        <section className="space-y-4">
          <h3 className="text-sm font-medium">{labels.additionalSection}</h3>

          {serviceFields.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" aria-hidden="true" />
              </div>
              <p className="font-medium">{labels.emptyTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {labels.noAdditionalFields}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {serviceFields.map((field) => (
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
                      setValue(field.fieldKey, nextValue, {
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSaving}>
          {labels.back}
        </Button>
        <Button type="button" onClick={handleContinue} disabled={isSaving}>
          {isSaving ? labels.saving : labels.continue}
        </Button>
      </div>
    </div>
  );
}
