"use client";

import { useRouter } from "@/i18n/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createGuestLeadAdminAction,
  updateGuestLeadAdminAction,
} from "@/features/guest-leads/actions/admin-guest-lead-actions";
import type { GuestLeadSource, GuestLeadStatus } from "@prisma/client";

type ServiceOption = {
  id: string;
  nameEn: string;
  nameUr: string;
};

export type SupportRequestEditorValues = {
  serviceId: string;
  source: GuestLeadSource;
  status: GuestLeadStatus;
  fullName: string;
  phone: string;
  email: string;
  regionNameEn: string;
  regionNameUr: string;
  cityName: string;
  vehicleInfo: string;
  licenseInfo: string;
  message: string;
  adminNotes: string;
  locale: "en" | "ur";
};

type SupportRequestEditorFormProps = {
  mode: "create" | "edit";
  leadId?: string;
  initialValues: SupportRequestEditorValues;
  services: ServiceOption[];
  labels: {
    sectionCustomer: string;
    sectionService: string;
    sectionDetails: string;
    sectionNotes: string;
    service: string;
    customService: string;
    source: string;
    status: string;
    fullName: string;
    phone: string;
    email: string;
    regionEn: string;
    regionUr: string;
    city: string;
    vehicleInfo: string;
    licenseInfo: string;
    message: string;
    adminNotes: string;
    locale: string;
    save: string;
    saving: string;
    saveFailed: string;
    sourceGuestForm: string;
    sourceWhatsapp: string;
    statusNew: string;
    statusContacted: string;
    statusInProgress: string;
    statusConverted: string;
    statusClosed: string;
    statusSpam: string;
  };
};

const statusOptions: GuestLeadStatus[] = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
  "SPAM",
];

export function SupportRequestEditorForm({
  mode,
  leadId,
  initialValues,
  services,
  labels,
}: SupportRequestEditorFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedService = useMemo(
    () => services.find((service) => service.id === values.serviceId),
    [services, values.serviceId],
  );

  function updateField<K extends keyof SupportRequestEditorValues>(
    key: K,
    value: SupportRequestEditorValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleServiceChange(serviceId: string) {
    setValues((current) => ({
      ...current,
      serviceId,
    }));
  }

  function statusLabel(status: GuestLeadStatus): string {
    switch (status) {
      case "NEW":
        return labels.statusNew;
      case "CONTACTED":
        return labels.statusContacted;
      case "IN_PROGRESS":
        return labels.statusInProgress;
      case "CONVERTED":
        return labels.statusConverted;
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

    const serviceNameEn = selectedService?.nameEn ?? "";
    const serviceNameUr = selectedService?.nameUr ?? "";

    if (!serviceNameEn || !serviceNameUr) {
      setError(labels.saveFailed);
      return;
    }

    startTransition(async () => {
      const payload = {
        ...(mode === "edit" ? { id: leadId! } : {}),
        serviceId: values.serviceId || null,
        serviceNameEn,
        serviceNameUr,
        source: values.source,
        status: values.status,
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || null,
        regionNameEn: values.regionNameEn || null,
        regionNameUr: values.regionNameUr || null,
        cityName: values.cityName || null,
        vehicleInfo: values.vehicleInfo || null,
        licenseInfo: values.licenseInfo || null,
        message: values.message || null,
        adminNotes: values.adminNotes || null,
        locale: values.locale,
      };

      const result =
        mode === "create"
          ? await createGuestLeadAdminAction(payload)
          : await updateGuestLeadAdminAction(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/admin/guest-leads/${result.data.id}`);
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
            <Label htmlFor="sr-full-name">{labels.fullName}</Label>
            <Input
              id="sr-full-name"
              value={values.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sr-phone">{labels.phone}</Label>
            <Input
              id="sr-phone"
              value={values.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sr-email">{labels.email}</Label>
            <Input
              id="sr-email"
              type="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sr-locale">{labels.locale}</Label>
            <select
              id="sr-locale"
              value={values.locale}
              onChange={(event) =>
                updateField("locale", event.target.value as "en" | "ur")
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-base font-semibold">{labels.sectionService}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="sr-service">{labels.service}</Label>
            <select
              id="sr-service"
              value={values.serviceId}
              onChange={(event) => handleServiceChange(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{labels.customService}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sr-source">{labels.source}</Label>
            <select
              id="sr-source"
              value={values.source}
              onChange={(event) =>
                updateField("source", event.target.value as GuestLeadSource)
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="GUEST_FORM">{labels.sourceGuestForm}</option>
              <option value="WHATSAPP">{labels.sourceWhatsapp}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sr-status">{labels.status}</Label>
            <select
              id="sr-status"
              value={values.status}
              onChange={(event) =>
                updateField("status", event.target.value as GuestLeadStatus)
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
            <Label htmlFor="sr-region-en">{labels.regionEn}</Label>
            <Input
              id="sr-region-en"
              value={values.regionNameEn}
              onChange={(event) =>
                updateField("regionNameEn", event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sr-region-ur">{labels.regionUr}</Label>
            <Input
              id="sr-region-ur"
              value={values.regionNameUr}
              onChange={(event) =>
                updateField("regionNameUr", event.target.value)
              }
              dir="rtl"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="sr-city">{labels.city}</Label>
            <Input
              id="sr-city"
              value={values.cityName}
              onChange={(event) => updateField("cityName", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-base font-semibold">{labels.sectionDetails}</h2>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="sr-vehicle">{labels.vehicleInfo}</Label>
            <Textarea
              id="sr-vehicle"
              value={values.vehicleInfo}
              onChange={(event) =>
                updateField("vehicleInfo", event.target.value)
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sr-license">{labels.licenseInfo}</Label>
            <Textarea
              id="sr-license"
              value={values.licenseInfo}
              onChange={(event) =>
                updateField("licenseInfo", event.target.value)
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sr-message">{labels.message}</Label>
            <Textarea
              id="sr-message"
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
