import type {
  BusinessSettings,
  FeatureFlagSettings,
  PaymentSettings,
  SeoSettings,
  TrackingSettings,
} from "@/features/settings/types";

type AuditSnapshot = Record<string, unknown>;

export function businessSettingsSnapshot(value: BusinessSettings): AuditSnapshot {
  return { ...value };
}

export function paymentSettingsSnapshot(value: PaymentSettings): AuditSnapshot {
  return { ...value };
}

export function seoSettingsSnapshot(value: SeoSettings): AuditSnapshot {
  return { ...value };
}

export function trackingSettingsSnapshot(value: TrackingSettings): AuditSnapshot {
  return { ...value };
}

export function featureFlagSettingsSnapshot(
  value: FeatureFlagSettings,
): AuditSnapshot {
  return { ...value };
}
