"use server";

import { revalidatePath } from "next/cache";

import { generateContactInquiryReferenceId } from "@/features/contact-inquiries/lib/reference-id";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import {
  adminCreateContactInquirySchema,
  adminUpdateContactInquirySchema,
  deleteContactInquirySchema,
  updateContactInquiryStatusSchema,
} from "@/lib/validations/contact-inquiry";
import { formatPhoneForDisplay } from "@/lib/validations/phone";
import { auditAdminAction } from "@/server/admin/audit-action";
import { contactInquiryRepository } from "@/server/repositories/contact-inquiry-repository";
import {
  requirePermission,
  requireSuperAdmin,
} from "@/server/permissions/guards";

function revalidateContactInquiryPaths(id?: string) {
  revalidatePath("/admin/contact-inquiries");
  revalidatePath("/admin/dashboard");
  if (id) {
    revalidatePath(`/admin/contact-inquiries/${id}`);
    revalidatePath(`/admin/contact-inquiries/${id}/edit`);
  }
}

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
    return errorResult("Contact inquiry not found.");
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

  revalidateContactInquiryPaths(updated.id);

  return successResult({ ok: true });
}

export async function createContactInquiryAdminAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requireSuperAdmin();
  const parsed = parseInput(adminCreateContactInquirySchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const data = parsed.data;

  const inquiry = await contactInquiryRepository.create({
    referenceId: await generateContactInquiryReferenceId(),
    fullName: data.fullName.trim(),
    phone: formatPhoneForDisplay(data.phone.trim()),
    email: data.email?.trim() || null,
    serviceInterest: data.serviceInterest.trim(),
    regionName: data.regionName?.trim() || null,
    cityName: data.cityName?.trim() || null,
    message: data.message?.trim() || null,
    locale: data.locale,
    status: data.status,
    adminNotes: data.adminNotes?.trim() || null,
  });

  await auditAdminAction({
    actorId: actor.id,
    action: "CREATE",
    entityType: "contact_inquiry",
    entityId: inquiry.id,
    after: { referenceId: inquiry.referenceId },
  });

  revalidateContactInquiryPaths(inquiry.id);

  return successResult({ id: inquiry.id });
}

export async function updateContactInquiryAdminAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requireSuperAdmin();
  const parsed = parseInput(adminUpdateContactInquirySchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const existing = await contactInquiryRepository.findAdminById(parsed.data.id);

  if (!existing) {
    return errorResult("Contact inquiry not found.");
  }

  const data = parsed.data;

  const updated = await contactInquiryRepository.updateAdmin({
    id: data.id,
    fullName: data.fullName.trim(),
    phone: formatPhoneForDisplay(data.phone.trim()),
    email: data.email?.trim() || null,
    serviceInterest: data.serviceInterest.trim(),
    regionName: data.regionName?.trim() || null,
    cityName: data.cityName?.trim() || null,
    message: data.message?.trim() || null,
    locale: data.locale,
    status: data.status,
    adminNotes: data.adminNotes?.trim() || null,
  });

  await auditAdminAction({
    actorId: actor.id,
    action: "UPDATE",
    entityType: "contact_inquiry",
    entityId: updated.id,
    after: { referenceId: updated.referenceId, status: updated.status },
  });

  revalidateContactInquiryPaths(updated.id);

  return successResult({ id: updated.id });
}

export async function deleteContactInquiryAdminAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requireSuperAdmin();
  const parsed = parseInput(deleteContactInquirySchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const existing = await contactInquiryRepository.findAdminById(parsed.data.id);

  if (!existing) {
    return errorResult("Contact inquiry not found.");
  }

  await contactInquiryRepository.deleteAdmin(parsed.data.id);

  await auditAdminAction({
    actorId: actor.id,
    action: "DELETE",
    entityType: "contact_inquiry",
    entityId: parsed.data.id,
    before: { referenceId: existing.referenceId },
  });

  revalidateContactInquiryPaths();

  return successResult({ id: parsed.data.id });
}
