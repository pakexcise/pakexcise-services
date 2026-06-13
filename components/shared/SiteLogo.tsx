import Image from "next/image";

import { brandingAssets } from "@/config/branding";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  variant?: "full" | "icon" | "onPrimary";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function SiteLogo({
  variant = "full",
  className,
  imageClassName,
  priority = false,
}: SiteLogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src={brandingAssets.logoIcon}
        alt="PakExcise"
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
        src={brandingAssets.logoDark}
        alt="PakExcise"
        width={220}
        height={52}
        unoptimized
        className={cn("h-8 w-auto max-w-full object-contain object-left", imageClassName, className)}
        priority={priority}
      />
    );
  }

  return (
    <span className={cn("relative inline-flex max-w-full items-center", className)}>
      <Image
        src={brandingAssets.logo}
        alt="PakExcise"
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
        src={brandingAssets.logoDark}
        alt="PakExcise"
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
