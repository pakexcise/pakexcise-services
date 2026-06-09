import {
  defaultBusinessSettings,
  DEFAULT_DISCLAIMER_EN,
  DEFAULT_DISCLAIMER_UR,
} from "@/features/settings/lib/defaults";
import type { BusinessSettings } from "@/features/settings/types";

type LegacySiteSettings = {
  supportEmail?: string;
  supportPhone?: string;
  businessHoursEn?: string;
  businessHoursUr?: string;
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

  return {
    siteName: input.stored?.siteName ?? defaults.siteName,
    businessEmail:
      input.stored?.businessEmail ??
      input.legacySite?.supportEmail ??
      defaults.businessEmail,
    phoneNumber:
      input.stored?.phoneNumber ??
      input.legacySite?.supportPhone ??
      defaults.phoneNumber,
    whatsappNumber:
      input.stored?.whatsappNumber ??
      input.legacyWhatsapp?.phoneNumber ??
      defaults.whatsappNumber,
    whatsappDefaultMessage:
      input.stored?.whatsappDefaultMessage ??
      input.legacyWhatsapp?.defaultMessage ??
      defaults.whatsappDefaultMessage,
    businessHoursEn:
      input.stored?.businessHoursEn ??
      input.legacySite?.businessHoursEn ??
      defaults.businessHoursEn,
    businessHoursUr:
      input.stored?.businessHoursUr ??
      input.legacySite?.businessHoursUr ??
      defaults.businessHoursUr,
    addressEn: input.stored?.addressEn ?? defaults.addressEn,
    addressUr: input.stored?.addressUr ?? defaults.addressUr,
    disclaimerEn: input.stored?.disclaimerEn ?? DEFAULT_DISCLAIMER_EN,
    disclaimerUr: input.stored?.disclaimerUr ?? DEFAULT_DISCLAIMER_UR,
  };
}
