import "server-only";

import { headers } from "next/headers";

import { auth, type Session } from "@/server/auth/config";
import { prisma } from "@/server/db/client";

export type ServerSession = Session;

export type SessionMeta = {
  ipAddress: string | null;
  userAgent: string | null;
};

export async function getServerSession(): Promise<ServerSession | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return session;
}

export async function getSessionTwoFactorVerifiedAt(
  sessionId: string,
): Promise<Date | null> {
  const record = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { twoFactorVerifiedAt: true },
  });

  return record?.twoFactorVerifiedAt ?? null;
}

export async function getSessionImpersonationMeta(sessionId: string): Promise<{
  impersonatedBy: string | null;
}> {
  const record = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { impersonatedBy: true },
  });

  return {
    impersonatedBy: record?.impersonatedBy ?? null,
  };
}

export async function markSessionTwoFactorVerified(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { twoFactorVerifiedAt: new Date() },
  });
}

export async function clearSessionTwoFactorVerified(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { twoFactorVerifiedAt: null },
  });
}

export function getRequestMetaFromHeaders(
  headerStore: Headers,
): SessionMeta {
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ?? realIp ?? null;

  return {
    ipAddress,
    userAgent: headerStore.get("user-agent"),
  };
}

export async function getRequestMeta(): Promise<SessionMeta> {
  return getRequestMetaFromHeaders(await headers());
}

export function hasSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) {
    return false;
  }

  return (
    cookieHeader.includes("better-auth.session_token=") ||
    cookieHeader.includes("__Secure-better-auth.session_token=")
  );
}
