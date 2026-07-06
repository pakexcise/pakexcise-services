"use client";

import { createContext, useContext } from "react";

import { brandingAssets } from "@/config/branding";
import { siteConfig } from "@/config/site";

export type BrandingContextValue = {
  logoPath: string;
  logoDarkPath: string;
  footerLogoPath: string;
  logoIconPath: string;
  siteName: string;
};

const defaultBrandingContextValue: BrandingContextValue = {
  logoPath: brandingAssets.logo,
  logoDarkPath: brandingAssets.logoDark,
  footerLogoPath: brandingAssets.logo,
  logoIconPath: brandingAssets.logoIcon,
  siteName: siteConfig.name.replace(/\.com$/i, ""),
};

const BrandingContext = createContext<BrandingContextValue>(
  defaultBrandingContextValue,
);

type BrandingProviderProps = {
  value: BrandingContextValue;
  children: React.ReactNode;
};

export function BrandingProvider({ value, children }: BrandingProviderProps) {
  return (
    <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextValue {
  return useContext(BrandingContext);
}
