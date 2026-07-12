import { PrismaClient } from "@prisma/client";

import {
  defaultBusinessSettings,
  defaultFeatureFlagSettings,
  defaultPaymentSettings,
  defaultSeoSettings,
  defaultTrackingSettings,
} from "../features/settings/lib/defaults";
import { SETTINGS_KEYS } from "../features/settings/lib/keys";
import {
  CONTACT_PAGE_SETTINGS_KEY,
  defaultContactPageSettings,
} from "../features/contact-page/lib/defaults";
import {
  HOME_PAGE_SETTINGS_KEY,
  defaultHomePageSettings,
} from "../features/home-page/lib/defaults";
import { ABOUT_PAGE_CONTENT } from "../features/about-page/lib/defaults";
import { seedUpsertStaticPageSeo } from "./seed-helpers/upsert-static-page-seo";
import { seedMarketingData } from "./seed-marketing-data";
import { seedFaqs } from "./seed-faqs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PakExcise database...");

  await seedMarketingData(prisma);

  const punjab = await prisma.region.findUniqueOrThrow({
    where: { slug: "punjab" },
  });

  await prisma.setting.upsert({
    where: { key: "site" },
    update: {
      value: {
        supportEmail: "support@pakexcise.com",
        supportPhone: "+92 300 0000000",
        businessHoursEn: "Mon–Sat, 10:00 AM – 6:00 PM PKT",
      },
    },
    create: {
      key: "site",
      value: {
        supportEmail: "support@pakexcise.com",
        supportPhone: "+92 300 0000000",
        businessHoursEn: "Mon–Sat, 10:00 AM – 6:00 PM PKT",
      },
    },
  });

  await prisma.setting.upsert({
    where: { key: "whatsapp" },
    update: {
      value: {
        phoneNumber: "923001234567",
        defaultMessage:
          "Hello PakExcise, I need help with an excise facilitation service.",
      },
    },
    create: {
      key: "whatsapp",
      value: {
        phoneNumber: "923001234567",
        defaultMessage:
          "Hello PakExcise, I need help with an excise facilitation service.",
      },
    },
  });

  const business = defaultBusinessSettings();
  business.businessEmail = "info@pakexcise.com";
  business.phoneNumber = "0345-0664441";
  business.whatsappNumber = "0345-0664441";
  business.whatsappDefaultMessage = "Hi PakExcise, I need help with a service.";
  business.businessHoursEn = "Monday to Sunday · 7:00 AM – 12:00 PM";

  for (const [group, value] of [
    [SETTINGS_KEYS.business, business],
    [SETTINGS_KEYS.payment, defaultPaymentSettings()],
    [SETTINGS_KEYS.seo, defaultSeoSettings()],
    [SETTINGS_KEYS.tracking, defaultTrackingSettings()],
    [SETTINGS_KEYS.features, defaultFeatureFlagSettings()],
  ] as const) {
    await prisma.setting.upsert({
      where: { key: group },
      update: { value },
      create: { key: group, value },
    });
  }

  const contactPageSettings = defaultContactPageSettings();
  await prisma.setting.upsert({
    where: { key: CONTACT_PAGE_SETTINGS_KEY },
    update: { value: contactPageSettings },
    create: { key: CONTACT_PAGE_SETTINGS_KEY, value: contactPageSettings },
  });

  await seedUpsertStaticPageSeo(prisma, "contact", {
    metaTitleEn: contactPageSettings.seo.metaTitleEn,
    metaDescriptionEn: contactPageSettings.seo.metaDescriptionEn,
    h1En: contactPageSettings.heroTitleEn,
    canonicalUrl: null,
    ogTitleEn: contactPageSettings.seo.metaTitleEn,
    ogDescriptionEn: contactPageSettings.seo.metaDescriptionEn,
    ogImage: null,
    twitterCard: "summary_large_image",
    robotsIndex: true,
    robotsFollow: true,
    faqSchemaJson: null,
    breadcrumbJson: null,
  });

  await seedUpsertStaticPageSeo(prisma, "contact", {
    metaTitleEn: contactPageSettings.seo.metaTitleEn,
    metaDescriptionEn: contactPageSettings.seo.metaDescriptionEn,
    h1En: contactPageSettings.heroTitleEn,
    canonicalUrl: null,
    ogTitleEn: contactPageSettings.seo.metaTitleEn,
    ogDescriptionEn: contactPageSettings.seo.metaDescriptionEn,
    ogImage: null,
    twitterCard: "summary_large_image",
    robotsIndex: true,
    robotsFollow: true,
    faqSchemaJson: null,
    breadcrumbJson: null,
  });

  const homePageSettings = defaultHomePageSettings();
  await prisma.setting.upsert({
    where: { key: HOME_PAGE_SETTINGS_KEY },
    update: { value: homePageSettings },
    create: { key: HOME_PAGE_SETTINGS_KEY, value: homePageSettings },
  });

  await seedUpsertStaticPageSeo(prisma, "home", {
    metaTitleEn: homePageSettings.seo.metaTitleEn,
    metaDescriptionEn: homePageSettings.seo.metaDescriptionEn,
    h1En: homePageSettings.seo.h1En,
    canonicalUrl: null,
    ogTitleEn: homePageSettings.seo.metaTitleEn,
    ogDescriptionEn: homePageSettings.seo.metaDescriptionEn,
    ogImage: null,
    twitterCard: "summary_large_image",
    robotsIndex: true,
    robotsFollow: true,
    faqSchemaJson: null,
    breadcrumbJson: null,
  });

  const featuredServiceSlugs = [
    "vehicle-transfer",
    "token-tax-payment",
    "new-vehicle-registration",
    "driving-license-renewal",
    "learner-license",
    "e-challan",
    "route-permit",
    "vehicle-data-correction",
  ] as const;

  for (const [index, slug] of featuredServiceSlugs.entries()) {
    await prisma.service.updateMany({
      where: { slug, deletedAt: null },
      data: {
        isFeatured: true,
        featuredDisplayOrder: index + 1,
        showInFooter: true,
        footerDisplayOrder: index + 1,
      },
    });
  }

  await seedFaqs(prisma);

  const vehicleTransferPunjab = await prisma.service.findUnique({
    where: { slug: "vehicle-transfer-punjab" },
  });

  if (vehicleTransferPunjab) {
    const serviceFaqExists = await prisma.fAQ.findFirst({
      where: {
        serviceId: vehicleTransferPunjab.id,
        questionEn: "What documents are needed for vehicle transfer in Punjab?",
      },
    });

    if (!serviceFaqExists) {
      const documentsCategory = await prisma.faqCategory.findUnique({
        where: { slug: "documents" },
        select: { id: true },
      });

      if (!documentsCategory) {
        throw new Error('Missing FAQ category for slug "documents"');
      }

      await prisma.fAQ.create({
        data: {
          serviceId: vehicleTransferPunjab.id,
          categoryId: documentsCategory.id,
          questionEn: "What documents are needed for vehicle transfer in Punjab?",
          answerEn:
            "Requirements vary by case. Your service page checklist shows the documents configured for your application type.",
          displayOrder: 1,
        },
      });
    }
  }

  const pageSeoEntries = [
    "services",
    "regions",
    "faqs",
    "guides",
    "blog",
    "track",
    "about",
    "contact",
    "privacy",
    "terms",
    "disclaimer",
    "refund",
    "how-it-works",
    "documents",
    "reviews",
    "agents",
    "agent-register",
    "payment-policy",
    "cookie-policy",
    "privacy-policy",
    "terms-and-conditions",
    "refund-policy",
  ] as const;

  for (const pageKey of pageSeoEntries) {
    await prisma.seoMeta.upsert({
      where: { pageKey },
      update: {},
      create: {
        pageKey,
        metaTitleEn: `${pageKey} | PakExcise.com`,
        robotsIndex: true,
        robotsFollow: true,
      },
    });
  }

  const pageContents = [
    {
      key: "about",
      titleEn: ABOUT_PAGE_CONTENT.titleEn,
      excerptEn: ABOUT_PAGE_CONTENT.excerptEn,
      contentEn: ABOUT_PAGE_CONTENT.contentEn,
    },
    {
      key: "contact",
      titleEn: "Contact us",
      excerptEn: "Reach PakExcise support by email, phone, or WhatsApp.",
      contentEn:
        "Email: support@pakexcise.com\nPhone: +92 300 0000000\nHours: Mon–Sat, 10:00 AM – 6:00 PM PKT\n\nPakExcise.com is a private facilitation service and is not affiliated with any government department.",
    },
    {
      key: "track",
      titleEn: "Track your application",
      excerptEn: "Check your application status with your tracking ID.",
      contentEn:
        "After submitting your application, you receive a tracking ID by email and WhatsApp.\n\nEnter your tracking ID below to check status updates. For full details, log in to your customer dashboard.",
    },
    {
      key: "privacy",
      titleEn: "Privacy Policy",
      excerptEn: "How PakExcise.com handles your personal information.",
      contentEn:
        "PakExcise.com protects your personal data using encryption for sensitive fields, secure document storage, and server-side access controls.\n\nWe do not sell your data. We only use information required to process your facilitation request.",
    },
    {
      key: "terms",
      titleEn: "Terms of Service",
      excerptEn: "Terms for using PakExcise.com private facilitation services.",
      contentEn:
        "By using PakExcise.com, you agree that this is a private facilitation service and not a government portal.\n\nService scope, timelines, and deliverables are communicated during application review.",
    },
    {
      key: "disclaimer",
      titleEn: "Disclaimer",
      excerptEn: "Important notice about PakExcise.com private service status.",
      contentEn:
        "PakExcise.com is a private facilitation service. We are not affiliated with, endorsed by, or connected to any federal, provincial, or local government excise authority.",
    },
    {
      key: "refund",
      titleEn: "Refund Policy",
      excerptEn: "Refund terms for PakExcise facilitation services.",
      contentEn:
        "Refund eligibility depends on application status and work completed. Contact support with your tracking ID for refund review.\n\nGovernment official fees are non-refundable through PakExcise.",
    },
  ] as const;

  for (const page of pageContents) {
    await prisma.setting.upsert({
      where: { key: `page:${page.key}` },
      update: { value: page },
      create: { key: `page:${page.key}`, value: page },
    });
  }

  const guide = await prisma.guide.upsert({
    where: { slug: "vehicle-transfer-checklist" },
    update: {
      titleEn: "Vehicle transfer document checklist",
      excerptEn: "Prepare your documents before starting a vehicle transfer application.",
      contentEn:
        "1. Verify seller and buyer CNIC copies.\n2. Collect registration book and number plates information.\n3. Prepare sale agreement if applicable.\n4. Start your PakExcise application and upload documents securely.",
      isPublished: true,
      publishedAt: new Date(),
    },
    create: {
      slug: "vehicle-transfer-checklist",
      titleEn: "Vehicle transfer document checklist",
      excerptEn: "Prepare your documents before starting a vehicle transfer application.",
      contentEn:
        "1. Verify seller and buyer CNIC copies.\n2. Collect registration book and number plates information.\n3. Prepare sale agreement if applicable.\n4. Start your PakExcise application and upload documents securely.",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.seoMeta.upsert({
    where: { pageKey: `guide:${guide.slug}` },
    update: {
      guideId: guide.id,
      metaTitleEn: `${guide.titleEn} | PakExcise.com`,
      h1En: guide.titleEn,
    },
    create: {
      pageKey: `guide:${guide.slug}`,
      guideId: guide.id,
      metaTitleEn: `${guide.titleEn} | PakExcise.com`,
      h1En: guide.titleEn,
    },
  });

  await prisma.$executeRaw`
    UPDATE users
    SET "roleChosenAt" = "createdAt"
    WHERE "roleChosenAt" IS NULL
  `;

  await prisma.$executeRaw`
    UPDATE agent_profiles
    SET "approvalStatus" = 'APPROVED'
    WHERE "approvalStatus" = 'PENDING'
  `;

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
