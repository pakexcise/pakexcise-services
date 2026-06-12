"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createServiceAction,
  updateServiceAction,
} from "@/features/services/admin/actions/service-actions";
import {
  editorValuesToPayload,
  type ServiceEditorValues,
} from "@/features/services/admin/lib/form-defaults";
import type { ServiceEditorLabels } from "@/features/services/admin/lib/labels";

type RegionOption = {
  id: string;
  nameEn: string;
  nameUr: string;
};

type ServiceEditorFormProps = {
  mode: "create" | "edit";
  serviceId?: string;
  initialValues: ServiceEditorValues;
  regions: RegionOption[];
  labels: ServiceEditorLabels;
};

type TabKey = "general" | "seo";

export function ServiceEditorForm({
  mode,
  serviceId,
  initialValues,
  regions,
  labels,
}: ServiceEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function updateField<K extends keyof ServiceEditorValues>(
    key: K,
    value: ServiceEditorValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateSeoField<K extends keyof ServiceEditorValues["seo"]>(
    key: K,
    value: ServiceEditorValues["seo"][K],
  ) {
    setValues((current) => ({
      ...current,
      seo: { ...current.seo, [key]: value },
    }));
  }

  function handleSubmit() {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const payload = editorValuesToPayload(values);

        const result =
          mode === "create"
            ? await createServiceAction(payload)
            : await updateServiceAction({ id: serviceId!, ...payload });

        if (!result.success) {
          setError(result.error);
          setFieldErrors(result.fieldErrors ?? {});
          return;
        }

        router.push(`/admin/services/${result.data.id}/edit`);
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

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "general", label: labels.tabGeneral },
    { key: "seo", label: labels.tabSeo },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            type="button"
            size="sm"
            variant={activeTab === tab.key ? "default" : "outline"}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {activeTab === "general" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field
            label={labels.slug}
            error={fieldErrors.slug?.[0]}
          >
            <Input
              value={values.slug}
              onChange={(event) => updateField("slug", event.target.value)}
            />
          </Field>
          <Field
            label={labels.regions}
            error={fieldErrors.regionIds?.[0]}
            className="lg:col-span-2"
          >
            <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
              {regions.map((region) => {
                const checked = values.regionIds.includes(region.id);

                return (
                  <label
                    key={region.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...values.regionIds, region.id]
                          : values.regionIds.filter((id) => id !== region.id);
                        updateField("regionIds", next);
                      }}
                    />
                    <span>{region.nameEn}</span>
                  </label>
                );
              })}
            </div>
          </Field>
          <Field label={labels.nameEn} error={fieldErrors.nameEn?.[0]}>
            <Input
              value={values.nameEn}
              onChange={(event) => updateField("nameEn", event.target.value)}
            />
          </Field>
          <Field label={labels.nameUr} error={fieldErrors.nameUr?.[0]}>
            <Input
              value={values.nameUr}
              onChange={(event) => updateField("nameUr", event.target.value)}
              dir="rtl"
            />
          </Field>
          <Field label={labels.shortDescriptionEn}>
            <Textarea
              value={values.shortDescriptionEn}
              onChange={(event) =>
                updateField("shortDescriptionEn", event.target.value)
              }
            />
          </Field>
          <Field label={labels.shortDescriptionUr}>
            <Textarea
              value={values.shortDescriptionUr}
              onChange={(event) =>
                updateField("shortDescriptionUr", event.target.value)
              }
              dir="rtl"
            />
          </Field>
          <Field label={labels.contentEn} className="lg:col-span-2">
            <Textarea
              className="min-h-32"
              value={values.contentEn}
              onChange={(event) => updateField("contentEn", event.target.value)}
            />
          </Field>
          <Field label={labels.contentUr} className="lg:col-span-2">
            <Textarea
              className="min-h-32"
              value={values.contentUr}
              onChange={(event) => updateField("contentUr", event.target.value)}
              dir="rtl"
            />
          </Field>
          <Field label={labels.ctaTextEn}>
            <Input
              value={values.ctaTextEn}
              onChange={(event) => updateField("ctaTextEn", event.target.value)}
            />
          </Field>
          <Field label={labels.ctaTextUr}>
            <Input
              value={values.ctaTextUr}
              onChange={(event) => updateField("ctaTextUr", event.target.value)}
              dir="rtl"
            />
          </Field>
          <Field label={labels.processingNotesEn} className="lg:col-span-2">
            <Textarea
              value={values.processingNotesEn}
              onChange={(event) =>
                updateField("processingNotesEn", event.target.value)
              }
            />
          </Field>
          <Field label={labels.processingNotesUr} className="lg:col-span-2">
            <Textarea
              value={values.processingNotesUr}
              onChange={(event) =>
                updateField("processingNotesUr", event.target.value)
              }
              dir="rtl"
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
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.requiresProof}
                onChange={(event) =>
                  updateField("requiresProof", event.target.checked)
                }
              />
              {labels.requiresProof}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(event) =>
                  updateField("isActive", event.target.checked)
                }
              />
              {labels.isActive}
            </label>
          </div>
        </div>
      ) : null}

      {activeTab === "seo" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label={labels.metaTitleEn}>
            <Input
              value={values.seo.metaTitleEn}
              onChange={(event) =>
                updateSeoField("metaTitleEn", event.target.value)
              }
            />
          </Field>
          <Field label={labels.metaTitleUr}>
            <Input
              value={values.seo.metaTitleUr}
              onChange={(event) =>
                updateSeoField("metaTitleUr", event.target.value)
              }
              dir="rtl"
            />
          </Field>
          <Field label={labels.metaDescriptionEn}>
            <Textarea
              value={values.seo.metaDescriptionEn}
              onChange={(event) =>
                updateSeoField("metaDescriptionEn", event.target.value)
              }
            />
          </Field>
          <Field label={labels.metaDescriptionUr}>
            <Textarea
              value={values.seo.metaDescriptionUr}
              onChange={(event) =>
                updateSeoField("metaDescriptionUr", event.target.value)
              }
              dir="rtl"
            />
          </Field>
          <Field label={labels.h1En}>
            <Input
              value={values.seo.h1En}
              onChange={(event) => updateSeoField("h1En", event.target.value)}
            />
          </Field>
          <Field label={labels.h1Ur}>
            <Input
              value={values.seo.h1Ur}
              onChange={(event) => updateSeoField("h1Ur", event.target.value)}
              dir="rtl"
            />
          </Field>
          <Field label={labels.canonicalUrl} className="lg:col-span-2">
            <Input
              value={values.seo.canonicalUrl}
              onChange={(event) =>
                updateSeoField("canonicalUrl", event.target.value)
              }
            />
          </Field>
          <Field label={labels.ogTitleEn}>
            <Input
              value={values.seo.ogTitleEn}
              onChange={(event) =>
                updateSeoField("ogTitleEn", event.target.value)
              }
            />
          </Field>
          <Field label={labels.ogTitleUr}>
            <Input
              value={values.seo.ogTitleUr}
              onChange={(event) =>
                updateSeoField("ogTitleUr", event.target.value)
              }
              dir="rtl"
            />
          </Field>
          <Field label={labels.ogDescriptionEn}>
            <Textarea
              value={values.seo.ogDescriptionEn}
              onChange={(event) =>
                updateSeoField("ogDescriptionEn", event.target.value)
              }
            />
          </Field>
          <Field label={labels.ogDescriptionUr}>
            <Textarea
              value={values.seo.ogDescriptionUr}
              onChange={(event) =>
                updateSeoField("ogDescriptionUr", event.target.value)
              }
              dir="rtl"
            />
          </Field>
          <Field label={labels.ogImage} className="lg:col-span-2">
            <Input
              value={values.seo.ogImage}
              onChange={(event) =>
                updateSeoField("ogImage", event.target.value)
              }
            />
          </Field>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.seo.robotsIndex}
                onChange={(event) =>
                  updateSeoField("robotsIndex", event.target.checked)
                }
              />
              {labels.robotsIndex}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.seo.robotsFollow}
                onChange={(event) =>
                  updateSeoField("robotsFollow", event.target.checked)
                }
              />
              {labels.robotsFollow}
            </label>
          </div>
          <Field label={labels.faqSchemaJson} className="lg:col-span-2">
            <Textarea
              className="min-h-32 font-mono text-xs"
              value={values.seo.faqSchemaJson}
              onChange={(event) =>
                updateSeoField("faqSchemaJson", event.target.value)
              }
            />
          </Field>
          <Field label={labels.breadcrumbJson} className="lg:col-span-2">
            <Textarea
              className="min-h-32 font-mono text-xs"
              value={values.seo.breadcrumbJson}
              onChange={(event) =>
                updateSeoField("breadcrumbJson", event.target.value)
              }
            />
          </Field>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t pt-4">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? labels.saving : labels.save}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/services")}
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
  children,
}: {
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
