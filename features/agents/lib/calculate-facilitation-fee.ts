import "server-only";

import { prisma } from "@/server/db/client";

export async function getApplicationFacilitationFee(
  applicationId: string,
): Promise<number | null> {
  const invoice = await prisma.invoice.findFirst({
    where: {
      applicationId,
      status: { in: ["SENT", "PAID"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      lineItems: {
        where: { isOfficialFee: false },
        select: { amount: true },
      },
    },
  });

  if (!invoice || invoice.lineItems.length === 0) {
    return null;
  }

  const total = invoice.lineItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

  return total > 0 ? total : null;
}
