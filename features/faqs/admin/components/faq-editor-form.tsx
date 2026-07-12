"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createFaqAction,
  updateFaqAction} from "@/features/faqs/admin/actions/faq-actions";
import type { FaqEditorValues } from "@/features/faqs/admin/lib/form-defaults";
import type { FaqEditorLabels } from "@/features/faqs/admin/lib/labels";

import { useRouter } from "next/navigation";
type ServiceOption = {
  id: string;
  nameEn: string;
};

type CategoryOption = {
  id: string;
  slug: string;
  nameEn: string;
  isActive: boolean;
};

type RegionOption = {
  id: string;
  nameEn: string;
};

type FaqEditorFormProps = {
  mode: "create" | "edit";
  faqId?: string;
  initialValues: FaqEditorValues;
  services: ServiceOption[];
  categories: CategoryOption[];
  regions: RegionOption[];
  locale: string;
  labels: FaqEditorLabels;
};

export function FaqEditorForm({
  mode,
  faqId,
  initialValues,
  services,
  categories,
  regions,
  locale,
  labels}: FaqEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function updateField<K extends keyof FaqEditorValues>(
    key: K,
    value: FaqEditorValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    setError(null);
    setFieldErrors({});

    const payload = {
      ...values,
      serviceId: values.serviceId || null,
      regionId: values.regionId || null,
      seoKeywordsEn: values.seoKeywordsEn.trim() || null};

    startTransition(async () => {
      try {
        const result =
          mode === "create"
            ? await createFaqAction(payload)
            : await updateFaqAction({ id: faqId!, ...payload });

        if (!result.success) {
          setError(result.error);
          setFieldErrors(result.fieldErrors ?? {});
          return;
        }

        router.push("/admin/faqs");
        router.refresh();
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : labels.saveFailed,
        );
      }
    });
  }

  const categoryOptions = categories.length
    ? categories
    : initialValues.categoryId
      ? [
          {
            id: initialValues.categoryId,
            slug: "unknown",
            nameEn: labels.unknownCategory,
            isActive: false}]
      : [];

  return (
    <div className="space-y-6 rounded-xl border p-4 md:p-6">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label={labels.questionEn} error={fieldErrors.questionEn?.[0]}>
          <Input
            value={values.questionEn}
            onChange={(event) => updateField("questionEn", event.target.value)}
          />
        </Field>
        
        <Field label={labels.answerEn} error={fieldErrors.answerEn?.[0]} className="lg:col-span-2">
          <Textarea
            className="min-h-32"
            value={values.answerEn}
            onChange={(event) => updateField("answerEn", event.target.value)}
          />
        </Field>
        
        <Field label={labels.category} error={fieldErrors.categoryId?.[0]}>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={values.categoryId}
            onChange={(event) => updateField("categoryId", event.target.value)}
          >
            <option value="">{labels.selectCategory}</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameEn}
                {!category.isActive ? ` (${labels.inactiveCategory})` : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label={labels.service} error={fieldErrors.serviceId?.[0]}>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={values.serviceId}
            onChange={(event) => {
              const serviceId = event.target.value;
              updateField("serviceId", serviceId);
              if (serviceId) {
                updateField("isFeatured", false);
                updateField("featuredDisplayOrder", 0);
              }
            }}
          >
            <option value="">{labels.noService}</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.nameEn}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{labels.serviceHint}</p>
        </Field>
        <Field label={labels.region} error={fieldErrors.regionId?.[0]}>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={values.regionId}
            onChange={(event) => updateField("regionId", event.target.value)}
          >
            <option value="">{labels.noRegion}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nameEn}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{labels.regionHint}</p>
        </Field>
        <Field label={labels.seoKeywordsEn} error={fieldErrors.seoKeywordsEn?.[0]}>
          <Input
            value={values.seoKeywordsEn}
            onChange={(event) => updateField("seoKeywordsEn", event.target.value)}
            placeholder={labels.seoKeywordsPlaceholder}
          />
        </Field>
        
        <Field label={labels.displayOrder}>
          <Input
            type="number"
            min={0}
            value={values.displayOrder}
            onChange={(event) =>
              updateField("displayOrder", Number(event.target.value))
            }
          />
        </Field>
        <Field label={labels.featuredDisplayOrder}>
          <Input
            type="number"
            min={0}
            value={values.featuredDisplayOrder}
            onChange={(event) =>
              updateField("featuredDisplayOrder", Number(event.target.value))
            }
            disabled={!values.isFeatured}
          />
        </Field>
        <label className="flex items-center gap-2 self-end text-sm">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(event) => updateField("isActive", event.target.checked)}
          />
          {labels.isActive}
        </label>
        <label className="flex items-center gap-2 self-end text-sm">
          <input
            type="checkbox"
            checked={values.isFeatured}
            disabled={Boolean(values.serviceId)}
            onChange={(event) =>
              updateField("isFeatured", event.target.checked)
            }
          />
          {labels.isFeatured}
        </label>
        {!values.serviceId ? (
          <p className="text-xs text-muted-foreground lg:col-span-2">
            {labels.featuredHint}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3 border-t pt-4">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? labels.saving : labels.save}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/faqs")}
        >
          {labels.cancel}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
