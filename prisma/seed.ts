import { PrismaClient } from "@prisma/client";

import {
  defaultBusinessSettings,
  defaultFeatureFlagSettings,
  defaultPaymentSettings,
  defaultSeoSettings,
  defaultTrackingSettings,
} from "../features/settings/lib/defaults";
import { SETTINGS_KEYS } from "../features/settings/lib/keys";

const prisma = new PrismaClient();

const DEFAULT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

async function main() {
  console.log("Seeding PakExcise database...");

  const regions = [
    {
      slug: "punjab",
      nameEn: "Punjab",
      nameUr: "پنجاب",
      descriptionEn: "Excise facilitation services for Punjab province.",
      descriptionUr: "پنجاب صوبے کے لیے ایکسائز سہولت خدمات۔",
      displayOrder: 1,
    },
    {
      slug: "islamabad-ict",
      nameEn: "Islamabad ICT",
      nameUr: "اسلام آباد ICT",
      descriptionEn: "Excise facilitation services for Islamabad Capital Territory.",
      descriptionUr: "اسلام آباد دارالحکومت کے لیے ایکسائز سہولت خدمات۔",
      displayOrder: 2,
    },
  ] as const;

  for (const region of regions) {
    await prisma.region.upsert({
      where: { slug: region.slug },
      update: {
        nameEn: region.nameEn,
        nameUr: region.nameUr,
        descriptionEn: region.descriptionEn,
        descriptionUr: region.descriptionUr,
        displayOrder: region.displayOrder,
        isActive: true,
      },
      create: {
        ...region,
        isActive: true,
      },
    });
  }

  const punjab = await prisma.region.findUniqueOrThrow({
    where: { slug: "punjab" },
  });
  const ict = await prisma.region.findUniqueOrThrow({
    where: { slug: "islamabad-ict" },
  });

  const services = [
    {
      slug: "vehicle-transfer-punjab",
      regionId: punjab.id,
      nameEn: "Vehicle Transfer Punjab",
      nameUr: "گاڑی منتقلی پنجاب",
      shortDescriptionEn:
        "Private facilitation for vehicle ownership transfer in Punjab.",
      shortDescriptionUr: "پنجاب میں گاڑی کی ملکیت منتقلی کے لیے نجی سہولت۔",
      displayOrder: 1,
    },
    {
      slug: "vehicle-transfer-islamabad-ict",
      regionId: ict.id,
      nameEn: "Vehicle Transfer Islamabad ICT",
      nameUr: "گاڑی منتقلی اسلام آباد ICT",
      shortDescriptionEn:
        "Private facilitation for vehicle ownership transfer in Islamabad ICT.",
      shortDescriptionUr:
        "اسلام آباد ICT میں گاڑی کی ملکیت منتقلی کے لیے نجی سہولت۔",
      displayOrder: 2,
    },
    {
      slug: "token-tax-all-provinces",
      regionId: punjab.id,
      nameEn: "Token Tax All Provinces",
      nameUr: "ٹوکن ٹیکس تمام صوبے",
      shortDescriptionEn: "Private facilitation support for token tax processes.",
      shortDescriptionUr: "ٹوکن ٹیکس کے عمل کے لیے نجی سہولت سپورٹ۔",
      displayOrder: 3,
    },
    {
      slug: "new-vehicle-registration-punjab",
      regionId: punjab.id,
      nameEn: "New Vehicle Registration Punjab",
      nameUr: "نئی گاڑی رجسٹریشن پنجاب",
      shortDescriptionEn:
        "Private facilitation for new vehicle registration in Punjab.",
      shortDescriptionUr: "پنجاب میں نئی گاڑی رجسٹریشن کے لیے نجی سہولت۔",
      displayOrder: 4,
    },
    {
      slug: "driving-license-renewal-punjab",
      regionId: punjab.id,
      nameEn: "Driving License Renewal Punjab",
      nameUr: "ڈرائیving لائسنس تجدید پنجاب",
      shortDescriptionEn:
        "Private facilitation for driving license renewal in Punjab.",
      shortDescriptionUr: "پنجاب میں ڈرائیving لائسنس تجدید کے لیے نجی سہولت۔",
      displayOrder: 5,
    },
    {
      slug: "data-correction-islamabad-ict",
      regionId: ict.id,
      nameEn: "Data Correction Islamabad ICT",
      nameUr: "ڈیٹا تصحیح اسلام آباد ICT",
      shortDescriptionEn:
        "Private facilitation for excise record data correction in Islamabad ICT.",
      shortDescriptionUr:
        "اسلام آباد ICT میں ایکسائز ریکارڈ تصحیح کے لیے نجی سہولت۔",
      displayOrder: 6,
    },
  ] as const;

  for (const service of services) {
    const created = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        regionId: service.regionId,
        nameEn: service.nameEn,
        nameUr: service.nameUr,
        shortDescriptionEn: service.shortDescriptionEn,
        shortDescriptionUr: service.shortDescriptionUr,
        contentEn: `${service.shortDescriptionEn}\n\nOur team helps you prepare documents, submit your application, and track progress through a private facilitation service. PakExcise.com is not affiliated with any government department.`,
        contentUr: `${service.shortDescriptionUr}\n\nہماری ٹیم دستاویزات تیار کرنے، درخواست جمع کرانے اور پیش رفت ٹریک کرنے میں مدد کرتی ہے۔ PakExcise.com کسی سرکاری محکمے سے وابستہ نہیں ہے۔`,
        displayOrder: service.displayOrder,
        isActive: true,
      },
      create: {
        ...service,
        contentEn: `${service.shortDescriptionEn}\n\nOur team helps you prepare documents, submit your application, and track progress through a private facilitation service. PakExcise.com is not affiliated with any government department.`,
        contentUr: `${service.shortDescriptionUr}\n\nہماری ٹیم دستاویزات تیار کرنے، درخواست جمع کرانے اور پیش رفت ٹریک کرنے میں مدد کرتی ہے۔ PakExcise.com کسی سرکاری محکمے سے وابستہ نہیں ہے۔`,
        isActive: true,
        requiresProof: true,
      },
    });

    await prisma.serviceFormField.upsert({
      where: {
        serviceId_fieldKey: {
          serviceId: created.id,
          fieldKey: "applicant_name",
        },
      },
      update: {
        labelEn: "Applicant full name",
        labelUr: "درخواست دہندہ کا مکمل نام",
        fieldType: "TEXT",
        isRequired: true,
        displayOrder: 1,
        isActive: true,
      },
      create: {
        serviceId: created.id,
        fieldKey: "applicant_name",
        labelEn: "Applicant full name",
        labelUr: "درخواست دہندہ کا مکمل نام",
        placeholderEn: "Enter full name as per CNIC",
        placeholderUr: "شناختی کارڈ کے مطابق مکمل نام درج کریں",
        fieldType: "TEXT",
        isRequired: true,
        displayOrder: 1,
        validationJson: { minLength: 3, maxLength: 120 },
      },
    });

    await prisma.serviceFormField.upsert({
      where: {
        serviceId_fieldKey: {
          serviceId: created.id,
          fieldKey: "applicant_cnic",
        },
      },
      update: {
        labelEn: "CNIC number",
        labelUr: "شناختی کارڈ نمبر",
        fieldType: "CNIC",
        isRequired: true,
        isEncrypted: true,
        displayOrder: 2,
        isActive: true,
      },
      create: {
        serviceId: created.id,
        fieldKey: "applicant_cnic",
        labelEn: "CNIC number",
        labelUr: "شناختی کارڈ نمبر",
        placeholderEn: "12345-1234567-1",
        placeholderUr: "12345-1234567-1",
        fieldType: "CNIC",
        isRequired: true,
        isEncrypted: true,
        displayOrder: 2,
        validationJson: { pattern: "^\\d{5}-\\d{7}-\\d$" },
      },
    });

    await prisma.documentRequirement.upsert({
      where: {
        serviceId_docType: {
          serviceId: created.id,
          docType: "cnic_copy",
        },
      },
      update: {
        labelEn: "CNIC copy",
        labelUr: "شناختی کارڈ کی نقول",
        isRequired: true,
        displayOrder: 1,
        isActive: true,
      },
      create: {
        serviceId: created.id,
        docType: "cnic_copy",
        labelEn: "CNIC copy",
        labelUr: "شناختی کارڈ کی نقول",
        instructionsEn: "Upload a clear front and back copy of the CNIC.",
        instructionsUr: "شناختی کارڈ کی واضح سامنے اور پیچھے کی نقول اپ لوڈ کریں۔",
        isRequired: true,
        maxSizeBytes: 5242880,
        acceptedMimeTypes: DEFAULT_MIME_TYPES,
        displayOrder: 1,
      },
    });

    await prisma.seoMeta.upsert({
      where: { pageKey: `service:${service.slug}` },
      update: {
        serviceId: created.id,
        metaTitleEn: `${service.nameEn} | PakExcise.com`,
        metaTitleUr: `${service.nameUr} | PakExcise.com`,
        metaDescriptionEn: service.shortDescriptionEn,
        metaDescriptionUr: service.shortDescriptionUr,
        h1En: service.nameEn,
        h1Ur: service.nameUr,
        robotsIndex: true,
        robotsFollow: true,
      },
      create: {
        pageKey: `service:${service.slug}`,
        serviceId: created.id,
        metaTitleEn: `${service.nameEn} | PakExcise.com`,
        metaTitleUr: `${service.nameUr} | PakExcise.com`,
        metaDescriptionEn: service.shortDescriptionEn,
        metaDescriptionUr: service.shortDescriptionUr,
        h1En: service.nameEn,
        h1Ur: service.nameUr,
      },
    });
  }

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
  business.whatsappNumber = "923001234567";
  business.whatsappDefaultMessage =
    "Hello PakExcise, I need help with an excise facilitation service.";
  business.businessEmail = "support@pakexcise.com";
  business.phoneNumber = "+92 300 0000000";

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

  const globalFaqs = [
    {
      category: "general",
      questionEn: "Is PakExcise.com a government website?",
      questionUr: "کیا PakExcise.com سرکاری ویب سائٹ ہے؟",
      answerEn:
        "No. PakExcise.com is a private facilitation service and is not affiliated with any government department.",
      answerUr:
        "نہیں۔ PakExcise.com ایک نجی سہولت سروس ہے اور کسی بھی سرکاری محکمے سے وابستہ نہیں ہے۔",
      displayOrder: 1,
    },
    {
      category: "billing",
      questionEn: "Are service fees shown on the website?",
      questionUr: "کیا ویب سائٹ پر سروس فیس دکھائی جاتی ہے؟",
      answerEn:
        "No. PakExcise facilitation fees are shared only through invoices after admin review. Government official fees are listed separately on invoices when applicable.",
      answerUr:
        "نہیں۔ PakExcise سہولت فیس صرف ایڈمن جائزے کے بعد انوائس کے ذریعے شیئر کی جاتی ہے۔ سرکاری فیس جب لاگو ہو تو الگ دکھائی جاتی ہے۔",
      displayOrder: 2,
    },
    {
      category: "tracking",
      questionEn: "How do I track my application?",
      questionUr: "میں اپنی درخواست کیسے ٹریک کروں؟",
      answerEn:
        "Use your tracking ID on the Track page after submitting your application.",
      answerUr:
        "درخواست جمع کرانے کے بعد Track صفحے پر اپنا tracking ID استعمال کریں۔",
      displayOrder: 3,
    },
  ] as const;

  for (const faq of globalFaqs) {
    const existing = await prisma.fAQ.findFirst({
      where: {
        questionEn: faq.questionEn,
        serviceId: null,
      },
    });

    if (!existing) {
      await prisma.fAQ.create({
        data: {
          ...faq,
          serviceId: null,
        },
      });
    }
  }

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
      await prisma.fAQ.create({
        data: {
          serviceId: vehicleTransferPunjab.id,
          category: "documents",
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

  await prisma.socialLink.createMany({
    data: [
      {
        platform: "whatsapp",
        labelEn: "WhatsApp",
        labelUr: "واٹس ایپ",
        url: "https://wa.me/923001234567",
        iconName: "MessageCircle",
        displayOrder: 1,
      },
      {
        platform: "facebook",
        labelEn: "Facebook",
        labelUr: "فیس بک",
        url: "https://facebook.com/pakexcise",
        iconName: "Facebook",
        displayOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  for (const region of [punjab, ict]) {
    await prisma.seoMeta.upsert({
      where: { pageKey: `region:${region.slug}` },
      update: {
        regionId: region.id,
        metaTitleEn: `${region.nameEn} Services | PakExcise.com`,
        metaTitleUr: `${region.nameUr} خدمات | PakExcise.com`,
        metaDescriptionEn: region.descriptionEn,
        metaDescriptionUr: region.descriptionUr,
        h1En: region.nameEn,
        h1Ur: region.nameUr,
      },
      create: {
        pageKey: `region:${region.slug}`,
        regionId: region.id,
        metaTitleEn: `${region.nameEn} Services | PakExcise.com`,
        metaTitleUr: `${region.nameUr} خدمات | PakExcise.com`,
        metaDescriptionEn: region.descriptionEn,
        metaDescriptionUr: region.descriptionUr,
        h1En: region.nameEn,
        h1Ur: region.nameUr,
      },
    });
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
      titleEn: "About PakExcise.com",
      titleUr: "PakExcise.com کے بارے میں",
      excerptEn: "Learn about our private excise facilitation service.",
      excerptUr: "ہماری نجی ایکسائز سہولت سروس کے بارے میں جانیں۔",
      contentEn:
        "PakExcise.com is a private facilitation service that helps customers navigate excise-related processes in Pakistan.\n\nWe are not affiliated with any government department. Our role is to guide you through application preparation, document collection, status tracking, and communication — through a secure online platform.",
      contentUr:
        "PakExcise.com ایک نجی سہولت سروس ہے جو پاکستان میں ایکسائز سے متعلق عملوں میں صارفین کی مدد کرتی ہے۔\n\nہم کسی سرکاری محکمے سے وابستہ نہیں ہیں۔ ہمارا کردار درخواست کی تیاری، دستاویزات، اسٹیٹس ٹریکنگ اور رابطے میں رہنمائی کرنا ہے۔",
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

  await prisma.seoMeta.upsert({
    where: { pageKey: "home" },
    update: {
      metaTitleEn: "PakExcise.com | Private Excise Facilitation Pakistan",
      metaTitleUr: "PakExcise.com | پاکستان میں نجی ایکسائز سہولت",
      metaDescriptionEn:
        "Private excise facilitation for Pakistan. Not a government website.",
      metaDescriptionUr:
        "پاکستان کے لیے نجی ایکسائز سہولت۔ سرکاری ویب سائٹ نہیں۔",
      h1En: "Excise facilitation made simple",
      h1Ur: "ایکسائز سہولت اب آسان",
    },
    create: {
      pageKey: "home",
      metaTitleEn: "PakExcise.com | Private Excise Facilitation Pakistan",
      metaTitleUr: "PakExcise.com | پاکستان میں نجی ایکسائز سہولت",
      metaDescriptionEn:
        "Private excise facilitation for Pakistan. Not a government website.",
      metaDescriptionUr:
        "پاکستان کے لیے نجی ایکسائز سہولت۔ سرکاری ویب سائٹ نہیں۔",
      h1En: "Excise facilitation made simple",
      h1Ur: "ایکسائز سہولت اب آسان",
    },
  });

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
