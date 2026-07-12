import type { PublicSocialLink } from "@/components/marketing/social-links";

const WHATSAPP_CHAT_PLATFORMS = new Set(["whatsapp-chat", "whatsapp"]);
const WHATSAPP_CHANNEL_PLATFORMS = new Set(["whatsapp-channel"]);

type ResolveFooterSocialLinksInput = {
  links: PublicSocialLink[];
  whatsappChatHref: string;
  whatsappChannelUrl: string;
  showWhatsappChannel: boolean;
  channelLabelEn: string;
};

function isWhatsappPlatform(platform: string): boolean {
  const normalized = platform.toLowerCase();
  return (
    WHATSAPP_CHAT_PLATFORMS.has(normalized) ||
    WHATSAPP_CHANNEL_PLATFORMS.has(normalized)
  );
}

export function resolveFooterSocialLinks({
  links,
  whatsappChatHref,
  whatsappChannelUrl,
  showWhatsappChannel,
  channelLabelEn,
}: ResolveFooterSocialLinksInput): PublicSocialLink[] {
  const useChannelOnWhatsappIcon =
    showWhatsappChannel && whatsappChannelUrl.trim().length > 0;

  let chatIconUsesChannel = false;

  const resolved = links.map((link) => {
    const platform = link.platform.toLowerCase();

    if (WHATSAPP_CHANNEL_PLATFORMS.has(platform) && useChannelOnWhatsappIcon) {
      return {
        ...link,
        url: whatsappChannelUrl,
        labelEn: channelLabelEn || link.labelEn,
      };
    }

    if (WHATSAPP_CHAT_PLATFORMS.has(platform)) {
      if (useChannelOnWhatsappIcon) {
        chatIconUsesChannel = true;
        return {
          ...link,
          url: whatsappChannelUrl,
          labelEn: channelLabelEn || link.labelEn,
        };
      }

      if (whatsappChatHref) {
        return { ...link, url: whatsappChatHref };
      }
    }

    return link;
  });

  const hasWhatsappIcon = resolved.some((link) => isWhatsappPlatform(link.platform));

  if (!hasWhatsappIcon && useChannelOnWhatsappIcon) {
    resolved.push({
      id: "footer-whatsapp-channel",
      platform: "whatsapp-channel",
      labelEn: channelLabelEn,
      url: whatsappChannelUrl,
      iconName: "MessageCircle",
    });
  }

  if (chatIconUsesChannel) {
    return resolved.filter(
      (link) => !WHATSAPP_CHANNEL_PLATFORMS.has(link.platform.toLowerCase()),
    );
  }

  return resolved;
}
