"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCityAction,
  updateCityAction,
} from "@/features/cities/admin/actions/city-actions";
import {
  editorValuesToCityPayload,
  type CityEditorValues,
} from "@/features/cities/admin/lib/form-defaults";

type RegionOption = {
  id: string;
  nameEn: string;
  nameUr: string;
};

type CityEditorLabels = {
  tabGeneral: string;
  tabSeo: string;
  region: string;
  slug: string;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  isActive: string;
  displayOrder: string;
  metaTitleEn: string;
  metaTitleUr: string;
  metaDescriptionEn: string;
  metaDescriptionUr: string;
  h1En: string;
  h1Ur: string;
  save: string;
  saving: string;
  saveFailed: string;
};

type CityEditorFormProps = {
  mode: "create" | "edit";
  cityId?: string;
  initialValues: CityEditorValues;
  regions: RegionOption[];
  locale: "en" | "ur";
  labels: CityEditorLabels;
};

type TabKey = "general" | "seo";

export function CityEditorForm({
  mode,
  cityId,
  initialValues,
  regions,
  locale,
  labels,
}: CityEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof CityEditorValues>(
    key: K,
    value: CityEditorValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateSeoField<K extends keyof CityEditorValues["seo"]>(
    key: K,
    value: CityEditorValues["seo"][K],
  ) {
    setValues((current) => ({
      ...current,
      seo: { ...current.seo, [key]: value },
    }));
  }

  function handleSubmit() {
    setError(null);

    startTransition(async () => {
      try {
        const payload = editorValuesToCityPayload(values);
        const result =
          mode === "create"
            ? await createCityAction(payload)
            : await updateCityAction({ id: cityId!, ...payload });

        if (!result.success) {
          setError(result.error);
          return;
        }

        router.push(`/admin/cities/${result.data.id}/edit`);
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
    <div className="space-y-6 rounded-xl border bg-card p-5 md:p-6">
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
          <div className="space-y-2 lg:col-span-2">
            <Label>{labels.region}</Label>
            {mode === "create" ? (
              <select
                value={values.regionId}
                onChange={(event) => updateField("regionId", event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                <option value="">{labels.region}</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {locale === "ur" ? region.nameUr : region.nameEn}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {regions.find((region) => region.id === values.regionId)
                  ? locale === "ur"
                    ? regions.find((region) => region.id === values.regionId)!
                        .nameUr
                    : regions.find((region) => region.id === values.regionId)!
                        .nameEn
                  : "—"}
              </p>
            )}
          </div>
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
            <Label>{labels.nameEn}</Label>
            <Input
              value={values.nameEn}
              onChange={(event) => updateField("nameEn", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.nameUr}</Label>
            <Input
              value={values.nameUr}
              onChange={(event) => updateField("nameUr", event.target.value)}
              dir="rtl"
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
          <div className="space-y-2 lg:col-span-2">
            <Label>{labels.descriptionUr}</Label>
            <Textarea
              className="min-h-28"
              value={values.descriptionUr}
              onChange={(event) =>
                updateField("descriptionUr", event.target.value)
              }
              dir="rtl"
            />
          </div>
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
          <div className="space-y-2">
            <Label>{labels.metaTitleUr}</Label>
            <Input
              value={values.seo.metaTitleUr}
              onChange={(event) =>
                updateSeoField("metaTitleUr", event.target.value)
              }
              dir="rtl"
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
          <div className="space-y-2 lg:col-span-2">
            <Label>{labels.metaDescriptionUr}</Label>
            <Textarea
              value={values.seo.metaDescriptionUr}
              onChange={(event) =>
                updateSeoField("metaDescriptionUr", event.target.value)
              }
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.h1En}</Label>
            <Input
              value={values.seo.h1En}
              onChange={(event) => updateSeoField("h1En", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.h1Ur}</Label>
            <Input
              value={values.seo.h1Ur}
              onChange={(event) => updateSeoField("h1Ur", event.target.value)}
              dir="rtl"
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
