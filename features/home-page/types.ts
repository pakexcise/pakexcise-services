export type LocalizedTextPair = {
  en: string;
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
  descriptionEn: string;
};

export type HomeContentBlock = {
  titleEn: string;
  descriptionEn: string;
};

export type HomeHeroSettings = {
  badgeEn: string;
  titleEn: string;
  descriptionEn: string;
  browseCtaEn: string;
  whatsappCtaEn: string;
  requestCtaEn: string;
  trustBadges: LocalizedTextPair[];
  processCards: HomeContentBlock[];
};

export type HomeAboutSettings = {
  titleEn: string;
  descriptionEn: string;
  additionalEn: string;
  ctaEn: string;
  trustCards: HomeContentBlock[];
};

export type HomePageSeoSettings = {
  metaTitleEn: string;
  metaDescriptionEn: string;
  h1En: string;
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
  featurePoints: HomeContentBlock[];
  browseCtaEn: string;
  whatsappCtaEn: string;
  requestCtaEn: string;
};

export type HomePageSettings = {
  isPageActive: boolean;
  hero: HomeHeroSettings;
  sections: Record<HomeSectionKey, HomeSectionConfig>;
  optionsNoteEn: string;
  howItWorksSteps: HomeContentBlock[];
  whyChooseItems: HomeContentBlock[];
  vehicleVisual: HomeVehicleVisualSettings;
  about: HomeAboutSettings;
  limits: HomePageLimits;
  footerDescriptionEn: string;
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
