import type { SVGProps } from "react";

import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

type BrandSocialIconProps = SVGProps<SVGSVGElement> & {
  platform: string;
};

export function BrandSocialIcon({
  platform,
  className,
  ...props
}: BrandSocialIconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true as const,
    ...props,
  };

  switch (platform.toLowerCase()) {
    case "facebook":
      return (
        <svg {...common}>
          <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.3V12h2.3V9.8c0-2.3 1.4-3.6 3.5-3.6 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.4l-.4 2.9h-2v7A10 10 0 0 0 22 12Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5ZM17.8 6.2a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M16.5 3h-2.7c.2 1.8 1.2 3.4 2.8 4.3v2.5a6.8 6.8 0 0 1-3.4-.9v6.8a5.4 5.4 0 1 1-5.4-5.4c.1 0 .3 0 .4.1v2.8a2.6 2.6 0 1 0 1.8 2.5V3Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C6 18.9 12 19 12 19s6 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M4.98 3.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM3 8.7h4v12H3v-12Zm7 0h3.8v1.6h.1c.5-1 1.8-2.1 3.7-2.1 4 0 4.7 2.6 4.7 6v6.5h-4v-5.8c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3v5.9H10V8.7Z" />
        </svg>
      );
    case "x":
    case "twitter":
      return (
        <svg {...common}>
          <path d="M16.9 3H20l-6.4 7.3L21 21h-6.2l-4.8-6.3L4.4 21H1.3l6.8-7.8L3 3h6.4l4.4 5.8L16.9 3Zm-1.1 16h1.7L7.9 4.9H6.1L15.8 19Z" />
        </svg>
      );
    case "whatsapp":
    case "whatsapp-chat":
    case "whatsapp-channel":
      return <WhatsAppIcon className={className} {...props} />;
    default:
      return null;
  }
}
