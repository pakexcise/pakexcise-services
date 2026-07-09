"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createBlogCategoryAction,
  updateBlogCategoryAction,
} from "@/features/blog-categories/admin/actions/category-actions";
import {
  editorValuesToPayload,
  type BlogCategoryEditorValues,
} from "@/features/blog-categories/admin/lib/form-defaults";

type ParentOption = {
  id: string;
  label: string;
};

type BlogCategoryEditorLabels = {
  slug: string;
  nameEn: string;
  nameUr: string;
  parent: string;
  noParent: string;
  isActive: string;
  displayOrder: string;
  save: string;
  saving: string;
  saveFailed: string;
  cancel: string;
};

type BlogCategoryEditorFormProps = {
  mode: "create" | "edit";
  categoryId?: string;
  initialValues: BlogCategoryEditorValues;
  parentOptions: ParentOption[];
  labels: BlogCategoryEditorLabels;
};

export function BlogCategoryEditorForm({
  mode,
  categoryId,
  initialValues,
  parentOptions,
  labels,
}: BlogCategoryEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const selectableParents = parentOptions.filter(
    (option) => option.id !== categoryId,
  );

  function updateField<K extends keyof BlogCategoryEditorValues>(
    key: K,
    value: BlogCategoryEditorValues[K],
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
            ? await createBlogCategoryAction(payload)
            : await updateBlogCategoryAction({ id: categoryId!, ...payload });

        if (!result.success) {
          setError(result.error);
          setFieldErrors(result.fieldErrors ?? {});
          return;
        }

        router.push(`/admin/blog-categories/${result.data.id}/edit`);
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
        <Field label={labels.parent} className="lg:col-span-2">
          <select
            value={values.parentId}
            onChange={(event) => updateField("parentId", event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{labels.noParent}</option>
            {selectableParents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.label}
              </option>
            ))}
          </select>
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
          onClick={() => router.push("/admin/blog-categories")}
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
