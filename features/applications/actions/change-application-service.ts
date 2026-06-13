"use server";

import type { ApplicationDraftJson } from "@/features/applications/types";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { changeApplicationServiceSchema } from "@/lib/validations/application";
import { requireApplyAccess } from "@/server/permissions/guards";
import { applicationWizardRepository } from "@/server/repositories/application-wizard-repository";
import { documentRepository } from "@/server/repositories/document-repository";
import { serviceRepository } from "@/server/repositories/service-repository";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

export async function changeApplicationServiceAction(
  input: unknown,
): Promise<
  ActionResult<{
    applicationId: string;
    trackingId: string;
    serviceSlug: string;
  }>
> {
  const user = await requireApplyAccess();
  await enforceRateLimit(serverActionRateLimit, `change-service:${user.id}`);

  const parsed = parseInput(changeApplicationServiceSchema, input);

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

  const nextService = await serviceRepository.findPublicApplyConfigBySlug(
    parsed.data.newServiceSlug,
  );

  if (!nextService) {
    return errorResult("Service not found or unavailable");
  }

  if (nextService.id === draft.serviceId) {
    return successResult({
      applicationId: draft.id,
      trackingId: draft.trackingId,
      serviceSlug: nextService.slug,
    });
  }

  const draftJson: ApplicationDraftJson = {
    basic: parsed.data.basic,
    fields: {},
    documents: {},
    attribution:
      draft.draftJson && typeof draft.draftJson === "object"
        ? ((draft.draftJson as ApplicationDraftJson).attribution ?? undefined)
        : undefined,
  };

  await documentRepository.deleteAllForApplication(draft.id);

  const updated = await applicationWizardRepository.updateDraftService({
    applicationId: draft.id,
    userId: user.id,
    serviceId: nextService.id,
    currentStep: 2,
    draftJson,
  });

  if (!updated) {
    return errorResult("Could not update application service");
  }

  return successResult({
    applicationId: updated.id,
    trackingId: updated.trackingId,
    serviceSlug: nextService.slug,
  });
}
