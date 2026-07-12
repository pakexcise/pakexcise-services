"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, MapPin, MessageSquare, Send, User } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitGuestLeadAction } from "@/features/guest-leads/actions/submit-guest-lead";
import {
  createGuestRequestFormSchema,
  type GuestRequestFormValues,
} from "@/lib/validations/guest-lead";
import { formatPakistanPhoneInput } from "@/lib/validations/phone";
type Locale = "en";

import { cn } from "@/lib/utils";

import Link from "next/link";
export type GuestRequestFormLabels = {
  formIntro: string;
  contactSection: string;
  contactSectionHint: string;
  locationSection: string;
  detailsSection: string;
  fullName: string;
  phone: string;
  phoneHint: string;
  phonePlaceholder: string;
  email: string;
  optional: string;
  region: string;
  regionPlaceholder: string;
  city: string;
  vehicleInfo: string;
  vehiclePlaceholder: string;
  licenseInfo: string;
  licensePlaceholder: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successDescription: string;
  backToService: string;
  error: string;
  whatsappFollowUp: string;
  validationSummary: string;
  errors: {
    fullNameRequired: string;
    fullNameTooLong: string;
    phoneInvalid: string;
    emailInvalid: string;
  };
};

type GuestRequestFormProps = {
  serviceSlug: string;
  serviceName: string;
  locale: Locale;
  labels: GuestRequestFormLabels;
  showVehicleField?: boolean;
  showLicenseField?: boolean;
  regionOptions?: string[];
};

const fieldSelectClassName = cn(
  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs",
  "ring-offset-background transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

function OptionalBadge({ label }: { label: string }) {
  return (
    <span className="ms-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
  );
}

function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1 border-b pb-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function GuestRequestForm({
  serviceSlug,
  serviceName,
  locale,
  labels,
  showVehicleField = false,
  showLicenseField = false,
  regionOptions = [],
}: GuestRequestFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(
    () => createGuestRequestFormSchema(labels.errors),
    [labels.errors],
  );

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<GuestRequestFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      regionName: "",
      cityName: "",
      vehicleInfo: "",
      licenseInfo: "",
      message: "",
    },
  });

  const fieldLabels: Record<keyof GuestRequestFormValues, string> = {
    fullName: labels.fullName,
    phone: labels.phone,
    email: labels.email,
    regionName: labels.region,
    cityName: labels.city,
    vehicleInfo: labels.vehicleInfo,
    licenseInfo: labels.licenseInfo,
    message: labels.message,
  };

  const errorEntries = (
    Object.entries(errors) as Array<
      [keyof GuestRequestFormValues, { message?: string } | undefined]
    >
  ).filter(([, error]) => Boolean(error?.message));

  function onValidSubmit(values: GuestRequestFormValues) {
    setSubmitError(null);
    setShowValidationSummary(false);

    startTransition(async () => {
      const result = await submitGuestLeadAction({
        serviceSlug,
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        regionName: values.regionName,
        cityName: values.cityName,
        vehicleInfo: values.vehicleInfo,
        licenseInfo: values.licenseInfo,
        message: values.message,
        locale,
      });

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            const message = messages?.[0];
            if (message && field in fieldLabels) {
              setError(field as keyof GuestRequestFormValues, { message });
            }
          }
        }

        setSubmitError(result.error === "Validation failed" ? labels.error : result.error);
        setShowValidationSummary(true);
        return;
      }

      setIsSuccess(true);
    });
  }

  if (isSuccess) {
    return (
      <Card className="mx-auto max-w-2xl border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="space-y-5 p-8 text-center sm:p-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold sm:text-2xl">{labels.successTitle}</h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              {labels.successDescription}
            </p>
          </div>
          <p className="rounded-lg border border-primary/15 bg-background/80 px-4 py-3 text-sm font-medium text-primary">
            {labels.whatsappFollowUp}
          </p>
          <Button asChild variant="outline" className="min-w-[180px]">
            <Link href={`/services/${serviceSlug}`}>{labels.backToService}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4 sm:p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Send className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">{labels.formIntro}</p>
          <p className="text-lg font-semibold leading-snug">{serviceName}</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-5 sm:p-8">
          <form
            onSubmit={handleSubmit(onValidSubmit, () => {
              setShowValidationSummary(true);
              setSubmitError(null);
            })}
            className="space-y-8"
            noValidate
          >
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

            <FormSection title={labels.contactSection} hint={labels.contactSectionHint}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="guest-full-name" className="flex items-center gap-1.5">
                    <User className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    {labels.fullName}
                  </Label>
                  <Input
                    id="guest-full-name"
                    autoComplete="name"
                    className="h-11"
                    aria-invalid={Boolean(errors.fullName)}
                    {...register("fullName")}
                  />
                  <FieldError message={errors.fullName?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-phone">{labels.phone}</Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="guest-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder={labels.phonePlaceholder}
                        maxLength={12}
                        className="h-11"
                        aria-invalid={Boolean(errors.phone)}
                        value={field.value}
                        onChange={(event) =>
                          field.onChange(formatPakistanPhoneInput(event.target.value))
                        }
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">{labels.phoneHint}</p>
                  <FieldError message={errors.phone?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-email">
                    {labels.email}
                    <OptionalBadge label={labels.optional} />
                  </Label>
                  <Input
                    id="guest-email"
                    type="email"
                    autoComplete="email"
                    className="h-11"
                    aria-invalid={Boolean(errors.email)}
                    {...register("email")}
                  />
                  <FieldError message={errors.email?.message} />
                </div>
              </div>
            </FormSection>

            <FormSection title={labels.locationSection}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guest-region" className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    {labels.region}
                    <OptionalBadge label={labels.optional} />
                  </Label>
                  {regionOptions.length > 0 ? (
                    <select
                      id="guest-region"
                      className={fieldSelectClassName}
                      aria-invalid={Boolean(errors.regionName)}
                      {...register("regionName")}
                    >
                      <option value="">{labels.regionPlaceholder}</option>
                      {regionOptions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="guest-region"
                      placeholder={labels.regionPlaceholder}
                      className="h-11"
                      aria-invalid={Boolean(errors.regionName)}
                      {...register("regionName")}
                    />
                  )}
                  <FieldError message={errors.regionName?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-city">
                    {labels.city}
                    <OptionalBadge label={labels.optional} />
                  </Label>
                  <Input
                    id="guest-city"
                    className="h-11"
                    aria-invalid={Boolean(errors.cityName)}
                    {...register("cityName")}
                  />
                  <FieldError message={errors.cityName?.message} />
                </div>
              </div>
            </FormSection>

            <FormSection title={labels.detailsSection}>
              <div className="grid gap-4">
                {showVehicleField ? (
                  <div className="space-y-2">
                    <Label htmlFor="guest-vehicle">
                      {labels.vehicleInfo}
                      <OptionalBadge label={labels.optional} />
                    </Label>
                    <Input
                      id="guest-vehicle"
                      placeholder={labels.vehiclePlaceholder}
                      className="h-11"
                      aria-invalid={Boolean(errors.vehicleInfo)}
                      {...register("vehicleInfo")}
                    />
                    <FieldError message={errors.vehicleInfo?.message} />
                  </div>
                ) : null}

                {showLicenseField ? (
                  <div className="space-y-2">
                    <Label htmlFor="guest-license">
                      {labels.licenseInfo}
                      <OptionalBadge label={labels.optional} />
                    </Label>
                    <Input
                      id="guest-license"
                      placeholder={labels.licensePlaceholder}
                      className="h-11"
                      aria-invalid={Boolean(errors.licenseInfo)}
                      {...register("licenseInfo")}
                    />
                    <FieldError message={errors.licenseInfo?.message} />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="guest-message" className="flex items-center gap-1.5">
                    <MessageSquare className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    {labels.message}
                    <OptionalBadge label={labels.optional} />
                  </Label>
                  <Textarea
                    id="guest-message"
                    placeholder={labels.messagePlaceholder}
                    rows={4}
                    className="min-h-[120px] resize-y"
                    aria-invalid={Boolean(errors.message)}
                    {...register("message")}
                  />
                  <FieldError message={errors.message?.message} />
                </div>
              </div>
            </FormSection>

            {submitError ? (
              <p
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {submitError}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {labels.submitting}
                </>
              ) : (
                <>
                  <Send className="size-4" aria-hidden="true" />
                  {labels.submit}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
