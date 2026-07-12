import { parseFieldConditional } from "@/features/applications/lib/evaluate-conditional-fields";
import { getServiceRegionLabel } from "@/features/services/lib/service-regions";
import type {
  ApplyDocumentRequirement,
  ApplyFormFieldConfig,
  ApplyServiceConfig,
} from "@/features/applications/types";
import type { PublicServiceApplyConfig } from "@/server/repositories/service-repository";

type Locale = "en";

function parseOptions(
  optionsJson: unknown,
  _locale: Locale,
): ApplyFormFieldConfig["options"] {
  if (!Array.isArray(optionsJson)) {
    return [];
  }

  return optionsJson
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const value = typeof record.value === "string" ? record.value : null;
      const labelEn =
        typeof record.labelEn === "string"
          ? record.labelEn
          : typeof record.label === "string"
            ? record.label
            : null;
      if (!value || !labelEn) {
        return null;
      }

      return {
        value,
        label: labelEn ?? "",
      };
    })
    .filter((item): item is ApplyFormFieldConfig["options"][number] =>
      Boolean(item));
}

export function mapServiceApplyConfig(
  service: PublicServiceApplyConfig,
  locale: Locale): ApplyServiceConfig {
  const formFields: ApplyFormFieldConfig[] = service.formFields.map((field) => ({
    id: field.id,
    fieldKey: field.fieldKey,
    regionId: field.regionId,
    label: field.labelEn ?? "",
    placeholder: field.placeholderEn ? field.placeholderEn : null,
    helpText: field.helpTextEn ? field.helpTextEn : null,
    fieldType: field.fieldType,
    isRequired: field.isRequired,
    isEncrypted: field.isEncrypted,
    options: parseOptions(field.optionsJson, locale),
    validation:
      field.validationJson && typeof field.validationJson === "object"
        ? (() => {
            const raw = field.validationJson as Record<string, unknown>;
            const patternMessage =
              typeof raw.patternMessageEn === "string"
                ? raw.patternMessageEn
                : typeof raw.patternMessage === "string"
                  ? raw.patternMessage
                  : "";

            return {
              ...raw,
              ...(patternMessage ? { patternMessage } : {})};
          })()
        : null,
    conditional: parseFieldConditional(field.conditionalJson),
    displayOrder: field.displayOrder}));

  const documentRequirements: ApplyDocumentRequirement[] =
    service.documentReqs.map((req) => ({
      id: req.id,
      docType: req.docType,
      regionId: req.regionId,
      kind: req.kind,
      label: req.labelEn ?? "",
      instructions: req.instructionsEn ? req.instructionsEn : null,
      isRequired: req.isRequired,
      maxSizeBytes: req.maxSizeBytes,
      acceptedMimeTypes: Array.isArray(req.acceptedMimeTypes)
        ? req.acceptedMimeTypes.filter(
            (mime): mime is string => typeof mime === "string")
        : [],
      displayOrder: req.displayOrder}));

  const assignedRegions = service.serviceRegions
    .map((entry) => {
      if (!entry.region) {
        return null;
      }

      return {
        id: entry.region.id,
        slug: entry.region.slug,
        name: entry.region.nameEn ?? "",
        supportNotes: entry.supportNotesEn ?? ""};
    })
    .filter((region): region is NonNullable<typeof region> => Boolean(region));

  return {
    id: service.id,
    slug: service.slug,
    name: service.nameEn ?? "",
    shortDescription: service.shortDescriptionEn
      ? service.shortDescriptionEn
      : null,
    requiresProof: service.requiresProof,
    region: getServiceRegionLabel(
      service,
      locale,
      "Multiple provinces",
      "All Provinces"),
    assignedRegions,
    formFields,
    documentRequirements};
}
