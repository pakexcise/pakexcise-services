import type {
  ChecklistItemType,
  DocumentRequirementKind,
  FieldType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

const DEFAULT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

type SeedChecklistItem = {
  slug: string;
  nameEn: string;
  nameUr: string;
  descriptionEn?: string;
  descriptionUr?: string;
  itemType?: ChecklistItemType;
  displayOrder?: number;
};

type SeedDoc = {
  docType: string;
  checklistSlug?: string;
  regionSlug?: string | null;
  kind?: DocumentRequirementKind;
  labelEn: string;
  labelUr: string;
  instructionsEn?: string;
  instructionsUr?: string;
  isRequired?: boolean;
  displayOrder?: number;
};

type SeedField = {
  fieldKey: string;
  regionSlug?: string | null;
  labelEn: string;
  labelUr: string;
  fieldType: FieldType;
  placeholderEn?: string;
  placeholderUr?: string;
  helpTextEn?: string;
  helpTextUr?: string;
  isRequired?: boolean;
  optionsJson?: Array<{ value: string; labelEn: string; labelUr: string }>;
  validationJson?: Record<string, unknown>;
  displayOrder?: number;
};

type SeedRegionNote = {
  regionSlug: string;
  supportNotesEn: string;
  supportNotesUr: string;
};

type ServiceConfig = {
  processingNotesEn?: string;
  processingNotesUr?: string;
  regionNotes?: SeedRegionNote[];
  documents?: SeedDoc[];
  fields?: SeedField[];
};

export const CHECKLIST_ITEM_SEED: SeedChecklistItem[] = [
  { slug: "phone-number", nameEn: "Phone number", nameUr: "فون نمبر", itemType: "TEXT_FIELD", displayOrder: 1 },
  { slug: "applicant-name", nameEn: "Applicant name", nameUr: "درخواست دہندہ کا نام", itemType: "TEXT_FIELD", displayOrder: 2 },
  { slug: "vehicle-registration-number", nameEn: "Vehicle registration number", nameUr: "گاڑی رجسٹریشن نمبر", itemType: "TEXT_FIELD", displayOrder: 3 },
  { slug: "vehicle-number", nameEn: "Vehicle number", nameUr: "گاڑی نمبر", itemType: "TEXT_FIELD", displayOrder: 4 },
  { slug: "cnic-front-picture", nameEn: "CNIC front picture", nameUr: "شناختی کارڈ سامنے کی تصویر", itemType: "DOCUMENT", displayOrder: 10 },
  { slug: "cnic-back-picture", nameEn: "CNIC back picture", nameUr: "شناختی کارڈ پیچھے کی تصویر", itemType: "DOCUMENT", displayOrder: 11 },
  { slug: "applicant-cnic-front", nameEn: "Applicant original CNIC front picture", nameUr: "درخواست دہندہ کا اصل شناختی کارڈ سامنے", itemType: "DOCUMENT", displayOrder: 12 },
  { slug: "applicant-cnic-back", nameEn: "Applicant original CNIC back picture", nameUr: "درخواست دہندہ کا اصل شناختی کارڈ پیچھے", itemType: "DOCUMENT", displayOrder: 13 },
  { slug: "purchaser-cnic-front", nameEn: "Purchaser CNIC front picture", nameUr: "خریدار کا شناختی کارڈ سامنے", itemType: "DOCUMENT", displayOrder: 14 },
  { slug: "purchaser-cnic-back", nameEn: "Purchaser CNIC back picture", nameUr: "خریدار کا شناختی کارڈ پیچھے", itemType: "DOCUMENT", displayOrder: 15 },
  { slug: "owner-cnic-front", nameEn: "Owner CNIC front picture", nameUr: "مالک کا شناختی کارڈ سامنے", itemType: "DOCUMENT", displayOrder: 16 },
  { slug: "owner-cnic-back", nameEn: "Owner CNIC back picture", nameUr: "مالک کا شناختی کارڈ پیچھے", itemType: "DOCUMENT", displayOrder: 17 },
  { slug: "vehicle-front-picture", nameEn: "Vehicle front picture", nameUr: "گاڑی کی سامنے کی تصویر", itemType: "DOCUMENT", displayOrder: 20 },
  { slug: "vehicle-back-picture", nameEn: "Vehicle back picture", nameUr: "گاڑی کی پیچھے کی تصویر", itemType: "DOCUMENT", displayOrder: 21 },
  { slug: "chassis-number-picture", nameEn: "Chassis number picture", nameUr: "چیسیس نمبر کی تصویر", itemType: "DOCUMENT", displayOrder: 22 },
  { slug: "sales-invoice", nameEn: "Sales invoice", nameUr: "سیلز انوائس", itemType: "DOCUMENT", displayOrder: 23 },
  { slug: "fitness-certificate", nameEn: "Fitness certificate", nameUr: "فٹنس سرٹیفکیٹ", itemType: "DOCUMENT", displayOrder: 24 },
  { slug: "medical-certificate", nameEn: "Medical certificate", nameUr: "میڈیکل سرٹیفکیٹ", itemType: "DOCUMENT", displayOrder: 25 },
  { slug: "medical-fitness-certificate", nameEn: "Medical fitness certificate", nameUr: "میڈیکل فٹنس سرٹیفکیٹ", itemType: "DOCUMENT", displayOrder: 26 },
  { slug: "passport-size-photo", nameEn: "Recent passport-size photo", nameUr: "حالیہ پاسپورٹ سائز تصویر", itemType: "DOCUMENT", displayOrder: 27 },
  { slug: "original-smart-card", nameEn: "Original vehicle smart card", nameUr: "اصل گاڑی سمارٹ کارڈ", itemType: "DOCUMENT", displayOrder: 28 },
  { slug: "original-number-plates", nameEn: "Original number plates", nameUr: "اصل نمبر پلیٹس", itemType: "DOCUMENT", displayOrder: 29 },
  { slug: "seller-biometric", nameEn: "Seller biometric", nameUr: "فروخت کنندہ بایومیٹرک", itemType: "BIOMETRIC", displayOrder: 30 },
  { slug: "purchaser-biometric", nameEn: "Purchaser biometric", nameUr: "خریدار بایومیٹرک", itemType: "BIOMETRIC", displayOrder: 31 },
  { slug: "private-vehicle-inspection", nameEn: "Private vehicle inspection", nameUr: "نجی گاڑی معائنہ", itemType: "INSPECTION", displayOrder: 32 },
  { slug: "vehicle-inspection", nameEn: "Vehicle inspection", nameUr: "گاڑی معائنہ", itemType: "INSPECTION", displayOrder: 33 },
];

const DATA_CORRECTION_OPTIONS = [
  { value: "name-spelling", labelEn: "Name spelling correction", labelUr: "نام کی ہجے کی تصحیح" },
  { value: "father-name-spelling", labelEn: "Father name spelling correction", labelUr: "والد کے نام کی ہجے کی تصحیح" },
  { value: "incorrect-cnic", labelEn: "Incorrect CNIC digits", labelUr: "غلط شناختی کارڈ ہندسے" },
  { value: "wrong-address", labelEn: "Wrong address", labelUr: "غلط پتہ" },
  { value: "engine-mismatch", labelEn: "Engine number mismatch", labelUr: "انجن نمبر کا عدم مطابقت" },
  { value: "chassis-mismatch", labelEn: "Chassis number mismatch", labelUr: "چیسیس نمبر کا عدم مطابقت" },
  { value: "color-correction", labelEn: "Vehicle color correction", labelUr: "گاڑی رنگ کی تصحیح" },
  { value: "cc-correction", labelEn: "Engine capacity / CC correction", labelUr: "انجن کیپیسٹی / CC تصحیح" },
  { value: "other", labelEn: "Other record correction details", labelUr: "دیگر ریکارڈ تصحیح کی تفصیل" },
];

function doc(
  docType: string,
  labelEn: string,
  labelUr: string,
  options: Partial<SeedDoc> = {},
): SeedDoc {
  return {
    docType,
    labelEn,
    labelUr,
    kind: "FILE",
    isRequired: true,
    ...options,
  };
}

function field(
  fieldKey: string,
  labelEn: string,
  labelUr: string,
  fieldType: FieldType,
  options: Partial<SeedField> = {},
): SeedField {
  return {
    fieldKey,
    labelEn,
    labelUr,
    fieldType,
    isRequired: true,
    ...options,
  };
}

export const SERVICE_CONFIG_SEED: Record<string, ServiceConfig> = {
  "vehicle-transfer": {
    regionNotes: [
      {
        regionSlug: "punjab",
        supportNotesEn:
          "Customer support will guide the biometric process through WhatsApp.",
        supportNotesUr:
          "کسٹمر سپورٹ واٹس ایپ کے ذریعے بایومیٹرک عمل کی رہنمائی کرے گی۔",
      },
      {
        regionSlug: "islamabad",
        supportNotesEn:
          "Documents should be delivered to TCS Express Center, I-8 Markaz against PakExcise 03450664441, or contact support on WhatsApp for delivery help.",
        supportNotesUr:
          "دستاویزات TCS Express Center, I-8 Markaz پر PakExcise 03450664441 کے نام پر بھیجی جائیں، یا ڈیلیوری کی مدد کے لیے واٹس ایپ پر سپورٹ سے رابطہ کریں۔",
      },
    ],
    documents: [
      doc("vehicle_front_picture", "Vehicle front picture", "گاڑی کی سامنے کی تصویر", { regionSlug: "punjab", displayOrder: 1 }),
      doc("vehicle_back_picture", "Vehicle back picture", "گاڑی کی پیچھے کی تصویر", { regionSlug: "punjab", displayOrder: 2 }),
      doc("chassis_number_picture", "Chassis number picture", "چیسیس نمبر کی تصویر", { regionSlug: "punjab", displayOrder: 3 }),
      doc("purchaser_cnic_front", "Purchaser CNIC front picture", "خریدار کا شناختی کارڈ سامنے", { regionSlug: "punjab", displayOrder: 4, checklistSlug: "purchaser-cnic-front" }),
      doc("purchaser_cnic_back", "Purchaser CNIC back picture", "خریدار کا شناختی کارڈ پیچھے", { regionSlug: "punjab", displayOrder: 5, checklistSlug: "purchaser-cnic-back" }),
      doc("seller_biometric", "Seller biometric", "فروخت کنندہ بایومیٹرک", { regionSlug: "punjab", kind: "BIOMETRIC", displayOrder: 6, instructionsEn: "Support will guide seller biometric through WhatsApp.", instructionsUr: "سپورٹ واٹس ایپ کے ذریعے فروخت کنندہ بایومیٹرک کی رہنمائی کرے گی۔" }),
      doc("purchaser_biometric", "Purchaser biometric", "خریدار بایومیٹرک", { regionSlug: "punjab", kind: "BIOMETRIC", displayOrder: 7, instructionsEn: "Support will guide purchaser biometric through WhatsApp.", instructionsUr: "سپورٹ واٹس ایپ کے ذریعے خریدار بایومیٹرک کی رہنمائی کرے گی۔" }),
      doc("purchaser_cnic_front", "Purchaser CNIC front picture", "خریدار کا شناختی کارڈ سامنے", { regionSlug: "islamabad", displayOrder: 1, checklistSlug: "purchaser-cnic-front" }),
      doc("purchaser_cnic_back", "Purchaser CNIC back picture", "خریدار کا شناختی کارڈ پیچھے", { regionSlug: "islamabad", displayOrder: 2, checklistSlug: "purchaser-cnic-back" }),
      doc("original_smart_card", "Original vehicle smart card", "اصل گاڑی سمارٹ کارڈ", { regionSlug: "islamabad", displayOrder: 3, checklistSlug: "original-smart-card" }),
      doc("original_number_plates", "Original number plates", "اصل نمبر پلیٹس", { regionSlug: "islamabad", displayOrder: 4, checklistSlug: "original-number-plates" }),
      doc("private_vehicle_inspection", "Private vehicle inspection", "نجی گاڑی معائنہ", { regionSlug: "islamabad", kind: "INSPECTION", displayOrder: 5, instructionsEn: "Private vehicle inspection is required as per ICT process.", instructionsUr: "ICT عمل کے مطابق نجی گاڑی معائنہ درکار ہے۔" }),
      doc("fitness_certificate", "Fitness certificate", "فٹنس سرٹیفکیٹ", { regionSlug: "islamabad", displayOrder: 6, isRequired: false, instructionsEn: "Required only for commercial vehicles.", instructionsUr: "صرف تجارتی گاڑیوں کے لیے درکار۔" }),
    ],
  },
  "token-tax": {
    fields: [
      field("vehicle_registration_number", "Vehicle registration number", "گاڑی رجسٹریشن نمبر", "TEXT", {
        regionSlug: "punjab",
        placeholderEn: "e.g. ABC 123 or ABC-07-1111",
        helpTextEn: "Accepted formats: ABC 123, ABC 0123, ABC 1111, ABC-07-1111",
        helpTextUr: "قبول شدہ فارمیٹس: ABC 123، ABC 0123، ABC 1111، ABC-07-1111",
        displayOrder: 1,
      }),
      field("vehicle_registration_number", "Vehicle registration number", "گاڑی رجسٹریشن نمبر", "TEXT", {
        regionSlug: "islamabad",
        placeholderEn: "e.g. ABC-123",
        helpTextEn: "Accepted format: ABC-123",
        helpTextUr: "قبول شدہ فارمیٹ: ABC-123",
        displayOrder: 1,
      }),
      field("vehicle_registration_number", "Vehicle registration number", "گاڑی رجسٹریشن نمبر", "TEXT", {
        regionSlug: "sindh",
        placeholderEn: "e.g. ABC-123",
        helpTextEn: "Accepted format: ABC-123",
        helpTextUr: "قبول شدہ فارمیٹ: ABC-123",
        displayOrder: 1,
      }),
      field("vehicle_registration_number", "Vehicle registration number", "گاڑی رجسٹریشن نمبر", "TEXT", {
        regionSlug: "balochistan",
        placeholderEn: "e.g. ABC-123",
        helpTextEn: "Accepted format: ABC-123",
        helpTextUr: "قبول شدہ فارمیٹ: ABC-123",
        displayOrder: 1,
      }),
      field("vehicle_registration_number", "Vehicle registration number", "گاڑی رجسٹریشن نمبر", "TEXT", {
        regionSlug: "kpk",
        placeholderEn: "e.g. ABC-1234",
        helpTextEn: "Accepted formats: ABC-1234, ABC-123",
        helpTextUr: "قبول شدہ فارمیٹس: ABC-1234، ABC-123",
        displayOrder: 1,
      }),
    ],
  },
  "new-vehicle-registration": {
    regionNotes: [
      {
        regionSlug: "punjab",
        supportNotesEn: "Customer support will contact the user for biometric guidance.",
        supportNotesUr: "کسٹمر سپورٹ بایومیٹرک رہنمائی کے لیے صارف سے رابطہ کرے گی۔",
      },
      {
        regionSlug: "islamabad",
        supportNotesEn:
          "Customer support will contact the user for biometric and next-step guidance.",
        supportNotesUr:
          "کسٹمر سپورٹ بایومیٹرک اور اگلے مرحلے کی رہنمائی کے لیے صارف سے رابطہ کرے گی۔",
      },
    ],
    documents: [
      doc("sales_invoice", "Sales invoice", "سیلز انوائس", { regionSlug: "punjab", displayOrder: 1 }),
      doc("purchaser_cnic_front", "Purchaser CNIC front picture", "خریدار کا شناختی کارڈ سامنے", { regionSlug: "punjab", displayOrder: 2 }),
      doc("purchaser_cnic_back", "Purchaser CNIC back picture", "خریدار کا شناختی کارڈ پیچھے", { regionSlug: "punjab", displayOrder: 3 }),
      doc("purchaser_biometric", "Purchaser biometric", "خریدار بایومیٹرک", { regionSlug: "punjab", kind: "BIOMETRIC", displayOrder: 4 }),
      doc("sales_invoice", "Sales invoice", "سیلز انوائس", { regionSlug: "islamabad", displayOrder: 1 }),
      doc("purchaser_cnic_front", "Purchaser CNIC front picture", "خریدار کا شناختی کارڈ سامنے", { regionSlug: "islamabad", displayOrder: 2 }),
      doc("purchaser_cnic_back", "Purchaser CNIC back picture", "خریدار کا شناختی کارڈ پیچھے", { regionSlug: "islamabad", displayOrder: 3 }),
      doc("purchaser_biometric", "Purchaser biometric", "خریدار بایومیٹرک", { regionSlug: "islamabad", kind: "BIOMETRIC", displayOrder: 4 }),
      doc("vehicle_inspection", "Vehicle inspection", "گاڑی معائنہ", { regionSlug: "islamabad", kind: "INSPECTION", displayOrder: 5 }),
    ],
  },
  "vehicle-passing-fitness": {
    documents: [
      doc("vehicle_front_picture", "Vehicle front picture", "گاڑی کی سامنے کی تصویر", { regionSlug: "islamabad", displayOrder: 1 }),
      doc("vehicle_back_picture", "Vehicle back picture", "گاڑی کی پیچھے کی تصویر", { regionSlug: "islamabad", displayOrder: 2 }),
      doc("owner_cnic_front", "Owner CNIC front picture", "مالک کا شناختی کارڈ سامنے", { regionSlug: "islamabad", displayOrder: 3 }),
      doc("owner_cnic_back", "Owner CNIC back picture", "مالک کا شناختی کارڈ پیچھے", { regionSlug: "islamabad", displayOrder: 4 }),
    ],
  },
  "route-permit": {
    documents: [
      doc("cnic_front", "CNIC front picture", "شناختی کارڈ سامنے کی تصویر", { regionSlug: "islamabad", displayOrder: 1 }),
      doc("cnic_back", "CNIC back picture", "شناختی کارڈ پیچھے کی تصویر", { regionSlug: "islamabad", displayOrder: 2 }),
      doc("fitness_certificate", "Fitness certificate", "فٹنس سرٹیفکیٹ", { regionSlug: "islamabad", displayOrder: 3 }),
    ],
  },
  "route-permit-new": {
    documents: [
      doc("cnic_front", "CNIC front picture", "شناختی کارڈ سامنے کی تصویر", { regionSlug: "punjab", displayOrder: 1 }),
      doc("cnic_back", "CNIC back picture", "شناختی کارڈ پیچھے کی تصویر", { regionSlug: "punjab", displayOrder: 2 }),
      doc("fitness_certificate", "Fitness certificate", "فٹنس سرٹیفکیٹ", { regionSlug: "punjab", displayOrder: 3 }),
    ],
  },
  "route-permit-noc": {
    documents: [
      doc("cnic_front", "CNIC front picture", "شناختی کارڈ سامنے کی تصویر", { regionSlug: "punjab", displayOrder: 1 }),
      doc("cnic_back", "CNIC back picture", "شناختی کارڈ پیچھے کی تصویر", { regionSlug: "punjab", displayOrder: 2 }),
      doc("fitness_certificate", "Fitness certificate", "فٹنس سرٹیفکیٹ", { regionSlug: "punjab", displayOrder: 3 }),
    ],
  },
  "route-permit-duplicate": {
    documents: [
      doc("cnic_front", "CNIC front picture", "شناختی کارڈ سامنے کی تصویر", { regionSlug: "punjab", displayOrder: 1 }),
      doc("cnic_back", "CNIC back picture", "شناختی کارڈ پیچھے کی تصویر", { regionSlug: "punjab", displayOrder: 2 }),
      doc("fitness_certificate", "Fitness certificate", "فٹنس سرٹیفکیٹ", { regionSlug: "punjab", displayOrder: 3 }),
    ],
  },
  "vehicle-data-correction": {
    regionNotes: [
      {
        regionSlug: "punjab",
        supportNotesEn:
          "Customer support should contact the user for guidance and required proof/documents.",
        supportNotesUr:
          "کسٹمر سپورٹ رہنمائی اور مطلوبہ ثبوت/دستاویزات کے لیے صارف سے رابطہ کرے گی۔",
      },
      {
        regionSlug: "islamabad",
        supportNotesEn:
          "Customer support should contact the user for guidance and required proof/documents.",
        supportNotesUr:
          "کسٹمر سپورٹ رہنمائی اور مطلوبہ ثبوت/دستاویزات کے لیے صارف سے رابطہ کرے گی۔",
      },
    ],
    fields: [
      field("correction_type", "Correction type", "تصحیح کی قسم", "MULTI_SELECT", {
        regionSlug: null,
        optionsJson: DATA_CORRECTION_OPTIONS,
        displayOrder: 1,
      }),
      field("correction_details", "Explain the correction needed", "مطلوبہ تصحیح کی وضاحت", "TEXTAREA", {
        regionSlug: null,
        isRequired: true,
        displayOrder: 2,
      }),
    ],
  },
  "driving-license-renewal": {
    fields: [
      field("applicant_name", "Applicant name", "درخواست دہندہ کا نام", "TEXT", { regionSlug: "punjab", displayOrder: 1 }),
      field("phone_number", "Phone number", "فون نمبر", "PHONE", { regionSlug: "punjab", displayOrder: 2 }),
    ],
    documents: [
      doc("applicant_cnic_front", "Applicant original CNIC front picture", "درخواست دہندہ کا اصل شناختی کارڈ سامنے", { regionSlug: "punjab", displayOrder: 1 }),
      doc("applicant_cnic_back", "Applicant original CNIC back picture", "درخواست دہندہ کا اصل شناختی کارڈ پیچھے", { regionSlug: "punjab", displayOrder: 2 }),
      doc("medical_certificate", "Medical certificate issued by authorized medical practitioner", "مجاز میڈیکل پریکٹیشنر کا میڈیکل سرٹیفکیٹ", { regionSlug: "punjab", displayOrder: 3 }),
      doc("medical_fitness_certificate", "Medical fitness certificate", "میڈیکل فٹنس سرٹیفکیٹ", {
        regionSlug: "punjab",
        isRequired: false,
        displayOrder: 4,
        instructionsEn: "Required only for applicants aged 50 years or above.",
        instructionsUr: "صرف 50 سال یا اس سے زیادہ عمر کے درخواست دہندگان کے لیے درکار۔",
      }),
    ],
  },
  "learner-license": {
    fields: [
      field("applicant_name", "Applicant name", "درخواست دہندہ کا نام", "TEXT", { regionSlug: null, displayOrder: 1 }),
      field("phone_number", "Phone number", "فون نمبر", "PHONE", { regionSlug: null, displayOrder: 2 }),
    ],
    documents: [
      doc("applicant_cnic_front", "Applicant original CNIC front picture", "درخواست دہندہ کا اصل شناختی کارڈ سامنے", { regionSlug: null, displayOrder: 1 }),
      doc("applicant_cnic_back", "Applicant original CNIC back picture", "درخواست دہندہ کا اصل شناختی کارڈ پیچھے", { regionSlug: null, displayOrder: 2 }),
      doc("passport_size_photo", "Recent passport-size photo", "حالیہ پاسپورٹ سائز تصویر", { regionSlug: null, displayOrder: 3 }),
      doc("medical_certificate", "Medical certificate", "میڈیکل سرٹیفکیٹ", {
        regionSlug: null,
        isRequired: false,
        displayOrder: 4,
        instructionsEn: "Required only if age is above 50 years.",
        instructionsUr: "صرف 50 سال سے زیادہ عمر کے لیے درکار۔",
      }),
    ],
  },
  "e-challan": {
    documents: [
      doc("applicant_cnic_front", "Applicant original CNIC front picture", "درخواست دہندہ کا اصل شناختی کارڈ سامنے", { regionSlug: null, displayOrder: 1 }),
      doc("applicant_cnic_back", "Applicant original CNIC back picture", "درخواست دہندہ کا اصل شناختی کارڈ پیچھے", { regionSlug: null, displayOrder: 2 }),
    ],
    fields: [
      field("vehicle_number", "Vehicle number", "گاڑی نمبر", "TEXT", {
        regionSlug: null,
        placeholderEn: "Enter vehicle registration number",
        helpTextEn: "Enter the vehicle number related to the e-challan.",
        helpTextUr: "ای چالان سے متعلق گاڑی نمبر درج کریں۔",
        displayOrder: 1,
      }),
    ],
  },
};

function checklistKindToRequirementKind(
  itemType: ChecklistItemType,
): DocumentRequirementKind {
  switch (itemType) {
    case "BIOMETRIC":
      return "BIOMETRIC";
    case "INSPECTION":
      return "INSPECTION";
    case "DELIVERY_INSTRUCTION":
      return "DELIVERY";
    case "NOTE":
      return "NOTE";
    default:
      return "FILE";
  }
}

export async function seedServiceConfig(
  prisma: PrismaClient,
  regionMap: Record<string, string>,
  serviceMap: Record<string, string>,
): Promise<void> {
  const checklistMap: Record<string, string> = {};

  for (const item of CHECKLIST_ITEM_SEED) {
    const created = await prisma.checklistItem.upsert({
      where: { slug: item.slug },
      update: {
        nameEn: item.nameEn,
        nameUr: item.nameUr,
        descriptionEn: item.descriptionEn ?? null,
        descriptionUr: item.descriptionUr ?? null,
        itemType: item.itemType ?? "DOCUMENT",
        isActive: true,
        displayOrder: item.displayOrder ?? 0,
      },
      create: {
        slug: item.slug,
        nameEn: item.nameEn,
        nameUr: item.nameUr,
        descriptionEn: item.descriptionEn ?? null,
        descriptionUr: item.descriptionUr ?? null,
        itemType: item.itemType ?? "DOCUMENT",
        defaultAcceptedMimeTypes: DEFAULT_MIME_TYPES,
        isActive: true,
        displayOrder: item.displayOrder ?? 0,
      },
    });
    checklistMap[item.slug] = created.id;
  }

  for (const [serviceSlug, config] of Object.entries(SERVICE_CONFIG_SEED)) {
    const serviceId = serviceMap[serviceSlug];
    if (!serviceId) continue;

    if (config.processingNotesEn || config.processingNotesUr) {
      await prisma.service.update({
        where: { id: serviceId },
        data: {
          processingNotesEn: config.processingNotesEn ?? null,
          processingNotesUr: config.processingNotesUr ?? null,
        },
      });
    }

    if (config.regionNotes) {
      for (const note of config.regionNotes) {
        const regionId = regionMap[note.regionSlug];
        if (!regionId) continue;

        await prisma.serviceRegion.updateMany({
          where: { serviceId, regionId },
          data: {
            supportNotesEn: note.supportNotesEn,
            supportNotesUr: note.supportNotesUr,
          },
        });
      }
    }

    await prisma.documentRequirement.updateMany({
      where: { serviceId },
      data: { isActive: false },
    });

    await prisma.serviceFormField.updateMany({
      where: { serviceId },
      data: { isActive: false },
    });

    for (const seedDoc of config.documents ?? []) {
      const regionId = seedDoc.regionSlug
        ? regionMap[seedDoc.regionSlug]
        : null;
      const checklistItemId = seedDoc.checklistSlug
        ? checklistMap[seedDoc.checklistSlug]
        : null;

      const existing = await prisma.documentRequirement.findFirst({
        where: {
          serviceId,
          docType: seedDoc.docType,
          regionId,
        },
      });

      const data = {
        serviceId,
        regionId,
        checklistItemId,
        docType: seedDoc.docType,
        kind: seedDoc.kind ?? "FILE",
        labelEn: seedDoc.labelEn,
        labelUr: seedDoc.labelUr,
        instructionsEn: seedDoc.instructionsEn ?? null,
        instructionsUr: seedDoc.instructionsUr ?? null,
        isRequired: seedDoc.isRequired ?? true,
        maxSizeBytes: 5242880,
        acceptedMimeTypes: DEFAULT_MIME_TYPES,
        displayOrder: seedDoc.displayOrder ?? 0,
        isActive: true,
      };

      if (existing) {
        await prisma.documentRequirement.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await prisma.documentRequirement.create({ data });
      }
    }

    for (const seedField of config.fields ?? []) {
      const regionId = seedField.regionSlug
        ? regionMap[seedField.regionSlug]
        : null;
      const fieldKey = regionId
        ? `${seedField.fieldKey}_${seedField.regionSlug}`
        : seedField.fieldKey;

      const existing = await prisma.serviceFormField.findFirst({
        where: { serviceId, fieldKey },
      });

      const data = {
        serviceId,
        regionId,
        fieldKey,
        labelEn: seedField.labelEn,
        labelUr: seedField.labelUr,
        placeholderEn: seedField.placeholderEn ?? null,
        placeholderUr: seedField.placeholderUr ?? null,
        helpTextEn: seedField.helpTextEn ?? null,
        helpTextUr: seedField.helpTextUr ?? null,
        fieldType: seedField.fieldType,
        isRequired: seedField.isRequired ?? true,
        optionsJson: (seedField.optionsJson ?? undefined) as Prisma.InputJsonValue | undefined,
        validationJson: (seedField.validationJson ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
        displayOrder: seedField.displayOrder ?? 0,
        isActive: true,
      };

      if (existing) {
        await prisma.serviceFormField.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await prisma.serviceFormField.create({ data });
      }
    }
  }
}

export { checklistKindToRequirementKind };
