/** Urdu brand name — always use this instead of "PakExcise" in Urdu content. */
export const URDU_BRAND_NAME = "پاک ایکسائز";

export function normalizeUrduBrandText(value: string | null | undefined): string {
  if (!value?.trim()) {
    return value?.trim() ?? "";
  }

  return value.replace(/PakExcise/g, URDU_BRAND_NAME);
}
