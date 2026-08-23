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
import { syncServiceRegionSeoForService } from "@/features/services/lib/sync-service-region-seo";
import { prisma } from "@/server/db/client";

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
  await syncServiceRegionSeoForService(serviceId);

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { slug: true },
  });

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
  if (service?.slug) {
    revalidatePath(`/services/${service.slug}`);
    const regions = await prisma.region.findMany({
      where: { id: { in: regionIds } },
      select: { slug: true },
    });
    for (const region of regions) {
      revalidatePath(`/services/${service.slug}/${region.slug}`);
    }
  }

  return successResult({ ok: true });
}
