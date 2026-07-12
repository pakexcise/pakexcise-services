/**
 * English UI copy helpers (no i18n runtime).
 * Drop-in replacements for former next-intl getTranslations / useTranslations.
 */
import { createT, type TFunction } from "@/messages";

export type { TFunction };

type GetTranslationsInput =
  | string
  | {
      locale?: string;
      namespace: string;
    };

/** Server-side English copy accessor. */
export async function getTranslations(
  namespaceOrOptions: GetTranslationsInput,
): Promise<TFunction> {
  const namespace =
    typeof namespaceOrOptions === "string"
      ? namespaceOrOptions
      : namespaceOrOptions.namespace;
  return createT(namespace);
}

/** Client-side English copy accessor. */
export function useTranslations(namespace: string): TFunction {
  return createT(namespace);
}
