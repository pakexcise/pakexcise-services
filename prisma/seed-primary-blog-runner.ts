import { PrismaClient } from "@prisma/client";

import { seedPrimaryBlogPost } from "./seed-primary-blog";
import { PRIMARY_BLOG_SLUG } from "./primary-blog-seed";

const prisma = new PrismaClient();

async function main() {
  const post = await seedPrimaryBlogPost(prisma, { replaceOtherPosts: true });
  console.log(
    `Primary blog seeded: ${post.slug} (id=${post.id}, featured=${post.isFeatured}, published=${post.isPublished}).`,
  );
  console.log(`Expected slug: ${PRIMARY_BLOG_SLUG}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
