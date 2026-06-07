import { PrismaClient } from "@prisma/client";

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
        displayOrder: service.displayOrder,
        isActive: true,
      },
      create: {
        ...service,
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

  const faqs = [
    {
      questionEn: "Is PakExcise.com a government website?",
      questionUr: "کیا PakExcise.com سرکاری ویب سائٹ ہے؟",
      answerEn:
        "No. PakExcise.com is a private facilitation service and is not affiliated with any government department.",
      answerUr:
        "نہیں۔ PakExcise.com ایک نجی سہولت سروس ہے اور کسی بھی سرکاری محکمے سے وابستہ نہیں ہے۔",
      displayOrder: 1,
    },
    {
      questionEn: "Are service fees shown on the website?",
      questionUr: "کیا ویب سائٹ پر سروس فیس دکھائی جاتی ہے؟",
      answerEn:
        "No. PakExcise facilitation fees are shared only through invoices after admin review. Government official fees are listed separately on invoices when applicable.",
      answerUr:
        "نہیں۔ PakExcise سہولت فیس صرف ایڈمن جائزے کے بعد انوائس کے ذریعے شیئر کی جاتی ہے۔ سرکاری فیس جب لاگو ہو تو الگ دکھائی جاتی ہے۔",
      displayOrder: 2,
    },
    {
      questionEn: "How do I track my application?",
      questionUr: "میں اپنی درخواست کیسے ٹریک کروں؟",
      answerEn:
        "Use your tracking ID on the Track page after submitting your application.",
      answerUr:
        "درخواست جمع کرانے کے بعد Track صفحے پر اپنا tracking ID استعمال کریں۔",
      displayOrder: 3,
    },
  ] as const;

  for (const faq of faqs) {
    await prisma.fAQ.createMany({
      data: [faq],
      skipDuplicates: true,
    });
  }

  await prisma.socialLink.createMany({
    data: [
      {
        platform: "whatsapp",
        labelEn: "WhatsApp",
        labelUr: "واٹس ایپ",
        url: "https://wa.me/923001234567",
        displayOrder: 1,
      },
      {
        platform: "facebook",
        labelEn: "Facebook",
        labelUr: "فیس بک",
        url: "https://facebook.com/pakexcise",
        displayOrder: 2,
      },
    ],
    skipDuplicates: true,
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
