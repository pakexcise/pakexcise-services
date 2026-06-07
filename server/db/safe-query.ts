import "server-only";

import { isDatabaseConfigured } from "@/server/db/config";

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
    if (process.env.NODE_ENV === "development") {
      console.error("[database]", error);
    }

    return fallback;
  }
}
