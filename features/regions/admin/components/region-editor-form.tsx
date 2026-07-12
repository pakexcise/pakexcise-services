"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createRegionAction,
  updateRegionAction} from "@/features/regions/admin/actions/region-actions";
import { useRouter } from "next/navigation";
import {
  editorValuesToPayload,
  type RegionEditorValues
} from "@/features/regions/admin/lib/form-defaults";

type RegionEditorLabels = {
  tabGeneral: string;
  tabSeo: string;
  slug: string;
  nameEn: string;
  descriptionEn: string;
  isActive: string;
  showInFooter: string;
  displayOrder: string;
  footerDisplayOrder: string;
  metaTitleEn: string;
  metaDescriptionEn: string;
  h1En: string;
  save: string;
  saving: string;
  saveFailed: string;
};

type RegionEditorFormProps = {
  mode: "create" | "edit";
  regionId?: string;
  initialValues: RegionEditorValues;
  labels: RegionEditorLabels;
};

type TabKey = "general" | "seo";

export function RegionEditorForm({
  mode,
  regionId,
  initialValues,
  labels}: RegionEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof RegionEditorValues>(
    key: K,
    value: RegionEditorValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateSeoField<K extends keyof RegionEditorValues["seo"]>(
    key: K,
    value: RegionEditorValues["seo"][K],
  ) {
    setValues((current) => ({
      ...current,
      seo: { ...current.seo, [key]: value }}));
  }

  function handleSubmit() {
    setError(null);

    startTransition(async () => {
      try {
        const payload = editorValuesToPayload(values);
        const result =
          mode === "create"
            ? await createRegionAction(payload)
            : await updateRegionAction({ id: regionId!, ...payload });

        if (!result.success) {
          setError(result.error);
          return;
        }

        router.push(`/admin/regions/${result.data.id}/edit`);
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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <Button
          type="button"
          size="sm"
          variant={activeTab === "general" ? "default" : "outline"}
          onClick={() => setActiveTab("general")}
        >
          {labels.tabGeneral}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={activeTab === "seo" ? "default" : "outline"}
          onClick={() => setActiveTab("seo")}
        >
          {labels.tabSeo}
        </Button>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {activeTab === "general" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>{labels.slug}</Label>
            <Input
              value={values.slug}
              onChange={(event) => updateField("slug", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.displayOrder}</Label>
            <Input
              type="number"
              value={values.displayOrder}
              onChange={(event) =>
                updateField("displayOrder", Number(event.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.footerDisplayOrder}</Label>
            <Input
              type="number"
              min={0}
              value={values.footerDisplayOrder}
              onChange={(event) =>
                updateField("footerDisplayOrder", Number(event.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.nameEn}</Label>
            <Input
              value={values.nameEn}
              onChange={(event) => updateField("nameEn", event.target.value)}
            />
          </div>
          
          <div className="space-y-2 lg:col-span-2">
            <Label>{labels.descriptionEn}</Label>
            <Textarea
              className="min-h-28"
              value={values.descriptionEn}
              onChange={(event) =>
                updateField("descriptionEn", event.target.value)
              }
            />
          </div>
          
          <label className="flex items-center gap-2 text-sm lg:col-span-2">
            <input
              type="checkbox"
              checked={values.showInFooter}
              onChange={(event) =>
                updateField("showInFooter", event.target.checked)
              }
            />
            {labels.showInFooter}
          </label>
          <label className="flex items-center gap-2 text-sm lg:col-span-2">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
            />
            {labels.isActive}
          </label>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>{labels.metaTitleEn}</Label>
            <Input
              value={values.seo.metaTitleEn}
              onChange={(event) =>
                updateSeoField("metaTitleEn", event.target.value)
              }
            />
          </div>
          
          <div className="space-y-2 lg:col-span-2">
            <Label>{labels.metaDescriptionEn}</Label>
            <Textarea
              value={values.seo.metaDescriptionEn}
              onChange={(event) =>
                updateSeoField("metaDescriptionEn", event.target.value)
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label>{labels.h1En}</Label>
            <Input
              value={values.seo.h1En}
              onChange={(event) => updateSeoField("h1En", event.target.value)}
            />
          </div>
          
        </div>
      )}

      <Button type="button" disabled={isPending} onClick={handleSubmit}>
        {isPending ? labels.saving : labels.save}
      </Button>
    </div>
  );
}
