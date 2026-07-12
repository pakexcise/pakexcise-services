import type { DocumentRequirementKind } from "@prisma/client";

import type { PublicServiceDetail } from "@/server/repositories/service-repository";

type Locale = "en";

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
  _locale: Locale,
  allRegionsLabel: string,
): ServiceDocumentItem[] {
  return docs.map((doc) => ({
    id: doc.id,
    docType: doc.docType,
    kind: doc.kind,
    label: doc.labelEn ?? "",
    instructions: doc.instructionsEn ?? "",
    isRequired: doc.isRequired,
    scopeLabel: doc.region
      ? doc.region.nameEn ?? ""
      : allRegionsLabel,
    regionId: doc.regionId,
    regionSlug: doc.region?.slug ?? null,
    displayOrder: doc.displayOrder}));
}

export function mapServiceFieldsForLocale(
  fields: PublicServiceDetail["formFields"],
  _locale: Locale,
  allRegionsLabel: string,
): ServiceFieldItem[] {
  return fields.map((field) => ({
    id: field.id,
    fieldKey: field.fieldKey,
    label: field.labelEn ?? "",
    helpText: field.helpTextEn ?? "",
    fieldType: field.fieldType,
    isRequired: field.isRequired,
    scopeLabel: field.region
      ? field.region.nameEn ?? ""
      : allRegionsLabel,
    regionId: field.regionId,
    displayOrder: field.displayOrder}));
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
    items: group.items}));
}

export function getRegionSupportNotes(
  serviceRegions: PublicServiceDetail["serviceRegions"],
  _locale: Locale,
): Array<{ regionName: string; notes: string }> {
  return serviceRegions
    .map((entry) => {
      const notes = entry.supportNotesEn ?? "";

      if (!notes.trim() || !entry.region) {
        return null;
      }

      return {
        regionName: entry.region.nameEn ?? "",
        notes};
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}
