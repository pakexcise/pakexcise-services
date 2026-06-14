import "server-only";

import { Prisma } from "@prisma/client";

import { isDatabaseConfigured } from "@/server/db/config";

let hasLoggedConnectionWarning = false;

function isTransientConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return (
      error.code === "P1001" ||
      error.code === "P1002" ||
      error.code === "P1017" ||
      error.code === "P2024"
    );
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  return false;
}

function shouldUseFallback(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return (
      error.code === "P1001" ||
      error.code === "P1002" ||
      error.code === "P1017" ||
      error.code === "P2024"
    );
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  return false;
}

function logDatabaseError(error: unknown): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (isTransientConnectionError(error)) {
    if (!hasLoggedConnectionWarning) {
      hasLoggedConnectionWarning = true;
      console.warn(
        "[database] Database is unreachable. Public pages will use empty fallbacks until the connection recovers.",
      );
    }

    return;
  }

  console.error("[database]", error);
}

export async function safeDbQuery<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!isDatabaseConfigured()) {
    return fallback;
  }

  try {
    return await operation();
  } catch (error) {
    logDatabaseError(error);

    if (shouldUseFallback(error)) {
      return fallback;
    }

    throw error;
  }
}
