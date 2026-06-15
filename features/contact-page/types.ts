export type ContactMethodCardSettings = {
  titleEn: string;
  titleUr: string;
  descriptionEn: string;
  descriptionUr: string;
  buttonLabelEn: string;
  buttonLabelUr: string;
  isActive: boolean;
};

export type ContactServiceInterestOption = {
  value: string;
  labelEn: string;
  labelUr: string;
};

export type ContactPageSeoSettings = {
  metaTitleEn: string;
  metaTitleUr: string;
  metaDescriptionEn: string;
  metaDescriptionUr: string;
};

export type ContactPageSettings = {
  isPageActive: boolean;
  heroTitleEn: string;
  heroTitleUr: string;
  heroDescriptionEn: string;
  heroDescriptionUr: string;
  phoneNumber: string;
  whatsappNumber: string;
  supportEmail: string;
  supportDaysEn: string;
  supportDaysUr: string;
  supportHoursEn: string;
  supportHoursUr: string;
  whatsappChannelUrl: string;
  whatsappPrefillMessage: string;
  whatsappCard: ContactMethodCardSettings;
  callCard: ContactMethodCardSettings;
  emailCard: ContactMethodCardSettings;
  whatsappChannelCard: ContactMethodCardSettings;
  supportHoursCard: {
    titleEn: string;
    titleUr: string;
    isActive: boolean;
  };
  formHeadingEn: string;
  formHeadingUr: string;
  formDescriptionEn: string;
  formDescriptionUr: string;
  socialHeadingEn: string;
  socialHeadingUr: string;
  socialDescriptionEn: string;
  socialDescriptionUr: string;
  ctaTitleEn: string;
  ctaTitleUr: string;
  ctaDescriptionEn: string;
  ctaDescriptionUr: string;
  ctaViewServicesLabelEn: string;
  ctaViewServicesLabelUr: string;
  ctaWhatsappLabelEn: string;
  ctaWhatsappLabelUr: string;
  ctaIsActive: boolean;
  serviceInterestOptions: ContactServiceInterestOption[];
  seo: ContactPageSeoSettings;
};

export type LocalizedContactPageContent = {
  heroTitle: string;
  heroDescription: string;
  supportHours: string;
  supportDays: string;
  formHeading: string;
  formDescription: string;
  socialHeading: string;
  socialDescription: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaViewServicesLabel: string;
  ctaWhatsappLabel: string;
  serviceInterestOptions: Array<{ value: string; label: string }>;
  whatsappCard: Omit<ContactMethodCardSettings, "titleEn" | "titleUr" | "descriptionEn" | "descriptionUr" | "buttonLabelEn" | "buttonLabelUr"> & {
    title: string;
    description: string;
    buttonLabel: string;
  };
  callCard: {
    title: string;
    description: string;
    buttonLabel: string;
    isActive: boolean;
  };
  emailCard: {
    title: string;
    description: string;
    buttonLabel: string;
    isActive: boolean;
  };
  whatsappChannelCard: {
    title: string;
    description: string;
    buttonLabel: string;
    isActive: boolean;
  };
  supportHoursCard: {
    title: string;
    isActive: boolean;
  };
};
