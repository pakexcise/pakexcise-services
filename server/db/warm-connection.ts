import "server-only";

import { isDatabaseConfigured } from "@/server/db/config";
import { prisma } from "@/server/db/prisma";

const MAX_ATTEMPTS = 4;
const RETRY_DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Verifies database reachability at startup with a single lightweight query.
 * Avoid prisma.$connect() — it eagerly opens the full connection pool; on Neon
 * pooled hosts idle connections are closed and Prisma logs recurring
 * "Error { kind: Closed, cause: None }" during pool health checks.
 */
export async function warmDatabaseConnection(): Promise<void> {
  if (!isDatabaseConfigured()) {
    return;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch {
      if (attempt === MAX_ATTEMPTS) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[database] Startup connection failed. The app will retry on the next request.",
          );
        }

        return;
      }

      await delay(RETRY_DELAY_MS * attempt);
    }
  }
}
