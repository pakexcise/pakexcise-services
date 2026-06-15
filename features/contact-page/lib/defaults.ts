import type {
  ContactMethodCardSettings,
  ContactPageSettings,
  ContactServiceInterestOption,
} from "@/features/contact-page/types";

export const CONTACT_PAGE_SETTINGS_KEY = "settings:contact-page";
export const CONTACT_PAGE_SETTINGS_CACHE_TAG = "contact-page-settings";

const DEFAULT_WHATSAPP_MESSAGE = "Hi PakExcise, I need help with a service.";

function defaultMethodCard(
  titleEn: string,
  titleUr: string,
  descriptionEn: string,
  descriptionUr: string,
  buttonLabelEn: string,
  buttonLabelUr: string,
): ContactMethodCardSettings {
  return {
    titleEn,
    titleUr,
    descriptionEn,
    descriptionUr,
    buttonLabelEn,
    buttonLabelUr,
    isActive: true,
  };
}

export const DEFAULT_SERVICE_INTEREST_OPTIONS: ContactServiceInterestOption[] = [
  { value: "vehicle-transfer", labelEn: "Vehicle Transfer", labelUr: "گاڑی کی منتقلی" },
  { value: "token-tax", labelEn: "Token Tax", labelUr: "ٹوکن ٹیکس" },
  {
    value: "new-vehicle-registration",
    labelEn: "New Vehicle Registration",
    labelUr: "نئی گاڑی کی رجسٹریشن",
  },
  {
    value: "vehicle-passing-fitness",
    labelEn: "Vehicle Passing / Fitness",
    labelUr: "گاڑی پاسنگ / فٹنس",
  },
  { value: "route-permit", labelEn: "Route Permit", labelUr: "راؤٹ پرمٹ" },
  { value: "data-correction", labelEn: "Data Correction", labelUr: "ڈیٹا تصحیح" },
  {
    value: "driving-license-renewal",
    labelEn: "Driving License Renewal",
    labelUr: "ڈرائیونگ لائسنس تجدید",
  },
  { value: "learner-license", labelEn: "Learner's License", labelUr: "لرنر لائسنس" },
  { value: "e-challan", labelEn: "E-Challan / Safe City", labelUr: "ای چالان / سیف سٹی" },
  { value: "other", labelEn: "Other", labelUr: "دیگر" },
];

export function defaultContactPageSettings(): ContactPageSettings {
  return {
    isPageActive: true,
    heroTitleEn: "Contact PakExcise Support",
    heroTitleUr: "PakExcise سپورٹ سے رابطہ",
    heroDescriptionEn:
      "Need help with vehicle services, license services, token tax, e-challan, route permit, or data correction? Contact our support team by WhatsApp, phone, email, or contact form. We will guide you with the next steps quickly.",
    heroDescriptionUr:
      "گاڑی کی خدمات، لائسنس، ٹوکن ٹیکس، ای چالان، راؤٹ پرمٹ یا ڈیٹا تصحیح میں مدد چاہیے؟ واٹس ایپ، فون، ای میل یا رابطہ فارم کے ذریعے ہماری سپورٹ ٹیم سے رابطہ کریں۔ ہم آپ کو اگلے مراحل میں تیزی سے رہنمائی کریں گے۔",
    phoneNumber: "0345-0664441",
    whatsappNumber: "0345-0664441",
    supportEmail: "info@pakexcise.com",
    supportDaysEn: "Monday to Sunday",
    supportDaysUr: "پیر تا اتوار",
    supportHoursEn: "7:00 AM – 12:00 PM",
    supportHoursUr: "صبح 7:00 – 12:00",
    whatsappChannelUrl: "https://whatsapp.com/channel/0029VbCsDJXHLHQUel3u8C1O",
    whatsappPrefillMessage: DEFAULT_WHATSAPP_MESSAGE,
    whatsappCard: defaultMethodCard(
      "WhatsApp Support",
      "واٹس ایپ سپورٹ",
      "Chat with our support team on WhatsApp for the fastest response.",
      "تیز جواب کے لیے واٹس ایپ پر ہماری سپورٹ ٹیم سے چیٹ کریں۔",
      "Chat on WhatsApp",
      "واٹس ایپ پر چیٹ کریں",
    ),
    callCard: defaultMethodCard(
      "Call Support",
      "فون سپورٹ",
      "Speak directly with our support team during business hours.",
      "کاروباری اوقات میں ہماری سپورٹ ٹیم سے براہِ راست بات کریں۔",
      "Call Now",
      "ابھی کال کریں",
    ),
    emailCard: defaultMethodCard(
      "Email Support",
      "ای میل سپورٹ",
      "Send us your questions and we will reply as soon as possible.",
      "اپنے سوالات بھیجیں اور ہم جلد جواب دیں گے۔",
      "Send Email",
      "ای میل بھیجیں",
    ),
    whatsappChannelCard: defaultMethodCard(
      "WhatsApp Channel",
      "واٹس ایپ چینل",
      "Follow our WhatsApp Channel for service updates, document guidance, and important PakExcise announcements.",
      "سروس اپڈیٹس، دستاویزات کی رہنمائی اور اہم PakExcise اعلانات کے لیے ہمارا واٹس ایپ چینل فالو کریں۔",
      "Join WhatsApp Channel",
      "واٹس ایپ چینل جوائن کریں",
    ),
    supportHoursCard: {
      titleEn: "Support Hours",
      titleUr: "سپورٹ کے اوقات",
      isActive: true,
    },
    formHeadingEn: "Send us a message",
    formHeadingUr: "ہمیں پیغام بھیجیں",
    formDescriptionEn:
      "Fill out the form below and our support team will contact you shortly.",
    formDescriptionUr:
      "نیچے فارم پُر کریں اور ہماری سپورٹ ٹیم جلد آپ سے رابطہ کرے گی۔",
    socialHeadingEn: "Follow PakExcise",
    socialHeadingUr: "PakExcise کو فالو کریں",
    socialDescriptionEn: "Stay connected for updates, tips, and service announcements.",
    socialDescriptionUr: "اپڈیٹس، تجاویز اور سروس اعلانات کے لیے جڑے رہیں۔",
    ctaTitleEn: "Ready to start your service request?",
    ctaTitleUr: "اپنی سروس درخواست شروع کرنے کے لیے تیار ہیں؟",
    ctaDescriptionEn:
      "Choose your required service and submit your details online. Our support team will review your request and guide you through the next steps.",
    ctaDescriptionUr:
      "اپنی مطلوبہ سروس منتخب کریں اور تفصیلات آن لائن جمع کروائیں۔ ہماری سپورٹ ٹیم آپ کی درخواست کا جائزہ لے کر اگلے مراحل میں رہنمائی کرے گی۔",
    ctaViewServicesLabelEn: "View Services",
    ctaViewServicesLabelUr: "خدمات دیکھیں",
    ctaWhatsappLabelEn: "Chat on WhatsApp",
    ctaWhatsappLabelUr: "واٹس ایپ پر چیٹ کریں",
    ctaIsActive: true,
    serviceInterestOptions: DEFAULT_SERVICE_INTEREST_OPTIONS,
    seo: {
      metaTitleEn: "Contact PakExcise Support | Vehicle & License Services Help",
      metaTitleUr: "PakExcise سپورٹ سے رابطہ | گاڑی اور لائسنس خدمات",
      metaDescriptionEn:
        "Contact PakExcise support for vehicle transfer, token tax, registration, license renewal, learner license, route permit, data correction, and e-challan service help in Pakistan.",
      metaDescriptionUr:
        "پاکستان میں گاڑی منتقلی، ٹوکن ٹیکس، رجسٹریشن، لائسنس تجدید، لرنر لائسنس، راؤٹ پرمٹ، ڈیٹا تصحیح اور ای چالان کی مدد کے لیے PakExcise سپورٹ سے رابطہ کریں۔",
    },
  };
}

export function mergeContactPageSettings(
  stored: Partial<ContactPageSettings> | null,
): ContactPageSettings {
  const defaults = defaultContactPageSettings();

  if (!stored) {
    return defaults;
  }

  return {
    ...defaults,
    ...stored,
    supportDaysEn: stored.supportDaysEn ?? defaults.supportDaysEn,
    supportDaysUr: stored.supportDaysUr ?? defaults.supportDaysUr,
    supportHoursEn: stored.supportHoursEn ?? defaults.supportHoursEn,
    supportHoursUr: stored.supportHoursUr ?? defaults.supportHoursUr,
    whatsappCard: { ...defaults.whatsappCard, ...stored.whatsappCard },
    callCard: { ...defaults.callCard, ...stored.callCard },
    emailCard: { ...defaults.emailCard, ...stored.emailCard },
    whatsappChannelCard: {
      ...defaults.whatsappChannelCard,
      ...stored.whatsappChannelCard,
    },
    supportHoursCard: {
      ...defaults.supportHoursCard,
      ...stored.supportHoursCard,
    },
    seo: { ...defaults.seo, ...stored.seo },
    serviceInterestOptions:
      stored.serviceInterestOptions && stored.serviceInterestOptions.length > 0
        ? stored.serviceInterestOptions
        : defaults.serviceInterestOptions,
  };
}
