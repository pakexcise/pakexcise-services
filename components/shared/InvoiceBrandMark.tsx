"use client";

import Image from "next/image";

import { useBranding } from "@/components/shared/branding-context";
import { brandingAssets, getBrandDisplayName } from "@/config/branding";
import { cn } from "@/lib/utils";

type InvoiceBrandMarkProps = {
  className?: string;
  iconClassName?: string;
  nameClassName?: string;
  iconSize?: number;
  logoIconPath?: string | null;
  siteName?: string | null;
};

export function InvoiceBrandMark({
  className,
  iconClassName,
  nameClassName,
  iconSize = 40,
  logoIconPath,
  siteName,
}: InvoiceBrandMarkProps) {
  const branding = useBranding();
  const iconSrc =
    logoIconPath?.trim() || branding.logoIconPath || brandingAssets.logoIcon;
  const displayName = getBrandDisplayName(siteName ?? branding.siteName);

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src={iconSrc}
        alt={displayName}
        width={iconSize}
        height={iconSize}
        unoptimized
        className={cn("shrink-0 rounded-lg shadow-sm", iconClassName)}
        priority
      />
      <span
        className={cn(
          "text-base font-bold tracking-tight text-white sm:text-lg",
          nameClassName,
        )}
      >
        {displayName}
      </span>
    </div>
  );
}
