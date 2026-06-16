import "server-only";

import { defaultBrandingSettings } from "@/features/settings/lib/defaults";
import type { BrandingSettings } from "@/features/settings/types";
import {
  getContrastForeground,
  mixHexWithBlack,
  mixHexWithWhite,
  normalizeHexColor,
} from "@/lib/colors/hex";

export function resolveBrandColors(branding: BrandingSettings): {
  primary: string;
  secondary: string;
} {
  const defaults = defaultBrandingSettings();

  return {
    primary: normalizeHexColor(
      branding.primaryBrandColor?.trim() || defaults.primaryBrandColor,
    ),
    secondary: normalizeHexColor(
      branding.secondaryBrandColor?.trim() || defaults.secondaryBrandColor,
    ),
  };
}

export function buildBrandThemeCss(branding: BrandingSettings): string {
  const { primary, secondary } = resolveBrandColors(branding);

  const primaryForeground = getContrastForeground(primary);
  const secondaryForeground = getContrastForeground(secondary);
  const primaryDark = mixHexWithWhite(primary, 0.18);
  const secondaryDark = mixHexWithWhite(secondary, 0.12);
  const accentLight = mixHexWithWhite(primary, 0.92);
  const accentDark = mixHexWithBlack(primary, 0.72);
  const accentForegroundLight = mixHexWithBlack(primary, 0.55);
  const sidebarAccentLight = mixHexWithWhite(primary, 0.94);
  const sidebarAccentDark = mixHexWithBlack(primary, 0.78);

  return `
html[data-brand-theme] {
  --primary: ${primary};
  --primary-foreground: ${primaryForeground};
  --secondary: ${secondary};
  --secondary-foreground: ${secondaryForeground};
  --ring: ${primary};
  --accent: ${accentLight};
  --accent-foreground: ${accentForegroundLight};
  --chart-1: ${primary};
  --chart-2: ${secondary};
  --sidebar-primary: ${primary};
  --sidebar-primary-foreground: ${primaryForeground};
  --sidebar-accent: ${sidebarAccentLight};
  --sidebar-accent-foreground: ${accentForegroundLight};
  --sidebar-ring: ${primary};
}

html.dark[data-brand-theme] {
  --primary: ${primaryDark};
  --primary-foreground: ${primaryForeground};
  --secondary: ${secondaryDark};
  --secondary-foreground: ${secondaryForeground};
  --ring: ${primaryDark};
  --accent: ${accentDark};
  --accent-foreground: ${primaryForeground};
  --chart-1: ${primaryDark};
  --chart-2: ${secondaryDark};
  --sidebar-primary: ${primaryDark};
  --sidebar-primary-foreground: ${primaryForeground};
  --sidebar-accent: ${sidebarAccentDark};
  --sidebar-accent-foreground: ${primaryForeground};
  --sidebar-ring: ${primaryDark};
}
`.trim();
}
