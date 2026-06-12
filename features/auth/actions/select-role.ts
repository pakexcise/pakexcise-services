"use server";

import { z } from "zod";

import { resolvePostLoginPath } from "@/features/auth/lib/redirect";
import { requireUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/client";

const selectRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "AGENT"]),
  callbackUrl: z.string().optional(),
});

export type SelectRoleResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: "INVALID_INPUT" | "FORBIDDEN" | "ALREADY_CHOSEN" };

export async function selectAccountRole(
  input: unknown,
): Promise<SelectRoleResult> {
  const user = await requireUser();
  const parsed = selectRoleSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  if (user.roleChosenAt) {
    return {
      ok: true,
      redirectTo: resolvePostLoginPath(user.role, parsed.data.callbackUrl),
    };
  }

  const callbackUrl = parsed.data.callbackUrl;

  const roleChosenAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE users
      SET
        role = ${parsed.data.role}::"UserRole",
        "roleChosenAt" = ${roleChosenAt}
      WHERE id = ${user.id}
    `;

    if (parsed.data.role === "AGENT") {
      const existingProfile = await tx.agentProfile.findUnique({
        where: { userId: user.id },
      });

      if (!existingProfile) {
        await tx.agentProfile.create({
          data: {
            userId: user.id,
            approvalStatus: "APPROVED",
            isActive: true,
          },
        });
      }
    }
  });

  return {
    ok: true,
    redirectTo: resolvePostLoginPath(parsed.data.role, callbackUrl),
  };
}
