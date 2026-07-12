import type { VehiclePlateType } from "@prisma/client";

import { getPublicPlateFormatImagePath } from "@/features/regions/lib/plate-format-image-paths";
import type {
  PublicRegionPlateFormat,
  PublicRegionPlateFormatSection,
} from "@/server/repositories/region-plate-format-repository";

type Locale = "en";

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
  _locale: Locale,
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
      const question =
        typeof record.questionEn === "string" ? record.questionEn : "";
      const answer =
        typeof record.answerEn === "string" ? record.answerEn : "";

      if (!question || !answer) {
        return null;
      }

      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } => Boolean(item));
}

export function mapRegionPlateFormat(
  format: PublicRegionPlateFormat,
  _locale: Locale,
): MappedRegionPlateFormat {
  return {
    id: format.id,
    vehicleType: format.vehicleType,
    title: format.titleEn ?? "",
    formats: parseStringArray(format.formatsJson),
    description: (format.descriptionEn ?? "") || null,
    relatedServiceSlugs: parseStringArray(format.relatedServiceSlugs),
    imageUrl: format.imageR2Key ? getPublicPlateFormatImagePath(format.id) : null,
    imageAlt: (format.imageAltEn ?? "") || null,
    imageCaption: (format.imageCaptionEn ?? "") || null,
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
    (input.section?.sectionTitleEn ?? "") ||
    input.fallbacks.sectionTitle.replace("__REGION__", input.regionName);

  const description =
    (input.section?.sectionDescEn ?? "") ||
    input.fallbacks.sectionDescription.replace("__REGION__", input.regionName);

  return {
    title,
    description,
    faqItems: parseFaqItems(input.section?.faqJson, input.locale),
    formats: input.formats.map((format) =>
      mapRegionPlateFormat(format, input.locale),
    ),
  };
}
