import type {
  HomeContentBlock,
  HomePageSettings,
  HomeSectionConfig,
  HomeSectionKey,
  HomeVehicleVisualSettings,
  LocalizedTextPair,
} from "@/features/home-page/types";
import { DEFAULT_HOME_VEHICLE_VISUAL_IMAGE } from "@/features/home-page/lib/vehicle-visual";

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
  "guides",
  "blog",
  "faqs",
  "finalCta",
];

function block(
  titleEn: string,
  titleUr: string,
  descriptionEn: string,
  descriptionUr: string,
): HomeContentBlock {
  return { titleEn, titleUr, descriptionEn, descriptionUr };
}

function section(
  displayOrder: number,
  titleEn: string,
  titleUr: string,
  descriptionEn: string,
  descriptionUr: string,
  isActive = true,
): HomeSectionConfig {
  return {
    isActive,
    displayOrder,
    titleEn,
    titleUr,
    descriptionEn,
    descriptionUr,
  };
}

function pair(en: string, ur: string): LocalizedTextPair {
  return { en, ur };
}

export function defaultVehicleVisualSettings(): HomeVehicleVisualSettings {
  return {
    imagePath: DEFAULT_HOME_VEHICLE_VISUAL_IMAGE,
    imageAltEn:
      "PakExcise vehicle documents, number plate, smart card, and registration support illustration",
    imageAltUr:
      "PakExcise گاڑی کے دستاویزات، نمبر پلیٹ، سمارٹ کارڈ اور رجسٹریشن سپورٹ کی تصویر",
    featurePoints: [
      block(
        "Document Guidance",
        "دستاویزات کی رہنمائی",
        "Get help understanding which documents may be required for your selected service.",
        "اپنی منتخب خدمت کے لیے کون سی دستاویزات درکار ہو سکتی ہیں، اس کی رہنمائی حاصل کریں۔",
      ),
      block(
        "Vehicle & Registration Support",
        "گاڑی اور رجسٹریشن سپورٹ",
        "Submit requests related to vehicle transfer, new registration, token tax, route permit, and data correction.",
        "گاڑی منتقلی، نئی رجسٹریشن، ٹوکن ٹیکس، راؤٹ پرمٹ اور ڈیٹا تصحیح سے متعلق درخواستیں بھیجیں۔",
      ),
      block(
        "Smart Card & Number Plate Assistance",
        "سمارٹ کارڈ اور نمبر پلیٹ سپورٹ",
        "Get support guidance for smart card, registration record, and number plate-related service requests where applicable.",
        "سمارٹ کارڈ، رجسٹریشن ریکارڈ اور نمبر پلیٹ سے متعلق درخواستوں میں رہنمائی حاصل کریں۔",
      ),
      block(
        "Fast WhatsApp Support",
        "فوری واٹس ایپ سپورٹ",
        "Contact PakExcise support on WhatsApp for quick guidance and next steps.",
        "تیز رہنمائی اور اگلے مراحل کے لیے PakExcise سپورٹ سے واٹس ایپ پر رابطہ کریں۔",
      ),
    ],
    browseCtaEn: "View Services",
    browseCtaUr: "خدمات دیکھیں",
    whatsappCtaEn: "Chat on WhatsApp",
    whatsappCtaUr: "واٹس ایپ پر چیٹ کریں",
    requestCtaEn: "Submit Request",
    requestCtaUr: "درخواست بھیجیں",
  };
}

export function defaultHomePageSettings(): HomePageSettings {
  return {
    isPageActive: true,
    hero: {
      badgeEn: "Private facilitation · Fast WhatsApp support",
      badgeUr: "نجی سہولت · فوری واٹس ایپ سپورٹ",
      titleEn:
        "Vehicle, License, Token Tax & E-Challan Facilitation in Pakistan",
      titleUr:
        "پاکستان میں گاڑی، لائسنس، ٹوکن ٹیکس اور ای چالان سہولت",
      descriptionEn:
        "PakExcise helps you get fast support for vehicle transfer, token tax, new vehicle registration, driving license renewal, learner license, route permit, vehicle data correction, vehicle fitness, and e-challan services. Choose WhatsApp support, submit a quick request, or apply with an account for full tracking.",
      descriptionUr:
        "PakExcise گاڑی منتقلی، ٹوکن ٹیکس، نئی گاڑی رجسٹریشن، ڈرائیونگ لائسنس تجدید، لرنر لائسنس، راؤٹ پرمٹ، ڈیٹا تصحیح، گاڑی فٹنس اور ای چالان میں فوری مدد فراہم کرتا ہے۔ واٹس ایپ سپورٹ، فوری درخواست، یا مکمل ٹریکنگ کے ساتھ اکاؤنٹ درخواست منتخب کریں۔",
      browseCtaEn: "Browse Services",
      browseCtaUr: "خدمات دیکھیں",
      whatsappCtaEn: "Chat on WhatsApp",
      whatsappCtaUr: "واٹس ایپ پر چیٹ کریں",
      requestCtaEn: "Submit Request",
      requestCtaUr: "درخواست بھیجیں",
      trustBadges: [
        pair("Fast WhatsApp Support", "فوری واٹس ایپ سپورٹ"),
        pair("Submit Request Without Account", "اکاؤنٹ کے بغیر درخواست"),
        pair("Full Tracking With Account", "اکاؤنٹ کے ساتھ مکمل ٹریکنگ"),
        pair("Province-Based Services", "صوبے کے مطابق خدمات"),
        pair("Document Guidance Available", "دستاویزات کی رہنمائی"),
      ],
      processCards: [
        block(
          "Select Your Service",
          "اپنی خدمت منتخب کریں",
          "Choose from vehicle, license, token tax, route permit, data correction, or e-challan services.",
          "گاڑی، لائسنس، ٹوکن ٹیکس، راؤٹ پرمٹ، ڈیٹا تصحیح یا ای چالان خدمات میں سے منتخب کریں۔",
        ),
        block(
          "Submit Request or Apply",
          "درخواست بھیجیں یا درخواست دیں",
          "Use WhatsApp, submit a quick request, or apply with account-based tracking.",
          "واٹس ایپ استعمال کریں، فوری درخواست بھیجیں، یا اکاؤنٹ ٹریکنگ کے ساتھ درخواست دیں۔",
        ),
        block(
          "Get Support Quickly",
          "تیزی سے سپورٹ حاصل کریں",
          "Our support team guides you about documents, next steps, and service process.",
          "ہماری سپورٹ ٹیم دستاویزات، اگلے مراحل اور سروس کے عمل میں رہنمائی کرتی ہے۔",
        ),
      ],
    },
    sections: {
      options: section(
        10,
        "Choose How You Want to Get Support",
        "مدد حاصل کرنے کا طریقہ منتخب کریں",
        "PakExcise gives you flexible options based on how quickly you need help and whether you want full website tracking.",
        "PakExcise آپ کو لچکدار آپشنز دیتا ہے — آپ کتنی جلدی مدد چاہتے ہیں اور کیا ویب سائٹ ٹریکنگ چاہتے ہیں۔",
      ),
      popular: section(
        20,
        "Popular PakExcise Services",
        "مقبول PakExcise خدمات",
        "Start with the most requested PakExcise services. These services are shown dynamically based on Super Admin settings.",
        "سب سے زیادہ درخواست شدہ PakExcise خدمات سے شروع کریں۔ یہ خدمات سپر ایڈمن کی ترتیب کے مطابق دکھائی جاتی ہیں۔",
      ),
      services: section(
        30,
        "Services We Help With",
        "وہ خدمات جن میں ہم مدد کرتے ہیں",
        "Explore PakExcise services by category. Service availability depends on the province or region selected by Super Admin.",
        "PakExcise خدمات کو کیٹیگری کے لحاظ سے دیکھیں۔ دستیابی سپر ایڈمن کے منتخب صوبے پر منحصر ہے۔",
      ),
      regions: section(
        40,
        "Browse Services by Province",
        "صوبے کے لحاظ سے خدمات دیکھیں",
        "PakExcise services are shown based on where they are available. Select your province or region to view supported services and cities.",
        "PakExcise خدمات دستیابی کے مطابق دکھائی جاتی ہیں۔ اپنے صوبے یا علاقے کو منتخب کریں۔",
      ),
      howItWorks: section(
        50,
        "How PakExcise Works",
        "PakExcise کیسے کام کرتا ہے",
        "A simple process designed for quick support, clear document guidance, and easy application handling.",
        "تیز سپورٹ، واضح دستاویز رہنمائی اور آسان درخواست کے لیے سادہ عمل۔",
      ),
      vehicleVisual: section(
        55,
        "Vehicle Documents, Smart Card & Number Plate Support",
        "گاڑی کے دستاویزات، سمارٹ کارڈ اور نمبر پلیٹ سپورٹ",
        "PakExcise helps users get guidance for vehicle documents, number plate-related support, smart card information, registration details, vehicle transfer, token tax, route permit, data correction, and related facilitation services.",
        "PakExcise گاڑی کے دستاویزات، نمبر پلیٹ، سمارٹ کارڈ، رجسٹریشن، گاڑی منتقلی، ٹوکن ٹیکس، راؤٹ پرمٹ، ڈیٹا تصحیح اور متعلقہ سہولت خدمات میں رہنمائی فراہم کرتا ہے۔",
      ),
      documents: section(
        60,
        "Know the Requirements Before You Apply",
        "درخواست سے پہلے ضروریات جانیں",
        "Each service may require different documents based on service type and province. PakExcise helps you understand what is needed before your request moves forward.",
        "ہر خدمت کے لیے صوبے اور سروس کی قسم کے مطابق مختلف دستاویزات درکار ہو سکتی ہیں۔",
      ),
      whyChoose: section(
        70,
        "Why Choose PakExcise?",
        "PakExcise کیوں منتخب کریں؟",
        "PakExcise is designed for users who want fast guidance, simple service selection, and clear support for vehicle and license-related services.",
        "PakExcise ان صارفین کے لیے بنایا گیا ہے جو تیز رہنمائی، آسان سروس انتخاب اور واضح سپورٹ چاہتے ہیں۔",
      ),
      about: section(
        80,
        "About PakExcise",
        "PakExcise کے بارے میں",
        "PakExcise is built to make vehicle, license, token tax, e-challan, and excise-related facilitation easier for users in Pakistan.",
        "PakExcise پاکستان میں گاڑی، لائسنس، ٹوکن ٹیکس، ای چالان اور ایکسائز سہولت کو آسان بنانے کے لیے بنایا گیا ہے۔",
      ),
      guides: section(
        90,
        "Helpful Guides",
        "مفید گائیڈز",
        "Explore step-by-step guides to understand service requirements, documents, and the process before submitting your request.",
        "درخواست جمع کرنے سے پہلے ضروریات، دستاویزات اور عمل سمجھنے کے لیے گائیڈز دیکھیں۔",
      ),
      blog: section(
        100,
        "Latest from PakExcise Blog",
        "PakExcise بلاگ کی تازہ ترین معلومات",
        "Read helpful updates, service information, and practical articles about vehicle, license, token tax, e-challan, and documentation services in Pakistan.",
        "گاڑی، لائسنس، ٹوکن ٹیکس، ای چالان اور دستاویزات کے بارے میں مفید مضامین پڑھیں۔",
      ),
      faqs: section(
        110,
        "Frequently Asked Questions",
        "اکثر پوچھے گئے سوالات",
        "Quick answers about PakExcise services, support options, documents, and application tracking.",
        "PakExcise خدمات، سپورٹ آپشنز، دستاویزات اور ٹریکنگ کے بارے میں فوری جوابات۔",
      ),
      finalCta: section(
        120,
        "Ready to Start Your Service Request?",
        "اپنی سروس درخواست شروع کرنے کے لیے تیار ہیں؟",
        "Choose your required service, contact PakExcise on WhatsApp, or submit a request online. If you want full tracking, apply with an account.",
        "اپنی خدمت منتخب کریں، واٹس ایپ پر رابطہ کریں، یا آن لائن درخواست بھیجیں۔ مکمل ٹریکنگ کے لیے اکاؤنٹ کے ساتھ درخواست دیں۔",
      ),
    },
    optionsNoteEn:
      "WhatsApp and Submit Request options are handled through support on WhatsApp. Account-based applications provide full tracking inside your PakExcise dashboard.",
    optionsNoteUr:
      "واٹس ایپ اور درخواست بھیجیں آپشنز واٹس ایپ سپورٹ کے ذریعے مکمل ہوتے ہیں۔ اکاؤنٹ درخواستوں میں ڈیش بورڈ پر مکمل ٹریکنگ ملتی ہے۔",
    howItWorksSteps: [
      block(
        "Choose Your Service",
        "اپنی خدمت منتخب کریں",
        "Select the service you need from vehicle services, license services, token tax, route permit, data correction, or e-challan support.",
        "گاڑی، لائسنس، ٹوکن ٹیکس، راؤٹ پرمٹ، ڈیٹا تصحیح یا ای چالان سپورٹ میں سے خدمت منتخب کریں۔",
      ),
      block(
        "Select Support Method",
        "سپورٹ کا طریقہ منتخب کریں",
        "Choose WhatsApp support, submit a request without account, or apply with account-based tracking.",
        "واٹس ایپ سپورٹ، اکاؤنٹ کے بغیر درخواست، یا اکاؤنٹ ٹریکنگ کے ساتھ درخواست منتخب کریں۔",
      ),
      block(
        "Share Required Details",
        "ضروری تفصیلات شیئر کریں",
        "Provide your basic information and service-related details. Our support team will guide you about required documents.",
        "بنیادی معلومات اور سروس سے متعلق تفصیلات فراہم کریں۔ ہماری ٹیم دستاویزات کی رہنمائی کرے گی۔",
      ),
      block(
        "Get Updates & Support",
        "اپڈیٹس اور سپورٹ حاصل کریں",
        "WhatsApp and submit request users get support through WhatsApp. Account users can track application status, history, invoices, and documents from dashboard.",
        "واٹس ایپ اور درخواست صارفین کو واٹس ایپ پر سپورٹ ملتی ہے۔ اکاؤنٹ صارفین ڈیش بورڈ سے ٹریک کر سکتے ہیں۔",
      ),
    ],
    whyChooseItems: [
      block(
        "Fast WhatsApp Support",
        "فوری واٹس ایپ سپورٹ",
        "Get quick guidance from PakExcise support for your selected service.",
        "اپنی منتخب خدمت کے لیے PakExcise سپورٹ سے تیز رہنمائی حاصل کریں۔",
      ),
      block(
        "Submit Request Without Account",
        "اکاؤنٹ کے بغیر درخواست",
        "Send a simple request and our support team will contact you on WhatsApp.",
        "سادہ درخواست بھیجیں اور ہماری ٹیم واٹس ایپ پر رابطہ کرے گی۔",
      ),
      block(
        "Full Tracking With Account",
        "اکاؤنٹ کے ساتھ مکمل ٹریکنگ",
        "Apply with an account to view status, invoices, history, documents, and updates.",
        "اکاؤنٹ کے ساتھ درخواست دیں اور اسٹیٹس، انوائس، تاریخ اور دستاویزات دیکھیں۔",
      ),
      block(
        "Province-Based Services",
        "صوبے کے مطابق خدمات",
        "Services are shown based on province availability managed from Super Admin.",
        "خدمات سپر ایڈمن کے ذریعے منظم صوبائی دستیابی کے مطابق دکھائی جاتی ہیں۔",
      ),
      block(
        "Clear Document Guidance",
        "واضح دستاویز رہنمائی",
        "Understand required documents before your request moves forward.",
        "درخواست آگے بڑھنے سے پہلے ضروری دستاویزات سمجھیں۔",
      ),
      block(
        "Mobile-First Experience",
        "موبائل فرسٹ تجربہ",
        "PakExcise is designed for Pakistani users on mobile devices.",
        "PakExcise پاکستانی موبائل صارفین کے لیے ڈیزائن کیا گیا ہے۔",
      ),
    ],
    vehicleVisual: defaultVehicleVisualSettings(),
    about: {
      titleEn: "About PakExcise",
      titleUr: "PakExcise کے بارے میں",
      descriptionEn:
        "PakExcise is built to make vehicle, license, token tax, e-challan, and excise-related facilitation easier for users in Pakistan. Our platform helps users choose the right service, understand required documents, contact support quickly, and submit requests through a simple online process.",
      descriptionUr:
        "PakExcise پاکستان میں گاڑی، لائسنس، ٹوکن ٹیکس، ای چالان اور ایکسائز سہولت کو آسان بنانے کے لیے بنایا گیا ہے۔",
      additionalEn:
        "Whether you need quick WhatsApp guidance, a simple request submission, or a fully tracked account-based application, PakExcise gives you flexible options to get started.",
      additionalUr:
        "چاہے آپ کو فوری واٹس ایپ رہنمائی، سادہ درخواست، یا مکمل ٹریکنگ والی اکاؤنٹ درخواست چاہیے — PakExcise لچکدار آپشنز دیتا ہے۔",
      ctaEn: "Learn More About PakExcise",
      ctaUr: "PakExcise کے بارے میں مزید جانیں",
      trustCards: [
        block(
          "Simple Service Selection",
          "آسان خدمت انتخاب",
          "Browse services by category and province availability.",
          "کیٹیگری اور صوبے کی دستیابی کے مطابق خدمات دیکھیں۔",
        ),
        block(
          "WhatsApp-Based Support",
          "واٹس ایپ سپورٹ",
          "Contact support quickly for guidance and next steps.",
          "رہنمائی اور اگلے مراحل کے لیے تیزی سے سپورٹ سے رابطہ کریں۔",
        ),
        block(
          "Province-Based Availability",
          "صوبے کی دستیابی",
          "See which services are available in your province.",
          "اپنے صوبے میں دستیاب خدمات دیکھیں۔",
        ),
        block(
          "Full Tracking With Account",
          "اکاؤنٹ کے ساتھ مکمل ٹریکنگ",
          "Track applications, documents, invoices, and updates online.",
          "درخواستیں، دستاویزات، انوائس اور اپڈیٹس آن لائن ٹریک کریں۔",
        ),
      ],
    },
    limits: {
      faqCount: 8,
      documentCount: 8,
      blogCount: 6,
      guideCount: 6,
      popularCount: 6,
    },
    footerDescriptionEn:
      "PakExcise helps users in Pakistan get support for vehicle, license, token tax, route permit, data correction, vehicle fitness, and e-challan services through WhatsApp, submit request, and account-based application options.",
    footerDescriptionUr:
      "PakExcise پاکستان میں گاڑی، لائسنس، ٹوکن ٹیکس، راؤٹ پرمٹ، ڈیٹا تصحیح، گاڑی فٹنس اور ای چالان کی سپورٹ فراہم کرتا ہے۔",
    seo: {
      metaTitleEn:
        "PakExcise | Vehicle, License, Token Tax & E-Challan Facilitation in Pakistan",
      metaTitleUr:
        "PakExcise | پاکستان میں گاڑی، لائسنس، ٹوکن ٹیکس اور ای چالان سہولت",
      metaDescriptionEn:
        "PakExcise provides private facilitation support for vehicle transfer, token tax, new vehicle registration, driving license renewal, learner license, route permit, vehicle data correction, vehicle fitness, and e-challan services in Pakistan.",
      metaDescriptionUr:
        "PakExcise پاکستان میں گاڑی منتقلی، ٹوکن ٹیکس، رجسٹریشن، لائسنس، راؤٹ پرمٹ، ڈیٹا تصحیح، فٹنس اور ای چالان کی نجی سہولت فراہم کرتا ہے۔",
      h1En:
        "Vehicle, License, Token Tax & E-Challan Facilitation in Pakistan",
      h1Ur:
        "پاکستان میں گاڑی، لائسنس، ٹوکن ٹیکس اور ای چالان سہولت",
    },
  };
}

function mergeContentBlock(
  stored: Partial<HomeContentBlock> | undefined,
  fallback: HomeContentBlock,
): HomeContentBlock {
  return {
    titleEn: stored?.titleEn ?? fallback.titleEn,
    titleUr: stored?.titleUr ?? fallback.titleUr,
    descriptionEn: stored?.descriptionEn ?? fallback.descriptionEn,
    descriptionUr: stored?.descriptionUr ?? fallback.descriptionUr,
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
    titleUr: stored?.titleUr ?? fallback.titleUr,
    descriptionEn: stored?.descriptionEn ?? fallback.descriptionEn,
    descriptionUr: stored?.descriptionUr ?? fallback.descriptionUr,
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

export function mergeHomePageSettings(
  stored: Partial<HomePageSettings> | null | undefined,
): HomePageSettings {
  const defaults = defaultHomePageSettings();

  if (!stored) {
    return defaults;
  }

  const sections = { ...defaults.sections };
  for (const key of HOME_SECTION_KEYS) {
    sections[key] = mergeSection(stored.sections?.[key], defaults.sections[key]);
  }

  const storedLimits = (stored.limits ?? {}) as Partial<HomePageSettings["limits"]>;

  return {
    isPageActive: stored.isPageActive ?? defaults.isPageActive,
    hero: {
      ...defaults.hero,
      ...stored.hero,
      trustBadges:
        stored.hero?.trustBadges?.map((item, index) => ({
          en: item?.en ?? defaults.hero.trustBadges[index]?.en ?? "",
          ur: item?.ur ?? defaults.hero.trustBadges[index]?.ur ?? "",
        })) ?? defaults.hero.trustBadges,
      processCards:
        stored.hero?.processCards?.map((item, index) =>
          mergeContentBlock(item, defaults.hero.processCards[index] ?? item),
        ) ?? defaults.hero.processCards,
    },
    sections,
    optionsNoteEn: stored.optionsNoteEn ?? defaults.optionsNoteEn,
    optionsNoteUr: stored.optionsNoteUr ?? defaults.optionsNoteUr,
    howItWorksSteps:
      stored.howItWorksSteps?.map((item, index) =>
        mergeContentBlock(item, defaults.howItWorksSteps[index] ?? item),
      ) ?? defaults.howItWorksSteps,
    whyChooseItems:
      stored.whyChooseItems?.map((item, index) =>
        mergeContentBlock(item, defaults.whyChooseItems[index] ?? item),
      ) ?? defaults.whyChooseItems,
    vehicleVisual: {
      ...defaults.vehicleVisual,
      ...stored.vehicleVisual,
      imagePath:
        stored.vehicleVisual?.imagePath?.trim() ||
        defaults.vehicleVisual.imagePath,
      featurePoints:
        stored.vehicleVisual?.featurePoints?.map((item, index) =>
          mergeContentBlock(
            item,
            defaults.vehicleVisual.featurePoints[index] ?? item,
          ),
        ) ?? defaults.vehicleVisual.featurePoints,
    },
    about: {
      ...defaults.about,
      ...stored.about,
      trustCards:
        stored.about?.trustCards?.map((item, index) =>
          mergeContentBlock(item, defaults.about.trustCards[index] ?? item),
        ) ?? defaults.about.trustCards,
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
      guideCount: sanitizeHomeLimit(
        storedLimits.guideCount,
        defaults.limits.guideCount,
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
    footerDescriptionEn:
      stored.footerDescriptionEn ?? defaults.footerDescriptionEn,
    footerDescriptionUr:
      stored.footerDescriptionUr ?? defaults.footerDescriptionUr,
    seo: { ...defaults.seo, ...stored.seo },
  };
}
