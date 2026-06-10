import "server-only";

import type { AgentProfile } from "@prisma/client";

import { prisma } from "@/server/db/client";

/**
 * Agent access requires both users.role = AGENT and a row in agent_profiles.
 * Direct DB role updates (outside admin promote flow) may skip profile creation.
 */
export async function ensureAgentProfileForUser(input: {
  userId: string;
  role: string;
  agentProfile: AgentProfile | null;
}): Promise<AgentProfile | null> {
  if (input.role !== "AGENT") {
    return input.agentProfile;
  }

  if (input.agentProfile) {
    return input.agentProfile;
  }

  return prisma.agentProfile.create({
    data: {
      userId: input.userId,
      approvalStatus: "APPROVED",
      isActive: true,
    },
  });
}
