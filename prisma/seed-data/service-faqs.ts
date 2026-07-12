export type ServiceFaqSeed = {
  serviceSlug: string;
  categorySlug: "services";
  displayOrder: number;
  questionEn: string;
  answerEn: string;
  regionSlug?: string;
  seoKeywordsEn?: string;
};

export const SERVICE_FAQ_SEEDS: ServiceFaqSeed[] = [
  // ── Vehicle Transfer (8) ──────────────────────────────────────────────────
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is vehicle transfer service in PakExcise?",
    answerEn:
      "PakExcise provides private facilitation support for vehicle ownership transfer in supported regions such as Punjab and Islamabad ICT. Our team guides users about required documents, biometric steps, vehicle record details, and application progress.",
    seoKeywordsEn:
      "vehicle transfer, ownership transfer, Punjab, Islamabad ICT, excise facilitation"},
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Is PakExcise a government vehicle transfer portal?",
    answerEn:
      "No. PakExcise.com is a private facilitation platform and is not affiliated with any Excise & Taxation department, MTMIS, ICT Excise, NADRA, or any government body.",
    seoKeywordsEn:
      "private facilitation, not government, vehicle transfer portal"},
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "In which regions is vehicle transfer available?",
    answerEn:
      "Vehicle transfer support is currently available for Punjab and Islamabad ICT, based on service availability configured by PakExcise Super Admin.",
    seoKeywordsEn: "vehicle transfer regions, Punjab, Islamabad ICT, availability"},
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What documents are required for vehicle transfer in Punjab?",
    answerEn:
      "For Punjab vehicle transfer, you may need vehicle front picture, vehicle back picture, chassis number picture, purchaser CNIC front picture, purchaser CNIC back picture, seller biometric, and purchaser biometric.",
    regionSlug: "punjab",
    seoKeywordsEn:
      "Punjab vehicle transfer documents, CNIC, biometric, chassis"},
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "What documents are required for vehicle transfer in Islamabad ICT?",
    answerEn:
      "For Islamabad ICT vehicle transfer, you may need purchaser CNIC front picture, purchaser CNIC back picture, original vehicle smart card, original number plates, private vehicle inspection, and fitness certificate if the vehicle is commercial.",
    regionSlug: "islamabad",
    seoKeywordsEn:
      "Islamabad vehicle transfer documents, smart card, number plates, fitness"},
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Is biometric required for vehicle transfer?",
    answerEn:
      "Yes, biometric verification may be required for vehicle transfer depending on the province and vehicle record process. PakExcise support guides users through WhatsApp where biometric assistance is needed.",
    seoKeywordsEn: "vehicle transfer biometric, verification, WhatsApp support"},
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I apply for vehicle transfer without creating an account?",
    answerEn:
      "Yes. You can use Quick WhatsApp Service or Submit Request without creating an account. For full application tracking, document history, invoices, and status updates, apply with an account.",
    seoKeywordsEn:
      "vehicle transfer without account, WhatsApp, submit request, apply with account"},
  {
    serviceSlug: "vehicle-transfer",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "Can I track my vehicle transfer application?",
    answerEn:
      "Yes, if you apply with an account, you can track your application status, documents, invoices, payment proof, and updates from your dashboard.",
    seoKeywordsEn: "track vehicle transfer, application status, dashboard"},

  // ── Token Tax Payment (9) ─────────────────────────────────────────────────
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is token tax payment support?",
    answerEn:
      "PakExcise provides private facilitation support for token tax-related requests. Users can submit their vehicle registration number and get guidance for token tax status, payment process, required details, and next steps.",
    seoKeywordsEn: "token tax payment, vehicle registration, excise facilitation"},
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Which provinces are supported for token tax payment?",
    answerEn:
      "Token tax support is available for Punjab, Islamabad ICT, Sindh, Balochistan, and Khyber Pakhtunkhwa based on current service availability.",
    seoKeywordsEn:
      "token tax provinces, Punjab, Sindh, KPK, Balochistan, Islamabad"},
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "What information is required for token tax payment?",
    answerEn:
      "Usually, you need to provide your vehicle registration number in the correct province format. Additional details may be requested depending on the vehicle record and province.",
    seoKeywordsEn: "token tax information, vehicle number, registration format"},
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What is the Punjab vehicle number format for token tax?",
    answerEn:
      "Punjab vehicle registration numbers may use formats such as ABC 123, ABC 0123, ABC 1111, or ABC-07-1111.",
    regionSlug: "punjab",
    seoKeywordsEn: "Punjab vehicle number format, token tax, ABC 123"},
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "What is the Islamabad ICT vehicle number format?",
    answerEn: "Islamabad ICT vehicle numbers commonly use the format ABC-123.",
    regionSlug: "islamabad",
    seoKeywordsEn: "Islamabad vehicle number format, ABC-123, token tax"},
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "What is the Sindh vehicle number format?",
    answerEn: "Sindh vehicle numbers commonly use the format ABC-123.",
    regionSlug: "sindh",
    seoKeywordsEn: "Sindh vehicle number format, token tax, ABC-123"},
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "What is the Khyber Pakhtunkhwa vehicle number format?",
    answerEn:
      "Khyber Pakhtunkhwa vehicle numbers may use formats such as ABC-1234 or ABC-123.",
    regionSlug: "kpk",
    seoKeywordsEn: "KPK vehicle number format, token tax, ABC-1234"},
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "Why is the correct vehicle number format important?",
    answerEn:
      "Correct vehicle number format helps avoid delays, wrong record searches, incorrect token tax details, or failed verification.",
    seoKeywordsEn: "vehicle number format, token tax verification, avoid delays"},
  {
    serviceSlug: "token-tax-payment",
    categorySlug: "services",
    displayOrder: 9,
    questionEn: "Are token tax fees shown on the website?",
    answerEn:
      "No. PakExcise does not show fixed fees on public pages. If payment is required, details are shared after review through invoice, support message, or application update.",
    seoKeywordsEn: "token tax fees, no pricing, private facilitation"},

  // ── New Vehicle Registration (8) ────────────────────────────────────────
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is new vehicle registration support?",
    answerEn:
      "PakExcise provides private facilitation support for new vehicle registration in supported regions such as Punjab and Islamabad ICT. Our team guides users about required documents, biometric process, vehicle inspection if required, and application steps.",
    seoKeywordsEn:
      "new vehicle registration, Punjab, Islamabad, excise facilitation"},
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "In which regions is new vehicle registration available?",
    answerEn:
      "New vehicle registration support is currently available for Punjab and Islamabad ICT based on active service availability.",
    seoKeywordsEn: "new registration regions, Punjab, Islamabad ICT"},
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "What documents are required for new vehicle registration in Punjab?",
    answerEn:
      "For Punjab new vehicle registration, you may need sales invoice, purchaser CNIC front picture, purchaser CNIC back picture, and purchaser biometric.",
    regionSlug: "punjab",
    seoKeywordsEn: "Punjab new registration documents, sales invoice, CNIC, biometric"},
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What documents are required for new vehicle registration in Islamabad ICT?",
    answerEn:
      "For Islamabad ICT new vehicle registration, you may need sales invoice, purchaser CNIC front picture, purchaser CNIC back picture, purchaser biometric, and vehicle inspection.",
    regionSlug: "islamabad",
    seoKeywordsEn:
      "Islamabad new registration documents, vehicle inspection, CNIC"},
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Is biometric required for new vehicle registration?",
    answerEn:
      "Yes, purchaser biometric may be required for new vehicle registration. PakExcise support can guide you about the biometric process and next steps.",
    seoKeywordsEn: "new registration biometric, purchaser verification"},
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Is vehicle inspection required for new registration?",
    answerEn:
      "Vehicle inspection may be required in Islamabad ICT or in specific cases. Requirements can vary depending on the region, vehicle type, and official process.",
    seoKeywordsEn: "vehicle inspection, new registration, Islamabad ICT"},
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I submit a new vehicle registration request on WhatsApp?",
    answerEn:
      "Yes. You can contact PakExcise through WhatsApp for quick guidance. For full tracking, apply with an account.",
    seoKeywordsEn: "new registration WhatsApp, quick support, apply with account"},
  {
    serviceSlug: "new-vehicle-registration",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "Can I track my new registration application?",
    answerEn:
      "Yes. Account-based applications allow you to track status, uploaded documents, invoices, payment verification, and application history.",
    seoKeywordsEn: "track new registration, application status, dashboard"},

  // ── Vehicle Passing / Fitness (7) ───────────────────────────────────────
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is vehicle passing or fitness support?",
    answerEn:
      "PakExcise provides private facilitation support for vehicle passing and fitness-related requests in Islamabad ICT. This may include guidance about vehicle pictures, owner CNIC documents, and process requirements.",
    seoKeywordsEn: "vehicle passing, fitness certificate, Islamabad ICT"},
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Where is vehicle passing / fitness service available?",
    answerEn: "Vehicle passing / fitness support is currently available for Islamabad ICT.",
    regionSlug: "islamabad",
    seoKeywordsEn: "vehicle fitness availability, Islamabad ICT"},
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "What documents are required for vehicle passing / fitness?",
    answerEn:
      "For Islamabad ICT vehicle passing / fitness, you may need vehicle front picture, vehicle back picture, owner CNIC front picture, and owner CNIC back picture.",
    regionSlug: "islamabad",
    seoKeywordsEn: "fitness documents, vehicle pictures, owner CNIC, Islamabad"},
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "Is vehicle fitness required for all vehicles?",
    answerEn:
      "Fitness requirements depend on vehicle type, region, and applicable process. Commercial vehicles may have different requirements than private vehicles.",
    seoKeywordsEn: "vehicle fitness requirements, commercial, private vehicles"},
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Can PakExcise complete vehicle fitness directly?",
    answerEn:
      "PakExcise provides private facilitation support and guidance. Final verification, approval, or fitness status depends on relevant official processes and applicable requirements.",
    seoKeywordsEn: "vehicle fitness facilitation, private service, not government"},
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Can I use WhatsApp for vehicle fitness support?",
    answerEn:
      "Yes. You can contact PakExcise on WhatsApp for quick support and document guidance.",
    seoKeywordsEn: "vehicle fitness WhatsApp, quick support"},
  {
    serviceSlug: "vehicle-passing-fitness",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I apply with an account for vehicle passing / fitness?",
    answerEn:
      "Yes. Account-based applications provide full website tracking, status updates, document history, invoices, and support notes.",
    seoKeywordsEn: "apply with account, vehicle fitness tracking, dashboard"},

  // ── Route Permit (9) ──────────────────────────────────────────────────────
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is route permit support?",
    answerEn:
      "PakExcise provides private facilitation support for route permit-related services in supported regions such as Punjab and Islamabad ICT. This may include new route permit, route permit NOC, and duplicate route permit support.",
    seoKeywordsEn: "route permit, NOC, duplicate, Punjab, Islamabad"},
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Which route permit services are available?",
    answerEn:
      "PakExcise supports route permit sub-services such as New Route Permit, Route Permit NOC, and Route Permit Duplicate where available.",
    seoKeywordsEn: "route permit sub-services, new, NOC, duplicate"},
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "In which regions is route permit service available?",
    answerEn:
      "Route permit support is available for Punjab and Islamabad ICT based on current service availability.",
    seoKeywordsEn: "route permit regions, Punjab, Islamabad ICT"},
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What documents are required for route permit?",
    answerEn:
      "Common route permit requirements may include CNIC front picture, CNIC back picture, and fitness certificate. Requirements can vary by province and sub-service.",
    seoKeywordsEn: "route permit documents, CNIC, fitness certificate"},
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "What is New Route Permit?",
    answerEn:
      "New Route Permit support helps users with guidance and document preparation for a new route permit request where the service is available.",
    seoKeywordsEn: "new route permit, application guidance"},
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "What is Route Permit NOC?",
    answerEn:
      "Route Permit NOC support helps users with facilitation and document guidance for a route permit no-objection certificate request.",
    seoKeywordsEn: "route permit NOC, no objection certificate"},
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "What is Route Permit Duplicate?",
    answerEn:
      "Route Permit Duplicate support helps users with guidance for duplicate route permit requests where applicable.",
    seoKeywordsEn: "route permit duplicate, lost permit"},
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "Do I need to choose a sub-service before applying?",
    answerEn:
      "Yes. If a service has sub-services, such as New Route Permit, Route Permit NOC, or Route Permit Duplicate, you should select the correct sub-service before applying.",
    seoKeywordsEn: "route permit sub-service selection, apply correctly"},
  {
    serviceSlug: "route-permit",
    categorySlug: "services",
    displayOrder: 9,
    questionEn: "Can I track my route permit application?",
    answerEn:
      "Yes. If you apply with an account, you can track status, document requirements, invoices, and support updates from your dashboard.",
    seoKeywordsEn: "track route permit, application dashboard"},

  // ── Data Correction (8) ───────────────────────────────────────────────────
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is vehicle data correction support?",
    answerEn:
      "PakExcise provides private facilitation support for vehicle record data correction requests in supported regions such as Punjab and Islamabad ICT.",
    seoKeywordsEn: "vehicle data correction, record update, Punjab, Islamabad"},
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "What types of data correction can I request?",
    answerEn:
      "You may request support for name spelling correction, father name spelling correction, CNIC digits correction, address correction, engine number mismatch, chassis number mismatch, vehicle color correction, engine capacity/CC correction, or other record correction details.",
    seoKeywordsEn:
      "data correction types, name, CNIC, engine, chassis, color, CC"},
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "Where is data correction service available?",
    answerEn:
      "Data correction support is currently available for Punjab and Islamabad ICT based on active service availability.",
    seoKeywordsEn: "data correction regions, Punjab, Islamabad ICT"},
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What information is required for data correction?",
    answerEn:
      "You may need to select the correction type and explain the correction needed. PakExcise support may request proof or supporting documents depending on the correction type.",
    seoKeywordsEn: "data correction information, correction type, proof"},
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Are documents required for data correction?",
    answerEn:
      "Documents may be required depending on the type of correction. For example, CNIC correction, owner name correction, engine/chassis mismatch, or color correction may require supporting proof.",
    seoKeywordsEn: "data correction documents, supporting proof"},
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Can PakExcise guarantee that my record will be corrected?",
    answerEn:
      "No. PakExcise provides facilitation and guidance. Final correction, approval, or record update depends on the relevant official system, documents, and verification process.",
    seoKeywordsEn: "data correction guarantee, facilitation only"},
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I submit a data correction request without an account?",
    answerEn:
      "Yes. You can use WhatsApp or Submit Request. For full tracking and document history, apply with an account.",
    seoKeywordsEn:
      "data correction without account, WhatsApp, submit request"},
  {
    serviceSlug: "vehicle-data-correction",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "How can I track my data correction request?",
    answerEn:
      "Apply with an account to track your application status, support notes, invoices, uploaded documents, and updates.",
    seoKeywordsEn: "track data correction, application status"},

  // ── Driving License Renewal (7) ───────────────────────────────────────────
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is driving license renewal support?",
    answerEn:
      "PakExcise provides private facilitation support for driving license renewal in Punjab. Our team guides users about required information, CNIC documents, medical certificate requirements, and next steps.",
    seoKeywordsEn: "driving license renewal, Punjab, facilitation"},
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Where is driving license renewal available?",
    answerEn: "Driving license renewal support is currently available for Punjab.",
    regionSlug: "punjab",
    seoKeywordsEn: "license renewal Punjab, availability"},
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "What information is required for driving license renewal?",
    answerEn:
      "You may need to provide applicant name, phone number, applicant CNIC front picture, applicant CNIC back picture, recent passport-size photo, and medical certificate where required.",
    seoKeywordsEn:
      "license renewal information, CNIC, passport photo, medical certificate"},
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "Is a medical certificate required for driving license renewal?",
    answerEn:
      "A medical certificate issued by an authorized medical practitioner may be required. A medical fitness certificate may also be required for applicants aged 50 years or above.",
    seoKeywordsEn: "medical certificate, license renewal, age 50"},
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Can I renew my license through PakExcise without an account?",
    answerEn:
      "Yes. You can use WhatsApp support or Submit Request without creating an account. For full status tracking and document history, apply with an account.",
    seoKeywordsEn:
      "license renewal without account, WhatsApp, submit request"},
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Can PakExcise guarantee license renewal approval?",
    answerEn:
      "No. PakExcise provides private facilitation and guidance. Final renewal depends on the relevant license authority, documents, eligibility, verification, and official process.",
    seoKeywordsEn: "license renewal guarantee, facilitation only"},
  {
    serviceSlug: "driving-license-renewal",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I track my driving license renewal application?",
    answerEn:
      "Yes. If you apply with an account, you can track status, documents, invoices, and updates from your dashboard.",
    seoKeywordsEn: "track license renewal, application dashboard"},

  // ── Learner's License (7) ─────────────────────────────────────────────────
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is learner's license support?",
    answerEn:
      "PakExcise provides private facilitation support for learner's license applications in supported regions such as Punjab and Islamabad ICT.",
    seoKeywordsEn: "learner license, Punjab, Islamabad, facilitation"},
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Where is learner's license support available?",
    answerEn:
      "Learner's license support is currently available for Punjab and Islamabad ICT based on current service availability.",
    seoKeywordsEn: "learner license regions, Punjab, Islamabad ICT"},
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "What documents are required for learner's license?",
    answerEn:
      "You may need applicant name, phone number, applicant CNIC front picture, applicant CNIC back picture, recent passport-size photo, and medical certificate if age is above 50 years.",
    seoKeywordsEn: "learner license documents, CNIC, passport photo, medical"},
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "Is a passport-size photo required?",
    answerEn:
      "Yes, a recent passport-size photo may be required for learner's license application support.",
    seoKeywordsEn: "learner license photo, passport size"},
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Is a medical certificate required for learner's license?",
    answerEn:
      "A medical certificate may be required if the applicant is above 50 years of age or where applicable based on service requirements.",
    seoKeywordsEn: "learner license medical certificate, age 50"},
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Can I submit a learner's license request on WhatsApp?",
    answerEn:
      "Yes. You can contact PakExcise support on WhatsApp for quick guidance. For full application tracking, use Apply with Account.",
    seoKeywordsEn: "learner license WhatsApp, apply with account"},
  {
    serviceSlug: "learner-license",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Can I track my learner's license application?",
    answerEn:
      "Yes. Account-based applications allow you to track application status, document requirements, invoices, and updates from your dashboard.",
    seoKeywordsEn: "track learner license, application dashboard"},

  // ── E-Challan / Safe City (9) ─────────────────────────────────────────────
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 1,
    questionEn: "What is E-Challan support?",
    answerEn:
      "PakExcise provides private facilitation guidance for e-challan and Safe City-related support across Pakistan provinces. Users can get help understanding required documents and support steps.",
    seoKeywordsEn: "e-challan, Safe City, Pakistan, facilitation"},
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 2,
    questionEn: "Is PakExcise connected with Safe City or any government department?",
    answerEn:
      "No. PakExcise is a private facilitation service and is not affiliated with Safe City, Excise & Taxation, MTMIS, ICT Excise, NADRA, or any government department.",
    seoKeywordsEn: "e-challan private service, not government, Safe City"},
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 3,
    questionEn: "Which provinces are supported for e-challan guidance?",
    answerEn:
      "E-challan support is available across all active provinces shown on PakExcise, including Punjab, Islamabad ICT, Sindh, Balochistan, Khyber Pakhtunkhwa, Gilgit-Baltistan, and Azad Jammu & Kashmir where applicable.",
    seoKeywordsEn:
      "e-challan provinces, Punjab, Sindh, KPK, Gilgit, AJK"},
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 4,
    questionEn: "What information is required for e-challan support?",
    answerEn:
      "You need to upload a clear picture or scan of the vehicle smart card or registration book.",
    seoKeywordsEn: "e-challan documents, smart card, registration book"},
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 5,
    questionEn: "Why should I upload a clear smart card or registration book photo?",
    answerEn:
      "A clear upload helps support read vehicle details correctly and avoid delays caused by blurry, cropped, or incomplete documents.",
    seoKeywordsEn: "e-challan upload, clear document photo"},
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 6,
    questionEn: "Can I upload a registration book instead of a smart card?",
    answerEn:
      "Yes. You may upload either the vehicle smart card or the registration book, as long as the document is clear and readable.",
    seoKeywordsEn: "e-challan registration book, smart card upload"},
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 7,
    questionEn: "Which file types are accepted for the smart card or registration book upload?",
    answerEn:
      "Accepted formats are JPG, PNG, WebP, and PDF, subject to the upload size limit shown in the application form.",
    seoKeywordsEn: "e-challan file types, JPG, PNG, PDF"},
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 8,
    questionEn: "Can PakExcise remove or cancel my e-challan?",
    answerEn:
      "PakExcise provides guidance and support only. Any official challan status, removal, correction, or payment confirmation depends on the relevant official system or authority.",
    seoKeywordsEn: "e-challan cancellation, guidance only, not official"},
  {
    serviceSlug: "e-challan",
    categorySlug: "services",
    displayOrder: 9,
    questionEn: "Can I get e-challan help on WhatsApp?",
    answerEn:
      "Yes. You can use WhatsApp support for quick e-challan guidance or apply with an account for tracked support.",
    seoKeywordsEn: "e-challan WhatsApp, tracked support, apply with account"}];
