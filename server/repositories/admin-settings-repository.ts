import "server-only";

import { SETTINGS_KEYS } from "@/features/settings/lib/keys";
import { getPublicSettings } from "@/features/settings/lib/public-settings-cache";
import type { AdminSettingsSnapshot } from "@/features/settings/types";
import { settingsRepository } from "@/server/repositories/settings-repository";

export async function loadAdminSettingsSnapshot(): Promise<AdminSettingsSnapshot> {
  return getPublicSettings();
}

export async function saveSettingsGroup<T extends Record<string, unknown>>(
  group: keyof typeof SETTINGS_KEYS,
  value: T,
): Promise<void> {
  await settingsRepository.setValue(SETTINGS_KEYS[group], value);
}
