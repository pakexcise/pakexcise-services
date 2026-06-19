import "server-only";

import { PrismaClient } from "@prisma/client";

import { isPlateFormatSchemaReady } from "@/server/db/is-plate-format-schema-ready";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn"] : ["error"],
  });
}

function resolvePrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;

  if (
    process.env.NODE_ENV === "development" &&
    cached &&
    !isPlateFormatSchemaReady(cached)
  ) {
    void cached.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma = resolvePrismaClient();

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
