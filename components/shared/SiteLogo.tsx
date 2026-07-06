"use client";

import Image from "next/image";

import { useBranding } from "@/components/shared/branding-context";
import { brandingAssets, getBrandDisplayName } from "@/config/branding";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  variant?: "full" | "icon" | "onPrimary";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  logoPath?: string | null;
  logoDarkPath?: string | null;
  footerLogoPath?: string | null;
  logoIconPath?: string | null;
  siteName?: string | null;
};

export function SiteLogo({
  variant = "full",
  className,
  imageClassName,
  priority = false,
  logoPath,
  logoDarkPath,
  footerLogoPath,
  logoIconPath,
  siteName,
}: SiteLogoProps) {
  const branding = useBranding();

  const lightLogo = logoPath?.trim() || branding.logoPath || brandingAssets.logo;
  const darkLogo =
    logoDarkPath?.trim() || branding.logoDarkPath || brandingAssets.logoDark;
  const footerLogo = footerLogoPath?.trim() || branding.footerLogoPath || lightLogo;
  const iconLogo =
    logoIconPath?.trim() || branding.logoIconPath || brandingAssets.logoIcon;
  const altName = getBrandDisplayName(siteName ?? branding.siteName);

  if (variant === "icon") {
    return (
      <Image
        src={iconLogo}
        alt={altName}
        width={48}
        height={48}
        unoptimized
        className={cn("h-10 w-10", imageClassName, className)}
        priority={priority}
      />
    );
  }

  if (variant === "onPrimary") {
    return (
      <Image
        src={darkLogo}
        alt={altName}
        width={220}
        height={52}
        unoptimized
        className={cn(
          "h-8 w-auto max-w-full object-contain object-left",
          imageClassName,
          className,
        )}
        priority={priority}
      />
    );
  }

  return (
    <span className={cn("relative inline-flex max-w-full items-center", className)}>
      <Image
        src={footerLogoPath ? footerLogo : lightLogo}
        alt={altName}
        width={220}
        height={52}
        unoptimized
        className={cn(
          "h-8 w-auto max-w-full object-contain object-left sm:h-10 dark:hidden",
          imageClassName,
        )}
        priority={priority}
      />
      <Image
        src={darkLogo}
        alt={altName}
        width={220}
        height={52}
        unoptimized
        className={cn(
          "hidden h-8 w-auto max-w-full object-contain object-left sm:h-10 dark:block",
          imageClassName,
        )}
        priority={priority}
      />
    </span>
  );
}
