import "server-only";

import { brandingAssets } from "@/config/branding";
import { getPublicAppUrl } from "@/config/env.shared";
import { getPublicSettings } from "@/features/settings/lib/public-settings-cache";
import { absoluteUrl } from "@/lib/utils";

export type EmailBranding = {
  siteName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  disclaimer: string;
  supportEmail: string;
  siteUrl: string;
};

function resolveEmailLogoPath(logoPath: string): string {
  const trimmed = logoPath.trim();

  if (!trimmed) {
    return brandingAssets.logo;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return brandingAssets.logo;
}

export async function getEmailBranding(): Promise<EmailBranding> {
  const settings = await getPublicSettings();
  const siteUrl = getPublicAppUrl();
  const logoPath = resolveEmailLogoPath(settings.branding.logoPath);

  return {
    siteName: settings.business.siteName,
    logoUrl: /^https?:\/\//i.test(logoPath)
      ? logoPath
      : absoluteUrl(logoPath),
    primaryColor: settings.branding.primaryBrandColor,
    secondaryColor: settings.branding.secondaryBrandColor,
    disclaimer: settings.business.disclaimerEn,
    supportEmail: settings.business.businessEmail,
    siteUrl,
  };
}
