export type ServiceFaqSeed = {
  serviceSlug: string;
  categorySlug: "services";
  displayOrder: number;
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
  regionSlug?: string;
  seoKeywordsEn?: string;
  seoKeywordsUr?: string;
};

export const SERVICE_FAQ_SEEDS: ServiceFaqSeed[] = [
  // ── Vehicle Transfer (8) ──────────────────────────────────────────────────
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is vehicle transfer service in PakExcise?",
    questionUr: "پاک ایکسائز میں گاڑی منتقلی کی سروس کیا ہے؟",
    answerEn:
      "PakExcise provides private facilitation support for vehicle ownership transfer in supported regions such as Punjab and Islamabad ICT. Our team guides users about required documents, biometric steps, vehicle record details, and application progress.",
    answerUr:
      "پاک ایکسائز پنجاب اور اسلام آباد ICT جیسے معاون علاقوں میں گاڑی کی ملکیت منتقلی کے لیے نجی سہولت فراہم کرتا ہے۔ ہماری ٹیم ضروری دستاویزات، بائیومیٹرک مراحل، گاڑی ریکارڈ کی تفصیلات اور درخواست کی پیش رفت کے بارے میں رہنمائی کرتی ہے۔",
    seoKeywordsEn:
      "vehicle transfer, ownership transfer, Punjab, Islamabad ICT, excise facilitation",
    seoKeywordsUr:
      "گاڑی منتقلی, ملکیت منتقلی, پنجاب, اسلام آباد, ایکسائز سہولت",
  },
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Is PakExcise a government vehicle transfer portal?",
    questionUr: "کیا پاک ایکسائز سرکاری گاڑی منتقلی پورٹل ہے؟",
    answerEn:
      "No. PakExcise.com is a private facilitation platform and is not affiliated with any Excise & Taxation department, MTMIS, ICT Excise, NADRA, or any government body.",
    answerUr:
      "نہیں۔ پاک ایکسائز ڈاٹ کام ایک نجی سہولت پلیٹ فارم ہے اور کسی بھی ایکسائز و ٹیکسیشن محکمے، MTMIS، ICT Excise، NADRA یا کسی سرکاری ادارے سے وابستہ نہیں ہے۔",
    seoKeywordsEn:
      "private facilitation, not government, vehicle transfer portal",
    seoKeywordsUr: "نجی سہولت, سرکاری نہیں, گاڑی منتقلی",
  },
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "In which regions is vehicle transfer available?",
    questionUr: "گاڑی منتقلی کس کس علاقے میں دستیاب ہے؟",
    answerEn:
      "Vehicle transfer support is currently available for Punjab and Islamabad ICT, based on service availability configured by PakExcise Super Admin.",
    answerUr:
      "گاڑی منتقلی کی سپورٹ فی الحال پنجاب اور اسلام آباد ICT کے لیے دستیاب ہے، جو پاک ایکسائز سپر ایڈمن کی ترتیب کردہ سروس دستیابی پر منحصر ہے۔",
    seoKeywordsEn: "vehicle transfer regions, Punjab, Islamabad ICT, availability",
    seoKeywordsUr: "گاڑی منتقلی علاقے, پنجاب, اسلام آباد, دستیابی",
  },
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What documents are required for vehicle transfer in Punjab?",
    questionUr: "پنجاب میں گاڑی منتقلی کے لیے کون سی دستاویزات درکار ہیں؟",
    answerEn:
      "For Punjab vehicle transfer, you may need vehicle front picture, vehicle back picture, chassis number picture, purchaser CNIC front picture, purchaser CNIC back picture, seller biometric, and purchaser biometric.",
    answerUr:
      "پنجاب میں گاڑی منتقلی کے لیے آپ کو گاڑی کی سامنے کی تصویر، پیچھے کی تصویر، شاسی نمبر کی تصویر، خریدار CNIC سامنے، خریدار CNIC پیچھے، فروخت کنندہ بائیومیٹرک اور خریدار بائیومیٹرک درکار ہو سکتے ہیں۔",
    regionSlug: "punjab",
    seoKeywordsEn:
      "Punjab vehicle transfer documents, CNIC, biometric, chassis",
    seoKeywordsUr: "پنجاب گاڑی منتقلی دستاویزات, CNIC, بائیومیٹرک",
  },
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "What documents are required for vehicle transfer in Islamabad ICT?",
    questionUr: "اسلام آباد ICT میں گاڑی منتقلی کے لیے کون سی دستاویزات درکار ہیں؟",
    answerEn:
      "For Islamabad ICT vehicle transfer, you may need purchaser CNIC front picture, purchaser CNIC back picture, original vehicle smart card, original number plates, private vehicle inspection, and fitness certificate if the vehicle is commercial.",
    answerUr:
      "اسلام آباد ICT میں گاڑی منتقلی کے لیے آپ کو خریدار CNIC سامنے، خریدار CNIC پیچھے، اصل گاڑی سمارٹ کارڈ، اصل نمبر پلیٹیں، پرائیویٹ گاڑی معائنہ اور تجارتی گاڑی کی صورت میں فٹنس سرٹیفکیٹ درکار ہو سکتا ہے۔",
    regionSlug: "islamabad",
    seoKeywordsEn:
      "Islamabad vehicle transfer documents, smart card, number plates, fitness",
    seoKeywordsUr: "اسلام آباد گاڑی منتقلی, سمارٹ کارڈ, نمبر پلیٹ",
  },
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Is biometric required for vehicle transfer?",
    questionUr: "کیا گاڑی منتقلی کے لیے بائیومیٹرک ضروری ہے؟",
    answerEn:
      "Yes, biometric verification may be required for vehicle transfer depending on the province and vehicle record process. PakExcise support guides users through WhatsApp where biometric assistance is needed.",
    answerUr:
      "جی ہاں، صوبے اور گاڑی ریکارڈ کے عمل کے مطابق گاڑی منتقلی کے لیے بائیومیٹرک تصدیق درکار ہو سکتی ہے۔ جہاں بائیومیٹرک مدد درکار ہو، پاک ایکسائز سپورٹ واٹس ایپ کے ذریعے رہنمائی کرتی ہے۔",
    seoKeywordsEn: "vehicle transfer biometric, verification, WhatsApp support",
    seoKeywordsUr: "گاڑی منتقلی بائیومیٹرک, تصدیق, واٹس ایپ",
  },
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I apply for vehicle transfer without creating an account?",
    questionUr: "کیا میں بغیر اکاؤنٹ گاڑی منتقلی کی درخواست دے سکتا ہوں؟",
    answerEn:
      "Yes. You can use Quick WhatsApp Service or Submit Request without creating an account. For full application tracking, document history, invoices, and status updates, apply with an account.",
    answerUr:
      "جی ہاں۔ آپ بغیر اکاؤنٹ فوری واٹس ایپ سروس یا درخواست جمع کریں استعمال کر سکتے ہیں۔ مکمل درخواست ٹریکنگ، دستاویزات کی تاریخ، انوائسز اور اسٹیٹس اپڈیٹس کے لیے اکاؤنٹ کے ساتھ درخواست دیں۔",
    seoKeywordsEn:
      "vehicle transfer without account, WhatsApp, submit request, apply with account",
    seoKeywordsUr:
      "بغیر اکاؤنٹ گاڑی منتقلی, واٹس ایپ, درخواست جمع کریں",
  },
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "Can I track my vehicle transfer application?",
    questionUr: "کیا میں اپنی گاڑی منتقلی کی درخواست ٹریک کر سکتا ہوں؟",
    answerEn:
      "Yes, if you apply with an account, you can track your application status, documents, invoices, payment proof, and updates from your dashboard.",
    answerUr:
      "جی ہاں، اگر آپ اکاؤنٹ کے ساتھ درخواست دیتے ہیں تو آپ ڈیش بورڈ سے درخواست کا اسٹیٹس، دستاویزات، انوائسز، ادائیگی کا ثبوت اور اپڈیٹس ٹریک کر سکتے ہیں۔",
    seoKeywordsEn: "track vehicle transfer, application status, dashboard",
    seoKeywordsUr: "گاڑی منتقلی ٹریک, درخواست اسٹیٹس, ڈیش بورڈ",
  },

  // ── Token Tax Payment (9) ─────────────────────────────────────────────────
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is token tax payment support?",
    questionUr: "ٹوکن ٹیکس ادائیگی کی سپورٹ کیا ہے؟",
    answerEn:
      "PakExcise provides private facilitation support for token tax-related requests. Users can submit their vehicle registration number and get guidance for token tax status, payment process, required details, and next steps.",
    answerUr:
      "پاک ایکسائز ٹوکن ٹیکس سے متعلق درخواستوں کے لیے نجی سہولت فراہم کرتا ہے۔ صارف گاڑی رجسٹریشن نمبر جمع کرا کر ٹوکن ٹیکس اسٹیٹس، ادائیگی کے عمل، ضروری تفصیلات اور اگلے مراحل کی رہنمائی حاصل کر سکتے ہیں۔",
    seoKeywordsEn: "token tax payment, vehicle registration, excise facilitation",
    seoKeywordsUr: "ٹوکن ٹیکس ادائیگی, گاڑی رجسٹریشن, ایکسائز",
  },
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Which provinces are supported for token tax payment?",
    questionUr: "ٹوکن ٹیکس ادائیگی کے لیے کون سے صوبے معاون ہیں؟",
    answerEn:
      "Token tax support is available for Punjab, Islamabad ICT, Sindh, Balochistan, and Khyber Pakhtunkhwa based on current service availability.",
    answerUr:
      "موجودہ سروس دستیابی کے مطابق ٹوکن ٹیکس سپورٹ پنجاب، اسلام آباد ICT، سندھ، بلوچستان اور خیبر پختونخوا کے لیے دستیاب ہے۔",
    seoKeywordsEn:
      "token tax provinces, Punjab, Sindh, KPK, Balochistan, Islamabad",
    seoKeywordsUr: "ٹوکن ٹیکس صوبے, پنجاب, سندھ, خیبر پختونخوا",
  },
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "What information is required for token tax payment?",
    questionUr: "ٹوکن ٹیکس ادائیگی کے لیے کون سی معلومات درکار ہیں؟",
    answerEn:
      "Usually, you need to provide your vehicle registration number in the correct province format. Additional details may be requested depending on the vehicle record and province.",
    answerUr:
      "عام طور پر آپ کو صوبے کے درست فارمیٹ میں گاڑی رجسٹریشن نمبر فراہم کرنا ہوتا ہے۔ گاڑی ریکارڈ اور صوبے کے مطابق مزید تفصیلات بھی مانگی جا سکتی ہیں۔",
    seoKeywordsEn: "token tax information, vehicle number, registration format",
    seoKeywordsUr: "ٹوکن ٹیکس معلومات, گاڑی نمبر, رجسٹریشن فارمیٹ",
  },
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What is the Punjab vehicle number format for token tax?",
    questionUr: "ٹوکن ٹیکس کے لیے پنجاب گاڑی نمبر کا فارمیٹ کیا ہے؟",
    answerEn:
      "Punjab vehicle registration numbers may use formats such as ABC 123, ABC 0123, ABC 1111, or ABC-07-1111.",
    answerUr:
      "پنجاب میں گاڑی رجسٹریشن نمبر ABC 123، ABC 0123، ABC 1111 یا ABC-07-1111 جیسے فارمیٹس میں ہو سکتے ہیں۔",
    regionSlug: "punjab",
    seoKeywordsEn: "Punjab vehicle number format, token tax, ABC 123",
    seoKeywordsUr: "پنجاب گاڑی نمبر فارمیٹ, ٹوکن ٹیکس",
  },
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "What is the Islamabad ICT vehicle number format?",
    questionUr: "اسلام آباد ICT گاڑی نمبر کا فارمیٹ کیا ہے؟",
    answerEn: "Islamabad ICT vehicle numbers commonly use the format ABC-123.",
    answerUr: "اسلام آباد ICT میں گاڑی نمبر عام طور پر ABC-123 فارمیٹ میں ہوتے ہیں۔",
    regionSlug: "islamabad",
    seoKeywordsEn: "Islamabad vehicle number format, ABC-123, token tax",
    seoKeywordsUr: "اسلام آباد گاڑی نمبر, ABC-123, ٹوکن ٹیکس",
  },
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "What is the Sindh vehicle number format?",
    questionUr: "سندھ گاڑی نمبر کا فارمیٹ کیا ہے؟",
    answerEn: "Sindh vehicle numbers commonly use the format ABC-123.",
    answerUr: "سندھ میں گاڑی نمبر عام طور پر ABC-123 فارمیٹ میں ہوتے ہیں۔",
    regionSlug: "sindh",
    seoKeywordsEn: "Sindh vehicle number format, token tax, ABC-123",
    seoKeywordsUr: "سندھ گاڑی نمبر فارمیٹ, ٹوکن ٹیکس",
  },
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "What is the Khyber Pakhtunkhwa vehicle number format?",
    questionUr: "خیبر پختونخوا گاڑی نمبر کا فارمیٹ کیا ہے؟",
    answerEn:
      "Khyber Pakhtunkhwa vehicle numbers may use formats such as ABC-1234 or ABC-123.",
    answerUr:
      "خیبر پختونخوا میں گاڑی نمبر ABC-1234 یا ABC-123 جیسے فارمیٹس میں ہو سکتے ہیں۔",
    regionSlug: "kpk",
    seoKeywordsEn: "KPK vehicle number format, token tax, ABC-1234",
    seoKeywordsUr: "خیبر پختونخوا گاڑی نمبر, ٹوکن ٹیکس",
  },
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "Why is the correct vehicle number format important?",
    questionUr: "درست گاڑی نمبر فارمیٹ کیوں اہم ہے؟",
    answerEn:
      "Correct vehicle number format helps avoid delays, wrong record searches, incorrect token tax details, or failed verification.",
    answerUr:
      "درست گاڑی نمبر فارمیٹ تاخیر، غلط ریکارڈ تلاش، غلط ٹوکن ٹیکس تفصیلات یا ناکام تصدیق سے بچنے میں مدد کرتا ہے۔",
    seoKeywordsEn: "vehicle number format, token tax verification, avoid delays",
    seoKeywordsUr: "گاڑی نمبر فارمیٹ, ٹوکن ٹیکس تصدیق, تاخیر",
  },
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 9,
    questionEn: "Are token tax fees shown on the website?",
    questionUr: "کیا ٹوکن ٹیکس فیس ویب سائٹ پر دکھائی جاتی ہے؟",
    answerEn:
      "No. PakExcise does not show fixed fees on public pages. If payment is required, details are shared after review through invoice, support message, or application update.",
    answerUr:
      "نہیں۔ پاک ایکسائز عوامی صفحات پر مقررہ فیس نہیں دکھاتا۔ ادائیگی درکار ہونے پر تفصیلات جائزے کے بعد انوائس، سپورٹ پیغام یا درخواست اپڈیٹ کے ذریعے شیئر کی جاتی ہیں۔",
    seoKeywordsEn: "token tax fees, no pricing, private facilitation",
    seoKeywordsUr: "ٹوکن ٹیکس فیس, قیمت نہیں, نجی سہولت",
  },

  // ── New Vehicle Registration (8) ────────────────────────────────────────
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is new vehicle registration support?",
    questionUr: "نئی گاڑی رجسٹریشن کی سپورٹ کیا ہے؟",
    answerEn:
      "PakExcise provides private facilitation support for new vehicle registration in supported regions such as Punjab and Islamabad ICT. Our team guides users about required documents, biometric process, vehicle inspection if required, and application steps.",
    answerUr:
      "پاک ایکسائز پنجاب اور اسلام آباد ICT جیسے معاون علاقوں میں نئی گاڑی رجسٹریشن کے لیے نجی سہولت فراہم کرتا ہے۔ ہماری ٹیم ضروری دستاویزات، بائیومیٹرک عمل، ضرورت پڑنے پر گاڑی معائنہ اور درخواست کے مراحل کے بارے میں رہنمائی کرتی ہے۔",
    seoKeywordsEn:
      "new vehicle registration, Punjab, Islamabad, excise facilitation",
    seoKeywordsUr: "نئی گاڑی رجسٹریشن, پنجاب, اسلام آباد, ایکسائز",
  },
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "In which regions is new vehicle registration available?",
    questionUr: "نئی گاڑی رجسٹریشن کس کس علاقے میں دستیاب ہے؟",
    answerEn:
      "New vehicle registration support is currently available for Punjab and Islamabad ICT based on active service availability.",
    answerUr:
      "نئی گاڑی رجسٹریشن کی سپورٹ فی الحال فعال سروس دستیابی کے مطابق پنجاب اور اسلام آباد ICT کے لیے دستیاب ہے۔",
    seoKeywordsEn: "new registration regions, Punjab, Islamabad ICT",
    seoKeywordsUr: "نئی رجسٹریشن علاقے, پنجاب, اسلام آباد",
  },
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "What documents are required for new vehicle registration in Punjab?",
    questionUr: "پنجاب میں نئی گاڑی رجسٹریشن کے لیے کون سی دستاویزات درکار ہیں؟",
    answerEn:
      "For Punjab new vehicle registration, you may need sales invoice, purchaser CNIC front picture, purchaser CNIC back picture, and purchaser biometric.",
    answerUr:
      "پنجاب میں نئی گاڑی رجسٹریشن کے لیے آپ کو سیلز انوائس، خریدار CNIC سامنے، خریدار CNIC پیچھے اور خریدار بائیومیٹرک درکار ہو سکتے ہیں۔",
    regionSlug: "punjab",
    seoKeywordsEn: "Punjab new registration documents, sales invoice, CNIC, biometric",
    seoKeywordsUr: "پنجاب نئی رجسٹریشن دستاویزات, سیلز انوائس, CNIC",
  },
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What documents are required for new vehicle registration in Islamabad ICT?",
    questionUr: "اسلام آباد ICT میں نئی گاڑی رجسٹریشن کے لیے کون سی دستاویزات درکار ہیں؟",
    answerEn:
      "For Islamabad ICT new vehicle registration, you may need sales invoice, purchaser CNIC front picture, purchaser CNIC back picture, purchaser biometric, and vehicle inspection.",
    answerUr:
      "اسلام آباد ICT میں نئی گاڑی رجسٹریشن کے لیے آپ کو سیلز انوائس، خریدار CNIC سامنے، خریدار CNIC پیچھے، خریدار بائیومیٹرک اور گاڑی معائنہ درکار ہو سکتا ہے۔",
    regionSlug: "islamabad",
    seoKeywordsEn:
      "Islamabad new registration documents, vehicle inspection, CNIC",
    seoKeywordsUr: "اسلام آباد نئی رجسٹریشن, گاڑی معائنہ, CNIC",
  },
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Is biometric required for new vehicle registration?",
    questionUr: "کیا نئی گاڑی رجسٹریشن کے لیے بائیومیٹرک ضروری ہے؟",
    answerEn:
      "Yes, purchaser biometric may be required for new vehicle registration. PakExcise support can guide you about the biometric process and next steps.",
    answerUr:
      "جی ہاں، نئی گاڑی رجسٹریشن کے لیے خریدار بائیومیٹرک درکار ہو سکتا ہے۔ پاک ایکسائز سپورٹ بائیومیٹرک عمل اور اگلے مراحل کے بارے میں رہنمائی کر سکتی ہے۔",
    seoKeywordsEn: "new registration biometric, purchaser verification",
    seoKeywordsUr: "نئی رجسٹریشن بائیومیٹرک, خریدار تصدیق",
  },
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Is vehicle inspection required for new registration?",
    questionUr: "کیا نئی رجسٹریشن کے لیے گاڑی معائنہ ضروری ہے؟",
    answerEn:
      "Vehicle inspection may be required in Islamabad ICT or in specific cases. Requirements can vary depending on the region, vehicle type, and official process.",
    answerUr:
      "اسلام آباد ICT یا مخصوص صورتوں میں گاڑی معائنہ درکار ہو سکتا ہے۔ ضروریات علاقے، گاڑی کی قسم اور سرکاری عمل کے مطابق مختلف ہو سکتی ہیں۔",
    seoKeywordsEn: "vehicle inspection, new registration, Islamabad ICT",
    seoKeywordsUr: "گاڑی معائنہ, نئی رجسٹریشن, اسلام آباد",
  },
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I submit a new vehicle registration request on WhatsApp?",
    questionUr: "کیا میں نئی گاڑی رجسٹریشن کی درخواست واٹس ایپ پر جمع کر سکتا ہوں؟",
    answerEn:
      "Yes. You can contact PakExcise through WhatsApp for quick guidance. For full tracking, apply with an account.",
    answerUr:
      "جی ہاں۔ فوری رہنمائی کے لیے آپ پاک ایکسائز سے واٹس ایپ پر رابطہ کر سکتے ہیں۔ مکمل ٹریکنگ کے لیے اکاؤنٹ کے ساتھ درخواست دیں۔",
    seoKeywordsEn: "new registration WhatsApp, quick support, apply with account",
    seoKeywordsUr: "نئی رجسٹریشن واٹس ایپ, فوری سپورٹ, اکاؤنٹ درخواست",
  },
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "Can I track my new registration application?",
    questionUr: "کیا میں اپنی نئی رجسٹریشن درخواست ٹریک کر سکتا ہوں؟",
    answerEn:
      "Yes. Account-based applications allow you to track status, uploaded documents, invoices, payment verification, and application history.",
    answerUr:
      "جی ہاں۔ اکاؤنٹ والی درخواستوں سے آپ اسٹیٹس، اپ لوڈ شدہ دستاویزات، انوائسز، ادائیگی کی تصدیق اور درخواست کی تاریخ ٹریک کر سکتے ہیں۔",
    seoKeywordsEn: "track new registration, application status, dashboard",
    seoKeywordsUr: "نئی رجسٹریشن ٹریک, درخواست اسٹیٹس, ڈیش بورڈ",
  },

  // ── Vehicle Passing / Fitness (7) ───────────────────────────────────────
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is vehicle passing or fitness support?",
    questionUr: "گاڑی پاسنگ یا فٹنس سپورٹ کیا ہے؟",
    answerEn:
      "PakExcise provides private facilitation support for vehicle passing and fitness-related requests in Islamabad ICT. This may include guidance about vehicle pictures, owner CNIC documents, and process requirements.",
    answerUr:
      "پاک ایکسائز اسلام آباد ICT میں گاڑی پاسنگ اور فٹنس سے متعلق درخواستوں کے لیے نجی سہولت فراہم کرتا ہے۔ اس میں گاڑی کی تصاویر، مالک CNIC دستاویزات اور عمل کی ضروریات کی رہنمائی شامل ہو سکتی ہے۔",
    seoKeywordsEn: "vehicle passing, fitness certificate, Islamabad ICT",
    seoKeywordsUr: "گاڑی پاسنگ, فٹنس سرٹیفکیٹ, اسلام آباد",
  },
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Where is vehicle passing / fitness service available?",
    questionUr: "گاڑی پاسنگ / فٹنس سروس کہاں دستیاب ہے؟",
    answerEn: "Vehicle passing / fitness support is currently available for Islamabad ICT.",
    answerUr: "گاڑی پاسنگ / فٹنس سپورٹ فی الحال اسلام آباد ICT کے لیے دستیاب ہے۔",
    regionSlug: "islamabad",
    seoKeywordsEn: "vehicle fitness availability, Islamabad ICT",
    seoKeywordsUr: "گاڑی فٹنس دستیابی, اسلام آباد",
  },
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "What documents are required for vehicle passing / fitness?",
    questionUr: "گاڑی پاسنگ / فٹنس کے لیے کون سی دستاویزات درکار ہیں؟",
    answerEn:
      "For Islamabad ICT vehicle passing / fitness, you may need vehicle front picture, vehicle back picture, owner CNIC front picture, and owner CNIC back picture.",
    answerUr:
      "اسلام آباد ICT میں گاڑی پاسنگ / فٹنس کے لیے آپ کو گاڑی سامنے کی تصویر، پیچھے کی تصویر، مالک CNIC سامنے اور مالک CNIC پیچھے درکار ہو سکتے ہیں۔",
    regionSlug: "islamabad",
    seoKeywordsEn: "fitness documents, vehicle pictures, owner CNIC, Islamabad",
    seoKeywordsUr: "فٹنس دستاویزات, گاڑی تصاویر, مالک CNIC",
  },
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "Is vehicle fitness required for all vehicles?",
    questionUr: "کیا تمام گاڑیوں کے لیے فٹنس ضروری ہے؟",
    answerEn:
      "Fitness requirements depend on vehicle type, region, and applicable process. Commercial vehicles may have different requirements than private vehicles.",
    answerUr:
      "فٹنس کی ضروریات گاڑی کی قسم، علاقے اور لاگو عمل پر منحصر ہیں۔ تجارتی گاڑیوں کی ضروریات پرائیویٹ گاڑیوں سے مختلف ہو سکتی ہیں۔",
    seoKeywordsEn: "vehicle fitness requirements, commercial, private vehicles",
    seoKeywordsUr: "گاڑی فٹنس ضروریات, تجارتی, پرائیویٹ",
  },
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Can PakExcise complete vehicle fitness directly?",
    questionUr: "کیا پاک ایکسائز براہِ راست گاڑی فٹنس مکمل کر سکتا ہے؟",
    answerEn:
      "PakExcise provides private facilitation support and guidance. Final verification, approval, or fitness status depends on relevant official processes and applicable requirements.",
    answerUr:
      "پاک ایکسائز نجی سہولت اور رہنمائی فراہم کرتا ہے۔ حتمی تصدیق، منظوری یا فٹنس اسٹیٹس متعلقہ سرکاری عمل اور لاگو ضروریات پر منحصر ہے۔",
    seoKeywordsEn: "vehicle fitness facilitation, private service, not government",
    seoKeywordsUr: "گاڑی فٹنس سہولت, نجی سروس, سرکاری نہیں",
  },
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Can I use WhatsApp for vehicle fitness support?",
    questionUr: "کیا میں گاڑی فٹنس سپورٹ کے لیے واٹس ایپ استعمال کر سکتا ہوں؟",
    answerEn:
      "Yes. You can contact PakExcise on WhatsApp for quick support and document guidance.",
    answerUr:
      "جی ہاں۔ فوری سپورٹ اور دستاویزات کی رہنمائی کے لیے آپ پاک ایکسائز سے واٹس ایپ پر رابطہ کر سکتے ہیں۔",
    seoKeywordsEn: "vehicle fitness WhatsApp, quick support",
    seoKeywordsUr: "گاڑی فٹنس واٹس ایپ, فوری سپورٹ",
  },
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I apply with an account for vehicle passing / fitness?",
    questionUr: "کیا میں گاڑی پاسنگ / فٹنس کے لیے اکاؤنٹ کے ساتھ درخواست دے سکتا ہوں؟",
    answerEn:
      "Yes. Account-based applications provide full website tracking, status updates, document history, invoices, and support notes.",
    answerUr:
      "جی ہاں۔ اکاؤنٹ والی درخواستوں میں مکمل ویب سائٹ ٹریکنگ، اسٹیٹس اپڈیٹس، دستاویزات کی تاریخ، انوائسز اور سپورٹ نوٹس شامل ہوتے ہیں۔",
    seoKeywordsEn: "apply with account, vehicle fitness tracking, dashboard",
    seoKeywordsUr: "اکاؤنٹ درخواست, گاڑی فٹنس ٹریکنگ, ڈیش بورڈ",
  },

  // ── Route Permit (9) ──────────────────────────────────────────────────────
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is route permit support?",
    questionUr: "راؤٹ پرمٹ سپورٹ کیا ہے؟",
    answerEn:
      "PakExcise provides private facilitation support for route permit-related services in supported regions such as Punjab and Islamabad ICT. This may include new route permit, route permit NOC, and duplicate route permit support.",
    answerUr:
      "پاک ایکسائز پنجاب اور اسلام آباد ICT جیسے معاون علاقوں میں راؤٹ پرمٹ سے متعلق خدمات کے لیے نجی سہولت فراہم کرتا ہے۔ اس میں نیا راؤٹ پرمٹ، راؤٹ پرمٹ NOC اور ڈپلیکیٹ راؤٹ پرمٹ سپورٹ شامل ہو سکتی ہے۔",
    seoKeywordsEn: "route permit, NOC, duplicate, Punjab, Islamabad",
    seoKeywordsUr: "راؤٹ پرمٹ, NOC, ڈپلیکیٹ, پنجاب, اسلام آباد",
  },
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Which route permit services are available?",
    questionUr: "راؤٹ پرمٹ کی کون سی خدمات دستیاب ہیں؟",
    answerEn:
      "PakExcise supports route permit sub-services such as New Route Permit, Route Permit NOC, and Route Permit Duplicate where available.",
    answerUr:
      "پاک ایکسائز نیا راؤٹ پرمٹ، راؤٹ پرمٹ NOC اور راؤٹ پرمٹ ڈپلیکیٹ جیسی ذیلی خدمات کو جہاں دستیاب ہوں سپورٹ کرتا ہے۔",
    seoKeywordsEn: "route permit sub-services, new, NOC, duplicate",
    seoKeywordsUr: "راؤٹ پرمٹ ذیلی خدمات, نیا, NOC, ڈپلیکیٹ",
  },
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "In which regions is route permit service available?",
    questionUr: "راؤٹ پرمٹ سروس کس کس علاقے میں دستیاب ہے؟",
    answerEn:
      "Route permit support is available for Punjab and Islamabad ICT based on current service availability.",
    answerUr:
      "موجودہ سروس دستیابی کے مطابق راؤٹ پرمٹ سپورٹ پنجاب اور اسلام آباد ICT کے لیے دستیاب ہے۔",
    seoKeywordsEn: "route permit regions, Punjab, Islamabad ICT",
    seoKeywordsUr: "راؤٹ پرمٹ علاقے, پنجاب, اسلام آباد",
  },
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What documents are required for route permit?",
    questionUr: "راؤٹ پرمٹ کے لیے کون سی دستاویزات درکار ہیں؟",
    answerEn:
      "Common route permit requirements may include CNIC front picture, CNIC back picture, and fitness certificate. Requirements can vary by province and sub-service.",
    answerUr:
      "راؤٹ پرمٹ کی عام ضروریات میں CNIC سامنے، CNIC پیچھے اور فٹنس سرٹیفکیٹ شامل ہو سکتے ہیں۔ ضروریات صوبے اور ذیلی سروس کے مطابق مختلف ہو سکتی ہیں۔",
    seoKeywordsEn: "route permit documents, CNIC, fitness certificate",
    seoKeywordsUr: "راؤٹ پرمٹ دستاویزات, CNIC, فٹنس سرٹیفکیٹ",
  },
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "What is New Route Permit?",
    questionUr: "نیا راؤٹ پرمٹ کیا ہے؟",
    answerEn:
      "New Route Permit support helps users with guidance and document preparation for a new route permit request where the service is available.",
    answerUr:
      "نیا راؤٹ پرمٹ سپورٹ صارفین کو جہاں سروس دستیاب ہو نئے راؤٹ پرمٹ کی درخواست کے لیے رہنمائی اور دستاویزات کی تیاری میں مدد دیتی ہے۔",
    seoKeywordsEn: "new route permit, application guidance",
    seoKeywordsUr: "نیا راؤٹ پرمٹ, درخواست رہنمائی",
  },
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "What is Route Permit NOC?",
    questionUr: "راؤٹ پرمٹ NOC کیا ہے؟",
    answerEn:
      "Route Permit NOC support helps users with facilitation and document guidance for a route permit no-objection certificate request.",
    answerUr:
      "راؤٹ پرمٹ NOC سپورٹ راؤٹ پرمٹ no-objection certificate درخواست کے لیے سہولت اور دستاویزات کی رہنمائی میں مدد دیتی ہے۔",
    seoKeywordsEn: "route permit NOC, no objection certificate",
    seoKeywordsUr: "راؤٹ پرمٹ NOC, عدم اعتراض سرٹیفکیٹ",
  },
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "What is Route Permit Duplicate?",
    questionUr: "راؤٹ پرمٹ ڈپلیکیٹ کیا ہے؟",
    answerEn:
      "Route Permit Duplicate support helps users with guidance for duplicate route permit requests where applicable.",
    answerUr:
      "راؤٹ پرمٹ ڈپلیکیٹ سپورٹ جہاں لاگو ہو ڈپلیکیٹ راؤٹ پرمٹ درخواستوں کے لیے رہنمائی میں مدد دیتی ہے۔",
    seoKeywordsEn: "route permit duplicate, lost permit",
    seoKeywordsUr: "راؤٹ پرمٹ ڈپلیکیٹ, گم شدہ پرمٹ",
  },
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "Do I need to choose a sub-service before applying?",
    questionUr: "کیا درخواست سے پہلے ذیلی سروس منتخب کرنا ضروری ہے؟",
    answerEn:
      "Yes. If a service has sub-services, such as New Route Permit, Route Permit NOC, or Route Permit Duplicate, you should select the correct sub-service before applying.",
    answerUr:
      "جی ہاں۔ اگر سروس میں ذیلی خدمات ہوں، جیسے نیا راؤٹ پرمٹ، راؤٹ پرمٹ NOC یا راؤٹ پرمٹ ڈپلیکیٹ، تو درخواست سے پہلے درست ذیلی سروس منتخب کریں۔",
    seoKeywordsEn: "route permit sub-service selection, apply correctly",
    seoKeywordsUr: "راؤٹ پرمٹ ذیلی سروس, درست انتخاب",
  },
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 9,
    questionEn: "Can I track my route permit application?",
    questionUr: "کیا میں اپنی راؤٹ پرمٹ درخواست ٹریک کر سکتا ہوں؟",
    answerEn:
      "Yes. If you apply with an account, you can track status, document requirements, invoices, and support updates from your dashboard.",
    answerUr:
      "جی ہاں۔ اگر آپ اکاؤنٹ کے ساتھ درخواست دیتے ہیں تو آپ ڈیش بورڈ سے اسٹیٹس، دستاویزات کی ضروریات، انوائسز اور سپورٹ اپڈیٹس ٹریک کر سکتے ہیں۔",
    seoKeywordsEn: "track route permit, application dashboard",
    seoKeywordsUr: "راؤٹ پرمٹ ٹریک, درخواست ڈیش بورڈ",
  },

  // ── Data Correction (8) ───────────────────────────────────────────────────
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is vehicle data correction support?",
    questionUr: "گاڑی ڈیٹا تصحیح سپورٹ کیا ہے؟",
    answerEn:
      "PakExcise provides private facilitation support for vehicle record data correction requests in supported regions such as Punjab and Islamabad ICT.",
    answerUr:
      "پاک ایکسائز پنجاب اور اسلام آباد ICT جیسے معاون علاقوں میں گاڑی ریکارڈ ڈیٹا تصحیح کی درخواستوں کے لیے نجی سہولت فراہم کرتا ہے۔",
    seoKeywordsEn: "vehicle data correction, record update, Punjab, Islamabad",
    seoKeywordsUr: "گاڑی ڈیٹا تصحیح, ریکارڈ اپڈیٹ, پنجاب, اسلام آباد",
  },
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "What types of data correction can I request?",
    questionUr: "میں کس قسم کی ڈیٹا تصحیح کی درخواست کر سکتا ہوں؟",
    answerEn:
      "You may request support for name spelling correction, father name spelling correction, CNIC digits correction, address correction, engine number mismatch, chassis number mismatch, vehicle color correction, engine capacity/CC correction, or other record correction details.",
    answerUr:
      "آپ نام کی ہجے تصحیح، والد کے نام کی ہجے تصحیح، CNIC ہندسوں کی تصحیح، پتے کی تصحیح، انجن نمبر کی عدم مطابقت، شاسی نمبر کی عدم مطابقت، گاڑی رنگ تصحیح، انجن CC تصحیح یا دیگر ریکارڈ تصحیح کی درخواست کر سکتے ہیں۔",
    seoKeywordsEn:
      "data correction types, name, CNIC, engine, chassis, color, CC",
    seoKeywordsUr: "ڈیٹا تصحیح اقسام, نام, CNIC, انجن, شاسی, رنگ",
  },
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "Where is data correction service available?",
    questionUr: "ڈیٹا تصحیح سروس کہاں دستیاب ہے؟",
    answerEn:
      "Data correction support is currently available for Punjab and Islamabad ICT based on active service availability.",
    answerUr:
      "ڈیٹا تصحیح سپورٹ فی الحال فعال سروس دستیابی کے مطابق پنجاب اور اسلام آباد ICT کے لیے دستیاب ہے۔",
    seoKeywordsEn: "data correction regions, Punjab, Islamabad ICT",
    seoKeywordsUr: "ڈیٹا تصحیح علاقے, پنجاب, اسلام آباد",
  },
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What information is required for data correction?",
    questionUr: "ڈیٹا تصحیح کے لیے کون سی معلومات درکار ہیں؟",
    answerEn:
      "You may need to select the correction type and explain the correction needed. PakExcise support may request proof or supporting documents depending on the correction type.",
    answerUr:
      "آپ کو تصحیح کی قسم منتخب کرنی اور مطلوبہ تصحیح کی وضاحت کرنی پڑ سکتی ہے۔ تصحیح کی قسم کے مطابق پاک ایکسائز سپورٹ ثبوت یا معاون دستاویزات مانگ سکتی ہے۔",
    seoKeywordsEn: "data correction information, correction type, proof",
    seoKeywordsUr: "ڈیٹا تصحیح معلومات, تصحیح قسم, ثبوت",
  },
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Are documents required for data correction?",
    questionUr: "کیا ڈیٹا تصحیح کے لیے دستاویزات ضروری ہیں؟",
    answerEn:
      "Documents may be required depending on the type of correction. For example, CNIC correction, owner name correction, engine/chassis mismatch, or color correction may require supporting proof.",
    answerUr:
      "تصحیح کی قسم کے مطابق دستاویزات درکار ہو سکتی ہیں۔ مثال کے طور پر CNIC، مالک نام، انجن/شاسی عدم مطابقت یا رنگ تصحیح کے لیے معاون ثبوت درکار ہو سکتا ہے۔",
    seoKeywordsEn: "data correction documents, supporting proof",
    seoKeywordsUr: "ڈیٹا تصحیح دستاویزات, معاون ثبوت",
  },
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Can PakExcise guarantee that my record will be corrected?",
    questionUr: "کیا پاک ایکسائز ضمانت دیتا ہے کہ میرا ریکارڈ درست ہو جائے گا؟",
    answerEn:
      "No. PakExcise provides facilitation and guidance. Final correction, approval, or record update depends on the relevant official system, documents, and verification process.",
    answerUr:
      "نہیں۔ پاک ایکسائز سہولت اور رہنمائی فراہم کرتا ہے۔ حتمی تصحیح، منظوری یا ریکارڈ اپڈیٹ متعلقہ سرکاری نظام، دستاویزات اور تصدیق کے عمل پر منحصر ہے۔",
    seoKeywordsEn: "data correction guarantee, facilitation only",
    seoKeywordsUr: "ڈیٹا تصحیح ضمانت, صرف سہولت",
  },
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I submit a data correction request without an account?",
    questionUr: "کیا میں بغیر اکاؤنٹ ڈیٹا تصحیح کی درخواست جمع کر سکتا ہوں؟",
    answerEn:
      "Yes. You can use WhatsApp or Submit Request. For full tracking and document history, apply with an account.",
    answerUr:
      "جی ہاں۔ آپ واٹس ایپ یا درخواست جمع کریں استعمال کر سکتے ہیں۔ مکمل ٹریکنگ اور دستاویزات کی تاریخ کے لیے اکاؤنٹ کے ساتھ درخواست دیں۔",
    seoKeywordsEn:
      "data correction without account, WhatsApp, submit request",
    seoKeywordsUr: "بغیر اکاؤنٹ ڈیٹا تصحیح, واٹس ایپ, درخواست جمع کریں",
  },
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "How can I track my data correction request?",
    questionUr: "میں اپنی ڈیٹا تصحیح درخواست کیسے ٹریک کروں؟",
    answerEn:
      "Apply with an account to track your application status, support notes, invoices, uploaded documents, and updates.",
    answerUr:
      "درخواست کا اسٹیٹس، سپورٹ نوٹس، انوائسز، اپ لوڈ شدہ دستاویزات اور اپڈیٹس ٹریک کرنے کے لیے اکاؤنٹ کے ساتھ درخواست دیں۔",
    seoKeywordsEn: "track data correction, application status",
    seoKeywordsUr: "ڈیٹا تصحیح ٹریک, درخواست اسٹیٹس",
  },

  // ── Driving License Renewal (7) ───────────────────────────────────────────
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is driving license renewal support?",
    questionUr: "ڈرائیونگ لائسنس تجدید سپورٹ کیا ہے؟",
    answerEn:
      "PakExcise provides private facilitation support for driving license renewal in Punjab. Our team guides users about required information, CNIC documents, medical certificate requirements, and next steps.",
    answerUr:
      "پاک ایکسائز پنجاب میں ڈرائیونگ لائسنس تجدید کے لیے نجی سہولت فراہم کرتا ہے۔ ہماری ٹیم ضروری معلومات، CNIC دستاویزات، میڈیکل سرٹیفکیٹ کی ضروریات اور اگلے مراحل کے بارے میں رہنمائی کرتی ہے۔",
    seoKeywordsEn: "driving license renewal, Punjab, facilitation",
    seoKeywordsUr: "ڈرائیونگ لائسنس تجدید, پنجاب, سہولت",
  },
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Where is driving license renewal available?",
    questionUr: "ڈرائیونگ لائسنس تجدید کہاں دستیاب ہے؟",
    answerEn: "Driving license renewal support is currently available for Punjab.",
    answerUr: "ڈرائیونگ لائسنس تجدید سپورٹ فی الحال پنجاب کے لیے دستیاب ہے۔",
    regionSlug: "punjab",
    seoKeywordsEn: "license renewal Punjab, availability",
    seoKeywordsUr: "لائسنس تجدید پنجاب, دستیابی",
  },
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "What information is required for driving license renewal?",
    questionUr: "ڈرائیونگ لائسنس تجدید کے لیے کون سی معلومات درکار ہیں؟",
    answerEn:
      "You may need to provide applicant name, phone number, applicant CNIC front picture, applicant CNIC back picture, and medical certificate where required.",
    answerUr:
      "آپ کو درخواست دہندہ کا نام، فون نمبر، درخواست دہندہ CNIC سامنے، درخواست دہندہ CNIC پیچھے اور ضرورت پڑنے پر میڈیکل سرٹیفکیٹ فراہم کرنا پڑ سکتا ہے۔",
    seoKeywordsEn: "license renewal information, CNIC, medical certificate",
    seoKeywordsUr: "لائسنس تجدید معلومات, CNIC, میڈیکل سرٹیفکیٹ",
  },
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "Is a medical certificate required for driving license renewal?",
    questionUr: "کیا ڈرائیونگ لائسنس تجدید کے لیے میڈیکل سرٹیفکیٹ ضروری ہے؟",
    answerEn:
      "A medical certificate issued by an authorized medical practitioner may be required. A medical fitness certificate may also be required for applicants aged 50 years or above.",
    answerUr:
      "مجاز طبیب کا میڈیکل سرٹیفکیٹ درکار ہو سکتا ہے۔ 50 سال یا اس سے زیادہ عمر کے درخواست دہندگان کے لیے میڈیکل فٹنس سرٹیفکیٹ بھی درکار ہو سکتا ہے۔",
    seoKeywordsEn: "medical certificate, license renewal, age 50",
    seoKeywordsUr: "میڈیکل سرٹیفکیٹ, لائسنس تجدید, 50 سال",
  },
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Can I renew my license through PakExcise without an account?",
    questionUr: "کیا میں بغیر اکاؤنٹ پاک ایکسائز سے لائسنس تجدید کروا سکتا ہوں؟",
    answerEn:
      "Yes. You can use WhatsApp support or Submit Request without creating an account. For full status tracking and document history, apply with an account.",
    answerUr:
      "جی ہاں۔ آپ بغیر اکاؤنٹ واٹس ایپ سپورٹ یا درخواست جمع کریں استعمال کر سکتے ہیں۔ مکمل اسٹیٹس ٹریکنگ اور دستاویزات کی تاریخ کے لیے اکاؤنٹ کے ساتھ درخواست دیں۔",
    seoKeywordsEn:
      "license renewal without account, WhatsApp, submit request",
    seoKeywordsUr: "بغیر اکاؤنٹ لائسنس تجدید, واٹس ایپ, درخواست جمع کریں",
  },
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Can PakExcise guarantee license renewal approval?",
    questionUr: "کیا پاک ایکسائز لائسنس تجدید کی منظوری کی ضمانت دیتا ہے؟",
    answerEn:
      "No. PakExcise provides private facilitation and guidance. Final renewal depends on the relevant license authority, documents, eligibility, verification, and official process.",
    answerUr:
      "نہیں۔ پاک ایکسائز نجی سہولت اور رہنمائی فراہم کرتا ہے۔ حتمی تجدید متعلقہ لائسنس اتھارٹی، دستاویزات، اہلیت، تصدیق اور سرکاری عمل پر منحصر ہے۔",
    seoKeywordsEn: "license renewal guarantee, facilitation only",
    seoKeywordsUr: "لائسنس تجدید ضمانت, صرف سہولت",
  },
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I track my driving license renewal application?",
    questionUr: "کیا میں اپنی ڈرائیونگ لائسنس تجدید درخواست ٹریک کر سکتا ہوں؟",
    answerEn:
      "Yes. If you apply with an account, you can track status, documents, invoices, and updates from your dashboard.",
    answerUr:
      "جی ہاں۔ اگر آپ اکاؤنٹ کے ساتھ درخواست دیتے ہیں تو آپ ڈیش بورڈ سے اسٹیٹس، دستاویزات، انوائسز اور اپڈیٹس ٹریک کر سکتے ہیں۔",
    seoKeywordsEn: "track license renewal, application dashboard",
    seoKeywordsUr: "لائسنس تجدید ٹریک, درخواست ڈیش بورڈ",
  },

  // ── Learner's License (7) ─────────────────────────────────────────────────
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is learner's license support?",
    questionUr: "لرنر لائسنس سپورٹ کیا ہے؟",
    answerEn:
      "PakExcise provides private facilitation support for learner's license applications in supported regions such as Punjab and Islamabad ICT.",
    answerUr:
      "پاک ایکسائز پنجاب اور اسلام آباد ICT جیسے معاون علاقوں میں لرنر لائسنس درخواستوں کے لیے نجی سہولت فراہم کرتا ہے۔",
    seoKeywordsEn: "learner license, Punjab, Islamabad, facilitation",
    seoKeywordsUr: "لرنر لائسنس, پنجاب, اسلام آباد, سہولت",
  },
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Where is learner's license support available?",
    questionUr: "لرنر لائسنس سپورٹ کہاں دستیاب ہے؟",
    answerEn:
      "Learner's license support is currently available for Punjab and Islamabad ICT based on current service availability.",
    answerUr:
      "لرنر لائسنس سپورٹ فی الحال موجودہ سروس دستیابی کے مطابق پنجاب اور اسلام آباد ICT کے لیے دستیاب ہے۔",
    seoKeywordsEn: "learner license regions, Punjab, Islamabad ICT",
    seoKeywordsUr: "لرنر لائسنس علاقے, پنجاب, اسلام آباد",
  },
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "What documents are required for learner's license?",
    questionUr: "لرنر لائسنس کے لیے کون سی دستاویزات درکار ہیں؟",
    answerEn:
      "You may need applicant name, phone number, applicant CNIC front picture, applicant CNIC back picture, recent passport-size photo, and medical certificate if age is above 50 years.",
    answerUr:
      "آپ کو درخواست دہندہ کا نام، فون نمبر، درخواست دہندہ CNIC سامنے، درخواست دہندہ CNIC پیچھے، حالیہ پاسپورٹ سائز تصویر اور 50 سال سے زیادہ عمر کی صورت میں میڈیکل سرٹیفکیٹ درکار ہو سکتا ہے۔",
    seoKeywordsEn: "learner license documents, CNIC, passport photo, medical",
    seoKeywordsUr: "لرنر لائسنس دستاویزات, CNIC, پاسپورٹ تصویر",
  },
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "Is a passport-size photo required?",
    questionUr: "کیا پاسپورٹ سائز تصویر ضروری ہے؟",
    answerEn:
      "Yes, a recent passport-size photo may be required for learner's license application support.",
    answerUr:
      "جی ہاں، لرنر لائسنس درخواست سپورٹ کے لیے حالیہ پاسپورٹ سائز تصویر درکار ہو سکتی ہے۔",
    seoKeywordsEn: "learner license photo, passport size",
    seoKeywordsUr: "لرنر لائسنس تصویر, پاسپورٹ سائز",
  },
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Is a medical certificate required for learner's license?",
    questionUr: "کیا لرنر لائسنس کے لیے میڈیکل سرٹیفکیٹ ضروری ہے؟",
    answerEn:
      "A medical certificate may be required if the applicant is above 50 years of age or where applicable based on service requirements.",
    answerUr:
      "اگر درخواست دہندہ 50 سال سے زیادہ عمر کا ہو یا سروس کی ضروریات کے مطابق لاگو ہو تو میڈیکل سرٹیفکیٹ درکار ہو سکتا ہے۔",
    seoKeywordsEn: "learner license medical certificate, age 50",
    seoKeywordsUr: "لرنر لائسنس میڈیکل, 50 سال",
  },
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Can I submit a learner's license request on WhatsApp?",
    questionUr: "کیا میں لرنر لائسنس کی درخواست واٹس ایپ پر جمع کر سکتا ہوں؟",
    answerEn:
      "Yes. You can contact PakExcise support on WhatsApp for quick guidance. For full application tracking, use Apply with Account.",
    answerUr:
      "جی ہاں۔ فوری رہنمائی کے لیے آپ پاک ایکسائز سپورٹ سے واٹس ایپ پر رابطہ کر سکتے ہیں۔ مکمل درخواست ٹریکنگ کے لیے اکاؤنٹ کے ساتھ درخواست استعمال کریں۔",
    seoKeywordsEn: "learner license WhatsApp, apply with account",
    seoKeywordsUr: "لرنر لائسنس واٹس ایپ, اکاؤنٹ درخواست",
  },
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I track my learner's license application?",
    questionUr: "کیا میں اپنی لرنر لائسنس درخواست ٹریک کر سکتا ہوں؟",
    answerEn:
      "Yes. Account-based applications allow you to track application status, document requirements, invoices, and updates from your dashboard.",
    answerUr:
      "جی ہاں۔ اکاؤنٹ والی درخواستوں سے آپ ڈیش بورڈ سے درخواست کا اسٹیٹس، دستاویزات کی ضروریات، انوائسز اور اپڈیٹس ٹریک کر سکتے ہیں۔",
    seoKeywordsEn: "track learner license, application dashboard",
    seoKeywordsUr: "لرنر لائسنس ٹریک, درخواست ڈیش بورڈ",
  },

  // ── E-Challan / Safe City (9) ─────────────────────────────────────────────
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is E-Challan support?",
    questionUr: "ای-چالان سپورٹ کیا ہے؟",
    answerEn:
      "PakExcise provides private facilitation guidance for e-challan and Safe City-related support across Pakistan provinces. Users can get help understanding required details, vehicle number formats, and support steps.",
    answerUr:
      "پاک ایکسائز پاکستان کے صوبوں میں ای-چالان اور Safe City سے متعلق سپورٹ کے لیے نجی سہولت رہنمائی فراہم کرتا ہے۔ صارفین ضروری تفصیلات، گاڑی نمبر فارمیٹس اور سپورٹ مراحل سمجھنے میں مدد حاصل کر سکتے ہیں۔",
    seoKeywordsEn: "e-challan, Safe City, Pakistan, facilitation",
    seoKeywordsUr: "ای-چالان, Safe City, پاکستان, سہولت",
  },
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Is PakExcise connected with Safe City or any government department?",
    questionUr: "کیا پاک ایکسائز Safe City یا کسی سرکاری محکمے سے منسلک ہے؟",
    answerEn:
      "No. PakExcise is a private facilitation service and is not affiliated with Safe City, Excise & Taxation, MTMIS, ICT Excise, NADRA, or any government department.",
    answerUr:
      "نہیں۔ پاک ایکسائز ایک نجی سہولت سروس ہے اور Safe City، ایکسائز و ٹیکسیشن، MTMIS، ICT Excise، NADRA یا کسی سرکاری محکمے سے وابستہ نہیں ہے۔",
    seoKeywordsEn: "e-challan private service, not government, Safe City",
    seoKeywordsUr: "ای-چالان نجی سروس, سرکاری نہیں, Safe City",
  },
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "Which provinces are supported for e-challan guidance?",
    questionUr: "ای-چالان رہنمائی کے لیے کون سے صوبے معاون ہیں؟",
    answerEn:
      "E-challan support is available across all active provinces shown on PakExcise, including Punjab, Islamabad ICT, Sindh, Balochistan, Khyber Pakhtunkhwa, Gilgit-Baltistan, and Azad Jammu & Kashmir where applicable.",
    answerUr:
      "پاک ایکسائز پر دکھائے گئے تمام فعال صوبوں میں ای-چالان سپورٹ دستیاب ہے، بشمول پنجاب، اسلام آباد ICT، سندھ، بلوچستان، خیبر پختونخوا، گلگت بلتستان اور آزاد جموں و کشمیر جہاں لاگو ہو۔",
    seoKeywordsEn:
      "e-challan provinces, Punjab, Sindh, KPK, Gilgit, AJK",
    seoKeywordsUr: "ای-چالان صوبے, پنجاب, سندھ, خیبر پختونخوا",
  },
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What information is required for e-challan support?",
    questionUr: "ای-چالان سپورٹ کے لیے کون سی معلومات درکار ہیں؟",
    answerEn:
      "You may need applicant CNIC front picture, applicant CNIC back picture, and vehicle registration number.",
    answerUr:
      "آپ کو درخواست دہندہ CNIC سامنے، درخواست دہندہ CNIC پیچھے اور گاڑی رجسٹریشن نمبر درکار ہو سکتا ہے۔",
    seoKeywordsEn: "e-challan information, CNIC, vehicle number",
    seoKeywordsUr: "ای-چالان معلومات, CNIC, گاڑی نمبر",
  },
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Why do I need to enter the correct vehicle number format?",
    questionUr: "درست گاڑی نمبر فارمیٹ درج کرنا کیوں ضروری ہے؟",
    answerEn:
      "Different provinces use different vehicle number formats. Correct format helps avoid wrong search results, delays, or incorrect vehicle record matching.",
    answerUr:
      "مختلف صوبے مختلف گاڑی نمبر فارمیٹس استعمال کرتے ہیں۔ درست فارمیٹ غلط تلاش نتائج، تاخیر یا غلط گاڑی ریکارڈ ملانے سے بچنے میں مدد کرتا ہے۔",
    seoKeywordsEn: "e-challan vehicle format, province number plate",
    seoKeywordsUr: "ای-چالان گاڑی فارمیٹ, صوبائی نمبر پلیٹ",
  },
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "What is the Punjab number format for e-challan?",
    questionUr: "ای-چالان کے لیے پنجاب نمبر فارمیٹ کیا ہے؟",
    answerEn:
      "Punjab vehicle numbers may use formats such as ABC 123, ABC 0123, ABC 1111, or ABC-07-1111.",
    answerUr:
      "پنجاب میں گاڑی نمبر ABC 123، ABC 0123، ABC 1111 یا ABC-07-1111 جیسے فارمیٹس میں ہو سکتے ہیں۔",
    regionSlug: "punjab",
    seoKeywordsEn: "Punjab e-challan number format, ABC 123",
    seoKeywordsUr: "پنجاب ای-چالان نمبر, ABC 123",
  },
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "What is the Islamabad ICT number format for e-challan?",
    questionUr: "ای-چالان کے لیے اسلام آباد ICT نمبر فارمیٹ کیا ہے؟",
    answerEn: "Islamabad ICT vehicle numbers commonly use the format ABC-123.",
    answerUr: "اسلام آباد ICT میں گاڑی نمبر عام طور پر ABC-123 فارمیٹ میں ہوتے ہیں۔",
    regionSlug: "islamabad",
    seoKeywordsEn: "Islamabad e-challan number format, ABC-123",
    seoKeywordsUr: "اسلام آباد ای-چالان نمبر, ABC-123",
  },
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "Can PakExcise remove or cancel my e-challan?",
    questionUr: "کیا پاک ایکسائز میرا ای-چالان ختم یا منسوخ کر سکتا ہے؟",
    answerEn:
      "PakExcise provides guidance and support only. Any official challan status, removal, correction, or payment confirmation depends on the relevant official system or authority.",
    answerUr:
      "پاک ایکسائز صرف رہنمائی اور سپورٹ فراہم کرتا ہے۔ کسی بھی سرکاری چالان اسٹیٹس، خاتمے، تصحیح یا ادائیگی کی تصدیق متعلقہ سرکاری نظام یا اتھارٹی پر منحصر ہے۔",
    seoKeywordsEn: "e-challan cancellation, guidance only, not official",
    seoKeywordsUr: "ای-چالان منسوخی, صرف رہنمائی, سرکاری نہیں",
  },
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 9,
    questionEn: "Can I get e-challan help on WhatsApp?",
    questionUr: "کیا میں واٹس ایپ پر ای-چالان مدد حاصل کر سکتا ہوں؟",
    answerEn:
      "Yes. You can use WhatsApp support for quick e-challan guidance or apply with an account for tracked support.",
    answerUr:
      "جی ہاں۔ فوری ای-چالان رہنمائی کے لیے واٹس ایپ سپورٹ استعمال کریں یا ٹریک شدہ سپورٹ کے لیے اکاؤنٹ کے ساتھ درخواست دیں۔",
    seoKeywordsEn: "e-challan WhatsApp, tracked support, apply with account",
    seoKeywordsUr: "ای-چالان واٹس ایپ, ٹریک شدہ سپورٹ, اکاؤنٹ درخواست",
  },
];
