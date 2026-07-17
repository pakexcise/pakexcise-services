"use client";

import Image from "next/image";

import { useBranding } from "@/components/shared/branding-context";
import { brandingAssets, getBrandDisplayName } from "@/config/branding";
import { cn } from "@/lib/utils";
import {
  FULL_LOGO_INTRINSIC_HEIGHT,
  FULL_LOGO_INTRINSIC_WIDTH,
  LOGO_ICON_INTRINSIC_SIZE,
  siteLogoDefaultSize,
  siteLogoSizeClasses,
  type SiteLogoSize,
} from "@/lib/styles/logo-sizes";

function isRemoteImageSrc(src: string): boolean {
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("//") ||
    src.startsWith("data:")
  );
}

type SiteLogoProps = {
  variant?: "full" | "icon" | "onPrimary";
  size?: SiteLogoSize;
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
  size,
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
  const resolvedSize = size ?? siteLogoDefaultSize[variant];
  const sizeClassName = siteLogoSizeClasses[resolvedSize];

  if (variant === "icon") {
    return (
      <Image
        src={iconLogo}
        alt={altName}
        width={LOGO_ICON_INTRINSIC_SIZE}
        height={LOGO_ICON_INTRINSIC_SIZE}
        unoptimized={isRemoteImageSrc(iconLogo)}
        className={cn(sizeClassName, imageClassName, className)}
        priority={priority}
      />
    );
  }

  if (variant === "onPrimary") {
    return (
      <Image
        src={darkLogo}
        alt={altName}
        width={FULL_LOGO_INTRINSIC_WIDTH}
        height={FULL_LOGO_INTRINSIC_HEIGHT}
        unoptimized={isRemoteImageSrc(darkLogo)}
        className={cn(sizeClassName, imageClassName, className)}
        priority={priority}
      />
    );
  }

  const primaryLogo = footerLogoPath ? footerLogo : lightLogo;

  return (
    <span className={cn("relative inline-flex max-w-full items-center", className)}>
      <Image
        src={primaryLogo}
        alt={altName}
        width={FULL_LOGO_INTRINSIC_WIDTH}
        height={FULL_LOGO_INTRINSIC_HEIGHT}
        unoptimized={isRemoteImageSrc(primaryLogo)}
        className={cn(sizeClassName, "dark:hidden", imageClassName)}
        priority={priority}
      />
      <Image
        src={darkLogo}
        alt={altName}
        width={FULL_LOGO_INTRINSIC_WIDTH}
        height={FULL_LOGO_INTRINSIC_HEIGHT}
        unoptimized={isRemoteImageSrc(darkLogo)}
        className={cn(sizeClassName, "hidden dark:block", imageClassName)}
        priority={priority}
      />
    </span>
  );
}
