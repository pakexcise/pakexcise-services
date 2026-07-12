import type {
  ContactMethodCardSettings,
  ContactPageSettings,
  ContactServiceInterestOption} from "@/features/contact-page/types";

export const CONTACT_PAGE_SETTINGS_KEY = "settings:contact-page";
export const CONTACT_PAGE_SETTINGS_CACHE_TAG = "contact-page-settings";

const DEFAULT_WHATSAPP_MESSAGE = "Hi PakExcise, I need help with a service.";

function defaultMethodCard(
  titleEn: string,
  descriptionEn: string,
  buttonLabelEn: string): ContactMethodCardSettings {
  return {
    titleEn,
    descriptionEn,
    buttonLabelEn,
    isActive: true};
}

export const DEFAULT_SERVICE_INTEREST_OPTIONS: ContactServiceInterestOption[] = [
  { value: "vehicle-transfer", labelEn: "Vehicle Transfer"},
  { value: "token-tax", labelEn: "Token Tax"},
  {
    value: "new-vehicle-registration",
    labelEn: "New Vehicle Registration"},
  {
    value: "vehicle-passing-fitness",
    labelEn: "Vehicle Passing / Fitness"},
  { value: "route-permit", labelEn: "Route Permit"},
  { value: "data-correction", labelEn: "Data Correction"},
  {
    value: "driving-license-renewal",
    labelEn: "Driving License Renewal"},
  { value: "learner-license", labelEn: "Learner's License"},
  { value: "e-challan", labelEn: "E-Challan / Safe City"},
  { value: "other", labelEn: "Other"}];

export function defaultContactPageSettings(): ContactPageSettings {
  return {
    isPageActive: true,
    heroTitleEn: "Contact PakExcise Support",
    heroDescriptionEn:
      "Need help with vehicle services, license services, token tax, e-challan, route permit, or data correction? Contact our support team by WhatsApp, phone, email, or contact form. We will guide you with the next steps quickly.",
    phoneNumber: "0345-0664441",
    whatsappNumber: "0345-0664441",
    supportEmail: "info@pakexcise.com",
    supportDaysEn: "Monday to Sunday",
    supportHoursEn: "7:00 AM – 12:00 PM",
    whatsappChannelUrl: "https://whatsapp.com/channel/0029VbCsDJXHLHQUel3u8C1O",
    whatsappPrefillMessage: DEFAULT_WHATSAPP_MESSAGE,
    whatsappCard: defaultMethodCard(
      "WhatsApp Support",
      "Chat with our support team on WhatsApp for the fastest response.",
      "Chat on WhatsApp",
    ),
    callCard: defaultMethodCard(
      "Call Support",
      "Speak directly with our support team during business hours.",
      "Call Now",
    ),
    emailCard: defaultMethodCard(
      "Email Support",
      "Send us your questions and we will reply as soon as possible.",
      "Send Email",
    ),
    whatsappChannelCard: defaultMethodCard(
      "WhatsApp Channel",
      "Follow our WhatsApp Channel for service updates, document guidance, and important PakExcise announcements.",
      "Join WhatsApp Channel",
    ),
    supportHoursCard: {
      titleEn: "Support Hours",
      isActive: true},
    formHeadingEn: "Send us a message",
    formDescriptionEn:
      "Fill out the form below and our support team will contact you shortly.",
    socialHeadingEn: "Follow PakExcise",
    socialDescriptionEn: "Stay connected for updates, tips, and service announcements.",
    ctaTitleEn: "Ready to start your service request?",
    ctaDescriptionEn:
      "Choose your required service and submit your details online. Our support team will review your request and guide you through the next steps.",
    ctaViewServicesLabelEn: "View Services",
    ctaWhatsappLabelEn: "Chat on WhatsApp",
    ctaIsActive: true,
    serviceInterestOptions: DEFAULT_SERVICE_INTEREST_OPTIONS,
    seo: {
      metaTitleEn: "Contact PakExcise Support | Vehicle & License Services Help",
      metaDescriptionEn:
        "Contact PakExcise support for vehicle transfer, token tax, registration, license renewal, learner license, route permit, data correction, and e-challan service help in Pakistan."}};
}

export function mergeContactPageSettings(
  stored: Partial<ContactPageSettings> | null): ContactPageSettings {
  const defaults = defaultContactPageSettings();

  if (!stored) {
    return defaults;
  }

  return {
    ...defaults,
    ...stored,
    supportDaysEn: stored.supportDaysEn ?? defaults.supportDaysEn,
    supportHoursEn: stored.supportHoursEn ?? defaults.supportHoursEn,
    whatsappCard: { ...defaults.whatsappCard, ...stored.whatsappCard },
    callCard: { ...defaults.callCard, ...stored.callCard },
    emailCard: { ...defaults.emailCard, ...stored.emailCard },
    whatsappChannelCard: {
      ...defaults.whatsappChannelCard,
      ...stored.whatsappChannelCard},
    supportHoursCard: {
      ...defaults.supportHoursCard,
      ...stored.supportHoursCard},
    seo: { ...defaults.seo, ...stored.seo },
    serviceInterestOptions:
      stored.serviceInterestOptions && stored.serviceInterestOptions.length > 0
        ? stored.serviceInterestOptions
        : defaults.serviceInterestOptions};
}
