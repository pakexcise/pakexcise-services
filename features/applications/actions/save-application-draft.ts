"use server";

import type { ApplicationDraftJson } from "@/features/applications/types";
import { generateTrackingId } from "@/features/applications/lib/tracking-id";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { saveApplicationDraftSchema } from "@/lib/validations/application";
import { requireApplyAccess } from "@/server/permissions/guards";
import { applicationWizardRepository } from "@/server/repositories/application-wizard-repository";
import { serviceRepository } from "@/server/repositories/service-repository";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

export async function saveApplicationDraftAction(
  input: unknown,
): Promise<
  ActionResult<{
    applicationId: string;
    trackingId: string;
    currentStep: number;
  }>
> {
  const user = await requireApplyAccess();
  await enforceRateLimit(serverActionRateLimit, `draft:${user.id}`);

  const parsed = parseInput(saveApplicationDraftSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const service = await serviceRepository.findPublicApplyConfigBySlug(
    parsed.data.serviceSlug,
  );

  if (!service) {
    return errorResult("Service not found or unavailable");
  }

  const draftJson: ApplicationDraftJson = {
    basic: parsed.data.basic,
    fields: parsed.data.fields,
    documents: parsed.data.documents,
    attribution: parsed.data.attribution,
  };

  if (parsed.data.applicationId) {
    const updated = await applicationWizardRepository.updateDraft({
      applicationId: parsed.data.applicationId,
      userId: user.id,
      currentStep: parsed.data.currentStep,
      draftJson,
    });

    if (!updated) {
      return errorResult("Draft application not found");
    }

    return successResult({
      applicationId: updated.id,
      trackingId: updated.trackingId,
      currentStep: updated.currentStep,
    });
  }

  const existing = await applicationWizardRepository.findDraftByServiceForUser({
    serviceId: service.id,
    userId: user.id,
  });

  if (existing) {
    const updated = await applicationWizardRepository.updateDraft({
      applicationId: existing.id,
      userId: user.id,
      currentStep: parsed.data.currentStep,
      draftJson,
    });

    if (!updated) {
      return errorResult("Could not update draft");
    }

    return successResult({
      applicationId: updated.id,
      trackingId: updated.trackingId,
      currentStep: updated.currentStep,
    });
  }

  const created = await applicationWizardRepository.createDraft({
    trackingId: generateTrackingId(),
    userId: user.id,
    agentId: user.role === "AGENT" ? user.id : null,
    serviceId: service.id,
    locale: parsed.data.locale,
    currentStep: parsed.data.currentStep,
    draftJson,
  });

  return successResult({
    applicationId: created.id,
    trackingId: created.trackingId,
    currentStep: created.currentStep,
  });
}
