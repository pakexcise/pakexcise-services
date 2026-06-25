import { PrismaClient } from "@prisma/client";

import { seedFaqs } from "./seed-faqs";

const prisma = new PrismaClient();

seedFaqs(prisma)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
