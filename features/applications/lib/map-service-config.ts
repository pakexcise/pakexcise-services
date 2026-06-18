import type { Locale } from "@/i18n/config";
import { parseFieldConditional } from "@/features/applications/lib/evaluate-conditional-fields";
import { getServiceRegionLabel } from "@/features/services/lib/service-regions";
import { pickLocalized } from "@/lib/i18n/content";
import type {
  ApplyDocumentRequirement,
  ApplyFormFieldConfig,
  ApplyServiceConfig,
} from "@/features/applications/types";
import type { PublicServiceApplyConfig } from "@/server/repositories/service-repository";

function parseOptions(
  optionsJson: unknown,
  locale: Locale,
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
      const labelUr =
        typeof record.labelUr === "string" ? record.labelUr : labelEn;

      if (!value || !labelEn) {
        return null;
      }

      return {
        value,
        label: pickLocalized(locale, { en: labelEn, ur: labelUr ?? labelEn }),
      };
    })
    .filter((item): item is ApplyFormFieldConfig["options"][number] =>
      Boolean(item),
    );
}

export function mapServiceApplyConfig(
  service: PublicServiceApplyConfig,
  locale: Locale,
): ApplyServiceConfig {
  const formFields: ApplyFormFieldConfig[] = service.formFields.map((field) => ({
    id: field.id,
    fieldKey: field.fieldKey,
    regionId: field.regionId,
    label: pickLocalized(locale, {
      en: field.labelEn,
      ur: field.labelUr,
    }),
    placeholder:
      field.placeholderEn || field.placeholderUr
        ? pickLocalized(locale, {
            en: field.placeholderEn ?? "",
            ur: field.placeholderUr ?? field.placeholderEn ?? "",
          })
        : null,
    helpText:
      field.helpTextEn || field.helpTextUr
        ? pickLocalized(locale, {
            en: field.helpTextEn ?? "",
            ur: field.helpTextUr ?? field.helpTextEn ?? "",
          })
        : null,
    fieldType: field.fieldType,
    isRequired: field.isRequired,
    isEncrypted: field.isEncrypted,
    options: parseOptions(field.optionsJson, locale),
    validation:
      field.validationJson && typeof field.validationJson === "object"
        ? (() => {
            const raw = field.validationJson as Record<string, unknown>;
            const patternMessage = pickLocalized(locale, {
              en:
                typeof raw.patternMessageEn === "string"
                  ? raw.patternMessageEn
                  : typeof raw.patternMessage === "string"
                    ? raw.patternMessage
                    : "",
              ur:
                typeof raw.patternMessageUr === "string"
                  ? raw.patternMessageUr
                  : typeof raw.patternMessageEn === "string"
                    ? raw.patternMessageEn
                    : typeof raw.patternMessage === "string"
                      ? raw.patternMessage
                      : "",
            });

            return {
              ...raw,
              ...(patternMessage ? { patternMessage } : {}),
            };
          })()
        : null,
    conditional: parseFieldConditional(field.conditionalJson),
    displayOrder: field.displayOrder,
  }));

  const documentRequirements: ApplyDocumentRequirement[] =
    service.documentReqs.map((req) => ({
      id: req.id,
      docType: req.docType,
      regionId: req.regionId,
      kind: req.kind,
      label: pickLocalized(locale, {
        en: req.labelEn,
        ur: req.labelUr,
      }),
      instructions:
        req.instructionsEn || req.instructionsUr
          ? pickLocalized(locale, {
              en: req.instructionsEn ?? "",
              ur: req.instructionsUr ?? req.instructionsEn ?? "",
            })
          : null,
      isRequired: req.isRequired,
      maxSizeBytes: req.maxSizeBytes,
      acceptedMimeTypes: Array.isArray(req.acceptedMimeTypes)
        ? req.acceptedMimeTypes.filter(
            (mime): mime is string => typeof mime === "string",
          )
        : [],
      displayOrder: req.displayOrder,
    }));

  const assignedRegions = service.serviceRegions
    .map((entry) => {
      if (!entry.region) {
        return null;
      }

      return {
        id: entry.region.id,
        slug: entry.region.slug,
        name: pickLocalized(locale, {
          en: entry.region.nameEn,
          ur: entry.region.nameUr,
        }),
        supportNotes: pickLocalized(locale, {
          en: entry.supportNotesEn ?? "",
          ur: entry.supportNotesUr ?? entry.supportNotesEn ?? "",
        }),
      };
    })
    .filter((region): region is NonNullable<typeof region> => Boolean(region));

  return {
    id: service.id,
    slug: service.slug,
    name: pickLocalized(locale, {
      en: service.nameEn,
      ur: service.nameUr,
    }),
    shortDescription:
      service.shortDescriptionEn || service.shortDescriptionUr
        ? pickLocalized(locale, {
            en: service.shortDescriptionEn ?? "",
            ur: service.shortDescriptionUr ?? service.shortDescriptionEn ?? "",
          })
        : null,
    requiresProof: service.requiresProof,
    region: getServiceRegionLabel(
      service,
      locale,
      "Multiple provinces",
      "All Provinces",
    ),
    assignedRegions,
    formFields,
    documentRequirements,
  };
}
