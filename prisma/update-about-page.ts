import { PrismaClient } from "@prisma/client";

import {
  ABOUT_PAGE_CONTENT,
  ABOUT_PAGE_SEO} from "../features/about-page/lib/defaults";

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: "page:about" },
    update: { value: ABOUT_PAGE_CONTENT },
    create: { key: "page:about", value: ABOUT_PAGE_CONTENT }});

  await prisma.seoMeta.upsert({
    where: { pageKey: "about" },
    update: {
      metaTitleEn: ABOUT_PAGE_SEO.metaTitleEn,
      metaDescriptionEn: ABOUT_PAGE_SEO.metaDescriptionEn,
      h1En: ABOUT_PAGE_SEO.h1En,
      ogTitleEn: ABOUT_PAGE_SEO.metaTitleEn,
      ogDescriptionEn: ABOUT_PAGE_SEO.metaDescriptionEn,
      canonicalUrl: "/about",
      robotsIndex: true,
      robotsFollow: true},
    create: {
      pageKey: "about",
      metaTitleEn: ABOUT_PAGE_SEO.metaTitleEn,
      metaDescriptionEn: ABOUT_PAGE_SEO.metaDescriptionEn,
      h1En: ABOUT_PAGE_SEO.h1En,
      ogTitleEn: ABOUT_PAGE_SEO.metaTitleEn,
      ogDescriptionEn: ABOUT_PAGE_SEO.metaDescriptionEn,
      canonicalUrl: "/about",
      robotsIndex: true,
      robotsFollow: true}});

  console.log("About page content and SEO updated successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
