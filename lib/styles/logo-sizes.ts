/** Intrinsic dimensions of full horizontal logos in public/branding (512×165). */
export const FULL_LOGO_INTRINSIC_WIDTH = 512;
export const FULL_LOGO_INTRINSIC_HEIGHT = 165;

/** Intrinsic dimensions of square logo icon in public/branding (192×192). */
export const LOGO_ICON_INTRINSIC_SIZE = 192;

export type SiteLogoSize =
  | "header"
  | "footer"
  | "auth"
  | "portal"
  | "admin"
  | "icon"
  | "iconLarge";

export const siteLogoSizeClasses: Record<SiteLogoSize, string> = {
  header:
    "h-11 w-auto max-w-[min(100%,13.5rem)] object-contain object-left sm:h-12 sm:max-w-[16.25rem]",
  footer:
    "h-12 w-auto max-w-[min(100%,14.5rem)] object-contain object-left sm:h-14 sm:max-w-[17.5rem]",
  auth: "h-14 w-auto max-w-[min(100%,17.5rem)] object-contain object-left sm:h-16 sm:max-w-[20rem]",
  portal:
    "h-9 w-auto max-w-[10.5rem] object-contain object-left sm:h-10 sm:max-w-[12rem]",
  admin:
    "h-10 w-auto max-w-[12rem] object-contain object-left sm:h-11 sm:max-w-[13.5rem]",
  icon: "size-12 object-contain sm:size-14",
  iconLarge: "size-20 object-contain sm:size-24",
};

export const siteLogoDefaultSize: Record<
  "full" | "icon" | "onPrimary",
  SiteLogoSize
> = {
  full: "header",
  icon: "icon",
  onPrimary: "header",
};

/** Match displayed CSS max widths so next/image does not request 1080w logos. */
export const siteLogoSizesAttr: Record<SiteLogoSize, string> = {
  header: "(max-width: 640px) 216px, 260px",
  footer: "(max-width: 640px) 232px, 280px",
  auth: "(max-width: 640px) 280px, 320px",
  portal: "(max-width: 640px) 168px, 192px",
  admin: "(max-width: 640px) 192px, 216px",
  icon: "56px",
  iconLarge: "96px",
};
