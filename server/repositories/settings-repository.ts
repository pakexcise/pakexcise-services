import "server-only";

import { Repository } from "@/server/repositories/base/repository";

export class SettingsRepository extends Repository {
  async getValue<T>(key: string): Promise<T | null> {
    return this.query(async () => {
      const setting = await this.db.setting.findUnique({
        where: { key },
        select: { value: true },
      });

      if (!setting) {
        return null;
      }

      return setting.value as T;
    }, null);
  }

  async getValuesByKeys(
    keys: readonly string[],
  ): Promise<Record<string, unknown>> {
    if (keys.length === 0) {
      return {};
    }

    return this.query(async () => {
      const rows = await this.db.setting.findMany({
        where: { key: { in: [...keys] } },
        select: { key: true, value: true },
      });

      return Object.fromEntries(
        rows.map((row) => [row.key, row.value as unknown]),
      );
    }, {});
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
