import { siteConfig } from "@/config/site";

export const brandDisplayName = siteConfig.name.replace(/\.com$/i, "");

export const brandingAssets = {
  logo: "/branding/logo.png",
  logoDark: "/branding/logo-dark.png",
  logoIcon: "/branding/logo-icon.png",
  favicon: "/branding/favicon.png",
  appleIcon: "/branding/apple-icon.png",
  ogEn: "/branding/og-en.png",
} as const;

/** @deprecated Use resolveDefaultOgImagePath from branding-resolvers with DB settings */
export function getDefaultOgImagePath(_locale?: string): string {
  return brandingAssets.ogEn;
}

export function getBrandDisplayName(siteName?: string | null): string {
  const trimmed = siteName?.trim();
  if (trimmed) {
    return trimmed.replace(/\.com$/i, "");
  }

  return brandDisplayName;
}
