"use server";

import { revalidatePath } from "next/cache";

import { syncServiceAvailabilitySchema } from "@/lib/validations/admin-service-availability";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { requirePermission } from "@/server/permissions/guards";
import { serviceRegionRepository } from "@/server/repositories/service-region-repository";

export async function syncServiceAvailabilityAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(syncServiceAvailabilitySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const { serviceId, regionIds } = parsed.data;

  await serviceRegionRepository.syncForService(serviceId, regionIds);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "service_region",
    entityId: serviceId,
    after: { regionIds },
  });

  revalidatePath("/admin/service-availability");
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/regions");

  return successResult({ ok: true });
}
