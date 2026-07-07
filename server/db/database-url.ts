import "server-only";

/**
 * Normalizes Neon pooled DATABASE_URL for Prisma + PgBouncer transaction mode.
 * See: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer
 */
export function resolvePrismaDatabaseUrl(rawUrl: string | undefined): string {
  const url = rawUrl?.trim();

  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    const isNeonPooler =
      parsed.hostname.includes("-pooler.") ||
      parsed.hostname.endsWith("-pooler");

    if (isNeonPooler && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }

    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "15");
    }

    return parsed.toString();
  } catch {
    return url;
  }
}
