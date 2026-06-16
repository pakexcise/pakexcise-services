"use server";

import { revalidatePath } from "next/cache";

import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { updateGuestLeadStatusSchema } from "@/lib/validations/guest-lead";
import { auditAdminAction } from "@/server/admin/audit-action";
import { guestLeadRepository } from "@/server/repositories/guest-lead-repository";
import { requirePermission } from "@/server/permissions/guards";

export async function updateGuestLeadStatusAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requirePermission("application:notes");
  const parsed = parseInput(updateGuestLeadStatusSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const existing = await guestLeadRepository.findAdminById(parsed.data.leadId);

  if (!existing) {
    return errorResult("Service request not found.");
  }

  const updated = await guestLeadRepository.updateAdminStatus({
    id: parsed.data.leadId,
    status: parsed.data.status,
    adminNotes: parsed.data.adminNotes?.trim() || existing.adminNotes,
    contactedById: actor.id,
  });

  await auditAdminAction({
    actorId: actor.id,
    action: "UPDATE",
    entityType: "guest_lead",
    entityId: updated.id,
    after: {
      referenceId: updated.referenceId,
      status: updated.status,
    },
  });

  revalidatePath("/admin/guest-leads");
  revalidatePath(`/admin/guest-leads/${updated.id}`);
  revalidatePath("/support/guest-leads");
  revalidatePath(`/support/guest-leads/${updated.id}`);

  return successResult({ id: updated.id });
}
