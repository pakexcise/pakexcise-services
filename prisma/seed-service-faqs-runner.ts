import { PrismaClient } from "@prisma/client";

import { seedServiceFaqs } from "./seed-service-faqs";

const prisma = new PrismaClient();

seedServiceFaqs(prisma)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
