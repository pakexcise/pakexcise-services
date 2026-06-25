import { PrismaClient } from "@prisma/client";

const WRONG = "ڈرائیving";
const CORRECT = "ڈرائیونگ";

function fixText(value: string) {
  if (!value.includes(WRONG)) {
    return value;
  }

  return value.replaceAll(WRONG, CORRECT);
}

function fixOptionalText(value: string | null | undefined) {
  if (!value) {
    return value;
  }

  return fixText(value);
}

export async function fixUrduDrivingText(prisma: PrismaClient) {
  let updated = 0;

  const services = await prisma.service.findMany({
    select: {
      id: true,
      nameUr: true,
      shortDescriptionUr: true,
      contentUr: true,
      ctaTextUr: true,
      processingNotesUr: true,
    },
  });

  for (const service of services) {
    const data = {
      nameUr: fixText(service.nameUr),
      shortDescriptionUr: fixOptionalText(service.shortDescriptionUr),
      contentUr: fixOptionalText(service.contentUr),
      ctaTextUr: fixOptionalText(service.ctaTextUr),
      processingNotesUr: fixOptionalText(service.processingNotesUr),
    };

    const hasChanges = Object.entries(data).some(
      ([field, value]) => value !== service[field as keyof typeof service],
    );

    if (!hasChanges) {
      continue;
    }

    await prisma.service.update({
      where: { id: service.id },
      data,
    });
    updated += 1;
  }

  const categories = await prisma.serviceCategory.findMany({
    select: {
      id: true,
      nameUr: true,
      descriptionUr: true,
    },
  });

  for (const category of categories) {
    const data = {
      nameUr: fixText(category.nameUr),
      descriptionUr: fixOptionalText(category.descriptionUr),
    };

    const hasChanges = Object.entries(data).some(
      ([field, value]) => value !== category[field as keyof typeof category],
    );

    if (!hasChanges) {
      continue;
    }

    await prisma.serviceCategory.update({
      where: { id: category.id },
      data,
    });
    updated += 1;
  }

  const blogPosts = await prisma.blogPost.findMany({
    select: {
      id: true,
      titleUr: true,
      excerptUr: true,
      contentUr: true,
    },
  });

  for (const post of blogPosts) {
    const data = {
      titleUr: fixText(post.titleUr),
      excerptUr: fixOptionalText(post.excerptUr),
      contentUr: fixText(post.contentUr),
    };

    const hasChanges = Object.entries(data).some(
      ([field, value]) => value !== post[field as keyof typeof post],
    );

    if (!hasChanges) {
      continue;
    }

    await prisma.blogPost.update({
      where: { id: post.id },
      data,
    });
    updated += 1;
  }

  const guides = await prisma.guide.findMany({
    select: {
      id: true,
      titleUr: true,
      excerptUr: true,
      contentUr: true,
    },
  });

  for (const guide of guides) {
    const data = {
      titleUr: fixText(guide.titleUr),
      excerptUr: fixOptionalText(guide.excerptUr),
      contentUr: fixText(guide.contentUr),
    };

    const hasChanges = Object.entries(data).some(
      ([field, value]) => value !== guide[field as keyof typeof guide],
    );

    if (!hasChanges) {
      continue;
    }

    await prisma.guide.update({
      where: { id: guide.id },
      data,
    });
    updated += 1;
  }

  return updated;
}

const prisma = new PrismaClient();

fixUrduDrivingText(prisma)
  .then((count) => {
    console.log(`Fixed Urdu driving text in ${count} record update(s).`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
