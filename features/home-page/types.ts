export type LocalizedTextPair = {
  en: string;
  ur: string;
};

export type HomeSectionKey =
  | "options"
  | "services"
  | "popular"
  | "regions"
  | "howItWorks"
  | "vehicleVisual"
  | "documents"
  | "about"
  | "blog"
  | "guides"
  | "whyChoose"
  | "faqs"
  | "finalCta";

export type HomeSectionConfig = {
  isActive: boolean;
  displayOrder: number;
  titleEn: string;
  titleUr: string;
  descriptionEn: string;
  descriptionUr: string;
};

export type HomeContentBlock = {
  titleEn: string;
  titleUr: string;
  descriptionEn: string;
  descriptionUr: string;
};

export type HomeHeroSettings = {
  badgeEn: string;
  badgeUr: string;
  titleEn: string;
  titleUr: string;
  descriptionEn: string;
  descriptionUr: string;
  browseCtaEn: string;
  browseCtaUr: string;
  whatsappCtaEn: string;
  whatsappCtaUr: string;
  requestCtaEn: string;
  requestCtaUr: string;
  trustBadges: LocalizedTextPair[];
  processCards: HomeContentBlock[];
};

export type HomeAboutSettings = {
  titleEn: string;
  titleUr: string;
  descriptionEn: string;
  descriptionUr: string;
  additionalEn: string;
  additionalUr: string;
  ctaEn: string;
  ctaUr: string;
  trustCards: HomeContentBlock[];
};

export type HomePageSeoSettings = {
  metaTitleEn: string;
  metaTitleUr: string;
  metaDescriptionEn: string;
  metaDescriptionUr: string;
  h1En: string;
  h1Ur: string;
};

export type HomePageLimits = {
  faqCount: number;
  documentCount: number;
  blogCount: number;
  guideCount: number;
  popularCount: number;
};

export type HomeVehicleVisualSettings = {
  imagePath: string;
  imageAltEn: string;
  imageAltUr: string;
  featurePoints: HomeContentBlock[];
  browseCtaEn: string;
  browseCtaUr: string;
  whatsappCtaEn: string;
  whatsappCtaUr: string;
  requestCtaEn: string;
  requestCtaUr: string;
};

export type HomePageSettings = {
  isPageActive: boolean;
  hero: HomeHeroSettings;
  sections: Record<HomeSectionKey, HomeSectionConfig>;
  optionsNoteEn: string;
  optionsNoteUr: string;
  howItWorksSteps: HomeContentBlock[];
  whyChooseItems: HomeContentBlock[];
  vehicleVisual: HomeVehicleVisualSettings;
  about: HomeAboutSettings;
  limits: HomePageLimits;
  footerDescriptionEn: string;
  footerDescriptionUr: string;
  seo: HomePageSeoSettings;
};

export type LocalizedHomeSection = {
  title: string;
  description: string;
};

export type LocalizedHomeContent = {
  hero: {
    badge: string;
    title: string;
    description: string;
    browseCta: string;
    whatsappCta: string;
    requestCta: string;
    trustBadges: string[];
    processCards: Array<{ title: string; description: string }>;
  };
  sections: Record<HomeSectionKey, LocalizedHomeSection & { isActive: boolean; displayOrder: number }>;
  optionsNote: string;
  howItWorksSteps: Array<{ title: string; description: string }>;
  whyChooseItems: Array<{ title: string; description: string }>;
  vehicleVisual: {
    imagePath: string;
    imageAlt: string;
    featurePoints: Array<{ title: string; description: string }>;
    browseCta: string;
    whatsappCta: string;
    requestCta: string;
  };
  about: {
    title: string;
    description: string;
    additional: string;
    cta: string;
    trustCards: Array<{ title: string; description: string }>;
  };
  footerDescription: string;
};
