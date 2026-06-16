import "server-only";

import { unstable_cache } from "next/cache";

import {
  defaultBrandingSettings,
  defaultBusinessSettings,
  defaultFeatureFlagSettings,
  defaultFormsSettings,
  defaultPaymentSettings,
  defaultPublicUiSettings,
  defaultSeoSettings,
  defaultTrackingSettings,
} from "@/features/settings/lib/defaults";
import {
  PUBLIC_SETTINGS_CACHE_TAG,
  SETTINGS_KEYS,
} from "@/features/settings/lib/keys";
import { mergeLegacyBusinessSettings } from "@/features/settings/lib/merge-legacy";
import { normalizeBusinessSettings } from "@/features/settings/lib/resolve-public-contact";
import type {
  BrandingSettings,
  BusinessSettings,
  FeatureFlagSettings,
  FormsSettings,
  PaymentSettings,
  PublicSettingsSnapshot,
  PublicUiSettings,
  SeoSettings,
  TrackingSettings,
} from "@/features/settings/types";
import { settingsRepository } from "@/server/repositories/settings-repository";

function mergeWithDefaults<T extends Record<string, unknown>>(
  defaults: T,
  stored: Partial<T> | null,
): T {
  if (!stored) {
    return defaults;
  }

  return { ...defaults, ...stored };
}

const PUBLIC_SETTINGS_LOOKUP_KEYS = [
  SETTINGS_KEYS.business,
  SETTINGS_KEYS.publicUi,
  SETTINGS_KEYS.forms,
  SETTINGS_KEYS.branding,
  SETTINGS_KEYS.payment,
  SETTINGS_KEYS.seo,
  SETTINGS_KEYS.tracking,
  SETTINGS_KEYS.features,
  "site",
  "whatsapp",
] as const;

async function loadPublicSettingsSnapshot(): Promise<PublicSettingsSnapshot> {
  const stored = await settingsRepository.getValuesByKeys(
    PUBLIC_SETTINGS_LOOKUP_KEYS,
  );

  const businessRaw = stored[SETTINGS_KEYS.business] as
    | Partial<BusinessSettings>
    | undefined;
  const publicUiRaw = stored[SETTINGS_KEYS.publicUi] as
    | Partial<PublicUiSettings>
    | undefined;
  const formsRaw = stored[SETTINGS_KEYS.forms] as
    | Partial<FormsSettings>
    | undefined;
  const brandingRaw = stored[SETTINGS_KEYS.branding] as
    | Partial<BrandingSettings>
    | undefined;
  const paymentRaw = stored[SETTINGS_KEYS.payment] as
    | Partial<PaymentSettings>
    | undefined;
  const seoRaw = stored[SETTINGS_KEYS.seo] as Partial<SeoSettings> | undefined;
  const trackingRaw = stored[SETTINGS_KEYS.tracking] as
    | Partial<TrackingSettings>
    | undefined;
  const featuresRaw = stored[SETTINGS_KEYS.features] as
    | Partial<FeatureFlagSettings>
    | undefined;
  const legacySite = stored.site as
    | {
        supportEmail?: string;
        supportPhone?: string;
        businessHoursEn?: string;
        businessHoursUr?: string;
      }
    | undefined;
  const legacyWhatsapp = stored.whatsapp as
    | {
        phoneNumber?: string;
        defaultMessage?: string;
      }
    | undefined;

  const paymentDefaults = defaultPaymentSettings();
  const paymentMerged = mergeWithDefaults(paymentDefaults, paymentRaw ?? null);

  return {
    business: mergeLegacyBusinessSettings({
      stored: businessRaw ?? null,
      legacySite: legacySite ?? null,
      legacyWhatsapp: legacyWhatsapp ?? null,
    }),
    publicUi: mergeWithDefaults(defaultPublicUiSettings(), publicUiRaw ?? null),
    forms: mergeWithDefaults(defaultFormsSettings(), formsRaw ?? null),
    branding: mergeWithDefaults(defaultBrandingSettings(), brandingRaw ?? null),
    payment: {
      ...paymentMerged,
      paymentMethods:
        paymentRaw?.paymentMethods && paymentRaw.paymentMethods.length > 0
          ? paymentRaw.paymentMethods
          : paymentDefaults.paymentMethods,
    },
    seo: mergeWithDefaults(defaultSeoSettings(), seoRaw ?? null),
    tracking: mergeWithDefaults(defaultTrackingSettings(), trackingRaw ?? null),
    features: mergeWithDefaults(
      defaultFeatureFlagSettings(),
      featuresRaw ?? null,
    ),
  };
}

const getCachedPublicSettings = unstable_cache(
  loadPublicSettingsSnapshot,
  ["public-settings-snapshot"],
  {
    tags: [PUBLIC_SETTINGS_CACHE_TAG],
    revalidate: 300,
  },
);

export async function getPublicSettings(): Promise<PublicSettingsSnapshot> {
  return getCachedPublicSettings();
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const settings = await getPublicSettings();
  return normalizeBusinessSettings(settings.business);
}

export async function getPublicUiSettings(): Promise<PublicUiSettings> {
  const settings = await getPublicSettings();
  return settings.publicUi;
}

export async function getFormsSettings(): Promise<FormsSettings> {
  const settings = await getPublicSettings();
  return settings.forms;
}

export async function getBrandingSettings(): Promise<BrandingSettings> {
  const settings = await getPublicSettings();
  return settings.branding;
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const settings = await getPublicSettings();
  return settings.payment;
}

export async function getSeoSettings(): Promise<SeoSettings> {
  const settings = await getPublicSettings();
  return settings.seo;
}

export async function getTrackingSettings(): Promise<TrackingSettings> {
  const settings = await getPublicSettings();
  return settings.tracking;
}

export async function getFeatureFlagSettings(): Promise<FeatureFlagSettings> {
  const settings = await getPublicSettings();
  return settings.features;
}

export function resolvePublicTrackingId(
  dbValue: string | undefined,
  envValue: string | undefined,
): string | undefined {
  const fromDb = dbValue?.trim();
  if (fromDb) {
    return fromDb;
  }

  const fromEnv = envValue?.trim();
  return fromEnv || undefined;
}
