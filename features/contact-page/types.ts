export type ContactMethodCardSettings = {
  titleEn: string;
  descriptionEn: string;
  buttonLabelEn: string;
  isActive: boolean;
};

export type ContactServiceInterestOption = {
  value: string;
  labelEn: string;
};

export type ContactPageSeoSettings = {
  metaTitleEn: string;
  metaDescriptionEn: string;
};

export type ContactPageSettings = {
  isPageActive: boolean;
  heroTitleEn: string;
  heroDescriptionEn: string;
  phoneNumber: string;
  whatsappNumber: string;
  supportEmail: string;
  supportDaysEn: string;
  supportHoursEn: string;
  whatsappChannelUrl: string;
  whatsappPrefillMessage: string;
  whatsappCard: ContactMethodCardSettings;
  callCard: ContactMethodCardSettings;
  emailCard: ContactMethodCardSettings;
  whatsappChannelCard: ContactMethodCardSettings;
  supportHoursCard: {
    titleEn: string;
    isActive: boolean;
  };
  formHeadingEn: string;
  formDescriptionEn: string;
  socialHeadingEn: string;
  socialDescriptionEn: string;
  ctaTitleEn: string;
  ctaDescriptionEn: string;
  ctaViewServicesLabelEn: string;
  ctaWhatsappLabelEn: string;
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
  whatsappCard: Omit<ContactMethodCardSettings, "titleEn" | "descriptionEn" | "buttonLabelEn"> & {
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
