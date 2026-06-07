import type { AdminServiceDetail } from "@/server/repositories/admin-service-repository";

export function serviceAuditSnapshot(service: AdminServiceDetail | null) {
  if (!service) {
    return null;
  }

  return {
    id: service.id,
    slug: service.slug,
    regionId: service.regionId,
    nameEn: service.nameEn,
    isActive: service.isActive,
    displayOrder: service.displayOrder,
    requiresProof: service.requiresProof,
    documentCount: service.documentReqs.length,
    fieldCount: service.formFields.length,
  };
}

export function documentAuditSnapshot(
  doc: AdminServiceDetail["documentReqs"][number] | null,
) {
  if (!doc) {
    return null;
  }

  return {
    id: doc.id,
    docType: doc.docType,
    labelEn: doc.labelEn,
    isRequired: doc.isRequired,
    displayOrder: doc.displayOrder,
    isActive: doc.isActive,
  };
}

export function formFieldAuditSnapshot(
  field: AdminServiceDetail["formFields"][number] | null,
) {
  if (!field) {
    return null;
  }

  return {
    id: field.id,
    fieldKey: field.fieldKey,
    fieldType: field.fieldType,
    isRequired: field.isRequired,
    isEncrypted: field.isEncrypted,
    displayOrder: field.displayOrder,
    isActive: field.isActive,
  };
}
