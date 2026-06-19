import "server-only";

import type { PrismaClient } from "@prisma/client";

const PLATE_FORMAT_DELEGATES = [
  "regionPlateFormatSection",
  "regionNumberPlateFormat",
] as const;

export function isPlateFormatSchemaReady(
  client: PrismaClient,
): boolean {
  return PLATE_FORMAT_DELEGATES.every((delegate) => {
    const value = (client as unknown as Record<string, unknown>)[delegate];
    return (
      typeof value === "object" &&
      value !== null &&
      "findMany" in value
    );
  });
}
