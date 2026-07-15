import { PrismaClient } from "@prisma/client";

import { seedReviews } from "./seed-marketing-data";

const prisma = new PrismaClient();

seedReviews(prisma)
  .then(() => {
    console.log("Review drafts seeded for all active services.");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
