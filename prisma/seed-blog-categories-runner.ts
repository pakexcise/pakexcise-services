import { PrismaClient } from "@prisma/client";

import { seedBlogCategories } from "./seed-blog-categories";

const prisma = new PrismaClient();

async function main() {
  const ids = await seedBlogCategories(prisma);
  console.log(`Blog categories seeded (${ids.size} slugs).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
