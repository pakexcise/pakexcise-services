import "server-only";

import {
  defaultBusinessSettings,
  DEFAULT_PHONE_DISPLAY,
  DEFAULT_WHATSAPP_LINK_NUMBER,
  DEFAULT_WHATSAPP_MESSAGE_EN,
} from "@/features/settings/lib/defaults";
import type { BusinessSettings } from "@/features/settings/types";
import { normalizePhoneForWhatsApp } from "@/lib/whatsapp/build-service-message";
import type { SiteLocale } from "@/config/site";
type Locale = SiteLocale;

export function normalizeBusinessSettings(
  stored: Partial<BusinessSettings> | null,
): BusinessSettings {
  const defaults = defaultBusinessSettings();

  if (!stored) {
    return defaults;
  }

  const phoneDisplayNumber =
    stored.phoneDisplayNumber?.trim() ||
    stored.phoneNumber?.trim() ||
    defaults.phoneDisplayNumber;

  const whatsappLinkNumber =
    stored.whatsappLinkNumber?.trim() ||
    (stored.whatsappNumber
      ? normalizePhoneForWhatsApp(stored.whatsappNumber)
      : "") ||
    defaults.whatsappLinkNumber;

  const legacyMessage = stored.whatsappDefaultMessage?.trim();

  return {
    ...defaults,
    ...stored,
    phoneDisplayNumber,
    phoneNumber: phoneDisplayNumber,
    whatsappLinkNumber,
    whatsappNumber: whatsappLinkNumber,
    whatsappDefaultMessageEn:
      stored.whatsappDefaultMessageEn?.trim() ||
      legacyMessage ||
      defaults.whatsappDefaultMessageEn,
      
    whatsappDefaultMessage:
      stored.whatsappDefaultMessageEn?.trim() ||
      legacyMessage ||
      defaults.whatsappDefaultMessageEn,
    businessEmail: stored.businessEmail?.trim() || defaults.businessEmail,
    supportDaysEn: stored.supportDaysEn?.trim() || defaults.supportDaysEn,
    supportHoursEn: stored.supportHoursEn?.trim() || defaults.supportHoursEn,
    whatsappChannelUrl:
      stored.whatsappChannelUrl?.trim() || defaults.whatsappChannelUrl,
    businessHoursEn: stored.businessHoursEn?.trim() || defaults.businessHoursEn,
    disclaimerEn: stored.disclaimerEn?.trim() || defaults.disclaimerEn,
    footerDescriptionEn:
      stored.footerDescriptionEn?.trim() || defaults.footerDescriptionEn,
      
  };
}

export function resolvePhoneDisplayNumber(business: BusinessSettings): string {
  return business.phoneDisplayNumber || business.phoneNumber || DEFAULT_PHONE_DISPLAY;
}

export function resolveWhatsappLinkNumber(business: BusinessSettings): string {
  if (business.whatsappLinkNumber?.trim()) {
    return business.whatsappLinkNumber.trim();
  }

  if (business.whatsappNumber?.trim()) {
    return normalizePhoneForWhatsApp(business.whatsappNumber);
  }

  return DEFAULT_WHATSAPP_LINK_NUMBER;
}

export function resolveWhatsappDefaultMessage(
  business: BusinessSettings,
  _locale: Locale = "en",
): string {
  return (
    business.whatsappDefaultMessageEn ||
    business.whatsappDefaultMessage ||
    DEFAULT_WHATSAPP_MESSAGE_EN
  );
}

export function resolveSupportEmail(business: BusinessSettings): string {
  return business.businessEmail.trim();
}

export function resolveWhatsappChannelUrl(business: BusinessSettings): string {
  return business.whatsappChannelUrl.trim();
}
