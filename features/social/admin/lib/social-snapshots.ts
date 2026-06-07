import type { AdminSocialLinkItem } from "@/server/repositories/admin-social-repository";

export function socialLinkAuditSnapshot(link: AdminSocialLinkItem | null) {
  if (!link) {
    return null;
  }

  return {
    id: link.id,
    platform: link.platform,
    labelEn: link.labelEn,
    labelUr: link.labelUr,
    url: link.url,
    iconName: link.iconName,
    isActive: link.isActive,
    displayOrder: link.displayOrder,
  };
}
