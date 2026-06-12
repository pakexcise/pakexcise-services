import "server-only";

import type { AgentProfile, UserRole, UserStatus } from "@prisma/client";

import { ensureAgentProfileForUser } from "@/features/agents/lib/ensure-agent-profile";
import { AuthError } from "@/lib/errors/auth-errors";
import {
  getServerSession,
  getSessionTwoFactorVerifiedAt,
} from "@/server/auth/session";
import { prisma } from "@/server/db/client";

export type CurrentUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  roleChosenAt: Date | null;
  status: UserStatus;
  phone: string | null;
  twoFactorEnabled: boolean;
  agentProfile: AgentProfile | null;
  sessionId: string;
  sessionTwoFactorVerifiedAt: Date | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession();

  if (!session?.user?.id || !session.session?.id) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      deletedAt: null,
    },
    include: {
      agentProfile: true,
    },
  });

  if (!user) {
    return null;
  }

  const roleChosenAtRows = await prisma.$queryRaw<
    Array<{ roleChosenAt: Date | null }>
  >`
    SELECT "roleChosenAt"
    FROM users
    WHERE id = ${user.id}
    LIMIT 1
  `;
  const roleChosenAt = roleChosenAtRows[0]?.roleChosenAt ?? null;

  const agentProfile = await ensureAgentProfileForUser({
    userId: user.id,
    role: user.role,
    agentProfile: user.agentProfile,
  });

  const sessionTwoFactorVerifiedAt = await getSessionTwoFactorVerifiedAt(
    session.session.id,
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleChosenAt,
    status: user.status,
    phone: user.phone,
    twoFactorEnabled: user.twoFactorEnabled,
    agentProfile,
    sessionId: session.session.id,
    sessionTwoFactorVerifiedAt,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError("UNAUTHORIZED", "Authentication required");
  }

  if (user.status !== "ACTIVE") {
    throw new AuthError("ACCOUNT_DISABLED", "Account is not active");
  }

  return user;
}
