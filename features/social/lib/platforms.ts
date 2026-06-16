export const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook", iconName: "Facebook" },
  { id: "instagram", label: "Instagram", iconName: "Instagram" },
  { id: "tiktok", label: "TikTok", iconName: "Music2" },
  { id: "youtube", label: "YouTube", iconName: "Youtube" },
  { id: "linkedin", label: "LinkedIn", iconName: "Linkedin" },
  { id: "x", label: "X / Twitter", iconName: "Twitter" },
  { id: "whatsapp-chat", label: "WhatsApp Chat", iconName: "MessageCircle" },
  {
    id: "whatsapp-channel",
    label: "WhatsApp Channel",
    iconName: "MessageCircle",
  },
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORMS)[number]["id"];

export function getSocialPlatformIcon(platform: string): string {
  const match = SOCIAL_PLATFORMS.find((item) => item.id === platform);
  return match?.iconName ?? "Link";
}

export function getSocialPlatformLabel(platform: string): string {
  const match = SOCIAL_PLATFORMS.find((item) => item.id === platform);
  return match?.label ?? platform;
}

export function isKnownSocialPlatform(platform: string): boolean {
  return SOCIAL_PLATFORMS.some((item) => item.id === platform);
}
