import { PrismaClient } from "@prisma/client";

import { seedLegalPages } from "./seed-legal-pages";

const prisma = new PrismaClient();

async function main() {
  await seedLegalPages(prisma);
  console.log("Legal pages seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
