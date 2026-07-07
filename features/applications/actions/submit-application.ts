"use server";

import type { Prisma } from "@prisma/client";

import { buildDynamicFieldsSchema, serializeFieldValue } from "@/features/applications/lib/build-field-schema";
import { filterServiceSpecificFields } from "@/features/applications/lib/basic-field-keys";
import { buildScopedApplyConfig } from "@/features/applications/lib/filter-apply-config";
import { filterVisibleFields } from "@/features/applications/lib/evaluate-conditional-fields";
import { mapServiceApplyConfig } from "@/features/applications/lib/map-service-config";
import type { ApplicationDraftJson } from "@/features/applications/types";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { submitApplicationSchema } from "@/lib/validations/application";
import { requireApplyAccess } from "@/server/permissions/guards";
import { applicationWizardRepository } from "@/server/repositories/application-wizard-repository";
import { serviceRepository } from "@/server/repositories/service-repository";
import { prisma } from "@/server/db/client";
import { encryptSensitiveValue } from "@/server/security/encryption";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";
import { sendServerAnalyticsEvent } from "@/features/analytics/server-events";
import { canTransitionStatus } from "@/features/applications/lib/status-transitions";
import { queueApplicationSubmittedNotifications } from "@/server/notifications/queue-application-notification";
import { trackActivityFromRequest } from "@/server/tracking/track-activity";
import { absoluteUrl } from "@/lib/utils";
import { emitApplicationChange } from "@/server/realtime/application-events";

export async function submitApplicationAction(
  input: unknown,
): Promise<
  ActionResult<{
    applicationId: string;
    trackingId: string;
  }>
> {
  const user = await requireApplyAccess();
  await enforceRateLimit(serverActionRateLimit, `submit:${user.id}`);

  const parsed = parseInput(submitApplicationSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const draft = await applicationWizardRepository.findDraftForUser({
    applicationId: parsed.data.applicationId,
    userId: user.id,
  });

  if (!draft) {
    return errorResult("Application draft not found");
  }

  const serviceRecord = await serviceRepository.findPublicApplyConfigBySlug(
    (
      await prisma.service.findUnique({
        where: { id: draft.serviceId },
        select: { slug: true },
      })
    )?.slug ?? "",
  );

  if (!serviceRecord) {
    return errorResult("Service not found");
  }

  const service = mapServiceApplyConfig(serviceRecord, parsed.data.locale);
  const draftJson = (draft.draftJson ?? {}) as ApplicationDraftJson;
  const selectedRegionId = draftJson.selectedRegionId ?? null;
  const scopedConfig = buildScopedApplyConfig(service, selectedRegionId);
  const serviceSpecificFields = filterServiceSpecificFields(scopedConfig.formFields);
  const visibleFields = filterVisibleFields(
    serviceSpecificFields,
    parsed.data.fields as Record<string, unknown>,
  );
  const dynamicSchema = buildDynamicFieldsSchema(visibleFields);
  const dynamicResult = dynamicSchema.safeParse(parsed.data.fields);

  if (!dynamicResult.success) {
    const fieldErrors = dynamicResult.error.flatten().fieldErrors as Record<
      string,
      string[]
    >;
    const firstMessage = Object.values(fieldErrors).flat()[0];

    return errorResult(firstMessage ?? "Validation failed", fieldErrors);
  }

  const documents = await prisma.document.findMany({
    where: { applicationId: draft.id },
    select: {
      id: true,
      type: true,
      requirementId: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
    },
  });

  const requiredDocs = scopedConfig.uploadRequirements.filter((doc) => doc.isRequired);
  const uploadedRequirementIds = new Set(
    documents.map((doc) => doc.requirementId).filter(Boolean),
  );

  const missingRequired = requiredDocs.filter(
    (req) => !uploadedRequirementIds.has(req.id),
  );

  if (missingRequired.length > 0) {
    return errorResult("Please upload all required documents before submitting");
  }

  const attribution = parsed.data.attribution ?? draftJson.attribution;

  if (!canTransitionStatus("DRAFT", "SUBMITTED")) {
    return errorResult("Invalid application status transition");
  }

  const fieldValueRows: Prisma.ApplicationFieldValueCreateManyInput[] = [];

  for (const field of visibleFields) {
    const rawValue = parsed.data.fields[field.fieldKey];

    if (
      rawValue === undefined ||
      rawValue === null ||
      rawValue === "" ||
      (Array.isArray(rawValue) && rawValue.length === 0)
    ) {
      continue;
    }

    const serialized = serializeFieldValue(field.fieldType, rawValue);
    const shouldEncrypt =
      field.isEncrypted ||
      field.fieldType === "CNIC" ||
      field.fieldKey.toLowerCase().includes("cnic");

    if (shouldEncrypt && serialized.plain) {
      fieldValueRows.push({
        applicationId: draft.id,
        fieldId: field.id,
        valueEncrypted: encryptSensitiveValue(serialized.plain),
        isEncrypted: true,
      });
      continue;
    }

    fieldValueRows.push({
      applicationId: draft.id,
      fieldId: field.id,
      valuePlain: serialized.plain,
      valueJson: serialized.json as Prisma.InputJsonValue | undefined,
      isEncrypted: false,
    });
  }

  const basicFieldMap: Array<{
    key: keyof typeof parsed.data.basic;
    matchers: string[];
    encrypted?: boolean;
  }> = [
    { key: "fullName", matchers: ["applicant_name", "full_name", "name"] },
    { key: "email", matchers: ["applicant_email", "email"] },
    { key: "phone", matchers: ["applicant_phone", "phone", "mobile"] },
    {
      key: "cnic",
      matchers: ["applicant_cnic", "cnic"],
      encrypted: true,
    },
  ];

  for (const mapping of basicFieldMap) {
    const targetField = service.formFields.find((field) =>
      mapping.matchers.includes(field.fieldKey),
    );

    if (!targetField) {
      continue;
    }

    const value = parsed.data.basic[mapping.key];

    if (!value) {
      continue;
    }

    const encrypted = mapping.encrypted || targetField.isEncrypted;

    fieldValueRows.push({
      applicationId: draft.id,
      fieldId: targetField.id,
      valuePlain: encrypted ? undefined : value,
      valueEncrypted: encrypted ? encryptSensitiveValue(value) : undefined,
      isEncrypted: encrypted,
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.applicationFieldValue.deleteMany({
      where: { applicationId: draft.id },
    });

    if (fieldValueRows.length > 0) {
      await tx.applicationFieldValue.createMany({
        data: fieldValueRows,
        skipDuplicates: true,
      });
    }

    await tx.application.update({
      where: { id: draft.id },
      data: {
        status: "SUBMITTED",
        currentStep: 4,
        locale: parsed.data.locale,
        draftJson: {
          ...draftJson,
          basic: parsed.data.basic,
          submittedAt: new Date().toISOString(),
          submissionSource:
            user.role === "AGENT" || draft.agentId ? "AGENT" : "WEB_FORM",
        },
        firstTouchSource: attribution?.firstTouchSource,
        firstTouchMedium: attribution?.firstTouchMedium,
        firstTouchCampaign: attribution?.firstTouchCampaign,
        lastTouchSource: attribution?.lastTouchSource,
        lastTouchCampaign: attribution?.lastTouchCampaign,
        gclid: attribution?.gclid,
        fbclid: attribution?.fbclid,
        ttclid: attribution?.ttclid,
        landingPage: attribution?.landingPage,
        referrer: attribution?.referrer,
        deviceType: attribution?.deviceType,
      },
    });

    await tx.statusHistory.create({
      data: {
        applicationId: draft.id,
        fromStatus: "DRAFT",
        toStatus: "SUBMITTED",
        note: "Application submitted by applicant",
        actorId: user.id,
      },
    });

    if (attribution) {
      await tx.analyticsAttribution.upsert({
        where: { applicationId: draft.id },
        create: {
          applicationId: draft.id,
          source: attribution.firstTouchSource,
          medium: attribution.firstTouchMedium,
          campaign: attribution.firstTouchCampaign,
          gclid: attribution.gclid,
          fbclid: attribution.fbclid,
          ttclid: attribution.ttclid,
          landingPage: attribution.landingPage,
          referrer: attribution.referrer,
          deviceType: attribution.deviceType,
        },
        update: {
          source: attribution.firstTouchSource,
          medium: attribution.firstTouchMedium,
          campaign: attribution.firstTouchCampaign,
          gclid: attribution.gclid,
          fbclid: attribution.fbclid,
          ttclid: attribution.ttclid,
          landingPage: attribution.landingPage,
          referrer: attribution.referrer,
          deviceType: attribution.deviceType,
        },
      });
    }
  });

  await queueApplicationSubmittedNotifications({
    applicationId: draft.id,
    userId: user.id,
    trackingId: draft.trackingId,
    serviceName: service.name,
    serviceNameUr: serviceRecord.nameUr,
    locale: parsed.data.locale,
    userEmail: parsed.data.basic.email.trim() || user.email,
    userPhone: parsed.data.basic.phone,
  });

  const eventId =
    parsed.data.analyticsEventId ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `srv_${Date.now()}`);

  void sendServerAnalyticsEvent({
    eventName: "submit_application",
    eventId,
    payload: {
      service_slug: serviceRecord.slug,
      application_id: draft.id,
    },
    attribution: attribution ?? undefined,
    eventSourceUrl: absoluteUrl(`/apply/${serviceRecord.slug}`),
  });

  await emitApplicationChange({
    applicationId: draft.id,
    userId: user.id,
    agentId: draft.agentId,
    status: "SUBMITTED",
    changeType: "submit",
  });

  await trackActivityFromRequest({
    event: "application_submitted",
    userId: user.id,
    metadata: {
      service_slug: serviceRecord.slug,
      application_id: draft.id,
    },
  });

  return successResult({
    applicationId: draft.id,
    trackingId: draft.trackingId,
  });
}
