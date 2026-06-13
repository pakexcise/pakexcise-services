import { siteConfig } from "@/config/site";

export const brandDisplayName = siteConfig.name.replace(/\.com$/i, "");

export const brandingAssets = {
  logo: "/branding/logo.png",
  logoDark: "/branding/logo-dark.png",
  logoIcon: "/branding/logo-icon.png",
  favicon: "/branding/favicon.png",
  appleIcon: "/branding/apple-icon.png",
  ogEn: "/branding/og-en.png",
  ogUr: "/branding/og-ur.png",
} as const;

export function getDefaultOgImagePath(locale: string): string {
  return locale === "ur" ? brandingAssets.ogUr : brandingAssets.ogEn;
}
