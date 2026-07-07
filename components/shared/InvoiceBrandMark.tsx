"use client";

import Image from "next/image";

import { useBranding } from "@/components/shared/branding-context";
import { brandingAssets, getBrandDisplayName } from "@/config/branding";
import { cn } from "@/lib/utils";
import { LOGO_ICON_INTRINSIC_SIZE } from "@/lib/styles/logo-sizes";

type InvoiceBrandMarkProps = {
  className?: string;
  iconClassName?: string;
  nameClassName?: string;
  logoIconPath?: string | null;
  siteName?: string | null;
};

export function InvoiceBrandMark({
  className,
  iconClassName,
  nameClassName,
  logoIconPath,
  siteName,
}: InvoiceBrandMarkProps) {
  const branding = useBranding();
  const iconSrc =
    logoIconPath?.trim() || branding.logoIconPath || brandingAssets.logoIcon;
  const displayName = getBrandDisplayName(siteName ?? branding.siteName);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src={iconSrc}
        alt={displayName}
        width={LOGO_ICON_INTRINSIC_SIZE}
        height={LOGO_ICON_INTRINSIC_SIZE}
        unoptimized
        className={cn(
          "size-12 shrink-0 rounded-lg object-contain shadow-sm sm:size-14",
          iconClassName,
        )}
        priority
      />
      <span
        className={cn(
          "text-lg font-bold tracking-tight text-white sm:text-xl",
          nameClassName,
        )}
      >
        {displayName}
      </span>
    </div>
  );
}
