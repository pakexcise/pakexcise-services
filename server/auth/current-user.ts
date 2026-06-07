import "server-only";

import type { AgentProfile, UserRole, UserStatus } from "@prisma/client";

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

  const sessionTwoFactorVerifiedAt = await getSessionTwoFactorVerifiedAt(
    session.session.id,
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone,
    twoFactorEnabled: user.twoFactorEnabled,
    agentProfile: user.agentProfile,
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
