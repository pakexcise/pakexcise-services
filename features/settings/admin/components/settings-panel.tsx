"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateBusinessSettingsAction,
  updateFeatureFlagSettingsAction,
  updatePaymentSettingsAction,
  updateSeoSettingsAction,
  updateTrackingSettingsAction,
} from "@/features/settings/admin/actions/settings-actions";
import type { SettingsPanelLabels } from "@/features/settings/admin/lib/labels";
import type { AdminSettingsSnapshot } from "@/features/settings/types";
import { cn } from "@/lib/utils";

type SettingsTab = keyof SettingsPanelLabels["tabs"];

type SettingsPanelProps = {
  initialValues: AdminSettingsSnapshot;
  labels: SettingsPanelLabels;
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

export function SettingsPanel({ initialValues, labels }: SettingsPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("business");
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tabs: SettingsTab[] = [
    "business",
    "payment",
    "seo",
    "tracking",
    "email",
    "features",
  ];

  function handleSave() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      let result;

      switch (activeTab) {
        case "business":
          result = await updateBusinessSettingsAction(values.business);
          break;
        case "payment":
          result = await updatePaymentSettingsAction(values.payment);
          break;
        case "seo":
          result = await updateSeoSettingsAction(values.seo);
          break;
        case "tracking":
          result = await updateTrackingSettingsAction(values.tracking);
          break;
        case "email":
          result = await updateFeatureFlagSettingsAction(values.features);
          break;
        case "features":
          result = await updateFeatureFlagSettingsAction(values.features);
          break;
      }

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
          <Button
            key={tab}
            type="button"
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab(tab);
              setError(null);
              setSuccess(null);
            }}
          >
            {labels.tabs[tab]}
          </Button>
        ))}
      </div>

      {activeTab === "business" ? (
        <div className="space-y-4">
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {labels.business.globalSiteNote}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="siteName">{labels.business.siteName}</Label>
              <Input
                id="siteName"
                value={values.business.siteName}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    business: {
                      ...current.business,
                      siteName: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressEn">{labels.business.addressEn}</Label>
              <Textarea
                id="addressEn"
                rows={2}
                value={values.business.addressEn}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    business: {
                      ...current.business,
                      addressEn: event.target.value,
                    },
                  }))
                }
              />
            </div>
            
          </div>
        </div>
      ) : null}

      {activeTab === "payment" ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{labels.payment.phase2Hint}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paymentAccountDisplayName">
                {labels.payment.paymentAccountDisplayName}
              </Label>
              <Input
                id="paymentAccountDisplayName"
                value={values.payment.paymentAccountDisplayName}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      paymentAccountDisplayName: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="flex items-end">
              <CheckboxField
                id="manualPaymentEnabled"
                label={labels.payment.manualPaymentEnabled}
                checked={values.payment.manualPaymentEnabled}
                onChange={(checked) =>
                  setValues((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      manualPaymentEnabled: checked,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="jazzCashInstructionsEn">
                {labels.payment.jazzCashInstructionsEn}
              </Label>
              <Textarea
                id="jazzCashInstructionsEn"
                rows={3}
                value={values.payment.jazzCashInstructionsEn}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      jazzCashInstructionsEn: event.target.value,
                    },
                  }))
                }
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="easypaisaInstructionsEn">
                {labels.payment.easypaisaInstructionsEn}
              </Label>
              <Textarea
                id="easypaisaInstructionsEn"
                rows={3}
                value={values.payment.easypaisaInstructionsEn}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      easypaisaInstructionsEn: event.target.value,
                    },
                  }))
                }
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bankTransferInstructionsEn">
                {labels.payment.bankTransferInstructionsEn}
              </Label>
              <Textarea
                id="bankTransferInstructionsEn"
                rows={3}
                value={values.payment.bankTransferInstructionsEn}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      bankTransferInstructionsEn: event.target.value,
                    },
                  }))
                }
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="gatewayPhase2Note">
                {labels.payment.gatewayPhase2Note}
              </Label>
              <Textarea
                id="gatewayPhase2Note"
                rows={2}
                value={values.payment.gatewayPhase2Note}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      gatewayPhase2Note: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <CheckboxField
              id="jazzCashGatewayEnabled"
              label={labels.payment.jazzCashGatewayEnabled}
              checked={values.payment.jazzCashGatewayEnabled}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  payment: {
                    ...current.payment,
                    jazzCashGatewayEnabled: checked,
                  },
                }))
              }
            />
            <CheckboxField
              id="easypaisaGatewayEnabled"
              label={labels.payment.easypaisaGatewayEnabled}
              checked={values.payment.easypaisaGatewayEnabled}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  payment: {
                    ...current.payment,
                    easypaisaGatewayEnabled: checked,
                  },
                }))
              }
            />
            <CheckboxField
              id="cardGatewayEnabled"
              label={labels.payment.cardGatewayEnabled}
              checked={values.payment.cardGatewayEnabled}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  payment: {
                    ...current.payment,
                    cardGatewayEnabled: checked,
                  },
                }))
              }
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{labels.payment.methodsTitle}</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      paymentMethods: [
                        ...current.payment.paymentMethods,
                        {
                          id: crypto.randomUUID(),
                          nameEn: "",
                          accountTitle: "",
                          accountNumber: "",
                          iban: "",
                          instructionsEn: "",
                          isActive: true,
                          displayOrder: current.payment.paymentMethods.length,
                        },
                      ],
                    },
                  }))
                }
              >
                {labels.payment.addMethod}
              </Button>
            </div>
            {values.payment.paymentMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground">{labels.payment.methodsEmpty}</p>
            ) : (
              values.payment.paymentMethods.map((method, index) => (
                <div
                  key={method.id}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      {labels.payment.methodLabel} {index + 1}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setValues((current) => ({
                          ...current,
                          payment: {
                            ...current.payment,
                            paymentMethods: current.payment.paymentMethods.filter(
                              (item) => item.id !== method.id,
                            ),
                          },
                        }))
                      }
                    >
                      {labels.payment.removeMethod}
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{labels.payment.methodNameEn}</Label>
                      <Input
                        value={method.nameEn}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            payment: {
                              ...current.payment,
                              paymentMethods: current.payment.paymentMethods.map((item) =>
                                item.id === method.id
                                  ? { ...item, nameEn: event.target.value }
                                  : item,
                              ),
                            },
                          }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{labels.payment.accountTitle}</Label>
                      <Input
                        value={method.accountTitle}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            payment: {
                              ...current.payment,
                              paymentMethods: current.payment.paymentMethods.map((item) =>
                                item.id === method.id
                                  ? { ...item, accountTitle: event.target.value }
                                  : item,
                              ),
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{labels.payment.accountNumber}</Label>
                      <Input
                        value={method.accountNumber}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            payment: {
                              ...current.payment,
                              paymentMethods: current.payment.paymentMethods.map((item) =>
                                item.id === method.id
                                  ? { ...item, accountNumber: event.target.value }
                                  : item,
                              ),
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>{labels.payment.iban}</Label>
                      <Input
                        value={method.iban}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            payment: {
                              ...current.payment,
                              paymentMethods: current.payment.paymentMethods.map((item) =>
                                item.id === method.id
                                  ? { ...item, iban: event.target.value }
                                  : item,
                              ),
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>{labels.payment.methodInstructionsEn}</Label>
                      <Textarea
                        rows={2}
                        value={method.instructionsEn}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            payment: {
                              ...current.payment,
                              paymentMethods: current.payment.paymentMethods.map((item) =>
                                item.id === method.id
                                  ? { ...item, instructionsEn: event.target.value }
                                  : item,
                              ),
                            },
                          }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{labels.payment.displayOrder}</Label>
                      <Input
                        type="number"
                        min={0}
                        value={method.displayOrder}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            payment: {
                              ...current.payment,
                              paymentMethods: current.payment.paymentMethods.map((item) =>
                                item.id === method.id
                                  ? {
                                      ...item,
                                      displayOrder: Number(event.target.value),
                                    }
                                  : item,
                              ),
                            },
                          }))
                        }
                      />
                    </div>
                    <CheckboxField
                      id={`method-active-${method.id}`}
                      label={labels.payment.methodActive}
                      checked={method.isActive}
                      onChange={(checked) =>
                        setValues((current) => ({
                          ...current,
                          payment: {
                            ...current.payment,
                            paymentMethods: current.payment.paymentMethods.map((item) =>
                              item.id === method.id
                                ? { ...item, isActive: checked }
                                : item,
                            ),
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "seo" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="defaultMetaTitleEn">
              {labels.seo.defaultMetaTitleEn}
            </Label>
            <Input
              id="defaultMetaTitleEn"
              value={values.seo.defaultMetaTitleEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, defaultMetaTitleEn: event.target.value },
                }))
              }
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="defaultMetaDescriptionEn">
              {labels.seo.defaultMetaDescriptionEn}
            </Label>
            <Textarea
              id="defaultMetaDescriptionEn"
              rows={2}
              value={values.seo.defaultMetaDescriptionEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    defaultMetaDescriptionEn: event.target.value,
                  },
                }))
              }
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="defaultOgImage">{labels.seo.defaultOgImage}</Label>
            <Input
              id="defaultOgImage"
              value={values.seo.defaultOgImage}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, defaultOgImage: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="defaultTwitterImage">
              {labels.seo.defaultTwitterImage}
            </Label>
            <Input
              id="defaultTwitterImage"
              value={values.seo.defaultTwitterImage}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    defaultTwitterImage: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="canonicalDomain">{labels.seo.canonicalDomain}</Label>
            <Input
              id="canonicalDomain"
              value={values.seo.canonicalDomain}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, canonicalDomain: event.target.value },
                }))
              }
            />
          </div>
          <CheckboxField
            id="sitemapEnabled"
            label={labels.seo.sitemapEnabled}
            checked={values.seo.sitemapEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                seo: { ...current.seo, sitemapEnabled: checked },
              }))
            }
          />
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold">{labels.seo.organizationSection}</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizationName">{labels.seo.organizationName}</Label>
            <Input
              id="organizationName"
              value={values.seo.organizationName}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, organizationName: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizationLogoPath">
              {labels.seo.organizationLogoPath}
            </Label>
            <Input
              id="organizationLogoPath"
              value={values.seo.organizationLogoPath}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    organizationLogoPath: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="organizationDescriptionEn">
              {labels.seo.organizationDescriptionEn}
            </Label>
            <Textarea
              id="organizationDescriptionEn"
              rows={2}
              value={values.seo.organizationDescriptionEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    organizationDescriptionEn: event.target.value,
                  },
                }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="organizationAreaServed">
              {labels.seo.organizationAreaServed}
            </Label>
            <Input
              id="organizationAreaServed"
              value={values.seo.organizationAreaServed}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    organizationAreaServed: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold">
              {labels.seo.localBusinessSection}
            </h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="localBusinessName">{labels.seo.localBusinessName}</Label>
            <Input
              id="localBusinessName"
              value={values.seo.localBusinessName}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: { ...current.seo, localBusinessName: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="localBusinessPriceRange">
              {labels.seo.localBusinessPriceRange}
            </Label>
            <Input
              id="localBusinessPriceRange"
              placeholder={labels.seo.localBusinessPriceRangeOptional}
              value={values.seo.localBusinessPriceRange}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    localBusinessPriceRange: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="localBusinessDescriptionEn">
              {labels.seo.localBusinessDescriptionEn}
            </Label>
            <Textarea
              id="localBusinessDescriptionEn"
              rows={2}
              value={values.seo.localBusinessDescriptionEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    localBusinessDescriptionEn: event.target.value,
                  },
                }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="localBusinessTelephone">
              {labels.seo.localBusinessTelephone}
            </Label>
            <Input
              id="localBusinessTelephone"
              value={values.seo.localBusinessTelephone}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    localBusinessTelephone: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="localBusinessStreetAddress">
              {labels.seo.localBusinessStreetAddress}
            </Label>
            <Input
              id="localBusinessStreetAddress"
              value={values.seo.localBusinessStreetAddress}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    localBusinessStreetAddress: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="localBusinessAddressLocality">
              {labels.seo.localBusinessAddressLocality}
            </Label>
            <Input
              id="localBusinessAddressLocality"
              value={values.seo.localBusinessAddressLocality}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    localBusinessAddressLocality: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="localBusinessPostalCode">
              {labels.seo.localBusinessPostalCode}
            </Label>
            <Input
              id="localBusinessPostalCode"
              value={values.seo.localBusinessPostalCode}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    localBusinessPostalCode: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="localBusinessAreaServed">
              {labels.seo.localBusinessAreaServed}
            </Label>
            <Input
              id="localBusinessAreaServed"
              value={values.seo.localBusinessAreaServed}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    localBusinessAreaServed: event.target.value,
                  },
                }))
              }
            />
          </div>
        </div>
      ) : null}

      {activeTab === "tracking" ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{labels.tracking.publicIdsNote}</p>
          <p className="text-sm text-muted-foreground">{labels.secretsNote}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="consentMode">{labels.tracking.consentMode}</Label>
              <select
                id="consentMode"
                value={values.tracking.consentMode}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    tracking: {
                      ...current.tracking,
                      consentMode: event.target.value as typeof values.tracking.consentMode,
                    },
                  }))
                }
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                )}
              >
                <option value="implied">{labels.tracking.consentImplied}</option>
                <option value="explicit">{labels.tracking.consentExplicit}</option>
                <option value="disabled">{labels.tracking.consentDisabled}</option>
              </select>
            </div>
            <CheckboxField
              id="requireConsentBeforeScripts"
              label={labels.tracking.requireConsentBeforeScripts}
              checked={values.tracking.requireConsentBeforeScripts}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  tracking: {
                    ...current.tracking,
                    requireConsentBeforeScripts: checked,
                  },
                }))
              }
            />
            <CheckboxField
              id="showConsentBanner"
              label={labels.tracking.showConsentBanner}
              checked={values.tracking.showConsentBanner}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  tracking: {
                    ...current.tracking,
                    showConsentBanner: checked,
                  },
                }))
              }
            />
          </div>
        </div>
      ) : null}

      {activeTab === "email" ? (
        <div className="space-y-5">
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {labels.email.note}
          </p>
          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
            {labels.email.securityNote}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <CheckboxField
              id="emailNotificationsEnabled"
              label={labels.email.emailNotificationsEnabled}
              checked={values.features.emailNotificationsEnabled}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  features: {
                    ...current.features,
                    emailNotificationsEnabled: checked,
                  },
                }))
              }
            />
            <CheckboxField
              id="applicationSubmissionEmailsEnabled"
              label={labels.email.applicationSubmissionEmailsEnabled}
              checked={values.features.applicationSubmissionEmailsEnabled}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  features: {
                    ...current.features,
                    applicationSubmissionEmailsEnabled: checked,
                  },
                }))
              }
            />
            <CheckboxField
              id="applicationStatusEmailsEnabled"
              label={labels.email.applicationStatusEmailsEnabled}
              checked={values.features.applicationStatusEmailsEnabled}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  features: {
                    ...current.features,
                    applicationStatusEmailsEnabled: checked,
                  },
                }))
              }
            />
            <CheckboxField
              id="invoicePaymentEmailsEnabled"
              label={labels.email.invoicePaymentEmailsEnabled}
              checked={values.features.invoicePaymentEmailsEnabled}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  features: {
                    ...current.features,
                    invoicePaymentEmailsEnabled: checked,
                  },
                }))
              }
            />
            <CheckboxField
              id="reviewDecisionEmailsEnabled"
              label={labels.email.reviewDecisionEmailsEnabled}
              checked={values.features.reviewDecisionEmailsEnabled}
              onChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  features: {
                    ...current.features,
                    reviewDecisionEmailsEnabled: checked,
                  },
                }))
              }
            />
          </div>
        </div>
      ) : null}

      {activeTab === "features" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <CheckboxField
            id="agentModuleEnabled"
            label={labels.features.agentModuleEnabled}
            checked={values.features.agentModuleEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                features: { ...current.features, agentModuleEnabled: checked },
              }))
            }
          />
          <CheckboxField
            id="blogEnabled"
            label={labels.features.blogEnabled}
            checked={values.features.blogEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                features: { ...current.features, blogEnabled: checked },
              }))
            }
          />
          <CheckboxField
            id="reviewsEnabled"
            label={labels.features.reviewsEnabled}
            checked={values.features.reviewsEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                features: { ...current.features, reviewsEnabled: checked },
              }))
            }
          />
          <CheckboxField
            id="contactFormEnabled"
            label={labels.features.contactFormEnabled}
            checked={values.features.contactFormEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                features: { ...current.features, contactFormEnabled: checked },
              }))
            }
          />
          <CheckboxField
            id="submitRequestEnabled"
            label={labels.features.submitRequestEnabled}
            checked={values.features.submitRequestEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                features: { ...current.features, submitRequestEnabled: checked },
              }))
            }
          />
          <CheckboxField
            id="floatingWhatsappEnabled"
            label={labels.features.floatingWhatsappEnabled}
            checked={values.features.floatingWhatsappEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                features: {
                  ...current.features,
                  floatingWhatsappEnabled: checked,
                },
              }))
            }
          />
          <CheckboxField
            id="whatsappChannelEnabled"
            label={labels.features.whatsappChannelEnabled}
            checked={values.features.whatsappChannelEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                features: {
                  ...current.features,
                  whatsappChannelEnabled: checked,
                },
              }))
            }
          />
          <CheckboxField
            id="whatsappNotificationsEnabled"
            label={labels.features.whatsappNotificationsEnabled}
            checked={values.features.whatsappNotificationsEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                features: {
                  ...current.features,
                  whatsappNotificationsEnabled: checked,
                },
              }))
            }
          />
          <CheckboxField
            id="smsFallbackEnabled"
            label={labels.features.smsFallbackEnabled}
            checked={values.features.smsFallbackEnabled}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                features: { ...current.features, smsFallbackEnabled: checked },
              }))
            }
          />
          <CheckboxField
            id="maintenanceMode"
            label={labels.features.maintenanceMode}
            checked={values.features.maintenanceMode}
            onChange={(checked) =>
              setValues((current) => ({
                ...current,
                features: { ...current.features, maintenanceMode: checked },
              }))
            }
          />
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="maintenanceMessageEn">
              {labels.features.maintenanceMessageEn}
            </Label>
            <Textarea
              id="maintenanceMessageEn"
              rows={2}
              value={values.features.maintenanceMessageEn}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  features: {
                    ...current.features,
                    maintenanceMessageEn: event.target.value,
                  },
                }))
              }
            />
          </div>
          
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-green-600 dark:text-green-400" role="status">
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
