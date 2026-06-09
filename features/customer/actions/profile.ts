"use server";

import { updateCustomerProfileSchema } from "@/features/customer/validators";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { normalizePakistanPhone } from "@/lib/validations/phone";
import { prisma } from "@/server/db/client";
import { requireCustomerPortal } from "@/server/permissions/guards";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

export async function updateCustomerProfileAction(
  input: unknown,
): Promise<ActionResult<{ name: string; phone: string }>> {
  const user = await requireCustomerPortal();
  await enforceRateLimit(serverActionRateLimit, `profile:${user.id}`);

  const parsed = parseInput(updateCustomerProfileSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const normalizedPhone = normalizePakistanPhone(parsed.data.phone);

  if (!normalizedPhone) {
    return errorResult("Invalid Pakistani mobile number.");
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      phone: normalizedPhone,
      phoneNumber: normalizedPhone,
    },
    select: {
      name: true,
      phone: true,
    },
  });

  return successResult({
    name: updated.name ?? parsed.data.name,
    phone: updated.phone ?? normalizedPhone,
  });
}
