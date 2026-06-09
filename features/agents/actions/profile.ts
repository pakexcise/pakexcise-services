"use server";

import { updateAgentProfileSchema } from "@/features/agents/validators";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { normalizePakistanPhone } from "@/lib/validations/phone";
import { prisma } from "@/server/db/client";
import { requireAgent } from "@/server/permissions/guards";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

export async function updateAgentProfileAction(
  input: unknown,
): Promise<ActionResult<{ name: string; phone: string }>> {
  const user = await requireAgent();
  await enforceRateLimit(serverActionRateLimit, `agent-profile:${user.id}`);

  const parsed = parseInput(updateAgentProfileSchema, input);

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
