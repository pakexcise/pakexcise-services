import "server-only";

import { prisma } from "@/server/db/client";

export async function createOtpEmailUser(input: {
  email: string;
  name: string;
}) {
  const email = input.email.trim().toLowerCase();

  return prisma.user.create({
    data: {
      email,
      name: input.name.trim(),
      emailVerified: false,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}
