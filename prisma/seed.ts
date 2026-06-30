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
        businessHoursUr: "پیر تا ہفتہ، صبح 10:00 تا شام 6:00 بجے PKT",
      },
    },
    create: {
      key: "site",
      value: {
        supportEmail: "support@pakexcise.com",
        supportPhone: "+92 300 0000000",
        businessHoursEn: "Mon–Sat, 10:00 AM – 6:00 PM PKT",
        businessHoursUr: "پیر تا ہفتہ، صبح 10:00 تا شام 6:00 بجے PKT",
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
  business.businessHoursUr = "پیر تا اتوار · صبح 7:00 – 12:00";

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
    metaTitleUr: contactPageSettings.seo.metaTitleUr,
    metaDescriptionEn: contactPageSettings.seo.metaDescriptionEn,
    metaDescriptionUr: contactPageSettings.seo.metaDescriptionUr,
    h1En: contactPageSettings.heroTitleEn,
    h1Ur: contactPageSettings.heroTitleUr,
    canonicalUrl: null,
    ogTitleEn: contactPageSettings.seo.metaTitleEn,
    ogTitleUr: contactPageSettings.seo.metaTitleUr,
    ogDescriptionEn: contactPageSettings.seo.metaDescriptionEn,
    ogDescriptionUr: contactPageSettings.seo.metaDescriptionUr,
    ogImage: null,
    twitterCard: "summary_large_image",
    robotsIndex: true,
    robotsFollow: true,
    faqSchemaJson: null,
    breadcrumbJson: null,
  });

  await seedUpsertStaticPageSeo(prisma, "contact", {
    metaTitleEn: contactPageSettings.seo.metaTitleEn,
    metaTitleUr: contactPageSettings.seo.metaTitleUr,
    metaDescriptionEn: contactPageSettings.seo.metaDescriptionEn,
    metaDescriptionUr: contactPageSettings.seo.metaDescriptionUr,
    h1En: contactPageSettings.heroTitleEn,
    h1Ur: contactPageSettings.heroTitleUr,
    canonicalUrl: null,
    ogTitleEn: contactPageSettings.seo.metaTitleEn,
    ogTitleUr: contactPageSettings.seo.metaTitleUr,
    ogDescriptionEn: contactPageSettings.seo.metaDescriptionEn,
    ogDescriptionUr: contactPageSettings.seo.metaDescriptionUr,
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
    metaTitleUr: homePageSettings.seo.metaTitleUr,
    metaDescriptionEn: homePageSettings.seo.metaDescriptionEn,
    metaDescriptionUr: homePageSettings.seo.metaDescriptionUr,
    h1En: homePageSettings.seo.h1En,
    h1Ur: homePageSettings.seo.h1Ur,
    canonicalUrl: null,
    ogTitleEn: homePageSettings.seo.metaTitleEn,
    ogTitleUr: homePageSettings.seo.metaTitleUr,
    ogDescriptionEn: homePageSettings.seo.metaDescriptionEn,
    ogDescriptionUr: homePageSettings.seo.metaDescriptionUr,
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
          questionUr: "پنجاب میں گاڑی منتقلی کے لیے کون سی دستاویزات درکار ہیں؟",
          answerEn:
            "Requirements vary by case. Your service page checklist shows the documents configured for your application type.",
          answerUr:
            "ضروریات کیس کے مطابق مختلف ہو سکتی ہیں۔ آپ کے سروس صفحے کی چیک لسٹ میں آپ کی درخواست کی قسم کے لیے ترتیب شدہ دستاویزات دکھائی جاتی ہیں۔",
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
        metaTitleUr: `${pageKey} | PakExcise.com`,
        robotsIndex: true,
        robotsFollow: true,
      },
    });
  }

  const pageContents = [
    {
      key: "about",
      titleEn: ABOUT_PAGE_CONTENT.titleEn,
      titleUr: ABOUT_PAGE_CONTENT.titleUr,
      excerptEn: ABOUT_PAGE_CONTENT.excerptEn,
      excerptUr: ABOUT_PAGE_CONTENT.excerptUr,
      contentEn: ABOUT_PAGE_CONTENT.contentEn,
      contentUr: ABOUT_PAGE_CONTENT.contentUr,
    },
    {
      key: "contact",
      titleEn: "Contact us",
      titleUr: "ہم سے رابطہ کریں",
      excerptEn: "Reach PakExcise support by email, phone, or WhatsApp.",
      excerptUr: "ای میل، فون یا واٹس ایپ کے ذریعے PakExcise سپورٹ سے رابطہ کریں۔",
      contentEn:
        "Email: support@pakexcise.com\nPhone: +92 300 0000000\nHours: Mon–Sat, 10:00 AM – 6:00 PM PKT\n\nPakExcise.com is a private facilitation service and is not affiliated with any government department.",
      contentUr:
        "ای میل: support@pakexcise.com\nفون: +92 300 0000000\nاوقات: پیر تا ہفتہ، صبح 10:00 تا شام 6:00 بجے PKT\n\nPakExcise.com نجی سہولت سروس ہے اور کسی سرکاری محکمے سے وابستہ نہیں ہے۔",
    },
    {
      key: "track",
      titleEn: "Track your application",
      titleUr: "اپنی درخواست ٹریک کریں",
      excerptEn: "Check your application status with your tracking ID.",
      excerptUr: "اپنی ٹریکنگ ID سے درخواست کی حیثیت دیکھیں۔",
      contentEn:
        "After submitting your application, you receive a tracking ID by email and WhatsApp.\n\nEnter your tracking ID below to check status updates. For full details, log in to your customer dashboard.",
      contentUr:
        "درخواست جمع کرانے کے بعد آپ کو ای میل اور واٹس ایپ پر ٹریکنگ ID ملتی ہے۔\n\nاسٹیٹس اپ ڈیٹس دیکھنے کے لیے نیچے ٹریکنگ ID درج کریں۔ مکمل تفصیلات کے لیے کسٹمر ڈیش بورڈ میں لاگ ان کریں۔",
    },
    {
      key: "privacy",
      titleEn: "Privacy Policy",
      titleUr: "رازداری کی پالیسی",
      excerptEn: "How PakExcise.com handles your personal information.",
      excerptUr: "PakExcise.com آپ کی ذاتی معلومات کیسے سنبھالتا ہے۔",
      contentEn:
        "PakExcise.com protects your personal data using encryption for sensitive fields, secure document storage, and server-side access controls.\n\nWe do not sell your data. We only use information required to process your facilitation request.",
      contentUr:
        "PakExcise.com حساس فیلڈز کی خفیہ کاری، محفوظ دستاویز اسٹوریج اور سرور سائیڈ کنٹرولز کے ذریعے آپ کے ذاتی ڈیٹا کی حفاظت کرتا ہے۔\n\nہم آپ کا ڈیٹا فروخت نہیں کرتے۔",
    },
    {
      key: "terms",
      titleEn: "Terms of Service",
      titleUr: "شرائط و ضوابط",
      excerptEn: "Terms for using PakExcise.com private facilitation services.",
      excerptUr: "PakExcise.com نجی سہولت خدمات استعمال کرنے کی شرائط۔",
      contentEn:
        "By using PakExcise.com, you agree that this is a private facilitation service and not a government portal.\n\nService scope, timelines, and deliverables are communicated during application review.",
      contentUr:
        "PakExcise.com استعمال کر کے آپ تسلیم کرتے ہیں کہ یہ نجی سہولت سروس ہے، سرکاری پورٹل نہیں۔\n\nسروس کا دائرہ، ٹائم لائن اور نتائج درخواست کے جائزے کے دوران بتائے جاتے ہیں۔",
    },
    {
      key: "disclaimer",
      titleEn: "Disclaimer",
      titleUr: "ڈس کلیمر",
      excerptEn: "Important notice about PakExcise.com private service status.",
      excerptUr: "PakExcise.com نجی سروس کے بارے میں اہم نوٹس۔",
      contentEn:
        "PakExcise.com is a private facilitation service. We are not affiliated with, endorsed by, or connected to any federal, provincial, or local government excise authority.",
      contentUr:
        "PakExcise.com نجی سہولت سروس ہے۔ ہم کسی بھی سرکاری، صوبائی یا مقامی ایکسائز اتھارٹی سے وابستہ نہیں ہیں۔",
    },
    {
      key: "refund",
      titleEn: "Refund Policy",
      titleUr: "واپسی کی پالیسی",
      excerptEn: "Refund terms for PakExcise facilitation services.",
      excerptUr: "PakExcise سہولت خدمات کے لیے واپسی کی شرائط۔",
      contentEn:
        "Refund eligibility depends on application status and work completed. Contact support with your tracking ID for refund review.\n\nGovernment official fees are non-refundable through PakExcise.",
      contentUr:
        "واپسی کی اہلیت درخواست کی حیثیت اور مکمل کام پر منحصر ہے۔ واپسی کے جائزے کے لیے ٹریکنگ ID کے ساتھ سپورٹ سے رابطہ کریں۔\n\nسرکاری فیس PakExcise کے ذریعے واپس نہیں ہوتیں۔",
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
      titleUr: "گاڑی منتقلی دستاویزات چیک لسٹ",
      excerptEn: "Prepare your documents before starting a vehicle transfer application.",
      excerptUr: "گاڑی منتقلی درخواست شروع کرنے سے پہلے دستاویزات تیار کریں۔",
      contentEn:
        "1. Verify seller and buyer CNIC copies.\n2. Collect registration book and number plates information.\n3. Prepare sale agreement if applicable.\n4. Start your PakExcise application and upload documents securely.",
      contentUr:
        "1. بیچنے والے اور خریدار کی شناختی کارڈ کی نقول چیک کریں۔\n2. رجسٹریشن بک اور نمبر پلیٹس کی معلومات جمع کریں۔\n3. اگر لاگو ہو تو فروخت معاہدہ تیار کریں۔\n4. PakExcise درخواست شروع کریں اور دستاویزات محفوظ اپ لوڈ کریں۔",
      isPublished: true,
      publishedAt: new Date(),
    },
    create: {
      slug: "vehicle-transfer-checklist",
      titleEn: "Vehicle transfer document checklist",
      titleUr: "گاڑی منتقلی دستاویزات چیک لسٹ",
      excerptEn: "Prepare your documents before starting a vehicle transfer application.",
      excerptUr: "گاڑی منتقلی درخواست شروع کرنے سے پہلے دستاویزات تیار کریں۔",
      contentEn:
        "1. Verify seller and buyer CNIC copies.\n2. Collect registration book and number plates information.\n3. Prepare sale agreement if applicable.\n4. Start your PakExcise application and upload documents securely.",
      contentUr:
        "1. بیچنے والے اور خریدار کی شناختی کارڈ کی نقول چیک کریں۔\n2. رجسٹریشن بک اور نمبر پلیٹس کی معلومات جمع کریں۔\n3. اگر لاگو ہو تو فروخت معاہدہ تیار کریں۔\n4. PakExcise درخواست شروع کریں اور دستاویزات محفوظ اپ لوڈ کریں۔",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.seoMeta.upsert({
    where: { pageKey: `guide:${guide.slug}` },
    update: {
      guideId: guide.id,
      metaTitleEn: `${guide.titleEn} | PakExcise.com`,
      metaTitleUr: `${guide.titleUr} | PakExcise.com`,
      h1En: guide.titleEn,
      h1Ur: guide.titleUr,
    },
    create: {
      pageKey: `guide:${guide.slug}`,
      guideId: guide.id,
      metaTitleEn: `${guide.titleEn} | PakExcise.com`,
      metaTitleUr: `${guide.titleUr} | PakExcise.com`,
      h1En: guide.titleEn,
      h1Ur: guide.titleUr,
    },
  });

  const blogPost = await prisma.blogPost.upsert({
    where: { slug: "welcome-to-pakexcise" },
    update: {
      titleEn: "Welcome to PakExcise.com",
      titleUr: "PakExcise.com میں خوش آمدید",
      excerptEn: "A clearer way to manage excise facilitation requests in Pakistan.",
      excerptUr: "پاکستان میں ایکسائز سہولت درخواستوں کے لیے بہتر طریقہ۔",
      contentEn:
        "PakExcise.com launches as a private facilitation platform for excise-related services.\n\nBrowse services, submit applications, upload documents, and track progress — with English and Urdu support.",
      contentUr:
        "PakExcise.com ایکسائز سے متعلق خدمات کے لیے نجی سہولت پلیٹ فارم کے طور پر لانچ ہوا ہے۔\n\nخدمات دیکھیں، درخواستیں جمع کرائیں، دستاویزات اپ لوڈ کریں اور پیش رفت ٹریک کریں۔",
      isPublished: true,
      publishedAt: new Date(),
    },
    create: {
      slug: "welcome-to-pakexcise",
      titleEn: "Welcome to PakExcise.com",
      titleUr: "PakExcise.com میں خوش آمدید",
      excerptEn: "A clearer way to manage excise facilitation requests in Pakistan.",
      excerptUr: "پاکستان میں ایکسائز سہولت درخواستوں کے لیے بہتر طریقہ۔",
      contentEn:
        "PakExcise.com launches as a private facilitation platform for excise-related services.\n\nBrowse services, submit applications, upload documents, and track progress — with English and Urdu support.",
      contentUr:
        "PakExcise.com ایکسائز سے متعلق خدمات کے لیے نجی سہولت پلیٹ فارم کے طور پر لانچ ہوا ہے۔\n\nخدمات دیکھیں، درخواستیں جمع کرائیں، دستاویزات اپ لوڈ کریں اور پیش رفت ٹریک کریں۔",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.seoMeta.upsert({
    where: { pageKey: `blog:${blogPost.slug}` },
    update: {
      blogPostId: blogPost.id,
      metaTitleEn: `${blogPost.titleEn} | PakExcise.com`,
      metaTitleUr: `${blogPost.titleUr} | PakExcise.com`,
      h1En: blogPost.titleEn,
      h1Ur: blogPost.titleUr,
    },
    create: {
      pageKey: `blog:${blogPost.slug}`,
      blogPostId: blogPost.id,
      metaTitleEn: `${blogPost.titleEn} | PakExcise.com`,
      metaTitleUr: `${blogPost.titleUr} | PakExcise.com`,
      h1En: blogPost.titleEn,
      h1Ur: blogPost.titleUr,
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
