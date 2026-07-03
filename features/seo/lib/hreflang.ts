import { shouldAllowSearchIndexing } from "@/config/env.server";
import { seoAbsoluteUrl } from "@/lib/seo-url";
import { publicPath } from "@/lib/utils";

export function buildHreflangAlternates(
  path: string,
): Record<string, string> | undefined {
  if (!shouldAllowSearchIndexing()) {
    return undefined;
  }

  const canonical = seoAbsoluteUrl(publicPath(path));

  return {
    en: canonical,
    ur: canonical,
    "x-default": canonical,
  };
}
