import {
  defaultBusinessSettings,
  DEFAULT_DISCLAIMER_EN,
} from "@/features/settings/lib/defaults";
import { normalizeBusinessSettings } from "@/features/settings/lib/resolve-public-contact";
import type { BusinessSettings } from "@/features/settings/types";

type LegacySiteSettings = {
  supportEmail?: string;
  supportPhone?: string;
  businessHoursEn?: string;
};

type LegacyWhatsappSettings = {
  phoneNumber?: string;
  defaultMessage?: string;
};

export function mergeLegacyBusinessSettings(input: {
  stored: Partial<BusinessSettings> | null;
  legacySite: LegacySiteSettings | null;
  legacyWhatsapp: LegacyWhatsappSettings | null;
}): BusinessSettings {
  const defaults = defaultBusinessSettings();

  const merged: Partial<BusinessSettings> = {
    ...(input.stored ?? {}),
    businessEmail:
      input.stored?.businessEmail ??
      input.legacySite?.supportEmail ??
      defaults.businessEmail,
    phoneDisplayNumber:
      input.stored?.phoneDisplayNumber ??
      input.stored?.phoneNumber ??
      input.legacySite?.supportPhone ??
      defaults.phoneDisplayNumber,
    whatsappLinkNumber:
      input.stored?.whatsappLinkNumber ??
      input.stored?.whatsappNumber ??
      input.legacyWhatsapp?.phoneNumber ??
      defaults.whatsappLinkNumber,
    whatsappDefaultMessageEn:
      input.stored?.whatsappDefaultMessageEn ??
      input.stored?.whatsappDefaultMessage ??
      input.legacyWhatsapp?.defaultMessage ??
      defaults.whatsappDefaultMessageEn,
    businessHoursEn:
      input.stored?.businessHoursEn ??
      input.legacySite?.businessHoursEn ??
      defaults.businessHoursEn,
    disclaimerEn: input.stored?.disclaimerEn ?? DEFAULT_DISCLAIMER_EN,
  };

  return normalizeBusinessSettings(merged);
}
