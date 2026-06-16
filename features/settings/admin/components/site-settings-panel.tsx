"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateGlobalSiteSettingsAction } from "@/features/settings/admin/actions/site-settings-actions";
import type { GlobalSiteFormValues } from "@/features/settings/admin/lib/global-site-form";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type SiteSettingsTab =
  | "contact"
  | "header"
  | "fab"
  | "contactForm"
  | "submitRequest"
  | "footer"
  | "branding";

export type SiteSettingsPanelLabels = {
  tabs: Record<SiteSettingsTab, string>;
  save: string;
  saving: string;
  saved: string;
  error: string;
  contact: {
    businessEmail: string;
    phoneDisplayNumber: string;
    whatsappLinkNumber: string;
    whatsappDefaultMessageEn: string;
    whatsappDefaultMessageUr: string;
    supportDaysEn: string;
    supportDaysUr: string;
    supportHoursEn: string;
    supportHoursUr: string;
    whatsappChannelUrl: string;
  };
  header: {
    headerWhatsappEnabled: string;
    headerWhatsappLabelEn: string;
    headerWhatsappLabelUr: string;
    announcementBarEnabled: string;
    announcementBarTextEn: string;
    announcementBarTextUr: string;
    defaultApplyCtaTextEn: string;
    defaultApplyCtaTextUr: string;
    defaultSubmitRequestCtaTextEn: string;
    defaultSubmitRequestCtaTextUr: string;
  };
  fab: {
    floatingWhatsappMessageEn: string;
    floatingWhatsappMessageUr: string;
    floatingWhatsappPosition: string;
    positionBottomRight: string;
    positionBottomLeft: string;
    featureFlagNote: string;
  };
  contactForm: {
    contactRecipientEmail: string;
    contactSuccessMessageEn: string;
    contactSuccessMessageUr: string;
    contactAdminNotificationEnabled: string;
    contactAutoReplyEnabled: string;
    featureFlagNote: string;
  };
  submitRequest: {
    submitRequestSuccessMessageEn: string;
    submitRequestSuccessMessageUr: string;
    submitRequestSaveToSupportRequests: string;
    submitRequestNotifyAdminEnabled: string;
    featureFlagNote: string;
  };
  footer: {
    footerDescriptionEn: string;
    footerDescriptionUr: string;
    disclaimerEn: string;
    disclaimerUr: string;
  };
  branding: {
    logoPath: string;
    logoDarkPath: string;
    footerLogoPath: string;
    faviconPath: string;
    defaultOgImagePath: string;
    defaultTwitterImagePath: string;
    defaultBlogFallbackImagePath: string;
    defaultGuideFallbackImagePath: string;
    defaultServiceFallbackImagePath: string;
    defaultRegionFallbackImagePath: string;
    primaryBrandColor: string;
    secondaryBrandColor: string;
  };
};

type SiteSettingsPanelProps = {
  initialValues: GlobalSiteFormValues;
  labels: SiteSettingsPanelLabels;
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

export function SiteSettingsPanel({
  initialValues,
  labels,
}: SiteSettingsPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SiteSettingsTab>("contact");
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tabs: SiteSettingsTab[] = [
    "contact",
    "header",
    "fab",
    "contactForm",
    "submitRequest",
    "footer",
    "branding",
  ];

  function handleSave() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await updateGlobalSiteSettingsAction(values);

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
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
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

      {activeTab === "contact" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={labels.contact.businessEmail}>
            <Input
              type="email"
              value={values.business.businessEmail}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    businessEmail: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.contact.phoneDisplayNumber}>
            <Input
              value={values.business.phoneDisplayNumber}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    phoneDisplayNumber: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.contact.whatsappLinkNumber}>
            <Input
              value={values.business.whatsappLinkNumber}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    whatsappLinkNumber: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.contact.whatsappChannelUrl}>
            <Input
              value={values.business.whatsappChannelUrl}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    whatsappChannelUrl: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.contact.whatsappDefaultMessageEn} className="md:col-span-2">
            <Textarea
              rows={2}
              value={values.business.whatsappDefaultMessageEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    whatsappDefaultMessageEn: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.contact.whatsappDefaultMessageUr} className="md:col-span-2">
            <Textarea
              dir="rtl"
              rows={2}
              value={values.business.whatsappDefaultMessageUr}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    whatsappDefaultMessageUr: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.contact.supportDaysEn}>
            <Input
              value={values.business.supportDaysEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    supportDaysEn: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.contact.supportDaysUr}>
            <Input
              dir="rtl"
              value={values.business.supportDaysUr}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    supportDaysUr: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.contact.supportHoursEn}>
            <Input
              value={values.business.supportHoursEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    supportHoursEn: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.contact.supportHoursUr}>
            <Input
              dir="rtl"
              value={values.business.supportHoursUr}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    supportHoursUr: event.target.value,
                  },
                }))
              }
            />
          </Field>
        </div>
      ) : null}

      {activeTab === "header" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <CheckboxField
            id="headerWhatsappEnabled"
            label={labels.header.headerWhatsappEnabled}
            checked={values.publicUi.headerWhatsappEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                publicUi: { ...current.publicUi, headerWhatsappEnabled: checked },
              }))
            }
          />
          <CheckboxField
            id="announcementBarEnabled"
            label={labels.header.announcementBarEnabled}
            checked={values.publicUi.announcementBarEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                publicUi: { ...current.publicUi, announcementBarEnabled: checked },
              }))
            }
          />
          <Field label={labels.header.headerWhatsappLabelEn}>
            <Input
              value={values.publicUi.headerWhatsappLabelEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  publicUi: {
                    ...current.publicUi,
                    headerWhatsappLabelEn: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.header.headerWhatsappLabelUr}>
            <Input
              dir="rtl"
              value={values.publicUi.headerWhatsappLabelUr}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  publicUi: {
                    ...current.publicUi,
                    headerWhatsappLabelUr: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.header.announcementBarTextEn} className="md:col-span-2">
            <Textarea
              rows={2}
              value={values.publicUi.announcementBarTextEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  publicUi: {
                    ...current.publicUi,
                    announcementBarTextEn: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.header.announcementBarTextUr} className="md:col-span-2">
            <Textarea
              dir="rtl"
              rows={2}
              value={values.publicUi.announcementBarTextUr}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  publicUi: {
                    ...current.publicUi,
                    announcementBarTextUr: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.header.defaultApplyCtaTextEn}>
            <Input
              value={values.publicUi.defaultApplyCtaTextEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  publicUi: {
                    ...current.publicUi,
                    defaultApplyCtaTextEn: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.header.defaultApplyCtaTextUr}>
            <Input
              dir="rtl"
              value={values.publicUi.defaultApplyCtaTextUr}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  publicUi: {
                    ...current.publicUi,
                    defaultApplyCtaTextUr: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.header.defaultSubmitRequestCtaTextEn}>
            <Input
              value={values.publicUi.defaultSubmitRequestCtaTextEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  publicUi: {
                    ...current.publicUi,
                    defaultSubmitRequestCtaTextEn: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.header.defaultSubmitRequestCtaTextUr}>
            <Input
              dir="rtl"
              value={values.publicUi.defaultSubmitRequestCtaTextUr}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  publicUi: {
                    ...current.publicUi,
                    defaultSubmitRequestCtaTextUr: event.target.value,
                  },
                }))
              }
            />
          </Field>
        </div>
      ) : null}

      {activeTab === "fab" ? (
        <div className="space-y-4">
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {labels.fab.featureFlagNote}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={labels.fab.floatingWhatsappMessageEn} className="md:col-span-2">
              <Textarea
                rows={2}
                value={values.publicUi.floatingWhatsappMessageEn}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    publicUi: {
                      ...current.publicUi,
                      floatingWhatsappMessageEn: event.target.value,
                    },
                  }))
                }
              />
            </Field>
            <Field label={labels.fab.floatingWhatsappMessageUr} className="md:col-span-2">
              <Textarea
                dir="rtl"
                rows={2}
                value={values.publicUi.floatingWhatsappMessageUr}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    publicUi: {
                      ...current.publicUi,
                      floatingWhatsappMessageUr: event.target.value,
                    },
                  }))
                }
              />
            </Field>
            <Field label={labels.fab.floatingWhatsappPosition}>
              <select
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                )}
                value={values.publicUi.floatingWhatsappPosition}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    publicUi: {
                      ...current.publicUi,
                      floatingWhatsappPosition: event.target.value as
                        | "bottom-right"
                        | "bottom-left",
                    },
                  }))
                }
              >
                <option value="bottom-right">{labels.fab.positionBottomRight}</option>
                <option value="bottom-left">{labels.fab.positionBottomLeft}</option>
              </select>
            </Field>
          </div>
        </div>
      ) : null}

      {activeTab === "contactForm" ? (
        <div className="space-y-4">
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {labels.contactForm.featureFlagNote}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={labels.contactForm.contactRecipientEmail} className="md:col-span-2">
              <Input
                type="email"
                value={values.forms.contactRecipientEmail}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    forms: {
                      ...current.forms,
                      contactRecipientEmail: event.target.value,
                    },
                  }))
                }
              />
            </Field>
            <Field label={labels.contactForm.contactSuccessMessageEn} className="md:col-span-2">
              <Textarea
                rows={2}
                value={values.forms.contactSuccessMessageEn}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    forms: {
                      ...current.forms,
                      contactSuccessMessageEn: event.target.value,
                    },
                  }))
                }
              />
            </Field>
            <Field label={labels.contactForm.contactSuccessMessageUr} className="md:col-span-2">
              <Textarea
                dir="rtl"
                rows={2}
                value={values.forms.contactSuccessMessageUr}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    forms: {
                      ...current.forms,
                      contactSuccessMessageUr: event.target.value,
                    },
                  }))
                }
              />
            </Field>
            <CheckboxField
              id="contactAdminNotificationEnabled"
              label={labels.contactForm.contactAdminNotificationEnabled}
              checked={values.forms.contactAdminNotificationEnabled}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  forms: {
                    ...current.forms,
                    contactAdminNotificationEnabled: checked,
                  },
                }))
              }
            />
            <CheckboxField
              id="contactAutoReplyEnabled"
              label={labels.contactForm.contactAutoReplyEnabled}
              checked={values.forms.contactAutoReplyEnabled}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  forms: { ...current.forms, contactAutoReplyEnabled: checked },
                }))
              }
            />
          </div>
        </div>
      ) : null}

      {activeTab === "submitRequest" ? (
        <div className="space-y-4">
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {labels.submitRequest.featureFlagNote}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label={labels.submitRequest.submitRequestSuccessMessageEn}
              className="md:col-span-2"
            >
              <Textarea
                rows={2}
                value={values.forms.submitRequestSuccessMessageEn}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    forms: {
                      ...current.forms,
                      submitRequestSuccessMessageEn: event.target.value,
                    },
                  }))
                }
              />
            </Field>
            <Field
              label={labels.submitRequest.submitRequestSuccessMessageUr}
              className="md:col-span-2"
            >
              <Textarea
                dir="rtl"
                rows={2}
                value={values.forms.submitRequestSuccessMessageUr}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    forms: {
                      ...current.forms,
                      submitRequestSuccessMessageUr: event.target.value,
                    },
                  }))
                }
              />
            </Field>
            <CheckboxField
              id="submitRequestSaveToSupportRequests"
              label={labels.submitRequest.submitRequestSaveToSupportRequests}
              checked={values.forms.submitRequestSaveToSupportRequests}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  forms: {
                    ...current.forms,
                    submitRequestSaveToSupportRequests: checked,
                  },
                }))
              }
            />
            <CheckboxField
              id="submitRequestNotifyAdminEnabled"
              label={labels.submitRequest.submitRequestNotifyAdminEnabled}
              checked={values.forms.submitRequestNotifyAdminEnabled}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  forms: {
                    ...current.forms,
                    submitRequestNotifyAdminEnabled: checked,
                  },
                }))
              }
            />
          </div>
        </div>
      ) : null}

      {activeTab === "footer" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={labels.footer.footerDescriptionEn} className="md:col-span-2">
            <Textarea
              rows={3}
              value={values.business.footerDescriptionEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    footerDescriptionEn: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.footer.footerDescriptionUr} className="md:col-span-2">
            <Textarea
              dir="rtl"
              rows={3}
              value={values.business.footerDescriptionUr}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    footerDescriptionUr: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.footer.disclaimerEn} className="md:col-span-2">
            <Textarea
              rows={3}
              value={values.business.disclaimerEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    disclaimerEn: event.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label={labels.footer.disclaimerUr} className="md:col-span-2">
            <Textarea
              dir="rtl"
              rows={3}
              value={values.business.disclaimerUr}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  business: {
                    ...current.business,
                    disclaimerUr: event.target.value,
                  },
                }))
              }
            />
          </Field>
        </div>
      ) : null}

      {activeTab === "branding" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["logoPath", labels.branding.logoPath],
              ["logoDarkPath", labels.branding.logoDarkPath],
              ["footerLogoPath", labels.branding.footerLogoPath],
              ["faviconPath", labels.branding.faviconPath],
              ["defaultOgImagePath", labels.branding.defaultOgImagePath],
              ["defaultTwitterImagePath", labels.branding.defaultTwitterImagePath],
              ["defaultBlogFallbackImagePath", labels.branding.defaultBlogFallbackImagePath],
              ["defaultGuideFallbackImagePath", labels.branding.defaultGuideFallbackImagePath],
              ["defaultServiceFallbackImagePath", labels.branding.defaultServiceFallbackImagePath],
              ["defaultRegionFallbackImagePath", labels.branding.defaultRegionFallbackImagePath],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                value={values.branding[key]}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    branding: { ...current.branding, [key]: event.target.value },
                  }))
                }
              />
            </Field>
          ))}
          <Field label={labels.branding.primaryBrandColor}>
            <div className="flex gap-2">
              <Input
                type="color"
                className="h-10 w-14 shrink-0 cursor-pointer p-1"
                value={values.branding.primaryBrandColor}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    branding: {
                      ...current.branding,
                      primaryBrandColor: event.target.value,
                    },
                  }))
                }
              />
              <Input
                value={values.branding.primaryBrandColor}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    branding: {
                      ...current.branding,
                      primaryBrandColor: event.target.value,
                    },
                  }))
                }
              />
            </div>
          </Field>
          <Field label={labels.branding.secondaryBrandColor}>
            <div className="flex gap-2">
              <Input
                type="color"
                className="h-10 w-14 shrink-0 cursor-pointer p-1"
                value={values.branding.secondaryBrandColor}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    branding: {
                      ...current.branding,
                      secondaryBrandColor: event.target.value,
                    },
                  }))
                }
              />
              <Input
                value={values.branding.secondaryBrandColor}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    branding: {
                      ...current.branding,
                      secondaryBrandColor: event.target.value,
                    },
                  }))
                }
              />
            </div>
          </Field>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          {success}
        </p>
      ) : null}

      <div className="flex justify-end border-t pt-4">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? labels.saving : labels.save}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
