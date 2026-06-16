import type {
  BrandingSettings,
  BusinessSettings,
  FormsSettings,
  PublicSettingsSnapshot,
  PublicUiSettings,
} from "@/features/settings/types";

export type GlobalSiteBusinessFormValues = Pick<
  BusinessSettings,
  | "businessEmail"
  | "phoneDisplayNumber"
  | "whatsappLinkNumber"
  | "whatsappDefaultMessageEn"
  | "whatsappDefaultMessageUr"
  | "supportDaysEn"
  | "supportDaysUr"
  | "supportHoursEn"
  | "supportHoursUr"
  | "whatsappChannelUrl"
  | "footerDescriptionEn"
  | "footerDescriptionUr"
  | "disclaimerEn"
  | "disclaimerUr"
>;

export type GlobalSiteFormValues = {
  business: GlobalSiteBusinessFormValues;
  publicUi: PublicUiSettings;
  forms: FormsSettings;
  branding: BrandingSettings;
};

export function snapshotToFormValues(
  settings: PublicSettingsSnapshot,
): GlobalSiteFormValues {
  const { business, publicUi, forms, branding } = settings;

  return {
    business: {
      businessEmail: business.businessEmail,
      phoneDisplayNumber: business.phoneDisplayNumber,
      whatsappLinkNumber: business.whatsappLinkNumber,
      whatsappDefaultMessageEn: business.whatsappDefaultMessageEn,
      whatsappDefaultMessageUr: business.whatsappDefaultMessageUr,
      supportDaysEn: business.supportDaysEn,
      supportDaysUr: business.supportDaysUr,
      supportHoursEn: business.supportHoursEn,
      supportHoursUr: business.supportHoursUr,
      whatsappChannelUrl: business.whatsappChannelUrl,
      footerDescriptionEn: business.footerDescriptionEn,
      footerDescriptionUr: business.footerDescriptionUr,
      disclaimerEn: business.disclaimerEn,
      disclaimerUr: business.disclaimerUr,
    },
    publicUi,
    forms,
    branding,
  };
}
