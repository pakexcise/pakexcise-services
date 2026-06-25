export type FaqCategorySeed = {
  slug: string;
  nameEn: string;
  nameUr: string;
  displayOrder: number;
};

export type FaqItemSeed = {
  categorySlug: string;
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
  displayOrder: number;
  isFeatured?: boolean;
  featuredDisplayOrder?: number;
};

export const FAQ_CATEGORY_SEEDS: FaqCategorySeed[] = [
  { slug: "general", nameEn: "General", nameUr: "عام", displayOrder: 1 },
  { slug: "services", nameEn: "Services", nameUr: "خدمات", displayOrder: 2 },
  { slug: "support", nameEn: "Support", nameUr: "سپورٹ", displayOrder: 3 },
  { slug: "account", nameEn: "Account", nameUr: "اکاؤنٹ", displayOrder: 4 },
  {
    slug: "documents",
    nameEn: "Documents",
    nameUr: "دستاویزات",
    displayOrder: 5,
  },
  {
    slug: "vehicle-number-formats",
    nameEn: "Vehicle Number Formats",
    nameUr: "گاڑی نمبر کے فارمیٹ",
    displayOrder: 6,
  },
  {
    slug: "billing-payment",
    nameEn: "Billing & Payment",
    nameUr: "بلنگ اور ادائیگی",
    displayOrder: 7,
  },
  { slug: "tracking", nameEn: "Tracking", nameUr: "ٹریکنگ", displayOrder: 8 },
  {
    slug: "refund-cancellation",
    nameEn: "Refund & Cancellation",
    nameUr: "رقم واپسی اور منسوخی",
    displayOrder: 9,
  },
];

/** Legacy category slugs deactivated after re-seed. */
export const DEPRECATED_FAQ_CATEGORY_SLUGS = ["billing", "regions"] as const;

export const FAQ_ITEM_SEEDS: FaqItemSeed[] = [
  {
    categorySlug: "general",
    questionEn: "What is PakExcise?",
    questionUr: "پاک ایکسائز کیا ہے؟",
    answerEn:
      "PakExcise is a private facilitation platform in Pakistan that helps users get support for vehicle transfer, token tax, new vehicle registration, driving license renewal, learner's license, route permit, vehicle data correction, vehicle passing/fitness, and e-challan-related services.",
    answerUr:
      "پاک ایکسائز پاکستان میں ایک نجی سہولت پلیٹ فارم ہے جو گاڑی منتقلی، ٹوکن ٹیکس، نئی گاڑی رجسٹریشن، ڈرائیونگ لائسنس تجدید، لرنر لائسنس، راؤٹ پرمٹ، ڈیٹا تصحیح، گاڑی فٹنس/پاسنگ اور ای-چالان سے متعلق خدمات میں مدد فراہم کرتا ہے۔",
    displayOrder: 1,
  },
  {
    categorySlug: "general",
    questionEn: "Is PakExcise.com a government website?",
    questionUr: "کیا پاک ایکسائز ڈاٹ کام سرکاری ویب سائٹ ہے؟",
    answerEn:
      "No. PakExcise.com is a private facilitation service and is not affiliated with any government department, Excise & Taxation office, MTMIS, NADRA, ICT Excise, Safe City, or any Government of Pakistan body.",
    answerUr:
      "نہیں۔ پاک ایکسائز ڈاٹ کام ایک نجی سہولت سروس ہے اور کسی بھی سرکاری محکمے، ایکسائز و ٹیکسیشن، MTMIS، NADRA، ICT Excise، Safe City یا Government of Pakistan سے وابستہ نہیں ہے۔",
    displayOrder: 2,
    isFeatured: true,
    featuredDisplayOrder: 1,
  },
  {
    categorySlug: "general",
    questionEn: "What services does PakExcise provide?",
    questionUr: "پاک ایکسائز کون سی خدمات فراہم کرتا ہے؟",
    answerEn:
      "PakExcise provides private facilitation support for vehicle services, license services, and e-challan/Safe City-related guidance. Services include vehicle transfer, token tax payment support, new vehicle registration, vehicle passing/fitness, route permit, data correction, driving license renewal, learner's license, and e-challan support.",
    answerUr:
      "پاک ایکسائز گاڑی، لائسنس اور ای-چالان/Safe City سے متعلق نجی سہولت فراہم کرتا ہے، جن میں گاڑی منتقلی، ٹوکن ٹیکس، نئی رجسٹریشن، فٹنس/پاسنگ، راؤٹ پرمٹ، ڈیٹا تصحیح، لائسنس تجدید، لرنر لائسنس اور ای-چالان سپورٹ شامل ہیں۔",
    displayOrder: 3,
    isFeatured: true,
    featuredDisplayOrder: 2,
  },
  {
    categorySlug: "general",
    questionEn: "Does PakExcise provide services in all provinces?",
    questionUr: "کیا پاک ایکسائز تمام صوبوں میں خدمات فراہم کرتا ہے؟",
    answerEn:
      "Service availability depends on the selected service and province. Some services are available in Punjab and Islamabad ICT, while token tax and e-challan support may cover more provinces. You can check the service page or province page to see current availability.",
    answerUr:
      "خدمات کی دستیابی منتخب سروس اور صوبے پر منحصر ہے۔ بعض خدمات پنجاب اور اسلام آباد ICT میں دستیاب ہیں، جبکہ ٹوکن ٹیکس اور ای-چالان سپورٹ مزید صوبوں میں بھی ہو سکتی ہے۔ موجودہ دستیابی سروس یا صوبے کے صفحے پر دیکھیں۔",
    displayOrder: 4,
  },
  {
    categorySlug: "general",
    questionEn: "Can PakExcise guarantee approval or completion?",
    questionUr: "کیا پاک ایکسائز منظوری یا تکمیل کی ضمانت دیتا ہے؟",
    answerEn:
      "PakExcise helps with private facilitation, document guidance, request handling, and support. Final approval, verification, tax status, challan status, registration update, or license processing may depend on the relevant official system, department, documents, and user-provided information.",
    answerUr:
      "پاک ایکسائز نجی سہولت، دستاویز رہنمائی، درخواست ہینڈلنگ اور سپورٹ میں مدد کرتا ہے۔ حتمی منظوری، تصدیق، ٹیکس/چالان اسٹیٹس، رجسٹریشن اپڈیٹ یا لائسنس پروسیسنگ متعلقہ سرکاری نظام، محکمے، دستاویزات اور آپ کی فراہم کردہ معلومات پر منحصر ہو سکتی ہے۔",
    displayOrder: 5,
  },
  {
    categorySlug: "services",
    questionEn: "Which vehicle services are available on PakExcise?",
    questionUr: "پاک ایکسائز پر کون سی گاڑی کی خدمات دستیاب ہیں؟",
    answerEn:
      "PakExcise supports vehicle transfer, token tax payment support, new vehicle registration, vehicle passing/fitness, route permit, and vehicle data correction where available by province.",
    answerUr:
      "پاک ایکسائز گاڑی منتقلی، ٹوکن ٹیکس، نئی رجسٹریشن، فٹنس/پاسنگ، راؤٹ پرمٹ اور ڈیٹا تصحیح کی سپورٹ فراہم کرتا ہے جہاں صوبے کے مطابق دستیاب ہو۔",
    displayOrder: 1,
  },
  {
    categorySlug: "services",
    questionEn: "Which license services are available?",
    questionUr: "کون سی لائسنس خدمات دستیاب ہیں؟",
    answerEn:
      "PakExcise provides facilitation support for driving license renewal and learner's license services where available, including Punjab and Islamabad ICT based on service availability.",
    answerUr:
      "پاک ایکسائز ڈرائیونگ لائسنس تجدید اور لرنر لائسنس کی سہولت فراہم کرتا ہے جہاں دستیاب ہو، بشمول پنجاب اور اسلام آباد ICT۔",
    displayOrder: 2,
  },
  {
    categorySlug: "services",
    questionEn: "Does PakExcise support e-challan services?",
    questionUr: "کیا پاک ایکسائز ای-چالان سروسز سپورٹ کرتا ہے؟",
    answerEn:
      "Yes. PakExcise provides private guidance and support for e-challan/Safe City-related queries. Users may need to provide their vehicle number and required CNIC details depending on the request.",
    answerUr:
      "جی ہاں۔ پاک ایکسائز ای-چالان/Safe City سے متعلق نجی رہنمائی اور سپورٹ فراہم کرتا ہے۔ درخواست کے مطابق گاڑی نمبر اور CNIC کی تفصیلات درکار ہو سکتی ہیں۔",
    displayOrder: 3,
  },
  {
    categorySlug: "services",
    questionEn: "Can I apply for token tax payment through PakExcise?",
    questionUr: "کیا میں پاک ایکسائز کے ذریعے ٹوکن ٹیکس کی درخواست دے سکتا ہوں؟",
    answerEn:
      "Yes. PakExcise provides token tax payment support for supported provinces. You may need to provide your vehicle registration number in the correct province format.",
    answerUr:
      "جی ہاں۔ پاک ایکسائز معاون صوبوں میں ٹوکن ٹیکس ادائیگی کی سپورٹ فراہم کرتا ہے۔ آپ کو صوبے کے درست فارمیٹ میں گاڑی رجسٹریشن نمبر فراہم کرنا پڑ سکتا ہے۔",
    displayOrder: 4,
  },
  {
    categorySlug: "services",
    questionEn: "Can I apply for vehicle transfer through PakExcise?",
    questionUr: "کیا میں پاک ایکسائز کے ذریعے گاڑی منتقلی کی درخواست دے سکتا ہوں؟",
    answerEn:
      "Yes. PakExcise provides vehicle transfer facilitation support for supported regions such as Punjab and Islamabad ICT. Required documents may vary by province.",
    answerUr:
      "جی ہاں۔ پاک ایکسائز پنجاب اور اسلام آباد ICT جیسے معاون علاقوں میں گاڑی منتقلی کی سہولت فراہم کرتا ہے۔ ضروری دستاویزات صوبے کے مطابق مختلف ہو سکتی ہیں۔",
    displayOrder: 5,
  },
  {
    categorySlug: "services",
    questionEn: "Can I request vehicle data correction?",
    questionUr: "کیا میں گاڑی کے ڈیٹا کی تصحیح کی درخواست کر سکتا ہوں؟",
    answerEn:
      "Yes. PakExcise can help you submit a data correction request where available. Common correction types include name spelling, father name spelling, CNIC digits, address, engine number, chassis number, vehicle color, engine capacity/CC, and other record corrections.",
    answerUr:
      "جی ہاں۔ پاک ایکسائز دستیاب ہونے پر ڈیٹا تصحیح کی درخواست جمع کرانے میں مدد کر سکتا ہے، جیسے نام، والد کا نام، CNIC، پتہ، انجن/شیسی نمبر، رنگ، CC وغیرہ۔",
    displayOrder: 6,
  },
  {
    categorySlug: "support",
    questionEn: "Can I get help on WhatsApp?",
    questionUr: "کیا میں واٹس ایپ پر مدد حاصل کر سکتا ہوں؟",
    answerEn:
      "Yes. You can contact PakExcise support on WhatsApp for quick guidance. WhatsApp support is useful if you want fast help before submitting a request or applying with an account.",
    answerUr:
      "جی ہاں۔ فوری رہنمائی کے لیے آپ پاک ایکسائز سپورٹ سے واٹس ایپ پر رابطہ کر سکتے ہیں۔ درخواست یا اکاؤنٹ درخواست سے پہلے یہ تیز مدد کا بہترین طریقہ ہے۔",
    displayOrder: 1,
    isFeatured: true,
    featuredDisplayOrder: 3,
  },
  {
    categorySlug: "support",
    questionEn: "What is Quick WhatsApp Service?",
    questionUr: "فوری واٹس ایپ سروس کیا ہے؟",
    answerEn:
      "Quick WhatsApp Service allows you to contact PakExcise support directly on WhatsApp. This is the fastest option for basic guidance, document questions, service availability, and next steps.",
    answerUr:
      "فوری واٹس ایپ سروس کے ذریعے آپ براہِ راست پاک ایکسائز سپورٹ سے واٹس ایپ پر رابطہ کر سکتے ہیں۔ یہ بنیادی رہنمائی، دستاویزات، دستیابی اور اگلے مراحل کے لیے تیز ترین آپشن ہے۔",
    displayOrder: 2,
  },
  {
    categorySlug: "support",
    questionEn: "What is Submit Request?",
    questionUr: "درخواست جمع کریں کیا ہے؟",
    answerEn:
      "Submit Request allows you to send a simple service request without creating an account. After submission, PakExcise support may contact you on WhatsApp for further details and guidance.",
    answerUr:
      "درخواست جمع کریں کے ذریعے آپ بغیر اکاؤنٹ کے سادہ سروس درخواست بھیج سکتے ہیں۔ جمع کرانے کے بعد پاک ایکسائز سپورٹ مزید تفصیلات کے لیے واٹس ایپ پر رابطہ کر سکتی ہے۔",
    displayOrder: 3,
  },
  {
    categorySlug: "support",
    questionEn: "What is Apply with Account?",
    questionUr: "اکاؤنٹ کے ساتھ درخواست کیا ہے؟",
    answerEn:
      "Apply with Account is for users who want full website tracking. After creating an account, you can submit an application, upload documents, view status, check invoices, see history, and receive updates from your dashboard.",
    answerUr:
      "اکاؤنٹ کے ساتھ درخواست ان صارفین کے لیے ہے جو مکمل ویب سائٹ ٹریکنگ چاہتے ہیں۔ اکاؤنٹ بنانے کے بعد آپ درخواست، دستاویزات، اسٹیٹس، انوائس، تاریخ اور اپڈیٹس ڈیش بورڈ سے دیکھ سکتے ہیں۔",
    displayOrder: 4,
  },
  {
    categorySlug: "support",
    questionEn: "What are PakExcise support hours?",
    questionUr: "پاک ایکسائز سپورٹ کے اوقات کیا ہیں؟",
    answerEn:
      "PakExcise support is available Monday to Sunday from 7:00 AM to 12:00 PM. Support availability may vary during holidays, technical maintenance, or high request volume.",
    answerUr:
      "پاک ایکسائز سپورٹ پیر سے اتوار صبح 7:00 بجے سے دوپہر 12:00 بجے تک دستیاب ہے۔ تعطیلات، مرمت یا زیادہ درخواستوں کے دوران اوقات مختلف ہو سکتے ہیں۔",
    displayOrder: 5,
  },
  {
    categorySlug: "account",
    questionEn: "Do I need to create an account to use PakExcise?",
    questionUr: "کیا پاک ایکسائز استعمال کرنے کے لیے اکاؤنٹ بنانا ضروری ہے؟",
    answerEn:
      "No. You can use WhatsApp support or Submit Request without creating an account. However, if you want full tracking, document history, invoice history, and status updates, you should apply with an account.",
    answerUr:
      "نہیں۔ آپ بغیر اکاؤنٹ کے واٹس ایپ سپورٹ یا درخواست جمع کریں استعمال کر سکتے ہیں۔ مکمل ٹریکنگ، دستاویز/انوائس تاریخ اور اپڈیٹس کے لیے اکاؤنٹ کے ساتھ درخواست دیں۔",
    displayOrder: 1,
    isFeatured: true,
    featuredDisplayOrder: 4,
  },
  {
    categorySlug: "account",
    questionEn: "What are the benefits of creating an account?",
    questionUr: "اکاؤنٹ بنانے کے کیا فائدے ہیں؟",
    answerEn:
      "An account allows you to track application status, upload documents, view invoices, check payment status, see application history, and receive updates from your dashboard.",
    answerUr:
      "اکاؤنٹ سے آپ درخواست کا اسٹیٹس ٹریک کر سکتے ہیں، دستاویزات اپ لوڈ کر سکتے ہیں، انوائس دیکھ سکتے ہیں، ادائیگی کی حالت چیک کر سکتے ہیں، تاریخ دیکھ سکتے ہیں اور ڈیش بورڈ سے اپڈیٹس حاصل کر سکتے ہیں۔",
    displayOrder: 2,
    isFeatured: true,
    featuredDisplayOrder: 5,
  },
  {
    categorySlug: "account",
    questionEn: "Can I track my request without an account?",
    questionUr: "کیا میں بغیر اکاؤنٹ درخواست ٹریک کر سکتا ہوں؟",
    answerEn:
      "Tracking is mainly available for account-based applications. If you use Quick WhatsApp Service or Submit Request, support may continue through WhatsApp instead of full website tracking.",
    answerUr:
      "ٹریکنگ بنیادی طور پر اکاؤنٹ والی درخواستوں کے لیے دستیاب ہے۔ فوری واٹس ایپ یا درخواست جمع کریں استعمال کرنے پر سپورٹ واٹس ایپ کے ذریعے جاری رہ سکتی ہے۔",
    displayOrder: 3,
  },
  {
    categorySlug: "account",
    questionEn: "Can I edit my submitted application?",
    questionUr: "کیا میں جمع شدہ درخواست میں ترمیم کر سکتا ہوں؟",
    answerEn:
      "Editing depends on the application status. If your application is still under review, PakExcise support may request corrections or additional documents. Some details may not be editable once processing has started.",
    answerUr:
      "ترمیم درخواست کے اسٹیٹس پر منحصر ہے۔ جائزے کے دوران سپورٹ تصحیح یا اضافی دستاویزات مانگ سکتی ہے۔ پروسیسنگ شروع ہونے کے بعد بعض تفصیلات قابلِ ترمیم نہیں رہتیں۔",
    displayOrder: 4,
  },
  {
    categorySlug: "documents",
    questionEn: "Can I see required documents before applying?",
    questionUr: "کیا میں درخواست سے پہلے ضروری دستاویزات دیکھ سکتا ہوں؟",
    answerEn:
      "Yes. PakExcise shows required documents where available based on the selected service and province. Document requirements may vary for Punjab, Islamabad ICT, Sindh, Balochistan, Khyber Pakhtunkhwa, AJK, and other regions.",
    answerUr:
      "جی ہاں۔ پاک ایکسائز منتخب سروس اور صوبے کے مطابق ضروری دستاویزات دکھاتا ہے جہاں دستیاب ہوں۔ ضروریات پنجاب، ICT، سندھ، بلوچستان، KP، AJK وغیرہ میں مختلف ہو سکتی ہیں۔",
    displayOrder: 1,
    isFeatured: true,
    featuredDisplayOrder: 6,
  },
  {
    categorySlug: "documents",
    questionEn: "Why do document requirements vary by province?",
    questionUr: "صوبے کے لحاظ سے دستاویزات کی ضروریات مختلف کیوں ہیں؟",
    answerEn:
      "Each province or region may follow different service requirements, vehicle number formats, verification steps, or document processes. PakExcise displays requirements based on the selected service and province.",
    answerUr:
      "ہر صوبے یا علاقے میں سروس، گاڑی نمبر فارمیٹ، تصدیق اور دستاویز کے عمل مختلف ہو سکتے ہیں۔ پاک ایکسائز منتخب سروس اور صوبے کے مطابق ضروریات دکھاتا ہے۔",
    displayOrder: 2,
  },
  {
    categorySlug: "documents",
    questionEn: "What file types can I upload?",
    questionUr: "میں کون سے فائل فارمیٹ اپ لوڈ کر سکتا ہوں؟",
    answerEn:
      "PakExcise may allow common file types such as JPG, PNG, WebP, and PDF depending on the document type. Uploaded files should be clear, readable, and relevant to the selected service.",
    answerUr:
      "پاک ایکسائز دستاویز کی قسم کے مطابق JPG، PNG، WebP اور PDF جیسے عام فارمیٹ قبول کر سکتا ہے۔ فائلیں واضح، پڑھنے کے قابل اور متعلقہ ہونی چاہئیں۔",
    displayOrder: 3,
  },
  {
    categorySlug: "documents",
    questionEn: "What happens if my document is unclear or incorrect?",
    questionUr: "اگر میری دستاویز غیر واضح یا غلط ہو تو کیا ہوگا؟",
    answerEn:
      "If a document is unclear, incomplete, expired, or incorrect, PakExcise support may ask you to upload a new document or provide additional information before the request can move forward.",
    answerUr:
      "اگر دستاویز غیر واضح، نامکمل، میعاد ختم یا غلط ہو تو پاک ایکسائز سپورٹ نئی دستاویز یا اضافی معلومات مانگ سکتی ہے۔",
    displayOrder: 4,
  },
  {
    categorySlug: "documents",
    questionEn: "Is my uploaded document safe?",
    questionUr: "کیا میری اپ لوڈ شدہ دستاویز محفوظ ہے؟",
    answerEn:
      "PakExcise uses reasonable security practices such as restricted access, secure storage, and role-based access controls to protect uploaded documents. You should only upload documents required for your selected service.",
    answerUr:
      "پاک ایکسائز محدود رسائی، محفوظ اسٹوریج اور کردار کی بنیاد پر کنٹرولز کے ذریعے دستاویزات کی حفاظت کرتا ہے۔ صرف منتخب سروس کے لیے درکار دستاویزات اپ لوڈ کریں۔",
    displayOrder: 5,
  },
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "Why is vehicle number format important?",
    questionUr: "گاڑی نمبر کا فارمیٹ کیوں اہم ہے؟",
    answerEn:
      "Vehicle number format is important because different provinces use different registration number patterns. Entering the wrong format may cause delays, incorrect search results, or failed verification.",
    answerUr:
      "گاڑی نمبر کا فارمیٹ اہم ہے کیونکہ مختلف صوبوں میں رجسٹریشن نمبر کے مختلف پیٹرن ہوتے ہیں۔ غلط فارمیٹ تاخیر، غلط نتائج یا ناکام تصدیق کا سبب بن سکتا ہے۔",
    displayOrder: 1,
  },
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "What is the Punjab vehicle number format?",
    questionUr: "پنجاب میں گاڑی نمبر کا فارمیٹ کیا ہے؟",
    answerEn:
      "Punjab vehicle registration numbers may use formats such as ABC 123, ABC 0123, ABC 1111, or ABC-07-1111, depending on the registration type and record.",
    answerUr:
      "پنجاب میں گاڑی رجسٹریشن نمبر ABC 123، ABC 0123، ABC 1111 یا ABC-07-1111 جیسے فارمیٹ استعمال کر سکتے ہیں، رجسٹریشن کی قسم کے مطابق۔",
    displayOrder: 2,
  },
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "What is the Islamabad ICT vehicle number format?",
    questionUr: "اسلام آباد ICT میں گاڑی نمبر کا فارمیٹ کیا ہے؟",
    answerEn: "Islamabad ICT vehicle numbers commonly use the format ABC-123.",
    answerUr: "اسلام آباد ICT میں عام طور پر ABC-123 فارمیٹ استعمال ہوتا ہے۔",
    displayOrder: 3,
  },
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "What is the Sindh vehicle number format?",
    questionUr: "سندھ میں گاڑی نمبر کا فارمیٹ کیا ہے؟",
    answerEn: "Sindh vehicle numbers commonly use the format ABC-123.",
    answerUr: "سندھ میں عام طور پر ABC-123 فارمیٹ استعمال ہوتا ہے۔",
    displayOrder: 4,
  },
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "What is the Khyber Pakhtunkhwa vehicle number format?",
    questionUr: "خیبر پختونخوا میں گاڑی نمبر کا فارمیٹ کیا ہے؟",
    answerEn:
      "Khyber Pakhtunkhwa vehicle numbers may use formats such as ABC-1234 or ABC-123.",
    answerUr:
      "خیبر پختونخوا میں ABC-1234 یا ABC-123 جیسے فارمیٹ استعمال ہو سکتے ہیں۔",
    displayOrder: 5,
  },
  {
    categorySlug: "vehicle-number-formats",
    questionEn: "What is the Azad Jammu & Kashmir vehicle number format?",
    questionUr: "آزاد جموں و کشمیر میں گاڑی نمبر کا فارمیٹ کیا ہے؟",
    answerEn:
      "Azad Jammu & Kashmir vehicle numbers may use formats such as AA-BB-1234 or AB-123, depending on the vehicle type and registration style.",
    answerUr:
      "AJK میں AA-BB-1234 یا AB-123 جیسے فارمیٹ استعمال ہو سکتے ہیں، گاڑی کی قسم کے مطابق۔",
    displayOrder: 6,
  },
  {
    categorySlug: "billing-payment",
    questionEn: "Are service fees shown on the website?",
    questionUr: "کیا ویب سائٹ پر سروس فیس دکھائی جاتی ہے؟",
    answerEn:
      "No. PakExcise does not show fixed service fees on public pages. Facilitation charges may depend on the service type, province, document requirements, case status, and support needed.",
    answerUr:
      "نہیں۔ پاک ایکسائز عوامی صفحات پر مقررہ سروس فیس نہیں دکھاتا۔ سہولت چارجز سروس، صوبے، دستاویزات، کیس اسٹیٹس اور سپورٹ کی ضرورت پر منحصر ہو سکتے ہیں۔",
    displayOrder: 1,
    isFeatured: true,
    featuredDisplayOrder: 7,
  },
  {
    categorySlug: "billing-payment",
    questionEn: "How will I know the payment amount?",
    questionUr: "مجھے ادائیگی کی رقم کیسے معلوم ہوگی؟",
    answerEn:
      "If payment is required, PakExcise will share the amount through an invoice, application update, or support message after reviewing your request.",
    answerUr:
      "اگر ادائیگی درکار ہو تو پاک ایکسائز درخواست کے جائزے کے بعد انوائس، اپڈیٹ یا سپورٹ پیغام کے ذریعے رقم بتائے گا۔",
    displayOrder: 2,
  },
  {
    categorySlug: "billing-payment",
    questionEn: "Are government fees included in PakExcise charges?",
    questionUr: "کیا سرکاری فیس پاک ایکسائز چارجز میں شامل ہیں؟",
    answerEn:
      "Government fees, official taxes, challans, penalties, registration fees, license fees, or department charges are separate where applicable. PakExcise facilitation charges are separate from official charges.",
    answerUr:
      "سرکاری فیس، ٹیکس، چالان، جرمانے، رجسٹریشن/لائسنس فیس یا محکمے کے چارجز الگ ہوتے ہیں۔ پاک ایکسائز سہولت چارجز سرکاری چارجز سے الگ ہیں۔",
    displayOrder: 3,
  },
  {
    categorySlug: "billing-payment",
    questionEn: "How do I upload payment proof?",
    questionUr: "میں ادائیگی کا ثبوت کیسے اپ لوڈ کروں؟",
    answerEn:
      "For account-based applications, you may upload payment proof from your dashboard when an invoice is issued. The screenshot or receipt should be clear and include amount, date/time, and transaction details where available.",
    answerUr:
      "اکاؤنٹ والی درخواستوں میں انوائس جاری ہونے پر ڈیش بورڈ سے ادائیگی کا ثبوت اپ لوڈ کریں۔ اسکرین شاٹ یا رسید واضح ہو اور رقم، تاریخ/وقت اور ٹرانزیکشن کی تفصیلات شامل ہوں۔",
    displayOrder: 4,
  },
  {
    categorySlug: "billing-payment",
    questionEn: "When is my payment considered verified?",
    questionUr: "میری ادائیگی کب تصدیق شدہ سمجھی جاتی ہے؟",
    answerEn:
      "Payment is considered verified only after PakExcise reviews and approves the payment proof. Uploading a screenshot does not automatically confirm payment.",
    answerUr:
      "ادائیگی تب تصدیق شدہ سمجھی جاتی ہے جب پاک ایکسائز ثبوت کا جائزہ لے کر منظور کرے۔ اسکرین شاٹ اپ لوڈ سے ادائیگی خود بخود تصدیق نہیں ہوتی۔",
    displayOrder: 5,
  },
  {
    categorySlug: "tracking",
    questionEn: "How do I track my application?",
    questionUr: "میں اپنی درخواست کیسے ٹریک کروں؟",
    answerEn:
      "You can track your application from the Track page using your tracking ID. Account users can also view status, invoices, documents, history, and updates from their dashboard.",
    answerUr:
      "آپ ٹریک صفحے پر ٹریکنگ آئی ڈی سے درخواست ٹریک کر سکتے ہیں۔ اکاؤنٹ صارفین ڈیش بورڈ سے اسٹیٹس، انوائس، دستاویزات، تاریخ اور اپڈیٹس بھی دیکھ سکتے ہیں۔",
    displayOrder: 1,
    isFeatured: true,
    featuredDisplayOrder: 8,
  },
  {
    categorySlug: "tracking",
    questionEn: 'What does "Submitted" status mean?',
    questionUr: '"جمع شدہ" اسٹیٹس کا کیا مطلب ہے؟',
    answerEn:
      "Submitted means your application has been received and is waiting for review by PakExcise support or admin.",
    answerUr:
      "جمع شدہ کا مطلب ہے کہ آپ کی درخواست موصول ہو گئی ہے اور پاک ایکسائز سپورٹ یا ایڈمن کے جائزے کا انتظار ہے۔",
    displayOrder: 2,
  },
  {
    categorySlug: "tracking",
    questionEn: 'What does "Docs Required" status mean?',
    questionUr: '"دستاویزات درکار" اسٹیٹس کا کیا مطلب ہے؟',
    answerEn:
      "Docs Required means additional documents or corrected files are needed before your application can move forward.",
    answerUr:
      "دستاویزات درکار کا مطلب ہے کہ درخواست آگے بڑھنے کے لیے اضافی یا درست دستاویزات درکار ہیں۔",
    displayOrder: 3,
  },
  {
    categorySlug: "tracking",
    questionEn: 'What does "Invoice Sent" status mean?',
    questionUr: '"انوائس بھیج دی گئی" اسٹیٹس کا کیا مطلب ہے؟',
    answerEn:
      "Invoice Sent means PakExcise has reviewed your request and shared payment details or invoice information where applicable.",
    answerUr:
      "انوائس بھیج دی گئی کا مطلب ہے کہ پاک ایکسائز نے درخواست کا جائزہ لیا ہے اور ادائیگی/انوائس کی تفصیلات شیئر کی ہیں۔",
    displayOrder: 4,
  },
  {
    categorySlug: "tracking",
    questionEn: 'What does "Completed" status mean?',
    questionUr: '"مکمل" اسٹیٹس کا کیا مطلب ہے؟',
    answerEn:
      "Completed means PakExcise has completed the agreed facilitation step or service handling based on the selected request and available process.",
    answerUr:
      "مکمل کا مطلب ہے کہ پاک ایکسائز نے منتخب درخواست اور دستیاب عمل کے مطابق متفقہ سہولت کا مرحلہ مکمل کر دیا ہے۔",
    displayOrder: 5,
  },
  {
    categorySlug: "refund-cancellation",
    questionEn: "Can I cancel my request?",
    questionUr: "کیا میں اپنی درخواست منسوخ کر سکتا ہوں؟",
    answerEn:
      "You may request cancellation before processing starts. If document review, support work, coordination, payment handling, or service processing has already started, cancellation may not qualify for a full refund.",
    answerUr:
      "پروسیسنگ شروع ہونے سے پہلے منسوخی کی درخواست دی جا سکتی ہے۔ اگر جائزہ، سپورٹ، کوآرڈینیشن یا ادائیگی کا کام شروع ہو چکا ہو تو مکمل رقم واپسی ممکن نہیں۔",
    displayOrder: 1,
  },
  {
    categorySlug: "refund-cancellation",
    questionEn: "Can I get a refund?",
    questionUr: "کیا مجھے رقم واپس مل سکتی ہے؟",
    answerEn:
      "Refund eligibility depends on payment status, application status, and work completed. Duplicate payments or payments made by mistake may be reviewed by PakExcise support.",
    answerUr:
      "رقم واپسی ادائیگی/درخواست کے اسٹیٹس اور مکمل کام پر منحصر ہے۔ ڈپلیکیٹ یا غلطی سے کی گئی ادائیگی کا جائزہ پاک ایکسائز سپورٹ لے سکتی ہے۔",
    displayOrder: 2,
  },
  {
    categorySlug: "refund-cancellation",
    questionEn: "Are government fees refundable?",
    questionUr: "کیا سرکاری فیس واپس ہو سکتی ہے؟",
    answerEn:
      "Government fees, official taxes, challans, courier charges, wallet/bank charges, or third-party charges are usually non-refundable once paid or submitted.",
    answerUr:
      "سرکاری فیس، ٹیکس، چالان، کورئیر، والیٹ/بینک یا third-party چارجز عموماً ادا یا جمع کرانے کے بعد واپس نہیں ہوتے۔",
    displayOrder: 3,
  },
];
