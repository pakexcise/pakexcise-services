"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateHomePageSettingsAction } from "@/features/home-page/admin/actions/update-home-page-settings";
import { HOME_SECTION_KEYS, defaultVehicleVisualSettings } from "@/features/home-page/lib/defaults";
import type { HomePageSettings, HomeSectionKey } from "@/features/home-page/types";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
type SettingsTab = "hero" | "sections" | "content" | "limits" | "seo";

type HomePageSettingsPanelProps = {
  initialValues: HomePageSettings;
  labels: {
    save: string;
    saving: string;
    saved: string;
    error: string;
    tabs: Record<SettingsTab, string>;
    fields: {
      pageActive: string;
      sectionActive: string;
      displayOrder: string;
      titleEn: string;
      descriptionEn: string;
      badgeEn: string;
      browseCtaEn: string;
      whatsappCtaEn: string;
      requestCtaEn: string;
      metaTitleEn: string;
      metaDescriptionEn: string;
      h1En: string;
      footerDescriptionEn: string;
      faqCount: string;
      documentCount: string;
      blogCount: string;
      guideCount: string;
      popularCount: string;
    };
    sectionLabels: Record<HomeSectionKey, string>;
  };
};

function BilingualField({
  labelEn,
  valueEn,
  onChangeEn,
  multiline = false}: {
  labelEn: string;
  valueEn: string;
  onChangeEn: (value: string) => void;
  multiline?: boolean;
}) {
  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>{labelEn}</Label>
        <InputComponent
          value={valueEn}
          onChange={(event) => onChangeEn(event.target.value)}
          rows={multiline ? 4 : undefined}
        />
      </div>
    </div>
  );
}

export function HomePageSettingsPanel({
  initialValues,
  labels}: HomePageSettingsPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("hero");
  const [values, setValues] = useState(() => ({
    ...initialValues,
    vehicleVisual: initialValues.vehicleVisual ?? defaultVehicleVisualSettings()}));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateHomePageSettingsAction(values);

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      setMessage(labels.saved);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(labels.tabs) as SettingsTab[]).map((tab) => (
          <Button
            key={tab}
            type="button"
            size="sm"
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {labels.tabs[tab]}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5 sm:p-6">
        {activeTab === "hero" ? (
          <div className="space-y-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.isPageActive}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    isPageActive: event.target.checked}))
                }
              />
              {labels.fields.pageActive}
            </label>
            <BilingualField
              labelEn={labels.fields.badgeEn}
              valueEn={values.hero.badgeEn}
              onChangeEn={(badgeEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, badgeEn }}))
              }
            />
            <BilingualField
              labelEn={labels.fields.titleEn}
              valueEn={values.hero.titleEn}
              onChangeEn={(titleEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, titleEn }}))
              }
            />
            <BilingualField
              labelEn={labels.fields.descriptionEn}
              valueEn={values.hero.descriptionEn}
              multiline
              onChangeEn={(descriptionEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, descriptionEn }}))
              }
            />
            <BilingualField
              labelEn={labels.fields.browseCtaEn}
              valueEn={values.hero.browseCtaEn}
              onChangeEn={(browseCtaEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, browseCtaEn }}))
              }
            />
            <BilingualField
              labelEn={labels.fields.whatsappCtaEn}
              valueEn={values.hero.whatsappCtaEn}
              onChangeEn={(whatsappCtaEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, whatsappCtaEn }}))
              }
            />
            <BilingualField
              labelEn={labels.fields.requestCtaEn}
              valueEn={values.hero.requestCtaEn}
              onChangeEn={(requestCtaEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, requestCtaEn }}))
              }
            />
          </div>
        ) : null}

        {activeTab === "sections" ? (
          <div className="space-y-8">
            {HOME_SECTION_KEYS.map((sectionKey) => (
              <div
                key={sectionKey}
                className={cn("space-y-4 rounded-lg border p-4")}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <h3 className="font-semibold">{labels.sectionLabels[sectionKey]}</h3>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={values.sections[sectionKey].isActive}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          sections: {
                            ...current.sections,
                            [sectionKey]: {
                              ...current.sections[sectionKey],
                              isActive: event.target.checked}}}))
                      }
                    />
                    {labels.fields.sectionActive}
                  </label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`order-${sectionKey}`}>
                      {labels.fields.displayOrder}
                    </Label>
                    <Input
                      id={`order-${sectionKey}`}
                      type="number"
                      className="w-24"
                      value={values.sections[sectionKey].displayOrder}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          sections: {
                            ...current.sections,
                            [sectionKey]: {
                              ...current.sections[sectionKey],
                              displayOrder: Number(event.target.value)}}}))
                      }
                    />
                  </div>
                </div>
                <BilingualField
                  labelEn={labels.fields.titleEn}
                  valueEn={values.sections[sectionKey].titleEn}
                  onChangeEn={(titleEn) =>
                    setValues((current) => ({
                      ...current,
                      sections: {
                        ...current.sections,
                        [sectionKey]: {
                          ...current.sections[sectionKey],
                          titleEn}}}))
                  }
                />
                <BilingualField
                  labelEn={labels.fields.descriptionEn}
                  valueEn={values.sections[sectionKey].descriptionEn}
                  multiline
                  onChangeEn={(descriptionEn) =>
                    setValues((current) => ({
                      ...current,
                      sections: {
                        ...current.sections,
                        [sectionKey]: {
                          ...current.sections[sectionKey],
                          descriptionEn}}}))
                  }
                />
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "content" ? (
          <div className="space-y-8">
            <div className="space-y-4 rounded-xl border p-4">
              <h3 className="font-semibold">Vehicle visual section</h3>
              <div className="space-y-2">
                <Label htmlFor="vehicleVisualImagePath">Image path</Label>
                <Input
                  id="vehicleVisualImagePath"
                  value={values.vehicleVisual.imagePath}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      vehicleVisual: {
                        ...current.vehicleVisual,
                        imagePath: event.target.value}}))
                  }
                  placeholder="/images/home/vehicle-documents-support.png"
                />
              </div>
              <BilingualField
                labelEn="Image alt (EN)"
                valueEn={values.vehicleVisual.imageAltEn}
                onChangeEn={(imageAltEn) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, imageAltEn }}))
                }
              />
              <BilingualField
                labelEn={labels.fields.browseCtaEn}
                valueEn={values.vehicleVisual.browseCtaEn}
                onChangeEn={(browseCtaEn) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, browseCtaEn }}))
                }
              />
              <BilingualField
                labelEn={labels.fields.whatsappCtaEn}
                valueEn={values.vehicleVisual.whatsappCtaEn}
                onChangeEn={(whatsappCtaEn) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, whatsappCtaEn }}))
                }
              />
              <BilingualField
                labelEn={labels.fields.requestCtaEn}
                valueEn={values.vehicleVisual.requestCtaEn}
                onChangeEn={(requestCtaEn) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, requestCtaEn }}))
                }
              />
              <div className="space-y-4">
                {values.vehicleVisual.featurePoints.map((point, index) => (
                  <div key={index} className="space-y-3 rounded-lg border p-3">
                    <p className="text-sm font-medium">Feature {index + 1}</p>
                    <BilingualField
                      labelEn="Title (EN)"
                      valueEn={point.titleEn}
                      onChangeEn={(titleEn) =>
                        setValues((current) => ({
                          ...current,
                          vehicleVisual: {
                            ...current.vehicleVisual,
                            featurePoints: current.vehicleVisual.featurePoints.map(
                              (item, itemIndex) =>
                                itemIndex === index ? { ...item, titleEn } : item)}}))
                      }
                    />
                    <BilingualField
                      labelEn="Description (EN)"
                      valueEn={point.descriptionEn}
                      multiline
                      onChangeEn={(descriptionEn) =>
                        setValues((current) => ({
                          ...current,
                          vehicleVisual: {
                            ...current.vehicleVisual,
                            featurePoints: current.vehicleVisual.featurePoints.map(
                              (item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, descriptionEn }
                                  : item)}}))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <BilingualField
              labelEn="Options note (EN)"
              valueEn={values.optionsNoteEn}
              multiline
              onChangeEn={(optionsNoteEn) =>
                setValues((current) => ({ ...current, optionsNoteEn }))
              }
            />
            <BilingualField
              labelEn={labels.fields.footerDescriptionEn}
              valueEn={values.footerDescriptionEn}
              multiline
              onChangeEn={(footerDescriptionEn) =>
                setValues((current) => ({ ...current, footerDescriptionEn }))
              }
            />
          </div>
        ) : null}

        {activeTab === "limits" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["faqCount", labels.fields.faqCount],
                ["documentCount", labels.fields.documentCount],
                ["blogCount", labels.fields.blogCount],
                ["guideCount", labels.fields.guideCount],
                ["popularCount", labels.fields.popularCount]] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type="number"
                  min={1}
                  max={20}
                  value={values.limits[key]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      limits: {
                        ...current.limits,
                        [key]: Number(event.target.value)}}))
                  }
                />
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "seo" ? (
          <div className="space-y-6">
            <BilingualField
              labelEn={labels.fields.metaTitleEn}
              valueEn={values.seo.metaTitleEn}
              onChangeEn={(metaTitleEn) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, metaTitleEn }}))
              }
            />
            <BilingualField
              labelEn={labels.fields.metaDescriptionEn}
              valueEn={values.seo.metaDescriptionEn}
              multiline
              onChangeEn={(metaDescriptionEn) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, metaDescriptionEn }}))
              }
            />
            <BilingualField
              labelEn={labels.fields.h1En}
              valueEn={values.seo.h1En}
              onChangeEn={(h1En) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, h1En }}))
              }
            />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? labels.saving : labels.save}
        </Button>
        {message ? <p className="text-sm text-green-600">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
