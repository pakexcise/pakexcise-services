"use server";

import { revalidatePath } from "next/cache";

import { generateGuestLeadReferenceId } from "@/features/guest-leads/lib/reference-id";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import {
  adminCreateGuestLeadSchema,
  adminUpdateGuestLeadSchema,
  deleteGuestLeadSchema,
  updateGuestLeadStatusSchema,
} from "@/lib/validations/guest-lead";
import { formatPhoneForDisplay } from "@/lib/validations/phone";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { guestLeadRepository } from "@/server/repositories/guest-lead-repository";
import {
  requirePermission,
  requireSuperAdmin,
} from "@/server/permissions/guards";

function revalidateGuestLeadPaths(id?: string) {
  revalidatePath("/admin/guest-leads");
  revalidatePath("/admin/dashboard");
  revalidatePath("/support/guest-leads");
  if (id) {
    revalidatePath(`/admin/guest-leads/${id}`);
    revalidatePath(`/admin/guest-leads/${id}/edit`);
    revalidatePath(`/support/guest-leads/${id}`);
  }
}

async function resolveServiceNames(
  serviceId: string | null | undefined,
  serviceNameEn: string,
  serviceNameUr: string,
) {
  if (!serviceId) {
    return { serviceNameEn, serviceNameUr, serviceId: null as string | null };
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, deletedAt: null },
    select: { id: true, nameEn: true, nameUr: true },
  });

  if (!service) {
    return null;
  }

  return {
    serviceId: service.id,
    serviceNameEn: service.nameEn,
    serviceNameUr: service.nameUr,
  };
}

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

  revalidateGuestLeadPaths(updated.id);

  return successResult({ id: updated.id });
}

export async function createGuestLeadAdminAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requireSuperAdmin();
  const parsed = parseInput(adminCreateGuestLeadSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const data = parsed.data;
  const serviceNames = await resolveServiceNames(
    data.serviceId,
    data.serviceNameEn,
    data.serviceNameUr,
  );

  if (serviceNames === null) {
    return errorResult("Service not found.");
  }

  const lead = await guestLeadRepository.create({
    referenceId: await generateGuestLeadReferenceId(),
    source: data.source,
    status: data.status,
    serviceId: serviceNames.serviceId,
    serviceNameEn: serviceNames.serviceNameEn,
    serviceNameUr: serviceNames.serviceNameUr,
    regionNameEn: data.regionNameEn,
    regionNameUr: data.regionNameUr ?? data.regionNameEn,
    cityName: data.cityName,
    fullName: data.fullName.trim(),
    phone: formatPhoneForDisplay(data.phone.trim()),
    email: data.email?.trim() || null,
    vehicleInfo: data.vehicleInfo?.trim() || null,
    licenseInfo: data.licenseInfo?.trim() || null,
    message: data.message?.trim() || null,
    locale: data.locale,
    adminNotes: data.adminNotes?.trim() || null,
  });

  await auditAdminAction({
    actorId: actor.id,
    action: "CREATE",
    entityType: "guest_lead",
    entityId: lead.id,
    after: { referenceId: lead.referenceId },
  });

  revalidateGuestLeadPaths(lead.id);

  return successResult({ id: lead.id });
}

export async function updateGuestLeadAdminAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requireSuperAdmin();
  const parsed = parseInput(adminUpdateGuestLeadSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const existing = await guestLeadRepository.findAdminById(parsed.data.id);

  if (!existing) {
    return errorResult("Support request not found.");
  }

  const data = parsed.data;
  const serviceNames = await resolveServiceNames(
    data.serviceId,
    data.serviceNameEn,
    data.serviceNameUr,
  );

  if (serviceNames === null) {
    return errorResult("Service not found.");
  }

  const updated = await guestLeadRepository.updateAdmin({
    id: data.id,
    source: data.source,
    status: data.status,
    serviceId: serviceNames.serviceId,
    serviceNameEn: serviceNames.serviceNameEn,
    serviceNameUr: serviceNames.serviceNameUr,
    regionNameEn: data.regionNameEn,
    regionNameUr: data.regionNameUr ?? data.regionNameEn,
    cityName: data.cityName,
    fullName: data.fullName.trim(),
    phone: formatPhoneForDisplay(data.phone.trim()),
    email: data.email?.trim() || null,
    vehicleInfo: data.vehicleInfo?.trim() || null,
    licenseInfo: data.licenseInfo?.trim() || null,
    message: data.message?.trim() || null,
    locale: data.locale,
    adminNotes: data.adminNotes?.trim() || null,
  });

  await auditAdminAction({
    actorId: actor.id,
    action: "UPDATE",
    entityType: "guest_lead",
    entityId: updated.id,
    after: { referenceId: updated.referenceId, status: updated.status },
  });

  revalidateGuestLeadPaths(updated.id);

  return successResult({ id: updated.id });
}

export async function deleteGuestLeadAdminAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requireSuperAdmin();
  const parsed = parseInput(deleteGuestLeadSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const existing = await guestLeadRepository.findAdminById(parsed.data.id);

  if (!existing) {
    return errorResult("Support request not found.");
  }

  await guestLeadRepository.deleteAdmin(parsed.data.id);

  await auditAdminAction({
    actorId: actor.id,
    action: "DELETE",
    entityType: "guest_lead",
    entityId: parsed.data.id,
    before: { referenceId: existing.referenceId },
  });

  revalidateGuestLeadPaths();

  return successResult({ id: parsed.data.id });
}
