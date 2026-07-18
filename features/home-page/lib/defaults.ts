import type {
  HomeContentBlock,
  HomePageSettings,
  HomeSectionConfig,
  HomeSectionKey,
  HomeVehicleVisualSettings,
  LocalizedTextPair,
} from "@/features/home-page/types";
import {
  DEFAULT_HOME_VEHICLE_VISUAL_IMAGE,
  resolveHomeVehicleVisualImagePath,
} from "@/features/home-page/lib/vehicle-visual";

export const HOME_PAGE_SETTINGS_KEY = "settings:home-page";
export const HOME_PAGE_SETTINGS_CACHE_TAG = "home-page-settings";

export const HOME_SECTION_KEYS: HomeSectionKey[] = [
  "options",
  "popular",
  "services",
  "regions",
  "howItWorks",
  "vehicleVisual",
  "documents",
  "whyChoose",
  "about",
  "blog",
  "faqs",
  "finalCta",
];

function block(
  titleEn: string,
  descriptionEn: string,
): HomeContentBlock {
  return { titleEn, descriptionEn };
}

function section(
  displayOrder: number,
  titleEn: string,
  descriptionEn: string,
  isActive = true,
): HomeSectionConfig {
  return {
    isActive,
    displayOrder,
    titleEn,
    descriptionEn,
  };
}

function pair(en: string): LocalizedTextPair {
  return { en };
}

export function defaultVehicleVisualSettings(): HomeVehicleVisualSettings {
  return {
    imagePath: DEFAULT_HOME_VEHICLE_VISUAL_IMAGE,
    imageAltEn:
      "PakExcise vehicle documents, number plate, smart card, and registration support illustration",
    featurePoints: [
      block(
        "Document Guidance",
        "Get help understanding which documents may be required for your selected service.",
      ),
      block(
        "Vehicle & Registration Support",
        "Submit requests related to vehicle transfer, new registration, token tax, route permit, and data correction.",
      ),
      block(
        "Smart Card & Number Plate Assistance",
        "Get support guidance for smart card, registration record, and number plate-related service requests where applicable.",
      ),
      block(
        "Fast WhatsApp Support",
        "Contact PakExcise support on WhatsApp for quick guidance and next steps.",
      ),
    ],
    browseCtaEn: "View Services",
    whatsappCtaEn: "Chat on WhatsApp",
    requestCtaEn: "Submit Request",
  };
}

export function defaultHomePageSettings(): HomePageSettings {
  return {
    isPageActive: true,
    hero: {
      badgeEn: "Private facilitation · Fast WhatsApp support",
      titleEn:
        "Vehicle, License, Token Tax & E-Challan Facilitation in Pakistan",
      descriptionEn:
        "PakExcise helps you get fast support for vehicle transfer, token tax, new vehicle registration, driving license renewal, learner license, route permit, vehicle data correction, vehicle fitness, and e-challan services. Choose WhatsApp support, submit a quick request, or apply with an account for full tracking.",
      browseCtaEn: "Browse Services",
      whatsappCtaEn: "Chat on WhatsApp",
      requestCtaEn: "Submit Request",
      trustBadges: [
        pair("Fast WhatsApp Support"),
        pair("Submit Request Without Account"),
        pair("Full Tracking With Account"),
        pair("Province-Based Services"),
        pair("Document Guidance Available"),
      ],
      processCards: [
        block(
          "Select Your Service",
          "Choose from vehicle, license, token tax, route permit, data correction, or e-challan services.",
        ),
        block(
          "Submit Request or Apply",
          "Use WhatsApp, submit a quick request, or apply with account-based tracking.",
        ),
        block(
          "Get Support Quickly",
          "Our support team guides you about documents, next steps, and service process.",
        ),
      ],
    },
    sections: {
      options: section(
        10,
        "Choose How You Want to Get Support",
        "PakExcise gives you flexible options based on how quickly you need help and whether you want full website tracking.",
      ),
      popular: section(
        20,
        "Popular PakExcise Services",
        "Start with the most requested PakExcise services based on current service availability.",
      ),
      services: section(
        30,
        "Services We Help With",
        "Explore PakExcise services by category. Availability depends on your province or region.",
      ),
      regions: section(
        40,
        "Browse Services by Province",
        "PakExcise services are shown based on where they are available. Select your province or region to view supported services and cities.",
      ),
      howItWorks: section(
        50,
        "How PakExcise Works",
        "A simple process designed for quick support, clear document guidance, and easy application handling.",
      ),
      vehicleVisual: section(
        55,
        "Vehicle Documents, Smart Card & Number Plate Support",
        "PakExcise helps users get guidance for vehicle documents, number plate-related support, smart card information, registration details, vehicle transfer, token tax, route permit, data correction, and related facilitation services.",
      ),
      documents: section(
        60,
        "Know the Requirements Before You Apply",
        "Each service may require different documents based on service type and province. PakExcise helps you understand what is needed before your request moves forward.",
      ),
      whyChoose: section(
        70,
        "Why Choose PakExcise?",
        "PakExcise is designed for users who want fast guidance, simple service selection, and clear support for vehicle and license-related services.",
      ),
      about: section(
        80,
        "About PakExcise",
        "PakExcise is built to make vehicle, license, token tax, e-challan, and excise-related facilitation easier for users in Pakistan.",
      ),
      blog: section(
        100,
        "Latest from PakExcise Blog",
        "Read helpful updates, service information, and practical articles about vehicle, license, token tax, e-challan, and documentation services in Pakistan.",
      ),
      faqs: section(
        110,
        "Frequently Asked Questions",
        "Quick answers about PakExcise services, support options, documents, and application tracking.",
      ),
      finalCta: section(
        120,
        "Ready to Start Your Service Request?",
        "Choose your required service, contact PakExcise on WhatsApp, or submit a request online. If you want full tracking, apply with an account.",
      ),
    },
    optionsNoteEn:
      "WhatsApp and Submit Request options are handled through support on WhatsApp. Account-based applications provide full tracking inside your PakExcise dashboard.",
    howItWorksSteps: [
      block(
        "Choose Your Service",
        "Select the service you need from vehicle services, license services, token tax, route permit, data correction, or e-challan support.",
      ),
      block(
        "Select Support Method",
        "Choose WhatsApp support, submit a request without account, or apply with account-based tracking.",
      ),
      block(
        "Share Required Details",
        "Provide your basic information and service-related details. Our support team will guide you about required documents.",
      ),
      block(
        "Get Updates & Support",
        "WhatsApp and submit request users get support through WhatsApp. Account users can track application status, history, invoices, and documents from dashboard.",
      ),
    ],
    whyChooseItems: [
      block(
        "Fast WhatsApp Support",
        "Get quick guidance from PakExcise support for your selected service.",
      ),
      block(
        "Submit Request Without Account",
        "Send a simple request and our support team will contact you on WhatsApp.",
      ),
      block(
        "Full Tracking With Account",
        "Apply with an account to view status, invoices, history, documents, and updates.",
      ),
      block(
        "Province-Based Services",
        "Services are shown based on province availability for your selected region.",
      ),
      block(
        "Clear Document Guidance",
        "Understand required documents before your request moves forward.",
      ),
      block(
        "Mobile-First Experience",
        "PakExcise is designed for Pakistani users on mobile devices.",
      ),
    ],
    vehicleVisual: defaultVehicleVisualSettings(),
    about: {
      titleEn: "About PakExcise",
      descriptionEn:
        "PakExcise is built to make vehicle, license, token tax, e-challan, and excise-related facilitation easier for users in Pakistan. Our platform helps users choose the right service, understand required documents, contact support quickly, and submit requests through a simple online process.",
      additionalEn:
        "Whether you need quick WhatsApp guidance, a simple request submission, or a fully tracked account-based application, PakExcise gives you flexible options to get started.",
      ctaEn: "Learn More About PakExcise",
      trustCards: [
        block(
          "Simple Service Selection",
          "Browse services by category and province availability.",
        ),
        block(
          "WhatsApp-Based Support",
          "Contact support quickly for guidance and next steps.",
        ),
        block(
          "Province-Based Availability",
          "See which services are available in your province.",
        ),
        block(
          "Full Tracking With Account",
          "Track applications, documents, invoices, and updates online.",
        ),
      ],
    },
    limits: {
      faqCount: 8,
      documentCount: 8,
      blogCount: 6,
      popularCount: 6,
    },
    footerDescriptionEn:
      "PakExcise helps users in Pakistan get support for vehicle, license, token tax, route permit, data correction, vehicle fitness, and e-challan services through WhatsApp, submit request, and account-based application options.",
    seo: {
      metaTitleEn:
        "PakExcise | Vehicle, License, Token Tax & E-Challan Facilitation in Pakistan",
      metaDescriptionEn:
        "PakExcise provides private facilitation support for vehicle transfer, token tax, new vehicle registration, driving license renewal, learner license, route permit, vehicle data correction, vehicle fitness, and e-challan services in Pakistan.",
      h1En:
        "Vehicle, License, Token Tax & E-Challan Facilitation in Pakistan",
    },
  };
}

function mergeContentBlock(
  stored: Partial<HomeContentBlock> | undefined,
  fallback: HomeContentBlock,
): HomeContentBlock {
  return {
    titleEn: stored?.titleEn ?? fallback.titleEn,
    descriptionEn: stored?.descriptionEn ?? fallback.descriptionEn,
  };
}

function mergeSection(
  stored: Partial<HomeSectionConfig> | undefined,
  fallback: HomeSectionConfig,
): HomeSectionConfig {
  return {
    isActive: stored?.isActive ?? fallback.isActive,
    displayOrder: stored?.displayOrder ?? fallback.displayOrder,
    titleEn: stored?.titleEn ?? fallback.titleEn,
    descriptionEn: stored?.descriptionEn ?? fallback.descriptionEn,
  };
}

function sanitizeHomeLimit(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

/** Strip internal CMS wording that must never appear on public pages. */
export function sanitizePublicMarketingCopy(value: string): string {
  return value
    .replace(
      /These services are shown dynamically based on Super Admin settings\.?/gi,
      "These services are shown based on current service availability.",
    )
    .replace(
      /Service availability depends on the province or region selected by Super Admin\.?/gi,
      "Availability depends on your province or region.",
    )
    .replace(
      /managed from Super Admin\.?/gi,
      "for your selected region.",
    )
    .replace(/\bSuper Admin\b/gi, "our team")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function sanitizeContentBlock(block: HomeContentBlock): HomeContentBlock {
  return {
    ...block,
    titleEn: sanitizePublicMarketingCopy(block.titleEn),
    descriptionEn: sanitizePublicMarketingCopy(block.descriptionEn),
  };
}

export function mergeHomePageSettings(
  stored: Partial<HomePageSettings> | null | undefined,
): HomePageSettings {
  const defaults = defaultHomePageSettings();

  if (!stored) {
    return defaults;
  }

  const sections = { ...defaults.sections };
  for (const key of HOME_SECTION_KEYS) {
    const merged = mergeSection(stored.sections?.[key], defaults.sections[key]);
    sections[key] = {
      ...merged,
      titleEn: sanitizePublicMarketingCopy(merged.titleEn),
      descriptionEn: sanitizePublicMarketingCopy(merged.descriptionEn),
    };
  }

  const storedLimits = (stored.limits ?? {}) as Partial<HomePageSettings["limits"]>;

  return {
    isPageActive: stored.isPageActive ?? defaults.isPageActive,
    hero: {
      ...defaults.hero,
      ...stored.hero,
      titleEn: sanitizePublicMarketingCopy(
        stored.hero?.titleEn ?? defaults.hero.titleEn,
      ),
      descriptionEn: sanitizePublicMarketingCopy(
        stored.hero?.descriptionEn ?? defaults.hero.descriptionEn,
      ),
      trustBadges:
        stored.hero?.trustBadges?.map((item, index) => ({
          en: sanitizePublicMarketingCopy(
            item?.en ?? defaults.hero.trustBadges[index]?.en ?? "",
          ),
        })) ?? defaults.hero.trustBadges,
      processCards:
        stored.hero?.processCards?.map((item, index) =>
          sanitizeContentBlock(
            mergeContentBlock(item, defaults.hero.processCards[index] ?? item),
          ),
        ) ?? defaults.hero.processCards.map(sanitizeContentBlock),
    },
    sections,
    optionsNoteEn: sanitizePublicMarketingCopy(
      stored.optionsNoteEn ?? defaults.optionsNoteEn,
    ),
    howItWorksSteps:
      (stored.howItWorksSteps?.map((item, index) =>
        sanitizeContentBlock(
          mergeContentBlock(item, defaults.howItWorksSteps[index] ?? item),
        ),
      ) ?? defaults.howItWorksSteps.map(sanitizeContentBlock)),
    whyChooseItems:
      (stored.whyChooseItems?.map((item, index) =>
        sanitizeContentBlock(
          mergeContentBlock(item, defaults.whyChooseItems[index] ?? item),
        ),
      ) ?? defaults.whyChooseItems.map(sanitizeContentBlock)),
    vehicleVisual: {
      ...defaults.vehicleVisual,
      ...stored.vehicleVisual,
      imagePath: resolveHomeVehicleVisualImagePath(
        stored.vehicleVisual?.imagePath,
      ),
      featurePoints:
        stored.vehicleVisual?.featurePoints?.map((item, index) =>
          sanitizeContentBlock(
            mergeContentBlock(
              item,
              defaults.vehicleVisual.featurePoints[index] ?? item,
            ),
          ),
        ) ?? defaults.vehicleVisual.featurePoints.map(sanitizeContentBlock),
    },
    about: {
      ...defaults.about,
      ...stored.about,
      titleEn: sanitizePublicMarketingCopy(
        stored.about?.titleEn ?? defaults.about.titleEn,
      ),
      descriptionEn: sanitizePublicMarketingCopy(
        stored.about?.descriptionEn ?? defaults.about.descriptionEn,
      ),
      additionalEn: sanitizePublicMarketingCopy(
        stored.about?.additionalEn ?? defaults.about.additionalEn,
      ),
      trustCards:
        stored.about?.trustCards?.map((item, index) =>
          sanitizeContentBlock(
            mergeContentBlock(item, defaults.about.trustCards[index] ?? item),
          ),
        ) ?? defaults.about.trustCards.map(sanitizeContentBlock),
    },
    limits: {
      faqCount: sanitizeHomeLimit(
        storedLimits.faqCount,
        defaults.limits.faqCount,
        1,
        20,
      ),
      documentCount: sanitizeHomeLimit(
        storedLimits.documentCount,
        defaults.limits.documentCount,
        1,
        20,
      ),
      blogCount: sanitizeHomeLimit(
        storedLimits.blogCount,
        defaults.limits.blogCount,
        1,
        12,
      ),
      popularCount: sanitizeHomeLimit(
        storedLimits.popularCount,
        defaults.limits.popularCount,
        1,
        6,
      ),
    },
    footerDescriptionEn: sanitizePublicMarketingCopy(
      stored.footerDescriptionEn ?? defaults.footerDescriptionEn,
    ),
    seo: { ...defaults.seo, ...stored.seo },
  };
}
