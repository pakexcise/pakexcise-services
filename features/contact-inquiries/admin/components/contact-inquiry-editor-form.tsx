"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createContactInquiryAdminAction,
  updateContactInquiryAdminAction} from "@/features/contact-inquiries/actions/admin-contact-inquiry-actions";
import type { ContactInquiryStatus } from "@prisma/client";

import { useRouter } from "next/navigation";
type ServiceOption = {
  slug: string;
  nameEn: string;
};

export type ContactInquiryEditorValues = {
  serviceInterest: string;
  status: ContactInquiryStatus;
  fullName: string;
  phone: string;
  email: string;
  regionName: string;
  cityName: string;
  message: string;
  adminNotes: string;
  locale: "en";
};

type ContactInquiryEditorFormProps = {
  mode: "create" | "edit";
  inquiryId?: string;
  initialValues: ContactInquiryEditorValues;
  services: ServiceOption[];
  locale: "en";
  labels: {
    sectionCustomer: string;
    sectionInquiry: string;
    sectionNotes: string;
    service: string;
    customService: string;
    otherService: string;
    status: string;
    fullName: string;
    phone: string;
    email: string;
    region: string;
    city: string;
    message: string;
    adminNotes: string;
    preferredLocale: string;
    save: string;
    saving: string;
    saveFailed: string;
    statusNew: string;
    statusContacted: string;
    statusClosed: string;
    statusSpam: string;
  };
};

const statusOptions: ContactInquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "CLOSED",
  "SPAM"];

export function ContactInquiryEditorForm({
  mode,
  inquiryId,
  initialValues,
  services,
  locale,
  labels}: ContactInquiryEditorFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof ContactInquiryEditorValues>(
    key: K,
    value: ContactInquiryEditorValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function statusLabel(status: ContactInquiryStatus): string {
    switch (status) {
      case "NEW":
        return labels.statusNew;
      case "CONTACTED":
        return labels.statusContacted;
      case "CLOSED":
        return labels.statusClosed;
      case "SPAM":
        return labels.statusSpam;
      default:
        return status;
    }
  }

  function handleSubmit() {
    setError(null);

    if (!values.serviceInterest.trim()) {
      setError(labels.saveFailed);
      return;
    }

    startTransition(async () => {
      const payload = {
        ...(mode === "edit" ? { id: inquiryId! } : {}),
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || null,
        serviceInterest: values.serviceInterest,
        regionName: values.regionName || null,
        cityName: values.cityName || null,
        message: values.message || null,
        adminNotes: values.adminNotes || null,
        locale: values.locale,
        status: values.status};

      const result =
        mode === "create"
          ? await createContactInquiryAdminAction(payload)
          : await updateContactInquiryAdminAction(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/admin/contact-inquiries/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-base font-semibold">{labels.sectionCustomer}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ci-full-name">{labels.fullName}</Label>
            <Input
              id="ci-full-name"
              value={values.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-phone">{labels.phone}</Label>
            <Input
              id="ci-phone"
              value={values.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-email">{labels.email}</Label>
            <Input
              id="ci-email"
              type="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-locale">{labels.preferredLocale}</Label>
            <select
              id="ci-locale"
              value={values.locale}
              onChange={(event) =>
                updateField("locale", event.target.value as "en")
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-base font-semibold">{labels.sectionInquiry}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ci-service">{labels.service}</Label>
            <select
              id="ci-service"
              value={values.serviceInterest}
              onChange={(event) =>
                updateField("serviceInterest", event.target.value)
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              required
            >
              <option value="">{labels.customService}</option>
              <option value="other">{labels.otherService}</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-status">{labels.status}</Label>
            <select
              id="ci-status"
              value={values.status}
              onChange={(event) =>
                updateField("status", event.target.value as ContactInquiryStatus)
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-region">{labels.region}</Label>
            <Input
              id="ci-region"
              value={values.regionName}
              onChange={(event) => updateField("regionName", event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ci-city">{labels.city}</Label>
            <Input
              id="ci-city"
              value={values.cityName}
              onChange={(event) => updateField("cityName", event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ci-message">{labels.message}</Label>
            <Textarea
              id="ci-message"
              value={values.message}
              onChange={(event) => updateField("message", event.target.value)}
              rows={4}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-base font-semibold">{labels.sectionNotes}</h2>
        <Textarea
          value={values.adminNotes}
          onChange={(event) => updateField("adminNotes", event.target.value)}
          placeholder={labels.adminNotes}
          rows={4}
        />
      </section>

      <Button type="button" disabled={isPending} onClick={handleSubmit}>
        {isPending ? labels.saving : labels.save}
      </Button>
    </div>
  );
}
