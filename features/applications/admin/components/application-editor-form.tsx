"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applicationStatuses } from "@/config/app";
import {
  createApplicationAdminAction,
  updateApplicationAdminAction,
} from "@/features/applications/admin/actions/application-admin-actions";
import { formatFirstFieldError } from "@/lib/validations/format-field-errors";

type CustomerOption = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
};

type ServiceOption = {
  id: string;
  nameEn: string;
  nameUr: string;
};

type AgentOption = {
  id: string;
  name: string | null;
  email: string;
};

export type ApplicationEditorValues = {
  userId: string;
  serviceId: string;
  agentId: string;
  status: ApplicationStatus;
  locale: "en" | "ur";
  adminNotes: string;
  statusChangeNote: string;
};

type ApplicationEditorFormProps = {
  mode: "create" | "edit";
  applicationId?: string;
  trackingId?: string;
  initialValues: ApplicationEditorValues;
  initialStatus?: ApplicationStatus;
  customers: CustomerOption[];
  services: ServiceOption[];
  agents: AgentOption[];
  locale: "en" | "ur";
  labels: {
    sectionAssignment: string;
    sectionStatus: string;
    sectionNotes: string;
    customer: string;
    selectCustomer: string;
    service: string;
    selectService: string;
    agent: string;
    noAgent: string;
    status: string;
    preferredLocale: string;
    adminNotes: string;
    statusChangeNote: string;
    statusChangeNoteHelp: string;
    statusChangeNoteRequired: string;
    trackingId: string;
    save: string;
    saving: string;
    saveFailed: string;
    statusLabels: Record<ApplicationStatus, string>;
  };
};

function formatCustomerLabel(customer: CustomerOption): string {
  const name = customer.name?.trim() || customer.email;
  const phone = customer.phone?.trim();

  return phone ? `${name} (${phone})` : name;
}

function formatAgentLabel(agent: AgentOption): string {
  return agent.name?.trim() || agent.email;
}

export function ApplicationEditorForm({
  mode,
  applicationId,
  trackingId,
  initialValues,
  initialStatus,
  customers,
  services,
  agents,
  locale,
  labels,
}: ApplicationEditorFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const statusChanged =
    mode === "edit" &&
    initialStatus !== undefined &&
    values.status !== initialStatus;

  function updateField<K extends keyof ApplicationEditorValues>(
    key: K,
    value: ApplicationEditorValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    setError(null);
    setFieldErrors({});

    if (mode === "create" && (!values.userId.trim() || !values.serviceId.trim())) {
      setError(labels.saveFailed);
      setFieldErrors({
        ...(!values.userId.trim() ? { userId: [labels.saveFailed] } : {}),
        ...(!values.serviceId.trim() ? { serviceId: [labels.saveFailed] } : {}),
      });
      return;
    }

    if (statusChanged && !values.statusChangeNote.trim()) {
      setError(labels.statusChangeNoteRequired);
      setFieldErrors({
        statusChangeNote: [labels.statusChangeNoteRequired],
      });
      return;
    }

    if (statusChanged && values.statusChangeNote.trim().length < 3) {
      setError(labels.statusChangeNoteRequired);
      setFieldErrors({
        statusChangeNote: [labels.statusChangeNoteRequired],
      });
      return;
    }

    startTransition(async () => {
      const payload =
        mode === "edit"
          ? {
              id: applicationId!,
              status: values.status,
              adminNotes: values.adminNotes.trim() || null,
              statusChangeNote: values.statusChangeNote.trim(),
            }
          : {
              userId: values.userId.trim(),
              serviceId: values.serviceId.trim(),
              agentId: values.agentId.trim() || null,
              locale: values.locale,
              status: values.status,
              adminNotes: values.adminNotes.trim() || null,
              statusChangeNote: values.statusChangeNote.trim(),
            };

      const result =
        mode === "create"
          ? await createApplicationAdminAction(payload)
          : await updateApplicationAdminAction(payload);

      if (!result.success) {
        setError(
          result.fieldErrors
            ? formatFirstFieldError(result.fieldErrors, result.error)
            : result.error,
        );
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      router.push(`/admin/applications/${result.data.id}`);
      router.refresh();
    });
  }

  const selectedCustomer = customers.find(
    (customer) => customer.id === initialValues.userId,
  );
  const selectedService = services.find(
    (service) => service.id === initialValues.serviceId,
  );
  const selectedAgent = agents.find((agent) => agent.id === initialValues.agentId);

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {mode === "edit" && trackingId ? (
        <section className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">{labels.trackingId}</p>
          <p className="mt-1 font-mono text-sm font-medium">{trackingId}</p>
        </section>
      ) : null}

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-base font-semibold">{labels.sectionAssignment}</h2>
        {mode === "edit" ? (
          <dl className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <dt className="text-sm text-muted-foreground">{labels.customer}</dt>
              <dd className="text-sm font-medium">
                {selectedCustomer
                  ? formatCustomerLabel(selectedCustomer)
                  : initialValues.userId}
              </dd>
            </div>
            <div className="space-y-1 md:col-span-2">
              <dt className="text-sm text-muted-foreground">{labels.service}</dt>
              <dd className="text-sm font-medium">
                {selectedService
                  ? locale === "ur"
                    ? selectedService.nameUr
                    : selectedService.nameEn
                  : initialValues.serviceId}
              </dd>
            </div>
            <div className="space-y-1 md:col-span-2">
              <dt className="text-sm text-muted-foreground">{labels.agent}</dt>
              <dd className="text-sm font-medium">
                {selectedAgent
                  ? formatAgentLabel(selectedAgent)
                  : labels.noAgent}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">
                {labels.preferredLocale}
              </dt>
              <dd className="text-sm font-medium">
                {initialValues.locale === "ur" ? "Urdu" : "English"}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="app-customer">{labels.customer}</Label>
              <select
                id="app-customer"
                value={values.userId}
                onChange={(event) => updateField("userId", event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                <option value="">{labels.selectCustomer}</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {formatCustomerLabel(customer)}
                  </option>
                ))}
              </select>
              {fieldErrors.userId?.[0] ? (
                <p className="text-xs text-destructive" role="alert">
                  {fieldErrors.userId[0]}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="app-service">{labels.service}</Label>
              <select
                id="app-service"
                value={values.serviceId}
                onChange={(event) => updateField("serviceId", event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                <option value="">{labels.selectService}</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {locale === "ur" ? service.nameUr : service.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="app-agent">{labels.agent}</Label>
              <select
                id="app-agent"
                value={values.agentId}
                onChange={(event) => updateField("agentId", event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{labels.noAgent}</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {formatAgentLabel(agent)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-locale">{labels.preferredLocale}</Label>
              <select
                id="app-locale"
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
        )}
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-base font-semibold">{labels.sectionStatus}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="app-status">{labels.status}</Label>
            <select
              id="app-status"
              value={values.status}
              onChange={(event) =>
                updateField("status", event.target.value as ApplicationStatus)
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {applicationStatuses.map((status) => (
                <option key={status} value={status}>
                  {labels.statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="app-status-note">{labels.statusChangeNote}</Label>
            <Textarea
              id="app-status-note"
              value={values.statusChangeNote}
              onChange={(event) =>
                updateField("statusChangeNote", event.target.value)
              }
              placeholder={labels.statusChangeNoteHelp}
              rows={3}
              required={statusChanged}
            />
            {fieldErrors.statusChangeNote?.[0] ? (
              <p className="text-xs text-destructive" role="alert">
                {fieldErrors.statusChangeNote[0]}
              </p>
            ) : statusChanged ? (
              <p className="text-xs text-muted-foreground">
                {labels.statusChangeNoteRequired}
              </p>
            ) : null}
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
