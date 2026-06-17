import type { DocumentRequirementKind } from "@prisma/client";

import type {
  ApplyDocumentRequirement,
  ApplyFormFieldConfig,
  ApplyRegionOption,
  ApplyServiceConfig,
} from "@/features/applications/types";
import { filterByRegion, isUploadRequirement } from "@/features/services/lib/filter-by-region";

export function filterApplyFormFields(
  fields: ApplyFormFieldConfig[],
  selectedRegionId: string | null,
): ApplyFormFieldConfig[] {
  return filterByRegion(fields, selectedRegionId);
}

export function filterApplyDocumentRequirements(
  requirements: ApplyDocumentRequirement[],
  selectedRegionId: string | null,
  uploadsOnly = false,
): ApplyDocumentRequirement[] {
  const scoped = filterByRegion(requirements, selectedRegionId);

  if (!uploadsOnly) {
    return scoped;
  }

  return scoped.filter((req) => isUploadRequirement(req.kind));
}

export function resolveDefaultRegionId(
  regions: ApplyRegionOption[],
  savedRegionId?: string | null,
): string | null {
  if (regions.length === 0) {
    return null;
  }

  if (regions.length === 1) {
    return regions[0]?.id ?? null;
  }

  if (savedRegionId && regions.some((region) => region.id === savedRegionId)) {
    return savedRegionId;
  }

  return null;
}

export function buildScopedApplyConfig(
  service: ApplyServiceConfig,
  selectedRegionId: string | null,
): {
  formFields: ApplyFormFieldConfig[];
  documentRequirements: ApplyDocumentRequirement[];
  uploadRequirements: ApplyDocumentRequirement[];
} {
  const formFields = filterApplyFormFields(service.formFields, selectedRegionId);
  const documentRequirements = filterApplyDocumentRequirements(
    service.documentRequirements,
    selectedRegionId,
    false,
  );
  const uploadRequirements = filterApplyDocumentRequirements(
    service.documentRequirements,
    selectedRegionId,
    true,
  );

  return { formFields, documentRequirements, uploadRequirements };
}

export function getUploadKinds(): DocumentRequirementKind[] {
  return ["FILE"];
}
