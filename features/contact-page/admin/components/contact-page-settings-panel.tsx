"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateContactPageSettingsAction } from "@/features/contact-page/admin/actions/update-contact-page-settings";
import type { ContactPageSettings } from "@/features/contact-page/types";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
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
  heroDescriptionEn: string;
  phoneNumber: string;
  whatsappNumber: string;
  supportEmail: string;
  supportDaysEn: string;
  supportHoursEn: string;
  whatsappChannelUrl: string;
  whatsappPrefillMessage: string;
  cardActive: string;
  cardTitleEn: string;
  cardDescriptionEn: string;
  cardButtonEn: string;
  supportHoursCardTitleEn: string;
  formHeadingEn: string;
  formDescriptionEn: string;
  socialHeadingEn: string;
  socialDescriptionEn: string;
  ctaActive: string;
  ctaTitleEn: string;
  ctaDescriptionEn: string;
  ctaViewServicesEn: string;
  ctaWhatsappEn: string;
  metaTitleEn: string;
  metaDescriptionEn: string;
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
  onChange}: {
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
  valueEn,
  onChangeEn,
  multiline = false}: {
  labelEn: string;
  valueEn: string;
  onChangeEn: (value: string) => void;
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
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>{labelEn}</Label>
        <Input value={valueEn} onChange={(event) => onChangeEn(event.target.value)} />
      </div>
    </div>
  );
}

export function ContactPageSettingsPanel({
  initialValues,
  labels}: ContactPageSettingsPanelProps) {
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
                : "bg-muted text-muted-foreground hover:text-foreground")}
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
            valueEn={values.heroTitleEn}
            onChangeEn={(heroTitleEn) => setValues((current) => ({ ...current, heroTitleEn }))}
          />
          <BilingualField
            labelEn={labels.fields.heroDescriptionEn}
            valueEn={values.heroDescriptionEn}
            onChangeEn={(heroDescriptionEn) =>
              setValues((current) => ({ ...current, heroDescriptionEn }))
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
                  whatsappPrefillMessage: event.target.value}))
              }
              rows={2}
            />
          </div>
          <BilingualField
            labelEn={labels.fields.supportDaysEn}
            valueEn={values.supportDaysEn}
            onChangeEn={(supportDaysEn) =>
              setValues((current) => ({ ...current, supportDaysEn }))
            }
          />
          <BilingualField
            labelEn={labels.fields.supportHoursEn}
            valueEn={values.supportHoursEn}
            onChangeEn={(supportHoursEn) =>
              setValues((current) => ({ ...current, supportHoursEn }))
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
                      [cardKey]: { ...current[cardKey], isActive: checked }}))
                  }
                />
                <BilingualField
                  labelEn={labels.fields.cardTitleEn}
                  valueEn={values[cardKey].titleEn}
                  onChangeEn={(titleEn) =>
                    setValues((current) => ({
                      ...current,
                      [cardKey]: { ...current[cardKey], titleEn }}))
                  }
                />
                <BilingualField
                  labelEn={labels.fields.cardDescriptionEn}
                  valueEn={values[cardKey].descriptionEn}
                  onChangeEn={(descriptionEn) =>
                    setValues((current) => ({
                      ...current,
                      [cardKey]: { ...current[cardKey], descriptionEn }}))
                  }
                  multiline
                />
                <BilingualField
                  labelEn={labels.fields.cardButtonEn}
                  valueEn={values[cardKey].buttonLabelEn}
                  onChangeEn={(buttonLabelEn) =>
                    setValues((current) => ({
                      ...current,
                      [cardKey]: { ...current[cardKey], buttonLabelEn }}))
                  }
                />
              </section>
            ))}
          <section className="space-y-4 rounded-lg border p-4">
            <CheckboxField
              id="support-hours-active"
              label={labels.fields.cardActive}
              checked={values.supportHoursCard.isActive}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  supportHoursCard: { ...current.supportHoursCard, isActive: checked }}))
              }
            />
            <BilingualField
              labelEn={labels.fields.supportHoursCardTitleEn}
              valueEn={values.supportHoursCard.titleEn}
              onChangeEn={(titleEn) =>
                setValues((current) => ({
                  ...current,
                  supportHoursCard: { ...current.supportHoursCard, titleEn }}))
              }
            />
          </section>
        </div>
      ) : null}

      {activeTab === "form" ? (
        <div className="space-y-8">
          <BilingualField
            labelEn={labels.fields.formHeadingEn}
            valueEn={values.formHeadingEn}
            onChangeEn={(formHeadingEn) => setValues((current) => ({ ...current, formHeadingEn }))}
          />
          <BilingualField
            labelEn={labels.fields.formDescriptionEn}
            valueEn={values.formDescriptionEn}
            onChangeEn={(formDescriptionEn) =>
              setValues((current) => ({ ...current, formDescriptionEn }))
            }
            multiline
          />
          <BilingualField
            labelEn={labels.fields.socialHeadingEn}
            valueEn={values.socialHeadingEn}
            onChangeEn={(socialHeadingEn) =>
              setValues((current) => ({ ...current, socialHeadingEn }))
            }
          />
          <BilingualField
            labelEn={labels.fields.socialDescriptionEn}
            valueEn={values.socialDescriptionEn}
            onChangeEn={(socialDescriptionEn) =>
              setValues((current) => ({ ...current, socialDescriptionEn }))
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
            valueEn={values.ctaTitleEn}
            onChangeEn={(ctaTitleEn) => setValues((current) => ({ ...current, ctaTitleEn }))}
          />
          <BilingualField
            labelEn={labels.fields.ctaDescriptionEn}
            valueEn={values.ctaDescriptionEn}
            onChangeEn={(ctaDescriptionEn) =>
              setValues((current) => ({ ...current, ctaDescriptionEn }))
            }
            multiline
          />
          <BilingualField
            labelEn={labels.fields.ctaViewServicesEn}
            valueEn={values.ctaViewServicesLabelEn}
            onChangeEn={(ctaViewServicesLabelEn) =>
              setValues((current) => ({ ...current, ctaViewServicesLabelEn }))
            }
          />
          <BilingualField
            labelEn={labels.fields.ctaWhatsappEn}
            valueEn={values.ctaWhatsappLabelEn}
            onChangeEn={(ctaWhatsappLabelEn) =>
              setValues((current) => ({ ...current, ctaWhatsappLabelEn }))
            }
          />
        </div>
      ) : null}

      {activeTab === "seo" ? (
        <BilingualField
          labelEn={labels.fields.metaTitleEn}
          valueEn={values.seo.metaTitleEn}
          onChangeEn={(metaTitleEn) =>
            setValues((current) => ({
              ...current,
              seo: { ...current.seo, metaTitleEn }}))
          }
        />
      ) : null}

      {activeTab === "seo" ? (
        <BilingualField
          labelEn={labels.fields.metaDescriptionEn}
          valueEn={values.seo.metaDescriptionEn}
          onChangeEn={(metaDescriptionEn) =>
            setValues((current) => ({
              ...current,
              seo: { ...current.seo, metaDescriptionEn }}))
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
