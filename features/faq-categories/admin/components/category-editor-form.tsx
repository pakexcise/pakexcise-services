"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createFaqCategoryAction,
  updateFaqCategoryAction,
} from "@/features/faq-categories/admin/actions/category-actions";
import {
  editorValuesToPayload,
  type FaqCategoryEditorValues,
} from "@/features/faq-categories/admin/lib/form-defaults";

type FaqCategoryEditorLabels = {
  slug: string;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  isActive: string;
  displayOrder: string;
  save: string;
  saving: string;
  saveFailed: string;
  cancel: string;
};

type FaqCategoryEditorFormProps = {
  mode: "create" | "edit";
  categoryId?: string;
  initialValues: FaqCategoryEditorValues;
  labels: FaqCategoryEditorLabels;
};

export function FaqCategoryEditorForm({
  mode,
  categoryId,
  initialValues,
  labels,
}: FaqCategoryEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function updateField<K extends keyof FaqCategoryEditorValues>(
    key: K,
    value: FaqCategoryEditorValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const payload = editorValuesToPayload(values);
        const result =
          mode === "create"
            ? await createFaqCategoryAction(payload)
            : await updateFaqCategoryAction({ id: categoryId!, ...payload });

        if (!result.success) {
          setError(result.error);
          setFieldErrors(result.fieldErrors ?? {});
          return;
        }

        router.push(`/admin/faq-categories/${result.data.id}/edit`);
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

  return (
    <div className="space-y-6 rounded-xl border p-4 md:p-6">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label={labels.slug} error={fieldErrors.slug?.[0]}>
          <Input
            value={values.slug}
            onChange={(event) => updateField("slug", event.target.value)}
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
        <Field label={labels.descriptionEn} className="lg:col-span-2">
          <Textarea
            className="min-h-28"
            value={values.descriptionEn}
            onChange={(event) =>
              updateField("descriptionEn", event.target.value)
            }
          />
        </Field>
        <Field label={labels.descriptionUr} className="lg:col-span-2">
          <Textarea
            className="min-h-28"
            value={values.descriptionUr}
            onChange={(event) =>
              updateField("descriptionUr", event.target.value)
            }
            dir="rtl"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(event) => updateField("isActive", event.target.checked)}
          />
          {labels.isActive}
        </label>
      </div>

      <div className="flex flex-wrap gap-3 border-t pt-4">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? labels.saving : labels.save}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/faq-categories")}
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
