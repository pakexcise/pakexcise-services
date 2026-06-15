"use server";

import { revalidatePath } from "next/cache";

import { parseInput, successResult, type ActionResult } from "@/lib/validations/common";
import { updateContactInquiryStatusSchema } from "@/lib/validations/contact-inquiry";
import { auditAdminAction } from "@/server/admin/audit-action";
import { requirePermission } from "@/server/permissions/guards";
import { contactInquiryRepository } from "@/server/repositories/contact-inquiry-repository";

export async function updateContactInquiryStatusAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const user = await requirePermission("application:read");
  const parsed = parseInput(updateContactInquiryStatusSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await contactInquiryRepository.findAdminById(parsed.data.inquiryId);

  if (!existing) {
    return { success: false, error: "Contact inquiry not found." };
  }

  const updated = await contactInquiryRepository.updateAdminStatus({
    id: parsed.data.inquiryId,
    status: parsed.data.status,
    adminNotes: parsed.data.adminNotes || null,
    contactedById: parsed.data.status === "CONTACTED" ? user.id : undefined,
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "contact_inquiry",
    entityId: updated.id,
    before: { status: existing.status },
    after: { status: updated.status },
  });

  revalidatePath("/admin/contact-inquiries");
  revalidatePath(`/admin/contact-inquiries/${updated.id}`);

  return successResult({ ok: true });
}
