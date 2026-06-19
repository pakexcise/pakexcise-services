import type { VehiclePlateType } from "@prisma/client";

import type { Locale } from "@/i18n/config";
import { getPublicPlateFormatImagePath } from "@/features/regions/lib/plate-format-image-paths";
import { pickLocalized } from "@/lib/i18n/content";
import type {
  PublicRegionPlateFormat,
  PublicRegionPlateFormatSection,
} from "@/server/repositories/region-plate-format-repository";

export type MappedRegionPlateFormat = {
  id: string;
  vehicleType: VehiclePlateType;
  title: string;
  formats: string[];
  description: string | null;
  relatedServiceSlugs: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  imageCaption: string | null;
  isFeatured: boolean;
};

export type MappedRegionPlateFormatsSection = {
  title: string;
  description: string;
  faqItems: Array<{ question: string; answer: string }>;
  formats: MappedRegionPlateFormat[];
};

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function parseFaqItems(
  value: unknown,
  locale: Locale,
): Array<{ question: string; answer: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const question = pickLocalized(locale, {
        en: typeof record.questionEn === "string" ? record.questionEn : "",
        ur: typeof record.questionUr === "string" ? record.questionUr : "",
      });
      const answer = pickLocalized(locale, {
        en: typeof record.answerEn === "string" ? record.answerEn : "",
        ur: typeof record.answerUr === "string" ? record.answerUr : "",
      });

      if (!question || !answer) {
        return null;
      }

      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } => Boolean(item));
}

export function mapRegionPlateFormat(
  format: PublicRegionPlateFormat,
  locale: Locale,
): MappedRegionPlateFormat {
  return {
    id: format.id,
    vehicleType: format.vehicleType,
    title: pickLocalized(locale, {
      en: format.titleEn,
      ur: format.titleUr,
    }),
    formats: parseStringArray(format.formatsJson),
    description: pickLocalized(locale, {
      en: format.descriptionEn,
      ur: format.descriptionUr,
    }) || null,
    relatedServiceSlugs: parseStringArray(format.relatedServiceSlugs),
    imageUrl: format.imageR2Key ? getPublicPlateFormatImagePath(format.id) : null,
    imageAlt:
      pickLocalized(locale, {
        en: format.imageAltEn,
        ur: format.imageAltUr,
      }) || null,
    imageCaption:
      pickLocalized(locale, {
        en: format.imageCaptionEn,
        ur: format.imageCaptionUr,
      }) || null,
    isFeatured: format.isFeatured,
  };
}

export function mapRegionPlateFormatsSection(input: {
  regionName: string;
  section: PublicRegionPlateFormatSection | null;
  formats: PublicRegionPlateFormat[];
  locale: Locale;
  fallbacks: {
    sectionTitle: string;
    sectionDescription: string;
  };
}): MappedRegionPlateFormatsSection | null {
  if (input.formats.length === 0) {
    return null;
  }

  const title =
    pickLocalized(input.locale, {
      en: input.section?.sectionTitleEn,
      ur: input.section?.sectionTitleUr,
    }) || input.fallbacks.sectionTitle.replace("__REGION__", input.regionName);

  const description =
    pickLocalized(input.locale, {
      en: input.section?.sectionDescEn,
      ur: input.section?.sectionDescUr,
    }) ||
    input.fallbacks.sectionDescription.replace("__REGION__", input.regionName);

  return {
    title,
    description,
    faqItems: parseFaqItems(input.section?.faqJson, input.locale),
    formats: input.formats.map((format) => mapRegionPlateFormat(format, input.locale)),
  };
}
