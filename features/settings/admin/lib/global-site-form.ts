import type {
  BrandingSettings,
  BusinessSettings,
  FormsSettings,
  PublicSettingsSnapshot,
  PublicUiSettings} from "@/features/settings/types";

export type GlobalSiteBusinessFormValues = Pick<
  BusinessSettings,
  | "businessEmail"
  | "phoneDisplayNumber"
  | "whatsappLinkNumber"
  | "whatsappDefaultMessageEn"
  | "supportDaysEn"
  | "supportHoursEn"
  | "whatsappChannelUrl"
  | "footerDescriptionEn"
  | "disclaimerEn"
>;

export type GlobalSiteFormValues = {
  business: GlobalSiteBusinessFormValues;
  publicUi: PublicUiSettings;
  forms: FormsSettings;
  branding: BrandingSettings;
};

export function snapshotToFormValues(
  settings: PublicSettingsSnapshot): GlobalSiteFormValues {
  const { business, publicUi, forms, branding } = settings;

  return {
    business: {
      businessEmail: business.businessEmail,
      phoneDisplayNumber: business.phoneDisplayNumber,
      whatsappLinkNumber: business.whatsappLinkNumber,
      whatsappDefaultMessageEn: business.whatsappDefaultMessageEn,
      supportDaysEn: business.supportDaysEn,
      supportHoursEn: business.supportHoursEn,
      whatsappChannelUrl: business.whatsappChannelUrl,
      footerDescriptionEn: business.footerDescriptionEn,
      disclaimerEn: business.disclaimerEn},
    publicUi,
    forms,
    branding};
}
