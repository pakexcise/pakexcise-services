import "server-only";

import { Repository } from "@/server/repositories/base/repository";

export class SettingsRepository extends Repository {
  async getValue<T>(key: string): Promise<T | null> {
    const setting = await this.db.setting.findUnique({
      where: { key },
      select: { value: true },
    });

    if (!setting) {
      return null;
    }

    return setting.value as T;
  }

  async setValue(key: string, value: unknown) {
    return this.db.setting.upsert({
      where: { key },
      update: { value: value as never },
      create: { key, value: value as never },
    });
  }
}

export const settingsRepository = new SettingsRepository();

export async function getSettingValue<T>(key: string): Promise<T | null> {
  return settingsRepository.getValue<T>(key);
}
