import "server-only";

import { brandingAssets } from "@/config/branding";
import type { BrandingSettings } from "@/features/settings/types";

export function resolveBrandingAssetPath(
  value: string | null | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

export function resolveLogoIconPath(branding: BrandingSettings): string {
  return resolveBrandingAssetPath(
    branding.logoIconPath,
    brandingAssets.logoIcon,
  );
}

export function resolveFaviconPath(branding: BrandingSettings): string {
  return resolveBrandingAssetPath(branding.faviconPath, brandingAssets.favicon);
}

export function resolveAppleIconPath(branding: BrandingSettings): string {
  return resolveBrandingAssetPath(
    branding.appleIconPath,
    brandingAssets.appleIcon,
  );
}

export function resolveDefaultOgImagePath(
  branding: BrandingSettings,
): string {
  return resolveBrandingAssetPath(
    branding.defaultOgImagePath,
    brandingAssets.ogEn,
  );
}

export function resolveDefaultTwitterImagePath(
  branding: BrandingSettings,
): string {
  return resolveBrandingAssetPath(
    branding.defaultTwitterImagePath,
    branding.defaultOgImagePath || brandingAssets.ogEn,
  );
}
