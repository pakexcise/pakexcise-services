"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateContactPageSettingsAction } from "@/features/contact-page/admin/actions/update-contact-page-settings";
import type { ContactPageSettings } from "@/features/contact-page/types";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type SettingsTab =
  | "hero"
  | "contact"
  | "cards"
  | "form"
  | "cta"
  | "seo";

type ContactPageFieldLabels = {
  pageActive: string;
  heroTitleEn: string;
  heroTitleUr: string;
  heroDescriptionEn: string;
  heroDescriptionUr: string;
  phoneNumber: string;
  whatsappNumber: string;
  supportEmail: string;
  supportDaysEn: string;
  supportDaysUr: string;
  supportHoursEn: string;
  supportHoursUr: string;
  whatsappChannelUrl: string;
  whatsappPrefillMessage: string;
  cardActive: string;
  cardTitleEn: string;
  cardTitleUr: string;
  cardDescriptionEn: string;
  cardDescriptionUr: string;
  cardButtonEn: string;
  cardButtonUr: string;
  supportHoursCardTitleEn: string;
  supportHoursCardTitleUr: string;
  formHeadingEn: string;
  formHeadingUr: string;
  formDescriptionEn: string;
  formDescriptionUr: string;
  socialHeadingEn: string;
  socialHeadingUr: string;
  socialDescriptionEn: string;
  socialDescriptionUr: string;
  ctaActive: string;
  ctaTitleEn: string;
  ctaTitleUr: string;
  ctaDescriptionEn: string;
  ctaDescriptionUr: string;
  ctaViewServicesEn: string;
  ctaViewServicesUr: string;
  ctaWhatsappEn: string;
  ctaWhatsappUr: string;
  metaTitleEn: string;
  metaTitleUr: string;
  metaDescriptionEn: string;
  metaDescriptionUr: string;
};

type ContactPageSettingsPanelProps = {
  initialValues: ContactPageSettings;
  labels: {
    save: string;
    saving: string;
    saved: string;
    error: string;
    tabs: Record<SettingsTab, string>;
    fields: ContactPageFieldLabels;
  };
};

function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-input"
      />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
  );
}

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
  if (multiline) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{labelEn}</Label>
          <Textarea
            value={valueEn}
            onChange={(event) => onChangeEn(event.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>{labelUr}</Label>
          <Textarea
            value={valueUr}
            onChange={(event) => onChangeUr(event.target.value)}
            rows={3}
            dir="rtl"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>{labelEn}</Label>
        <Input value={valueEn} onChange={(event) => onChangeEn(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{labelUr}</Label>
        <Input
          value={valueUr}
          onChange={(event) => onChangeUr(event.target.value)}
          dir="rtl"
        />
      </div>
    </div>
  );
}

export function ContactPageSettingsPanel({
  initialValues,
  labels,
}: ContactPageSettingsPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("hero");
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tabs: SettingsTab[] = ["hero", "contact", "cards", "form", "cta", "seo"];

  function handleSave() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await updateContactPageSettingsAction(values);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(labels.saved);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {labels.tabs[tab]}
          </button>
        ))}
      </div>

      {activeTab === "hero" ? (
        <div className="space-y-4">
          <CheckboxField
            id="contact-page-active"
            label={labels.fields.pageActive}
            checked={values.isPageActive}
            onChange={(checked) => setValues((current) => ({ ...current, isPageActive: checked }))}
          />
          <BilingualField
            labelEn={labels.fields.heroTitleEn}
            labelUr={labels.fields.heroTitleUr}
            valueEn={values.heroTitleEn}
            valueUr={values.heroTitleUr}
            onChangeEn={(heroTitleEn) => setValues((current) => ({ ...current, heroTitleEn }))}
            onChangeUr={(heroTitleUr) => setValues((current) => ({ ...current, heroTitleUr }))}
          />
          <BilingualField
            labelEn={labels.fields.heroDescriptionEn}
            labelUr={labels.fields.heroDescriptionUr}
            valueEn={values.heroDescriptionEn}
            valueUr={values.heroDescriptionUr}
            onChangeEn={(heroDescriptionEn) =>
              setValues((current) => ({ ...current, heroDescriptionEn }))
            }
            onChangeUr={(heroDescriptionUr) =>
              setValues((current) => ({ ...current, heroDescriptionUr }))
            }
            multiline
          />
        </div>
      ) : null}

      {activeTab === "contact" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{labels.fields.phoneNumber}</Label>
            <Input
              value={values.phoneNumber}
              onChange={(event) =>
                setValues((current) => ({ ...current, phoneNumber: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.fields.whatsappNumber}</Label>
            <Input
              value={values.whatsappNumber}
              onChange={(event) =>
                setValues((current) => ({ ...current, whatsappNumber: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.fields.supportEmail}</Label>
            <Input
              type="email"
              value={values.supportEmail}
              onChange={(event) =>
                setValues((current) => ({ ...current, supportEmail: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.fields.whatsappChannelUrl}</Label>
            <Input
              value={values.whatsappChannelUrl}
              onChange={(event) =>
                setValues((current) => ({ ...current, whatsappChannelUrl: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{labels.fields.whatsappPrefillMessage}</Label>
            <Textarea
              value={values.whatsappPrefillMessage}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  whatsappPrefillMessage: event.target.value,
                }))
              }
              rows={2}
            />
          </div>
          <BilingualField
            labelEn={labels.fields.supportDaysEn}
            labelUr={labels.fields.supportDaysUr}
            valueEn={values.supportDaysEn}
            valueUr={values.supportDaysUr}
            onChangeEn={(supportDaysEn) =>
              setValues((current) => ({ ...current, supportDaysEn }))
            }
            onChangeUr={(supportDaysUr) =>
              setValues((current) => ({ ...current, supportDaysUr }))
            }
          />
          <BilingualField
            labelEn={labels.fields.supportHoursEn}
            labelUr={labels.fields.supportHoursUr}
            valueEn={values.supportHoursEn}
            valueUr={values.supportHoursUr}
            onChangeEn={(supportHoursEn) =>
              setValues((current) => ({ ...current, supportHoursEn }))
            }
            onChangeUr={(supportHoursUr) =>
              setValues((current) => ({ ...current, supportHoursUr }))
            }
          />
        </div>
      ) : null}

      {activeTab === "cards" ? (
        <div className="space-y-8">
          {(["whatsappCard", "callCard", "emailCard", "whatsappChannelCard"] as const).map(
            (cardKey) => (
              <section key={cardKey} className="space-y-4 rounded-lg border p-4">
                <CheckboxField
                  id={`${cardKey}-active`}
                  label={labels.fields.cardActive}
                  checked={values[cardKey].isActive}
                  onChange={(checked) =>
                    setValues((current) => ({
                      ...current,
                      [cardKey]: { ...current[cardKey], isActive: checked },
                    }))
                  }
                />
                <BilingualField
                  labelEn={labels.fields.cardTitleEn}
                  labelUr={labels.fields.cardTitleUr}
                  valueEn={values[cardKey].titleEn}
                  valueUr={values[cardKey].titleUr}
                  onChangeEn={(titleEn) =>
                    setValues((current) => ({
                      ...current,
                      [cardKey]: { ...current[cardKey], titleEn },
                    }))
                  }
                  onChangeUr={(titleUr) =>
                    setValues((current) => ({
                      ...current,
                      [cardKey]: { ...current[cardKey], titleUr },
                    }))
                  }
                />
                <BilingualField
                  labelEn={labels.fields.cardDescriptionEn}
                  labelUr={labels.fields.cardDescriptionUr}
                  valueEn={values[cardKey].descriptionEn}
                  valueUr={values[cardKey].descriptionUr}
                  onChangeEn={(descriptionEn) =>
                    setValues((current) => ({
                      ...current,
                      [cardKey]: { ...current[cardKey], descriptionEn },
                    }))
                  }
                  onChangeUr={(descriptionUr) =>
                    setValues((current) => ({
                      ...current,
                      [cardKey]: { ...current[cardKey], descriptionUr },
                    }))
                  }
                  multiline
                />
                <BilingualField
                  labelEn={labels.fields.cardButtonEn}
                  labelUr={labels.fields.cardButtonUr}
                  valueEn={values[cardKey].buttonLabelEn}
                  valueUr={values[cardKey].buttonLabelUr}
                  onChangeEn={(buttonLabelEn) =>
                    setValues((current) => ({
                      ...current,
                      [cardKey]: { ...current[cardKey], buttonLabelEn },
                    }))
                  }
                  onChangeUr={(buttonLabelUr) =>
                    setValues((current) => ({
                      ...current,
                      [cardKey]: { ...current[cardKey], buttonLabelUr },
                    }))
                  }
                />
              </section>
            ),
          )}
          <section className="space-y-4 rounded-lg border p-4">
            <CheckboxField
              id="support-hours-active"
              label={labels.fields.cardActive}
              checked={values.supportHoursCard.isActive}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  supportHoursCard: { ...current.supportHoursCard, isActive: checked },
                }))
              }
            />
            <BilingualField
              labelEn={labels.fields.supportHoursCardTitleEn}
              labelUr={labels.fields.supportHoursCardTitleUr}
              valueEn={values.supportHoursCard.titleEn}
              valueUr={values.supportHoursCard.titleUr}
              onChangeEn={(titleEn) =>
                setValues((current) => ({
                  ...current,
                  supportHoursCard: { ...current.supportHoursCard, titleEn },
                }))
              }
              onChangeUr={(titleUr) =>
                setValues((current) => ({
                  ...current,
                  supportHoursCard: { ...current.supportHoursCard, titleUr },
                }))
              }
            />
          </section>
        </div>
      ) : null}

      {activeTab === "form" ? (
        <div className="space-y-8">
          <BilingualField
            labelEn={labels.fields.formHeadingEn}
            labelUr={labels.fields.formHeadingUr}
            valueEn={values.formHeadingEn}
            valueUr={values.formHeadingUr}
            onChangeEn={(formHeadingEn) => setValues((current) => ({ ...current, formHeadingEn }))}
            onChangeUr={(formHeadingUr) => setValues((current) => ({ ...current, formHeadingUr }))}
          />
          <BilingualField
            labelEn={labels.fields.formDescriptionEn}
            labelUr={labels.fields.formDescriptionUr}
            valueEn={values.formDescriptionEn}
            valueUr={values.formDescriptionUr}
            onChangeEn={(formDescriptionEn) =>
              setValues((current) => ({ ...current, formDescriptionEn }))
            }
            onChangeUr={(formDescriptionUr) =>
              setValues((current) => ({ ...current, formDescriptionUr }))
            }
            multiline
          />
          <BilingualField
            labelEn={labels.fields.socialHeadingEn}
            labelUr={labels.fields.socialHeadingUr}
            valueEn={values.socialHeadingEn}
            valueUr={values.socialHeadingUr}
            onChangeEn={(socialHeadingEn) =>
              setValues((current) => ({ ...current, socialHeadingEn }))
            }
            onChangeUr={(socialHeadingUr) =>
              setValues((current) => ({ ...current, socialHeadingUr }))
            }
          />
          <BilingualField
            labelEn={labels.fields.socialDescriptionEn}
            labelUr={labels.fields.socialDescriptionUr}
            valueEn={values.socialDescriptionEn}
            valueUr={values.socialDescriptionUr}
            onChangeEn={(socialDescriptionEn) =>
              setValues((current) => ({ ...current, socialDescriptionEn }))
            }
            onChangeUr={(socialDescriptionUr) =>
              setValues((current) => ({ ...current, socialDescriptionUr }))
            }
            multiline
          />
        </div>
      ) : null}

      {activeTab === "cta" ? (
        <div className="space-y-4">
          <CheckboxField
            id="cta-active"
            label={labels.fields.ctaActive}
            checked={values.ctaIsActive}
            onChange={(checked) => setValues((current) => ({ ...current, ctaIsActive: checked }))}
          />
          <BilingualField
            labelEn={labels.fields.ctaTitleEn}
            labelUr={labels.fields.ctaTitleUr}
            valueEn={values.ctaTitleEn}
            valueUr={values.ctaTitleUr}
            onChangeEn={(ctaTitleEn) => setValues((current) => ({ ...current, ctaTitleEn }))}
            onChangeUr={(ctaTitleUr) => setValues((current) => ({ ...current, ctaTitleUr }))}
          />
          <BilingualField
            labelEn={labels.fields.ctaDescriptionEn}
            labelUr={labels.fields.ctaDescriptionUr}
            valueEn={values.ctaDescriptionEn}
            valueUr={values.ctaDescriptionUr}
            onChangeEn={(ctaDescriptionEn) =>
              setValues((current) => ({ ...current, ctaDescriptionEn }))
            }
            onChangeUr={(ctaDescriptionUr) =>
              setValues((current) => ({ ...current, ctaDescriptionUr }))
            }
            multiline
          />
          <BilingualField
            labelEn={labels.fields.ctaViewServicesEn}
            labelUr={labels.fields.ctaViewServicesUr}
            valueEn={values.ctaViewServicesLabelEn}
            valueUr={values.ctaViewServicesLabelUr}
            onChangeEn={(ctaViewServicesLabelEn) =>
              setValues((current) => ({ ...current, ctaViewServicesLabelEn }))
            }
            onChangeUr={(ctaViewServicesLabelUr) =>
              setValues((current) => ({ ...current, ctaViewServicesLabelUr }))
            }
          />
          <BilingualField
            labelEn={labels.fields.ctaWhatsappEn}
            labelUr={labels.fields.ctaWhatsappUr}
            valueEn={values.ctaWhatsappLabelEn}
            valueUr={values.ctaWhatsappLabelUr}
            onChangeEn={(ctaWhatsappLabelEn) =>
              setValues((current) => ({ ...current, ctaWhatsappLabelEn }))
            }
            onChangeUr={(ctaWhatsappLabelUr) =>
              setValues((current) => ({ ...current, ctaWhatsappLabelUr }))
            }
          />
        </div>
      ) : null}

      {activeTab === "seo" ? (
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
      ) : null}

      {activeTab === "seo" ? (
        <BilingualField
          labelEn={labels.fields.metaDescriptionEn}
          labelUr={labels.fields.metaDescriptionUr}
          valueEn={values.seo.metaDescriptionEn}
          valueUr={values.seo.metaDescriptionUr}
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
          multiline
        />
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-primary">{success}</p> : null}

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? labels.saving : labels.save}
      </Button>
    </div>
  );
}
