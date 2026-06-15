"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateHomePageSettingsAction } from "@/features/home-page/admin/actions/update-home-page-settings";
import { HOME_SECTION_KEYS, defaultVehicleVisualSettings } from "@/features/home-page/lib/defaults";
import type { HomePageSettings, HomeSectionKey } from "@/features/home-page/types";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

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
      titleUr: string;
      descriptionEn: string;
      descriptionUr: string;
      badgeEn: string;
      badgeUr: string;
      browseCtaEn: string;
      browseCtaUr: string;
      whatsappCtaEn: string;
      whatsappCtaUr: string;
      requestCtaEn: string;
      requestCtaUr: string;
      metaTitleEn: string;
      metaTitleUr: string;
      metaDescriptionEn: string;
      metaDescriptionUr: string;
      h1En: string;
      h1Ur: string;
      footerDescriptionEn: string;
      footerDescriptionUr: string;
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
  labelUr,
  valueEn,
  valueUr,
  onChangeEn,
  onChangeUr,
  multiline = false,
}: {
  labelEn: string;
  labelUr: string;
  valueEn: string;
  valueUr: string;
  onChangeEn: (value: string) => void;
  onChangeUr: (value: string) => void;
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
      <div className="space-y-2">
        <Label>{labelUr}</Label>
        <InputComponent
          value={valueUr}
          dir="rtl"
          onChange={(event) => onChangeUr(event.target.value)}
          rows={multiline ? 4 : undefined}
        />
      </div>
    </div>
  );
}

export function HomePageSettingsPanel({
  initialValues,
  labels,
}: HomePageSettingsPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("hero");
  const [values, setValues] = useState(() => ({
    ...initialValues,
    vehicleVisual: initialValues.vehicleVisual ?? defaultVehicleVisualSettings(),
  }));
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
                    isPageActive: event.target.checked,
                  }))
                }
              />
              {labels.fields.pageActive}
            </label>
            <BilingualField
              labelEn={labels.fields.badgeEn}
              labelUr={labels.fields.badgeUr}
              valueEn={values.hero.badgeEn}
              valueUr={values.hero.badgeUr}
              onChangeEn={(badgeEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, badgeEn },
                }))
              }
              onChangeUr={(badgeUr) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, badgeUr },
                }))
              }
            />
            <BilingualField
              labelEn={labels.fields.titleEn}
              labelUr={labels.fields.titleUr}
              valueEn={values.hero.titleEn}
              valueUr={values.hero.titleUr}
              onChangeEn={(titleEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, titleEn },
                }))
              }
              onChangeUr={(titleUr) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, titleUr },
                }))
              }
            />
            <BilingualField
              labelEn={labels.fields.descriptionEn}
              labelUr={labels.fields.descriptionUr}
              valueEn={values.hero.descriptionEn}
              valueUr={values.hero.descriptionUr}
              multiline
              onChangeEn={(descriptionEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, descriptionEn },
                }))
              }
              onChangeUr={(descriptionUr) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, descriptionUr },
                }))
              }
            />
            <BilingualField
              labelEn={labels.fields.browseCtaEn}
              labelUr={labels.fields.browseCtaUr}
              valueEn={values.hero.browseCtaEn}
              valueUr={values.hero.browseCtaUr}
              onChangeEn={(browseCtaEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, browseCtaEn },
                }))
              }
              onChangeUr={(browseCtaUr) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, browseCtaUr },
                }))
              }
            />
            <BilingualField
              labelEn={labels.fields.whatsappCtaEn}
              labelUr={labels.fields.whatsappCtaUr}
              valueEn={values.hero.whatsappCtaEn}
              valueUr={values.hero.whatsappCtaUr}
              onChangeEn={(whatsappCtaEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, whatsappCtaEn },
                }))
              }
              onChangeUr={(whatsappCtaUr) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, whatsappCtaUr },
                }))
              }
            />
            <BilingualField
              labelEn={labels.fields.requestCtaEn}
              labelUr={labels.fields.requestCtaUr}
              valueEn={values.hero.requestCtaEn}
              valueUr={values.hero.requestCtaUr}
              onChangeEn={(requestCtaEn) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, requestCtaEn },
                }))
              }
              onChangeUr={(requestCtaUr) =>
                setValues((current) => ({
                  ...current,
                  hero: { ...current.hero, requestCtaUr },
                }))
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
                              isActive: event.target.checked,
                            },
                          },
                        }))
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
                              displayOrder: Number(event.target.value),
                            },
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                <BilingualField
                  labelEn={labels.fields.titleEn}
                  labelUr={labels.fields.titleUr}
                  valueEn={values.sections[sectionKey].titleEn}
                  valueUr={values.sections[sectionKey].titleUr}
                  onChangeEn={(titleEn) =>
                    setValues((current) => ({
                      ...current,
                      sections: {
                        ...current.sections,
                        [sectionKey]: {
                          ...current.sections[sectionKey],
                          titleEn,
                        },
                      },
                    }))
                  }
                  onChangeUr={(titleUr) =>
                    setValues((current) => ({
                      ...current,
                      sections: {
                        ...current.sections,
                        [sectionKey]: {
                          ...current.sections[sectionKey],
                          titleUr,
                        },
                      },
                    }))
                  }
                />
                <BilingualField
                  labelEn={labels.fields.descriptionEn}
                  labelUr={labels.fields.descriptionUr}
                  valueEn={values.sections[sectionKey].descriptionEn}
                  valueUr={values.sections[sectionKey].descriptionUr}
                  multiline
                  onChangeEn={(descriptionEn) =>
                    setValues((current) => ({
                      ...current,
                      sections: {
                        ...current.sections,
                        [sectionKey]: {
                          ...current.sections[sectionKey],
                          descriptionEn,
                        },
                      },
                    }))
                  }
                  onChangeUr={(descriptionUr) =>
                    setValues((current) => ({
                      ...current,
                      sections: {
                        ...current.sections,
                        [sectionKey]: {
                          ...current.sections[sectionKey],
                          descriptionUr,
                        },
                      },
                    }))
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
                        imagePath: event.target.value,
                      },
                    }))
                  }
                  placeholder="/images/home/vehicle-documents-support.jpg"
                />
              </div>
              <BilingualField
                labelEn="Image alt (EN)"
                labelUr="Image alt (UR)"
                valueEn={values.vehicleVisual.imageAltEn}
                valueUr={values.vehicleVisual.imageAltUr}
                onChangeEn={(imageAltEn) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, imageAltEn },
                  }))
                }
                onChangeUr={(imageAltUr) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, imageAltUr },
                  }))
                }
              />
              <BilingualField
                labelEn={labels.fields.browseCtaEn}
                labelUr={labels.fields.browseCtaUr}
                valueEn={values.vehicleVisual.browseCtaEn}
                valueUr={values.vehicleVisual.browseCtaUr}
                onChangeEn={(browseCtaEn) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, browseCtaEn },
                  }))
                }
                onChangeUr={(browseCtaUr) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, browseCtaUr },
                  }))
                }
              />
              <BilingualField
                labelEn={labels.fields.whatsappCtaEn}
                labelUr={labels.fields.whatsappCtaUr}
                valueEn={values.vehicleVisual.whatsappCtaEn}
                valueUr={values.vehicleVisual.whatsappCtaUr}
                onChangeEn={(whatsappCtaEn) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, whatsappCtaEn },
                  }))
                }
                onChangeUr={(whatsappCtaUr) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, whatsappCtaUr },
                  }))
                }
              />
              <BilingualField
                labelEn={labels.fields.requestCtaEn}
                labelUr={labels.fields.requestCtaUr}
                valueEn={values.vehicleVisual.requestCtaEn}
                valueUr={values.vehicleVisual.requestCtaUr}
                onChangeEn={(requestCtaEn) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, requestCtaEn },
                  }))
                }
                onChangeUr={(requestCtaUr) =>
                  setValues((current) => ({
                    ...current,
                    vehicleVisual: { ...current.vehicleVisual, requestCtaUr },
                  }))
                }
              />
              <div className="space-y-4">
                {values.vehicleVisual.featurePoints.map((point, index) => (
                  <div key={index} className="space-y-3 rounded-lg border p-3">
                    <p className="text-sm font-medium">Feature {index + 1}</p>
                    <BilingualField
                      labelEn="Title (EN)"
                      labelUr="Title (UR)"
                      valueEn={point.titleEn}
                      valueUr={point.titleUr}
                      onChangeEn={(titleEn) =>
                        setValues((current) => ({
                          ...current,
                          vehicleVisual: {
                            ...current.vehicleVisual,
                            featurePoints: current.vehicleVisual.featurePoints.map(
                              (item, itemIndex) =>
                                itemIndex === index ? { ...item, titleEn } : item,
                            ),
                          },
                        }))
                      }
                      onChangeUr={(titleUr) =>
                        setValues((current) => ({
                          ...current,
                          vehicleVisual: {
                            ...current.vehicleVisual,
                            featurePoints: current.vehicleVisual.featurePoints.map(
                              (item, itemIndex) =>
                                itemIndex === index ? { ...item, titleUr } : item,
                            ),
                          },
                        }))
                      }
                    />
                    <BilingualField
                      labelEn="Description (EN)"
                      labelUr="Description (UR)"
                      valueEn={point.descriptionEn}
                      valueUr={point.descriptionUr}
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
                                  : item,
                            ),
                          },
                        }))
                      }
                      onChangeUr={(descriptionUr) =>
                        setValues((current) => ({
                          ...current,
                          vehicleVisual: {
                            ...current.vehicleVisual,
                            featurePoints: current.vehicleVisual.featurePoints.map(
                              (item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, descriptionUr }
                                  : item,
                            ),
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <BilingualField
              labelEn="Options note (EN)"
              labelUr="Options note (UR)"
              valueEn={values.optionsNoteEn}
              valueUr={values.optionsNoteUr}
              multiline
              onChangeEn={(optionsNoteEn) =>
                setValues((current) => ({ ...current, optionsNoteEn }))
              }
              onChangeUr={(optionsNoteUr) =>
                setValues((current) => ({ ...current, optionsNoteUr }))
              }
            />
            <BilingualField
              labelEn={labels.fields.footerDescriptionEn}
              labelUr={labels.fields.footerDescriptionUr}
              valueEn={values.footerDescriptionEn}
              valueUr={values.footerDescriptionUr}
              multiline
              onChangeEn={(footerDescriptionEn) =>
                setValues((current) => ({ ...current, footerDescriptionEn }))
              }
              onChangeUr={(footerDescriptionUr) =>
                setValues((current) => ({ ...current, footerDescriptionUr }))
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
                ["popularCount", labels.fields.popularCount],
              ] as const
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
                        [key]: Number(event.target.value),
                      },
                    }))
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
              labelUr={labels.fields.metaTitleUr}
              valueEn={values.seo.metaTitleEn}
              valueUr={values.seo.metaTitleUr}
              onChangeEn={(metaTitleEn) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, metaTitleEn },
                }))
              }
              onChangeUr={(metaTitleUr) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, metaTitleUr },
                }))
              }
            />
            <BilingualField
              labelEn={labels.fields.metaDescriptionEn}
              labelUr={labels.fields.metaDescriptionUr}
              valueEn={values.seo.metaDescriptionEn}
              valueUr={values.seo.metaDescriptionUr}
              multiline
              onChangeEn={(metaDescriptionEn) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, metaDescriptionEn },
                }))
              }
              onChangeUr={(metaDescriptionUr) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, metaDescriptionUr },
                }))
              }
            />
            <BilingualField
              labelEn={labels.fields.h1En}
              labelUr={labels.fields.h1Ur}
              valueEn={values.seo.h1En}
              valueUr={values.seo.h1Ur}
              onChangeEn={(h1En) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, h1En },
                }))
              }
              onChangeUr={(h1Ur) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, h1Ur },
                }))
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
