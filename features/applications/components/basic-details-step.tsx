"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { basicApplicantDetailsSchema } from "@/features/applications/lib/basic-details-schema";
import type { BasicApplicantDetails } from "@/features/applications/types";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BasicApplicantDetails>({
    resolver: zodResolver(basicApplicantDetailsSchema),
    defaultValues: {
      fullName: defaultValues.fullName ?? "",
      email: defaultValues.email ?? "",
      phone: defaultValues.phone ?? "",
      cnic: defaultValues.cnic ?? "",
    },
  });

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
          <Input
            id="cnic"
            inputMode="numeric"
            autoComplete="off"
            {...register("cnic")}
            aria-invalid={Boolean(errors.cnic)}
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
