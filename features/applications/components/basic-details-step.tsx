"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBasicApplicantDetailsSchema } from "@/features/applications/lib/basic-details-schema";
import type { BasicApplicantDetails } from "@/features/applications/types";
import { formatCnicInput } from "@/lib/validations/cnic";

type BasicDetailsStepProps = {
  defaultValues: Partial<BasicApplicantDetails>;
  labels: {
    title: string;
    description: string;
    fullName: string;
    email: string;
    phone: string;
    phoneHint: string;
    cnic: string;
    cnicHint: string;
    continue: string;
    saving: string;
    validationSummary: string;
    errors: {
      fullNameRequired: string;
      fullNameTooLong: string;
      emailInvalid: string;
      phoneInvalid: string;
      cnicInvalid: string;
    };
  };
  isSaving: boolean;
  onSubmit: (values: BasicApplicantDetails) => Promise<void>;
};

export function BasicDetailsStep({
  defaultValues,
  labels,
  isSaving,
  onSubmit,
}: BasicDetailsStepProps) {
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  const schema = useMemo(
    () => createBasicApplicantDetailsSchema(labels.errors),
    [labels.errors],
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BasicApplicantDetails>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: defaultValues.fullName ?? "",
      email: defaultValues.email ?? "",
      phone: defaultValues.phone ?? "",
      cnic: defaultValues.cnic ?? "",
    },
  });

  const fieldLabels: Record<keyof BasicApplicantDetails, string> = {
    fullName: labels.fullName,
    email: labels.email,
    phone: labels.phone,
    cnic: labels.cnic,
  };

  const errorEntries = (
    Object.entries(errors) as Array<
      [keyof BasicApplicantDetails, { message?: string } | undefined]
    >
  ).filter(([, error]) => Boolean(error?.message));

  return (
    <form
      onSubmit={handleSubmit(
        async (values) => {
          setShowValidationSummary(false);
          await onSubmit(values);
        },
        () => {
          setShowValidationSummary(true);
        },
      )}
      className="space-y-6"
      noValidate
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{labels.title}</h2>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      {showValidationSummary && errorEntries.length > 0 ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div className="space-y-2">
              <p className="font-medium">{labels.validationSummary}</p>
              <ul className="list-disc space-y-1 ps-4">
                {errorEntries.map(([field, error]) => (
                  <li key={field}>
                    <span className="font-medium">{fieldLabels[field]}:</span>{" "}
                    {error?.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">{labels.fullName}</Label>
          <Input
            id="fullName"
            autoComplete="name"
            {...register("fullName")}
            aria-invalid={Boolean(errors.fullName)}
          />
          {errors.fullName ? (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{labels.email}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{labels.phone}</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register("phone")}
            aria-invalid={Boolean(errors.phone)}
          />
          <p className="text-xs text-muted-foreground">{labels.phoneHint}</p>
          {errors.phone ? (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cnic">{labels.cnic}</Label>
          <Controller
            name="cnic"
            control={control}
            render={({ field }) => (
              <Input
                id="cnic"
                inputMode="numeric"
                autoComplete="off"
                placeholder="12345-1234567-1"
                maxLength={15}
                value={field.value}
                onChange={(event) =>
                  field.onChange(formatCnicInput(event.target.value))
                }
                onBlur={field.onBlur}
                aria-invalid={Boolean(errors.cnic)}
              />
            )}
          />
          <p className="text-xs text-muted-foreground">{labels.cnicHint}</p>
          {errors.cnic ? (
            <p className="text-sm text-destructive">{errors.cnic.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? labels.saving : labels.continue}
        </Button>
      </div>
    </form>
  );
}
