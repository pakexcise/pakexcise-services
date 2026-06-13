import Image from "next/image";

import { brandingAssets, brandDisplayName } from "@/config/branding";
import { cn } from "@/lib/utils";

type InvoiceBrandMarkProps = {
  className?: string;
  iconClassName?: string;
  nameClassName?: string;
  iconSize?: number;
};

export function InvoiceBrandMark({
  className,
  iconClassName,
  nameClassName,
  iconSize = 40,
}: InvoiceBrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src={brandingAssets.logoIcon}
        alt={brandDisplayName}
        width={iconSize}
        height={iconSize}
        unoptimized
        className={cn("shrink-0 rounded-lg shadow-sm", iconClassName)}
        priority
      />
      <span className={cn("text-base font-bold tracking-tight text-white sm:text-lg", nameClassName)}>
        {brandDisplayName}
      </span>
    </div>
  );
}
