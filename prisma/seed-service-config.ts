import type {
  ChecklistItemType,
  DocumentRequirementKind,
  FieldType,
  Prisma,
  PrismaClient} from "@prisma/client";

const DEFAULT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"];

type SeedChecklistItem = {
  slug: string;
  nameEn: string;
  descriptionEn?: string;
  itemType?: ChecklistItemType;
  displayOrder?: number;
};

type SeedDoc = {
  docType: string;
  checklistSlug?: string;
  regionSlug?: string | null;
  kind?: DocumentRequirementKind;
  labelEn: string;
  instructionsEn?: string;
  isRequired?: boolean;
  displayOrder?: number;
};

type SeedField = {
  fieldKey: string;
  regionSlug?: string | null;
  labelEn: string;
  fieldType: FieldType;
  placeholderEn?: string;
  helpTextEn?: string;
  isRequired?: boolean;
  optionsJson?: Array<{ value: string; labelEn: string}>;
  validationJson?: Record<string, unknown>;
  conditionalJson?: Record<string, unknown>;
  displayOrder?: number;
};

type SeedRegionNote = {
  regionSlug: string;
  supportNotesEn: string;
};

type ServiceConfig = {
  processingNotesEn?: string;
  regionNotes?: SeedRegionNote[];
  documents?: SeedDoc[];
  fields?: SeedField[];
};

export const CHECKLIST_ITEM_SEED: SeedChecklistItem[] = [
  { slug: "phone-number", nameEn: "Phone number", itemType: "TEXT_FIELD", displayOrder: 1 },
  { slug: "applicant-name", nameEn: "Applicant name", itemType: "TEXT_FIELD", displayOrder: 2 },
  { slug: "vehicle-registration-number", nameEn: "Vehicle registration number", itemType: "TEXT_FIELD", displayOrder: 3 },
  { slug: "vehicle-number", nameEn: "Vehicle number", itemType: "TEXT_FIELD", displayOrder: 4 },
  { slug: "cnic-front-picture", nameEn: "CNIC front picture", itemType: "DOCUMENT", displayOrder: 10 },
  { slug: "cnic-back-picture", nameEn: "CNIC back picture", itemType: "DOCUMENT", displayOrder: 11 },
  { slug: "applicant-cnic-front", nameEn: "Applicant original CNIC front picture", itemType: "DOCUMENT", displayOrder: 12 },
  { slug: "applicant-cnic-back", nameEn: "Applicant original CNIC back picture", itemType: "DOCUMENT", displayOrder: 13 },
  { slug: "purchaser-cnic-front", nameEn: "Purchaser CNIC front picture", itemType: "DOCUMENT", displayOrder: 14 },
  { slug: "purchaser-cnic-back", nameEn: "Purchaser CNIC back picture", itemType: "DOCUMENT", displayOrder: 15 },
  { slug: "owner-cnic-front", nameEn: "Owner CNIC front picture", itemType: "DOCUMENT", displayOrder: 16 },
  { slug: "owner-cnic-back", nameEn: "Owner CNIC back picture", itemType: "DOCUMENT", displayOrder: 17 },
  { slug: "vehicle-front-picture", nameEn: "Vehicle front picture", itemType: "DOCUMENT", displayOrder: 20 },
  { slug: "vehicle-back-picture", nameEn: "Vehicle back picture", itemType: "DOCUMENT", displayOrder: 21 },
  { slug: "chassis-number-picture", nameEn: "Chassis number picture", itemType: "DOCUMENT", displayOrder: 22 },
  { slug: "sales-invoice", nameEn: "Sales invoice", itemType: "DOCUMENT", displayOrder: 23 },
  { slug: "fitness-certificate", nameEn: "Fitness certificate", itemType: "DOCUMENT", displayOrder: 24 },
  { slug: "medical-certificate", nameEn: "Medical certificate", itemType: "DOCUMENT", displayOrder: 25 },
  { slug: "medical-fitness-certificate", nameEn: "Medical fitness certificate", itemType: "DOCUMENT", displayOrder: 26 },
  { slug: "passport-size-photo", nameEn: "Recent passport-size photo", itemType: "DOCUMENT", displayOrder: 27 },
  { slug: "smart-card-or-registration-book", nameEn: "Smart Card or Registration Book", itemType: "DOCUMENT", displayOrder: 28 },
  { slug: "original-smart-card", nameEn: "Original vehicle smart card", itemType: "DOCUMENT", displayOrder: 29 },
  { slug: "original-number-plates", nameEn: "Original number plates", itemType: "DOCUMENT", displayOrder: 30 },
  { slug: "seller-biometric", nameEn: "Seller biometric", itemType: "BIOMETRIC", displayOrder: 31 },
  { slug: "purchaser-biometric", nameEn: "Purchaser biometric", itemType: "BIOMETRIC", displayOrder: 32 },
  { slug: "private-vehicle-inspection", nameEn: "Private vehicle inspection", itemType: "INSPECTION", displayOrder: 33 },
  { slug: "vehicle-inspection", nameEn: "Vehicle inspection", itemType: "INSPECTION", displayOrder: 34 }];

const DATA_CORRECTION_OPTIONS = [
  { value: "name-spelling", labelEn: "Name spelling correction"},
  { value: "father-name-spelling", labelEn: "Father name spelling correction"},
  { value: "incorrect-cnic", labelEn: "Incorrect CNIC digits"},
  { value: "wrong-address", labelEn: "Wrong address"},
  { value: "engine-mismatch", labelEn: "Engine number mismatch"},
  { value: "chassis-mismatch", labelEn: "Chassis number mismatch"},
  { value: "color-correction", labelEn: "Vehicle color correction"},
  { value: "cc-correction", labelEn: "Engine capacity / CC correction"},
  { value: "other", labelEn: "Other record correction details"}];

function doc(
  docType: string,
  labelEn: string,
  options: Partial<SeedDoc> = {}): SeedDoc {
  return {
    docType,
    labelEn,
    kind: "FILE",
    isRequired: true,
    ...options};
}

function field(
  fieldKey: string,
  labelEn: string,
  fieldType: FieldType,
  options: Partial<SeedField> = {}): SeedField {
  return {
    fieldKey,
    labelEn,
    fieldType,
    isRequired: true,
    ...options};
}

type VehicleRegistrationRegion =
  | "punjab"
  | "islamabad"
  | "sindh"
  | "balochistan"
  | "kpk"
  | "ajk"
  | "gilgit-baltistan";

const VEHICLE_REGISTRATION_FIELD_CONFIG: Record<
  VehicleRegistrationRegion,
  Pick<
    SeedField,
    | "placeholderEn"
    | "helpTextEn"
    | "validationJson"
  >
> = {
  punjab: {
    placeholderEn: "e.g. ABC 123 or ABC-07-1111",
    helpTextEn: "Accepted formats: ABC 123, ABC 0123, ABC 1111, ABC-07-1111",
    validationJson: {
      normalize: "uppercase",
      patterns: ["^[A-Z]{3}\\s\\d{3,4}$", "^[A-Z]{3}-\\d{2}-\\d{4}$"],
      patternMessageEn:
        "Enter a valid Punjab registration number (e.g. ABC 123 or ABC-07-1111)"}},
  islamabad: {
    placeholderEn: "e.g. ABC-123",
    helpTextEn: "Accepted format: ABC-123",
    validationJson: {
      normalize: "uppercase",
      patterns: ["^[A-Z]{3}-\\d{3}$"],
      patternMessageEn: "Enter a valid Islamabad ICT registration number (e.g. ABC-123)"}},
  sindh: {
    placeholderEn: "e.g. ABC-123",
    helpTextEn: "Accepted format: ABC-123",
    validationJson: {
      normalize: "uppercase",
      patterns: ["^[A-Z]{3}-\\d{3}$"],
      patternMessageEn: "Enter a valid Sindh registration number (e.g. ABC-123)"}},
  balochistan: {
    placeholderEn: "e.g. ABC-123",
    helpTextEn: "Accepted format: ABC-123",
    validationJson: {
      normalize: "uppercase",
      patterns: ["^[A-Z]{3}-\\d{3}$"],
      patternMessageEn: "Enter a valid Balochistan registration number (e.g. ABC-123)"}},
  kpk: {
    placeholderEn: "e.g. ABC-1234",
    helpTextEn: "Accepted formats: ABC-1234, ABC-123",
    validationJson: {
      normalize: "uppercase",
      patterns: ["^[A-Z]{3}-\\d{4}$", "^[A-Z]{3}-\\d{3}$"],
      patternMessageEn:
        "Enter a valid Khyber Pakhtunkhwa registration number (e.g. ABC-1234 or ABC-123)"}},
  ajk: {
    placeholderEn: "e.g. AA-BB-1234 or AB-123",
    helpTextEn: "Accepted formats: AA-BB-1234, AB-123",
    validationJson: {
      normalize: "uppercase",
      patterns: ["^[A-Z]{2}-[A-Z]{2}-\\d{4}$", "^[A-Z]{2}-\\d{3}$"],
      patternMessageEn:
        "Enter a valid AJK registration number (e.g. AA-BB-1234 or AB-123)"}},
  "gilgit-baltistan": {
    placeholderEn: "e.g. ABC-123",
    helpTextEn: "Accepted format: ABC-123",
    validationJson: {
      normalize: "uppercase",
      patterns: ["^[A-Z]{3}-\\d{3}$"],
      patternMessageEn:
        "Enter a valid Gilgit-Baltistan registration number (e.g. ABC-123)"}}};

function vehicleRegistrationNumberField(
  regionSlug: VehicleRegistrationRegion,
  overrides: Partial<SeedField> = {}): SeedField {
  const config = VEHICLE_REGISTRATION_FIELD_CONFIG[regionSlug];

  return field(
    "vehicle_registration_number",
    "Vehicle registration number",
    "TEXT",
    {
      regionSlug,
      displayOrder: 1,
      ...config,
      ...overrides});
}

export const SERVICE_CONFIG_SEED: Record<string, ServiceConfig> = {
  "vehicle-transfer": {
    regionNotes: [
      {
        regionSlug: "punjab",
        supportNotesEn:
          "Customer support will guide the biometric process through WhatsApp."},
      {
        regionSlug: "islamabad",
        supportNotesEn:
          "Documents should be delivered to TCS Express Center, I-8 Markaz against PakExcise 03450664441, or contact support on WhatsApp for delivery help."}],
    documents: [
      doc("vehicle_front_picture", "Vehicle front picture", { regionSlug: "punjab", displayOrder: 1 }),
      doc("vehicle_back_picture", "Vehicle back picture", { regionSlug: "punjab", displayOrder: 2 }),
      doc("chassis_number_picture", "Chassis number picture", { regionSlug: "punjab", displayOrder: 3 }),
      doc("purchaser_cnic_front", "Purchaser CNIC front picture", { regionSlug: "punjab", displayOrder: 4, checklistSlug: "purchaser-cnic-front" }),
      doc("purchaser_cnic_back", "Purchaser CNIC back picture", { regionSlug: "punjab", displayOrder: 5, checklistSlug: "purchaser-cnic-back" }),
      doc("seller_biometric", "Seller biometric", { regionSlug: "punjab", kind: "BIOMETRIC", displayOrder: 6, instructionsEn: "Support will guide seller biometric through WhatsApp."}),
      doc("purchaser_biometric", "Purchaser biometric", { regionSlug: "punjab", kind: "BIOMETRIC", displayOrder: 7, instructionsEn: "Support will guide purchaser biometric through WhatsApp."}),
      doc("purchaser_cnic_front", "Purchaser CNIC front picture", { regionSlug: "islamabad", displayOrder: 1, checklistSlug: "purchaser-cnic-front" }),
      doc("purchaser_cnic_back", "Purchaser CNIC back picture", { regionSlug: "islamabad", displayOrder: 2, checklistSlug: "purchaser-cnic-back" }),
      doc("original_smart_card", "Original vehicle smart card", { regionSlug: "islamabad", displayOrder: 3, checklistSlug: "original-smart-card" }),
      doc("original_number_plates", "Original number plates", { regionSlug: "islamabad", displayOrder: 4, checklistSlug: "original-number-plates" }),
      doc("private_vehicle_inspection", "Private vehicle inspection", { regionSlug: "islamabad", kind: "INSPECTION", displayOrder: 5, instructionsEn: "Private vehicle inspection is required as per ICT process."}),
      doc("fitness_certificate", "Fitness certificate", { regionSlug: "islamabad", displayOrder: 6, isRequired: false, instructionsEn: "Required only for commercial vehicles."})]},
  "token-tax-payment": {
    fields: [
      vehicleRegistrationNumberField("punjab"),
      vehicleRegistrationNumberField("islamabad"),
      vehicleRegistrationNumberField("sindh"),
      vehicleRegistrationNumberField("balochistan"),
      vehicleRegistrationNumberField("kpk")]},
  "new-vehicle-registration": {
    regionNotes: [
      {
        regionSlug: "punjab",
        supportNotesEn: "Customer support will contact the user for biometric guidance."},
      {
        regionSlug: "islamabad",
        supportNotesEn:
          "Customer support will contact the user for biometric and next-step guidance."}],
    documents: [
      doc("sales_invoice", "Sales invoice", { regionSlug: "punjab", displayOrder: 1 }),
      doc("purchaser_cnic_front", "Purchaser CNIC front picture", { regionSlug: "punjab", displayOrder: 2 }),
      doc("purchaser_cnic_back", "Purchaser CNIC back picture", { regionSlug: "punjab", displayOrder: 3 }),
      doc("purchaser_biometric", "Purchaser biometric", { regionSlug: "punjab", kind: "BIOMETRIC", displayOrder: 4 }),
      doc("sales_invoice", "Sales invoice", { regionSlug: "islamabad", displayOrder: 1 }),
      doc("purchaser_cnic_front", "Purchaser CNIC front picture", { regionSlug: "islamabad", displayOrder: 2 }),
      doc("purchaser_cnic_back", "Purchaser CNIC back picture", { regionSlug: "islamabad", displayOrder: 3 }),
      doc("purchaser_biometric", "Purchaser biometric", { regionSlug: "islamabad", kind: "BIOMETRIC", displayOrder: 4 }),
      doc("vehicle_inspection", "Vehicle inspection", { regionSlug: "islamabad", kind: "INSPECTION", displayOrder: 5 })]},
  "vehicle-passing-fitness": {
    documents: [
      doc("vehicle_front_picture", "Vehicle front picture", { regionSlug: "islamabad", displayOrder: 1 }),
      doc("vehicle_back_picture", "Vehicle back picture", { regionSlug: "islamabad", displayOrder: 2 }),
      doc("owner_cnic_front", "Owner CNIC front picture", { regionSlug: "islamabad", displayOrder: 3 }),
      doc("owner_cnic_back", "Owner CNIC back picture", { regionSlug: "islamabad", displayOrder: 4 })]},
  "route-permit": {
    documents: [
      doc("cnic_front", "CNIC front picture", { regionSlug: "islamabad", displayOrder: 1 }),
      doc("cnic_back", "CNIC back picture", { regionSlug: "islamabad", displayOrder: 2 }),
      doc("fitness_certificate", "Fitness certificate", { regionSlug: "islamabad", displayOrder: 3 })]},
  "route-permit-new": {
    documents: [
      doc("cnic_front", "CNIC front picture", { regionSlug: "punjab", displayOrder: 1 }),
      doc("cnic_back", "CNIC back picture", { regionSlug: "punjab", displayOrder: 2 }),
      doc("fitness_certificate", "Fitness certificate", { regionSlug: "punjab", displayOrder: 3 })]},
  "route-permit-noc": {
    documents: [
      doc("cnic_front", "CNIC front picture", { regionSlug: "punjab", displayOrder: 1 }),
      doc("cnic_back", "CNIC back picture", { regionSlug: "punjab", displayOrder: 2 }),
      doc("fitness_certificate", "Fitness certificate", { regionSlug: "punjab", displayOrder: 3 })]},
  "route-permit-duplicate": {
    documents: [
      doc("cnic_front", "CNIC front picture", { regionSlug: "punjab", displayOrder: 1 }),
      doc("cnic_back", "CNIC back picture", { regionSlug: "punjab", displayOrder: 2 }),
      doc("fitness_certificate", "Fitness certificate", { regionSlug: "punjab", displayOrder: 3 })]},
  "vehicle-data-correction": {
    regionNotes: [
      {
        regionSlug: "punjab",
        supportNotesEn:
          "Customer support should contact the user for guidance and required proof/documents."},
      {
        regionSlug: "islamabad",
        supportNotesEn:
          "Customer support should contact the user for guidance and required proof/documents."}],
    fields: [
      field("correction_type", "Correction type", "MULTI_SELECT", {
        regionSlug: null,
        optionsJson: DATA_CORRECTION_OPTIONS,
        displayOrder: 1}),
      field("correction_details", "Explain the correction needed", "TEXTAREA", {
        regionSlug: null,
        isRequired: true,
        displayOrder: 2,
        conditionalJson: {
          showWhen: {
            fieldKey: "correction_type",
            operator: "includes",
            value: "other"}}})]},
  "driving-license-renewal": {
    fields: [
      field("applicant_name", "Applicant name", "TEXT", {
        regionSlug: "punjab",
        placeholderEn: "Enter applicant full name",
        displayOrder: 1}),
      field("phone_number", "Phone number", "PHONE", {
        regionSlug: "punjab",
        placeholderEn: "03XX-XXXXXXX",
        helpTextEn: "Pakistani mobile number (e.g. 0300-1234567)",
        displayOrder: 2}),
      field("applicant_name", "Applicant name", "TEXT", {
        regionSlug: "islamabad",
        placeholderEn: "Enter applicant full name",
        displayOrder: 1}),
      field("phone_number", "Phone number", "PHONE", {
        regionSlug: "islamabad",
        placeholderEn: "03XX-XXXXXXX",
        helpTextEn: "Pakistani mobile number (e.g. 0300-1234567)",
        displayOrder: 2})],
    documents: [
      doc("applicant_cnic_front", "Applicant original CNIC front picture", {
        regionSlug: "punjab",
        displayOrder: 1,
        checklistSlug: "applicant-cnic-front"}),
      doc("applicant_cnic_back", "Applicant original CNIC back picture", {
        regionSlug: "punjab",
        displayOrder: 2,
        checklistSlug: "applicant-cnic-back"}),
      doc("passport_size_photo", "Recent passport-size photo", {
        regionSlug: "punjab",
        displayOrder: 3,
        checklistSlug: "passport-size-photo"}),
      doc("medical_certificate", "Medical certificate issued by authorized medical practitioner", {
        regionSlug: "punjab",
        displayOrder: 4,
        checklistSlug: "medical-certificate"}),
      doc("medical_fitness_certificate", "Medical fitness certificate", {
        regionSlug: "punjab",
        isRequired: false,
        displayOrder: 5,
        checklistSlug: "medical-fitness-certificate",
        instructionsEn: "Required only for applicants aged 50 years or above."})]},
  "learner-license": {
    fields: [
      field("applicant_name", "Applicant name", "TEXT", {
        regionSlug: null,
        placeholderEn: "Enter applicant full name",
        displayOrder: 1}),
      field("phone_number", "Phone number", "PHONE", {
        regionSlug: null,
        placeholderEn: "03XX-XXXXXXX",
        helpTextEn: "Pakistani mobile number (e.g. 0300-1234567)",
        displayOrder: 2})],
    documents: [
      doc("applicant_cnic_front", "Applicant original CNIC front picture", { regionSlug: null, displayOrder: 1 }),
      doc("applicant_cnic_back", "Applicant original CNIC back picture", { regionSlug: null, displayOrder: 2 }),
      doc("passport_size_photo", "Recent passport-size photo", { regionSlug: null, displayOrder: 3 }),
      doc("medical_certificate", "Medical certificate", {
        regionSlug: null,
        isRequired: false,
        displayOrder: 4,
        instructionsEn: "Required only if age is above 50 years."})]},
  "e-challan": {
    documents: [
      doc("smart_card_or_registration_book", "Smart Card or Registration Book", {
        regionSlug: null,
        displayOrder: 1,
        checklistSlug: "smart-card-or-registration-book",
        instructionsEn:
          "Upload a clear picture or scan of the vehicle smart card or registration book."})]}};

function checklistKindToRequirementKind(
  itemType: ChecklistItemType): DocumentRequirementKind {
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
  options?: { serviceSlugs?: string[] }): Promise<void> {
  const checklistMap: Record<string, string> = {};

  for (const item of CHECKLIST_ITEM_SEED) {
    const created = await prisma.checklistItem.upsert({
      where: { slug: item.slug },
      update: {
        nameEn: item.nameEn,
        descriptionEn: item.descriptionEn ?? null,
        itemType: item.itemType ?? "DOCUMENT",
        isActive: true,
        displayOrder: item.displayOrder ?? 0},
      create: {
        slug: item.slug,
        nameEn: item.nameEn,
        descriptionEn: item.descriptionEn ?? null,
        itemType: item.itemType ?? "DOCUMENT",
        defaultAcceptedMimeTypes: DEFAULT_MIME_TYPES,
        isActive: true,
        displayOrder: item.displayOrder ?? 0}});
    checklistMap[item.slug] = created.id;
  }

  const serviceEntries = Object.entries(SERVICE_CONFIG_SEED).filter(
    ([serviceSlug]) =>
      !options?.serviceSlugs || options.serviceSlugs.includes(serviceSlug));

  for (const [serviceSlug, config] of serviceEntries) {
    const serviceId = serviceMap[serviceSlug];
    if (!serviceId) continue;

    if (config.processingNotesEn) {
      await prisma.service.update({
        where: { id: serviceId },
        data: {
          processingNotesEn: config.processingNotesEn ?? null}});
    }

    if (config.regionNotes) {
      for (const note of config.regionNotes) {
        const regionId = regionMap[note.regionSlug];
        if (!regionId) continue;

        await prisma.serviceRegion.updateMany({
          where: { serviceId, regionId },
          data: {
            supportNotesEn: note.supportNotesEn}});
      }
    }

    await prisma.documentRequirement.updateMany({
      where: { serviceId },
      data: { isActive: false }});

    await prisma.serviceFormField.updateMany({
      where: { serviceId },
      data: { isActive: false }});

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
          regionId}});

      const data = {
        serviceId,
        regionId,
        checklistItemId,
        docType: seedDoc.docType,
        kind: seedDoc.kind ?? "FILE",
        labelEn: seedDoc.labelEn,
        instructionsEn: seedDoc.instructionsEn ?? null,
        isRequired: seedDoc.isRequired ?? true,
        maxSizeBytes: 5242880,
        acceptedMimeTypes: DEFAULT_MIME_TYPES,
        displayOrder: seedDoc.displayOrder ?? 0,
        isActive: true};

      if (existing) {
        await prisma.documentRequirement.update({
          where: { id: existing.id },
          data});
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
        where: { serviceId, fieldKey }});

      const data = {
        serviceId,
        regionId,
        fieldKey,
        labelEn: seedField.labelEn,
        placeholderEn: seedField.placeholderEn ?? null,
        helpTextEn: seedField.helpTextEn ?? null,
        fieldType: seedField.fieldType,
        isRequired: seedField.isRequired ?? true,
        optionsJson: (seedField.optionsJson ?? undefined) as Prisma.InputJsonValue | undefined,
        validationJson: (seedField.validationJson ?? undefined) as
          | Prisma.InputJsonValue | undefined,
        conditionalJson: (seedField.conditionalJson ?? undefined) as
          | Prisma.InputJsonValue | undefined,
        displayOrder: seedField.displayOrder ?? 0,
        isActive: true};

      if (existing) {
        await prisma.serviceFormField.update({
          where: { id: existing.id },
          data});
      } else {
        await prisma.serviceFormField.create({ data });
      }
    }
  }
}

export { checklistKindToRequirementKind };
