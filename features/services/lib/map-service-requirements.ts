import type { DocumentRequirementKind } from "@prisma/client";
import type { Locale } from "@/i18n/config";
import { pickLocalized } from "@/lib/i18n/content";
import type { PublicServiceDetail } from "@/server/repositories/service-repository";

export type ServiceDocumentItem = {
  id: string;
  docType: string;
  kind: DocumentRequirementKind;
  label: string;
  instructions: string | null;
  isRequired: boolean;
  scopeLabel: string;
  regionId: string | null;
  regionSlug: string | null;
  displayOrder: number;
};

export type ServiceFieldItem = {
  id: string;
  fieldKey: string;
  label: string;
  helpText: string | null;
  fieldType: PublicServiceDetail["formFields"][number]["fieldType"];
  isRequired: boolean;
  scopeLabel: string;
  regionId: string | null;
  displayOrder: number;
};

export function mapServiceDocumentsForLocale(
  docs: PublicServiceDetail["documentReqs"],
  locale: Locale,
  allRegionsLabel: string,
): ServiceDocumentItem[] {
  return docs.map((doc) => ({
    id: doc.id,
    docType: doc.docType,
    kind: doc.kind,
    label: pickLocalized(locale, { en: doc.labelEn, ur: doc.labelUr }),
    instructions: pickLocalized(locale, {
      en: doc.instructionsEn,
      ur: doc.instructionsUr,
    }),
    isRequired: doc.isRequired,
    scopeLabel: doc.region
      ? pickLocalized(locale, {
          en: doc.region.nameEn,
          ur: doc.region.nameUr,
        })
      : allRegionsLabel,
    regionId: doc.regionId,
    regionSlug: doc.region?.slug ?? null,
    displayOrder: doc.displayOrder,
  }));
}

export function mapServiceFieldsForLocale(
  fields: PublicServiceDetail["formFields"],
  locale: Locale,
  allRegionsLabel: string,
): ServiceFieldItem[] {
  return fields.map((field) => ({
    id: field.id,
    fieldKey: field.fieldKey,
    label: pickLocalized(locale, { en: field.labelEn, ur: field.labelUr }),
    helpText: pickLocalized(locale, {
      en: field.helpTextEn,
      ur: field.helpTextUr,
    }),
    fieldType: field.fieldType,
    isRequired: field.isRequired,
    scopeLabel: field.region
      ? pickLocalized(locale, {
          en: field.region.nameEn,
          ur: field.region.nameUr,
        })
      : allRegionsLabel,
    regionId: field.regionId,
    displayOrder: field.displayOrder,
  }));
}

export function groupDocumentsByRegion(
  items: ServiceDocumentItem[],
  allRegionsLabel: string,
) {
  const groups = new Map<
    string,
    { regionLabel: string; items: ServiceDocumentItem[] }
  >();

  for (const item of items) {
    const regionKey = item.regionSlug ?? "all-regions";
    const regionLabel = item.regionSlug ? item.scopeLabel : allRegionsLabel;
    const existing = groups.get(regionKey);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(regionKey, { regionLabel, items: [item] });
  }

  return [...groups.entries()].map(([regionKey, group]) => ({
    regionKey,
    regionLabel: group.regionLabel,
    items: group.items,
  }));
}

export function getRegionSupportNotes(
  serviceRegions: PublicServiceDetail["serviceRegions"],
  locale: Locale,
): Array<{ regionName: string; notes: string }> {
  return serviceRegions
    .map((entry) => {
      const notes = pickLocalized(locale, {
        en: entry.supportNotesEn ?? "",
        ur: entry.supportNotesUr ?? entry.supportNotesEn ?? "",
      });

      if (!notes.trim() || !entry.region) {
        return null;
      }

      return {
        regionName: pickLocalized(locale, {
          en: entry.region.nameEn,
          ur: entry.region.nameUr,
        }),
        notes,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}
