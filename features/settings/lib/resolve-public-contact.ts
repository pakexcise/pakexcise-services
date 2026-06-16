import "server-only";

import {
  defaultBusinessSettings,
  DEFAULT_PHONE_DISPLAY,
  DEFAULT_WHATSAPP_LINK_NUMBER,
  DEFAULT_WHATSAPP_MESSAGE_EN,
  DEFAULT_WHATSAPP_MESSAGE_UR,
} from "@/features/settings/lib/defaults";
import type { BusinessSettings } from "@/features/settings/types";
import { normalizePhoneForWhatsApp } from "@/lib/whatsapp/build-service-message";
import type { Locale } from "@/i18n/config";
import { pickLocalized } from "@/lib/i18n/content";

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
    whatsappDefaultMessageUr:
      stored.whatsappDefaultMessageUr?.trim() ||
      defaults.whatsappDefaultMessageUr,
    whatsappDefaultMessage:
      stored.whatsappDefaultMessageEn?.trim() ||
      legacyMessage ||
      defaults.whatsappDefaultMessageEn,
    businessEmail: stored.businessEmail?.trim() || defaults.businessEmail,
    supportDaysEn: stored.supportDaysEn?.trim() || defaults.supportDaysEn,
    supportDaysUr: stored.supportDaysUr?.trim() || defaults.supportDaysUr,
    supportHoursEn: stored.supportHoursEn?.trim() || defaults.supportHoursEn,
    supportHoursUr: stored.supportHoursUr?.trim() || defaults.supportHoursUr,
    whatsappChannelUrl:
      stored.whatsappChannelUrl?.trim() || defaults.whatsappChannelUrl,
    businessHoursEn: stored.businessHoursEn?.trim() || defaults.businessHoursEn,
    businessHoursUr: stored.businessHoursUr?.trim() || defaults.businessHoursUr,
    disclaimerEn: stored.disclaimerEn?.trim() || defaults.disclaimerEn,
    disclaimerUr: stored.disclaimerUr?.trim() || defaults.disclaimerUr,
    footerDescriptionEn:
      stored.footerDescriptionEn?.trim() || defaults.footerDescriptionEn,
    footerDescriptionUr:
      stored.footerDescriptionUr?.trim() || defaults.footerDescriptionUr,
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
  locale: Locale,
): string {
  return pickLocalized(locale, {
    en:
      business.whatsappDefaultMessageEn ||
      business.whatsappDefaultMessage ||
      DEFAULT_WHATSAPP_MESSAGE_EN,
    ur: business.whatsappDefaultMessageUr || DEFAULT_WHATSAPP_MESSAGE_UR,
  });
}

export function resolveSupportEmail(business: BusinessSettings): string {
  return business.businessEmail.trim();
}

export function resolveWhatsappChannelUrl(business: BusinessSettings): string {
  return business.whatsappChannelUrl.trim();
}
