import "server-only";

import { unstable_cache } from "next/cache";

import {
  defaultFeatureFlagSettings,
  defaultPaymentSettings,
  defaultSeoSettings,
  defaultTrackingSettings,
} from "@/features/settings/lib/defaults";
import {
  PUBLIC_SETTINGS_CACHE_TAG,
  SETTINGS_KEYS,
} from "@/features/settings/lib/keys";
import { mergeLegacyBusinessSettings } from "@/features/settings/lib/merge-legacy";
import type {
  BusinessSettings,
  FeatureFlagSettings,
  PaymentSettings,
  PublicSettingsSnapshot,
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

async function loadPublicSettingsSnapshot(): Promise<PublicSettingsSnapshot> {
  const [
    businessRaw,
    paymentRaw,
    seoRaw,
    trackingRaw,
    featuresRaw,
    legacySite,
    legacyWhatsapp,
  ] = await Promise.all([
    settingsRepository.getValue<Partial<BusinessSettings>>(SETTINGS_KEYS.business),
    settingsRepository.getValue<Partial<PaymentSettings>>(SETTINGS_KEYS.payment),
    settingsRepository.getValue<Partial<SeoSettings>>(SETTINGS_KEYS.seo),
    settingsRepository.getValue<Partial<TrackingSettings>>(SETTINGS_KEYS.tracking),
    settingsRepository.getValue<Partial<FeatureFlagSettings>>(SETTINGS_KEYS.features),
    settingsRepository.getValue<{
      supportEmail?: string;
      supportPhone?: string;
      businessHoursEn?: string;
      businessHoursUr?: string;
    }>("site"),
    settingsRepository.getValue<{
      phoneNumber?: string;
      defaultMessage?: string;
    }>("whatsapp"),
  ]);

  return {
    business: mergeLegacyBusinessSettings({
      stored: businessRaw,
      legacySite,
      legacyWhatsapp,
    }),
    payment: mergeWithDefaults(defaultPaymentSettings(), paymentRaw),
    seo: mergeWithDefaults(defaultSeoSettings(), seoRaw),
    tracking: mergeWithDefaults(defaultTrackingSettings(), trackingRaw),
    features: mergeWithDefaults(defaultFeatureFlagSettings(), featuresRaw),
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
  return settings.business;
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
