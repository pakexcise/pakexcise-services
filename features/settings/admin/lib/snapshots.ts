import type {
  BusinessSettings,
  FeatureFlagSettings,
  PaymentSettings,
  SeoSettings,
  TrackingSettings,
} from "@/features/settings/types";

export function businessSettingsSnapshot(
  value: BusinessSettings,
): Record<string, string | boolean> {
  return { ...value };
}

export function paymentSettingsSnapshot(
  value: PaymentSettings,
): Record<string, string | boolean> {
  return { ...value };
}

export function seoSettingsSnapshot(
  value: SeoSettings,
): Record<string, string> {
  return { ...value };
}

export function trackingSettingsSnapshot(
  value: TrackingSettings,
): Record<string, string | boolean> {
  return { ...value };
}

export function featureFlagSettingsSnapshot(
  value: FeatureFlagSettings,
): Record<string, string | boolean> {
  return { ...value };
}
