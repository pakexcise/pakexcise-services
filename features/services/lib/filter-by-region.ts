import type { DocumentRequirementKind } from "@prisma/client";

type RegionScoped = {
  regionId: string | null;
};

export function matchesRegionScope(
  item: RegionScoped,
  selectedRegionId: string | null): boolean {
  if (!item.regionId) {
    return true;
  }

  if (!selectedRegionId) {
    return false;
  }

  return item.regionId === selectedRegionId;
}

export function filterByRegion<T extends RegionScoped>(
  items: T[],
  selectedRegionId: string | null): T[] {
  return items.filter((item) => matchesRegionScope(item, selectedRegionId));
}

export function isUploadRequirement(kind: DocumentRequirementKind): boolean {
  return kind === "FILE";
}

export function groupItemsByRegion<
  T extends RegionScoped & {
    region?: { slug: string; nameEn: string} | null;
  },
>(
  items: T[],
  allRegionsLabel: string): Array<{
  regionKey: string;
  regionLabel: string;
  items: T[];
}> {
  const groups = new Map<string, { regionLabel: string; items: T[] }>();

  for (const item of items) {
    const regionKey = item.region?.slug ?? "all-regions";
    const regionLabel = item.region
      ? item.region.nameEn
      : allRegionsLabel;

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
