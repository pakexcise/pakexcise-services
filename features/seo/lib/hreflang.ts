import { absoluteUrl, publicPath } from "@/lib/utils";

export function buildHreflangAlternates(path: string): Record<string, string> {
  const canonical = absoluteUrl(publicPath(path));

  return {
    en: canonical,
    ur: canonical,
    "x-default": canonical,
  };
}
