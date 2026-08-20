"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactInquiryAction } from "@/features/contact-inquiries/actions/submit-contact-inquiry";
import {
  buildContactInquiryWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp/build-service-message";
import {
  createContactInquiryFormSchema,
  type ContactInquiryFormValues,
} from "@/lib/validations/contact-inquiry";
import { formatPakistanPhoneInput } from "@/lib/validations/phone";
type Locale = "en";

import { cn } from "@/lib/utils";

export type ContactInquiryFormLabels = {
  fullName: string;
  phone: string;
  phoneHint: string;
  phonePlaceholder: string;
  email: string;
  optional: string;
  serviceInterest: string;
  servicePlaceholder: string;
  region: string;
  regionPlaceholder: string;
  city: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successDescription: string;
  successWhatsappCta: string;
  validationSummary: string;
  errors: {
    fullNameRequired: string;
    fullNameTooLong: string;
    phoneInvalid: string;
    emailInvalid: string;
    serviceRequired: string;
    messageTooLong: string;
  };
};

type ContactInquiryFormProps = {
  locale: Locale;
  labels: ContactInquiryFormLabels;
  serviceOptions: Array<{ value: string; label: string }>;
  regionOptions?: string[];
  whatsappPhone?: string | null;
  className?: string;
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

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function ContactInquiryForm({
  locale,
  labels,
  serviceOptions,
  regionOptions = [],
  whatsappPhone,
  className,
}: ContactInquiryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedValues, setSubmittedValues] =
    useState<ContactInquiryFormValues | null>(null);

  const schema = useMemo(
    () => createContactInquiryFormSchema(labels.errors),
    [labels.errors],
  );

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ContactInquiryFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      serviceInterest: "",
      regionName: "",
      cityName: "",
      message: "",
    },
  });

  const fieldLabels: Record<keyof ContactInquiryFormValues, string> = {
    fullName: labels.fullName,
    phone: labels.phone,
    email: labels.email,
    serviceInterest: labels.serviceInterest,
    regionName: labels.region,
    cityName: labels.city,
    message: labels.message,
  };

  const errorEntries = (
    Object.entries(errors) as Array<
      [keyof ContactInquiryFormValues, { message?: string } | undefined]
    >
  ).filter(([, error]) => Boolean(error?.message));

  function onValidSubmit(values: ContactInquiryFormValues) {
    setSubmitError(null);
    setShowValidationSummary(false);

    startTransition(async () => {
      const result = await submitContactInquiryAction({
        ...values,
        locale,
      });

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            const message = messages?.[0];
            if (message && field in fieldLabels) {
              setError(field as keyof ContactInquiryFormValues, { message });
            }
          }
        }

        setSubmitError(result.error);
        setShowValidationSummary(true);
        return;
      }

      setSubmittedValues(values);
      setIsSuccess(true);
    });
  }

  const whatsappHref =
    isSuccess && whatsappPhone?.trim() && submittedValues
      ? buildWhatsAppUrl(
          whatsappPhone,
          buildContactInquiryWhatsAppMessage({
            fullName: submittedValues.fullName,
            phone: submittedValues.phone,
            serviceInterest: submittedValues.serviceInterest,
            regionName: submittedValues.regionName,
            cityName: submittedValues.cityName,
            message: submittedValues.message,
          }),
        )
      : null;

  if (isSuccess) {
    return (
      <Card className={cn("border-primary/20 bg-primary/5 shadow-sm", className)}>
        <CardContent className="space-y-4 p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{labels.successTitle}</h2>
            <p className="text-sm text-muted-foreground">{labels.successDescription}</p>
          </div>
          {whatsappHref ? (
            <Button asChild size="lg" className="bg-[#128C7E] text-white hover:bg-[#0f7a6c]">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-event="click_whatsapp"
                data-analytics-placement="contact_form_success_whatsapp"
              >
                {labels.successWhatsappCta}
              </a>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-5 sm:p-8">
        <form
          onSubmit={handleSubmit(onValidSubmit, () => {
            setShowValidationSummary(true);
            setSubmitError(null);
          })}
          className="space-y-5"
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

          <div className="space-y-2">
            <Label htmlFor="contact-full-name">{labels.fullName}</Label>
            <Input
              id="contact-full-name"
              autoComplete="name"
              className="h-11"
              aria-invalid={Boolean(errors.fullName)}
              {...register("fullName")}
            />
            <FieldError message={errors.fullName?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-phone">{labels.phone}</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    id="contact-phone"
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
              <Label htmlFor="contact-email">
                {labels.email}
                <OptionalBadge label={labels.optional} />
              </Label>
              <Input
                id="contact-email"
                type="email"
                autoComplete="email"
                className="h-11"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-service">{labels.serviceInterest}</Label>
            <select
              id="contact-service"
              className={fieldSelectClassName}
              aria-invalid={Boolean(errors.serviceInterest)}
              {...register("serviceInterest")}
            >
              <option value="">{labels.servicePlaceholder}</option>
              {serviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.serviceInterest?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-region">
                {labels.region}
                <OptionalBadge label={labels.optional} />
              </Label>
              {regionOptions.length > 0 ? (
                <select
                  id="contact-region"
                  className={fieldSelectClassName}
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
                  id="contact-region"
                  placeholder={labels.regionPlaceholder}
                  className="h-11"
                  {...register("regionName")}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-city">
                {labels.city}
                <OptionalBadge label={labels.optional} />
              </Label>
              <Input id="contact-city" className="h-11" {...register("cityName")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">
              {labels.message}
              <OptionalBadge label={labels.optional} />
            </Label>
            <Textarea
              id="contact-message"
              placeholder={labels.messagePlaceholder}
              rows={4}
              className="min-h-[120px] resize-y"
              aria-invalid={Boolean(errors.message)}
              {...register("message")}
            />
            <FieldError message={errors.message?.message} />
          </div>

          {submitError ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="h-12 w-full" disabled={isPending}>
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
  );
}

export function ContactInquiryFormSection({
  heading,
  description,
  ...props
}: ContactInquiryFormProps & {
  heading: string;
  description: string;
}) {
  return (
    <div className="space-y-4" id="contact-form">
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{heading}</h2>
        <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      <ContactInquiryForm {...props} />
    </div>
  );
}
